// *** SETUP ***

var Path = require ('path');

var toRun = process.argv [2];
process.argv [2] = undefined;

var hash   = require ('murmurhash').v3;

var CONFIG = require ('./config.js');
var dale   = require ('dale');
var teishi = require ('teishi');
var cicek  = require ('cicek');
var h      = require ('hitit');
var a      = require ('./assets/astack.js');
var fs     = require ('fs');
var clog   = teishi.clog, type = teishi.type, eq = teishi.eq, last = teishi.last, inc = function (a, v) {return a.indexOf (v) > -1}

// *** TEST CONSTANTS ***

var tk = {
   pivPath: 'test/',
   pivDataPath: 'test/pivdata.json',
   users: {
      user1: {username: 'user1', password: Math.random () + '', firstName: 'name1', email: 'user1@example.com', timezone:  240},
      user2: {username: 'user2', password: Math.random () + '', firstName: 'name2', email: 'user2@example.com', timezone: -240},
   },
   geodatapath: '~/desktop/cities500.txt'
}

// *** HELPER FUNCTIONS ***

var k = function (s) {

   var command = [].slice.call (arguments, 1);

   var output = {stdout: '', stderr: '', command: command};

   var options = {};
   var commands = dale.fil (command.slice (1), undefined, function (command) {
      if (type (command) !== 'object' || ! command.env) return command;
      options.env = command.env;
   });

   var proc = require ('child_process').spawn (command [0], commands, options);

   var wait = 3;

   var done = function () {
      if (--wait > 0) return;
      if (output.code === 0) s.next (output);
      else                   s.next (0, output);
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
   if (commands [0] === 'server') H.server = proc;
}

var H = {
   setCredentials: function (s, rq, rs) {
      s.headers = {cookie: rs.headers ['set-cookie'] [0].split (';') [0]};
      s.csrf = rs.body.csrf;
      return true;
   },
   runServer: function () {
      a.seq ([
         [a.stop, [
            [a.make (fs.readFile), tk.pivDataPath],
            function (s) {
               tk.pivs = JSON.parse (s.last);
               s.next ();
            }
         ], H.loadPivData],
         [k, 'redis-cli', '-n', CONFIG.redisdb, 'flushdb'],
         [k, 'node', 'server', 'local', 'geodata', tk.geodataPath],
         function (s) {
            if (s.error && ! H.testsDone) console.log (s.error.stdout.slice (-2000));
         }
      ]);
   },
   tryTimeout: function (interval, times, fn, cb) {
      var retry = function (error) {
         if (! error)   return cb ();
         if (! --times) return cb (error);
         setTimeout (function () {
            fn (retry);
         }, interval);
      }
      fn (retry);
   },
   stop: function (label, result, value) {
      if (eq (result, value)) return false;
      if (teishi.complex (result) && teishi.complex (value)) clog ('Invalid ' + label + ', expecting', value, 'got', result, 'in field', dale.stopNot (result, undefined, function (v, k) {if (! eq (v, value [k])) return k}));
      else                                                   clog ('Invalid ' + label + ', expecting', value, 'got', result);
      return true;
   },
   cBody: function (value) {
      return function (s, rq, rs) {
         return ! H.stop ('body', rs.body, value);
      }
   },
   loadPivData: function (s) {
      var invalid = ['empty.jpg', 'invalid.jpg', 'invalid.mp4'];
      var repeated = ['medium-nometa.jpg', 'smalldup.png', 'smallmeta.png'];
      var pivs = dale.obj (fs.readdirSync (tk.pivPath).sort (), function (file) {
         var stat = fs.statSync (Path.join (tk.pivPath, file));
         var data = {name: file, path: Path.join (tk.pivPath, file), size: stat.size, mtime: new Date (stat.mtime).getTime (), invalid: inc (invalid, file), repeated: inc (repeated, file)};
         data.hash = hash (fs.readFileSync (data.path));
         return [data.name.split ('.') [0], data];
      });
      a.seq (s || a.creat (), [
         [a.fork, pivs, function (piv) {
            return [
               [k, 'exiftool', piv.path],
               function (s) {
                  var metadata = (s.last ? s.last.stdout : s.error.stdout).split ('\n');
                  dale.go (metadata, function (line) {
                     if (line.match (/^Image Width/))  piv.dimw = parseInt (line.split (':') [1].trim ());
                     if (line.match (/^Image Height/)) piv.dimh = parseInt (line.split (':') [1].trim ());
                     if (line.match (/^Orientation/)) {
                        if (line.match ('270')) piv.deg = -90;
                        if (line.match ('90')) piv.deg = 90;
                        if (line.match ('180')) piv.deg = 180;
                     }
                  });
                  piv.dates = dale.obj (metadata, function (line) {
                     var key = line.split (':') [0].trim (), value = line.split (':').slice (1).join (':').trim ();
                     if (! key.match (/\bdate\b/i)) return;
                     if (key.match (/gps|profile|manufacture|extension|firmware/i)) return;
                     if (! value.match (/^\d/)) return;
                     return [key, value];
                  });
                  s.next ();
               },
            ];
         }],
         function (s) {
            a.make (fs.writeFile) (s, tk.pivDataPath, JSON.stringify (pivs, null, '   '), 'utf8');
            tk.pivs = pivs;
         }
      ]);
   },
   testMaker: function (label, Path, rules) {
      var error = function (error) {
         throw new Error (error);
      }
      if (type (rules) !== 'array') return error ('Rules must be an array.');
      var types = {
         string:    function () {return Math.random () + ''},
         integer:   function () {return Math.round (Math.random () + Math.random ())},
         float:     function () {return Math.random ()},
         object:    function () {return {}},
         array:     function () {return []},
         null:      function () {return null},
         boolean:   function () {return Math.random > 0.5},
         undefined: function () {},
      }
      var stringMaker = function (length) {
         return dale.go (dale.times (length), function () {
            return (Math.random () + '') [2];
         }).join ('');
      }

      var get = function (target, path) {
         return dale.stop (path, false, function (v, k) {
            if (k < path.length - 1 && teishi.simple (target [v])) return false;
            target = target [v];
         }) === false ? undefined : target;
      }
      var updateValid = function (path, value) {
         if (path.length === 0) valid = value;
         else get (valid, path.slice (0, -1)) [last (path)] = value;
      }
      var addTest = function (label, path, value, checkError) {
         var body;
         if (path.length === 0) body = value;
         else {
            body = teishi.copy (valid);
            get (body, path.slice (0, -1)) [last (path)] = value;
         }
         tests.push ([label + ' ' + (path.length === 0 ? 'root object' : path.join ('.')), body, function (s, rq, rs) {
            return checkError (rs.body);
         }]);
      }

      // keep track/copy of last valid object so you can add incrementally
      var valid, tests = [];

      var runOne = function (rule) {
         // Type constraint
         if (rule.length === 2 || rule [1] === 'type') {
            if (rule [1] === 'type') rule = [rule [0]].concat (rule.slice (2));
            // If more than one desired type, default to the first one
            var sdesired = type (rule [1]) === 'array' ? ('one of ' + cicek.escape (teishi.str (rule [1]))) : rule [1];

            dale.go (types, function (maker, type) {
               var valid = teishi.type (rule [1]) === 'array' ? inc (rule [1], type) : rule [1] === type;
               if (valid) {
                  if (type !== 'undefined') updateValid (rule [0], maker ());
               }
               else addTest ('type ' + type, rule [0], maker (), function (body) {
                  if (rule [0].length === 0 && ! inc (['array', 'object'], type)) return body === 'All post requests must be either multipart/form-data or application/json!';
                  var match = new RegExp ((last (rule [0]) !== undefined ? last (rule [0]) : 'body') + ' should have as type ' + sdesired + ' but (one of .+|instead) is .+ with type ' + type);
                  var customMatch;
                  if (rule [2]) customMatch = new RegExp (rule [2]);
                  // TODO REMOVE
                  //console.log ('debug type', body.error, match, customMatch, rule);
                  //console.log ('error', body.error);
                  return body && teishi.type (body.error) === 'string' && (customMatch ? body.error.match (customMatch) : body.error.match (match));
               });
            });
         }
         // This constraint doesn't update the valid payload
         else if (rule [1] === 'keys') {
            dale.go (types, function (maker, type) {
               if (type === 'undefined') return;
               addTest ('invalid key with type ' + type, rule [0].concat (types.string ()), maker (), function (body) {
                  var match = new RegExp ('each of the keys of .+ should be equal to one of ' + cicek.escape (teishi.str (rule [2])) + ' but one of .+ is');
                  // TODO REMOVE
                  //console.log ('debug keys', body.error, match);
                  return body && teishi.type (body.error) === 'string' && body.error.match (match);
               });
            });
         }
         // This constraint doesn't update the valid payload
         else if (rule [1] === 'invalidKeys') {
            dale.go (rule [2], function (invalid, k) {
               addTest ('invalid key #' + (k + 1), rule [0].concat (invalid), types.string (), function (body) {
                  var match = new RegExp ('each of the keys of .+ should be equal to one of .+ but one of .+ is ' + cicek.escape (invalid));
                  // TODO REMOVE
                  //console.log ('debug invalidKeys', body.error, match);
                  return body && teishi.type (body.error) === 'string' && body.error.match (match);
               });
            });
         }
         // Values takes an array of possible values and defaults to the first one
         // This constraint doesn't generate tests, only updates the valid payload
         else if (rule [1] === 'values') {
            updateValid (rule [0], rule [2] [0]);
         }
         // This constraint doesn't update the valid payload
         else if (rule [1] === 'invalidValues') {
            dale.go (rule [2], function (invalid, k) {
               addTest ('invalid value #' + (k + 1), rule [0], invalid, function (body) {
                  var regexMatch = new RegExp (last (rule [0]) + ' should match .+ but instead is ' + invalid);
                  var equalMatch = new RegExp (last (rule [0]) + ' should be (equal to|) one of .+ but instead is ' + invalid);
                  var customMatch;
                  if (rule [3]) customMatch = new RegExp (rule [3]);
                  // TODO REMOVE
                  //console.log ('debug invalidValues', body.error, regexMatch, equalMatch, customMatch);
                  return body && teishi.type (body.error) === 'string' && (customMatch ? body.error.match (customMatch) : (body.error.match (regexMatch) || body.error.match (equalMatch)));
               });
            });
         }
         // This constraint only works for generating strings
         else if (rule [1] === 'length') {
            dale.go (rule [2], function (v, k) {
               updateValid (rule [0], stringMaker (v));
               var invalidValue = v + (k === 'min' ? -1 : 1);
               addTest ('invalid length - ' + k + ': ' + v, rule [0], stringMaker (invalidValue), function (body) {
                  var match = new RegExp (last (rule [0]) + ' length should be in range ' + cicek.escape (teishi.str (rule [2])) + ' but instead is ' + invalidValue);
                  var customMatch;
                  if (rule [3]) customMatch = new RegExp (rule [3]);
                  //console.log ('debug length', body.error, match, customMatch);
                  return body && teishi.type (body.error) === 'string' && (customMatch ? body.error.match (customMatch) : body.error.match (match));
               });
            });
         }
         else if (rule [1] === 'range') {
            dale.go (rule [2], function (v, k) {
               updateValid (rule [0], v);
               var invalidValue = v + (k === 'min' ? -1 : 1);
               addTest ('invalid range - ' + k + ': ' + v, rule [0], invalidValue, function (body) {
                  var match = new RegExp (last (rule [0]) + ' should be in range ' + cicek.escape (teishi.str (rule [2])) + ' but instead is ' + invalidValue);
                  // TODO REMOVE
                  //console.log ('debug range', body.error, match);
                  return body && teishi.type (body.error) === 'string' && body.error.match (match);
               });
            });
         }
         else return error ('Invalid rule type: ' + rule [1]);
      }

      var parseRules = function (list) {
         var invalid = dale.stopNot (list, undefined, function (ruleOrList) {
            if (type (ruleOrList) !== 'array' || (type (ruleOrList [0]) !== 'array' && ruleOrList.length)) return ['Invalid rule or list of rules', ruleOrList, 'with type', type (ruleOrList)];
            if (ruleOrList.length === 0) return;
            if (type (ruleOrList [0] [0]) === 'array') return parseRules (ruleOrList);
            runOne (ruleOrList);
         });
         if (invalid) return clog (invalid);
      }

      parseRules (rules);

      return dale.go (tests, function (test) {
         return ['Invalid payload - ' + label + ' - ' + test [0], 'post', Path, {}, test [1], 400, function (s, rq, rs) {
            if (test [2]) return test [2] (s, rq, rs);
            return true;
         }];
      });
   }
}

// *** TEST SUITES ***

var suites = {};

// *** AUTH SUITES ***

suites.auth = {
   in: function (user) {
      return [
         ['create invite for ' + user.username, 'post', 'admin/invites', {}, {firstName: user.firstName, email: user.email}, 200, function (s, rq, rs) {
            s.inviteToken = rs.body.token;
            return true;
         }],
         ['signup ' + user.username, 'post', 'auth/signup', {}, function (s) {
            return {username: user.username, password: user.password, token: s.inviteToken, email: user.email};
         }, 200, function (s, rq, rs) {
            s.validationToken = rs.body.token;
            return true;
         }],
         ['verify ' + user.username, 'get', function (s) {return 'auth/verify/' + s.validationToken}, {}, '', 302],
         ['login ' + user.username, 'post', 'auth/login', {}, function () {return {username: user.username, password: user.password, timezone: user.timezone}}, 200, H.setCredentials]
      ];
   },
   out: function (user) {
      return [
         ['delete account', 'post', 'auth/delete', {}, {}, 200, function (s, rq, rs) {
            delete s.headers.cookie;
            return true;
         }],
      ];
   },
   full: function () {
      var user = tk.users.user1;
      return [
         H.testMaker ('signup', 'auth/signup', [
            [[], 'object'],
            [[], 'keys', ['username', 'password', 'email', 'token']],
            dale.go (['username', 'password', 'email', 'token'], function (key) {
               return [[key], 'string']
            }),
            [['email'], 'values', [tk.users.user1.email]],
            [['username'], 'invalidValues', ['a@a', 'a:a']],
            [['username'], 'invalidValues', ['aa', '\taa\n', '   '], 'Trimmed username is less than three characters long.'],
            [['password'], 'length', {min: 6}],
            // Taken from https://help.xmatters.com/ondemand/trial/valid_email_format.htm
            [['email'],    'invalidValues', ['abc@mail-.com', 'abcdef@m..ail.com', '.abc@mail.com', 'abc#def@mail.com', 'abc.def@mail.c', 'abc.def@mail#archive.com	', 'abc.def@mail', 'abc.def@mail..com']],
         ]),
         H.testMaker ('login', 'auth/login', [
            [[], 'object'],
            [[], 'keys', ['username', 'password', 'timezone']],
            [['username'], 'string'],
            [['password'], 'string'],
            [['timezone'], 'integer'],
            [['timezone'], 'range', {min: -840, max: 720}]
         ]),
         H.testMaker ('recover', 'auth/recover', [
            [[], 'object'],
            [[], 'keys', ['username']],
            [['username'], 'string'],
         ]),
         H.testMaker ('reset', 'auth/reset', [
            [[], 'object'],
            [[], 'keys', ['username', 'password', 'token']],
            [['username'], 'string'],
            [['password'], 'string'],
            [['token'],    'string'],
         ]),
         H.testMaker ('create invite', 'admin/invites', [
            [[], 'object'],
            [[], 'keys', ['email', 'firstName']],
            [['email'], 'string'],
            [['email'], 'values', [tk.users.user1.email]],
            [['firstName'], 'string'],
            [['email'],    'invalidValues', ['abc@mail-.com', 'abcdef@m..ail.com', '.abc@mail.com', 'abc#def@mail.com', 'abc.def@mail.c', 'abc.def@mail#archive.com	', 'abc.def@mail', 'abc.def@mail..com']],
         ]),
         ['create invite', 'post', 'admin/invites', {}, {firstName: user.username, email: user.email}, 200, function (s, rq, rs) {
            s.inviteToken = rs.body.token;
            return true;
         }],
         ['signup with invalid token', 'post', 'auth/signup', {}, function (s) {
            return {token: s.inviteToken + 'foo', username: user.username, password: user.password, email: user.email};
         }, 403, H.cBody ({error: 'token'})],
         ['try to signup with token that corresponds to another email', 'post', 'auth/signup', {}, function (s) {
            return {username: user.username, password: user.password, email: user.email + 'foo', token: s.inviteToken};
         }, 403, H.cBody ({error: 'token'})],
         ['signup', 'post', 'auth/signup', {}, function (s) {
            return {token: s.inviteToken, username: user.username, password: user.password, email: user.email};
         }, 200, function (s, rq, rs) {
            if (! rs.body.token) return clog ('No token returned after signup', rs.body);
            s.verificationToken = rs.body.token;
            return true;
         }],
         ['create another invite', 'post', 'admin/invites', {}, {firstName: user.username, email: user.email + 'foo'}, 200, function (s, rq, rs) {
            s.inviteToken2 = rs.body.token;
            return true;
         }],
         ['try to signup with existing username', 'post', 'auth/signup', {}, function (s) {
            return {username: user.username, password: user.password, email: user.email + 'foo', token: s.inviteToken2};
         }, 403, H.cBody ({error: 'username'})],
         // existing email check cannot happen if we signup by invite because invite is looked up by email
         ['try to signup with same token again', 'post', 'auth/signup', {}, function (s) {
            return {username: user.username, password: user.password, email: user.email, token: s.inviteToken};
         }, 403, H.cBody ({error: 'email'})],
         ['login with invalid password', 'post', 'auth/login', {}, {username: user.username, password: user.password + 'foo', timezone: user.timezone}, 403, H.cBody ({error: 'auth'})],
         ['login with invalid username', 'post', 'auth/login', {}, {username: user.username, password: user.password + 'foo', timezone: user.timezone}, 403, H.cBody ({error: 'auth'})],
         ['login before verification', 'post', 'auth/login', {}, function (s) {
            return {username: user.username, password: user.password, timezone: user.timezone};
         }, 403, H.cBody ({error: 'verify'})],
         ['verify user with invalid token', 'get', function (s) {return 'auth/verify/' + s.verificationToken + 'foo'}, {}, '', 302, function (s, rq, rs) {
            if (H.stop ('location header', rs.headers.location, 'https://' + CONFIG.server + '#/login/badtoken')) return false;
            return true;
         }],
         ['verify user', 'get', function (s) {return 'auth/verify/' + s.verificationToken}, {}, '', 302, function (s, rq, rs) {
            if (H.stop ('location header', rs.headers.location, 'https://' + CONFIG.server + '#/login/verified')) return false;
            return true;
         }],
         ['login after verification', 'post', 'auth/login', {}, {username: user.username, password: user.password, timezone: user.timezone}, 200, function (s, rq, rs) {
            if (! rs.headers ['set-cookie'] || rs.headers ['set-cookie'].length !== 1) return clog ('Invalid cookie header', rs.headers ['set-cookie']);
            var cookie = rs.headers ['set-cookie'] [0];
            if (! cookie.match ('HttpOnly')) return clog ('No HttpOnly flag');
            if (type (rs.body) !== 'object' || type (rs.body.csrf) !== 'string') return clog ('Invalid CSRF token', rs.body);
            H.setCredentials (s, rq, rs);
            return true;
         }],
         ['get account at the beginning of the test cycle', 'get', 'account', {}, '', 200, function (s, rq, rs) {
            if (H.stop ('type of body', type (rs.body), 'object')) return false;
            if (H.stop ('type of logs', type (rs.body.logs), 'array')) return false;
            delete rs.body.logs;
            if (type (rs.body.created) !== 'integer' || Math.abs (Date.now () - rs.body.created) > 5000) return clog ('Invalid created field', rs.body.created);
            delete rs.body.created;
            if (H.stop ('body', rs.body, {username: user.username, email: user.email, usage: {limit: CONFIG.freeSpace, fsused: 0, s3used: 0}, suggestGeotagging: true, suggestSelection: true})) return false;
            return true;
         }],
         ['get CSRF token without being logged in', 'get', 'csrf', {cookie: ''}, '', 403, H.cBody ({error: 'nocookie'})],
         ['get CSRF token with tampered cookie', 'get', 'csrf', {cookie: CONFIG.cookieName + '=foo'}, '', 403, H.cBody ({error: 'tampered'})],
         ['get CSRF token with extraneous cookie', 'get', 'csrf', {cookie: 'foo=bar'}, '', 403, H.cBody ({error: 'nocookie'})],
         ['get CSRF', 'get', 'csrf', {}, '', 200, function (s, rq, rs) {
            if (H.stop ('body', rs.body, {csrf: s.csrf})) return false;
            return true;
         }],
         ['logout', 'post', 'auth/logout', {}, {}, 200, function (s, rq, rs) {
            if (! rs.headers ['set-cookie'] || ! rs.headers ['set-cookie'] [0].match (/max-age=0/i)) return clog ('Invalid set-cookie header', res.headers ['set-cookie']);
            return true;
         }],
         ['logout again', 'post', 'auth/logout', {}, {}, 403, H.cBody ({error: 'session'})],
         ['delete account without being logged in', 'get', 'auth/delete', {}, '', 403],
         ['get CSRF token with expired credentials', 'post', 'auth/logout', {}, {}, 403, H.cBody ({error: 'session'})],
         ['logout with no credentials', 'post', 'auth/logout', {cookie: ''}, {}, 403, H.cBody ({error: 'nocookie'})],
         ['login with email', 'post', 'auth/login', {}, function () {return {username: user.email, password: user.password, timezone: user.timezone}}, 200, H.setCredentials],
         dale.go (['\t', ' ', ' \t '], function (space) {
            return dale.go ([user.email + space, space + user.email, space + user.email + space, user.username + space, space + user.username, space + user.username + space, user.email.toUpperCase (), user.username.toUpperCase ()], function (spacedUsername) {
               return ['login with username with spaces', 'post', 'auth/login', {}, function () {return {username: spacedUsername, password: user.password, timezone: user.timezone}}, 200];
            });
         }),
         H.testMaker ('change password', 'auth/changePassword', [
            [[], 'object'],
            [[], 'keys', ['old', 'new']],
            [['old'], 'string'],
            [['new'], 'string'],
            [['new'], 'length', {min: 6}, 'password should be in range {"min":6} but instead is 5'],
         ]),
         ['change password with invalid old password', 'post', 'auth/changePassword', {}, function (s) {return {old: user.password + 'foo', new: user.password + 'foo'}}, 403],
         ['change password', 'post', 'auth/changePassword', {}, function (s) {return {old: user.password, new: user.password + 'foo'}}, 200],
         ['login after password change with old password', 'post', 'auth/login', {}, function () {return {username: user.username, password: user.password, timezone: user.timezone}}, 403],
         ['login after password change with new password', 'post', 'auth/login', {}, function () {return {username: user.username, password: user.password + 'foo', timezone: user.timezone}}, 200, H.setCredentials],
         ['recover password with invalid username', 'post', 'auth/recover', {}, {username: user.username + 'foo'}, 403],
         ['recover password with valid username', 'post', 'auth/recover', {}, {username: user.username}, 200],
         ['recover password with valid email', 'post', 'auth/recover', {}, {username: user.username}, 200],
         dale.go (['\t', ' ', ' \t '], function (space) {
            return dale.go ([user.email + space, space + user.email, space + user.email + space, user.username + space, space + user.username, space + user.username + space, user.email.toUpperCase (), user.username.toUpperCase ()], function (spacedUsername) {
               return ['recover password with username/email with spaces', 'post', 'auth/recover', {}, function () {return {username: spacedUsername}}, 200];
            });
         }),
         ['recover password', 'post', 'auth/recover', {}, {username: user.username}, 200, function (s, rq, rs) {
            if (H.stop ('auth token', type (rs.body.token), 'string')) return false;
            s.recoveryToken1 = rs.body.token;
            return true;
         }],
         ['recover password again to generate a new token', 'post', 'auth/recover', {}, {username: user.username}, 200, function (s, rq, rs) {
            s.recoveryToken2 = rs.body.token;
            return true;
         }],
         ['reset password for invalid username', 'post', 'auth/reset', {}, function (s) {return {username: user.username + 'foo', password: user.password, token: s.recoveryToken2}}, 403, H.cBody ({error: 'token'})],
         ['reset password with invalid token', 'post', 'auth/reset', {}, function (s) {return {username: user.username, password: user.password, token: s.recoveryToken2 + 'foo'}}, 403],
         ['reset password with invaliidated token', 'post', 'auth/reset', {}, function (s) {return {username: user.username, password: user.password, token: s.recoveryToken1}}, 403],
         ['reset password', 'post', 'auth/reset', {}, function (s) {return {username: user.username, password: user.password + 'bar', token: s.recoveryToken2}}, 200],
         ['login after password reset', 'post', 'auth/login', {}, function () {return {username: user.username, password: user.password + 'bar', timezone: user.timezone}}, 200, H.setCredentials],
         ['get auth logs', 'get', 'account', {}, '', 200, function (s, rq, rs) {

            var sequence = ['signup', 'login', 'logout', 'login'];
            dale.go (dale.times (24), function () {sequence.push ('login')});
            sequence = sequence.concat (['passwordChange', 'login', 'recover', 'recover']);
            dale.go (dale.times (24), function () {sequence.push ('recover')});
            sequence = sequence.concat (['recover', 'recover', 'reset', 'login']);
            if (H.stop ('log length', rs.body.logs.length, sequence.length)) return false;

            if (dale.stop (rs.body.logs, false, function (log, k) {
               if (H.stop ('log.ev', log.ev, 'auth')) return false;
               if (H.stop ('log.type', log.type, sequence [k])) return false;
               if (H.stop ('log.t type', type (log.t), 'integer')) return false;
               if (H.stop ('log.ip', log.ip, '::ffff:127.0.0.1')) return false;
               if (log.type === 'login' && H.stop ('log.timezone', log.timezone, user.timezone)) return false;
            }) === false) return false;
            return true;
         }],
         // /feedback is not really part of auth, but it goes here for lack of a better place to put it
         H.testMaker ('feedback', 'feedback', [
            [[], 'object'],
            [[], 'keys', ['message']],
            [['message'], 'string'],
         ]),
         ['send feedback', 'post', 'feedback', {}, {message: 'La radio está buenísima.'}, 200],
         ['delete account', 'post', 'auth/delete', {}, {}, 200, function (s, rq, rs) {
            if (! rs.headers ['set-cookie'] || ! rs.headers ['set-cookie'] [0].match (/max-age=0/i)) return clog ('Invalid set-cookie header', res.headers ['set-cookie']);
            return true;
         }],
         ['get CSRF token after account deletion with expired credentials', 'post', 'auth/logout', {}, {}, 403],
         ['get CSRF token after account deletion with expired credentials', 'post', 'auth/logout', {}, {}, 403],
         ['login after account deletion', 'post', 'auth/login', {}, function () {return {username: user.username, password: user.password + 'bar', timezone: user.timezone}}, 403],
         ['get public stats at the end of the auth suite', 'get', 'stats', {}, '', 200, H.cBody ({byfs: 0, bys3: 0, pics: 0, vids: 0, t200: 0, t900: 0, users: 0})],
      ];
   }
}

suites.public = function () {
   return [
      ['get head /stats', 'head', 'stats', {}, '', 200],
      dale.go ([['favicon.ico', 'assets/img/favicon.ico'], ['img/logo.svg', 'markup/img/logo.svg'], ['assets/gotoB.min.js', 'node_modules/gotob/gotoB.min.js'], ['client.js'], ['admin.js']], function (v) {
         return {tag: 'get ' + v [0], method: 'get', path: v [0], code: 200, raw: true, apres: function (s, rq, rs) {
            if (Buffer.compare (Buffer.from (rs.body, 'binary'), fs.readFileSync (v [1] || v [0])) !== 0) return clog ('Mismatch between original and uploaded file');
            return true;
         }};
      }),
      ['get app root', 'get', '/', {}, '', 200],
      ['get admin root', 'get', 'admin', {}, '', 200],
      H.testMaker ('request invite', 'requestInvite', [
         [[], 'object'],
         [[], 'keys', ['email']],
         [['email'], 'string'],
         // Taken from https://help.xmatters.com/ondemand/trial/valid_email_format.htm
         [['email'],    'invalidValues', ['abc@mail-.com', 'abcdef@m..ail.com', '.abc@mail.com', 'abc#def@mail.com', 'abc.def@mail.c', 'abc.def@mail#archive.com	', 'abc.def@mail', 'abc.def@mail..com']],
      ]),
      H.testMaker ('submit error', 'requestInvite', [
         [[], ['object', 'array']],
      ]),
      ['submit error (array)', 'post', 'error', {}, [], 200],
      ['submit error (object)', 'post', 'error', {}, {}, 200],
      ['get public stats', 'get', 'stats', {}, '', 200, H.cBody ({byfs: 0, bys3: 0, pics: 0, vids: 0, t200: 0, t900: 0, users: 0})],
   ];
}

suites.upload = {};

suites.upload.upload = function () {
   return [
      suites.auth.in (tk.users.user1),
      ['get uploads at the beginning', 'get', 'uploads', {}, '', 200, H.cBody ([])],
      dale.go (['start', 'complete', 'cancel', 'wait', 'error'], function (op) {
         var keys = ['op', 'provider'], invalidKeys;
         if (op === 'error') {
            keys = keys.concat (['id', 'error']);
            invalidKeys = ['tags', 'total', 'tooLarge', 'unsupported', 'alreadyImported'];
         }
         else if (op === 'start') {
            keys = keys.concat (['tags', 'total', 'tooLarge', 'unsupported', 'alreadyImported']);
            invalidKeys = ['id', 'error'];
         }
         else {
            keys = keys.concat (['id']);
            invalidKeys = ['tags', 'total', 'tooLarge', 'unsupported', 'alreadyImported'].concat ('error');
         }
         return H.testMaker ('upload ' + op, 'upload', [
            [[], 'object'],
            [['op'], 'values', [op]],
            [[], 'keys', keys],
            [[], 'invalidKeys', invalidKeys],
            [['provider'], 'values', [undefined, 'google', 'dropbox']],
            [['provider'], 'invalidValues', ['foo']],
            op === 'start' ? [
               ['tags', 'tooLarge', 'unsupported'].map (function (key) {
                  return [
                     [[key], ['undefined', 'array']],
                     [[key, 0], 'type', 'string', 'each of the body.' + key + ' should have as type string but one of .+ is .+ with type'],
                  ];
               }),
               [['total'], 'integer'],
               [['total'], 'range', {min: 0}],
               [['alreadyImported'], ['integer', 'undefined']],
               [['alreadyImported'], 'range', {min: 1}],
               [['tags'], 'invalidValues', [['all']], 'invalid tag: all'],
               [['tags'], 'invalidValues', [['ok', '\nUNTAGGED']], 'invalid tag: untagged'],
            ] : [['id'], 'integer'],
            op !== 'error' ? [] : [['error'], 'object']
         ]);
      }),
      dale.go (['complete', 'cancel', 'error'], function (firstOp) {
         var error = firstOp === 'error' ? {foo: 'bar'} : undefined
         return [
            // An errored upload can be created without calling start, so in that case we skip the 404 check
            error ? [] : [firstOp + ' upload with invalid id', 'post', 'upload', {}, {op: firstOp, id: 1, error: error}, 404, H.cBody ({error: 'upload'})],
            ['start upload to test ' + firstOp, 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
               if (H.stop ('body type', type (rs.body), 'object')) return false;
               if (H.stop ('body.id type', type (rs.body.id), 'integer')) return false;
               s.uploadId = rs.body.id;
               return true;
            }],
            [firstOp + ' upload', 'post', 'upload', {}, function (s) {return {op: firstOp, id: s.uploadId, error: error}}, 200],
            dale.fil (['complete', 'cancel', 'wait'], undefined, function (secondOp) {
               if (secondOp === firstOp) return;
               return ['upload conflict ' + firstOp + ' + ' + secondOp, 'post', 'upload', {}, function (s) {return {op: secondOp, id: s.uploadId}}, 409, H.cBody ({error: 'status'})];
            })
         ];
      }),
      ['get finished uploads', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.length, 3)) return false;
         if (dale.stop (rs.body, false, function (upload, k) {
            if (H.stop ('total', upload.total, 0)) return false;
            if (H.stop ('status #' + (k + 1), upload.status, ['error', 'cancelled', 'complete'] [k])) return false;
            if (type (upload.end) !== 'integer' || upload.end > Date.now () || upload.end <= upload.id) return clog ('Invalid end ' + upload.end);
            if (k === 0 && H.stop ('error', upload.error, {foo: 'bar'})) return false;
         }) === false) return false;
         return true;
      }],
      ['get upload logs', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('logs length', rs.body.logs.length, 8)) return false;
         if (dale.stop (rs.body.logs, false, function (log, k) {
            // We ignore the auth logs
            if (k < 2) return;
            if (H.stop ('ev', log.ev, 'upload')) return false;
            if (H.stop ('type', log.type, ['start', 'complete', 'start', 'cancel', 'start', 'error'] [k - 2])) return false;
            if (log.type === 'start' && H.stop ('total', log.total, 0)) return false;
            if (log.type === 'error') {
               if (H.stop ('error', log.error, {foo: 'bar'})) return false;
               if (H.stop ('fromClient', log.fromClient, true)) return false;
            }
         }) === false) return false;
         return true;
      }],
      // Clear out uploads and start anew
      suites.auth.out (tk.users.user1),
      suites.auth.in (tk.users.user1),
      ['send first error',  'post', 'upload', {}, function (s) {return {id: 1000, op: 'error', error: {status: 400, error: 'text of error 1'}}}, 200],
      ['send second error', 'post', 'upload', {}, function (s) {return {id: 1000, op: 'error', error: {status: 401, error: 'text of error 2'}}}, 200],
      ['get finished uploads', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.length, 1)) return false;
         if (dale.stop (rs.body, false, function (upload, k) {
            if (H.stop ('status', upload.status, 'error')) return false;
            if (H.stop ('error', upload.error, {status: 401, error: 'text of error 2'}) ) return false;
            s.erroredUpload = upload;
         }) === false) return false;
         return true;
      }],
      ['get upload logs after double error', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('logs length', rs.body.logs.length, 4)) return false;
         if (dale.stop (rs.body.logs, false, function (log, k) {
            // We ignore the auth logs
            if (k < 2) return;
            if (H.stop ('ev', log.ev, 'upload')) return false;
            if (H.stop ('type', log.type, 'error')) return false;
            if (k === 2 && H.stop ('error', log.error, {status: 400, error: 'text of error 1'})) return false;
            if (k === 3 && H.stop ('error', log.error, {status: 401, error: 'text of error 2'})) return false;
            if (k === 3 && H.stop ('end', log.t, s.erroredUpload.end)) return false;
         }) === false) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.in (tk.users.user1),
      ['start upload with all keys', 'post', 'upload', {}, {op: 'start', total: 1, tags: ['tag1', 'tag2'], tooLarge: ['tl1', 'tl2'], unsupported: ['u1', 'u2'], alreadyImported: 1}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['get started upload', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.length, 1)) return false;
         if (H.stop ('upload', rs.body [0], {id: s.uploadId, status: 'uploading', total: 1, tags: ['tag1', 'tag2'], tooLarge: ['tl1', 'tl2'], unsupported: ['u1', 'u2'], alreadyImported: 1})) return false;
         return true;
      }],
      ['send wait operation to upload', 'post', 'upload', {}, function (s) {return {id: s.uploadId, op: 'wait'}}, 200],
      ['send second wait operation to upload', 'post', 'upload', {}, function (s) {return {id: s.uploadId, op: 'wait'}}, 200],
      ['get upload logs after double wait', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('logs length', rs.body.logs.length, 5)) return false;
         if (dale.stop (rs.body.logs, false, function (log, k) {
            // We ignore the auth logs
            if (k < 2) return;
            if (H.stop ('ev', log.ev, 'upload')) return false;
            if (H.stop ('type', log.type, k === 2 ? 'start' : 'wait')) return false;
         }) === false) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.upload.uploadCheck = function () {
   var validBody = {id: 1, hash: 1, filename: 'small.jpg', fileSize: 1, lastModified: Date.now ()};
   return [
      suites.auth.in (tk.users.user1),
      H.testMaker ('uploadCheck', 'uploadCheck', [
         [[], 'object'],
         [[], 'keys', ['id', 'hash', 'filename', 'fileSize', 'lastModified', 'tags']],
         [[], 'invalidKeys', ['foo']],
         [['id'], 'integer'],
         [['hash'], 'integer'],
         [['filename'], 'string'],
         [['fileSize'], 'integer'],
         [['fileSize'], 'range', {min: 0}],
         [['lastModified'], 'integer'],
         [['lastModified'], 'range', {min: 0}],
         [['tags'], ['undefined', 'array']],
         [['tags', 0], 'type', 'string', 'each of the body.tags should have as type string but one of .+ is .+ with type'],
         [['tags'], 'invalidValues', [['all']], 'invalid tag: all'],
         [['tags'], 'invalidValues', [['ok', '\nUNTAGGED']], 'invalid tag: untagged'],
      ]),
      ['uploadCheck with no such upload', 'post', 'uploadCheck', {}, validBody, 404, H.cBody ({error: 'upload'})],
      dale.go (['complete', 'cancel', 'error'], function (op) {
         return [
            ['start upload to then ' + op, 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
               s.uploadId = rs.body.id;
               return true;
            }],
            [op + ' upload', 'post', 'upload', {}, function (s) {return {op: op, id: s.uploadId, error: op === 'error' ? {} : undefined}}, 200],
            ['check conflict with uploadCheck', 'post', 'uploadCheck', {}, function (s) {
               var body = teishi.copy (validBody);
               body.id = s.uploadId;
               return body;
            }, 409, H.cBody ({error: 'status'})]
         ];
      }),
      ['get three finished uploads, check that uploadCheck didn\'t perform any modifications', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.length, 3)) return false;
         if (dale.stop (rs.body, false, function (upload) {
            if (H.stop ('alreadyUploaded', upload.alreadyUploaded, undefined)) return false;
            if (H.stop ('repeated', upload.repeated, undefined)) return false;
         }) === false) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.in  (tk.users.user1),
      ['start upload', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['start another upload', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadIdAlt = rs.body.id;
         return true;
      }],
      ['upload small piv to test uploadCheck', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200],
      ['get piv metadata before uploadCheck modifications', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         s.originalSmall = rs.body.pivs [0];
         return true;
      }],
      ['uploadCheck piv with no match', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: 1, filename: 'small.jpg', fileSize: 1, lastModified: Date.now ()}}, 200, H.cBody ({repeated: false})],
      ['uploadCheck piv with match, same name, different upload', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadIdAlt, hash: tk.pivs.small.hash, filename: tk.pivs.small.name, fileSize: tk.pivs.small.size, lastModified: tk.pivs.small.mtime}}, 200, H.cBody ({repeated: true})],
      ['uploadCheck piv with match, different name, different upload', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadIdAlt, hash: tk.pivs.small.hash, filename: tk.pivs.small.name + 'foo', fileSize: tk.pivs.small.size, lastModified: tk.pivs.small.mtime}}, 200, H.cBody ({repeated: true})],
      ['get piv metadata after uploadCheck (same name & different name, no dates or tags), ensure no modifications happened', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('piv metadata', rs.body.pivs [0], s.originalSmall)) return false;
         return true;
      }],
      ['check that piv is still marked as untagged', 'post', 'query', {}, {tags: ['untagged'], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.pivs.length, 1)) return false;
         return true;
      }],
      ['get upload after uploadCheck alreadyUploaded & repeated, different upload', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('last upload', rs.body [0], {
            id: s.uploadIdAlt,
            repeated: [tk.pivs.small.name + 'foo'],
            repeatedSize: tk.pivs.small.size,
            alreadyUploaded: 1,
            status: 'uploading',
            total: 0
         })) return false;
         return true;
      }],
      ['get uploadCheck logs after alreadyUploaded & repeated, different upload', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('logs length', rs.body.logs.length, 7)) return false;
         if (H.stop ('alreadyUploaded log', last (rs.body.logs, 2), {
            ev: 'upload',
            type: 'alreadyUploaded',
            id: s.uploadIdAlt,
            pivId: s.originalSmall.id,
            lastModified: tk.pivs.small.mtime,
            t: last (rs.body.logs, 2).t
         })) return false;

         if (H.stop ('repeated log', last (rs.body.logs), {
            ev: 'upload',
            type: 'repeated',
            id: s.uploadIdAlt,
            pivId: s.originalSmall.id,
            lastModified: tk.pivs.small.mtime,
            filename: tk.pivs.small.name + 'foo',
            fileSize: tk.pivs.small.size,
            identical: true,
            t: last (rs.body.logs).t
         })) return false;

         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.in  (tk.users.user1),
      ['start upload', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test uploadCheck', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200],
      ['get piv metadata before uploadCheck modifications', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         s.originalSmall = rs.body.pivs [0];
         return true;
      }],
      ['uploadCheck piv with match, same name, same upload, with tags', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, filename: tk.pivs.small.name, fileSize: tk.pivs.small.size, lastModified: tk.pivs.small.mtime, tags: ['tag1']}}, 200, H.cBody ({repeated: true})],
      ['uploadCheck piv with match, different name, same upload, with tags', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, filename: tk.pivs.small.name + 'foo', fileSize: tk.pivs.small.size, lastModified: tk.pivs.small.mtime, tags: ['tag2']}}, 200, H.cBody ({repeated: true})],
      ['get piv metadata after uploadCheck (same name & different name, new tags)', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         // Update tags in comparison
         s.originalSmall.tags.push ('tag1', 'tag2');
         if (H.stop ('piv metadata', rs.body.pivs [0], s.originalSmall)) return false;
         return true;
      }],
      ['check that piv is no longer marked as untagged', 'post', 'query', {}, {tags: ['untagged'], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.pivs.length, 0)) return false;
         return true;
      }],
      ['get upload after uploadCheck repeated, same upload, tags', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('only upload', rs.body [0], {
            id: s.uploadId,
            repeated: [tk.pivs.small.name + 'foo', tk.pivs.small.name],
            repeatedSize: tk.pivs.small.size * 2,
            ok: 1,
            lastPiv: {id: s.originalSmall.id},
            status: 'uploading',
            total: 0
         })) return false;
         return true;
      }],
      ['get uploadCheck logs after repeated, same upload, tags', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('logs length', rs.body.logs.length, 6)) return false;
         if (H.stop ('repeated #1 log', last (rs.body.logs, 2), {
            ev: 'upload',
            type: 'repeated',
            id: s.uploadId,
            pivId: s.originalSmall.id,
            tags: ['tag1'],
            lastModified: tk.pivs.small.mtime,
            filename: tk.pivs.small.name,
            fileSize: tk.pivs.small.size,
            identical: true,
            t: last (rs.body.logs, 2).t
         })) return false;

         if (H.stop ('repeated #2 log', last (rs.body.logs), {
            ev: 'upload',
            type: 'repeated',
            id: s.uploadId,
            pivId: s.originalSmall.id,
            tags: ['tag2'],
            lastModified: tk.pivs.small.mtime,
            filename: tk.pivs.small.name + 'foo',
            fileSize: tk.pivs.small.size,
            identical: true,
            t: last (rs.body.logs).t
         })) return false;

         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.in  (tk.users.user1),
      ['start upload', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test uploadCheck', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200],
      ['get piv metadata before uploadCheck modifications', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         s.originalSmall = rs.body.pivs [0];
         return true;
      }],
      ['uploadCheck piv with match, same name, same upload, with another date', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, filename: tk.pivs.small.name, fileSize: tk.pivs.small.size, lastModified: new Date ('2010-01-01').getTime ()}}, 200, H.cBody ({repeated: true})],
      ['uploadCheck piv with match, different name, same upload, with another date', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, filename: tk.pivs.small.name + 'foo', fileSize: tk.pivs.small.size, lastModified: new Date ('2005-01-01').getTime ()}}, 200, H.cBody ({repeated: true})],
      ['get piv metadata after uploadCheck (same name & different name, new tags)', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         // Update tags
         s.originalSmall.tags = ['2005'];
         s.originalSmall.date = new Date ('2005-01-01').getTime ();
         var newDates = 0;
         if (dale.stop (rs.body.pivs [0].dates, false, function (v, k) {
            if (s.originalSmall.dates [k]) return;
            if (! k.match (/^repeated:\d+:lastModified$/)) return 'Invalid new date field: ' + k;
            newDates++;
            s.originalSmall.dates [k] = v;
         }) === false) return false;
         if (H.stop ('new dates', newDates, 2)) return false;
         if (H.stop ('piv metadata', rs.body.pivs [0], s.originalSmall)) return false;
         return true;
      }],
      ['check that piv is no still marked as untagged', 'post', 'query', {}, {tags: ['untagged'], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.pivs.length, 1)) return false;
         return true;
      }],
      ['get upload after uploadCheck repeated, same upload, with another date', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('only upload', rs.body [0], {
            id: s.uploadId,
            repeated: [tk.pivs.small.name + 'foo', tk.pivs.small.name],
            repeatedSize: tk.pivs.small.size * 2,
            ok: 1,
            lastPiv: {id: s.originalSmall.id},
            status: 'uploading',
            total: 0
         })) return false;
         return true;
      }],
      ['get uploadCheck logs after repeated, same upload, with another date', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('logs length', rs.body.logs.length, 6)) return false;
         if (H.stop ('repeated #1 log', last (rs.body.logs, 2), {
            ev: 'upload',
            type: 'repeated',
            id: s.uploadId,
            pivId: s.originalSmall.id,
            lastModified: new Date ('2010-01-01').getTime (),
            filename: tk.pivs.small.name,
            fileSize: tk.pivs.small.size,
            identical: true,
            t: last (rs.body.logs, 2).t
         })) return false;

         if (H.stop ('repeated #2 log', last (rs.body.logs), {
            ev: 'upload',
            type: 'repeated',
            id: s.uploadId,
            pivId: s.originalSmall.id,
            lastModified: new Date ('2005-01-01').getTime (),
            filename: tk.pivs.small.name + 'foo',
            fileSize: tk.pivs.small.size,
            identical: true,
            t: last (rs.body.logs).t
         })) return false;

         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.upload.piv = function () {
   var testInvalid = function (body, notMultipart) {
      return ['upload piv, invalid body', 'post', 'piv', {}, notMultipart ? body : {multipart: body}, 400, function (s, rq, rs) {
         clog ('debug', rs.body);
         return true;
      }];
   }
   return [
      suites.auth.in (tk.users.user1),
      dale.go ([
         1,
         'id1',
         [],
         {},
         // multipart requests from now onwards
         // TODO: why no files error?
         [],
         [{type: 'field', name: 'id', value: 'notanid'}],
         [{type: 'field', name: 'id', value: 1234}],
         [{type: 'field', name: 'lastModified', value: 'abc'}],
         [{type: 'field', name: 'lastModified', value: 1234}],
      ], function (v, k) {
         return testInvalid (v, k < 4);
      }),
      suites.auth.out (tk.users.user1),
   ];
   /*
      if (! rq.data.fields)                    return reply (rs, 400, {error: 'field'});
      if (! rq.data.files)                     return reply (rs, 400, {error: 'file'});
      if (! rq.data.fields.id)                 return reply (rs, 400, {error: 'id'});
      if (! rq.data.fields.id.match (/^\d+$/)) return reply (rs, 400, {error: 'id'});
      */

   return [
      suites.auth.in (tk.users.user1),
      ['start upload with all keys', 'post', 'uploadGroup', {}, {op: 'start', total: pivs.length}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      dale.go (pivs, function (piv) {
         return ['upload ' + piv.name, 'post', 'upload', {}, function (s) {return {multipart: [
            {type: 'file',  name: 'piv', path: piv.path},
            {type: 'field', name: 'id', value: s.uploadId},
            {type: 'field',  name: 'lastModified', value: piv.mtime}
         ]}}, piv.invalid ? 400 : 200, function (s, rq, rs) {
            clog (piv.name, rs.body);
            //if (! rs.body || type (rs.body.id) !== '
            return true;
         }];
      }),
      suites.auth.out (tk.users.user1),
   ];
}

suites.upload.full = function () {
   return [
      // TODO uncomment
      //suites.upload.upload (),
      //suites.upload.uploadCheck (),
      suites.upload.piv (),
   ];
}


suites.query = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.testMaker ('query pivs', 'query', [
         [[], 'object'],
         [['tags'], 'array'],
         [['tags', 0], 'type', 'string', 'each of the body.tags should have as type string but one of .+ is .+ with type'],
         [['mindate'], ['undefined', 'integer']],
         [['maxdate'], ['undefined', 'integer']],
         [['sort'], 'values', ['newest', 'oldest', 'upload']],
         [['sort'], 'invalidValues', ['foo']],
         [['from'], 'integer'],
         [['from'], 'values', [0]],
         [['to'], 'integer'],
         [['to'], 'values', [1]],
         [['from'], 'range', {min: 1}],
         [['recentlyTagged'], ['undefined', 'array']],
         [['recentlyTagged', 0], 'type', 'string', 'each of the body.recentlyTagged should have as type string but one of .+ is .+ with type'],
         [['idsOnly'], ['undefined', 'boolean']],
      ]),
      ['get invalid range of pivs', 'post', 'query', {}, {tags: [], sort: 'newest', from: 3, to: 1}, 400],
      // TODO: add uploads for testing
      suites.auth.out (tk.users.user1),
   ];
}

// *** SUITE PICKER ***

var suitesToRun = (function () {
   if (! toRun) return dale.go (suites, function (v) {
      if (type (v) === 'function') return v ();
      return v.full ();
   });
   var suite = suites [toRun];
   if (type (suite) === 'function') return suite ();
   return suite.full ();
}) ();

// *** RUN TESTS ***

var t = Date.now ();

H.runServer ();

H.tryTimeout (50, 500, function (cb) {
   h.one ({}, {port: CONFIG.port, method: 'get', path: '/', code: 200}, cb);
}, function (error) {
   if (error) return clog ('SERVER DID NOT START');
   var serverStart = Date.now () - t;
   h.seq ({port: CONFIG.port}, suitesToRun, function (error) {
      if (error) {
         if (error.request && error.request.body && type (error.request.body) === 'string') error.request.body = error.request.body.slice (0, 1000) + (error.request.body.length > 1000 ? '... OMITTING REMAINDER' : '');
         H.server.kill ();
         return clog ('FINISHED WITH AN ERROR', error);
      }
      clog ('ALL TESTS FINISHED SUCCESSFULLY', 'Server start: ' + serverStart + 'ms', 'Tests: ' + (Date.now () - t - serverStart) + 'ms');
      H.testsDone = true;
      H.server.kill ();
   }, function (test) {
      if (type (test) === 'object') return test;
      if (test [1] === 'post' && test [4]) {
         var b = test [4];
         test [4] = function (s) {
            if (type (b) === 'function') b = b (s);
            if (! s.headers || ! s.headers.cookie) return b;

            // Skip CSRF token for these routes
            if (inc (['auth/signup', 'auth/login', 'auth/recover', 'auth/reset', 'requestInvite', 'admin/invites'], test [2])) return b;

            var b2 = teishi.copy (b);
            if (b2.multipart) b2.multipart.push ({type: 'field', name: 'csrf', value: s.csrf});
            else b2.csrf = s.csrf;
            return b2;
         }
      }
      return h.stdmap (test);
   });
});

process.on ('exit', function () {
   if (H.server && H.server.kill) H.server.kill ();
});
