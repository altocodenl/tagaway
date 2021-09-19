var dale   = require ('dale');
var teishi = require ('teishi');
var redis  = require ('redis').createClient ({db: 15});
var a      = require ('./assets/astack.js');
var Path   = require ('path');
var hash   = require ('murmurhash').v3;

var BASEPATH = '/root/files';
var t = Date.now ();
var clog   = function () {
   console.log.apply (null, [Date.now () - t].concat (dale.go (arguments, function (v) {return v})));
}, type = teishi.type, inc = function (a, v) {return a.indexOf (v) > -1}

var mexec = function (s, multi) {
   multi.exec (function (error, data) {
      if (error) return s.next (null, error);
      s.next (data);
   });
}

redis.keyscan = function (s, match, cursor, keys) {
   if (! cursor) cursor = 0;
   if (! keys)   keys   = {};
   redis.scan (cursor, 'MATCH', match, function (error, result) {
      if (error) return s.next (null, error);
      cursor = result [0];
      dale.go (result [1], function (key) {
         keys [key] = true;
      });
      if (cursor !== '0') return redis.keyscan (s, match, cursor, keys);
      s.next (dale.keys (keys));
   });
}

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
}

var H = {};

H.parseDate = function (date) {
   if (! date) return -1;
   // Range is years 1970-2100
   var minDate = 0, maxDate = 4133980799999;
   var d = new Date (date), ms = d.getTime ();
   if (! isNaN (ms) && ms >= minDate && ms <= maxDate) return ms;
   d = new Date (date.replace (':', '-').replace (':', '-'));
   ms = d.getTime ();
   if (! isNaN (ms) && ms >= minDate && ms <= maxDate) return ms;
   return -1;
}

H.getMetadata = function (s, path, isVid) {
   a.seq (s, [
      [k, 'exiftool', path],
      function (s) {
         if (! isVid) return s.next ();
         var metadata = s.last;
         a.seq (s, [
            [k, 'ffprobe', '-i', path, '-show_streams'],
            function (s) {
               s.vidMetadata = s.last.stdout + '\n' + s.last.stderr;
               s.next (metadata);
            }
         ]);
      },
      function (s) {
         var output = {dates: {}};
         var error = dale.stopNot (s.last.stdout.split ('\n'), undefined, function (line) {
            if (line.match (/^Warning\s+:/)) {
               var exceptions = new RegExp (['minor', 'Invalid EXIF text encoding', 'Bad IFD1 directory', 'Bad length ICC_Profile', 'Invalid CanonCameraSettings data', 'Truncated'].join ('|'));
               if (line.match (exceptions)) return;
               return line;
            }
            else if (line.match (/^Error\s+:/)) return line;
            else if (! isVid && line.match (/^Image Width\s+:/))  output.dimw = parseInt (line.split (':') [1].trim ());
            else if (! isVid && line.match (/^Image Height\s+:/)) output.dimh = parseInt (line.split (':') [1].trim ());
            else if (line.match (/^GPS Position\s+:/)) {
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
            }
            else if ((! isVid && line.match (/^Orientation\s+:/)) || (isVid && line.match (/Rotation\s+:/))) {
               if (line.match ('270')) output.deg = -90;
               if (line.match ('90'))  output.deg = 90;
               if (line.match ('180')) output.deg = 180;
            }
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
            else if (line.match (/^File Type\s+:/)) output.format = line.split (':') [1].trim ().toLowerCase ();
         });
         if (error) return s.next (null, {error: 'Metadata error', data: error, path: path});
         if (isVid) {
            var formats = [];
            dale.go (s.vidMetadata.split ('\n'), function (line) {
               if (line.match (/^width/i))  output.dimw = parseInt (line.split ('=') [1]);
               if (line.match (/^height/i)) output.dimh = parseInt (line.split ('=') [1]);
               if (line.match (/\s+rotate\s+:/)) {
                  if (line.match ('270')) output.deg = -90;
                  if (line.match ('90'))  output.deg = 90;
                  if (line.match ('180')) output.deg = 180;
               }
               /*
               s.dates = dale.obj (metadata, function (line) {
                  var key = line.split (':') [0].trim (), value = line.split (':').slice (1).join (':').trim ();
                  if (! key.match (/_time\b/i)) return;
                  if (! value.match (/^\d/)) return;
                  return [key, value];
               });
               */
            });
         }
         // TODO: check for dimw & dimh
         if (isVid && (output.deg === 90 || output.deg === -90)) {
            var w = output.dimh;
            output.dimh = output.dimw;
            output.dimw = w;
         }
         s.next (output);
      }
   ]);
}

a.stop ([
   [redis.keyscan, 'piv:*'],
   function (s) {
      var multi = redis.multi ();
      dale.go (s.last, function (id) {
         multi.hgetall (id);
      });
      mexec (s, multi);
   },
   function (s) {
      var counter = 0, MAX = 300000;
      var pivs = dale.fil (s.last, undefined, function (piv) {
         if (piv.vid && counter++ < MAX) return piv;
      });
      clog ('PROCESSING', pivs.length, 'ITEMS');
      s.last = undefined;
      a.fork (s, pivs, function (piv, k) {
         return [
            [H.getMetadata, Path.join (BASEPATH, hash (piv.owner) + '', piv.id), piv.vid],
            function (s) {
               var repeatedDates = [], minDbDate = Infinity, minScriptDate = Infinity;
               var dbData = {
                  // TODO: ADD THESE FIELDS
                  //loc: piv.loc ? JSON.parse (piv.loc) : undefined,
                  //deg: parseInt (piv.deg) || undefined,
                  //dimw: parseInt (piv.dimw),
                  //dimh: parseInt (piv.dimh),
                  //format: piv.format,
                  dates: dale.obj (JSON.parse (piv.dates), function (v, k) {
                     if (k.match (/^(upload|alreadyUploaded|repeated):/)) return;
                     // Ignore dates with only zeroes
                     if (! v.match (/[1-9]/)) return;
                     if (inc (['File Modification Date/Time', 'File Access Date/Time', 'File Inode Change Date/Time'], k)) return;
                     var date = H.parseDate (v);
                     if (date < minDbDate) minDbDate = date;
                     dale.go (s.last.dates, function (v2, k2) {
                        var scriptDate = H.parseDate (v2);
                        if (scriptDate !== -1 && scriptDate < minScriptDate) minScriptDate = scriptDate;
                        if (scriptDate === date) {
                           repeatedDates.push (date);
                           // Remove date with same value from dates coming from script
                           delete s.last.dates [k2];
                        }
                     });
                     // Remove date entries from db.dates that have matching entries in the dates coming from script
                     if (! inc (repeatedDates, date)) return [k, v];
                  }),
               }
               var diff = dale.obj (dbData, function (v, k) {
                  // We ignore differences in deg since the new logic will store that field in the DB for videos.
                  if (piv.vid && k === 'deg') return;
                  if (! teishi.eq (v, s.last [k])) {
                     if (k !== 'dates') return [k, {db: v, script: s.last [k]}];
                     // Only report differences in dates that are more than one minute
                     if (Math.abs (minScriptDate - minDbDate) > 1000 * 60 * 1) return [k, {db: v, script: s.last [k], minDb: new Date (minDbDate), minScript: new Date (minScriptDate)}];
                  }
               });
               if (dale.keys (diff).length) clog ('OUTPUT', '#' + (k + 1), piv.id, diff);
               s.next ();
            },
         ];
      }, {max: require ('os').cpus ().length});
   },
   function (s) {
      clog ('DONE');
      s.next ();
   }
], function (s, error) {clog ('ERROR', error)});
