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
         multi.hmget (piv, 'vid', 'owner', 'bymp4');
      });
      mexec (s, multi);
   },
   function (s) {
      var mp4Info = dale.obj (s.last, function (v, k) {
         if (v [0] === null || v [0] === '1') return;
         return [s.pivs [k], {path: H.hash (v [1]) + '/' + v [0], owner: v [1], size: parseInt (v [2])}];
      });

      tdebug ('mp4s for which to check sizes', mp4Info);

      // Clear up stack to avoid copying it on a.fork
      s.last = null;
      s.pivs = null;

      var mp4SizesToFix = {};
      a.seq (s, [
         [a.fork, mp4Info, function (v, k) {
            return [
               [a.make (fs.stat), Path.join (CONFIG.basepath, v.path)],
               function (s) {
                  if (s.error) return s.next (null, s.error);
                  var size = s.last.size;
                  // The source of truth is the size of the actual file
                  if (size !== v.size) mp4SizesToFix [k] = {oldSize: v.size, newSize: size, owner: v.owner};
                  s.next ();
               }
            ];
         }, {max: os.cpus ().length * 100}],
         function () {
            s.next (mp4SizesToFix);
         }
      ]);
   },
   function (s) {
      tdebug ('mp4 sizes to fix', s.last);
      s.mp4SizesToFix = s.last;
      var multi = redis.multi ();
      dale.go (s.last, function (v, k) {
         tdebug ('updating', k, 'bymp4', v.oldSize, v.newSize);
         multi.hset (k, 'bymp4', v.newSize);
      });
      mexec (s, multi);
   },
   function (s) {
      var mp4SizesToFix = s.mp4SizesToFix;
      s.mp4SizesToFix = null;
      a.fork (s, mp4SizesToFix, function (v) {
         return function (s) {
            tdebug ('stat update', [
               ['flow', 'byfs',            v.newSize - v.oldSize],
               ['flow', 'byfs-' + v.owner, v.newSize - v.oldSize],
            ]);
            H.stat.w (s, [
               ['flow', 'byfs',            v.newSize - v.oldSize],
               ['flow', 'byfs-' + v.owner, v.newSize - v.oldSize],
            ]);
         };
      }, {max: os.cpus ().length * 100});
   },
   function (s) {
      process.exit (0);
   }
], function (s, error) {
   tdebug ('ERROR', error);
   process.exit (1);
});
