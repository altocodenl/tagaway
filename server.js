/*
ac:pic - v0.1.0

Written by Altocode (https://altocode.nl) and released into the public domain.

Please refer to readme.md to read the annotated source (but not yet!).
*/

// *** SETUP ***

var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');
var ENV = process.argv [2];

var crypto = require ('crypto');
var fs     = require ('fs');
var Path   = require ('path');
var spawn  = require ('child_process').spawn;
var stream = require ('stream');
var os     = require ('os');
Error.stackTraceLimit = Infinity;

var dale   = require ('dale');
var teishi = require ('teishi');
var lith   = require ('lith');
var cicek  = require ('cicek');
var redis  = require ('redis').createClient ({db: CONFIG.redisdb});
var giz    = require ('giz');
var hitit  = require ('hitit');
var a      = require ('./lib/astack.js');

var mailer = require ('nodemailer').createTransport (require ('nodemailer-ses-transport') (SECRET.ses));
var hash   = require ('murmurhash').v3;
var mime   = require ('mime');
var uuid   = require ('uuid/v4');

var type = teishi.t, log = teishi.l, eq = teishi.eq, reply = cicek.reply, stop = function (rs, rules) {
   return teishi.stop (rules, function (error) {
      reply (rs, 400, {error: error});
   });
}

// *** GIZ ***

giz.redis          = redis;
giz.config.expires = 24 * 60 * 60;

// *** REDIS EXTENSIONS ***

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

var Redis = function (s, action) {
   redis [action].apply (redis, [].slice.call (arguments, 2).concat (function (error, data) {
      s.do (data, error);
   }));
}

// *** NOTIFICATIONS ***

var notify = function (message) {
   if (type (message) !== 'object') return console.log ('NOTIFY: message must be an object but instead is', message);
   message.environment = ENV || 'local';
   console.log (new Date ().toUTCString (), JSON.stringify (message));
}

// *** SENDMAIL ***

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
      if (error) notify ({type: 'mailer error', error: error, options: o});
      if (cb) cb (error);
   });
}

// *** S3 ***

var s3 = new (require ('aws-sdk')).S3 ({
   apiVersion:  '2006-03-01',
   sslEnabled:  true,
   credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
   params:      {Bucket: SECRET.s3.pic.bucketName},
});

// *** KABOOT ***

var k = function (s) {

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

H.email = /^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/;

H.trim = function (s) {
   return s.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
}

H.log = function (user, ev, cb) {
   ev.t = Date.now ();
   redis.lpush ('ulog:' + user, teishi.s (ev), cb || function () {});
}

H.hashs = function (string) {
   return hash (string) + '';
}

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
      },
      function (s) {
         if (s.size.w <= Max && s.size.h <= Max) return s.do ();
         fs.stat (Path.join (Path.dirname (path), s ['t' + Max]), function (error, stat) {
            if (error) return s.do (null, error);
            s ['t' + Max + 'size'] = stat.size;
            s.do ();
         });
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
      s3.upload ({Key: user ? (H.hashs (user) + '/' + key) : key, Body: file}, function (error, data) {
         if (error) return s.do (null, error);
         if (! user) return s.do ();
         s3.headObject ({Key: H.hashs (user) + '/' + key}, function (error, data) {
            if (error) return s.do (null, error);
            s.last = data;
            s.do ([
               [a.set, false, [Redis, 'hincrby', 'users:' + user, 's3:buse', data.ContentLength]],
            ]);
         });
      });
   });
}

H.s3get = function (user, key, cb) {
   s3.getObject ({Key: H.hashs (user) + '/' + key}, function (error, data) {
      if (error) return cb (error);
      redis.hincrby ('users:' + user, 's3:bget', data.ContentLength, function (error) {
         if (error) return cb (error);
         cb (null, H.decrypt (data.Body));
      });
   });
}

H.s3del = function (user, keys, sizes, cb) {

   var counter = 0;
   if (type (keys) === 'string') keys = [keys];

   if (keys.length === 0) return cb ();

   var batch = function () {
      s3.deleteObjects ({Delete: {Objects: dale.do (keys.slice (counter * 1000, (counter + 1) * 1000), function (key) {
         return {Key: user ? (H.hashs (user) + '/' + key) : key}
      })}}, function (error) {
         if (error) return cb (error);
         var multi = redis.multi ();
         if (user) dale.do (sizes, function (size) {multi.hincrby ('users:' + user, 's3:buse', - size)});
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
   var output = [];
   var fetch = function (marker) {
      s3.listObjects ({Prefix: prefix, Marker: marker}, function (error, data) {
         if (error) return cb (error);
         output = output.concat (data.Contents);
         delete data.Contents;
         if (! data.IsTruncated) return cb (null, dale.do (output, function (v) {return v.Key}));
         fetch (output [output.length - 1].Key);
      });
   }
   fetch ();
}

H.stat = function (name, pf, n) {
   var t = Date.now ();
   t = (t - (t % (1000 * 60 * 10))) / 100000;
   if (pf) {
      var multi = redis.multi ();
      multi.pfadd ('stp:' + name + ':' + t, pf);
      multi.sadd  ('stp',   name + ':' + t);
      multi.exec (function (error) {
         if (error) notify ({type: 'stat error', error: error});
      });
   }
   else redis.incrby ('sti:' + name + ':' + t, n || 1, function (error) {
      if (error) notify ({type: 'stat error', error: error});
   });
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
         s.pic  = s.last [0];
         s.tags = s.last [1];
         if (! s.pic || username !== s.pic.owner) return cb ('nf');

         H.s3del (username, s.pic.id, s.pic.by, function (error) {
            if (error) return s.do (null, error);
            var thumbs = [];
            if (s.pic.t200) thumbs.push (s.pic.t200);
            if (s.pic.t900) thumbs.push (s.pic.t900);
            if (thumbs.length === 0) return s.do ();
            a.fork (s, thumbs, function (v) {
               return [a.make (fs.unlink), Path.join (CONFIG.picfolder, H.hashs (username), v)];
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

         dale.do (s.tags.concat (['all', 'untagged']), function (tag) {
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
            ['title', 'ac:pic'],
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
            ['title', 'ac:pic admin'],
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
   ]), 'html'],

   // *** REQUEST INVITE ***

   ['post', 'requestInvite', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['email'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.email', b.email, 'string'],
            ['body.email', b.email, H.email, teishi.test.match],
         ]},
      ])) return;

      sendmail ({to1: 'Chef', to2: SECRET.admins [0], subject: 'Request for ac:pic invite', message: ['p', [new Date ().toUTCString (), ' ', rq.body.email]]}, function (error) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200);
      });
   }],

   // *** LOGIN & SIGNUP ***

   ['post', 'auth/login', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'tz'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.do (['username', 'password'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
            ['body.tz', b.tz, 'integer'],
         ]},
      ])) return;

      b.username = H.trim (b.username.toLowerCase ());

      var login = function (username) {
         giz.login (username, b.password, function (error, session) {
            if (error) {
               if (type (error) === 'string') return reply (rs, 403, {error: 'auth'});
               else                           return reply (rs, 500, {error: error});
            }

            redis.hget ('users:' + username, 'verificationPending', function (error, pending) {
               if (error)   return reply (rs, 500, {error: error});
               if (pending) return reply (rs, 403, {error: 'verify'});
               H.log (username, {a: 'log', ip: rq.origin, ua: rq.headers ['user-agent'], tz: b.tz});
               reply (rs, 200, '', {cookie: cicek.cookie.write (CONFIG.cookiename, session)});
            });
         });
      }

      if (! b.username.match ('@')) login (b.username);
      else redis.hget ('emails', b.username, function (error, username) {
         if (error)      return reply (rs, 500, {error: error});
         if (! username) return reply (rs, 403, {error: 'auth'});
         login (username);
      });
   }],

   ['post', 'auth/signup', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'email', 'token'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.do (['username', 'password', 'email', 'token'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
         function () {return [
            ['body.username', b.username, /^[^@:]+$/, teishi.test.match],
            ['body.password length', b.password.length, {min: 6}, teishi.test.range],
            ['body.email',    b.email,    H.email, teishi.test.match],
         ]},
      ])) return;

      b.username = H.trim (b.username.toLowerCase ());
      if (b.username.length < 3) return reply (rs, 400, {error: 'Trimmed username is less than three characters long.'});
      b.email = H.trim (b.email.toLowerCase ());

      var multi = redis.multi ();
      multi.hget   ('invites', b.email);
      multi.hget   ('emails',  b.email);
      multi.exists ('users:' + b.username);
      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});
         var invite = teishi.p (data [0]);
         if (! invite || invite.token !== b.token) return reply (rs, 403, {error: 'token'});
         if (data [1]) return reply (rs, 403, {error: 'email'});
         if (data [2]) return reply (rs, 403, {error: 'username'});

         require ('bcryptjs').genSalt (20, function (error, emailtoken) {
            if (error) return reply (rs, 500, {error: error});

            giz.signup (b.username, b.password, function (error) {
               if (error) return reply (rs, 500, {error: error});

               var multi2 = redis.multi ();
               multi2.hset ('emailtoken', emailtoken, b.email);
               multi2.hset ('emails', b.email, b.username);
               multi2.hmset ('users:' + b.username, {username: b.username, email: b.email, type: 'tier1', created: Date.now ()});
               multi2.hset ('invites', b.email, JSON.stringify ({token: invite.token, sent: invite.sent, accepted: Date.now ()}));

               if (! b.token || ! ENV) multi2.hmset ('users:' + b.username, {verificationPending: true});

               multi2.exec (function (error) {
                  if (error)  return reply (rs, 500, {error: error});
                  if (! ENV) {
                     H.log (b.username, {a: 'sig', ip: rq.origin, ua: rq.headers ['user-agent']});
                     return reply (rs, 200, {token: emailtoken});
                  }
                  if (b.token) {
                     return sendmail ({to1: b.username, to2: b.email, subject: CONFIG.etemplates.welcome.subject, message: CONFIG.etemplates.welcome.message (b.username)}, function (error) {
                        if (error) return reply (rs, 500, {error: error});
                        giz.login (b.username, b.password, function (error, session) {
                           if (error) reply (rs, 500, {error: error});
                           H.log (b.username, {a: 'sig', ip: rq.origin, ua: rq.headers ['user-agent']});
                           reply (rs, 200, '', {cookie: cicek.cookie.write (CONFIG.cookiename, session)});
                        });
                     });
                  }
                  sendmail ({to1: b.username, to2: b.email, subject: CONFIG.etemplates.verify.subject, message: CONFIG.etemplates.verify.message (b.username, emailtoken)}, function (error) {
                     if (error) return reply (rs, 500, {error: error});
                     H.log (b.username, {a: 'sig', ip: rq.origin, ua: rq.headers ['user-agent']});
                     reply (rs, 200);
                  });
               });
            });
         });
      });
   }],

   // *** EMAIL VERIFICATION ***

   ['get', 'auth/verify/(*)', function (rq, rs) {

      var token = rq.data.params [0];

      redis.hget ('emailtoken', token, function (error, email) {
         if (error) return reply (rs, 500, {error: error});
         if (! email) return reply (rs, 403);

         redis.hget ('emails', email, function (error, username) {
            if (error) return reply (rs, 500, {error: error});
            var multi = redis.multi ();
            multi.hdel ('users:' + username, 'verificationPending');
            multi.hdel ('emailtoken', token);
            multi.exec (function (error) {
               if (error) return reply (rs, 500, {error: error});
               if (! ENV) return reply (rs, 302, '', {location: '/#/auth/login/verified'});
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
               if (error) return reply (rs, 500, {error: error});
               if (! ENV) return reply (rs, 200, {token: token});
               sendmail ({to1: user.username, to2: user.email, subject: CONFIG.etemplates.recover.subject, message: CONFIG.etemplates.recover.message (user.username, token)}, function (error) {
                  if (error) return reply (rs, 500, {error: error});
                  reply (rs, 200);
               });
            });
         });
      }

      b.username = H.trim (b.username.toLowerCase ());

      if (! b.username.match ('@')) recover (b.username);
      else redis.hget ('emails', b.username, function (error, username) {
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

      redis.hgetall ('users:' + b.username, function (error, user) {
         if (error) return reply (rs, 500, {error: error});
         giz.reset (b.username, b.token, b.password, function (error) {
            if (error) {
               if (type (error) === 'string') return reply (rs, 403);
               else                           return reply (rs, 500, {error: error});
            }
            if (! ENV) {
               H.log (user.username, {a: 'res', ip: rq.origin, ua: rq.headers ['user-agent']});
               return reply (rs, 200);
            }
            sendmail ({to1: user.username, to2: user.email, subject: CONFIG.etemplates.reset.subject, message: CONFIG.etemplates.reset.message (user.username)}, function (error) {
               if (error) return reply (rs, 500, {error: error});
               H.log (user.username, {a: 'res', ip: rq.origin, ua: rq.headers ['user-agent']});
               reply (rs, 200);
            });
         });
      });
   }],

   // *** GATEKEEPER FUNCTION ***

   ['all', '*', function (rq, rs) {

      if (rq.method === 'post' && rq.url === '/error')                  return rs.next ();
      if (rq.method === 'get'  && rq.url === '/admin/stats')            return rs.next ();
      if (rq.method === 'post' && rq.url === '/admin/invites' && ! ENV) return rs.next ();

      if (! rq.data.cookie)                     return reply (rs, 403, {error: 'nocookie'});
      if (! rq.data.cookie [CONFIG.cookiename]) return reply (rs, 403, {error: 'tampered'});

      giz.auth (rq.data.cookie [CONFIG.cookiename], function (error, user) {
         if (error)  return reply (rs, 500, {error: error});
         if (! user) return reply (rs, 403, {error: 'session'});

         H.stat ('a', user.username);
         H.stat ('A', user.username);
         rs.log.user = user.username;
         rq.user = user;

         if (rq.url.match (/^\/admin/) && SECRET.admins.indexOf (rq.user.email) === -1) return reply (rs, 403);

         rs.next ();
      });
   }],

   // *** CSRF PROTECTION ***

   ['post', '*', function (rq, rs) {

      if (rq.method === 'post' && rq.url === '/error')                  return rs.next ();
      if (rq.method === 'post' && rq.url === '/admin/invites' && ! ENV) return rs.next ();

      var ctype = rq.headers ['content-type'] || '', cookie = rq.headers.cookie;
      if (ctype.match (/^multipart\/form-data/i)) {
         if (rq.data.fields.cookie !== cookie) return reply (rs, 403);
         delete rq.data.fields.cookie;
      }
      else {
         if (type (rq.body) !== 'object') return reply (rs, 400);
         if (rq.body.cookie !== cookie)   return reply (rs, 403);
         delete rq.body.cookie;
      }
      rs.next ();
   }],

   // *** CLIENT ERRORS ***

   ['post', 'error', function (rq, rs) {
      if (type (rq.body) !== 'object') return reply (rs, 400);
      notify ({type: 'client error', headers: rq.headers, ip: rq.origin, user: (rq.user || {}).username, error: rq.body});
      reply (rs, 200);
   }],

   // *** LOGOUT ***

   ['post', 'auth/logout', function (rq, rs) {
      giz.logout (rq.data.cookie [CONFIG.cookiename], function (error) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 302, '', {location: '/', 'set-cookie': cicek.cookie.write (CONFIG.cookiename, false)});
      });
   }],

   // *** DELETE ACCOUNT ***

   ['post', 'auth/delete', function (rq, rs) {

      // We temporarily disable account deletions.
      if (ENV) return reply (rs, 501);

      var multi = redis.multi ();

      multi.smembers ('tag:'  + rq.user.username + ':all');
      multi.smembers ('tags:' + rq.user.username);
      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});

         giz.destroy (rq.user.username, function (error) {
            if (error) return reply (rs, 500, {error: error});
            var multi = redis.multi ();
            multi.hdel ('emails',  rq.user.email);
            multi.hdel ('invites', rq.user.email);
            dale.do (data [0], function (pic) {
               H.deletePic (pic, rq.user.username, function (error) {
                  if (error) notify ({type: 'picture deletion error', error: error});
               });
            });
            dale.do (data [1].concat (['all', 'untagged']), function (tag) {
               multi.del ('tag:' + rq.user.username + ':' + tag);
            });
            multi.del ('tags:'  + rq.user.username);
            multi.del ('upic:'  + rq.user.username);
            multi.del ('upicd:' + rq.user.username);
            multi.del ('shm:'   + rq.user.username);
            multi.del ('sho:'   + rq.user.username);
            multi.del ('ulog:'  + rq.user.username);
            multi.exec (function (error) {
            if (error) return reply (rs, 500, {error: error});
               giz.logout (rq.data.cookie [CONFIG.cookiename], function (error) {
                  H.log (rq.user.username, {a: 'des', ip: rq.origin, ua: rq.headers ['user-agent']});
                  reply (rs, 302, '', {location: '/', 'set-cookie': cicek.cookie.write (CONFIG.cookiename, false)});
               });
            });
         });
      });
   }],

   // *** FEEDBACK COLLECTION ***

   ['post', 'feedback', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['message'], 'eachOf', teishi.test.equal],
         ['body.message', b.message, 'string'],
      ])) return;

      notify ({type: 'feedback', user: rq.user.username, message: rq.body.message});

      if (! ENV) return reply (rs, 200);

      sendmail ({to1: rq.user.username, to2: rq.user.email, subject: CONFIG.etemplates.feedback.subject, message: CONFIG.etemplates.feedback.message (rq.user.username, rq.body.message)}, function (error) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200);
      });
   }],

   // *** RETRIEVE ORIGINAL IMAGE (FOR TESTING PURPOSES) ***

   ['get', 'original/:id', function (rq, rs) {

      if (ENV) return reply (rs, 400);

      H.s3get (rq.user.username, rq.data.params.id, function (error, data) {
         if (error) return reply (rs, 500, {error: error});
         rs.end (data);
      });
   }],

   // *** DOWNLOAD PICS ***

   ['get', 'pic/:id', function (rq, rs) {
      redis.hgetall ('pic:' + rq.data.params.id, function (error, pic) {
         if (error)        return reply (rs, 500, {error: error});
         if (pic === null) return reply (rs, 404);
         if (rq.user.username === pic.owner) return cicek.file (rq, rs, Path.join (H.hashs (pic.owner), pic.id), [CONFIG.picfolder]);
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
                  cicek.file (rq, rs, Path.join (H.hashs (pic.owner), pic.id), [CONFIG.picfolder]);
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

            if (rq.user.username === pic.owner) return cicek.file (rq, rs, Path.join (H.hashs (pic.owner), rq.data.params.id), [CONFIG.picfolder]);
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
                     cicek.file (rq, rs, Path.join (H.hashs (pic.owner), rq.data.params.id), [CONFIG.picfolder]);
                     return true;
                  })) reply (rs, 404);
               });
            });
         });
      });
   }],

   // *** UPLOAD PICTURES ***

   ['post', 'pic', function (rq, rs) {

      if (! rq.data.fields)      return reply (rs, 400, {error: 'field'});
      if (! rq.data.files)       return reply (rs, 400, {error: 'file'});
      if (! rq.data.fields.uid)  return reply (rs, 400, {error: 'uid'});
      if (! rq.data.fields.tags) rq.data.fields.tags = '[]';
      if (! eq (dale.keys (rq.data.fields), ['uid', 'lastModified', 'tags'])) return reply (rs, 400, {error: 'invalidField'});
      if (! eq (dale.keys (rq.data.files),  ['pic']))                         return reply (rs, 400, {error: 'invalidFile'});

      var tags = teishi.p (rq.data.fields.tags), error;
      if (type (tags) !== 'array') return reply (rs, 400, {error: 'tags'});
      tags = dale.do (tags, function (tag) {
         if (type (tag) !== 'string') return error = teishi.s (tag);
         tag = H.trim (tag);
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

      var newpath = Path.join (CONFIG.picfolder, H.hashs (rq.user.username), pic.id);

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
                     if (s.last !== null && (CONFIG.storelimit [rq.user.type || 'tier1'] || 0) < parseInt (s.last)) return reply (rs, 409, {error: 'capacity'});
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
                     return [a.set, 'picdata', [H.s3put, rq.user.username, newpath, pic.id]];
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

                     pic.date = dale.fil (s.dates, undefined, function (v, k) {
                        if (! v) return;
                        // Ignore GPS date stamp
                        if (k.match (/gps/i)) return;
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
                        pic.by200 = s.t200size;
                        multi.set ('thu:' + pic.t200, pic.id);
                     }
                     if (s.t900) {
                        pic.t900 = s.t900;
                        pic.by900 = s.t900size;
                        multi.set ('thu:' + pic.t900, pic.id);
                     }

                     multi.sadd ('upic:'  + rq.user.username, pic.hash);
                     multi.srem ('upicd:' + rq.user.username, pic.hash);
                     multi.sadd ('tag:' + rq.user.username + ':all', pic.id);

                     dale.do (tags.concat (new Date (pic.date).getUTCFullYear ()), function (tag) {
                        multi.sadd ('pict:' + pic.id,                       tag);
                        multi.sadd ('tags:' + rq.user.username,             tag);;
                        multi.sadd ('tag:'  + rq.user.username + ':' + tag, pic.id);
                     });

                     if (tags.length === 0) multi.sadd ('tag:' + rq.user.username + ':untagged', pic.id);

                     multi.hmset ('pic:' + pic.id, pic);
                     multi.exec (function (error) {
                        if (error) return reply (rs, 500, {error: error});
                        if (! rs.connection.writable) return cicek.log (['error', 'client upload error', {pic: s.pic}]);
                        H.log (rq.user.username, {a: 'upl', uid: rq.data.fields.uid, id: pic.id, tags: tags.length ? tags : undefined});
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
         ['keys of body', dale.keys (b), ['ids', 'deg'], 'eachOf', teishi.test.equal],
         ['body.deg', b.deg, [90, 180, -90], 'oneOf', teishi.test.equal],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
         function () {return ['body.ids length', b.ids.length, {min: 1}, teishi.test.range]},
      ])) return;

      var multi = redis.multi (), seen = {};
      dale.do (b.ids, function (id) {
         seen [id] = true;
         multi.hgetall ('pic:' + id);
      });

      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});

         var multi = redis.multi ();

         if (dale.stopNot (data, undefined, function (pic) {
            if (pic === null || pic.owner !== rq.user.username) {
               reply (rs, 404);
               return true;
            }

            var deg = parseInt (pic.deg) || 0;
            if (deg === 0) deg = b.deg;
            else if (deg === -90) {
               if (b.deg === -90) deg = 180;
               if (b.deg === 90)  deg = 0;
               if (b.deg === 180) deg = 90;
            }
            else if (deg === 90) {
               if (b.deg === -90) deg = 0;
               if (b.deg === 90)  deg = 180;
               if (b.deg === 180) deg = -90;
            }
            else {
               if (b.deg === -90) deg = 90;
               if (b.deg === 90)  deg = -90;
               if (b.deg === 180) deg = 0;
            }

            if (deg) multi.hset ('pic:' + pic.id, 'deg', deg);
            else     multi.hdel ('pic:' + pic.id, 'deg');
         })) return;

         multi.exec (function (error) {
            if (error) return reply (rs, 500, {error: error});
            H.log (rq.user.username, {a: 'rot', id: b.ids, deg: b.deg});
            reply (rs, 200);
         });
      });
   }],

   // *** TAGGING ***

   ['post', 'tag', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['ids', 'tag', 'del'], 'eachOf', teishi.test.equal],
         ['body.tag', b.tag, 'string'],
         ['body.ids', b.ids, 'array'],
         ['body.ids', b.ids, 'string', 'each'],
         function () {return ['body.ids length', b.ids.length, {min: 1}, teishi.test.range]},
         ['body.del', b.del, [true, false, undefined], 'oneOf', teishi.test.equal],
      ])) return;

      b.tag = H.trim (b.tag);
      if (['all', 'untagged'].indexOf (b.tag) !== -1) return reply (rs, 400, {error: 'tag'});
      if (H.isYear (b.tag)) return reply (rs, 400, {error: 'tag'});

      var multi = redis.multi (), seen = {};
      dale.do (b.ids, function (id) {
         seen [id] = true;
         multi.hget     ('pic:'  + id, 'owner');
         multi.smembers ('pict:' + id);
      });

      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      multi.exec (function (error, data) {
         if (error) return reply (rs, 500, {error: error});

         var multi = redis.multi ();

         if (dale.stopNot (data, undefined, function (owner, k) {
            if (k % 2 !== 0) return;
            if (owner !== rq.user.username) {
               reply (rs, 404);
               return true;
            }

            var id = b.ids [k / 2];

            var extags = dale.acc (data [k + 1], 0, function (a, b) {
               return a + (H.isYear (b) ? 0 : 1);
            });

            if (b.del) {
               if (data [k + 1].indexOf (b.tag) === -1) return;
               multi.srem ('pict:' + id, b.tag);
               multi.srem ('tag:'  + rq.user.username + ':' + b.tag, id);
               if (extags === 1) multi.sadd ('tag:' + rq.user.username + ':untagged', id);
            }

            else {
               if (data [k + 1].indexOf (b.tag) !== -1) return;
               multi.sadd ('pict:' + id, b.tag);
               multi.sadd ('tags:' + rq.user.username, b.tag);
               multi.sadd ('tag:'  + rq.user.username + ':' + b.tag, id);

               multi.srem ('tag:'  + rq.user.username + ':untagged', id);
            }
         })) return;

         multi.exec (function (error) {
            if (error) return reply (rs, 500, {error: error});
            reply (rs, 200);
            H.log (rq.user.username, {a: 'tag', tag: b.tag, d: b.del ? true : undefined, ids: b.ids});
         });
      });
   }],

   ['get', 'tags', function (rq, rs) {
      redis.smembers ('tags:' + rq.user.username, function (error, tags) {
         if (error) return reply (rs, 500, {error: error});

         var multi = redis.multi ();
         tags = tags.concat (['all', 'untagged']);
         dale.do (tags, function (tag) {
            multi.scard ('tag:' + rq.user.username + ':' + tag);
         });
         multi.exec (function (error, cards) {
            if (error) return reply (rs, 500, {error: error});

            var multi = redis.multi ();
            var output = dale.obj (cards, function (card, k) {
               if (card || tags [k] === 'all') return [tags [k], card];
               else {
                  if (k < tags.length - 3) multi.srem ('tags:' + rq.user.username, tags [k]);
               }
            });
            multi.exec (function (error) {
               if (error) return reply (rs, 500, {error: error});
               reply (rs, 200, output);
            });
         });
      });
   }],

   // *** SEARCH ***

   ['post', 'query', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tags', 'mindate', 'maxdate', 'sort', 'from', 'to'], 'eachOf', teishi.test.equal],
         ['body.tags', b.tags, 'array'],
         ['body.tags', b.tags, 'string', 'each'],
         ['body.mindate',  b.mindate,  ['undefined', 'integer'], 'oneOf'],
         ['body.maxdate',  b.maxdate,  ['undefined', 'integer'], 'oneOf'],
         ['body.sort',  b.sort, ['newest', 'oldest', 'upload'], 'oneOf', teishi.test.equal],
         ['body.from',  b.from, 'integer'],
         ['body.to',    b.to,   'integer'],
         ['body.from',  b.from, {min: 1},      teishi.test.range],
         ['body.to',    b.to,   {min: b.from}, teishi.test.range],
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
                     output.pics [k] = {id: pic.id, t200: pic.t200, t900: pic.t900, owner: pic.owner, name: pic.name, tags: tags [k].sort (), date: parseInt (pic.date), dateup: parseInt (pic.dateup), dimh: parseInt (pic.dimh), dimw: parseInt (pic.dimw), deg: parseInt (pic.deg) || undefined};
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
         ['keys of body', dale.keys (b), ['tag', 'who', 'del'], 'eachOf', teishi.test.equal],
         ['body.tag', b.tag, 'string'],
         ['body.who', b.who, 'string'],
         ['body.del', b.del, ['boolean', 'undefined'], 'oneOf']
      ])) return;

      b.tag = H.trim (b.tag);
      if (['all', 'untagged'].indexOf (b.tag) !== -1) return reply (rs, 400, {error: 'tag'});
      if (H.isYear (b.tag))                           return reply (rs, 400, {error: 'tag'});
      if (b.who === rq.user.username)                 return reply (rs, 400, {error: 'self'});

      redis.exists ('users:' + b.who, function (error, exists) {
         if (error)    return reply (rs, 500, {error: error});
         if (! exists) return reply (rs, 404);

         var multi = redis.multi ();

         multi [b.del ? 'srem' : 'sadd'] ('sho:' + rq.user.username, b.who            + ':' + b.tag);
         multi [b.del ? 'srem' : 'sadd'] ('shm:' + b.who,            rq.user.username + ':' + b.tag);
         multi.exec (function (error) {
            if (error) return reply (rs, 500, {error: error});
            H.log (rq.user.username, {a: 'sha', tag: b.tag, d: b.del ? true : undefined, u: b.who});
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

   // *** ACCOUNT ***

   ['get', 'account', function (rq, rs) {
      redis.lrange ('ulog:' + rq.user.username, 0, -1, function (error, logs) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200, {
            username: rq.user.username,
            email:    rq.user.email,
            type:     rq.user.type,
            created:  parseInt (rq.user.created),
            used:     [parseInt (rq.user ['s3:buse']) || 0, parseInt (CONFIG.storelimit [rq.user.type || 'tier1']) || 0],
            logs:     dale.do (logs, JSON.parse),
         });
      });
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
         return reply (rs, 200, ! invites ? [] : dale.obj (invites, function (value, key) {
            return [key, teishi.p (value)];
         }));
      });
   }],

   ['delete', 'admin/invites/:email', function (rq, rs) {
      redis.hdel ('invites', rq.data.params.email, function (error) {
         if (error) return reply (rs, 500, {error: error});
         reply (rs, 200);
      });
   }],

   ['post', 'admin/invites', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['email', 'firstName'], 'eachOf', teishi.test.equal],
         ['body.email', b.email, 'string'],
         ['body.email', b.email, H.email, teishi.test.match],
         ['body.firstName', b.firstName, 'string'],
      ])) return;

      b.email = H.trim (b.email.toLowerCase ());

      redis.hget ('emails', b.email, function (error, user) {
         if (error) return reply (rs, 500, {error: error});
         if (user)  return reply (rs, 400, {error: 'User already exists'});
         require ('bcryptjs').genSalt (20, function (error, token) {
            if (error) return reply (rs, 500, {error: error});
            redis.hset ('invites', b.email, JSON.stringify ({firstName: b.firstName, token: token, sent: Date.now ()}), function (error) {
               if (error) return reply (rs, 500, {error: error});
               if (! ENV) return reply (rs, 200, {token: token});
               sendmail ({to1: b.firstName, to2: b.email, subject: CONFIG.etemplates.invite.subject, message: CONFIG.etemplates.invite.message (b.firstName, token)}, function (error) {
                  if (error) return reply (rs, 500, {error: error});
                  reply (rs, 200);
               });
            });
         });
      });
   }],

];

// *** SERVER CONFIGURATION ***

cicek.options.cookieSecret = SECRET.cookieSecret;
cicek.options.log.console  = false;

cicek.apres = function (rs) {
   if (rs.log.url.match (/^\/auth/)) {
      if (rs.log.requestBody && rs.log.requestBody.password) rs.log.requestBody.password = 'OMITTED';
   }

   if (rs.log.code >= 400) {
      if (['/favicon.ico', '/lib/normalize.min.css.map'].indexOf (rs.log.url) === -1) notify ({type: 'response error', code: rs.log.code, url: rs.log.url, ip: rs.log.origin, ua: rs.log.requestHeaders ['user-agent'], body: rs.log.requestBody, rbody: teishi.p (rs.log.responseBody) || rs.log.responseBody});
   }

   if (rs.log.code === 200 || rs.log.code === 304) {
      if (rs.log.method === 'get'  && rs.log.url.match (/^\/(pic|thumb)/)) H.stat ('d');
      if (rs.log.method === 'post' && rs.log.url.match (/^\/pic/))         H.stat ('u');
      if (rs.log.method === 'post' && rs.log.url.match (/^\/tag/))         H.stat ('t');
   }

   H.stat ('l', false, Date.now () - rs.log.startTime);
   H.stat ('h' + rs.log.code);

   cicek.Apres (rs);
}

cicek.log = function (message) {
   if (type (message) !== 'array' || message [0] !== 'error') return;

   if (message [1] === 'Invalid signature in cookie') notify ({type: 'cookie signature error', error: message [2]});
   else notify ({type: 'server error', from: cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id, subtype: message [1], error: message [2]});
}

cicek.cluster ();

cicek.listen ({port: CONFIG.port}, routes);

if (cicek.isMaster) notify ({type: 'server start'});

// *** REDIS ERROR HANDLER ***

redis.on ('error', function (error) {
   if (cicek.isMaster) notify ({type: 'redis error', error: error});
});

// *** DB BACKUPS ***

if (cicek.isMaster && ENV) setInterval (function () {
   var s3 = new (require ('aws-sdk')).S3 ({
      apiVersion:  '2006-03-01',
      sslEnabled:  true,
      credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
      params:      {Bucket: SECRET.s3.db.bucketName},
   });

   var cb = function (error) {
      if (! error) return;
      notify ({type: 'backup error', error: error});
      sendmail ({from1: 'ac:pic backup', to1: 'ac:pic admin', to2: SECRET.admins [0], subject: 'Backup failed!', message: ['pre', error.toString ()]});
   }

   H.encrypt (CONFIG.backup.path, function (error, file) {
      if (error) return cb (error);
      s3.upload ({Key: new Date ().toUTCString () + '-dump.rdb', Body: file}, cb);
   });

}, CONFIG.backup.frequency * 60 * 1000);

// *** CHECK OS RESOURCES ***

if (cicek.isMaster) setInterval (function () {
   a.do ([
      [a.fork, [
         [k, 'mpstat'],
         [k, 'free'],
      ], function (v) {return v}],
      function (s) {
         if (s.error) return notify ({type: 'resources check error', error: s.error});
         var cpu  = s.last [0].out;
         cpu = cpu.split ('\n') [3].split (/\s+/);
         cpu = Math.round (parseFloat (cpu [cpu.length - 1].replace (',', '.')));

         if (cpu < 20) notify ({type: 'high CPU usage', usage: (100 - cpu) / 100});

         var free = s.last [1].out.split ('\n') [1].split (/\s+/);
         free = Math.round (100 * parseInt (free [6]) / parseInt (free [1]));

         if (free < 20) notify ({type: 'high RAM usage', usage: (100 - free) / 100});
      },
   ]);
}, 1000 * 60);

// *** CONVERT PFCOUNT TO STRING (STATS) ***

if (cicek.isMaster) setInterval (function () {
   redis.smembers ('stp', function (error, pfs) {
      if (error) notify ({type: 'stat pfcount -> counter error', error: error});
      var multi = redis.multi ();
      dale.do (pfs, function (pf) {
         multi.pfcount (pf);
      });
      multi.exec (function (error, counts) {
         if (error) notify ({type: 'stat pfcount -> counter error', error: error});
         var d = Date.now (), multi2 = redis.multi ();
         dale.do (pfs, function (pf, k) {
            var duration = pf.split (':') [0] === 'a' ? 1000 * 60 * 10 : 1000 * 60 * 60 * 24;
            if (d - parseInt (pf.split (':') [1] + '00000') > duration) {
               multi2.srem ('stp', pf);
               multi2.set  (pf, counts [k]);
            }
         });
         multi2.exec (function (error) {
            if (error) notify ({type: 'stat pfcount -> counter error', error: error});
         });
      });
   });
}, 20 * 1000);

// *** BOOTSTRAP FIRST ADMIN USER ***

if (cicek.isMaster && ENV) setTimeout (function () {
   redis.hget ('invites', SECRET.admins [0], function (error, admin) {
      if (error) return notify ({type: 'bootstrap check error', error: error});
      if (admin) return;

      hitit.one ({}, {timeout: 15, port: CONFIG.port, method: 'post', path: 'admin/invites', body: {email: SECRET.admins [0]}}, function (error) {
         if (error) notify ({type: 'bootstrap invite error', error: error});
         else       notify ({type: 'bootstrap invite OK'});
      });
   });
}, 3000);

// *** CHECK CONSISTENCY BETWEEN DB, FS AND S3 (DISABLED) ***

if (cicek.isMaster && ENV && false) a.do ([
   [function (s) {
      H.s3list ('', function (error, uploaded) {
         if (error) return notify ({type: 's3/disk matching error', error: error});
         s.uploaded = dale.obj (uploaded, function (v) {return [v, true]});
         s.do ();
      });
   }],
   function (s) {
      fs.readdir (CONFIG.picfolder, function (error, dirs) {
         if (error) return notify ({type: 's3/disk matching error', error: error});
         var counter = dirs.length;
         s.files = {};
         dale.do (dirs, function (dir) {
            fs.readdir (Path.join (CONFIG.picfolder, dir), function (error, files) {
               if (counter === false) return;
               if (error) {
                  counter = false;
                  return notify ({type: 's3/disk matching error', error: error});
               }
               dale.do (files, function (file) {
                  s.files [Path.join (dir, file)] = true;
               });
               if (--counter === 0) s.do ();
            });
         });
      });
   },
   function (s) {
      redis.keyscan ('pic:*', function (error, pics) {
         if (error) return notify ({type: 's3/disk matching error', error: error});
         var multi = redis.multi ();
         s.pics   = {};
         s.thumbs = {};
         dale.do (pics, function (pic) {
            multi.hgetall (pic);
         });
         multi.exec (function (error, data) {
            if (error) return notify ({type: 's3/disk matching error', error: error});
            dale.do (pics, function (pic, k) {
               s.pics [pic] = data [k];
               if (data [k].t200) s.thumbs [data [k].t200] = {owner: data [k].owner};
               if (data [k].t900) s.thumbs [data [k].t900] = {owner: data [k].owner};
            });
            s.do ();
         });
      });
   },
   function (s) {
      s.missings3 = [];
      var extraneous = teishi.c (s.uploaded);
      dale.do (s.pics, function (pic, k) {
         var path = Path.join (H.hashs (pic.owner), k.replace ('pic:', ''));
         if (! s.uploaded [path]) s.missings3.push (path);
         delete extraneous [path];
      });
      if (dale.keys (extraneous).length) notify ({type: 'extraneous files in s3 error', n: dale.keys (extraneous).length, files: extraneous});
      if (s.missings3.length)            notify ({type: 'missing pics in s3 error',     n: s.missings3.length,            files: s.missings3});
      // Delete extraneous elements from S3 (including thumbnails)
      H.s3del (null, dale.keys (extraneous), null, function (error) {
         if (error) return notify ({type: 'extraneous files in s3 deletion error', error: error});
         if (dale.keys (extraneous).length) notify ({type: 'deletion of extraneous files in s3', n: dale.keys (extraneous).length});
         // Upload missing pics to S3
         a.do (s, [
            [a.fork, s.missings3, function (key) {
               return [H.s3put, null, Path.join (CONFIG.picfolder, key), key];
            }, {max: 5}],
            function (s) {
               if (s.error) return notify ({type: 'missing pics in s3 upload error', error: s.error});
               if (s.missings3.length) notify ({type: 'uploaded missing pics to s3', n: s.missings3.length});
               s.do ();
            },
         ]);
      });
   },
   function (s) {
      s.missingfs = [];
      var extraneous = teishi.c (s.files);
      dale.do (s.thumbs, function (thumb, k) {
         var path = Path.join (H.hashs (thumb.owner), k);
         if (! s.files [path]) s.missingfs.push (path);
         delete extraneous [path];
      });
      if (dale.keys (extraneous).length) notify ({type: 'extraneous files in FS error', n: dale.keys (extraneous).length, files: extraneous});
      if (s.missingfs.length)            notify ({type: 'missing pics in FS error',     n: s.missingfs.length,            files: s.missingfs});
      // Delete extraneous files from FS (including pictures)
      a.do (s, [
         [a.fork, extraneous, function (v, k) {
            return [a.make (fs.unlink), Path.join (CONFIG.picfolder, k)];
         }, {max: 5}],
         function (s) {
            if (s.error) return notify ({type: 'extraneous files in FS deletion error', error: s.error});
            if (dale.keys (extraneous).length) notify ({type: 'deleted extraneous files from FS', n: dale.keys (extraneous).length});
            s.do ();
         },
      ]);
   },
]);

// *** CHECK STORED SIZES ***

if (cicek.isMaster && ENV) a.do ([
   [function (s) {
      redis.keyscan ('*', function (error, keys) {
         if (error) return notify ({type: 'stored size check error', error: error});
         var multi = redis.multi ();
         dale.do (keys, function (key) {
            if (key.match (/^(pic|users):/)) multi.hgetall (key);
         });
         multi.exec (function (error, data) {
            if (error) return notify ({type: 'stored size check error', error: error});
            s.keys = data;
            s.do ();
         });
      });
   }],
   function (s) {
      var pics = {}, users = {}, count = {};
      dale.do (s.keys, function (key) {
         if (key.owner) pics [key.id] = key;
         if (key.username) {
            key ['s3:buse'] = parseInt (key ['s3:buse'] || '0');
            users [key.username] = key;
         }
      });
      dale.do (pics, function (pic) {
         if (! count [pic.owner]) count [pic.owner] = 0;
         count [pic.owner] += parseInt (pic.by);
      });
      var multi = redis.multi ();
      dale.do (users, function (user) {
         if (user ['s3:buse'] === count [user.username]) return;
         if (count [user.username] === undefined && user ['s3:buse'] === 0) return;
         notify ({type: 's3:buse mismatch error', u: user.username, was: user ['s3:buse'], actual: count [user.username]});
         multi.hset ('users:' + user.username, 's3:buse', count [user.username]);
      });
      multi.exec (function (error) {
         if (error) return notify ({type: 's3:buse mismatch update error', error: error});
      });
   },
]);
