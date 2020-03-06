c.test = function (tests) {
   var t = teishi.time ();
   // TODO: add validations
   var runNext = function (tests, k) {
      var test = tests [k];
      if (! test) return clog ('Done with tests in', teishi.time () - t, 'ms');
      var check = function () {
         var result = test [2] ();
         if (result === false) throw new Error ('c.test', 'Test failed:', test [0]);
         runNext (tests, k + 1);
      }

      clog ('c.test', 'Running test:', test [0]);
      var result = test [1] (function (wait) {
         if (type (wait) !== 'integer') throw new Error ('c.test', 'wait parameter must be an integer but instead is', wait);
         setTimeout (check, wait);
      });
      if (result !== undefined) check ();
   }
   runNext (tests, 0);
}

var password = prompt ('Password?');

c.test ([
   ['Logout if logged in', function (wait) {
      if (! B.get ('Data', 'csrf')) return true;
      B.do ('logout', []);
      wait (100);
   }, function () {
      return B.get ('State', 'view') === 'login';
   }],
   ['Login', function (wait) {
      c.set ('#auth-username', {value: 'fpereiro'});
      c.set ('#auth-password', {value: password});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'view') === 'pictures';
   }],
]);
