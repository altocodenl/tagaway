// This script will add `t::` tags from all existing pivs.
// The script is idempotent.

a.stop ([
   [a.set, 'users', [redis.keyscan, 'users:*']],
   [a.set, 'pivs', [redis.keyscan, 'piv:*']],
   function (s) {
      debug ('user count', s.users.length);
      debug ('piv count', s.pivs.length);
      var multi = redis.multi ();
      dale.go (s.users, function (user) {
         multi.del ('tag:' + user.replace ('users:', '') + ':t::');
      });
      dale.go (s.pivs, function (piv) {
         multi.srem ('pivt:' + piv.replace ('piv:', ''), 't::');
      });
      mexec (s, multi);
   },
   function (s) {
      process.exit (0);
   }
]);
