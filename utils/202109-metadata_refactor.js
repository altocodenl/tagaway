var dale   = require ('dale');
var teishi = require ('teishi');
var redis  = require ('redis').createClient ({db: 15});
var a      = require ('../assets/astack.js');
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

// Returns an output of the shape: {isVid: UNDEFINED|true, mimetype: STRING, dimw: INT, dimh: INT, format: STRING, deg: UNDEFINED|90|180|-90, dates: {...}, loc: UNDEFINED|[INT, INT}
// If onlyLocation flag is passed, output will only have the `loc` field.
H.getMetadata = function (s, path, onlyLocation) {
   var output = {dates: {}};
   a.seq (s, [
      [k, 'exiftool', path],
      function (s) {
         dale.stop (s.last.stdout.split ('\n'), true, function (line) {
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
         else              s.next (s.last.stdout.split ('\n'));
      },
      function (s) {
         if (onlyLocation) return s.next ();
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
            else if (line.match (/^File Type\s+:/)) output.format = line.split (':') [1].trim ().toLowerCase ();
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
         if (onlyLocation) {
            delete output.dates;
            return s.next (output);
         }
         // Despite our trust in exiftool, we make sure that the required output fields are present
         if (type (output.dimw) !== 'integer' || output.dimw < 1) return s.next (null, {error: 'Invalid width: '  + output.dimw});
         if (type (output.dimh) !== 'integer' || output.dimh < 1) return s.next (null, {error: 'Invalid height: ' + output.dimh});
         if (! output.format) return s.next (null, {error: 'Missing format'});
         if (! output.mimetype) return s.next (null, {error: 'Missing mimetype'});
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
         if (counter++ < MAX) return piv;
      });
      clog ('PROCESSING', pivs.length, 'ITEMS');
      s.last = undefined;
      a.fork (s, pivs, function (piv, k) {
         return [
            [H.getMetadata, Path.join (BASEPATH, hash (piv.owner) + '', piv.id)],
            function (s) {
               var repeatedDates = [], minDbDate = Infinity, minScriptDate = Infinity;
               var dbData = {
                  // Added to make sure that the script properly detects videos
                  isVid: piv.vid ? true : undefined,
                  // Videos had no location data, now they do
                  loc: piv.vid ? s.last.loc : (piv.loc ? JSON.parse (piv.loc) : undefined),
                  // Videos stored no rotation data, now they do
                  deg: piv.vid ? s.last.deg : (parseInt (piv.deg) || undefined),
                  // Videos: no more "unknown" formats stored from unrecognized streams, also format is detected properly through exiftool
                  format: piv.vid ? s.last.format : piv.format,
                  // For videos with rotation, we invert height and width in the comparison (but we won't do that anymore later)
                  dimw: piv.vid && s.last.deg && s.last.deg !== 180 ? parseInt (piv.dimh) : parseInt (piv.dimw),
                  dimh: piv.vid && s.last.deg && s.last.deg !== 180 ? parseInt (piv.dimw) : parseInt (piv.dimh),
                  dates: dale.obj (JSON.parse (piv.dates), function (v, k) {
                     if (k.match (/^(upload|alreadyUploaded|repeated):/)) return;
                     // Images: Ignore dates with only zeroes
                     if (! v.match (/[1-9]/)) return;
                     // Images: Ignore fields related to the newly created piv file itself
                     if (inc (['File Modification Date/Time', 'File Access Date/Time', 'File Inode Change Date/Time'], k)) return;
                     // Videos: date strings will be different because we read them from exiftool now. We compare only non-repeated parsed dates, eliminating dates that are both on the db data and on the script data.
                     if (piv.vid) {
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
                     }
                  }),
               }
               var diff = dale.obj (dbData, function (v, k) {
                  if (teishi.eq (v, s.last [k])) return;
                  if (k !== 'dates') return [k, {db: v, script: s.last [k]}];
                  // Only report differences in dates that are more than one minute
                  // if (Math.abs (minScriptDate - minDbDate) > 1000 * 60 * 1) return [k, {db: v, script: s.last [k], minDb: new Date (minDbDate), minScript: new Date (minScriptDate)}];
                  // Alternative: report only dates in db that are not picked up by script
                  if (dale.keys (v).length) return [k, {db: v, script: s.last [k]}];
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
