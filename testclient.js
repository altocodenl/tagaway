// TODO v2: remove

   c.test = function (tests) {

      if (teishi.stop ('c.test', [
         ['tests', tests, 'array'],
         ['tests', tests, 'array', 'each'],
         dale.do (tests, function (test, k) {return [
            ['test length', test.length, {min: 2, max: 3}, teishi.test.range],
            ['test #' + (k + 1) + ' tag', test [0], 'string'],
            test.length === 2 ? ['test #' + (k + 1) + ' check', test [1], 'function'] : [
               ['test #' + (k + 1) + ' action', test [1], 'function'],
               ['test #' + (k + 1) + ' check',  test [2], 'function'],
            ]
         ]})
      ])) return false;

      var start = teishi.time (), runNext = function (k) {
         var test = tests [k];

         if (! test) return clog ('c.test', 'All tests finished successfully (' + (teishi.time () - start) + ' ms)');

         var check = function () {
            var result = test [test.length === 2 ? 1 : 2] ();
            if (result === false) throw new Error ('c.test: Test failed: ' + test [0]);
            runNext (k + 1);
         }

         clog ('c.test', 'Running test:', test [0]);
         if (test.length === 2) return check ();
         if (test [1] (function (wait) {
            if (wait === undefined) return check ();
            if (type (wait) !== 'integer' || wait < 0) throw new Error ('c.test: wait parameter must zero or a positive integer but instead is ' + wait);
            setTimeout (check, wait);
         }) !== undefined) check ();
      }

      runNext (0);
   }

// TODO v2: remove
c.fire = function (element, eventType) {
   var ev = new Event (eventType);
   element.dispatchEvent (ev);
}

var username = prompt ('Username?');
var password = prompt ('Password?');

c.test ([
   // *** AUTH & NAVIGATION ***
   ['Logout if logged in', function (wait) {
      if (! B.get ('Data', 'csrf')) return true;
      B.do ('logout', []);
      wait (100);
   }, function () {
      return B.get ('State', 'page') === 'login' && window.location.hash === '#/login';
   }],
   ['Invalid login', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: 'foobar'});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'snackbar') !== undefined && B.get ('State', 'page') === 'login' && window.location.hash === '#/login';
   }],
   ['Login', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'page') === 'pics' && window.location.hash === '#/pics';
   }],
   ['Try navigating to a non-existing view #1', function (wait) {
      window.location.hash = '#/foo'
      // We wait until the hashchange event is processed.
      wait (0);
   }, function () {
      return B.get ('State', 'page') === 'pics' && window.location.hash === '#/pics';
   }],
   ['Try navigating to a non-existing view #2', function (wait) {
      B.do ('set', ['State', 'page'], 'foo');
      return true;
   }, function () {
      return B.get ('State', 'page') === 'pics' && window.location.hash === '#/pics';
   }],
   ['Try navigating to an existing view', function (wait) {
      window.location.hash = '#/upload'
      // We wait until the hashchange event is processed.
      wait (0);
   }, function () {
      return B.get ('State', 'page') === 'upload' && window.location.hash === '#/upload';
   }],
   ['Logout by clicking the logout button', function (wait) {
      var dropdownItems = c ('li.account-sub-menu__item a');
      if (! dropdownItems || ! dropdownItems) return clog ('No logout button found!');
      c.fire (dropdownItems [1], 'click');
      wait (100);
   }, function () {
      return B.get ('State', 'page') === 'login' && B.get ('Data', 'csrf') === false;
   }],
   ['Set invalid redirect', function (wait) {
      window.location.hash = '#/foo'
      wait (0);
   }, function () {
      return B.get ('State', 'redirect') === 'foo';
   }],
   ['Login after invalid redirect', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'page') === 'pics' && window.location.hash === '#/pics';
   }],
   ['Logout after invalid redirect', function (wait) {
      B.do ('logout', []);
      wait (100);
   }, function () {
      return B.get ('State', 'page') === 'login' && window.location.hash === '#/login';
   }],
   ['Set valid redirect', function (wait) {
      window.location.hash = '#/upload'
      wait (0);
   }, function () {
      return B.get ('State', 'redirect') === 'upload';
   }],
   ['Login after valid redirect', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'page') === 'upload' && window.location.hash === '#/upload';
   }],
   ['Check that store is cleared and that snackbar is fired on 403 request', function (wait) {
      B.do ({}, 'post', 'auth/logout', {}, {}, function () {
         B.do ({}, 'get', 'foo', {}, '');
      });
      wait (150);
   }, function () {
      if (! B.get ('State', 'snackbar')) return clog ('No error message shown.');
      console.log (B.get ('State', 'snackbar', 'message'));
      if (B.get ('State', 'snackbar', 'message') !== 'Your session has expired. Please login again.') return clog ('Wrong error message shown.');
      return B.get ('State', 'page') === 'login' && window.location.hash === '#/login';
   }],
   // *** snackbar ***
   ['Close snackbar message', function (wait) {
      c.fire (c ('.snackbar__close') [0], 'click');
      wait (0);
   }, function () {
      return B.get ('State', 'snackbar') === undefined;
   }],
   // *** pictures ***
   ['Login', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'page') === 'pics' && window.location.hash === '#/pics';
   }],
   // This assumes that the user has already uploaded pictures
   ['See that pictures are displayed with the right heading', function () {
      var picNumber = c ('.pictures-grid__item-picture').length;
      var heading = c ('.pictures-header__title') [0];
      if (! heading) return clog ('no header found');
      if (heading.innerHTML !== picNumber + ' pictures') return clog ('Invalid heading.');
      if (picNumber < 1) return clog ('No pictures.');
      return true;
   }],
   ['Check default sort is `newest`', function () {
      if (B.get ('State', 'query', 'sort') !== 'newest') return clog ('Invalid default sort.');
      var dates = dale.do (B.get ('Data', 'pics'), function (v) {
         return v.date;
      });
      var sortedDates = teishi.c (dates).sort (function (a, b) {
         return b - a;
      });
      if (! teishi.eq (dates, sortedDates)) return clog ('Pictures shown in invalid order.');
      return true;
   }],
   ['Change sort to `oldest`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return clog ('No dropdown element.');
      c.fire (sortItems [1], 'click');
      wait (100);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'oldest') return clog ('Sort didn\'t change to `oldest`.');
      var dates = dale.do (B.get ('Data', 'pics'), function (v) {
         return v.date;
      });
      var sortedDates = teishi.c (dates).sort (function (a, b) {
         return a - b;
      });
      if (! teishi.eq (dates, sortedDates)) return clog ('Pictures shown in invalid order.');
      return true;
   }],
   ['Change sort to `upload`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return clog ('No dropdown element');
      c.fire (sortItems [2], 'click');
      wait (100);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'upload') return clog ('Sort didn\'t change to `upload`.');
      var dates = dale.do (B.get ('Data', 'pics'), function (v) {
         return v.dateup;
      });
      var sortedDates = teishi.c (dates).sort (function (a, b) {
         return b - a;
      });
      if (! teishi.eq (dates, sortedDates)) return clog ('Pictures shown in invalid order.');
      return true;
   }],
   ['Change sort to `newest`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return clog ('No dropdown element');
      c.fire (sortItems [0], 'click');
      wait (100);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'newest') return clog ('Sort didn\'t change to `newest`.');
      var dates = dale.do (B.get ('Data', 'pics'), function (v) {
         return v.date;
      });
      var sortedDates = teishi.c (dates).sort (function (a, b) {
         return b - a;
      });
      if (! teishi.eq (dates, sortedDates)) return clog ('Pictures shown in invalid order.');
      return true;
   }],

]);
