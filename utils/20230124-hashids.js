// This script will add `hashid` entries from all existing pivs.
// The script is idempotent.

a.stop ([
   [a.set, 'pivs', [redis.keyscan, 'piv:*']],
   function (s) {
      debug ('piv count', s.pivs.length);
      var multi = redis.multi ();
      dale.go (s.pivs, function (piv) {
         multi.hget (piv, 'hash');
      });
      mexec (s, multi);
   },
   function (s) {
      var multi = redis.multi ();
      dale.go (s.pivs, function (v, k) {
         multi.sadd ('hashid:' + s.last [k], v.replace ('piv:', ''));
      });
      mexec (s, multi);
   },
   function (s) {
      process.exit (0);
   }
]);
