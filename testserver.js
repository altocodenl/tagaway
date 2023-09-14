// *** TEST SELECTION ***

var dale   = require ('dale');
var teishi = require ('teishi');

var noAuth        = dale.stop (process.argv, true, function (v) {return v === 'noAuth'});
var noUpload      = dale.stop (process.argv, true, function (v) {return v === 'noUpload'});
var noImport      = dale.stop (process.argv, true, function (v) {return v === 'noImport'});
var debuggingMode = dale.stop (process.argv, true, function (v) {return v === 'debug'});

var toRun = process.argv [2];
process.argv [2] = undefined;
if (teishi.inc (['noAuth', 'noUpload', 'noImport', 'debug'], toRun)) toRun = undefined;

// *** SETUP ***

var CONFIG = require ('./config.js');
var SECRET = require ('./secret.js');

var Path = require ('path');

var hash   = require ('murmurhash').v3;
var mime   = require ('mime');

var cicek  = require ('cicek');
var redis  = require ('redis').createClient ({db: CONFIG.redisdb});
var h      = require ('hitit');
var a      = require ('./assets/astack.js');
var fs     = require ('fs');
var type   = teishi.type, clog = teishi.clog, eq = teishi.eq, last = teishi.last, inc = teishi.inc;

// *** TEST CONSTANTS ***

var tk = {
   pivPath: 'test/',
   pivDataPath: 'test/pivdata.json',
   users: {
      user1: {username: 'user1', password: 'foobar',            firstName: 'name1', email: 'user1@example.com', timezone:  240},
      user2: {username: 'user2', password: Math.random () + '', firstName: 'name2', email: 'user2@example.com', timezone: -240},
      user3: {username: 'user3', password: Math.random () + '', firstName: 'name3', email: 'user3@example.com', timezone: 0},
   }
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
         if (debuggingMode) process.stdout.write (chunk);
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
      var requiresGeo = ! toRun || toRun === 'geo';
      a.seq ([
         [a.stop, [
            [a.make (fs.readFile), tk.pivDataPath],
            function (s) {
               tk.pivs = JSON.parse (s.last);
               s.next ();
            }
         ], H.loadPivData],
         [k, 'redis-cli', '-n', CONFIG.redisdb, 'flushdb'],
         [k, 'node', 'server', 'local'],
         function (s) {
            process.exit (0);
         }
      ]);
   },
   tryTimeout: function (interval, times, fn, cb) {
      var retry = function (error, data, breakingError) {
         if (breakingError) return cb (breakingError);
         if (! error)   return cb ();
         if (! --times) return cb (error);
         setTimeout (function () {
            fn (retry);
         }, interval);
      }
      fn (retry);
   },
   // The apres function in test, if present, must return true or false (it cannot be itself async).
   testTimeout: function (interval, times, test) {
      var apres = test.apres || function () {return true};
      var tryTimeoutSet;
      test.apres = function (s, rq, rs, next) {
         if (apres (s, rq, rs, next)) return true;
         if (tryTimeoutSet) return false;
         tryTimeoutSet = true;
         H.tryTimeout (interval, times, function (cb) {h.one (s, test, cb)}, next);
      }
      return test;
   },
   stop: function (label, result, value) {
      if (eq (result, value)) return false;
      if (teishi.complex (result) && teishi.complex (value)) {
         var differentField = dale.stopNot (result, undefined, function (v, k) {if (! eq (v, value [k])) return k});
         if (differentField === undefined) differentField = dale.stopNot (value, undefined, function (v, k) {if (! eq (v, result [k])) return k});
         clog ('Invalid ' + label + ', expecting', value, 'got', result, 'in field', differentField);
      }
      else                                                   clog ('Invalid ' + label + ', expecting', value, 'got', result);
      return true;
   },
   cBody: function (value) {
      return function (s, rq, rs) {
         return ! H.stop ('body', rs.body, type (value) === 'function' ? value (s) : value);
      }
   },
   dateFromName: function (name) {
      // Date example: 20220308
      if (name.match (/(19|20)\d{6}/)) {
         var date = name.match (/(19|20)\d{6}/g) [0];
         date = [date.slice (0, 4), date.slice (4, 6), date.slice (6)].join ('-');
         // Date with time acceptable format: date + 0 or more non digits + 1-2 digits (hour) + 0 or more non digits + 2 digits (minutes) + 0 or more non digits + optional two digits (seconds) + zero or more non letters plus optional am|AM|pm|PM
         var time = name.match (/(19|20)\d{6}[^\d]*(\d{1,2})[^\d]*(\d{2})[^\d]*(\d{2})?[^a-zA-Z]*(am|AM|pm|PM)?/);
      }
      // Date example: 2022-03-08
      else if (name.match (/(19|20)\d\d-\d\d-\d\d/)) {
         var date = name.match (/(19|20)\d\d-\d\d-\d\d/g) [0];
         date = [date.slice (0, 4), date.slice (5, 7), date.slice (8)].join ('-');
         // Date with time acceptable format: date + 0 or more non digits + 1-2 digits (hour) + 0 or more non digits + 2 digits (minutes) + 0 or more non digits + optional two digits (seconds) + zero or more non letters plus optional am|AM|pm|PM
         var time = name.match (/(19|20)\d\d-\d\d-\d\d[^\d]*(\d{1,2})[^\d]*(\d{2})[^\d]*(\d{2})?[^a-zA-Z]*(am|AM|pm|PM)?/);
      }
      else return -1;

      // Attempt to get the time from the date. If it fails, just return the date with no time.
      if (time && time [2] !== undefined && time [3] !== undefined) {
         var hour = parseInt (time [2]);
         if (time [5] && time [5].match (/pm/i) && hour > 0 && hour < 12) hour += 12;
         hour += '';
         var dateWithTime = date + 'T' + (hour.length === 1 ? '0' : '') + hour + ':' + time [3] + ':' + (time [4] || '00') + '.000Z';
         dateWithTime = H.parseDate (dateWithTime);
         if (dateWithTime !== -1) return dateWithTime;
      }
      return H.parseDate (date);
   },
   parseDate: function (date) {
      if (! date) return -1;
      // Range is years 1970-2100
      var minDate = 0, maxDate = 4133980799999;
      var d = new Date (date), ms = d.getTime ();
      if (! isNaN (ms) && ms >= minDate && ms <= maxDate) return ms;
      d = new Date (date.replace (':', '-').replace (':', '-'));
      ms = d.getTime ();
      if (! isNaN (ms) && ms >= minDate && ms <= maxDate) return ms;
      return -1;
   },
   // Returns an output of the shape: {isVid: UNDEFINED|true, mimetype: STRING, dimw: INT, dimh: INT, format: STRING, deg: UNDEFINED|90|180|-90, dates: {...}, date: INTEGER, dateSource: STRING, loc: UNDEFINED|[INT, INT]}
   // If onlyLocation flag is passed, output will only have the `loc` field.
   getMetadata: function (s, path, onlyLocation, lastModified, name) {
      var output = {};

      a.seq (s, [
         [k, 'exiftool', path],
         function (s) {
            dale.stop ((s.last || s.error).stdout.split ('\n'), true, function (line) {
               if (! line.match (/^GPS Position\s+:/)) return;
               var originalLine = line;
               line = (line.split (':') [1]).split (',');
               var lat = line [0].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
               var lon = line [1].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
               lat = (lat [4] === 'S' ? -1 : 1) * (parseFloat (lat [1]) + parseFloat (lat [2]) / 60 + parseFloat (lat [3]) / 3600);
               lon = (lon [4] === 'W' ? -1 : 1) * (parseFloat (lon [1]) + parseFloat (lon [2]) / 60 + parseFloat (lon [3]) / 3600);
               if (isNaN (lat) || lat <  -90 || lat >  90) lat = undefined;
               if (isNaN (lon) || lon < -180 || lon > 180) lon = undefined;
               // We set location only if both latitude and longitude are valid
               if (lat && lon) output.loc = [lat, lon];
               return true;
            });

            if (onlyLocation) s.next ();
            else              s.next ((s.last || s.error).stdout.split ('\n'));
         },
         function (s) {
            if (onlyLocation) return s.next ();
            output.dates = {};
            // We first detect the mimetype to ascertain whether this is a vid or a pic
            dale.stopNot (s.last, undefined, function (line) {
               if (! line.match (/^MIME Type\s+:/)) return;
               output.mimetype = line.split (':') [1].trim ();
               if (line.match (/^MIME Type\s+:\s+video\//)) output.isVid = true;
               return true;
            });
            var error = dale.stopNot (s.last, undefined, function (line) {
               if (line.match (/^Warning\s+:/)) {
                  var exceptions = new RegExp (['minor', 'Invalid EXIF text encoding', 'Bad IFD1 directory', 'Bad length ICC_Profile', 'Invalid CanonCameraSettings data', 'Truncated'].join ('|'));
                  if (line.match (exceptions)) return;
                  return line;
               }
               else if (line.match (/^Error\s+:/)) return line;
               else if (line.match (/date/i)) {
                  var key = line.split (':') [0].trim ();
                  if (! key.match (/\bdate\b/i)) return;
                  if (key.match (/gps|profile|manufacture|extension|firmware/i)) return;
                  // Ignore metadata fields related to the newly created file itself, because they have the same date as the upload itself and they are irrelevant for dating the piv
                  if (inc (['File Modification Date/Time', 'File Access Date/Time', 'File Inode Change Date/Time'], key)) return;
                  var value = line.split (':').slice (1).join (':').trim ();
                  // If value doesn't start with a number or only contains zeroes, we ignore it.
                  if (! value.match (/^\d/) || ! value.match (/[1-9]/)) return;
                  output.dates [key] = value;
               }
               else if (line.match (/^File Type\s+:/)) {
                  output.format = line.split (':') [1].trim ().toLowerCase ();
                  if (output.format === 'extended webp') output.format = 'webp';
               }
               else if (! output.isVid && line.match (/^Image Width\s+:/))  output.dimw = parseInt (line.split (':') [1].trim ());
               else if (! output.isVid && line.match (/^Image Height\s+:/)) output.dimh = parseInt (line.split (':') [1].trim ());
               else if ((! output.isVid && line.match (/^Orientation\s+:/)) || (output.isVid && line.match (/Rotation\s+:/))) {
                  if (line.match ('270')) output.deg = -90;
                  if (line.match ('90'))  output.deg = 90;
                  if (line.match ('180')) output.deg = 180;
               }
            });
            if (error) return s.next (null, {error: error});

            if (! output.isVid) return s.next ();

            a.seq (s, [
               [k, 'ffprobe', '-i', path, '-show_streams'],
               function (s) {
                  var ffprobeMetadata = (s.last.stdout + '\n' + s.last.stderr).split ('\n');
                  var formats = [];
                  // ffprobe metadata is only used to detect width, height and the names of the codecs of the video & audio streams
                  dale.go (ffprobeMetadata, function (line) {
                     if (line.match (/^width=\d+$/))  output.dimw = parseInt (line.split ('=') [1]);
                     if (line.match (/^height=\d+$/)) output.dimh = parseInt (line.split ('=') [1]);
                     if (line.match (/^codec_name=/)) {
                        var format = line.split ('=') [1];
                        if (format !== 'unknown') formats.push (format);
                     }
                  });
                  if (formats.length) output.format += ':' + formats.sort ().join ('/');
                  s.next ();
               }
            ]);
         },
         function (s) {
            if (onlyLocation) return s.next (output);

            // Despite our trust in exiftool and ffprobe, we make sure that the required output fields are present
            if (type (output.dimw) !== 'integer' || output.dimw < 1) return s.next (null, {error: 'Invalid width: '  + output.dimw});
            if (type (output.dimh) !== 'integer' || output.dimh < 1) return s.next (null, {error: 'Invalid height: ' + output.dimh});
            if (! output.format)   return s.next (null, {error: 'Missing format'});
            if (! output.mimetype) return s.next (null, {error: 'Missing mimetype'});

            // All dates are considered to be UTC, unless they explicitly specify a timezone.
            // The underlying server must be in UTC to not add a timezone offset to dates that specify no timezone.
            // The client also ignores timezones, except for applying a timezone offset for the `last modified` metadata of the piv in the filesystem when it is uploaded.
            output.dates ['upload:lastModified'] = lastModified;
            if (H.dateFromName (name) !== -1) output.dates ['upload:fromName'] = name;

            var validDates = dale.obj (output.dates, function (date, key) {
               var parsed = key.match ('fromName') ? H.dateFromName (date) : H.parseDate (date);
               // We ignore invalid dates (-1) or dates before the Unix epoch (< 0).
               if (parsed > -1) return [key, parsed];
            });

            // We first try to find a valid Date/Time Original, if it's the case, then we will use that date.
            if (validDates ['Date/Time Original']) {
               output.date       = validDates ['Date/Time Original'];
               output.dateSource = 'Date/Time Original';
            }
            // Otherwise, of all the valid dates, we will set the oldest one.
            else {
               dale.go (validDates, function (date, key) {
                  if (output.date && output.date <= date) return;
                  output.date = date;
                  output.dateSource = key;
               });
            }

            // If the date source is upload:fromName and there's another valid date entry on the same date (but a later time), we use the latest one of them. This avoids files with a name that contains a date without time to override the date + time combination of another metadata tag.
            if (output.dateSource === 'upload:fromName') {
               var adjustedDate;
               dale.go (validDates, function (date, key) {
                  if (date - output.date < 1000 * 60 * 60 * 24) {
                     if (! adjustedDate) adjustedDate = [key, date];
                     else {
                        if (date < adjustedDate [1]) adjustedDate = [key, date];
                     }
                  }
               });
               if (adjustedDate) {
                  output.dateSource = adjustedDate [0];
                  output.date       = adjustedDate [1];
               }
            }

            s.next (output);
         }
      ]);
   },
   loadPivData: function (s) {
      var invalid  = ['empty.jpg', 'invalid.jpg', 'invalidvid.mp4'];
      // medium-nometa.jpg has no metadata; small-meta.png has an extra metadata field for date
      var repeated = ['medium-nometa.jpg', 'small-meta.png'];
      var unsupported = ['location.svg'];
      var pivs = dale.obj (fs.readdirSync (tk.pivPath).sort (), function (file) {
         var stat = fs.statSync (Path.join (tk.pivPath, file));
         // Ignore vim swap files
         if (file.match (/.swp$/)) return;
         var data = {name: file, path: Path.join (tk.pivPath, file), size: stat.size, mtime: new Date (stat.mtime).getTime (), invalid: inc (invalid, file) || undefined, repeated: inc (repeated, file) || undefined, unsupported: inc (unsupported, file) || undefined};
         return [data.name.split ('.') [0], data];
      });
      a.seq (s, [
         [a.fork, pivs, function (piv) {
            if (piv.invalid || piv.unsupported) return [];
            return [
               [H.getMetadata, piv.path, false, piv.mtime, piv.name],
               function (s) {
                  dale.go (s.last, function (v, k) {
                     piv [k] = v;
                  });
                  // humanReadableDate is there just for manual checking purposes, to see that the date indeed makes sense at a glance compared to the dates contained in the metadata
                  piv.humanReadableDate = new Date (piv.date).toISOString ();
                  piv.dateTags = ['d::' + new Date (piv.date).getUTCFullYear (), 'd::M' + (new Date (piv.date).getUTCMonth () + 1)];
                  s.next ();
               },
               function (s) {
                  fs.readFile (piv.path, function (error, file) {
                     if (error) return s.next (null, error);
                     piv.hash = hash (file) + ':' + piv.size;
                     // We remove the reference to the buffer to free memory.
                     file = null;
                     s.next ();
                  });
               }
            ];
         }],
         function (s) {
            a.make (fs.writeFile) (s, tk.pivDataPath, JSON.stringify (pivs, null, '   '), 'utf8');
            tk.pivs = pivs;
         }
      ]);
   },
   invalidTestMaker: function (label, Path, rules) {
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
                  return body && teishi.type (body.error) === 'string' && body.error.match (match);
               });
            });
         }
         // This constraint doesn't update the valid payload
         else if (rule [1] === 'invalidKeys') {
            dale.go (rule [2], function (invalid, k) {
               addTest ('invalid key #' + (k + 1), rule [0].concat (invalid), types.string (), function (body) {
                  var match = new RegExp ('each of the keys of .+ should be equal to one of .+ but one of .+ is ' + cicek.escape (invalid));
                  return body && teishi.type (body.error) === 'string' && body.error.match (match);
               });
            });
         }
         // Values takes an array of possible values and defaults to the first one
         // This constraint doesn't generate tests, only updates the valid payload
         // TODO: make it so that every variant is tested in a full run of the test suite, by creating a NxN list of combinations.
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

var split = function (n) {
   return n.toString ().replace (/\B(?=(\d{3})+(?!\d))/g, ',');
}

// *** TEST SUITES ***

var suites = {};

// *** AUTH SUITES ***

suites.auth = {
   login: function (user) {
      return ['login ' + user.username, 'post', 'auth/login', {}, function () {return {username: user.username, password: user.password, timezone: user.timezone}}, 200, H.setCredentials]
   },
   in: function (user) {
      return [
         ['signup ' + user.username, 'post', 'auth/signup', {}, function (s) {
            return {username: user.username, password: user.password, email: user.email};
         }, 200, function (s, rq, rs) {
            s.validationToken = rs.body.token;
            if (rs.headers ['set-cookie']) return clog ('Signup should not log you in.');
            return true;
         }],
         ['verify ' + user.username, 'get', function (s) {return 'auth/verify/' + s.validationToken}, {}, '', 302],
         suites.auth.login (user),
      ];
   },
   out: function (user) {
      return [
         suites.auth.login (user),
         ['delete account', 'post', 'auth/delete', {}, {}, 200, function (s, rq, rs) {
            delete s.headers.cookie;
            return true;
         }],
      ];
   },
   full: function () {
      if (noAuth) return [];
      var user = tk.users.user1;
      return [
         H.invalidTestMaker ('signup', 'auth/signup', [
            [[], 'object'],
            [[], 'keys', ['username', 'password', 'email']],
            dale.go (['username', 'password', 'email'], function (key) {
               return [[key], 'string']
            }),
            [['email'], 'values', [tk.users.user1.email]],
            [['username'], 'invalidValues', ['a@a', 'a:a']],
            [['username'], 'invalidValues', ['aa', '\taa\n', '   '], 'Trimmed username is less than three characters long.'],
            [['username'], 'invalidValues', ['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', ' aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa '], 'Trimmed username is more than forty characters long.'],
            [['password'], 'length', {min: 6}],
            // Taken from https://help.xmatters.com/ondemand/trial/valid_email_format.htm
            [['email'],    'invalidValues', ['abc@mail-.com', 'abcdef@m..ail.com', '.abc@mail.com', 'abc#def@mail.com', 'abc.def@mail.c', 'abc.def@mail#archive.com	', 'abc.def@mail', 'abc.def@mail..com']],
         ]),
         H.invalidTestMaker ('login', 'auth/login', [
            [[], 'object'],
            [[], 'keys', ['username', 'password', 'timezone']],
            [['username'], 'string'],
            [['password'], 'string'],
            [['timezone'], 'integer'],
            [['timezone'], 'range', {min: -840, max: 720}]
         ]),
         H.invalidTestMaker ('recover', 'auth/recover', [
            [[], 'object'],
            [[], 'keys', ['username']],
            [['username'], 'string'],
         ]),
         H.invalidTestMaker ('reset', 'auth/reset', [
            [[], 'object'],
            [[], 'keys', ['username', 'password', 'token']],
            [['username'], 'string'],
            [['password'], 'string'],
            [['token'],    'string'],
         ]),
         ['signup', 'post', 'auth/signup', {}, function (s) {
            return {username: user.username, password: user.password, email: user.email};
         }, 200, function (s, rq, rs) {
            if (! rs.body.token) return clog ('No token returned after signup', rs.body);
            s.verificationToken = rs.body.token;
            return true;
         }],
         ['try to signup with existing username', 'post', 'auth/signup', {}, function (s) {
            return {username: user.username, password: user.password, email: user.email + 'foo'};
         }, 403, H.cBody ({error: 'username'})],
         ['try to signup with existing email', 'post', 'auth/signup', {}, function (s) {
            return {username: user.username + 'foo', password: user.password, email: user.email};
         }, 403, H.cBody ({error: 'email'})],
         ['login with invalid password', 'post', 'auth/login', {}, {username: user.username, password: user.password + 'foo', timezone: user.timezone}, 403, H.cBody ({error: 'auth'})],
         ['login with invalid username', 'post', 'auth/login', {}, {username: user.username, password: user.password + 'foo', timezone: user.timezone}, 403, H.cBody ({error: 'auth'})],
         ['login before verification', 'post', 'auth/login', {}, function (s) {
            return {username: user.username, password: user.password, timezone: user.timezone};
         }, 403, H.cBody ({error: 'verify'})],
         ['verify user with invalid token', 'get', function (s) {return 'auth/verify/' + s.verificationToken + 'foo'}, {}, '', 302, function (s, rq, rs) {
            if (H.stop ('location header', rs.headers.location, CONFIG.domain + '#/login/badtoken')) return false;
            return true;
         }],
         ['verify user', 'get', function (s) {return 'auth/verify/' + s.verificationToken}, {}, '', 302, function (s, rq, rs) {
            if (H.stop ('location header', rs.headers.location, CONFIG.domain + '#/login/verified')) return false;
            return true;
         }],
         ['verify user again', 'get', function (s) {return 'auth/verify/' + s.verificationToken}, {}, '', 302, function (s, rq, rs) {
            if (H.stop ('location header', rs.headers.location, CONFIG.domain + '#/login/verified')) return false;
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
            if (H.stop ('body', rs.body, {username: user.username, email: user.email, usage: {limit: CONFIG.freeSpace, byfs: 0, bys3: 0}, suggestGeotagging: true, suggestSelection: true, onboarding: true})) return false;
            return true;
         }],
         ['get CSRF token without being logged in', 'get', 'auth/csrf', {cookie: ''}, '', 403, H.cBody ({error: 'nocookie'})],
         ['get CSRF token with tampered cookie', 'get', 'auth/csrf', {cookie: CONFIG.cookieName + '=foo'}, '', 403, H.cBody ({error: 'tampered'})],
         ['get CSRF token with extraneous cookie', 'get', 'auth/csrf', {cookie: 'foo=bar'}, '', 403, H.cBody ({error: 'nocookie'})],
         ['get CSRF', 'get', 'auth/csrf', {}, '', 200, function (s, rq, rs) {
            if (H.stop ('body', rs.body, {csrf: s.csrf})) return false;
            return true;
         }],
         {tag: 'query pivs without csrf token', method: 'post', path: 'query', code: 403, body: {tags: ['a::'], sort: 'newest', from: 1, to: 10}, apres: H.cBody ({error: 'csrf'})},
         {tag: 'query pivs with invalid csrf token', method: 'post', path: 'query', code: 403, body: {csrf: 'foobar', tags: ['a::'], sort: 'newest', from: 1, to: 10}, apres: H.cBody ({error: 'csrf'})},
         ['logout', 'post', 'auth/logout', {}, {}, 200, function (s, rq, rs) {
            if (! rs.headers ['set-cookie'] || ! rs.headers ['set-cookie'] [0].match (/max-age=0/i)) return clog ('Invalid set-cookie header', res.headers ['set-cookie']);
            return true;
         }],
         ['get CSRF token with deleted cookie', 'get', 'auth/csrf', {}, '', 403, H.cBody ({error: 'session'})],
         ['logout again', 'post', 'auth/logout', {}, {}, 403, H.cBody ({error: 'session'})],
         ['delete account without being logged in', 'get', 'auth/delete', {}, '', 403],
         ['logout with no credentials', 'post', 'auth/logout', {cookie: ''}, {}, 403, H.cBody ({error: 'nocookie'})],
         ['login with email', 'post', 'auth/login', {}, function () {return {username: user.email, password: user.password, timezone: user.timezone}}, 200, H.setCredentials],
         dale.go (['\t', ' ', ' \t '], function (space) {
            return dale.go ([user.email + space, space + user.email, space + user.email + space, user.username + space, space + user.username, space + user.username + space, user.email.toUpperCase (), user.username.toUpperCase ()], function (spacedUsername) {
               return ['login with username with spaces', 'post', 'auth/login', {}, function () {return {username: spacedUsername, password: user.password, timezone: user.timezone}}, 200];
            });
         }),
         H.invalidTestMaker ('change password', 'auth/changePassword', [
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

            var sequence = ['signup', 'verify', 'login', 'logout', 'login'];
            dale.go (dale.times (24), function () {sequence.push ('login')});
            sequence = sequence.concat ('passwordChange', 'login', 'recover', 'recover');
            dale.go (dale.times (24), function () {sequence.push ('recover')});
            sequence = sequence.concat ('recover', 'recover', 'reset', 'login');
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
         H.invalidTestMaker ('feedback', 'feedback', [
            [[], 'object'],
            [[], 'keys', ['message']],
            [['message'], 'string'],
         ]),
         ['send feedback', 'post', 'feedback', {}, {message: 'La radio está buenísima.'}, 200],
         ['login again to create a separate session', 'post', 'auth/login', {}, {username: tk.users.user1.username, password: tk.users.user1.password + 'bar', timezone: 0}, 200, function (s, rq, rs) {
            s.alternativeSession = rs.headers ['set-cookie'] [0].split (';') [0];
            return true;
         }],
         ['delete account', 'post', 'auth/delete', {}, {}, 200, function (s, rq, rs) {
            if (! rs.headers ['set-cookie'] || ! rs.headers ['set-cookie'] [0].match (/max-age=0/i)) return clog ('Invalid set-cookie header', res.headers ['set-cookie']);
            return true;
         }],
         ['get CSRF token after account deletion', 'get', 'auth/csrf', {}, '', 403, H.cBody ({error: 'session'})],
         ['get CSRF token after account deletion with alternative session', 'get', 'auth/csrf', function (s) {return {cookie: s.alternativeSession}}, '', 403, H.cBody ({error: 'session'})],
         ['logout after account deletion', 'post', 'auth/logout', {}, {}, 403, H.cBody ({error: 'session'})],
         ['login after account deletion', 'post', 'auth/login', {}, function () {return {username: user.username, password: user.password + 'bar', timezone: user.timezone}}, 403, function (s) {
            s.headers = {};
            return true;
         }],
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
      ['submit error (array)', 'post', 'error', {}, [1], 200, H.cBody ({priority: 'critical', type: 'client error in browser', ip: '::ffff:127.0.0.1', user: 'PUBLIC', error: [1]})],
      ['submit error (object)', 'post', 'error', {}, {sin: 'sobresaltos'}, 200, H.cBody ({priority: 'critical', type: 'client error in browser', ip: '::ffff:127.0.0.1', user: 'PUBLIC', error: {sin: 'sobresaltos'}})],
      suites.auth.in (tk.users.user1),
      ['submit error as logged in user', 'post', 'error', {}, {sin: 'sobresaltos'}, 200, H.cBody ({priority: 'critical', type: 'client error in browser', ip: '::ffff:127.0.0.1', user: 'user1', error: {sin: 'sobresaltos'}})],
      suites.auth.out (tk.users.user1),
      ['get public stats', 'get', 'stats', {}, '', 200, H.cBody ({byfs: '0', bys3: '0', pics: '0', vids: '0', pivs: '0', thumbS: '0', thumbM: '0', users: '0'})],
      ['check that regular user cannot reach the admin', 'get', 'admin/users', {}, '', 403],
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
            keys = keys.concat ('id', 'error');
            invalidKeys = ['tags', 'total', 'tooLarge', 'unsupported', 'alreadyImported'];
         }
         else if (op === 'start') {
            keys = keys.concat ('tags', 'total', 'tooLarge', 'unsupported', 'alreadyImported');
            invalidKeys = ['id', 'error'];
         }
         else {
            keys = keys.concat ('id');
            invalidKeys = ['tags', 'total', 'tooLarge', 'unsupported', 'alreadyImported'].concat ('error');
         }
         return H.invalidTestMaker ('upload ' + op, 'upload', [
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
               [['tags'], 'invalidValues', [['a::', ' a::', 'a:: ']], 'invalid tag'],
               [['tags'], 'invalidValues', [['ok', '\nu::']], 'invalid tag'],
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
               return ['upload conflict ' + firstOp + ' + ' + secondOp, 'post', 'upload', {}, function (s) {return {op: secondOp, id: s.uploadId}}, 409, H.cBody ({error: 'status: ' + {complete: 'complete', cancel: 'cancelled', error: 'error'} [firstOp]})];
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
         if (H.stop ('logs length', rs.body.logs.length, 9)) return false;
         if (dale.stop (rs.body.logs, false, function (log, k) {
            // We ignore the auth logs
            if (k < 3) return;
            if (H.stop ('ev', log.ev, 'upload')) return false;
            if (H.stop ('type', log.type, ['start', 'complete', 'start', 'cancel', 'start', 'error'] [k - 3])) return false;
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
         if (H.stop ('logs length', rs.body.logs.length, 5)) return false;
         if (dale.stop (rs.body.logs, false, function (log, k) {
            // We ignore the auth logs
            if (k < 3) return;
            if (H.stop ('ev', log.ev, 'upload')) return false;
            if (H.stop ('type', log.type, 'error')) return false;
            if (k === 3 && H.stop ('error', log.error, {status: 400, error: 'text of error 1'})) return false;
            if (k === 4 && H.stop ('error', log.error, {status: 401, error: 'text of error 2'})) return false;
            if (k === 4 && H.stop ('end', log.t, s.erroredUpload.end)) return false;
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
      ['get upload logs after double wait (wait until upload gets stalled)', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
         if (H.stop ('logs length', rs.body.logs.length, 6)) return false;
         if (dale.stop (rs.body.logs, false, function (log, k) {
            // We ignore the auth logs
            if (k < 3) return;
            if (H.stop ('ev', log.ev, 'upload')) return false;
            if (H.stop ('type', log.type, k === 3 ? 'start' : 'wait')) return false;
         }) === false) return false;
         setTimeout (next, 3000);
      }],
      ['get stalled upload', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('upload.status', rs.body [0].status, 'stalled')) return false;
         return true;
      }],
      ['send wait operation to revive upload', 'post', 'upload', {}, function (s) {return {id: s.uploadId, op: 'wait'}}, 200],
      ['get unstalled upload', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('upload.status', rs.body [0].status, 'uploading')) return false;
         return true;
      }],
      ['start another upload', 'post', 'upload', {}, {op: 'start', total: 1, tags: []}, 200, function (s, rq, rs) {
         s.uploadId2 = rs.body.id;
         return true;
      }],
      ['get uploads, check that newest upload is shown first', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('id of first upload', rs.body [0].id, s.uploadId2)) return false;
         if (H.stop ('id of second upload', rs.body [1].id, s.uploadId)) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.upload.uploadCheck = function () {
   var validBody = {id: 1, hash: '1:1', name: 'small.jpg', size: 1, lastModified: Date.now ()};
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('uploadCheck', 'uploadCheck', [
         [[], 'object'],
         [[], 'keys', ['id', 'hash', 'name', 'size', 'lastModified', 'tags']],
         [[], 'invalidKeys', ['foo']],
         [['id'], 'integer'],
         [['hash'], 'string'],
         [['name'], 'string'],
         [['size'], 'integer'],
         [['size'], 'range', {min: 0}],
         [['lastModified'], 'integer'],
         [['lastModified'], 'range', {min: 0}],
         [['tags'], ['undefined', 'array']],
         [['tags', 0], 'type', 'string', 'each of the body.tags should have as type string but one of .+ is .+ with type'],
         [['tags'], 'invalidValues', [['a::', ' a::', 'a:: ']], 'invalid tag'],
         [['tags'], 'invalidValues', [['ok', '\nu::']], 'invalid tag'],
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
            }, 409, H.cBody ({error: 'status: ' + {complete: 'complete', cancel: 'cancelled', error: 'error'} [op]})]
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
      ['uploadCheck piv with no match', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: '1:1', name: 'small.jpg', size: 1, lastModified: Date.now ()}}, 200, H.cBody ({repeated: false})],
      ['uploadCheck piv with match, same name, different upload', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadIdAlt, hash: tk.pivs.small.hash, name: tk.pivs.small.name, size: tk.pivs.small.size, lastModified: tk.pivs.small.mtime}}, 200, H.cBody ({repeated: true})],
      ['uploadCheck piv with match, different name, different upload', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadIdAlt, hash: tk.pivs.small.hash, name: tk.pivs.small.name + 'foo', size: tk.pivs.small.size, lastModified: tk.pivs.small.mtime}}, 200, H.cBody ({repeated: true})],
      ['get piv metadata after uploadCheck (same name & different name, no dates or tags), ensure no modifications happened', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('piv metadata', rs.body.pivs [0], s.originalSmall)) return false;
         return true;
      }],
      ['check that piv is still marked as untagged', 'post', 'query', {}, {tags: ['u::'], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
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
         if (H.stop ('logs length', rs.body.logs.length, 8)) return false;
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
            name:  tk.pivs.small.name + 'foo',
            size: tk.pivs.small.size,
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
      ['uploadCheck piv with match, same name, same upload, with tags', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, name: tk.pivs.small.name, size: tk.pivs.small.size, lastModified: tk.pivs.small.mtime, tags: ['tag1']}}, 200, H.cBody ({repeated: true})],
      ['uploadCheck piv with match, different name, same upload, with tags', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, name: tk.pivs.small.name + 'foo', size: tk.pivs.small.size, lastModified: tk.pivs.small.mtime, tags: ['tag2']}}, 200, H.cBody ({repeated: true})],
      ['get piv metadata after uploadCheck (same name & different name, new tags)', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         // Update tags in comparison
         s.originalSmall.tags.push ('tag1', 'tag2');
         if (H.stop ('piv metadata', rs.body.pivs [0], s.originalSmall)) return false;
         return true;
      }],
      ['check that piv is no longer marked as untagged', 'post', 'query', {}, {tags: ['u::'], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.pivs.length, 0)) return false;
         return true;
      }],
      ['get upload after uploadCheck repeated, same upload, tags', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('upload', rs.body [0], {
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
         if (H.stop ('logs length', rs.body.logs.length, 7)) return false;
         if (H.stop ('repeated #1 log', last (rs.body.logs, 2), {
            ev: 'upload',
            type: 'repeated',
            id: s.uploadId,
            pivId: s.originalSmall.id,
            tags: ['tag1'],
            lastModified: tk.pivs.small.mtime,
            name: tk.pivs.small.name,
            size: tk.pivs.small.size,
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
            name: tk.pivs.small.name + 'foo',
            size: tk.pivs.small.size,
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
      ['get tags before uploadCheck modifications', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags)) return false;
         return true;
      }],
      ['uploadCheck piv with match, same name, same upload, with another date', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, name: tk.pivs.small.name, size: tk.pivs.small.size, lastModified: new Date ('2010-01-01').getTime ()}}, 200, H.cBody ({repeated: true})],
      ['get tags after first uploadCheck modification', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, ['d::2010', 'd::M1'])) return false;
         return true;
      }],
      ['uploadCheck piv with match, different name, same upload, with another date', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, name: tk.pivs.small.name + 'foo', size: tk.pivs.small.size, lastModified: new Date ('2005-12-01').getTime ()}}, 200, H.cBody ({repeated: true})],
      ['get tags after second uploadCheck modification', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, ['d::2005', 'd::M12'])) return false;
         return true;
      }],
      ['get piv metadata after uploadCheck (same name & different name, new tags)', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         // Update tags
         s.originalSmall.tags = ['d::2005', 'd::M12'];
         s.originalSmall.date = new Date ('2005-12-01').getTime ();
         var newDates = [], timestamp;
         if (dale.stop (rs.body.pivs [0].dates, false, function (v, k) {
            if (s.originalSmall.dates [k]) return;
            timestamp = k.split (':') [1];
            if (! k.match (/^repeated:\d+:lastModified$/)) return clog ('Invalid new date field', k);
            newDates.push (v);
            s.originalSmall.dates [k] = v;
         }) === false) return false;
         if (H.stop ('new dates', newDates.sort (), dale.go (['2005-12-01', '2010-01-01'], function (v) {return new Date (v).getTime ()}))) return false;
         s.originalSmall.dateSource = 'repeated:' + timestamp + ':lastModified';
         if (H.stop ('piv metadata', rs.body.pivs [0], s.originalSmall)) return false;
         return true;
      }],
      ['check that piv is no still marked as untagged', 'post', 'query', {}, {tags: ['u::'], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body length', rs.body.pivs.length, 1)) return false;
         return true;
      }],
      ['get upload after uploadCheck repeated, same upload, with another date', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('upload', rs.body [0], {
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
         if (H.stop ('logs length', rs.body.logs.length, 7)) return false;
         if (H.stop ('repeated #1 log', last (rs.body.logs, 2), {
            ev: 'upload',
            type: 'repeated',
            id: s.uploadId,
            pivId: s.originalSmall.id,
            lastModified: new Date ('2010-01-01').getTime (),
            name: tk.pivs.small.name,
            size: tk.pivs.small.size,
            identical: true,
            t: last (rs.body.logs, 2).t
         })) return false;

         if (H.stop ('repeated #2 log', last (rs.body.logs), {
            ev: 'upload',
            type: 'repeated',
            id: s.uploadId,
            pivId: s.originalSmall.id,
            lastModified: new Date ('2005-12-01').getTime (),
            name: tk.pivs.small.name + 'foo',
            size: tk.pivs.small.size,
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
      ['get tags before uploadCheck modifications', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags)) return false;
         return true;
      }],
      dale.go (['Photo 2021-03-18.jpg', 'Pic - 20210319 - AUTO.jpg', 'Photo 2021-03-20 4:26.jpg', 'Pic - 20010321 04:26:52 PM.jpg'], function (nameWithDate, k) {
         return ['uploadCheck piv with match, same name, same upload, with another date from name #' + (k + 1), 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.small.hash, name: nameWithDate, size: tk.pivs.small.size, lastModified: tk.pivs.small.mtime}}, 200, H.cBody ({repeated: true})];
      }),
      ['get piv metadata after uploadCheck with dates from names', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         s.originalSmall.tags = ['d::2001', 'd::M3'];
         s.originalSmall.date = new Date ('2001-03-21T16:26:52.000Z').getTime ();
         var newDates = [], timestamp;
         if (dale.stop (rs.body.pivs [0].dates, false, function (v, k) {
            if (s.originalSmall.dates [k]) return;
            timestamp = k.split (':') [1];
            if (! k.match (/^repeated:\d+:fromName$/)) return clog ('Invalid new date field', k);
            newDates.push (v);
            s.originalSmall.dates [k] = v;
         }) === false) return false;
         if (H.stop ('new dates', newDates.sort (), ['Photo 2021-03-18.jpg', 'Pic - 20210319 - AUTO.jpg', 'Photo 2021-03-20 4:26.jpg', 'Pic - 20010321 04:26:52 PM.jpg'].sort ())) return false;
         s.originalSmall.dateSource = 'repeated:' + timestamp + ':fromName';
         if (H.stop ('piv metadata', rs.body.pivs [0], s.originalSmall)) return false;
         return true;
      }],
      ['get tags after uploadCheck modifications', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, ['d::2001', 'd::M3'])) return false;
         return true;
      }],
      ['get upload after uploadCheck with dates from names', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('upload', rs.body [0], {
            id: s.uploadId,
            repeated: ['Pic - 20010321 04:26:52 PM.jpg', 'Photo 2021-03-20 4:26.jpg', 'Pic - 20210319 - AUTO.jpg', 'Photo 2021-03-18.jpg'],
            repeatedSize: tk.pivs.small.size * 4,
            ok: 1,
            lastPiv: {id: s.originalSmall.id},
            status: 'uploading',
            total: 0
         })) return false;
         return true;
      }],
      ['get uploadCheck logs after dates from names', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('logs length', rs.body.logs.length, 9)) return false;
         if (dale.stop (['Photo 2021-03-18.jpg', 'Pic - 20210319 - AUTO.jpg', 'Photo 2021-03-20 4:26.jpg', 'Pic - 20010321 04:26:52 PM.jpg'], false, function (v, k) {
            if (H.stop ('repeated #' + (k + 1) + ' log', last (rs.body.logs, 4 - k), {
               ev: 'upload',
               type: 'repeated',
               id: s.uploadId,
               pivId: s.originalSmall.id,
               lastModified: tk.pivs.small.mtime,
               name: v,
               size: tk.pivs.small.size,
               identical: true,
               t: last (rs.body.logs, 4 - k).t
            })) return false;
         }) === false) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.in  (tk.users.user1),
      ['start upload', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload piv with Date/Time Original field to test uploadCheck', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.rotate.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.rotate.mtime},
      ]}}, 200],
      ['get piv metadata before uploadCheck modifications', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         s.originalSmall = rs.body.pivs [0];
         return true;
      }],
      ['uploadCheck piv with match, same name, same upload, with another date but original piv has Date/Time Original field', 'post', 'uploadCheck', {}, function (s) {return {id: s.uploadId, hash: tk.pivs.rotate.hash, name: 'Pic - 20010321 04:26:52 PM.jpg', size: tk.pivs.rotate.size, lastModified: tk.pivs.rotate.mtime}}, 200, H.cBody ({repeated: true})],
      ['get piv metadata after uploadCheck with dates from names', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         var newDates = [];
         if (dale.stop (rs.body.pivs [0].dates, false, function (v, k) {
            if (s.originalSmall.dates [k]) return;
            if (! k.match (/^repeated:\d+:fromName$/)) return clog ('Invalid new date field', k);
            s.originalSmall.dates [k] = v;
         }) === false) return false;
         if (H.stop ('piv metadata', rs.body.pivs [0], s.originalSmall)) return false;
         return true;
      }],
      ['get tags after uploadCheck modifications', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.rotate.dateTags)) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),

      // *** CHECK THAT UPLOAD.LASTPIV IS THE LAST PIV UPLOADED ***
      // Formerly we kept looking for pivs until we found one that wasn't deleted, but this is prohibitively expensive for large uploads and a performant way would require dedicated keys only for this purpose. It's not worth it.

      suites.auth.in  (tk.users.user1),
      ['start upload', 'post', 'upload', {}, {op: 'start', total: 2}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      dale.go (['small', 'rotate'], function (piv) {
         return ['upload piv with to test lastPiv query', 'post', 'piv', {}, function (s) {return {multipart: [
            {type: 'file',  name: 'piv',          path:  tk.pivs [piv].path},
            {type: 'field', name: 'id',           value: s.uploadId},
            {type: 'field', name: 'lastModified', value: tk.pivs [piv].mtime},
         ]}}, 200, function (s, rq, rs) {
            s [piv] = rs.body.id;
            return true;
         }];
      }),
      ['get uploads after uploading two pivs', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('upload', rs.body [0], {
            id: s.uploadId,
            ok: 2,
            lastPiv: {id: s.rotate, deg: tk.pivs.rotate.deg},
            status: 'uploading',
            total: 2
         })) return false;
         return true;
      }],
      ['delete last piv from upload', 'post', 'delete', {}, function (s) {return {ids: [s.rotate]}}, 200],
      ['get uploads after deleting the last piv', 'get', 'uploads', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('upload', rs.body [0], {
            id: s.uploadId,
            ok: 2,
            // no `lastPiv` field
            status: 'uploading',
            total: 2
         })) return false;
         return true;
      }],
      suites.auth.out  (tk.users.user1),
   ];
}

suites.upload.piv = function () {
   var testInvalid = function (body, expectedError, k) {
      return ['upload piv, invalid body #' + (k + 1), 'post', 'piv', {}, k < 4 ? body : {multipart: body}, 400, function (s, rq, rs) {
         if (H.stop ('error message for invalid payload #' + (k + 1), rs.body, expectedError)) return false;
         return true;
      }];
   }
   return [
      suites.auth.in (tk.users.user1),
      dale.go ([
         [1, 'All post requests must be either multipart/form-data or application/json!'],
         ['id1', 'All post requests must be either multipart/form-data or application/json!'],
         [[], {error: 'body should have as type object but instead is [] with type array'}],
         [{}, {error: 'multipart'}],
         // multipart requests from now onwards
         [[{type: 'field', name: 'foo', value: 'bar'}], {error: 'invalidField'}],
         [[], {error: 'id'}],
         [[{type: 'field', name: 'id', value: 'notanid'}], {error: 'id'}],
         [[{type: 'field', name: 'id', value: 1234}], {error: 'lastModified'}],
         [[
            {type: 'field', name: 'id',           value: 1234},
            {type: 'field', name: 'lastModified', value: 'abc'}
         ], {error: 'lastModified'}],
         [[
            {type: 'field', name: 'id',           value: 1234},
            {type: 'field', name: 'lastModified', value: 'abc'}
         ], {error: 'lastModified'}],
      ].concat (dale.go (['', 1234, 'foo', '{}'], function (invalidTags) {
         return [[
            {type: 'field', name: 'id',           value: 1234},
            {type: 'field', name: 'lastModified', value: 1234},
            {type: 'field', name: 'tags',         value: invalidTags},
         ], {error: 'tags'}];
      })).concat (dale.go ([[1], [{}], ['a::'], ['a:: '], [' a::'], ['d::'], ['d::2022'], ['u::'], ['d::1987'], ['d::M1']], function (invalidTags) {
         return [[
            {type: 'field', name: 'id',           value: 1234},
            {type: 'field', name: 'lastModified', value: 1234},
            {type: 'field', name: 'tags',         value: JSON.stringify (invalidTags)},
         ], {error: 'invalid tag'}];
      })).concat ([
         [[
            {type: 'field', name: 'id',           value: 1234},
            {type: 'field', name: 'lastModified', value: 1234},
            {type: 'field', name: 'tags',         value: '[]'},
            {type: 'file',  name: 'foo',          path:  tk.pivs.small.path},
         ], {error: 'file'}],
      ]), function (v, k) {
         return testInvalid (v [0], v [1], k);
      }),
      ['attempt to upload piv to non-existing upload', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: 4321},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 404, H.cBody ({error: 'upload'})],
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
            ['attempt to upload piv to upload with state ' + firstOp, 'post', 'piv', {}, function (s) {return {multipart: [
               {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
               {type: 'field', name: 'id',           value: s.uploadId},
               {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
            ]}}, 409, H.cBody ({error: 'status: ' + {complete: 'complete', cancel: 'cancelled', error: 'error'} [firstOp]})],
         ];
      }),
      suites.auth.out (tk.users.user1),
      // Untested case: too large file
      // Untested case: no capacity
      suites.auth.in  (tk.users.user1),
      ['start upload for all pivs', 'post', 'upload', {}, {op: 'start', total: dale.keys (tk.pivs).length}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload file that is not a piv', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv', path: 'server.js', filename: 'server.png'},
         {type: 'field', name: 'id', value: s.uploadId},
         {type: 'field', name: 'lastModified', value: new Date ().getTime ()}
      ]}}, 400, H.cBody ({error: 'format'})],

      // *** UPLOAD ALL PIVS ***
      dale.go (tk.pivs, function (piv, name) {
         piv = teishi.copy (piv);
         piv.nonmp4 = piv.isVid && ! piv.name.match ('mp4');
         if (piv.repeated) return [];

         if (piv.invalid) return ['upload ' + piv.name, 'post', 'piv', {}, function (s) {return {multipart: [
            {type: 'file',  name: 'piv', path: piv.path},
            {type: 'field', name: 'id', value: s.uploadId},
            {type: 'field', name: 'lastModified', value: piv.mtime}
         ]}}, 400, function (s, rq, rs) {
            if (H.stop ('body.error', rs.body.error, 'Invalid piv')) return false;
            return true;
         }];

         if (piv.unsupported) return ['upload ' + piv.name, 'post', 'piv', {}, function (s) {return {multipart: [
            {type: 'file',  name: 'piv', path: piv.path},
            {type: 'field', name: 'id', value: s.uploadId},
            {type: 'field', name: 'lastModified', value: piv.mtime}
         ]}}, 400, H.cBody ({error: 'format'})];

         // Figure out which thumbnails (thumbS & thumbM) are needed for the piv, if any
         var thumbS, thumbM, max = Math.max (piv.dimw, piv.dimh);
         if (piv.format === 'gif') thumbS = true;
         else if (piv.format !== 'jpeg' || piv.deg) {
            // If piv is not a jpeg, we need to create a jpeg thumbnail to show in the browser.
            // Also, if piv has rotation metadata, we need to create a thumbnail with no rotation metadata, to have a thumbnail with no metadata and thus avoid some browsers doing double rotation (one done by the metadata, another one by our interpretation of it).
            thumbS = true;
            // If piv has a dimension larger than CONFIG.thumbSizes.S, we'll also need a CONFIG.thumbSizes.M thumbnail.
            if (max > CONFIG.thumbSizes.S) thumbM = true;
         }
         else {
            thumbS = max > CONFIG.thumbSizes.S;
            thumbM = max > CONFIG.thumbSizes.M;
         }

         // We add two arbitrary tags.
         var tags = [piv.name, piv.hash + ''].sort ();

         return [
            ['upload ' + piv.name, 'post', 'piv', {}, function (s) {return {multipart: [
               {type: 'file',  name: 'piv', path: piv.path},
               {type: 'field', name: 'id',   value: s.uploadId},
               {type: 'field', name: 'tags', value: JSON.stringify (tags)},
               {type: 'field', name: 'lastModified', value: piv.mtime}
            ]}}, 200, function (s, rq, rs) {
               if (H.stop ('id type', type (rs.body.id), 'string'))  return false;
               piv.id = rs.body.id;
               if (H.stop ('deg', rs.body.deg, piv.deg)) return false;
               return true;
            }],
            ['get log for upload of ' + name, 'get', 'account', {}, '', 200, function (s, rq, rs) {
               var log = teishi.last (rs.body.logs);
               if (H.stop ('log.t type', type (log.t), 'integer')) return false;
               delete log.t;
               if (H.stop ('log.deg', log.deg, piv.deg)) return false;
               delete log.deg;
               if (H.stop ('log', log, {ev: 'upload', type: 'ok', id: s.uploadId, pivId: piv.id, tags: tags})) return false;
               return true;
            }],
            ['get last piv uploaded (' + name + ')', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs, next) {
               var upiv = rs.body.pivs [0];
               if (H.stop ('id type', type (upiv.id), 'string')) return false;
               if (H.stop ('dateup type', type (upiv.dateup), 'integer')) return false;
               if (upiv.dateup > Date.now () || Date.now () - upiv.dateup > 4000) return clog ('dateup must be less than 4000ms away from the current time but instead is ' + (Date.now () - upiv.dateup) + 'ms');
               if (dale.stop ({
                  owner: 'user1',
                  name: piv.name,
                  tags: tags.concat (tk.pivs [name].dateTags).sort (),
                  date: piv.date,
                  dates: piv.dates,
                  dimw: piv.dimw,
                  dimh: piv.dimh,
                  deg:  piv.isVid ? undefined : piv.deg,
                  format: piv.format
               }, false, function (v, k) {
                  if (H.stop (name + ' - field ' + k, upiv [k], v)) return false;
               }) === false) return false;

               if (  thumbS &&  ! upiv.thumbS) return clog (name + ' - missing thumbS');
               if (! thumbS   &&  upiv.thumbS) return clog (name + ' - unnecessary thumbS');
               if (  thumbM &&  ! upiv.thumbM) return clog (name + ' - missing thumbM');
               if (! thumbM &&    upiv.thumbM) return clog (name + ' - unnecessary thumbM');

               if (piv.invalid || piv.unsupported || ! piv.mimetype.match ('video')) return true;
               if (piv.format.match (/^mp4:/)) {
                  if (H.stop ('piv.vid', upiv.vid, true)) return false;
                  return true;
               }

               // Get pending status on non-mp4 videos that are being converted.
               h.one (s, {method: 'get', path: 'piv/' + piv.id, code: 404, apres: function (s, rq, rs) {
                  if (H.stop ('body', rs.body, 'pending')) return next (false);

                  // Keep the upload alive while we wait for the non-mp4 video to get a mp4 version
                  var interval = setInterval (function () {
                     h.one (s, {method: 'post', path: 'upload', code: 200, body: {csrf: s.csrf, id: s.uploadId, op: 'wait'}, apres: function () {}});
                  }, 500);

                  // For non-mp4 videos, check that mp4 version of video is eventually returned.
                  H.tryTimeout (10, 3000, function (cb) {
                     h.one (s, {method: 'get', path: 'piv/' + piv.id, code: 200, raw: true, apres: function (s, rq, rs) {
                        piv.mp4size = Buffer.from (rs.body, 'binary').length;
                        clearInterval (interval);
                        return true;
                     }}, cb);
                  }, next);
               }});
            }],
            dale.go (['S', 'M'], function (size, k) {
               return {tag: 'get thumb' + size + ' for ' + name, method: 'get', path: function (s) {return 'thumb/' + size + '/' + piv.id}, code: 200, raw: true, apres: function (s, rq, rs, next) {
                  if (size === 'S' && thumbS || size === 'M' && thumbM) piv ['bythumb' + size] = Buffer.from (rs.body, 'binary').length;
                  a.stop ([
                     [a.make (fs.writeFile), name + '-t' + size, Buffer.from (rs.body, 'binary'), {encoding: 'binary'}],
                     [H.getMetadata, name + '-t' + size, false, piv.mtime, piv.name],
                     function (s) {
                        var percentage = Math.min (Math.round (CONFIG.thumbSizes [size] / max * 100), 100);
                        var askanceThumb = piv.mimetype.match ('video') && (piv.deg === 90 || piv.deg === -90);
                        if (H.stop ('thumb' + size + ' width',  askanceThumb ? s.last.dimh : s.last.dimw, Math.round (piv.dimw * percentage / 100))) return next (true);
                        if (H.stop ('thumb' + size + ' height', askanceThumb ? s.last.dimw : s.last.dimh, Math.round (piv.dimh * percentage / 100))) return next (true);
                        var targetFormat = 'jpeg';
                        if (piv.format === 'gif' && size === 'M') targetFormat = 'gif';

                        if (H.stop ('thumb' + size + ' format', s.last.format, targetFormat)) return next (true);

                        s.next ();
                     },
                     [a.make (fs.unlink), name + '-t' + size],
                     function (s) {
                        next ();
                     },
                  ], function (s, error) {
                     next (error);
                  });
               }};
            }),
            ['determine size of stored pivs & check byfs for ' + name, 'get', 'account', {}, '', 200, function (s, rq, rs) {
               dale.go (['byfs', 'bys3', 'pics', 'vids', 'thumbS', 'thumbM'], function (v) {
                  if (! s [v]) s [v] = 0;
               });

               s.byfs += piv.size + (piv.mp4size || 0) + (piv.bythumbS || 0) + (piv.bythumbM || 0);
               // The H.encrypt function, used to encrypt files before uploading them to S3, increases file size by 32 bytes.
               s.bys3 += piv.size + 32;
               if (H.stop ('byfs', rs.body.usage.byfs, s.byfs)) return false;

               piv.isVid ? s.vids++ : s.pics++;
               if (piv.bythumbS) s.thumbS++;
               if (piv.bythumbM) s.thumbM++;
               return true;
            }],
            H.testTimeout (10, 1000, {tag: 'determine of stored pivs & check bys3 for ' + name, method: 'get', path: 'account', code: 200, apres: function (s, rq, rs) {
               // We avoid using H.stop to avoid printing temporary errors.
               if (rs.body.usage.bys3 !== s.bys3) return false;
               return true;
            }}),
            ['get public stats after uploading ' + name, 'get', 'stats', {}, '', 200, function (s, rq, rs) {
               if (H.stop ('public stats', rs.body, {byfs: split (s.byfs), bys3: split (s.bys3), pivs: parseInt (s.pics) + parseInt (s.vids) + '', pics: s.pics + '', vids: s.vids + '', thumbS: s.thumbS + '', thumbM: s.thumbM + '', users: '1'})) return false;
               return true;
            }],
            piv.nonmp4 ? [] : {tag: 'download piv ' + piv.name, method: 'get', path: function (s) {return '/piv/' + piv.id}, code: 200, raw: true, apres: function (s, rq, rs, next) {
               if (Buffer.compare (Buffer.from (rs.body, 'binary'), fs.readFileSync (piv.path)) !== 0) return clog ('Mismatch between original and uploaded file');
               return true;
            }},
            {tag: 'download original piv from S3 - ' + piv.name, method: 'get', path: function (s) {return '/original/' + piv.id}, code: 200, raw: true, apres: function (s, rq, rs, next) {
               if (Buffer.compare (Buffer.from (rs.body, 'binary'), fs.readFileSync (piv.path)) !== 0) return clog ('Mismatch between original and uploaded file');
               return true;
            }},
            ['delete piv ' + name, 'post', 'delete', {}, function (s) {return {ids: [piv.id]}}, 200, function (s, rq, rs) {
               s.byfs -= piv.size + (piv.mp4size || 0) + (piv.bythumbS || 0) + (piv.bythumbM || 0);
               // The H.encrypt function, used to encrypt files before uploading them to S3, increases file size by 32 bytes.
               s.bys3 -= piv.size + 32;

               piv.isVid ? s.vids-- : s.pics--;
               if (piv.bythumbS) s.thumbS--;
               if (piv.bythumbM) s.thumbM--;
               return true;
            }],
            H.testTimeout (10, 1000, {tag: 'determine of stored pivs & check bys3 after deleting ' + name, method: 'get', path: 'account', code: 200, apres: function (s, rq, rs) {
               if (H.stop ('byfs', rs.body.usage.byfs, s.byfs)) return false;
               // We avoid using H.stop to avoid printing temporary errors.
               if (rs.body.usage.bys3 !== s.bys3) return false;
               return true;
            }}),
            ['get public stats after deleting ' + name, 'get', 'stats', {}, '', 200, function (s, rq, rs) {
               if (H.stop ('public stats', rs.body, {byfs: split (s.byfs), bys3: split (s.bys3), pivs: parseInt (s.pics) + parseInt (s.vids) + '', pics: s.pics + '', vids: s.vids + '', thumbS: s.thumbS + '', thumbM: s.thumbM + '', users: '1'})) return false;
               return true;
            }],
            ['send wait operation to revive upload in case it is necessary', 'post', 'upload', {}, function (s) {return {id: s.uploadId, op: 'wait'}}, 200],
         ];
      }),
      // *** CHECK DATE/TIME ORIGINAL ***
      dale.stopNot (tk.pivs, undefined, function (piv) {
         if (piv.dateSource !== 'Date/Time Original') return;
         var id;
         return [
            ['For piv with Date/Time original timestamp, upload with lower date in both name and lastModified, check that Date/Time Original timestamp is still used', 'post', 'piv', {}, function (s) {return {multipart: [
               {type: 'file',  name: 'piv', path: piv.path, filename: 'PHOTO_2000-01-01'},
               {type: 'field', name: 'id', value: s.uploadId},
               {type: 'field', name: 'lastModified', value: new Date ('1995-01-01').getTime ()}
            ]}}, 200, function (s, rq, rs) {
               id = rs.body.id;
               return true;
            }],
            ['get last piv uploaded and check date & dates', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs, next) {
               var upiv = rs.body.pivs [0];
               var dates = dale.obj ({'upload:fromName': 'PHOTO_2000-01-01', 'upload:lastModified': new Date ('1995-01-01').getTime ()}, piv.dates, function (v, k) {return [k, v]});
               if (H.stop ('uploaded piv date fields', {dates: upiv.dates, date: upiv.date, dateSource: upiv.dateSource}, {dates: dates, date: piv.date, dateSource: piv.dateSource})) return false;
               return true;
            }],
            ['delete piv ' + piv.name, 'post', 'delete', {}, function (s) {return {ids: [id]}}, 200],
         ];
      }),
      // *** CHECK NON-PIV EXTENSIONS ***
      dale.go (tk.pivs, function (piv) {
         if (piv.invalid || piv.unsupported || piv.repeated) return [];
         var id;
         return [
            ['upload ' + piv.name + ' with a name with a non-piv extension', 'post', 'piv', {}, function (s) {return {multipart: [
               {type: 'file',  name: 'piv', path: piv.path, filename: piv.name.replace (/\.+/g, '') + '.pdf'},
               {type: 'field', name: 'id', value: s.uploadId},
               {type: 'field', name: 'lastModified', value: piv.mtime}
            ]}}, 200, function (s, rq, rs) {
               id = rs.body.id;
               return true;
            }],
            ['delete piv ' + piv.name, 'post', 'delete', {}, function (s) {return {ids: [id]}}, 200],
         ];
      }),
      // *** CHECK IDENTICAL REPETITION ***
      ['upload small piv to test addition of tags & dates with repeated files', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload small piv again with different lastModified, date from name and tags', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path, filename: 'PHOTO_1995-05-01.jpg'},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'tags', value: JSON.stringify (['foo'])},
         {type: 'field', name: 'lastModified', value: new Date ('2000-01-01').getTime ()},
      ]}}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {id: s.smallId, repeated: true, hash: tk.pivs.small.hash})) return false;
         return true;
      }],
      ['get piv metadata after repeated piv with lastModified', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         var piv = rs.body.pivs [0];
         if (H.stop ('piv.tags', piv.tags, ['d::1995', 'd::M5', 'foo'])) return false;
         var repeatedTimestamp = dale.stopNot (piv.dates, undefined, function (v, k) {
            if (k.match ('repeated')) return k.split (':') [1];
         });
         if (! repeatedTimestamp) return clog ('Piv must have two repeated timestamps!');
         if (H.stop ('piv.dates.repeated lastModified', piv.dates ['repeated:' + repeatedTimestamp + ':lastModified'], new Date ('2000-01-01').getTime ())) return false;
         if (H.stop ('piv.dates.repeated fromName', piv.dates ['repeated:' + repeatedTimestamp + ':fromName'], 'PHOTO_1995-05-01.jpg')) return false;
         if (H.stop ('piv.date', piv.date, new Date ('1995-05-01').getTime ())) return false;
         return true;
      }],
      ['get log for upload of identical repeated piv', 'get', 'account', {}, '', 200, function (s, rq, rs) {

         var log = teishi.last (rs.body.logs);
         var expected = {ev: 'upload', type: 'repeated', id: s.uploadId, pivId: s.smallId, tags: ['foo'], lastModified: new Date ('2000-01-01').getTime (), name: 'PHOTO_1995-05-01.jpg', size: tk.pivs.small.size, identical: true};
         if (H.stop ('log', dale.obj (log, function (v, k) {
            if (expected [k] !== undefined) return [k, v];
         }), expected)) return false;
         return true;
      }],
      ['delete small piv', 'post', 'delete', {}, function (s) {return {ids: [s.smallId]}}, 200],

      // *** CHECK REPETITION OF PIV WITH SAME BITMAP/STREAMS BUT DIFFERENT METADATA ***

      dale.go ([['small', 'small-meta', 'Create Date'], ['medium', 'medium-nometa']], function (testCase) {
         return [
            ['upload ' + testCase [0] + ' piv to test upload of piv with same bitmap and different metadata', 'post', 'piv', {}, function (s) {return {multipart: [
               {type: 'file',  name: 'piv',          path:  tk.pivs [testCase [0]].path},
               {type: 'field', name: 'id',           value: s.uploadId},
               {type: 'field', name: 'lastModified', value: tk.pivs [testCase [0]].mtime},
            ]}}, 200, function (s, rq, rs) {
               if (H.stop ('keys of body', dale.keys (rs.body), ['id', 'hash'])) return false;
               s.repeatedId = rs.body.id;
               return true;
            }],
            ['upload ' + testCase [0] + ' piv with different metadata', 'post', 'piv', {}, function (s) {return {multipart: [
               {type: 'file',  name: 'piv',          path:  tk.pivs [testCase [1]].path, filename: 'PHOTO_1995-01-01.jpg'},
               {type: 'field', name: 'id',           value: s.uploadId},
               {type: 'field', name: 'tags',         value: JSON.stringify (['foo'])},
               {type: 'field', name: 'lastModified', value: new Date ('2000-01-01').getTime ()},
            ]}}, 200, function (s, rq, rs) {
               if (H.stop ('body', rs.body, {id: s.repeatedId, repeated: true, hash: tk.pivs [testCase [1]].hash})) return false;
               return true;
            }],
            ['get ' + testCase [0] + ' piv metadata after uploading piv with different metadata', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
               var piv = rs.body.pivs [0];
               if (H.stop ('piv.tags', piv.tags, ['d::1995', 'd::M1', 'foo'])) return false;
               var repeatedTimestamp = dale.stopNot (piv.dates, undefined, function (v, k) {
                  if (k.match ('repeated')) return k.split (':') [1];
               });
               if (! repeatedTimestamp) return clog ('Piv must have two repeated timestamps!');
               if (H.stop ('piv.dates.repeated lastModified', piv.dates ['repeated:' + repeatedTimestamp + ':lastModified'], new Date ('2000-01-01').getTime ())) return false;
               if (H.stop ('piv.dates.repeated fromName', piv.dates ['repeated:' + repeatedTimestamp + ':fromName'], 'PHOTO_1995-01-01.jpg')) return false;
               if (testCase [2] && H.stop ('piv.dates.repeated ' + testCase [2], piv.dates ['repeated:' + repeatedTimestamp + ':' + testCase [2]], tk.pivs [testCase [1]].dates [testCase [2]])) return false;
               if (H.stop ('piv.date', piv.date, new Date ('1995-01-01').getTime ())) return false;
               return true;
            }],
            ['get log for upload of repeated ' + testCase [0] + ' piv with different metadata', 'get', 'account', {}, '', 200, function (s, rq, rs) {

               var log = teishi.last (rs.body.logs);
               var expected = {ev: 'upload', type: 'repeated', id: s.uploadId, pivId: s.repeatedId, tags: ['foo'], lastModified: new Date ('2000-01-01').getTime (), name: 'PHOTO_1995-01-01.jpg', size: tk.pivs [testCase [1]].size, identical: false};
               if (H.stop ('log', dale.obj (log, function (v, k) {
                  if (expected [k] !== undefined) return [k, v];
               }), expected)) return false;
               if (H.stop ('log.dates type', type (log.dates), 'object')) return false;
               if (testCase [2] && H.stop ('log.dates ' + testCase [2], log.dates [testCase [2]], tk.pivs [testCase [1]].dates [testCase [2]])) return false;
               return true;
            }],
            ['delete piv', 'post', 'delete', {}, function (s) {return {ids: [s.repeatedId]}}, 200],
         ];
      }),
      // *** REPEATED PIVS UPLOADED AT THE SAME TIME (RACE CONDITION HASH CHECKS) ***
      [
         ['load multiple requests with identical files', 'get', '/', {}, '', 200, function (s, rq, rs, next) {
            var results = [], left = 5, body = {multipart: [
               {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
               {type: 'field', name: 'id',           value: s.uploadId},
               {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
               {type: 'field', name: 'csrf',         value: s.csrf}
            ]};
            dale.go (dale.times (5, 0), function (n) {
               h.one (s, {method: 'post', path: 'piv', code: 200, body: body, apres: function (s, rq, rs) {
                  results [n] = rs.body;
                  left--;
                  return true;
               }}, function (error) {
                  if (left) return;
                  var id, repeated = 0;
                  var error = dale.stopNot (results, undefined, function (result) {
                     if (! id) id = result.id;
                     if (result.id !== id) return 'Invalid/different id: ' + result.id + ', expected ' + id;
                     if (result.repeated) repeated++;
                  });
                  if (error) return clog (error);
                  if (repeated !== 4) return clog ('Expected 4 repeated pivs and one uploaded piv, but instead got ' + repeated + ' pivs');
                  s.smallId = id;
                  next ();
               });
            });
         }],
         ['delete small piv', 'post', 'delete', {}, function (s) {return {ids: [s.smallId]}}, 200],
         ['load multiple requests with files with different metadata', 'get', '/', {}, '', 200, function (s, rq, rs, next) {
            var results = [], left = 5;
            dale.go (dale.times (5, 0), function (n) {
               var body = {multipart: [
                  {type: 'file',  name: 'piv',          path:  tk.pivs [n % 2 === 0 ? 'small' : 'small-meta'].path},
                  {type: 'field', name: 'id',           value: s.uploadId},
                  {type: 'field', name: 'lastModified', value: tk.pivs [n % 2 === 0 ? 'small' : 'small-meta'].mtime},
                  {type: 'field', name: 'csrf',         value: s.csrf}
               ]};
               h.one (s, {method: 'post', path: 'piv', code: 200, body: body, apres: function (s, rq, rs) {
                  results [n] = rs.body;
                  left--;
                  return true;
               }}, function (error) {
                  if (left) return;
                  var repeated = 0, id;
                  dale.go (results, function (result) {
                     if (result.repeated) repeated++;
                     else id = result.id;
                  });
                  if (repeated !== 4) return clog ('Expected 4 repeated pivs and one uploaded piv, but instead got ' + repeated + ' pivs');
                  // We don't check for the ids to be the same because some ids might be temporary ids from pivs being uploaded right now that are repeated on the hash check (after stripping metadata) but not on the hashorig check (before stripping metadata)
                  s.smallId = id;
                  next ();
               });
            });
         }],
         ['delete small piv', 'post', 'delete', {}, function (s) {return {ids: [s.smallId]}}, 200],
         ['upload small piv to check absence of race condition hashes', 'post', 'piv', {}, function (s) {return {multipart: [
            {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
            {type: 'field', name: 'id',           value: s.uploadId},
            {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
         ]}}, 200, function (s, rq, rs) {
            if (rs.body.repeated) return clog ('raceConditionHash or raceConditionHashOrig not cleaned up');
            s.smallId = rs.body.id;
            return true;
         }],
         ['delete small piv', 'post', 'delete', {}, function (s) {return {ids: [s.smallId]}}, 200],
         ['upload small-meta piv to check absence of race condition hashes', 'post', 'piv', {}, function (s) {return {multipart: [
            {type: 'file',  name: 'piv',          path:  tk.pivs ['small-meta'].path},
            {type: 'field', name: 'id',           value: s.uploadId},
            {type: 'field', name: 'lastModified', value: tk.pivs ['small-meta'].mtime},
         ]}}, 200, function (s, rq, rs) {
            if (rs.body.repeated) return clog ('raceConditionHash or raceConditionHashOrig not cleaned up');
            s.smallMetaId = rs.body.id;
            return true;
         }],
         ['delete small-meta piv', 'post', 'delete', {}, function (s) {return {ids: [s.smallMetaId]}}, 200],
      ],
      suites.auth.out (tk.users.user1),
   ];
}

suites.upload.stream = function () {
   return [
      suites.auth.in  (tk.users.user1),
      ['start upload to test querying', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      dale.go (['bach', 'drumming'], function (piv) {
         return [
            ['upload ' + piv + ' video for range test', 'post', 'piv', {}, function (s) {return {multipart: [
               {type: 'file',  name: 'piv',          path:  tk.pivs [piv].path},
               {type: 'field', name: 'id',           value: s.uploadId},
               {type: 'field', name: 'lastModified', value: tk.pivs [piv].mtime},
            ]}}, 200, function (s, rq, rs, next) {
               s [piv] = rs.body;
               if (piv === 'bach') return true;
               // Wait until the non-mp4 video is converted and get the size of its mp4 version.
               H.tryTimeout (10, 3000, function (cb) {
                  h.one (s, {method: 'get', path: 'piv/' + s [piv].id, code: 200, raw: true, apres: function (s, rq, rs) {
                     s.mp4size = Buffer.from (rs.body, 'binary').length;
                     return true;
                  }}, cb);
               }, next);
            }],
            dale.go (['1', '1:2', '-1-0', '-2--1', '0-0', '1-1', '3-1', '0.1-0.5'], function (invalidRange) {
               return ['request piv with invalid range header', 'get', function (s) {return 'piv/' + s [piv].id}, {range: 'bytes=' + invalidRange}, '', 400, H.cBody ({error: 'Invalid range'})];
            }),
            dale.go (['0-', '0-100000', '0-1000000', 'lastPart'], function (range, k) {
               return ['request with range ' + range, 'get', function (s) {return 'piv/' + s [piv].id + (k === 0 ? '?original=1' : '')}, function (s) {
                  if (range !== 'lastPart') return {range: 'bytes=' + range};
                  var size = piv === 'bach' ? tk.pivs [piv].size : s.mp4size;
                  return {range: 'bytes=' + (size - 99999) + '-' + (size + 1000)};
               }, '', 206, function (s, rq, rs) {
                  var size = tk.pivs [piv].size;
                  if (piv === 'drumming' && k !== 0)  size = s.mp4size;
                  if (H.stop ('headers.accept-ranges', rs.headers ['accept-ranges'], 'bytes')) return false;
                  if (H.stop ('headers.content-type', rs.headers ['content-type'], k === 0 && piv === 'drumming' ? tk.pivs [piv].mimetype : mime.getType ('mp4'))) return false;
                  var sizes = [Math.min (3000000, size), Math.min (100001, size), Math.min (1000001, size), 99999];
                  if (H.stop ('headers.content-length', rs.headers ['content-length'], sizes [k] + '')) return false;
                  var ranges = [
                     '0-' + (sizes [k] - 1) + '/' + size,
                     '0-' + (sizes [k] - 1) + '/' + size,
                     '0-' + (sizes [k] - 1) + '/' + size,
                     (size - 99999) + '-' + (size - 1) + '/' + size
                  ];
                  if (H.stop ('headers.content-range', rs.headers ['content-range'], 'bytes ' + ranges [k])) return false;
                  return true;
               }];
            }),
            piv !== 'bach' ? [] : [
               {tag: 'download first part of piv with range request', method: 'get', path: function (s) {return '/piv/' + s [piv].id}, code: 206, headers: {range: '0-100000'}, raw: true, apres: function (s, rq, rs, next) {
                  s.buffer = Buffer.from (rs.body, 'binary');
                  return true;
               }},
               {tag: 'download second part of piv with range request', method: 'get', path: function (s) {return '/piv/' + s [piv].id}, code: 206, headers: {range: '100001-'}, raw: true, apres: function (s, rq, rs, next) {
                  if (Buffer.compare (Buffer.concat ([s.buffer, Buffer.from (rs.body, 'binary')]), fs.readFileSync (tk.pivs [piv].path)) !== 0) return clog ('Mismatch between original file and streamed file');
                  return true;
               }},
               {tag: 'download offsetted second part of piv with range request', method: 'get', path: function (s) {return '/piv/' + s [piv].id}, code: 206, headers: {range: '100002-'}, raw: true, apres: function (s, rq, rs, next) {
                  if (Buffer.compare (Buffer.concat ([s.buffer, Buffer.from (rs.body, 'binary')]), fs.readFileSync (tk.pivs [piv].path)) !== -1) return clog ('No mismatch between original file and streamed file, ranges are being ignored');
                  return true;
               }},
            ]
         ];
      }),
      suites.auth.out (tk.users.user1),
   ];
}

suites.upload.full = function () {
   if (noUpload) return [];
   return [
      suites.upload.upload (),
      suites.upload.uploadCheck (),
      suites.upload.piv (),
      suites.upload.stream (),
   ];
}

suites.delete = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('delete pivs', 'delete', [
         [[], 'object'],
         [[], 'keys', ['ids']],
         [[], 'invalidKeys', ['foo']],
         [['ids'], 'array'],
         [['ids', 0], 'type', 'string', 'each of the body.ids should have as type string but one of .+ is .+ with type'],
         [['ids'], 'invalidValues', [['foo', 'bar', 'foo']], 'repeated'],
      ]),
      ['delete nonexisting piv', 'post', 'delete', {}, {ids: ['foo']}, 404],
      ['get logs after no-ops', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('last log ev', log.ev, 'auth')) return false;
         return true;
      }],
      ['delete pivs no-op', 'post', 'delete', {}, {ids: []}, 200],
      ['start upload to test deletion', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload large piv to test deletion', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.large.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.large.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.largeId = rs.body.id;
         return true;
      }],
      ['query pivs before deletion', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         s.largePiv = rs.body.pivs [0];
         return true;
      }],
      ['tag large piv to test deletion', 'post', 'tag', {}, function (s) {return {ids: [s.largeId], tag: 'foo'}}, 200],
      ['mark large piv as organized to test deletion', 'post', 'tag', {}, function (s) {return {ids: [s.largeId], tag: 'o::'}}, 200],
      ['delete piv', 'post', 'delete', {}, function (s) {return {ids: [s.largeId]}}, 200],
      ['get tags after deletion', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body.tags, [])) return false;
         return true;
      }],
      ['query pivs after deletion', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         delete rs.body.perf;
         if (H.stop ('body', rs.body, {total: 0, pivs: [], tags: {'a::': 0, 'u::': 0, 'o::': 0, 't::': 0}, refreshQuery: true})) return false;
         return true;
      }],
      ['get thumbS after deletion', 'get', function (s) {return 'thumb/S/' + s.largePiv.id}, {}, '', 404],
      ['get thumbM after deletion', 'get', function (s) {return 'thumb/M/' + s.largePiv.id}, {}, '', 404],
      ['get original piv after deletion', 'get', function (s) {return '/piv/' + s.largePiv.id}, {}, '', 404],
      ['get logs after deletion', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('log', {ev: 'delete', ids: [s.largeId]}, {ev: log.ev, ids: log.ids})) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.rotate = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('rotate pivs', 'rotate', [
         [[], 'object'],
         [[], 'keys', ['ids', 'deg']],
         [[], 'invalidKeys', ['foo']],
         [['deg'], 'invalidValues', [-180, 0, 270]],
         [['deg'], 'values', [90, -90, 180]],
         [['ids'], 'array'],
         [['ids', 0], 'type', 'string', 'each of the body.ids should have as type string but one of .+ is .+ with type'],
         [['ids'], 'invalidValues', [['foo', 'bar', 'foo']], 'repeated'],
      ]),
      ['rotate nonexisting piv', 'post', 'rotate', {}, {deg: 90, ids: ['foo']}, 404],
      ['rotate pivs no-op', 'post', 'rotate', {}, {deg: 90, ids: []}, 400],
      ['start upload to test rotation', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test rotation', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload vid to test rotation', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.bach.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.bach.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.vidId = rs.body.id;
         return true;
      }],
      ['rotate pivs with non-existing piv', 'post', 'rotate', {}, function (s) {return {deg: 90, ids: [s.smallId, s.vidId, 'foo']}}, 404],
      ['get logs after no-ops', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('last log ev', log.ev, 'upload')) return false;
         return true;
      }],
      ['rotate pivs once to check that video ignores rotation', 'post', 'rotate', {}, function (s) {return {deg: 90, ids: [s.smallId, s.vidId]}}, 200],
      ['get logs after rotation', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('log', {ev: 'rotate', ids: [s.smallId, s.vidId].sort ()}, {ev: log.ev, ids: log.ids.sort ()})) return false;
         return true;
      }],
      ['get pivs after rotation', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('vid.deg', rs.body.pivs [0].deg, undefined)) return false;
         if (H.stop ('pic.deg', rs.body.pivs [1].deg, 90))        return false;
         return true;
      }],
      ['rotate pivs back', 'post', 'rotate', {}, function (s) {return {deg: -90, ids: [s.smallId, s.vidId]}}, 200],
      ['get pivs after rotating them back', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('vid.deg', rs.body.pivs [0].deg, undefined)) return false;
         if (H.stop ('pic.deg', rs.body.pivs [1].deg, undefined)) return false;
         return true;
      }],
      dale.go ([0, 90, 180, -90], function (initial) {
         return [
            ! initial ? [] : ['rotate piv into initial position: ' + initial, 'post', 'rotate', {}, function (s) {return {deg: initial, ids: [s.smallId]}}, 200],
            dale.go ([90, -90, 180], function (deg) {
               return [
                  ['get pic after initial rotation', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
                     if (H.stop ('pic.deg', rs.body.pivs [1].deg, initial || undefined)) return false;
                     return true;
                  }],
                  ['rotate pic by ' + deg, 'post', 'rotate', {}, function (s) {return {deg: deg, ids: [s.smallId]}}, 200],
                  ['get pic after second rotation', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
                     var expected = initial + deg;
                     if (expected === -180) expected = 180;
                     if (expected === 270)  expected = -90;
                     if (expected === 360)  expected = undefined;
                     if (H.stop ('pic.deg', rs.body.pivs [1].deg, expected || undefined)) return false;
                     return true;
                  }],
                  ['restore pic rotation', 'post', 'rotate', {}, function (s) {return {deg: deg === 180 ? 180 : - deg, ids: [s.smallId]}}, 200],
                  ['get pic after restoration', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
                     if (H.stop ('pic.deg', rs.body.pivs [1].deg, initial || undefined)) return false;
                     return true;
                  }],
               ];
            }),
            ! initial ? [] : ['rotate piv into neutral position', 'post', 'rotate', {}, function (s) {return {deg: initial === 180 ? 180 : - initial, ids: [s.smallId]}}, 200],
         ];
      }),
      suites.auth.out (tk.users.user1),
   ];
}

suites.date = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('change date of pivs', 'date', [
         [[], 'object'],
         [[], 'keys', ['ids', 'date']],
         [[], 'invalidKeys', ['foo']],
         [['ids'], 'array'],
         [['ids', 0], 'type', 'string', 'each of the body.ids should have as type string but one of .+ is .+ with type'],
         [['date'], 'integer'],
         [['date'], 'values', [1]],
         [['date'], 'range', {min: 0, max: 4133980799999}],
         [['ids'], 'invalidValues', [['foo', 'bar', 'foo']], 'repeated'],
      ]),
      ['change date of nonexisting piv', 'post', 'date', {}, {ids: ['foo'], date: Date.now ()}, 404],
      ['change date no-op', 'post', 'date', {}, {ids: [], date: Date.now ()}, 400],
      ['start upload to test rotation', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test rotation', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['get small piv before date change', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         s.date = rs.body.pivs [0].date;
         return true;
      }],
      ['change date of small piv', 'post', 'date', {}, function (s) {return {ids: [s.smallId], date: 0}}, 200],
      ['get small piv after date change', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('piv.date', rs.body.pivs [0].date, 0 + (s.date % 86400000))) return false;
         if (H.stop ('piv.dates.userDate', rs.body.pivs [0].dates.userDate, 0)) return false;
         if (H.stop ('piv.dateSource', rs.body.pivs [0].dateSource, 'userDate')) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, ['d::1970', 'd::M1'])) return false;
         return true;
      }],
      ['change date of small piv again', 'post', 'date', {}, function (s) {return {ids: [s.smallId], date: new Date ('2022-12-18').getTime ()}}, 200],
      ['get small piv after date change', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('piv.date', rs.body.pivs [0].date, new Date ('2022-12-18').getTime () + (s.date % 86400000))) return false;
         if (H.stop ('piv.dates.userDate', rs.body.pivs [0].dates.userDate, new Date ('2022-12-18').getTime ())) return false;
         if (H.stop ('piv.dateSource', rs.body.pivs [0].dateSource, 'userDate')) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, ['d::2022', 'd::M12'])) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.tag = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('tag pivs', 'tag', [
         [[], 'object'],
         [[], 'keys', ['tag', 'ids', 'del', 'autoOrganize']],
         [[], 'invalidKeys', ['foo']],
         [['tag'], 'string'],
         [['ids'], 'array'],
         [['ids', 0], 'type', 'string', 'each of the body.ids should have as type string but one of .+ is .+ with type'],
         [['del'], 'type', ['boolean', 'undefined'], 'body.del should be equal to one of \\[true,false,null\\] but instead is .+'],
         [['autoOrganize'], 'type', ['boolean', 'undefined'], 'body.autoOrganize should be equal to one of \\[true,false,null\\] but instead is .+'],
         [['tag'], 'invalidValues', ['a::', ' a::', 'u::', ' u::', 'u:: ', 'g::a', 'd::2021', 'x::'], 'tag'],
         [['ids'], 'invalidValues', [['foo', 'bar', 'foo']], 'repeated'],
      ]),
      ['tag nonexisting piv', 'post', 'tag', {}, {tag: 'foo', ids: ['foo']}, 404],
      ['tag pivs no-op', 'post', 'tag', {}, {deg: 'tag', ids: []}, 400],
      ['start upload to test tagging', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test tagging', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload medium piv to test tagging', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.medium.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.medium.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.mediumId = rs.body.id;
         return true;
      }],
      ['get 404 if tagging a nonexisting piv', 'post', 'tag', {}, function (s) {return {tag: 'foo', ids: ['bar']}}, 404],
      ['get 404 if tagging a nonexisting piv together with an existing one', 'post', 'tag', {}, function (s) {return {tag: 'foo', ids: [s.smallId, 'bar']}}, 404],
      ['get logs after no-ops', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('last log ev', log.ev, 'upload')) return false;
         return true;
      }],
      ['get tags before tagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.medium.dateTags).sort ())) return false;
         return true;
      }],
      ['query pivs before tagging', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         // Yes, I'm using the computed property feature of ES6. It's just too convenient. Don't tell anyone.
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 2, 'o::': 0, 't::': 2})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags)) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags)) return false;
         return true;
      }],
      ['query pivs before tagging using year', 'post', 'query', {}, {tags: tk.pivs.small.dateTags, sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         // `all` always returns the total count; the amount of `untagged` pivs is query dependent, as is that of all other tags.
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, 'a::': 2, 'u::': 1, 'o::': 0, 't::': 1})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.small.dateTags)) return false;
         return true;
      }],
      ['tag pivs', 'post', 'tag', {}, function (s) {return {tag: 'tag1', ids: [s.smallId, s.mediumId]}}, 200],
      ['get tags after tagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.medium.dateTags).concat ('tag1').sort ())) return false;
         return true;
      }],
      ['query pivs after tagging', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 0, tag1: 2, 'o::': 0, 't::': 2})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat (['tag1']).sort ())) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags.concat  (['tag1']).sort ()))  return false;
         return true;
      }],
      ['query pivs after tagging, check that query that is cutoff by `to` still shows the right amount of pivs per tag', 'post', 'query', {}, {tags: ['tag1'], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 0, tag1: 2, 'o::': 0, 't::': 2})) return false;
         return true;
      }],
      ['get logs after tagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'tag', type: 'tag', ids: [s.smallId, s.mediumId], tag: 'tag1'})) return false;
         return true;
      }],
      ['tag pivs with the same tag', 'post', 'tag', {}, function (s) {return {tag: 'tag1', ids: [s.smallId, s.mediumId]}}, 200],
      ['get tags after repeated tagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.medium.dateTags).concat ('tag1').sort ())) return false;
         return true;
      }],
      ['query pivs after repeated tagging', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 0, tag1: 2, 'o::': 0, 't::': 2})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat (['tag1']).sort ())) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags.concat  (['tag1']).sort ()))  return false;
         return true;
      }],
      ['get logs after tagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'tag', type: 'tag', ids: [s.smallId, s.mediumId], tag: 'tag1'})) return false;
         log = teishi.last (rs.body.logs, 2);
         delete log.t;
         if (H.stop ('next to last log', log, {ev: 'tag', type: 'tag', ids: [s.smallId, s.mediumId], tag: 'tag1'})) return false;
         return true;
      }],
      ['untag a tag not on any piv', 'post', 'tag', {}, function (s) {return {tag: 'tag9', ids: [s.smallId, s.mediumId], del: true}}, 200],
      ['get tags after no-op untagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.medium.dateTags).concat ('tag1').sort ())) return false;
         return true;
      }],
      ['query pivs after no-op untagging', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 0, tag1: 2, 'o::': 0, 't::': 2})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat (['tag1']).sort ())) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags.concat (['tag1']).sort ()))  return false;
         return true;
      }],
      ['get logs after no-op untagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'tag', type: 'untag', ids: [s.smallId, s.mediumId], tag: 'tag9'})) return false;
         return true;
      }],
      ['tag piv with a second tag', 'post', 'tag', {}, function (s) {return {tag: 'Tag2', ids: [s.mediumId]}}, 200],
      ['get tags after second tagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.medium.dateTags).concat (['tag1', 'Tag2']).sort (function (a, b) {
            return a.toLowerCase ().localeCompare (b.toLowerCase ());
         }))) return false;
         return true;
      }],
      ['query pivs after second tagging', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 0, tag1: 2, Tag2: 1, 'o::': 0, 't::': 2})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat (['tag1', 'Tag2']).sort ())) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags.concat  (['tag1']).sort ()))  return false;
         return true;
      }],
      ['get logs after second tagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'tag', type: 'tag', ids: [s.mediumId], tag: 'Tag2'})) return false;
         return true;
      }],
      ['untag second tag', 'post', 'tag', {}, function (s) {return {tag: 'Tag2', ids: [s.smallId, s.mediumId], del: true}}, 200],
      ['get tags after untagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.medium.dateTags).concat ('tag1').sort ())) return false;
         return true;
      }],
      ['query pivs after untagging', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 0, tag1: 2, 'o::': 0, 't::': 2})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat (['tag1']).sort ())) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags.concat  (['tag1']).sort ())) return false;
         return true;
      }],
      ['get logs after untagging', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'tag', type: 'untag', ids: [s.smallId, s.mediumId], tag: 'Tag2'})) return false;
         return true;
      }],
      ['untag first tag', 'post', 'tag', {}, function (s) {return {tag: 'tag1', ids: [s.smallId, s.mediumId], del: true}}, 200],
      ['get tags after second untagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.medium.dateTags).sort ())) return false;
         return true;
      }],
      ['query pivs after second untagging', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {'2014:5': false, '2022:3': false})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, ['2022:3', 1])) return false;
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 2, 'o::': 0, 't::': 2})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags)) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags))  return false;
         return true;
      }],
      ['mark piv as organized', 'post', 'tag', {}, function (s) {return {tag: 'o::', ids: [s.mediumId]}}, 200],
      ['query pivs after marking piv as organized', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {'2014:5': false, '2022:3': true})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, ['2022:3', 1])) return false;
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 2, 'o::': 1, 't::': 1})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat ('o::'))) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags)) return false;
         return true;
      }],
      ['mark piv as organized again (no-op)', 'post', 'tag', {}, function (s) {return {tag: 'o::', ids: [s.mediumId]}}, 200],
      ['query pivs after marking piv as organized (no-op)', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 2, 'o::': 1, 't::': 1})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat ('o::'))) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags)) return false;
         return true;
      }],
      ['mark unorganized piv as unorganized (no-op)', 'post', 'tag', {}, function (s) {return {tag: 'o::', ids: [s.smallId], del: true}}, 200],
      ['query pivs after marking piv as organized (no-op)', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {'2014:5': false, '2022:3': true})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, ['2022:3', 1])) return false;
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 2, 'o::': 1, 't::': 1})) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat ('o::'))) return false;
         if (H.stop ('piv.tags', rs.body.pivs [1].tags, tk.pivs.small.dateTags)) return false;
         return true;
      }],
      ['query organized pivs', 'post', 'query', {}, {tags: ['o::'], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {'2022:3': true})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, ['2022:3', 1])) return false;
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 1, 'o::': 1, 't::': 0})) return false;
         if (H.stop ('body.total', rs.body.total, 1)) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat ('o::'))) return false;
         return true;
      }],
      ['query unorganized pivs', 'post', 'query', {}, {tags: ['t::'], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {'2014:5': false})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, ['2014:5', 1])) return false;
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, 'a::': 2, 'u::': 1, 'o::': 0, 't::': 1})) return false;
         if (H.stop ('body.total', rs.body.total, 1)) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.small.dateTags))  return false;
         return true;
      }],
      ['query organized pivs with a tag that they have', 'post', 'query', {}, {tags: ['o::', tk.pivs.medium.dateTags [0]], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {'2022:3': true})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, ['2022:3', 1])) return false;
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 1, 'o::': 1, 't::': 0})) return false;
         if (H.stop ('body.total', rs.body.total, 1)) return false;
         if (H.stop ('piv.tags', rs.body.pivs [0].tags, tk.pivs.medium.dateTags.concat ('o::'))) return false;
         return true;
      }],
      ['query organized pivs with a tag that they do not have', 'post', 'query', {}, {tags: ['o::', tk.pivs.small.dateTags [0]], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, undefined)) return false;
         if (H.stop ('tags', rs.body.tags, {'a::': 2, 'u::': 0, 'o::': 0, 't::': 0})) return false;
         if (H.stop ('body.total', rs.body.total, 0)) return false;
         return true;
      }],
      ['delete organized piv', 'post', 'delete', {}, function (s) {return {ids: [s.mediumId]}}, 200],
      ['query pivs after deleting organized piv', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {'2014:5': false})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, ['2014:5', 1])) return false;
         if (H.stop ('tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, 'a::': 1, 'u::': 1, 'o::': 0, 't::': 1})) return false;
         return true;
      }],
      ['delete unorganized piv', 'post', 'delete', {}, function (s) {return {ids: [s.smallId]}}, 200],
      ['query pivs after deleting organized piv', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body.timeHeader, {})) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, undefined)) return false;
         if (H.stop ('tags', rs.body.tags, {'a::': 0, 'u::': 0, 'o::': 0, 't::': 0})) return false;
         return true;
      }],
      ['query pivs after deleting organized piv (idsOnly)', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2, idsOnly: true}, 200, function (s, rq, rs) {
         if (H.stop ('timeHeader', rs.body, [])) return false;
         if (H.stop ('lastMonth', rs.body.lastMonth, undefined)) return false;
         return true;
      }],
      ['upload small piv to test autoOrganize', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['tag unorganized piv with autoOrganize', 'post', 'tag', {}, function (s) {return {tag: 'foo', ids: [s.smallId], autoOrganize: true}}, 200],
      ['query piv, check it is organized', 'post', 'query', {}, {tags: ['o::'], sort: 'upload', from: 1, to: 1, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('pivs length', rs.body.pivs.length, 1)) return false;
         return true;
      }],
      ['tag unorganized piv with autoOrganize again', 'post', 'tag', {}, function (s) {return {tag: 'bar', ids: [s.smallId], autoOrganize: true}}, 200],
      ['query piv, check it is still organized', 'post', 'query', {}, {tags: ['o::'], sort: 'upload', from: 1, to: 1, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('pivs length', rs.body.pivs.length, 1)) return false;
         return true;
      }],
      ['untag organized piv with autoOrganize, still should remain organized because it still has user tags', 'post', 'tag', {}, function (s) {return {tag: 'foo', ids: [s.smallId], autoOrganize: true, del: true}}, 200],
      ['query piv, check it is still organized', 'post', 'query', {}, {tags: ['o::'], sort: 'upload', from: 1, to: 1, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('pivs length', rs.body.pivs.length, 1)) return false;
         return true;
      }],
      ['untag organized piv with autoOrganize, should be marked as not organized', 'post', 'tag', {}, function (s) {return {tag: 'bar', ids: [s.smallId], autoOrganize: true, del: true}}, 200],
      ['query piv, check it is still organized', 'post', 'query', {}, {tags: ['o::'], sort: 'upload', from: 1, to: 1, timeHeader: true}, 200, function (s, rq, rs) {
         if (H.stop ('pivs length', rs.body.pivs.length, 0)) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.query = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('query pivs', 'query', [
         [[], 'object'],
         [[], 'keys', ['tags', 'mindate', 'maxdate', 'sort', 'from', 'fromDate', 'to', 'recentlyTagged', 'idsOnly', 'timeHeader', 'refresh', 'updateLimit']],
         [[], 'invalidKeys', ['foo']],
         [['tags'], 'array'],
         [['tags', 0], 'type', 'string', 'each of the body.tags should have as type string but one of .+ is .+ with type'],
         [['mindate'], ['undefined', 'integer']],
         [['maxdate'], ['undefined', 'integer']],
         [['sort'], 'values', ['newest', 'oldest', 'upload']],
         [['sort'], 'invalidValues', ['foo']],
         [['from'], ['undefined', 'integer']],
         [['to'], 'integer'],
         [['to'], 'values', [1]],
         [['from'], 'values', [0]],
         [['from'], 'range', {min: 1}],
         [['from'], 'values', [2]],
         [['to'], 'range', {min: 2}],
         [['fromDate'], 'undefined'],
         [['from'], 'values', [undefined]],
         [['fromDate'], 'values', 'integer'],
         [['fromDate'], 'range', {min: 1}],
         [['to'], 'range', {min: 1}],
         [['recentlyTagged'], ['undefined', 'array']],
         [['recentlyTagged', 0], 'type', 'string', 'each of the body.recentlyTagged should have as type string but one of .+ is .+ with type'],
         [['idsOnly'], ['undefined', 'boolean']],
         [['timeHeader'], ['undefined', 'boolean']],
         [['tags'], 'invalidValues', [['a::']], 'all'],
         [['tags'], 'invalidValues', [['u::', 'foo', 'bar', 'foo']], 'repeated'],
         [['recentlyTagged'], 'values', [['foo']]],
         [['tags'], 'invalidValues', [['foo']], 'recentlyTagged'],
         [['refresh'], ['undefined', 'boolean']],
         [['updateLimit'], ['undefined', 'integer']]
         [['updateLimit'], 'values', 'integer'],
         [['updateLimit'], 'range', {min: 1}],
      ]),
      ['query pivs with refreshQuery not activated', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body.refreshQuery', rs.body.refreshQuery, undefined)) return false;
         return true;
      }],
      ['query pivs with `true` refresh field', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1, refresh: true}, 200, function (s, rq, rs) {
         return true;
      }],
      ['start upload to test querying', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['query pivs with refreshQuery activated by ongoing upload', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body.refreshQuery', rs.body.refreshQuery, true)) return false;
         return true;
      }],
      ['upload small piv to test querying', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload medium piv to test querying', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.medium.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.medium.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.mediumId = rs.body.id;
         return true;
      }],
      ['upload large piv to test querying', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.large.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.large.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.largeId = rs.body.id;
         return true;
      }],
      ['query pivs with idsOnly', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3, idsOnly: true}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.largeId, s.mediumId, s.smallId])) return false;
         return true;
      }],
      ['query pivs with idsOnly', 'post', 'query', {}, {tags: [], sort: 'oldest', from: 1, to: 3, idsOnly: true}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.smallId, s.largeId, s.mediumId])) return false;
         return true;
      }],
      ['query pivs with idsOnly', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 3, idsOnly: true}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.mediumId, s.largeId, s.smallId])) return false;
         return true;
      }],
      ['query pivs with idsOnly cutting off the amount returned', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 2, idsOnly: true}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.mediumId, s.largeId])) return false;
         return true;
      }],
      ['query pivs with newest & fromDate at present moment', 'post', 'query', {}, {tags: [], sort: 'newest', fromDate: Date.now (), to: 1, idsOnly: true}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.mediumId])) return false;
         return true;
      }],
      ['query pivs with newest & fromDate at the same value as newest piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', fromDate: tk.pivs.medium.date, to: 1, idsOnly: true}}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.mediumId])) return false;
         return true;
      }],
      ['query pivs with newest & fromDate at the same value as middle piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', fromDate: tk.pivs.large.date, to: 1, idsOnly: true}}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.mediumId, s.largeId])) return false;
         return true;
      }],
      ['query pivs with newest & fromDate at the same value as last piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', fromDate: tk.pivs.small.date, to: 1, idsOnly: true}}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.mediumId, s.largeId, s.smallId])) return false;
         return true;
      }],
      ['query pivs with newest & fromDate at the same value after last piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', fromDate: tk.pivs.small.date - 1, to: 1, idsOnly: true}}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, [s.mediumId, s.largeId, s.smallId])) return false;
         return true;
      }],
      ['query pivs with recentlyTagged', 'post', 'query', {}, function (s) {return {tags: ['u::', 'foobar'], sort: 'upload', from: 1, to: 3, recentlyTagged: [s.largeId, s.mediumId, s.smallId]}}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         if (H.stop ('body.tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 2, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.large.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 3, 'u::': 3, 'o::': 0, 't::': 3})) return false;
         var ids = dale.go (rs.body.pivs, function (piv) {
            return piv.id;
         });
         if (H.stop ('piv ids', ids, [s.largeId, s.mediumId, s.smallId])) return false;
         return true;
      }],
      ['query pivs with recentlyTagged, including non-existing pivs', 'post', 'query', {}, function (s) {return {tags: ['u::', 'foobar'], sort: 'upload', from: 1, to: 3, recentlyTagged: ['foo', s.largeId, s.mediumId, s.smallId, 'bar']}}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         if (H.stop ('body.tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 2, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.large.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 3, 'u::': 3, 'o::': 0, 't::': 3})) return false;
         var ids = dale.go (rs.body.pivs, function (piv) {
            return piv.id;
         });
         if (H.stop ('piv ids', ids, [s.largeId, s.mediumId, s.smallId])) return false;
         s.lastUpload = rs.body.pivs [0].dateup;
         return true;
      }],
      ['query pivs with updateLimit at present moment', 'post', 'query', {}, function (s) {return {tags: [], sort: 'upload', from: 1, to: 3, updateLimit: Date.now ()}}, 200, function (s, rq, rs) {
         if (H.stop ('pivs', rs.body.pivs.length, 3)) return false;
         if (H.stop ('body.tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 2, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.large.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 3, 'u::': 3, 'o::': 0, 't::': 3})) return false;
         return true;
      }],
      ['query pivs with updateLimit equal to the dateup of the last uploaded piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'upload', from: 1, to: 3, updateLimit: s.lastUpload}}, 200, function (s, rq, rs) {
         if (H.stop ('pivs', rs.body.pivs.length, 3)) return false;
         if (H.stop ('body.tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 2, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.large.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 3, 'u::': 3, 'o::': 0, 't::': 3})) return false;
         return true;
      }],
      ['query pivs with updateLimit equal to the dateup less of that of the last uploaded piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'upload', from: 1, to: 3, updateLimit: s.lastUpload - 1}}, 200, function (s, rq, rs) {
         if (H.stop ('pivs', rs.body.pivs.length, 2)) return false;
         if (H.stop ('body.tags', rs.body.tags, {[tk.pivs.small.dateTags [0]]: 1, [tk.pivs.small.dateTags [1]]: 1, [tk.pivs.medium.dateTags [0]]: 1, [tk.pivs.medium.dateTags [1]]: 1, 'a::': 2, 'u::': 2, 'o::': 0, 't::': 2})) return false;
         return true;
      }],
      ['upload piv with geodata', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.dunkerque.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.dunkerque.mtime},
      ]}}, 200],
      ['finish upload', 'post', 'upload', {}, function (s) {return {id: s.uploadId, op: 'complete'}}, 200],
      ['query pivs with refreshQuery not activated after upload is complete', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body.refreshQuery', rs.body.refreshQuery, undefined)) return false;
         return true;
      }],
      ['enable geo', 'post', 'geo', {}, {operation: 'enable'}, 200],
      ['query pivs with refreshQuery activated by geotagging', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs, next) {
         if (H.stop ('body', rs.body.refreshQuery, true)) return false;
         // Wait for location to be set in piv
         H.tryTimeout (10, 1000, function (cb) {
            h.one (s, {method: 'post', path: 'query', body: {csrf: s.csrf, tags: [], sort: 'upload', from: 1, to: 2}, code: 200, apres: function (s, rq, rs) {
               if (! rs.body.pivs [0].loc) return false;
               return true;
            }}, cb);
         }, next);
      }],
      ['query pivs with refreshQuery deactivated after geotagging is complete', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body.refreshQuery, undefined)) return false;
         return true;
      }],
      ['start upload to test querying', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload video that requires conversion to test that refreshQuery is returned while conversions are going on', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.boat.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.boat.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.pivId = rs.body.id;
         return true;
      }],
      ['finish upload', 'post', 'upload', {}, function (s) {return {id: s.uploadId, op: 'complete'}}, 200],
      ['query pivs with refreshQuery activated by mp4 conversion', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs, next) {
         if (H.stop ('body', rs.body.refreshQuery, true)) return false;
         // Wait for conversion to finish.
         H.tryTimeout (10, 3000, function (cb) {
            h.one (s, {method: 'get', path: 'piv/' + s.pivId, code: 200, raw: true}, cb);
         }, next);
      }],
      ['query pivs with no refreshQuery after conversion to mp4 is finished', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs, next) {
         if (H.stop ('body', rs.body.refreshQuery, undefined)) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.in (tk.users.user1),
      ['start upload to test querying', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      // Dates: rotate > small > large
      ['upload small piv to test querying', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200],
      ['upload rotate piv to test querying', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.rotate.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.rotate.mtime},
      ]}}, 200],
      ['upload large piv to test querying', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.large.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.large.mtime},
      ]}}, 200],
      ['query pivs with no date range', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 3}, 200, function (s, rq, rs, next) {
         s.rangePivs = rs.body.pivs;
         return true;
      }],
      ['query pivs with irrelevant range', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 3, maxdate: Date.now ()}, 200, function (s, rq, rs, next) {
         if (H.stop ('body.pivs.length', rs.body.pivs.length, 3)) return false;
         return true;
      }],
      ['query pivs with irrelevant range but right at the edges', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', from: 1, to: 3, mindate: s.rangePivs [2].date, maxdate: s.rangePivs [0].date}}, 200, function (s, rq, rs, next) {
         if (H.stop ('body.pivs.length', rs.body.pivs.length, 3)) return false;
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         if (H.stop ('body.tags', rs.body.tags, {'a::': 3, 'u::': 3, 'o::': 0, 't::': 3, 'd::M3': 1, 'd::M5': 1, 'd::M7': 1, 'd::2014': 2, 'd::2017': 1})) return false;
         return true;
      }],
      ['query pivs with range that shaves newest piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', from: 1, to: 3, mindate: s.rangePivs [2].date, maxdate: s.rangePivs [0].date - 1}}, 200, function (s, rq, rs, next) {
         if (H.stop ('body.pivs.length', rs.body.pivs.length, 2)) return false;
         if (H.stop ('body.total', rs.body.total, 2)) return false;
         if (H.stop ('body.tags', rs.body.tags, {'a::': 3, 'u::': 2, 'o::': 0, 't::': 2, 'd::M5': 1, 'd::M7': 1, 'd::2014': 2})) return false;
         return true;
      }],
      ['query pivs with range that also shaves middle piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', from: 1, to: 3, mindate: s.rangePivs [2].date, maxdate: s.rangePivs [1].date - 1}}, 200, function (s, rq, rs, next) {
         if (H.stop ('body.pivs.length', rs.body.pivs.length, 1)) return false;
         if (H.stop ('body.total', rs.body.total, 1)) return false;
         if (H.stop ('body.tags', rs.body.tags, {'a::': 3, 'u::': 1, 'o::': 0, 't::': 1, 'd::M5': 1, 'd::2014': 1})) return false;
         return true;
      }],
      ['query pivs with range that shaves oldest piv', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', from: 1, to: 3, mindate: s.rangePivs [2].date + 1, maxdate: s.rangePivs [0].date}}, 200, function (s, rq, rs, next) {
         if (H.stop ('body.pivs.length', rs.body.pivs.length, 2)) return false;
         if (H.stop ('body.total', rs.body.total, 2)) return false;
         if (H.stop ('body.tags', rs.body.tags, {'a::': 3, 'u::': 2, 'o::': 0, 't::': 2, 'd::M7': 1, 'd::2014': 1, 'd::2017': 1, 'd::M3': 1})) return false;
         return true;
      }],
      ['query pivs with range that shaves all pivs', 'post', 'query', {}, function (s) {return {tags: [], sort: 'newest', from: 1, to: 3, mindate: 0, maxdate: s.rangePivs [2].date - 1}}, 200, function (s, rq, rs, next) {
         if (H.stop ('body.pivs.length', rs.body.pivs.length, 0)) return false;
         if (H.stop ('body.total', rs.body.total, 0)) return false;
         if (H.stop ('body.tags', rs.body.tags, {'a::': 3, 'u::': 0, 'o::': 0, 't::': 0})) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.idsFromHashes = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('get ids from hashes', 'idsFromHashes', [
         [[], 'object'],
         [[], 'keys', ['hashes']],
         [['hashes'], 'array'],
         [['hashes', 0], 'type', 'string', 'each of the body.hashes should have as type string but one of .+ is .+ with type'],
      ]),
      ['empty list of hashes', 'post', 'idsFromHashes', {}, {hashes: []}, 200, H.cBody ({})],
      ['start upload to test sharing', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['small', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload medium piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.medium.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.medium.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['medium', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.mediumId = rs.body.id;
         return true;
      }],
      ['upload large piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.large.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.large.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['large', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.largeId = rs.body.id;
         return true;
      }],
      ['empty list of hashes', 'post', 'idsFromHashes', {}, {hashes: []}, 200, H.cBody ({})],
      ['list of hashes', 'post', 'idsFromHashes', {}, function (s) {
         return {hashes: [
            tk.pivs.small.hash,
            tk.pivs.medium.hash,
            tk.pivs.large.hash,
         ]};
      }, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {
            [tk.pivs.small.hash]: s.smallId,
            [tk.pivs.medium.hash]: s.mediumId,
            [tk.pivs.large.hash]: s.largeId
         })) return false;
         return true;
      }],
      ['list of hashes with non-existing entries', 'post', 'idsFromHashes', {}, function (s) {
         return {hashes: [
            tk.pivs.small.hash,
            'foo',
            tk.pivs.medium.hash,
            'bar',
            tk.pivs.large.hash,
         ]};
      }, 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {
            [tk.pivs.small.hash]: s.smallId,
            'foo': null,
            [tk.pivs.medium.hash]: s.mediumId,
            'bar': null,
            [tk.pivs.large.hash]: s.largeId
         })) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.organized = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('organized', 'organized', [
         [[], 'object'],
         [[], 'keys', ['ids']],
         [['ids'], 'array'],
         [['ids', 0], 'type', 'string', 'each of the body.ids should have as type string but one of .+ is .+ with type'],
      ]),
      ['empty list of ids', 'post', 'organized', {}, {ids: []}, 200, H.cBody ([])],
      ['start upload to test sharing', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['small', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload medium piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.medium.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.medium.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['medium', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.mediumId = rs.body.id;
         return true;
      }],
      ['upload large piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.large.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.large.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['large', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.largeId = rs.body.id;
         return true;
      }],
      ['send ids of all three pivs, none of them is organized yet', 'post', 'organized', {}, function (s) {
         return {ids: [s.smallId, s.mediumId, s.largeId]};
      }, 200, H.cBody ([])],
      ['send non-existing ids', 'post', 'organized', {}, {ids: ['foo', 'bar']}, 200, H.cBody ([])],
      ['mark two pivs as organized', 'post', 'tag', {}, function (s) {return {tag: 'o::', ids: [s.smallId, s.largeId]}}, 200],
      ['send ids of all three pivs, get back two', 'post', 'organized', {}, function (s) {
         return {ids: [s.smallId, s.mediumId, s.largeId]};
      }, 200, H.cBody (function (s) {return [s.smallId, s.largeId].sort ()})],
      ['send ids of all three pivs as well as a nonexisting id and a repeated one, get back two', 'post', 'organized', {}, function (s) {
         return {ids: [s.smallId, s.mediumId, s.largeId, 'foo', s.largeId]};
      }, 200, H.cBody (function (s) {return [s.smallId, s.largeId].sort ()})],
      suites.auth.out (tk.users.user1),
   ];
}

suites.hometags = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('set home tags', 'hometags', [
         [[], 'object'],
         [[], 'keys', ['hometags']],
         [['hometags'], 'array'],
         [['hometags', 0], 'type', 'string', 'each of the body.hometags should have as type string but one of .+ is .+ with type'],
         [['hometags'], 'invalidValues', [['a::', '2021', 'g::Leiden']], {error: 'tag', tag: 'a::'}],
         [['hometags'], 'invalidValues', [['foo', 'bar', 'foo']], 'repeated'],
      ]),
      ['get hometags, that see list is empty', 'get', 'tags', {}, '', 200, H.cBody ({tags: [], hometags: []})],
      ['add nonexisting tag to hometags', 'post', 'hometags', {}, {hometags: ['foo']}, 404, H.cBody ({tag: 'foo'})],
      ['get hometags, that see list is still empty', 'get', 'tags', {}, '', 200, H.cBody ({tags: [], hometags: []})],
      ['start upload to test hometags', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['tag piv', 'post', 'tag', {}, function (s) {return {tag: 'foo', ids: [s.smallId]}}, 200],
      ['add existing tag to hometags (including trailing whitespace)', 'post', 'hometags', {}, {hometags: ['foo ']}, 200],
      ['get hometags, that see list has the added tag', 'get', 'tags', {}, '', 200, H.cBody ({tags: ['d::2014', 'd::M5', 'foo'], hometags: ['foo']})],
      ['tag piv with another tag', 'post', 'tag', {}, function (s) {return {tag: 'bar', ids: [s.smallId]}}, 200],
      ['add both tags to hometags', 'post', 'hometags', {}, {hometags: ['foo', 'bar']}, 200],
      ['get hometags, that see list has the second tag', 'get', 'tags', {}, '', 200, H.cBody ({tags: ['bar', 'd::2014', 'd::M5', 'foo'], hometags: ['foo', 'bar']})],
      ['change order of hometags', 'post', 'hometags', {}, {hometags: ['bar', 'foo']}, 200],
      ['get hometags, that see list has the tags in the right order', 'get', 'tags', {}, '', 200, H.cBody ({tags: ['bar', 'd::2014', 'd::M5', 'foo'], hometags: ['bar', 'foo']})],
      ['untag piv', 'post', 'tag', {}, function (s) {return {tag: 'foo', ids: [s.smallId], del: true}}, 200],
      ['get hometags, that see list has no reference to the deleted tag', 'get', 'tags', {}, '', 200, H.cBody ({tags: ['bar', 'd::2014', 'd::M5'], hometags: ['bar']})],
      ['untag piv again', 'post', 'tag', {}, function (s) {return {tag: 'bar', ids: [s.smallId], del: true}}, 200],
      ['get hometags, that see list is empty', 'get', 'tags', {}, '', 200, H.cBody ({tags: ['d::2014', 'd::M5'], hometags: []})],
      suites.auth.out (tk.users.user1),
   ];
}

// *** SHARE ***

suites.share = function () {
   return [
      suites.auth.in (tk.users.user1),
      suites.auth.in (tk.users.user2),
      suites.auth.in (tk.users.user3),
      suites.auth.login (tk.users.user1),
      H.invalidTestMaker ('share', 'sho', [
         [[], 'object'],
         [[], 'keys', ['tag', 'whom', 'del']],
         [[], 'invalidKeys', ['foo']],
         [['tag'], 'string'],
         [['whom'], 'string'],
         [['del'], 'type', ['boolean', 'undefined'], 'body.del should be equal to one of \\[true,false,null\\] but instead is .+'],
         [['tag'], 'invalidValues', ['a::', ' a::', 'u::', ' u::', ' u::', 'g::a', 'd::2021', 'x::'], 'tag'],
         [['whom'], 'invalidValues', [tk.users.user1.email], 'self'],
      ]),
      ['share with non-existing user #1', 'post', 'sho', {}, {tag: 'foo', whom: 'user0'}, 404],
      ['share with non-existing user #2', 'post', 'sho', {}, {tag: 'foo', whom: tk.users.user2.username}, 404],
      ['unshare with non-existing user #1', 'post', 'sho', {}, {tag: 'foo', whom: 'user0', del: true}, 404],
      ['unshare with non-existing user #2', 'post', 'sho', {}, {tag: 'foo', whom: tk.users.user2.username, del: true}, 404],
      ['accept share with non-existing user #1', 'post', 'shm', {}, {tag: 'foo', whom: 'user0'}, 404],
      ['accept share with non-existing user #2', 'post', 'shm', {}, {tag: 'foo', whom: tk.users.user2.username}, 404],
      ['remove share with non-existing user', 'post', 'shm', {}, {tag: 'foo', whom: 'user0', del: true}, 404],
      ['remove share with non-existing user', 'post', 'shm', {}, {tag: 'foo', whom: tk.users.user2.username, del: true}, 404],
      ['share with self', 'post', 'sho', {}, {tag: 'foo', whom: tk.users.user1.email}, 400, H.cBody ({error: 'self'})],
      ['unshare with self', 'post', 'sho', {}, {tag: 'foo', whom: tk.users.user1.email, del: true}, 400, H.cBody ({error: 'self'})],
      ['accept share with self', 'post', 'shm', {}, {tag: 'foo', whom: tk.users.user1.email}, 400, H.cBody ({error: 'self'})],
      ['remove share with self', 'post', 'shm', {}, {tag: 'foo', whom: tk.users.user1.email, del: true}, 400, H.cBody ({error: 'self'})],
      ['share tag that doesn\'t exist', 'post', 'sho', {}, {tag: 'foo', whom: tk.users.user2.email}, 404, H.cBody ({error: 'tag'})],
      ['unshare tag that doesn\'t exist', 'post', 'sho', {}, {tag: 'foo', whom: tk.users.user2.email, del: true}, 404, H.cBody ({error: 'tag'})],
      ['accept share that doesn\'t exist', 'post', 'shm', {}, {tag: 'foo', whom: tk.users.user2.email}, 403],
      ['remove share that doesn\'t exist', 'post', 'shm', {}, {tag: 'foo', whom: tk.users.user2.email, del: true}, 403],
      ['get shares before sharing', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: []})) return false;
         return true;
      }],
      ['get logs after no-ops', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('last log.ev', log.ev, 'auth')) return false;
         return true;
      }],
      suites.auth.login (tk.users.user2),
      ['get shares before being shared', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: []})) return false;
         return true;
      }],
      ['get logs after no-ops', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('last log.ev', log.ev, 'auth')) return false;
         return true;
      }],
      suites.auth.login (tk.users.user1),
      ['start upload to test sharing', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['small', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload medium piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.medium.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.medium.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['medium', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.mediumId = rs.body.id;
         return true;
      }],
      ['upload large piv to test sharing', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.large.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.large.mtime},
         {type: 'field', name: 'tags',         value: JSON.stringify (['large', 'shared'])},
      ]}}, 200, function (s, rq, rs) {
         s.largeId = rs.body.id;
         return true;
      }],
      ['share tag with user', 'post', 'sho', {}, {tag: 'shared', whom: tk.users.user2.email}, 200],
      ['get shares after sharing', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [['user2', 'shared']], shm: []})) return false;
         return true;
      }],
      ['get logs after sharing', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'share', type: 'share', tag: 'shared', whom: 'user2'})) return false;
         return true;
      }],
      ['share tag with user again (no-op)', 'post', 'sho', {}, {tag: 'shared', whom: tk.users.user2.email}, 200],
      ['get logs after no-op sharing', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs, 2);
         if (log.ev !== 'upload') return clog ('No-op share created a log entry');
         return true;
      }],
      suites.auth.login (tk.users.user2),
      ['get shares after being shared tag before accepting it', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: []})) return false;
         return true;
      }],
      ['get logs after being shared tag before accepting it', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('last log.ev', log.ev, 'auth')) return false;
         return true;
      }],
      ['query pivs after being shared tag before accepting it', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 0)) return false;
         return true;
      }],
      ['accept share', 'post', 'shm', {}, {tag: 'shared', whom: tk.users.user1.email}, 200],
      ['get shares after accepting share', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: [['user1', 'shared']]})) return false;
         return true;
      }],
      ['get logs after accepting share', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'share', type: 'accept', tag: 'shared', whom: 'user1'})) return false;
         return true;
      }],
      ['query pivs after accepting share', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         if (H.stop ('body.pivs [0].tags', rs.body.pivs [0].tags.sort (), ['d::2014', 'd::M7', 'user1:shared'])) return false;
         if (H.stop ('body.pivs [1].tags', rs.body.pivs [1].tags.sort (), ['d::2022', 'd::M3', 'user1:shared'])) return false;
         if (H.stop ('body.pivs [2].tags', rs.body.pivs [2].tags.sort (), ['d::2014', 'd::M5', 'user1:shared'])) return false;
         if (H.stop ('body.tags', rs.body.tags, {'a::': 3, 'u::': 0, 'o::': 0, 't::': 3, 'd::M7': 1, 'd::2022': 1, 'user1:shared': 3, 'd::M3': 1, 'd::M5': 1, 'd::2014': 2})) return false;
         return true;
      }],
      ['query tags after accepting share', 'get', 'tags', {}, '', 200, H.cBody ({tags: ['s::user1:shared'], hometags: []})],
      ['accept share again (no-op)', 'post', 'shm', {}, {tag: 'shared', whom: tk.users.user1.email}, 200],
      ['get shares after accepting share again (no-op)', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: [['user1', 'shared']]})) return false;
         return true;
      }],
      ['get logs after no-op accept share', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs, 2);
         if (log.ev !== 'auth') return clog ('No-op accept share created a log entry');
         return true;
      }],
      ['remove share', 'post', 'shm', {}, {tag: 'shared', whom: tk.users.user1.email, del: true}, 200],
      ['get shares after remove share', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: []})) return false;
         return true;
      }],
      ['get logs after remove share', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'share', type: 'remove', tag: 'shared', whom: 'user1'})) return false;
         return true;
      }],
      ['query pivs after removing shared tag', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 0)) return false;
         return true;
      }],
      ['remove share again (no-op)', 'post', 'shm', {}, {tag: 'shared', whom: tk.users.user1.email, del: true}, 200],
      ['get shares after remove share no-op', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: []})) return false;
         return true;
      }],
      ['get logs after remove share', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs, 3);
         if (log.ev !== 'auth') return clog ('No-op accept share created a log entry');
         return true;
      }],
      ['get tags after being unshared', 'get', 'tags', {}, '', 200, H.cBody ({tags: [], hometags: []})],
      ['accept share again', 'post', 'shm', {}, {tag: 'shared', whom: tk.users.user1.email}, 200],
      ['get shares after accepting share', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: [['user1', 'shared']]})) return false;
         return true;
      }],
      ['get logs after accepting share again', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var log = teishi.last (rs.body.logs);
         delete log.t;
         if (H.stop ('last log', log, {ev: 'share', type: 'accept', tag: 'shared', whom: 'user1'})) return false;
         return true;
      }],
      ['query pivs after accepting share again', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         return true;
      }],
      ['query pivs after being shared tag with three pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         return true;
      }],
      suites.auth.login (tk.users.user1),
      ['untag large piv', 'post', 'tag', {}, function (s) {return {tag: 'shared', ids: [s.largeId], del: true}}, 200],
      suites.auth.login (tk.users.user2),
      ['query pivs after large piv being untagged from shared tag', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 2)) return false;
         if (rs.body.pivs [0].id !== s.mediumId) return clog ('Wrong piv removed from query after untagging.');
         return true;
      }],
      suites.auth.login (tk.users.user1),
      ['re-tag large piv', 'post', 'tag', {}, function (s) {return {tag: 'shared', ids: [s.largeId]}}, 200],
      suites.auth.login (tk.users.user2),
      ['query pivs after large tag being re-tagged', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         return true;
      }],
      suites.auth.login (tk.users.user1),
      ['share tag with user that has piv overlap with other tag', 'post', 'sho', {}, {tag: 'large', whom: tk.users.user2.email}, 200],
      suites.auth.login (tk.users.user2),
      ['query pivs after large tag being re-tagged', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 4}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         var names = dale.go (rs.body.pivs, function (piv) {
            return piv.name;
         });
         if (H.stop ('piv names', names, ['large.jpeg', 'medium.jpg', 'small.png'])) return false;
         if (H.stop ('body.pivs [0].tags', rs.body.pivs [0].tags.sort (), ['d::2014', 'd::M7', 'user1:shared'])) return false;
         if (H.stop ('body.pivs [1].tags', rs.body.pivs [1].tags.sort (), ['d::2022', 'd::M3', 'user1:shared'])) return false;
         if (H.stop ('body.pivs [2].tags', rs.body.pivs [2].tags.sort (), ['d::2014', 'd::M5', 'user1:shared'])) return false;
         if (H.stop ('body.tags', rs.body.tags, {'a::': 3, 'u::': 0, 't::': 3, 'o::': 0, 'd::M7': 1, 'd::2022': 1, 'user1:shared': 3, 'd::M3': 1, 'd::M5': 1, 'd::2014': 2})) return false;
         return true;
      }],
      ['accept large tag share', 'post', 'shm', {}, {tag: 'large', whom: tk.users.user1.email}, 200],
      ['query pivs after accepting second share', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         return true;
      }],
      ['query pivs after large tag being accepted', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 4}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 3)) return false;
         var names = dale.go (rs.body.pivs, function (piv) {
            return piv.name;
         });
         if (H.stop ('piv names', names, ['large.jpeg', 'medium.jpg', 'small.png'])) return false;
         if (H.stop ('body.pivs [0].tags', rs.body.pivs [0].tags.sort (), ['d::2014', 'd::M7', 'user1:large', 'user1:shared'])) return false;
         if (H.stop ('body.pivs [1].tags', rs.body.pivs [1].tags.sort (), ['d::2022', 'd::M3', 'user1:shared'])) return false;
         if (H.stop ('body.pivs [2].tags', rs.body.pivs [2].tags.sort (), ['d::2014', 'd::M5', 'user1:shared'])) return false;
         if (H.stop ('body.tags', rs.body.tags, {'a::': 3, 'u::': 0, 't::': 3, 'o::': 0, 'd::M7': 1, 'd::2022': 1, 'user1:shared': 3, 'd::M3': 1, 'd::M5': 1, 'd::2014': 2, 'user1:large': 1})) return false;
         return true;
      }],
      suites.auth.login (tk.users.user1),
      ['unshare first tag',  'post', 'sho', {}, {tag: 'shared', whom: tk.users.user2.email, del: true}, 200],
      ['unshare second tag', 'post', 'sho', {}, {tag: 'large',  whom: tk.users.user2.email, del: true}, 200],
      ['tag two pivs', 'post', 'tag', {}, function (s) {return {tag: 'foo', ids: [s.smallId, s.mediumId]}}, 200],
      ['share tag with user', 'post', 'sho', {}, {tag: 'foo', whom: tk.users.user2.email}, 200],
      ['get shares after sharing', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [['user2', 'foo']], shm: []})) return false;
         return true;
      }],
      suites.auth.login (tk.users.user2),
      ['get shares after being shared without accepting tag', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: []})) return false;
         return true;
      }],
      ['accept new share', 'post', 'shm', {}, {tag: 'foo', whom: tk.users.user1.email}, 200],
      ['get shares after being shared after accepting tag', 'get', 'share', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body, {sho: [], shm: [['user1', 'foo']]})) return false;
         return true;
      }],
      ['query pivs after tag having two pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 2)) return false;
         var ids = dale.go (rs.body.pivs, function (piv) {
            return piv.id;
         });
         if (H.stop ('piv ids', ids, [s.mediumId, s.smallId])) return false;
         return true;
      }],
      ['get tags after being shared two pivs', 'get', 'tags', {}, '', 200, H.cBody ({tags: ['s::user1:foo'], hometags: []})],
      dale.go (['small', 'medium', 'large'], function (v, k) {
         var id = v + 'Id';
         var sharedStatus = v === 'large' ? 'unshared' : 'shared';
         return [
            ['try rotating ' + sharedStatus + ' piv: ' + v, 'post', 'rotate', {}, function (s) {return {deg: 90, ids: [s [id]]}}, 404],
            ['try deleting ' + sharedStatus + ' piv: ' + v, 'post', 'delete', {}, function (s) {return {ids: [s [id]]}}, 404],
            sharedStatus === 'shared' ? [
               ['get small thumb of shared piv: ' + v, 'get', function (s) {return 'thumb/S/' + s [id]}, {}, '', 200],
               ['get large thumb of shared piv: ' + v, 'get', function (s) {return 'thumb/M/' + s [id]}, {}, '', 200],
               ['get shared piv: ' + v, 'get', function (s) {return 'piv/' + s [id]}, {}, '', 200],
               ['tag ' + sharedStatus + ' piv: ' + v, 'post', 'tag', {}, function (s) {return {tag: 'bar', ids: [s [id]]}}, 200],
            ] : [
               ['try tagging  ' + sharedStatus + ' piv: ' + v, 'post', 'tag', {}, function (s) {return {tag: 'bar', ids: [s [id]]}}, 404],
               ['try getting small thumb of unshared piv: ' + v, 'get', function (s) {return 'thumb/S/' + s [id]}, {}, '', 404],
               ['try getting large thumb of unshared piv: ' + v, 'get', function (s) {return 'thumb/M/' + s [id]}, {}, '', 404],
               ['try getting unshared piv: ' + v, 'get', function (s) {return 'piv/' + s [id]}, {}, '', 404],
            ]
         ];
      }),
      ['download shared pivs', 'post', 'download', {}, function (s) {return {ids: [s.smallId, s.mediumId]}}, 404],
      ['download shared and unshared pivs', 'post', 'download', {}, function (s) {return {ids: [s.smallId, s.mediumId, s.largeId]}}, 404],
      ['share tag as second user with third user without having any own pivs tagged with that tag', 'post', 'sho', {}, {tag: 'foo', whom: tk.users.user3.email}, 404],
      suites.auth.login (tk.users.user3),
      ['check that shared tag from second user doesn\'t contain pivs from the first user', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 0)) return false;
         if (H.stop ('body.pivs',  rs.body.pivs, [])) return false;
         return true;
      }],
      ['check that shared tag from second user doesn\'t contain pivs from the first user (tags)', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('body', rs.body.tags, [])) return false;
         return true;
      }],
      // TODO: tag shared piv and query it, untag it, check no transitive share, thoroughly test query endpoint with overlapping hashes (own+shared, shared+shared)
      suites.auth.out (tk.users.user1),
      suites.auth.out (tk.users.user2),
      suites.auth.out (tk.users.user3),
   ];
}

// *** RENAME ***

suites.rename = function () {
   return [
      suites.auth.in (tk.users.user1),
      suites.auth.in (tk.users.user2),
      suites.auth.login (tk.users.user1),
      H.invalidTestMaker ('rename', 'rename', [
         [[], 'object'],
         [[], 'keys', ['from', 'to']],
         [[], 'invalidKeys', ['foo']],
         [['from'], 'string'],
         [['to'], 'string'],
         [['to'], 'invalidValues', ['a::', ' a::', 'u::', ' u::', ' u::', 'g::a', 'd::2021', 'x::'], 'tag'],
      ]),
      ['rename nonexisting tag', 'post', 'rename', {}, {from: 'foo', to: 'bar'}, 404, H.cBody ({error: 'tag'})],
      ['start upload to test renaming', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test renaming', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['tag piv to test renaming', 'post', 'tag', {}, function (s) {return {tag: 'tag1', ids: [s.smallId]}}, 200],
      ['share tag', 'post', 'sho', {}, {tag: 'tag1',  whom: tk.users.user2.email}, 200],
      ['rename shared tag', 'post', 'rename', {}, {from: 'tag1', to: 'bar'}, 409, H.cBody ({error: 'shared'})],
      ['unshare tag', 'post', 'sho', {}, {tag: 'tag1',  whom: tk.users.user2.email, del: true}, 200],
      ['add tag to hometags', 'post', 'hometags', {}, {hometags: ['tag1']}, 200],
      ['rename tag', 'post', 'rename', {}, {from: 'tag1', to: 'tag2'}, 200],
      ['query pivs after renaming tag, with old tag name', 'post', 'query', {}, {tags: ['tag1'], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 0)) return false;
         return true;
      }],
      ['query pivs after renaming tag, with new tag name', 'post', 'query', {}, {tags: ['tag2'], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 1)) return false;
         if (H.stop ('body.pivs [0].tags', rs.body.pivs [0].tags, tk.pivs.small.dateTags.concat ('tag2'))) return false;
         return true;
      }],
      ['get tags after renaming', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body, {tags: tk.pivs.small.dateTags.concat ('tag2'), hometags: ['tag2']})) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.out (tk.users.user2),
   ];
}

// *** DELETE TAG ***

suites.deleteTag = function () {
   return [
      suites.auth.in (tk.users.user1),
      suites.auth.in (tk.users.user2),
      suites.auth.login (tk.users.user1),
      H.invalidTestMaker ('delete tag', 'deleteTag', [
         [[], 'object'],
         [[], 'keys', ['tag']],
         [[], 'invalidKeys', ['foo']],
         [['tag'], 'string'],
         [['tag'], 'invalidValues', ['a::', ' a::', 'u::', ' u::', ' u::', 'g::a', 'd::2021', 'x::'], 'tag'],
      ]),
      ['delete nonexisting tag', 'post', 'deleteTag', {}, {tag: 'foo'}, 404, H.cBody ({error: 'tag'})],
      ['start upload to test deletion', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test deletion', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['tag piv to test deletion', 'post', 'tag', {}, function (s) {return {tag: 'tag1', ids: [s.smallId]}}, 200],
      ['share tag', 'post', 'sho', {}, {tag: 'tag1',  whom: tk.users.user2.email}, 200],
      ['delete shared tag', 'post', 'deleteTag', {}, {tag: 'tag1'}, 409, H.cBody ({error: 'shared'})],
      ['unshare tag', 'post', 'sho', {}, {tag: 'tag1',  whom: tk.users.user2.email, del: true}, 200],
      ['add tag to hometags', 'post', 'hometags', {}, {hometags: ['tag1']}, 200],
      ['delete tag', 'post', 'deleteTag', {}, {tag: 'tag1'}, 200],
      ['query pivs after deleting tag', 'post', 'query', {}, {tags: ['tag1'], sort: 'upload', from: 1, to: 3}, 200, function (s, rq, rs) {
         if (H.stop ('body.total', rs.body.total, 0)) return false;
         return true;
      }],
      ['get tags after deleting ', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body, {tags: tk.pivs.small.dateTags, hometags: []})) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.out (tk.users.user2),
   ];
}

// *** DOWNLOAD ***

suites.download = function () {
   return [
      suites.auth.in (tk.users.user1),
      suites.auth.in (tk.users.user2),
      suites.auth.login (tk.users.user1),
      ['get no such download', 'get', 'download/foo', {}, '', 404],
      H.invalidTestMaker ('download', 'download', [
         [[], 'object'],
         [[], 'keys', ['ids']],
         [[], 'invalidKeys', ['foo']],
         [['ids'], 'array'],
         [['ids', 0], 'type', 'string', 'each of the body.ids should have as type string but one of .+ is .+ with type'],
         [['ids'], 'invalidValues', [['foo', 'bar', 'foo']], 'repeated'],
         [['ids'], 'invalidValues', [[], ['foo']], 'single'],
      ]),
      ['start upload to test downloading', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test downloading', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload medium piv to test downloading', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.medium.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.medium.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.mediumId = rs.body.id;
         return true;
      }],
      ['upload large piv to test downloading', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.large.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.large.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.largeId = rs.body.id;
         return true;
      }],
      ['upload another piv with repeated name', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.bach.path, filename: tk.pivs.small.name},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.bach.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.bachId = rs.body.id;
         return true;
      }],
      ['request download with non-existing piv #1', 'post', 'download', {}, {ids: ['foo', 'bar']}, 404],
      ['request download with non-existing piv #2', 'post', 'download', {}, function (s) {return {ids: [s.largeId, 'foo']}}, 404],
      ['request download', 'post', 'download', {}, function (s) {return {ids: [s.smallId, s.mediumId, s.largeId, s.bachId]}}, 200, function (s, rq, rs) {
         if (H.stop ('body.id', type (rs.body.id), 'string')) return false;
         if (! rs.body.id.match (/\.zip$/)) return clog ('Download id must end in .zip');
         s.downloadId = rs.body.id;
         return true;
      }],
      suites.auth.login (tk.users.user2),
      ['get download not owned by user', 'get', function (s) {return 'download/' + s.downloadId}, {}, '', 404],
      suites.auth.login (tk.users.user1),
      ['get download', 'get', function (s) {return 'download/' + s.downloadId}, {}, '', 200],
      {raw: true, tag: 'download multiple pivs', method: 'get', path: function (s) {return 'download/' + s.downloadId}, code: 200, apres: function (s, rq, rs, next) {
         fs.writeFileSync ('download.zip', rs.body);
         a.stop ([
            [k, 'unzip', '-o', 'download.zip'],
            function () {
               var error = dale.stopNot (['small', 'medium', 'large', 'bach'], undefined, function (file) {
                  var downloadedFile = tk.pivs [file].name;
                  if (file === 'bach') downloadedFile = tk.pivs.small.name + ' (copy)';
                  if (Buffer.compare (fs.readFileSync (downloadedFile), fs.readFileSync (tk.pivs [file].path)) !== 0) return 'Mismatch between expected and actual download: ' + file;
                  // For some reason, sometimes there are ~1 second mismatches between the expected modified time and the actual modified time of the downloaded files.
                  if (Math.abs (fs.statSync (downloadedFile).mtime.getTime () !== tk.pivs [file].mtime) > 2000) return 'Invalid mtime on zip file';
                  fs.unlinkSync (downloadedFile);
               });
               if (error) return clog (error);
               fs.unlinkSync ('download.zip');
               // Wait two seconds until download expires
               setTimeout (next, 2000);
            }
         ], clog);
      }},
      ['download multiple pivs after link expired', 'get', function (s) {return 'download/' + s.downloadId}, {}, '', 404],
      suites.auth.out (tk.users.user1),
      suites.auth.out (tk.users.user2),
   ];
}

suites.dismiss = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('dismiss', 'dismiss', [
         [[], 'object'],
         [[], 'keys', ['operation']],
         [['operation'], 'invalidValues', ['foo', 'bar', 'geo']],
         [['operation'], 'values', ['geotagging', 'selection']],
      ]),
      dale.go (['geotagging', 'selection'], function (op) {
         return [
            ['get account before dismissing suggestion', 'get', 'account', {}, '', 200, function (s, rq, rs) {
               var fieldName = 'suggest' + op [0].toUpperCase () + op.slice (1);
               if (H.stop ('account.' + fieldName, rs.body [fieldName], true)) return false;
               return true;
            }],
            ['dismiss ' + op, 'post', 'dismiss', {}, {operation: op}, 200],
            ['get account after dismissing suggestion', 'get', 'account', {}, '', 200, function (s, rq, rs) {
               var fieldName = 'suggest' + op [0].toUpperCase () + op.slice (1);
               if (H.stop ('account.' + fieldName, rs.body [fieldName], undefined)) return false;
               return true;
            }],
            ['get logs after dismissing ' + op, 'get', 'account', {}, '', 200, function (s, rq, rs) {
               var log = teishi.last (rs.body.logs);
               delete log.t;
               if (H.stop ('last log', log, {ev: 'dismiss', type: op})) return false;
               s.amountLogs = rs.body.logs.length;
               return true;
            }],
            ['dismiss ' + op + ' again', 'post', 'dismiss', {}, {operation: op}, 200],
            ['get account after dismissing suggestion again', 'get', 'account', {}, '', 200, function (s, rq, rs) {
               var fieldName = 'suggest' + op [0].toUpperCase () + op.slice (1);
               if (H.stop ('account.' + fieldName, rs.body [fieldName], undefined)) return false;
               return true;
            }],
            ['get logs after dismissing again ' + op, 'get', 'account', {}, '', 200, function (s, rq, rs) {
               if (H.stop ('logs length', rs.body.logs.length, s.amountLogs)) return false;
               return true;
            }],
         ];
      }),
      ['start upload to test dismissing of onboarding', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test dismissing of onboarding', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['mark piv as organized (should be no-op for onboarding)', 'post', 'tag', {}, function (s) {return {tag: 'o::', ids: [s.smallId]}}, 200],
      ['get account after marking a piv as organized', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('account.onboarding', rs.body.onboarding, true)) return false;
         return true;
      }],
      ['tag piv (should dismiss onboarding)', 'post', 'tag', {}, function (s) {return {tag: 'foo', ids: [s.smallId]}}, 200],
      ['get account after marking a piv as organized', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('account.onboarding', rs.body.onboarding, undefined)) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

suites.geo = function () {
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('geo', 'geo', [
         [[], 'object'],
         [[], 'keys', ['operation']],
         [['operation'], 'invalidValues', ['foo', 'bar']],
         [['operation'], 'values', ['enable', 'disable']],
      ]),
      ['start upload to test geo', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['upload small piv to test geo', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.small.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.small.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.smallId = rs.body.id;
         return true;
      }],
      ['upload piv with geodata to test geo', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.dunkerque.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.dunkerque.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.dunkerqueId = rs.body.id;
         return true;
      }],
      ['disable geo, no-op', 'post', 'geo', {}, {operation: 'disable'}, 200],
      ['get account after geo disable no-op', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('account.geo', rs.body.geo, undefined)) return false;
         return true;
      }],
      ['get logs after no-op disable geo', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('last log', {ev: log.ev, type: log.type}, {ev: 'upload', type: 'ok'})) return false;
         // Wait for geo to be set
         H.tryTimeout (10, 1000, function (cb) {
            a.stop ([
               [k, 'redis-cli', '-n', CONFIG.redisdb, 'exists', 'geo'],
               function (s) {
                  if (s.last) return cb ();
                  else return cb (true);
               }
            ]);
         }, next);
      }],
      ['enable geo', 'post', 'geo', {}, {operation: 'enable'}, 200],
      ['get account after geo enable', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('account.geo', rs.body.geo, true)) return false;
         if (H.stop ('account.geoInProgress', rs.body.geoInProgress, true)) return false;
         return true;
      }],
      ['enable geo again and get conflict', 'post', 'geo', {}, {operation: 'enable'}, 409],
      ['get logs after enable geo', 'get', 'account', {}, '', 200, function (s, rq, rs, next) {
         var log = teishi.last (rs.body.logs);
         if (H.stop ('last log', {ev: log.ev, type: log.type}, {ev: 'geotagging', type: 'enable'})) return false;
         var nlog = teishi.last (rs.body.logs, 2);
         if (H.stop ('next to last log', {ev: nlog.ev, type: nlog.type}, {ev: 'upload', type: 'ok'})) return false;
         // Wait for location to be set in piv
         H.tryTimeout (10, 1000, function (cb) {
            h.one (s, {method: 'post', path: 'query', body: {csrf: s.csrf, tags: [], sort: 'upload', from: 1, to: 2}, code: 200, apres: function (s, rq, rs) {
               if (! rs.body.pivs [0].loc) return false;
               return true;
            }}, cb);
         }, next);
      }],
      ['get account after geo enable is complete', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('account.geo', rs.body.geo, true)) return false;
         if (H.stop ('account.geoInProgress', rs.body.geoInProgress, undefined)) return false;
         return true;
      }],
      ['get location & tags of geotagged pivs', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('piv [0].loc', rs.body.pivs [0].loc, tk.pivs.dunkerque.loc)) return false;
         if (H.stop ('piv [1].loc', rs.body.pivs [1].loc, tk.pivs.small.loc))     return false;
         if (H.stop ('piv [0].tags', rs.body.pivs [0].tags.sort (), tk.pivs.dunkerque.dateTags.concat ('g::Dunkerque', 'g::FR').sort ())) return false;
         if (H.stop ('tags.g::FR', rs.body.tags ['g::FR'], 1)) return false;
         if (H.stop ('tags.g::Dunkerque', rs.body.tags ['g::Dunkerque'], 1)) return false;
         return true;
      }],
      ['get tags after geotagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.dunkerque.dateTags).concat ('g::Dunkerque', 'g::FR').sort ())) return false;
         return true;
      }],
      ['enable geo, no-op', 'post', 'geo', {}, {operation: 'enable'}, 200],
      ['get logs after no-op enable geo', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var nlog = teishi.last (rs.body.logs, 2);
         if (H.stop ('next to last log', {ev: nlog.ev, type: nlog.type}, {ev: 'upload', type: 'ok'})) return false;
         return true;
      }],
      ['disable geo', 'post', 'geo', {}, {operation: 'disable'}, 200],
      ['get account after geo enable is complete', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('account.geo', rs.body.geo, undefined)) return false;
         if (H.stop ('account.geoInProgress', rs.body.geoInProgress, undefined)) return false;
         return true;
      }],
      ['get location & tags of geotagged pivs after disabling geo', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 2}, 200, function (s, rq, rs) {
         if (H.stop ('piv [0].loc', rs.body.pivs [0].loc, undefined)) return false;
         if (H.stop ('piv [1].loc', rs.body.pivs [1].loc, undefined))     return false;
         if (H.stop ('piv [0].tags', rs.body.pivs [0].tags.sort (), tk.pivs.dunkerque.dateTags)) return false;
         if (H.stop ('tags.g::FR', rs.body.tags ['g::FR'], undefined)) return false;
         if (H.stop ('tags.g::Dunkerque', rs.body.tags ['g::Dunkerque'], undefined)) return false;
         return true;
      }],
      ['get tags after disabling geo', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.small.dateTags.concat (tk.pivs.dunkerque.dateTags).sort ())) return false;
         return true;
      }],
      ['enable geo', 'post', 'geo', {}, {operation: 'enable'}, 200],
      ['delete pivs', 'post', 'delete', {}, function (s) {return {ids: [s.smallId, s.dunkerqueId]}}, 200],
      ['upload piv with geodata while geo is enabled', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.dunkerque.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.dunkerque.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.dunquerkeId = rs.body.id;
         return true;
      }],
      ['get location & tags of geotagged piv', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('piv [0].loc', rs.body.pivs [0].loc, tk.pivs.dunkerque.loc)) return false;
         if (H.stop ('piv [0].tags', rs.body.pivs [0].tags.sort (), tk.pivs.dunkerque.dateTags.concat ('g::Dunkerque', 'g::FR').sort ())) return false;
         if (H.stop ('tags.g::FR', rs.body.tags ['g::FR'], 1)) return false;
         if (H.stop ('tags.g::Dunkerque', rs.body.tags ['g::Dunkerque'], 1)) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.in (tk.users.user1),
      ['start upload to test geo', 'post', 'upload', {}, {op: 'start', total: 0}, 200, function (s, rq, rs) {
         s.uploadId = rs.body.id;
         return true;
      }],
      ['enable geo', 'post', 'geo', {}, {operation: 'enable'}, 200],
      ['upload piv with geodata to test geo', 'post', 'piv', {}, function (s) {return {multipart: [
         {type: 'file',  name: 'piv',          path:  tk.pivs.dunkerque.path},
         {type: 'field', name: 'id',           value: s.uploadId},
         {type: 'field', name: 'lastModified', value: tk.pivs.dunkerque.mtime},
      ]}}, 200, function (s, rq, rs) {
         s.dunkerqueId = rs.body.id;
         return true;
      }],
      ['get location & tags of geotagged piv', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1}, 200, function (s, rq, rs) {
         if (H.stop ('piv [0].loc', rs.body.pivs [0].loc, tk.pivs.dunkerque.loc)) return false;
         if (H.stop ('piv [0].tags', rs.body.pivs [0].tags.sort (), tk.pivs.dunkerque.dateTags.concat ('g::Dunkerque', 'g::FR').sort ())) return false;
         if (H.stop ('tags.g::FR', rs.body.tags ['g::FR'], 1)) return false;
         if (H.stop ('tags.g::Dunkerque', rs.body.tags ['g::Dunkerque'], 1)) return false;
         return true;
      }],
      ['get tags after geotagging', 'get', 'tags', {}, '', 200, function (s, rq, rs) {
         if (H.stop ('tags', rs.body.tags, tk.pivs.dunkerque.dateTags.concat ('g::Dunkerque', 'g::FR').sort ())) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
      suites.auth.in (tk.users.user1),
      ['enable geo on account with no pivs', 'post', 'geo', {}, {operation: 'enable'}, 200],
      ['disable geo on account with no pivs', 'post', 'geo', {}, {operation: 'disable'}, 200],
      suites.auth.out (tk.users.user1),
   ];
}

suites.import = function () {
   if (noImport) return [];
   return [
      suites.auth.in (tk.users.user1),
      H.invalidTestMaker ('import selection', 'import/select/google', [
         [[], 'object'],
         [[], 'keys', ['ids']],
         [['ids'], 'array'],
         [['ids', 0], 'type', 'string', 'each of the body.ids should have as type string but one of .+ is .+ with type'],
      ]),
      ['attempt import selection before import started', 'post', 'import/select/google', {}, {ids: ['foo']}, 404],
      ['dummy request before starting OAuth flow requiring manual input', 'get', '/', {}, '', 200, function (s, rq, rs, next) {
         clog ('LOGIN NOW AND START GOOGLE IMPORT', CONFIG.domain + '#/import', tk.users.user1.username, tk.users.user1.password);
         // Try for 90 seconds every second to see if the oauth flow is complete and the import list is in process
         H.tryTimeout (10, 9000, function (cb) {
            h.one (s, {method: 'get', path: 'imports/google', code: 200, apres: function (s, rq, rs, next) {
               var entry = rs.body [0];
               if (! entry || entry.status !== 'listing') return false;
               if (H.stop ('entry.id', type (entry.id), 'integer')) return false;
               if (H.stop ('entry', {id: entry.id, provider: 'google', status: 'listing', fileCount: 0, folderCount: 0}, entry)) return false;
               return true;
            }}, cb);
         }, next);
      }],
      ['cancel google import while listing process is ongoing', 'post', 'import/cancel/google', {}, {}, 200],
      ['attempt import upload before import started', 'post', 'import/upload/google', {}, {}, 404],
      ['get imports after cancel', 'get', 'imports/google', {}, '', 200, H.cBody ([])],
      ['cancel google import again (should be idempotent)', 'post', 'import/cancel/google', {}, {}, 200],
      ['get imports after idempotent cancel', 'get', 'imports/google', {}, '', 200, function (s, rq, rs, next) {
         // Delete oauth token to test the use of the refresh token
         redis.del ('oa:g:acc:' + tk.users.user1, function (error) {
            if (error) return next (error);
            next ();
         });
      }],
      ['trigger listing for google import using the refresh token', 'post', 'import/list/google', {}, {}, 200],
      ['trigger listing again for google', 'post', 'import/list/google', {}, {}, 409],
      ['attempt import selection when import is listing', 'post', 'import/select/google', {}, {ids: ['foo']}, 409],
      ['attempt import upload when import is listing', 'post', 'import/upload/google', {}, {}, 409],
      ['get imports after starting listing (wait for listing to be done)', 'get', 'imports/google', {}, '', 200, function (s, rq, rs, next) {
         var entry = rs.body [0];
         if (! entry || entry.status !== 'listing') return false;
         // Wait for up to an hour for the listing to finish
         H.tryTimeout (10, 60 * 60 * 100, function (cb) {
            h.one (s, {method: 'get', path: 'imports/google', code: 200, apres: function (s, rq, rs) {
               var entry = rs.body [0];
               if (! entry) return false;
               if (entry.status === 'error') return cb (null, null, 'Import ended in error');
               if (entry.status !== 'ready') return false;
               return true;
            }}, cb);
         }, next);
      }],
      ['get google imports when listing process is done', 'get', 'imports/google', {}, '', 200, function (s, rq, rs, next) {
         var entry = rs.body [0];
         if (H.stop ('entry.status', entry.status, 'ready')) return false;
         if (H.stop ('entry.provider', entry.provider , 'google')) return false;
         if (H.stop ('type of entry.fileCount', type (entry.fileCount), 'integer')) return false;
         if (H.stop ('type of entry.folderCount', type (entry.folderCount), 'integer')) return false;
         if (H.stop ('type of entry.data', type (entry.data), 'object')) return false;
         if (H.stop ('type of entry.data.roots', type (entry.data.roots), 'array')) return false;
         if (H.stop ('type of entry.data.folders', type (entry.data.folders), 'object')) return false;
         s.importFolders = dale.fil (entry.data.folders, undefined, function (folder, id) {
            if (folder.name === 'ac;pic import pivs') return id;
         });
         return true;
      }],
      ['perform import selection', 'post', 'import/select/google', {}, function (s) {return {ids: s.importFolders}}, 200],
      ['get google imports after selection is done', 'get', 'imports/google', {}, '', 200, function (s, rq, rs, next) {
         var entry = rs.body [0];
         if (H.stop ('entry.selection', entry.selection, s.importFolders)) return false;
         return true;
      }],
      ['perform import upload', 'post', 'import/upload/google', {}, {}, 200],
      ['get imports after upload started (wait for imports to be uploaded)', 'get', 'imports/google', {}, '', 200, function (s, rq, rs, next) {
         var entry = rs.body [0];
         if (H.stop ('entry.status', entry.status, 'uploading')) return false;
         // Wait for up to ten minutes for the upload to finish
         H.tryTimeout (10, 10 * 60 * 100, function (cb) {
            h.one (s, {method: 'get', path: 'imports/google', code: 200, apres: function (s, rq, rs) {
               var entry = rs.body [0];
               if (! entry) return cb (null, null, 'No entry present');
               if (entry.status !== 'complete') return false;
               return true;
            }}, cb);
         }, next);
      }],
      ['get imports after upload was completed', 'get', 'imports/google', {}, '', 200, function (s, rq, rs, next) {
         var entry = rs.body [0];
         if (H.stop ('entry.status', entry.status, 'complete')) return false;
         if (H.stop ('type of entry.end', type (entry.end), 'integer')) return false;
         // 1 unsupported piv, 3 invalid pivs, 2 repeated pivs
         if (H.stop ('entry.ok', entry.ok, dale.keys (tk.pivs).length - 1 - 3 - 2)) return false;
         if (H.stop ('entry.total', entry.total, dale.keys (tk.pivs).length - 1)) return false;
         if (H.stop ('entry.alreadyImported', entry.alreadyImported, 0)) return false;
         entry.repeated.sort ();
         if (H.stop ('entry.repeated [0]', inc (['medium.jpg', 'medium-nometa.jpg'], entry.repeated [0]), true)) return false;
         if (H.stop ('entry.repeated [1]', inc (['small.png', 'small-nometa.png'],   entry.repeated [1]), true)) return false;
         if (H.stop ('entry.invalid', entry.invalid.sort (), ['empty.jpg', 'invalid.jpg', 'invalidvid.mp4'])) return false;
         if (H.stop ('entry.repeatedSize',  entry.repeatedSize, tk.pivs [entry.repeated [0].replace (/\..+/, '')].size + tk.pivs [entry.repeated [1].replace (/\..+/, '')].size)) return false;
         return true;
      }],
      ['get location & tags of geotagged piv', 'post', 'query', {}, {tags: [], sort: 'upload', from: 1, to: 1000}, 200, function (s, rq, rs) {
         if (H.stop ('number of pivs', rs.body.pivs.length, dale.keys (tk.pivs).length - 1 - 3 - 2)) return false;
         return true;
      }],
      ['get logs after no-op enable geo', 'get', 'account', {}, '', 200, function (s, rq, rs) {
         var filteredLogs = dale.fil (rs.body.logs, undefined, function (log) {
            // We ignore all the requests we do waiting for the oauth process to be complete.
            if (log.ev === 'import' && log.type === 'request') return;
            // We ignore all the requests for import debugging.
            if (log.ev === 'importDebug') return;
            // We ignore all `wait` events.
            if (log.type === 'wait') return;
            return log;
         });
         if (dale.stop ({
            4: {ev: 'import', type: 'grant'},
            5: {ev: 'import', type: 'listStart'},
            6: {ev: 'import', type: 'cancel', status: 'listing'},
            7: {ev: 'import', type: 'listStart'},
            8: {ev: 'import', type: 'listEnd'},
            9: {ev: 'import', type: 'selection', folders: s.importFolders},
            10: {ev: 'upload', type: 'start', total: dale.keys (tk.pivs).length - 1, alreadyImported: 0},
            11: {ev: 'upload', provider: 'google'},
            last: {ev: 'upload', type: 'complete', provider: 'google'}
         }, false, function (v, k) {
            var comparisonObject = dale.obj (filteredLogs [k === 'last' ? filteredLogs.length - 1 : k], function (v2, k2) {
               if (v [k2] !== undefined) return [k2, v2];
            });
            if (H.stop ('log entry #' + (parseInt (k) + 1), comparisonObject, v)) return false;
         }) === false) return false;
         return true;
      }],
      suites.auth.out (tk.users.user1),
   ];
}

// This suite only checks for DB keys that should be deleted by the end of any test cycle.
suites.cleanup = function () {
   return ['dummy request before querying database keys for extraneous ones', 'get', '/', {}, '', 200, function (s, rq, rs, next) {
      // Wait up to a second for S3 entries to be removed through pending S3 deletions being completed
      H.tryTimeout (10, 100, function (cb) {
         redis.keys ('*', function (error, keys) {
            var keys = dale.fil (keys, undefined, function (v) {
               if (v.match (/^(stat|ulog|csrf|session)/)) return;
               if (inc (['s3:proc', 'geo'], v)) return;
               return v;
            });
            if (keys.length) return cb ('Some keys were not cleaned up: ' + JSON.stringify (keys));
            cb ();
         });
      }, next);
   }];
}

suites.perf = function () {
   var perf = [];
   return [
      ['dummy request', 'get', '/', {}, '', 200, function (s, rq, rs, next) {
         var readline = require ('readline').createInterface ({input: process.stdin, output: process.stdout});
         readline.question ('Enter username:\n', function (username) {
            readline.question ('Enter password\n', function (password) {
               s.username = username;
               s.password = password;
               next ();
            });
         });
      }],
      ['login', 'post', 'auth/login', {}, function (s) {return {username: s.username, password: s.password, timezone: 0}}, 200, H.setCredentials],
      dale.go (dale.times (2), function (v) {
         return ['get all pivs', 'post', 'query', {}, {tags: [], sort: 'newest', from: 1, to: 300}, 200, function (s, rq, rs) {
            perf.push (rs.body.perf);
            return true;
         }];
      }),
      ['dummy request', 'get', '/', {}, '', 200, function (s, rq, rs, next) {
         var output = {};
         dale.go (perf, function (v) {
            dale.go (v, function (v2, k2) {
               if (! output [k2]) output [k2] = 0;
               output [k2] += v2;
            });
         });
         dale.go (output, function (v, k) {
            k += dale.go (dale.times (30 - k.length), function () {return ' '}).join ('');
            clog (k, v, '\t', Math.round (100 * v / output.total) + '%');
         });
         next ();
      }],
   ];
}

// *** RUN TESTS ***

var t = Date.now ();

if (toRun !== 'perf') H.runServer ();

H.tryTimeout (10, 1000, function (cb) {
   h.one ({}, {port: toRun === 'perf' ? 1427 : CONFIG.port, method: 'get', path: '/', code: 200}, cb);
}, function (error) {
   if (error) return clog ('SERVER DID NOT START', error);
   var serverStart = Date.now () - t;

   var suitesToRun = (function () {
      return dale.fil (suites, undefined, function (v, k) {
         if (toRun && ! inc ([toRun, 'cleanup'], k)) return;
         if (! toRun && k === 'perf') return;
         if (type (v) === 'function') return v ();
         return v.full ();
      });
   }) ();

   h.seq ({port: toRun === 'perf' ? 1427 : CONFIG.port}, suitesToRun, function (error, tests) {
      if (error) {
         if (error.request && error.request.body && type (error.request.body) === 'string') error.request.body = error.request.body.slice (0, 1000) + (error.request.body.length > 1000 ? '... OMITTING REMAINDER' : '');
         if (error.body && type (error.body) === 'string') error.body = error.body.slice (0, 1000) + (error.body.length > 1000 ? '... OMITTING REMAINDER' : '');
         H.server.kill ();
         return clog ('FINISHED WITH AN ERROR', error);
      }
      clog ('ALL TESTS FINISHED SUCCESSFULLY', 'Server start: ' + serverStart + 'ms', 'Tests: ' + (Date.now () - t - serverStart) + 'ms');

      // We sort group tests by endpoint and report their performance
      var grouped = {};
      dale.go (tests, function (test, k) {
         // the H.tryTimeout tests are stored as undefineds in the history of all tests, so we ignore them.
         if (! test || ! test.request) return;
         var path = test.request.path.split ('/').slice (0, test.request.path.match (/\/(piv|original|download)/) ? 2 : 3).join ('/');
         var key = test.request.method + ':' + path;
         var time = test.time [1] - test.time [0];
         if (! grouped [key]) grouped [key] = {method: test.request.method, path: path, c: 0, total: 0, slowest: 0};
         grouped [key].c++;
         grouped [key].total += time;
         if (grouped [key].slowest < time) grouped [key].slowest = time;
      });
      grouped = dale.go (grouped, function (v) {
         v.avg = Math.round (v.total / v.c);
         return v;
      }).sort (function (a, b) {
         return b.avg - a.avg;
      });
      dale.go (grouped, function (v) {
         clog (v.method.toUpperCase () + ' ' + v.path, 'avg ' + v.avg + 'ms', 'slowest ' + v.slowest + 'ms');
      });

      H.testsDone = true;
      process.exit (0);
   }, function (test) {
      if (type (test) === 'object') return test;
      if (test [1] === 'post' && test [4]) {
         var b = test [4];
         test [4] = function (s) {
            if (type (b) === 'function') b = b (s);
            if (! s.headers || ! s.headers.cookie) return b;

            // Skip CSRF token for these routes
            if (inc (['auth/signup', 'auth/login', 'auth/recover', 'auth/reset'], test [2])) return b;

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
