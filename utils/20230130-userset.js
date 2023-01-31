// This script will add all the users it finds to a set of `users`
// It will also remove all invites from the system.
// The script is idempotent.

a.stop ([
   [a.set, 'users',   [redis.keyscan, 'users:*']],
   [a.set, 'invites', [redis.keyscan, 'invite:*']],
   function (s) {
      debug ('user count', s.users.length);
      var multi = redis.multi ();
      dale.go (s.users, function (user) {
         multi.sadd ('users', user.replace ('users:', ''));
      });
      dale.go (s.invites, function (invite) {
         multi.del (invite);
      });
      mexec (s, multi);
   },
   function (s) {
      process.exit (0);
   }
]);
