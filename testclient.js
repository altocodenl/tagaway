var dale = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
var type = teishi.type, clog = teishi.clog, eq = teishi.eq, last = teishi.last, inc = teishi.inc, media = lith.css.media, style = lith.css.style;

var suite;

var from = sessionStorage.getItem ('testFrom');
if (from) {
   from = JSON.parse (from);
   var suite = from.suite;
   sessionStorage.removeItem ('testFrom');
}

if (! suite) suite = prompt ('Suite?', suite);
if (! suite || inc (['auth', 'pivs'], suite)) {
   var username = sessionStorage.getItem ('username') || prompt ('Username?');
   var password = sessionStorage.getItem ('password') || prompt ('Password?');
   sessionStorage.setItem ('username', username);
   sessionStorage.setItem ('password', password);
}
if (suite) sessionStorage.setItem ('suite', suite);

var waits = {logout: 400, login: 400, sort: 100, pivs: 2000}

var stop = function (label, result, value) {
   if (eq (result, value)) return false;
   if (teishi.complex (result) && teishi.complex (value)) return ['Invalid ' + label + ', expecting', value, 'got', result, 'in field', dale.stopNot (result, undefined, function (v, k) {if (! eq (v, value [k])) return k})];
   else                                                   return ['Invalid ' + label + ', expecting', value, 'got', result];
}

c.test = function (tests, callback) {

   if (! c.prod && teishi.stop ('c.test', [
      ['tests', tests, 'array'],
      ['tests', tests, 'array', 'each'],
      dale.go (tests, function (test, k) {return ! test.length ? [] : [
         ['test length', test.length, {min: 2, max: 3}, teishi.test.range],
         ['test #' + (k + 1) + ' tag', test [0], 'string'],
         test.length === 2 ? ['test #' + (k + 1) + ' check', test [1], 'function'] : [
            ['test #' + (k + 1) + ' action', test [1], 'function'],
            ['test #' + (k + 1) + ' check',  test [2], 'function']
         ]
      ]}),
      ['callback', callback, ['function', 'undefined'], 'oneOf']
   ], undefined, true)) return false;

   callback = callback || function (error, time) {
      if (error) throw new Error ('c.test: Test failed: ' + error.test + '; result: ' + result);
      clog ('c.test', 'All tests finished successfully (' + (teishi.time () - start) + ' ms)');
   }

   var start = teishi.time (), runNext = function (k) {
      var test = tests [k];

      if (! test) return callback (null, teishi.time () - start);
      if (! test.length) return runNext (k + 1);

      var check = function (retry, interval) {
         var result = test [test.length === 2 ? 1 : 2] ();
         if (interval && (result === true || ! retry)) clearInterval (interval);
         if (result === true) return runNext (k + 1);
         if (retry) return false;
         callback ({test: test [0], result: result});
      }

      clog ('c.test', 'Running test:', test [0]);
      if (test.length === 2) return check ();
      if (test [1] (function (wait) {
         if (wait === undefined) return check ();
         if (type (wait) !== 'integer' || wait < 0) throw new Error ('c.test: wait parameter must zero or a positive integer but instead is ' + wait);
         if (wait === 0) return setTimeout (check, wait);
         var t = teishi.time () + wait, interval = setInterval (function () {
            check (teishi.time () < t, interval);
         }, 10);

      }) !== undefined) check ();
   }

   runNext (0);
}

var suites = {};

// *** AUTH & NAVIGATION ***

suites.auth = [
   ['Logout if logged in', function (wait) {
      if (! B.get ('Data', 'csrf')) return true;
      B.call ('logout', []);
      wait (waits.logout);
   }, function () {
      if (B.get ('State', 'page') !== 'login') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/login')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Invalid login', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password + '1'});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'snackbar') === undefined) return ['Snackbar should be present.'];
      if (B.get ('State', 'page') !== 'login') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/login')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Login', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/pics/home')  return ['Invalid hash', window.location.hash];
      var loginEvent = dale.stopNot (B.r.log, undefined, function (log) {
         if (log.verb === 'post' && eq (log.path, ['auth/login'])) return log;
      });
      if (loginEvent.args [1].password !== 'REDACTED') return ['Password not removed from login logs!'];
      return true;
   }],
   ['Try navigating to a non-existing view #1', function (wait) {
      window.location.hash = '#/foo'
      // We wait until the hashchange event is processed.
      wait (0);
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/pics/home')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Try navigating to a non-existing view #2', function (wait) {
      B.call ('goto', 'page', 'foo');
      return true;
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/pics/home')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Try navigating to an existing view', function (wait) {
      window.location.hash = '#/upload'
      // We wait until the hashchange event is processed.
      wait (0);
   }, function () {
      if (B.get ('State', 'page') !== 'upload') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/upload')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Logout by clicking the logout button', function (wait) {
      var dropdownItems = c ('li.account-sub-menu__item a');
      if (! dropdownItems || ! dropdownItems) return ['No logout button found!'];
      c.fire (dropdownItems [1], 'click');
      wait (waits.logout);
   }, function () {
      if (B.get ('State', 'page') !== 'login') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/login')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Set invalid redirect', function (wait) {
      window.location.hash = '#/foo'
      wait (0);
   }, function () {
      if (B.get ('State', 'redirect') !== 'pics') return ['State.redirect must be pics.'];
      return true;
   }],
   ['Login after invalid redirect', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/pics/home')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Logout after invalid redirect', function (wait) {
      B.call ('logout', []);
      wait (waits.logout);
   }, function () {
      if (! eq (B.r.log [0].path, ['lastLogout'])) return ['Invalid first log in B.log after logout', B.r.log];
      if (B.get ('State', 'page') !== 'login') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/login')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Set valid redirect', function (wait) {
      window.location.hash = '#/upload'
      wait (0);
   }, function () {
      if (B.get ('State', 'redirect') !== 'upload') return ['State.redirect must be upload'];
      return true;
   }],
   ['Login after valid redirect', function (wait) {
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'redirect') !== undefined) return ['State.redirect was not removed after being used', B.get ('State', 'redirect')];
      if (B.get ('State', 'page') !== 'upload') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/upload')  return ['Invalid hash', window.location.hash];
      return true;
   }],
   ['Check that store is cleared and that snackbar is fired on 403 request', function (wait) {
      B.call ('post', 'auth/logout', {}, {}, function (x, error) {
         B.call ('get', 'tags', {}, '');
         wait (waits.logout);
      });
   }, function () {
      if (! B.get ('State', 'snackbar')) return ['No error message shown: ', B.get ('State', 'snackbar')];
      if (B.get ('State', 'snackbar', 'message') !== 'Your session has expired. Please login again.') return ['Wrong error message shown.'];
      if (B.get ('State', 'page') !== 'login') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/login')  return ['Invalid hash', window.location.hash];
      return true;
   }],
];

// *** SNACKBAR ***

suites.snackbar = [
   ['Close snackbar message', function (wait) {
      c.fire (c ('.snackbar__close') [0], 'click');
      wait (0);
   }, function () {
      if (B.get ('State', 'snackbar')) return 'Snackbar should not be present.';
      return true;
   }]
];

// *** PIVS ***

suites.pivs = [
   ['Login if logged out', function (wait) {
      if (B.get ('Data', 'csrf')) return true;
      c.set ('#auth-username', {value: username});
      c.set ('#auth-password', {value: password});
      B.call ('login', []);
      wait (waits.login);
   }, function () {
      if (B.get ('State', 'page') !== 'pics') return ['Invalid State.page', B.get ('State', 'page')];
      if (window.location.hash !== '#/pics/home')  return ['Invalid hash', window.location.hash];
      var loginEvent = dale.stopNot (B.r.log, undefined, function (log) {
         if (log.verb === 'post' && eq (log.path, ['auth/login'])) return log;
      });
      if (loginEvent && loginEvent.args [1].password !== 'REDACTED') return ['Password not removed from login logs!'];
      return true;
   }],
   // This assumes that the user has already uploaded pictures
   ['See that pictures are displayed with the right heading', function (wait) {
      // Wait until the main page is drawn
      wait (waits.pivs);
   }, function () {
      var allPictures = c ('.tag--all-pictures') [0];
      if (allPictures) allPictures.click ();
      var heading = c ('.pictures-header__title') [0];
      if (! heading) return 'No heading found';
      if (! heading.innerHTML.match (/^You.re looking at:/)) return 'Invalid heading.';
      return true;
   }],
   ['Check default sort is `newest`', function () {
      if (B.get ('State', 'query', 'sort') !== 'newest') return 'Invalid default sort.';
      return true;
   }],
   ['Change sort to `oldest`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return 'No dropdown element.';
      c.fire (sortItems [1], 'click');
      wait (waits.sort);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'oldest') return 'Sort didn\'t change to `oldest`.';
      return true;
   }],
   ['Change sort to `upload`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return 'No dropdown element';
      c.fire (sortItems [2], 'click');
      wait (waits.sort);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'upload') return 'Sort didn\'t change to `upload`.';
      return true;
   }],
   ['Change sort to `newest`', function (wait) {
      var sortItems = c ('li.dropdown__list-item');
      if (! sortItems) return 'No dropdown element';
      c.fire (sortItems [0], 'click');
      wait (waits.sort);
   }, function () {
      if (B.get ('State', 'query', 'sort') !== 'newest') return 'Sort didn\'t change to `newest`.';
      return true;
   }],
];

// *** HOME ***

suites.home = [
   ['Go back to the initial URL of the app', function () {
      sessionStorage.setItem ('testFrom', JSON.stringify ({suite: 'home', from: 1, time: Date.now ()}));
      window.location = window.location.href.replace (window.location.hash, '');
   }, function () {
      // This function will be ignored because we are leaving the page.
   }],
   ['Check that we land on the home view', function () {
      return true;
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: [], sort: 'newest', home: true}
      );
      if (error) return error;
      var error = stop ('window.location.hash', window.location.hash, '#/pics/home');
      if (error) return error;
      return true;
   }],
   ['Wait until the sidebar is drawn', function (wait) {
      wait (500);
   }, function () {
      return c ('.tag__title').length > 0;
   }],
   ['Click on Everything to see pivs', function (wait) {
      c ('.tag__title') [0].click ();
      wait (300);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: [], sort: 'newest', home: false}
      );
      if (error) return error;
      // `JTdC` is base64 encoding for `%7B`, which percent decode is `{`
      if (! window.location.hash.match (/#\/pics\/JTdC/)) return 'window.location.hash has no encoded State.queryURL in it.';
      var decodedHash = JSON.parse (decodeURIComponent (atob (window.location.hash.replace ('#/pics/', ''))));
      decodedHash = {tags: decodedHash.tags, sort: decodedHash.sort};
      var error = stop ('window.location.hash (decoded)', decodedHash, {tags: [], sort: 'newest'});
      if (error) return error;
      return true;
   }],
   ['Refresh the same page by landing on the same query', function (wait) {
      sessionStorage.setItem ('testFrom', JSON.stringify ({suite: 'home', from: 5, time: from.time}));
      location.reload ();
   }, function () {
      // This function will be ignored because we are leaving the page.
   }],
   ['Check that we are still on the same page after the refresh', function (wait) {
      wait (200);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: [], sort: 'newest', home: false}
      );
      if (error) return error;
      // `JTdC` is base64 encoding for `%7B`, which percent decode is `{`
      if (! window.location.hash.match (/#\/pics\/JTdC/)) return 'window.location.hash has no encoded State.queryURL in it.';
      var decodedHash = JSON.parse (decodeURIComponent (atob (window.location.hash.replace ('#/pics/', ''))));
      decodedHash = {tags: decodedHash.tags, sort: decodedHash.sort};
      var error = stop ('window.location.hash (decoded)', decodedHash, {tags: [], sort: 'newest'});
      if (error) return error;
      return !! c ('.pictures-grid__item-picture') [0];
   }],
   ['Select a piv', function (wait) {
      c ('.pictures-grid__item-picture') [0].click ();
      wait (100);
   }, function () {
      return dale.keys (B.get ('State', 'selected')).length > 0;
   }],
   ['Tag the piv and query that tag', function (wait) {
      // TODO: do this through the interface rather than with an event
      B.call ('tag', 'pivs', 'foo');
      B.call ('set', ['State', 'query', 'tags'], ['foo']);
      wait (100);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: ['foo'], sort: 'newest', home: false}
      );
      if (error) return error;
      // `JTdC` is base64 encoding for `%7B`, which percent decode is `{`
      if (! window.location.hash.match (/#\/pics\/JTdC/)) return 'window.location.hash has no encoded State.queryURL in it.';
      var decodedHash = JSON.parse (decodeURIComponent (atob (window.location.hash.replace ('#/pics/', ''))));
      decodedHash = {tags: decodedHash.tags, sort: decodedHash.sort};
      var error = stop ('window.location.hash (decoded)', decodedHash, {tags: ['foo'], sort: 'newest'});
      if (error) return error;
      return true;
   }],
   ['Refresh the same page by landing on the same query', function (wait) {
      sessionStorage.setItem ('testFrom', JSON.stringify ({suite: 'home', from: 9, time: from.time}));
      location.reload ();
   }, function () {
      // This function will be ignored because we are leaving the page.
   }],
   ['Check that we are still on the same page after the refresh with a tag selected', function (wait) {
      wait (200);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: ['foo'], sort: 'newest', home: false}
      );
      if (error) return error;
      // `JTdC` is base64 encoding for `%7B`, which percent decode is `{`
      if (! window.location.hash.match (/#\/pics\/JTdC/)) return 'window.location.hash has no encoded State.queryURL in it.';
      var decodedHash = JSON.parse (decodeURIComponent (atob (window.location.hash.replace ('#/pics/', ''))));
      decodedHash = {tags: decodedHash.tags, sort: decodedHash.sort};
      var error = stop ('window.location.hash (decoded)', decodedHash, {tags: ['foo'], sort: 'newest'});
      if (error) return error;
      return !! c ('.pictures-grid__item-picture') [0];
   }],
   // Refreshing will have unselected the piv, so no need to do it.
   ['Go home', function (wait) {
      c ('.button--purple') [0].click ();
      wait (100);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: [], sort: 'newest', home: true}
      );
      if (error) return error;
      var error = stop ('window.location.hash', window.location.hash, '#/pics/home');
      if (error) return error;
      return true;
   }],
   ['Query a tag', function (wait) {
      var tag = dale.stopNot (c ('.tag-list__item'), undefined, function (tag) {
         if (tag.innerHTML.match ('foo')) return tag;
      });
      tag.click ();
      wait (100);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: ['foo'], sort: 'newest', home: false}
      );
      if (error) return error;
      return true;
   }],
   ['Go to the upload view', function (wait) {
      c ('.header__upload-button a') [0].click ();
      wait (100);
   }, function () {
      var error = stop ('State.page', B.get ('State', 'page'), 'upload');
      if (error) return error;
      if (! c ('.button--purple-header') [0]) return 'No purple button to go back home.';
      return true;
   }],
   ['Go again to the pics page', function (wait) {
      c ('.button--purple-header') [0].click ();
      wait (100);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: [], sort: 'newest', home: true}
      );
      if (error) return error;
      var error = stop ('window.location.hash', window.location.hash, '#/pics/home');
      if (error) return error;
      return true;
   }],
   ['Go back with the back button to the upload page', function (wait) {
      history.back ();
      wait (300);
   }, function () {
      var error = stop ('State.page', B.get ('State', 'page'), 'upload');
      if (error) return error;
      // We need the page to finish rendering before clicking back.
      if (! c ('.button--purple-header') [0]) return 'No purple button to go back home.';
      debug ('after first back');
      return true;
   }],
   ['Go back with the back button to the pics page (query view)', function (wait) {
      history.back ();
      wait (300);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: ['foo'], sort: 'newest', home: false}
      );
      if (error) return error;
      // `JTdC` is base64 encoding for `%7B`, which percent decode is `{`
      if (! window.location.hash.match (/#\/pics\/JTdC/)) return 'window.location.hash has no encoded State.queryURL in it.';
      var decodedHash = JSON.parse (decodeURIComponent (atob (window.location.hash.replace ('#/pics/', ''))));
      decodedHash = {tags: decodedHash.tags, sort: decodedHash.sort};
      var error = stop ('window.location.hash (decoded)', decodedHash, {tags: ['foo'], sort: 'newest'});
      if (error) return error;
      return true;
   }],
   ['Go back with the back button to the pics page (home view)', function (wait) {
      history.back ();
      wait (300);
   }, function () {
      var error = stop ('State.query',
         {tags: B.get ('State', 'query', 'tags'), sort: B.get ('State', 'query', 'sort'), home: B.get ('State', 'query', 'home')},
         {tags: [], sort: 'newest', home: true}
      );
      if (error) return error;
      var error = stop ('window.location.hash', window.location.hash, '#/pics/home');
      if (error) return error;
      return true;
   }],
];

// *** RUN TESTS ***

var testsToRun = [];

dale.go (suites, function (v, k) {
   if (! suite || suite === k) testsToRun = testsToRun.concat (v);
   if (from) testsToRun = testsToRun.slice (from.from);
});

c.test (testsToRun, function (error, time) {
   if (error) clog (error);
   if (error) B.call ('snackbar', 'red',   JSON.stringify (error));
   else       B.call ('snackbar', 'green', 'All tests passed in ' + (from ? Date.now () - from.time : time) + 'ms');
   from = undefined;
});
