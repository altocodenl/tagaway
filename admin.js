// *** GOTOB V2 SHIM ***
// TODO v2: remove

B.forget ('eventlog');

var T = teishi.time ();
var Do = B.do;
B.listen ('*', [], {priority: 1000000}, function (x) {
   //x.args ? console.log (teishi.time () - T, x.verb, x.path, x.args) : console.log (teishi.time () - T, x.verb, x.path);
});

lith.css.style = function (attributes, prod) {
   var result = lith.css.g (['', attributes], prod);
   return result === false ? result : result.slice (1, -1);
}

// *** SETUP ***

var dale = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
var type = teishi.t, clog = teishi.l, media = lith.css.media, style = lith.css.style;

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
];

// *** VIEWS ***

var E = {};

// *** NATIVE RESPONDERS ***

window.onerror = function () {
   B.do.apply (null, ['error', []].concat (dale.do (arguments, function (v) {return v})));
}

window.addEventListener ('hashchange', function () {
   B.do ('read', 'hash');
});

// *** RESPONDERS ***

dale.do ([

   // *** GENERAL RESPONDERS ***

   ['initialize', [], {burn: true}, function (x) {
      B.do (x, 'reset',    'store');
      B.do (x, 'read',     'hash');
      B.do (x, 'retrieve', 'csrf');
      B.mount ('body', E.base ());
   }],
   ['reset', 'store', function (x, logout) {
      B.do (x, 'set', 'State', {});
      B.do (x, 'set', 'Data',  {});
      if (logout) {
         B.r.log = [];
         B.do (x, 'set', ['Data', 'csrf'], false);
      }
      window.State = B.get ('State'), window.Data = B.get ('Data');
   }],
   ['clear', 'snackbar', function (x) {
      var existing = B.get ('State', 'snackbar');
      if (! existing) return;
      clearTimeout (existing.timeout);
      B.do (x, 'rem', 'State', 'snackbar');
   }],
   ['snackbar', [], function (x, message) {
      B.do (x, 'clear', 'snackbar');
      var colors = {green: '#04E762', red: '#D33E43', yellow: '#ffff00'};
      var timeout = setTimeout (function () {
         B.do (x, 'rem', 'State', 'snackbar');
      }, 4000);
      B.do (x, 'set', ['State', 'snackbar'], {color: colors [x.path [0]], message: message, timeout: timeout});
   }],
   [/get|post/, [], function (x, headers, body, cb) {
      var path = x.path [0], authRequest = path.match (/^auth/) && path !== 'auth/logout' && path !== 'auth/delete';
      // CSRF protection
      if (x.verb === 'post' && ! authRequest) {
         if (type (body, true) === 'formdata') body.append ('csrf', B.get ('Data', 'csrf'));
         else                                  body.csrf = B.get ('Data', 'csrf');
      }
      // TODO v2: uncomment
      //if (authRequest) teishi.last (B.r.log).args [1] = 'OMITTED';
      c.ajax (x.verb, x.path [0], headers, body, function (error, rs) {
         if (path !== 'csrf' && ! path.match (/^auth/) && error && error.status === 403) {
            B.do (x, 'reset', 'store', true);
            return B.do (x, 'snackbar', 'red', 'Your session has expired. Please login again.');
         }
         if (cb) cb (x, error, rs);
      });
   }],
   ['error', [], function (x) {
      B.do (x, 'post', 'error', {}, {log: B.r.log, error: dale.do (arguments, teishi.s).slice (1)});
   }],
   ['read', 'hash', function (x) {
      var hash = window.location.hash.replace ('#/', '').split ('/');
      B.do (x, 'set', ['State', 'page'], hash [0]);
   }],
   ['change', ['State', 'page'], function (x) {
      var page = B.get ('State', 'page'), logged = B.get ('Data', 'csrf'), redirect = B.get ('State', 'redirect');

      if (logged && redirect) {
         page = redirect;
         B.do (x, 'rem', 'State', 'redirect');
      }

      var allowed = logged ? ['dashboard', 'invites', 'users', 'deploy'] : ['login'];

      if (allowed.indexOf (page) === -1) {
         if (! logged) B.do (x, 'set', ['State', 'redirect'], page);
         return B.do (x, 'set', ['State', 'page'], allowed [0]);
      }

      document.title = ['ac;pic admin', page].join (' - ');

      if (window.location.hash.replace ('#/', '').split ('/') [0] !== page) window.location.hash = '#/' + page;
   }],

   // *** AUTH RESPONDERS ***

   ['retrieve', 'csrf', function (x) {
      B.do (x, 'get', 'csrf', {}, '', function (x, error, rs) {
         if (error && error.status !== 403) return B.do (x, 'snackbar', 'red', 'Connection or server error.');
         B.do (x, 'set', ['Data', 'csrf'], error ? false : rs.body.csrf);
      });
   }],
   ['change', ['Data', 'csrf'], function (x) {
      B.do (x, 'change', ['State', 'page']);
   }],
   ['login', [], function (x) {
      B.do (x, 'post', 'auth/login', {}, {
         username: c ('#auth-username').value,
         password: c ('#auth-password').value,
         tz:       new Date ().getTimezoneOffset ()
      }, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'Please submit valid credentials.');
         B.do (x, 'set', ['Data', 'csrf'], rs.body.csrf);
      });
   }],
   ['logout', [], function (x) {
      B.do (x, 'post', 'auth/logout', {}, {}, function (x, error) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error logging you out.');
         B.do (x, 'reset', 'store', true);
      });
   }],

   // *** INVITE RESPONDERS ***

   ['retrieve', 'invites', function (x) {
      B.do (x, 'get', 'admin/invites', {}, '', function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error retrieving data.');
         B.do (x, 'set', ['Data', 'invites'], rs.body);
      });
   }],
   ['create', 'invite', function (x) {
      B.do (x, 'post', 'admin/invites', {}, B.get ('State', 'newInvite'), function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error creating the invite.');
         B.do (x, 'snackbar', 'green', 'Invite sent!');
         B.do (x, 'rem', 'State', 'newInvite');
         B.do (x, 'retrieve', 'invites');
      });
   }],
   ['delete', 'invite', function (x, email) {
      if (! confirm ('Are you sure you want to delete the invite?')) return;
      B.do (x, 'post', 'admin/invites/delete', {}, {email: email}, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error deleting the invite.');
         B.do (x, 'snackbar', 'green', 'Invite deleted successfully.');
         B.do (x, 'retrieve', 'invites');
      });
   }],
   ['change', ['State', 'page'], function (x) {
      if (B.get ('State', 'page') === 'invites') {
         if (! B.get ('Data', 'invites')) B.do (x, 'retrieve', 'invites');
      }
      if (B.get ('State', 'page') === 'users') {
         if (! B.get ('Data', 'users')) B.do (x, 'retrieve', 'users');
      }
   }],

   // *** USERS RESPONDERS ***

   ['delete', 'user', function (x, username) {
      if (! confirm ('Are you sure you want to delete the user ' + username + '?')) return;
      B.do (x, 'post', 'auth/delete', {}, {username: username}, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error deleting the user.');
         B.do (x, 'snackbar', 'green', 'User deleted successfully.');
         B.do (x, 'retrieve', 'users');
      });
   }],

   ['retrieve', 'users', function (x, username) {
      B.do (x, 'get', 'admin/users', {}, '', function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error retrieving users.');
         B.do (x, 'set', ['Data', 'users'], rs.body);
      });
   }],

   // *** DEPLOY RESPONDERS ***

   ['deploy', 'client', function (x) {
      var input = c ('#deploy');
      if (! input.files.length) return B.do (x, 'snackbar', 'yellow', 'Please select a file.');
      var f = new FormData ();
      f.append ('file', input.files [0]);
      B.do (x, 'post', 'admin/deploy', {}, f, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', error.responseText);
         input.value = '';
         B.do (x, 'snackbar', 'green', 'Deploy OK!');
      });
   }],

], function (v) {
   B.listen.apply (null, v);
});

// *** LOGO VIEW ***

E.logo = function (size) {
   return [
      ['link', {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Kadwa'}],
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'ac;'],
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'p'],
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'i'],
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'c'],
   ];
}

// *** BASE VIEW ***

E.base = function () {
   return [
      ['style', CSS.litc],
      B.view (['Data', 'csrf'], function (x, csrf) {
         if (csrf) return [
            ['style', ['.logout', {position: 'absolute', 'top, right': 40, 'font-size': CSS.typography.fontSize (3)}]],
            ['a', B.ev ({href: '#', class: 'logout'}, ['onclick', 'logout', []]), 'Logout'],
         ];
      }),
      E.snackbar (),
      // TODO v2: merge two elements into one
      B.view (['Data', 'csrf'], function (x, csrf) {
         if (csrf !== undefined) return B.view (['State', 'page'], function (x, page) {
            if (E [page]) return E [page] ();
         });
      })
   ];
}

// *** SNACKBAR VIEW ***

E.snackbar = function () {
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
      B.view (['State', 'snackbar'], function (x, snackbar) {
         if (! snackbar) return;
         var bcolor = 'rgba(' + CSS.toRGBA (snackbar.color) + ', 0.9)';
         return ['div', {class: 'snackbar', style: style ({bottom: 0, 'background-color': bcolor})}, [
            ['p', {class: 'snackbar__text'}, [
               ['span', {class: 'snackbar__text-concept'}, snackbar.message],
            ]],
            ['div', B.ev ({class: 'snackbar__close'}, ['onclick', 'clear', 'snackbar']), [
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

E.login = function () {
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
                  ['p', {class: 'auth-card__header-logo'}, E.logo (28)],
                  ['p', {class: 'auth-card__header-text'}, 'admin'],
               ]],
               // Because the inputs' values are not controlled by gotoB, if they're recycled their values could appear in other inputs.
               // By setting the form to be opaque, we prevent them being recycled.
               ['form', {onsubmit: 'event.preventDefault ()', class: 'enter-form auth-card__form', opaque: true}, [
                  ['input', {id: 'auth-username', type: 'text', class: 'enter-form__input', placeholder: 'Username or email'}],
                  ['input', {id: 'auth-password', type: 'password', class: 'enter-form__input', placeholder: 'Password'}],
                  ['input', B.ev ({type: 'submit', class: 'enter-form__button enter-form__button--1 enter-form__button--submit', value: 'Log in'}, ['onclick', 'login', []])],
               ]]
            ]]
         ]],
      ]],
   ];
}

// *** DASHBOARD VIEW ***

E.dashboard = function (x) {
   return ['div', {style: style ({padding: 60})}, [
      ['h2', {class: 'page-title'}, 'ac;pic admin'],
      ['br'],
      ['h3', {style: style ({'font-size': CSS.typography.fontSize (4)})}, ['a', {href: '#/invites'}, 'Invites']],
      ['br'],
      ['h3', {style: style ({'font-size': CSS.typography.fontSize (4)})}, ['a', {href: '#/users'}, 'Users']],
      ['br'],
      ['h3', {style: style ({'font-size': CSS.typography.fontSize (4)})}, ['a', {href: '#/deploy'}, 'Deploy client']],
   ]];
}

// *** INVITES VIEW ***

E.invites = function () {
   return B.view (['Data', 'invites'], function (x, invites) {
      return ['div', {style: style ({padding: 60})}, [
         ['h3', 'Invites'],
         ['table', {class: 'pure-table pure-table-striped'}, [
            ['tr', dale.do (['email', 'firstName', 'token', 'sent', 'accepted', 'delete'], function (v) {return ['th', v]})],
            dale.do (Data.invites, function (invite, email) {
               return ['tr', [
                  ['td', email],
                  ['td', invite.firstName],
                  ['td', invite.token],
                  ['td', new Date (invite.sent).toUTCString ()],
                  ['td', invite.accepted ? new Date (invite.accepted).toUTCString () : ''],
                  ['td', ['span', B.ev ({class: 'action'}, ['onclick', 'delete', 'invite', email]), 'Delete']],
               ]];
            }),
         ]],
         ['br'],
         B.view (['State', 'newInvite'], function (x, newInvite) {
            if (! newInvite) return ['button', B.ev ({class: 'pure-button pure-button-primary'}, ['onclick', 'set', ['State', 'newInvite'], {email: '', firstName: ''}]), 'Create invite'];
            return [
               ['input', B.ev ({placeholder: 'email', value: newInvite.email}, ['onchange', 'set', ['State', 'newInvite', 'email']])],
               ['br'],
               ['br'],
               ['input', B.ev ({placeholder: 'name', value: newInvite.firstName}, ['onchange', 'set', ['State', 'newInvite', 'firstName']])],
               ['br'],
               ['br'],
               ['button', B.ev ({class: 'pure-button pure-button-primary'}, ['onclick', 'create', 'invite']), 'Create invite'],
               ['br'],
               ['br'],
               ['span', B.ev ({class: 'action'}, ['onclick', 'rem', 'State', 'newInvite']), 'Cancel'],
            ];
         }),
      ]];
   });
}

// *** USERS VIEW ***

E.users = function () {
   return B.view (['Data', 'users'], function (x, users) {
      var columns = ['username', 'email', 'type', 'created', 'actions'];
      return ['div', {style: style ({padding: 60})}, [
         ['h3', 'Users'],
         ['table', {class: 'pure-table pure-table-striped'}, [
            ['tr', dale.do (columns, function (v) {return ['th', v]})],
            dale.do (Data.users, function (user) {
               return ['tr', dale.do (columns, function (k) {
                  if (k === 'actions') return ['td', ['span', B.ev ({class: 'action'}, ['onclick', 'delete', 'user', user.username]), 'Delete user']];
                  if (k === 'created') return ['td', new Date (parseInt (user [k])).toUTCString ()];
                  return ['td', user [k]];
               })];
            }),
         ]],
      ]];
   });
}

// *** DEPLOY VIEW ***

E.deploy = function () {
   return ['div', {style: style ({padding: 60})}, [
      ['h2', {class: 'page-title'}, 'Deploy client.js'],
      ['br'], ['br'],
      ['form', {onsubmit: 'event.preventDefault ()'}, [
         ['input', {id: 'deploy', type: 'file', name: 'file'}],
         ['br'], ['br'],
         ['button', B.ev ({class: 'pure-button pure-button-primary'}, ['onclick', 'deploy', 'client']), 'Update client.js'],
      ]]
   ]];
}

// *** STATS VIEW ***

// *** INITIALIZATION ***

B.do ('initialize', []);
