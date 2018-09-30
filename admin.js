(function () {

   // *** SETUP ***

   var dale = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
   var type = teishi.t, log = teishi.l;

   // *** LOGGING ***

   B.forget ('eventlog');

   B.listen ({id: 'eventlog', verb: '*', path: [], priority: 1}, function (x) {
      B.eventlog.unshift ({verb: x.verb, path: x.path, from: x.from});
      if (arguments.length > 1) B.eventlog [0].args = [].slice.call (arguments, 1);
      if (! B.verbose) return;
      var toprint = ['event #' + B.eventlog.length, B.eventlog [0].verb, B.eventlog [0].path];
      if (dale.keys (B.eventlog [0]).indexOf ('args') !== -1) toprint.push (JSON.stringify (B.eventlog [0].args).slice (0, 500));
      if (B.eventlog [0].from [1]) {
         toprint.push ('FROM');
         dale.do (['ev', 'verb', 'path'], function (i) {
            if (B.eventlog [0].from [1].verb && 'ev' === i) return;
            if (B.eventlog [0].from [1] [i]) toprint.push (B.eventlog [0].from [1] [i]);
            if (dale.keys (B.eventlog [0].from [1]).indexOf ('args') !== -1) toprint.push (JSON.stringify (B.eventlog [0].from [1].args).slice (0, 500));
         });
      }
      console.log.apply (console, toprint);
   });

   B.verbose = true;

   // *** ERROR REPORTING ***

   window.onerror = function () {
      c.ajax ('post', 'api/error', {}, dale.do (arguments, function (v) {
         return v.toString ();
      }));
   }

   // *** INITIALIZATION OF STATE/DATA ***

   B.do ({from: {ev: 'initialize'}}, 'set', 'State', {});
   B.do ({from: {ev: 'initialize'}}, 'set', 'Data',  {});
   window.State = B.get ('State'), window.Data = B.get ('Data');

   // *** NAVIGATION ***

   B.listen ('change', 'hash', function (x) {
      var path = window.location.hash.replace ('#/', '').split ('/');
      if (path [0] === 'auth' && path [1] === 'signup' && path [2]) State.token = path [2];
      B.do (x, 'set', ['State', 'view'],    path [0]);
      B.do (x, 'set', ['State', 'subview'], path [1]);
   });

   B.listen ('change', ['State', '*'], function (x) {
      if (x.path [1] !== 'view' && x.path [1] !== 'subview') return;
      var view = B.get ('State', 'view');
      var cookie = c.cookie () ? c.cookie () [COOKIENAME] : undefined;
      if (! cookie && view !== 'auth') return B.do (x, 'set', ['State', 'view'], 'auth');
      if (cookie   && view !== 'main') return B.do (x, 'set', ['State', 'view'], 'main');
      window.location.hash = ['#', B.get ('State', 'view'), B.get ('State', 'subview')].join ('/');
   });

   window.addEventListener ('hashchange', function () {
      B.do ({from: {ev: 'hashchange'}}, 'change', 'hash')
   });

   // *** INITIALIZATION ***

   c.ready (function () {
      B.do ({from: {ev: 'ready'}}, 'change', 'hash');
      B.mount ('body', Views.base ({from: {ev: 'ready'}}));
   });

   // *** HELPERS ***

   var H = window.H = {};

   H.if = function (cond, then, Else) {
      return cond ? then : Else;
   }

   H.from = function (x, o) {
      x.from.unshift (o);
      return x;
   }

   H.logout = function () {
      c.ajax ('get', 'auth/logout');
      B.eventlog = [];
      B.do ({from: {ev: 'logout'}}, 'set', 'State', {});
      B.do ({from: {ev: 'logout'}}, 'set', 'Data',  {});
      window.State = B.get ('State'), window.Data = B.get ('Data');
      c.cookie (false);
      B.do ({from: {ev: 'logout'}}, 'set', ['State', 'view'], 'auth');
   }

   H.authajax = function (x, m, p, h, b, cb) {
      return c.ajax (m, p, h, b, function (error, rs) {
         if (error && error.status === 403) {
            H.logout ();
            return B.do (x, 'notify', 'red', 'Your session has expired. Please login again.');
         }
         cb (error, rs);
      });
   }

   H.picPath = function (pic, size) {
      if (! size && pic.t200) return 'thumb/' + pic.t200;
      if (pic.t900) return 'thumb/' + pic.t900;
      return 'pic/' + pic.id;
   }

   H.fullScreen = function (x, exit) {
      // https://www.sitepoint.com/use-html5-full-screen-api/
      // https://stackoverflow.com/a/10082234
      if (! exit) {
         dale.do (['requestFullScreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'], function (v) {
            if (type (document.documentElement [v]) === 'function') document.documentElement [v] ();
         });
         if (window.ActiveXObject) {
            var wscript = new ActiveXObject ('WScript.Shell');
            if (wscript) wscript.SendKeys ('{F11}');
         }
      }
      else {
         dale.do (['exitFullScreen', 'webkitExitFullscreen', 'mozCancelFullScreen', 'msExitFullscreen'], function (v) {
            if (type (document [v]) === 'function') document [v] ();
         });
         if (window.ActiveXObject) {
            var wscript = new ActiveXObject ('WScript.Shell');
            if (wscript) wscript.SendKeys ('{ESC}');
         }
      }
      setTimeout (function () {
         B.do (H.from (x, {ev: 'fullScreen'}), 'set', ['State', 'screen'], {w: window.innerWidth, h: window.innerHeight});
      }, 1);

   }

   // *** VIEWS ***

   var Views = {};

   Views.base = function (x) {
      return B.view (x, ['State', 'view'], function (x, view) {
         return ['div', {class: 'pure-g'}, [
            ['div', {class: 'pure-u-1-24'}],
            ['div', {class: 'pure-u-22-24'}, [
               Views.notify (x),
               Views [view] ? Views [view] (x) : undefined,
            ]],
            ['div', {class: 'pure-u-1-24'}],
          ]];
      });
   }

   // *** NOTIFY ***

   Views.notify = function (x) {
      return B.view (x, ['State', 'notify'], {listen: [
         ['notify', '*', function (x, message, notimeout) {
            if (B.get ('State', 'notify', 'timeout')) clearTimeout (B.get ('State', 'notify', 'timeout'));
            B.do (x, 'set', ['State', 'notify'], {color: x.path [0], message: message});
            if (! notimeout) B.do (x, 'set', ['State', 'notify', 'timeout'], setTimeout (function () {
               B.do (x, 'rem', 'State', 'notify');
            }, 3000));
         }],
      ]}, function (x, notify) {
         if (! notify) return;
         var colormap = {red: '#ff0033'};
         return [
            ['style', [
               ['div.notify', {
                  position: 'fixed',
                  'bottom, left': 0,
                  margin: '0 auto',
                  color: 'white',
                  border: 'solid 4px ' + (colormap [notify.color] || notify.color),
                  'background-color': '#333333',
                  height: '1.6em',
                  width: 1,
                  'z-index': '2',
                  padding: '0.5em',
                  opacity: notify ? 1 : 0,
                  'text-align': 'center',
                  'font-size': '1.2em'
               }]
            ]],
            ['div', B.ev ({class: 'notify'}, ['onclick', 'rem', 'State', 'notify']), notify.message],
         ];
      });
   }

   // *** AUTH ***

   Views.auth = function (x) {
      return B.view (x, ['State', 'subview'], {listen: [
         ['submit', 'auth', function (x) {
            var credentials = {
               username: c ('#auth-username').value,
               password: c ('#auth-password').value
            };
            c.ajax ('post', 'auth/' + B.get ('State', 'subview'), {}, credentials, function (error, rs) {
               if (error) return B.do (x, 'notify', 'red', 'There was an error logging in.');
               else              B.do (x, 'notify', 'green', 'Welcome!');
               dale.do (rs.headers, function (v, k) {
                  if (k.match (/^cookie/i)) document.cookie = v;
               });
               B.do (x, 'set', ['State', 'view'], 'main');
            });
         }],
      ], ondraw: function (x) {
         if (['login'].indexOf (B.get ('State', 'subview')) === -1) B.do (x, 'set', ['State', 'subview'], 'login');
      }}, function (x, subview) {
         var fields = ['Username', 'Password'];
         return [
            ['style', [
               ['label', {width: 80, display: 'inline-block'}]
            ]],
            ['form', {class: 'pure-form pure-form-aligned', onsubmit: 'event.preventDefault ()'}, [
               ['fieldset', [
                  ['legend', subview],
                  ['br'],
                  dale.do (fields, function (V) {
                     var v = V.toLowerCase ();
                     return ['div', {class: 'pure-control-group'}, [
                        ['label', {for: 'auth-' + v}, V],
                        ['input', {id:  'auth-' + v, type: v === 'password' ? v : 'text', placeholder: v}]
                     ]];
                  }),
                  ['div', {class: 'pure-controls'}, [
                     ['button', B.ev ({class: 'pure-button pure-button-primary'}, ['onclick', 'submit', 'auth']), 'Submit'],
                     ['br'], ['br'],
                  ]]
               ]]
            ]]
         ]
      });
   }

   // *** MAIN VIEW ***

   Views.main = function (x) {
      return B.view (x, ['State', 'subview'], {listen: [
      ], ondraw: function (x) {
         if (['dashboard'].indexOf (B.get ('State', 'subview')) === -1) B.do (x, 'set', ['State', 'subview'], 'dashboard');
      }}, function (x, subview) {
         return [
            ['style', [
               ['a.logout', {
                  'letter-spacing': 'normal',
                  position: 'absolute',
                  'left, top': 0.05,
                  'font-weight': 'bold',
                  'text-decoration': 'none'
               }],
               ['span.action', {
                  color: 'blue',
                  'text-decoration': 'underlined',
                  cursor: 'pointer'
               }],
               ['.icon', {
                  cursor: 'pointer',
               }],
            ]],
            Views [subview] ? Views [subview] (x) : undefined,
         ];
      });
   }

   // *** DASHBOARD VIEW ***

   Views.dashboard = function (x) {
      var evs = dale.do (['stats', 'invites'], function (v) {
         return ['retrieve', v, function (x) {
            H.authajax (x, 'get', 'admin/' + v, {}, '', function (error, rs) {
               if (error) return B.do (x, 'notify', 'red', 'There was an error retrieving ' + v + '.');
               B.do (x, 'set', ['Data', v], rs.body);
            });
         }];
      }).concat ([
         ['create', 'invite', function (x) {
            H.authajax (x, 'post', 'admin/invites', {}, B.get ('State', 'new', 'invite'), function (error) {
               if (error) return B.do (x, 'notify', 'red', 'There was an error creating the invite.');
               B.do (x, 'retrieve', 'invites');
            });
         }],
         ['delete', 'invite', function (x, email) {
            H.authajax (x, 'delete', 'admin/invites/' + email, {}, '', function (error) {
               if (error) return B.do (x, 'notify', 'red', 'There was an error deleting the invite.');
               B.do (x, 'retrieve', 'invites');
            });
         }],
      ]);

      return B.view (x, ['Data'], {listen: evs, ondraw: function (x) {
         dale.do (['stats', 'invites'], function (v) {
            if (! B.get ('Data', v)) B.do (x, 'retrieve', v);
         });
      }}, function (x, Data) {
         return [
            ['h3', 'Stats'],
            ['pre', JSON.stringify (Data.stats)],
            ['h3', 'Invites'],
            ['pre', JSON.stringify (Data.invites)],
            B.view (['State', 'new', 'invite'], function (x, ninvite) {
               if (! ninvite) return ['span', B.ev ({class: 'action'}, ['onclick', 'set', ['State', 'new', 'invite'], {email: ''}]), 'Create invite'];
               return [
                  ['input', B.ev ({value: ninvite.email}, ['onchange', 'set', ['State', 'new', 'invite', 'email']])],
                  ['span', B.ev ({class: 'action'}, ['onclick', 'create', 'invite']), 'Create invite'],
                  ['span', B.ev ({class: 'action'}, ['onclick', 'rem', ['State', 'new'], 'invite']), 'Cancel'],
               ];
            }),
         ];
      });
   }
}) ();
