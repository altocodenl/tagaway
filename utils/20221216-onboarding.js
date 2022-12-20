// This script will add an `onboarding` entry on all existing users.
// The script is not idempotent if some users already have performed an action (tagging) to dismiss the onboarding. Hence it should be run only when the feature is deployed, before users start using it.

a.stop ([
   [a.set, 'users', [redis.keyscan, 'users:*']],
   function (s) {
      s.users = dale.go (s.users, function (user) {
         return user.replace ('users:', '');
      });
      debug ('users', s.users);
      var multi = redis.multi ();
      dale.go (s.users, function (user) {
         multi.hset ('users:' + user, 'onboarding', 1);
      });
      mexec (s, multi);
   },
   function (s) {
      process.exit (0);
   }
]);
