// TODO v2: remove
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
      if (result === false) throw new Error ('c.test', 'Test failed:', test [0]);
      if (result !== undefined) check ();
   }
   runNext (tests, 0);
}

// TODO v2: remove
c.fire = function (element, eventType) {
   var ev = new Event (eventType);
   element.dispatchEvent (ev);
}

var password = prompt ('Password?');

c.test ([
   // *** AUTH & NAVIGATION ***
   ['Logout if logged in', function (wait) {
      if (! B.get ('Data', 'csrf')) return true;
      B.do ('logout', []);
      wait (100);
   }, function () {
      return B.get ('State', 'view') === 'login' && window.location.hash === '#/login';
   }],
   ['Invalid login', function (wait) {
      c.set ('#auth-username', {value: 'fpereiro'});
      c.set ('#auth-password', {value: 'foobar'});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'notify') !== undefined && B.get ('State', 'view') === 'login' && window.location.hash === '#/login';
   }],
   ['Login', function (wait) {
      c.set ('#auth-username', {value: 'fpereiro'});
      c.set ('#auth-password', {value: password});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'view') === 'pictures' && window.location.hash === '#/pictures';
   }],
   ['Try navigating to a non-existing view #1', function (wait) {
      window.location.hash = '#/foo'
      // We wait until the hashchange event is processed.
      wait (0);
   }, function () {
      return B.get ('State', 'view') === 'pictures' && window.location.hash === '#/pictures';
   }],
   ['Try navigating to a non-existing view #2', function (wait) {
      B.do ('set', ['State', 'view'], 'foo');
      return true;
   }, function () {
      return B.get ('State', 'view') === 'pictures' && window.location.hash === '#/pictures';
   }],
   ['Try navigating to an existing view', function (wait) {
      window.location.hash = '#/upload'
      // We wait until the hashchange event is processed.
      wait (0);
   }, function () {
      return B.get ('State', 'view') === 'upload' && window.location.hash === '#/upload';
   }],
   ['Logout by clicking the logout button', function (wait) {
      var dropdownItems = c ('li.account-sub-menu__item a');
      if (! dropdownItems || ! dropdownItems) return clog ('No logout button found!');
      c.fire (dropdownItems [1], 'click');
      wait (100);
   }, function () {
      return B.get ('State', 'view') === 'login' && B.get ('Data', 'csrf') === false;
   }],
   ['Set invalid redirect', function (wait) {
      window.location.hash = '#/foo'
      wait (0);
   }, function () {
      return B.get ('State', 'redirect') === 'foo';
   }],
   ['Login after invalid redirect', function (wait) {
      c.set ('#auth-username', {value: 'fpereiro'});
      c.set ('#auth-password', {value: password});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'view') === 'pictures' && window.location.hash === '#/pictures';
   }],
   ['Logout after invalid redirect', function (wait) {
      B.do ('logout', []);
      wait (100);
   }, function () {
      return B.get ('State', 'view') === 'login' && window.location.hash === '#/login';
   }],
   ['Set valid redirect', function (wait) {
      window.location.hash = '#/upload'
      wait (0);
   }, function () {
      return B.get ('State', 'redirect') === 'upload';
   }],
   ['Login after valid redirect', function (wait) {
      c.set ('#auth-username', {value: 'fpereiro'});
      c.set ('#auth-password', {value: password});
      B.do ('login', []);
      wait (300);
   }, function () {
      return B.get ('State', 'view') === 'upload' && window.location.hash === '#/upload';
   }],
   ['Check that store is cleared and that notify is fired on 403 request', function (wait) {
      B.do ({}, 'post', 'auth/logout', {}, {}, function () {
         B.do ({}, 'get', 'foo', {}, '');
      });
      wait (150);
   }, function () {
      if (! B.get ('State', 'notify')) return clog ('No error message shown.');
      if (B.get ('State', 'notify', 'message') !== 'Your session has expired. Please login again.') return clog ('Wrong error message shown.');
      return B.get ('State', 'view') === 'login' && window.location.hash === '#/login';
   }],
   // *** NOTIFY ***
   ['Close notify message', function (wait) {
      c.fire (c ('.snackbar__close') [0], 'click');
      wait (0);
   }, function () {
      return B.get ('State', 'notify') === undefined;
   }],
]);
