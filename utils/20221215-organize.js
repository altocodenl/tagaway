// This script will create `t::` entries (which indicate that pivs should be organized). It should be run after the functionality for marking pivs as organized is deployed.
// The script is idempotent and should be runnable multiple times without creating errors in the state.

a.stop ([
   [a.set, 'users', [redis.keyscan, 'users:*']],
   function (s) {
      s.users = dale.go (s.users, function (user) {
         return user.replace ('users:', '');
      });
      debug ('users', s.users);
      var multi = redis.multi ();
      dale.go (s.users, function (user) {
         multi.exists ('tag:' + user + ':o::', 'tag:' + user + ':t::');
         multi.exists ('tag:' + user + ':a::');
      });
      mexec (s, multi);
   },
   function (s) {
      var multi = redis.multi ();
      s.toCreate = [];
      dale.go (s.users, function (user, k) {
         var organizeTagsExist = s.last [k * 2];
         var hasPivs      = s.last [k * 2 + 1];
         if (organizeTagsExist || ! hasPivs) return;
         s.toCreate.push (user);
         multi.smembers ('tag:' + user + ':a::');
      });
      mexec (s, multi);
   },
   function (s) {
      var multi = redis.multi ();
      dale.go (s.toCreate, function (user, k) {
         debug ('Will create t:: tag for user', user, 'with', s.last [k].length, 'pivs');
         multi.eval ('redis.call ("DEL", KEYS [2]); redis.call ("RESTORE", KEYS [2], 0, redis.call ("DUMP", KEYS [1]));', 2, 'tag:' + user + ':a::', 'tag:' + user + ':t::');
         dale.go (s.last [k], function (id) {
            multi.sadd ('pivt:' + id, 't::');
         });
      });
      mexec (s, multi);
   },
   function (s) {
      process.exit (0);
   }
]);
