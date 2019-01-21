/*
acpic - v0.1.0

Written by Altocode (https://altocode.nl) and released into the public domain.

Please refer to readme.md to read the annotated source (but not yet!).
*/

var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');
var ENV = process.argv [2];

var crypto = require ('crypto');
var fs     = require ('fs');
var os     = require ('os');
var Path   = require ('path');
var stream = require ('stream');
var spawn  = require ('child_process').spawn;
Error.stackTraceLimit = Infinity;

var dale   = require ('dale');
var teishi = require ('teishi');
var lith   = require ('lith');
var cicek  = require ('cicek');
var redis  = require ('redis').createClient ({db: CONFIG.redisdb});
var giz    = require ('giz');
var hitit  = require ('hitit');
var a      = require ('./lib/astack.js');
giz.redis  = redis;

var bcrypt = require ('bcryptjs');
var mailer = require ('nodemailer').createTransport (require ('nodemailer-ses-transport') (SECRET.ses));

var sendmail = function (o, cb) {
   o.from1 = o.from1 || SECRET.emailName;
   o.from2 = o.from2 || SECRET.emailAddress;
   mailer.sendMail ({
      from: o.from1 + ' <' + SECRET.emailAddress + '>',
      to: o.to1 + ' <' + o.to2 + '>',
      replyTo: o.from2,
      subject: o.subject,
      html: lith.g (o.message),
   }, function (error, rs) {
      if (error) console.log ('Mailer error', {error: error, options: o});
      if (cb) cb (error);
   });
}

redis.keyscan = function (match, cb, cursor, keys) {
   if (! cursor) cursor = 0;
   if (! keys)   keys   = {};
   redis.scan (cursor, 'MATCH', match, function (error, result) {
      if (error) return cb (error);
      cursor = result [0];
      dale.do (result [1], function (key) {
         keys [key] = true;
      });
      if (cursor !== '0') return redis.keyscan (match, cb, cursor, keys);
      cb (null, dale.keys (keys));
   });
}

var Redis  = function (s, action) {
   redis [action].apply (redis, [].slice.call (arguments, 2).concat (function (error, data) {
      s.do (data, error);
   }));
}

var aws     = require ('aws-sdk');
var hash    = require ('murmurhash').v3;
var mime    = require ('mime');
var uuid    = require ('uuid/v4');

var s3 = new aws.S3 ({
   apiVersion: '2006-03-01',
   sslEnabled: true,
   credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
   region: SECRET.s3.pic.region,
   params: {Bucket: SECRET.s3.pic.bucketName},
});

var type = teishi.t, log = teishi.l, reply = cicek.reply, stop = function (rs, rules) {
   return teishi.stop (rules, function (error) {
      reply (rs, 400, {error: error});
   });
}, hashs = function (string) {
   return hash (string) + '';
}

// *** KABOOT ***

var k      = function (s) {

   var output = {out: '', err: ''};

   var command = [].slice.call (arguments, 1);
   var proc = spawn (command [0], command.slice (1));

   var wait = 3;

   var done = function () {
      if (--wait > 0) return;
      if (output.err !== '' || output.code !== 0) s.do (null, output);
      else s.do (output);
   }

   dale.do (['stdout', 'stderr'], function (v) {
      proc [v].on ('data', function (chunk) {
         output [v.replace ('std', '')] += chunk;
      });
      proc [v].on ('end', done);
   });

   proc.on ('error', function (error) {
      output.err += error + ' ' + error.stack;
      done ();
   });
   proc.on ('exit',  function (code, signal) {output.code = code; output.signal = signal; done ()});
}

// *** HELPERS ***

var H = {};

H.isYear = function (tag) {
   return tag.match (/^[0-9]{4}$/) && parseInt (tag) >= 1900 && parseInt (tag) <= 2100;
}

H.mkdirif = function (s, path) {
   a.stop (s, [k, 'test', '-d', path], {catch: function (s) {
      return [k, 'mkdir', path];
   }});
}

H.size = function (s, path) {
   if (s.size) return s.do ();
   return [
      [k, 'identify', path],
      [a.set, 'size', function (s) {
         if (! s.last || type (s.last.out) !== 'string') return s.do (null, 'Invalid imagemagick output #1: ' + path);
         var info = s.last.out.split (' ') [2];
         if (! info) return s.do (null, 'Invalid imagemagick output #2: ' + path);
         info = info.split ('x');
         if (info.length !== 2) return s.do (null, 'Invalid imagemagick output #3: ' + path);
         s.do ({w: parseInt (info [0]), h: parseInt (info [1])});
      }]
   ];
}

H.resizeIf = function (s, path, Max) {
   return [
      [H.size, path],
      function (s) {
         if (s.size.w <= Max && s.size.h <= Max) return s.do ();
         s ['t' + Max] = uuid ();
         var perc = Math.round (Max / Math.max (s.size.h, s.size.w) * 100);
         return [k, 'convert', path, '-quality', 75, '-thumbnail', perc + '%', Path.join (Path.dirname (path), s ['t' + Max])];
      }
   ];
}

H.hash = function (s, path) {
   fs.readFile (path, function (error, file) {
      if (error) return s.do (null, error);
      s.do (hash (file.toString ()));
   });
}

H.encrypt = function (path, cb) {
   // https://github.com/luke-park/SecureCompatibleEncryptionExamples/blob/master/JavaScript/SCEE-Node.js
   fs.readFile (path, function (error, file) {
      if (error) return cb (error);
      var nonce = crypto.randomBytes (CONFIG.crypto.nonceLength);
      var cipher = crypto.createCipheriv (CONFIG.crypto.algorithm, SECRET.crypto.password, nonce);
      var ciphertext = Buffer.concat ([cipher.update (file), cipher.final ()]);
      cb (null, Buffer.concat ([nonce, ciphertext, cipher.getAuthTag ()]));
   });
}

H.decrypt = function (data) {
   var nonce      = data.slice (0, CONFIG.crypto.nonceLength);
   var ciphertext = data.slice (CONFIG.crypto.nonceLength, data.length - CONFIG.crypto.tagLength);
   var tag        = data.slice (- CONFIG.crypto.tagLength);

   var cipher = crypto.createDecipheriv (CONFIG.crypto.algorithm, SECRET.crypto.password, nonce);
   cipher.setAuthTag (tag);
   return Buffer.concat ([cipher.update (ciphertext), cipher.final ()]);
}

H.s3put = function (s, user, path, key) {
   H.encrypt (path, function (error, file) {
      if (error) return s.do (null, error);
      s.do ([
         function (s) {
            s3.upload ({Key: hashs (user) + '/' + key, Body: file}, function (error, data) {
               if (error) return s.do (null, error);
               s.do ([
                  function (s) {
                     s3.headObject ({Key: hashs (user) + '/' + key}, function (error, data) {
                        if (error) return s.do (null, error);
                        s.last = data;
                        s.do ([
                           [a.set, false, [Redis, 'hincrby', 'users:' + user, 's3:buse', data.ContentLength]],
                        ]);
                     });
                  }
               ]);
            });
         }
      ]);
   });
}

H.s3get = function (user, key, cb) {
   s3.getObject ({Key: hashs (user) + '/' + key}, function (error, data) {
      if (error) return cb (error);
      redis.hincrby ('users:' + user, 's3:bget', data.ContentLength, function (error) {
         if (error) return cb (error);
         data.file = H.decrypt (data.Body);
         cb (null, data);
      });
   });
}

H.s3del = function (user, keys, sizes, cb) {

   var counter = 0;
   if (type (keys) === 'string') keys = [keys];

   var batch = function () {
      s3.deleteObjects ({Delete: {Objects: dale.do (keys.slice (counter * 1000, (counter + 1) * 1000), function (key) {
         return {Key: hashs (user) + '/' + key}
      })}}, function (error) {
         if (error) return cb (error);
         var multi = redis.multi ();
         dale.do (sizes, function (size) {multi.hincrby ('users:' + user, 's3:buse', - size)});
         multi.exec (function (error) {
            if (error) return cb (error);
            if (++counter === Math.ceil (keys.length / 1000)) cb ();
            else batch ();
         });
      });
   }

   batch ();
}

H.s3list = function (prefix, cb) {
   // XXX this function needs to implement pagination
   s3.listObjects ({Prefix: prefix}, function (error, data) {
      if (error) return cb (error);
      cb (null, data.Contents);
   });
}

H.log = function (user, ev, cb) {
   ev.t = Date.now ();
   redis.lpush ('ulog:' + user, teishi.s (ev), cb || function () {});
}

H.stat = function (name, pf) {
   var t = Date.now ();
   t = (t - (t % (1000 * 60 * 10))) / 100000;
   if (pf) {
      var multi = redis.multi ();
      multi.pfadd ('stp:' + name + ':' + t, pf);
      multi.sadd  ('stp',   name + ':' + t);
      multi.exec (function (error) {if (error) console.log ('H.stat error', error)});
   }
   else redis.incr  ('sti:' + name + ':' + t, function (error) {if (error) console.log ('H.stat error', error)});
}

H.deletePic = function (id, username, cb) {

   a.stop ([
      [function (s) {
         var multi = redis.multi ();
         multi.hgetall ('pic:'  + id);
         multi.smembers ('pict:' + id);
         multi.exec (function (error, data) {
            if (error) return cb (error);
            s.last = data;
            s.do ();
         });
      }],
      function (s) {
         s.pic = s.last [0];
         s.tags = s.last [1];
         if (! s.pic || username !== s.pic.owner) return cb ('nf');

         var toDelete = [s.pic.id], toDeleteSizes = [s.pic.by];
         if (s.pic.t200) {
            toDelete.push (s.pic.t200);
            toDeleteSizes.push (s.pic.by900);
         }
         if (s.pic.t900) {
            toDelete.push (s.pic.t900);
            toDeleteSizes.push (s.pic.by900);
         }

         H.s3del (username, toDelete, toDeleteSizes, function (error) {
            if (error) return s.do (null, error);
            a.fork (s, toDelete, function (v) {
               return [a.make (fs.unlink), Path.join (CONFIG.picfolder, hashs (username), v)];
            });
         });
      },
      function (s) {
         var multi = redis.multi ();

         multi.del  ('pic:'  + s.pic.id);
         multi.del  ('pict:' + s.pic.id);
         if (s.pic.t200) multi.del ('thu:' + s.pic.t200);
         if (s.pic.t900) multi.del ('thu:' + s.pic.t900);
         multi.srem ('upic:'  + s.pic.owner, s.pic.hash);
         multi.sadd ('upicd:' + s.pic.owner, s.pic.hash);

         if (dale.acc (s.tags, 0, function (a, b) {
            return a + (H.isYear (b) ? 0 : 1);
         }) === 0) multi.hincrby ('tags:' + s.pic.owner, 'untagged', -1);

         s.tags = s.tags.concat (['all', 'untagged']);

         dale.do (s.tags, function (tag) {
            if (tag !== 'untagged') multi.hincrby ('tags:' + s.pic.owner, tag, -1);
            multi.srem ('tag:' + s.pic.owner + ':' + tag, s.pic.id);
         });

         multi.exec (function (error) {
            if (error) return s.do (null, error);
            H.log (username, {a: 'del', id: s.pic.id});
            cb ();
         });
      },
   ], {catch: function (s) {
      cb (s.catch);
   }});
}

if (cicek.isMaster) setInterval (function () {
   redis.smembers ('stp', function (error, pfs) {
      if (error) return console.log ('Stat pfcount -> counter error', error);
      var multi = redis.multi ();
      dale.do (pfs, function (pf) {
         multi.pfcount (pf);
      });
      multi.exec (function (error, counts) {
         if (error) return console.log ('Stat pfcount -> counter error', error);
         var d = Date.now (), multi2 = redis.multi ();
         dale.do (pfs, function (pf, k) {
            var duration = pf.split (':') [0] === 'a' ? 1000 * 60 * 10 : 1000 * 60 * 60 * 24;
            if (d - parseInt (pf.split (':') [1] + '00000') > duration) {
               multi2.srem ('stp', pf);
               multi2.set  (pf, counts [k]);
            }
         });
         multi2.exec (function (error) {
            if (error) return console.log ('Stat pfcount -> counter error', error);
         });
      });
   });
}, 20 * 1000);


// *** ROUTES ***

var routes = [

   // *** STATIC ASSETS ***

   ['get', 'lib/murmurhash.js', cicek.file, 'node_modules/murmurhash/murmurhash.js'],

   ['get', ['lib/*', 'client.js', 'admin.js'], cicek.file],

   ['get', '/', reply, lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {charset: 'utf-8'}],
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['title', 'acpic'],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Kadwa'}],
            dale.do (['ionicons.min', 'normalize.min'], function (v) {
               return ['link', {rel: 'stylesheet', href: 'lib/' + v + '.css'}];
            })
         ]],
         ['body', [
            dale.do (['gotoB.min', 'murmurhash'], function (v) {
               return ['script', {src: 'lib/' + v + '.js'}];
            }),
            ['script', 'var COOKIENAME = \'' + CONFIG.cookiename + '\';'],
            ['script', 'var ALLOWEDMIME = ' + JSON.stringify (CONFIG.allowedmime) + ';'],
            ['script', 'var BASETAGS = ' + JSON.stringify (['all', 'untagged']) + ';'],
            ['script', {src: 'client.js'}]
         ]]
      ]]
   ])],

   ['get', 'admin', reply, lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {charset: 'utf-8'}],
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['title', 'acpic admin'],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat'}],
            dale.do (['pure-min', 'ionicons.min'], function (v) {
               return ['link', {rel: 'stylesheet', href: 'lib/' + v + '.css'}];
            })
         ]],
         ['body', [
            dale.do (['gotoB.min'], function (v) {
               return ['script', {src: 'lib/' + v + '.js'}];
            }),
            ['script', 'var COOKIENAME = \'' + CONFIG.cookiename + '\';'],
            ['script', {src: 'admin.js'}]
         ]]
      ]]
   ])],

   // *** REQUEST INVITE ***

   ['post', 'requestInvite', function (rq, rs) {
      if (type (rq.body) !== 'object' || type (rq.body.email) !== 'string') return reply (rq, 400);
      sendmail ({to1: 'Chef', to2: SECRET.admins [0], subject: 'Request for acpic invite', message: ['p', [new Date ().toUTCString (), ' ', rq.body.email]]}, function (error) {
         reply (rs, error ? 500 : 200);
      });
   }],

   // *** AUTH WITH COOKIES & SESSIONS ***

   ['get', 'auth/logout', function (rq, rs) {
      giz.logout (rq.data.cookie ? (rq.data.cookie [CONFIG.cookiename] || '') : '', function (error) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 302, '', {location: '/', 'set-cookie': cicek.cookie.write (CONFIG.cookiename, false)});
      });
   }],

   ['post', 'auth/login', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['body', b, 'string', 'each'],
         ['keys of body', dale.keys (b), ['username', 'password'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.do (['username', 'password'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
      ])) return;

      var username = b.username.toLowerCase ().replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');

      var login = function (username) {
         giz.login (username, b.password, function (error, session) {
            if (error) {
               if (type (error) === 'string') return reply (rs, 403, {error: 'auth'});
               else                           return reply (rs, 500, {error: error});
            }

            redis.hget ('users:' + username, 'verificationPending', function (error, pending) {
               if (error)   return reply (rs, 500, {error: error});
               if (pending) return reply (rs, 403, {error: 'verify'});
               reply (rs, 200, '', {cookie: cicek.cookie.write (CONFIG.cookiename, session)});
            });
         });
      }

      if (! username.match ('@')) login (username);
      else redis.hget ('emails', username, function (error, username) {
         if (error)      return reply (rs, 500, {error: error});
         if (! username) return reply (rs, 403, {error: 'auth'});
         login (username);
      });
   }],

   ['post', 'auth/signup', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['body', b, 'string', 'each'],
         ['keys of body', dale.keys (b), ['username', 'password', 'email', 'token'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.do (['username', 'password', 'email', 'token'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
         function () {return [
            ['body.username', b.username, /^[^@:]+$/, teishi.test.match],
            ['body.email',    b.email,    /^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/, teishi.test.match],
            ['body.username length', b.username.length, {min: 3}, teishi.test.range],
            ['body.password length', b.password.length, {min: 6}, teishi.test.range],
         ]},
      ])) return;

      var username = b.username.toLowerCase ().replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
      if (username.length < 3) return reply (rs, 400, {error: 'Trimmed username is less than three characters long.'});
      var email    = b.email.toLowerCase    ().replace (/\s+$/g, '');

      var multi = redis.multi ();
      multi.hget ('invites', email);
      multi.hget ('emails', email);
      multi.exists ('users:' + username);
      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});
         var invite = teishi.p (data [0]);
         if (! invite || invite.token !== b.token) return reply (rs, 403, {error: 'token'});
         if (data [1]) return reply (rs, 403, {error: 'email'});
         if (data [2]) return reply (rs, 403, {error: 'username'});

         bcrypt.genSalt (20, function (error, vtoken) {
            if (error) return reply (rs, 500, {error: error});

            giz.signup (username, b.password, function (error) {
               if (error) return reply (rs, 500, {error: error});

               var multi2 = redis.multi ();
               multi2.hset ('verify', vtoken, email);
               multi2.hset ('invites', b.email, JSON.stringify ({token: invite.token, sent: invite.sent, accepted: Date.now ()}));

               multi2.hset ('emails', email, username);

               multi2.hmset ('users:' + username, {username: username, email: email, type: 'tier1', created: Date.now ()});
               if (! b.token || ! ENV) multi2.hmset ('users:' + username, {verificationPending: true});

               multi2.exec (function (error) {
                  if (error)  return reply (rs, 500, {error: error});
                  if (! ENV) return reply (rs, 200, {token: vtoken});
                  if (b.token) {
                     return sendmail ({to1: username, to2: email, subject: CONFIG.etemplates.welcome.subject, message: CONFIG.etemplates.welcome.message (username)}, function (error) {
                        if (error) return reply (rs, 500, {error: error});
                        giz.login (username, b.password, function (error, session) {
                           if (error) reply (rs, 500, {error: error});
                           reply (rs, 200, '', {cookie: cicek.cookie.write (CONFIG.cookiename, session)});
                        });
                     });
                  }
                  sendmail ({to1: username, to2: email, subject: CONFIG.etemplates.verify.subject, message: CONFIG.etemplates.verify.message (username, vtoken)}, function (error) {
                     if (error) return reply (rs, 500, {error: error});
                     reply (rs, 200);
                  });
               });
            });
         });
      });
   }],

   ['get', 'auth/verify/(*)', function (rq, rs) {

      var token = rq.data.params [0];

      redis.hget ('verify', token, function (error, email) {
         if (error) return reply (rs, 500, {error: error});
         if (! email) return reply (rs, 403, {});
         redis.hget ('emails', email, function (error, username) {
            if (error) return reply (rs, 500, {error: error});
            var multi = redis.multi ();
            multi.hdel ('users:' + username, 'verificationPending');
            multi.hdel ('verify', token);
            multi.exec (function (error) {
               if (error) return reply (rs, 500, {error: error});
               sendmail ({to1: username, to2: email, subject: CONFIG.etemplates.welcome.subject, message: CONFIG.etemplates.welcome.message (username)}, function (error) {
                  if (error) return reply (rs, 500, {error: error});
                  reply (rs, 302, '', {location: '/#/auth/login/verified'});
               });
            });
         });
      });
   }],

   // *** PASSWORD RECOVER/RESET ***

   ['post', 'auth/recover', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['body', b, 'string', 'each'],
         ['keys of body', dale.keys (b), ['username'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.do (['username'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
      ])) return;

      var recover = function (username) {
         giz.recover (username, function (error, token) {
            if (error) {
               if (type (error) === 'string') return reply (rs, 403);
               else                           return reply (rs, 500, {error: error});
            }
            redis.hgetall ('users:' + username, function (error, user) {
               if (error)  return reply (rs, 500, {error: error});
               if (! ENV) return reply (rs, 200, {token: token});
               sendmail ({to1: user.username, to2: user.email, subject: CONFIG.etemplates.recover.subject, message: CONFIG.etemplates.recover.message (user.username, token)}, function (error) {
                  if (error) return reply (rs, 500, {error: error});
                  reply (rs, 200);
               });
            });
         });
      }

      var username = b.username.toLowerCase ().replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');

      if (! username.match ('@')) recover (username);
      else redis.hget ('emails', username, function (error, username) {
         if (error)      return reply (rs, 500, {error: error});
         if (! username) return reply (rs, 403);
         recover (username);
      });
   }],

   ['post', 'auth/reset', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['body', b, 'string', 'each'],
         ['keys of body', dale.keys (b), ['username', 'password', 'token'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.do (['username', 'password', 'token'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
      ])) return;

      var reset = function (username) {
         redis.hgetall ('users:' + username, function (error, user) {
            if (error) return reply (res, 500, {error: error});
            giz.reset (username, b.token, b.password, function (error) {
               if (error) {
                  if (type (error) === 'string') return reply (rs, 403);
                  else                           return reply (rs, 500, {error: error});
               }
               if (! ENV) return reply (rs, 200);
               sendmail ({to1: user.username, to2: user.email, subject: CONFIG.etemplates.reset.subject, message: CONFIG.etemplates.reset.message (user.username)}, function (error) {
                  if (error) return reply (rs, 500, {error: error});
                  reply (rs, 200);
               });
            });
         });
      }

      var username = b.username.toLowerCase ().replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');

      if (! username.match ('@')) reset (username);
      else redis.hget ('emails', username, function (error, username) {
         if (error)      return reply (rs, 500, {error: error});
         if (! username) return reply (rs, 403);
         reset (username);
      });
   }],

   // *** GATEKEEPER FUNCTION ***

   ['all', '*', function (rq, rs) {

      if (rq.method === 'post' && rq.url === '/clientlog') return rs.next ();

      if (rq.url.match (/^\/admin/)) {
         if (! ENV) return rs.next ();
         if (rq.body && rq.body.email && SECRET.admins.indexOf (rq.body.email) !== -1) return rs.next ();
      }

      giz.auth ((rq.data.cookie || {}) [CONFIG.cookiename] || '', function (error, user) {
         if (error)  return reply (rs, 500, {error: error});
         if (! user) return reply (rs, 403, {error: 'session'});

         H.stat ('a', user.username);
         H.stat ('A', user.username);
         rs.log.user = user.username;
         rq.user = user;
         rs.next ();
      });
   }],

   // *** DELETE ACCOUNT ***

   ['post', 'auth/delete', function (rq, rs) {

      if (ENV) return reply (rs, 501);

      redis.get ('tag:' + rq.user.username + ':all', function (error, pics) {
         if (error) return reply (rs, 500, {error: error});
         redis.get ('tags:' + rq.user.username + ':', function (error, tags) {
            if (error) return reply (rs, 500, {error: error});

            giz.destroy (rq.user.username, function (error) {
               if (error) return reply (rs, 500, {error: error});
               var multi = redis.multi ();
               multi.hdel ('emails',  rq.user.email);
               multi.hdel ('invites', rq.user.email);
               dale.do (pics, function (pic) {
                  H.deletePic (pic, rq.user.username, function (error) {
                     // XXX Report error.
                  });
               });
               dale.do (tags, function (tag) {
                  multi.del ('tag:' + rq.user.username + ':' + tag);
               });
               multi.del ('upic:'  + rq.user.username);
               multi.del ('upicd:' + rq.user.username);
               multi.del ('shm:'   + rq.user.username);
               multi.del ('sho:'   + rq.user.username);
               multi.del ('tags:'  + rq.user.username);
               multi.del ('ulog:'  + rq.user.username);
               multi.exec (function (error) {
                  if (error) return reply (rs, 500, {error: error});
                  giz.logout (rq.data.cookie [CONFIG.cookiename], function (error) {
                     H.log (rq.user.username, {a: 'des'});
                     reply (rs, 302, '', {location: '/', 'set-cookie': cicek.cookie.write (CONFIG.cookiename, false)});
                  });
               });
            });
         });
      });
   }],

   // *** DOWNLOAD PICS ***

   ['get', 'pic/:id', function (rq, rs) {
      redis.hgetall ('pic:' + rq.data.params.id, function (error, pic) {
         if (error)        return reply (rs, 500, {error: error});
         if (pic === null) return reply (rs, 404);
         if (rq.user.username === pic.owner) return cicek.file (rq, rs, Path.join (hashs (pic.owner), pic.id), [CONFIG.picfolder]);
         redis.smembers ('pict:' + pic.id, function (error, tags) {
            if (error) return reply (rs, 500, {error: error});
            if (tags.length === 0) return reply (rs, 404);
            var multi = redis.multi ();
            dale.do (tags, function (tag) {
               multi.sismember ('shm:' + rq.user.username, pic.owner + ':' + tag);
            });
            multi.exec (function (error, data) {
               if (error) return reply (rs, 500, {error: error});
               if (! dale.stop (data, true, function (v) {
                  if (! v) return;
                  redis.hincrby ('pic:' + pic.id, 'xp', 1);
                  cicek.file (rq, rs, Path.join (hashs (pic.owner), pic.id), [CONFIG.picfolder]);
                  return true;
               })) reply (rs, 404);
            });
         });
      });
   }],

   ['get', 'thumb/:id', function (rq, rs) {
      redis.get ('thu:' + rq.data.params.id, function (error, pic) {
         if (error)        return reply (rs, 500, {error: error});
         if (pic === null) return reply (rs, 404);
         redis.hgetall ('pic:' + pic, function (error, pic) {
            if (error)        return reply (rs, 500, {error: error});
            if (pic === null) return reply (rs, 404);

            if (rq.user.username === pic.owner) return cicek.file (rq, rs, Path.join (hashs (pic.owner), rq.data.params.id), [CONFIG.picfolder]);
            redis.smembers ('pict:' + pic.id, function (error, tags) {
               if (error) return reply (rs, 500, {error: error});
               if (tags.length === 0) return reply (rs, 404);
               var multi = redis.multi ();
               dale.do (tags, function (tag) {
                  multi.sismember ('shm:' + rq.user.username, pic.owner + ':' + tag);
               });
               multi.exec (function (error, data) {
                  if (error) return reply (rs, 500, {error: error});
                  if (! dale.stop (data, true, function (v) {
                     if (! v) return;
                     redis.hincrby ('pic:' + pic.id, 'xt' + (rq.data.params.id === pic.t200 ? 2 : 9), 1);
                     cicek.file (rq, rs, Path.join (hashs (pic.owner), rq.data.params.id), [CONFIG.picfolder]);
                     return true;
                  })) reply (rs, 404);
               });
            });
         });
      });
   }],

   // *** UPLOAD PICTURES ***

   ['post', 'pic', function (rq, rs) {

      if (! rq.data.fields) return reply (rs, 400, {error: 'field'});
      if (! rq.data.files)  return reply (rs, 400, {error: 'file'});
      if (! rq.data.fields.tags) rq.data.fields.tags = '[]';
      if (! teishi.eq (dale.keys (rq.data.fields), ['lastModified', 'tags'])) return reply (rs, 400, {error: 'invalidField'});
      if (! teishi.eq (dale.keys (rq.data.files), ['pic'])) return reply (rs, 400, {error: 'invalidFile'});

      var tags = teishi.p (rq.data.fields.tags), error;
      if (type (tags) !== 'array') return reply (rs, 400, {error: 'tags'});
      tags = dale.do (tags, function (tag) {
         if (type (tag) !== 'string') return error = teishi.s (tag);
         tag = tag.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
         if (['all', 'untagged'].indexOf (tag) !== -1) return error = tag;
         if (H.isYear (tag)) error = tag;
         return tag;
      });
      if (error) return reply (rs, 400, {error: 'tag: ' + error});

      if (type (parseInt (rq.data.fields.lastModified)) !== 'integer') return reply (rs, 400, {error: 'lastModified'});

      if (CONFIG.allowedmime.indexOf (mime.lookup (rq.data.files.pic)) === -1) return reply (rs, 400, {error: 'fileFormat'});

      var path = rq.data.files.pic;

      var pic = {lastModified: parseInt (rq.data.fields.lastModified)};
      pic.id     = uuid ();
      pic.owner  = rq.user.username;
      pic.name   = path.slice (path.indexOf ('_') + 1);
      pic.dateup = Date.now ();

      var newpath = Path.join (CONFIG.picfolder, hashs (rq.user.username), pic.id);

      a.stop (function (s) {
         return [
            [a.set, 'hash', [H.hash, path]],
            function (s) {
               return [Redis, 'sismember', 'upic:' + rq.user.username, s.hash];
            },
            function (s) {
               if (s.last) return reply (rs, 409, {error: 'repeated'});
               return [
                  [Redis, 'hget', 'users:' + rq.user.username, 's3:buse'],
                  function (s) {
                     if (s.last !== null && CONFIG.storelimit [rq.user.tier || 'tier1'] < parseInt (s.last)) return reply (rs, 409, {error: 'capacity'});
                     s.do ();
                  },
                  [H.mkdirif, Path.dirname (newpath)],
                  [k, 'cp', path, newpath],
                  [a.set, 'metadata', [k, 'identify', '-format', "'%[*]'", path]],
                  [a.make (fs.unlink), path],
                  [H.resizeIf, newpath, 200],
                  [H.resizeIf, newpath, 900],
                  function (s) {
                     if (! s.metadata || ! s.metadata.out) return s.do (null, 'Metadata retrieval failed.');
                     var metadata = s.metadata.out.split ('\n');
                     s.dates = dale.obj (metadata, function (line) {
                        if (line.match (/date/i)) return [line.split ('=') [0], line.split ('=') [1]];
                     });
                     s.orientation = dale.fil (metadata, undefined, function (line) {
                        if (line.match (/orientation/i)) return line;
                     });
                     s.do ();
                  },
                  function (s) {
                     return [
                        [a.set, 'picdata', [H.s3put, rq.user.username, newpath, pic.id]],
                        ! s.t200 ? [] : [
                           [a.set, 't200data', [H.s3put, rq.user.username, Path.join (Path.dirname (newpath), s.t200), s.t200]],
                        ],
                        ! s.t900 ? [] : [
                           [a.set, 't900data', [H.s3put, rq.user.username, Path.join (Path.dirname (newpath), s.t900), s.t900]],
                        ]
                     ];
                  },
                  function (s) {
                     var multi = redis.multi ();

                     pic.dimw = s.size.w;
                     pic.dimh = s.size.h;

                     pic.by   = s.picdata.ContentLength;
                     pic.hash = s.hash;

                     s.dates ['upload:date'] = pic.lastModified;
                     delete pic.lastModified;
                     pic.dates = JSON.stringify (s.dates);
                     if (s.orientation.length > 0) pic.orientation = JSON.stringify (s.orientation);

                     pic.date = dale.fil (s.dates, undefined, function (v) {
                        if (! v) return;
                        var d = new Date (v);
                        if (d.getTime ()) return d.getTime () - new Date ().getTimezoneOffset () * 60 * 1000;
                        d = new Date (v.replace (':', '-').replace (':', '-'));
                        if (d.getTime ()) return d.getTime () - new Date ().getTimezoneOffset () * 60 * 1000;
                     }).sort (function (a, b) {
                        return a - b;
                     });
                     pic.date = pic.date [0];

                     if (s.t200) {
                        pic.t200 = s.t200;
                        pic.by200 = s.t200data.ContentLength;
                        multi.set ('thu:' + pic.t200, pic.id);
                     }
                     if (s.t900) {
                        pic.t900 = s.t900;
                        pic.by900 = s.t900data.ContentLength;
                        multi.set ('thu:' + pic.t900, pic.id);
                     }

                     multi.sadd ('upic:'  + rq.user.username, pic.hash);
                     multi.srem ('upicd:' + rq.user.username, pic.hash);
                     multi.sadd ('tag:'  + rq.user.username  + ':all', pic.id);

                     var picyear = new Date (pic.date).getUTCFullYear ();
                     multi.sadd ('pict:' + pic.id, picyear);
                     multi.hincrby ('tags:' + rq.user.username, picyear, 1);
                     multi.sadd ('tag:' + rq.user.username + ':' + picyear, pic.id);

                     if (tags.length > 0) dale.do (tags, function (tag) {
                        multi.sadd    ('pict:' + pic.id, tag);
                        multi.hincrby ('tags:' + rq.user.username, tag, 1);
                        multi.sadd    ('tag:'  + rq.user.username + ':' + tag, pic.id);
                     });
                     else {
                        multi.hincrby ('tags:' + rq.user.username, 'untagged', 1);
                        multi.sadd    ('tag:'  + rq.user.username + ':untagged', pic.id);
                     }

                     multi.hmset ('pic:' + pic.id, pic);
                     multi.exec (function (error) {
                        if (error) return reply (rs, 500, {error: error});
                        H.log (rq.user.username, {a: 'upl', id: pic.id});
                        if (! rs.connection.writable) return cicek.log (['error', 'client upload error', {pic: s.pic}]);
                        reply (rs, 200);
                     });
                  }
               ];
            }
         ];
      }, {catch: function (s) {

         if (s.catch.err && s.catch.err.match ('identify')) return fs.unlink (newpath, function (error) {
            if (error) return reply (rs, 500, {error: error});
            reply (rs, 400, {error: 'Invalid image format: ' + s.catch.err});
         });

         reply (rs, 500, {error: s.catch});
      }});
   }],

   // *** DELETE PICS ***

   ['delete', 'pic/:id', function (rq, rs) {
      H.deletePic (rq.data.params.id, rq.user.username, function (error) {
         if (error && error === 'nf') return reply (rs, 404);
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200);
      });

   }],

   // *** ROTATE IMAGE ***

   ['post', 'rotate', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['id', 'deg'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.id', b.id, 'string'],
            ['body.deg', b.deg, [90, 180, -90], 'oneOf', teishi.test.equal],
         ]}
      ])) return;

      var path, tmppath;

      a.stop ([
         [a.set, 'pic', [Redis, 'hgetall', 'pic:' + b.id]],
         function (s) {
            if (! s.pic || s.pic.owner !== rq.user.username) return reply (rs, 404);
            path    = Path.join (CONFIG.picfolder, hashs (s.pic.owner), s.pic.id);
            tmppath = Path.join (os.tmpdir (), s.pic.id);
            s.do ([
               [k, 'cp', path, tmppath],
               [k, 'mogrify', '-rotate', b.deg, tmppath],
               [k, 'cp', tmppath, path],
               [a.make (fs.unlink), tmppath],
               [a.make (H.s3del), rq.user.username, b.id, s.pic.by],
               [a.set, 'picdata', [H.s3put, rq.user.username, path, b.id]],
               [H.resizeIf, path, 200],
               [H.resizeIf, path, 900],
               function (s) {return [
                  ! s.t200 ? [] : [a.set, 't200data', [H.s3put, rq.user.username, path, s.t200]],
                  ! s.t900 ? [] : [a.set, 't900data', [H.s3put, rq.user.username, path, s.t900]],
               ]},
            ]);
         },
         function (s) {
            var toDelete = dale.fil (['t200', 't900'], undefined, function (t) {
               return s.pic [t];
            });
            var toDeleteSizes = dale.fil (['by200', 'by900'], undefined, function (t) {
               return s.pic [t];
            });
            if (toDelete.length === 0) return s.do ();
            return [
               dale.do (toDelete, function (t) {
                  return [a.make (fs.unlink), Path.join (CONFIG.picfolder, hashs (rq.user.username), t)];
               }),
               [a.make (H.s3del), rq.user.username, toDelete, toDeleteSizes]
            ];
         },
         function (s) {
            var multi = redis.multi ();
            if (s.pic.t200) {
               multi.hdel ('pic:' + s.pic.id, 't200', 'by200');
               multi.del ('thu:' + s.pic.t200);
            }
            if (s.pic.t900) {
               multi.hdel ('pic:' + s.pic.id, 't900', 'by900');
               multi.del ('thu:' + s.pic.t900);
            }
            var update = {dimh: s.size.h, dimw: s.size.w, by: s.picdata.ContentLength};
            if (s.t200) {
               update.t200  = s.t200;
               update.by200 = s.t200data.ContentLength;
               multi.set ('thu:' + update.t200, s.pic.id);
            }
            if (s.t900) {
               update.t900  = s.t900;
               update.by900 = s.t900data.ContentLength;
               multi.set ('thu:' + update.t900, s.pic.id);
            }
            multi.hmset ('pic:' + s.pic.id, update);
            multi.exec (function (error) {
               if (error) return s.do (null, error);
               H.log (rq.user.username, {a: 'rot', id: b.id, d: b.deg, o: s.pic.orientation});
               reply (rs, 200);
            });
         },
      ], {catch: function (s) {
         return reply (rs, 500, {error: s.catch});
      }});

   }],

   // *** TAGGING ***

   ['post', 'tag', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['ids', 'tag', 'del'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.tag', b.tag, 'string'],
            ['body.ids', b.ids, 'array'],
            ['body.ids', b.ids, 'string', 'each'],
            function () {return ['body.ids length', b.ids.length, {min: 1}, teishi.test.range]},
            ['body.del', b.del, [true, false, undefined], 'oneOf', teishi.test.equal],
         ]}
      ])) return;

      b.tag = b.tag.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');

      if (H.isYear (b.tag)) return reply (rs, 400, {error: 'Tag cannot be a number between 1900 and 2100.'});

      a.stop ([
         [function (s) {
            var multi = redis.multi ();
            dale.do (b.ids, function (id) {
               multi.hget  ('pic:'  + id, 'owner');
               multi.smembers ('pict:' + id);
            });
            multi.exec (function (error, data) {
               if (error) return reply (rs, 500, {error: error});
               s.last = data;
               s.do ();
            });
         }],
         function (s) {
            var multi = redis.multi ();
            var seen = {};
            dale.do (s.last, function (v, k) {
               if (k % 2 !== 0) return;
               var pic = b.ids [k / 2];
               if (seen [pic]) return;
               else seen [pic] = true;
               if (v === null || v !== rq.user.username) return;
               if (b.del) {
                  if (s.last [k + 1].indexOf (b.tag) === -1) return;
                  multi.srem    ('pict:' + pic, b.tag);
                  multi.hincrby ('tags:' + rq.user.username, b.tag, -1);
                  multi.srem ('tag:'   + rq.user.username + ':' + b.tag, pic);
                  if (dale.acc (s.last [k + 1], 0, function (a, b) {
                     return a + (H.isYear (b) ? 0 : 1);
                  }) === 1) {
                     multi.hincrby ('tags:' + rq.user.username, 'untagged', 1);
                     multi.sadd    ('tag:'  + rq.user.username + ':untagged', pic);
                  }
               }
               else {
                  if (s.last [k + 1].indexOf (b.tag) !== -1) return;
                  multi.sadd    ('pict:' + pic, b.tag);
                  multi.hincrby ('tags:' + rq.user.username, b.tag, 1);
                  multi.sadd ('tag:'   + rq.user.username + ':' + b.tag, pic);
                  if (dale.acc (s.last [k + 1], 0, function (a, b) {
                     return a + (H.isYear (b) ? 0 : 1);
                  }) === 0) {
                     multi.hincrby ('tags:' + rq.user.username, 'untagged', -1);
                     multi.srem    ('tag:'  + rq.user.username + ':untagged', pic);
                  }
               }
            });
            multi.exec (function (error) {
               if (error) return reply (rs, 500, {error: error});
               reply (rs, 200);
               H.log (rq.user.username, {a: 'tag', tag: b.tag, d: b.del ? true : undefined, ids: b.ids});
            })
         }
      ], {catch: function (s) {
         return reply (rs, 500, s.catch);
      }});
   }],

   ['get', 'tags', function (rq, rs) {
      var multi = redis.multi ();
      multi.hgetall ('tags:' + rq.user.username);
      multi.scard   ('tag:'  + rq.user.username + ':all');
      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});
         var output = {all: parseInt (data [1])};
         reply (rs, 200, dale.obj (data [0], output, function (v, k) {
            v = parseInt (v);
            if (v > 0) return [k, v];
         }));
      });
   }],

   // *** SEARCH ***

   ['post', 'query', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         function () {return [
            ['body.tags', b.tags, 'array'],
            ['body.tags', b.tags, 'string', 'each'],
            ['body.mindate',  b.mindate,  ['undefined', 'integer'], 'oneOf'],
            ['body.maxdate',  b.maxdate,  ['undefined', 'integer'], 'oneOf'],
            ['body.sort',  b.sort, ['newest', 'oldest', 'upload'], 'oneOf', teishi.test.equal],
            ['body.from',  b.from, 'integer'],
            ['body.to',    b.to,   'integer'],
            ['body.from',  b.from, {min: 1},      teishi.test.range],
            ['body.to',    b.to,   {min: b.from}, teishi.test.range],
         ]}
      ])) return;

      if (b.tags.indexOf ('all') !== -1) return reply (rs, 400, {error: 'all'});

      var ytags = [];

      //{tag1: [USERID], ...}
      var tags = dale.obj (b.tags, function (tag) {
         if (! H.isYear (tag)) return [tag, [rq.user.username]];
         ytags.push (tag);
      });

      redis.smembers ('shm:' + rq.user.username, function (error, shared) {
         if (error) return reply (rs, 500, {error: error});

         var allmode = dale.keys (tags).length === 0 && ytags.length === 0;

         if (allmode) tags.all = [rq.user.username];

         dale.do (shared, function (sharedTag) {
            var tag = sharedTag.replace (/[^:]+:/, '');
            if (allmode || tags [tag]) {
               if (! tags [tag]) tags [tag] = [];
               // {tag1: [USERID, USERID2], ...}
               tags [tag].push (sharedTag.match (/[^:]+/) [0]);
            }
         });

         // for each tag (or all tags if all is there) list users per tag that share it with you. run a sunion per tag, also including your own username. then do a sinter of the whole thing.

         var multi = redis.multi (), qid = 'query:' + uuid ();
         if (ytags.length) multi.sunionstore (qid, dale.do (ytags, function (ytag) {
            return 'tag:' + rq.user.username + ':' + ytag;
         }));

         dale.do (tags, function (users, tag) {
            multi.sunionstore (qid + ':' + tag, dale.do (users, function (user) {
               return 'tag:' + user + ':' + tag;
            }));
         });

         multi [allmode ? 'sunion' : 'sinter'] (dale.do (tags, function (users, tag) {
            return qid + ':' + tag;
         }).concat (ytags.length ? qid : []));

         if (ytags.length) multi.del (qid);
         dale.do (tags, function (users, tag) {
            multi.del (qid + ':' + tag);
         });

         multi.exec (function (error, data) {
            if (error) return reply (rs, 500, {error: error});
            var pics = data [dale.keys (tags).length + (ytags.length ? 1 : 0)];
            var multi2 = redis.multi ();
            dale.do (pics, function (pic) {
               multi2.hgetall ('pic:' + pic);
            });
            multi2.exec (function (error, pics) {
               if (error) return reply (rs, 500, {error: error});
               if (pics.length === 0) return reply (rs, 200, {total: 0, pics: []});
               var output = {pics: []};

               var mindate = b.mindate || 0, maxdate = b.maxdate || new Date ('2101-01-01T00:00:00Z').getTime ();

               dale.do (pics, function (pic) {
                  var d = parseInt (pic [b.sort === 'upload' ? 'dateup' : 'date']);
                  if (d >= mindate && d <= maxdate) output.pics.push (pic);
               });

               // Sort own pictures first.
               output.pics.sort (function (a, b) {
                  if (a.owner === rq.user.username) return -1;
                  if (b.owner === rq.user.username) return 1;
                  return (a.owner < b.owner ? -1 : (a.owner > b.owner ? 1 : 0));
               });

               // To avoid returning duplicated picture if someone shares a picture you already have with you. Own picture has priority.
               var hashes = {};
               output.pics = dale.fil (output.pics, undefined, function (pic, k) {
                  if (! hashes [pic.hash]) {
                     hashes [pic.hash] = true;
                     return pic;
                  }
               });

               // Sort pictures by criteria.
               output.pics.sort (function (a, B) {
                  var d1 = parseInt (a [b.sort === 'upload' ? 'dateup' : 'date']);
                  var d2 = parseInt (B [b.sort === 'upload' ? 'dateup' : 'date']);
                  return b.sort === 'oldest' ? d1 - d2 : d2 - d1;
               });

               output.total = output.pics.length;

               output.pics = output.pics.slice (b.from - 1, b.to);

               var multi3 = redis.multi ();
               dale.do (output.pics, function (pic) {
                  multi3.smembers ('pict:' + pic.id);
               });
               multi3.exec (function (error, tags) {
                  if (error) return reply (rs, 500, {error: error});
                  dale.do (output.pics, function (pic, k) {
                     output.pics [k] = {id: pic.id, t200: pic.t200, t900: pic.t900, owner: pic.owner, name: pic.name, tags: tags [k].sort (), date: parseInt (pic.date), dateup: parseInt (pic.dateup), dimh: parseInt (pic.dimh), dimw: parseInt (pic.dimw)};
                  });
                  reply (rs, 200, output);
               });
            });
         });
      });
   }],

   // *** SHARING ***

   ['post', 'share', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         function () {return [
            ['body.tag', b.tag, 'string'],
            ['body.who', b.who, 'string'],
            ['body.del', b.del, ['boolean', 'undefined'], 'oneOf']
         ]}
      ])) return;

      if (b.tag === 'all' || b.tag === 'untagged') return reply (rs, 400, {error: 'tag'});

      if (H.isYear (b.tag)) return reply (rs, 400, {error: 'tag'});

      redis.exists ('users:' + b.who, function (error, exists) {
         if (error)    return reply (rs, 500, {error: error});
         if (! exists) return reply (rs, 404);

         var multi = redis.multi ();

         multi [b.del ? 'srem' : 'sadd'] ('sho:' + rq.user.username, b.who            + ':' + b.tag);
         multi [b.del ? 'srem' : 'sadd'] ('shm:' + b.who,            rq.user.username + ':' + b.tag);
         multi.exec (function (error) {
            if (error) return reply (rs, 500, {error: error});
            reply (rs, 200);
         });
      });
   }],

   ['get', 'share', function (rq, rs) {
      var multi = redis.multi ();
      multi.smembers ('sho:' + rq.user.username);
      multi.smembers ('shm:' + rq.user.username);
      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200, {
            sho: dale.do (data [0], function (i) {
               return [i.split (':') [0], i.split (':').slice (1).join (':')];
            }),
            shm: dale.do (data [1], function (i) {
               return [i.split (':') [0], i.split (':').slice (1).join (':')];
            }),
         });
      });
   }],

   // *** CLIENT ERRORS ***

   ['post', 'clientlog', function (rq, rs) {
      if (teishi.simple (rq.body)) return reply (rs, 400);
      if (! ENV || ! CONFIG.clientlog) return reply (rs, 200);
      fs.appendFile (CONFIG.clientlog, teishi.s ({date: new Date ().toUTCString (), headers: rq.headers, user: (rq.user || {}).username, error: rq.body}) + '\n', function (error) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200);
      });
   }],

   // *** ADMIN GATEKEEPER ***

   ['all', '*', function (rq, rs) {
      if (! ENV) return rs.next ();
      if (rq.body && rq.body.email && SECRET.admins.indexOf (rq.body.email) !== -1) return rs.next ();

      if (SECRET.admins.indexOf (rq.user.email) === -1) return reply (rs, 403);
      rs.next ();
   }],

   // *** STATS ***

   ['get', 'admin/stats', function (rq, rs) {
      redis.keyscan ('st*', function (error, keys) {
         if (error) return reply (rs, 500, {error: error});
         var multi = redis.multi ();
         dale.do (keys, function (key) {
            multi [key.match (/^sti/) ? 'get' : 'pfcount'] (key);
         });
         multi.exec (function (error, data) {
            if (error) return reply (rs, 500, {error: error});
            reply (rs, 200, dale.do (data, function (item, k) {
               return [keys [k].slice (4), parseInt (item)];
            }));
         });
      });
   }],

   // *** INVITES ***

   ['get', 'admin/invites', function (rq, rs) {
      redis.hgetall ('invites', function (error, invites) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200, dale.obj (invites, function (v, k) {
            return [k, JSON.parse (v)];
         }));
      });
   }],

   ['delete', 'admin/invites/:email', function (rq, rs) {
      redis.hdel ('invites', rq.data.params.email, function (error) {
         reply (rs, error ? 500 : 200, {error: error} || '');
      });
   }],

   ['post', 'admin/invites', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['body', b, 'string', 'each'],
         ['keys of body', dale.keys (b), ['email'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.email', b.email, /^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/, teishi.test.match],
         ]},
      ])) return;

      var email = b.email.toLowerCase ().replace (/\s+$/g, '');

      bcrypt.genSalt (20, function (error, itoken) {
         if (error) return reply (rs, 500, {error: error});
         redis.hset ('invites', email, JSON.stringify ({token: itoken, sent: Date.now ()}), function (error) {
            if (error) return reply (rs, 500, {error: error});
            if (! ENV) return reply (rs, 200, {token: itoken});
            sendmail ({to1: email.replace (/@.+/, ''), to2: email, subject: CONFIG.etemplates.invite.subject, message: CONFIG.etemplates.invite.message (email.replace (/@.+/, ''), itoken)}, function (error) {
               if (error) return reply (rs, 500, {error: error});
               reply (rs, 200);
            });
         });
      });
   }],

];

// *** LAUNCH SERVER ***

if (ENV) {
   cicek.options.log.console = false;
}
cicek.options.cookieSecret = SECRET.cookie;
cicek.options.log.body = function (log) {
   if (log.requestBody && log.requestBody.password) return false;
   return true;
}

cicek.apres = function (rs) {
   rs.log.startTime = new Date (rs.log.startTime).toUTCString ();
   if (rs.log.url.match (/^\/logs/)) rs.log.responseBody = 'OMITTED';
   if (rs.log.url.match (/^\/auth/)) {
      if (rs.log.requestBody && rs.log.requestBody.password) rs.log.requestBody.password = 'OMITTED';
   }
   H.stat ('h' + rs.log.code);
   if (rs.log.code >= 400 && rs.log.code !== 409) {
      if (CONFIG.errorlog && ENV) fs.appendFile (CONFIG.errorlog, teishi.s (rs.log) + '\n', function (error) {
         if (error) console.log ('Error log write error', error);
      });
   }
   else {
      if (CONFIG.accesslog && ENV) fs.appendFile (CONFIG.accesslog, teishi.s (rs.log) + '\n', function (error) {
         if (error) console.log ('Access log write error', error);
      });
   }
   if (rs.log.code === 200 || rs.log.code === 304) {
      if (rs.log.method === 'get'  && rs.log.url.match (/^\/(pic|thumb)/)) H.stat ('d');
      if (rs.log.method === 'post' && rs.log.url.match (/^\/pic/))         H.stat ('u');
      if (rs.log.method === 'post' && rs.log.url.match (/^\/tag/))         H.stat ('t');
   }
   cicek.Apres (rs);
}

if (ENV) cicek.log = function (message) {
   if (type (message) !== 'array' || message [0] !== 'error') return;
   console.log.apply (console, [new Date ().toUTCString (), cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id].concat (message));
}

cicek.cluster ();

cicek.listen ({port: CONFIG.port}, routes);

// *** START LOG ***

if (cicek.isMaster) console.log ('START', ENV, new Date ().toUTCString ());

// *** BACKUPS ***

if (cicek.isMaster && ENV) setInterval (function () {
   var s3 = new aws.S3 ({
      apiVersion: '2006-03-01',
      sslEnabled: true,
      credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
      region: SECRET.s3.db.region,
      params: {Bucket: SECRET.s3.db.bucketName},
   });

   var cb = function (error) {
      if (error) sendmail ({from1: 'acpic backup', to1: 'acpic admin', to2: SECRET.admins [0], subject: 'Backup failed!', message: ['pre', error.toString ()]}, function (error) {
         if (error) console.log ('FATAL ERROR WHEN WARNING ABOUT FAILED BACKUP.', error);
      });
   }

   H.encrypt (CONFIG.backup.path, function (error, file) {
      if (error) return cb (error);
      s3.upload ({Key: 'dump' + Date.now () + '.rdb', Body: file}, cb);
   });

}, CONFIG.backup.frequency * 60 * 1000);

// *** BOOTSTRAP USER ***

if (cicek.isMaster && ENV) setTimeout (function () {
   redis.hget ('invites', SECRET.admins [0], function (error, admin) {
      if (error) return console.log ('Bootstrap check error', error);
      if (admin) return;

      hitit.one ({}, {timeout: 15, port: CONFIG.port, method: 'post', path: 'admin/invites', body: {email: SECRET.admins [0]}}, function (error) {
         if (error) console.log ('Bootstrap invite error', error);
         else       console.log ('Bootstrap invite sent OK');
      });
   });
}, 3000);

// *** CHECK IF THERE ARE UNREFERENCED FILES IN S3 ***

if (cicek.isMaster && ENV) H.s3list ('', function (error, data) {
   var multi = redis.multi ();
   dale.do (data, function (item, k) {
      var id = item.Key.split ('/') [1];
      multi.exists ('thu:' + id, 'pic:' + id);
   });
   multi.exec (function (error, exists) {
      var toDelete = dale.fil (data, undefined, function (item, k) {
         if (exists [k]) return;
         console.log ('S3 blob is not on database! Deleting:', item.Key);
         return {Key: item.Key};
      });
      if (toDelete.length === 0) return;
      s3.deleteObjects ({Delete: {Objects: toDelete.slice (0, 1000)}}, function (error) {
         if (error) return console.log ('Error deleting loose S3 blobs.', error);
      });
   });
});

// *** XXX TEMPORARY: ADD YEAR TAGS TO PICTURES ON STARTUP ***

if (cicek.isMaster) redis.keyscan ('pic:*', function (error, pics) {
   if (error) return console.log ('Error when retrieving pics for adding yeartags!', error);
   var multi = redis.multi ();
   dale.do (pics, function (pic) {
      multi.hgetall (pic);
      multi.sinter  (pic.replace ('pic:', 'pict:'));
   });
   multi.exec (function (error, data) {
      if (error) return console.log ('Error when retrieving pics for adding yeartags!', error);
      var multi = redis.multi ();
      dale.do (pics, function (pic, k) {
         var pic = data [k * 2], tags = data [k * 2 + 1];
         if (dale.stop (tags, true, H.isYear)) return;
         var picyear = new Date (parseInt (pic.date)).getUTCFullYear ();
         multi.sadd ('pict:' + pic.id, picyear);
         multi.hincrby ('tags:' + pic.owner, picyear, 1);
         multi.sadd ('tag:' + pic.owner + ':' + picyear, pic.id);
         console.log ('Adding yeartag', picyear, 'to', pic.id);
      });
      multi.exec (function (error) {
         if (error) return console.log ('Error when updating pics with yeartags!', error);
      });
   });
});
