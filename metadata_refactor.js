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

var getMetadata = function (s, path) {
   a.seq (s, [
      [k, 'exiftool', path],
      function (s) {
         if (s.error) {
            clog ('ERROR', s.error);
            return s.next (null, s.error);
         }
         var output = {dates: {}};
         var error = dale.stopNot (s.last.stdout.split ('\n'), undefined, function (line) {
            if (line.match (/^Warning/)) {
               var exceptions = new RegExp (['minor', 'Invalid EXIF text encoding', 'Bad IFD1 directory', 'Bad length ICC_Profile', 'Invalid CanonCameraSettings data'].join ('|'));
               if (line.match (exceptions)) return;
               return line;
            }
            else if (line.match (/^Error/)) return line;
            else if (line.match (/^Image Width/))  output.dimw = parseInt (line.split (':') [1].trim ());
            else if (line.match (/^Image Height/)) output.dimh = parseInt (line.split (':') [1].trim ());
            else if (line.match (/^GPS Position/)) {
               var originalLine = line;
               line = (line.split (':') [1]).split (',');
               var lat = line [0].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
               var lon = line [1].replace ('deg', '').replace ('\'', '').replace ('"', '').split (/\s+/);
               lat = (lat [4] === 'S' ? -1 : 1) * (parseFloat (lat [1]) + parseFloat (lat [2]) / 60 + parseFloat (lat [3]) / 3600);
               lon = (lon [4] === 'W' ? -1 : 1) * (parseFloat (lon [1]) + parseFloat (lon [2]) / 60 + parseFloat (lon [3]) / 3600);
               output.loc = [lat, lon];
               // We filter out invalid latitudes.
               if (! inc (['float', 'integer'], type (lat)) || lat < -90  || lat > 90)  return 'Invalid GPS data: ' + originalLine;
               if (! inc (['float', 'integer'], type (lon)) || lon < -180 || lon > 180) return 'Invalid GPS data: ' + originalLine;
            }
            else if (line.match (/^Orientation/)) {
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
            else if (line.match (/^File Type/)) output.format = line.split (':') [1].trim ().toLowerCase ();
            // TODO: add audio codec for videos
         });
         if (error) return s.next (null, {error: 'Metadata error', data: error});
         s.next (output);
      }
   ]);
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
      var counter = 0, MAX = 50;
      var pivs = dale.fil (s.last, undefined, function (piv) {
         if (piv.vid && counter++ < MAX) return piv;
      });
      s.last = undefined;
      a.fork (s, pivs, function (piv) {
         return [
            [getMetadata, Path.join (BASEPATH, hash (piv.owner) + '', piv.id)],
            function (s) {
               var dbData = {
                  loc: piv.loc ? JSON.parse (piv.loc) : undefined,
                  deg: parseInt (piv.deg) || undefined,
                  dimw: parseInt (piv.dimw),
                  dimh: parseInt (piv.dimh),
                  format: piv.format,
                  dates: dale.obj (JSON.parse (piv.dates), function (v, k) {
                     if (! k.match (/^(upload|alreadyUploaded|repeated):/)) return [k, v];
                  }),
               }
               var diff = dale.obj (dbData, function (v, k) {
                  if (! teishi.eq (v, s.last [k])) return [k, {db: v, script: s.last [k]}];
               });
               clog ('OUTPUT', piv.id, diff);
               s.next ();
            }
         ];
      }, {max: 2});
   },
   function (s) {
      clog ('DONE');
      s.next ();
   }
], function (s, error) {clog ('ERROR', error)});
