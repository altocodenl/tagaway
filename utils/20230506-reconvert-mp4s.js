// This script will reconvert all the existing mp4 versions of non-mp4 videos in the system.
// This is because we recently changed the way we encode them to make them compatible with Apple phones.
// The script is idempotent.

var t = Date.now ();
var tdebug = function () {
   var args = [(Date.now () - t) + 'ms'].concat (dale.go (arguments, function (v) {return v}));
   debug.apply (null, args);
}

a.stop ([
   [a.set, 'pivs', [redis.keyscan, 'piv:*']],
   function (s) {
      tdebug ('piv count', s.pivs.length);
      var multi = redis.multi ();
      dale.go (s.pivs, function (piv) {
         multi.hmget (piv, 'vid', 'owner');
      });
      mexec (s, multi);
   },
   function (s) {
      var toReconvert = dale.fil (s.last, undefined, function (v, k) {
         if (v [0] === null || v [0] === '1') return;
         return {source: H.hash (v [1]) + '/' + s.pivs [k].replace ('piv:', ''), target: H.hash (v [1]) + '/' + v [0]};
      });
      tdebug ('mp4s to reconvert', toReconvert.length);
      // Free up big variables from the stack.
      s.pivs = null;
      s.last = null;
      a.fork (s, toReconvert, function (v, k2) {
         var tempPath = Path.join ('/tmp', Path.basename (v.target)) + '.mp4';
         return [
            [k, 'ffmpeg', '-i', Path.join (CONFIG.basepath, v.source), '-vcodec', 'h264', '-brand', 'mp42', '-ar', '48000', '-codec:a', 'aac', tempPath],
            [k, 'mv', tempPath, Path.join (CONFIG.basepath, v.target)],
            function (s) {
               if (s.error) tdebug ('ERROR #' + (k2 + 1), v.source, s.error);
               else         tdebug ('OK #' + (k2 + 1),    v.source, v.target);
               s.next ();
            }
         ];
      }, {max: 5});
   },
   function (s) {
      process.exit (0);
   }
]);
