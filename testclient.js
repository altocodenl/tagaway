var username = sessionStorage.getItem ('username') || prompt ('Username?');
var password = sessionStorage.getItem ('password') || prompt ('Password?');
sessionStorage.setItem ('username', username);
sessionStorage.setItem ('password', password);

var waits = {logout: 400, login: 400, sort: 100}
var t = Date.now ();

c.test ([
   // *** AUTH & NAVIGATION ***
   ['Logout if logged in', function (wait) {
      if (! B.get ('Data', 'csrf')) return true;
      B.call ('logout', []);
      wait (waits.logout);
   }, function () {
      if (B.get ('State', 'page') !== 'login') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/login')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Invalid login', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password + '1'});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'snackbar') === undefined) return clog ('Snackbar should be present.');
      if (B.get ('State', 'page') !== 'login') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/login')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Login', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/pics')  return clog ('Invalid hash', window.location.hash);
      var loginEvent = dale.stopNot (B.r.log, undefined, function (log) {
         if (log.verb === 'post' && teishi.eq (log.path, ['auth/login'])) return log;
      });
      if (loginEvent.args [1].password !== 'REDACTED') return clog ('Password not removed from login logs!');
      return true;
   }],
   ['Try navigating to a non-existing view #1', function (wait) {
      window.location.hash = '#/foo'
      // We wait until the hashchange event is processed.
      wait (0);
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/pics')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Try navigating to a non-existing view #2', function (wait) {
      B.call ('goto', 'page', 'foo');
      return true;
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/pics')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Try navigating to an existing view', function (wait) {
      window.location.hash = '#/upload'
      // We wait until the hashchange event is processed.
      wait (0);
   }, function () {
      if (B.get ('State', 'page') !== 'upload') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/upload')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Logout by clicking the logout button', function (wait) {
      var dropdownItems = c ('li.account-sub-menu__item a');
      if (! dropdownItems || ! dropdownItems) return clog ('No logout button found!');
      c.fire (dropdownItems [1], 'click');
      wait (waits.logout);
   }, function () {
      if (B.get ('State', 'page') !== 'login') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/login')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Set invalid redirect', function (wait) {
      window.location.hash = '#/foo'
      wait (0);
   }, function () {
      if (B.get ('State', 'redirect') !== 'pics') return clog ('State.redirect must be pics.');
   }],
   ['Login after invalid redirect', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/pics')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Logout after invalid redirect', function (wait) {
      B.call ('logout', []);
      wait (waits.logout);
   }, function () {
      if (B.r.log.length !== 49 && B.r.log.length !== 50) return clog ('Invalid B.log length', B.r.log.length);
      if (! teishi.eq (B.r.log [0].path, ['lastLogout'])) return clog ('Invalid first log in B.log after logout', B.r.log);
      if (B.get ('State', 'page') !== 'login') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/login')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Set valid redirect', function (wait) {
      window.location.hash = '#/upload'
      wait (0);
   }, function () {
      if (B.get ('State', 'redirect') !== 'upload') return clog ('State.redirect must be upload');
      return true;
   }],
   ['Login after valid redirect', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'redirect') !== undefined) return clog ('State.redirect was not removed after being used', B.get ('State', 'redirect'));
      if (B.get ('State', 'page') !== 'upload') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/upload')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   ['Check that store is cleared and that snackbar is fired on 403 request', function (wait) {
      B.call ('post', 'auth/logout', {}, {}, function (x, error) {
         B.call ('get', 'tags', {}, '');
         wait (waits.logout);
      });
   }, function () {
      if (! B.get ('State', 'snackbar')) return clog ('No error message shown: ', B.get ('State', 'snackbar'));
      if (B.get ('State', 'snackbar', 'message') !== 'Your session has expired. Please login again.') return clog ('Wrong error message shown.');
      if (B.get ('State', 'page') !== 'login') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/login')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   // *** snackbar ***
   ['Close snackbar message', function (wait) {
      c.fire (c ('.snackbar__close') [0], 'click');
      wait (0);
   }, function () {
      if (B.get ('State', 'snackbar')) return clog ('Snackbar should not be present.');
      return true;
   }],
   // *** pictures ***
   ['Login to open pictures view', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return clog ('Invalid State.page', B.get ('State', 'page'));
      if (window.location.hash !== '#/pics')  return clog ('Invalid hash', window.location.hash);
      return true;
   }],
   // This assumes that the user has already uploaded pictures
   ['See that pictures are displayed with the right heading', function (wait) {
      // Wait until the main page is drawn
      wait (2000);
   }, function () {
      var heading = c ('.pictures-header__title') [0];
      if (! heading) return clog ('No heading found');
      if (heading.innerHTML !== B.get ('Data', 'pivTotal') + ' pictures') return clog ('Invalid heading.');
      return true;
   }],
   ['Check default sort is `newest`', function () {
      if (B.get ('State', 'query', 'sort') !== 'newest') return clog ('Invalid default sort.');
      return true;
   }],
   ['Change sort to `oldest`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return clog ('No dropdown element.');
      c.fire (sortItems [1], 'click');
      wait (waits.sort);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'oldest') return clog ('Sort didn\'t change to `oldest`.');
      return true;
   }],
   ['Change sort to `upload`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return clog ('No dropdown element');
      c.fire (sortItems [2], 'click');
      wait (waits.sort);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'upload') return clog ('Sort didn\'t change to `upload`.');
      return true;
   }],
   ['Change sort to `newest`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return clog ('No dropdown element');
      c.fire (sortItems [0], 'click');
      wait (waits.sort);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'newest') return clog ('Sort didn\'t change to `newest`.');
      return true;
   }],
   ['All tests OK', function () {
      B.call ('snackbar', 'green', 'All tests passed in ' + (Date.now () - t) + ' ms');
   }],

]);
