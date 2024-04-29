// This script will add `v::` tags to all videos.
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
      var multi = redis.multi ();
      var videos = dale.fil (s.last, undefined, function (v, k) {
         if (! v [0]) return;
         var id = s.pivs [k].replace ('piv:', '');
         multi.sadd ('tag:' + v [1] + ':v::', id);
         multi.sadd ('pivt:' + id, 'v::');
         return id;
      });
      tdebug ('Found', videos.length, 'videos out of', s.pivs.length, 'pivs');

      mexec (s, multi);
   },
   function (s) {
      tdebug ('done');
      process.exit (0);
   }
], function (s, error) {
   tdebug ('ERROR', error);
   process.exit (1);
});
