/*
ac;pic - v0.1.0

Written by Altocode (https://altocode.nl) and released into the public domain.

Please refer to readme.md to read the annotated source (but not yet!).
*/

// *** SETUP ***

var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');
var ENV    = process.argv [2];

var crypto = require ('crypto');
var fs     = require ('fs');
var Path   = require ('path');
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

var uuid   = require ('uuid/v4');
var mailer = require ('nodemailer').createTransport (require ('nodemailer-ses-transport') (SECRET.ses));
var hash   = require ('murmurhash').v3;
var mime   = require ('mime');

var type = teishi.type, clog = console.log, eq = teishi.eq, reply = function () {
   var rs = dale.stopNot (arguments, undefined, function (arg) {
      if (arg && type (arg.log) === 'object') return arg;
   });
   // TODO remove this when fixed in cicek
   if (! rs.connection.writable) return notify (a.creat (), {type: 'client dropped connection', method: rs.log.method, url: rs.log.url, headers: rs.log.requestHeaders});
   cicek.reply.apply (null, dale.fil (arguments, undefined, function (v, k) {
      if (k === 0 && v && v.path && v.last && v.vars) return;
      return v;
   }));
}, stop = function (rs, rules) {
   return teishi.stop (rules, function (error) {
      reply (rs, 400, {error: error});
   });
}, astop = function (rs, path) {
   a.stop (path, function (s, error) {
      reply (rs, 500, {error: error});
   });
}, mexec = function (s, multi) {
   multi.exec (function (error, data) {
      if (error) return s.next (0, error);
      s.next (data);
   });
}

// *** GIZ ***

giz.redis          = redis;
giz.config.expires = 24 * 60 * 60;

// *** REDIS EXTENSIONS ***

redis.keyscan = function (s, match, cursor, keys) {
   if (! cursor) cursor = 0;
   if (! keys)   keys   = {};
   redis.scan (cursor, 'MATCH', match, function (error, result) {
      if (error) return s.next (0, error);
      cursor = result [0];
      dale.go (result [1], function (key) {
         keys [key] = true;
      });
      if (cursor !== '0') return redis.keyscan (s, match, cursor, keys);
      s.next (dale.keys (keys));
   });
}

var Redis = function (s, action) {
   redis [action].apply (redis, [].slice.call (arguments, 2).concat (function (error, data) {
      if (error) s.next (0, error);
      else       s.next (data);
   }));
}

// *** NOTIFICATIONS ***

SECRET.ping.send = function (payload, CB) {
   CB = CB || clog;
   var login = function (cb) {
      hitit.one ({}, {
         host:   SECRET.ping.host,
         port:   SECRET.ping.port,
         https:  SECRET.ping.https,
         method: 'post',
         path:   require ('path').join (SECRET.ping.path || '', 'auth/login'),
         body: {username: SECRET.ping.username, password: SECRET.ping.password, tz: new Date ().getTimezoneOffset ()}
      }, function (error, data) {
         if (error) return CB (error);
         SECRET.ping.cookie = data.headers ['set-cookie'] [0];
         cb ();
      });
   }
   var send = function (retry) {
      hitit.one ({}, {
         host:   SECRET.ping.host,
         port:   SECRET.ping.port,
         https:  SECRET.ping.https,
         method: 'post',
         path: require ('path').join (SECRET.ping.path || '', 'data'),
         headers: {cookie: SECRET.ping.cookie},
         body:    payload,
      }, function (error) {
         if (error && error.code === 403 && ! retry) return login (function () {send (true)});
         if (error) return CB (error);
         CB ();
      });
   }
   if (SECRET.ping.cookie) {
      payload.cookie = SECRET.ping.cookie;
      send ();
   }
   else login (function () {
      payload.cookie = SECRET.ping.cookie;
      send (true);
   });
}

var notify = function (s, message) {
   if (type (message) !== 'object') return clog ('NOTIFY: message must be an object but instead is', message, s);
   message.environment = ENV || 'local';
   if (! ENV) {
      clog (new Date ().toUTCString (), message);
      return s.next ();
   }
   SECRET.ping.send (message, function (error) {
      if (error) return s.next (null, error);
      else s.next ();
   });
}

// *** SENDMAIL ***

var sendmail = function (s, o) {
   o.from1 = o.from1 || SECRET.emailName;
   o.from2 = o.from2 || SECRET.emailAddress;
   mailer.sendMail ({
      from:    o.from1 + ' <' + SECRET.emailAddress + '>',
      to:      o.to1   + ' <' + o.to2 + '>',
      replyTo: o.from2,
      subject: o.subject,
      html:    lith.g (o.message),
   }, function (error, rs) {
      if (! error) return notify (s, {type: 'email sent', to: o.to2, subject: o.subject});
      a.stop (s, [notify, {type: 'mailer error', error: error, options: o}]);
   });
}

// *** KABOOT ***

var k = function (s) {

   var output = {stdout: '', stderr: ''};

   var command = [].slice.call (arguments, 1);

   var proc = require ('child_process').spawn (command [0], command.slice (1));

   var wait = 3;

   var done = function () {
      if (--wait > 0) return;
      if (! output.stderr && output.code === 0) s.next (output);
      else                                      s.next (0, output);
   }

   dale.go (['stdout', 'stderr'], function (v) {
      proc [v].on ('data', function (chunk) {
         output [v] += chunk;
      });
      proc [v].on ('end', done);
   });

   proc.on ('error', function (error) {
      output.err += error + ' ' + error.stack;
      done ();
   });
   proc.on ('exit',  function (code, signal) {
      output.code = code;
      output.signal = signal;
      done ();
   });
}

// *** S3 ***

var s3 = new (require ('aws-sdk')).S3 ({
   apiVersion:  '2006-03-01',
   sslEnabled:  true,
   credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
   params:      {Bucket: SECRET.s3.pic.bucketName},
});

// *** HELPERS ***

var H = {};

H.email = /^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/;

H.trim = function (string) {
   return string.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
}

H.log = function (s, user, ev) {
   ev.t = Date.now ();
   Redis (s, 'lpush', 'ulog:' + user, teishi.str (ev));
}

H.size = function (s, path) {
   if (s.size) return s.next ();
   a.seq (s, [
      [a.stop, [k, 'identify', path], function (s, error) {
         s.next (0, 'Invalid image #1.');
      }],
      [a.set, 'size', function (s) {
         var info = s.last.stdout.split (' ') [2];
         if (! info)                                        return s.next (0, 'Invalid image #2.');
         info = info.split ('x');
         if (info.length !== 2)                             return s.next (0, 'Invalid image #3.');
         s.next ({w: parseInt (info [0]), h: parseInt (info [1])});
      }]
   ]);
}

H.hash = function (string) {
   return hash (string) + '';
}

H.isyear = function (tag) {
   return tag.match (/^[0-9]{4}$/) && parseInt (tag) >= 1900 && parseInt (tag) <= 2100;
}

H.mkdirif = function (s, path) {
   a.stop (s, [k, 'test', '-d', path], function (s) {
      a.seq (s, [k, 'mkdir', path]);
   });
}

H.resizeif = function (s, path, Max) {
   a.stop (s, [
      [H.size, path],
      function (s) {
         if (s.size.w <= Max && s.size.h <= Max) return s.next ();
         s ['t' + Max] = uuid ();
         var perc = Math.round (Max / Math.max (s.size.h, s.size.w) * 100);
         k (s, 'convert', path, '-quality', 75, '-thumbnail', perc + '%', Path.join (Path.dirname (path), s ['t' + Max]));
      },
      function (s) {
         if (s.size.w <= Max && s.size.h <= Max) return s.next ();
         a.make (fs.stat) (s, Path.join (Path.dirname (path), s ['t' + Max]));
      },
      function (s) {
         s ['t' + Max + 'size'] = s.last.size;
         s.next ();
      }
   ]);
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
   a.stop (s, [
      [a.make (H.encrypt), path],
      [a.get, a.make (s3.upload, s3), {Key: user ? (H.hash (user) + '/' + key) : key, Body: '@last'}],
      ! user ? [] : [
         [a.make (s3.headObject, s3), {Key: H.hash (user) + '/' + key}],
         function (s) {
            a.set (s, false, [Redis, 'hincrby', 'users:' + user, 's3:buse', s.last.ContentLength]);
         },
      ]
   ]);
}

H.s3get = function (s, user, key) {
   a.stop (s, [
      [a.set, 'data', [a.make (s3.getObject, s3), {Key: H.hash (user) + '/' + key}]],
      function (s) {
         Redis (s, 'hincrby', 'users:' + user, 's3:bget', s.data.ContentLength);
      },
      function (s) {
         s.next (H.decrypt (s.data.Body));
      }
   ]);
}

H.s3del = function (s, user, keys, sizes) {

   var counter = 0;
   if (type (keys) === 'string') keys = [keys];

   if (keys.length === 0) return s.next ();

   var batch = function () {
      s3.deleteObjects ({Delete: {Objects: dale.go (keys.slice (counter * 1000, (counter + 1) * 1000), function (key) {
         return {Key: user ? (H.hash (user) + '/' + key) : key}
      })}}, function (error) {
         if (error) return s.next (0, error);
         var multi = redis.multi ();
         if (user) dale.go (sizes, function (size) {multi.hincrby ('users:' + user, 's3:buse', - size)});
         multi.exec (function (error) {
            if (error) return s.next (0, error);
            if (++counter === Math.ceil (keys.length / 1000)) s.next ();
            else batch ();
         });
      });
   }

   batch ();
}

H.s3list = function (s, prefix) {
   var output = [];
   var fetch = function (marker) {
      s3.listObjects ({Prefix: prefix, Marker: marker}, function (error, data) {
         if (error) return s.next (0, error);
         output = output.concat (data.Contents);
         delete data.Contents;
         if (! data.IsTruncated) return s.next (dale.go (output, function (v) {return v.Key}));
         fetch (output [output.length - 1].Key);
      });
   }
   fetch ();
}

H.zp = function (v) {return v < 10 ? '0' + v : v}

H.stat = function (s, name, pf, n) {
   var t = Date.now ();
   t = (t - (t % (1000 * 60 * 10))) / 100000;
   if (! pf) a.seq (s, [Redis, 'incrby', 'sti:' + name + ':' + t, n || 1]);
   else      a.seq (s, function (s) {
      var multi = redis.multi ();
      if (name === 'A') t = new Date (new Date ().getUTCFullYear () + '-' + H.zp (new Date ().getUTCMonth () + 1) + '-' + H.zp (new Date ().getUTCDate ()) + 'T00:00:00.000Z').getTime () / 100000;
      multi.pfadd ('stp:' + name + ':' + t, pf);
      multi.sadd  ('stp',   name + ':' + t);
      mexec (s, multi);
   });
}

H.deletepic = function (s, id, username) {
   a.stop (s, [
      [function (s) {
         var multi = redis.multi ();
         multi.hgetall  ('pic:'  + id);
         multi.smembers ('pict:' + id);
         mexec (s, multi);
      }],
      function (s) {
         s.pic  = s.last [0];
         s.tags = s.last [1];
         if (! s.pic || username !== s.pic.owner) return s.next (0, 'nf');

         H.s3del (s, username, s.pic.id, s.pic.by);
      },
      function (s) {
         var thumbs = [];
         if (s.pic.t200) thumbs.push (s.pic.t200);
         if (s.pic.t900) thumbs.push (s.pic.t900);
         a.fork (s, thumbs, function (v) {
            return [a.make (fs.unlink), Path.join (CONFIG.basepath, H.hash (username), v)];
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

         dale.go (s.tags.concat (['all', 'untagged']), function (tag) {
            multi.srem ('tag:' + s.pic.owner + ':' + tag, s.pic.id);
         });

         mexec (s, multi);
      },
      [H.log, username, {a: 'del', id: id}],
   ]);
}

// *** ROUTES ***

var routes = [

   // *** STATIC ASSETS ***

   ['get', 'lib/murmurhash.js', cicek.file, 'node_modules/murmurhash/murmurhash.js'],

   ['get', 'img/*', cicek.file, ['markup']],

   ['get', ['lib/*', 'client.js', 'testclient.js', 'admin.js'], cicek.file],

   ['get', '/', reply, lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['meta', {charset: 'utf-8'}],
            ['title', 'ac;pic'],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat:400,400i,500,500i,600,600i&display=swap'}],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Kadwa'}],
            dale.go (['ionicons.min', 'normalize.min'], function (v) {
               return ['link', {rel: 'stylesheet', href: 'lib/' + v + '.css'}];
            })
         ]],
         ['body', [
            dale.go (['gotoB.min', 'murmurhash'], function (v) {
               return ['script', {src: 'lib/' + v + '.js'}];
            }),
            ['script', 'var ALLOWEDMIME = ' + JSON.stringify (CONFIG.allowedmime) + ';'],
            ['script', 'var BASETAGS    = ' + JSON.stringify (['all', 'untagged']) + ';'],
            ['script', {src: 'client.js'}]
         ]]
      ]]
   ])],

   ['get', 'admin', reply, lith.g ([
      ['!DOCTYPE HTML'],
      ['html', [
         ['head', [
            ['meta', {name: 'viewport', content: 'width=device-width,initial-scale=1'}],
            ['meta', {charset: 'utf-8'}],
            ['title', 'ac;pic admin'],
            ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat'}],
            dale.go (['pure-min', 'ionicons.min'], function (v) {
               return ['link', {rel: 'stylesheet', href: 'lib/' + v + '.css'}];
            })
         ]],
         ['body', [
            dale.go (['gotoB.min'], function (v) {
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

      astop (rs, [
         [sendmail, {to1: 'Chef', to2: SECRET.admins [0], subject: 'Request for ac;pic invite', message: ['p', [new Date ().toUTCString (), ' ', b.email]]}],
         [reply, rs, 200],
      ]);
   }],

   // *** CLIENT ERRORS ***

   ['post', 'error', function (rq, rs) {
      astop (rs, [
         [notify, {type: 'client error', ip: rq.origin, user: (rq.user || {}).username, error: rq.body, ua: rq.headers ['user-agent']}],
         [reply, rs, 200],
      ]);
   }],

   // *** LOGIN & SIGNUP ***

   ['post', 'auth/login', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'tz'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
            ['body.tz', b.tz, 'integer'],
         ]},
      ])) return;

      b.username = H.trim (b.username.toLowerCase ());

      astop (rs, [
         [a.set, 'username', function (s) {
            if (! b.username.match ('@')) return s.next (b.username);
            a.cond (s, [Redis, 'hget', 'emails', b.username], {
               null: [reply, rs, 403, {error: 'auth'}],
            });
         }],
         [a.stop, [a.set, 'session', function (s) {
            a.make (giz.login) (s, s.username, b.password);
         }], function (s, error) {
            if (type (error) === 'string') reply (rs, 403, {error: 'auth'});
            else                           reply (rs, 500, {error: error});
         }],
         [a.cond, [a.get, Redis, 'hget', 'users:@username', 'verificationPending'], {
            true: [reply, rs, 403, {error: 'verify'}],
            else: function (s) {a.seq (s, [
               [function (s) {
                  require ('bcryptjs').genSalt (20, function (error, csrf) {
                     if (error) return s.next (null, error);
                     s.csrf = csrf;
                     a.seq (s, [Redis, 'setex', 'csrf:' + s.session, giz.config.expires, csrf]);
                  });
               }],
               [H.log, s.username, {a: 'log', ip: rq.origin, ua: rq.headers ['user-agent'], tz: b.tz}],
               function (s) {
                  reply (rs, 200, {csrf: s.csrf}, {'set-cookie': cicek.cookie.write (CONFIG.cookiename, s.session, {httponly: true, path: '/', expires: new Date (Date.now () + 1000 * 60 * 60 * 24 * 365 * 10)})});
               }
            ])}
         }],
      ]);
   }],

   ['post', 'auth/signup', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username', 'password', 'email', 'token'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password', 'email', 'token'], function (key) {
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
      astop (rs, [
         [mexec, multi],
         function (s) {
            s.invite = teishi.parse (s.last [0]);
            if (! s.invite || s.invite.token !== b.token) return reply (rs, 403, {error: 'token'});
            if (s.last [1]) return reply (rs, 403, {error: 'email'});
            if (s.last [2]) return reply (rs, 403, {error: 'username'});
            s.next ();
         },
         [a.set, 'emailtoken', [a.make (require ('bcryptjs').genSalt), 20]],
         [a.make (giz.signup), b.username, b.password],
         function (s) {
            var multi = redis.multi ();
            multi.hset  ('emailtoken', s.emailtoken, b.email);
            multi.hset  ('emails',  b.email, b.username);
            multi.hmset ('users:' + b.username, {
               username:            b.username,
               email:               b.email,
               type:                'tier1',
               created:             Date.now (),
            });
            if (! ENV) multi.hmset ('users:' + b.username, 'verificationPending', true);
            multi.hset  ('invites', b.email, JSON.stringify ({accepted: Date.now ()}));
            mexec (s, multi);
         },
         [H.log, b.username, {a: 'sig', ip: rq.origin, ua: rq.headers ['user-agent']}],
         ! ENV ? [
            [a.get, reply, rs, 200, {token: '@emailtoken'}],
         ] : [
            [sendmail, {
               to1:     b.username,
               to2:     b.email,
               subject: CONFIG.etemplates.welcome.subject,
               message: CONFIG.etemplates.welcome.message (b.username)
            }],
            [a.set, 'session', [a.make (giz.login), b.username, b.password]],
            function (s) {
               reply (rs, 200, '', {cookie: cicek.cookie.write (CONFIG.cookiename, s.session)});
            },
         ],
      ]);
   }],

   // *** EMAIL VERIFICATION ***

   ['get', 'auth/verify/(*)', function (rq, rs) {

      var token = rq.data.params [0];

      astop (rs, [
         [a.cond, [a.set, 'emailtoken', [Redis, 'hget', 'emailtoken', token], true], {
            null: [
               [notify, {type: 'bad emailtoken', token: token, ip: rq.origin, ua: rq.headers ['user-agent']}],
               [reply, rs, 302, '', {location: 'https://' + CONFIG.server + '#/login/badtoken'}],
            ],
         }],
         [a.set, 'username', [a.get, Redis, 'hget', 'emails', '@emailtoken']],
         function (s) {
            var multi = redis.multi ();
            multi.hdel ('users:' + s.username, 'verificationPending');
            multi.hdel ('emailtoken', token);
            mexec (s, multi);
         },
         function (s) {
            notify (s, {type: 'verify', user: s.username});
         },
         ! ENV ? [] : [sendmail, {to1: username, to2: email, subject: CONFIG.etemplates.welcome.subject, message: CONFIG.etemplates.welcome.message (username)}],
         [reply, rs, 302, {location: '/#auth/login/verified'}],
      ]);
   }],

   // *** PASSWORD RECOVER/RESET ***

   ['post', 'auth/recover', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['username'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.username', b.username, 'string']
         ]},
      ])) return;

      b.username = H.trim (b.username.toLowerCase ());

      astop (rs, [
         [a.set, 'username', function (s) {
            if (! b.username.match ('@')) return s.next (b.username);
            a.cond (s, [Redis, 'hget', 'emails', b.username], {
               null: [reply, rs, 403, {error: 'auth'}],
            });
         }],
         [a.stop, [a.set, 'token', [a.get, a.make (giz.recover), '@username']], function (s, error) {
            if (type (error) === 'string') reply (rs, 403, {error: 'auth'});
            else                           reply (rs, 500, {error: error});
         }],
         ENV ? [] : [a.get, reply, rs, 200, {token: '@token'}],
         [a.set, 'user', [a.get, Redis, 'hgetall', 'users:@username']],
         function (s) {
            sendmail (s, {
               to1:     s.user.username,
               to2:     s.user.email,
               subject: CONFIG.etemplates.recover.subject,
               message: CONFIG.etemplates.recover.message (s.user.username, s.token)
            });
         },
         function (s) {
            H.log (s, s.user.username, {a: 'rec', ip: rq.origin, ua: rq.headers ['user-agent'], token: s.token});
         },
         [reply, rs, 200],
      ]);
   }],

   ['post', 'auth/reset', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['body', b, 'string', 'each'],
         ['keys of body', dale.keys (b), ['username', 'password', 'token'], 'eachOf', teishi.test.equal],
         function () {return [
            dale.go (['username', 'password', 'token'], function (key) {
               return ['body.' + key, b [key], 'string']
            }),
         ]},
         function () {return ['body.password length', b.password.length, {min: 6}, teishi.test.range]}
      ])) return;

      astop (rs, [
         [a.stop, [a.set, 'token', [a.make (giz.reset), b.username, b.token, b.password]], function (s, error) {
            if (type (error) === 'string') reply (rs, 403, {error: 'token'});
            else                           reply (rs, 500, {error: error});
         }],
         [a.set, 'user', [Redis, 'hgetall', 'users:' + b.username]],
         ! ENV ? [] : function (s) {
            sendmail (s, {
               to1:     s.user.username,
               to2:     s.user.email,
               subject: CONFIG.etemplates.reset.subject,
               message: CONFIG.etemplates.reset.message (s.user.username)
            });
         },
         function (s) {
            H.log (s, s.user.username, {a: 'res', ip: rq.origin, ua: rq.headers ['user-agent'], token: b.token});
         },
         [reply, rs, 200],
      ]);
   }],

   // *** GATEKEEPER FUNCTION ***

   ['all', '*', function (rq, rs) {

      if (rq.method === 'post' && rq.url === '/error')                  return rs.next ();
      if (rq.method === 'get'  && rq.url === '/admin/stats')            return rs.next ();
      if (rq.method === 'post' && rq.url === '/admin/invites') {
         if (! ENV)                                                        return rs.next ();
         if (eq (rq.body, {email: SECRET.admins [0], firstName: 'admin'})) return rs.next ();
      }

      if (! rq.data.cookie)                               return reply (rs, 403, {error: 'nocookie'});
      if (! rq.data.cookie [CONFIG.cookiename]) {
         if (rq.headers.cookie.match (CONFIG.cookiename)) return reply (rs, 403, {error: 'tampered'});
                                                          return reply (rs, 403, {error: 'noappcookie'});
      }

      giz.auth (rq.data.cookie [CONFIG.cookiename], function (error, user) {
         if (error)  return reply (rs, 500, {error: error});
         if (! user) return reply (rs, 403, {error: 'session'});

         rs.log.username = user.username;
         rq.user         = user;

         if (rq.url.match (/^\/admin/)  && SECRET.admins.indexOf (rq.user.email) === -1) return reply (rs, 403);

         astop (rs, [
            [H.stat, 'a', user.username],
            [H.stat, 'A', user.username],
            [Redis, 'expire', 'csrf:' + rq.data.cookie [CONFIG.cookiename], giz.config.expires],
            [Redis, 'get',    'csrf:' + rq.data.cookie [CONFIG.cookiename]],
            function (s) {
               rq.csrf = s.last;
               rs.next ();
            }
         ]);
      });
   }],

   // *** CSRF PROTECTION ***

   ['get', 'csrf', function (rq, rs) {
      reply (rs, 200, {csrf: rq.csrf});
   }],

   ['post', '*', function (rq, rs) {

      if (rq.method === 'post' && rq.url === '/admin/invites' && ! ENV) return rs.next ();

      var ctype = rq.headers ['content-type'] || '';
      if (ctype.match (/^multipart\/form-data/i)) {
         if (rq.data.fields.csrf !== rq.csrf) return reply (rs, 403, {error: 'csrf'});
         delete rq.data.fields.csrf;
      }
      else {
         if (type (rq.body) !== 'object') return reply (rs, 400);
         if (rq.body.csrf !== rq.csrf)    return reply (rs, 403, {error: 'csrf'});
         delete rq.body.csrf;
      }
      rs.next ();
   }],

   // *** LOGOUT ***

   ['post', 'auth/logout', function (rq, rs) {
      astop (rs, [
         [a.make (giz.logout), rq.data.cookie [CONFIG.cookiename]],
         [Redis, 'del', 'csrf:' + rq.data.cookie [CONFIG.cookiename]],
         [reply, rs, 200, '', {'set-cookie': cicek.cookie.write (CONFIG.cookiename, false, {path: '/'})}],
      ]);
   }],

   // *** DELETE ACCOUNT ***

   ['post', 'auth/delete', function (rq, rs) {

      // We temporarily disable account deletions.
      if (ENV) return reply (rs, 501);

      var multi = redis.multi ();
      multi.smembers ('tag:'  + rq.user.username + ':all');
      multi.smembers ('tags:' + rq.user.username);

      astop (rs, [
         [a.set, 'data', [mexec, multi]],
         [a.make (giz.destroy), rq.user.username],
         function (s) {
            a.fork (s, s.data [0], function (pic) {
               return [H.deletepic, pic, rq.user.username];
            }, {max: 5});
         },
         function (s) {
            var multi = redis.multi ();
            multi.del ('csrf:' + rq.data.cookie [CONFIG.cookiename]);
            multi.hdel ('emails',  rq.user.email);
            multi.hdel ('invites', rq.user.email);
            dale.go (s.data [1].concat (['all', 'untagged']), function (tag) {
               multi.del ('tag:' + rq.user.username + ':' + tag);
            });
            multi.del ('tags:'  + rq.user.username);
            multi.del ('upic:'  + rq.user.username);
            multi.del ('upicd:' + rq.user.username);
            multi.del ('shm:'   + rq.user.username);
            multi.del ('sho:'   + rq.user.username);
            multi.del ('ulog:'  + rq.user.username);
            mexec (s, multi);
         },
         [a.make (giz.logout), rq.data.cookie [CONFIG.cookiename]],
         [H.log, rq.user.username, {a: 'des', ip: rq.origin, ua: rq.headers ['user-agent']}],
         [reply, rs, 200, '', {'set-cookie': cicek.cookie.write (CONFIG.cookiename, false)}],
      ]);
   }],

   // *** CHANGE PASSWORD ***

   ['post', 'auth/changePassword', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['body', b, 'object'],
         ['keys of body', dale.keys (b), ['old', 'new'], 'eachOf', teishi.test.equal],
         function () {return [
            ['body.old', b.old,     'string'],
            ['body.new', b ['new'], 'string']
         ]},
         function () {return ['password', b ['new'].length, {min: 6}, teishi.test.range]},
      ])) return;

      giz.db.hget ('users', rq.user.username, 'pass', function (error, hash) {
         if (error) return reply (rs, 500, {error: error});
         if (hash === null) return reply (rs, 500, {error: 'User doesn\'t exist.'});
         require ('bcryptjs').compare (b ['old'], hash, function (error, result) {
            if (error || ! result) return reply (rs, 403);
            giz.reset (rq.user.username, true, b ['new'], function (error) {
               if (error) return reply (rs, 500, {error: error});
               astop (rs, [
                  [H.log, rq.user.username, {a: 'chp', ip: rq.origin, ua: rq.headers ['user-agent']}],
                  [reply, rs, 200],
               ]);
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

      astop (rs, [
         [notify, {type: 'feedback', user: rq.user.username, message: b.message}],
         ENV ? [] : [reply, rs, 200],
         [sendmail, {
            to1:     rq.user.username,
            to2:     rq.user.email,
            subject: CONFIG.etemplates.feedback.subject,
            message: CONFIG.etemplates.feedback.message (rq.user.username, b.message)
         }],
         [reply, rs, 200],
      ]);
   }],

   // *** RETRIEVE ORIGINAL IMAGE (FOR TESTING PURPOSES) ***

   ['get', 'original/:id', function (rq, rs) {
      if (ENV) return reply (rs, 400);
      astop (rs, [
         [H.s3get, rq.user.username, rq.data.params.id],
         function (s) {
            rs.end (s.last);
         }
      ]);
   }],

   // *** DOWNLOAD PICS ***

   ['get', 'pic/:id', function (rq, rs) {
      if (ENV) return reply (rs, 400);
      astop (rs, [
         [a.cond, [a.set, 'pic', [Redis, 'hgetall', 'pic:' + rq.data.params.id], true], {null: [reply, rs, 404]}],
         function (s) {
            if (rq.user.username === s.pic.owner) return s.next ();
            a.stop (s, [
               [a.set, 'tags', [Redis, 'smembers', 'pict:' + s.pic.id]],
               function (s) {
                  if (s.tags.length === 0) return reply (rs, 404);
                  var multi = redis.multi ();
                  dale.go (s.tags, function (tag) {
                     multi.sismember ('shm:' + rq.user.username, s.pic.owner + ':' + tag);
                  });
                  mexec (s, multi);
               },
               function (s) {
                  var authorized = dale.stop (s.last, true, function (v) {return !! v});
                  if (! authorized) return reply (rs, 404);
                  s.next ();
               }
            ]);
         },
         [Redis, 'hincrby', 'pic:' + rq.data.params.id, 'xp', 1],
         function (s) {
            cicek.file (rq, rs, Path.join (H.hash (s.pic.owner), s.pic.id), [CONFIG.basepath]);
         }
      ]);
   }],

   ['get', 'thumb/:id', function (rq, rs) {
      astop (rs, [
         [a.cond, [Redis, 'get', 'thu:' + rq.data.params.id], {null: [reply, rs, 404]}],
         [a.cond, [a.set, 'pic', [a.get, Redis, 'hgetall', 'pic:@last'], true], {null: [reply, rs, 404]}],
         function (s) {
            if (rq.user.username === s.pic.owner) return s.next ();
            a.stop (s, [
               [a.set, 'tags', [Redis, 'smembers', 'pict:' + s.pic.id]],
               function (s) {
                  if (s.tags.length === 0) return reply (rs, 404);
                  var multi = redis.multi ();
                  dale.go (s.tags, function (tag) {
                     multi.sismember ('shm:' + rq.user.username, s.pic.owner + ':' + tag);
                  });
                  mexec (s, multi);
               },
               function (s) {
                  var authorized = dale.stop (s.last, true, function (v) {return !! v});
                  if (! authorized) return reply (rs, 404);
                  s.next ();
               }
            ]);
         },
         function (s) {
            Redis (s, 'hincrby', 'pic:' + s.pic.id, 'xt' + (rq.data.params.id === s.pic.t200 ? 2 : 9), 1);
         },
         function (s) {
            cicek.file (rq, rs, Path.join (H.hash (s.pic.owner), rq.data.params.id), [CONFIG.basepath]);
         }
      ]);
   }],

   // *** UPLOAD PICTURES ***

   ['post', 'pic', function (rq, rs) {

      if (! rq.data.fields)      return reply (rs, 400, {error: 'field'});
      if (! rq.data.files)       return reply (rs, 400, {error: 'file'});
      if (! rq.data.fields.uid)  return reply (rs, 400, {error: 'uid'});
      if (! rq.data.fields.tags) rq.data.fields.tags = '[]';
      if (! eq (dale.keys (rq.data.fields), ['uid', 'lastModified', 'tags'])) return reply (rs, 400, {error: 'invalidField'});
      if (! eq (dale.keys (rq.data.files),  ['pic']))                         return reply (rs, 400, {error: 'invalidFile'});

      var tags = teishi.parse (rq.data.fields.tags), error;
      if (type (tags) !== 'array') return reply (rs, 400, {error: 'tags'});
      tags = dale.go (tags, function (tag) {
         if (type (tag) !== 'string') return error = teishi.str (tag);
         tag = H.trim (tag);
         if (['all', 'untagged'].indexOf (tag) !== -1) return error = tag;
         if (H.isyear (tag)) error = tag;
         return tag;
      });
      if (error) return reply (rs, 400, {error: 'tag: ' + error});

      if (type (parseInt (rq.data.fields.lastModified)) !== 'integer') return reply (rs, 400, {error: 'lastModified'});

      if (CONFIG.allowedmime.indexOf (mime.lookup (rq.data.files.pic)) === -1) return reply (rs, 400, {error: 'fileFormat'});

      var path = rq.data.files.pic;

      var lastModified = parseInt (rq.data.fields.lastModified);

      var pic = {
         id:     uuid (),
         owner:  rq.user.username,
         name:   path.slice (path.indexOf ('_') + 1),
         dateup: Date.now (),
      };

      var newpath = Path.join (CONFIG.basepath, H.hash (rq.user.username), pic.id);

      astop (rs, [
         [a.set, 'hash', function (s) {
            fs.readFile (path, function (error, file) {
               if (error) return s.next (0, error);
               s.next (hash (file.toString ()));
            });
         }],
         [a.cond, [a.get, Redis, 'sismember', 'upic:' + rq.user.username, '@hash'], {'1': [reply, rs, 409, {error: 'repeated'}]}],
         [Redis, 'hget', 'users:' + rq.user.username, 's3:buse'],
         function (s) {
            if (s.last !== null && (CONFIG.storelimit [rq.user.type]) < parseInt (s.last)) return reply (rs, 409, {error: 'capacity'});
            s.next ();
         },
         [a.stop, [a.set, 'metadata', [k, 'identify', '-format', "'%[*]'", path]], function (s, error) {
            reply (rs, 400, {error: 'Invalid image: ' + error.toString ()});
         }],
         function (s) {
            if (! s.metadata || ! s.metadata.stdout) return reply (rs, 400, {error: 'Invalid image'});
            var metadata = s.metadata.stdout.split ('\n');
            s.dates = dale.obj (metadata, function (line) {
               if (line.match (/date/i)) return [line.split ('=') [0], line.split ('=') [1]];
            });
            s.orientation = dale.fil (metadata, undefined, function (line) {
               if (line.match (/orientation/i)) return line;
            });
            s.next ();
         },
         [H.mkdirif, Path.dirname (newpath)],
         [k, 'cp', path, newpath],
         [a.make (fs.unlink), path],
         [H.resizeif, newpath, 200],
         [H.resizeif, newpath, 900],
         [H.s3put, rq.user.username, newpath, pic.id],
         // Delete original image from disk.
         // ! ENV ? [] : [a.set, false, [a.make (fs.unlink), newpath]],
         function (s) {
            var multi = redis.multi ();

            pic.dimw = s.size.w;
            pic.dimh = s.size.h;
            pic.by   = s.last.ContentLength;
            pic.hash = s.hash;

            s.dates ['upload:date'] = lastModified;
            pic.dates = JSON.stringify (s.dates);
            if (s.orientation.length > 0) pic.orientation = JSON.stringify (s.orientation);

            pic.date = dale.fil (s.dates, undefined, function (v, k) {
               if (! v) return;
               // Ignore GPS date stamp
               if (k.match (/gps/i)) return;
               var d = new Date (v);
               if (d.getTime ()) return d.getTime ();
               d = new Date (v.replace (':', '-').replace (':', '-').replace (' ', 'T') + '.000Z');
               if (d.getTime ()) return d.getTime ();
            }).sort (function (a, b) {
               return a - b;
            });

            pic.date = pic.date [0];

            if (s.t200) pic.t200  = s.t200;
            if (s.t900) pic.t900  = s.t900;
            if (s.t200) pic.by200 = s.t200size;
            if (s.t900) pic.by900 = s.t900size;
            if (s.t200) multi.set ('thu:' + pic.t200, pic.id);
            if (s.t900) multi.set ('thu:' + pic.t900, pic.id);

            multi.sadd ('upic:'  + rq.user.username, pic.hash);
            multi.srem ('upicd:' + rq.user.username, pic.hash);
            multi.sadd ('tag:' + rq.user.username + ':all', pic.id);

            dale.go (tags.concat (new Date (pic.date).getUTCFullYear ()), function (tag) {
               multi.sadd ('pict:' + pic.id,                       tag);
               multi.sadd ('tags:' + rq.user.username,             tag);;
               multi.sadd ('tag:'  + rq.user.username + ':' + tag, pic.id);
            });

            if (tags.length === 0) multi.sadd ('tag:' + rq.user.username + ':untagged', pic.id);

            multi.hmset ('pic:' + pic.id, pic);
            mexec (s, multi);
         },
         [H.log, rq.user.username, {a: 'upl', uid: rq.data.fields.uid, id: pic.id, tags: tags.length ? tags : undefined}],
         [reply, rs, 200],
      ]);
   }],

   // *** DELETE PICS ***

   ['delete', 'pic/:id', function (rq, rs) {
      a.stop ([
         [H.deletepic, rq.data.params.id, rq.user.username],
         [reply, rs, 200],
      ], function (s, error) {
         error === 'nf' ? reply (rs, 404) : reply (rs, 500, {error: error});
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
      dale.go (b.ids, function (id) {
         seen [id] = true;
         multi.hgetall ('pic:' + id);
      });

      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      astop (rs, [
         [mexec, multi],
         function (s) {
            var multi = redis.multi ();

            if (dale.stopNot (s.last, undefined, function (pic) {
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

            mexec (s, multi);
         },
         [H.log, rq.user.username, {a: 'rot', id: b.ids, deg: b.deg}],
         [reply, rs, 200],
      ]);
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
      if (H.isyear (b.tag)) return reply (rs, 400, {error: 'tag'});

      var multi = redis.multi (), seen = {};
      dale.go (b.ids, function (id) {
         seen [id] = true;
         multi.hget     ('pic:'  + id, 'owner');
         multi.smembers ('pict:' + id);
      });

      if (dale.keys (seen).length < b.ids.length) return reply (rs, 400, {error: 'repeated'});

      astop (rs, [
         [mexec, multi],
         function (s) {
            var multi = redis.multi ();

            if (dale.stopNot (s.last, undefined, function (owner, k) {
               if (k % 2 !== 0) return;
               if (owner !== rq.user.username) {
                  reply (rs, 404);
                  return true;
               }

               var id = b.ids [k / 2];

               var extags = dale.acc (s.last [k + 1], 0, function (a, b) {
                  return a + (H.isyear (b) ? 0 : 1);
               });

               if (b.del) {
                  if (s.last [k + 1].indexOf (b.tag) === -1) return;
                  multi.srem ('pict:' + id, b.tag);
                  multi.srem ('tag:'  + rq.user.username + ':' + b.tag, id);
                  if (extags === 1) multi.sadd ('tag:' + rq.user.username + ':untagged', id);
               }

               else {
                  if (s.last [k + 1].indexOf (b.tag) !== -1) return;
                  multi.sadd ('pict:' + id, b.tag);
                  multi.sadd ('tags:' + rq.user.username, b.tag);
                  multi.sadd ('tag:'  + rq.user.username + ':' + b.tag, id);

                  multi.srem ('tag:'  + rq.user.username + ':untagged', id);
               }
            })) return;

            mexec (s, multi);
         },
         [H.log, rq.user.username, {a: 'tag', tag: b.tag, d: b.del ? true : undefined, ids: b.ids}],
         [reply, rs, 200],
      ]);
   }],

   ['get', 'tags', function (rq, rs) {
      astop (rs, [
         [a.set, 'tags', [Redis, 'smembers', 'tags:' + rq.user.username]],
         function (s) {
            var multi = redis.multi ();
            s.tags = ['all', 'untagged'].concat (s.tags);
            dale.go (s.tags, function (tag) {
               multi.scard ('tag:' + rq.user.username + ':' + tag);
            });
            mexec (s, multi);
         },
         function (s) {
            var multi = redis.multi ();
            s.output = dale.obj (s.last, function (card, k) {
               if (card || s.tags [k] === 'all') return [s.tags [k], card];
               else {
                  // We cleanup tags from tags:USERID if the tag set is empty.
                  if (k >= 2) multi.srem ('tags:' + rq.user.username, s.tags [k]);
               }
            });
            mexec (s, multi);
         },
         [a.get, reply, rs, 200, '@output'],
      ]);
   }],

   // *** SEARCH ***

   ['post', 'query', function (rq, rs) {

      var b = rq.body;

      if (stop (rs, [
         ['keys of body', dale.keys (b), ['tags', 'mindate', 'maxdate', 'sort', 'from', 'to'], 'eachOf', teishi.test.equal],
         ['body.tags',    b.tags, 'array'],
         ['body.tags',    b.tags, 'string', 'each'],
         ['body.mindate', b.mindate,  ['undefined', 'integer'], 'oneOf'],
         ['body.maxdate', b.maxdate,  ['undefined', 'integer'], 'oneOf'],
         ['body.sort',    b.sort, ['newest', 'oldest', 'upload'], 'oneOf', teishi.test.equal],
         ['body.from',    b.from, 'integer'],
         ['body.to',      b.to,   'integer'],
         ['body.from',    b.from, {min: 1},      teishi.test.range],
         ['body.to',      b.to,   {min: b.from}, teishi.test.range],
      ])) return;

      if (b.tags.indexOf ('all') !== -1) return reply (rs, 400, {error: 'all'});

      var ytags = [];

      //{tag1: [USERID], ...}
      var tags = dale.obj (b.tags, function (tag) {
         if (! H.isyear (tag)) return [tag, [rq.user.username]];
         ytags.push (tag);
      });

      astop (rs, [
         [Redis, 'smembers', 'shm:' + rq.user.username],
         function (s) {
            var allmode = dale.keys (tags).length === 0 && ytags.length === 0;

            if (allmode) tags.all = [rq.user.username];

            dale.go (s.last, function (sharedTag) {
               var tag = sharedTag.replace (/[^:]+:/, '');
               if (allmode || tags [tag]) {
                  if (! tags [tag]) tags [tag] = [];
                  // {tag1: [USERID, USERID2], ...}
                  tags [tag].push (sharedTag.match (/[^:]+/) [0]);
               }
            });

            // for each tag (or all tags if all is there) list users per tag that share it with you. run a sunion per tag, also including your own username. then do a sinter of the whole thing.
            var multi = redis.multi (), qid = 'query:' + uuid ();
            if (ytags.length) multi.sunionstore (qid, dale.go (ytags, function (ytag) {
               return 'tag:' + rq.user.username + ':' + ytag;
            }));

            dale.go (tags, function (users, tag) {
               multi.sunionstore (qid + ':' + tag, dale.go (users, function (user) {
                  return 'tag:' + user + ':' + tag;
               }));
            });

            multi [allmode ? 'sunion' : 'sinter'] (dale.go (tags, function (users, tag) {
               return qid + ':' + tag;
            }).concat (ytags.length ? qid : []));

            if (ytags.length) multi.del (qid);
            dale.go (tags, function (users, tag) {
               multi.del (qid + ':' + tag);
            });

            mexec (s, multi);
         },
         function (s) {
            var pics = s.last [dale.keys (tags).length + (ytags.length ? 1 : 0)];
            var multi = redis.multi ();
            dale.go (pics, function (pic) {
               multi.hgetall ('pic:' + pic);
            });
            mexec (s, multi);
         },
         function (s) {
            var pics = s.last;
            if (pics.length === 0) return reply (rs, 200, {total: 0, pics: []});
            var output = {pics: []};

            var mindate = b.mindate || 0, maxdate = b.maxdate || new Date ('2101-01-01T00:00:00Z').getTime ();

            dale.go (pics, function (pic) {
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

            var multi = redis.multi ();
            dale.go (output.pics, function (pic) {
               multi.smembers ('pict:' + pic.id);
            });
            s.output = output;
            mexec (s, multi);
         },
         function (s) {
            dale.go (s.output.pics, function (pic, k) {
               s.output.pics [k] = {id: pic.id, t200: pic.t200, t900: pic.t900, owner: pic.owner, name: pic.name, tags: s.last [k].sort (), date: parseInt (pic.date), dateup: parseInt (pic.dateup), dimh: parseInt (pic.dimh), dimw: parseInt (pic.dimw), deg: parseInt (pic.deg) || undefined};
            });
            reply (rs, 200, s.output);
         },
      ]);
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
      if (H.isyear (b.tag))                           return reply (rs, 400, {error: 'tag'});
      if (b.who === rq.user.username)                 return reply (rs, 400, {error: 'self'});

      astop (rs, [
         [a.cond, [Redis, 'exists', 'users:' + b.who], {'0': [reply, rs, 404]}],
         function (s) {
            var multi = redis.multi ();

            multi [b.del ? 'srem' : 'sadd'] ('sho:' + rq.user.username, b.who            + ':' + b.tag);
            multi [b.del ? 'srem' : 'sadd'] ('shm:' + b.who,            rq.user.username + ':' + b.tag);
            mexec (s, multi);
         },
         [H.log, rq.user.username, {a: 'sha', tag: b.tag, d: b.del ? true : undefined, u: b.who}],
         [reply, rs, 200],
      ]);
   }],

   ['get', 'share', function (rq, rs) {
      var multi = redis.multi ();
      multi.smembers ('sho:' + rq.user.username);
      multi.smembers ('shm:' + rq.user.username);
      astop (rs, [
         [mexec, multi],
         function (s) {
            reply (rs, 200, {
               sho: dale.go (s.last [0], function (i) {
                  return [i.split (':') [0], i.split (':').slice (1).join (':')];
               }),
               shm: dale.go (s.last [1], function (i) {
                  return [i.split (':') [0], i.split (':').slice (1).join (':')];
               }),
            });
         }
      ]);
   }],

   // *** ACCOUNT ***

   ['get', 'account', function (rq, rs) {
      astop (rs, [
         [Redis, 'lrange', 'ulog:' + rq.user.username, 0, -1],
         function (s) {
            reply (rs, 200, {
               username: rq.user.username,
               email:    rq.user.email,
               type:     rq.user.type,
               created:  parseInt (rq.user.created),
               used:     [parseInt (rq.user ['s3:buse']) || 0, parseInt (CONFIG.storelimit [rq.user.type || 'tier1']) || 0],
               logs:     dale.go (s.last, JSON.parse),
            });
         }
      ]);
   }],

   // *** ADMIN AREA ***

   // *** ADMIN: INVITES ***

   ['get', 'admin/invites', function (rq, rs) {
      astop (rs, [
         [Redis, 'hgetall', 'invites'],
         function (s) {
            reply (rs, 200, ! s.last ? [] : dale.obj (s.last, function (value, key) {
               return [key, teishi.parse (value)];
            }));
         },
      ]);
   }],

   ['delete', 'admin/invites/:email', function (rq, rs) {
      astop (rs, [
         [Redis, 'hdel', 'invites', rq.data.params.email],
         [reply, rs, 200],
      ]);
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

      astop (rs, [
         [a.set, 'user', [Redis, 'hget', 'emails', b.email]],
         function (s) {
            if (s.user) return reply (rs, 400, {error: 'User already exists'});
            s.next ();
         },
         [a.set, 'token', [a.make (require ('bcryptjs').genSalt), 20]],
         function (s) {
            Redis (s, 'hset', 'invites', b.email, JSON.stringify ({firstName: b.firstName, token: s.token, sent: Date.now ()}));
         },
         ENV ? [] : [a.get, reply, rs, 200, {token: '@token'}],
         function (s) {
            sendmail (s, {
               to1:     b.firstName,
               to2:     b.email,
               subject: CONFIG.etemplates.invite.subject,
               message: CONFIG.etemplates.invite.message (b.firstName, s.token)
            });
         },
         [reply, rs, 200],
      ]);
   }],

   // *** ADMIN: STATS (ALSO PUBLIC) ***

   ['get', 'admin/stats', function (rq, rs) {
      astop (rs, [
         [Redis, 'get', 'cachestats'],
         function (s) {
            if (s.last !== null) return reply (rs, 200, JSON.parse (s.last));
            s.next ();
         },
         [a.set, 'keys', [redis.keyscan, 'st*']],
         function (s) {
            var multi = redis.multi ();
            dale.go (s.keys, function (key) {
               multi [key.match (/^sti/) ? 'get' : 'pfcount'] (key);
            });
            mexec (s, multi);
         },
         function (s) {
            s.hits = dale.fil (s.last, undefined, function (item, k) {
               if (s.keys [k] === 'stp') return;
               return [s.keys [k].slice (4), parseInt (item)];
            });
            s.next ();
         },
         [redis.keyscan, 'users:*'],
         function (s) {
            var multi = redis.multi ();
            dale.go (s.last, function (key) {
               multi.hget  (key, 's3:buse');
               multi.scard ('tag:' + key.replace ('users:', '') + ':all');
            });
            mexec (s, multi);
         },
         function (s) {
            var output = {hits: s.hits, users: s.last.length / 2, pics: 0, bytes: 0};
            dale.go (s.last, function (v, k) {
               if (k % 2 === 0) output.bytes += parseInt (v);
               else             output.pics  += v;
            });
            s.output = output;
            Redis (s, 'setex', 'cachestats', 60, JSON.stringify (output));
         },
         [a.get, reply, rs, 200, '@output'],
      ]);
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
      if (['/favicon.ico', '/assets/lib/normalize.min.css.map'].indexOf (rs.log.url) === -1) notify (a.creat (), {type: 'response error', code: rs.log.code, method: rs.log.method, url: rs.log.url, ip: rs.log.origin, ua: rs.log.requestHeaders ['user-agent'], headers: rs.log.requestHeaders, body: rs.log.requestBody, rbody: teishi.parse (rs.log.responseBody) || rs.log.responseBody});
   }

   if (rs.log.code === 200 || rs.log.code === 304) {
      if (rs.log.method === 'get'  && rs.log.url.match (/^\/(pic|thumb)/)) H.stat (a.creat (), 'd');
      if (rs.log.method === 'post' && rs.log.url.match (/^\/pic/))         H.stat (a.creat (), 'u');
      if (rs.log.method === 'post' && rs.log.url.match (/^\/tag/))         H.stat (a.creat (), 't');
   }

   H.stat (a.creat (), 'l', false, Date.now () - rs.log.startTime);
   H.stat (a.creat (), 'h' + rs.log.code);

   cicek.Apres (rs);
}

cicek.log = function (message) {
   if (type (message) !== 'array' || message [0] !== 'error') return;
   if (message [1] === 'Invalid signature in cookie') return;
   notify (a.creat (), {
      type:    'server error',
      subtype: message [1],
      from:    cicek.isMaster ? 'master' : 'worker' + require ('cluster').worker.id,
      error:   message [2]
   });
}

cicek.cluster ();

cicek.listen ({port: CONFIG.port}, routes);

if (cicek.isMaster) setTimeout (function () {
   notify (a.creat (), {type: 'server start'});
}, 1500);

// *** REDIS ERROR HANDLER ***

redis.on ('error', function (error) {
   if (cicek.isMaster) notify (a.creat (), {type: 'redis error', error: error});
});

// *** DB BACKUPS ***

if (cicek.isMaster && ENV) setInterval (function () {
   var s3 = new (require ('aws-sdk')).S3 ({
      apiVersion:  '2006-03-01',
      sslEnabled:  true,
      credentials: {accessKeyId: SECRET.s3.accessKeyId, secretAccessKey: SECRET.s3.secretAccessKey},
      params:      {Bucket:      SECRET.s3.db.bucketName},
   });

   a.stop ([
      [a.make (H.encrypt), CONFIG.backup.path],
      [a.get, a.make (s3.upload, s3), {Key: new Date ().toUTCString () + '-dump.rdb', Body: '@last'}],
   ], function (s, error) {
      a.seq ([
         [notify, {type: 'backup error', error: error}],
         [a.fork, [SECRET.admins [0]], function (v) {
            return [sendmail, {
               from1:   'ac;pic backup',
               to1:     'ac;pic admin',
               to2:     SECRET.admins [0],
               subject: 'Backup failed!',
               message: ['pre', error.toString ()],
            }];
         }, {max: 5}],
      ]);
   });
}, CONFIG.backup.frequency * 60 * 1000);

// *** CHECK OS RESOURCES ***

if (cicek.isMaster) setInterval (function () {
   a.seq ([
      [a.fork, ['mpstat', 'free'], function (v) {return [k, v]}],
      function (s) {
         if (s.error) return notify (s, {type: 'resources check error', error: s.error});
         var cpu  = s.last [0].stdout;
         cpu = cpu.split ('\n') [3].split (/\s+/);
         cpu = Math.round (parseFloat (cpu [cpu.length - 1].replace (',', '.')));

         var free = s.last [1].stdout.split ('\n') [1].split (/\s+/);
         free = Math.round (100 * parseInt (free [6]) / parseInt (free [1]));

         a.seq (s, [
            cpu  < 20 ? [notify, {type: 'high CPU usage', usage: (100 - cpu)  / 100}] : [],
            free < 20 ? [notify, {type: 'high RAM usage', usage: (100 - free) / 100}] : [],
         ]);
      },
   ]);
}, 1000 * 60);

// *** CONVERT PFCOUNT TO STRING (STATS) ***

if (cicek.isMaster) setInterval (function () {
   a.stop ([
      [a.set, 'pfs', [Redis, 'smembers', 'stp']],
      function (s) {
         var multi = redis.multi ();
         dale.go (s.pfs, function (pf) {
            multi.pfcount ('stp:' + pf);
         });
         mexec (s, multi);
      },
      function (s) {
         var d = Date.now (), multi = redis.multi ();
         dale.go (s.pfs, function (pf, k) {
            var duration = pf.split (':') [0] === 'a' ? 1000 * 60 * 10 : 1000 * 60 * 60 * 24;
            if (d - parseInt (pf.split (':') [1] + '00000') > duration) {
               multi.srem ('stp', pf);
               multi.set  ('stp:' + pf, s.last [k]);
            }
         });
         mexec (s, multi);
      },
   ], function (s, error) {
      notify (s, {type: 'stat pfcount -> counter error', error: error});
   });
}, 20 * 1000);

// *** BOOTSTRAP FIRST ADMIN USER ***

if (cicek.isMaster && ENV) setTimeout (function () {
   a.stop ([
      [Redis, 'hget', 'invites', SECRET.admins [0]],
      function (s) {
         if (s.last) return;
         a.make (hitit.one) (s, {}, {timeout: 15, port: CONFIG.port, method: 'post', path: 'admin/invites', body: {email: SECRET.admins [0], firstName: 'admin'}});
      },
      [a.log, 'Bootstrap invite OK.'],
   ], function (s, error) {
      notify (s, {type: 'bootstrap invite error', error: error});
   });
}, 3000);

// *** CHECK CONSISTENCY BETWEEN DB, FS AND S3 (ENABLED ON DEV ONLY) ***

if (cicek.isMaster && ENV === 'dev') a.stop ([
   [a.set, 'uploaded', [H.s3list, '']],
   [a.set, 'dirs', [a.make (fs.readdir), CONFIG.basepath]],
   [a.set, 'files', [a.get, a.fork, '@dirs', function (dir) {
      return [
         [a.make (fs.readdir), Path.join (CONFIG.basepath, dir)],
         function (s) {
            s.next (dale.go (s.last, function (file) {
               return Path.join (dir, file);
            }));
         }
      ];
   }, {max: 5}]],
   [a.set, 'picids', [redis.keyscan, 'pic:*']],
   function (s) {
      var multi = redis.multi ();
      dale.go (s.picids, function (picid) {
         multi.hgetall (picid);
      });
      mexec (s, multi);
   },
   function (s) {
      s.thumbs = {};
      s.pics   = {};
      dale.go (s.last, function (pic) {
         s.pics [pic.id] = pic;
         if (pic.t200) s.thumbs [pic.t200] = {owner: pic.owner};
         if (pic.t900) s.thumbs [pic.t900] = {owner: pic.owner};
      });
      s.next ();
   },
   function (s) {
      var files = {};
      dale.go (s.files, function (v) {
         dale.go (v, function (v2) {
            files [v2] = true;
         });
      });
      s.files = files;
      s.missingsthree = [];
      s.uploaded = dale.obj (s.uploaded, function (path) {
         return [path, true];
      });
      var extraneous = teishi.copy (s.uploaded);
      dale.go (s.pics, function (pic, k) {
         var path = Path.join (H.hash (pic.owner), k.replace ('pic:', ''));
         if (! s.uploaded [path]) s.missingsthree.push (path);
         delete extraneous [path];
      });
      if (dale.keys (extraneous).length) notify (a.creat (), {type: 'extraneous files in s3 error', n: dale.keys (extraneous).length, files: extraneous});
      if (s.missingsthree.length)        notify (a.creat (), {type: 'missing pics in s3 error',     n: s.missingsthree.length,            files: s.missingsthree});
      // Delete extraneous elements from S3 (including thumbnails)
      H.s3del (s, null, dale.keys (extraneous), null);
   },
   // Upload missing pics to S3
   [a.get, a.fork, '@missingsthree', function (key) {
      return [H.s3put, null, Path.join (CONFIG.basepath, key), key];
   }, {max: 5}],
   function (s) {
      if (s.missingsthree.length) notify (a.creat (), {type: 'uploaded missing pics to s3', n: s.missingsthree.length});
      s.missingfs = [];
      s.extraneous = teishi.copy (s.files);
      dale.go (s.thumbs, function (thumb, k) {
         var path = Path.join (H.hash (thumb.owner), k);
         if (! s.files [path]) s.missingfs.push (path);
         delete s.extraneous [path];
      });
      dale.go (s.pics, function (pic, k) {
         var path = Path.join (H.hash (pic.owner), k.replace ('pic:', ''));
         // Uncomment to keep original pictures in disk.
         // if (! s.files [path]) s.missingfs.push (path);
         // delete s.extraneous [path];
      });
      if (dale.keys (s.extraneous).length) notify (a.creat (), {type: 'extraneous files in FS error', n: dale.keys (s.extraneous).length, files: s.extraneous});
      if (s.missingfs.length)              notify (a.creat (), {type: 'missing pics in FS error',     n: s.missingfs.length,            files: s.missingfs});
      s.next ();
   },
   // Download missing files from S3
   [a.get, a.fork, '@missingfs', function (path) {
      return [
         [a.log, 'getting ' + path],
         [a.make (s3.getObject, s3), {Key: path}],
         function (s) {
            s.next (H.decrypt (s.last.Body));
         },
         [a.log, 'writing ' + path],
         function (s) {
            a.make (fs.writeFile) (s, Path.join (CONFIG.basepath, path), s.last, 'binary');
         }
      ];
   }, {max: 5}],
   // Delete extraneous files from FS
   [a.get, a.fork, '@extraneous', function (v, k) {
      return [a.make (fs.unlink), Path.join (CONFIG.basepath, k)];
   }, {max: 5}],
   function (s) {
      if (dale.keys (s.extraneous).length) notify (a.creat (), {type: 'deleted extraneous files from FS', n: dale.keys (s.extraneous).length});
      notify (s, {type: 'All DB/FS/S3 file consistency checks performed.'});
   },
], function (s, error) {
   notify (s, {type: 's3 consistency check error', error: error});
});

// *** CHECK STORED SIZES ***

if (cicek.isMaster && ENV) a.stop ([
   [a.set, 'keys', [redis.keyscan, '*']],
   function (s) {
      var multi = redis.multi ();
      dale.go (s.keys, function (key) {
         if (key.match (/^(pic|users):/)) multi.hgetall (key);
      });
      mexec (s, multi);
   },
   function (s) {
      var pics = {}, users = {}, count = {};
      dale.go (s.last, function (key) {
         if (key.owner) pics [key.id] = key;
         if (key.username) {
            key ['s3:buse'] = parseInt (key ['s3:buse'] || '0');
            users [key.username] = key;
         }
      });
      dale.go (pics, function (pic) {
         if (! count [pic.owner]) count [pic.owner] = 0;
         count [pic.owner] += parseInt (pic.by);
      });
      var multi = redis.multi ();
      dale.go (users, function (user) {
         if (user ['s3:buse'] === count [user.username]) return;
         if (count [user.username] === undefined && user ['s3:buse'] === 0) return;
         notify (a.creat (), {type: 's3:buse mismatch error', u: user.username, was: user ['s3:buse'], actual: count [user.username]});
         multi.hset ('users:' + user.username, 's3:buse', count [user.username]);
      });
      mexec (s, multi);
   },
], function (s, error) {
   notify (s, {type: 'check stored size error', error: error});
});
