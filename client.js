(function () {

   // *** SETUP ***

   var dale = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
   var type = teishi.t, log = teishi.l;
   var murmur = window.murmur;

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

   //B.verbose = true;

   // *** ERROR REPORTING ***

   window.onerror = function () {
      c.ajax ('post', 'clientlog', {}, dale.do (arguments, function (v) {
         return v.toString ();
      }).concat (B.eventlog));
   }

   // *** INITIALIZATION OF STATE/DATA ***

   B.do ({from: {ev: 'initialize'}}, 'set', 'State', {});
   B.do ({from: {ev: 'initialize'}}, 'set', 'Data',  {});

   window.State = B.get ('State'), window.Data = B.get ('Data');

   // *** NAVIGATION ***

   B.listen ('change', 'hash', function (x) {
      var path = window.location.hash.replace ('#/', '').split ('/');
      if (path [0] === 'auth' && path [1] === 'signup' && path [2]) State.token = path [2];
      if (path [0] === 'auth' && path [1] === 'reset' && path [2])  State.token = path [2];
      if (path [0] === 'auth' && path [1] === 'reset' && path [3])  State.username = path [3];
      if (path [0] === 'auth' && path [1] === 'login' && path [2] === 'verified') B.do (x, 'notify', 'green', 'You have successfully verified your email address. Please login to start using acpic!');
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

   // *** LOGOUT ***

   B.listen ('logout', '*', function (x) {
      c.ajax ('get', 'auth/logout');
      B.eventlog = [];
      B.do (x, 'set', 'State', {});
      B.do (x, 'set', 'Data',  {});
      window.State = B.get ('State'), window.Data = B.get ('Data');
      c.cookie (false);
      B.do (x, 'set', ['State', 'view'], 'auth');
   });

   // *** INITIALIZATION ***

   c.ready (function () {
      B.do ({from: {ev: 'ready'}}, 'change', 'hash');
      B.mount ('body', Views.base ({from: {ev: 'ready'}}));
      document.onscroll = function (e) {
         // XXX x.from not working
         B.do ('document', 'scroll', e);
      }
   });

   // *** HELPERS ***

   var H = window.H = {};

   H.css = {
      blue:  '#4562FF',
      gray1: '#3A3A3A',
      gray2: '#484848',
      gray3: '#8B8B8B',
      gray4: '#DEDEDE',
      gray5: '#F2F2F2',
      gray6: '#FBFBFB',
      tagc0: '#FECB5F',
      tagc1: '#BE5764',
      tagc2: '#5DE3C2',
      tagc3: '#8B572A',
      tagc4: '#6B6DF9',
      tagc5: '#FA7E5C',
      tagc6: '#4EDEF8',
      font: 'Montserrat, sans-serif',
   }

   H.icons = {
      tag: function (color) {
         return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><g><path fill="' + color + '" stroke="' + color + '" d="M15.75,9.9a1.51,1.51,0,0,0,.34-1.1l-.32-3.51a1.5,1.5,0,0,0-1.62-1.36l-3.51.29a1.5,1.5,0,0,0-1,.54L4.67,10.65a1.51,1.51,0,0,0,.18,2.12L8.68,16a1.51,1.51,0,0,0,2.12-.18Z"/></g></svg>';
      }
   }

   H.if = function (cond, then, Else) {
      return cond ? then : Else;
   }

   H.last = function (a, pos) {
      return a [a.length - (pos || 1)];
   }

   H.from = function (x, o) {
      x.from.unshift (o);
      return x;
   }

   H.authajax = function (x, m, p, h, b, cb) {
      x = H.from (x, {ev: 'authajax', method: m, path: p, headers: h, body: b});
      return c.ajax (m, p, h, b, function (error, rs) {
         if (error && error.status === 403) {
            B.do (x, 'logout', '*');
            return B.do (x, 'notify', 'red', 'Your session has expired. Please login again.');
         }
         if (error) console.log (error.responseText);
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
      }, 50);

   }

   H.spaceh = function (cols) {
      var COLS = 40;
      return 100 * cols / COLS + 'vw';
   }

   H.spacev = function (number, lineHeight) {
      var TYPELINEHEIGHT = 1.5;
      return number * (lineHeight || TYPELINEHEIGHT) + 'rem';
   }

   H.fontSize = function (value, ratio, base) {
      var TYPEBASE = 1, TYPERATIO = 1.2;
      return Math.pow (ratio || TYPERATIO, value) * (base || TYPEBASE) + 'rem';
   }

   // *** VIEWS ***

   var Views = {};

   Views.base = function (x) {
      return B.view (x, ['State', 'view'], function (x, view) {
         return [
            ['style', [
               ['html', {
                  'font-size': 17,
                  'font-family': 'Montserrat, sans-serif',
               }],
               ['h1', {
                  'font-size':     H.fontSize (3),
                  'margin-bottom': H.spacev (2),
                  'margin-top':    H.spacev (1),
               }],
               ['h2', {
                  'font-size':     H.fontSize (3),
                  'margin-bottom': H.spacev (1),
                  'margin-top':    H.spacev (0.5),
               }],
               ['h5', {
                  'font-size': H.fontSize (-1.5),
               }],
               ['.gray3', {
                  color: H.css.gray3,
               }],
               ['.logo-container', {
                  'margin-left': H.spaceh (1),
               }],
               ['.logo', {
                  //'font-family': '\'Lucida Bright\', Georgia, serif',
                  'font-family': '\'Kadwa\', serif',
                  'font-weight': 'bold',
                  'font-size': H.fontSize (2),
               }],
               ['.button', {
                  cursor: 'pointer',
                  'font-family': 'Montserrat, sans-serif',
                  'background-color': H.css.blue,
                  color: 'white',
                  border: 'none',
                  'font-weight': 'bold',
                  'border-radius': 25,
                  'padding-top': 13,
                  'padding-bottom': 14,
                  'padding-left': 25,
                  'padding-right': 23
               }],
               ['.bold', {
                  'font-weight': 'bold',
               }],
               ['.float', {
                  float: 'left',
               }],
               ['p', {
                  'font-size': H.fontSize (-1),
               }],
               ['.pointer', {
                  cursor: 'pointer',
               }],
               ['i.inline', {
                  'margin-right': 5,
               }],
               ['input', {
                  height: 41,
                  'border-radius': 20,
                  border: 0,
                  'background-color': H.css.gray5,
                  'padding-left': 16,
                  'line-height': 0.7,
                  'font-family': H.css.font,
                  'font-size': H.fontSize (-1),
               }],
               dale.do (['::-webkit-input-placeholder', '::-moz-placeholder', ':-ms-input-placeholder', ':-moz-placeholder'], function (v) {
                  return [v, {
                     'font-style': 'italic',
                  }];
               }),
               ['input:focus, select:focus, textarea:focus, button:focus', {
                  outline: 'none',
               }],
               ['a.logout i', {
                  'font-size': H.fontSize (1.4),
                  'font-weight': 'bold',
                  color: H.css.blue,
                  position: 'absolute',
                  right: H.spaceh (2),
               }],
            ]],
            ['h2', {class: 'logo-container'}, [
                ['span', {class: 'logo', style: 'color: ' + H.css.blue}, 'ac:'],
                ['span', {class: 'logo', style: 'color: red'}, 'pic'],
                ['a', B.ev ({title: 'Log Out', href: '#', class: 'logout'}, ['onclick', 'logout', '*']), ['i', {class: 'icon ion-log-out'}]],
            ]],
            Views.canvas (x),
            Views.notify (x),
            H.if (Views [view], Views [view] (x)),
         ];
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
                  'font-size': H.fontSize (1),
               }]
            ]],
            ['div', B.ev ({class: 'notify'}, ['onclick', 'rem', 'State', 'notify']), notify.message],
         ];
      });
   }

   // *** AUTH ***

   Views.auth = function (x) {
      var routes = [
         ['submit', 'auth', function (x) {
            var subview = B.get ('State', 'subview');
            var credentials = {
               username: c ('#auth-username').value,
               password: c ('#auth-password').value
            };
            if ((credentials.username || '').length < 3) return B.do (x, 'notify', 'red', 'Your username must be at least three characters.');
            if ((credentials.password || '').length < 6) return B.do (x, 'notify', 'red', 'Your password must be at least six characters.');
            if (subview === 'signup') {
               credentials.email = c ('#auth-email').value;
               if ((credentials.username || '').match (/@/)) return B.do (x, 'notify', 'red', 'Your username cannot contain the "@" sign.');
               if (c ('#auth-confirm').value !== credentials.password) return B.do (x, 'notify', 'red', 'Please confirm that your password is entered correctly.');
               if (State.token) credentials.token = decodeURIComponent (State.token);
               else {
                  if (confirm ('acpic is currently on alpha and is invitation only. Would you like to request an invitation?')) {
                     c.ajax ('post', 'requestInvite', {}, {email: credentials.email}, function (error) {
                        if (error) return alert ('Wow, we just experienced a connection error. Could you please try again?');
                        B.do (x, 'notify', 'green', 'We have successfully received your request! We\'ll get back to you ASAP.');
                     });
                  }
                  return;
               }
            }
            c.ajax ('post', 'auth/' + subview, {}, credentials, function (error, rs) {
               x = H.from (x, {ev: 'ajax', method: 'post', path: 'auth/' + subview});
               if (error) {
                  if (error.responseText === '{"error":"token"}') return B.do (x, 'notify', 'yellow', 'The email you provided does not match the invitation you received. Please enter the email where you received the invitation.');
                  if (error.responseText === '{"error":"verify"}') return B.do (x, 'notify', 'yellow', 'Please verify your email address before logging in.');
                  if (error.responseText === '{"error":"username"}') return B.do (x, 'notify', 'yellow', 'The username you provided is already in use. Please use another one.');
                  if (error.responseText === '{"error":"email"}') return B.do (x, 'notify', 'yellow', 'Seems there is already an account with that email. Should you try to login instead?');
                  return B.do (x, 'notify', 'red', 'There was an error ' + (subview === 'signup' ? 'signing up.' : 'logging in.'));
               }
               if (subview === 'signup') {
                  delete State.token;
                  c ('#auth-username').value = '';
                  c ('#auth-password').value = '';
               }

               if (dale.stopNot (rs.headers, undefined, function (v, k) {
                  if (k.match (/^cookie/i)) {
                     document.cookie = v;
                     return true;
                  }
               })) {
                  B.do (x, 'notify', 'green', 'Welcome!');
                  B.do (x, 'set', ['State', 'view'], 'main');
               }
               else {
                  B.do (x, 'notify', 'green', 'You have successfully created your account! Please check your inbox.');
                  return B.do (x, 'set', ['State', 'subview'], 'login');
               }
            });
         }],
         ['submit', 'recover', function (x) {
            var credentials = {
               username: c ('#auth-username').value,
            };
            if ((credentials.username || '').length < 3) return B.do (x, 'notify', 'red', 'Your username must be at least three characters.');
            c.ajax ('post', 'auth/recover', {}, credentials, function (error, rs) {
               x = H.from (x, {ev: 'ajax', method: 'post', path: 'auth/recover'});
               if (error && error.status === 500) return B.do (x, 'notify', 'red', 'There was an unexpected error. Please contact us through email.');
               c ('#auth-username').value = '';
               B.do (x, 'set', ['State', 'subview'], 'login'),
               B.do (x, 'notify', 'green', 'You should receive an email with instructions for resetting your password.');
            });
         }],
         ['submit', 'reset', function (x) {
            var credentials = {
               password: c ('#auth-password').value,
            };
            if ((credentials.password || '').length < 6) return B.do (x, 'notify', 'red', 'Your new password must be at least three characters.');
            if (State.token)    credentials.token    = decodeURIComponent (State.token);
            if (State.username) credentials.username = decodeURIComponent (State.username);

            if (c ('#auth-confirm').value !== credentials.password) return B.do (x, 'notify', 'red', 'Please confirm that your password is entered correctly.');

            c.ajax ('post', 'auth/reset', {}, credentials, function (error, rs) {
               x = H.from (x, {ev: 'ajax', method: 'post', path: 'auth/reset'});
               if (error) {
                  if (error.status === 500) return B.do (x, 'notify', 'red', 'There was an unexpected error. Please contact us through email.');
                  return B.do (x, 'notify', 'red', 'Invalid reset password link.');
               }
               delete State.token;
               delete State.username;
               c ('#auth-password').value = '';
               B.do (x, 'set', ['State', 'subview'], 'login'),
               B.do (x, 'notify', 'green', 'Your password was changed successfully! Please login.');
            });
         }],
      ];

      return B.view (x, ['State', 'subview'], {listen: routes, ondraw: function (x) {
         if (['login', 'signup', 'recover', 'reset'].indexOf (B.get ('State', 'subview')) === -1) B.do (x, 'set', ['State', 'subview'], 'login');
         dale.do (c ('input'), function (input) {input.value = ''});
      }}, function (x, subview) {

         var fields = {
            signup:  ['Username', 'Email', 'Password', 'Confirm'],
            login:   ['Username', 'Password'],
            recover: ['Username'],
            reset:   ['Password', 'Confirm'],
         } [subview];

         return [
            ['style', [
               ['label', {display: 'inline-block'}],
               ['a.blue', {color: 'blue'}],
               ['form', {
                  width: H.spaceh (20),
                  'margin-left': H.spaceh (5),
               }],
               ['fieldset', {
                  width: H.spaceh (16),
               }],
               ['legend', {
                  'font-size': H.fontSize (1.3),
               }],
               ['label', {
                  width: H.spaceh (3),
               }],
            ]],
            ['form', {onsubmit: 'event.preventDefault ()'}, [
               ['fieldset', [
                  ['legend', {class: 'bold'}, {login: 'Login', signup: 'Sign in', recover: 'Recover password', reset: 'Reset password'} [subview]],
                  ['br'],
                  dale.do (fields, function (V) {
                     var v = V.toLowerCase ();
                     return ['div', [
                        ['label', {class: 'bold', for: 'auth-' + v}, V],
                        ['input', {id:  'auth-' + v, type: (v === 'password' || v === 'confirm') ? 'password' : 'text', placeholder: v}],
                        ['br'], ['br'],
                     ]];
                  }),
                  ['div', [
                     ['button', B.ev ({class: 'button'}, ['onclick', 'submit', (subview === 'login' || subview === 'signup') ? 'auth' : subview || 'auth']), 'Submit'],
                     ['br'], ['br'],
                     subview === 'login' ? [
                        ['a', {class: 'bold blue', href: '#/auth/signup'}, 'Don\'t have an account yet? Create one.'],
                        ['br'], ['br'],
                        ['a', {class: 'bold blue', href: '#/auth/recover'}, 'Forgot your password?'],
                     ] : ['a', {class: 'bold blue', href: '#/auth/login'},  'Already have an account? Log in.'],
                  ]]
               ]]
            ]]
         ]
      });
   }

   // *** MAIN VIEW ***

   Views.main = function (x) {
      var routes = ['change', ['State', 'upload', 'queue'], function (x) {
         var queue = B.get ('State', 'upload', 'queue');
         var MAXSIMULT = 2, uploading = 0;
         dale.do (queue, function (file) {
            if (uploading === MAXSIMULT) return;
            if (file.uploading) return uploading++;
            file.uploading = true;
            uploading++;

            var f = new FormData ();
            f.append ('lastModified', (file.lastModified || new Date ().getTime ()) - new Date ().getTimezoneOffset () * 60 * 1000);
            f.append ('pic', file);
            if (B.get ('State', 'upload', 'tags')) f.append ('tags', teishi.s ([B.get ('State', 'upload', 'tags')]));
            H.authajax (x, 'post', 'pic', {}, f, function (error, rs) {
               dale.do (B.get ('State', 'upload', 'queue'), function (v, i) {
                  if (v === file) B.do (x, 'rem', ['State', 'upload', 'queue'], i);
               });
               if (error && error.status === 409 && error.responseText.match ('repeated')) return B.do (x, 'set', ['State', 'upload', 'repeated'], (B.get ('State', 'upload', 'repeated') || 0) + 1);
               if (error && error.status === 409 && error.responseText.match ('capacity')) {
                  B.do (x, 'set', ['State', 'upload', 'queue'], []);
                  return B.do (x, 'notify', 'yellow', 'You\'ve exceeded the maximum capacity of your plan so you cannot upload any more pictures.');
               }
               if (error) return B.do (x, 'add', ['State', 'upload', 'error'], [error, file]);
               B.do (x, 'set', ['State', 'upload', 'done'], (B.get ('State', 'upload', 'done') || 0) + 1);
            });
         });
      }];



      return B.view (x, ['State', 'subview'], {listen: routes, ondraw: function (x) {
         if (['browse', 'upload'].indexOf (B.get ('State', 'subview')) === -1) B.do (x, 'set', ['State', 'subview'], 'browse');
         window.onbeforeunload = function () {
            var q = B.get ('State', 'upload', 'queue');
            if (q && q.length > 0) return 'Refreshing the page will stop the upload process. Are you sure?';
         }
         dale.do (['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange', 'MSFullscreenChange'], function (v) {
            document.addEventListener (v, function () {
               if (! document.fullscreenElement && ! document.webkitIsFullScreen && ! document.mozFullScreen && ! document.msFullscreenElement) {
                  B.do (H.from (x, {ev: 'onkeydown', key: 27}), 'rem', 'State', 'canvas');
               }
            });
         });

         document.onkeydown = function (e) {
            e = e || window.event;
            if (e.keyCode === 16) B.do (H.from (x, {ev: 'onkeydown', key: 16}), 'set', ['State', 'shift'], true);
            if (e.keyCode === 17) B.do (H.from (x, {ev: 'onkeydown', key: 17}), 'set', ['State', 'ctrl'],  true);
            if (e.keyCode === 37) B.do (H.from (x, {ev: 'onkeydown', key: 37}), 'canvas', 'prev');
            if (e.keyCode === 39) B.do (H.from (x, {ev: 'onkeydown', key: 39}), 'canvas', 'next');
         };
         document.onkeyup = function (e) {
            e = e || window.event;
            if (e.keyCode === 16) B.do (H.from (x, {ev: 'onkeyup', key: 16}), 'set', ['State', 'shift'], false);
            if (e.keyCode === 17) B.do (H.from (x, {ev: 'onkeyup', key: 17}), 'set', ['State', 'ctrl'],  false);
         };
      }}, function (x, subview) {
         return Views [subview] ? Views [subview] (x) : undefined;
      });
   }

   // *** BROWSE VIEW ***

   Views.browse = function (x) {
      return [
         ['style', [
            ['div.left', {
               width: H.spaceh (7.0),
               'padding-left': H.spaceh (0.35),
               'margin-left':  H.spaceh (1),
               height: 1,
               'background-color': H.css.gray6
            }],
            ['div.center', {
               width: H.spaceh (25),
               'padding-left': H.spaceh (1),
            }],
            ['.button', {
               'font-size': H.fontSize (0),
               'padding-left, padding-right': 15,
            }, [
               ['i', {
                  'margin-right': 5,
                  color: 'white',
                  'font-weight': 'bold',
                  'font-size': H.fontSize (1),
                  'vertical-align': 'baseline',
               }],
            ]],
         ]],
         ['div', {class: 'left float'}, [
            Views.query  (x),
            Views.manage (x),
         ]],
         ['div', {class: 'center float'}, [
            B.view (x, ['State', 'query', 'tags'], function (x, qtags) {
               return B.view (x, ['Data', 'tags'], function (x, tags) {
                  return B.view (x, ['Data', 'total'], function (x, total) {
                     total = total || 0;
                     if (! qtags || qtags.length === 0) return ['h1', 'All Photos (' + total  + ')'];
                     else if (teishi.eq (['untagged'], qtags)) return ['h1', 'Untagged (' + total + ')'];
                     else if (qtags.length === 1)              return ['h1', qtags [0] + ' (' + total + ')'];
                     else                                      return ['h1', 'Multiple tags (' + total + ')'];
                  });
               });
            }),
            ['p', 'Deselect'],
            ['p', 'Select all'],
            ['hr'],
            Views.pics (x, ['Data', 'pics'])
         ]],
         ['div', {class: 'float', style: 'width:' + H.spaceh (3.5)}, [
            ['button', B.ev ({class: 'button'}, ['onclick', 'set', ['State', 'subview'], 'upload']), [['i', {class: 'ion-ios-plus-outline'}], 'Upload']],
         ]],
      ];
   }

   // *** QUERY VIEW ***

   Views.query = function (x) {
      return B.view (x, ['State', 'query'], {ondraw: function (x) {
         if (! B.get ('State', 'query')) B.do (x, 'set', ['State', 'query'], {tags: [], sort: 'newest'});
         if (! B.get ('State', 'refreshQuery')) {
            B.do (x, 'set', ['State', 'refreshQuery'], setInterval (function () {
               var queue = B.get ('State', 'upload', 'queue');
               if (queue && queue.length > 0) B.do (H.from (x, {from: {ev: 'refreshQuery'}}), 'retrieve', 'pics');
            }, 1000));
         }
      }, listen: [
         ['change', ['State', 'query'], function (x) {
            var untaggedIndex = B.get ('State', 'query', 'tags').indexOf ('untagged');
            if (untaggedIndex !== -1 && B.get ('State', 'query', 'tags').length > 1) return B.do (x, 'rem', ['State', 'query', 'tags'], untaggedIndex);
            B.do (x, 'retrieve', 'pics');
         }],
         // We update the tag svgs whenever a change fires on the page. We use priority -1000 so that we run this after the views are updated.
         ['change', '*', {priority: -1000}, function () {
            dale.do (c ('span.tag'), function (el) {
               var i = parseInt (el.getAttribute ('class').replace ('opaque tag ', '').slice (-2));
               var color = H.css ['tagc' + Math.floor (i / (100 / 7))];
               el.innerHTML = H.icons.tag (color);
            });
         }],
      ]}, function (x, query) {
         if (! query) return;
         return B.view (x, ['Data', 'pics'], function (x, pics) {
            return B.view (x, ['State', 'selected'], function (x, selected) {
               if (! pics || dale.keys (selected) > 0) return;
               return [
                  ['style', [
                     ['.blueside', {
                        'position': 'relative',
                     }],
                     ['.blueside div.blueside', {
                        height: 1,
                        'position': 'absolute',
                        left: H.spaceh (-0.35),
                        'border-left': 'solid 3px ' + H.css.blue,
                     }],
                     ['div.input-search', {
                        position: 'relative',
                     }, [
                        ['i', {
                           position: 'absolute',
                           right: H.spaceh (1),
                           'font-size': H.fontSize (1.5),
                           top: 10,
                        }],
                     ]],
                     ['ul', {
                     }],
                     ['ul.tags', {
                        'list-style-type': 'none',
                        padding: 0,
                     }, [
                        ['li', {
                           cursor: 'pointer',
                           'font-size': H.fontSize (-1),
                           'font-weight': 'bold',
                           color: H.css.gray3,
                           position: 'relative',
                        }],
                        ['li.selected', {
                           color: H.css.gray1,
                        }],
                        ['i.cancel', {
                           position: 'absolute',
                           right: 0,
                        }],
                     ]],
                     ['.tag', {
                        'width, height': 16,
                        'margin-right': 12,
                        display: 'block',
                        float: 'left',
                     }],
                  ]],
                  ['h5', {class: 'gray3'}, 'OVERVIEW'],
                  B.view (x, ['Data', 'tags'], function (x, tags) {
                     if (! tags) return;
                     var tagmaker = function (tag, k, active) {
                        var tagn = ['', tag, tags [tag] ? [' (', tags [tag], ')'] : ''];
                        if (active) return [['li', B.ev (['onclick', 'rem', ['State', 'query', 'tags'], k]), [
                           ['span', {class: 'opaque tag ' + murmur.v3 (tag)}],
                           tagn,
                           ['i', {class: 'cancel icon ion-close'}],
                        ]], ['br']];
                        return [['li', B.ev ([
                           ['onclick', 'add', ['State', 'query', 'tags'], tag],
                           ['onclick', 'rem', 'State', 'autoquery'],
                        ]), [
                           ['span', {class: 'opaque tag ' + murmur.v3 (tag)}],
                           tagn,
                        ]], ['br']];
                     }
                     return [
                        ['p', B.ev ({class: 'pointer ' + H.if (query.tags.length === 0, 'blueside bold')}, ['onclick', 'set', ['State', 'query', 'tags'], []]), [
                           H.if (query.tags.length === 0, ['div', {class: 'blueside'}]),
                           ['i', {class: 'float inline icon ion-camera'}],
                           ['All photos (', tags.all + ')']
                        ]],
                        ['p', B.ev ({class: 'pointer ' + H.if (query.tags.indexOf ('untagged') === 0, 'blueside bold')}, ['onclick', 'set', ['State', 'query', 'tags'], ['untagged']]), [
                           H.if (query.tags.indexOf ('untagged') === 0, ['div', {class: 'blueside'}]),
                           ['i', {class: 'float inline icon ion-ios-pricetag-outline'}],
                           ['Untagged (' + tags.untagged + ')'],
                        ]],
                        ['div', {style: 'height: 2px'}],
                        query.tags.length > 0 && query.tags [0] !== 'untagged' ?
                           ['h5', {class: 'gray3 blueside'}, [['div', {class: 'blueside'}], 'FILTER']] :
                           ['h5', {class: 'gray3'}, 'FILTER'],
                           B.view (x, ['State', 'autoquery'], {attrs: {class: 'input-search'}}, function (x, autoquery) {
                           return [
                              ['input', B.ev ({placeholder: 'Filter by tag or year', value: autoquery}, ['oninput', 'set', ['State', 'autoquery']])],
                              ['i', {class: 'icon ion-ios-search'}],
                           ];
                        }),
                        H.if (query.tags.length > 0 && query.tags [0] !== 'untagged', ['ul', {class: 'tags'}, dale.do (query.tags, function (tag, k) {
                           return tagmaker (tag, k, true);
                        })]),
                        ['h5', {class: 'gray3'}, 'TAGS'],
                        H.if (tags.length === 0, ['p', 'No tags yet! Click the upload button to add pictures and tags.']),
                        B.view (x, ['State', 'autoquery'], function (x, autoquery) {

                           var matches = dale.fil (dale.keys (tags), undefined, function (tag) {
                              if (tag === 'all' || tag === 'untagged') return;
                              if (tag.match (new RegExp (autoquery || '', 'i')) && query.tags.indexOf (tag) === -1) return tag;
                           }).sort (function (a, b) {
                              if (a.match (/^\d{4}$/) && b.match (/^\d{4}$/)) return parseInt (a) > parseInt (b) ? 1 : -1;
                              return a.toLowerCase () < b.toLowerCase ? -1 : 1;
                           });

                           if (matches.length > 0) return ['ul', {class: 'gray tags'}, dale.do (matches, function (tag) {
                              return tagmaker (tag);
                           })];
                        }),
                     ];
                  }),
                  /*
                  ['p', [
                     query.sort === 'newest' ? 'By newest'      : ['span', B.ev ({class: 'action'}, ['onclick', 'set', ['State', 'query', 'sort'], 'newest']), 'By newest'],
                     [' | '],
                     query.sort === 'oldest' ? 'By oldest'      : ['span', B.ev ({class: 'action'}, ['onclick', 'set', ['State', 'query', 'sort'], 'oldest']), 'By oldest'],
                     [' | '],
                     query.sort === 'upload' ? 'By upload date' : ['span', B.ev ({class: 'action'}, ['onclick', 'set', ['State', 'query', 'sort'], 'upload']), 'By upload date'],
                  ]],
                  */
               ];
            });
         });
      });
   }

   // *** MANAGE VIEW ***

   Views.manage = function (x) {
      var routes = [
         ['retrieve', 'pics', function (x) {
            var q = B.get ('State', 'query');
            if (! q) return;
            var num = (B.get ('Data', 'pics') || []).length;

            H.authajax (x, 'post', 'query', {}, {tags: q.tags, sort: q.sort, from: 1, to: num + 30}, function (error, rs) {
               if (error) return B.do (x, 'notify', 'red', 'There was an error querying the picture(s).');
               var selected = {};
               dale.do (rs.body.pics, function (newpic) {
                  if (B.get ('State', 'selected', newpic.id)) selected [newpic.id] = true;
               });
               B.do (x, 'set', ['State', 'selected'], selected);
               B.do (x, 'set', ['Data', 'pics'], rs.body.pics);
               B.do (x, 'set', ['Data', 'total'], rs.body.total);
            });
         }],
         ['retrieve', 'tags', function (x) {
            H.authajax (x, 'get', 'tags', {}, '', function (error, rs) {
               if (error) return B.do (x, 'notify', 'red', 'There was an error querying the tags.');
               B.do (x, 'set', ['Data', 'tags'], rs.body);
               var tags = dale.keys (rs.body);
               dale.do (B.get ('State', 'query', 'tags') || [], function (tag, k) {
                  if (tags.indexOf (tag) === -1) B.do (x, 'rem', ['State', 'query', 'tags'], k);
               });
            });
         }],
         ['delete', 'pics', function (x) {
            var pics = dale.keys (B.get ('State', 'selected'));
            if (pics.length === 0) return;
            if (! confirm ('Are you sure you want to delete the selected pictures?')) return;
            B.do (x, 'notify', 'yellow', 'Deleting, please wait...');
            var deleteOne = function () {
               H.authajax (x, 'delete', 'pic/' + pics.shift (), {}, '', function (error, rs) {
                  if (error) return B.do (x, 'notify', 'red', 'There was an error deleting the picture(s).');
                  if (pics.length > 0) deleteOne ();
                  else {
                     B.do (x, 'retrieve', 'tags');
                     B.do (x, 'retrieve', 'pics');
                     B.do (x, 'notify', 'green', 'The pictures were successfully deleted.');
                  }
               });
            }
            deleteOne ();
         }],
         ['tag', 'pics', function (x, tag, del) {
            if (tag === true) tag = B.get ('State', 'autotag');
            if (! tag) return;
            if (BASETAGS.indexOf (tag) !== -1) return B.do (x, 'notify', 'yellow', 'Sorry, you can not use that tag.');
            if (tag.match (/^\d{4}$/) && parseInt (tag) >= 1900 && parseInt (tag) <= 2100) return B.do (x, 'notify', 'yellow', 'Sorry, you can not use that tag.');
            var ids = dale.keys (B.get ('State', 'selected'));
            if (ids.length === 0) return;
            var payload = {
               tag: tag,
               ids: ids,
               del: del
            }
            H.authajax (x, 'post', 'tag', {}, payload, function (error, rs) {
               if (error) return B.do (x, 'notify', 'red', 'There was an error tagging the picture(s).');
               B.do (x, 'notify', 'green', 'Tagging operation successful!');
               B.do (x, 'retrieve', 'tags');
               B.do (x, 'change', ['State', 'query', 'tags']);
               B.do (x, 'rem', 'State', 'autotag');
               B.do (x, 'rem', 'State', 'action');
            });
         }],
         ['rotate', 'pics', function (x) {
            var pics = dale.keys (B.get ('State', 'selected'));
            if (pics.length === 0) return;
            B.do (x, 'notify', 'yellow', 'Rotating, please wait...', true);
            var rotateOne = function () {
               H.authajax (x, 'post', 'rotate', {}, {deg: B.get ('State', 'rotate'), id: pics.shift ()}, function (error, data) {
                  if (error) return B.do (x, 'notify', 'red', 'There was an error rotating the picture(s).');
                  B.do (x, 'retrieve', 'pics');
                  if (pics.length > 0) return rotateOne ();
                  B.do (x, 'rem', 'State', 'action');
                  B.do (x, 'notify', 'green', 'The pictures were successfully rotated.');
               });
            }
            rotateOne ();
         }],
         ['selectall', [], function (x) {
            H.authajax (x, 'post', 'query', {}, {tags: B.get ('State', 'query', 'tags'), from: 1, to: 1024 * 1024 * 1024}, function (error, rs) {
               if (error) return B.do (x, 'notify', 'red', 'There was an error selecting all pictures.');
               B.do (x, 'set', ['State', 'selected'], dale.do (rs.body.pics, function (pic) {
                  return [pic.id, true];
               }));
            });
         }],
      ];

      return B.view (x, ['Data', 'tags'], {listen: routes, ondraw: function (x) {
         if (! B.get ('Data', 'tags')) B.do (x, 'retrieve', 'tags');
      }, onforget: function (x) {
         B.do (x, 'rem', 'State', 'query', 'tags');
         B.do (x, 'rem', 'Data', 'tags');
      }}, function (x, tags) {
         return B.view (x, ['Data', 'pics'], function (x, pics) {
            var pics = dale.keys (B.get ('State', 'selected'));
            if (pics.length === 0) return;
            var picn = pics.length === 1 ? 'picture' : 'pictures';
            return [
               ['h3', 'Manage pics'],
               ['h4', [
                  [pics.length, ' ', picn, ' selected - '],
                  ['span', B.ev ({class: 'action'}, ['onclick', 'set', ['State', 'selected'], {}]), 'Unselect all']
               ]],
               ['hr'],
               B.view (x, ['State', 'action'], function (x, action) {
                  if (! action) return [
                     ['br'],
                     ['button', B.ev ({type: 'submit', class: 'pure-button pure-button-primary'}, ['onclick', 'set', ['State', 'action'], 'tag']), 'Tag ' + picn],
                     ['br'], ['br'],
                     ['button', B.ev ({type: 'submit', class: 'pure-button pure-button-primary', style: 'background: rgb(223, 117, 20);'}, ['onclick', 'set', ['State', 'action'], 'untag']), 'Untag ' + picn],
                     ['br'], ['br'],
                     ['button', B.ev ({type: 'submit', class: 'pure-button pure-button-primary', style: 'background: rgb(123, 217, 20);'}, [
                        ['onclick', 'set', ['State', 'action'], 'rotate'],
                        ['onclick', 'set', ['State', 'rotate'], 90],
                     ]), 'Rotate ' + picn],
                     ['br'], ['br'],
                     ['button', B.ev ({type: 'submit', class: 'pure-button pure-button-primary', style: 'background: rgb(202, 60, 60);'}, ['onclick', 'delete', 'pics']), 'Delete ' + picn + ' permanently'],
                  ];

                  if (action === 'untag') {

                     var tags = {};
                     dale.do (pics, function (pic) {
                        dale.do (pic.tags, function (tag) {
                           tags [tag] = tags [tag] ? tags [tag] + 1 : 1;
                        });
                        return pic;
                     });

                     return [
                        dale.keys (tags).length === 0 ?
                           ['p', 'None of the selected pictures have tags.'] :
                           dale.do (tags, function (card, tag) {
                              return ['p', [tag + ':', ['span', B.ev ({class: 'action'}, ['onclick', 'tag', 'pics', tag, true]), ' Untag ' + card + (card === 1 ? ' picture' : ' pictures')]]];
                           }),
                        ['button', B.ev ({type: 'submit', class: 'pure-button'}, ['onclick', 'rem', 'State', 'action']), 'Cancel']
                     ];
                  }

                  if (action === 'tag') return B.view (x, ['State', 'autotag'], {listen: [
                     ['trigger', 'tag', function (x, ev) {
                        if (ev.keyCode === 13) B.do (x, 'tag', 'pics', B.get ('State', 'autotag'));
                     }],
                  ]}, function (x, autotag) {
                     var matches = ! autotag ? [] : dale.fil (B.get ('Data', 'tags'), undefined, function (card, tag) {
                        if (BASETAGS.indexOf (tag) === -1 && tag.match (autotag)) return [tag, card];
                     });
                     return [
                        ['input', B.ev ({class: 'autocomplete', placeholder: 'tag ' + picn, value: autotag}, [
                           ['oninput', 'set', ['State', 'autotag']],
                           ['onkeydown', 'trigger', 'tag', {rawArgs: 'event'}]
                        ])],
                        H.if (matches.length > 0, ['ul', {class: 'autocomplete'}, dale.do (matches, function (match) {
                           return ['li', B.ev ([
                              ['onclick', 'tag', 'pics', match [0]]
                           ]), match [0] + ' (' + match [1] + ' pics)']
                        })]),
                        ['br'], ['br'],
                        ['button', B.ev ({type: 'submit', class: 'pure-button pure-button-primary'}, ['onclick', 'tag', 'pics', true]), 'Tag ' + picn],
                        ['button', B.ev ({type: 'submit', class: 'pure-button'}, ['onclick', 'rem', 'State', 'action']), 'Cancel']
                     ];
                  });

                  if (action === 'rotate') {
                     var firstSelected = dale.stopNot (pics, undefined, function (pic) {
                        if (B.get ('State', 'selected', pic.id)) return pic;
                     });
                     return B.view (x, ['State', 'rotate'], function (x, rotate) {return [
                        ['span', B.ev ({class: rotate === -90 ? 'bold' : 'action'}, ['onclick', 'set', ['State', 'rotate'], -90]), 'Rotate left'],
                        ' / ',
                        ['span', B.ev ({class: rotate === 90  ? 'bold' : 'action'}, ['onclick', 'set', ['State', 'rotate'],  90]), 'Rotate right'],
                        ' / ',
                        ['span', B.ev ({class: rotate === 180 ? 'bold' : 'action'}, ['onclick', 'set', ['State', 'rotate'], 180]), 'Invert'],
                        ['br'], ['br'], ['br'], ['br'],
                        ['style', [
                           ['span.bold', {'font-weight': 'bold'}],
                           ['img.rotate', {
                              'transform, -ms-transform, -webkit-transform, -moz-transform': 'rotate(' + (rotate || 0) + 'deg)',
                              'max-height, max-width': 130
                           }]
                        ]],
                        ['div', {style: 'height: 200px, width: 200px'}, ['img', {class: 'rotate pure-img', src: H.picPath (firstSelected)}]],
                        ['br'], ['br'], ['br'], ['br'],
                        ['button', B.ev ({class: 'pure-button pure-button-primary'}, ['onclick', 'rotate', 'pics']), 'Rotate'],
                        ['button', B.ev ({type: 'submit', class: 'pure-button'}, ['onclick', 'rem', 'State', 'action']), 'Cancel']
                     ]});
                  }
               }),
            ];
         });
      });
   }

   // *** UPLOAD VIEW ***

   Views.upload = function (x) {
      var routes = [
         ['upload', 'pics', function (x) {

            var pics = c ('form input') [0]

            if (pics.files.length === 0) return B.do (x, 'notify', 'yellow', 'Please select one or more pics.');

            dale.do (pics.files, function (file, k) {
               if (ALLOWEDMIME.indexOf (file.type) !== -1) {
                  B.do (x, 'add', ['State', 'upload', 'queue'], file);
               }
               else B.do (x, 'add', ['State', 'upload', 'invalid'], file.name);
            });
            c ('#upload').value = '';
         }],
         ['retry', 'upload', function (x) {
            var files = B.get ('State', 'upload', 'error');
            B.do (x, 'set', ['State', 'upload', 'error'], []);
            dale.do (files, function (file) {
               file = file [1];
               file.uploading = false;
               B.do (x, 'add', ['State', 'upload', 'queue'], file);
            });
         }],
         ['cancel', 'upload', function (x) {
            if (! confirm ('Are you sure you want to cancel the upload?')) return;
            B.do (x, 'set', ['State', 'upload', 'queue'], []);
         }],
      ];

      return [
         ['style', [
            ['table.smallprint', {'font-size': 0.7}],
            ['div.progress-out', {
               border: 'solid 2px #eeeeee',
               'border-radius': 3,
               width: 0.5,
            }],
            ['div.progress-in', {
               'border-radius': 3,
               'background-color': '#4CAF50',
               padding: 5
            }, ['p', {
               color: 'white',
               margin: 0,
               'margin-left': 0.45
            }]]
         ]],
         ['a', {href: '#', class: 'logout', onclick: 'H.logout ({ev: \'logoutclick\'})'}, 'Logout'],
         ['br'], ['br'], ['br'],
         ['a', {class: 'buttonlink', href: '#/main/browse'}, ['button', {type: 'submit', class: 'pure-button pure-button-primary'}, 'Back to main view']],
         B.view (x, ['State', 'upload'], {listen: routes}, function (x, upload) {return [
            ['form', {onsubmit: 'event.preventDefault ()', class: 'pure-form pure-form-aligned'}, [
               ['br'], ['br'],
               ['fieldset', [
                  B.view (x, ['State', 'uploadFolder'], function (x, uploadFolder) {
                     if (uploadFolder) return [
                        ['h3', ['Upload a folder (or ', ['span', B.ev ({class: 'action'}, ['onclick', 'set', ['State', 'uploadFolder'], false]), 'individual pictures'], ')']],
                        ['input', {id: 'upload', type: 'file', name: 'pics', directory: true, webkitdirectory: true, mozdirectory: true}]
                     ];
                     else return [
                        ['h3', ['Upload one or more pictures (or ', ['span', B.ev ({class: 'action'}, ['onclick', 'set', ['State', 'uploadFolder'], true]), ' an entire folder'], ')']],
                        ['input', {id: 'upload', type: 'file', name: 'pics', multiple: true}],
                     ];
                  }),
                  ['button', B.ev ({type: 'submit', class: 'pure-button pure-button-primary'}, ['onclick', 'upload', 'pics']), 'Upload'],
                  ['br'], ['br'],
                  ['h3', 'Add a tag to the uploaded pictures'],
                  ['input', B.ev ({placeholder: 'tags'}, ['onchange', 'set', ['State', 'upload', 'tags']])],
                  ['br'], ['br'],
                  ['button', B.ev ({type: 'submit', class: 'pure-button'}, ['onclick', 'cancel', 'upload']), 'Cancel upload'],
               ]]
            ]],
            ! upload ? [] : (function () {
               upload.queue = upload.queue || [];
               upload.done  = upload.done  || 0;
               upload.error = upload.error || [];
               upload.invalid = upload.invalid || [];
               var perc = Math.round (upload.done / (upload.queue.length + upload.done) * 100);
               if (perc === 0) perc = 2;
               perc += '%';
               return ['div', {class: 'pure-g'}, [
                  ['div', {class: 'pure-u-5-5'}, [
                     ['br'], ['br'],
                     H.if (upload.queue.length === 0 && upload.done > 0, ['h4', ['Uploaded ', upload.done, ' pictures']]),
                     H.if (upload.queue.length > 0, ['h4', ['Uploading ', upload.queue.length, ' pictures']]),
                     H.if (upload.queue.length > 0 || upload.done > 0, ['div', {class: 'progress-out'}, ['div', {class: 'progress-in', style: 'width: ' + perc}, ['p', perc]]]),
                     H.if (upload.queue.length > 0, ['h4', ['While you wait, you can', ['span', B.ev ({class: 'action'}, ['onclick', 'set', ['State', 'subview'], 'browse']), ' start tagging your pictures!']]]),
                     H.if (upload.error.length > 0, ['div', {class: 'pure-u-5-5'}, [
                        ['p', ['There was an error uploading ' + upload.error.length + ' pictures. ', ['span', B.ev ({class: 'action'}, ['onclick', 'retry', 'upload']), 'Retry']]],
                     ]]),
                     H.if (upload.done > 0, ['p', ['Uploaded ' + upload.done + ' pictures successfully.']]),
                     H.if (upload.repeated > 0, ['p', [upload.repeated + ' pictures were already uploaded before.']]),
                     H.if (upload.invalid && upload.invalid.length > 0, ['p', [upload.invalid.length + ' pictures were of an invalid format.']]),
                  ]],
               ]];
            }) (),
         ]}),
      ];
   }

   // *** PICS VIEW ***

   Views.pics = function (x, path) {return [
      ['style', [
         ['div.selected', {
            'background-color': 'blue'
         }],
         ['img.pure-img', {
            cursor: 'pointer',
            'background-color': '#ddd',
            'border-radius': 8,
            'max-height, max-width': 0.95,
            'width, height, margin': 'auto',
            position: 'absolute',
            'top, bottom, left, right': 3
         }],
         ['img.selected', {
            'box-shadow': 'inset 0 0 0 1000px rgba(255,0,0,0.5)',
            opacity: '0.5'
         }],
         ['div.imgcont', {
            position: 'relative',
            display: 'inline-block',
            width: 180,
            height: 135,
            'vertical-align': 'middle',
            'text-align': 'middle',
            'border-radius': 12,
            'background-color': '#222222',
            'margin-right, margin-bottom': 3
         }],
         ['div.imgtext', {
            opacity: 0,
            width: 0.97,
            height: 25,
            padding: 5,
            background: 'rgba(0,0,0,.8)',
            color: 'white',
            position: 'absolute',
            'bottom, left': 3,
            'vertical-align': 'bottom',
            'font-size': 0.7,
            transition: 'opacity',
         }],
         ['div.left', {float: 'left'}],
         ['div.right', {float: 'right'}],
         ['div.imgcont:hover div.imgtext', {
            'transition-delay': '0.4s',
            opacity: '1',
            '-webkit-box-sizing, -moz-box-sizing, box-sizing': 'border-box'
         }],
      ]],
      B.view (x, path, {listen: [
         ['click', 'pic', function (x, id, k) {
            console.log ('click pic', id, k);
            var last = B.get ('State', 'lastclick') || {time: 0};
            if (last.id === id && Date.now () - B.get ('State', 'lastclick').time < 500) {
               B.do (x, 'rem', ['State', 'selected'], id);
               return B.do (x, 'set', ['State', 'canvas'], pic);
            }
            var lastIndex = dale.stopNot (B.get ('Data', 'pics'), undefined, function (pic, k) {
               if (id === last.id) return k;
            });
            // XXX fix selection with shift
            if (! B.get ('State', 'shift') || B.get ('State', 'ctrl') || last.id === id || ! B.get ('State', 'selected', B.get ('Data', 'pics', lastIndex, 'id'))) {
               B.do (x, 'set', ['State', 'lastclick'], {id: id, time: Date.now ()});
               if (B.get ('State', 'selected', id)) return B.do (x, 'rem', ['State', 'selected'], id);
               else                                     return B.do (x, 'set', ['State', 'selected', id], true);
            }
            dale.do (dale.times (Math.max (lastIndex, k) - Math.min (lastIndex, k) + 1, Math.min (lastIndex, k)), function (k) {
               B.set (['State', 'selected', B.get ('Data', 'pics', k, 'id')], true);
            });
            B.do (x, 'change', ['State', 'selected']);
            B.do (x, 'set', ['State', 'lastclick'], {id: id, time: Date.now ()});
         }],
         ['document', 'scroll', function (x, e) {
            var prev = B.get ('State', 'lastscroll');
            if (prev && (Date.now () - prev.time < 100)) return;
            B.do ({from: {ev: 'scroll'}}, 'set', ['State', 'lastscroll'], {time: Date.now (), y: window.scrollY});
            if (prev && prev.y > window.scrollY) return;

            var pics = B.get ('Data', 'pics');
            if (! pics) return;

            lasty = window.innerHeight;
            lasti = c ('img.pic') [B.get ('Data', 'pics').length - 1];
            if (! lasti) return;
            lasti = lasti.getBoundingClientRect ().top;

            if (lasty < lasti) return;
            B.do ({from: {ev: 'scroll'}}, 'retrieve', 'pics');
         }],
      ], attrs: {class: 'piclist'}}, function (x, pics) {
         if (! pics || pics.length === 0) return;
         // first row starts all with top 0, left as previous end + 24. Know when to end the row because of lack of space (width, without 24)
         // next row, throughout its width check previous row pictures bottom offset (the max one). Add 25, that's your top offset. For right it is simply 25 + the previous in the row, or nothing if first in row.
         var positions = [[]], width = c ('.piclist') [0].getBoundingClientRect ().width;

         return [
            ['style', [
               ['div.piclist', {
                  width: 1,
                  position: 'relative',
                  display: 'inline-block',
               }],
               ['img.pic', {
                  float: 'left',
                  //'margin-right, margin-bottom': 24,
                  'border-radius': 12,
                  'max-width, max-height': 185,
                  position: 'absolute',
               }],
            ]],

            dale.do (pics, function (pic, k) {

               var date = new Date (pic.date - new Date ().getTimezoneOffset () * 60 * 1000);

               date = date.getDate () + '/' + (date.getMonth () + 1) + '/' + date.getFullYear ();

               var ratio = pic.dimw / pic.dimh, picw, pich;
               if (ratio >= 1) {
                  picw = Math.round (Math.min (185, pic.dimw));
                  pich = Math.round (pic.dimh * picw / pic.dimw);
               }
               else {
                  pich = Math.round (Math.min (185, pic.dimh));
                  picw = Math.round (pic.dimw * pich / pic.dimh);
               }

               var pushrow = function () {

                  // If this is not the first row:
                  if (positions.length > 1) {
                     var OVERLAP = 0;
                     var maxyprev = Math.max.apply (null, dale.do (H.last (positions, 2), function (p) {return p [1]}));
                     var recalculate = function () {
                        var miny = Infinity, maxy = 0;
                        // Each of positions contains one array per picture in the row
                        // Each of these arrays is of the form [maxx, maxy, picw, pich, pic], where max? is the maximum horizontal/vertical extent of the picture (including the 24 px margin)
                        dale.do (H.last (positions), function (p) {
                           // If the beginning of the
                           if ((p [1] - p [3] - 24) < miny) miny = p [1] - p [3] - 24;
                           if (p [1] > maxy) maxy = p [1];
                        });
                        if (maxyprev > miny + (maxy - miny) * OVERLAP) {
                           var adjustment = Math.round (maxyprev - (miny + (maxy - miny) * OVERLAP)) + 1;
                           dale.do (H.last (positions), function (p) {
                              if ((p [1] - p [3] - 24) === miny) p [1] += adjustment;
                           });
                           recalculate ();
                        }
                     }
                     recalculate ();
                  }

               }

               // If first item on row, start at the left.
               if (H.last (positions).length === 0) x = 0;
               // If there's enough room, put it on the same row.
               else if (width >= H.last (H.last (positions)) [0] + picw + 24) x = H.last (H.last (positions)) [0];
               else {
                  // If there's not enough room, push the existing row and create a new one. Start at the left.
                  pushrow ();
                  positions.push ([]);
                  x = 0;
               }

               var y = (function () {
                  // If first row, position the image at the top.
                  if (positions.length === 1) return 0;

                  // From the previous row, we build a list of images that overlap in their width with the current one.
                  var upstairs = dale.fil (H.last (positions, 2), undefined, function (lastrowpic) {
                     // XXX 23 or 24?
                     if (x > lastrowpic [0] || (x + picw + 24) < (lastrowpic [0] - lastrowpic [2] - 23)) return;
                     return lastrowpic [1];
                  });

                  if (upstairs.length === 0) {
                     var lpicrow = H.last (H.last (positions));
                     return lpicrow [1] - lpicrow [3] - 24;
                  }

                  return Math.max.apply (null, upstairs);
               }) ();

               H.last (positions).push ([x + picw + 24, y + pich + 24, picw, pich, pic, k]);

               if (k === pics.length - 1) pushrow ();
            }),
            (function () {
               return dale.do (positions, function (v) {
                  return dale.do (v, function (p) {
                     return B.view (['State', 'selected'], function (x, selected) {
                        return ['img', B.ev ({
                           class: 'pic ' + (selected [p [4].id] ? ' selected' : ''),
                           src: H.picPath (p [4]),
                           style: 'left: ' + (p [0] - p [2] - 24) + 'px; top: ' + (p [1] - p [3] - 24) + 'px'
                        }, ['onclick', 'click', 'pic', p [4].id, p [5]])];
                     });
                  });
               });
            }) (),
         ];
         /*
            return ['div', B.ev ({class: 'imgcont'}, ['onclick', 'click', 'pic', pic, k]), [
               ['img', {class: 'pure-img' + (pic.selected ? ' selected' : ''), style: 'padding: 2px; float: left', src: H.picPath (pic)}],
               ['div', {class: 'imgtext'}, [
                  ['div', {class: 'left'}, [['i', {class: 'ion-pricetag'}], ' ' + pic.tags.length]],
                  ['div', {class: 'right'}, ['span', date]]
               ]],
               (k + 1) % 3 === 0 ? ['p', {style: 'clear: both; margin: 0px;'}] : []
            ]];
            */
      }),
   ]}

   // *** CANVAS VIEW ***

   Views.canvas = function (x) {
      return B.view (x, ['State', 'canvas'], {listen: [
         ['canvas', '*', function (x) {
            var action = x.path [0], pics = B.get ('Data', 'pics');
            var index = dale.stopNot (pics, undefined, function (pic, k) {
               if (pic.id === B.get ('State', 'canvas', 'id')) return k;
            });
            if (action === 'prev' && index === 0) return B.do (x, 'set', ['State', 'canvas'], H.last (pics));
            if (action === 'next' && index >= pics.length - 3) B.do (x, 'retrieve', 'pics');
            B.do (x, 'set', ['State', 'canvas'], B.get ('Data', 'pics', index + (action === 'prev' ? -1 : 1)));
            if (action === 'next') B.do (x, 'set', ['State', 'nextCanvas'], B.get ('Data', 'pics', index + 2));
         }]
      ], ondraw: function (x) {
         if (B.get ('State', 'canvas')) H.fullScreen (x);
         else                           H.fullScreen (x, true);
      }}, function (x, pic) {
         if (! pic) return;
         return B.view (x, ['State', 'screen'], function (x, screen) {
            if (! screen) return;
            return [
               ['style', [
                  ['body', {overflow: 'hidden'}],
                  ['div.canvas', {
                     position: 'fixed',
                     'top, left': 0,
                     'height, width, min-height, min-width, max-height, max-width': 1,
                     'background': 'rgba(50,50,50,0.9)',
                     'z-index': '1',
                  }, [
                     ['div.inner1', {
                        'width, min-width, max-width': 0.92,
                        'height, min-height, max-height': 0.86,
                        'margin-left': 0.04,
                        'margin-top': 0.02,
                        'padding-top': 0.02,
                        'background-color': 'black'
                     }],
                     ['div.inner2', {
                        'width, min-width, max-width': 0.98,
                        'height, min-height, max-height': 0.98,
                        'margin-left': 0.01,
                        'background-position': 'center !important',
                        'background-size': 'contain !important',
                        'background-repeat': 'no-repeat !important'
                     }],
                     ['div.inner3', {
                        '-webkit-background-size, -moz-background-size, -o-background-size, background-size': 'cover !important',
                     }],
                     ['div.info', {
                        'padding-top': 5,
                        height: 0.08,
                        'text-align': 'center',
                        color: 'white',
                        'background-color': '#444444',
                     }, ['ul', {
                        margin: 'auto',
                        width: 0.5
                     }]],
                     ['img', {
                        'max-width, max-height': 0.9,
                        'z-index': '2',
                     }],
                     ['.icon', {
                        'font-size': '1.8em',
                        color: 'white',
                     }],
                     ['.ion-close', {
                        right: 15,
                        top: 10,
                     }],
                     ['.ion-chevron-left', {
                        left: 10,
                        top: Math.round (0.5 * screen.h),
                        'font-size': '40px',
                     }],
                     ['.ion-chevron-right', {
                        right: 15,
                        top: Math.round (0.5 * screen.h),
                        'font-size': '40px',
                     }],
                     ['.ion-information-circled', {
                        'font-size': '40px',
                     }],
                  ]]
               ]],
               ['div', {class: 'canvas'}, [
                  (function () {
                     var sidemargin = 40, topmargin = 0;
                     var screenw = screen.w - sidemargin * 2, screenh = screen.h - topmargin * 2, picw = pic.dimw, pich = pic.dimh;
                     if (Math.max (picw, pich, 900) === 900) var thuw = picw, thuh = pich;
                     else var thuw = picw * 900 / Math.max (picw, pich), thuh = pich * 900 / Math.max (picw, pich);

                     var wratio = screenw / thuw, hratio = screenh / thuh;
                     // Respect aspect ratio; at most duplicate picture.
                     var ratio = Math.min (wratio, hratio, 2);
                     var style = 'width: ' + (ratio * thuw) + 'px; height: ' + (ratio * thuh) + 'px; ';
                     var left = (screenw - (ratio * thuw)) / 2, top = (screenh - (ratio * thuh)) / 2;
                     style += 'margin-left: ' + (left + sidemargin) + 'px; margin-top: ' + (top + topmargin) + 'px; ';
                     return [
                        ['div', {class: 'inner3', style: style + 'background: url(' + H.picPath (pic, 900) + ')'}],
                        ['i', B.ev ({class: 'icon ion-information-circled', style: 'bottom: ' + (10 + topmargin / 2 + (screenh - (ratio * thuh)) / 2) + 'px; left: ' + (25 + sidemargin / 2 + (screenw - (ratio * thuw)) / 2) + 'px;'},  ['onclick', 'set', ['State', 'showPictureInfo'], true])],
                        B.view (x, ['State', 'showPictureInfo'], function (x, show) {
                           if (! show) return;
                           return ['div', {class: 'info pure-u-24-24'}, [
                              ['ul', {class: 'search'}, [
                                 (function () {
                                    var date = new Date (pic.date - new Date ().getTimezoneOffset () * 60 * 1000);
                                    date = {0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat'} [date.getDay ()] + ' ' + date.getDate () + ' ' + {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'} [(date.getMonth () + 1)] + ' ' + date.getFullYear ();
                                    return ['li', {style: 'border: 0; font-weight: bold;'}, date];
                                 }) (),
                                 dale.do (pic.tags, function (tag) {
                                    return ['li', tag];
                                 }),
                                 ['p', pic.name],
                                 ['i', B.ev ({class: 'icon ion-information-circled', style: 'bottom: ' + (10 + topmargin / 2 + (screenh - (ratio * thuh)) / 2) + 'px; left: ' + (25 + sidemargin / 2 + (screenw - (ratio * thuw)) / 2) + 'px;'},  ['onclick', 'set', ['State', 'showPictureInfo'], false])],
                              ]]
                           ]];
                        }),
                     ];
                  }) (),
                  ['i', B.ev ({class: 'icon ion-close'}, ['onclick', 'set', ['State', 'canvas'], undefined])],
                  ['i', B.ev ({class: 'icon ion-chevron-left'},  ['onclick', 'canvas', 'prev'])],
                  ['i', B.ev ({class: 'icon ion-chevron-right'}, ['onclick', 'canvas', 'next'])],
                  B.view (x, ['State', 'nextCanvas'], function (x, next) {
                     if (next) return ['img', {style: 'width: 1px; height: 1px;', src: H.picPath (next, 900)}];
                  }),
               ]]
            ];
         });
      });
   }

}) ();
