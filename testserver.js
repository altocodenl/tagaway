if (process.argv [2]) return console.log ('Tests cannot only be run locally.');

var CONFIG = require ('./config.js');
var dale   = require ('dale');
var teishi = require ('teishi');
var h      = require ('hitit');
var a      = require ('./lib/astack.js');
var fs     = require ('fs');
var clog   = teishi.clog, type = teishi.type, eq = teishi.eq;

var U = [
   {username: '   user  \t1', password: Math.random () + '@', tz: new Date ().getTimezoneOffset ()},
   {username: 'user2',        password: Math.random () + '@', tz: new Date ().getTimezoneOffset ()},
];

var PICS = 'test/';

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
      if (! teishi.eq (rs.body, {byfs: 0, bys3: 0, pics: 0, vids: 0, t200: 0, t900: 0, users: 0})) return clog ('Invalid public stats.');
      return true;
   }],
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
      ['tz',       'integer'],
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
   ['create invite for user', 'post', 'admin/invites', {}, {firstName: 'a', email: 'a@a.com  '}, 200, function (s, rq, rs) {
      s.itoken1 = rs.body.token;
      return true;
   }],
   ['create invite for user', 'post', 'admin/invites', {}, {firstName: 'b', email: 'b@b.com  '}, 200, function (s, rq, rs) {
      s.itoken2 = rs.body.token;
      return true;
   }],
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
   ['signup for the first time', 'post', 'auth/signup', {}, function (s) {
      return {username: U [0].username, password: U [0].password, token: s.itoken1, email: 'a@a.com'};
   }, 200, function (s, rq, rs) {
      if (! rs.body.token) return clog ('No token returned after signup!');
      s.vtoken1 = rs.body.token;
      return true;
   }],
   ['login with invalid credentials #1', 'post', 'auth/login', {}, {username: U [0].username, password: 'foo', tz: new Date ().getTimezoneOffset ()}, 403, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'auth'})) return clog ('Invalid payload sent, expecting {error: "auth"}');
      return true;
   }],
   ['login with invalid credentials #2', 'post', 'auth/login', {}, {username: 'bar', password: 'foo', tz: new Date ().getTimezoneOffset ()}, 403, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'auth'})) return clog ('Invalid payload sent, expecting {error: "auth"}');
      return true;
   }],
   ['login with valid credentials before verification', 'post', 'auth/login', {}, {username: U [0].username, password: U [0].password, tz: new Date ().getTimezoneOffset ()}, 403, function (s, rq, rs) {
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
   ['recover pass', 'post', 'auth/recover', {}, {username: 'user\t  1  '}, 200, function (s, rq, rs) {
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
   ['login with valid credentials after verification (with email)', 'post', 'auth/login', {}, function () {return {username: ' \t  a@a.com', password: U [0].password, tz: new Date ().getTimezoneOffset ()}}, 200],
   ['login with valid credentials after verification (with email)', 'post', 'auth/login', {}, function () {return {username: 'A@A.com  ', password: U [0].password, tz: new Date ().getTimezoneOffset ()}}, 200],
   ['login with valid credentials after verification (with email)', 'post', 'auth/login', {}, function () {return {username: ' USER 1\t   ', password: U [0].password, tz: new Date ().getTimezoneOffset ()}}, 200, function (s, rq, rs) {
      if (! rs.headers ['set-cookie'] || ! rs.headers ['set-cookie'] [0] || rs.headers ['set-cookie'] [0].length <= 5) return clog ('Invalid cookie.');
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      if (! rs.body || ! rs.body.csrf) return clog ('Invalid CSRF token');
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
   ['login with valid credentials after second password change', 'post', 'auth/login', {}, function () {return {username: ' USER 1\t   ', password: U [0].password, tz: new Date ().getTimezoneOffset ()}}, 200, function (s, rq, rs) {
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
      if (! teishi.eq (rs.body, {byfs: 0, bys3: 0, pics: 0, vids: 0, t200: 0, t900: 0, users: 0})) return clog ('Invalid public stats.');
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
      if (! eq ({username: 'user 1', email: 'a@a.com', type: 'tier1'}, {username: rs.body.username, email: rs.body.email, type: rs.body.type})) return clog ('Invalid values in fields.');
      if (type (rs.body.created) !== 'integer') return clog ('Invalid created field');
      if (! teishi.eq (rs.body.usage, {limit: CONFIG.storelimit.tier1, fsused: 0, s3used: 0})) return clog ('Invalid usage field.');
      if (type (rs.body.logs) !== 'array' || (rs.body.logs.length !== 9 && rs.body.logs.length !== 10)) return clog ('Invalid logs.');
      return true;
   }],
   ttester ('query pics', 'post', 'query', {}, [
      ['tags', 'array'],
      [['tags', 0], 'string'],
      ['mindate', ['undefined', 'integer']],
      ['maxdate', ['undefined', 'integer']],
      ['sort', 'string'],
      ['from', 'integer'],
      ['to', 'integer'],
   ]),
   {tag: 'query pics without csrf token', method: 'post', path: 'query', code: 403, body: {tags: ['all'], sort: 'newest', from: 1, to: 10}, apres: function (s, rq, rs) {
      if (! eq (rs.body, {error: 'csrf'})) return clog ('Invalid payload');
      return true;
   }},
   {tag: 'query pics with invalid csrf token', method: 'post', path: 'query', code: 403, body: {csrf: 'foobar', tags: ['all'], sort: 'newest', from: 1, to: 10}, apres: function (s, rq, rs) {
      if (! eq (rs.body, {error: 'csrf'})) return clog ('Invalid payload');
      return true;
   }},
   ['query pics with invalid tag', 'post', 'query', {}, {tags: ['all'], sort: 'newest', from: 1, to: 10}, 400],
   ['get invalid range of pics', 'post', 'query', {}, {tags: [], sort: 'newest', from: 3, to: 1}, 400],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (! eq (rs.body, {total: 0, pics: [], tags: []})) return clog ('Invalid payload');
      return true;
   }],
   ['upload invalid payload #1', 'post', 'upload', {}, '', 400],
   ['upload invalid payload #2', 'post', 'upload', {}, 1, 400],
   ['upload invalid payload #3', 'post', 'upload', {}, [], 400],
   ['upload invalid payload #4', 'post', 'upload', {}, {}, 400],
   ['upload invalid payload #5', 'post', 'upload', {}, {file: {}}, 400],
   // upload invalid video
   ['upload video #1', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'tram.mp4'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 200],
   ['upload video #2', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'bach.mp4'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 200],
   ['upload repeated video', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'bach.mp4'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 409],
   ['get pics (videos)', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 2) return clog ('Invalid total count.');
      if (! teishi.eq (rs.body.tags, ['2018'])) return clog ('Invalid tags.');
      if (type (rs.body.pics) !== 'array') return clog ('Invalid pic array.');
      s.vids = dale.go (rs.body.pics, function (pic) {return pic.id});
      var vid1 = rs.body.pics [0], vid2 = rs.body.pics [1];
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

      if (! eq (vid1, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'tram.mp4',
         dimh: 1920,
         dimw: 1080,
         tags: ['2018'],
         vid: true,
         date: 1544889597000,
      })) return clog ('Invalid vid #1 fields.');
      if (! eq (vid2, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'bach.mp4',
         dimh: 768,
         dimw: 1366,
         tags: ['2018'],
         vid: true,
         date: 1538154339000,
      })) return clog ('Invalid vid #2 fields.');
      return true;
   }],
   dale.go (dale.times (2, 0), function (k) {
      return {tag: 'get videos', method: 'get', path: function (s) {return 'pic/' + s.vids [k]}, code: 200, raw: true, apres: function (s, rq, rs) {
         var up       = Buffer.from (rs.body, 'binary');
         var original = require ('fs').readFileSync ([PICS + 'tram.mp4', PICS + 'bach.mp4'] [k]);
         if (Buffer.compare (up, original) !== 0) return clog ('Mismatch between original and uploaded video!');
         return true;
      }};
   }),
   ['upload invalid video', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'invalid.mp4'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 400, function (s, rq, rs) {
      if (! rs.body || type (rs.body.error) !== 'string') return clog ('No error present.');
      if (! rs.body.error.match (/^Invalid video:/)) return clog ('Invalid error message.');
      return true;
   }],
   ['delete videos', 'post', 'delete', {}, function (s) {
      return {ids: s.vids};
   }, 200],
   ['upload empty picture', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'empty.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field', name: 'lastModified', value: Date.now ()},
   ]}, 400],
   ['upload invalid picture', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'invalid.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 400, function (s, rq, rs) {
      if (! rs.body || type (rs.body.error) !== 'string') return clog ('No error present.');
      if (! rs.body.error.match (/^Invalid image:/)) return clog ('Invalid error message.');
      return true;
   }],
   ['upload picture without uid', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 400],
   ['upload picture without lastModified', 'post', 'upload', {}, {multipart: [
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'file',  name: 'pic', path: PICS + 'small.png'}
   ]}, 400],
   ['upload small picture with extra text field', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'extra', value: Date.now ()}
   ]}, 400],
   ['upload small picture with extra file field', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'file',  name: 'pic2', path: PICS + 'small.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 400],
   ['upload small picture with invalid tags #1', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: 'foobar'},
   ]}, 400],
   ['upload small picture with invalid tags #2', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify ([2])},
   ]}, 400],
   ['upload small picture with invalid tags #3', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify (['hello', 'all'])},
   ]}, 400],
   ['upload small picture with invalid tags #4', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify (['hello', '2017'])},
   ]}, 400],
   ['upload small picture', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: new Date ('2018-06-07T00:00:00.000Z').getTime ()}
   ]}, 200, function (s, rq, rs, next) {
      // Wait for S3 to delete the videos uploaded before and the image just uploaded
      setTimeout (next, 5000);
   }],
   ['check usage after uploading small picture (wait for S3)', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.usage.fsused !== 3370) return clog ('Invalid FS usage.');
      if (rs.body.usage.s3used !== 3402) return clog ('Invalid S3 usage.');
      return true;
   }],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 1) return clog ('Invalid total count.');
      if (! teishi.eq (rs.body.tags, ['2014'])) return clog ('Invalid tags.');
      if (type (rs.body.pics) !== 'array') return clog ('Invalid pic array.');
      var pic = rs.body.pics [0];
      s.smallpic = teishi.copy (pic);
      if (pic.date !== H.getDate ('2014:05:08 00:06:23'))  return clog ('Invalid pic.date');
      if (type (pic.date)   !== 'integer') return clog ('Invalid pic.date.');
      if (type (pic.dateup) !== 'integer') return clog ('Invalid pic.dateup.');
      delete pic.date;
      delete pic.dateup;
      if (type (pic.id) !== 'string') return clog ('Invalid pic.id.');
      delete pic.id;
      if (! eq (pic, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'small.png',
         dimh: 149,
         dimw: 149,
         tags: ['2014']
      })) return clog ('Invalid pic fields.');
      return true;
   }],
   ['upload duplicated picture', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'smalldup.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 409],
   ['delete freshly uploaded picture', 'post', 'delete', {}, function (s) {
      return {ids: [s.smallpic.id]};
   }, 200],
   ['upload small picture again', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'small.png'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: new Date ('2018-06-07T00:00:00.000Z').getTime ()}
   ]}, 200],
   ['upload medium picture', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'medium.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: new Date ('2018-06-03T00:00:00.000Z').getTime ()}
   ]}, 200],
   ['check usage after uploading medium picture', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      if (rs.body.usage.fsused !== 3370 + 22644 + 8694) return clog ('Invalid FS usage.');
      if (rs.body.usage.s3used !== 0 && rs.body.usage.s3used !== 3402) return clog ('Invalid S3 usage.');
      // Wait for S3
      setTimeout (next, 3000);
   }],
   ['upload medium picture with no metadata', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'medium-nometa.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: new Date ('2018-06-03T00:00:00.000Z').getTime ()}
   ]}, 409],
   ['check usage after uploading medium picture (wait for S3)', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (rs.body.usage.fsused !== 3370 + 22644 + 8694) return clog ('Invalid FS usage.');
      if (rs.body.usage.s3used !== 3402 + 22676)        return clog ('Invalid S3 usage.');
      return true;
   }],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 2) return clog ('Invalid total count.');
      if (! teishi.eq (rs.body.tags.sort (), ['2014', '2018'])) return clog ('Invalid tags.');
      if (type (rs.body.pics) !== 'array') return clog ('Invalid pic array.');
      var pic = rs.body.pics [0];
      if (pic.date !== H.getDate ('2018-06-03T00:00:00.000Z')) return clog ('Invalid pic.date');
      if (type (pic.dateup) !== 'integer') return clog ('Invalid pic.dateup.');
      delete pic.date;
      delete pic.dateup;
      if (type (pic.id) !== 'string') return clog ('Invalid pic.id.');
      delete pic.id;
      if (type (pic.t200) !== 'string') return clog ('Invalid pic.t200.');
      delete pic.t200;
      if (! eq (pic, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'medium.jpg',
         dimh: 204,
         dimw: 248,
         tags: ['2018']
      })) return clog ('Invalid pic fields.');
      return true;
   }],
   ['upload large picture', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'large.jpeg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 200],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 3) return clog ('Invalid total count.');
      if (! teishi.eq (rs.body.tags.sort (), ['2014', '2018'])) return clog ('Invalid tags.');
      if (type (rs.body.pics) !== 'array') return clog ('Invalid pic array.');
      if (rs.body.pics.length !== 1) return clog ('Invalid amount of pictures returned.');
      var pic = rs.body.pics [0];
      if (pic.date !== H.getDate ('2014:07:20 18:20:31')) return clog ('Invalid pic.date');
      delete pic.date;
      delete pic.dateup;
      delete pic.id;
      if (type (pic.t200) !== 'string') return clog ('Invalid pic.t200.');
      if (type (pic.t900) !== 'string') return clog ('Invalid pic.t900.');
      delete pic.t200;
      delete pic.t900;
      return true;
      if (! eq (pic, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'large.jpeg',
         dimh: 204,
         dimw: 248,
         tags: ['2014']
      })) return clog ('Invalid pic fields.');
      return true;
   }],
   ['upload lopsided picture', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'rotate.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()}
   ]}, 200],
   ['check that automatic rotation is on the upload log', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      var lastLog = rs.body.logs [0];
      if (lastLog.deg !== 90) return clog ('No `deg` field on autorotated picture.');
      return true;
   }],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid payload.');
      if (rs.body.total !== 4) return clog ('Invalid total count.');
      if (! teishi.eq (rs.body.tags.sort (), ['2014', '2017', '2018'])) return clog ('Invalid tags.');
      if (type (rs.body.pics) !== 'array') return clog ('Invalid pic array.');
      var pic = rs.body.pics [0];
      if (type (pic.date)   !== 'integer') return clog ('Invalid pic.date.');
      if (type (pic.dateup) !== 'integer') return clog ('Invalid pic.dateup.');
      if (pic.date !== H.getDate ('2017:03:22 17:35:20')) return clog ('Invalid date.');
      s.rotateid = pic.id;
      s.rotatepic = teishi.copy (pic);
      delete pic.date;
      delete pic.dateup;
      if (type (pic.id) !== 'string') return clog ('Invalid pic.id.');
      delete pic.id;
      if (type (pic.t200) !== 'string') return clog ('Invalid pic.t200.');
      delete pic.t200;
      if (type (pic.t900) !== 'string') return clog ('Invalid pic.t900.');
      delete pic.t900;
      if (! eq (pic, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'rotate.jpg',
         dimh: 1232,
         dimw: 2048,
         deg:  90,
         tags: ['2017']
      })) return clog ('Invalid pic fields.');
      return true;
   }],
   ttester ('rotate pic', 'post', 'rotate', {}, [
      ['ids', 'array'],
      [['ids', 0], 'string'],
      ['deg', 'integer'],
   ]),
   ['rotate pic (invalid #1)', 'post', 'rotate', {}, {ids: ['hello'], deg: 45}, 400],
   ['rotate pic (invalid #2, repeated)', 'post', 'rotate', {}, {ids: ['hello', 'hello'], deg: -90}, 400],
   ['rotate pic (invalid #3, type)', 'post', 'rotate', {}, {ids: 'hello', deg: -90}, 400],
   ['rotate pic nonexisting #1', 'post', 'rotate', {}, {ids: ['hello'], deg: -90}, 404],
   ['rotate pic nonexisting #2', 'post', 'rotate', {}, function (s) {
      return {ids: [s.rotateid, 'foo'], deg: 90};
   }, 404],
   ['rotate pic', 'post', 'rotate', {}, function (s) {
      return {ids: [s.rotateid], deg: -90};
   }, 200],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body.tags.sort (), ['2014', '2017', '2018'])) return clog ('Invalid tags.');
      var pic = rs.body.pics [0];
      delete pic.id;
      if (type (pic.t200) !== 'string') return clog ('Invalid pic.t200.');
      delete pic.t200;
      if (type (pic.t900) !== 'string') return clog ('Invalid pic.t900.');
      delete pic.t900;
      if (s.rotatepic.date !== pic.date)     return clog ('date changed after rotate.');
      if (s.rotatepic.dateup !== pic.dateup) return clog ('dateup changed after rotate.');
      s.rotatedate = pic.date;
      delete pic.date;
      delete pic.dateup;
      if (! eq (pic, {
         owner: U [0].username.replace (/^\s+/, '').replace (' \t', ''),
         name: 'rotate.jpg',
         dimh: 1232,
         dimw: 2048,
         tags: ['2017']
      })) return clog ('Invalid pic fields.');
      return true;
   }],
   ['rotate pic again', 'post', 'rotate', {}, function (s) {
      return {ids: [s.rotateid], deg: 90};
   }, 200],
   dale.go ([[-90, undefined], [180, 180], [180, undefined], [-90, -90], [-90, 180], [-90, 90], [180, -90], [90, undefined]], function (pair, k) {
      return [
         ['rotate pic #' + (k + 2), 'post', 'rotate', {}, function (s) {
            return {ids: [s.rotateid], deg: pair [0]};
         }, 200],
         ['get pics', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
            var pic = rs.body.pics [0];
            if (pic.deg !== pair [1]) return clog ('Rotate wasn\'t calculated properly.');
            return true;
         }],
      ];
   }),
   ['upload picture with different date format', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'dunkerque.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: JSON.stringify (['dunkerque\t', '   beach'])},
   ]}, 200],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs, next) {
      if (! teishi.eq (rs.body.tags.sort (), ['2014', '2017', '2018', 'beach', 'dunkerque'])) return clog ('Invalid tags.');
      var pic = rs.body.pics [0];
      if (pic.date !== H.getDate ('2018:03:26 13:23:34')) return clog ('GPS timestamp wasn\'t ignored.');
      if (! eq (pic.tags.sort (), ['2018', 'beach', 'dunkerque'])) return clog ('Wrong year tag.');
      s.dunkerque = pic.id;
      s.allpics = rs.body.pics;
      // Wait for S3
      setTimeout (next, 8000);
   }],
   ['get public stats before deleting pictures', 'get', 'stats', {}, '', 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body, {byfs: 6385276, bys3: 6128443, pics: 5, vids: 0, t200: 4, t900: 3, users: 1})) return clog ('Invalid public stats');
      return true;
   }],
   dale.go (dale.times (5, 0), function (k) {
      return {tag: 'get original pic', method: 'get', path: function (s) {return 'original/' + s.allpics [k].id}, code: 200, raw: true, apres: function (s, rq, rs) {
         var up       = Buffer.from (rs.body, 'binary');
         var original = require ('fs').readFileSync ([PICS + 'dunkerque.jpg', PICS + 'rotate.jpg', PICS + 'large.jpeg', PICS + 'medium.jpg', PICS + 'small.png'] [k]);
         if (Buffer.compare (up, original) !== 0) return clog ('Mismatch between original and uploaded picture!');
         return true;
      }};
   }),
   ['delete picture with different date format', 'post', 'delete', {}, function (s) {
      return {ids: [s.dunkerque]};
   }, 200],
   ['get pics by newest', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg', 'rotate.jpg', 'large.jpeg', 'small.png'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by oldest', 'post', 'query', {}, {tags: [], sort: 'oldest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['small.png', 'large.jpeg', 'rotate.jpg', 'medium.jpg'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by mindate #1', 'post', 'query', {}, function (s) {
      return {tags: [], sort: 'newest', from: 1, to: 4, mindate: s.rotatedate};
   }, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg', 'rotate.jpg'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by mindate #2', 'post', 'query', {}, function (s) {
      return {tags: [], sort: 'oldest', from: 1, to: 4, mindate: s.rotatedate};
   }, 200, function (s, rq, rs) {
      if (! eq (['rotate.jpg', 'medium.jpg'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by maxdate #1', 'post', 'query', {}, function (s) {
      return {tags: [], sort: 'newest', from: 1, to: 4, maxdate: s.rotatedate};
   }, 200, function (s, rq, rs) {
      if (! eq (['rotate.jpg', 'large.jpeg', 'small.png'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by maxdate #2', 'post', 'query', {}, function (s) {
      return {tags: [], sort: 'oldest', from: 1, to: 4, maxdate: s.rotatedate};
   }, 200, function (s, rq, rs) {
      if (! eq (['small.png', 'large.jpeg', 'rotate.jpg'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by year #1', 'post', 'query', {}, {tags: ['2018'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by year #2', 'post', 'query', {}, {tags: ['2018'], sort: 'oldest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by year #3', 'post', 'query', {}, {tags: ['2017', '2018'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['medium.jpg', 'rotate.jpg'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get pics by year #4', 'post', 'query', {}, {tags: ['2017', '2014', '2015'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (['rotate.jpg', 'large.jpeg', 'small.png'], dale.go (rs.body.pics, function (v) {
         return v.name;
      }))) return clog ('Invalid pic date sorting');
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ttester ('tag pic', 'post', 'tag', {}, [
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
   ['tag invalid nonexisting #1', 'post', 'tag', {}, {tag: 'hello', ids: ['a']}, 404],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      s.pics = rs.body.pics;
      return true;
   }],
   dale.go (dale.times (4, 0), function (k) {
      return [
         ['get pic #' + (k + 1), 'get', function (s) {
            return 'pic/' + s.pics [k].id;
         }, {}, '', 200],
         ['get thumb of pic #' + (k + 1), 'get', function (s) {
            return 'thumbof/' + s.pics [k].id;
         }, {}, '', 200],
         k === 3 ? [] : ['get thumb 200 #' + (k + 1), 'get', function (s) {
            return 'thumb/' + s.pics [k].t200;
         }, {}, '', 200],
         k === 3 ? [] : ['get thumb 900 #' + (k + 1), 'get', function (s) {
            return 'thumb/' + s.pics [k].t200;
         }, {}, '', 200],
      ];
   }),
   ['tag nonexisting #2', 'post', 'tag', {}, function (s) {
      return {tag: '\tfoo', ids: [s.pics [0].id, 'b']};
   }, 404],
   ['tag valid #1', 'post', 'tag', {}, function (s) {
      return {tag: '\tfoo', ids: [s.pics [3].id]};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 3, foo: 1})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get tagged pic', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.pics [3].tags, ['2014', 'foo'])) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['tag again', 'post', 'tag', {}, function (s) {
      return {tag: 'foo', ids: [s.pics [3].id]};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 3, foo: 1})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get tagged pic', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.pics [3].tags, ['2014', 'foo'])) return clog ('Invalid tags');
      return true;
   }],
   ['get tagged pic', 'post', 'query', {}, {tags: ['foo'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body.tags.sort (), ['2014', 'foo'])) return clog ('Invalid tags.');
      if (rs.body.total !== 1) return clog ('Searching by tag does not work.');
      if (! eq (rs.body.pics [0].tags, ['2014', 'foo'])) return clog ('Invalid tags');
      return true;
   }],
   ['untag #1', 'post', 'tag', {}, function (s) {
      return {tag: '\tfoo  ', ids: [s.pics [3].id, s.pics [0].id], del: true};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['get pic after untagging', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.pics [3].tags, ['2014'])) return clog ('Invalid tags');
      return true;
   }],
   ['get tagged pic after untagging', 'post', 'query', {}, {tags: ['foo'], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body.tags.sort (), [])) return clog ('Invalid tags.');
      if (rs.body.total !== 0) return clog ('Searching by tag does not work.');
      return true;
   }],
   ['tag two pics #1', 'post', 'tag', {}, function (s) {
      return {tag: '  bla', ids: [s.pics [0].id, s.pics [3].id]};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 2, bla: 2})) return clog (rs.body);
      return true;
   }],
   ['get tagged pics', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body.tags.sort (), ['2014', '2017', '2018', 'bla'])) return clog ('Invalid tags.');
      if (! eq (rs.body.pics [0].tags, ['2018', 'bla'])) return clog ('Invalid tags');
      if (! eq (rs.body.pics [3].tags, ['2014', 'bla'])) return clog ('Invalid tags');
      return true;
   }],
   ['get tagged pics again', 'post', 'query', {}, {tags: [], sort: 'oldest', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! eq (rs.body.pics [0].tags, ['2014', 'bla'])) return clog ('Invalid tags');
      if (! eq (rs.body.pics [3].tags, ['2018', 'bla'])) return clog ('Invalid tags');
      return true;
   }],
   ['untag tag two pics with tag they don\'t have', 'post', 'tag', {}, function (s) {
      return {tag: 'blablabla', ids: [s.pics [0].id, s.pics [3].id], del: true};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 2, bla: 2})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['untag two pics', 'post', 'tag', {}, function (s) {
      return {tag: 'bla', ids: [s.pics [0].id, s.pics [3].id], del: true};
   }, 200],
   ['get tagged pics after untagging', 'post', 'query', {}, {tags: ['bla'], sort: 'upload', from: 1, to: 4}, 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body.tags.sort (), [])) return clog ('Invalid tags.');
      if (rs.body.total !== 0) return clog ('Searching by tag does not work.');
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 2, 2017: 1, 2018: 1, all: 4, untagged: 4})) return clog ('Invalid tags', rs.body);
      return true;
   }],
   ['tag two pics #2', 'post', 'tag', {}, function (s) {
      return {tag: 'bla   ', ids: [s.pics [0].id, s.pics [3].id]};
   }, 200],
   ['invalid delete #1', 'post', 'delete', {}, '', 400],
   ['invalid delete #2', 'post', 'delete', {}, [], 400],
   ['invalid delete #3', 'post', 'delete', {}, {ids: [1]}, 400],
   ['invalid delete #4', 'post', 'delete', {}, {ids: [['1']]}, 400],
   ['invalid delete #5', 'post', 'delete', {}, {ids: ['1', 2]}, 400],
   ['empty delete', 'post', 'delete', {}, {ids: []}, 200],
   ['delete no such picture', 'post', 'delete', {}, {ids: ['foo']}, 404],
   ['delete tagged picture (repeated)', 'post', 'delete', {}, function (s) {
      return {ids: [s.pics [3].id, s.pics [3].id]};
   }, 400],
   ['delete tagged picture', 'post', 'delete', {}, function (s) {
      return {ids: [s.pics [3].id]};
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {2014: 1, 2017: 1, 2018: 1, all: 3, untagged: 2, bla: 1})) return clog (rs.body);
      return true;
   }],
   ['tag another picture', 'post', 'tag', {}, function (s) {
      return {tag: 'bla', ids: [s.pics [2].id]};
   }, 200],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      s.pics = rs.body.pics;
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
   ttester ('share pic', 'post', 'share', {}, [
      ['tag', 'string'],
      ['who', 'string'],
      ['del', ['boolean', 'undefined']],
   ]),
   ['share invalid tag', 'post', 'share', {}, {tag: 'all\n\n', who: U [1].username}, 400],
   ['share invalid tag', 'post', 'share', {}, {tag: 'untagged', who: U [1].username}, 400],
   ['share with no such user', 'post', 'share', {}, {tag: 'bla', who: U [1].username + 'a'}, 404],
   ['share a tag with no such user', 'post', 'share', {}, {tag: 'bla', who: U [1].username + 'a'}, 404],
   ['get shared tags before sharing', 'get', 'share', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {sho: [], shm: []})) return clog ('Invalid body', rs.body);
      return true;
   }],
   ['share a tag with yourself', 'post', 'share', {}, {tag: '\n bla \t ', who: H.trim (U [0].username)}, 400, function (s, rq, rs) {
      if (! eq (rs.body, {error: 'self'})) return clog ('Invalid body', rs.body);
      return true;
   }],
   ['share a tag with a user', 'post', 'share', {}, {tag: '\n bla \t ', who: U [1].username}, 200],
   ['share another tag with a user', 'post', 'share', {}, {tag: 'foo:bar', who: U [1].username}, 200],
   ['get shared tags after', 'get', 'share', {}, '', 200, function (s, rq, rs) {
      rs.body.sho.sort (function (a, b) {
         return a [1] > b [1] ? 1 : -1;
      });
      if (! eq (rs.body, {sho: [[U [1].username, 'bla'], [U [1].username, 'foo:bar']], shm: []})) return clog ('Invalid body', rs.body);
      return true;
   }],
   ['unshare tag', 'post', 'share', {}, {tag: 'foo:bar', who: U [1].username, del: true}, 200],
   ['login with valid credentials as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['get shared tags as user2', 'get', 'share', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {shm: [[U [0].username.replace (/^\s+/, '').replace (' \t', ''), 'bla']], sho: []})) return clog ('Invalid body', rs.body);
      return true;
   }],
   ['get pics as user2', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 2) return clog ('user2 should have two pics.');
      s.shared = rs.body.pics;
      return true;
   }],
   ['get pics as user2 with tag', 'post', 'query', {}, {tags: ['bla'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body.tags.sort (), ['2014', '2018', 'bla'])) return clog ('Invalid tags.');
      if (rs.body.pics.length !== 2) return clog ('user2 should have two pics with this tag.');
      return true;
   }],
   ['get shared pic as user2', 'get', function (s) {
      return 'pic/' + s.shared [0].id;
   }, {}, '', 200],
   ['get thumbnail of shared pic as user2', 'get', function (s) {
      return 'thumbof/' + s.shared [0].id;
   }, {}, '', 200],
   ['fail getting nonshared pic as user2', 'get', function (s) {
      return 'pic/' + s.pics [0].id;
   }, {}, '', 404],
   ttester ('download', 'post', 'download', {}, [
      ['ids', 'array'],
      [['ids', 0], 'string'],
   ]),
   ['download shared pics (empty)', 'post', 'download', {}, {ids: []}, 400],
   ['download shared pics (one picture)', 'post', 'download', {}, function (s) {
      return {ids: [s.shared [0].id]};
   }, 400],
   ['download shared pics (two pictures, one lacking permission)', 'post', 'download', {}, function (s) {
      return {ids: [s.shared [0].id, s.pics [0].id]};
   }, 404],
   ['download shared pics as user2', 'post', 'download', {}, function (s) {
      return {ids: [s.shared [0].id, s.shared [1].id]};
   }, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object' || type (rs.body.id) !== 'string') return log ('Invalid id returned.');
      s.downloadId = rs.body.id;
      return true;
   }],
   {raw: true, tag: 'download multiple pictures', method: 'get', path: function (s) {return 'download/' + s.downloadId}, code: 200, apres: function (s, rq, rs, next) {
      fs.writeFileSync ('download.zip', rs.body);
      a.stop ([
         [k, 'unzip', 'download.zip'],
         function (S) {
            var file1 = fs.readFileSync (s.shared [0].id + '.jpeg');
            var file2 = fs.readFileSync (s.shared [1].id + '.jpg');
            if (Buffer.compare (fs.readFileSync ('test/large.jpeg'), file1) !== 0) return clog ('Mismatch between expected and actual download #1.');
            if (Buffer.compare (fs.readFileSync ('test/medium.jpg'), file2) !== 0) return clog ('Mismatch between expected and actual download #2.');
            fs.unlinkSync (s.shared [0].id + '.jpeg');
            fs.unlinkSync (s.shared [1].id + '.jpg');
            fs.unlinkSync ('download.zip');
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
   ['download multiple pictures after link expired', 'get', function (s) {return 'download/' + s.downloadId}, {}, '', 404],
   ['login with valid credentials as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['download own pics', 'post', 'download', {}, function (s) {
      return {ids: [s.shared [0].id, s.shared [1].id]};
   }, 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object' || type (rs.body.id) !== 'string') return log ('Invalid id returned.');
      s.downloadId = rs.body.id;
      return true;
   }],
   {raw: true, tag: 'download multiple pictures (own)', method: 'get', path: function (s) {return 'download/' + s.downloadId}, code: 200, apres: function (s, rq, rs, next) {
      fs.writeFileSync ('download.zip', rs.body);
      a.stop ([
         [k, 'unzip', 'download.zip'],
         function (S) {
            var file1 = fs.readFileSync (s.shared [0].id + '.jpeg');
            var file2 = fs.readFileSync (s.shared [1].id + '.jpg');
            if (Buffer.compare (fs.readFileSync ('test/large.jpeg'), file1) !== 0) return clog ('Mismatch between expected and actual download #1.');
            if (Buffer.compare (fs.readFileSync ('test/medium.jpg'), file2) !== 0) return clog ('Mismatch between expected and actual download #2.');
            fs.unlinkSync (s.shared [0].id + '.jpeg');
            fs.unlinkSync (s.shared [1].id + '.jpg');
            fs.unlinkSync ('download.zip');
            setTimeout (next, 5000);
         }
      ], clog);
   }},
   ['download multiple pictures after link expired', 'get', function (s) {return 'download/' + s.downloadId}, {}, '', 404],
   ['tag rotated picture', 'post', 'tag', {}, function (s) {
      return dale.stopNot (s.pics, undefined, function (pic) {
         if (pic.name === 'rotate.jpg') return {tag: '\nrotate', ids: [pic.id]};
      });
   }, 200],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      return true;
   }],
   ['share rotate tag with a user', 'post', 'share', {}, {tag: 'rotate', who: U [1].username}, 200],
   ['login with valid credentials as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['get pics as user2', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 3) return clog ('user2 should have three pics.');
      s.pics2 = rs.body.pics;
      return true;
   }],
   ['get `rotate` pics as user2', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 1) return clog ('user2 should have one `rotate` pic.');
      return true;
   }],
   dale.go (dale.times (2, 0), function (k) {
      return [
         ['get pic #' + (k + 1), 'get', function (s) {
            return 'pic/' + s.pics2 [k].id;
         }, {}, '', 200],
         k === 1 ? [] : ['get thumb 200 #' + (k + 1), 'get', function (s) {
            return 'thumb/' + s.pics2 [k].t200;
         }, {}, '', 200],
         k === 1 ? [] : ['get thumb 900 #' + (k + 1), 'get', function (s) {
            return 'thumb/' + s.pics2 [k].t200;
         }, {}, '', 200],
      ];
   }),
   ['upload lopsided picture as user2 with invalid tags #1', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'rotate.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '{}'}
   ]}, 400],
   ['upload lopsided picture as user2 with invalid tags #2', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'rotate.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '2'}
   ]}, 400],
   ['upload lopsided picture as user2 with invalid tags #3', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'rotate.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["hello", 1]'}
   ]}, 400],
   ['upload lopsided picture as user2 with invalid tags #4', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'rotate.jpg'},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["hello", "all"]'}
   ]}, 400],
   ['upload lopsided picture as user2', 'post', 'upload', {}, {multipart: [
      {type: 'file',  name: 'pic', path: PICS + 'rotate.jpg'},
      {type: 'field', name: 'uid', value: Date.now ()},
      {type: 'field',  name: 'lastModified', value: Date.now ()},
      {type: 'field',  name: 'tags', value: '["rotate"]'}
   ]}, 200],
   ['get all pics as user2', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 3) return clog ('user2 should have three pics.');
      if (rs.body.total !== 3) return clog ('total not computed properly with repeated pics.');
      if (rs.body.pics [0].id === s.pics2 [0].id) return clog ('user2 should have own picture as priority.');
      s.rotate2 = rs.body.pics [0];
      return true;
   }],
   ['get `rotate` pics as user2', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 1) return clog ('user2 should have one `rotate` pic.');
      if (rs.body.total !== 1) return clog ('total not computed properly with repeated pics.');
      if (rs.body.pics [0].id === s.pics2 [0].id) return clog ('user2 should have own picture as priority.');
      s.repeated = rs.body.pics [0].id;
      return true;
   }],
   ['share rotate tag with user1', 'post', 'share', {}, {tag: 'rotate', who: U [0].username.replace (/^\s+/, '').replace (' \t', '')}, 200],
   ['get `rotate` pics as user2 after sharing', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 1) return clog ('user2 should have one `rotate` pic.');
      if (rs.body.pics [0].id === s.pics2 [0].id) return clog ('user2 should have own picture as priority.');
      return true;
   }],
   ['login as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['get `rotate` pics as user1 after sharing', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 1) return clog ('user1 should have one `rotate` pic.');
      if (rs.body.pics [0].id !== s.pics2 [0].id) return clog ('user1 should have own picture as priority.');
      return true;
   }],
   ['get all pics as user1 after sharing', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 3) return clog ('user1 should have one `rotate` pic.');
      return true;
   }],
   ['login as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['unshare user1', 'post', 'share', {}, {tag: 'rotate', who: U [0].username.replace (/^\s+/, '').replace (' \t', ''), del: true}, 200],
   ['login as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['get `rotate` pics as user1 after unsharing', 'post', 'query', {}, {tags: ['rotate'], sort: 'upload', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.pics.length !== 1) return clog ('user1 should have one `rotate` pic.');
      if (rs.body.pics [0].id !== s.pics2 [0].id) return clog ('user1 should have own picture after unsharing.');
      return true;
   }],
   ['login as user2', 'post', 'auth/login', {}, U [1], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['delete pic as user2', 'post', 'delete', {}, function (s) {
      return {ids: [s.rotate2.id]};
   }, 200],
   ['delete account', 'post', 'auth/delete', {}, {}, 200],
   ['login as user1', 'post', 'auth/login', {}, U [0], 200, function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return s.headers.cookie !== undefined;
   }],
   ['delete multiple pics', 'post', 'delete', {}, function (s) {
      return {ids: [s.pics [0].id, s.pics [1].id, s.pics [2].id]};
   }, 200],
   ['get pics', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 10}, 200, function (s, rq, rs) {
      if (rs.body.total !== 0) return clog ('Some pictures were not deleted.');
      return true;
   }],
   ['get tags', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
      if (! eq (rs.body, {all: 0})) return clog (rs.body);
      return true;
   }],
   ['unshare as user1 after user2 was deleted', 'post', 'share', {}, {tag: 'bla', who: U [1].username, del: true}, 404],
   ['get account at the end of the test cycle', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
      if (type (rs.body) !== 'object') return clog ('Body must be object');
      if (! eq ({username: 'user 1', email: 'a@a.com', type: 'tier1'}, {username: rs.body.username, email: rs.body.email, type: rs.body.type})) return clog ('Invalid values in fields.');
      if (type (rs.body.created) !== 'integer') return clog ('Invalid created field');
      if (type (rs.body.logs) !== 'array' || (rs.body.logs.length !== 51 && rs.body.logs.length !== 52)) return clog ('Invalid logs.');
      // Wait for S3
      setTimeout (next, 2000);
   }],
   ['get account at the end of the test cycle (wait for S3)', 'get', 'account', {}, '', 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body.usage, {limit: CONFIG.storelimit.tier1, fsused: 0, s3used: 0})) return clog ('Invalid usage field.');
      return true;
   }],
   ['get public stats before deleting user', 'get', 'stats', {}, '', 200, function (s, rq, rs) {
      if (! teishi.eq (rs.body, {byfs: 0, bys3: 0, pics: 0, vids: 0, t200: 0, t900: 0, users: 1})) return clog ('Invalid public stats.');
      return true;
   }],
   // TODO: add admin/stats test
   /*
   ['get stats after test', 'get', 'admin/stats', {}, '', 200, function (s, rq, rs) {
      if (type (rs.body) !== 'object') return clog ('Invalid body', rs.body);
      if (rs.body.users !== 1) return clog ('Invalid users');
      if (rs.body.pics !== 0)  return clog ('Invalid pics');
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
