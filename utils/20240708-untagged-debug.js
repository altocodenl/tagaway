// This script will check whether all pivs without user tags are marked as untagged, and viceversa
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
         multi.sinter ('pivt:' + piv.replace ('piv:', ''));
      });
      mexec (s, multi);
   },
   function (s) {
      s.pivsWithoutUserTags = [];

      dale.go (s.last, function (tags, k) {
         if (! dale.stop (tags, true, H.isUserTag)) s.pivsWithoutUserTags.push (s.pivs [k].replace ('piv:', ''));
      });

      tdebug ('Found', s.pivsWithoutUserTags.length, 'pivs without user tags, out of a total of', s.pivs.length, 'pivs');
      s.pivs = null;

      s.next ();
   },
   [a.set, 'untagged', [redis.keyscan, 'tag:*:u::']],
   function (s) {
      Redis (s, 'sunion', s.untagged);
   },
   function (s) {
      s.untagged = s.last;
      // Now, s.pivsWithoutUserTags is a list with the ids of all the pivs without tags.
      // And s.untagged is a list with the ids of all the pivs with the pseudo tag `u::`.
      // We will match both lists, converting each of them first to a hash for fast lookup, then deleting the keys they have in common.
      s.pivsWithoutUserTags = dale.obj (s.pivsWithoutUserTags, function (v) {
         return [v, true];
      });
      s.untagged = dale.obj (s.untagged, function (v) {
         return [v, true];
      });
      dale.go (s.pivsWithoutUserTags, function (v, k) {
         if (! s.untagged [k]) return;
         delete s.untagged [k];
         delete s.pivsWithoutUserTags [k];
      });

      // Convert them back to an array
      s.pivsWithoutUserTags = dale.keys (s.pivsWithoutUserTags);
      s.untagged = dale.keys (s.untagged);

      var multi = redis.multi ();
      dale.go (s.pivsWithoutUserTags, function (v) {
         tdebug ('remaining piv without user tags', v);
         multi.hget ('piv:' + v, 'owner');
      });
      dale.go (s.untagged, function (v) {
         tdebug ('remaining untagged', v);
      });

      if (s.pivsWithoutUserTags.length === 0) {
         tdebug ('done');
         process.exit (0);
      }

      mexec (s, multi);
   },
   function (s) {
      var affectedUsers = {};
      dale.go (s.last, function (user, k) {
         if (! affectedUsers [user]) affectedUsers [user] = [];
         affectedUsers [user].push (s.pivsWithoutUserTags [k]);
      });
      clog ('affected users', affectedUsers);

      var multi = redis.multi ();
      dale.go (affectedUsers, function (pivs, user) {
         dale.go (pivs, function (piv) {
            multi.sadd ('tag:' + user + ':u::', piv);
         });
      });
      mexec (s, multi);
   },
   function (s) {
      tdebug ('done, added missing u:: entries', s.last.length);
      process.exit (0);
   }
], function (s, error) {
   tdebug ('ERROR', error);
   process.exit (1);
});
