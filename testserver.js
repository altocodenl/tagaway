var CONFIG = require ('./config.js');
var dale   = require ('dale');
var teishi = require ('teishi');
var h      = require ('hitit');
var a      = require ('./assets/astack.js');
var fs     = require ('fs');
var clog   = teishi.clog, type = teishi.type, eq = teishi.eq;

var skipS3, skipAuth;
dale.go (process.argv, function (v) {
   if (v === 'skipS3') skipS3 = true;
   if (v === 'skipAuth') skipAuth = true;
});

var userPrefix = 'user' + Math.random ();

var U = [
   {username: '   ' + userPrefix + '  \t1', password: Math.random () + '@', timezone: new Date ().getTimezoneOffset ()},
   {username: userPrefix + '2',             password: Math.random () + '@', timezone: new Date ().getTimezoneOffset ()},
];

var PIVS = 'test/';

var H = {};

H.trim = function (s) {
   return s.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
}

H.getDate = function (d) {
   // We compensate for the local offset. The server must be in UTC to parse dates properly.
   var date = new Date (d);
   if (date.getTime ()) return date.getTime ();
   date = new Date (d.replace (':', '-').replace (':', '-'));
   if (date.getTime ()) return date.getTime ();
}

var k = function (s) {

   var command = [].slice.call (arguments, 1);

   var output = {stdout: '', stderr: '', command: command};

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

var ttester = function (label, method, Path, headers, list, allErrors) {
   var apres = allErrors ? function (s, rq, rs) {
      return rs.code >= 400;
   } : undefined;

   var types = {
      string:    function () {return Math.random () + ''},
      integer:   function () {return Math.round (Math.random () + Math.random ())},
      float:     function () {return Math.random ()},
      nan:       function () {return NaN},
      infinity:  function () {return Infinity},
      object:    function () {return {}},
      array:     function () {return []},
      null:      function () {return null},
      boolean:   function () {return Math.random > 0.5},
      undefined: function () {},
   }

   var tests = {}, longest = 0;

   dale.go (list, function (v) {
      var path = v [0], allowed = v [1];
      if (type (path) !== 'array') path = [path];
      if (path.length > longest) longest = path.length;
      dale.go (dale.times (path.length), function (k) {
         if (k < path.length) {
            return tests [JSON.stringify (path.slice (0, k))] = [type (path [k]) === 'integer' ? 'array' : 'object'];
         }
         tests [JSON.stringify (path)] = type (allowed) === 'array' ? allowed : [allowed];
      });
   });

   var output = [];
   var body = type (JSON.parse (dale.keys (tests) [0]) [0]) === 'string' ? {} : [];

   dale.go (dale.times (longest), function (length) {
      dale.go (tests, function (allowed, path) {
         path = JSON.parse (path);
         if (path.length !== length) return;
         if (output.length === 0) {
            // base object test
            dale.go (types, function (tfun, t) {
               if (t !== type (body)) output.push ([label + ' test type #' + (output.length + 1) + ' base - ' + t, method, Path, headers, tfun (), allErrors ? '*' : 400, apres]);
            });
         }
         var ref = body;
         dale.go (dale.times (path.length - 1, 0), function (k) {
            if (! ref [path [k]]) ref [path [k]] = type (path [k + 1]) === 'integer' ? [] : {};
            ref = ref [path [k]];
         });
         dale.go (types, function (tfun, t) {
            ref [path [path.length - 1]] = tfun ();
            if (allowed.indexOf (t) === -1) output.push ([label + ' test type #' + (output.length + 1) + ' ' + path.join ('.') + ' - ' + t, method, Path, headers, teishi.copy (body), allErrors ? '*' : 400, apres]);
         });
         ref [path [path.length - 1]] = types [allowed [0]] ();
      });
   });
   var ebody = teishi.copy (body);
   ebody [type (ebody) === 'object' ? types.string () : types.float ()] = types.string ();
   output.push ([label + ' test type #' + (output.length + 1) + ' base (random key)', method, Path, headers, ebody, allErrors ? '*' : 400, apres]);

   return output;
}

var intro = [
   ['get public stats at the beginning', 'get', 'stats', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {byfs: 0, bys3: 0, pics: 0, vids: 0, t200: 0, t900: 0, users: 0})) return clog ('Invalid public stats.');
      return true;
   }],
   skipAuth ? [] : [
      ['submit client error, invalid 1', 'post', 'error', {}, '', 400],
      ['submit client error without being logged in #2', 'post', 'error', {}, {error: 'error'}, 200],
      ['login with no credentials', 'post', 'auth/login', {}, {}, 400],
      ['login with invalid credentials', 'post', 'auth/login', {}, [], 400],
      ttester ('login', 'post', 'auth/signup', {}, [
         ['username', 'string'],
         ['password', 'string'],
         ['email', 'string'],
         ['token', 'string'],
      ]),
      ttester ('login', 'post', 'auth/login', {}, [
         ['username', 'string'],
         ['password', 'string'],
         ['timezone',       'integer'],
      ]),
      ttester ('reset', 'post', 'auth/reset', {}, [
         ['username', 'string'],
         ['password', 'string'],
         ['token',    'string'],
      ]),
      ttester ('create invite for user', 'post', 'admin/invites', {}, [
         ['email', 'string'],
         ['firstName', 'string'],
      ]),
      ['create invite for user, invalid email', 'post', 'admin/invites', {}, {email: 'che'}, 400],
      ['create invite for user, no firstName', 'post', 'admin/invites', {}, {email: 'a@a.com'}, 400],
   ],
   ['create invite for user', 'post', 'admin/invites', {}, {firstName: 'a', email: 'a@a.com  '}, 200, function (s, rq, rs) {
      s.itoken1 = rs.body.token;
      return true;
   }],
   ['create invite for user', 'post', 'admin/invites', {}, {firstName: 'b', email: 'b@b.com  '}, 200, function (s, rq, rs) {
      s.itoken2 = rs.body.token;
      return true;
   }],
   skipAuth ? [] : [
      ['signup for the first time with invalid username', 'post', 'auth/signup', {}, function (s) {
         return {username: 'a@a.com', password: U [0].password, token: s.itoken1, email: 'a@a.com'};
      }, 400],
      ['signup for the first time with invalid email', 'post', 'auth/signup', {}, function (s) {
         return {username: U [0].username, password: U [0].password, token: s.itoken1, email: 'aa.com'};
      }, 400],
      ['signup for the first time with invalid token', 'post', 'auth/signup', {}, function (s) {
         return {username: U [0].username, password: U [0].password, token: s.itoken1 + 'a', email: 'a@a.com'};
      }, 403, function (s, rq, rs) {
         if (! eq (rs.body, {error: 'token'})) return clog ('Invalid body.');
         return true;
      }],
   ],
   ['signup for the first time', 'post', 'auth/signup', {}, function (s) {
      return {username: U [0].username, password: U [0].password, token: s.itoken1, email: 'a@a.com'};
   }, 200, function (s, rq, rs) {
      if (! rs.body.token) return clog ('No token returned after signup!');
      s.vtoken1 = rs.body.token;
      return true;
   }],
   skipAuth ? ['verify user', 'get', function (s) {return 'auth/verify/' + s.vtoken1}, {}, '', 302] : [
      ['login with invalid credentials #1', 'post', 'auth/login', {}, {username: U [0].username, password: 'foo', timezone: new Date ().getTimezoneOffset ()}, 403, function (s, rq, rs) {
         if (! eq (rs.body, {error: 'auth'})) return clog ('Invalid payload sent, expecting {error: "auth"}');
         return true;
      }],
      ['login with invalid credentials #2', 'post', 'auth/login', {}, {username: 'bar', password: 'foo', timezone: new Date ().getTimezoneOffset ()}, 403, function (s, rq, rs) {
         if (! eq (rs.body, {error: 'auth'})) return clog ('Invalid payload sent, expecting {error: "auth"}');
         return true;
      }],
      ['login with valid credentials before verification', 'post', 'auth/login', {}, {username: U [0].username, password: U [0].password, timezone: new Date ().getTimezoneOffset ()}, 403, function (s, rq, rs) {
         if (! eq (rs.body, {error: 'verify'})) return clog ('Invalid payload sent, expecting {error: "verify"}');
         return true;
      }],
      ['try to signup with existing username', 'post', 'auth/signup', {}, function (s) {
         return {username: U [0].username, password: U [1].password, token: s.itoken2, email: 'b@b.com'};
      }, 403, function (s, rq, rs) {
         if (! eq (rs.body, {error: 'username'})) return clog ('Invalid payload received.');
         return true;
      }],
      ['try to signup with existing email', 'post', 'auth/signup', {}, function (s) {
         return {username: U [1].username, password: U [1].password, token: s.itoken2, email: 'a@a.com'};
      }, 403, function (s, rq, rs) {
         if (! eq (rs.body, {error: 'token'})) return clog ('Invalid payload received.');
         return true;
      }],
      ['verify user', 'get', function (s) {return 'auth/verify/' + s.vtoken1}, {}, '', 302],
      ttester ('recover pass', 'post', function (s) {return 'auth/verify/' + s.vtoken1}, {}, [
         ['username', 'string'],
      ], true),
      ['recover pass with invalid username', 'post', 'auth/recover', {}, {username: 'foo'}, 403],
      ['recover pass', 'post', 'auth/recover', {}, {username: 'a@a.com\t'}, 200],
      ['recover pass', 'post', 'auth/recover', {}, {username: U [0].username + '\t  \t'}, 200, function (s, rq, rs) {
         s.rtoken = rs.body.token;
         U [0].password = 'foobar';
         return true;
      }],
      ['reset pass with invalid token', 'post', 'auth/reset', {}, function (s) {return {username: H.trim (U [0].username), password: U [0].password, token: s.rtoken + '0'}}, 403],
      ['reset pass with invalid password', 'post', 'auth/reset', {}, function (s) {return {username: H.trim (U [0].username), password: 'abc', token: s.rtoken}}, 400],
      ['reset pass', 'post', 'auth/reset', {}, function (s) {return {username: H.trim (U [0].username), password: U [0].password, token: s.rtoken}}, 200],
      ['try to signup with existing username after verification', 'post', 'auth/signup', {}, function (s) {
         return {username: U [0].username, password: U [1].password, token: s.itoken2, email: 'b@b.com'};
      }, 403, function (s, rq, rs) {
         if (! eq (rs.body, {error: 'username'})) return clog ('Invalid payload received.');
         return true;
      }],
      ['try to signup with existing email after verification', 'post', 'auth/signup', {}, function (s) {
         return {username: U [1].username, password: U [0].password, token: s.itoken2, email: 'a@a.com'};
      }, 403, function (s, rq, rs) {
         if (! eq (rs.body, {error: 'token'})) return clog ('Invalid payload received.');
         return true;
      }],
      ['get CSRF token without being logged in', 'get', 'csrf', {}, '', 403],
      ['login with valid credentials after verification (with email)', 'post', 'auth/login', {}, U [0], 200],
      ['login with valid credentials after verification (with email)', 'post', 'auth/login', {}, function () {return {username: ' \t  a@a.com', password: U [0].password, timezone: new Date ().getTimezoneOffset ()}}, 200],
      ['login with valid credentials after verification (with email)', 'post', 'auth/login', {}, function () {return {username: 'A@A.com  ', password: U [0].password, timezone: new Date ().getTimezoneOffset ()}}, 200],
      ['login with valid credentials after verification (with email)', 'post', 'auth/login', {}, function () {return {username: U [0].username.toUpperCase (), password: U [0].password, timezone: new Date ().getTimezoneOffset ()}}, 200, function (s, rq, rs) {
         if (! rs.headers ['set-cookie'] || ! rs.headers ['set-cookie'] [0] || rs.headers ['set-cookie'] [0].length <= 5) return clog ('Invalid cookie.');
         s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
         if (! rs.body || ! rs.body.csrf) return clog ('Invalid CSRF token');
         s.csrf = rs.body.csrf;
         return s.headers.cookie !== undefined && rs.headers ['set-cookie'] [0].match ('HttpOnly');
      }],
      ['logout', 'post', 'auth/logout', {}, {}, 200],
      ['login again', 'post', 'auth/login', {}, function () {return {username: U [0].username.toUpperCase (), password: U [0].password, timezone: new Date ().getTimezoneOffset ()}}, 200, function (s, rq, rs) {
         s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
         s.csrf = rs.body.csrf;
         return s.headers.cookie !== undefined && rs.headers ['set-cookie'] [0].match ('HttpOnly');
      }],
      ['get CSRF token after being logged in', 'get', 'csrf', {}, '', 200, function (s, rq, rs) {
         if (! eq (rs.body, {csrf: s.csrf})) return clog ('Invalid payload');
         return true;
      }],
      ttester ('change password', 'post', 'auth/changePassword', {}, [
         ['old', 'string'],
         ['new', 'string'],
      ]),
      ['change password (invalid new password #1)', 'post', 'auth/changePassword', {}, {old: U [0].password, 'new': '12345'}, 400],
      ['change password (invalid new password #2)', 'post', 'auth/changePassword', {}, {old: U [0].password, 'new': 12345}, 400],
      ['change password (invalid old password)', 'post', 'auth/changePassword', {}, {old: 'foo', 'new': '123456'}, 403],
      ['change password', 'post', 'auth/changePassword', {}, function (s) {return {old: U [0].password, 'new': '123456'}}, 200],
      ['change password again', 'post', 'auth/changePassword', {}, function (s) {return {old: '123456', 'new': U [0].password}}, 200],
   ],
   ['login with valid credentials after second password change', 'post', 'auth/login', {}, function () {return {username: U [0].username.toUpperCase () + '\t\t', password: U [0].password, timezone: new Date ().getTimezoneOffset ()}}, 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return true;
   }],
   ['submit client error being logged in', 'post', 'error', {}, {error: 'error'}, 200],
];

var outro = [
   ['logout', 'post', 'auth/logout', {}, {}, 200, function (s, rq, rs) {
      if (! rs.headers ['set-cookie'] || ! rs.headers ['set-cookie'] [0].match (/max-age/i)) return false;
      return true;
   }],
   ['get CSRF token without being logged in', 'get', 'csrf', {}, '', 403],
   ['delete account with invalid cookie', 'post', 'auth/delete', {}, {}, 403, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'session'})) return clog ('Invalid payload sent, expecting {error: "session"}');
      s.headers = {};
      return true;
   }],
   {tag: 'double logout', method: 'post', path: 'auth/logout', code: 403, headers: {}, body: {}, apres: function (s, rq, rs) {
      if (! eq (rs.body, {error: 'nocookie'})) return clog ('Invalid payload sent, expecting {error: "nocookie"}');
      return true;
   }},
   ['login with valid credentials', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['delete account with invalid cookie', 'post', 'auth/delete', {cookie: 'foobar'}, {}, 403, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'noappcookie'})) return clog ('Invalid payload sent, expecting {error: "noappcookie"}');
      return true;
   }],
   ['delete account with tampered cookie', 'post', 'auth/delete', {cookie: 'oml-session=foobar'}, {}, 403, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'noappcookie'})) return clog ('Invalid payload sent, expecting {error: "noappcookie"}');
      return true;
   }],
   ['delete account', 'post', 'auth/delete', {}, {}, 200, function (s, rq, rs) {
      if (! rs.headers ['set-cookie'] || ! rs.headers ['set-cookie'] [0].match (/max-age/i)) return false;
      s.headers = {};
      return true;
   }],
   ['delete account with no cookie', 'post', 'auth/delete', {}, U [0], 403, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'nocookie'})) return clog ('Invalid payload sent, expecting {error: "nocookie"}');
      return true;
   }],
   ['login with deleted credentials', 'post', 'auth/login', {}, U [0], 403],
   ['get public stats at the end', 'get', 'stats', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {byfs: 0, bys3: skipS3 ? rs.body.bys3 : 0, pics: 0, vids: 0, t200: 0, t900: 0, users: 0})) return clog ('Invalid public stats.');
      return true;
   }],
];

var main = [
   ['check that regular user cannot reach the admin', 'get', 'admin/invites', {}, '', 403],
   ttester ('feedback', 'post', 'feedback', {}, [
      ['message', 'string'],
   ]),
   ['send feedback', 'post', 'feedback', {}, {message: 'La radio está buenísima.'}, 200],
   ['get account at the beginning of the test cycle', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Body must be object');
      if (! eq ({username: userPrefix + ' 1', email: 'a@a.com'}, {username: rs.body.username, email: rs.body.email})) return clog ('Invalid values in fields.');
      if (type (rs.body.created) !== 'integer') return clog ('Invalid created field');
      if (! eq (rs.body.usage, {limit: CONFIG.freeSpace, fsused: 0, s3used: 0})) return clog ('Invalid usage field.');
      var logLength = skipAuth ? 2 : 11;
      if (type (rs.body.logs) !== 'array' || (rs.body.logs.length !== logLength && rs.body.logs.length !== logLength + 1)) return clog ('Invalid logs.');
      return true;
   }],
   ttester ('query pivs', 'post', 'query', {}, [
      ['tags', 'array'],
      [['tags', 0], 'string'],
      ['mindate', ['undefined', 'integer']],
      ['maxdate', ['undefined', 'integer']],
      ['sort', 'string'],
      ['from', 'integer'],
      ['to', 'integer'],
      ['idsOnly', ['undefined', 'boolean']],
   ]),
   {tag: 'query pivs without csrf token', method: 'post', path: 'query', code: 403, body: {tags: ['all'], sort: 'newest', from: 1, to: 10}, apres: function (s, rq, rs) {
      if (! eq (rs.body, {error: 'csrf'})) return clog ('Invalid payload');
      return true;
   }},
   {tag: 'query pivs with invalid csrf token', method: 'post', path: 'query', code: 403, body: {csrf: 'foobar', tags: ['all'], sort: 'newest', from: 1, to: 10}, apres: function (s, rq, rs) {
      if (! eq (rs.body, {error: 'csrf'})) return clog ('Invalid payload');
      return true;
   }},
   ['query pivs with invalid tag', 'post', 'query', {}, {tags: ['all'], sort: 'newest', from: 1, to: 10}, 400],
   ['get invalid range of pivs', 'post', 'query', {}, {tags: [], sort: 'newest', from: 3, to: 1}, 400],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (! eq (rs.body, {total: 0, pivs: [], tags: []})) return clog ('Invalid payload');
      return true;
   }],
   ['get pivs (ids only)', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10, idsOnly: true}, 200, function (s, rq, rs) {
      if (! eq (rs.body, [])) return clog ('Invalid body.');
      return true;
   }],
   ['upload invalid payload #1', 'post', 'upload', {}, '', 400],
   ['upload invalid payload #2', 'post', 'upload', {}, 1, 400],
   ['upload invalid payload #3', 'post', 'upload', {}, [], 400],
   ['upload invalid payload #4', 'post', 'upload', {}, {}, 400],
   ['upload invalid payload #5', 'post', 'upload', {}, {file: {}}, 400],
   ['upload video before upload start', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'tram.mp4'},
      {type: 'field', name: 'id', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: fs.statSync (PIVS + 'tram.mp4').mtime.getTime ()}
   ]}}, 404],
   ttester ('metaupload', 'post', 'metaupload', {}, [
      ['op', 'string'],
      ['pro', ['undefined', 'string']],
   ]),
   dale.go ([
      {foo: 'bar'},
      {op: 'foo'},
      {op: 'start', pro: 'foo'},
      {op: 'end', tags: ['a']},
      {op: 'start'},
      {op: 'start', tags: 'a'},
      {op: 'start', tags: {}},
      {op: 'start', tags: [1]},
      {op: 'start', tags: ['a'], total: '1'},
      {op: 'start', tags: ['a'], total: -1},
      {op: 'start', tags: ['a'], total: 1, alreadyImported: true},
      {op: 'start', tags: ['a'], total: 1, alreadyImported: true},
      {op: 'start', tags: ['all'], total: 1},
      {op: 'start', tags: ['ok', 'untagged'], total: 1},
      {op: 'complete', tags: ['ok'], total: 1},
   ], function (v, k) {
      return ['invalid start upload #' + (k + 1), 'post', 'metaupload', {}, v, 400];
   }),
   ttester ('uploadCheck', 'post', 'uploadCheck', {}, [
      ['id', 'integer'],
      ['hash', 'integer'],
      ['filename', 'string'],
      ['fileSize', 'integer'],
      ['lastModified', 'integer'],
      ['tags', ['array', 'undefined']],
   ]),
   dale.go ([
      {foo: 'bar'},
      {id: Date.now (), hash: 123, filename: 'foo', fileSize: -1},
      {id: Date.now (), hash: 123, filename: 'foo', fileSize: 123, tags: ['all']},
   ], function (v, k) {
      return ['invalid uploadCheck #' + (k + 1), 'post', 'uploadCheck', {}, v, 400];
   }),
   ['start upload', 'post', 'metaupload', {}, {op: 'start', tags: ['video   '], total: 3}, 200, function (s, rq, rs) {
      if (! eq (rs.body, {id: rs.body.id})) return clog ('Invalid body.');
      if (type (rs.body.id) !== 'integer') return clog ('Invalid body.id.');
      s.uid1 = rs.body.id;
      return true;
   }],
   ['uploadCheck, no such upload', 'post', 'uploadCheck', {}, {id: Date.now (), hash: 123, filename: 'foo', fileSize: 123, lastModified: Date.now (), tags: ['a tag']}, 404],
   ['upload unsupported format', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'tram.mp4', filename: 'tram.mp5'},
      {type: 'field', name: 'id', value: s.uid1},
      {type: 'field',  name: 'lastModified', value: fs.statSync (PIVS + 'tram.mp4').mtime.getTime ()}
   ]}}, 400, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'fileFormat', filename: 'tram.mp5'})) return clog ('Invalid body returned.');
      return true;
   }],
   ['upload video #1', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'tram.mp4'},
      {type: 'field', name: 'id', value: s.uid1},
      {type: 'field',  name: 'lastModified', value: fs.statSync (PIVS + 'tram.mp4').mtime.getTime ()}
   ]}}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object' || type (rs.body.id) !== 'string') return clog ('No id returned.');
      s.uploadIds = [rs.body.id];
      return true;
   }],
   ['uploadCheck, hash not found', 'post', 'uploadCheck', {}, function (s) {return {id: s.uid1, hash: 123, filename: 'foo', fileSize: 123, lastModified: Date.now (), tags: ['a tag']}}, 200, function (s, rq, rs) {
      if (! eq (rs.body, {repeated: false})) return clog ('Invalid body.');
      return true;
   }],
   ['uploadCheck, hash is identical with a different name', 'post', 'uploadCheck', {}, function (s) {return {id: s.uid1, hash: 3173476963, filename: 'foo.mp4', fileSize: 123, lastModified: Date.now (), tags: ['a tag']}}, 200, function (s, rq, rs) {
      if (! eq (rs.body, {repeated: true})) return clog ('Invalid body.');
      return true;
   }],
   ['uploadCheck, hash is identical with a different name', 'post', 'uploadCheck', {}, function (s) {return {id: s.uid1, hash: 3173476963, filename: 'tram.mp4', fileSize: 123, lastModified: Date.now (), tags: ['a tag']}}, 200, function (s, rq, rs) {
      if (! eq (rs.body, {repeated: true})) return clog ('Invalid body.');
      return true;
   }],
   ['upload video #2', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'bach.mp4'},
      {type: 'field', name: 'id', value: s.uid1},
      {type: 'field',  name: 'lastModified', value: fs.statSync (PIVS + 'bach.mp4').mtime.getTime ()}
   ]}}, 200, function (s, rq, rs) {
      s.uploadIds [1] = rs.body.id;
      return true;
   }],
   ['upload repeated video', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'bach.mp4', filename: 'bach-repeated.mp4'},
      {type: 'field', name: 'id', value: s.uid1},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["repeated1", "repeated2"]'}
   ]}}, 409, function (s, rq, rs, next) {
      if (rs.body.error !== 'repeated') return clog ('Invalid error', rs.body);
      if (rs.body.id    !== s.uploadIds [1]) return clog ('Invalid id', rs.body);
      return true;
   }],
   ['upload alreadyUploaded video', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'bach.mp4'},
      {type: 'field', name: 'id', value: s.uid1},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["repeated1", "repeated2"]'}
   ]}}, 409, function (s, rq, rs, next) {
      if (rs.body.error !== 'alreadyUploaded') return clog ('Invalid error', rs.body);
      if (rs.body.id    !== s.uploadIds [1]) return clog ('Invalid id', rs.body);
      return true;
   }],
   ['upload invalid video', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'invalid.mp4'},
      {type: 'field', name: 'id', value: s.uid1},
      {type: 'field',  name: 'lastModified', value: fs.statSync (PIVS + 'bach.mp4').mtime.getTime ()}
   ]}}, 400, function (s, rq, rs) {
      if (! rs.body || type (rs.body.error) !== 'string') return clog ('No error present.');
      if (! rs.body.error.match (/^Invalid video/)) return clog ('Invalid error message.');
      return true;
   }],
   ['upload alreadyUploaded video again (should be repeated)', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'bach.mp4'},
      {type: 'field', name: 'id', value: s.uid1},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["repeated1", "repeated2"]'}
   ]}}, 409, function (s, rq, rs, next) {
      if (rs.body.error !== 'repeated') return clog ('Invalid error', rs.body);
      if (rs.body.id    !== s.uploadIds [1]) return clog ('Invalid id', rs.body);
      return true;
   }],
   ['check user logs after first upload', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      var uploadLogs = rs.body.logs.slice (0, 8), id;
      if (uploadLogs.length !== 8) return clog ('Missing logs.');
      var error = dale.stopNot (uploadLogs, undefined, function (v, k) {
         if (v.ev !== 'upload') return 'Invalid action';
         if (v.type !== ['repeated', 'invalid', 'alreadyUploaded', 'repeated', 'ok', 'alreadyUploaded', 'repeated', 'ok', 'unsupported', 'start'] [k]) return 'Invalid type: ' + v.type + ' (' + (k + 1) + ')';
         if (type (v.id) !== 'integer') return 'Invalid id type: ' + v.id;
         if (k === 0) id = v.id;
         if (v.id !== id) return 'Invalid id: ' + v.id;
         if (k === 1 && v.filename !== 'invalid.mp4') return 'Invalid filename in invalid.';
         if (k === 1 && type (v.error) !== 'object') return 'No error present';
         if (k === 0 || k === 2 || k === 3 || k === 4) {
            if (v.fileId !== s.uploadIds [1]) return 'Invalid fileId: ' + (k + 1);
         }
         if (k === 5 || k === 6 || k === 7) {
            if (v.fileId !== s.uploadIds [0]) return 'Invalid fileId: ' + (k + 1);
         }
         if (k === 8 && v.filename !== 'tram.mp5') return 'Invalid filename in unsupported.';
         if (k === 0 && v.filename !== 'bach.mp4') return 'Invalid filename in repeated (second time alreadyUploaded with same name).';
         if (k === 3 && v.filename !== 'bach-repeated.mp4') return 'Invalid filename in repeated.';
         if (k === 6 && v.filename !== 'foo.mp4') return 'Invalid filename in repeated (uploadCheck).';
         if ((k === 5 || k === 6) && ! eq (v.tags, ['a tag'])) return 'Invalid tags in alreadyUploaded or repeated (uploadCheck).';
         if (k === 9 && ! eq ({tags: v.tags, total: v.total}, {tags: ['video'], total: 3})) return 'Invalid tags or total in start.';
      });
      if (error) return clog (error);
      return true;
   }],
   ['get uploads after first upload', 'get', 'uploads', {}, '', 200, function (s, rq, rs, next) {
      if (! eq (rs.body [0], {id: s.uid1, invalid: ['invalid.mp4'], repeated: ['bach.mp4', 'bach-repeated.mp4', 'foo.mp4'], ok: 2, lastPiv: {id: s.uploadIds [1]}, status: 'uploading', total: 3, tags: ['video'], alreadyUploaded: 2, repeatedSize: 892698 * 2 + 123, unsupported: ['tram.mp5']})) return clog ('Invalid upload data.');
      return true;
   }],
   ['get pivs and check refreshQuery is on', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (rs.body.refreshQuery !== true) return clog ('refreshQuery should be on', rs.body);
      return true;
   }],
   ['complete upload', 'post', 'metaupload', {}, function (s) {return {op: 'complete', id: s.uid1}}, 200],
   ['uploadCheck with finished upload', 'post', 'uploadCheck', {}, function (s) {return {id: s.uid1, hash: 123, filename: 'foo', fileSize: 123, lastModified: Date.now (), tags: ['a tag']}}, 409],
   ['get pivs and check refreshQuery is off', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (rs.body.refreshQuery !== undefined) return clog ('refreshQuery should be off', rs.body);
      return true;
   }],
   ['complete upload again', 'post', 'metaupload', {}, function (s) {return {op: 'complete', id: s.uid1}}, 409],
   ['cancel complete upload', 'post', 'metaupload', {}, function (s) {return {op: 'cancel', id: s.uid1}}, 409],
   ['check user logs after complete upload', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      var uploadLogs = rs.body.logs.slice (0, 2), id;
      var error = dale.stopNot (uploadLogs, undefined, function (v, k) {
         if (v.ev !== 'upload') return 'Invalid action';
         if (v.type !== ['complete', 'repeated'] [k]) return 'Invalid type: ' + v.type + ' (' + (k + 1) + ')';

         if (type (v.id) !== 'integer') return 'Invalid id type: ' + v.id;
         if (k === 0) id = v.id;
         if (v.id !== id) return 'Invalid id: ' + v.id;
      });
      if (error) return clog (error);
      return true;
   }],
   ['get uploads after complete upload', 'get', 'uploads', {}, '', 200, function (s, rq, rs, next) {
      if (type (rs.body [0].end) !== 'integer') return clog ('Invalid end field.');
      delete rs.body [0].end;
      if (! eq (rs.body [0], {id: s.uid1, invalid: ['invalid.mp4'], repeated: ['bach.mp4', 'bach-repeated.mp4', 'foo.mp4'], ok: 2, lastPiv: {id: s.uploadIds [1]}, status: 'complete', total: 3, tags: ['video'], alreadyUploaded: 2, repeatedSize: 892698 * 2 + 123, unsupported: ['tram.mp5']})) return clog ('Invalid upload data.');
      return true;
   }],
   ['upload video after upload end', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'tram.mp4'},
      {type: 'field', name: 'id', value: s.uid1},
      {type: 'field',  name: 'lastModified', value: fs.statSync (PIVS + 'tram.mp4').mtime.getTime ()}
   ]}}, 409, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'status'})) return clog ('Invalid status error.');
      return true;
   }],
   ['error upload (invalid)', 'post', 'metaupload', {}, function (s) {return {op: 'error', id: s.uid1, error: 'foo'}}, 400],
   ['error upload', 'post', 'metaupload', {}, function (s) {return {op: 'error', id: s.uid1, error: {foo: 'bar'}}}, 200],
   ['check user logs after errored upload', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      var uploadLogs = rs.body.logs.slice (0, 2);
      var error = dale.stopNot (uploadLogs, undefined, function (v, k) {
         if (v.ev !== 'upload') return 'Invalid action';
         if (v.type !== ['error', 'complete'] [k]) return 'Invalid type: ' + v.type + ' (' + (k + 1) + ')';
         if (v.id !== s.uid1) return 'Invalid id: ' + v.id;
         if (k === 0 && ! eq (v.error, {foo: 'bar'})) return 'Invalid error: ' + JSON.stringify (v.error);
      });
      if (error) return clog (error);
      return true;
   }],
   ['get uploads after errored upload', 'get', 'uploads', {}, '', 200, function (s, rq, rs, next) {
      delete rs.body [0].end;
      if (! eq (rs.body [0], {id: s.uid1, invalid: ['invalid.mp4'], repeated: ['bach.mp4', 'bach-repeated.mp4', 'foo.mp4'], ok: 2, lastPiv: {id: s.uploadIds [1]}, status: 'error', total: 3, tags: ['video'], alreadyUploaded: 2, repeatedSize: 892698 * 2 + 123, unsupported: ['tram.mp5'], error: {foo: 'bar'}})) return clog ('Invalid upload data.');
      return true;
   }],
   ['get pivs (videos)', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 2) return clog ('Invalid total count.');
      if (! eq (rs.body.tags, ['2018', 'a tag', 'repeated1', 'repeated2'])) return clog ('Invalid tags.');
      if (type (rs.body.pivs) !== 'array') return clog ('Invalid piv array.');
      s.vids = dale.go (rs.body.pivs, function (piv) {return piv.id});
      var vid1 = rs.body.pivs [0], vid2 = rs.body.pivs [1];
      if (vid1.id !== s.uploadIds [0] || vid2.id !== s.uploadIds [1]) return clog ('Id mismatch.');
      if (type (vid1.id) !== 'string' || type (vid1.t200) !== 'string' || type (vid1.t900) !== 'string') return clog ('Invalid id, t200 or t900 in vid #1.');
      if (type (vid2.id) !== 'string' || type (vid2.t200) !== 'string' || type (vid2.t900) !== 'string') return clog ('Invalid id, t200 or t900 in vid #2.');
      if (type (vid1.date)   !== 'integer') return clog ('Invalid vid1.date.');
      if (type (vid1.dateup) !== 'integer') return clog ('Invalid vid1.dateup.');
      if (type (vid2.date)   !== 'integer') return clog ('Invalid vid2.date.');
      if (type (vid2.dateup) !== 'integer') return clog ('Invalid vid2.dateup.');
      delete vid1.id;
      delete vid1.t200;
      delete vid1.t900;
      delete vid2.id;
      delete vid2.t200;
      delete vid2.t900;
      delete vid1.dateup;
      delete vid2.dateup;
      delete vid1.dates;
      delete vid2.dates;

      if (! eq (vid1, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'tram.mp4',
         dimh: 1920,
         dimw: 1080,
         tags: ['2018', 'a tag'],
         vid: true,
         date: 1544889597000,
      })) return clog ('Invalid vid #1 fields.');
      if (! eq (vid2, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'bach.mp4',
         dimh: 768,
         dimw: 1366,
         tags: ['2018', 'repeated1', 'repeated2'],
         vid: true,
         date: 1538154339000,
      })) return clog ('Invalid vid #2 fields.');
      return true;
   }],
   ['untag first video', 'post', 'tag', {}, function (s) {
      return {tag: 'a tag', ids: [s.vids [0]], del: true};
   }, 200],
   ['get pivs (videos), untagged', 'post', 'query', {}, {tags: ['untagged'], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 1) return clog ('Invalid total count.');
      if (! eq (rs.body.tags, ['2018'])) return clog ('Invalid tags.');
      if (type (rs.body.pivs) !== 'array') return clog ('Invalid piv array.');
      if (rs.body.pivs.length !== 1) return clog ('Invalid amount of pivs.');
      return true;
   }],
   dale.go (dale.times (2, 0), function (k) {
      return {tag: 'get videos', method: 'get', path: function (s) {return 'piv/' + s.vids [k] + '?original=1'}, code: 200, raw: true, apres: function (s, rq, rs) {
         var name = ['tram.mp4', 'bach.mp4'] [k];
         var up       = Buffer.from (rs.body, 'binary');
         var saved    = fs.writeFileSync (name, rs.body, {encoding: 'binary'});
         var original = fs.readFileSync (PIVS + name);
         if (Buffer.compare (up, original) !== 0) return clog ('Mismatch between original and uploaded video!');
         var mtime = fs.statSync (PIVS + name).mtime;
         // We compare that the difference is less than 1s because the date format of the return header doesn't have millisecond precision.
         if (Math.abs (mtime.getTime () - new Date (rs.headers ['last-modified']).getTime ()) >= 1000) return clog ('Invalid last-modified header: ', rs.headers ['last-modified']);
         fs.unlinkSync (name);
         return true;
      }};
   }),
   ['delete videos', 'post', 'delete', {}, function (s) {
      return {ids: s.vids};
   }, 200],
   ['start upload', 'post', 'metaupload', {}, {op: 'start', total: 100}, 200, function (s, rq, rs) {
      s.uid2 = rs.body.id;
      return true;
   }],
   ['upload empty picture', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'empty.jpg'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field', name: 'lastModified', value: Date.now ()},
   ]}}, 400],
   ['upload invalid picture', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'invalid.jpg'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}}, 400, function (s, rq, rs) {
      if (! rs.body || type (rs.body.error) !== 'string') return clog ('No error present.');
      if (! rs.body.error.match (/^Invalid image/)) return clog ('Invalid error message.');
      return true;
   }],
   ['upload picture without id', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
   ]}}, 400],
   ['upload picture with non-numeric id', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: Date.now () + 'a'},
   ]}}, 400],
   ['upload picture with futuristic id', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: Date.now () + 10000000},
   ]}}, 400],
   ['upload picture without lastModified', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'}
   ]}}, 400],
   ['upload small picture with extra text field', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'extra', value: Date.now ()}
   ]}}, 400],
   ['upload small picture with extra file field', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'file',  name: 'piv2', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}}, 400],
   ['upload small picture with invalid tags #1', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: 'foobar'},
   ]}}, 400],
   ['upload small picture with invalid tags #2', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify ([2])},
   ]}}, 400],
   ['upload small picture with invalid tags #3', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify (['hello', 'all'])},
   ]}}, 400],
   ['upload small picture with invalid tags #4', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify (['hello', '2017'])},
   ]}}, 400],
   ['upload small picture with invalid tags #5', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify (['hello', 'g::Buenos Aires'])},
   ]}}, 400],
   ['upload small picture', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: new Date ('2018-06-07T00:00:00.000Z').getTime ()}
   ]}}, 200, function (s, rq, rs, next) {
      // Wait for S3 to delete the videos uploaded before and the image just uploaded
      setTimeout (next, skipS3 ? 0 : 8000);
   }],
   ['check usage after uploading small picture (wait for S3)', 'get', 'account', {}, '', 200, function (s, rq, rs, cb) {
      if (rs.body.usage.fsused !== 3370) return clog ('Invalid FS usage.');
      if (skipS3) return true;
      if (rs.body.usage.s3used === 3402) return true;
      setTimeout (function () {
         if (rs.body.usage.s3used !== 3402) return cb ('Invalid S3 usage: ' + rs.body.usage.s3used);
         cb ();
      // Wait two seconds more in case S3 is slower than usual.
      }, 2000);
   }],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 1) return clog ('Invalid total count.');
      if (! eq (rs.body.tags, ['2014'])) return clog ('Invalid tags.');
      if (type (rs.body.pivs) !== 'array') return clog ('Invalid piv array.');
      var piv = rs.body.pivs [0];
      s.smallpiv = teishi.copy (piv);
      if (piv.date !== H.getDate ('2014:05:08 00:06:23'))  return clog ('Invalid piv.date');
      if (type (piv.date)   !== 'integer') return clog ('Invalid piv.date.');
      if (type (piv.dateup) !== 'integer') return clog ('Invalid piv.dateup.');
      delete piv.date;
      delete piv.dateup;
      delete piv.dates;
      if (type (piv.id) !== 'string') return clog ('Invalid piv.id.');
      delete piv.id;
      if (! eq (piv, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'small.png',
         dimh: 149,
         dimw: 149,
         tags: ['2014']
      })) return clog ('Invalid piv fields.');
      return true;
   }],
   ['upload duplicated picture', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'smalldup.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}}, 409],
   ['uploadCheck same picture with different lastModified field, check it is added to s.dates', 'post', 'uploadCheck', {}, function (s) {return {id: s.uid2, hash: 2011409414, filename: 'small.png', fileSize: 0, lastModified: 1621036799999}}, 200],
   ['uploadCheck same picture with date in name, check it is added to s.dates', 'post', 'uploadCheck', {}, function (s) {return {id: s.uid2, hash: 2011409414, filename: '2021-05-14', fileSize: 0, lastModified: Date.now ()}}, 200],
   ['upload alreadyUploaded picture with date in name', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'smallmeta.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
   ]}}, 409, function (s, rq, rs, next) {
      if (rs.body.error !== 'repeated') return clog ('Invalid error', rs.body);
      return true;
   }],
   ['check piv dates', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 1}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 1) return clog ('Invalid total count.');
      var piv = rs.body.pivs [0];
      if (piv.date !== 1367964383000) return clog ('Date was not updated with Create Date from repeated picture with different metadata.');
      // Depending on the OS, sometimes the same file being uploaded has dates that are one or two seconds apart. We ignore them.
      piv.dates = dale.obj (piv.dates, function (v, k) {
         if (k.match (/^repeated:\d+:File/)) return;
         return [k, v];
      });
      var keys = dale.keys (piv.dates).length;
      if (keys !== 11) return clog ('Invalid number of keys in piv.dates:', dale.keys (piv.dates).length);
      var au = 0, r = 0, orig = 0;
      var reverse = dale.obj (piv.dates, function (v, k) {
         if (k.match (/^repeated:/)) r++;
         else if (k.match (/^alreadyUploaded:/)) au++;
         else orig++;
         return [v, k];
      });
      if (r !== 5) return clog ('Invalid number of repeated fields in piv.dates.');
      if (au !== 1) return clog ('Invalid number of alreadyUploaded fields in piv.dates.');
      if (orig !== 5) return clog ('Invalid number of original fields in piv.dates.');
      if (! reverse ['2013:05:08 00:06:23']) return clog ('Create Date missing.');
      return true;
   }],
   ['delete freshly uploaded picture', 'post', 'delete', {}, function (s) {
      return {ids: [s.smallpiv.id]};
   }, 200],
   ['upload small picture again', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'small.png'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: new Date ('2018-06-07T00:00:00.000Z').getTime ()}
   ]}}, 200],
   ['upload medium picture', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'medium.jpg'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: new Date ('2018-06-03T00:00:00.000Z').getTime ()}
   ]}}, 200],
   ['check usage after uploading medium picture', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      if (rs.body.usage.fsused !== 3370 + 22644 + 13194) return clog ('Invalid FS usage.');
      if (skipS3) return true;
      if (rs.body.usage.s3used !== 0 && rs.body.usage.s3used !== 3402) return clog ('Invalid S3 usage.');
      // Wait for S3
      setTimeout (next, 5000);
   }],
   ['upload medium picture with no metadata', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'medium-nometa.jpg'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: new Date ('2018-06-03T00:00:00.000Z').getTime ()}
   ]}}, 409],
   ['check usage after uploading medium picture (wait for S3)', 'get', 'account', {}, '', 200, function (s, rq, rs, cb) {
      if (rs.body.usage.fsused !== 3370 + 22644 + 13194) return clog ('Invalid FS usage.');
      if (skipS3) return true;
      if (rs.body.usage.s3used === 3402 + 22676)         return true;
      setTimeout (function () {
         if (rs.body.usage.s3used !== 3402 + 22676) return cb ('Invalid S3 usage.');
         cb ();
      // Wait two seconds more in case S3 is slower than usual.
      }, 2000);
      return true;
   }],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 2) return clog ('Invalid total count.');
      if (! eq (rs.body.tags.sort (), ['2014', '2018'])) return clog ('Invalid tags.');
      if (type (rs.body.pivs) !== 'array') return clog ('Invalid piv array.');
      var piv = rs.body.pivs [0];
      if (piv.date !== H.getDate ('2018-06-03T00:00:00.000Z')) return clog ('Invalid piv.date');
      if (type (piv.dateup) !== 'integer') return clog ('Invalid piv.dateup.');
      delete piv.date;
      delete piv.dateup;
      delete piv.dates;
      if (type (piv.id) !== 'string') return clog ('Invalid piv.id.');
      delete piv.id;
      if (type (piv.t200) !== 'string') return clog ('Invalid piv.t200.');
      delete piv.t200;
      if (! eq (piv, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'medium.jpg',
         dimh: 204,
         dimw: 248,
         tags: ['2018']
      })) return clog ('Invalid piv fields.');
      return true;
   }],
   ['upload large picture', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'large.jpeg'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}}, 200],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 3) return clog ('Invalid total count.');
      if (! eq (rs.body.tags.sort (), ['2014', '2018'])) return clog ('Invalid tags.');
      if (type (rs.body.pivs) !== 'array') return clog ('Invalid piv array.');
      if (rs.body.pivs.length !== 1) return clog ('Invalid amount of pivs returned.');
      var piv = rs.body.pivs [0];
      if (piv.date !== H.getDate ('2014:07:20 18:20:31')) return clog ('Invalid piv.date');
      delete piv.date;
      delete piv.dateup;
      delete piv.id;
      delete piv.dates;
      if (type (piv.t200) !== 'string') return clog ('Invalid piv.t200.');
      if (type (piv.t900) !== 'string') return clog ('Invalid piv.t900.');
      delete piv.t200;
      delete piv.t900;
      return true;
      if (! eq (piv, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'large.jpeg',
         dimh: 204,
         dimw: 248,
         tags: ['2014']
      })) return clog ('Invalid piv fields.');
      return true;
   }],
   ['get pivs (ids only)', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10, idsOnly: true}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'array') return clog ('Invalid body.');
      if (rs.body.length !== 3 || type (rs.body [0]) !== 'string') return clog ('Invalid body length or type.');
      return true;
   }],
   ['upload lopsided picture', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'rotate.jpg'},
      {type: 'field', name: 'id', value: s.uid2},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}}, 200, function (s, rq, rs) {
      if (rs.body.deg !== 90) return clog ('Invalid body.deg');
      return true;
   }],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 4) return clog ('Invalid total count.');
      if (! eq (rs.body.tags.sort (), ['2014', '2017', '2018'])) return clog ('Invalid tags.');
      if (type (rs.body.pivs) !== 'array') return clog ('Invalid piv array.');
      s.pivs = rs.body.pivs;
      var piv = teishi.copy (rs.body.pivs [0]);
      if (type (piv.date)   !== 'integer') return clog ('Invalid piv.date.');
      if (type (piv.dateup) !== 'integer') return clog ('Invalid piv.dateup.');
      if (piv.date !== H.getDate ('2017:03:22 17:35:20')) return clog ('Invalid date.');
      s.rotateid = piv.id;
      s.rotatepiv = teishi.copy (piv);
      delete piv.date;
      delete piv.dateup;
      delete piv.dates;
      if (type (piv.id) !== 'string') return clog ('Invalid piv.id.');
      delete piv.id;
      if (type (piv.t200) !== 'string') return clog ('Invalid piv.t200.');
      delete piv.t200;
      if (type (piv.t900) !== 'string') return clog ('Invalid piv.t900.');
      delete piv.t900;
      if (! eq (piv, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'rotate.jpg',
         dimh: 1232,
         dimw: 2048,
         deg:  90,
         tags: ['2017']
      })) return clog ('Invalid piv fields.');
      return true;
   }],
   ['check user logs after second upload', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      var uploadLogs = dale.fil (rs.body.logs, undefined, function (v) {
         if (v.id === s.uid2) return v;
      });
      var error = dale.stopNot (uploadLogs, undefined, function (v, k) {
         if (v.ev !== 'upload') return 'Invalid action';
         if (v.type !== ['ok', 'ok', 'repeated', 'ok', 'ok', 'repeated', 'repeated', 'alreadyUploaded', 'repeated', 'ok', 'invalid', 'invalid', 'start'] [k]) return 'Invalid type: ' + v.type + ' (' + (k + 1) + ')';
         if (v.fileId !== [s.pivs [0].id, s.pivs [1].id, s.pivs [2].id, s.pivs [2].id, s.pivs [3].id, s.smallpiv.id, s.smallpiv.id, s.smallpiv.id, s.smallpiv.id, s.smallpiv.id, undefined, undefined, undefined] [k]) return 'Invalid fileId: ' + v.fileId + ' (' + (k + 1) + '), vs ' + [s.pivs [0].id, s.pivs [1].id, s.pivs [2].id, s.pivs [2].id, s.pivs [3].id, s.smallpiv.id, s.smallpiv.id, s.smallpiv.id, s.smallpiv.id, s.smallpiv.id, undefined, undefined, undefined] [k];
         if (v.deg !== (k === 0 ? 90 : undefined)) return 'Invalid deg: ' + v.deg + ' (' + (k + 1) + ')';
         if (v.filename !== [undefined, undefined, 'medium-nometa.jpg', undefined, undefined, 'smallmeta.png', '2021-05-14', undefined, 'smalldup.png', undefined, 'invalid.jpg', 'empty.jpg', undefined] [k]) return 'Invalid filename: ' + v.filename + ' (' + (k + 1) + ')';
         if (v.type === 'error' && ! v.error) return clog ('Error field missing');
      });
      if (error) return clog (error);
      return true;
   }],
   ['get uploads after complete upload', 'get', 'uploads', {}, '', 200, function (s, rq, rs, next) {
      if (! eq (rs.body [0], {id: s.uid2, ok: 5, lastPiv: {id: s.rotateid, deg: 90}, repeated: ['medium-nometa.jpg', 'smallmeta.png', '2021-05-14', 'smalldup.png'], alreadyUploaded: 1, repeatedSize: 16943, invalid: ['invalid.jpg', 'empty.jpg'], status: 'uploading', total: 100})) return clog ('Invalid upload data.');
      return true;
   }],
   ttester ('rotate piv', 'post', 'rotate', {}, [
      ['ids', 'array'],
      [['ids', 0], 'string'],
      ['deg', 'integer'],
   ]),
   ['rotate piv (invalid #1)', 'post', 'rotate', {}, {ids: ['hello'], deg: 45}, 400],
   ['rotate piv (invalid #2, repeated)', 'post', 'rotate', {}, {ids: ['hello', 'hello'], deg: -90}, 400],
   ['rotate piv (invalid #3, type)', 'post', 'rotate', {}, {ids: 'hello', deg: -90}, 400],
   ['rotate piv nonexisting #1', 'post', 'rotate', {}, {ids: ['hello'], deg: -90}, 404],
   ['rotate piv nonexisting #2', 'post', 'rotate', {}, function (s) {
      return {ids: [s.rotateid, 'foo'], deg: 90};
   }, 404],
   ['rotate piv', 'post', 'rotate', {}, function (s) {
      return {ids: [s.rotateid], deg: -90};
   }, 200],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
      if (! eq (rs.body.tags.sort (), ['2014', '2017', '2018'])) return clog ('Invalid tags.');
      var piv = rs.body.pivs [0];
      delete piv.id;
      if (type (piv.t200) !== 'string') return clog ('Invalid piv.t200.');
      delete piv.t200;
      if (type (piv.t900) !== 'string') return clog ('Invalid piv.t900.');
      delete piv.t900;
      if (s.rotatepiv.date !== piv.date)     return clog ('date changed after rotate.');
      if (s.rotatepiv.dateup !== piv.dateup) return clog ('dateup changed after rotate.');
      s.rotatedate = piv.date;
      delete piv.date;
      delete piv.dateup;
      delete piv.dates;
      if (! eq (piv, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'rotate.jpg',
         dimh: 1232,
         dimw: 2048,
         tags: ['2017']
      })) return clog ('Invalid piv fields.');
      return true;
   }],
   ['rotate piv again', 'post', 'rotate', {}, function (s) {
      return {ids: [s.rotateid], deg: 90};
   }, 200],
   dale.go ([[-90, undefined], [180, 180], [180, undefined], [-90, -90], [-90, 180], [-90, 90], [180, -90], [90, undefined]], function (pair, k) {
      return [
         ['rotate piv #' + (k + 2), 'post', 'rotate', {}, function (s) {
            return {ids: [s.rotateid], deg: pair [0]};
         }, 200],
         ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
            var piv = rs.body.pivs [0];
            if (piv.deg !== pair [1]) return clog ('Rotate wasn\'t calculated properly.');
            return true;
         }],
      ];
   }),
   ttester ('geotagging', 'post', 'geo', {}, [
      ['operation', 'string'],
   ]),
   ['turn on geotagging (invalid)', 'post', 'geo', {}, {operation: 'foo'}, 400],
   ['turn off geotagging', 'post', 'geo', {}, {operation: 'disable'}, 200],
   ['get account after disabling geotagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.geo !== undefined)           return clog ('Geo should be turned off');
      if (rs.body.geoInProgress !== undefined) return clog ('Geo progress should be turned off');
      var lastLog = rs.body.logs [0];
      if (lastLog.ev !== 'rotate') return clog ('Geotagging redundant disabling registered.');
      return true;
   }],
   ['turn on geotagging', 'post', 'geo', {}, {operation: 'enable'}, 200],
   ['get pivs and check refreshQuery is on', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (rs.body.refreshQuery !== true) return clog ('refreshQuery should be on', rs.body);
      return true;
   }],
   ['get account after enabling geotagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.geo !== true)           return clog ('Geo should be turned on');
      if (rs.body.geoInProgress !== true) return clog ('Geo progress should be turned on');
      var lastLog = rs.body.logs [0];
      if (lastLog.ev !== 'geotagging' || lastLog.type !== 'enable') return clog ('Geotagging enabling not registered.');
      return true;
   }],
   ['turn off geotagging (conflict)', 'post', 'geo', {}, {operation: 'enable'}, 409],
   ['turn on geotagging (conflict)', 'post', 'geo', {}, {operation: 'enable'}, 409, function (s, rq, rs, next) {
      // Wait for pivs to be tagged
      setTimeout (next, 2000);
   }],
   ['get account after enabling geotagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.geoInProgress !== undefined) return clog ('Geo progress should be turned off');
      return true;
   }],
   ['get pivs and check refreshQuery is still on because of upload', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (rs.body.refreshQuery !== true) return clog ('refreshQuery should be on', rs.body);
      return true;
   }],
   ['complete upload', 'post', 'metaupload', {}, function (s) {return {op: 'complete', id: s.uid2}}, 200],
   ['get pivs and check refreshQuery is off', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (rs.body.refreshQuery !== undefined) return clog ('refreshQuery should be off', rs.body);
      return true;
   }],
   ttester ('dismiss', 'post', 'dismiss', {}, [
      ['operation', 'string'],
   ]),
   ['get account before dismissing anything', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.suggestGeotagging !== true) return clog ('suggestGeotagging should be true');
      if (rs.body.suggestSelection  !== true) return clog ('suggestSelection should be true');
      return true;
   }],
   ['dismiss geotagging suggestion', 'post', 'dismiss', {}, {operation: 'geotagging'}, 200],
   ['get account after dismissing geotagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.suggestGeotagging !== undefined) return clog ('suggestGeotagging should be undefined');
      var lastLog = rs.body.logs [0];
      if (lastLog.ev !== 'dismiss' || lastLog.type !== 'geotagging') return clog ('Geotagging suggestion dismissal not registered.');
      return true;
   }],
   ['dismiss geotagging suggestion (again)', 'post', 'dismiss', {}, {operation: 'geotagging'}, 200],
   ['dismiss selection suggestion', 'post', 'dismiss', {}, {operation: 'selection'}, 200],
   ['get account after dismissing selection', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.suggestSelection !== undefined) return clog ('suggestSelection should be undefined');
      var lastLog = rs.body.logs [0];
      if (lastLog.ev !== 'dismiss' || lastLog.type !== 'selection') return clog ('Selection suggestion dismissal not registered.');
      return true;
   }],
   ['dismiss selection suggestion (again)', 'post', 'dismiss', {}, {operation: 'selection'}, 200],
   ['start upload #3', 'post', 'metaupload', {}, {op: 'start', total: 3}, 200, function (s, rq, rs) {
      if (! eq (rs.body, {id: rs.body.id})) return clog ('Invalid body.');
      if (type (rs.body.id) !== 'integer') return clog ('Invalid body.id.');
      s.uid3 = rs.body.id;
      return true;
   }],
   ['upload picture with different date format and geodata', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'dunkerque.jpg'},
      {type: 'field', name: 'id', value: s.uid3},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify (['dunkerque\t', '   beach'])},
   ]}}, 200],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      var piv = rs.body.pivs [0];
      if (! eq (piv.tags.sort (), ['2018', 'beach', 'dunkerque', 'g::Dunkerque', 'g::FR'])) return clog ('Invalid tags: ', piv.tags.sort ());
      if (piv.date !== H.getDate ('2018:03:26 13:23:34.805')) return clog ('GPS timestamp wasn\'t ignored.');
      s.dunkerque = piv.id;
      s.allpivs = rs.body.pivs;
      return true;
   }],
   ['turn off geotagging', 'post', 'geo', {}, {operation: 'disable'}, 200],
   ['get account after disabling geotagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.geo !== undefined) return clog ('Geo should be turned off');
      var lastLog = rs.body.logs [0];
      if (lastLog.ev !== 'geotagging' || lastLog.type !== 'disable') return clog ('Geotagging disabling not registered.');
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs, next) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 2, all: 5, untagged: 4, dunkerque: 1, beach: 1})) return clog ('Invalid tags after geotagging disabled.');
      return true;
   }],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (rs.body.pivs [0].loc !== undefined) return clog ('Location wasn\'t removed after disabling geotagging.');
      var tags = rs.body.pivs [0].tags;
      if (! eq (tags.sort (), ['2018', 'beach', 'dunkerque'])) return clog ('Geotags not removed.');
      if (tags.length !== 3) return clog ('Geotags not removed.');
      return true;
   }],
   ['turn on geotagging', 'post', 'geo', {}, {operation: 'enable'}, 200, function (s, rq, rs, next) {
      // Wait for pivs to be tagged
      setTimeout (next, 2000);
   }],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (type (rs.body.pivs [0].loc) !== 'array') return clog ('Invalid location array for pivture with metadata.');
      if (! eq (rs.body.pivs [0].loc, [51.051094444444445, 2.3877611111111112])) return clog ('Invalid location.');
      var tags = rs.body.pivs [0].tags;
      if (! eq (tags.sort (), ['2018', 'beach', 'dunkerque', 'g::Dunkerque', 'g::FR'])) return clog ('Invalid tags: ', tags.sort ());
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs, next) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 2, all: 5, untagged: 4, dunkerque: 1, 'g::FR': 1, beach: 1, 'g::Dunkerque': 1})) return clog ('Invalid tags after geotagging enabled.');
      // Wait for S3
      setTimeout (next, skipS3 ? 0 : 6000);
   }],
   ['get nonexisting piv from S3', 'get', 'original/foobar', {}, '', 404],
   dale.go (dale.times (5, 0), function (k) {
      if (skipS3) return [];
      return {tag: 'get original piv from S3', method: 'get', path: function (s) {return 'original/' + s.allpivs [k].id}, code: 200, raw: true, apres: function (s, rq, rs) {
         var up       = Buffer.from (rs.body, 'binary');
         var original = fs.readFileSync ([PIVS + 'dunkerque.jpg', PIVS + 'rotate.jpg', PIVS + 'large.jpeg', PIVS + 'medium.jpg', PIVS + 'small.png'] [k]);
         if (Buffer.compare (up, original) !== 0) return clog ('Mismatch between original and uploaded piv!');
         return true;
      }};
   }),
   ['delete piv with different date format', 'post', 'delete', {}, function (s) {
      return {ids: [s.dunkerque]};
   }, 200],
   ['get pivs by newest', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg', 'rotate.jpg', 'large.jpeg', 'small.png'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by oldest', 'post', 'query', {}, {tags: [], sort: 'oldest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['small.png', 'large.jpeg', 'rotate.jpg', 'medium.jpg'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by mindate #1', 'post', 'query', {}, function (s) {
      return {tags: [], sort: 'newest', from: 1, to: 4, mindate: s.rotatedate};
   }, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg', 'rotate.jpg'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by mindate #2', 'post', 'query', {}, function (s) {
      return {tags: [], sort: 'oldest', from: 1, to: 4, mindate: s.rotatedate};
   }, 200, function (s, rq, rs) {
      if (! eq (['rotate.jpg', 'medium.jpg'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by maxdate #1', 'post', 'query', {}, function (s) {
      return {tags: [], sort: 'newest', from: 1, to: 4, maxdate: s.rotatedate};
   }, 200, function (s, rq, rs) {
      if (! eq (['rotate.jpg', 'large.jpeg', 'small.png'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by maxdate #2', 'post', 'query', {}, function (s) {
      return {tags: [], sort: 'oldest', from: 1, to: 4, maxdate: s.rotatedate};
   }, 200, function (s, rq, rs) {
      if (! eq (['small.png', 'large.jpeg', 'rotate.jpg'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by year #1', 'post', 'query', {}, {tags: ['2018'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by year #2', 'post', 'query', {}, {tags: ['2018'], sort: 'oldest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by year #3', 'post', 'query', {}, {tags: ['2017', '2018'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg', 'rotate.jpg'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['get pivs by year #4', 'post', 'query', {}, {tags: ['2017', '2014', '2015'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['rotate.jpg', 'large.jpeg', 'small.png'], dale.go (rs.body.pivs, function (v) {
         return v.name;
      }))) return clog ('Invalid piv date sorting');
      return true;
   }],
   ['upload medium picture with rotation data', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'rotatemedium.jpg'},
      {type: 'field', name: 'id', value: s.uid3},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["rotatethumb"]'}
   ]}}, 200],
   ['upload small picture with rotation data', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'rotatesmall.jpg'},
      {type: 'field', name: 'id', value: s.uid3},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["rotatethumb"]'}
   ]}}, 200],
   ['get non-large pictures with rotation data and check they have thumbnails', 'post', 'query', {}, {from: 1, to: 2, tags: ['rotatethumb'], sort: 'upload'}, 200, function (s, rq, rs) {
      s.thumbpivs = rs.body.pivs;
      if (s.thumbpivs.length !== 2) return clog ('Expected two pivs.');
      if (! s.thumbpivs [0].t200) return clog ('Small picture should have t200.');
      if (s.thumbpivs [0].t900) return clog ('Small picture should not have t900.');
      if (! s.thumbpivs [1].t200) return clog ('Medium picture should have t200.');
      if (! s.thumbpivs [1].t900) return clog ('Medium picture should have t290.');
      return true;
   }],
   dale.go (dale.times (2, 0), function (k) {
      return ['delete thumbpiv #' + (k + 1), 'post', 'delete', {}, function (s) {
         return {ids: [s.thumbpivs [k].id]};
      }, 200];
   }),
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ttester ('tag piv', 'post', 'tag', {}, [
      ['tag', 'string'],
      ['ids', 'array'],
      [['ids', 0], 'string'],
      ['del', ['boolean', 'undefined']],
   ]),
   ['tag invalid #1', 'post', 'tag', {}, {tag: 'all', ids: ['a']}, 400],
   ['tag invalid #2', 'post', 'tag', {}, {tag: '\nall', ids: ['a']}, 400],
   ['tag invalid #3', 'post', 'tag', {}, {tag: '2018', ids: ['a']}, 400],
   ['tag invalid #4', 'post', 'tag', {}, {tag: 'untagged', ids: ['a']}, 400],
   ['tag invalid #5', 'post', 'tag', {}, {tag: 'Untagged', ids: ['a']}, 400],
   ['tag invalid #6', 'post', 'tag', {}, {tag: 'ALL', ids: ['a']}, 400],
   ['tag invalid #7', 'post', 'tag', {}, {tag: 'hello', ids: ['a', 'a']}, 400],
   ['tag invalid #8', 'post', 'tag', {}, {tag: 'g::', ids: ['a']}, 400],
   ['tag invalid #9', 'post', 'tag', {}, {tag: 'g::something', ids: ['a']}, 400],
   ['tag invalid #10', 'post', 'tag', {}, {tag: ' g::something', ids: ['a']}, 400],
   ['tag invalid #11', 'post', 'tag', {}, {tag: '\t ', ids: ['a']}, 400],
   ['tag invalid #12', 'post', 'tag', {}, {tag: ' ', ids: ['a']}, 400],
   ['tag invalid nonexisting #1', 'post', 'tag', {}, {tag: 'hello', ids: ['a']}, 404],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      s.pivs = rs.body.pivs;
      return true;
   }],
   dale.go (dale.times (4, 0), function (k) {
      return [
         ['get piv #' + (k + 1), 'get', function (s) {
            return 'piv/' + s.pivs [k].id;
         }, {}, '', 200, function (s, rq, rs) {
            var contentType = s.pivs [k].name === 'small.png' ? 'image/png' : 'image/jpeg';
            if (rs.headers ['content-type'] !== contentType) return clog ('Invalid content type.');
            if ({'medium.jpg': 21450, 'rotate.jpg': 826476, 'large.jpeg': 3302468, 'small.png': 3179} [s.pivs [k].name] !== rs.body.length) return clog ('Invalid length for piv #' + (k + 1));
            return true;
         }],
         ['get thumb 200 of piv #' + (k + 1), 'get', function (s) {
            return 'thumb/200/' + s.pivs [k].id;
         }, {}, '', 200, function (s, rq, rs) {
            var contentType = s.pivs [k].name === 'small.png' ? 'image/png' : 'image/jpeg';
            if (rs.headers ['content-type'] !== contentType) return clog ('Invalid content type.');
            if ({'medium.jpg': 12539, 'rotate.jpg': 7835, 'large.jpeg': 16533, 'small.png': 3179} [s.pivs [k].name] !== rs.body.length) return clog ('Invalid length for thumb 200 #' + (k + 1));
            return true;
         }],
         ['get thumb 900 of piv #' + (k + 1), 'get', function (s) {
            return 'thumb/900/' + s.pivs [k].id;
         }, {}, '', 200, function (s, rq, rs) {
            var contentType = s.pivs [k].name === 'small.png' ? 'image/png' : 'image/jpeg';
            if (rs.headers ['content-type'] !== contentType) return clog ('Invalid content type.');
            if ({'rotate.jpg': 94187, 'medium.jpg': 21450, 'large.jpeg': 212473, 'small.png': 3179} [s.pivs [k].name] !== rs.body.length) return clog ('Invalid length for thumb 900 #' + (k + 1));
            return true;
         }]
      ];
   }),
   // *** ADDITIONAL PICTURE FORMATS ***
   dale.go (['deer.bmp', 'sunrise.HEIC', 'tumbleweed.GIF', 'benin.tif'], function (v) {
      return ['upload ' + require ('path').extname (v).toLowerCase (), 'post', 'upload', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv', path: PIVS + v},
         {type: 'field', name: 'id', value: s.uid3},
         {type: 'field',  name: 'lastModified', value: Date.now ()}
      ]}}, 200];
   }),
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 4}, 200, function (s, rq, rs) {
      s.extrapics = rs.body.pivs;
      return true;
   }],
   dale.go (dale.times (4, 0), function (k) {
      return [
         ['get additional pic #' + (k + 1), 'get', function (s) {
            return 'piv/' + s.extrapics [k].id;
         }, {}, '', 200, function (s, rq, rs) {
            if ({'deer.bmp': 'image/bmp', 'sunrise.HEIC': 'image/heic', 'tumbleweed.GIF': 'image/gif', 'benin.tif': 'image/tiff'} [s.extrapics [k].name] !== rs.headers ['content-type']) return clog ('Invalid content-type for piv #' + (k + 1));
            if ({'deer.bmp': 124534, 'sunrise.HEIC': 868012, 'tumbleweed.GIF': 385721, 'benin.tif': 2661656} [s.extrapics [k].name] !== rs.body.length) return clog ('Invalid length for piv #' + (k + 1));
            return true;
         }],
         ['get thumb 200 of additional pic #' + (k + 1), 'get', function (s) {
            return 'thumb/200/' + s.extrapics [k].id;
         }, {}, '', 200, function (s, rq, rs) {
            if ({'deer.bmp': 'image/jpeg', 'sunrise.HEIC': 'image/jpeg', 'tumbleweed.GIF': 'image/jpeg', 'benin.tif': 'image/jpeg'} [s.extrapics [k].name] !== rs.headers ['content-type']) return clog ('Invalid content-type for piv #' + (k + 1));
            if ({'deer.bmp': 13880, 'sunrise.HEIC': 9939, 'tumbleweed.GIF': 10673, 'benin.tif': 5922} [s.extrapics [k].name] !== rs.body.length) return clog ('Invalid length for thumb 200 #' + (k + 1));
            return true;
         }],
         ['get thumb 900 of additional pic #' + (k + 1), 'get', function (s) {
            return 'thumb/900/' + s.extrapics [k].id;
         }, {}, '', 200, function (s, rq, rs) {
            if ({'deer.bmp': 'image/jpeg', 'sunrise.HEIC': 'image/jpeg', 'tumbleweed.GIF': 'image/gif', 'benin.tif': 'image/jpeg'} [s.extrapics [k].name] !== rs.headers ['content-type']) return clog ('Invalid content-type for piv #' + (k + 1));
            if ({'deer.bmp': 17069, 'sunrise.HEIC': 141830, 'tumbleweed.GIF': 385721, 'benin.tif': 91539} [s.extrapics [k].name] !== rs.body.length) return clog ('Invalid length for thumb 900 #' + (k + 1));
            return true;
         }],
         ['delete additional pic #' + (k + 1), 'post', 'delete', {}, function (s) {
            return {ids: [s.extrapics [k].id]};
         }, 200]
      ];
   }),
   ['tag nonexisting #2', 'post', 'tag', {}, function (s) {
      return {tag: '\tfoo', ids: [s.pivs [0].id, 'b']};
   }, 404],
   ['tag valid #1', 'post', 'tag', {}, function (s) {
      return {tag: '\tfoo', ids: [s.pivs [3].id]};
   }, 200],
   ['get pivs, untagged with invalid recentlyTagged #1', 'post', 'query', {}, function (s) {return {tags: ['untagged'], recentlyTagged: {}, sort: 'newest', from: 1, to: 10}}, 400],
   ['get pivs, untagged with invalid recentlyTagged #2', 'post', 'query', {}, function (s) {return {tags: ['untagged'], recentlyTagged: '', sort: 'newest', from: 1, to: 10}}, 400],
   ['get pivs, untagged with invalid recentlyTagged #3', 'post', 'query', {}, function (s) {return {tags: ['untagged'], recentlyTagged: [1], sort: 'newest', from: 1, to: 10}}, 400],
   ['get pivs, untagged with recentlyTagged', 'post', 'query', {}, function (s) {return {tags: ['untagged'], recentlyTagged: [s.pivs [3].id], sort: 'newest', from: 1, to: 10}}, 200, function (s, rq, rs, next) {
      if (rs.body.total !== 4) return clog ('Invalid total.');
      if (rs.body.pivs.length !== 4) return clog ('Invalid amount of pivs.');
      if (rs.body.pivs [3].id !== s.pivs [3].id) return clog ('Recently tagged piv not returned.');
      return true;
   }],
   ['get pivs, untagged with recentlyTagged (non-existent pivs)', 'post', 'query', {}, function (s) {return {tags: ['untagged'], recentlyTagged: ['foo', s.pivs [3].id, 'bar'], sort: 'newest', from: 1, to: 10}}, 200, function (s, rq, rs, next) {
      if (rs.body.total !== 4) return clog ('Invalid total.');
      if (rs.body.pivs.length !== 4) return clog ('Invalid amount of pivs.');
      if (rs.body.pivs [3].id !== s.pivs [3].id) return clog ('Recently tagged piv not returned.');
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 3, foo: 1})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get tagged piv', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.pivs [3].tags, ['2014', 'foo'])) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['tag again', 'post', 'tag', {}, function (s) {
      return {tag: 'foo', ids: [s.pivs [3].id]};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 3, foo: 1})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get tagged piv', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.pivs [3].tags, ['2014', 'foo'])) return clog ('Invalid tags');
      return true;
   }],
   ['get tagged piv', 'post', 'query', {}, {tags: ['foo'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.tags.sort (), ['2014', 'foo'])) return clog ('Invalid tags.');
      if (rs.body.total !== 1) return clog ('Searching by tag does not work.');
      if (! eq (rs.body.pivs [0].tags, ['2014', 'foo'])) return clog ('Invalid tags');
      return true;
   }],
   ['untag #1', 'post', 'tag', {}, function (s) {
      return {tag: '\tfoo  ', ids: [s.pivs [3].id, s.pivs [0].id], del: true};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get piv after untagging', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.pivs [3].tags, ['2014'])) return clog ('Invalid tags');
      return true;
   }],
   ['get tagged piv after untagging', 'post', 'query', {}, {tags: ['foo'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.tags.sort (), [])) return clog ('Invalid tags.');
      if (rs.body.total !== 0) return clog ('Searching by tag does not work.');
      return true;
   }],
   ['tag two pivs #1', 'post', 'tag', {}, function (s) {
      return {tag: '  bla', ids: [s.pivs [0].id, s.pivs [3].id]};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 2, bla: 2})) return clog (rs.body);
      return true;
   }],
   ['get tagged pivs', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.tags.sort (), ['2014', '2017', '2018', 'bla'])) return clog ('Invalid tags.');
      if (! eq (rs.body.pivs [0].tags, ['2018', 'bla'])) return clog ('Invalid tags');
      if (! eq (rs.body.pivs [3].tags, ['2014', 'bla'])) return clog ('Invalid tags');
      return true;
   }],
   ['get tagged pivs again', 'post', 'query', {}, {tags: [], sort: 'oldest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.pivs [0].tags, ['2014', 'bla'])) return clog ('Invalid tags');
      if (! eq (rs.body.pivs [3].tags, ['2018', 'bla'])) return clog ('Invalid tags');
      return true;
   }],
   ['untag tag two pivs with tag they don\'t have', 'post', 'tag', {}, function (s) {
      return {tag: 'blablabla', ids: [s.pivs [0].id, s.pivs [3].id], del: true};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 2, bla: 2})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['untag two pivs', 'post', 'tag', {}, function (s) {
      return {tag: 'bla', ids: [s.pivs [0].id, s.pivs [3].id], del: true};
   }, 200],
   ['get tagged pivs after untagging', 'post', 'query', {}, {tags: ['bla'], sort: 'upload', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.tags.sort (), [])) return clog ('Invalid tags.');
      if (rs.body.total !== 0) return clog ('Searching by tag does not work.');
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['tag two pivs #2', 'post', 'tag', {}, function (s) {
      return {tag: 'bla   ', ids: [s.pivs [0].id, s.pivs [3].id]};
   }, 200],
   ['invalid delete #1', 'post', 'delete', {}, '', 400],
   ['invalid delete #2', 'post', 'delete', {}, [], 400],
   ['invalid delete #3', 'post', 'delete', {}, {ids: [1]}, 400],
   ['invalid delete #4', 'post', 'delete', {}, {ids: [['1']]}, 400],
   ['invalid delete #5', 'post', 'delete', {}, {ids: ['1', 2]}, 400],
   ['empty delete', 'post', 'delete', {}, {ids: []}, 200],
   ['delete nonexisting piv', 'post', 'delete', {}, {ids: ['foo']}, 404],
   ['delete tagged piv (repeated)', 'post', 'delete', {}, function (s) {
      return {ids: [s.pivs [3].id, s.pivs [3].id]};
   }, 400],
   ['delete tagged piv', 'post', 'delete', {}, function (s) {
      return {ids: [s.pivs [3].id]};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 1, 2017: 1, 2018: 1, all: 3, untagged: 2, bla: 1})) return clog (rs.body);
      return true;
   }],
   ['tag another piv', 'post', 'tag', {}, function (s) {
      return {tag: 'bla', ids: [s.pivs [2].id]};
   }, 200],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      s.pivs = rs.body.pivs;
      s.cookie0 = s.headers.cookie;
      return true;
   }],
   ['signup for the first time', 'post', 'auth/signup', {}, function (s) {
      return {username: U [1].username, password: U [1].password, token: s.itoken2, email: 'b@b.com'};
   }, 200, function (s, rq, rs) {
      s.vtoken2 = rs.body.token;
      return true;
   }],
   ['verify user', 'get', function (s) {return 'auth/verify/' + s.vtoken2}, {}, '', 302, function (s) {
      s.headers.cookie = s.cookie0;
      return true;
   }],
   ttester ('share piv', 'post', 'share', {}, [
      ['tag',  'string'],
      ['whom', 'string'],
      ['del', ['boolean', 'undefined']],
   ]),
   ['share invalid tag', 'post', 'share', {}, {tag: 'all\n\n', whom: U [1].username}, 400],
   ['share invalid tag', 'post', 'share', {}, {tag: 'untagged', whom: U [1].username}, 400],
   ['share with no such user', 'post', 'share', {}, {tag: 'bla', whom: U [1].username + 'a'}, 404],
   ['share a tag with no such user', 'post', 'share', {}, {tag: 'bla', whom: U [1].username + 'a'}, 404],
   ['get shared tags before sharing', 'get', 'share', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {sho: [], shm: []})) return clog ('Invalid body', rs.body);
      return true;
   }],
   ['share a tag with yourself', 'post', 'share', {}, {tag: '\n bla \t ', whom: H.trim (U [0].username)}, 400, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'self'})) return clog ('Invalid body', rs.body);
      return true;
   }],
   ['share a tag with a user', 'post', 'share', {}, {tag: '\n bla \t ', whom: U [1].username}, 200],
   ['share another tag with a user', 'post', 'share', {}, {tag: 'foo:bar', whom: U [1].username}, 200],
   ['get shared tags after', 'get', 'share', {}, '', 200, function (s, rq, rs) {
      rs.body.sho.sort (function (a, b) {
         return a [1] > b [1] ? 1 : -1;
      });
      if (! eq (rs.body, {sho: [[U [1].username, 'bla'], [U [1].username, 'foo:bar']], shm: []})) return clog ('Invalid body', rs.body);
      return true;
   }],
   ['unshare tag', 'post', 'share', {}, {tag: 'foo:bar', whom: U [1].username, del: true}, 200],
   ['login with valid credentials as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['get shared tags as user2', 'get', 'share', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {shm: [[U [0].username.replace (/^\s+/, '').replace (' \t', ''), 'bla']], sho: []})) return clog ('Invalid body', rs.body);
      return true;
   }],
   ['get pivs as user2', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 2) return clog ('user2 should have two pivs.');
      s.shared = rs.body.pivs;
      return true;
   }],
   ['get pivs as user2 with tag', 'post', 'query', {}, {tags: ['bla'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (! eq (rs.body.tags.sort (), ['2014', '2018', 'bla'])) return clog ('Invalid tags.');
      if (rs.body.pivs.length !== 2) return clog ('user2 should have two pivs with this tag.');
      return true;
   }],
   ['get pivs as user2 with recentlyTagged ids from other user', 'post', 'query', {}, function (s) {return {tags: ['untagged'], recentlyTagged: dale.go (s.pivs, function (v) {return v.id}), sort: 'upload', from: 1, to: 10}}, 200, function (s, rq, rs) {
      if (! eq (rs.body.tags.sort (), [])) return clog ('Invalid tags.');
      if (rs.body.pivs.length !== 0) return clog ('user2 should have no pivs.');
      return true;
   }],
   ['get shared piv as user2', 'get', function (s) {
      return 'piv/' + s.shared [0].id;
   }, {}, '', 200],
   ['get thumbnail 200 of shared piv as user2', 'get', function (s) {
      return 'thumb/200/' + s.shared [0].id;
   }, {}, '', 200],
   ['get thumbnail 900 of shared piv as user2', 'get', function (s) {
      return 'thumb/900/' + s.shared [0].id;
   }, {}, '', 200],
   ['fail getting nonshared piv as user2', 'get', function (s) {
      return 'piv/' + s.pivs [0].id;
   }, {}, '', 404],
   ttester ('download', 'post', 'download', {}, [
      ['ids', 'array'],
      [['ids', 0], 'string'],
   ]),
   ['download shared pivs (empty)', 'post', 'download', {}, {ids: []}, 400],
   ['download shared pivs (one piv)', 'post', 'download', {}, function (s) {
      return {ids: [s.shared [0].id]};
   }, 400],
   ['download shared pivs (two pivs, one lacking permission)', 'post', 'download', {}, function (s) {
      return {ids: [s.shared [0].id, s.pivs [0].id]};
   }, 404],
   ['download shared pivs as user2', 'post', 'download', {}, function (s) {
      return {ids: [s.shared [0].id, s.shared [1].id]};
   }, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object' || type (rs.body.id) !== 'string') return log ('Invalid id returned.');
      s.downloadId = rs.body.id;
      return true;
   }],
   {raw: true, tag: 'download multiple pivs', method: 'get', path: function (s) {return 'download/' + s.downloadId}, code: 200, apres: function (s, rq, rs, next) {
      fs.writeFileSync ('download.zip', rs.body);
      a.stop ([
         [k, 'unzip', 'download.zip'],
         function (S) {
            var file1 = fs.readFileSync (s.shared [0].name);
            var file2 = fs.readFileSync (s.shared [1].name);
            if (Buffer.compare (fs.readFileSync ('test/large.jpeg'), file1) !== 0) return clog ('Mismatch between expected and actual download #1.');
            if (Buffer.compare (fs.readFileSync ('test/medium.jpg'), file2) !== 0) return clog ('Mismatch between expected and actual download #2.');
            var mtime = fs.statSync (s.shared [1].name).mtime.getTime ();
            fs.unlinkSync (s.shared [0].name);
            fs.unlinkSync (s.shared [1].name);
            fs.unlinkSync ('download.zip');
            if (mtime !== new Date ('2018-06-03T00:00:00.000Z').getTime ()) return clog ('Invalid mtime on zip file', mtime, new Date ('2018-06-03T00:00:00.000Z').getTime ());
            next ();
         }
      ], clog);
   }},
   ['login with valid credentials as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['request download of another user', 'get', function (s) {return 'download/' + s.downloadId}, {}, '', 403],
   ['login with valid credentials as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs, next) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      setTimeout (next, 5000);
   }],
   ['download multiple pivs after link expired', 'get', function (s) {return 'download/' + s.downloadId}, {}, '', 404],
   ['login with valid credentials as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['download own pivs', 'post', 'download', {}, function (s) {
      return {ids: [s.shared [0].id, s.shared [1].id]};
   }, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object' || type (rs.body.id) !== 'string') return log ('Invalid id returned.');
      s.downloadId = rs.body.id;
      return true;
   }],
   {raw: true, tag: 'download multiple pivs (own)', method: 'get', path: function (s) {return 'download/' + s.downloadId}, code: 200, apres: function (s, rq, rs, next) {
      fs.writeFileSync ('download.zip', rs.body);
      a.stop ([
         [k, 'unzip', 'download.zip'],
         function (S) {
            var file1 = fs.readFileSync (s.shared [0].name);
            var file2 = fs.readFileSync (s.shared [1].name);
            if (Buffer.compare (fs.readFileSync ('test/large.jpeg'), file1) !== 0) return clog ('Mismatch between expected and actual download #1.');
            if (Buffer.compare (fs.readFileSync ('test/medium.jpg'), file2) !== 0) return clog ('Mismatch between expected and actual download #2.');
            fs.unlinkSync (s.shared [0].name);
            fs.unlinkSync (s.shared [1].name);
            fs.unlinkSync ('download.zip');
            setTimeout (next, 5000);
         }
      ], clog);
   }},
   ['download multiple pivs after link expired', 'get', function (s) {return 'download/' + s.downloadId}, {}, '', 404],
   ['tag rotated piv', 'post', 'tag', {}, function (s) {
      return dale.stopNot (s.pivs, undefined, function (piv) {
         if (piv.name === 'rotate.jpg') return {tag: '\nrotate', ids: [piv.id]};
      });
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      return true;
   }],
   ['share rotate tag with a user', 'post', 'share', {}, {tag: 'rotate', whom: U [1].username}, 200],
   ['login with valid credentials as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['get pivs as user2', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 3) return clog ('user2 should have three pivs.');
      s.pivs2 = rs.body.pivs;
      return true;
   }],
   ['get `rotate` pivs as user2', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 1) return clog ('user2 should have one `rotate` piv.');
      return true;
   }],
   dale.go (dale.times (2, 0), function (k) {
      return [
         ['get piv #' + (k + 1), 'get', function (s) {
            return 'piv/' + s.pivs2 [k].id;
         }, {}, '', 200],
         ['get thumb 200 #' + (k + 1), 'get', function (s) {
            return 'thumb/200/' + s.pivs2 [k].id;
         }, {}, '', 200],
         ['get thumb 900 #' + (k + 1), 'get', function (s) {
            return 'thumb/900/' + s.pivs2 [k].id;
         }, {}, '', 200],
      ];
   }),
   ['start upload as user 2', 'post', 'metaupload', {}, {op: 'start', total: 3}, 200, function (s, rq, rs) {
      if (! eq (rs.body, {id: rs.body.id})) return clog ('Invalid body.');
      if (type (rs.body.id) !== 'integer') return clog ('Invalid body.id.');
      s.uid4 = rs.body.id;
      return true;
   }],
   ['upload lopsided piv as user2 with invalid tags #1', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'rotate.jpg'},
      {type: 'field', name: 'id', value: s.uid4},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '{}'}
   ]}}, 400],
   ['upload lopsided piv as user2 with invalid tags #2', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'rotate.jpg'},
      {type: 'field', name: 'id', value: s.uid4},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '2'}
   ]}}, 400],
   ['upload lopsided piv as user2 with invalid tags #3', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'rotate.jpg'},
      {type: 'field', name: 'id', value: s.uid4},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["hello", 1]'}
   ]}}, 400],
   ['upload lopsided piv as user2 with invalid tags #4', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'rotate.jpg'},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["hello", "all"]'}
   ]}}, 400],
   ['upload lopsided piv as user2', 'post', 'upload', {}, function (s) {return {multipart: [
      {type: 'file',  name: 'piv', path: PIVS + 'rotate.jpg'},
      {type: 'field', name: 'id', value: s.uid4},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["rotate"]'}
   ]}}, 200],
   ['get all pivs as user2', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 3) return clog ('user2 should have three pivs.');
      if (rs.body.total !== 3) return clog ('total not computed properly with repeated pivs.');
      if (rs.body.pivs [0].id === s.pivs2 [0].id) return clog ('user2 should have own piv as priority.');
      s.rotate2 = rs.body.pivs [0];
      return true;
   }],
   ['get `rotate` pivs as user2', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 1) return clog ('user2 should have one `rotate` piv.');
      if (rs.body.total !== 1) return clog ('total not computed properly with repeated pivs.');
      if (rs.body.pivs [0].id === s.pivs2 [0].id) return clog ('user2 should have own piv as priority.');
      s.repeated = rs.body.pivs [0].id;
      return true;
   }],
   ['share rotate tag with user1', 'post', 'share', {}, {tag: 'rotate', whom: U [0].username.replace (/^\s+/, '').replace (' \t', '')}, 200],
   ['get `rotate` pivs as user2 after sharing', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 1) return clog ('user2 should have one `rotate` piv.');
      if (rs.body.pivs [0].id === s.pivs2 [0].id) return clog ('user2 should have own piv as priority.');
      return true;
   }],
   ['login as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['get `rotate` pivs as user1 after sharing', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 1) return clog ('user1 should have one `rotate` piv.');
      if (rs.body.pivs [0].id !== s.pivs2 [0].id) return clog ('user1 should have own piv as priority.');
      return true;
   }],
   ['get all pivs as user1 after sharing', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 3) return clog ('user1 should have one `rotate` piv.');
      return true;
   }],
   ['login as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['unshare user1', 'post', 'share', {}, {tag: 'rotate', whom: U [0].username.replace (/^\s+/, '').replace (' \t', ''), del: true}, 200],
   ['login as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['get `rotate` pivs as user1 after unsharing', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs.length !== 1) return clog ('user1 should have one `rotate` piv.');
      if (rs.body.pivs [0].id !== s.pivs2 [0].id) return clog ('user1 should have own piv after unsharing.');
      return true;
   }],
   ['login as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['delete piv as user2', 'post', 'delete', {}, function (s) {
      return {ids: [s.rotate2.id]};
   }, 200],
   ['delete account', 'post', 'auth/delete', {}, {}, 200],
   ['login as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['delete multiple pivs', 'post', 'delete', {}, function (s) {
      return {ids: [s.pivs [0].id, s.pivs [1].id, s.pivs [2].id]};
   }, 200],
   ['get pivs', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.total !== 0) return clog ('Some pivs were not deleted.');
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {all: 0})) return clog (rs.body);
      return true;
   }],
   ['unshare as user1 after user2 was deleted', 'post', 'share', {}, {tag: 'bla', whom: U [1].username, del: true}, 404],
   // *** NON-MP4 VIDEO FORMATS ***
   dale.go (['circus.MOV', 'boat.3gp', 'drumming.avi'], function (vid, k) {
      var format = require ('path').extname (vid).replace ('.', '');
      return [
         ['upload ' + format, 'post', 'upload', {}, function (s) {return {multipart: [
            {type: 'file',  name: 'piv', path: PIVS + vid},
            {type: 'field', name: 'id', value: s.uid3},
            {type: 'field',  name: 'lastModified', value: Date.now ()}
         ]}}, 200, function (s, rq, rs) {
            if (type (rs.body) !== 'object' || type (rs.body.id) !== 'string') return clog ('No id returned.');
            if (! s.nonmp4) s.nonmp4 = [];
            s.nonmp4.push (rs.body);
            return true;
         }],
         ['get ' + format, 'get', function (s) {
            return 'piv/' + s.nonmp4 [k].id + '?original=1';
         }, {}, '', 200, function (s, rq, rs) {
            var contentType = ['video/quicktime', 'video/3gpp', 'video/x-msvideo'] [k];
            if (rs.headers ['content-type'] !== contentType) return clog ('Invalid content type: ' + rs.headers ['content-type']);
            return true;
         }],
         ['get mp4 for ' + format + ' while conversion is ongoing', 'get', function (s) {
            return 'piv/' + s.nonmp4 [k].id;
         }, {}, '', 404, function (s, rq, rs) {
            if (rs.body !== 'pending') return clog ('Invalid body ' + rs.body);
            return true;
         }],
         // Delete .mov and .avi, but not .3gp
         k === 1 ? [] : ['delete ' + format, 'post', 'delete', {}, function (s) {
            return {ids: [s.nonmp4 [k].id]};
         }, 200, function (s, rq, rs, next) {
            // For the last video, wait 5 seconds
            if (k === 2) {
               setTimeout (next, 5000);
               return;
            }
            return true;
         }]
      ];
   }),
   ['get mp4 for 3gp after conversion is done', 'get', function (s) {
      return 'piv/' + s.nonmp4 [1].id;
   }, {}, '', 200, function (s, rq, rs) {
      if (rs.headers ['content-type'] !== 'video/mp4') return clog ('Invalid content type: ' + rs.headers ['content-type']);
      return true;
   }],
   ['get non-mp4 videos', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pivs [0].name !== 'boat.3gp') return clog ('Invalid name field: ' + rs.body [0].name);
      if (rs.body.pivs [0].vid !== true) return clog ('Invalid vid field: ' + rs.body [0].vid);
      return true;
   }],
   ['delete 3gp', 'post', 'delete', {}, function (s) {
      return {ids: [s.nonmp4 [1].id]};
   }, 200],
   // *** CHECK CLEANUP BEFORE END ***
   ['get account at the end of the test cycle', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      if (type (rs.body) !== 'object') return clog ('Body must be object');
      if (! eq ({username: userPrefix + ' 1', email: 'a@a.com'}, {username: rs.body.username, email: rs.body.email})) return clog ('Invalid values in fields.');
      if (type (rs.body.created) !== 'integer') return clog ('Invalid created field');
      var logLength = skipAuth ? 88 : 97;
      if (type (rs.body.logs) !== 'array' || (rs.body.logs.length !== logLength && rs.body.logs.length !== logLength + 1)) return clog ('Invalid logs, length ' + rs.body.logs.length);
      // Wait for S3
      setTimeout (next, skipS3 ? 0 : 3000);
   }],
   ['get account at the end of the test cycle (wait for S3)', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      if (skipS3 && ! eq (rs.body.usage, {limit: CONFIG.freeSpace, fsused: 0, s3used: rs.body.s3used})) return true;
      else if (eq (rs.body.usage, {limit: CONFIG.freeSpace, fsused: 0, s3used: 0})) return true;
      if (skipS3) return true;
      setTimeout (function () {
         if (! eq (rs.body.usage, {limit: CONFIG.freeSpace, fsused: 0, s3used: 0})) return next ('Invalid usage field.');
         next ();
      }, 2000);
   }],
   ['get public stats before deleting user', 'get', 'stats', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {byfs: 0, bys3: skipS3 ? rs.body.bys3 : 0, pics: 0, vids: 0, t200: 0, t900: 0, users: 1})) return clog ('Invalid public stats.');
      return true;
   }],
   // TODO: add admin/stats test
   /*
   ['get stats after test', 'get', 'admin/stats', {}, '', 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid body', rs.body);
      if (rs.body.users !== 1) return clog ('Invalid users');
      if (rs.body.pivs !== 0)  return clog ('Invalid pivs');
      if (rs.body.bytes !== 0) return clog ('Invalid bytes');
      return true;
   }],
   */
];

h.seq ({port: CONFIG.port}, [
   intro,
   main,
   outro,
], function (error) {
   if (error) {
      if (error.request && error.request.body && type (error.request.body) === 'string') error.request.body = error.request.body.slice (0, 1000) + (error.request.body.length > 1000 ? '... OMITTING REMAINDER' : '');
      return clog ('FINISHED WITH AN ERROR', error);
   }
   clog ('ALL TESTS FINISHED SUCCESSFULLY!');
}, function (test) {
   if (type (test) === 'object') return test;
   if (test [1] === 'post' && test [4]) {
      var b = test [4];
      test [4] = function (s) {
         if (type (b) === 'function') b = b (s);
         if (! s.headers || ! s.headers.cookie) return b;
         if (['auth/signup', 'auth/login', 'auth/recover', 'auth/reset'].indexOf (test [2]) !== -1) return b;
         var b2 = teishi.copy (b);
         if (b2.multipart) b2.multipart.push ({type: 'field', name: 'csrf', value: s.csrf});
         else b2.csrf = s.csrf;
         return b2;
      }
   }
   return h.stdmap (test);
});
