// *** SETUP ***

var dale = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
var type = teishi.type, clog = teishi.clog, media = lith.css.media, style = lith.css.style;

window.addEventListener ('keydown', function (ev) {
   var code = (ev || document.event).keyCode;
   if (code !== 75) return;
   ev.preventDefault ();
   var query = prompt ('Search the eventlog');
   if (query === null && c ('#eventlog')) return c ('#eventlog').parentNode.removeChild (c ('#eventlog'));
   B.eventlog (query);
});

// *** CSS ***

var CSS = {
   toRGBA: function (hex) {
      hex = hex.slice (1);
      return parseInt (hex.slice (0, 2), 16) + ', ' + parseInt (hex.slice (2, 4), 16) + ', ' + parseInt (hex.slice (4, 6), 16);
   },
   // *** variables.scss ***
   vars: {
      tagColors: ['green', 'blue', 'yellow', 'orange', 'coral', 'indigo'],
      // Layout sizes
      'sidebar-width': 300,
      // Colors
      'color--one': '#5b6eff',
      'color--attach': '#87D7AB',
      'color--remove': '#FC201F',
      'highlight--neutral': '#d8eeff',
      'highlight--selection': '#ffeccc',
      'highlight--positive': '#cfefdd',
      'highlight--negative': '#ffd3d3',
      // Greys
      'grey--darkest': '#3a3a3a',
      'grey--darker': '#484848',
      'grey': '#8b8b8b',
      'grey--light': '#dedede',
      'grey--lighter': '#f2f2f2',
      'grey--lightest': '#fbfbfb',
      // typefaces
      fontPrimarySemiBold: {
         'font-family': '\'Montserrat\'',
         'font-weight': '600',
         'font-style': 'normal',
      },
      fontPrimarySemiBoldItalic: {
         'font-family': '\'Montserrat\'',
         'font-weight': '600',
         'font-style': 'italic',
      },
      fontPrimaryMedium: {
         'font-family': '\'Montserrat\'',
         'font-weight': '500',
         'font-style': 'normal',
      },
      fontPrimaryMediumItalic: {
         'font-family': '\'Montserrat\'',
         'font-weight': '500',
         'font-style': 'italic',
      },
      fontPrimaryRegular: {
         'font-family': '\'Montserrat\'',
         'font-weight': '400',
         'font-style': 'normal',
      },
      fontPrimaryItalic: {
         'font-family': '\'Montserrat\'',
         'font-weight': '400',
         'font-style': 'italic',
      },
      // border radius
      'border-radius--s': 3,
      'border-radius--m': 6,
      'border-radius--l': 12,
      // padding
      'padding--xs': 6,
      'padding--s': 10,
      'padding--m': 22,
      'padding--l': 34,
      'padding--xl': 50,
      'padding--xxl': 74,
      // transition easings
      easeOutQuad:  'all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      easeInQuad:   'all 400ms cubic-bezier(0.55, 0.085, 0.68, 0.53)',
      easeOutQuart: 'all 400ms cubic-bezier(0.165, 0.84, 0.44, 1)',
      easeInQuart:  'all 400ms cubic-bezier(0.895, 0.03, 0.685, 0.22)',
   },
   // *** typography_setup.scss ***
   typography: {
      typeBase: 13,
      typeRatio: 1.125,
      typeLineHeight: 1.5,
      fontSize: function (number, ratio) {
         return (Math.round (Math.pow (ratio || CSS.typography.typeRatio, number) * 100000) / 100000) + 'rem';
      },
      spaceVer: function (number, lineHeight) {
         return (Math.round (number * (lineHeight || CSS.typography.typeLineHeight) * 100000) / 100000) + 'rem';
      },
   },
};

CSS.litc = [
   // *** reset.scss ***
   ['html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video', {
      'margin, padding, border': 0,
      'font-size': 1,
      font: 'inherit',
      'vertical-align': 'baseline',
   }],
   ['article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section', {display: 'block'}],
   ['body', {'line-height': '1'}],
   ['ol, ul', {'list-style': 'none'}],
   ['blockquote, q', {quotes: 'none'}],
   ['LITERAL', 'blockquote:before, blockquote:after, q:before, q:after {content: \'\'; content: none}'],
   ['table', {'border-collapse': 'collapse', 'border-spacing': 0}],
   // *** typography.scss ***
   ['*', {'-webkit-font-smoothing': 'antialiased', '-moz-osx-font-smoothing': 'grayscale'}],
   ['html', {'font-size': CSS.typography.typeBase}],
   ['html, body', {'line-height': CSS.typography.spaceVer (1), mixin1: CSS.vars.fontPrimaryRegular}],
   ['p, a, li',   {'line-height': CSS.typography.spaceVer (1), mixin1: CSS.vars.fontPrimaryRegular}],
   // Global typographic styles
   ['.page-title', {
      'font-size':   CSS.typography.fontSize (7),
      'line-height': CSS.typography.spaceVer (1.75),
      'margin-bottom': CSS.typography.spaceVer (0.25),
      mixin1: CSS.vars.fontPrimaryRegular,
   }],
   ['.page-subtitle', {
      'font-size':   CSS.typography.fontSize (1),
      mixin1: CSS.vars.fontPrimaryItalic,
      color: CSS.vars.grey,
   }],
   // *** main-styles.scss ***
   ['a, .pointer', {cursor: 'pointer'}],
   ['a', {'text-decoration': 'none'}],
   ['*', {'box-sizing': 'border-box'}], // Makes padding included in width
   ['input:focus, textarea:focus', {outline: 'none'}],
   ['body', {'width, height': 1}],
   media ('screen and (max-width: 767px)', [
      ['.hide-on-mobile', {display: 'none'}],
   ]),
   // *** colors.scss ***
   ['body', {'background-color': '#fff', color: CSS.vars ['grey--darker']}],
   ['p > a', {color: CSS.vars ['color--one']}],
   // *** buttons.scss ***
   ['.button', {
      outline: 0,
      'border-radius': 100,
      mixin1: CSS.vars.fontPrimaryMedium,
      'line-height': 40,
      height: 42,
      display: 'inline-flex',
      'align-items': 'center',
      'padding-left, padding-right': CSS.vars ['padding--m'],
      'text-align': 'center',
      transition: CSS.vars.easeOutQuart,
   }],
   ['.button--one', {
      border: '1px solid ' + CSS.vars ['color--one'],
      'background-color': CSS.vars ['color--one'],
      color: '#fff',
   }],
   media ('screen and (min-width: 1025px)', ['.button--one:hover', {
      'background-color': '#fff',
      color: CSS.vars ['color--one'],
   }]),
   ['.button--two', {
      border: '1px solid ' + CSS.vars.grey,
      'background-color': '#fff',
      color: CSS.vars.grey,
   }],
   media ('screen and (min-width: 1025px)', ['.button--two:hover', {
      background: CSS.vars.grey,
      color: '#fff',
   }]),
   // Buttons icon
   ['.button__icon', {
      display: 'inline-block',
      'width, height': 24,
      'margin-left': -4,
   }],
   ['.button--one .button__icon', ['path', {fill: '#fff'}]],
   media ('screen and (min-width: 1025px)', ['.button--one:hover .button__icon', ['path', {fill: CSS.vars ['color--one']}]]),
   ['.button--two .button__icon', ['path', {fill: CSS.vars.grey}]],
   media ('screen and (min-width: 1025px)', ['.button--two:hover .button__icon', ['path', {fill: '#fff'}]]),
   // *** structure.scss ***
   ['.max-width--m', {'max-width': 670, width: 1}],
   // *** forms.scss ***
   ['input', {
      border: 0,
      'font-size': CSS.typography.fontSize (1),
      width: 1,
   }],
   ['input.search-input', {'padding-left': CSS.vars ['padding--m'], 'padding-right': CSS.vars ['padding--l']}],
   ['input.search-input::placeholder', {mixin1: CSS.vars.fontPrimaryItalic}],
   ['input.attach-input', {
      'line-height, height': 46,
      border: '1px solid ' + CSS.vars ['border-color--dark'],
      'border-radius': 100,
      'padding-left': 15,
      'padding-right': 10,
   }],

   // *** ADMIN SPECIFIC STYLES ***
   ['body', {
      mixin1: CSS.vars.fontPrimaryRegular,
      'font-size': CSS.typography.fontSize (1),
   }],
   ['.action', {
      color: 'blue',
      cursor: 'pointer',
      'font-weight': 'bold',
   }],
   ['th', {
      'font-weight': 'bold',
   }],
];

// *** HELPERS ***

var H = {};

H.matchVerb = function (ev, responder) {
   return B.r.compare (ev.verb, responder.verb);
}

// *** VIEWS ***

var views = {};

// *** NATIVE RESPONDERS ***

window.onerror = function () {
   B.call.apply (null, ['error', []].concat (dale.go (arguments, function (v) {return v})));
}

window.addEventListener ('hashchange', function () {
   B.call ('read', 'hash');
});

// *** RESPONDERS ***

B.r.addLog = function (log) {
   if (log.args && log.args [1] && log.args [1].password) log.args [1].password = 'REDACTED';
   B.log.push (log);
}

B.mrespond ([

   // *** GENERAL RESPONDERS ***

   ['initialize', [], {burn: true}, function (x) {
      document.querySelector ('meta[name="viewport"]').content = 'width=1200';
      B.call (x, 'reset',    'store');
      B.call (x, 'retrieve', 'csrf');
      B.mount ('body', views.base);
   }],
   ['reset', 'store', function (x, logout) {
      if (logout) {
         B.log = B.r.log = [];
         B.call (x, 'set', 'lastLogout', Date.now ());
      }
      var redirect = B.get ('State', 'redirect');
      B.call (x, 'set', 'State', redirect ? {redirect: redirect} : {});
      B.call (x, 'set', 'Data',  {});
      window.State = B.get ('State'), window.Data = B.get ('Data');
   }],
   ['clear', 'snackbar', function (x) {
      var existing = B.get ('State', 'snackbar');
      if (! existing) return;
      if (existing.timeout) clearTimeout (existing.timeout);
      B.call (x, 'rem', 'State', 'snackbar');
   }],
   ['snackbar', [], {match: H.matchVerb}, function (x, snackbar, noTimeout) {
      B.call (x, 'clear', 'snackbar');
      var colors = {green: '#04E762', red: '#D33E43', yellow: '#ffff00'};
      if (noTimeout) return B.call (x, 'set', ['State', 'snackbar'], {color: colors [x.path [0]], message: snackbar});
      var timeout = setTimeout (function () {
         B.call (x, 'rem', 'State', 'snackbar');
      }, 4000);
      B.call (x, 'set', ['State', 'snackbar'], {color: colors [x.path [0]], message: snackbar, timeout: timeout});
   }],
   [/^get|post$/, [], {match: H.matchVerb}, function (x, headers, body, cb) {
      var t = Date.now (), path = x.path [0], noCSRF = path === 'requestInvite' || (path.match (/^auth/) && ['auth/logout', 'auth/delete', 'auth/changePassword'].indexOf (path) === -1);
      if (x.verb === 'post' && ! noCSRF) {
         if (type (body, true) === 'formdata') body.append ('csrf', B.get ('Data', 'csrf'));
         else                                  body.csrf = B.get ('Data', 'csrf');
      }
      c.ajax (x.verb, x.path [0], headers, body, function (error, rs) {
         B.call (x, 'ajax', x.verb, x.path, Date.now () - t);
         var authPath = path === 'csrf' || path.match (/^auth/);
         if (! authPath && B.get ('lastLogout') && B.get ('lastLogout') > t) return;
         if (! authPath && error && error.status === 403) {
            B.call (x, 'reset', 'store', true);
            B.call (x, 'goto', 'page', 'login');
            return B.call (x, 'snackbar', 'red', 'Your session has expired. Please login again.');
         }
         if (cb) cb (x, error, rs);
      });
   }],
   ['error', [], function (x) {
      B.call (x, 'post', 'error', {}, {log: B.r.log, error: dale.go (arguments, teishi.str).slice (1)});
   }],
   ['read', 'hash', function (x) {
      var hash = window.location.hash.replace ('#/', '').split ('/'), page = hash [0];
      B.call (x, 'goto', 'page', page);
   }],
   ['goto', 'page', function (x, page) {
      var pages = {
         logged:   ['dashboard', 'invites', 'users', 'logs', 'deploy'],
         unlogged: ['login', 'signup', 'recover', 'reset']
      }

      if (pages.logged.indexOf (page) === -1 && pages.unlogged.indexOf (page) === -1) {
         page = pages.logged [0];
      }

      var logged = B.get ('Data', 'csrf');

      if (! logged && pages.logged.indexOf (page) > -1) {
         B.call (x, 'set', ['State', 'redirect'], page);
         return B.call (x, 'goto', 'page', pages.unlogged [0]);
      }
      if (logged && pages.unlogged.indexOf (page) > -1) {
         return B.call (x, 'goto', 'page', pages.logged [0]);
      }
      if (logged && B.get ('State', 'redirect')) B.call (x, 'rem', 'State', 'redirect');

      document.title = ['ac;pic', page].join (' - ');

      if (page !== B.get ('State', 'page'))     B.call (x, 'set', ['State', 'page'], page);
      if (window.location.hash !== '#/' + page) window.location.hash = '#/' + page;
   }],

   // *** AUTH RESPONDERS ***

   ['retrieve', 'csrf', function (x) {
      B.call (x, 'get', 'csrf', {}, '', function (x, error, rs) {
         if (error && error.status !== 403) return B.call (x, 'snackbar', 'red', 'Connection or server error.');
         B.call (x, 'set', ['Data', 'csrf'], error ? false : rs.body.csrf);
         B.call (x, 'read', 'hash');
      });
   }],
   ['login', [], function (x) {
      B.call (x, 'post', 'auth/login', {}, {
         username: c ('#auth-username').value,
         password: c ('#auth-password').value,
         timezone: new Date ().getTimezoneOffset ()
      }, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'Please submit valid credentials.');
         B.call (x, 'set', ['Data', 'csrf'], rs.body.csrf);
         B.call (x, 'goto', 'page', B.get ('State', 'redirect'));
      });
   }],
   ['logout', [], function (x) {
      B.call (x, 'post', 'auth/logout', {}, {}, function (x, error) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error logging you out.');
         B.call (x, 'reset', 'store', true);
         B.call (x, 'goto', 'page', 'login');
      });
   }],

   // *** INVITE RESPONDERS ***

   ['retrieve', 'invites', function (x) {
      B.call (x, 'get', 'admin/invites', {}, '', function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error retrieving data.');
         B.call (x, 'set', ['Data', 'invites'], rs.body);
      });
   }],
   ['create', 'invite', function (x) {
      B.call (x, 'post', 'admin/invites', {}, B.get ('State', 'newInvite'), function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error creating the invite.');
         B.call (x, 'snackbar', 'green', 'Invite sent!');
         B.call (x, 'rem', 'State', 'newInvite');
         B.call (x, 'retrieve', 'invites');
      });
   }],
   ['delete', 'invite', function (x, email) {
      if (! confirm ('Are you sure you want to delete the invite?')) return;
      B.call (x, 'post', 'admin/invites/delete', {}, {email: email}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error deleting the invite.');
         B.call (x, 'snackbar', 'green', 'Invite deleted successfully.');
         B.call (x, 'retrieve', 'invites');
      });
   }],
   ['change', ['State', 'page'], {match: B.changeResponder}, function (x) {
      if (B.get ('State', 'page') === 'invites') {
         if (! B.get ('Data', 'invites')) B.call (x, 'retrieve', 'invites');
      }
      if (B.get ('State', 'page') === 'users') {
         if (! B.get ('Data', 'users')) B.call (x, 'retrieve', 'users');
      }
      if (B.get ('State', 'page') === 'logs') {
         if (! B.get ('Data', 'logs')) B.call (x, 'retrieve', 'logs');
      }
   }],

   // *** USERS RESPONDERS ***

   ['delete', 'user', function (x, username) {
      if (! confirm ('Are you sure you want to delete the user ' + username + '?')) return;
      B.call (x, 'post', 'auth/delete', {}, {username: username}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error deleting the user.');
         B.call (x, 'snackbar', 'green', 'User deleted successfully.');
         B.call (x, 'retrieve', 'users');
      });
   }],

   ['retrieve', 'users', function (x, username) {
      B.call (x, 'get', 'admin/users', {}, '', function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error retrieving users.');
         B.call (x, 'set', ['Data', 'users'], rs.body);
      });
   }],

   // *** LOGS RESPONDERS ***

   ['retrieve', 'logs', function (x, username) {
      B.call (x, 'get', 'admin/logs', {}, '', function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error retrieving logs.');
         if (rs.body.length > 5000) {
            var length = rs.body.length;
            rs.body = rs.body.slice (-5000);
            rs.body.push ({t: 0, username: (length - 5000) + ' older logs omitted'});
         }
         B.call (x, 'set', ['Data', 'logs'], rs.body);
      });
   }],


   // *** DEPLOY RESPONDERS ***

   ['deploy', 'client', function (x) {
      var input = c ('#deploy');
      if (! input.files.length) return B.call (x, 'snackbar', 'yellow', 'Please select a file.');
      var f = new FormData ();
      f.append ('file', input.files [0]);
      B.call (x, 'post', 'admin/deploy', {}, f, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', error.responseText);
         input.value = '';
         B.call (x, 'snackbar', 'green', 'Deploy OK!');
      });
   }],
]);

// *** LOGO VIEW ***

views.logo = function (size) {
   return [
      ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Kadwa'}],
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'ac;'],
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'p'],
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'i'],
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'c'],
   ];
}

// *** BASE VIEW ***

views.base = function () {
   return [
      ['style', CSS.litc],
      views.snackbar (),
      B.view ([['Data', 'csrf'], ['State', 'page']], function (csrf, page) {
         if (csrf === undefined || ! views [page]) return ['div'];
         return ['div', [
            ['style', ['.logout', {position: 'absolute', 'top, right': 40, 'font-size': CSS.typography.fontSize (3)}]],
            ['a', {href: '#', class: 'logout', onclick: B.ev ('logout', [])}, 'Logout'],
            views [page] ()
         ]];
      })
   ];
}


// *** SNACKBAR VIEW ***

views.snackbar = function () {
   return [
      ['style', [
         ['.snackbar', {
            position: 'fixed',
            bottom: 70,
            left: 0,
            'z-index': '1000',
            display: 'flex',
            'align-items, justify-content': 'center',
            width: 1,
            'min-height': 50,
            'padding-top, padding-bottom': CSS.typography.spaceVer (1),
            'padding-left, padding-right': 60, // give the close button space
            color: CSS.vars ['highlight-100'],
            transition: CSS.vars.easeOutQuad,
         }],
         media ('screen and (max-width: 767px)', ['.snackbar', {
            'justify-content': 'flex-start',
            'padding-left': CSS.vars ['padding--m'],
            'padding-right': 60,
         }]),
         ['.markup-state_snackbar-closed .snackbar', {
            opacity: '0',
            'pointer-events': 'none',
            transform: 'translateY(100%)',
         }],
         ['.markup-state_snackbar-open .snackbar', {
            opacity: '1',
            'pointer-events': 'all',
            transform: 'none',
         }],
         ['.snackbar__close', {
            position: 'absolute',
            top: 0.5,
            right: CSS.vars ['padding--s'],
            transform: 'translateY(-50%)',
         }],
         media ('screen and (max-width: 767px)', ['.snackbar__close', {right: 0}]),
         ['.snackbar__text', {
            'font-size': CSS.typography.fontSize (2),
            mixin1: CSS.vars.fontPrimaryRegular,
         }],
         ['.snackbar__text-concept', {mixin1: CSS.vars.fontPrimarySemiBold}],
      ]],
      B.view (['State', 'snackbar'], function (snackbar) {
         if (! snackbar) return ['div'];
         var bcolor = 'rgba(' + CSS.toRGBA (snackbar.color) + ', 0.9)';
         return ['div', {class: 'snackbar', style: style ({bottom: 0, 'background-color': bcolor})}, [
            ['p', {class: 'snackbar__text'}, [
               ['span', {class: 'snackbar__text-concept'}, snackbar.message],
            ]],
            ['div', {class: 'snackbar__close', onclick: B.ev ('clear', 'snackbar')}, [
               ['div', {class: 'close-button close-button--snackbar'}, [
                  ['div', {class: 'close-button__inner'}, [
                     ['span', {class: 'close-button__line'}],
                     ['span', {class: 'close-button__line'}],
                  ]],
               ]],
            ]],
         ]];
      })
   ];
}

// *** LOGIN VIEW ***

views.login = function () {
   return [
      ['style', [
         ['input', {'font-size': 24}],
         // *** enter ***
         ['.enter', {
            display: 'flex',
            'flex-direction': 'column',
            'justify-content, align-items': 'center',
            width: 1,
            'padding-top': CSS.typography.spaceVer (4),
            'padding-left, padding-right': CSS.vars ['padding--m'],
            'padding-bottom': CSS.typography.spaceVer (6),
         }],
         media ('screen and (max-width: 767px)', ['.enter', {'padding-top': CSS.typography.spaceVer (3)}]),
         ['.enter--signup', {'padding-top': CSS.typography.spaceVer (4)}],
         ['.enter__header', {'margin-bottom': CSS.typography.spaceVer (2)}],
         ['.enter__footer', {
            'margin-top': CSS.typography.spaceVer (1.5),
            'font-size': CSS.typography.fontSize (1),
            'line-height': CSS.typography.spaceVer (1),
            color: CSS.vars ['highlight-60'],
            'text-align': 'center',
         }],
         ['.enter__footer-link', {
            color: CSS.vars ['highlight-60'],
            transition: CSS.vars.easeOutQuart,
            'text-decoration': 'underline',
         }],
         media ('screen and (min-width: 1025px)', ['.enter__footer-link:hover', {color: CSS.vars ['color--one']}]),
         // *** enter-form ***
         ['.enter-form', {
            display: 'flex',
            'flex-direction': 'column',
            'justify-content': 'center',
         }],
         ['.enter-form__input', {
            'border, background': 'none',
            'border-bottom': '1px solid ' + CSS.vars ['grey--darkest'],
            'font-size': 16,
            width: 1,
            'padding-top, padding-bottom': CSS.typography.spaceVer (1),
            'padding-left, padding-right': 2,
            color: CSS.vars ['highlight-100'],
            'margin-bottom': CSS.typography.spaceVer (0.5),
         }, ['&:focus', {'border-color': CSS.vars ['highlight-60']}]],
         media ('screen and (max-width: 767px)', ['.enter-form__input', {'min-width': 0}]),
         ['.enter-form__forgot-password', {
            color: CSS.vars ['highlight-60'],
            'font-size': CSS.typography.fontSize (1),
            'text-decoration': 'underline',
            transition: CSS.vars.easeOutQuart,
            'text-align': 'center',
            'margin-top': CSS.typography.spaceVer (1.5),
            'margin-bottom': CSS.typography.spaceVer (1),
         }],
         media ('screen and (min-width: 1025px)', ['.enter-form__forgot-password:hover', {color: CSS.vars ['color--one']}]),
         // Login form - Buttons
         ['.enter-form__button', {
            display: 'flex',
            'align-items, justify-content': 'center',
            height: 48,
            'font-size': 16,
            mixin1: CSS.vars.fontPrimaryMedium,
            border: 'none',
            outline: '0',
            'background-color': 'transparent',
            width: 1,
            'border-radius': 100,
            'margin-top': CSS.typography.spaceVer (1),
            transition: CSS.vars.easeOutQuart,
         }],
         media ('screen and (max-width: 767px)', ['.enter-form__button', {'font-size': CSS.typography.fontSize (2)}]),
         ['.enter-form__button-icon', {
            display: 'inline-block',
            'height, width': 20,
            'margin-right': CSS.vars ['padding--xs'],
         }],
         ['.enter-form__button--submit', {'margin-top': CSS.typography.spaceVer (1.5)}],
         // Login form - Button 1
         ['.enter-form__button--1', {
            'background-color': CSS.vars ['color--one'],
            color: CSS.vars ['highlight-100'],
         }],
         media ('screen and (min-width: 1025px)', [
            ['.enter-form__button--1:hover',  {'background-color': CSS.vars ['color--one']}],
            ['.enter-form__button--1:active', {'background-color': CSS.vars ['color--one'], opacity: '0.8'}],
         ]),
         // Login form - Button 2
         ['.enter-form__button--2', {
            border: CSS.vars ['color--one'] + ' 1px solid',
            color: CSS.vars ['color--one'],
         }],
         media ('screen and (min-width: 1025px)', [
            ['.enter-form__button--2:hover', {
               'background-color': CSS.vars ['color--one'],
               color: CSS.vars ['highlight-100'],
            }],
            ['.enter-form__button--2:active', {
               background: CSS.vars ['color--one'],
               opacity: '0.8',
            }],
         ]),
         // *** auth-card ***
         ['.auth-card', {
            width: 1,
            'max-width': 400,
         }],
         ['.auth-card__inner', {
            display: 'flex',
            'flex-direction': 'column',
            'justify-content': 'center',
            'background-color': CSS.vars ['highlight--selection'],
            'padding-top': CSS.typography.spaceVer (3),
            'padding-bottom': CSS.typography.spaceVer (3.5),
            'padding-left, padding-right': 60,
            'border-radius': CSS.vars ['border-radius--m'],
         }],
         media ('screen and (max-width: 767px)', ['.auth-card__inner', {
            'padding-top': CSS.typography.spaceVer (2.25),
            'padding-bottom': CSS.typography.spaceVer (2.5),
            'padding-left, padding-right': CSS.vars ['padding--xl'],
         }]),
         ['.auth-card__header', {
            width: 1,
            display: 'flex',
            'flex-direction': 'column',
            'justify-content, align-items': 'center',
            'margin-bottom': CSS.typography.spaceVer (2),
         }],
         ['.auth-card__header-logo', {
            'text-align': 'center',
            'margin-bottom': CSS.typography.spaceVer (1),
            width: 200,
            height: 'auto',
         }],
         ['.auth-card__header-text', {
            'text-align': 'center',
            'font-size': CSS.typography.fontSize (3),
            'line-height': CSS.typography.spaceVer (1.5),
            color: CSS.vars ['highlight-60'],
            mixin1: CSS.vars.fontPrimaryRegular,
         }],
      ]],
      ['div', {class: 'enter'}, [
         ['div', {class: 'auth-card'}, [
            ['div', {class: 'auth-card__inner'}, [
               ['div', {class: 'auth-card__header'}, [
                  ['p', {class: 'auth-card__header-logo'}, views.logo (28)],
                  ['p', {class: 'auth-card__header-text'}, 'admin'],
               ]],
               // Because the inputs' values are not controlled by gotoB, if they're recycled their values could appear in other inputs.
               // By setting the form to be opaque, we prevent them being recycled.
               ['form', {onsubmit: 'event.preventDefault ()', class: 'enter-form auth-card__form', opaque: true}, [
                  ['input', {id: 'auth-username', type: 'text', class: 'enter-form__input', placeholder: 'Username or email'}],
                  ['input', {id: 'auth-password', type: 'password', class: 'enter-form__input', placeholder: 'Password'}],
                  ['input', {type: 'submit', class: 'enter-form__button enter-form__button--1 enter-form__button--submit', value: 'Log in', onclick: B.ev ('login', [])}],
               ]]
            ]]
         ]],
      ]],
   ];
}

// *** DASHBOARD VIEW ***

views.dashboard = function (x) {
   return ['div', {style: style ({padding: 60})}, [
      ['h2', {class: 'page-title'}, 'ac;pic admin'],
      ['br'],
      ['h3', {style: style ({'font-size': CSS.typography.fontSize (4)})}, ['a', {href: '#/invites'}, 'Invites']],
      ['br'],
      ['h3', {style: style ({'font-size': CSS.typography.fontSize (4)})}, ['a', {href: '#/users'}, 'Users']],
      ['br'],
      ['h3', {style: style ({'font-size': CSS.typography.fontSize (4)})}, ['a', {href: '#/logs'}, 'Logs']],
      ['br'],
      ['h3', {style: style ({'font-size': CSS.typography.fontSize (4)})}, ['a', {href: '#/deploy'}, 'Deploy client']],
      ['br'],
      ['h3', {style: style ({'font-size': CSS.typography.fontSize (4)})}, ['a', {href: '/pic/app/admin/dates'}, 'See dates from pics']],
   ]];
}

// *** INVITES VIEW ***

views.invites = function () {
   return B.view (['Data', 'invites'], function (invites) {
      return ['div', {style: style ({padding: 60})}, [
         ['h3', 'Invites'],
         ['table', {class: 'pure-table pure-table-striped'}, [
            ['tr', dale.go (['email', 'firstName', 'token', 'sent', 'accepted', 'delete'], function (v) {return ['th', v]})],
            dale.go (Data.invites, function (invite, email) {
               return ['tr', [
                  ['td', email],
                  ['td', invite.firstName],
                  ['td', invite.token],
                  ['td', new Date (invite.sent).toUTCString ()],
                  ['td', invite.accepted ? new Date (invite.accepted).toUTCString () : ''],
                  ['td', ['span', {class: 'action', onclick: B.ev ('delete', 'invite', email)}, 'Delete']],
               ]];
            }),
         ]],
         ['br'],
         B.view (['State', 'newInvite'], function (newInvite) {
            if (! newInvite) return ['button', {class: 'pure-button pure-button-primary', onclick: B.ev ('set', ['State', 'newInvite'], {email: '', firstName: ''})}, 'Create invite'];
            return ['div', [
               ['input', {placeholder: 'email', value: newInvite.email, onchange: B.ev ('set', ['State', 'newInvite', 'email'])}],
               ['br'],
               ['br'],
               ['input', {placeholder: 'name', value: newInvite.firstName, onchange: B.ev ('set', ['State', 'newInvite', 'firstName'])}],
               ['br'],
               ['br'],
               ['button', {class: 'pure-button pure-button-primary', onclick: B.ev ('create', 'invite')}, 'Create invite'],
               ['br'],
               ['br'],
               ['span', {class: 'action', onclick: B.ev ('rem', 'State', 'newInvite')}, 'Cancel'],
            ]];
         }),
      ]];
   });
}

// *** USERS VIEW ***

views.users = function () {
   return B.view (['Data', 'users'], function (users) {
      var columns = ['username', 'email', 'type', 'created', 'actions'];
      return ['div', {style: style ({padding: 60})}, [
         ['h3', 'Users'],
         ['table', {class: 'pure-table pure-table-striped'}, [
            ['tr', dale.go (columns, function (v) {return ['th', v]})],
            dale.go (Data.users, function (user) {
               return ['tr', dale.go (columns, function (k) {
                  if (k === 'actions') return ['td', ['span', {class: 'action', onclick: B.ev ('delete', 'user', user.username)}, 'Delete user']];
                  if (k === 'created') return ['td', new Date (parseInt (user [k])).toUTCString ()];
                  return ['td', user [k]];
               })];
            }),
         ]],
      ]];
   });
}

// *** LOGS VIEW ***

views.logs = function () {
   return B.view (['Data', 'logs'], function (logs) {
      var columns = ['t', 'username', 'ev', 'type'];
      dale.go (logs, function (log) {
         dale.go (log, function (v, k) {
            if (columns.indexOf (k) === -1) columns.push (k);
         });
      });
      return ['div', {style: style ({padding: 60})}, [
         ['h3', 'Logs'],
         ['table', {class: 'pure-table pure-table-striped'}, [
            ['tr', dale.go (columns, function (v) {return ['th', v]})],
            dale.go (Data.logs, function (log) {
               return ['tr', dale.go (columns, function (k) {
                  if (k === 't') return ['td', new Date (parseInt (log.t)).toUTCString ()];
                  var value = log [k];
                  if (value === undefined || value === null) return ['td'];
                  if (value === true || value === false) return ['td', value + ''];
                  if (teishi.complex (value)) value = JSON.stringify (value);
                  if (type (value) === 'string' && value.length > 300) value = value.slice (0, 300) + '...';
                  return ['td', value];
               })];
            }),
         ]],
      ]];
   });
}

// *** DEPLOY VIEW ***

views.deploy = function () {
   return ['div', {style: style ({padding: 60})}, [
      ['h2', {class: 'page-title'}, 'Deploy client.js'],
      ['br'], ['br'],
      ['form', {onsubmit: 'event.preventDefault ()'}, [
         ['input', {id: 'deploy', type: 'file', name: 'file'}],
         ['br'], ['br'],
         ['button', {class: 'pure-button pure-button-primary', onclick: B.ev ('deploy', 'client')}, 'Update client.js'],
      ]]
   ]];
}

// *** STATS VIEW ***

// *** INITIALIZATION ***

B.call ('initialize', []);
