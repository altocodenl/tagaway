// *** SETUP ***

var dale = window.dale, teishi = window.teishi, lith = window.lith, c = window.c, B = window.B;
var type = teishi.type, clog = teishi.clog, media = lith.css.media, style = lith.css.style, inc = function (a, v) {return a.indexOf (v) > -1}

window.addEventListener ('keydown', function (ev) {
   ev = ev || document.event;
   if (! ev.ctrlKey) return;
   // CTRL+K: search the eventlog
   if (ev.keyCode === 75) {
      ev.preventDefault ();
      var query = prompt ('Search the eventlog');
      if (query === null && c ('#eventlog')) return c ('#eventlog').parentNode.removeChild (c ('#eventlog'));
      B.eventlog (query);
   }
   // CTRL+L: hide/show responder entries in the eventlog
   if (ev.keyCode === 76) {
      ev.preventDefault ();
      c ('.evlog-resp', function (element) {element.style.display = window.getComputedStyle (element).display === 'table-row' ? 'none' : 'table-row'});
   }
   // CTRL+P: compute performance for all redraws so far
   if (ev.keyCode === 80) {
      ev.preventDefault ();
      var output = {DOM: 0, js: 0, n: 0};
      var redraws = dale.fil (B.log, undefined, function (log) {
         if (log.verb !== 'redraw') return;
         output.n++;
         output.DOM += log.args [0].ms.DOM;
         output.js  += log.args [0].ms.total - log.args [0].ms.DOM;
         return [log.path.join (':'), log.args [0].ms.total];
      }).sort (function (a, b) {
         return b [1] - a [1];
      })
      dale.go ([200, 100], function (ms) {
         var c = 0;
         dale.go (redraws, function (redraw) {
            if (redraw [1] < ms) return;
            c++;
         });
         output [ms + 'ms'] = c;
      });
      output.avg = Math.ceil ((output.DOM + output.js) / output.n);
      console.log (JSON.stringify (output).replace (/"/g, ''), redraws.slice (0, 4).join (' '));
   }
   // CTRL+T: run client test suite
   if (ev.keyCode === 84) {
      ev.preventDefault ();
      B.call ('test', []);
   }
});

// *** CSS ***

var CSS = {
   pivWidths: [150, 210, 240, 360],
   // old piv widths
   //pivWidths: [100, 140, 180, 240],
   // All thumbs for pivs have the same height, which is equivalent to pivWidths [1] - 18px of margin-top
   toRGBA: function (hex) {
      hex = hex.slice (1);
      return parseInt (hex.slice (0, 2), 16) + ', ' + parseInt (hex.slice (2, 4), 16) + ', ' + parseInt (hex.slice (4, 6), 16);
   },
   // *** variables.scss ***
   vars: {
      // tagColors: ['green', 'blue', 'yellow', 'orange', 'coral', 'indigo'],
      tagColors: ['#ec5bff', '#ff5b6e', '#5bffec', '#4aff95', '#ffec5b', '#80762e'],
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
      spaceVerPx: function (number, lineHeight) {
         return Math.round (parseFloat (CSS.typography.spaceVer (number, lineHeight).replace ('rem', '')) * CSS.typography.typeBase);
      },
   },
};

// *** variables.scss (they go here because they reference other variables) ***

// grey interactive
CSS.vars ['grey--link'] = 'rgba(' + CSS.toRGBA (CSS.vars ['grey--darker']) + ', 0.8)';
// border colors
CSS.vars ['border-color']       = CSS.vars ['grey--lighter'];
CSS.vars ['border-color--dark'] = CSS.vars ['grey--light'];

// *** mixins.scss (they go here because they reference other variables and hence we can't add them to the object itself without having a reference error) ***

CSS.vars.cross = function (selector, size, color) {
   return [selector, {
      display: 'inline-block',
      position: 'relative',
      'width, height': size || 32,
   }, [
      ['&::after, &::before', {
         content: "''",
         position: 'absolute',
         'top, left': 0.5,
         'margin-left': -0.5,
         display: 'inline-block',
         width: 1,
         height: '1px',
         'background-color': color || CSS.vars ['grey--lighter'],
         transform: 'rotate(-45deg)',
         transition: CSS.vars.easeOutQuart,
      }],
      ['&::after', {transform: 'rotate(45deg)'}]
   ]];
}

CSS.vars.crossHover = function (color) {
   return ['&::after, &::before', {'background-color': color || CSS.vars ['grey--darker']}];
}

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
     'font-size':   CSS.typography.fontSize (4.5),
      'line-height': CSS.typography.spaceVer (1.75),
      'margin-bottom': CSS.typography.spaceVer (0.25),
      mixin1: CSS.vars.fontPrimaryRegular,
      // color: 'white',
      // 'padding-left': CSS.vars ['padding--xs'],
   }],
   ['.page-subtitle', {
      'font-size':   CSS.typography.fontSize (1),
      mixin1: CSS.vars.fontPrimaryItalic,
      color: CSS.vars.grey,
   }],
   // *** main-styles.scss ***
   ['a, .pointer', {cursor: 'pointer'}],
   ['a, a:hover, a:focus, a:active', {'text-decoration': 'none', 'color': 'inherit'}],
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
      cursor: 'pointer',
   }],
   ['.button--green', {
      border: '1px solid ' + CSS.vars ['color--attach'],
      'background-color': CSS.vars ['color--attach'],
      color: '#fff',
      cursor: 'pointer',
   }],
   ['.button--feedback', {
      border: '1px solid ' + CSS.vars ['color--one'],
      color: CSS.vars ['color--one'],
      cursor: 'pointer',
      'border-radius': 12,
   }],
   media ('screen and (max-width: 1090px)', ['.button--feedback', {
      display: 'none'
   }]),
   media ('screen and (min-width: 1025px)', ['.button--one:hover', {
      'background-color': '#fff',
      color: CSS.vars ['color--one'],
   },
   ['.pcUpload-icon, .cloudImport-icon', {
      'fill': CSS.vars['color--one'],
   }]
   ]),
   ['.button--two', {
      border: '1px solid ' + CSS.vars.grey,
      color: '#fff',
      'background-color': CSS.vars.grey,
   }],
   media ('screen and (min-width: 1025px)', ['.button--two:hover', {
      color: CSS.vars.grey,
      background: '#fff',
   }]),
   ['.button--three', {
      border: '1px solid ' + CSS.vars.grey,
      color: CSS.vars.grey,
      'background-color': '#fff',
   }],
   media ('screen and (min-width: 1025px)', ['.button--three:hover', {
      color: '#fff',
      background: CSS.vars.grey,
   }]),
   media ('screen and (min-width: 1025px)', ['.button--green:hover', {
      'background-color': '#fff',
      color: CSS.vars ['color--attach'],
   },
   ['.share-icon', {
      'fill': CSS.vars ['color--attach'],
   }]]),
   media ('screen and (min-width: 1025px)', ['.button--feedback:hover', {
      'background-color': CSS.vars ['color--one'],
      color: '#fff',
   }]),
   ['.info-icon', {
      width: 24,
   }],
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
   // *** header.scss ***
   ['.header', {
      background: '#fff',
      position: 'fixed',
      'top, left': 0,
      'z-index': '100',
      display: 'flex',
      'align-items': 'center',
      width: 1,
      'border-bottom': '1px solid ' + CSS.vars ['border-color'],
      height: CSS.typography.spaceVer (3),
   }],
   ['.header__brand', {
      width: CSS.vars ['sidebar-width'],
      display: 'inline-block',
      'padding-left': CSS.vars ['padding--m'],
   }],
   ['.header__menu', {'padding-left': CSS.vars ['padding--l']}],
   ['.header__user', {'margin-left': 'auto'}],
   ['.header__feedback-button', {'margin-left': 'auto'}],
   ['.header__upload-button', {'margin-left, margin-right': CSS.vars ['padding--m']}],
   ['.header__import-button', {'margin-left': 22, 'margin-right': -12}],
   ['.button--green .share-icon', {
      'margin-top': 16,
      'margin-right': CSS.vars ['padding--xs'],
   }],
   ['.cloudImport-icon', {
      'height, width': 26,
      'fill': 'white',
      'margin-top': 17,
      'margin-right': CSS.vars ['padding--xs'],
   }],
   ['.pcUpload-icon', {
      'height, width': 30,
      'fill': 'white',
      'margin-top': 15,
      'margin-right': CSS.vars ['padding--xs'],
   }],
   // *** logo.scss ***
   ['.logo__img', {
      display: 'inline-block',
      width: 54,
      height: 'auto',
   }],
   ['.logo__img path', {fill: CSS.vars ['color--one']}],
   // *** main-menu.scss ***
   ['.main-menu', {display: 'flex'}],
   ['.main-menu__item', {'margin-right': CSS.vars ['padding--m']}],
   ['.main-menu__item-link', {
      color: CSS.vars ['grey--link'],
      'font-size': CSS.typography.fontSize (1),
      transition: CSS.vars.easeOutQuart,
   }],
   media ('screen and (min-width: 1025px)', ['.main-menu__item-link:hover', {color: CSS.vars ['color--one']}]),
   // Active menu item
   ['.app-organise .main-menu__item--organise, .app-pictures .main-menu__item--pictures', ['.main-menu__item-link', {color: CSS.vars ['color--one']}]],
   // *** main-menu-mobile.scss ***
   // *** account-menu.scss ***
   ['.account-menu', {
      display: 'inline-flex'
   }],
   ['.username', {
      color: CSS.vars ['grey--darker'],
      'font-size': CSS.typography.fontSize (1.2),
      'margin-top': 2
   }],
   ['.account-menu__item', {
      position: 'relative',
      'padding-left, padding-right': 10,
      display: 'flex',
      'align-items': 'center',
      cursor: 'pointer',
   }, ['&::after', {
      content: "''",
      position: 'absolute',
      top: '33.3334%',
      'right, width, height': 0,
      'border-style': 'solid',
      'border-width': '4px 4px 0 4px',
      'border-color': CSS.vars.grey + ' transparent transparent transparent',
   }]],
   media ('screen and (min-width: 1025px)', ['.account-menu__item:hover::after', {'border-color': CSS.vars ['grey--darker'] + ' transparent transparent transparent'}]),
   ['.account-menu__item-icon', {
      position: 'relative',
      display: 'inline-block',
      'width, height': 24,
   }, ['path', {fill: CSS.vars ['grey--link']}]],
   media ('screen and (min-width: 1025px)', ['.account-menu__item:hover .account-menu__item-icon path', {fill: CSS.vars ['grey--darker']}]),
   ['.account-sub-menu', {
      display: 'none',
      'flex-direction': 'column',
      position: 'absolute',
      top: 23,
      right: -10,
      width: 200,
      background: '#fff',
      'padding-left, padding-right': CSS.vars ['padding--m'],
      'padding-top': CSS.typography.spaceVer (0.6),
      'padding-bottom': CSS.typography.spaceVer (0.7),
      'border-radius': CSS.vars ['border-radius--m'],
      'box-shadow': '0 0 20px rgba(0, 0, 0, 0.15)',
   }],
   ['.account-menu__item:hover > .account-sub-menu', {display: 'flex'}],
   ['.account-sub-menu__item-link', {
      color: CSS.vars ['grey--link'],
      transition: CSS.vars.easeOutQuart,
   }],
   media ('screen and (min-width: 1025px)', ['.account-sub-menu__item-link:hover', {color: CSS.vars ['color--one']}]),
   // *** hamburger.scss ***
   ['.hamburger', {
      position: 'relative',
      display: 'none',
      'align-items': 'center',
      'width, height': 50,
      padding: 0
   }],
   media ('screen and (max-width: 767px)', ['.hamburger', {display: 'flex'}]),
   ['.hamburger__inner', {
      position: 'absolute',
      display: 'inline-block',
      height: 14,
      width: 28,
      left: 11,
      transition: 'all ' + CSS.vars.easeOutQuart,
   }],
   ['.hamburger__stroke', {
      background: '#fff',
      height: 2,
      width: 1,
      'border-radius': 2,
      position: 'absolute',
      left: '0px',
      transition: 'transform ' + CSS.vars.easeOutQuart + ' 0.45s, opacity 0.3s linear',
   }],
   ['.hamburger__stroke-1', {top: 0}],
   ['.hamburger__stroke-2', {top: 6}],
   ['.hamburger__stroke-3', {top: 12}],
   ['.active-mobile-menu', [
      ['.hamburger__inner', {transform: 'rotate(180deg)'}],
      ['.hamburger__stroke-1', {transform: 'rotate(-45deg) translateY(5px) translateX(-4px)'}],
      ['.hamburger__stroke-2', {transform: 'rotate(45deg)', opacity: '0.2'}],
      ['.hamburger__stroke-3', {transform: 'rotate(45deg) translateY(-4px) translateX(-4px)'}],
   ]],
   // *** sidebar.scss ***
   ['.sidebar', {
      position: 'fixed',
      'z-index': '99',
      left: 0,
      top: 58, // height main header
      'padding-bottom': 114, // height sidebar search
      width: CSS.vars ['sidebar-width'],
      display: 'flex',
      'flex-direction': 'column',
      'border-right': CSS.vars ['border-color'] + ' 1px solid',
      height: 'calc(100vh - 58px)',
      'background-color': '#fff',
      'overflow-x': 'hidden',
   }],
   ['.sidebar__inner', {
      width: '200%',
      display: 'flex',
      'flex-wrap': 'nowrap',
      transition: CSS.vars.easeOutQuad,
      'transition-duration': '500ms',
   }],
   // This CSS property switches the sidebar when selecting/unselecting pictures
   ['.app-organise .sidebar__inner', {transform: 'translateX(-50%)'}],
   ['.sidebar__inner-section', {width: 0.5, position: 'relative'}],
   // Sidebar coherent paddings
   ['.sidebar__header, .sidebar__tags, .sidebar__tip', {'padding-left, padding-right': CSS.vars ['padding--m']}],
   ['.sidebar__attach-form', {
       'padding-left, padding-right':  'calc(' + CSS.vars ['padding--m'] + 'px - 6px)' // has smaller padding for optic correction of round shape
   }],
   // Sidebar close section
   ['.sidebar__close-section-button', {
      position: 'absolute',
      'top, right': 0,
      'z-index': '1'
   }],
   // Sidebar header
   ['.sidebar__header', {'padding-top, padding-bottom': CSS.typography.spaceVer (1.5)}],
   // Sidebar title
   ['.sidebar__section-title', {'margin-bottom': CSS.typography.spaceVer (0.5), 'padding-left': CSS.vars ['padding--xs']}],
   ['.sidebar__attach-form', {'margin-top, margin-bottom': CSS.typography.spaceVer (1), position: 'relative'}],
   ['.attach-form__dropdown', {
      // Note: these numbers are badly hardcoded until we get back our saucier
      position: 'absolute',
      'z-index': '1',
      left: 0.07,
      top: 78, // height input
      width: 0.86,
      height: 'auto',
      'max-height': 120,
      'overflow-y': 'auto',
      'box-shadow': '0 0 10px rgba(0, 0, 0, 0.15)',
      //display: 'none',
   }],
   ['.attach-form:hover .attach-form__dropdown', {display: 'block'}],
   // Sidebar footer
   ['.sidebar__footer', {
      position: 'fixed',
      'bottom, left': 0,
      height: 54,
      width: 300, // sidebar width
      display: 'flex',
      'flex-direction': 'column-reverse', // FIX FOR '.done-tagging-button'
      'background-color': '#ffffff', // FIX FOR '.done-tagging-button'
      'align-items': 'center',
      //'border-top, border-bottom': '1px solid ' + CSS.vars ['border-color'], // COMMENTED AS A FIX FOR '.done-tagging-button'
   }],
   // Sidebar -- Attach tags
   ['.app-attach-tags', [
      ['.sidebar__attach-form', {display: 'block'}],
      ['.sidebar__section-title--untag', {display: 'none'}],
   ]],
   // *** sidebar-header.scss ***
   ['.sidebar-header', {position: 'relative'}],
   // Sidebar header -- selected tags
   ['.sidebar-header__filter-selected', {
      position: 'absolute',
      top: 0.5,
      right: 0,
      cursor: 'pointer',
      opacity: '0.5',
      transition: 'opacity 250ms linear',
   }],
   ['.sidebar-header__filter-selected:hover', {opacity: '1'}],
   ['.sidebar-header__filter-selected-icon', {
      display: 'inline-block',
      'width, height': 24,
      'margin-top': -12, // center
      fill: CSS.vars ['grey--darker'],
   }],
   ['.app-selected-tags', [
      ['.sidebar-header__filter-selected', {opacity: '1'}],
      ['.sidebar-header__filter-selected-icon', {fill: CSS.vars ['color--one']}],
   ]],
   // Sidebar title
   ['.sidebar-header__title', {'font-size': CSS.typography.fontSize (3)}],
   // Sidebar Done Tagging button
   ['.done-tagging-button', {
      display: 'block',
      float: 'right',
      'cursor': 'pointer',
      'margin-right': '-41%',
      'margin-bottom': CSS.vars ['padding--xs'],
      border: '1px solid #87D7AB',
      color: '#fff',
      'background-color': CSS.vars ['color--attach'],
   }],
   ['.done-tagging-button:hover', {
      color: CSS.vars ['color--attach'],
      'background-color': '#fff'
   }],
   // Sidebar Show More Tags Button
   ['.show-more-tags', {
      display: 'block',
      float: 'left',
      'cursor': 'pointer',
      border: '1px solid #5b6eff',
      color: '#fff',
      'background-color': CSS.vars ['color--one'],
   }],
   ['.show-more-tags:hover', {
      color: CSS.vars ['color--one'],
      'background-color': '#fff'
   }],
   // *** sidebar-search.scss
   ['.sidebar-search', {
      position: 'relative',
      display: 'flex',
      'width, height': 1,
      'border-top, border-bottom': '1px solid ' + CSS.vars ['border-color'], // ORIGINALLY IN '.sidebar__footer'. MOVED HERE AS A FIX TO ACCOMODATE '.done-tagging-button'
   }],
   ['.sidebar-search__input', {'padding-left, padding-right': CSS.vars ['padding--m']}],
   ['.sidebar-search__input::placeholder', {'color': CSS.vars ['color--one'], 'font-weight': CSS.vars ['fontPrimarySemiBold']}],
   ['.sidebar-search__icon', {
      position: 'absolute',
      right: CSS.vars ['padding--m'],
      top: 0.5,
      'margin-top': -12,
      'width, height': 24,
      display: 'inline-block',
   }, ['path', {
      // fill: CSS.vars ['grey--link']
      fill: CSS.vars ['color--one']
   }]],
   // *** switch.scss ***
   ['.switch', {
      padding: 4,
      display: 'inline-block',
      position: 'relative',
      'border-radius': 100,
      background: CSS.vars ['highlight--neutral'],
      transition: CSS.vars.easeOutQuart,
   }],
   ['.app-selected-tags .switch', {background: CSS.vars ['highlight--selection']}],
   ['.app-attach-tags .switch', {background: CSS.vars ['highlight--positive']}],
   ['.switch::after', {
      content: "''",
      background: '#fff',
      'border-radius': 100,
      position: 'absolute',
      'top, left': 4,
      height: 'calc(100% - 8px)',
      'z-index': 0,
      transition: CSS.vars.easeOutQuart,
   }],
   ['.app-all-tags .switch::after', {left: 4, width: 98}],
   ['.app-selected-tags .switch::after', {left: 101, width: 130}],
   ['.app-attach-tags .switch::after', {left: 4, width: 125}],
   ['.switch-list', {
      position: 'relative',
      'z-index': '1',
      width: 1,
      display: 'flex',
      'justify-content': 'space-between',
   }],
   ['.switch-list__button', {
      height: 38,
      'padding-left': CSS.vars ['padding--xs'],
      'padding-right': CSS.vars ['padding--m'],
      display: 'flex',
      'align-items': 'center',
      color: CSS.vars ['grey--link'],
      cursor: 'pointer',
      'white-space': 'nowrap',
   }],
   ['.switch-list__button-icon', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': 2,
   }, ['path', {fill: CSS.vars ['grey--link']}]],
   media ('screen and (min-width: 1025px)', [
      ['.switch-list__button:hover .switch-list__button-text', {color: CSS.vars ['grey--darker']}, [
         ['.switch-list__button-icon path', {fill: CSS.vars ['grey--darker']}],
      ]],
   ]),
   // Sidebar Suggest Geotagging
   ['.suggest-geotagging', {
      'clear': 'both',
      'display': 'block',
      'padding-top, padding-bottom': CSS.vars ['padding--m'],
      'font-size': CSS.typography.fontSize (1),
   }],
   ['.suggest-geotagging-enable', {
      'float': 'left',
      'font-weight': CSS.vars.fontPrimary,
      'text-decoration': 'underline',
   }],
   ['.suggest-geotagging-dismiss', {
      'float': 'right',
      'color': CSS.vars ['grey--darker'],
      'text-decoration': 'underline',
   }],
   // *** attach_form.scss ***
   ['.attach-form__title', {
      'padding-left': 10,
      'margin-bottom': CSS.typography.spaceVer (0.5),
   }],
   // *** main.scss **
   // Main (where all the content comes)
   ['.main', {
      // 'padding-top': 58, // header height
      'padding-top': 40, // header height
      'padding-left': CSS.vars ['sidebar-width'], // sidebar width
      display: 'flex',
      'flex-direction': 'column',
      'width, height': 1,
      transition: CSS.vars.easeOutQuart,
   }],
   ['.app-organise .main', {background: CSS.vars ['grey--lightest']}],
   ['.app-show-organise-bar .main', {
      transform: 'translateY(58px)' // header height
   }],
   ['.app-show-organise-bar .pictures-header', {
      transition: CSS.vars.easeOutQuart,
      transform: 'translateY(-29px)' // header height / 2
   }],
   ['.app-show-organise-bar .pictures-grid', {
      transition: CSS.vars.easeOutQuart,
      transform: 'translateY(-58px)' // header height
   }],
   ['.app-pictures .pictures-grid', {
      transition: CSS.vars.easeOutQuart,
      transform: 'translateY(0px)'
   }],
// **
   ['.app-pictures .pictures-header', {
      transition: CSS.vars.easeOutQuart,
      transform: 'translateY(0px)'
   }],
   ['.app-pictures .pictures-grid__item', {
      transition: CSS.vars.easeOutQuart,
      transform: 'translateY(0px)'
   }],
   ['.main__inner', {
      'margin-top': CSS.typography.spaceVer (1.5),
      'padding-left, padding-right': CSS.vars ['padding--l'],
      'background-color': 'white',
   }],
   ['.main--pictures .main__inner', {'padding-right': 0}],
   // *** main-centered.scss ***
   ['.main-centered', {
      'padding-top': 58, // header height
      display: 'flex',
      'flex-direction': 'column',
      width: 1,
      'align-items': 'center',
   }],
   ['.main-centered__inner', {
      display: 'flex',
      'flex-direction': 'column',
      width: 1,
   }],
   ['.chunk_title', {
      'font-weight': CSS.vars.fontPrimaryRegular,
      color: CSS.vars.grey,
      height: 25,
      'font-size':   CSS.typography.fontSize (4),
      'text-align': 'center',
      cursor: 'pointer'
   }],
   // *** guide.scss ***
   ['.guide', {
      display: 'flex',
      'flex-direction': 'column',
      'justify-content, align-items': 'flex-start',
      'max-width': 510,
      width: 1,
   }],
   ['.guide__image', {'margin-bottom': CSS.typography.spaceVer (0.5)}],
   ['.guide__title', {
      'font-size': CSS.typography.fontSize (7),
      'line-height': CSS.typography.spaceVer (1.75),
      'margin-bottom': CSS.typography.spaceVer (0.5),
   }],
   ['.guide__text', {
      'font-size': CSS.typography.fontSize (1),
      'margin-bottom': CSS.typography.spaceVer (1),
   }],
   ['.googlePlayBadge', {
      height: 40,
   }],
   // *** page-header.scss ***
   ['.page-header', {
      'margin-top': CSS.typography.spaceVer (4),
      'margin-bottom': CSS.typography.spaceVer (1.5),
   }],
   // *** page-section.scss ***
   ['.page-section', {
      display: 'block',
      width: 1,
      'margin-bottom': CSS.typography.spaceVer (4),
   }],
   // *** tip.scss ***
   ['.tip', {
      display: 'flex',
      'flex-direction': 'column',
      color: CSS.vars ['grey--darker'],
   }],
   ['.tip__header', {
      display: 'flex',
      'align-items': 'center',
      'margin-bottom': CSS.typography.spaceVer (0.25),
   }],
   ['.tip__icon', {'margin-right': CSS.vars ['padding--xs']}],
   ['.tip__title', {
      mixin1: CSS.vars.fontPrimaryMedium,
      'margin-top': '1px',
   }],
   ['.tip__text', {mixin1: CSS.vars.fontPrimaryItalic}, ['a', {
      color: CSS.vars ['grey--darker'],
      'text-decoration': 'underline',
   }]],
   media ('screen and (min-width: 1025px)', ['.tip__text a:hover', {color: CSS.vars ['color--one']}]),
   // *** search-form.scss ***
   // Drag and drop
   ['.search-form', {
      display: 'flex',
      width: 1,
      position: 'relative',
   }],
   ['.search-form__input', {
      display: 'block',
      'height, line-height': 42,
      'border-radius': 100,
      border: '1px solid ' + CSS.vars ['border-color--dark'],
   }],
   ['.search-form__icon', {
      position: 'absolute',
      right: CSS.vars ['padding--s'],
      top: 0.5,
      'margin-top': -12,
      'width, height': 24,
      display: 'inline-block',
   }, ['path', {fill: CSS.vars ['grey--link']}]],
   ['.search-form__dropdown', {
      position: 'absolute',
      'z-index': '1',
      left: 0.02,
      top: 41, // height input
      width: 0.96,
      height: 'auto',
      'max-height': 120,
      'overflow-y': 'auto',
      'border-radius': CSS.vars ['border-radius--m'],
      'box-shadow': '0 0 10px rgba(0, 0, 0, 0.15)',
      display: 'none',
   }],
   ['.search-form:hover .search-form__dropdown', {display: 'block'}],
   // *** tag-list-horizontal.scss ***
   // Tag list bar (above pictures)
   ['.tag-list-horizontal', {
      display: 'flex',
      width: 1,
      'align-items': 'center',
      'margin-top': CSS.vars ['padding--xs'],
   }],
   ['.tag-list-horizontal .tag-list-horizontal__item', {
      width: 'auto',
      'margin-right': CSS.vars ['padding--m'],
      display: 'inline-flex',
      'white-space': 'nowrap',
      // 'margin-top': CSS.typography.spaceVer (0.25),
      // color: 'white',
      'margin-left': CSS.vars ['padding--xs']
   }],
   // *** tag-list-extended.scss ***
   // Tag list extended
   ['.tag-list-extended', {
      width: 1,
      'list-style-type': 'none',
      display: 'flex',
      'flex-direction': 'column',
      'margin-bottom': CSS.typography.spaceVer (4),
   }],
   ['.tag-list-extended__item', {
      display: 'flex',
      'align-items': 'flex-start',
      'padding-left': CSS.vars ['padding--s'],
      'padding-top, padding-bottom': CSS.typography.spaceVer (0.5),
      'border-bottom': '1px ' + CSS.vars ['border-color'] + ' solid',
      cursor: 'pointer',
      position: 'relative',
      transition: CSS.vars.easeOutQuart,
      overflow: 'hidden',
      'font-size': CSS.typography.fontSize (1)
   }],
   ['.tag-list-extended__item-info', {
      display: 'flex',
      'flex-direction': 'column',
      width: 1,
      top: CSS.typography.spaceVer (1),
      'padding-left': 27,
      'padding-right': CSS.vars ['padding--m'],
      'margin-top': CSS.vars ['padding--s'],
      'font-size': CSS.typography.fontSize (0),
   }],
   ['.tag-list-extended__item-info-buttons', {
      display: 'flex',
      'justify-content': 'space-between',
      'margin-bottom': CSS.typography.spaceVer (1.5),
   }],
   // *** tag-list-dropdown.scss ***
   // Tag list dropdown
   ['.tag-list-dropdown', {
      background: '#fff',
      width: 1,
      'list-style-type': 'none',
   }, [
      ['.tag-list-dropdown__item', {
         display: 'flex',
         'padding-left': CSS.vars ['padding--s'],
         'padding-top, padding-bottom': CSS.typography.spaceVer (0.5),
      }],
      ['.tag-list-dropdown__item:hover', {background: CSS.vars ['grey--lightest']}],
   ]],
   // *** tag-list.scss ***
   // Tag list -- Sidebar
   ['.tag-list', {
      display: 'block',
      width: 1,
      'list-style-type': 'none',
   }],
   ['.tag-list__item', {
      display: 'flex',
      'align-items': 'center',
      cursor: 'pointer',
      'margin-bottom': CSS.typography.spaceVer (0.5),
   }],
   ['.sort-arrow', {
      // 'margin-left': .8,
      'margin-left': .63,
   }],
   // Tag list -- Sidebar -- Only selected tags
   ['.app-selected-tags .tag-list--sidebar', [
      ['.tag', {display: 'none'}],
      ['.tag--selected', {display: 'flex'}],
   ]],
   // *** tag.scss ***
   // Tag
   ['.tag', {
      display: 'flex',
      'align-items': 'center',
      position: 'relative',
      width: 1,
      color: 'rgba(' + CSS.toRGBA (CSS.vars ['grey--darker']) + ', 0.8)',
      transition: '250ms linear color',
   }],
   ['.sidebar .tag:hover, .tag--selected', {'color, fill': CSS.vars ['grey--darker']}],
   ['.tags-list-extended .tag', {color: CSS.vars ['grey--darker']}],
   // Tag icon
   ['.tag__icon', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': 3,
   }],
   ['.tag__icon--all path', {fill: CSS.vars ['grey--darker']}],
   ['.tag__icon--untagged path', {fill: 'transparent', stroke: CSS.vars ['grey--darker']}],
   // Tag title
   ['.tag__title', {
      mixin1: CSS.vars.fontPrimaryMedium,
      'margin-right': CSS.vars ['padding--xs'],
      width: 'inherit'
   }],
   ['.videoIcon', {
      'width': 20,
      'margin-right': 3,
      'margin-left': 4,
      'display': 'inline-block',
   }],
   // Tag title - amount
   ['.tag__title-amount', {
      'white-space': 'nowrap',
      'margin-left, margin-right': 3,
      mixin1: CSS.vars.fontPrimaryRegular,
   }],
   // Tag info
   ['.tag__status', {display: 'flex'}],
   ['.tag__status-icon', {
      display: 'inline-block',
      'width, height': 24,
   }, ['path', {fill: CSS.vars ['grey--darker']}]],
   ['.number_of_pivs', {
      // color: CSS.vars ['color--one'],
      // float: 'right',
      mixin1: CSS.vars.fontPrimaryMedium,
      'margin-right': 40,
      'text-align': 'right'
   }],
   // *** tag-actions.scss ***
   // Tag actions
   ['.tag-actions', {
      position: 'absolute',
      display: 'inline-block',
      top: 0.5,
      right: 0,
      transform: 'translateY(-50%)',
      'width, height': 24,
      'border-radius': 20,
      transition: CSS.vars.easeOutQuart,
   }],
   // tag list horizontal
   ['.tag-list-horizontal .tag-actions', {
      position: 'relative',
      'top, right': 'auto',
      transform: 'none',
   }],
   ['.tag-actions__item', {
      display: 'none',
      cursor: 'pointer',
      'border-radius': 100,
   }],
   // tag list horizontal
   ['.tag-list-horizontal .tag-actions__item', {
      display: 'inline-block',
      'margin-left': CSS.vars ['padding--xs'],
   }],
   // Tag actions - items
   ['.tag-actions__item--attach', {
      'background-color': CSS.vars ['grey--lighter'],
      fill: CSS.vars.grey,
   }, ['&:hover', {fill: CSS.vars ['grey--darker']}]],
   ['.tag-actions__item--deselect', {
      'background-color': CSS.vars ['grey--lighter'],
      fill: CSS.vars.grey,
   }, ['&:hover', {fill: CSS.vars ['grey--darker']}]],
   ['.tag-actions__item--attached', {
      'background-color': CSS.vars ['color--attach'],
      fill: '#fff',
   }],
   ['.tag-actions__item--untag', {
      'background-color': CSS.vars ['color--remove'],
      fill: '#fff',
   }],
   ['.tag-actions__item-icon', {
      display: 'inline-block',
      'width, height': 24,
   }],
   // Tag actions -- View pictures
   ['.app-pictures', [
      // Selected tag
      ['.tag--selected .tag-actions__item--selected', {display: 'flex'}],
      // Deselect tag
      ['.tag--selected .tag-actions:hover', [
         ['.tag-actions__item--selected', {display: 'none'}],
         ['.tag-actions__item--deselect', {display: 'flex'}],
      ]],
      // All pictures tag
      // (has no hover because you can't deselect it)
      ['.tag--all-pictures.tag--selected:hover', [
         ['.tag-actions__item--selected', {display: 'flex'}],
         ['.tag-actions__item--deselect', {display: 'none'}],
      ]],
   ]],
   // Tag actions -- Attach tags
   ['.app-attach-tags', [
      ['.tag-actions__item--attach', {display: 'flex'}],
      // tag hover
      ['.tag-actions:hover', [
         ['.tag-actions__item--attach', {display: 'none'}],
         ['.tag-actions__item--attached', {display: 'flex'}],
      ]],
      // tag attached
      ['.tag--attached', [
         ['.tag-actions__item--attach', {display: 'none'}],
         ['.tag-actions__item--attached', {display: 'flex'}],
      ]],
      ['.tag--attached:hover', [
         ['.tag-actions__item--attached', {display: 'none'}],
         ['.tag-actions__item--untag', {display: 'flex'}],
      ]],
      ['.tag--unattached:hover', [
         ['.tag-actions__item--attach', {display: 'none'}],
         ['.tag-actions__item--attached', {display: 'flex'}],
      ]]
   ]],
   // *** tag-share.scss ***
   // Tag shared
   ['.tag-share', {
      display: 'flex',
      width: 1,
      'margin-top': CSS.typography.spaceVer (0.5),
      'margin-bottom': CSS.typography.spaceVer (1),
   }],
   ['.tag-share__item', {
      display: 'inline-flex',
      'align-items, justify-content': 'center',
      'width, height': 36,
      'margin-right': 4,
      'background-color': 'rgba(' + CSS.toRGBA (CSS.vars.grey) + ', 0.1)',
      'border-radius': 100,
      overflow: 'hidden',
   }],
   ['.tag-share__item-email', {
      display: 'inline-flex',
      'align-items, justify-content': 'center',
      'height': 36,
      'width': 'fit-content',
      'margin-right': 4,
      'padding-left': 10,
      'padding-right': 10,
      'margin-bottom': CSS.vars ['padding--xs'],
      'background-color': 'rgba(' + CSS.toRGBA (CSS.vars.grey) + ', 0.1)',
      'border-radius': 100,
      overflow: 'hidden',
   }],
   ['.tag-share__item:hover', {'background-color': 'rgba(' + CSS.toRGBA (CSS.vars.grey) + ', 0.15)'}],
   ['.tag-share__item-icon', {
      display: 'inline-block',
      'width, height': 24,
   }, ['path', {
      fill: 'rgba(' + CSS.toRGBA (CSS.vars ['grey--darker']) + ', 0.7)',
      transition: '250ms linear all',
   }]],
   ['.share-icon', {
      'width, height': 24,
      'margin-top': 5,
      'margin-right': 2
   }],
   ['.tag-share__item:hover path', {fill: CSS.vars ['grey--darker']}],
   ['.tag-share__item-img', {
      display: 'inline-block',
      'width, height': 36,
   }],
   ['.tag-actions__item--deselect-email-shared', {
      height: 24,
      display: 'inline-flex',
      'background-color': '#8b8b8b',
      'fill': '#f2f2f2',
      'margin-left': '6px'
   }],
   ['.email-input-share-div', {
      'margin-bottom': CSS.typography.spaceVer (1),
      width: 500,
   }],
   ['.email-input-share', {
      mixin1: CSS.vars.fontPrimaryItalic,
      height: 36,
      resize: 'none',
      'line-height': 36,
      border: '1px solid ' + CSS.vars ['border-color--dark'],
      'border-radius': 100,
      'padding-left, padding-right': CSS.vars ['padding--s'],
   }],
   ['.see-more-div', {
      'margin-bottom': CSS.typography.spaceVer (1),
      'margin-top': '-' + CSS.typography.spaceVer (1),
   }],
   ['.see-more-span', {
      float: 'right',
      display: 'inline-flex',
      'margin-right': CSS.vars ['padding--m'],
   }],
   ['.see-more-text', {
      'margin-left': 3,
      mixin1: CSS.vars.fontPrimaryMedium,
      cursor: 'pointer',
   }],
   ['.see-more-icon', {
      'margin-top': 2
   }],
   media ('screen and (min-width: 1025px)', [
      ['.see-more-span:hover', {
         color: CSS.vars ['color--one']}, [
         ['.chevron-svg', {stroke: CSS.vars ['color--one']}],
      ]],
   ]),
   ['.emails-container', {
      width: 571,
      // height: 84,
      // overflow: 'hidden'
   }],
   // Piv shared
   ['.shared-box__image', {
      display: 'flex',
      'align-items, justify-content': 'center',
      'width, height': 80,
      'margin-right': CSS.vars ['padding--xs'],
      'border-radius': 100,
      background: CSS.vars ['grey--lighter'],
   }],
   // *** back-link.scss
   // Back link
   ['.back-link--uploads', {
      'border-bottom': CSS.vars.grey + ' 1px solid',
      'padding-bottom': CSS.typography.spaceVer (1),
   }],
   ['.back-link__link', {
      display: 'flex',
      'align-items': 'center',
      color: CSS.vars ['grey--darker'],
      transition: CSS.vars.easeOutQuart,
   }],
   ['.back-link__icon', {
      display: 'inline-block',
      'width, height': 24,
      transition: CSS.vars.easeOutQuart,
   }, ['path', {
      fill: CSS.vars ['grey--darker'],
      transition: CSS.vars.easeOutQuart,
   }]],
   media ('screen and (min-width: 1025px)', [
      ['.back-link__link:hover', {color: CSS.vars ['color--one']}, [
         ['.back-link__icon', {transform: 'translateX(-4px)'}, ['path', {fill: CSS.vars ['color--one']}]],
      ]],
   ]),
   // *** dropdown.scss ***
   ['.dropdown', {
      position: 'relative',
      margin:'auto'
   }],
   ['.dropdown__button', {

      mixin1: CSS.vars.fontPrimaryMedium,
      position: 'relative',
      'padding-right': 20,
      width: 100,
      'text-align': 'right',
      color: CSS.vars.grey,
      // color: 'white',
      cursor: 'pointer',
      transition: CSS.vars.easeOutQuart,
   }, ['&::after', {
      content: "''",
      position: 'absolute',
      top: 0.5,
      'right, width, height': 0,
      'margin-top': -2,
      'border-style': 'solid',
      'border-width': '4px 4px 0 4px',
      'border-color':
      CSS.vars.grey
      // 'white'
      + ' transparent transparent transparent',
      transition: CSS.vars.easeOutQuart,
   }]],
   ['.dropdown__button:hover', {
      // 'font-weight': CSS.vars ['fontPrimarySemiBold'],
      // color: CSS.vars ['grey--darker']
   },
   ['&::after', {
      'border-color': CSS.vars ['grey--darker'] + ' transparent transparent transparent',
   }]],
   ['.dropdown:hover .dropdown__list', {display: 'block'}],
   ['.dropdown__list', {
      display: 'none',
      position: 'absolute',
      top: 20,
      right: 0,
      background: '#fff',
      'border-radius': CSS.vars ['border-radius--m'],
      'box-shadow': '0 0 20px rgba(0, 0, 0, 0.15)',
      'padding-left, padding-right': CSS.vars ['padding--m'],
      'padding-top': CSS.typography.spaceVer (0.6),
      'padding-bottom': CSS.typography.spaceVer (0.7),
   }],
   ['.dropdown__list-item', {
      'margin-bottom, margin-top': CSS.typography.spaceVer (0.5),
      color: CSS.vars.grey,
      transition: CSS.vars.easeOutQuart,
      cursor: 'pointer',
   }],
   ['.dropdown__list-item:hover', {color: CSS.vars ['grey--darker']}],
   // *** upload-box-list.scss ***
   // Upload list
   ['.upload-box-list', {
      display: 'flex',
      'flex-direction': 'column',
      'margin-bottom': CSS.typography.spaceVer (3),
   }],
   ['.upload-box-list__item', {
      display: 'block',
      'margin-bottom': CSS.typography.spaceVer (2),
   }],
   // *** upload-box.scss
   ['.upload-box', {
      display: 'flex',
      border: '1px solid ' + CSS.vars ['border-color--dark'],
      'border-radius': CSS.vars ['border-radius--m'],
      'padding-left': CSS.vars ['padding--m'],
      'padding-right': CSS.vars ['padding--l'],
      'padding-top, padding-bottom': CSS.typography.spaceVer (1),
   }],
   ['.upload-box__image', {
      display: 'flex',
      'align-items, justify-content': 'center',
      'width, height': 80,
      'margin-right': CSS.vars ['padding--l'],
      'border-radius': 100,
      background: CSS.vars ['grey--lighter'],
   }],
   ['.upload-box__image-icon', {
      'width, height': 24,
      display: 'inline-block',
      transform: 'scale(1.5)',
   }, ['path', {fill: CSS.vars.grey}]],
   ['.upload-box__main', {
      display: 'flex',
      flex: '1',
      'flex-direction': 'column',
      'padding-top': 5,
   }],
   ['.upload-box__section', {
      width: 1,
      display: 'flex',
      'flex-direction': 'column',
      'margin-bottom': CSS.typography.spaceVer (1.25),
   }, ['&:last-of-type', {'margin-bottom': 0}]],
   ['.upload-box--recent-uploads .upload-box__section', {'margin-bottom': CSS.typography.spaceVer (0.5)}],
   ['.upload-box__selection', {
      display: 'block',
      'margin-top': CSS.typography.spaceVer (1),
   }],
   ['.upload-box__search', {'margin-bottom': CSS.typography.spaceVer (0.25)}],
   ['.upload-box__section--buttons', {'margin-bottom': CSS.typography.spaceVer (1)}],
   ['.upload-box__section-title', {
      'font-size': CSS.typography.fontSize (1),
      'line-height': CSS.typography.spaceVer (1.25),
      'margin-bottom': CSS.typography.spaceVer (0.5),
   }],
   ['.upload-box--recent-uploads .upload-box__section-title', {'margin-bottom': 0}],
   ['.upload-box__section-title-note', {
      mixin1: CSS.vars.fontPrimaryItalic,
      color: CSS.vars.grey,
   }],
   ['.upload-box__upload-button', {'margin-left': 'auto'}],
   // BLOCKED BUTTONS WHEN views.noSpace IS SHOWING
   ['.blocked-button', {
      cursor: 'default',
      'background-color': '#8b8b8b',
      border: '#8b8b8b'
   }],
   ['.blocked-button:hover', {
      cursor: 'default',
      color: '#fff',
      'background-color': '#8b8b8b',
      border: '#8b8b8b'
   }],
   // *** drag-and-drop.scss ***
   // Drag and drop
   ['.drag-and-drop, .drag-and-drop-import', {
      display: 'flex',
      'flex-direction': 'column',
      'justify-content, align-items': 'center',
      width: 1,
      border: '1px dashed ' + CSS.vars ['border-color--dark'],
      'border-radius': CSS.vars ['border-radius--m'],
      'padding-left, padding-right': CSS.vars ['padding--m'],
      'padding-top, padding-bottom': CSS.typography.spaceVer (1.5),
   }],
   ['.drag-and-drop__icon', {
      display: 'inline-block',
      width: 25,
      height: 33,
      'margin-bottom': CSS.typography.spaceVer (0.25),
   }, ['path', {fill: CSS.vars ['grey--light']}]],
   ['.drag-and-drop__text', {
      color: CSS.vars.grey,
      'text-align': 'center',
      display: 'inline-block',
      'max-width': 230,
   }],
   // *** upload-progress.scss ***
   // Upload progress
   ['.upload-progress', {
      color: CSS.vars ['color--one'],
      display: 'flex',
      'align-items': 'center',
      mixin1: CSS.vars.fontPrimaryMedium,
   }],
   ['.upload-progress__icon', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': 7,
   }, ['path', {fill: CSS.vars ['color--one']}]],
   // *** progress-bar.scss ***
   ['.progress-bar', {
      width: 1,
      height: 4,
      display: 'block',
      'margin-top, margin-bottom': CSS.typography.spaceVer (0.5),
      background: CSS.vars ['grey--lighter'],
      'border-radius': 100,
      overflow: 'hidden',
      position: 'relative',
   }],
   ['.progress-bar__progress', {
      position: 'absolute',
      'top, left': 0,
      background: CSS.vars ['color--one'],
      height: 1,
      // width: 0.2,
      'border-radius': 100,
   }],
   // *** recent-uploads.scss ***
   // Recent uploads
   ['.recent-uploads__title', {
      'font-size': CSS.typography.fontSize (5),
      'line-height': CSS.typography.spaceVer (1.5),
      'margin-bottom': CSS.typography.spaceVer (1),
   }],
   ['.recent-uploads__list-item', {
      display: 'block',
      'margin-bottom': CSS.typography.spaceVer (1),
   }],
   // *** upload-selection.scss ***
   ['.upload-selection', {
      background: '#fff',
      'box-shadow': '0 0 10px rgba(0, 0, 0, 0.12)',
      'padding-left': CSS.vars ['padding--m'],
      'padding-right': CSS.vars ['padding--s'],
      'padding-top, padding-bottom': CSS.typography.spaceVer (0.75),
      display: 'flex',
      'align-items': 'center',
      'border-radius': CSS.vars ['border-radius--l'],
      color: CSS.vars ['color--one'],
   }],
   ['.upload-selection__icon', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': CSS.vars ['padding--xs'],
   }, ['path', {fill: CSS.vars ['color--one']}]],
   ['.upload-selection__text', {mixin1: CSS.vars.fontPrimaryMedium}],
   ['.upload-selection__remove', {'margin-left': 'auto'}],
   // IMPORT LOGOS
   ['.dropbox-logo', {
      height: '30px',
      width: '152.35px'
   }],
   ['.google-drive-logo', {
      height: 30,
      width: 98,
      'background-size': '98px 30px',
      'background-image': 'url(assets/img/google-drive-logo.png)',
   }],
   // RECENT IMPORTS
   ['.recent-imports__title', {
      'font-size': CSS.typography.fontSize (5),
      'line-height': CSS.typography.spaceVer (1.5),
      'margin-bottom': CSS.typography.spaceVer (1),
   }],
   // IMPORT PROCESS
   ['.import-file-list'],
   ['.import-breadcrumb-container', {
      width: 1,
      display: 'inline-flex',
      'flex-grow': '1',
      height: CSS.typography.spaceVer (1.5),
   }],
   ['.import-breadcrumb-icon', {
      width: .15,
      'text-align': 'center',
      'padding-left': '7px',
   }],
   ['.import-breadcrumb', {
      height: 'inherit',
      width: .85,
   }],
   ['.import-process-box', {
      display: 'inline-flex',
      'flex-grow': '1',
      width: 1,
      height: CSS.typography.spaceVer (11),
      //'margin-top': CSS.typography.spaceVer (1.5),
      border: '1px solid ' + CSS.vars ['border-color--dark'],
   }],
   ['.import-process-box-back', {
      'border-right': '1px solid ' + CSS.vars ['border-color--dark'],
      width: .15,
      'text-align': 'center',
      position: 'relative',
   }],
   ['.import-process-box-back-icon', {
      position: 'absolute',
      top: 0.4,
      left: .1,
      transform: 'translateY(-50%)',
      transform: 'scaleX(-1)',
      display: 'inline-block',
      cursor: 'pointer',
   }],
   ['.import-process-box-back-icon__icon', {
      display: 'inline-block',
      width: 10,
      height: 34,
      fill: CSS.vars.grey,
      transition: CSS.vars.easeOutQuart,
   }],
   ['.import-process-box-back-icon:hover .import-process-box-back-icon__icon', {fill: CSS.vars ['grey--light']}],
   ['.import-process-box-back-text', {
      'margin': 0,
      'position': 'absolute',
      'top': .48,
      'left': .3,
      '-ms-transform': 'translateY(-50%)',
      'transform': 'translateY(-50%)',
   }],
   ['.import-process-box-list', {
      'border-right': '1px solid ' + CSS.vars ['border-color--dark'],
      width: .55,
   }],
   ['.import-process-box-list-up', {
      display: 'inline-flex',
      'align-items': 'center',
   }],
   ['.up-icon', {
      display: 'flex',
      cursor: 'pointer',
      'flex-flow': 'row-reverse',
      'padding-right, padding-left': CSS.vars ['padding--xs'],
      'padding-top, padding-bottom': CSS.vars ['padding--xs'],
      '-ms-transform': 'rotateZ(-180deg)',
      'transform': 'rotateZ(-180deg)',
   }],
   ['.up-icon__svg', {
      display: 'inline-block',
      width: 20,
      height: 26,
      'margin-bottom, margin-top': CSS.typography.spaceVer (0.25),
   }, ['path', {fill: CSS.vars ['grey--light']}]],
   ['.import-process-box-list-folders', {
      'padding-bottom': CSS.vars ['padding--xs'],
      'overflow-y': 'auto',
   }],
   ['.import-process-box-list-folders-row', {
      display: 'inline-flex',
      width: 1,
      height: 20,
   }],
   ['.select-folder-box', {
      display: 'inline-flex',
      'padding-left': CSS.vars ['padding--m'],
   }],
   ['.checkbox-container', {
      display: 'block',
     'position': 'relative',
     'padding-left': '35px',
     'margin-bottom': '12px',
     'cursor': 'pointer',
     'font-size': '22px',
     '-webkit-user-select': 'none',
     '-moz-user-select': 'none',
     '-ms-user-select': 'none',
     'user-select': 'none',
   }],
   ['.checkbox-container input',{
      'position': 'absolute',
      'opacity': '0',
      'cursor': 'pointer',
      'height': '0',
      'width': '0',
   }],
   ['.checkbox'],
   ['.select-folder-box-checkmark', {
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'height, width': '20px',
      border: '0.5px solid ' + CSS.vars ['border-color--dark'],
   }],
   /* On mouse-over, add a background color */
   ['.checkbox-container:hover input ~ .select-folder-box-checkmark', {
      'background-color': '#ccc',
   }],
   /* When the checkbox is checked, add a background */
   ['.checkbox-container input:checked ~ .select-folder-box-checkmark', {
      'background-color': '#5b6eff',
   }],
   /* Create the checkmark/indicator (hidden when not checked) */
   ['.select-folder-box-checkmark:after', {
      'content': '""',
      position: 'absolute',
      display: 'none',
   }],
   /* Show the checkmark when checked */
   ['.checkbox-container input:checked ~ .select-folder-box-checkmark:after', {
      display: 'block',
   }],
   /* Style the checkmark/indicator */
   ['.checkbox-container .select-folder-box-checkmark:after', {
      'left': '6px',
      'top': '1px',
      'width': '4px',
      'height': '10px',
      'border': 'solid white',
      'border-width': '0 3px 3px 0',
      '-webkit-transform': 'rotate(45deg)',
      '-ms-transform': 'rotate(45deg)',
      'transform': 'rotate(45deg)',
   }],
   ['.folder-icon', {
      height: 20,
      width: 20,
      'margin-right': CSS.vars ['padding--xs'],
   }],
   ['.import-folder-name', {
      'margin-right': CSS.vars ['padding--xs'],
      width: .45,
      overflow: 'auto', //NOT FINAL SOLUTION
   }],
   ['.import-folder-files', {
      'color': CSS.vars ['grey--darker'],
      'font-weight': CSS.vars.fontPrimaryMedium,
   }],
   ['.import-process-box-selected', {
      width: .30,
      'padding-bottom': CSS.vars ['padding--xs'],
   }],
   ['.import-process-box-selected-title', {
      'text-align': 'center',
      'font-weight': CSS.vars.fontPrimaryMedium,
      'margin-bottom': CSS.vars ['padding--xs'],
   }],
   ['.import-process-box-selected-row-container', {
      'overflow-y': 'auto',
      height: '187px',
   }],
   ['.import-process-box-selected-row', {
      width: 1,
      display: 'inline-flex',
      'align-items': 'center',
      'padding-right, padding-left': CSS.vars ['padding--xs'],
   }],
   ['.selected-folder-name', {
      'margin-right': CSS.vars ['padding--xs'],
      width: .65,
   }],
   ['.selected-folder-deselect', {
      display: 'inline-block',
      'width, height': 24,
      'margin-left': 'auto',
      'margin-right': 0,
      'background-color': CSS.vars ['grey--lighter'],
      fill: CSS.vars.grey,
   }],
   ['.selected-folder-deselect:hover', {fill: CSS.vars ['grey--darker']}],
   ['.selected-folder-deselect__icon', {
      'width, height': 24,
   }],
   ['.listing-table-container', {
      display: 'inline-block',
      width: 1
   }],
   ['.start-import-button', {
      float: 'right',
      border: '1px solid #5b6eff',
      color: '#fff',
      'background-color': '#5b6eff',
      cursor: 'pointer',
      'margin-top': CSS.vars ['padding--xs'],
   }],
   ['.start-import-button:hover', {
      color: '#5b6eff',
      'background-color': '#fff',
   }],
   // GO BACK TO VIEW PICTURES
   ['.go-back-to-view-pictures', {
      display: 'inline-flex',
      'margin-right': 'auto',
      'margin-left': 'auto',
      'margin-bottom': CSS.vars ['padding--l'],
   }],
   ['.go-back-to-view-pictures-p, .go-back-to-view-pictures-a', {
      'font-size': CSS.typography.fontSize (1),
   }],
   ['.go-back-to-view-pictures-p', {
      'margin-right': CSS.vars ['padding--xs'],
   }],
   ['.go-back-to-view-pictures-a', {
      color: CSS.vars ['color--one'],
      'text-decoration': 'underline',
      'font-weight': CSS.vars ['fontPrimarySemiBold'],
   }],
   ['.go-back-to-view-pictures-a:hover', {
      color: CSS.vars ['color--one'],
   }],
   // BOXED ALERTS
   ['.boxed-alert', {
      display: 'flex',
      'margin-top': CSS.vars ['padding--xxl'],
      border: '1px solid ' + CSS.vars ['border-color--dark'],
      'border-radius': CSS.vars ['border-radius--m'],
      'padding-left': CSS.vars ['padding--m'],
      'padding-right': CSS.vars ['padding--l'],
      'padding-top, padding-bottom': CSS.typography.spaceVer (1),
   }],
   ['.space-alert__image', {
      'display': 'flex',
      'align-items, justify-content': 'center',
      'width, height': 80,
      'margin-right': CSS.vars ['padding--l'],
      'border-radius': 100,
      background: CSS.vars ['grey--lighter'],
   }],
   ['.space-alert-icon', {
      'width': 24,
      'height': 28,
      display: 'inline-block',
      transform: 'scale(1.5)',
   }, ['path', {fill: CSS.vars ['color--remove']}]],
   ['.boxed-alert__main', {
      display: 'flex',
      flex: '1',
      'flex-direction': 'column',
      'padding-top': 5,
   }],
   ['.boxed-alert-message', {
      color: CSS.vars ['color--one'],
      display: 'flex',
      'align-items': 'center',
      mixin1: CSS.vars.fontPrimaryMedium,
   }],
   ['.space-alert-icon-small', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': 7,
   }, ['path', {fill: CSS.vars ['color--remove']}]],
   ['.google-drive-icon', {
      'width': 24,
      'height': 24,
      display: 'inline-block',
      transform: 'scale(1.5)',
   }, //['path', {fill: CSS.vars ['color--remove']}]
   ],
   ['.google-drive-icon-small', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': 7,
   }, //['path', {fill: CSS.vars ['color--remove']}]
   ],
   ['.dropbox-icon', {
      'width': 24,
      'height': 22,
      display: 'inline-block',
      transform: 'scale(1.5)',
   },// ['path', {fill: CSS.vars ['color--remove']}]
   ],
   ['.dropbox-icon-small', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': 7,
   }, //['path', {fill: CSS.vars ['color--remove']}]
   ],
   ['.boxed-alert__main', {
      display: 'flex',
      flex: '1',
      'flex-direction': 'column',
      'padding-top': 5,
   }],
   ['.boxed-alert-button-left', {
      'float': 'left',
      'border': '1px solid #8b8b8b',
      'color': '#8b8b8b',
      'background-color': '#fff',
      'cursor': 'pointer',
   }],
   ['.boxed-alert-button-left:hover', {
      color: '#fff',
      'background-color': '#8b8b8b',
   }],
   ['.boxed-alert-button-right', {
      float: 'right',
      border: '1px solid #5b6eff',
      color: '#fff',
      'background-color': '#5b6eff',
      cursor: 'pointer',
   }],
   ['.boxed-alert-button-right:hover', {
      color: '#5b6eff',
      'background-color': '#fff',
   }],
   ['.boxed-try-again-alert-button-left', {
      'float': 'left',
      'border': '1px solid coral',
      'color': 'coral',
      'background-color': '#fff',
      'cursor': 'pointer',
   }],
   ['.boxed-try-again-alert-button-left:hover', {
      color: '#fff',
      'background-color': 'coral',
   }],
   //LISTING ALERT
   ['.files-found-so-far, .folders-found-so-far', {
      display: 'flex',
   }],
   ['.files-found-so-far', {
      'margin-bottom': CSS.vars ['padding--xs'],
   }],
   ['.files-found-so-far div, .folders-found-so-far div', {
      'margin-left': CSS.vars ['padding--xs'],
   }],
   ['.listing-progress', {
      display: 'inline-block',
   }],
   // DOUBLE CLICK ALERT
   ['.click-double-click-alert', {
      'margin-left, margin-right': 'auto',
   }],
   // ACCOUNT
   ['.account-box', {
      display: 'flex',
   }],
   ['.account-box__margin', {
      display: 'flex',
      'align-items, justify-content': 'center',
      'width, height': 80,
      'margin-right': CSS.vars ['padding--l'],
   }],
   ['.account-box__main', {
      display: 'flex',
      flex: '1',
      'flex-direction': 'column',
      'padding-top': 5,
   }],
   ['.account-content-container', {
      display: 'flex',
    'flex-direction': 'column',
    'justify-content': 'center',
     width: 1,
   }],
   ['.geo-and-password-table', {
      width: 1,
   }],
   ['.enable-geotagging, .change-password', {
      'height': CSS.typography.spaceVer (3),
      'border-bottom': '1px solid ' + CSS.vars ['border-color--dark'],
   }],
   ['label.switch', {
      'position': 'relative',
      'float': 'right',
      display: 'inline-block',
      width: '60px',
      height: '34px'
   }],
   ['label.switch input', {
      opacity: 0,
      width: 0,
      height: 0
   }],
   ['.geo-slider', {
      position: 'absolute',
      cursor: 'pointer',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      'background-color': '#dedede',
      '-webkit-transition': '.4s',
      'transition': '.4s',
      'border-radius': '34px'
   }],
   ['.geo-slider:before', {
      position: 'absolute',
      content: '""',
      height: '26px',
      width: '26px',
      left: '4px',
      bottom: '4px',
      'background-color': 'white',
      '-webkit-transition': '.4s',
      'transition': '.4s',
      'border-radius': .5
   }],
   ['input:checked + .geo-slider', {
      'background-color': '#5b6eff'
   }],
   ['input:focus + .geo-slider', {
      'box-shadow': '0 0 1px #5b6eff'
   }],
   ['input:checked + .geo-slider:before', {
      '-webkit-transform': 'translateX(26px)',
      '-ms-transform': 'translateX(26px)',
      'transform': 'translateX(26px)',
   }],
   ['.change-password-button', {
      border: '1px solid #8b8b8b',
      color: '#8b8b8b',
      'background-color': '#fff',
      'float': 'right',
      cursor: 'pointer',
   }],
   ['.change-password-button:hover', {
      color: '#fff',
      'background-color': '#8b8b8b'
   }],
   ['.text-left-table', {
      'padding-left': CSS.typography.spaceVer (.25),
   }],
   ['.text-left-table, .geo-slider, .change-password-button', {
      'font-size': CSS.typography.fontSize (1),
      'vertical-align': 'middle',
   }],
   ['.change-password-form', {
      width: .5,
      'margin-left': .5
   }],
   ['.change-password-placeholder', {
      'margin-top': CSS.typography.spaceVer (1),
      'margin-bottom': CSS.typography.spaceVer (1),
   }],
   ['.change-password-button-confirm', {
      border: '1px solid #5b6eff',
      color: '#fff',
      'background-color': '#5b6eff',
      'float': 'left',
      cursor: 'pointer',
      'margin-left': .2
   }],
   ['.change-password-button-confirm:hover', {
      color: '#5b6eff',
      'background-color': '#fff',
   }],
   ['.change-password-button-cancel', {
      border: '1px solid #8b8b8b',
      color: '#8b8b8b',
      'background-color': '#fff',
      'float': 'right',
      cursor: 'pointer',
   }],
   ['.change-password-button-cancel:hover', {
      color: '#fff',
      'background-color': '#8b8b8b',
   }],
   ['.usage-and-account-type', {
      'font-size': CSS.typography.fontSize (2),
      'line-height': CSS.typography.spaceVer (3),
      'margin-top': CSS.typography.spaceVer (1),
      'margin-bottom': CSS.typography.spaceVer (1),
      'text-align': 'center',
      'margin-right, margin-left': 'auto',
      'color': CSS.vars ['grey--darker'],
      'font-weight': CSS.vars.fontPrimaryMedium,
   }],
   ['.account-data', {
      width: 1,
   }],
   ['.space-usage-bar', {
      'float': 'right',
      height: '42px',
      width: '200px',
      'border': '1px solid #8b8b8b',
      'border-radius': '100px',
   }],
   ['.space-limit-box', {
      width: .5,
      'float': 'right',
      'text-align': 'center',
   }],
   ['.space-limit, .account-type, .paid-space-used, .average-paid-space-used, .paid-space-currently-used, .total-estimated-cost', {
      'border-top': '1px solid ' + CSS.vars ['border-color--dark'],
   }],
   ['.right-pointing-triangle', {
      display: 'inline',
      cursor: 'pointer'
   }],
   ['.down-pointing-triangle', {
      display: 'none',
      cursor: 'pointer'
   }],
   ['.text-left-account-data-table', {
      'font-size': CSS.typography.fontSize (1),
   }],
   ['.subtext-left-table', {
      'font-size': CSS.typography.fontSize (-1),
   }],
   ['.text-left-account-data-table', {
      'padding-top': CSS.typography.spaceVer (1),
      'padding-left': CSS.typography.spaceVer (.25),
   }],
   ['.subtext-left-table td', {
      'padding-bottom': CSS.typography.spaceVer (1),
      'padding-left': CSS.typography.spaceVer (.25),
   }],
   ['.values-right-table', {
      'text-align': 'right',
      'font-size': CSS.typography.fontSize (1),
   }],
   ['.total-estimated-cost', {
      'border-bottom': '1px solid ' + CSS.vars ['border-color--dark'],
      'color': CSS.vars ['grey--darker'],
      'font-weight': CSS.vars.fontPrimaryMedium,
   }],
   ['.total-estimated-cost td',{
      'padding-bottom': CSS.typography.spaceVer (1),
   }],
   ['.call-to-action-text', {
      'text-align': 'right',
      'color': '#5b6eff',
      'font-size': CSS.typography.fontSize (1),
      'font-weight': CSS.vars.fontPrimaryMedium,
      'text-decoration': 'underline',
      'cursor': 'pointer',
   }],
   ['.cancel-account', {
      'padding-top': CSS.typography.spaceVer (1),
      'font-size': CSS.typography.fontSize (1),
      'text-decoration': 'underline',
   }],
   // UPGRADE VIEW
   ['.free-vs-paid', {
      'font-size': CSS.typography.fontSize (2),
      'line-height': CSS.typography.spaceVer (3),
      'margin-bottom': CSS.typography.spaceVer (1),
      'text-align': 'center',
      'margin-right, margin-left': 'auto',
      'color': CSS.vars ['grey--darker'],
      'font-weight': CSS.vars.fontPrimaryMedium,
   }],
   ['.upgrade-table', {
      'width': 1,
      'border-collapse': 'collapse'
   }],
   ['.upgrade-table tr', {
      'height': CSS.typography.spaceVer (3),
   }],
   ['.upgrade-table td', {
      'border': '1px solid ' + CSS.vars ['border-color--dark'],
      'vertical-align': 'middle',
   }],
   ['.free-vs-paid-col-1', {
      'width': .5,
      'padding-left': CSS.vars ['padding--xs'],
   }],
   ['.free-vs-paid-col-2, .free-vs-paid-col-3', {
      width: .25,
      'text-align': 'center',
      'font-size': CSS.typography.fontSize (1),
   }],
   ['.upgrade-table-info', {
      'float': 'right',
      'padding-right': CSS.vars ['padding--s'],
   }],
   ['.upgrade-table-info-icon', {
      'font-size': CSS.typography.fontSize (2),
      'font-weight': CSS.vars.fontPrimarySemiBold,
      'color': CSS.vars ['grey'],
      'cursor': 'pointer',
   }],
   ['.upgrade-table-info-comment', {
      'position': 'relative',
      'display': 'inline-block',
      'vertical-align': 'top',
   }],
   ['.upgrade-table-info-comment .hover-text', {
      'visibility': 'hidden',
      'width': '310px',
      'background-color': CSS.vars ['grey--light'],
      'color': CSS.vars ['grey--darker'],
      'border': '1px solid ' + CSS.vars ['border-color'],
      'border-radius': CSS.vars ['border-radius--m'],
      'font-size': CSS.typography.fontSize (1),
      'font-weight': CSS.vars.fontPrimaryRegular,
      'text-align': 'center',
      'top': '-16px',
      'position': 'absolute',
      'z-index': 1,
      'left': .5,
      'padding': CSS.vars ['padding--xs'],
      'margin-left': CSS.vars ['padding--m'],
      'transition': 'all cubic-bezier(0.165, 0.84, 0.44, 1)'
   }],
   ['.upgrade-table-info-comment .hover-text::after', {
   'content': '""',
   'position': 'absolute',
   }],
   ['.upgrade-table-info-icon:hover + .upgrade-table-info-comment .hover-text', {
      'visibility': 'visible',
   }],
   ['.call-to-action-upgrade', {
      'color': '#5b6eff',
      'font-size': CSS.typography.fontSize (1),
      'font-weight': CSS.vars.fontPrimaryMedium,
      'text-decoration': 'underline',
      'cursor': 'pointer',
   }],
   ['.stripe-message-upgrade', {
      'font-size': CSS.typography.fontSize (-1),
      'padding-left, padding-right': CSS.vars ['padding--xs'],
   }],
   // *** pictures-header.scss ***
   ['.pictures-header', {
      'background-color': 'white',
      // 'border-radius': 12,
      'margin-right': 22,
      'margin-bottom': CSS.typography.spaceVer (2),
      'padding-right': CSS.vars ['padding--m'],
      'padding-top': CSS.vars ['padding--s'],
      // position: 'relative',
      position: 'sticky',
      top: CSS.typography.spaceVer (2.95),
      'z-index': '10',
      height: CSS.typography.spaceVer (7),
   }],
   ['.pictures-grid-title-container', {
      'text-align': 'center',
      height: 60,
      'margin-top': CSS.vars ['padding--m'],
   }],
   ['.pictures-header__title',{
      width: .6,
      // color: 'white',
      display: 'inline-block',
      'text-align': 'left',
      'float': 'left',
      'margin-left': CSS.vars ['padding--xs'],
      'line-height': CSS.typography.spaceVer (2),
      'margin-top': CSS.vars ['padding--s'],
   }],
   ['.previous-and-next-chunk',{
      // 'margin-top': CSS.vars ['padding--s'],
      display: 'inline-flex',
      'margin-top': '-10px',
      cursor: 'pointer',
      // color: 'white',
      // width: .3,
      // 'text-align': 'right',
   }],
   ['.chevron-container-previous-chunk, .next-chunk-filler-td', {
      // 'border': 'solid 1px blue',
   }],
   ['.previous-chunk-td, .next-chunk-td',{
      // display: 'inline-block',
      // 'margin-right': CSS.vars ['padding--xl'],
      width: 120,
   }],
   ['.chevron-svg', {
      'margin-top': 3,
   }],
   ['.chevron-container-previous-chunk, .chevron-container-next-chunk', {
      height: 20,
      width: 24,
      'margin-left, margin-right': 'auto',
   }],
   ['.chevron-container-previous-chunk', {
      transform: 'rotate(180deg)',
   }],
   ['.pictures-header__sort', {
      // display: 'inline-flex',
      // 'margin-left': 'auto',
      'margin-top': 19,
      display: 'inline-block',
      float: 'right',
      // 'line-height': CSS.typography.spaceVer (3.33),
      width: .09,

   }],
   ['.pictures-header__action-bar', {
      // 'margin-top': CSS.typography.spaceVer (0.3),
      display: 'flex',
      width: 1,
      'align-items': 'center',
   }],
   ['.pictures-header__selected-tags', {display: 'inline-flex'}],
   ['.pictures-header__sort', {
      display: 'inline-flex',
      'margin-left': 'auto',
   }],
   // *** pictures-grid.scss ***
   ['.pictures-grid', {
      display: 'flex',
      'flex-direction': 'row',
      'flex-wrap': 'wrap',
      'justify-content': 'flex-start',
      width: 1,
   }],
   ['.pictures-grid__item', {
      display: 'inline-flex',
      height: CSS.pivWidths [1],
      'padding-right': 16,
      'padding-bottom': 18,
      position: 'relative',
   }],
   ['.pictures-grid__item', {width: CSS.pivWidths [0]}],
   ['.pictures-grid__item:nth-child(4n+12)', {width: CSS.pivWidths [3]}],
   ['.pictures-grid__item:nth-child(3n+0)', {width: CSS.pivWidths [2]}],
   ['.pictures-grid__item:nth-child(5n+7)', {width: CSS.pivWidths [1]}],
   ['.pictures-grid__item-picture', {
      background: CSS.vars ['grey--light'],
      'width, height': 1,
      'border-radius': CSS.vars ['border-radius--l'],
      position: 'relative',
      transition: CSS.vars.easeOutQuart,
      'transition-duration': '200ms',
      cursor: 'pointer',
   }],
   ['.pictures-grid__item-picture::after', {
      content: '""',
      position: 'absolute',
      'top, right': -8,
      'width, height': 16,
      'border-radius': 20,
      display: 'inline-block',
      background: CSS.vars ['color--one'],
      opacity: '0',
      transition: '100ms linear',
   }],
   ['.pictures-grid__item-picture.selected', {transform: 'scale(0.8)'}, [
      ['&::after', {opacity: '1', transition: '100ms linear'}]
   ]],
   // *** organise-bar.scss ***
   ['.organise-bar', {
      position: 'fixed',
      'z-index': '1',
      top: 58, // header height
      left: 0,
      width: 1,
      height: 'auto',
      transform: 'translateY(-100%)',
      transition: CSS.vars.easeOutQuart,
   }],
   ['.app-show-organise-bar .organise-bar', {transform: 'none'}],
   ['.organise-bar__inner', {
      background: 'white',
      width: 1,
      display: 'flex',
      'align-items': 'center',
      height: 50,
      'border-bottom': '1px solid ' + CSS.vars ['grey--lighter'],
      'padding-left': CSS.vars ['sidebar-width'] + CSS.vars ['padding--l'],
      'padding-right': CSS.vars ['padding--m'],
   }],
   ['.organise-bar__selected', {
      display: 'flex',
      'flex-wrap': 'nowrap',
      'align-items': 'center',
   }],
   ['.organise-bar__selected-title', {'margin-left': CSS.vars ['padding--xs']}],
   ['.organise-bar__button', {
      display: 'inline-flex',
      'align-items': 'center',
      opacity: '0.5',
      transition: 'linear 250ms all',
      cursor: 'pointer',
      'margin-left': CSS.vars ['padding--m'],
   }],
   ['.organise-bar__button--delete', {
      'margin-left': 'auto',
      'background-color': 'rgba(' + CSS.toRGBA (CSS.vars ['color--remove']) + ', 0.05)',
      'padding-left': 10,
      'padding-right': 14,
      'border-radius': 100,
      height: 32,
      color: 'rgba(' + CSS.toRGBA (CSS.vars ['color--remove']) + ', 0.7)',
      opacity: '1',
   }, [
      ['&:hover', {'background-color': 'rgba(' + CSS.toRGBA (CSS.vars ['color--remove']) + ', 0.1)'}],
      ['.organise-bar__button-icon path', {fill: 'rgba(' + CSS.toRGBA (CSS.vars ['color--remove']) + ', 0.7)'}],
   ]],
   ['.organise-bar__button:hover', {opacity: '1'}],
   ['.organise-bar__button-title', {'margin-left': 4}],
   ['.organise-bar__button-icon-container', {
      'border-radius': 100,
      'background-color': CSS.vars ['grey--lighter'],
      'height, width': 24,
      display: 'inline-block',
   }],
   ['.organise-bar__button-icon', {
      display: 'inline-block',
      'width, height': 24,
      fill: CSS.vars ['grey--darker'],
   }],
   // *** selected-box.scss ***
   // Selected box (in organise bar)
   ['.selected-box', {
      position: 'relative',
      background: CSS.vars ['color--one'],
      'border-radius': 12,
      'min-width, min-height': 22,
      'padding-top': '1px',
      'padding-left, padding-right': 5,
      color: '#fff',
      display: 'flex',
      'align-items, justify-content': 'center',
   }],
   ['.selected-box__close', {
      position: 'absolute',
      'z-index': '1',
      'top, left': 0.5,
      'width, height': 24,
      'margin-top, margin-left': -12,
      display: 'none',
      cursor: 'pointer',
   }],
   ['.selected-box__close-icon path', {fill: '#fff'}],
   ['.selected-box:hover', [
      ['.selected-box__close', {display: 'inline-block'}],
      ['.selected-box__count', {opacity: 0}],
   ]],
   // *** show-hidden.scss ***
   // Show hidden
   ['.show-hidden', {
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'flex-end',
      cursor: 'pointer',
      'margin-bottom': CSS.typography.spaceVer (0.5),
   }],
   ['.show-hidden__icon', {
      display: 'none',
      'width, height': 24,
   }, ['path', {fill: CSS.vars ['grey--darker']}]],
   ['.show-hidden__icon--open path', {fill: CSS.vars ['color--one']}],
   ['.show-hidden__title-status', {display: 'none'}],
   ['.app-tags-hidden', [
      ['.show-hidden__icon--closed', {display: 'inline-block'}],
      ['.show-hidden__title-status--show', {display: 'inline-block'}],
   ]],
   ['.app-tags-hidden-open', [
      ['.show-hidden__icon--open', {display: 'inline-block'}],
      ['.show-hidden__title-status--closed', {display: 'inline-block'}],
   ]],
   // *** tags-search-bar.scss ***
   ['.tags-search-bar', {
      position: 'relative',
      display: 'block',
      'margin-bottom': CSS.typography.spaceVer (2),
   }],
   ['.tags-search-bar__search-input', {
      border: '1px solid ' + CSS.vars ['border-color'],
      'border-radius': 100,
      'padding-left': 42,
      mixin1: CSS.vars.fontPrimaryItalic,
      'line-height, height': 46
   }],
   ['.tags-search-bar__search-icon', {
      position: 'absolute',
      top: 0.5,
      left: 14,
      'width, height': 24,
      'margin-top': -12,
      'pointer-events': 'none',
   }],
   ['.tags-search-bar-table-search-by-me .tag-share__item-icon path', {
      fill: CSS.vars ['grey--darker'],
   }],
   ['.tags-search-bar__search-icon path', {fill: CSS.vars.grey}],
   ['.tags-search-bar__shared', {
      position: 'absolute',
      right: 18,
      top: 0.5,
      transform: 'translateY(-50%)',
      color: CSS.vars ['grey--darker'],
      display: 'flex',
      'align-items': 'center',
      cursor: 'pointer',
      'text-align': 'center'
   }],
   ['.tags-search-bar-table-search-with-me, .tags-search-bar-table-search-by-me', {
      'line-height': 12,
      'font-size': 12,
      opacity: '0.6',
   }],
   ['.tags-search-bar-table-search-by-me', {
      'margin-left': CSS.vars ['padding--s'],
   }],
   ['.tags-search-bar__shared-icon', {
      'width, height': 24,
      display: 'inline-block',
      'margin-right': 4,
   }, ['path', {fill: CSS.vars ['grey--darker']}]],
   ['.app-shared-tags-filtered', {
      opacity: '1',
      color: CSS.vars ['color--one'],
   }],
   ['.app-shared-tags-filtered .tags-search-bar__shared-icon path', {fill: CSS.vars ['color--one']}],
   ['.app-shared-tags-filtered .tag-share__item-icon path', {fill: CSS.vars ['color--one']}],

   // *** popup.scss ***
   ['.popup', {
      position: 'fixed',
      'height, width': 1,
      'top, left': 0,
      background: 'rgba(' + CSS.toRGBA (CSS.vars ['grey--darkest']) + ', 0.9)',
      'z-index': '10000',
      display: 'flex',
      'justify-content, align-items': 'center',
      'overflow-y': 'auto',
      'pointer-events': 'none',
      opacity: 0,
      transition: 'all ' + CSS.vars.easeOutQuart,
   }],
   ['.app-popup .popup', {
      opacity: '1',
      'pointer-events': 'all',
   }],
   ['.popup__close', {
      position: 'absolute',
      top: 20,
      right: 24,
   }],
   // *** popup-box.css ***
   ['.popup-box', {
      background: 'rgba(255, 255, 255, 0.9)',
      'max-width': 520,
      width: 1,
      'min-height': 100,
      'text-align': 'center',
      'box-shadow': '0 0 10px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
   }],
   // *** close-button.scss ***
   // Close button
   ['.close-button', {
      display: 'flex',
      'width, height': 48,
      position: 'relative',
      'align-items, justify-content': 'center',
      cursor: 'pointer',
   }],
   // --- close  button--small --- //
   ['.close-button--small', {'width, height': 22}],
   ['.close-button__inner', {
      display: 'inline-block',
      position: 'relative',
      'width, height': 32,
   }],
   // --- close  button--small inner --- //
   ['.close-button--small .close-button__inner', {'width, height': 12}],
   ['.close-button__line', {
      position: 'absolute',
      'top, left': 0.5,
      'margin-left': -0.5,
      display: 'inline-block',
      width: 1,
      height: '1px',
      'background-color': '#000',
      transform: 'rotate(-45deg)',
      transition: 'all ' + CSS.vars.easeOutQuart,
   }],
   ['.close-button__line:last-child', {transform: 'rotate(45deg)'}],
   media ('screen and (min-width: 1025px)', ['.close-button:hover .close-button__line', {'background-color': '#ccc'}]),
   // *** cross.scss ***
   ['.cross-button', {
      display: 'inline-flex',
      'justify-content, align-items': 'center',
      cursor: 'pointer',
      'width, height': 32,
   }, [
      CSS.vars.cross ('.cross-button__cross', 16, CSS.vars.grey),
      ['&:hover .cross-button__cross', CSS.vars.crossHover ()],
   ]],
   // ------ Cross button big (in sidebar) ------ //
   ['.cross-button--big', {
      'width, height': 48
   }, CSS.vars.cross ('.cross-button__cross', 24, CSS.vars.grey)],
   // ------ Remove tag ( in upload-box ) ------ //
   ['.cross-button--remove-tag', {
      'width, height': 24,
      background: CSS.vars ['grey--lighter'],
      'border-radius': 100,
      transition: CSS.vars.easeOutQuart,
      'margin-left': 5,
   }, CSS.vars.cross ('.cross-button__cross', 10, CSS.vars.grey)],
   ['.cross-button--remove-tag:hover', {
      background: CSS.vars ['grey--light'],
   }, ['.cross-button__cross', CSS.vars.crossHover ()]],
   // *** fullscreen.scss ***
   // fullscreen
   ['.fullscreen', {
      position: 'fixed',
      'z-index': '10000',
      'height, width': 1,
      'top, left': 0,
      background: 'rgba(' + CSS.toRGBA (CSS.vars ['grey--darkest']) + ', 0.9)',
      color: CSS.vars.grey,
      'font-size': CSS.typography.fontSize (1),
      mixin1: CSS.vars.fontPrimaryMedium,
      display: 'flex',
      'justify-content, align-items': 'center',
      'overflow-y': 'auto',
      'pointer-events': 'none',
      opacity: '0',
      transition: CSS.vars.easeOutQuart
   }],
   ['.app-fullscreen .fullscreen', {
      opacity: '1',
      'pointer-events': 'all',
   }],
   // fullscreen Image
   ['.fullscreen__image-container', {
      position: 'absolute',
      'z-index': 0,
      'padding-top, padding-bottom, padding-left, padding-right': 70,
      'width, height': 1,
      display: 'flex',
      'align-items, justify-content': 'center',
   }],
   ['.fullscreen__image', {
      'object-fit': 'contain',
      'max-width, max-height': 1,
   }],
   // fullscreen - Elements
   ['.fullscreen__close, .fullscreen__date, .fullscreen__nav, .fullscreen__actions, .fullscreen__count', {
      position: 'absolute',
      'z-index': '1',
   }],
   ['.fullscreen__close', {
      'top, right': 10,
      display: 'flex',
      'align-items, justify-content': 'center',
      'height, width': 42,
      cursor: 'pointer',
   }],
   ['.fullscreen__close-icon', {
      display: 'inline-block',
      'width, height': 24,
      fill: CSS.vars.grey,
      transition: CSS.vars.easeOutQuart,
   }],
   ['.fullscreen__close:hover .fullscreen__close-icon', {fill: CSS.vars ['grey--lightest']}],
   ['.fullscreen__date', {
      top: 30,
      left: 0.5,
      transform: 'translateX(-50%)',
      display: 'inline-block',
   }],
   ['.fullscreen__nav', {
      position: 'absolute',
      top: 0.5,
      left: 24,
      transform: 'translateY(-50%)',
      display: 'inline-block',
      cursor: 'pointer',
   }],
   ['.fullscreen__nav--right', {
      left: 'auto',
      right: 24,
   }],
   ['.fullscreen__count', {
      bottom: 30,
      right: 24,
   }],
   ['.fullscreen__nav-icon', {
      display: 'inline-block',
      width: 13,
      height: 36,
      fill: CSS.vars.grey,
      transition: CSS.vars.easeOutQuart,
   }],
   ['.fullscreen__nav:hover .fullscreen__nav-icon', {fill: CSS.vars ['grey--lightest']}],
   ['.fullscreen__nav--left .fullscreen__nav-icon', {transform: 'scaleX(-1)'}],
   // fullscreen actions
   ['.fullscreen__actions', {
      bottom: 0,
      left: 0.5,
      height: 70,
      transform: 'translateX(-50%)',
      display: 'flex',
      'align-items': 'center',
   }],
   ['.fullscreen__action', {
      display: 'inline-flex',
      'flex-direction': 'column',
      'justify-content, align-items': 'center',
      cursor: 'pointer',
   }],
   ['.fullscreen__action-icon-container', {
      'border-radius': 100,
      'background-color': 'rgba(255, 255, 255, 0.05)',
      'height, width': 32,
      display: 'inline-flex',
      'align-items, justify-content': 'center',
      'margin-bottom': 2,
      transition: CSS.vars.easeOutQuart,
   }],
   ['.geotag--open-pictures', {
      'height, width': 32
   }],
   ['.fullscreen__action:hover .fullscreen__action-icon-container', {'background-color': 'rgba(255, 255, 255, 0.1)'}],
   ['.fullscreen__action:active .fullscreen__action-icon-container', {'background-color': 'rgba(255, 255, 255, 0.05)'}],
   ['.fullscreen__action-icon', {
      display: 'inline-block',
      'width, height': 24,
      'margin-top': 4,
      fill: CSS.vars ['grey--lightest'],
   }],
   ['.fullscreen__action-text', {
      color: CSS.vars.grey,
      'font-size': CSS.typography.fontSize (0),
   }],
   ['.fullscreen__action:hover .fullscreen__action-text', {color: CSS.vars ['grey--lightest']}],
   ['.no-svg svg', {display: 'none'}],
   // FEEDBACK BOX
   ['.feedback-box-mask', {
      'width, height': 1,
      'background-color': 'rgb(0,0,255,0.3)',
      position: 'fixed',
      top: 0,
      'z-index': '102'
   }],
   ['.feedback-box', {
      position: 'fixed',
      'top': 0.25,
      'left': .3,
      padding: 50
   }],
   ['.feedback-input-textarea', {
      mixin1: CSS.vars.fontPrimaryMedium,
      // width: window.innerWidth / 2,
      width: 582,
      height: 84,
      resize: 'none',
      'line-height': 20,
      border: '1px solid ' + CSS.vars ['border-color--dark'],
      'border-radius': 10,
      'padding-left, padding-right': CSS.vars ['padding--s'],
      'padding-top': CSS.vars ['padding--s'],
   }],
   // *** UPDATE QUERY BOX ***
   ['.update-pivs-box', {
      position: 'fixed',
      bottom: 0,
      'left': .4,
      width: Math.round (window.innerWidth / 5),
      height: 80,
      'z-index': '102',
      'border-top-left-radius, border-top-right-radius': 10,
      'padding-bottom': CSS.vars ['padding--s'],
      'background-color': 'white'
   }],
   // *** AUTH VIEWS ***
   ['.enter', {
      display: 'flex',
      'flex-direction': 'column',
      'justify-content, align-items': 'center',
      width: 1,
      'padding-top': CSS.typography.spaceVer (4),
      'padding-left, padding-right': CSS.vars ['padding--m'],
      'padding-bottom': CSS.typography.spaceVer (6),
   }, [
      ['input', {'font-size': 24}],
      // *** enter ***
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
         cursor: 'pointer',
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
         color: '#fff'
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
   ]]
];

// *** SVG ***

var svg = {
   accountMenu: '<svg class="account-menu__item-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm0-1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-2 2h4c1.7 0 3 1.3 3 3v1.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-1.5c0-1.7 1.3-3 3-3zm0 1c-1.1 0-2 .9-2 2v1.5c0 .3.2.5.5.5h7c.3 0 .5-.2.5-.5v-1.5c0-1.1-.9-2-2-2z"/></svg>',
   sidebarSearch: '<svg class="sidebar-search__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19.9 18-4.2-4.2s0 0-.1 0c1.7-2.5 1.4-5.9-.8-8.2-2.5-2.5-6.7-2.5-9.2 0s-2.5 6.7 0 9.2 6.7 2.5 9.2 0c.1-.1.2-.2.2-.2l4.1 4.1c.2.2.5.2.7 0s.2-.5.1-.7zm-5.8-3.9c-2.1 2.1-5.6 2.1-7.8 0s-2.1-5.6 0-7.8 5.6-2.1 7.8 0 2.1 5.6 0 7.8z"/></svg>',
   searchTagIcon: '<svg class="tags-search-bar__search-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19.9 18-4.2-4.2s0 0-.1 0c1.7-2.5 1.4-5.9-.8-8.2-2.5-2.5-6.7-2.5-9.2 0s-2.5 6.7 0 9.2 6.7 2.5 9.2 0c.1-.1.2-.2.2-.2l4.1 4.1c.2.2.5.2.7 0s.2-.5.1-.7zm-5.8-3.9c-2.1 2.1-5.6 2.1-7.8 0s-2.1-5.6 0-7.8 5.6-2.1 7.8 0 2.1 5.6 0 7.8z"/></svg>',
   tagAll: '<svg class="tag__icon tag__icon--all" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 15.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm0-6c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5zm-4.5-.5c0-.3-.2-.5-.5-.5h-1c-.3 0-.5.2-.5.5s.2.5.5.5h1c.3 0 .5-.2.5-.5zm10.5-3v-1c0-.3-.2-.5-.5-.5s-.5.2-.5.5v1h-2v-.5c0-.8-.6-1.5-1.3-1.5h-3.3c-.8 0-1.4.7-1.4 1.5v.5h-2.5c-1.9 0-3.5 1.6-3.5 3.5v5c0 1.9 1.6 3.5 3.5 3.5h11c1.9 0 3.5-1.6 3.5-3.5v-5c0-1.8-1.3-3.2-3-3.5zm-8-.5c0-.3.2-.5.3-.5h3.3c.2 0 .4.2.4.5v.5h-4zm10 9c0 1.4-1.1 2.5-2.5 2.5h-11c-1.4 0-2.5-1.1-2.5-2.5v-5c0-1.4 1.1-2.5 2.5-2.5h11c1.4 0 2.5 1.1 2.5 2.5z"/></svg>',
   videoIcon: '<svg class="videoIcon" version="1.1" viewBox="0.0 0.0 22.0 22.0" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l22.0 0l0 22.0l-22.0 0l0 -22.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l22.0 0l0 22.0l-22.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m0.67729837 7.3124757l0 0c0 -1.0183125 0.8255052 -1.8438172 1.8438175 -1.8438172l11.290979 0c0.4890108 0 0.9579935 0.19425869 1.3037758 0.54004145c0.34578323 0.34578276 0.5400419 0.814765 0.5400419 1.3037758l0 7.375048c0 1.0183125 -0.82550526 1.8438177 -1.8438177 1.8438177l-11.290979 0c-1.0183122 0 -1.8438175 -0.82550526 -1.8438175 -1.8438177z" fill-rule="evenodd"/><path stroke="#484848" stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt" d="m0.67729837 7.3124757l0 0c0 -1.0183125 0.8255052 -1.8438172 1.8438175 -1.8438172l11.290979 0c0.4890108 0 0.9579935 0.19425869 1.3037758 0.54004145c0.34578323 0.34578276 0.5400419 0.814765 0.5400419 1.3037758l0 7.375048c0 1.0183125 -0.82550526 1.8438177 -1.8438177 1.8438177l-11.290979 0c-1.0183122 0 -1.8438175 -0.82550526 -1.8438175 -1.8438177z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m21.322702 7.074921l0 7.8501573l-5.6652994 -1.5700312l0 -4.7100945z" fill-rule="evenodd"/><path stroke="#484848" stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt" d="m21.322702 7.074921l0 7.8501573l-5.6652994 -1.5700312l0 -4.7100945z" fill-rule="evenodd"/></g></svg>',
   itemSelected: '<svg class="tag-actions__item-icon tag-actions__item-icon--selected tag-actions__selected-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.5 16.5c3.9 0 8-2.8 8-5s-4.1-5-8-5-8 2.8-8 5 4.1 5 8 5zm0-1c-3.4 0-7-2.5-7-4s3.6-4 7-4 7 2.5 7 4-3.6 4-7 4zm0-1c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm0-1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>',
   itemDeselect: '<svg class="tag-actions__item-icon tag-actions__item-icon--deselect" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.9 8.8-.7-.7-3.2 3.2-3.2-3.2-.7.7 3.2 3.2-3.2 3.2.7.7 3.2-3.2 3.2 3.2.7-.7-3.2-3.2z"/></svg>',
   itemAttach: '<svg class="tag-actions__item-icon tag-actions__item-icon--attach" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.5 7h-1v4.5h-4.5v1h4.5v4.5h1v-4.5h4.5v-1h-4.5z"/></svg>',
   itemAttached: '<svg class="tag-actions__item-icon tag-actions__item-icon--attached" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m10.3 15.7c-.1 0-.3-.1-.4-.1l-3-3c-.2-.2-.2-.5 0-.7s.5-.2.7 0l2.6 2.6 6.1-6.1c.2-.2.5-.2.7 0s.2.5 0 .7l-6.4 6.4c-.1.2-.2.2-.3.2z"/></svg>',
   itemUntag: '<svg class="tag-actions__item-icon tag-actions__item-icon--untag" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19.5 9.4c-.1-.3-.4-.4-.6-.3l-6.5 1.9 1.9-6.4c.1-.3 0-.5-.3-.6s-.5.1-.6.3l-2.1 7.1-2.6.8c.3-.9.1-1.9-.6-2.6-1-1-2.6-1-3.5 0s-1 2.6 0 3.5c.5.5 1.1.7 1.8.7.4 0 .7-.1 1-.2h.1l3.4-1-1 3.4v.2c-.2.3-.2.7-.2 1 0 .7.3 1.3.7 1.8.5.5 1.1.7 1.8.7.6 0 1.3-.2 1.8-.7s.7-1.1.7-1.8-.3-1.3-.7-1.8c-.7-.7-1.7-.9-2.6-.6l.8-2.6 7.1-2.1c.1-.1.3-.4.2-.7zm-14.2 3c-.6-.6-.6-1.5 0-2.1.3-.3.6-.5 1-.5s.8.2 1.1.4c.6.6.6 1.5 0 2.1s-1.6.6-2.1.1zm7.9 3.7c.3.3.4.7.4 1.1s-.2.8-.4 1.1c-.6.6-1.5.6-2.1 0-.3-.3-.4-.7-.4-1.1s.2-.8.4-1.1c.3-.3.7-.4 1.1-.4.4-.1.7.1 1 .4z"/></svg>',
   itemUntagged: '<svg class="tag__icon tag__icon--untagged" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.6 10.8c0 .5-.1 1.1-.5 1.5l-5 5.9c-.4.5-1 .7-1.5.7s-.9-.2-1.3-.5l-3.8-3.2c-.8-.7-.9-2-.2-2.8l5-5.9c.3-.4.8-.7 1.3-.7l3.5-.3c1.1-.1 2.1.7 2.2 1.8z"/></svg>',
   itemTime: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock" style="margin-right: 5px"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
   buttonAttach: '<svg class="switch-list__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m20.5 11.5c0 .3-.2.5-.5.5h-2.5v2.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-2.5h-2.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h2.5v-2.5c0-.3.2-.5.5-.5s.5.2.5.5v2.5h2.5c.3 0 .5.2.5.5zm-6.8 1.9-2.6 3.1c-.4.4-1 .5-1.4.1l-3.8-3.2c-.4-.4-.5-1-.1-1.4l5-5.9c.2-.2.4-.3.7-.4l3.5-.3c.6-.1 1 .4 1.1.9 0 .3.3.5.5.5.3 0 .5-.3.5-.5-.1-1.1-1.1-1.9-2.2-1.8l-3.5.3c-.5.1-1 .3-1.3.7l-5 5.9c-.7.8-.6 2.1.2 2.8l3.7 3.3c.4.3.8.5 1.3.5.6 0 1.1-.2 1.5-.7l2.6-3.2c.2-.2.1-.5-.1-.7-.1-.2-.4-.2-.6 0z"/></svg>',
   buttonUntag: '<svg class="switch-list__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19.5 9.4c-.1-.3-.4-.4-.6-.3l-6.5 1.9 1.9-6.4c.1-.3 0-.5-.3-.6s-.5.1-.6.3l-2.1 7.1-2.6.8c.3-.9.1-1.9-.6-2.6-1-1-2.6-1-3.5 0s-1 2.6 0 3.5c.5.5 1.1.7 1.8.7.4 0 .7-.1 1-.2h.1l3.4-1-1 3.4v.2c-.2.3-.2.7-.2 1 0 .7.3 1.3.7 1.8.5.5 1.1.7 1.8.7.6 0 1.3-.2 1.8-.7s.7-1.1.7-1.8-.3-1.3-.7-1.8c-.7-.7-1.7-.9-2.6-.6l.8-2.6 7.1-2.1c.1-.1.3-.4.2-.7zm-14.2 3c-.6-.6-.6-1.5 0-2.1.3-.3.6-.5 1-.5s.8.2 1.1.4c.6.6.6 1.5 0 2.1s-1.6.6-2.1.1zm7.9 3.7c.3.3.4.7.4 1.1s-.2.8-.4 1.1c-.6.6-1.5.6-2.1 0-.3-.3-.4-.7-.4-1.1s.2-.8.4-1.1c.3-.3.7-.4 1.1-.4.4-.1.7.1 1 .4z"/></svg>',
   close: '<svg class="selected-box__close-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.9 8.8-.7-.7-3.2 3.2-3.2-3.2-.7.7 3.2 3.2-3.2 3.2.7.7 3.2-3.2 3.2 3.2.7-.7-3.2-3.2z"/></svg>',
   selectAll: '<svg class="organise-bar__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7.5 12c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm7 0c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm8.5-2c0-2.2-1.8-4-4-4-1.7 0-3.1 1-3.7 2.5h-9.3c-1.9 0-3.5 1.6-3.5 3.5v8c0 1.3.8 2.5 1.9 3.1l.1.1c.5.2 1 .3 1.5.3h12c1.9 0 3.5-1.6 3.5-3.5v-6.9c.9-.7 1.5-1.8 1.5-3.1zm-17 12.5c-.2 0-.5 0-.7-.1l3.1-3.1c.6-.6 1.5-.6 2.1 0l3.2 3.2zm12 0h-2.9l-3.7-3.7 2.3-2.3c.6-.6 1.6-.6 2.1 0l4.4 4.5c-.3.9-1.2 1.5-2.2 1.5zm2.5-2.6-4-4c-.9-.9-2.6-.9-3.5 0l-2.3 2.3c-.9-.5-2.2-.4-3 .4l-3.3 3.3c-.5-.5-.9-1.1-.9-1.9v-8c0-1.4 1.1-2.5 2.5-2.5h9.1c-.1.2-.1.3-.1.5 0 2.2 1.8 4 4 4 .5 0 1-.1 1.5-.3z"/></svg>',
   rotate: '<svg class="organise-bar__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.5 11.5c-.3 0-.5.2-.5.5 0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c1.5 0 3 .6 4.1 1.6l-.7.7c-.1.1-.1.2-.1.3 0 .3.2.5.5.5l2.4.2c.3 0 .5-.2.4-.4l-.2-2.4c0-.1-.1-.2-.2-.3-.2-.2-.5-.2-.7 0l-.8.8c-1.2-1.3-2.9-2-4.7-2-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7c0-.3-.2-.5-.5-.5z"/></svg>',
   delete: '<svg class="organise-bar__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m17.5 6.5h-2.5v-.5c0-.8-.7-1.5-1.5-1.5h-3c-.8 0-1.5.7-1.5 1.5v.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5 6 2.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zm-7.5 0v-.5c0-.3.2-.5.5-.5h3c.3 0 .5.2.5.5v.5zm0 10.5c-.3 0-.5-.2-.5-.5v-6.5c0-.3.2-.5.5-.5s.5.2.5.5v6.5c0 .3-.2.5-.5.5zm2 0c-.3 0-.5-.2-.5-.5v-6.5c0-.3.2-.5.5-.5s.5.2.5.5v6.5c0 .3-.2.5-.5.5zm2 0c-.3 0-.5-.2-.5-.5v-6.5c0-.3.2-.5.5-.5s.5.2.5.5v6.5c0 .3-.2.5-.5.5zm3-8v7c0 1.9-1.6 3.5-3.5 3.5h-3c-1.9 0-3.5-1.6-3.5-3.5v-7c0-.3.2-.5.5-.5s.5.2.5.5v7c0 1.4 1.1 2.5 2.5 2.5h3c1.4 0 2.5-1.1 2.5-2.5v-7c0-.3.2-.5.5-.5s.5.2.5.5z"/></svg>',
   fullScreenClose: '<svg class="fullscreen__close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" > <path d="M11.5,18.8c0,0.4-0.3,0.8-0.7,0.8c0,0,0,0-0.1,0c-0.4,0-0.7-0.3-0.7-0.7l-0.3-3.6l-6.8,6.8c-0.1,0.1-0.3,0.2-0.5,0.2 s-0.4-0.1-0.5-0.2c-0.3-0.3-0.3-0.8,0-1.1l6.8-6.8L5,14c-0.4,0-0.7-0.4-0.7-0.8c0-0.4,0.4-0.7,0.8-0.7l4.4,0.3 c0.4,0,0.8,0.2,1.1,0.5c0.3,0.3,0.5,0.7,0.5,1.1L11.5,18.8z M22.6,1.1c-0.3-0.3-0.8-0.3-1.1,0l-6.8,6.8l-0.3-3.6 c0-0.4-0.4-0.7-0.8-0.7c-0.4,0-0.7,0.4-0.7,0.8l0.3,4.4c0,0.4,0.2,0.8,0.5,1.1c0.3,0.3,0.7,0.5,1.1,0.5l4.4,0.3c0,0,0,0,0.1,0 c0.4,0,0.7-0.3,0.7-0.7c0-0.4-0.3-0.8-0.7-0.8L15.8,9l6.8-6.8C22.9,1.8,22.9,1.4,22.6,1.1z"/>',
   left: '<svg class="fullscreen__nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 36"> <path d="M1,36c-0.2,0-0.4,0-0.5-0.2c-0.5-0.3-0.6-0.9-0.3-1.4L10.5,18L0.2,1.6C-0.1,1.1,0,0.5,0.5,0.2C0.9-0.1,1.6,0,1.8,0.5 l10.4,16.4c0.4,0.6,0.4,1.5,0,2.1L1.8,35.5C1.7,35.8,1.3,36,1,36z"/> </svg>',
   right: '<svg class="fullscreen__nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 36"> <path d="M1,36c-0.2,0-0.4,0-0.5-0.2c-0.5-0.3-0.6-0.9-0.3-1.4L10.5,18L0.2,1.6C-0.1,1.1,0,0.5,0.5,0.2C0.9-0.1,1.6,0,1.8,0.5 l10.4,16.4c0.4,0.6,0.4,1.5,0,2.1L1.8,35.5C1.7,35.8,1.3,36,1,36z"/> </svg>',
   fullScreenRotate: '<svg class="fullscreen__action-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.5 11.5c-.3 0-.5.2-.5.5 0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c1.5 0 3 .6 4.1 1.6l-.7.7c-.1.1-.1.2-.1.3 0 .3.2.5.5.5l2.4.2c.3 0 .5-.2.4-.4l-.2-2.4c0-.1-.1-.2-.2-.3-.2-.2-.5-.2-.7 0l-.8.8c-1.2-1.3-2.9-2-4.7-2-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7c0-.3-.2-.5-.5-.5z"/></svg>',
   uploadImage: '<svg class="upload-box__image-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7 12c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm7 0c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm5 2c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm3.5-5.7c-.6-.7-1.4-1.2-2.4-1.2l-12-1c-1.7-.2-3.2.9-3.6 2.6-1.1.3-1.9 1.1-2.3 2.1-1.3.5-2.2 1.9-2 3.3l.7 8.2c.1.9.5 1.8 1.2 2.4.6.5 1.4.8 2.2.8h.3l12-1c1-.1 1.8-.6 2.4-1.3.6-.3 1.1-.8 1.5-1.4 0 0 .1 0 .1-.1 1.1-.5 1.8-1.6 1.9-2.8l.7-8c.2-1-.1-1.9-.7-2.6zm-19.5 3.7c0-1.4 1.1-2.5 2.5-2.5h12c1.4 0 2.5 1.1 2.5 2.5v7.9l-4-4c-.9-.9-2.6-.9-3.5 0l-2.3 2.3c-.9-.5-2.2-.4-3 .4l-3.3 3.3c-.5-.5-.9-1.1-.9-1.9zm7 7.3 3.2 3.2h-7.7c-.2 0-.5 0-.7-.1l3.1-3.1c.6-.6 1.5-.6 2.1 0zm-5.4 5.2c-1.4.1-2.6-.9-2.7-2.3l-.7-8.2c-.1-.7.2-1.4.8-1.9v7.9c0 1.9 1.6 3.5 3.5 3.5h10.5zm12.9-2h-3.1c0-.1 0-.3-.1-.4l-3.3-3.3 2.3-2.3c.6-.6 1.6-.6 2.1 0l4.2 4.3c.1.1.2.1.3.1-.5 1-1.4 1.6-2.4 1.6zm4.1-3.8c0 .5-.3 1-.6 1.4 0-.1 0-.1 0-.2v-7.9c0-1.9-1.6-3.5-3.5-3.5h-11.9c.4-1 1.4-1.6 2.5-1.5l12 1c.7.1 1.3.4 1.7.9s.6 1.2.6 1.8z"/></svg>',
   dragDrop: '<svg class="drag-and-drop__icon" enable-background="new 0 0 23 33" viewBox="0 0 23 33" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m21.6 20.4h-5.2v-19.4c0-.6-.4-1-1-1h-7.8c-.6 0-1 .4-1 1v19.4h-5.2c-.3 0-.5.1-.7.3-.4.4-.4 1 0 1.4l10.1 10.1c.4.4 1 .4 1.4 0l10.1-10.1c.2-.2.3-.4.3-.7 0-.5-.5-1-1-1z" fill-rule="evenodd"/></svg>',
   download: '<svg style="height: 23px;" class="drag-and-drop__icon" enable-background="new 0 0 23 33" viewBox="0 0 23 33" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m21.6 20.4h-5.2v-19.4c0-.6-.4-1-1-1h-7.8c-.6 0-1 .4-1 1v19.4h-5.2c-.3 0-.5.1-.7.3-.4.4-.4 1 0 1.4l10.1 10.1c.4.4 1 .4 1.4 0l10.1-10.1c.2-.2.3-.4.3-.7 0-.5-.5-1-1-1z" fill-rule="evenodd"/></svg>',
   uploadSelection: '<svg class="upload-selection__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7 12c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm7 0c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm5 2c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm3.5-5.7c-.6-.7-1.4-1.2-2.4-1.2l-12-1c-1.7-.2-3.2.9-3.6 2.6-1.1.3-1.9 1.1-2.3 2.1-1.3.5-2.2 1.9-2 3.3l.7 8.2c.1.9.5 1.8 1.2 2.4.6.5 1.4.8 2.2.8h.3l12-1c1-.1 1.8-.6 2.4-1.3.6-.3 1.1-.8 1.5-1.4 0 0 .1 0 .1-.1 1.1-.5 1.8-1.6 1.9-2.8l.7-8c.2-1-.1-1.9-.7-2.6zm-19.5 3.7c0-1.4 1.1-2.5 2.5-2.5h12c1.4 0 2.5 1.1 2.5 2.5v7.9l-4-4c-.9-.9-2.6-.9-3.5 0l-2.3 2.3c-.9-.5-2.2-.4-3 .4l-3.3 3.3c-.5-.5-.9-1.1-.9-1.9zm7 7.3 3.2 3.2h-7.7c-.2 0-.5 0-.7-.1l3.1-3.1c.6-.6 1.5-.6 2.1 0zm-5.4 5.2c-1.4.1-2.6-.9-2.7-2.3l-.7-8.2c-.1-.7.2-1.4.8-1.9v7.9c0 1.9 1.6 3.5 3.5 3.5h10.5zm12.9-2h-3.1c0-.1 0-.3-.1-.4l-3.3-3.3 2.3-2.3c.6-.6 1.6-.6 2.1 0l4.2 4.3c.1.1.2.1.3.1-.5 1-1.4 1.6-2.4 1.6zm4.1-3.8c0 .5-.3 1-.6 1.4 0-.1 0-.1 0-.2v-7.9c0-1.9-1.6-3.5-3.5-3.5h-11.9c.4-1 1.4-1.6 2.5-1.5l12 1c.7.1 1.3.4 1.7.9s.6 1.2.6 1.8z"/></svg>',
   searchForm: '<svg class="search-form__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="m19.9 18-4.2-4.2s0 0-.1 0c1.7-2.5 1.4-5.9-.8-8.2-2.5-2.5-6.7-2.5-9.2 0s-2.5 6.7 0 9.2 6.7 2.5 9.2 0c.1-.1.2-.2.2-.2l4.1 4.1c.2.2.5.2.7 0s.2-.5.1-.7zm-5.8-3.9c-2.1 2.1-5.6 2.1-7.8 0s-2.1-5.6 0-7.8 5.6-2.1 7.8 0 2.1 5.6 0 7.8z"/></svg>',
   uploadProgress: '<svg class="upload-progress__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7 12c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm7 0c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm5 2c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm3.5-5.7c-.6-.7-1.4-1.2-2.4-1.2l-12-1c-1.7-.2-3.2.9-3.6 2.6-1.1.3-1.9 1.1-2.3 2.1-1.3.5-2.2 1.9-2 3.3l.7 8.2c.1.9.5 1.8 1.2 2.4.6.5 1.4.8 2.2.8h.3l12-1c1-.1 1.8-.6 2.4-1.3.6-.3 1.1-.8 1.5-1.4 0 0 .1 0 .1-.1 1.1-.5 1.8-1.6 1.9-2.8l.7-8c.2-1-.1-1.9-.7-2.6zm-19.5 3.7c0-1.4 1.1-2.5 2.5-2.5h12c1.4 0 2.5 1.1 2.5 2.5v7.9l-4-4c-.9-.9-2.6-.9-3.5 0l-2.3 2.3c-.9-.5-2.2-.4-3 .4l-3.3 3.3c-.5-.5-.9-1.1-.9-1.9zm7 7.3 3.2 3.2h-7.7c-.2 0-.5 0-.7-.1l3.1-3.1c.6-.6 1.5-.6 2.1 0zm-5.4 5.2c-1.4.1-2.6-.9-2.7-2.3l-.7-8.2c-.1-.7.2-1.4.8-1.9v7.9c0 1.9 1.6 3.5 3.5 3.5h10.5zm12.9-2h-3.1c0-.1 0-.3-.1-.4l-3.3-3.3 2.3-2.3c.6-.6 1.6-.6 2.1 0l4.2 4.3c.1.1.2.1.3.1-.5 1-1.4 1.6-2.4 1.6zm4.1-3.8c0 .5-.3 1-.6 1.4 0-.1 0-.1 0-.2v-7.9c0-1.9-1.6-3.5-3.5-3.5h-11.9c.4-1 1.4-1.6 2.5-1.5l12 1c.7.1 1.3.4 1.7.9s.6 1.2.6 1.8z"/></svg>',
   backLink: '<svg class="back-link__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.5 12c0 .3-.2.5-.5.5h-12.2l3.4 3.4c.2.2.2.5 0 .7-.1.1-.2.1-.4.1-.1 0-.3 0-.4-.1l-3.5-3.5c-.3-.3-.4-.7-.4-1.1s.2-.8.5-1.1l3.5-3.5c.2-.2.5-.2.7 0s.2.5 0 .7l-3.4 3.4h12.2c.3 0 .5.2.5.5z" /></svg>',
   videoPlayback: '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50px" height="50px" viewBox="0 0 512 512" style="position: absolute" enable-background="new 0 0 512 512" xml:space="preserve"><path fill="#5b6eff" d="M256,0C114.608,0,0,114.608,0,256s114.608,256,256,256s256-114.608,256-256S397.392,0,256,0z M256,496C123.664,496,16,388.336,16,256S123.664,16,256,16s240,107.664,240,240S388.336,496,256,496z"/><polygon style="fill:#5b6eff" points="189.776,141.328 189.776,370.992 388.672,256.16"/></svg>',
   dropboxLogo: '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 324 63.8" style="enable-background:new 0 0 324 63.8;" xml:space="preserve"> <style type="text/css"> .st0{fill:#0061FF;} .st1{display:none;} .st2{display:inline;} .st3{fill:none;} </style> <path class="st0" d="M37.6,12L18.8,24l18.8,12L18.8,48L0,35.9l18.8-12L0,12L18.8,0L37.6,12z M18.7,51.8l18.8-12l18.8,12l-18.8,12 L18.7,51.8z M37.6,35.9l18.8-12L37.6,12L56.3,0l18.8,12L56.3,24l18.8,12L56.3,48L37.6,35.9z"/> <path d="M89.8,12H105c9.7,0,17.7,5.6,17.7,18.4v2.7c0,12.9-7.5,18.7-17.4,18.7H89.8V12z M98.3,19.2v25.3h6.5c5.5,0,9.2-3.6,9.2-11.6 v-2.1c0-8-3.9-11.6-9.5-11.6H98.3z M127.2,19.6h6.8l1.1,7.5c1.3-5.1,4.6-7.8,10.6-7.8h2.1v8.6h-3.5c-6.9,0-8.6,2.4-8.6,9.2v14.8 h-8.4V19.6H127.2z M149.5,36.4v-0.9c0-10.8,6.9-16.7,16.3-16.7c9.6,0,16.3,5.9,16.3,16.7v0.9c0,10.6-6.5,16.3-16.3,16.3 C155.4,52.6,149.5,47,149.5,36.4z M173.5,36.3v-0.8c0-6-3-9.6-7.8-9.6c-4.7,0-7.8,3.3-7.8,9.6v0.8c0,5.8,3,9.1,7.8,9.1 C170.5,45.3,173.5,42.1,173.5,36.3z M186.5,19.6h7l0.8,6.1c1.7-4.1,5.3-6.9,10.6-6.9c8.2,0,13.6,5.9,13.6,16.8v0.9 c0,10.6-6,16.2-13.6,16.2c-5.1,0-8.6-2.3-10.3-6V63h-8.2L186.5,19.6L186.5,19.6z M210,36.3v-0.7c0-6.4-3.3-9.6-7.7-9.6 c-4.7,0-7.8,3.6-7.8,9.6v0.6c0,5.7,3,9.3,7.7,9.3C207,45.4,210,42.3,210,36.3z M230.9,45.9l-0.7,5.9H223v-43h8.2v16.5 c1.8-4.2,5.4-6.5,10.5-6.5c7.7,0.1,13.4,5.4,13.4,16.1v1c0,10.7-5.4,16.8-13.6,16.8C236.1,52.6,232.6,50.1,230.9,45.9z M246.5,35.9 v-0.8c0-5.9-3.2-9.2-7.7-9.2c-4.6,0-7.8,3.7-7.8,9.3v0.7c0,6,3.1,9.5,7.7,9.5C243.6,45.4,246.5,42.3,246.5,35.9z M258.7,36.4v-0.9 c0-10.8,6.9-16.7,16.3-16.7c9.6,0,16.3,5.9,16.3,16.7v0.9c0,10.6-6.6,16.3-16.3,16.3C264.6,52.6,258.7,47,258.7,36.4z M282.8,36.3 v-0.8c0-6-3-9.6-7.8-9.6c-4.7,0-7.8,3.3-7.8,9.6v0.8c0,5.8,3,9.1,7.8,9.1C279.8,45.3,282.8,42.1,282.8,36.3z M302.3,35.1L291,19.6 h9.7l6.5,9.7l6.6-9.7h9.6L311.9,35L324,51.8h-9.5l-7.4-10.7l-7.2,10.7H290L302.3,35.1z"/> <g id="Editble" class="st1"> <g class="st2"> <rect x="-105" y="5" class="st3" width="506" height="71.8"/> <path d="M0.2,13.6h16.3c10.4,0,19,6.1,19,19.8v2.9c0,13.8-8,20-18.7,20H0.2V13.6z M9.4,21.3v27.2h7c5.9,0,9.9-3.9,9.9-12.5v-2.2 c0-8.6-4.1-12.5-10.2-12.5H9.4z M40.4,21.8h7.3l1.1,8c1.4-5.5,4.9-8.3,11.3-8.3h2.2v9.2h-3.7c-7.4,0-9.2,2.6-9.2,9.9v15.8h-9 C40.4,56.4,40.4,21.8,40.4,21.8z M64.3,39.8v-1c0-11.6,7.4-17.9,17.5-17.9c10.3,0,17.5,6.4,17.5,17.9v1c0,11.4-7,17.5-17.5,17.5 C70.6,57.3,64.3,51.2,64.3,39.8z M90.1,39.7v-0.8c0-6.5-3.2-10.3-8.3-10.3c-5,0-8.4,3.5-8.4,10.3v0.8c0,6.2,3.2,9.7,8.3,9.7 C86.9,49.4,90.1,46,90.1,39.7z M104,21.8h7.6l0.9,6.6c1.9-4.4,5.7-7.4,11.4-7.4c8.8,0,14.6,6.4,14.6,18v1 c0,11.4-6.4,17.3-14.6,17.3c-5.5,0-9.2-2.5-11-6.5v17.5H104V21.8z M129.3,39.8V39c0-6.9-3.5-10.3-8.3-10.3c-5,0-8.4,3.8-8.4,10.3 v0.7c0,6.1,3.2,10,8.2,10C126,49.5,129.3,46.1,129.3,39.8z M151.7,50.1l-0.7,6.3h-7.8V10.2h8.8V28c1.9-4.5,5.8-7,11.2-7 c8.2,0.1,14.3,5.8,14.3,17.3v1c0,11.5-5.8,18-14.6,18C157.3,57.3,153.5,54.5,151.7,50.1z M168.5,39.3v-0.8c0-6.4-3.5-9.8-8.3-9.8 c-5,0-8.4,4-8.4,10v0.7c0,6.5,3.3,10.2,8.3,10.2C165.3,49.5,168.5,46.1,168.5,39.3z M181.6,39.8v-1c0-11.6,7.4-17.9,17.5-17.9 c10.3,0,17.5,6.4,17.5,17.9v1c0,11.4-7.1,17.5-17.5,17.5C187.9,57.3,181.6,51.2,181.6,39.8z M207.4,39.7v-0.8 c0-6.5-3.2-10.3-8.3-10.3c-5,0-8.4,3.5-8.4,10.3v0.8c0,6.2,3.2,9.7,8.3,9.7C204.2,49.4,207.4,46,207.4,39.7z M228.3,38.4 l-12.1-16.7h10.4l7,10.4l7.1-10.4H251l-12.3,16.6l13,18h-10.2l-8-11.5l-7.7,11.5h-10.6L228.3,38.4z"/> </g> </g> </svg>',
   geotagOpen: '<svg class="fullscreen__action-icon" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><g transform="translate(0,-952.36218)"><path style="text-indent:0;text-transform:none;direction:ltr;block-progression:tb;baseline-shift:baseline;color:#000000;enable-background:accumulate;" d="m 50,963.37594 c -15.9926,0 -29,13.0074 -29,29 0,5.6716 1.3987,9.74026 4.3438,14.09376 l 23,34 a 2.0002,2.0002 0 0 0 3.3124,0 l 23,-34 C 77.6013,1002.1161 79,998.04754 79,992.37594 c 0,-15.9926 -13.0074,-29 -29,-29 z m 0,4 c 13.8308,0 25,11.1692 25,25 0,5.077 -0.998,7.94526 -3.6562,11.87496 L 50,1035.8134 28.6562,1004.2509 C 25.9981,1000.3213 25,997.45294 25,992.37594 c 0,-13.8308 11.1692,-25 25,-25 z m 0,10 c -7.7083,0 -14,6.2917 -14,14 0,7.7082 6.2917,13.99996 14,13.99996 7.7083,0 14,-6.29176 14,-13.99996 0,-7.7083 -6.2917,-14 -14,-14 z m 0,4 c 5.5465,0 10,4.4535 10,10 0,5.5464 -4.4535,9.99996 -10,9.99996 -5.5465,0 -10,-4.45356 -10,-9.99996 0,-5.5465 4.4535,-10 10,-10 z" fill="#ffffff" fill-opacity="1" marker="none" visibility="visible" display="inline" overflow="visible"/></g></svg>',
   geoCity: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" width="16" height="16" style="margin-right: 3px;stroke: black;margin-left: -2px;" xml:space="preserve"><path d="M56.4,5.8C53.6,5,48.9,4.8,46,5.3C28.6,8.5,17.2,26.2,24,42.2c7.7,18,17.4,35.2,26,52.8  c8.6-17.6,18.3-34.7,26-52.7C82.5,27,72.5,10.3,56.4,5.8z M50,49.2c-8.4,0-15.2-6.9-15.2-15.4S41.6,18.5,50,18.5s15.2,6.9,15.2,15.4  S58.4,49.2,50,49.2z"/></svg>',
   geoCountry: '<svg width="16" height="16" style="margin-right: 3px;stroke: black;margin-left: -2px;stroke-width: 1.5;" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><g transform="translate(0,-952.36218)"><path style="text-indent:0;text-transform:none;direction:ltr;block-progression:tb;baseline-shift:baseline;color:#000000;enable-background:accumulate;" d="m 50,963.37594 c -15.9926,0 -29,13.0074 -29,29 0,5.6716 1.3987,9.74026 4.3438,14.09376 l 23,34 a 2.0002,2.0002 0 0 0 3.3124,0 l 23,-34 C 77.6013,1002.1161 79,998.04754 79,992.37594 c 0,-15.9926 -13.0074,-29 -29,-29 z m 0,4 c 13.8308,0 25,11.1692 25,25 0,5.077 -0.998,7.94526 -3.6562,11.87496 L 50,1035.8134 28.6562,1004.2509 C 25.9981,1000.3213 25,997.45294 25,992.37594 c 0,-13.8308 11.1692,-25 25,-25 z m 0,10 c -7.7083,0 -14,6.2917 -14,14 0,7.7082 6.2917,13.99996 14,13.99996 7.7083,0 14,-6.29176 14,-13.99996 0,-7.7083 -6.2917,-14 -14,-14 z m 0,4 c 5.5465,0 10,4.4535 10,10 0,5.5464 -4.4535,9.99996 -10,9.99996 -5.5465,0 -10,-4.45356 -10,-9.99996 0,-5.5465 4.4535,-10 10,-10 z" fill="#000000" fill-opacity="1" marker="none" visibility="visible" display="inline" overflow="visible"/></g></svg>',
   spaceAlert: '<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 100" x="0px" y="0px"><title>A</title><path d="M58.31932,14.55819a9.60634,9.60634,0,0,0-16.63864,0L6.30209,75.836A9.606,9.606,0,0,0,14.62141,90.245H85.37859A9.606,9.606,0,0,0,93.69791,75.836Zm30.18292,67.884a3.54274,3.54274,0,0,1-3.12365,1.8035H14.62141a3.60675,3.60675,0,0,1-3.12365-5.41L46.87635,17.55783a3.60682,3.60682,0,0,1,6.2473,0L88.50224,78.83567A3.54271,3.54271,0,0,1,88.50224,82.44217Z"/><path d="M50,63.88433a2.99979,2.99979,0,0,0,2.99964-2.99964V34.42886a2.99964,2.99964,0,0,0-5.99928,0V60.88469A2.99979,2.99979,0,0,0,50,63.88433Z"/><path d="M50,69.917a3.1747,3.1747,0,1,0,3.17473,3.17467A3.17465,3.17465,0,0,0,50,69.917Z"/></svg>',
   googleDriveIcon: '<svg viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="94" height="94"/><path d="M10.7219 73.2906L14.4917 79.8021C15.275 81.1729 16.401 82.25 17.7229 83.0333L31.1865 59.7292H4.25937C4.25937 61.2469 4.65104 62.7646 5.43437 64.1354L10.7219 73.2906Z" fill="#0066DA"/><path d="M47 32.3125L33.5365 9.00833C32.2146 9.79166 31.0885 10.8687 30.3052 12.2396L5.43437 55.3229C4.65104 56.6938 4.25937 58.2115 4.25937 59.7292H31.1865L47 32.3125Z" fill="#00AC47"/><path d="M47 32.3125L60.4635 9.00833C59.1416 8.22499 57.6239 7.83333 56.0573 7.83333H37.9427C36.376 7.83333 34.8583 8.27395 33.5364 9.00833L47 32.3125Z" fill="#00832D"/><path d="M62.8135 59.7292H31.1864L17.7229 83.0333C19.0448 83.8167 20.5625 84.2083 22.1292 84.2083H71.8708C73.4375 84.2083 74.9552 83.7677 76.2771 83.0333L62.8135 59.7292Z" fill="#2684FC"/><path d="M76.2771 83.0333C77.599 82.25 78.725 81.1729 79.5083 79.8021L81.075 77.1094L88.5656 64.1354C89.3489 62.7646 89.7406 61.2469 89.7406 59.7292H62.8625L76.2771 83.0333Z" fill="#2684FC"/><path d="M76.1302 33.7813L63.6948 12.2396C62.9115 10.8687 61.7854 9.79166 60.4635 9.00833L47 32.3125L62.8135 59.7292H89.6917C89.6917 58.2115 89.3 56.6938 88.5167 55.3229L76.1302 33.7813Z" fill="#FFBA00"/></svg>',
   dropboxIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style="fill: rgb(0, 97, 255);"><title></title><path d="M8 2.4l8 5.1-8 5.1-8-5.1 8-5.1zm16 0l8 5.1-8 5.1-8-5.1 8-5.1zM0 17.7l8-5.1 8 5.1-8 5.1-8-5.1zm24-5.1l8 5.1-8 5.1-8-5.1 8-5.1zM8 24.5l8-5.1 8 5.1-8 5.1-8-5.1z"></path></svg>',
   folderIcon: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 36 36" style="enable-background:new 0 0 36 36;" xml:space="preserve"><g><path d="M32.5,13.5H30V10c0-0.28-0.22-0.5-0.5-0.5H15.81l-1.86-3.72C13.86,5.61,13.69,5.5,13.5,5.5h-10C3.22,5.5,3,5.72,3,6v24   c0,0,0,0,0,0s0,0,0,0v0c0,0,0,0,0,0c0,0,0,0,0,0s0,0,0,0v0v0c0,0,0,0,0,0c0,0.13,0.05,0.24,0.13,0.33c0.03,0.03,0.06,0.06,0.1,0.08   c0,0,0,0,0,0c0.07,0.04,0.15,0.07,0.24,0.08c0.01,0,0.02,0,0.03,0c0,0,0,0,0.01,0H28.5c0.23,0,0.43-0.16,0.49-0.38l4-16   c0.04-0.15,0-0.31-0.09-0.43S32.65,13.5,32.5,13.5z M4,6.5h9.19l1.86,3.72c0.08,0.17,0.26,0.28,0.45,0.28H29v3H7.5   c-0.23,0-0.43,0.16-0.49,0.38L4,25.94V6.5z M28.11,29.5H4.14l3.75-15h23.97L28.11,29.5z"/></g></svg>',
   upIcon: '<svg class="up-icon__svg" enable-background="new 0 0 23 33" viewBox="0 0 23 33" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m21.6 20.4h-5.2v-19.4c0-.6-.4-1-1-1h-7.8c-.6 0-1 .4-1 1v19.4h-5.2c-.3 0-.5.1-.7.3-.4.4-.4 1 0 1.4l10.1 10.1c.4.4 1 .4 1.4 0l10.1-10.1c.2-.2.3-.4.3-.7 0-.5-.5-1-1-1z" fill-rule="evenodd"/></svg>',
   backIcon: '<svg class="import-process-box-back-icon__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 36"> <path d="M1,36c-0.2,0-0.4,0-0.5-0.2c-0.5-0.3-0.6-0.9-0.3-1.4L10.5,18L0.2,1.6C-0.1,1.1,0,0.5,0.5,0.2C0.9-0.1,1.6,0,1.8,0.5 l10.4,16.4c0.4,0.6,0.4,1.5,0,2.1L1.8,35.5C1.7,35.8,1.3,36,1,36z"/> </svg>',
   folderDeselect: '<svg class="selected-folder-deselect__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.9 8.8-.7-.7-3.2 3.2-3.2-3.2-.7.7 3.2 3.2-3.2 3.2.7.7 3.2-3.2 3.2 3.2.7-.7-3.2-3.2z"/></svg>',
   chevron: '<svg class="chevron-svg" height="20" width="24" stroke="#484848"><line x1="0" y1="0" x2="10.5" y2="10" style="stroke-width:1.5" /><line x1="9.5" y1="10" x2="20" y2="00" style="stroke-width:1.5" /></svg>',
   selectedCircle: '<svg viewBox="0 0 100 100" fill="#5b6eff" width="12" height="12" style="margin-right: 6px; xmlns="http://www.w3.org/2000/svg"> <circle cx="50" cy="50" r="50"/></svg>',
   infoIcon: '<svg class="info-icon" version="1.1" viewBox="0.0 0.0 24.0 24.0" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l24.0 0l0 24.0l-24.0 0l0 -24.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l24.0 0l0 24.0l-24.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m0.61417323 -9.0078745l24.0 0l0 42.015747l-24.0 0z" fill-rule="evenodd"/><path fill="#fbfbfb" d="m11.457923 17.912125l0 -9.796876l1.328125 0l0 9.796876l-1.328125 0zm0.671875 -11.953125q-0.40625 0 -0.6875 -0.28125q-0.28125 -0.28125 -0.28125 -0.671875q0 -0.390625 0.28125 -0.65625q0.28125 -0.28125 0.6875 -0.28125q0.40625 0 0.6875 0.265625q0.28125 0.25 0.28125 0.65625q0 0.40625 -0.265625 0.6875q-0.265625 0.28125 -0.703125 0.28125z" fill-rule="nonzero"/><path fill="#000000" fill-opacity="0.0" d="m0.61417323 12.0l0 0c0 -6.2882185 5.097608 -11.385827 11.385827 -11.385827l0 0c3.0197086 0 5.915739 1.1995747 8.050995 3.3348315c2.1352577 2.1352568 3.3348312 5.0312867 3.3348312 8.050995l0 0c0 6.2882175 -5.0976086 11.385826 -11.385826 11.385826l0 0c-6.2882185 0 -11.385827 -5.0976086 -11.385827 -11.385826z" fill-rule="evenodd"/><path stroke="#fbfbfb" stroke-width="1.0" stroke-linejoin="round" stroke-linecap="butt" d="m0.61417323 12.0l0 0c0 -6.2882185 5.097608 -11.385827 11.385827 -11.385827l0 0c3.0197086 0 5.915739 1.1995747 8.050995 3.3348315c2.1352577 2.1352568 3.3348312 5.0312867 3.3348312 8.050995l0 0c0 6.2882175 -5.0976086 11.385826 -11.385826 11.385826l0 0c-6.2882185 0 -11.385827 -5.0976086 -11.385827 -11.385826z" fill-rule="evenodd"/></g></svg>',
   upAndDownArrows: '<svg version="1.1" viewBox="0.0 0.0 12.0 12.0" width="12" height="12" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l12.0 0l0 12.0l-12.0 0l0 -12.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l12.0 0l0 12.0l-12.0 0z" fill-rule="evenodd"/><path fill="#484848" d="m-0.007874016 3.007874l3.007874 -3.007874l3.007874 3.007874l-2.561686 0l0 8.992126l-0.89237595 0l0 -8.992126z" fill-rule="evenodd"/><path fill="#484848" d="m12.0078745 8.9921255l-3.0078745 3.0078745l-3.007874 -3.0078745l2.561686 0l0 -8.9921255l0.89237595 0l0 8.9921255z" fill-rule="evenodd"/></g></svg>',
   azIcon:'<svg version="1.1" viewBox="0.0 0.0 12.0 12.0" width="16" height="16" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l12.0 0l0 12.0l-12.0 0l0 -12.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l12.0 0l0 12.0l-12.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m-0.005249344 -10.15748l12.0 0l0 32.31496l-12.0 0z" fill-rule="evenodd"/><path fill="#484848" d="m3.9071805 3.9625196l1.6562498 -3.734375l0.859375 0l1.6718755 3.734375l-0.9062505 0l-1.375 -3.296875l0.34375 0l-1.359375 3.296875l-0.89062476 0zm0.82812476 -0.796875l0.234375 -0.65625l1.921875 0l0.234375 0.65625l-2.390625 0z" fill-rule="nonzero"/><path fill="#484848" d="m4.41027 10.36252l0 -0.5625l2.3125 -2.78125l0.09375 0.3125l-2.359375 0l0 -0.703125l3.140625 0l0 0.5625l-2.3125 2.78125l-0.109375 -0.3125l2.5 0l0 0.703125l-3.265625 0z" fill-rule="nonzero"/></g></svg>',
   zeroNineIcon:'<svg version="1.1" viewBox="0.0 0.0 12.0 12.0" width="16" height="16" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l12.0 0l0 12.0l-12.0 0l0 -12.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l12.0 0l0 12.0l-12.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m-0.005249344 -10.15748l12.0 0l0 32.31496l-12.0 0z" fill-rule="evenodd"/><path fill="#484848" d="m5.9983363 4.0250196q-0.46875 0 -0.828125 -0.21875q-0.359375 -0.234375 -0.578125 -0.65625q-0.203125 -0.4375 -0.203125 -1.046875q0 -0.6250001 0.203125 -1.0468751q0.21875 -0.43749994 0.578125 -0.65625q0.359375 -0.23437499 0.828125 -0.23437499q0.453125 0 0.8125 0.23437499q0.359375 0.21875003 0.5625 0.65625q0.21875 0.421875 0.21875 1.0468751q0 0.609375 -0.21875 1.046875q-0.203125 0.421875 -0.5625 0.65625q-0.359375 0.21875 -0.8125 0.21875zm0 -0.734375q0.21875 0 0.375 -0.109375q0.15625 -0.125 0.25 -0.390625q0.09375 -0.265625 0.09375 -0.6875q0 -0.42187512 -0.09375 -0.6875001q-0.09375 -0.265625 -0.25 -0.390625q-0.15625 -0.12499994 -0.375 -0.12499994q-0.21875 0 -0.390625 0.12499994q-0.15625 0.125 -0.25 0.390625q-0.09375 0.265625 -0.09375 0.6875001q0 0.421875 0.09375 0.6875q0.09375 0.265625 0.25 0.390625q0.171875 0.109375 0.390625 0.109375z" fill-rule="nonzero"/><path fill="#484848" d="m5.813354 6.565645q0.515625 0 0.890625 0.21875q0.375 0.203125 0.578125 0.625q0.203125 0.40625 0.203125 1.015625q0 0.640625 -0.25 1.09375q-0.234375 0.4375 -0.671875 0.671875q-0.421875 0.234375 -0.984375 0.234375q-0.296875 0 -0.5625 -0.0625q-0.265625 -0.0625 -0.46875 -0.1875l0.3125 -0.640625q0.15625 0.109375 0.328125 0.15625q0.1875 0.03125 0.375 0.03125q0.484375 0 0.765625 -0.28125q0.28125 -0.296875 0.28125 -0.875q0 -0.09375 0 -0.203125q0 -0.125 -0.03125 -0.25l0.234375 0.21875q-0.09375 0.21875 -0.265625 0.359375q-0.15625 0.140625 -0.375 0.21875q-0.21875 0.0625 -0.484375 0.0625q-0.359375 0 -0.65625 -0.140625q-0.28125 -0.140625 -0.453125 -0.40625q-0.171875 -0.265625 -0.171875 -0.609375q0 -0.390625 0.1875 -0.65625q0.1875 -0.28125 0.5 -0.4375q0.328125 -0.15625 0.71875 -0.15625zm0.0625 0.640625q-0.1875 0 -0.328125 0.078125q-0.140625 0.0625 -0.21875 0.1875q-0.078125 0.125 -0.078125 0.296875q0 0.25 0.171875 0.40625q0.171875 0.15625 0.453125 0.15625q0.1875 0 0.328125 -0.0625q0.15625 -0.078125 0.234375 -0.203125q0.078125 -0.140625 0.078125 -0.296875q0 -0.15625 -0.078125 -0.28125q-0.078125 -0.125 -0.21875 -0.203125q-0.140625 -0.078125 -0.34375 -0.078125z" fill-rule="nonzero"/></g></svg>',
   shareIcon: '<svg class="share-icon" fill="#fbfbfb" xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 30 30" width="30px" height="30px"><path d="M 23 3 A 4 4 0 0 0 19 7 A 4 4 0 0 0 19.09375 7.8359375 L 10.011719 12.376953 A 4 4 0 0 0 7 11 A 4 4 0 0 0 3 15 A 4 4 0 0 0 7 19 A 4 4 0 0 0 10.013672 17.625 L 19.089844 22.164062 A 4 4 0 0 0 19 23 A 4 4 0 0 0 23 27 A 4 4 0 0 0 27 23 A 4 4 0 0 0 23 19 A 4 4 0 0 0 19.986328 20.375 L 10.910156 15.835938 A 4 4 0 0 0 11 15 A 4 4 0 0 0 10.90625 14.166016 L 19.988281 9.625 A 4 4 0 0 0 23 11 A 4 4 0 0 0 27 7 A 4 4 0 0 0 23 3 z"/></svg>',
   sharedWithMeSearchIcon: '<svg  class="tags-search-bar__shared-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.5 10.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 7c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 4h-4c-1.3 0-2.4.8-2.8 2-.1 0-.1 0-.2 0h-4c-1.7 0-3 1.3-3 3v1.5c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5v-.5h5.5c.8 0 1.5-.7 1.5-1.5v-1.5c0-1.7-1.3-3-3-3zm-5 6.5c0 .3-.2.5-.5.5h-7c-.3 0-.5-.2-.5-.5v-1.5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2zm7-2c0 .3-.2.5-.5.5h-5.5c0-1.2-.8-2.3-1.8-2.8.3-.7 1-1.2 1.8-1.2h4c1.1 0 2 .9 2 2z"/></svg>',
   sharedWithMeSharedIcon: '<svg class="tag__status-icon tag__status-icon--shared" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.5 10.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-7 7c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 4h-4c-1.3 0-2.4.8-2.8 2-.1 0-.1 0-.2 0h-4c-1.7 0-3 1.3-3 3v1.5c0 .8.7 1.5 1.5 1.5h7c.8 0 1.5-.7 1.5-1.5v-.5h5.5c.8 0 1.5-.7 1.5-1.5v-1.5c0-1.7-1.3-3-3-3zm-5 6.5c0 .3-.2.5-.5.5h-7c-.3 0-.5-.2-.5-.5v-1.5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2zm7-2c0 .3-.2.5-.5.5h-5.5c0-1.2-.8-2.3-1.8-2.8.3-.7 1-1.2 1.8-1.2h4c1.1 0 2 .9 2 2z"/></svg>',
   shareItemIcon: '<svg class="tag-share__item-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.5 11.5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm0-5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm3.5 12h-7c-.8 0-1.5-.7-1.5-1.5v-1.5c0-1.7 1.3-3 3-3h4c1.7 0 3 1.3 3 3v1.5c0 .8-.7 1.5-1.5 1.5zm-5.5-5c-1.1 0-2 .9-2 2v1.5c0 .3.2.5.5.5h7c.3 0 .5-.2.5-.5v-1.5c0-1.1-.9-2-2-2zm13.5-4.5h-3v-3c0-.3-.2-.5-.5-.5s-.5.2-.5.5v3h-3c-.3 0-.5.2-.5.5s.2.5.5.5h3v3c0 .3.2.5.5.5s.5-.2.5-.5v-3h3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z"/></svg>',
   tagSharedWithMe: '<svg viewBox="0.0 0.0 12.0 12.0" width="17" height="15" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l12.0 0l0 12.0l-12.0 0l0 -12.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l12.0 0l0 12.0l-12.0 0z" fill-rule="evenodd"/><path fill="#5b6eff" d="m6.1472383 2.3476114l0 0c0 -1.2340425 0.98982143 -2.2344315 2.2108283 -2.2344315l0 0c0.5863476 0 1.1486807 0.23541263 1.5632915 0.6544498c0.41461086 0.41903716 0.6475363 0.98737365 0.6475363 1.5799818l0 0c0 1.2340424 -0.98982143 2.2344313 -2.2108278 2.2344313l0 0c-1.2210069 0 -2.2108283 -1.0003889 -2.2108283 -2.2344313z" fill-rule="evenodd"/><path fill="#5b6eff" d="m6.909059 5.6999073l2.8811774 0l0 0c0.5861368 0 1.1482677 0.23284197 1.5627289 0.6473031c0.41446114 0.4144616 0.6473026 0.9765916 0.6473026 1.5627284l0 2.258831c0 3.4332275E-5 -2.670288E-5 6.1035156E-5 -6.0081482E-5 6.1035156E-5l-7.3011804 -6.1035156E-5l0 0c-3.385544E-5 0 -6.1035156E-5 -2.670288E-5 -6.1035156E-5 -6.0081482E-5l6.1035156E-5 -2.258771l0 0c0 -1.2205667 0.98946476 -2.2100315 2.2100315 -2.2100315z" fill-rule="evenodd"/><path fill="#5b6eff" d="m1.4481676 4.0693617l0 0c0 -1.2320263 0.9896877 -2.2307808 2.2105293 -2.2307808l0 0c0.58626866 0 1.1485255 0.23502803 1.5630805 0.65338063c0.4145546 0.4183526 0.647449 0.98576045 0.647449 1.5774002l0 0c0 1.2320261 -0.9896879 2.230781 -2.2105296 2.230781l0 0c-1.2208416 0 -2.2105293 -0.998755 -2.2105293 -2.230781z" fill-rule="evenodd"/><path fill="#5b6eff" d="m2.0676901 7.4253793l3.166024 0l0 0c0.54839087 0 1.0743213 0.21784782 1.4620924 0.60561895c0.38777113 0.38777065 0.6056185 0.91370106 0.6056185 1.4620924l0 2.3938503c0 3.33786E-5 -2.7179718E-5 6.1035156E-5 -6.1035156E-5 6.1035156E-5l-7.3013844 -6.1035156E-5l0 0c-3.3603974E-5 0 -6.084538E-5 -2.670288E-5 -6.084538E-5 -6.1035156E-5l6.084538E-5 -2.3937893l0 0c0 -1.1419659 0.92574567 -2.0677114 2.0677106 -2.0677114z" fill-rule="evenodd"/></g></svg>',
   cloudImport: '<svg class="cloudImport-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><path d="M82.451,37.699c0.033-0.488,0.049-0.969,0.049-1.449c0-13.096-10.654-23.75-23.75-23.75  c-9.847,0-18.659,6.215-22.146,15.201C33.453,25.943,29.879,25,26.25,25C14.533,25,5,34.533,5,46.25S14.533,67.5,26.25,67.5H42.5v-5  H26.25C17.29,62.5,10,55.209,10,46.25C10,37.289,17.29,30,26.25,30c3.746,0,7.27,1.246,10.191,3.604l3.142,2.535l0.87-3.943  C42.331,23.68,50.026,17.5,58.75,17.5c10.339,0,18.75,8.41,18.75,18.75c0,1.053-0.102,2.137-0.312,3.311L76.663,42.5H80  c5.514,0,10,4.486,10,10s-4.486,10-10,10H57.5v5H80c8.271,0,15-6.729,15-15C95,45.063,89.561,38.873,82.451,37.699z"></path><path d="M52.5,46.035l10.732,10.732C63.721,57.256,64.36,57.5,65,57.5s1.279-0.244,1.768-0.732c0.977-0.977,0.977-2.559,0-3.535  L51.771,38.235c-0.117-0.117-0.247-0.222-0.386-0.315c-0.056-0.037-0.116-0.062-0.174-0.094c-0.084-0.047-0.166-0.098-0.256-0.135  c-0.078-0.032-0.16-0.05-0.24-0.075c-0.075-0.022-0.148-0.051-0.226-0.067c-0.159-0.032-0.32-0.048-0.481-0.048  c-0.002,0-0.005-0.001-0.007-0.001l0,0c-0.165,0-0.328,0.017-0.49,0.049c-0.073,0.015-0.141,0.042-0.211,0.063  c-0.086,0.025-0.172,0.044-0.255,0.079c-0.084,0.035-0.161,0.083-0.241,0.126c-0.063,0.035-0.128,0.063-0.189,0.103  c-0.138,0.092-0.267,0.197-0.384,0.314L33.232,53.232c-0.977,0.977-0.977,2.559,0,3.535c0.976,0.977,2.56,0.977,3.535,0L47.5,46.035  V85c0,1.381,1.119,2.5,2.5,2.5s2.5-1.119,2.5-2.5V46.035z"></path></svg>',
   pcUpload:'<svg class="pcUpload-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"><g><path d="M41.8,70.3h16.3c0.8,0,1.5,0.6,1.8,1.3h34.2l-10.2-2.8v-42c0-1.1-0.9-2-2-2H18.1c-1.1,0-2,0.9-2,2v42L5.9,71.6h34.2   C40.3,70.8,41,70.3,41.8,70.3z M18.3,65.6V28.2c0-0.3,0.2-0.5,0.5-0.5h62.3c0.3,0,0.5,0.2,0.5,0.5v37.4c0,0.3-0.2,0.5-0.5,0.5H18.8   C18.6,66.1,18.3,65.8,18.3,65.6z"></path><path d="M58.2,73.9H41.8c-0.8,0-1.5-0.6-1.8-1.3h-36c0.2,1.5,1.5,2.6,3.1,2.6h85.5c1.6,0,2.9-1.1,3.1-2.6h-36   C59.7,73.4,59,73.9,58.2,73.9z"></path><path d="M58.2,71.3H41.8c-0.4,0-0.8,0.4-0.8,0.8c0,0.4,0.4,0.8,0.8,0.8h16.3c0.4,0,0.8-0.4,0.8-0.8C59,71.6,58.6,71.3,58.2,71.3z"></path></g></svg>',
   appStoreBadge: '<svg id="livetype" xmlns="http://www.w3.org/2000/svg" width="119.66407" height="40" viewBox="0 0 119.66407 40"><g><g><g><path d="M110.13477,0H9.53468c-.3667,0-.729,0-1.09473.002-.30615.002-.60986.00781-.91895.0127A13.21476,13.21476,0,0,0,5.5171.19141a6.66509,6.66509,0,0,0-1.90088.627A6.43779,6.43779,0,0,0,1.99757,1.99707,6.25844,6.25844,0,0,0,.81935,3.61816a6.60119,6.60119,0,0,0-.625,1.90332,12.993,12.993,0,0,0-.1792,2.002C.00587,7.83008.00489,8.1377,0,8.44434V31.5586c.00489.3105.00587.6113.01515.9219a12.99232,12.99232,0,0,0,.1792,2.0019,6.58756,6.58756,0,0,0,.625,1.9043A6.20778,6.20778,0,0,0,1.99757,38.001a6.27445,6.27445,0,0,0,1.61865,1.1787,6.70082,6.70082,0,0,0,1.90088.6308,13.45514,13.45514,0,0,0,2.0039.1768c.30909.0068.6128.0107.91895.0107C8.80567,40,9.168,40,9.53468,40H110.13477c.3594,0,.7246,0,1.084-.002.3047,0,.6172-.0039.9219-.0107a13.279,13.279,0,0,0,2-.1768,6.80432,6.80432,0,0,0,1.9082-.6308,6.27742,6.27742,0,0,0,1.6172-1.1787,6.39482,6.39482,0,0,0,1.1816-1.6143,6.60413,6.60413,0,0,0,.6191-1.9043,13.50643,13.50643,0,0,0,.1856-2.0019c.0039-.3106.0039-.6114.0039-.9219.0078-.3633.0078-.7246.0078-1.0938V9.53613c0-.36621,0-.72949-.0078-1.09179,0-.30664,0-.61426-.0039-.9209a13.5071,13.5071,0,0,0-.1856-2.002,6.6177,6.6177,0,0,0-.6191-1.90332,6.46619,6.46619,0,0,0-2.7988-2.7998,6.76754,6.76754,0,0,0-1.9082-.627,13.04394,13.04394,0,0,0-2-.17676c-.3047-.00488-.6172-.01074-.9219-.01269-.3594-.002-.7246-.002-1.084-.002Z" style="fill: #a6a6a6"/><path d="M8.44483,39.125c-.30468,0-.602-.0039-.90429-.0107a12.68714,12.68714,0,0,1-1.86914-.1631,5.88381,5.88381,0,0,1-1.65674-.5479,5.40573,5.40573,0,0,1-1.397-1.0166,5.32082,5.32082,0,0,1-1.02051-1.3965,5.72186,5.72186,0,0,1-.543-1.6572,12.41351,12.41351,0,0,1-.1665-1.875c-.00634-.2109-.01464-.9131-.01464-.9131V8.44434S.88185,7.75293.8877,7.5498a12.37039,12.37039,0,0,1,.16553-1.87207,5.7555,5.7555,0,0,1,.54346-1.6621A5.37349,5.37349,0,0,1,2.61183,2.61768,5.56543,5.56543,0,0,1,4.01417,1.59521a5.82309,5.82309,0,0,1,1.65332-.54394A12.58589,12.58589,0,0,1,7.543.88721L8.44532.875H111.21387l.9131.0127a12.38493,12.38493,0,0,1,1.8584.16259,5.93833,5.93833,0,0,1,1.6709.54785,5.59374,5.59374,0,0,1,2.415,2.41993,5.76267,5.76267,0,0,1,.5352,1.64892,12.995,12.995,0,0,1,.1738,1.88721c.0029.2832.0029.5874.0029.89014.0079.375.0079.73193.0079,1.09179V30.4648c0,.3633,0,.7178-.0079,1.0752,0,.3252,0,.6231-.0039.9297a12.73126,12.73126,0,0,1-.1709,1.8535,5.739,5.739,0,0,1-.54,1.67,5.48029,5.48029,0,0,1-1.0156,1.3857,5.4129,5.4129,0,0,1-1.3994,1.0225,5.86168,5.86168,0,0,1-1.668.5498,12.54218,12.54218,0,0,1-1.8692.1631c-.2929.0068-.5996.0107-.8974.0107l-1.084.002Z"/></g><g id="_Group_" data-name="&lt;Group&gt;"><g id="_Group_2" data-name="&lt;Group&gt;"><g id="_Group_3" data-name="&lt;Group&gt;"><path id="_Path_" data-name="&lt;Path&gt;" d="M24.76888,20.30068a4.94881,4.94881,0,0,1,2.35656-4.15206,5.06566,5.06566,0,0,0-3.99116-2.15768c-1.67924-.17626-3.30719,1.00483-4.1629,1.00483-.87227,0-2.18977-.98733-3.6085-.95814a5.31529,5.31529,0,0,0-4.47292,2.72787c-1.934,3.34842-.49141,8.26947,1.3612,10.97608.9269,1.32535,2.01018,2.8058,3.42763,2.7533,1.38706-.05753,1.9051-.88448,3.5794-.88448,1.65876,0,2.14479.88448,3.591.8511,1.48838-.02416,2.42613-1.33124,3.32051-2.66914a10.962,10.962,0,0,0,1.51842-3.09251A4.78205,4.78205,0,0,1,24.76888,20.30068Z" style="fill: #fff"/><path id="_Path_2" data-name="&lt;Path&gt;" d="M22.03725,12.21089a4.87248,4.87248,0,0,0,1.11452-3.49062,4.95746,4.95746,0,0,0-3.20758,1.65961,4.63634,4.63634,0,0,0-1.14371,3.36139A4.09905,4.09905,0,0,0,22.03725,12.21089Z" style="fill: #fff"/></g></g><g><path d="M42.30227,27.13965h-4.7334l-1.13672,3.35645H34.42727l4.4834-12.418h2.083l4.4834,12.418H43.438ZM38.0591,25.59082h3.752l-1.84961-5.44727h-.05176Z" style="fill: #fff"/><path d="M55.15969,25.96973c0,2.81348-1.50586,4.62109-3.77832,4.62109a3.0693,3.0693,0,0,1-2.84863-1.584h-.043v4.48438h-1.8584V21.44238H48.4302v1.50586h.03418a3.21162,3.21162,0,0,1,2.88281-1.60059C53.645,21.34766,55.15969,23.16406,55.15969,25.96973Zm-1.91016,0c0-1.833-.94727-3.03809-2.39258-3.03809-1.41992,0-2.375,1.23047-2.375,3.03809,0,1.82422.95508,3.0459,2.375,3.0459C52.30227,29.01563,53.24953,27.81934,53.24953,25.96973Z" style="fill: #fff"/><path d="M65.12453,25.96973c0,2.81348-1.50586,4.62109-3.77832,4.62109a3.0693,3.0693,0,0,1-2.84863-1.584h-.043v4.48438h-1.8584V21.44238H58.395v1.50586h.03418A3.21162,3.21162,0,0,1,61.312,21.34766C63.60988,21.34766,65.12453,23.16406,65.12453,25.96973Zm-1.91016,0c0-1.833-.94727-3.03809-2.39258-3.03809-1.41992,0-2.375,1.23047-2.375,3.03809,0,1.82422.95508,3.0459,2.375,3.0459C62.26711,29.01563,63.21438,27.81934,63.21438,25.96973Z" style="fill: #fff"/><path d="M71.71047,27.03613c.1377,1.23145,1.334,2.04,2.96875,2.04,1.56641,0,2.69336-.80859,2.69336-1.91895,0-.96387-.67969-1.541-2.28906-1.93652l-1.60937-.3877c-2.28027-.55078-3.33887-1.61719-3.33887-3.34766,0-2.14258,1.86719-3.61426,4.51855-3.61426,2.624,0,4.42285,1.47168,4.4834,3.61426h-1.876c-.1123-1.23926-1.13672-1.9873-2.63379-1.9873s-2.52148.75684-2.52148,1.8584c0,.87793.6543,1.39453,2.25488,1.79l1.36816.33594c2.54785.60254,3.60645,1.626,3.60645,3.44238,0,2.32324-1.85059,3.77832-4.79395,3.77832-2.75391,0-4.61328-1.4209-4.7334-3.667Z" style="fill: #fff"/><path d="M83.34621,19.2998v2.14258h1.72168v1.47168H83.34621v4.99121c0,.77539.34473,1.13672,1.10156,1.13672a5.80752,5.80752,0,0,0,.61133-.043v1.46289a5.10351,5.10351,0,0,1-1.03223.08594c-1.833,0-2.54785-.68848-2.54785-2.44434V22.91406H80.16262V21.44238H81.479V19.2998Z" style="fill: #fff"/><path d="M86.065,25.96973c0-2.84863,1.67773-4.63867,4.29395-4.63867,2.625,0,4.29492,1.79,4.29492,4.63867,0,2.85645-1.66113,4.63867-4.29492,4.63867C87.72609,30.6084,86.065,28.82617,86.065,25.96973Zm6.69531,0c0-1.9541-.89551-3.10742-2.40137-3.10742s-2.40039,1.16211-2.40039,3.10742c0,1.96191.89453,3.10645,2.40039,3.10645S92.76027,27.93164,92.76027,25.96973Z" style="fill: #fff"/><path d="M96.18606,21.44238h1.77246v1.541h.043a2.1594,2.1594,0,0,1,2.17773-1.63574,2.86616,2.86616,0,0,1,.63672.06934v1.73828a2.59794,2.59794,0,0,0-.835-.1123,1.87264,1.87264,0,0,0-1.93652,2.083v5.37012h-1.8584Z" style="fill: #fff"/><path d="M109.3843,27.83691c-.25,1.64355-1.85059,2.77148-3.89844,2.77148-2.63379,0-4.26855-1.76465-4.26855-4.5957,0-2.83984,1.64355-4.68164,4.19043-4.68164,2.50488,0,4.08008,1.7207,4.08008,4.46582v.63672h-6.39453v.1123a2.358,2.358,0,0,0,2.43555,2.56445,2.04834,2.04834,0,0,0,2.09082-1.27344Zm-6.28223-2.70215h4.52637a2.1773,2.1773,0,0,0-2.2207-2.29785A2.292,2.292,0,0,0,103.10207,25.13477Z" style="fill: #fff"/></g></g></g><g id="_Group_4" data-name="&lt;Group&gt;"><g><path d="M37.82619,8.731a2.63964,2.63964,0,0,1,2.80762,2.96484c0,1.90625-1.03027,3.002-2.80762,3.002H35.67092V8.731Zm-1.22852,5.123h1.125a1.87588,1.87588,0,0,0,1.96777-2.146,1.881,1.881,0,0,0-1.96777-2.13379h-1.125Z" style="fill: #fff"/><path d="M41.68068,12.44434a2.13323,2.13323,0,1,1,4.24707,0,2.13358,2.13358,0,1,1-4.24707,0Zm3.333,0c0-.97607-.43848-1.54687-1.208-1.54687-.77246,0-1.207.5708-1.207,1.54688,0,.98389.43457,1.55029,1.207,1.55029C44.57522,13.99463,45.01369,13.42432,45.01369,12.44434Z" style="fill: #fff"/><path d="M51.57326,14.69775h-.92187l-.93066-3.31641h-.07031l-.92676,3.31641h-.91309l-1.24121-4.50293h.90137l.80664,3.436h.06641l.92578-3.436h.85254l.92578,3.436h.07031l.80273-3.436h.88867Z" style="fill: #fff"/><path d="M53.85354,10.19482H54.709v.71533h.06641a1.348,1.348,0,0,1,1.34375-.80225,1.46456,1.46456,0,0,1,1.55859,1.6748v2.915h-.88867V12.00586c0-.72363-.31445-1.0835-.97168-1.0835a1.03294,1.03294,0,0,0-1.0752,1.14111v2.63428h-.88867Z" style="fill: #fff"/><path d="M59.09377,8.437h.88867v6.26074h-.88867Z" style="fill: #fff"/><path d="M61.21779,12.44434a2.13346,2.13346,0,1,1,4.24756,0,2.1338,2.1338,0,1,1-4.24756,0Zm3.333,0c0-.97607-.43848-1.54687-1.208-1.54687-.77246,0-1.207.5708-1.207,1.54688,0,.98389.43457,1.55029,1.207,1.55029C64.11232,13.99463,64.5508,13.42432,64.5508,12.44434Z" style="fill: #fff"/><path d="M66.4009,13.42432c0-.81055.60352-1.27783,1.6748-1.34424l1.21973-.07031v-.38867c0-.47559-.31445-.74414-.92187-.74414-.49609,0-.83984.18213-.93848.50049h-.86035c.09082-.77344.81836-1.26953,1.83984-1.26953,1.12891,0,1.76563.562,1.76563,1.51318v3.07666h-.85547v-.63281h-.07031a1.515,1.515,0,0,1-1.35254.707A1.36026,1.36026,0,0,1,66.4009,13.42432Zm2.89453-.38477v-.37646l-1.09961.07031c-.62012.0415-.90137.25244-.90137.64941,0,.40527.35156.64111.835.64111A1.0615,1.0615,0,0,0,69.29543,13.03955Z" style="fill: #fff"/><path d="M71.34816,12.44434c0-1.42285.73145-2.32422,1.86914-2.32422a1.484,1.484,0,0,1,1.38086.79h.06641V8.437h.88867v6.26074h-.85156v-.71143h-.07031a1.56284,1.56284,0,0,1-1.41406.78564C72.0718,14.772,71.34816,13.87061,71.34816,12.44434Zm.918,0c0,.95508.4502,1.52979,1.20313,1.52979.749,0,1.21191-.583,1.21191-1.52588,0-.93848-.46777-1.52979-1.21191-1.52979C72.72121,10.91846,72.26613,11.49707,72.26613,12.44434Z" style="fill: #fff"/><path d="M79.23,12.44434a2.13323,2.13323,0,1,1,4.24707,0,2.13358,2.13358,0,1,1-4.24707,0Zm3.333,0c0-.97607-.43848-1.54687-1.208-1.54687-.77246,0-1.207.5708-1.207,1.54688,0,.98389.43457,1.55029,1.207,1.55029C82.12453,13.99463,82.563,13.42432,82.563,12.44434Z" style="fill: #fff"/><path d="M84.66945,10.19482h.85547v.71533h.06641a1.348,1.348,0,0,1,1.34375-.80225,1.46456,1.46456,0,0,1,1.55859,1.6748v2.915H87.605V12.00586c0-.72363-.31445-1.0835-.97168-1.0835a1.03294,1.03294,0,0,0-1.0752,1.14111v2.63428h-.88867Z" style="fill: #fff"/><path d="M93.51516,9.07373v1.1416h.97559v.74854h-.97559V13.2793c0,.47168.19434.67822.63672.67822a2.96657,2.96657,0,0,0,.33887-.02051v.74023a2.9155,2.9155,0,0,1-.4834.04541c-.98828,0-1.38184-.34766-1.38184-1.21582v-2.543h-.71484v-.74854h.71484V9.07373Z" style="fill: #fff"/><path d="M95.70461,8.437h.88086v2.48145h.07031a1.3856,1.3856,0,0,1,1.373-.80664,1.48339,1.48339,0,0,1,1.55078,1.67871v2.90723H98.69v-2.688c0-.71924-.335-1.0835-.96289-1.0835a1.05194,1.05194,0,0,0-1.13379,1.1416v2.62988h-.88867Z" style="fill: #fff"/><path d="M104.76125,13.48193a1.828,1.828,0,0,1-1.95117,1.30273A2.04531,2.04531,0,0,1,100.73,12.46045a2.07685,2.07685,0,0,1,2.07617-2.35254c1.25293,0,2.00879.856,2.00879,2.27V12.688h-3.17969v.0498a1.1902,1.1902,0,0,0,1.19922,1.29,1.07934,1.07934,0,0,0,1.07129-.5459Zm-3.126-1.45117h2.27441a1.08647,1.08647,0,0,0-1.1084-1.1665A1.15162,1.15162,0,0,0,101.63527,12.03076Z" style="fill: #fff"/></g></g></g></svg>',
   googlePlayBadge: '<svg class="googlePlayBadge" id="svg51" width="180" height="53.333" version="1.1" viewBox="0 0 180 53.333" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><metadata id="metadata9"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/></cc:Work></rdf:RDF></metadata><path id="path11" d="m173.33 53.333h-166.66c-3.6666 0-6.6665-2.9999-6.6665-6.6665v-39.999c0-3.6666 2.9999-6.6665 6.6665-6.6665h166.66c3.6666 0 6.6665 2.9999 6.6665 6.6665v39.999c0 3.6666-2.9999 6.6665-6.6665 6.6665" fill="#100f0d" stroke-width=".13333"/><path id="path13" d="m173.33 1e-3h-166.66c-3.6666 0-6.6665 2.9999-6.6665 6.6665v39.999c0 3.6666 2.9999 6.6665 6.6665 6.6665h166.66c3.6666 0 6.6665-2.9999 6.6665-6.6665v-39.999c0-3.6666-2.9999-6.6665-6.6665-6.6665zm0 1.0661c3.0879 0 5.5999 2.5125 5.5999 5.6004v39.999c0 3.0879-2.5119 5.6004-5.5999 5.6004h-166.66c-3.0879 0-5.5993-2.5125-5.5993-5.6004v-39.999c0-3.0879 2.5114-5.6004 5.5993-5.6004h166.66" fill="#a2a2a1" stroke-width=".13333"/><path id="path35" d="m142.58 40h2.4879v-16.669h-2.4879zm22.409-10.664-2.8519 7.2264h-0.0853l-2.9599-7.2264h-2.6799l4.4399 10.1-2.5319 5.6185h2.5946l6.8412-15.718zm-14.11 8.7706c-0.81331 0-1.9506-0.40786-1.9506-1.4156 0-1.2865 1.416-1.7797 2.6373-1.7797 1.0933 0 1.6093 0.23546 2.2733 0.55732-0.19333 1.5442-1.5226 2.6379-2.9599 2.6379zm0.30133-9.1352c-1.8013 0-3.6666 0.79371-4.4386 2.5521l2.208 0.92184c0.47198-0.92184 1.3506-1.2218 2.2733-1.2218 1.2866 0 2.5946 0.77131 2.6159 2.1442v0.17133c-0.45066-0.25733-1.416-0.64318-2.5946-0.64318-2.3813 0-4.8039 1.3077-4.8039 3.7524 0 2.2302 1.952 3.6671 4.1386 3.6671 1.672 0 2.5959-0.75054 3.1732-1.6301h0.0867v1.2874h2.4026v-6.391c0-2.9593-2.2106-4.6103-5.0612-4.6103zm-15.376 2.3937h-3.5386v-5.7133h3.5386c1.86 0 2.9159 1.5396 2.9159 2.8566 0 1.2917-1.056 2.8567-2.9159 2.8567zm-0.064-8.0337h-5.9614v16.669h2.4869v-6.3149h3.4746c2.7573 0 5.4679-1.9958 5.4679-5.1765 0-3.1801-2.7106-5.1769-5.4679-5.1769zm-32.507 14.778c-1.7188 0-3.1573-1.4396-3.1573-3.415 0-1.9984 1.4385-3.4583 3.1573-3.4583 1.6969 0 3.0286 1.46 3.0286 3.4583 0 1.9754-1.3317 3.415-3.0286 3.415zm2.8567-7.8403h-0.086c-0.55826-0.66572-1.6328-1.2672-2.9853-1.2672-2.8359 0-5.4348 2.4921-5.4348 5.6925 0 3.1786 2.5989 5.6488 5.4348 5.6488 1.3525 0 2.427-0.6016 2.9853-1.2885h0.086v0.81558c0 2.1703-1.1598 3.3296-3.0286 3.3296-1.5245 0-2.4697-1.0953-2.8567-2.0188l-2.1691 0.90206c0.62238 1.503 2.2759 3.351 5.0259 3.351 2.9218 0 5.392-1.7188 5.392-5.9077v-10.181h-2.3634zm4.0822 9.7304h2.4906v-16.669h-2.4906zm6.164-5.4988c-0.0641-2.1911 1.6978-3.3078 2.9645-3.3078 0.98851 0 1.8254 0.49425 2.1057 1.2026zm7.7326-1.8906c-0.47238-1.2666-1.9114-3.6082-4.8541-3.6082-2.9218 0-5.3488 2.2983-5.3488 5.6707 0 3.1791 2.4062 5.6707 5.6275 5.6707 2.5989 0 4.1031-1.589 4.7264-2.513l-1.9333-1.289c-0.64465 0.94531-1.5249 1.5682-2.7931 1.5682-1.2666 0-2.1692-0.58012-2.7483-1.7186l7.5815-3.1359zm-60.409-1.8682v2.4057h5.7565c-0.17186 1.3532-0.62292 2.3411-1.3104 3.0286-0.83798 0.83745-2.1483 1.7614-4.4462 1.7614-3.5443 0-6.315-2.8567-6.315-6.4009s2.7707-6.4013 6.315-6.4013c1.9118 0 3.3077 0.75198 4.3388 1.7186l1.6974-1.6973c-1.4396-1.3745-3.351-2.427-6.0362-2.427-4.8552 0-8.9363 3.9524-8.9363 8.807 0 4.8541 4.0811 8.8066 8.9363 8.8066 2.6202 0 4.5967-0.85932 6.143-2.4702 1.5896-1.5896 2.0838-3.8234 2.0838-5.628 0-0.55785-0.04333-1.0734-0.1292-1.5032zm14.772 7.3675c-1.7188 0-3.201-1.4177-3.201-3.4368 0-2.0406 1.4822-3.4364 3.201-3.4364 1.7181 0 3.2003 1.3958 3.2003 3.4364 0 2.0191-1.4822 3.4368-3.2003 3.4368zm0-9.1075c-3.137 0-5.6927 2.3842-5.6927 5.6707 0 3.265 2.5557 5.6707 5.6927 5.6707 3.1358 0 5.692-2.4057 5.692-5.6707 0-3.2865-2.5562-5.6707-5.692-5.6707zm12.417 9.1075c-1.7176 0-3.2003-1.4177-3.2003-3.4368 0-2.0406 1.4828-3.4364 3.2003-3.4364 1.7188 0 3.2005 1.3958 3.2005 3.4364 0 2.0191-1.4817 3.4368-3.2005 3.4368zm0-9.1075c-3.1358 0-5.6915 2.3842-5.6915 5.6707 0 3.265 2.5557 5.6707 5.6915 5.6707 3.137 0 5.6927-2.4057 5.6927-5.6707 0-3.2865-2.5557-5.6707-5.6927-5.6707" fill="#fff" stroke-width=".13333"/><path id="path37" d="m27.622 25.899-14.194 15.066c5.34e-4 0.0031 0.0016 0.0057 0.0021 0.0089 0.43532 1.636 1.9296 2.8406 3.703 2.8406 0.70892 0 1.3745-0.19166 1.9453-0.52812l0.04533-0.02656 15.978-9.22-7.479-8.141" fill="#eb3131" stroke-width=".13333"/><path id="path39" d="m41.983 23.334-0.0136-0.0093-6.8982-3.999-7.7717 6.9156 7.7987 7.7977 6.8618-3.9592c1.203-0.64945 2.0197-1.9177 2.0197-3.3802 0-1.452-0.80571-2.7139-1.9968-3.3655" fill="#f6b60b" stroke-width=".13333"/><path id="path41" d="m13.426 12.37c-0.08533 0.31466-0.13018 0.64425-0.13018 0.98651v26.623c0 0.34162 0.04432 0.67233 0.13072 0.98587l14.684-14.681-14.684-13.914" fill="#5778c5" stroke-width=".13333"/><path id="path43" d="m27.727 26.668 7.3473-7.3451-15.96-9.2534c-0.58012-0.34746-1.2572-0.54799-1.9817-0.54799-1.7734 0-3.2697 1.2068-3.7051 2.8447-5.34e-4 0.0016-5.34e-4 0.0027-5.34e-4 0.0041l14.3 14.298" fill="#3bad49" stroke-width=".13333"/><path id="path33" d="m63.193 13.042h-3.8895v0.96251h2.9146c-0.0792 0.78545-0.39172 1.4021-0.91878 1.85-0.52705 0.44799-1.2 0.67292-1.9958 0.67292-0.87291 0-1.6125-0.30413-2.2186-0.90824-0.59385-0.61665-0.89584-1.3792-0.89584-2.2979 0-0.91864 0.30199-1.6812 0.89584-2.2978 0.60612-0.60412 1.3457-0.90624 2.2186-0.90624 0.44799 0 0.87504 0.07707 1.2666 0.24586 0.39172 0.16866 0.70625 0.40412 0.95211 0.70625l0.73958-0.73958c-0.33546-0.38132-0.76038-0.67292-1.2876-0.88544-0.52705-0.21253-1.077-0.31453-1.6708-0.31453-1.1645 0-2.1519 0.40412-2.9582 1.2104-0.80625 0.80825-1.2104 1.8041-1.2104 2.9811 0 1.177 0.40412 2.175 1.2104 2.9813 0.80625 0.80611 1.7937 1.2104 2.9582 1.2104 1.2229 0 2.1979-0.39172 2.9479-1.1876 0.66038-0.66238 0.99784-1.5582 0.99784-2.679 0-0.1896-0.02293-0.39172-0.05627-0.60425zm1.5068-3.7332v8.0249h4.6852v-0.98544h-3.654v-2.5457h3.2958v-0.96251h-3.2958v-2.5437h3.654v-0.98758zm11.255 0.98758v-0.98758h-5.5145v0.98758h2.2417v7.0373h1.0312v-7.0373zm4.9925-0.98758h-1.0312v8.0249h1.0312zm6.8066 0.98758v-0.98758h-5.5144v0.98758h2.2415v7.0373h1.0312v-7.0373zm10.406 0.05626c-0.79585-0.81877-1.7708-1.2229-2.9354-1.2229-1.1666 0-2.1415 0.40412-2.9374 1.2104-0.79585 0.79585-1.1874 1.7937-1.1874 2.9811s0.39159 2.1854 1.1874 2.9813c0.79585 0.80611 1.7708 1.2104 2.9374 1.2104 1.1541 0 2.1395-0.40426 2.9354-1.2104 0.79585-0.79585 1.1874-1.7938 1.1874-2.9813 0-1.177-0.39159-2.1729-1.1874-2.9686zm-5.1332 0.67078c0.59372-0.60412 1.3229-0.90624 2.1978-0.90624 0.87291 0 1.6021 0.30213 2.1854 0.90624 0.59372 0.59372 0.88531 1.3686 0.88531 2.2978 0 0.93131-0.29159 1.7041-0.88531 2.2979-0.58332 0.60412-1.3125 0.90824-2.1854 0.90824-0.87491 0-1.6041-0.30413-2.1978-0.90824-0.58132-0.60625-0.87291-1.3666-0.87291-2.2979 0-0.92918 0.29159-1.6916 0.87291-2.2978zm8.7706 1.3125-0.0437-1.548h0.0437l4.0791 6.5457h1.077v-8.0249h-1.0312v4.6957l0.0437 1.548h-0.0437l-3.8999-6.2437h-1.2562v8.0249h1.0312z" fill="#fff" stroke="#fff" stroke-miterlimit="10" stroke-width=".26666"/></svg>'
}

dale.go (CSS.vars.tagColors, function (color) {
   svg ['tagItem' + color] = '<svg class="tag__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="' + color + '" d="m18.6 10.8c0 .5-.1 1.1-.5 1.5l-5 5.9c-.4.5-1 .7-1.5.7s-.9-.2-1.3-.5l-3.8-3.2c-.8-.7-.9-2-.2-2.8l5-5.9c.3-.4.8-.7 1.3-.7l3.5-.3c1.1-.1 2.1.7 2.2 1.8z"/></svg>';
   svg ['tagItemHorizontal' + color] = '<svg class="tag__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="' + color + '" d="m18.6 10.8c0 .5-.1 1.1-.5 1.5l-5 5.9c-.4.5-1 .7-1.5.7s-.9-.2-1.3-.5l-3.8-3.2c-.8-.7-.9-2-.2-2.8l5-5.9c.3-.4.8-.7 1.3-.7l3.5-.3c1.1-.1 2.1.7 2.2 1.8z"/></svg>';
   svg ['tagSharedWithMe' + color] = '<svg viewBox="0.0 0.0 12.0 12.0" width="17" height="15" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l12.0 0l0 12.0l-12.0 0l0 -12.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l12.0 0l0 12.0l-12.0 0z" fill-rule="evenodd"/><path fill="' + color + '" d="m6.1472383 2.3476114l0 0c0 -1.2340425 0.98982143 -2.2344315 2.2108283 -2.2344315l0 0c0.5863476 0 1.1486807 0.23541263 1.5632915 0.6544498c0.41461086 0.41903716 0.6475363 0.98737365 0.6475363 1.5799818l0 0c0 1.2340424 -0.98982143 2.2344313 -2.2108278 2.2344313l0 0c-1.2210069 0 -2.2108283 -1.0003889 -2.2108283 -2.2344313z" fill-rule="evenodd"/><path fill="' + color + '" d="m6.909059 5.6999073l2.8811774 0l0 0c0.5861368 0 1.1482677 0.23284197 1.5627289 0.6473031c0.41446114 0.4144616 0.6473026 0.9765916 0.6473026 1.5627284l0 2.258831c0 3.4332275E-5 -2.670288E-5 6.1035156E-5 -6.0081482E-5 6.1035156E-5l-7.3011804 -6.1035156E-5l0 0c-3.385544E-5 0 -6.1035156E-5 -2.670288E-5 -6.1035156E-5 -6.0081482E-5l6.1035156E-5 -2.258771l0 0c0 -1.2205667 0.98946476 -2.2100315 2.2100315 -2.2100315z" fill-rule="evenodd"/><path fill="' + color + '" d="m1.4481676 4.0693617l0 0c0 -1.2320263 0.9896877 -2.2307808 2.2105293 -2.2307808l0 0c0.58626866 0 1.1485255 0.23502803 1.5630805 0.65338063c0.4145546 0.4183526 0.647449 0.98576045 0.647449 1.5774002l0 0c0 1.2320261 -0.9896879 2.230781 -2.2105296 2.230781l0 0c-1.2208416 0 -2.2105293 -0.998755 -2.2105293 -2.230781z" fill-rule="evenodd"/><path fill="' + color + '" d="m2.0676901 7.4253793l3.166024 0l0 0c0.54839087 0 1.0743213 0.21784782 1.4620924 0.60561895c0.38777113 0.38777065 0.6056185 0.91370106 0.6056185 1.4620924l0 2.3938503c0 3.33786E-5 -2.7179718E-5 6.1035156E-5 -6.1035156E-5 6.1035156E-5l-7.3013844 -6.1035156E-5l0 0c-3.3603974E-5 0 -6.084538E-5 -2.670288E-5 -6.084538E-5 -6.1035156E-5l6.084538E-5 -2.3937893l0 0c0 -1.1419659 0.92574567 -2.0677114 2.0677106 -2.0677114z" fill-rule="evenodd"/></g></svg>';
});

// *** HELPERS ***

var H = {};

H.putSvg = function (which, height) {
   return ['span', {opaque: true, style: ! height ? undefined : style ({height: height})}, ['LITERAL', svg [which]]];
}

H.matchVerb = function (ev, responder) {
   return B.r.compare (ev.verb, responder.verb);
}

H.pad = function (v) {return v < 10 ? '0' + v : v}

H.formatDate = function (d) {
   d = new Date (d);
   return H.pad (d.getUTCDate ()) + '/' + H.pad (d.getUTCMonth () + 1) + '/' + d.getUTCFullYear ();
}

H.formatChunkDates = function (d1, d2, shortMonths) {
   if (! d1 || ! d2) return '';
   var m = new Date (Math.min (d1, d2)), M = new Date (Math.max (d1, d2));
   if (shortMonths) var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
   else             var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
   // Formats: 1) m d, y ; 2) m d - d, y ; 3) m d - m d, y ; 4) m d, y - m d, y
   if (m.getUTCFullYear () !== M.getUTCFullYear ()) return [months [m.getUTCMonth ()], m.getUTCDate () + ',', m.getUTCFullYear (), '-', months [M.getUTCMonth ()], M.getUTCDate () + ',', M.getUTCFullYear ()].join (' ');
   if (m.getUTCMonth () !== M.getUTCMonth ()) return [months [m.getUTCMonth ()], m.getUTCDate (), '-', months [M.getUTCMonth ()], M.getUTCDate () + ',', M.getUTCFullYear ()].join (' ');
   if (m.getUTCDate () !== M.getUTCDate ()) return [months [m.getUTCMonth ()], m.getUTCDate (), '-', M.getUTCDate () + ',', M.getUTCFullYear ()].join (' ');
   return [months [m.getUTCMonth ()], m.getUTCDate () + ',', M.getUTCFullYear ()].join (' ');
}

H.tagColor = function (tag, a) {
   if (tag === 'u::') return 'untagged';
   if (H.isDateTag (tag)) return 'time';
   if (tag.match (/ \(new tag\)$/)) tag = tag.replace (/ \(new tag\)$/, '');
   var r = dale.acc (tag.split (''), tag [0].charCodeAt (), function (a, b) {
      return a + b.charCodeAt ();
   });
   return CSS.vars.tagColors [r % CSS.vars.tagColors.length];
}

H.isDateTag = function (tag) {
   return !! tag.match (/^(d|r)::/);
}

H.isRangeTag = function (tag) {
   return !! tag.match (/^r::/);
}

H.isYearTag = function (tag) {
   return !! tag.match (/^d::\d/);
}

H.isMonthTag = function (tag) {
   return !! tag.match (/^d::M/);
}

H.isGeoTag = function (tag) {
   return !! tag.match (/^g::/);
}

H.isCountryTag = function (tag) {
   return !! tag.match (/^g::[A-Z]{2}$/);
}

H.trim = function (string) {
   return string.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
}

H.isUserTag = function (tag) {
   tag = H.trim (tag);
   return tag.length > 0 && ! tag.match (/^[a-z]::/);
}

H.makeRegex = function (filter) {
   return new RegExp (filter.replace (/[-[\]{}()*+?.,\\^$|#]/g, '\\$&'), 'i');
}

H.isMobile = function () {
   // https://stackoverflow.com/a/11381730
   return !! navigator.userAgent.match (/android|webos|iphone|ipad|blackberry|windows phone/i);
}

H.if = function (condition, then, Else) {
   return condition ? then : Else;
}

H.email = /^(?=[A-Z0-9][A-Z0-9@._%+-]{5,253}$)[A-Z0-9._%+-]{1,64}@(?:(?=[A-Z0-9-]{1,63}\.)[A-Z0-9]+(?:-[A-Z0-9]+)*\.){1,8}[A-Z]{2,63}$/i

H.stopPropagation = ['stop', 'propagation', {raw: 'event'}];

H.upper = function (s) {
   return dale.go (s.split (' '), function (v) {
      return v [0].toUpperCase () + v.slice (1);
   }).join (' ');
}

H.ago = function (ms) {
   if (ms < 1000 * 60 * 60)      return Math.floor (ms / (1000 * 60)) + ' minutes';
   if (ms < 1000 * 60 * 60 * 24) return Math.floor (ms / (1000 * 60 * 60)) + ' hours';
   return Math.floor (ms / (1000 * 60 * 60 * 24)) + ' days';
}

H.hash = function (file, cb) {
   var freader = new FileReader (), hash = false;
   freader.readAsArrayBuffer (file);
   freader.onerror = function () {cb (true)}
   freader.onload = function () {
      cb (null, murmur.v3 (new Uint8Array (freader.result)) + ':' + file.size);
   }
}

// Computes the width and height of the thumbnail of a piv
H.computePivFrame = function (piv) {
   if (piv.frame) return piv.frame;
   var askance = piv.deg === 90 || piv.deg === -90;
   var pivWidth = askance ? piv.dimh : piv.dimw, pivHeight = askance ? piv.dimw : piv.dimh;
   var pivRatio = pivWidth / pivHeight;
   // .pictures-grid__item: padding-bottom: 18px, padding right: 16px
   var height = CSS.pivWidths [1] - 18, width, sizes = [CSS.pivWidths [0] - 16, CSS.pivWidths [1] - 16, CSS.pivWidths [2] - 16, CSS.pivWidths [3] - 16];
   if      (pivRatio <= (sizes [0] / height)) width = sizes [0];
   else if (pivRatio <= (sizes [1] / height)) width = sizes [1];
   else if (pivRatio <= (sizes [2] / height)) width = sizes [2];
   else                                       width = sizes [3];
   piv.frame = {askance: askance, height: height, width: width};
   return piv.frame;
}

H.chunkSizes = [10, 20, 40];

// Computes the chunks into which to split the pivs currently displayed
H.computeChunks = function (x, pivs) {
   var t = Date.now (), chunks = [];

   var gridWidth = Math.max (document.documentElement.clientWidth || 0, window.innerWidth || 0) - 300 - CSS.vars ['padding--l'];

   var computeHeight = function (chunk) {

      var rows = 1, width = 0;

      // Chunk header has 25px height and chunk has 30px padding top, hence offset from top of the chunk is 55px
      // Each row is always CSS.pivWidths [1] high

      dale.go (chunk.pivs, function (piv, k) {
         // We put a `start` field on the piv to know its position.
         H.computePivFrame (piv);
         // 16px is padding-right for each piv
         if ((width + piv.frame.width + 16) > gridWidth) {
            width = piv.frame.width + 16;
            rows++;
         }
         else width += piv.frame.width + 16;
         // For first piv, we set the start to the chunk start since when we want to focus the first piv of a chunk, we also want to see the chunk header
         if (k === 0) piv.start = chunk.start;
         else         piv.start = chunk.start + 55 + (rows - 1) * CSS.pivWidths [1];
      });

      return 55 + rows * CSS.pivWidths [1];
   };

   var computeRepulsion = function (chunkSize) {

      // Map points after the second chunk to the points between the first and second chunk
      // chunkSize > 50 -> REPULSION: 1
      if (chunkSize > H.chunkSizes [2] + (H.chunkSizes [2] - H.chunkSizes [1]) / 2) return 1;
      // chunkSize between 21-50: 21 is 19.5, 30 is 15, 40 is 20, 50 is 15
      if (chunkSize > H.chunkSizes [1]) {
         if (chunkSize > H.chunkSizes [2]) chunkSize = H.chunkSizes [2] - (chunkSize - H.chunkSizes [2]);
         var midPoint = H.chunkSizes [1] + (H.chunkSizes [2] - H.chunkSizes [1]) / 2;
         if (chunkSize > midPoint) chunkSize = midPoint - (chunkSize - midPoint);
         chunkSize = H.chunkSizes [1] - (chunkSize - H.chunkSizes [1]) * (H.chunkSizes [1] - H.chunkSizes [0]) / (H.chunkSizes [2] - H.chunkSizes [1]);
         // 21: 19.5 -> 20 - 0.5 -> 20 - (21 - 20) * 0.5 // (40 - 20) / (20
      }

      // Map points after the first chunk to the curve from 0 to the first chunk.
      // chunkSize between 11 and 20: 11 is 8, 12 is 6, 15 is 0, 16 is 2, 19 is 8
      if (chunkSize > H.chunkSizes [0] && chunkSize <= H.chunkSizes [1]) {
         var midPoint = H.chunkSizes [0] + (H.chunkSizes [1] - H.chunkSizes [0]) / 2;
         if (chunkSize > midPoint) chunkSize = midPoint - (chunkSize - midPoint);

         chunkSize = H.chunkSizes [0] - (chunkSize - H.chunkSizes [0]) * (H.chunkSizes [0] / ((H.chunkSizes [1] - H.chunkSizes [0]) / 2));
      }

      // https://www.desmos.com/calculator
      // \frac{1}{\log\ \left(x+5\right)}-\frac{1}{\log\ \left(15\right)}
      return 1 / Math.log10 (chunkSize + 5) - 1 / Math.log10 (15);
   }
   var computeAttraction = function (ms) {
      var baseUnit = 10;
      if (ms < baseUnit) return 1;
      var multipliers = [100, 60, 30, 2, 8, 3, 7, 2.15, 2, 6];
      var boundaries = [];
      dale.go (multipliers, function (multiplier) {
         if (! boundaries.length) boundaries.push (baseUnit * multiplier);
         else                     boundaries.push (teishi.last (boundaries) * multiplier);
      });
      if (ms >= teishi.last (boundaries)) return 0;
      boundaries.reverse ();
      // Base level: 0.5?
      var jump = 0.4 / boundaries.length;
      return dale.stopNot (boundaries, undefined, function (boundary, k) {
         if (ms >= boundary) return 1 - jump * (boundaries.length - k);
      });
      // return 1 / Math.log10 (ms);
   }

   var dateField = B.get ('State', 'query', 'sort') === 'upload' ? 'dateup' : 'date';

   dale.go (pivs, function (piv, k) {
      piv.index = k;
      if (k === 0) return chunks.push ({pivs: [piv]});
      var gap = Math.abs (piv [dateField] - pivs [k - 1] [dateField]);
      var repulsionForce  = computeRepulsion (teishi.last (chunks).pivs.length);
      var attractionForce = computeAttraction (gap);
      // clog ('DEBUG REPULSION', teishi.last (chunks).length, repulsionForce, 'ATTRACTION', H.ago (gap), attractionForce);
      // If repulsion > attraction, create a new chunk
      if (repulsionForce > attractionForce) chunks.push ({pivs: [piv]});
      else teishi.last (chunks).pivs.push (piv);
   });

   // The first chunk starts at the top of .pictures-grid. However, many of the elements on top of it are not affected by scroll. The header is "compressible" when it scrolls down. The extent of this compressibility is the offset Y, at which, if we scroll to Y+1, the very top of the first chunk is already shaved from the top. This compressible area is the .pictures-header padding-top (CSS.vars ['padding--s']) and its margin-bottom (CSS.vars.spaceVer (2)), plus the margin-bottom of .header (1px)
   var topOffset = CSS.vars ['padding--s'] + CSS.typography.spaceVerPx (2) + 1;

   dale.go (chunks, function (chunk, k) {
      chunk.start = k === 0 ? topOffset : chunks [k - 1].end;
      chunk.end   = chunk.start + computeHeight (chunk);
   });
   B.call (x, 'split', 'chunks', {chunks: chunks.length, pivs: pivs.length, ms: Date.now () - t, bytes: JSON.stringify (pivs).length});
   return chunks;
}

// *** VIEWS ***

var views = {};

// *** NATIVE RESPONDERS ***

window.onerror = function () {
   B.call ('error', [], arguments [0], arguments [1], arguments [2], arguments [3], arguments [4]);
}

window.addEventListener ('hashchange', function () {
   B.call ('read', 'hash', window.location.hash);
});

window.addEventListener ('keydown', function (ev) {
   B.call ('key', 'down', (ev || document.event).keyCode);
});

window.addEventListener ('keyup', function (ev) {
   B.call ('key', 'up', (ev || document.event).keyCode);
});

window.addEventListener ('scroll', function (ev) {
   B.call ('scroll', []);
});

window.onbeforeunload = function () {
   if ((B.get ('State', 'upload', 'queue') || []).length) return 'Are you sure you want to leave?';
}

dale.go (['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange', 'MSFullscreenChange'], function (v) {
   document.addEventListener (v, function () {
      if (! document.fullscreenElement && ! document.webkitIsFullScreen && ! document.mozFullScreen && ! document.msFullscreenElement) {
         B.call ('exit', 'fullscreen', true);
      }
   });
});

window.addEventListener ('dragover', function (ev) {
   ev.preventDefault ();
});

window.addEventListener ('drop', function (ev) {
   B.call ('drop', 'files', ev);
   ev.preventDefault ();
});

document.body.addEventListener ('touchstart', function (ev) {
   B.call ('touch', 'start', ev);
});

document.body.addEventListener ('touchend', function (ev) {
   B.call ('touch', 'end', ev);
});

// *** RESPONDERS ***

B.r.addLog = function (log) {
   if (log.args && log.args [1] && log.args [1].password) log.args [1].password = 'REDACTED';
   // Store up to 2000 items in the log.
   if (B.log.length >= 2000) B.log.shift ();
   B.log.push (log);
}

// We forget gotoB's error responder.
B.forget ('error');

B.mrespond ([

   // *** GENERAL RESPONDERS ***

   ['initialize', [], {burn: true}, function (x) {
      document.querySelector ('meta[name="viewport"]').content = 'width=1200';
      B.call (x, 'reset',    'store');
      B.call (x, 'retrieve', 'csrf');
      B.mount ('body', views.base);

      // With profuse thanks to https://matcha.fyi/keep-screen-awake-javascript/
      B.call (x, 'set', ['State', 'uploadRefresh'], setInterval (function () {
         if (! (B.get ('State', 'upload', 'queue') || []).length) return;
         requestAnimationFrame (function () {document.body.style.background = 'white'});
      }, 1000));
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
   [/^(get|post)$/, [], {match: H.matchVerb}, function (x, headers, body, cb) {
      var t = Date.now (), path = x.path [0];
      if (x.verb === 'post' && ! inc (['requestInvite', 'auth/login', 'auth/signup', 'auth/recover', 'auth/reset'], path)) {
         if (type (body, true) === 'formdata') body.append ('csrf', B.get ('Data', 'csrf'));
         else                                  body.csrf = B.get ('Data', 'csrf');
      }
      c.ajax (x.verb, path, headers, body, function (error, rs) {
         B.call (x, 'ajax ' + x.verb, path, {t: Date.now () - t, code: error ? error.status : rs.xhr.status});
         var authPath = path === 'csrf' || path.match (/^auth/);
         if (! authPath && B.get ('lastLogout') && B.get ('lastLogout') > t) return;
         if (! authPath && error && error.status === 403) {
            B.call (x, 'reset', 'store', true);
            B.call (x, 'goto', 'page', 'login');
            return B.call (x, 'snackbar', 'red', 'Your session has expired. Please login again.');
         }
         if (x.verb === 'post' && inc (['upload', 'error'], x.path [0]) && error && error.status === 0) {
            body.retry = true;
            body.originalTime = Date.now ();
            // Retry to send POST /upload or POST /error after ten seconds if there's a connection error
            return setTimeout (function () {
               B.call (x, x.verb, x.path, headers, body, cb);
            }, 30 * 1000);
         }
         if (cb) cb (x, error, rs);
      });
   }],
   ['error', [], {match: H.matchVerb}, function (x) {
      // We ignore all errors thrown by Chrome when entering text on the console. The error refers to the root page (not a script inside it), so we don't know what we can possibly do about it. Note the error happens in the HTML, not in client.js.
      if (type (arguments [2]) === 'string' && arguments [2].match ('https://altocode.nl/dev/pic/app/#/')) return;
      // Safari complains if we update the URL too often in the case of fast scrolling, so we also ignore this error.
      if (arguments [1] === 'SecurityError: Attempt to use history.replaceState() more than 100 times per 30 seconds') return;

      var store = teishi.copy (B.store);
      dale.go (store, function (v, k) {
         dale.go (v, function (v2, k2) {
            if (JSON.stringify (v2).length > 500) v [k2] = dale.keys (v2).length + ' keys';
         });
      });
      B.call (x, 'post', 'error', {}, {error: dale.go (arguments, function (v) {return v}).slice (1), store: store, log: B.r.log.slice (-20)});
      if (B.prod) return B.call (x, 'snackbar', 'red', 'There was an unexpected error. Please refresh the browser.');
      console.log (arguments);
      // We report the ResizeObserver error, but we don't show the eventlog table.
      if (arguments [1] !== 'ResizeObserver loop limit exceeded') B.eventlog ();
   }],
   ['read', 'hash', function (x) {
      var hash = window.location.hash.replace ('#/', '').split ('/'), page = hash [0];

      if (page === 'signup') {
         if (hash [1]) {
            B.call (x, 'set', ['Data', 'signup'], teishi.parse (decodeURIComponent (hash [1])));
         }
      }
      if (page === 'reset') {
         if (hash [1] && hash [2]) {
            B.call (x, 'set', ['Data', 'reset'], {token: decodeURIComponent (hash [1]), username: decodeURIComponent (hash [2])});
         }
      }
      if (page === 'import') {
         if (hash [1] === 'success' && hash [2]) {
            B.call (x, 'set', ['State', 'imports', hash [2], 'authOK'], true);
         }
         if (hash [1] === 'error' && hash [2]) {
            B.call (x, 'set', ['State', 'imports', hash [2], 'authError'], true);
         }
      }

      if (page === 'pics' && hash [1]) B.call (x, 'set', ['State', 'queryURL'], hash [1]);

      B.call (x, 'goto', 'page', page);
   }],
   ['goto', 'page', function (x, page) {
      var pages = {
         logged:   ['pics', 'upload', 'share', 'tags', 'import', 'account', 'upgrade'],
         unlogged: ['login', 'signup', 'recover', 'reset']
      }

      if (! inc (pages.logged, page) && ! inc (pages.unlogged, page)) {
         page = pages.logged [0];
      }

      var logged = B.get ('Data', 'csrf');

      if (! logged && inc (pages.logged, page)) {
         B.call (x, 'set', ['State', 'redirect'], page);
         return B.call (x, 'goto', 'page', pages.unlogged [0]);
      }
      if (logged && inc (pages.unlogged, page)) {
         return B.call (x, 'goto', 'page', pages.logged [0]);
      }
      if (logged && B.get ('State', 'redirect')) B.call (x, 'rem', 'State', 'redirect');

      document.title = ['ac;pic', page].join (' - ');

      if (page !== B.get ('State', 'page')) B.call (x, 'set', ['State', 'page'], page);

      if (page === 'pics' && B.get ('State', 'queryURL')) page = 'pics/' + B.get ('State', 'queryURL');

      if (window.location.hash !== '#/' + page) window.location.hash = '#/' + page;
   }],
   ['send', 'feedback', function (x) {
      var feedback = B.get ('State', 'feedback');
      if (! feedback) return B.call (x, 'snackbar', 'yellow', 'Please enter some feedback :).');
      B.call (x, 'post', 'feedback', {}, {message: feedback}, function (x, error) {
         if (error) return B.call (x, 'snackbar', 'red', 'We experienced a technical issue; could you please email us with your feedback instead?');
         B.call (x, 'rem', 'State', 'feedback');
         B.call (x, 'snackbar', 'green', 'Your feedback was successfully sent!');
      });
   }],

   ['test', [], function (x) {
      c.loadScript ('testclient.js');
   }],

   // *** AUTH RESPONDERS ***

   ['retrieve', 'csrf', function (x) {
      B.call (x, 'get', 'auth/csrf', {}, '', function (x, error, rs) {
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
         B.call (x, 'clear', 'authInputs');
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
   ['signup', [], function (x) {
      var username = H.trim (c ('#auth-username').value);
      var password = c ('#auth-password').value;
      if (username.match ('@')) return B.call (x, 'snackbar', 'yellow', 'Your username cannot be an email or contain an @ symbol.');
      if (username.length < 3)  return B.call (x, 'snackbar', 'yellow', 'Your username must be at least 3 characters long.');
      if (password.length < 6)  return B.call (x, 'snackbar', 'yellow', 'Your password must be at least 6 characters long.');
      if (c ('#auth-username').value !== c ('#auth-username-confirm').value) return B.call (x, 'snackbar' ,'red', 'The repeated username does not match.');
      if (c ('#auth-password').value !== c ('#auth-password-confirm').value) return B.call (x, 'snackbar' ,'red', 'The repeated password does not match.');
      B.call (x, 'post', 'auth/signup', {}, {
         email: B.get ('Data', 'signup', 'email'),
         token: B.get ('Data', 'signup', 'token'),
         username: username,
         password: password
      }, function (x, error, rs) {
         B.call (x, 'clear', 'authInputs');
         if (error) {
            var parsedError = teishi.parse (error.responseText);
            if (parsedError && parsedError.error === 'email')    return B.call (x, 'snackbar', 'red', 'That email is already in use.');
            if (parsedError && parsedError.error === 'username') return B.call (x, 'snackbar', 'red', 'That username is already in use.');
            return B.call (x, 'snackbar', 'red', 'There was an error creating your account.');
         }
         B.call (x, 'set', ['Data', 'csrf'], rs.body.csrf);
         B.call (x, 'goto', 'page', B.get ('State', 'redirect'));
      });
   }],
   ['recover', [], function (x) {
      var username = H.trim (c ('#auth-username').value);
      B.call (x, 'post', 'auth/recover', {}, {
         username: c ('#auth-username').value
      }, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error sending you instructions to reset your password.');
         B.call (x, 'clear', 'authInputs');
         B.call (x, 'goto', 'page', 'login');
         B.call (x, 'snackbar', 'green', 'You will receive shortly an email with instructions on how to reset your password.');
      });
   }],
   ['reset', [], function (x) {
      var password = c ('#auth-password').value;
      if (password.length < 6)  return B.call (x, 'snackbar', 'yellow', 'Your password must be at least 6 characters long.');
      if (c ('#auth-password').value !== c ('#auth-confirm').value) return B.call (x, 'snackbar' ,'red', 'The repeated password does not match.');
      B.call (x, 'post', 'auth/reset', {}, {
         username: B.get ('Data', 'reset', 'username'),
         password: password,
         token: B.get ('Data', 'reset', 'token'),
      }, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error updating your password.');
         B.call (x, 'rem', 'Data', 'reset');
         B.call (x, 'clear', 'authInputs');
         B.call (x, 'goto', 'page', 'login');
         B.call (x, 'snackbar', 'green', 'Your password has been updated successfully! Please log in.');
      });
   }],
   ['delete', 'account', function (x) {
      var conf = prompt ('Are you sure you want to delete your account? You cannot revert this action! If you wish to proceed, please enter the text "DELETE MY ACCOUNT"');
      if (conf === null) return B.call (x, 'snackbar', 'green', 'Phew!');
      if (conf !== 'DELETE MY ACCOUNT') return B.call (x, 'snackbar', 'yellow', 'Invalid confirmation message.');
      B.call (x, 'post', 'auth/delete', {}, {}, function (x, error) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error deleting your account.');
         B.call (x, 'reset', 'store', true);
         B.call (x, 'goto', 'page', 'login');
         B.call (x, 'snackbar', 'green', 'So long, and thank you for using ac;pic!');
      });
   }],
   ['clear', 'authInputs', function (x) {
      dale.go (['username', 'password', 'confirm'], function (v) {
         var target = c ('#auth-' + v);
         if (target) target.value = '';
      });
   }],
   ['request', 'invite', function (x) {
      var email = prompt ('Send us your email and we\'ll send you an invite link to create your account! We will *only* use your email to send you an invite.');
      if (! email) return;
      if (! email.match (/^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/)) return B.call (x, 'snackbar', 'red', 'Please enter a valid email address.');
      B.call (x, 'post', 'requestInvite', {}, {email: email}, function (x, error) {
         if (error) B.call (x, 'snackbar', 'red', 'There was an error processing your request. Please write us to info@altocode.nl instead.');
         else       B.call (x, 'snackbar', 'green', 'We received your request successfully, hang tight!');
      });
   }],

   // *** PICS RESPONDERS ***

   ['change', ['State', 'page'], {priority: -10000, match: B.changeResponder}, function (x) {
      // If the State object itself changes, don't respond to that.
      if (x.path.length < 2) return;
      if (B.get ('State', 'page') !== 'pics') return;
      if (! B.get ('Data', 'account')) B.call (x, 'query', 'account');

      if (! B.get ('State', 'query')) B.call (x, 'set', ['State', 'query'], {tags: [], sort: 'newest'});
      else B.call (x, 'set', ['State', 'query', 'updateLimit'], Date.now ());

      B.call (x, 'change', ['State', 'selected']);
   }],
   ['change', ['State', 'query'], {match: B.changeResponder}, function (x, newValue, oldValue) {
      // If the State object itself changes, or the path is State.query.recentlyTaggged or State.query.update, don't respond to that.
      if (x.path.length < 2 || x.path [2] === 'recentlyTagged' || x.path [2] === 'update') return;

      if (inc (['tags', 'sort'], x.path [2])) {
         B.rem (['State', 'query'], 'fromDate');
         B.rem (['State', 'query'], 'update');
         B.rem (['State', 'query'], 'updateLimit');
      }

      if (inc ([true, undefined], B.get ('State', 'query', 'updateLimit'))) B.set (['State', 'query', 'updateLimit'], Date.now ());

      B.call (x, 'update', 'queryURL', x.path [2] === 'fromDate');

      // If what changes in the query is the `fromDate` key, we write a mechanism that will prevent unnecessary calls to `query pivs`.
      if (x.path [2] === 'fromDate') {
         // if total pivs we have brought from the query is equal to the total pivs on the query itself, we don't query further pivs.
         if (B.get ('Data', 'pivs').length === B.get ('Data', 'pivTotal')) return;
         // If we are scrolling backwards on the same query, we also don't have to perform a new query. But if the previous load gave us enough pivs, the last visible chunk check below will prevent this issue. So there's no need for further logic to cover this case.
         var chunks = B.get ('State', 'chunks');
         if (chunks.length) {
            var lastVisibleChunkIndex;
            dale.go (chunks, function (chunk, k) {
               if (chunk.userVisible) lastVisibleChunkIndex = k;
            });
            // If last visible chunk is the last or the next-to-last last chunk, we load more pivs. Otherwise, we don't.
            if (lastVisibleChunkIndex + 1 < chunks.length - 1) return;
         }
      }

      B.call (x, 'query', 'pivs', {noScroll: x.path [2] === 'updateLimit' || x.path [2] === 'fromDate' && oldValue});
   }],
   ['change', ['State', 'selected'], {match: B.changeResponder}, function (x) {
      if (B.get ('State', 'page') !== 'pics') return;

      // Since `rem State selected` has a path of length 1 only, we need to listen to changes on `State` as well (unlike the responders that listen to changes in State.page and State.query)
      var selected = B.get ('State', 'selected') || {};
      var pivs = document.getElementsByClassName ('pictures-grid__item-picture');
      dale.go (pivs, function (piv) {
         if (selected [piv.id]   && ! piv.classList.contains ('selected')) piv.classList.add    ('selected');
         if (! selected [piv.id] &&   piv.classList.contains ('selected')) piv.classList.remove ('selected');
      });
      var selectedPivs = dale.keys (selected).length > 0;
      var classes = {
         browse:   ['app-pictures',  'app-all-tags'],
         organise: ['app-organise', 'app-show-organise-bar', 'app-attach-tags'],
      }
      var target = c ('.pics-target') [0];
      if (! target) return;

      // This timeout is needed because on certain occasions, if the classes are changed before a redraw, the CSS won't be applied correctly.
      // Without the timeout, sidebar__inner remains transformed 50% to the left.
      setTimeout (function () {
         dale.go (classes, function (classes, mode) {
            dale.go (classes, function (v) {
               if (mode === 'browse')   target.classList [selectedPivs ? 'remove' : 'add']    (v);
               if (mode === 'organise') target.classList [selectedPivs ? 'add'    : 'remove'] (v);
            });
         });
      }, 0);

      if (! selectedPivs && B.get ('State', 'query', 'recentlyTagged')) {
         B.call (x, 'rem', ['State', 'query'], 'recentlyTagged');
         B.call (x, 'snackbar', 'green', 'You can find your pictures under the tags you just used.');
      }
   }],
   ['query', 'pivs', function (x, options) {
      options = options || {};
      // We copy the query onto a new object so that if other events change the object after the ajax call, we will still have access to the original values.
      var query = teishi.copy (B.get ('State', 'query'));

      if (! query) return;
      var t = Date.now ();
      if (! options.retry && B.get ('State', 'querying')) return B.call (x, 'set', ['State', 'querying'], {t: t, options: options});
      else                                                       B.call (x, 'set', ['State', 'querying'], {t: t, options: options});

      var timeout = B.get ('State', 'queryRefresh');
      if (timeout) {
         B.call (x, 'rem', 'State', 'queryRefresh');
         clearTimeout (timeout);
      }

      var mindate, maxdate, rangeTag, rangeIndex = dale.stopNot (query.tags, undefined, function (tag, k) {
         if (! H.isRangeTag (tag)) return;
         rangeTag = tag;
         return k;
      });

      if (rangeTag) {
         mindate = parseInt (rangeTag.replace ('r::', '').split (':') [0]);
         maxdate = parseInt (rangeTag.replace ('r::', '').split (':') [1]);
      }

      var firstQuery = dale.keys (B.get ('Data', 'pivs')).length === 0;
      var updateLimit = (query.update === 'auto' || firstQuery) ? undefined : query.updateLimit;

      B.call (x, 'post', 'query', {}, {
         tags:           dale.fil (query.tags, undefined, function (tag) {if (! H.isRangeTag (tag)) return tag}),
         sort:           query.sort,
         from:           query.fromDate ? undefined : 1,
         fromDate:       query.fromDate,
         to:             options.selectAll ? 1000000000 : Math.max (dale.keys (B.get ('State', 'selected')).length, teishi.last (H.chunkSizes) * 3),
         recentlyTagged: query.recentlyTagged,
         mindate:        mindate,
         maxdate:        maxdate,
         refresh:        options.refresh,
         updateLimit:    updateLimit
      }, function (x, error, rs) {
         var querying = B.get ('State', 'querying');
         if (t !== querying.t) {
            querying.options.retry = true;
            return B.call (x, 'query', 'pivs', querying.options);
         }
         B.call (x, 'rem', 'State', 'querying');
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error getting your pictures.');

         if (query.update === undefined && rs.body.refreshQuery && ! firstQuery) B.call (x, 'set', ['State', 'query', 'update'], 'manual');
         if (query.update !== undefined && ! rs.body.refreshQuery && (updateLimit === undefined || t - updateLimit < 10)) B.call (x, 'rem', ['State', 'query'], 'update');
         if (firstQuery && rs.body.pivs.length) B.call (x, 'set', ['State', 'query', 'updateLimit'], Date.now ());

         B.call (x, 'query', 'tags');
         B.call (x, 'set', ['Data', 'queryTags'], rs.body.tags);
         B.call (x, 'set', ['Data', 'pivTotal'],  rs.body.total);

         if (dale.stop (query.tags, true, H.isYearTag)) {
            B.call (x, 'post', 'query', {}, {tags: dale.fil (query.tags, undefined, function (tag) {
               if (! H.isMonthTag (tag)) return tag;
            }), sort: query.sort, from: 1, to: 1}, function (x, error, rs) {
               if (error) return B.call (x, 'snackbar', 'red', 'There was an error getting your pictures.');
               B.call (x, 'set', ['Data', 'monthTags'], dale.fil (Object.keys (rs.body.tags), undefined, function (tag) {
                  if (H.isMonthTag (tag)) return tag;
               }));
            });
         }
         else B.call (x, 'rem', 'Data', 'monthTags');

         // Set timeout for refreshing query if refreshQuery is true
         if (rs.body.refreshQuery) B.call (x, 'set', ['State', 'queryRefresh'], setTimeout (function () {
            B.call (x, 'query', 'pivs', {refresh: true});
         }, 1500));

         // Perform mute updates
         var selected = B.get ('State', 'selected') || {};
         // Update the selection to only include pivs that are returned in the current query
         B.set (['State', 'selected'], dale.obj (rs.body.pivs, function (piv) {
            if (options.selectAll || selected [piv.id]) return [piv.id, true];
         }));
         // Four types of queries with respect to scroll: go to top (new query), load more (from scroll - here, options.noScroll will be set), first load with link (go to specified fromDate), refresh. Only in the last one the offset makes sense.
         var offset = ! options.refresh ? 0 : dale.stopNot (B.get ('Data', 'pivs'), undefined, function (piv) {
            if (piv.start + CSS.pivWidths [1] >= window.scrollY) return window.scrollY - piv.start;
         });
         B.set (['Data', 'pivs'], rs.body.pivs);
         B.set (['State', 'chunks'], H.computeChunks (x, rs.body.pivs));

         if (options.refresh) query.fromDate = B.get ('State', 'query', 'fromDate');

         if (options.noScroll)      var scrollTo = -1;
         else if (! query.fromDate) var scrollTo = 0;
         else                       var scrollTo = dale.stopNot (rs.body.pivs, undefined, function (piv) {
            // The < and > are there in case the date requested is not held by any pivs that match the query
            if      (query.sort === 'oldest') return query.fromDate <= piv.date   ? piv.start + offset : undefined;
            else if (query.sort === 'newest') return query.fromDate >= piv.date   ? piv.start + offset : undefined;
            else                              return query.fromDate >= piv.dateup ? piv.start + offset : undefined;
         });
         B.call ('scroll', [], scrollTo);

         if (options.selectAll) {
            B.call (x, 'clear', 'snackbar');
            B.call (x, 'change', ['State', 'selected']);
         }

         var open = B.get ('State', 'open');

         // Changes on State.selected will be performed by the scroll responder, same with State.chunks
         if (! open) return B.call (x, 'change', ['Data', 'pivs'], rs.body.pivs);

         var newOpen = dale.stopNot (rs.body.pivs, undefined, function (piv, k) {
            if (piv.id === open.id) return {id: piv.id, k: k};
         });
         // If opened piv is no longer in query, exit open.
         if (! newOpen) {
            B.call (x, 'rem', 'State', 'open');
            B.call (x, 'change', ['Data', 'pivs'], rs.body.pivs);
            B.call (x, 'exit', 'fullscreen');
         }
         // Otherwise, update the index of the opened piv. We first set the values, then trigger the change event, to prevent the piv flickering.
         else {
            B.call (x, 'set', ['State', 'open'], newOpen);
            B.call (x, 'change', ['Data', 'pivs']);
         }
      });
   }],
   ['click', 'piv', function (x, id, k, ev) {
      var last = B.get ('State', 'lastClick') || {time: 0};
      // If the last click was also on this piv and happened less than 500ms ago, we open the piv in fullscreen.
      if (last.id === id && Date.now () - last.time < 500) {
         B.call (x, 'rem', ['State', 'selected'], id);
         B.call (x, 'set', ['State', 'open'], {id: id, k: k});
         return;
      }

      B.call (x, 'set', ['State', 'lastClick'], {id: id, time: Date.now ()});

      var lastIndex = dale.stopNot (B.get ('Data', 'pivs'), undefined, function (piv, k) {
         if (piv.id === last.id) return k;
      });

      // Single select/unselect (either no shift or the last click wasn't on a piv that we currently have or the last clicked piv is deselected)
      if (! ev.shiftKey || lastIndex === undefined || ! B.get ('State', 'selected', last.id)) {
         if (! B.get ('State', 'selected', id)) return B.call (x, 'set', ['State', 'selected', id], true);
         else                                   return B.call (x, 'rem', ['State', 'selected'], id);
      }
      // Multiple select/unselect
      dale.go (dale.times (Math.max (lastIndex, k) - Math.min (lastIndex, k) + 1, Math.min (lastIndex, k)), function (k) {
         // Instead of triggering events for each piv, we directly override the value (to avoid triggering n redraws for n pivs).
         B.set (['State', 'selected', B.get ('Data', 'pivs', k, 'id')], true);
      });
      // We manually trigger the change event.
      B.call (x, 'change', ['State', 'selected']);
   }],
   ['key', /down|up/, function (x, keyCode) {
      if (keyCode === 13 && document.activeElement === c ('#newTag'))    B.call (x, 'tag', 'pivs', true);
      if (keyCode === 13 && document.activeElement === c ('#uploadTag')) B.call (x, 'upload', 'tag', true);
      if (x.path [0] === 'down' && (keyCode === 46 || keyCode === 8) && dale.keys (B.get ('State', 'selected')).length && (document.activeElement|| {}).tagName !== 'INPUT') B.call (x, 'delete', 'pivs');
   }],
   ['toggle', 'tag', function (x, tag) {
      var index = B.get ('State', 'query', 'tags').indexOf (tag);

      // Tag is removed
      if (index > -1) {
         if (tag === 'u::' && B.get ('State', 'query', 'recentlyTagged')) B.rem (['State', 'query'], 'recentlyTagged');
         if (! H.isYearTag (tag)) return B.call (x, 'rem', ['State', 'query', 'tags'], index);
         return B.call (x, 'set', ['State', 'query', 'tags'], dale.fil (B.get ('State', 'query', 'tags'), undefined, function (existingTag) {
            if (existingTag === tag) return;
            if (H.isMonthTag (existingTag)) return;
            return existingTag;
         }));
      }

      // Tag is added
      var isNormalTag = ! H.isDateTag (tag) && ! H.isGeoTag (tag);
      B.call (x, 'set', ['State', 'query', 'tags'], dale.fil (B.get ('State', 'query', 'tags'), undefined, function (existingTag) {
         if (existingTag === 'u::' && isNormalTag) return;
         if (tag === 'u::'         && (! H.isDateTag (existingTag) && ! H.isGeoTag (existingTag))) return;
         if (H.isRangeTag (tag) && H.isDateTag (existingTag)) return;
         if (H.isMonthTag (tag) && H.isMonthTag (existingTag)) return;
         return existingTag;
      }).concat (tag));
      if (H.isUserTag (tag)) B.call (x, 'rem', 'State', 'filter');
   }],
   ['select', 'all', function (x) {
      B.call (x, 'set', ['State', 'selected'], dale.obj (B.get ('Data', 'pivs'), function (piv) {
         return [piv.id, true];
      }));
      if (B.get ('Data', 'pivTotal') > 2000) B.call (x, 'snackbar', 'yellow', 'Selecting all, please wait...', true);
      B.call (x, 'query', 'pivs', {selectAll: true});
   }],
   ['query', 'tags', function (x) {
      B.call (x, 'get', 'tags', {}, '', function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error getting your tags.');
         B.call (x, 'set', ['Data', 'tags'], rs.body);
         if (! B.get ('State', 'query', 'tags')) return;
         var filterRemovedTags = dale.fil (B.get ('State', 'query', 'tags'), undefined, function (tag) {
            if (tag === 'u::' || H.isRangeTag (tag)) return tag;
            if (inc (rs.body, tag)) return tag;
         });
         if (filterRemovedTags.length === B.get ('State', 'query', 'tags').length) return;
         B.call (x, 'set', ['State', 'query', 'tags'], filterRemovedTags);
      });
   }],
   ['tag', 'pivs', function (x, tag, del) {
      if (tag === true) tag = B.get ('State', 'newTag');
      if (! tag) return;
      if (del && ! confirm ('Are you sure you want to remove the tag ' + tag + ' from all selected pictures?')) return;
      if (! H.isUserTag (tag)) return B.call (x, 'snackbar', 'yellow', 'Sorry, you cannot use that tag.');

      var ids = dale.keys (B.get ('State', 'selected'));
      if (ids.length === 0) return;

      var query = B.get ('State', 'query'), pivTotal = B.get ('Data', 'pivTotal');
      if (! del && inc (query.tags, 'u::')) {
         dale.go (ids, function (id) {
            if (! inc (query.recentlyTagged || [], id)) B.add (['State', 'query', 'recentlyTagged'], id);
         });
      }
      var payload = {tag: tag, ids: ids, del: del}
      B.call (x, 'post', 'tag', {}, payload, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error ' + (del ? 'untagging' : 'tagging') + ' the picture(s).');

         if (del && ids.length === pivTotal) return B.call (x, 'rem', ['State', 'query', 'tags'], B.get ('State', 'query', 'tags').indexOf (tag));

         if (! del) B.call (x, 'snackbar', 'green', 'Just tagged ' + dale.keys (B.get ('State', 'selected')).length + ' picture(s) with tag ' + tag);
         B.call (x, 'query', 'pivs');
         if (tag === B.get ('State', 'newTag')) B.call (x, 'rem', 'State', 'newTag');
      });
   }],
   ['rotate', 'pivs', function (x, deg, piv) {
      var pivs = piv ? [piv.id] : dale.keys (B.get ('State', 'selected'));
      if (pivs.length === 0) return;
      B.call (x, 'post', 'rotate', {}, {deg: deg, ids: pivs}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error rotating the picture(s).');
         B.call (x, 'query', 'pivs');
      });
   }],
   ['delete', 'pivs', function (x, deg) {
      var pivs = dale.keys (B.get ('State', 'selected'));
      if (pivs.length === 0) return;
      if (! confirm ('Are you sure you want to delete the ' + pivs.length + ' selected pictures?')) return;
      var operationComplete, timeoutFired, timeout = setTimeout (function () {
         if (operationComplete) return;
         timeoutFired = true;
         B.call (x, 'snackbar', 'yellow', 'This process may take a few more seconds, please wait...', true);
      }, 1000);
      B.call (x, 'post', 'delete', {}, {ids: pivs}, function (x, error, rs) {
         operationComplete = true;
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error deleting the picture(s).');
         if (timeoutFired) B.call (x, 'clear', 'snackbar');
         B.call (x, 'query', 'pivs');
      });
   }],
   ['scroll', [], function (x, to) {
      if (B.get ('State', 'page') !== 'pics') return;
      if (to === undefined) {
         var lastScroll = B.get ('State', 'lastScroll');
         if (lastScroll && (Date.now () - lastScroll.time < 50)) return;
      }
      var y = (to === undefined || to === -1) ? window.scrollY : to;
      B.call (x, 'set', ['State', 'lastScroll'], {y: y, time: Date.now ()});

      var visibleGridHeight = window.innerHeight - CSS.typography.spaceVerPx (3) + 1 + CSS.vars ['padding--s'] + CSS.typography.spaceVerPx (2) + CSS.typography.spaceVerPx (7);
      var bufferSize     = visibleGridHeight * 3;
      var minDOMVisible  = Math.max (0, y - bufferSize);
      var maxDOMVisible  = y + visibleGridHeight + bufferSize;
      var minUserVisible = y;
      var maxUserVisible = y + visibleGridHeight;
      var changes;
      dale.go (B.get ('State', 'chunks'), function (chunk, k) {
         var DOMVisible = chunk.DOMVisible, userVisible = chunk.userVisible;
         if (chunk.end < minDOMVisible || chunk.start > maxDOMVisible) chunk.DOMVisible = false;
         else chunk.DOMVisible = true;
         if (chunk.end <= minUserVisible || chunk.start >= maxUserVisible) chunk.userVisible = false;
         else chunk.userVisible = true;
         if (DOMVisible !== chunk.DOMVisible || userVisible !== chunk.userVisible) changes = k + 1;
      });
      if (changes) {
         B.call (x, 'change', ['State', 'selected']);
         B.call (x, 'change', ['State', 'chunks']);
      }

      var dateField = B.get ('State', 'query', 'sort') === 'upload' ? 'dateup' : 'date';
      dale.stopNot (B.get ('Data', 'pivs'), undefined, function (piv, k) {
         if (piv.start + CSS.pivWidths [1] >= y) return B.call (x, 'set', ['State', 'query', 'fromDate'], piv [dateField]);
      });
      // We do this as a timeout to allow the HTML to be updated before we scroll to it. This is necessary when the part we want to scroll to is not drawn yet.
      if (to !== undefined && to !== -1) setTimeout (function () {
         window.scrollTo (0, to);
      }, 0);
   }],
   ['download', [], function (x) {
      var ids = dale.keys (B.get ('State', 'selected'));
      if (! ids.length) return;
      if (ids.length === 1) {
         var a = document.createElement ('a');
         // We add the `original` query parameter in case we're downloading a non-mp4 video. In all other cases, the parameter will be ignored.
         a.download = 'piv/' + ids [0] + '?original=1';
         a.href     = 'piv/' + ids [0] + '?original=1';
         document.body.appendChild (a);
         a.click ();
         document.body.removeChild (a);
         return;
      }
      B.call (x, 'post', 'download', {}, {ids: ids}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error downloading your picture(s).');
         window.open ('download/' + rs.body.id);
      });
   }],
   ['stop', 'propagation', function (x, ev) {
      ev.stopPropagation ();
   }],
   ['update', 'queryURL', function (x, dontAlterHistory) {
      var query = teishi.copy (B.get ('State', 'query'));
      if (! query) return;
      // We don't add recentlyTagged to avoid going over 2k characters
      delete query.recentlyTagged;
      // We don't add query.update or query.updateLimit since we don't want to cache that
      delete query.update;
      delete query.updateLimit;
      try {
         var hash = btoa (encodeURIComponent (JSON.stringify (query)));
         setTimeout (function () {
            if (dontAlterHistory) {
               history.replaceState (undefined, undefined, '#/pics/' + hash);
               B.set (['State', 'queryURL'], hash);
            }
            else window.location.hash = '#/pics/' + hash;
         }, 0);
      }
      catch (error) {
         B.call (x, 'post', 'error', {}, {error: 'Update queryURL error', query: B.get ('State', 'query')});
      }
   }],
   ['change', ['State', 'queryURL'], function (x) {
      if (! B.get ('State', 'queryURL')) return;
      try {
         var query = JSON.parse (decodeURIComponent (atob (B.get ('State', 'queryURL'))));
         var changes;
         dale.go (['tags', 'sort', 'fromDate'], function (k) {
            if (! query [k] || query [k] === B.get ('State', 'query', k)) return;
            changes = true;
            B.set (['State', 'query', k], query [k]);
         });
         if (changes) B.call (x, 'change', ['State', 'query']);
      }
      catch (error) {
         B.call (x, 'post', 'error', {}, {error: 'Change queryURL error', queryURL: B.get ('State', 'queryURL')});
      }
   }],

   // *** OPEN RESPONDERS ***

   ['key', 'down', function (x, keyCode) {
      if (B.get ('State', 'open') === undefined) return;
      if (keyCode === 37) B.call (x, 'open', 'prev');
      if (keyCode === 39) B.call (x, 'open', 'next');
   }],
   ['enter', 'fullscreen', function (x) {
      document.body.style.overflow = 'hidden';
      dale.go (['requestFullScreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'], function (v) {
         if (type (document.documentElement [v]) === 'function') document.documentElement [v] ();
      });
      if (! window.ActiveXObject) return;
      var wscript = new ActiveXObject ('WScript.Shell');
      if (wscript) wscript.SendKeys ('{F11}');
   }],
   ['exit', 'fullscreen', function (x, exited) {
      document.body.style.overflow = '';
      if (B.get ('State', 'open') !== undefined) B.call (x, 'rem', 'State', 'open');
      if (exited) return;
      dale.go (['exitFullScreen', 'webkitExitFullscreen', 'mozCancelFullScreen', 'msExitFullscreen'], function (v) {
         if (type (document [v]) === 'function') document [v] ();
      });
      if (! window.ActiveXObject) return;
      var wscript = new ActiveXObject ('WScript.Shell');
      if (wscript) wscript.SendKeys ('{ESC}');
   }],
   ['change', ['State', 'open'], {match: B.changeResponder}, function (x) {
      var target = c ('.pics-target') [0], open = B.get ('State', 'open') !== undefined;
      if (! target) return;
      if (! open) return target.classList.remove ('app-fullscreen');
      target.classList.add ('app-fullscreen');
      B.call (x, 'enter', 'fullscreen');
   }],
   ['open', /prev|next/, function (x) {
      var open = B.get ('State', 'open');
      var targetPiv = B.get ('Data', 'pivs', open.k + (x.path [0] === 'prev' ? -1 : 1));
      if (! targetPiv) return;

      B.call (x, 'set', ['State', 'open'], {id: targetPiv.id, k: open.k + (x.path [0] === 'prev' ? -1 : 1)});
      window.scrollTo (0, targetPiv.start);
   }],
   ['touch', 'start', function (x, ev) {
      if (B.get ('State', 'open') === undefined) return;
      B.call (x, 'set', ['State', 'lastTouch'], {x: ev.changedTouches [0].pageX, time: Date.now ()});
   }],
   ['touch', 'end', function (x, ev) {
      if (B.get ('State', 'open') === undefined) return;
      var lastTouch = B.get ('State', 'lastTouch');
      if (! lastTouch) return;
      B.call (x, 'rem', 'State', 'lastTouch');
      if (Date.now () - lastTouch.t > 1000) return;
      if (Math.abs (ev.changedTouches [0].pageX - lastTouch.x) < 100) return;
      if (ev.changedTouches [0].pageX > lastTouch.x) B.call (x, 'open', 'prev');
      else                                           B.call (x, 'open', 'next');
   }],
   ['open', 'location', function (x, piv, url) {
      url = url || 'https://www.google.com/maps/place/' + piv.loc [0] + ',' + piv.loc [1];
      var loc = window.open (url, '_blank');
      loc.focus ();
   }],

   // *** UPLOAD RESPONDERS ***

   ['change', ['State', 'page'], {match: B.changeResponder}, function (x) {
      if (B.get ('State', 'page') !== 'upload') return;
      if (! B.get ('Data', 'account')) B.call (x, 'query', 'account');
      if (! B.get ('Data', 'tags'))    B.call (x, 'query', 'tags');
      if (! B.get ('Data', 'uploads')) B.call (x, 'query', 'uploads');
   }],
   ['drop', 'files', function (x, ev) {
      if (B.get ('State', 'page') !== 'upload') return;
      dale.go (ev.dataTransfer.files, function (file) {
         var fileType = file.type;
         if (! fileType && file.name.match (/\.heic$/i)) fileType = 'image/heic';
         if (file.size && file.size > window.maxFileSize)  B.add (['State', 'upload', 'new', 'tooLarge'],    file.name);
         else if (! inc (window.allowedFormats, fileType)) B.add (['State', 'upload', 'new', 'unsupported'], file.name);
         else                                              B.add (['State', 'upload', 'new', 'files'],       file);
      });
      B.call (x, 'change', ['State', 'upload', 'new']);
   }],
   ['upload', /files|folder/, function (x) {
      var input = c ('#' + x.path [0] + '-upload');
      dale.go (input.files, function (file) {
         var fileType = file.type;
         if (! fileType && file.name.match (/\.heic$/i)) fileType = 'image/heic';
         if (file.size && file.size > window.maxFileSize)  B.add (['State', 'upload', 'new', 'tooLarge'],    file.name);
         else if (! inc (window.allowedFormats, fileType)) B.add (['State', 'upload', 'new', 'unsupported'], file.name);
         else                                              B.add (['State', 'upload', 'new', 'files'],       file);
      });
      if (x.path [0] === 'folder') B.call (x, 'clear', 'snackbar');
      B.call (x, 'change', ['State', 'upload', 'new']);
      input.value = '';
   }],
   ['upload', 'start', function (x) {
      var files = B.get ('State', 'upload', 'new', 'files');
      B.call (x, 'post', 'upload', {}, {op: 'start', total: files.length, tooLarge: B.get ('State', 'upload', 'new', 'tooLarge'), unsupported: B.get ('State', 'upload', 'new', 'unsupported'), tags: B.get ('State', 'upload', 'new', 'tags')}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error starting the upload.');

         B.call (x, 'set', ['State', 'upload', 'wait', rs.body.id + ''], {
            lastActivity: Date.now (),
            interval: setInterval (function () {
               // We put the check condition after a minute of activity (instead of the 10 of the stalled condition) to have some extra time to send the wait event and also keep track of long uploads.
               if (B.get ('State', 'upload', 'wait', rs.body.id + '', 'lastActivity') + 1000 * 60 < Date.now ()) {
                  B.call (x, 'upload', 'wait', rs.body.id);
               }
            }, 1000 * 15)
         });

         B.call (x, 'query', 'uploads');

         dale.go (files, function (file, k) {
            var tags = B.get ('State', 'upload', 'new', 'tags') || [];
            var fileTags = teishi.copy (tags);
            if (file.webkitRelativePath) {
               dale.go (file.webkitRelativePath.split ('/').slice (0, -1), function (folder) {
                  if (H.isUserTag (folder)) fileTags = fileTags.concat (folder);
               });
            }
            B.add (['State', 'upload', 'queue'], {id: rs.body.id, file: file, tags: tags.concat (fileTags)});
         });
         B.call (x, 'rem', ['State', 'upload'], 'new');
         B.call (x, 'change', ['State', 'upload', 'queue']);
      });
   }],
   ['upload', /cancel|complete|wait|error/, function (x, id, noAjax, noSnackbar, error) {
      var op = x.path [0];
      var cb = function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error with the ' + op + ' operation in the upload');
         if (op === 'wait') return B.call (x, 'set', ['State', 'upload', 'wait', id + '', 'lastActivity'], Date.now ());

         // If we cancel or error the upload, we clear files belonging to the upload from the queue.
         if (op === 'cancel' || op === 'error') B.call (x, 'set', ['State', 'upload', 'queue'], dale.fil (B.get ('State', 'upload', 'queue'), undefined, function (file) {
            if (file.id !== id) return file;
         }));

         clearInterval (B.get ('State', 'upload', 'wait', id + '', 'interval'));
         B.call (x, 'rem', ['State', 'upload', 'wait'], id + '');
         B.call (x, 'query', 'uploads');

         if (noSnackbar) return;
         if      (op === 'error')    B.call (x, 'snackbar', 'red',   'There was an error uploading your pictures.');
         else if (op === 'cancel')   B.call (x, 'snackbar', 'green', 'Upload cancelled successfully.');
         else if (op === 'complete') B.call (x, 'snackbar', 'green', 'Upload completed successfully. You can see the pictures in the "View Pictures" section.');
      }

      if (noAjax) cb (x);
      else        B.call (x, 'post', 'upload', {}, {op: op, id: id, error: error}, cb);
   }],
   ['upload', 'tag', function (x, tag) {
      if (tag === true) tag = c ('#uploadTag').value;
      if (type (tag) !== 'string' || tag === '') return;
      if (! H.isUserTag (tag)) return B.call (x, 'snackbar', 'yellow', 'Sorry, you cannot use that tag.');
      B.call (x, 'add', ['State', 'upload', 'new', 'tags'], tag);
      B.call (x, 'rem', ['State', 'upload'], 'tag');
   }],
   ['query', 'uploads', function (x) {
      var timeout = B.get ('State', 'upload', 'timeout');
      if (timeout) {
         B.call (x, 'rem', ['State', 'upload'], 'timeout');
         clearTimeout (timeout);
      }
      B.call (x, 'get', 'uploads', {}, '', function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error retrieving your uploads.');
         B.call (x, 'set', ['Data', 'uploads'], rs.body);
         var needRefresh = dale.stop (rs.body, true, function (v) {
            if (v.status === 'uploading') return true;
         });
         if (needRefresh) B.call (x, 'set', ['State', 'upload', 'timeout'], setTimeout (function () {
            B.call (x, 'query', 'uploads');
         }, 1500));
      });
   }],
   ['change', ['State', 'upload', 'queue'], {match: B.changeResponder}, function (x) {
      var queue = B.get ('State', 'upload', 'queue');
      var MAXSIMULT = 2, uploading = 0;
      dale.stop (queue, false, function (file) {
         if (uploading === MAXSIMULT) return false;
         if (file.uploading) return uploading++;
         file.uploading = true;
         uploading++;
         B.call (x, 'set', ['State', 'upload', 'count', file.id], (B.get ('State', 'upload', 'count', file.id) || 0) + 1);

         var uploadFile = function () {
            var f = new FormData ();
            f.append ('lastModified', file.file.lastModified || file.file.lastModifiedDate || new Date ().getTime ());
            f.append ('id', file.id);
            f.append ('piv', file.file);
            if (file.tags) f.append ('tags', JSON.stringify (file.tags));
            B.call (x, 'post', 'piv', {}, f, function (x, error, rs) {

               B.call (x, 'set', ['State', 'upload', 'wait', file.id + '', 'lastActivity'], Date.now ());

               // Remove file from queue.
               dale.stop (B.get ('State', 'upload', 'queue'), true, function (v, i) {
                  if (v !== file) return;
                  B.call (x, 'rem', ['State', 'upload', 'queue'], i);
                  return true;
               });

               if (error) {
                  // If file is invalid, do nothing.
                  if (error.status === 409) {
                     // If space has run out, cancel the upload locally and report the error to the user.
                     if (error.responseText.match (/capacity/)) {
                        dale.go (B.get ('Data', 'uploads'), function (upload) {
                           if (upload.id === file.id && upload.status === 'uploading') B.call (x, 'upload', 'cancel', upload.id, true, true);
                        });
                        return B.call (x, 'snackbar', 'yellow', 'Alas! You\'ve exceeded the maximum capacity for your account so you cannot upload any more pictures.');
                     }
                     // If the upload was already cancelled or errored by another file, cancel the upload on the client but don't report it to the server.
                     if (error.responseText.match (/status/)) return B.call (x, 'upload', 'cancel', file.id, true);
                  }
                  // If there's an unexpected error from the server, only report the error to the user.
                  else if (error.status !== 400) return B.call (x, 'upload', 'error', file.id, true);
                  // If piv is invalid and we get a 400, carry on.
               }

               B.call (x, 'set', ['State', 'upload', 'count', file.id], B.get ('State', 'upload', 'count', file.id) - 1);
               if (B.get ('State', 'upload', 'count', file.id) === 0 && dale.stop (B.get ('Data', 'uploads'), true, function (v) {
                  return v.id === file.id && v.status === 'uploading';
               })) B.call (x, 'upload', 'complete', file.id);
            });
         }

         H.hash (file.file, function (error, hash) {
            if (error) B.call (x, 'post', 'error', {}, {error: 'hash error', keys: dale.keys (error), details: error.toString ()});

            B.call (x, 'post', 'uploadCheck', {}, {hash: hash || '', id: file.id, name: file.file.name, tags: file.tags, size: file.file.size, lastModified: file.file.lastModified || file.file.lastModifiedDate || new Date ().getTime ()}, function (x, error, rs) {

               // If the upload was already cancelled or errored by another file, cancel the upload on the client but don't report it to the server.
               if (error && error.status === 409 && error.responseText.match (/status/)) return B.call (x, 'upload', 'cancel', file.id, true);
               // If there's an unexpected error from the server, only report the error to the user.
               if (error) return B.call (x, 'upload', 'error', file.id, true);

               if (! rs.body.repeated) return uploadFile ();

               // If an identical file is already uploaded, remove from queue
               dale.stop (B.get ('State', 'upload', 'queue'), true, function (v, i) {
                  if (v !== file) return;
                  B.call (x, 'rem', ['State', 'upload', 'queue'], i);
                  return true;
               });

               B.call (x, 'set', ['State', 'upload', 'count', file.id], B.get ('State', 'upload', 'count', file.id) - 1);
               if (B.get ('State', 'upload', 'count', file.id) > 0) return;

               var upload = dale.stopNot (B.get ('Data', 'uploads'), undefined, function (upload) {
                  if (upload.id === file.id) return upload;
               });
               // Depending on the timing of the interval that retrieves upload data, if the last file is an alreadyUploaded one and the whole upload takes very little time, we might not still have an upload entry. In that case, we wait a couple seconds until we do, to complete the upload.
               if (! upload) setTimeout (function () {
                  var upload = dale.stopNot (B.get ('Data', 'uploads'), undefined, function (upload) {
                     if (upload.id === file.id) return upload;
                  });
                  if (upload.status === 'uploading') B.call (x, 'upload', 'complete', upload.id);
               }, 2000);
               else if (upload.status === 'uploading') B.call (x, 'upload', 'complete', upload.id);
            });
         });
      });
   }],

   // *** IMPORT RESPONDERS ***

   ['change', ['State', 'page'], {match: B.changeResponder}, function (x) {
      var page = B.get ('State', 'page');
      if (page !== 'import') return;
      if (! B.get ('Data', 'account')) B.call (x, 'query', 'account');
      dale.go (['google'], function (provider) {
         if (B.get ('State', 'imports', provider, 'authOK')) {
            B.call (x, 'rem', ['State', 'imports', provider], 'authOK');
            return B.call (x, 'import', 'list', provider);
         }
         if (B.get ('State', 'imports', provider, 'authError')) {
            B.call (x, 'snackbar', 'red', 'Authentication failed. Please provide access to all requested scopes.');
            B.call (x, 'rem', ['State', 'imports', provider], 'authError');
         }
         if (! B.get ('Data', 'imports', provider)) B.call (x, 'query', 'imports', provider);
      });
   }],

   ['query', 'imports', function (x, provider) {
      var timeout = B.get ('State', 'imports', provider, 'timeout');
      if (timeout) {
         B.call (x, 'rem', ['State', 'imports', provider], 'timeout');
         clearTimeout (timeout);
      }
      B.call (x, 'get', 'imports/' + provider, {}, '', function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error retrieving your imports.');
         B.call (x, 'set', ['Data', 'imports', provider], rs.body);
         // If there's a selection already in the import data, we put it in the state as well.
         if (rs.body [0] && rs.body [0].status === 'ready') B.call (x, 'set', ['State', 'imports', provider, 'selection'], dale.obj (rs.body [0].selection, function (v) {
            return [v, true];
         }));
         var needRefresh = dale.stop (rs.body, true, function (v) {
            if (v.status === 'listing' || v.status === 'uploading') return true;
         });
         if (needRefresh) B.call (x, 'set', ['State', 'imports', provider, 'timeout'], setTimeout (function () {
            B.call (x, 'query', 'imports', provider);
         }, 1500));
      });
   }],

   ['import', 'list', function (x, provider) {
      B.call (x, 'post', 'import/list/' + provider, {}, {}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error listing the files to be imported.');
         B.call (x, 'query', 'imports', provider);
      });
   }],

   ['import', 'cancel', function (x, provider) {
      B.call (x, 'post', 'import/cancel/' + provider, {}, {}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error deleting the list of files.');
         B.call (x, 'snackbar', 'green', 'Your import has been cancelled successfully.');
         B.call (x, 'query', 'imports', provider);
      });
   }],

   ['import', 'retry', function (x, provider) {
      B.call (x, 'post', 'import/cancel/' + provider, {}, {}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error deleting the list of files from ' + H.upper (provider));
         B.call (x, 'import', 'list', provider);
      });
   }],

   ['import', 'select', function (x, provider, start) {
      B.call (x, 'post', 'import/select/' + provider, {}, {ids: dale.keys (B.get ('State', 'imports', provider, 'selection'))}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error updating the list of selected folders.');
         if (! start) return B.call (x, 'query', 'imports', provider);
         // We create a placeholder data object to immediately put a box to show import progress without waiting for the server's reply.
         B.call (x, 'set', ['Data', 'imports', provider], [{id: Date.now (), ok: 0, total: 0}]);
         B.call (x, 'post', 'import/upload/' + provider, {}, {}, function (x, error, rs) {
            if (error) return B.call (x, 'snackbar', 'red', 'There was an error starting the import of pictures from ' + H.upper (provider));
            B.call (x, 'query', 'imports', provider);
         });
      });
   }],

   // *** ACCOUNT RESPONDERS ***

   ['change', ['State', 'page'], {match: B.changeResponder}, function (x) {
      if (B.get ('State', 'page') !== 'account') return;
      if (! B.get ('Data', 'account')) B.call (x, 'query', 'account');
   }],

   ['query', 'account', function (x, cb) {
      B.call (x, 'get', 'account', {}, '', function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error getting your account information.');
         B.call (x, 'set', ['Data', 'account'], rs.body);
         if (cb) cb ();
      });
   }],

   ['dismiss', /geotagging|selection/, function (x) {
      B.call (x, 'post', 'dismiss', {}, {operation: x.path [0]}, function (x, error, rs) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error communicating with the server.');
         B.call (x, 'query', 'account');
         if (x.path [0] === 'geotagging') B.call (x, 'snackbar', 'green', 'Understood! You can always turn on geotagging from Account.');
      });
   }],

   ['toggle', 'geo', function (x, dismiss) {
      var operation = B.get ('Data', 'account', 'geo') ? 'disable' : 'enable';
      B.call (x, 'post', 'geo', {}, {operation: operation}, function (x, error, rs) {
         if (error) {
            if (error.status === 409) {
               if (c ('#geoCheckbox')) c ('#geoCheckbox').checked = true;
               return B.call (x, 'snackbar', 'yellow', 'Geotagging is currently in process and cannot be disabled; please wait a few minutes and try again.');
            }
            return B.call (x, 'snackbar', 'red', 'There was an error ' + operation + 'd geotagging.');
         }
         if (dismiss) B.call (x, 'dismiss', 'geotagging');

         B.call (x, 'query', 'pivs');
         B.call (x, 'snackbar', 'green', 'Geotagging ' + operation + 'd successfully. You can always change this from Account.');
      });
   }],

   ['submit', 'changePassword', function (x) {
      if (! c ('#password-current').value) return B.call (x, 'snackbar', 'yellow', 'Please enter your current password.');
      if (! c ('#password-new').value)     return B.call (x, 'snackbar', 'yellow', 'Please enter your new password.');
      if (c ('#password-new').value !== c ('#password-new-repeat').value) return B.call (x, 'snackbar', 'yellow', 'The repeated password does not match.');
      B.call (x, 'post', 'auth/changePassword', {}, {old: c ('#password-current').value, new: c ('#password-new').value}, function (x, error) {
         if (error) return B.call (x, 'snackbar', 'red', 'There was an error changing your password.');
         B.call (x, 'snackbar', 'green', 'Your password was changed successfully.');
         B.call (x, 'clear', 'changePassword');
      });
   }],

   ['clear', 'changePassword', function (x) {
      c ('#password-current').value     = '';
      c ('#password-new').value         = '';
      c ('#password-new-repeat').value  = '';
      B.call (x, 'rem', 'State', 'changePassword');
   }],

   // *** DEBUG RESPONDERS ***

   ['debug', 'info', function (x, id) {
      B.call (x, 'get', 'admin/debug/' + id, {}, '', function (x, error, rs) {
         var text;
         if (error) text = error.responseText;
         else text = JSON.stringify (rs.body, null, '   ');
         document.body.innerHTML += lith.g (['div', {id: 'debug-info', style: 'font-size: 16px; font-family: monospace; position: fixed; top: 0; left: 0; z-index: 100000; background-color: white; padding: 10px;'}, [
            ['a', {href: '#', onclick: 'document.body.removeChild (c ("#debug-info"))', style: 'font-weight: bold; font-size: 28px'}, 'X'],
            ['pre', {style: 'width: 900px; height: 600px; overflow-y: scroll;'}, text]
         ]]);
      });
   }]

]);

// *** LOGO VIEW ***

views.logo = function (size) {
   return [
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'ac;pic'],
   ];
}

// *** BASE VIEW ***

views.base = function () {
   return [
      ['style', CSS.litc],
      views.snackbar (),
      views.feedback (),
      B.view (['State', 'page'], function (page) {
         if (! views [page]) return ['div'];
         return views [page] ();
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

// *** FEEDBACK VIEW ***

views.feedback = function () {
   return B.view (['State', 'feedback'], function (feedback) {
      if (feedback === undefined) return ['div'];
      return ['div', {class: 'feedback-box-mask'}, [
         ['div', {class: 'feedback-box'}, [
            ['div', {class: 'feedback-input-box'}, [
               ['textarea', {class: 'feedback-input-textarea', autocomplete: 'off', type: 'text', placeholder: 'What things would you like us to change or fix…?', oninput: B.ev ('set', ['State', 'feedback'])}]
            ]],
            ['div', {style: style ({float: 'right'})}, [
               ['a', {href: '', class: 'button button--two', style: style ({'margin-right': 6}), onclick: B.ev ('rem', 'State', 'feedback')}, 'Cancel'],
               ['a', {href: '', class: 'button button--one', onclick: B.ev ('send', 'feedback')}, 'Send']
            ]]
         ]]
      ]];
   });
}

// *** LOGIN VIEW ***

views.login = function () {
   return ['div', [
      ['div', {class: 'enter'}, [
         ['div', {class: 'auth-card'}, [
            ['div', {class: 'auth-card__inner'}, [
               ['div', {class: 'auth-card__header'}, [
                  ['p', {class: 'auth-card__header-logo'}, views.logo (28)],
                  ['p', {class: 'auth-card__header-text'}, 'A home for your pictures'],
               ]],
               ['form', {onsubmit: 'event.preventDefault ()', class: 'enter-form auth-card__form'}, [
                  ['input', {id: 'auth-username', type: 'text', class: 'enter-form__input', placeholder: 'Username or email'}],
                  ['input', {id: 'auth-password', type: 'password', class: 'enter-form__input', placeholder: 'Password'}],
                  ['input', {type: 'submit', class: 'enter-form__button enter-form__button--1 enter-form__button--submit', value: 'Log in', onclick: B.ev ('login', [])}],
                  ['a', {href: '#/recover', class: 'enter-form__forgot-password'}, 'Forgot password?'],
                  ['a', {class: 'enter-form__forgot-password', onclick: B.ev ('request', 'invite')}, 'Don\'t have an account? Request an invite.'],
               ]]
            ]]
         ]],
      ]],
   ]];
}

// *** SIGNUP VIEW ***

views.signup = function () {
   return ['div', [
      ['div', {class: 'enter'}, [
         ['div', {class: 'auth-card'}, [
            ['div', {class: 'auth-card__inner'}, [
               ['div', {class: 'auth-card__header'}, [
                  ['p', {class: 'auth-card__header-logo'}, views.logo (28)],
                  ['p', {class: 'auth-card__header-text'}, 'A home for your pictures'],
               ]],
               ['form', {onsubmit: 'event.preventDefault ()', class: 'enter-form auth-card__form'}, [
                  ['input', {id: 'auth-username', type: 'username', class: 'enter-form__input', placeholder: 'Username'}],
                  ['input', {id: 'auth-username-confirm', type: 'username', class: 'enter-form__input', placeholder: 'Repeat username'}],
                  ['input', {id: 'auth-password', type: 'password', class: 'enter-form__input', placeholder: 'Password'}],
                  ['input', {id: 'auth-password-confirm', type: 'password', class: 'enter-form__input', placeholder: 'Repeat password'}],
                  ['input', {type: 'submit', class: 'enter-form__button enter-form__button--1 enter-form__button--submit', value: 'Create account', onclick: B.ev ('signup', [])}],
               ]]
            ]]
         ]],
      ]],
   ]];
}

// *** RECOVER VIEW ***

views.recover = function () {
   return ['div', [
      ['div', {class: 'enter'}, [
         ['div', {class: 'auth-card'}, [
            ['div', {class: 'auth-card__inner'}, [
               ['div', {class: 'auth-card__header'}, [
                  ['p', {class: 'auth-card__header-logo'}, views.logo (28)],
                  ['p', {class: 'auth-card__header-text'}, 'A home for your pictures'],
               ]],
               ['form', {onsubmit: 'event.preventDefault ()', class: 'enter-form auth-card__form'}, [
                  ['input', {id: 'auth-username', type: 'text', class: 'enter-form__input', placeholder: 'Username or email'}],
                  ['input', {type: 'submit', class: 'enter-form__button enter-form__button--1 enter-form__button--submit', value: 'Request password reset', onclick: B.ev ('recover', [])}],
               ]]
            ]]
         ]],
      ]],
   ]];
};

// *** RESET VIEW ***

views.reset = function () {
   return ['div', [
      ['div', {class: 'enter'}, [
         ['div', {class: 'auth-card'}, [
            ['div', {class: 'auth-card__inner'}, [
               ['div', {class: 'auth-card__header'}, [
                  ['p', {class: 'auth-card__header-logo'}, views.logo (28)],
                  ['p', {class: 'auth-card__header-text'}, 'A home for your pictures'],
               ]],
               ['form', {onsubmit: 'event.preventDefault ()', class: 'enter-form auth-card__form'}, [
                  ['input', {id: 'auth-password', type: 'password', class: 'enter-form__input', placeholder: 'Password'}],
                  ['input', {id: 'auth-confirm', type: 'password', class: 'enter-form__input', placeholder: 'Repeat password'}],
                  ['input', {type: 'submit', class: 'enter-form__button enter-form__button--1 enter-form__button--submit', value: 'Reset password', onclick: B.ev ('reset', [])}],
               ]]
            ]]
         ]],
      ]],
   ]];
}

// *** HEADER VIEW ***

views.header = function (showUpload, showImport) {
   return ['header', {class: 'header'}, [
      ['div', {class: 'header__brand'}, [
         ['div', {class: 'logo'}, ['a', {onclick: B.ev (H.stopPropagation, ['goto', 'page', 'pics'])}, views.logo (24)]],
      ]],
      // MAIN MENU
      ['div', {class: 'header__menu'}, [
         B.view (['State', 'page'], function (page) {
            if (page === 'pics') return ['ul', {class: 'main-menu'}, [
               ['li', {class: 'main-menu__item main-menu__item--pictures', style: style ({width: '136.55px'})}, ['a', {onclick: B.ev ('open', 'location', undefined, 'https://altocode.nl/pic'), class: 'button button--feedback'}, 'Why ac;pic?']],
            ]];
            return ['ul', {class: 'main-menu'}, [
               ['li', {class: 'main-menu__item main-menu__item--pictures', style: style ({width: '136.55px'})}, ['a', {onclick: B.ev (H.stopPropagation, ['goto', 'page', 'pics']), class: 'button button--green'}, 'View pictures']],
            ]];
         }),
      ]],
      //FEEDBACK BUTTON
      ['div', {class: 'header__feedback-button', style: style ({opacity: showImport ? '1' : '0'})}, ['a', {href:'', class: 'button button--feedback', onclick: B.ev (H.stopPropagation, ['set', ['State', 'feedback'], ''])}, 'Give us feedback!']],
      // ACCOUNT MENU
      ['div', {class: 'header__user'}, [
         ['ul', {class: 'account-menu'}, [
            B.view (['Data', 'account'], function (user) {
               return ['li', {class: 'username'}, user ? user.username : ''];
            }),
            ['li', {class: 'account-menu__item'}, [
               H.putSvg ('accountMenu'),
               ['ul', {class: 'account-sub-menu'}, [
                  ['li', {class: 'account-sub-menu__item'}, ['a', {href: '#/account', class: 'account-sub-menu__item-link'}, 'Account']],
                  ['li', {class: 'account-sub-menu__item'}, ['a', {class: 'account-sub-menu__item-link', onclick: B.ev (H.stopPropagation, ['logout', []])}, 'Logout']],
               ]],
            ]],
         ]],
      ]],
      //SHARE BUTTON
      ['div', {class: 'header__import-button', style: style ({opacity: showImport ? '1' : '0'})}, [
         ['a', {href: '', class: 'button button--green', onclick: B.ev (['snackbar', 'green', 'Coming soon, hang tight!'])}, [H.putSvg ('shareIcon'), 'Share']],
      ]],
      //IMPORT BUTTON
      ['div', {class: 'header__import-button', style: style ({opacity: showImport ? '1' : '0'})}, [
         ['a', {href: '#/import', class: 'button button--one'}, [H.putSvg ('cloudImport'),'Import']],
      ]],
      // UPLOAD BUTTON
      ['div', {class: 'header__upload-button', style: style ({opacity: showUpload ? '1' : '0'})}, [
         ['a', {href: '#/upload', class: 'button button--one'}, [H.putSvg ('pcUpload'),'Upload']],
      ]],
   ]];
}

// *** EMPTY VIEW ***

views.empty = function () {
   return ['div', [
      // SIDEBAR
      ['div', {class: 'sidebar'}, [
         ['div', {class: 'sidebar__header'}, [
            ['div', {class: 'sidebar-header'}, [
               ['h1', {class: 'sidebar-header__title'}, 'View pictures'],
            ]],
         ]],
         ['div', {class: 'sidebar__tip'}, [
            // TIP
            ['div', {class: 'tip'}, [
               ['div', {class: 'tip__header'}, [
                  ['img', {class: 'tip__icon', src: 'img/icon-tip.svg'}],
                  ['h5', {class: 'tip__title'}, 'Tip!'],
               ]],
               // TODO: fix redraw bug that carries through click to anchor
               ['p', {class: 'tip__text'}, ['You have no tags yet. ', ['a', {onclick: B.ev ('goto', 'page', 'upload')}, 'Upload'], ' some photos and add some tags.']],
            ]],
         ]],
         ['div', {class: 'sidebar__footer'}, [
            ['div', {class: 'sidebar-search', style: style ({'display':'none'})}, [
               ['input', {class: 'sidebar-search__input search-input', type: 'text', placeholder: 'Search for tag'}],
               H.putSvg ('sidebarSearch'),
            ]],
         ]],
      ]],
      // MAIN
      ['div', {class: 'main'}, [
         ['div', {class: 'main__inner'}, [
            // GUIDE
            ['div', {class: 'guide'}, [
               ['img', {class: 'guide__image', src: 'img/icon-guide--upload.svg'}],
               ['h2', {class: 'guide__title'}, 'Start organising and backing up your pictures.'],
               ['p', {class: 'guide__text'}, 'Click the buttons below and start adding pictures.'],
               ['div', [
                  ['a', {href: '#/import', class: 'button button--one', style: style({'margin-right': '10px'})}, [H.putSvg ('cloudImport'), 'Import pictures']],
                  ['a', {href: '#/upload', class: 'button button--one'}, [H.putSvg ('pcUpload'), 'Upload pictures']],
               ]],
               ['p', {class: 'guide__text', style: style({'margin-top': '20px'})}, 'Or download any of the mobile uploaders.'],
               ['div', [
                  ['a', {href: 'https://apps.apple.com/gb/app/ac-pic/id6443709273?uo=2', target: '_blank'}, H.putSvg ('appStoreBadge')],
                  ['a', {href: 'https://play.google.com/store/apps/details?id=com.altocode.acpic&hl=en_US&gl=US', target: '_blank'}, H.putSvg ('googlePlayBadge')],
               ]]
            ]],
         ]],
      ]],
   ]];
}

// *** PICS VIEW ***

views.pics = function () {
   return ['div', {class: 'pics-target app-pictures app-all-tags', onclick: B.ev ('rem', 'State', 'selected')}, [
      views.header (true, true),
      views.open (),
      B.view (['State', 'query', 'update'], function (update) {
         if (! update) return ['div'];
         return ['div', {class: 'update-pivs-box'}, [
            update === 'auto' ? [
               ['span', {class: 'action', onclick: B.ev (['set', ['State', 'query', 'update'], 'manual'], ['set', ['State', 'query', 'updateLimit'], true]), style: style({'font-size': '16px', 'cursor': 'pointer', 'text-decoration': 'underline', 'color': '#5b6eff', 'display': 'table', 'margin': '0 auto','padding-top': '33px'})}, 'Pause auto-update'],
            ] : [
               ['div', {class: 'cross-button', style: style({'float': 'right'}), onclick: B.ev ('set', ['State', 'query', 'update'], false)}, ['span', {class: 'cross-button__cross'}]],
               ['p',{style: style({'padding-top': '10px', 'padding-left': '30px', 'text-align': 'center', 'font-size': '16px', 'padding-bottom': '10px'})}, 'New pics available'],
               ['span', {class: 'action', onclick: B.ev ('set', ['State', 'query', 'updateLimit'], true), style: style({'float': 'left', 'padding-top': '10px', 'padding-left': '20px','font-size': '16px', 'cursor': 'pointer', 'text-decoration': 'underline', 'color': '#5b6eff'})}, 'Update now'],
               ['span', {class: 'action', onclick: B.ev ('set', ['State', 'query', 'update'], 'auto'), style: style({'float': 'right', 'padding-top': '10px','padding-right': '20px','font-size': '16px', 'cursor': 'pointer', 'text-decoration': 'underline', 'color': '#5b6eff'})}, 'Auto-update'],
            ]
         ]];
      }),
      B.view (['Data', 'pivs'], function (pivs) {
         if (! pivs) return ['div'];
         if (B.get ('Data', 'queryTags', 'a::') === 0) return views.empty ();
         return ['div', [
            ['style', [
               ['.tag-list__item--time', {width: 0.33, float: 'left'}],
               ['.tag-list__item--geo-country', {width: 0.33, float: 'left'}],
               ['.tag--bolded .tag__title', {color: CSS.vars ['color--one'], 'font-weight': 'bold'}],
               ['.tag--bolded svg', {stroke: CSS.vars ['color--one'], 'stroke-width': 4}],
               ['.tag--bolded-grey .tag__title', {color: CSS.vars ['grey'], 'font-weight': 'bold'}],
               ['.tag--light-grey svg', {stroke: CSS.vars ['grey--light']}],
               ['.tag--light-grey .tag__title', {color: CSS.vars ['grey--light'], 'font-weight': 'bold'}],
               ['.clear-both', {clear: 'both'}],
            ]],
            ['div', {class: 'sidebar'}, [
               ['div', {class: 'sidebar__inner'}, [
                  // Sidebar section View pictures
                  ['div', {class: 'sidebar__inner-section'}, [
                     ['div', {class: 'sidebar__header'}, [
                        ['div', {class: 'sidebar-header'}, [
                           ['h1', {class: 'sidebar-header__title'}, 'View pictures'],
                           ['div', {class: 'sidebar-header__filter-selected'}],
                        ]],
                     ]],
                     // *** QUERY LIST ***
                     B.view ([['State', 'filter'], ['State', 'query', 'tags'], ['Data', 'queryTags'], ['Data', 'monthTags'], ['Data', 'account'], ['State', 'showNTags'], ['State', 'tagOrder']], function (filter, selected, queryTags, monthTags, account, showNTags, tagOrder) {
                        if (! account || ! selected) return ['ul'];
                        if (! tagOrder) tagOrder = {field: 'n'};
                        monthTags = monthTags || [];
                        filter = H.trim (filter || '');
                        showNTags = showNTags || 75;

                        var geotagSelected = dale.stop (selected, true, H.isGeoTag);
                        var firstGeo = true, filterRegex = H.makeRegex (filter);

                        // Pseudo-tag `f::` for arrow to switch sorting order.
                        queryTags = teishi.copy (queryTags);
                        queryTags ['f::'] = 0;

                        var yearlist = dale.fil (queryTags, undefined, function (n, tag) {
                           if (! H.isYearTag (tag)) return;
                           if (inc (selected, tag)) return tag;
                           if (! filter) return tag;
                           if (tag.match (filterRegex)) return tag;
                        }).sort (function (a, b) {return a.slice (3) - b.slice (3)});

                        var taglist = dale.fil (queryTags, undefined, function (n, tag) {
                           if (H.isDateTag (tag) || tag === 'a::' || tag === 'u::') return;
                           if (inc (selected, tag)) return tag;
                           if (! filter) return tag;
                           if (tag.match (filterRegex)) return tag;
                        }).sort (function (a, b) {
                           var ac = H.isCountryTag (a), bc = H.isCountryTag (b);
                           if (ac && bc) return a.toLowerCase () > b.toLowerCase () ? 1 : -1;
                           if (ac && ! bc) return -1;
                           if (! ac && bc) return 1;

                           var ag = H.isGeoTag (a), bg = H.isGeoTag (b);
                           if (ag && bg) return a.toLowerCase () > b.toLowerCase () ? 1 : -1;
                           if (ag && ! bg) return -1;
                           if (! ag && bg) return 1;

                           if (a === 'f::') return -1;
                           if (b === 'f::') return 1;

                           var aSelected = inc (selected, a);
                           var bSelected = inc (selected, b);
                           if (aSelected !== bSelected) return aSelected ? -1 : 1;
                           if (tagOrder.field === 'n') {
                              var aN = queryTags [a], bN = queryTags [b];
                              if (aN !== bN) return tagOrder.reverse ? aN - bN : bN - aN;
                              if (tagOrder.reverse) return a.toLowerCase () < b.toLowerCase () ? -1 : 1;
                              else                  return a.toLowerCase () > b.toLowerCase () ? 1 : -1;
                           }
                           else {
                              if (tagOrder.reverse) return a.toLowerCase () < b.toLowerCase () ? 1 : -1;
                              else                  return a.toLowerCase () < b.toLowerCase () ? -1 : 1;
                           }
                        });

                        var all      = teishi.eq (selected, []);
                        var untagged = inc (selected, 'u::');
                        var makeTag  = function (which) {
                           // Ignore geotags for cities if no other (country) geotag is selected.
                           if (H.isGeoTag (which) && ! H.isCountryTag (which) && ! geotagSelected) return;

                           var tag = which;
                           var action = ['toggle', 'tag', tag];
                           if (which === 'a::') {
                              var Class = 'tag-list__item tag tag--all-pictures' + (all ? ' tag--selected' : '');
                              tag = 'All pictures';
                              action = ['set', ['State', 'query', 'tags'], []];
                           }
                           else if (which === 'u::') {
                              var Class = 'tag-list__item tag tag-list__item--untagged' + (untagged ? ' tag--selected' : '');
                              var tag = 'Untagged';
                              var action = ['toggle', 'tag', 'u::'];
                           }
                           else if (H.isYearTag (which)) {
                              var Class = 'tag-list__item tag tag-list__item--time' + (inc (selected, which) ? ' tag--bolded' : '');
                           }
                           else if (H.isMonthTag (which)) {
                              var Class = 'tag-list__item tag tag-list__item--time' + (inc (selected, which) ? ' tag--bolded' : (inc (monthTags, which) ? ' tag--bolded-grey' : ' tag--light-grey'));
                           }
                           else if (H.isRangeTag (which)) {
                              var Class = 'tag-list__item tag' + (inc (selected, which) ? ' tag--bolded' : (inc (monthTags, which) ? ' tag--bolded-grey' : ' tag--light-grey'));
                           }
                           else if (H.isGeoTag (which)) {
                              var isCountryTag = H.isCountryTag (which);
                              if (isCountryTag) {
                                 var Class = 'tag-list__item tag tag-list__item--geo-country';
                                 if (inc (selected, which)) Class += ' tag--bolded';
                                 if (firstGeo) {
                                    Class += ' clear-both';
                                    firstGeo = false;
                                 }
                              }
                              else {
                                 var Class = 'tag-list__item tag tag-list__item--geo-city';
                                 if (inc (selected, which)) Class += ' tag--selected';
                              }
                           }
                           else if (which === 'f::') {
                              var Class = 'tag-list__item tag sort-arrow';
                           }
                           else {
                              var Class = 'tag-list__item tag tag-list__item--' + H.tagColor (which) + (inc (selected, which) ? ' tag--selected' : '');
                           }
                           var numberOfPivs;
                           if (! H.isDateTag (which) && which !== 'f::') numberOfPivs = ' ' + queryTags [which];
                           // Don't show nPivs for country tags if the tag itself is not selected.
                           if (H.isCountryTag (which) && ! inc (selected, which)) numberOfPivs = undefined;
                           var disabledUntagged = which === 'u::' && queryTags ['u::'] === 0;
                           var blankMonth = H.isMonthTag (which) && ! inc (monthTags, which);
                           var disabledTag = disabledUntagged || blankMonth;

                           var showName = tag.replace (/^[a-z]::/, '');
                           if (H.isRangeTag (tag)) showName = H.formatChunkDates (parseInt (tag.split (':') [2]), parseInt (tag.split (':') [3]), true);
                           if (H.isMonthTag (which)) showName = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] [showName.replace ('M', '')];

                           return ['li', {class: Class, style: disabledTag ? 'cursor: default' : undefined, onclick: (disabledTag || which === 'f::') ? B.ev (H.stopPropagation) : B.ev (H.stopPropagation, action)}, [
                              H.if (which === 'a::', H.putSvg ('tagAll', 24)),
                              H.if (which === 'u::', H.putSvg ('itemUntagged')),
                              H.if (H.isDateTag (which), H.putSvg ('itemTime')),
                              H.if (H.isGeoTag (which) && ! H.isCountryTag (which), H.putSvg ('geoCity')),
                              H.if (H.isCountryTag (which), H.putSvg ('geoCountry')),
                              H.if (H.isUserTag (which), H.putSvg ('tagItem' + H.tagColor (which))),
                              H.if (which === 'f::', ['div', {style: style ({display: 'inline-flex'})}, [
                                 ['div', {style: style ({display: 'inline-flex'}), onclick: B.ev ('set', ['State', 'tagOrder'], {field: 'a', reverse: tagOrder.field === 'a' ? ! tagOrder.reverse : false})}, [H.putSvg ('azIcon', 24), H.putSvg ('upAndDownArrows')]],
                                 ['div', {style: style ({display: 'inline-flex', 'margin-left': 15}), onclick: B.ev ('set', ['State', 'tagOrder'], {field: 'n', reverse: tagOrder.field === 'n' ? ! tagOrder.reverse : false})}, H.putSvg ('upAndDownArrows')]
                              ]]),
                              // We put a space in case the tag is an HTML tag, so that lith won't interpret it like an HTML tag
                              ['span', {class: 'tag__title'}, [' ', showName]],
                              ['span', {class: 'number_of_pivs'}, numberOfPivs],
                              ['div', {class: 'tag__actions', style: style ({height: 24})}, [
                                 which === 'f::' ? [] : ['div', {class: 'tag-actions'}, [
                                    ['div', {class: 'tag-actions__item tag-actions__item--selected'}, H.putSvg ('itemSelected', 24)],
                                    ['div', {class: 'tag-actions__item tag-actions__item--deselect'}, H.putSvg ('itemDeselect', 24)],
                                    ['div', {class: 'tag-actions__item tag-actions__item--attach'},   H.putSvg ('itemAttach', 24)],
                                    ['div', {class: 'tag-actions__item tag-actions__item--attached'}, H.putSvg ('itemAttached', 24)],
                                    ['div', {class: 'tag-actions__item tag-actions__item--untag'},    H.putSvg ('itemUntag', 24)],
                                 ]]
                              ]]
                           ]];
                        }

                        var rangeTag = dale.stopNot (selected, undefined, function (tag) {
                           if (H.isRangeTag (tag)) return tag;
                        });

                        return ['div', {class: 'sidebar__tags no-active-selection'}, ['ul', {class: 'tag-list tag-list--sidebar tag-list--view'}, [
                           makeTag ('a::'),
                           makeTag ('u::'),
                           ! rangeTag ? [
                              dale.go (yearlist, makeTag),
                              ['br'], ['br'],
                              dale.acc (selected, 0, function (n, tag) {return n += (H.isYearTag (tag) ? 1 : 0)}) !== 1 ? [] : dale.go (dale.go (dale.times (12), function (n) {return 'd::M' + n}), makeTag),
                           ] : makeTag (rangeTag),
                           H.if (account.suggestGeotagging, [
                              ['p', {class: 'suggest-geotagging'}, [
                                 ['a', {class: 'suggest-geotagging-enable', onclick: B.ev ('toggle', 'geo', true)}, 'Turn on geotagging'],
                                 ['a', {class: 'suggest-geotagging-dismiss', onclick: B.ev ('dismiss', 'geotagging')}, 'Maybe later'],
                              ]],
                              ['br'],
                           ]),
                           dale.go (taglist.slice (0, showNTags), makeTag),
                           ['br'],
                           H.if (showNTags < taglist.length, ['div', {class: 'show-more-tags button', onclick: B.ev ('set', ['State', 'showNTags'], showNTags + 20)}, 'Show more tags'])
                        ]]];
                     }),
                  ]],
                  // Sidebar section -- Organise pictures
                  ['div', {class: 'sidebar__inner-section'}, [
                     ['div', {class: 'sidebar__close-section-button', onclick: B.ev (H.stopPropagation, ['rem', 'State', 'selected'])}, [
                        ['div', {class: 'cross-button cross-button--big'}, [
                           ['span', {class: 'cross-button__cross'}],
                        ]],
                     ]],
                     ['div', {class: 'sidebar__header'}, [
                        ['div', {class: 'sidebar-header'}, [
                           B.view (['State', 'selected'], function (selected) {
                              return ['h1', {class: 'sidebar-header__title'}, [
                                 'Organize pictures ',
                                 ['span', ['(', ['em', dale.keys (selected).length], ')']],
                              ]];
                           }),
                        ]],
                     ]],
                     ['div', {class: 'sidebar__attach-form', onclick: B.ev (H.stopPropagation)}, [
                        B.view ([['State', 'newTag'], ['Data', 'tags'], ['State', 'selected']], function (newTag, tags, selected) {
                           if (! selected) return ['div'];
                           // We filter out tags that are already in all of the pivs of the current selection.
                           // We might have to move this to a responder so we calculate it less often, since it can be expensive.
                           tags = dale.fil (tags, undefined, function (tag) {
                              if (H.isUserTag (tag)) return tag;
                           });

                           newTag = H.trim (newTag === undefined ? '' : newTag);
                           var showTags = [], filterRegex = H.makeRegex (newTag);
                           dale.go (tags, function (tag) {
                              if (newTag === undefined || newTag.length === 0) return;
                              if (tag.match (filterRegex)) showTags.push (tag);
                           });
                           if (newTag && ! inc (tags, newTag) && H.isUserTag (newTag)) showTags.unshift (newTag + ' (new tag)');

                           return ['div', {class: 'attach-form'}, [

                              ['h4', {class: 'sidebar__section-title'}, 'Attach new tag'],
                              // The `name` attribute is to avoid Safari from providing autocomplete suggestions
                              ['input', {id: 'newTag', class: 'attach-form__input attach-input', type: 'text', name: 'notASearchField', placeholder: 'Add tag name', value: newTag, oninput: B.ev ('set', ['State', 'newTag'])}],
                              ['div', {class: 'attach-form__dropdown'}, [
                                 // TAG LIST DROPDOWN
                                 ['ul', {class: 'tag-list-dropdown'}, dale.go (showTags, function (tag) {
                                    return ['li', {class: 'tag-list-dropdown__item', style: style ({cursor: 'pointer'}), onclick: B.ev (H.stopPropagation, ['set', ['State', 'newTag'], tag === newTag + ' (new tag)' ? newTag : tag], ['tag', 'pivs', true])}, [
                                       ['div', {class: 'tag tag-list__item--' + H.tagColor (tag)}, [
                                          H.putSvg ('tagItem' + H.tagColor (tag)),
                                          ['span', {class: 'tag__title'}, tag]
                                       ]],
                                    ]];
                                 })],
                              ]],
                           ]];
                        }),
                     ]],
                     B.view ([['State', 'filter'], ['State', 'selected'], ['State', 'showNSelectedTags'], ['Data', 'tags']], function (filter, selected, showNSelectedTags, tags) {
                        filter = H.trim (filter === undefined ? '' : filter);
                        showNSelectedTags = showNSelectedTags || 75;
                        var selectedTags = {}, filterRegex = H.makeRegex (filter);
                        if (selected) dale.go (B.get ('Data', 'pivs'), function (piv) {
                           if (! selected [piv.id]) return;
                           dale.go (piv.tags, function (tag) {
                              if (! selectedTags [tag]) selectedTags [tag] = 0;
                              selectedTags [tag]++;
                           });
                        });
                        var editTags = dale.fil (tags, undefined, function (tag) {
                           if (! H.isUserTag (tag)) return;
                           if (filter && ! tag.match (filterRegex)) return;
                           if (! selectedTags [tag]) selectedTags [tag] = 0;
                           return tag;
                        }).sort (function (a, b) {
                           if (selectedTags [a] !== selectedTags [b]) return selectedTags [b] - selectedTags [a];
                           return a.toLowerCase () > b.toLowerCase () ? 1 : -1;
                        });

                        return ['div', {class: 'sidebar__tags active-selection'}, [
                           ['h4', {class: 'sidebar__section-title sidebar__section-title--untag'}, 'Remove current tags'],
                           // *** TAG/UNTAG LIST ***
                           ['ul', {class: 'tag-list tag-list--attach'}, dale.go (editTags.slice (0, showNSelectedTags), function (tag) {
                              var attached = selectedTags [tag] === dale.keys (selected).length;
                              return ['li', {class: 'tag-list__item tag tag-list__item--' + H.tagColor (tag) + (attached ? ' tag--attached' : ' tag--unattached'), onclick: B.ev (H.stopPropagation, ['tag', 'pivs', tag, attached])}, [
                                 H.putSvg ('tagItem' + H.tagColor (tag)),
                                 ['span', {class: 'tag__title'}, tag],
                                 ['div', {class: 'tag__actions', onclick: B.ev (H.stopPropagation, ['tag', 'pivs', tag, attached])}, [
                                    ['div', {class: 'tag-actions'}, [
                                       ['div', {class: 'tag-actions__item tag-actions__item--selected'}, H.putSvg ('itemSelected', 24)],
                                       ['div', {class: 'tag-actions__item tag-actions__item--deselect'}, H.putSvg ('itemDeselect', 24)],
                                       ['div', {class: 'tag-actions__item tag-actions__item--attach'},   H.putSvg ('itemAttach', 24)],
                                       ['div', {class: 'tag-actions__item tag-actions__item--attached'}, H.putSvg ('itemAttached', 24)],
                                       ['div', {class: 'tag-actions__item tag-actions__item--untag'},    H.putSvg ('itemUntag', 24)],
                                    ]],
                                 ]],
                              ]];
                           })],
                           ['br'],
                           H.if (showNSelectedTags < editTags.length, ['div', {class: 'show-more-tags button', onclick: B.ev (H.stopPropagation, ['set', ['State', 'showNSelectedTags'], showNSelectedTags + 20])}, 'Show more tags'])
                        ]];
                     })
                  ]],
               ]],

               // SIDEBAR SEARCH
               B.view ([['State', 'query'], ['State', 'filter'], ['State', 'selected']], function (query, filter, selected) {
                  var tags = query ? query.tags : [];
                  var doneTagging = inc (tags, 'u::') && dale.keys (selected).length;
                  return ['div', {class: 'sidebar__footer', style: ! doneTagging ? undefined : style ({height: 114}), onclick: B.ev (H.stopPropagation)}, [
                     ['div', {class: 'sidebar-search'}, [
                        ['input', {class: 'sidebar-search__input search-input', style: style ({border: 'solid 1px #5b6eff', 'border-radius': 25}), type: 'text', value: filter, placeholder: tags.length ? 'Filter tags' : 'Search for tag', oninput: B.ev (['rem', 'State', 'showNTags'], ['rem', 'State', 'showNSelectedTags'], ['set', ['State', 'filter']])}],
                        H.putSvg ('sidebarSearch')
                     ]],
                     // DONE TAGGING BUTTON
                     H.if (doneTagging, ['div', {class: 'done-tagging-button button', onclick: B.ev (H.stopPropagation, ['rem', 'State', 'selected'])}, 'Done tagging'], [])
                  ]];
               }),
            ]],
            // ORGANISE BAR
            B.view (['State', 'selected'], function (selected) {
               return ['div', {class: 'organise-bar'}, ['div', {class: 'organise-bar__inner'}, [
                  ['div', {class: 'organise-bar__selected'}, [
                     ['div', {class: 'selected-box'}, [
                        ['span', {class: 'selected-box__close', onclick: B.ev (H.stopPropagation, ['rem', 'State', 'selected'])}, [
                           H.putSvg ('close')
                        ]],
                        ['span', {class: 'selected-box__count'}, dale.keys (selected).length],
                     ]],
                     ['p', {class: 'organise-bar__selected-title'}, 'Selected'],
                  ]],
                  ['div', {class: 'organise-bar__button organise-bar__button--select-all', onclick: B.ev (H.stopPropagation, ['select', 'all'])}, [
                     H.putSvg ('selectAll'),
                     ['span', {class: 'organise-bar__button-title'}, 'Select all'],
                  ]],
                  ['div', {class: 'organise-bar__button organise-bar__button--rotate', onclick: B.ev (H.stopPropagation, ['rotate', 'pivs', 90])}, [
                     ['div', {class: 'organise-bar__button-icon-container'}, H.putSvg ('rotate')],
                     ['span', {class: 'organise-bar__button-title'}, 'Rotate'],
                  ]],
                  ['div', {class: 'organise-bar__button organise-bar__button--select-all', onclick: B.ev (H.stopPropagation, ['rem', 'State', 'selected'])}, [
                     H.putSvg ('selectAll'),
                     ['span', {class: 'organise-bar__button-title'}, 'Unselect all'],
                  ]],
                  ['div', {class: 'organise-bar__button organise-bar__button--download', onclick: B.ev (H.stopPropagation, ['download', []])}, [
                     H.putSvg ('download'),
                     ['span', {class: 'organise-bar__button-title'}, 'Download'],
                  ]],
                  ['div', {class: 'organise-bar__button organise-bar__button--delete', onclick: B.ev (H.stopPropagation, ['delete', 'pivs'])}, [
                     H.putSvg ('delete'),
                     ['span', {class: 'organise-bar__button-title'}, 'Delete'],
                  ]],
               ]]];
            }),
            // MAIN
            ['div', {class: 'main main--pictures'}, [
               ['div', {class: 'main__inner'}, [
                  B.view ([['State', 'selected'], ['State', 'chunks'], ['State', 'query', 'sort']], function (selected, chunks, sort) {
                     if (! sort) return ['div'];
                     selected = dale.keys (selected).length;
                     var dateField = B.get ('State', 'query', 'sort') === 'upload' ? 'dateup' : 'date';
                     var d1, d2, firstUserVisible, prev, next;
                     dale.go (chunks, function (chunk, k) {
                        if (! chunk.userVisible) return;
                        if (! firstUserVisible) {
                           firstUserVisible = true;
                           prev = (chunks [k - 1] ? chunks [k - 1] : chunk).start;
                           next = (chunks [k + 1] ? chunks [k + 1] : chunk).start;
                        }
                        if (! d1) d1 = chunk.pivs [0] [dateField];
                        d2 = teishi.last (chunk.pivs) [dateField];
                     });
                     return ['div', {class: 'pictures-header'}, [
                        ['div', {class: 'pictures-grid-title-container'}, [
                           ['h2', {class: 'pictures-header__title page-title'}, 'You\'re looking at: ' + H.formatChunkDates (d1, d2)],
                           ['table', {class: 'previous-and-next-chunk'}, [
                              ['tr', {class: 'previous-and-next-chunk-first-row'}, [
                                 ['td', {class: 'chevron-container-previous-chunk', onclick: B.ev ('scroll', [], prev)}, [
                                    ['span', H.putSvg ('chevron')]
                                 ]],
                                 ['td', {class: 'next-chunk-filler-td'}]
                              ]],
                              ['tr', {class: 'previous-and-next-chunk-second-row'}, [
                                 ['td', {class: 'previous-chunk-td', onclick: B.ev ('scroll', [], prev)}, 'Previous'],
                                 ['td', {class: 'next-chunk-td',     onclick: B.ev ('scroll', [], next)}, 'Next'],
                              ]],
                              ['tr', {class: 'previous-and-next-chunk-third-row'}, [
                                 ['td', {class: 'previous-chunk-filler-td'}],
                                 ['td', {class: 'chevron-container-next-chunk', onclick: B.ev ('scroll', [], next)}, [
                                    ['span', H.putSvg ('chevron')]
                                 ]],
                              ]],
                           ]],
                           ['div', {class: 'pictures-header__sort'}, [
                              B.view (['State', 'query'], function (query) {
                                 if (! query) return ['div'];
                                 return ['div', {class: 'dropdown'}, [
                                    ['div', {class: 'dropdown__button'}, query.sort === 'upload' ? 'upload date' : query.sort],
                                    ['ul', {class: 'dropdown__list'}, [
                                       dale.go (['newest', 'oldest', 'upload'], function (sort) {
                                          return ['li', {class: 'dropdown__list-item', onclick: B.ev (H.stopPropagation, ['set', ['State', 'query', 'sort'], sort])}, sort === 'upload' ? 'upload date' : sort];
                                       })
                                    ]],
                                 ]];
                              }),
                           ]],
                           ['div', {class: 'pictures-header__action-bar'}, [
                              ['div', {class: 'pictures-header__selected-tags'}, [
                                 B.view ([['State', 'query', 'tags'], ['Data', 'pivTotal'], ['State', 'querying']], function (tags, pivTotal, querying) {
                                    return ['ul', {class: 'tag-list-horizontal'}, dale.go (['a::', 's::'].concat (tags), function (tag) {
                                       if (querying) {
                                          pivTotal = '...';
                                          if (querying.options && querying.options.selectAll) selected = '...';
                                       }
                                       if (selected === 0 && tag === 's::') return;
                                       var Class = 'tag tag-list-horizontal__item ';
                                       if (H.isGeoTag (tag)) Class += H.isCountryTag (tag) ? 'tag-list__item--geo-country' : 'tag-list__item--geo-city';
                                       else                  Class += 'tag-list-horizontal__item--' + H.tagColor (tag);

                                       var showName = tag.replace (/^[a-z]::/, '');
                                       if (tag === 'a::') showName = (tags.length === 0 ? 'All pictures ' : '') + '(' + pivTotal + ')';
                                       if (tag === 'u::') showName = 'Untagged';
                                       if (tag === 's::') showName = 'Selected (' + selected + ')';
                                       if (H.isRangeTag (tag)) showName = H.formatChunkDates (parseInt (tag.split (':') [2]), parseInt (tag.split (':') [3]));
                                       if (H.isMonthTag (tag)) showName = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] [showName.replace ('M', '')];
                                       return ['li', {class: Class}, [
                                          H.if (tag === 'a::', H.putSvg ('tagAll', 24)),
                                          H.if (tag === 'u::', H.putSvg ('itemUntagged')),
                                          H.if (tag === 's::', H.putSvg ('selectedCircle')),
                                          H.if (H.isDateTag (tag), H.putSvg ('itemTime')),
                                          H.if (H.isGeoTag (tag) && ! H.isCountryTag (tag), H.putSvg ('geoCity')),
                                          H.if (H.isCountryTag (tag), H.putSvg ('geoCountry')),
                                          H.if (H.isUserTag (tag), H.putSvg ('tagItem' + H.tagColor (tag))),
                                          ['span', {class: 'tag__title'}, showName],
                                          tag === 'a::' ? [] : ['div', {class: 'tag__actions', style: style ({height: 24})}, [
                                             ['div', {class: 'tag-actions'}, [
                                                ['div', {class: 'tag-actions__item tag-actions__item--deselect', style: style ({height: 24}), onclick: B.ev (H.stopPropagation, tag === 's::' ? ['rem', 'State', 'selected'] : ['toggle', 'tag', tag])}, H.putSvg ('itemDeselect')],
                                             ]],
                                          ]],
                                       ]];
                                    })];
                                 }),
                              ]]
                           ]],
                        ]],
                        // CLICK AND DOUBLE CLICK NOTICE
                        B.view (['Data', 'account'], function (account) {
                           if (! account || ! account.suggestSelection) return ['div'];
                           return ['div', {class: 'click-double-click-alert main-centered__inner max-width--m'}, [
                              ['div', {class: 'boxed-alert', style: style ({'background-color': 'white'})}, [
                                 ['div', {class: 'space-alert__image'}, [
                                    ['img', {class: 'guide__image', src: 'img/icon-guide--upload.svg', style: style({transform: 'scale(.4)', 'margin-bottom': 0})}],
                                 ]],
                                 ['div', {class: 'boxed-alert__main'}, [
                                    ['div', {class: 'upload-box__section', style: style({'margin-bottom': 0})}, [
                                       ['p', {class: 'boxed-alert-message', style: style({'font-size': CSS.typography.fontSize (1.75)})}, [
                                          ['span', {class: 'upload-progress__default-text'}, 'How to select and open pictures?']
                                       ]],
                                       ['div', {class: 'progress-bar'}],
                                    ]],
                                    ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                                       ['div', {class: 'listing-progress'}, [
                                          ['div', {class: 'files-found-so-far'}, [
                                             ['div',{style: style({'font-size': CSS.typography.fontSize (1)})}, 'Single click to select.'],
                                          ]],
                                          ['div', {class: 'folders-found-so-far'}, [
                                             ['div',{style: style({'font-size': CSS.typography.fontSize (1)})}, 'Double click to open.'],
                                          ]],
                                       ]],
                                       ['div', {class: 'boxed-alert-button-right button', style: style ({float: 'right'}), onclick: B.ev ('dismiss', 'selection')}, 'Got it']
                                    ]],
                                 ]],
                              ]]
                           ]];
                        }),
                     ]];
                  }),
                  // PIVS GRID
                  ['div', {class: 'pictures-grid'}, views.grid ()],
               ]],
            ]],
         ]];
      })
   ]];
}

// *** GRID VIEW ***

views.grid = function () {
   return [
      ['style', [
         ['div.caption', {
            'border-radius': 10,
            opacity: 0,
            width: 1,
            height: 30,
            padding: 5,
            background: 'rgba(0,0,0,.8)',
            color: 'white',
            position: 'absolute',
            bottom: 0,
            left: 0,
            'vertical-align': 'bottom',
            'font-size': CSS.typography.fontSize (-1),
            transition: 'opacity',
         }],
         // ['.share-icon-button', {
         //    'width, height': 22,
         //    outline: 0,
         //    'border-radius': 100,
         //    display: 'inline-flex',
         //    'align-items': 'center',
         //    'text-align': 'center',
         //    transition: CSS.vars.easeOutQuart,
         //    border: '1px solid #fbfbfb',
         //    'margin-top': '-1px'
         // }],
         // ['.caption .share-icon', {
         //    'width, height': 16,
         //    'margin-top': 6,
         //    'margin-left': '1px'
         // }],
         ['.pictures-grid__item-picture .mask', {
            'background-color': '#5b6eff',
            opacity: '0',
            position: 'absolute',
            bottom: 0,
            left: 0,
            'height, width': 1,
            'border-radius': 'inherit',
         }],
         ['.pictures-grid__item-picture.selected .mask', {opacity: '0.2'}],
         ['div.pictures-grid__item-picture:hover div.caption', {
            'transition-delay': '0.4s',
            opacity: '1',
            '-webkit-box-sizing, -moz-box-sizing, box-sizing': 'border-box'
         }],
         ['.pictures-grid__item-picture .video-playback', {
            position: 'absolute',
            'height, width': 50,
            'top, left': 'calc(50% - 25px)',
         }],
      ]],
      B.view (['State', 'chunks'], function (chunks) {
         if (! chunks) return ['div'];
         var dateField = B.get ('State', 'query', 'sort') === 'upload' ? 'dateup' : 'date';
         return ['div', {style: style ({'min-height': window.innerHeight})}, [
            dale.go (chunks, function (chunk) {
               if (! chunk.DOMVisible) return ['div', {class: 'chunk', style: style ({'height': chunk.end - chunk.start})}];
               var d1 = chunk.pivs [0] [dateField], d2 = teishi.last (chunk.pivs) [dateField];
               var dayOffset = 1000 * 60 * 60 * 24;
               var rangeLo   = Math.min (d1, d2) - (Math.min (d1, d2) % dayOffset);
               var rangeHi   = Math.max (d1, d2) + dayOffset - (Math.max (d1, d2) % dayOffset) - 1;
               return ['div', {class: 'chunk', style: style ({'padding-top': 30})}, [
                  ['h3', {onclick: B.ev ('toggle', 'tag', 'r::' + rangeLo + ':' + rangeHi), class: 'chunk_title'}, H.formatChunkDates (chunk.pivs [0] [dateField], teishi.last (chunk.pivs) [dateField])],
                  dale.go (chunk.pivs, function (piv, k) {
                     H.computePivFrame (piv);

                     var rotation = ! piv.deg ? undefined : dale.obj (['', '-ms-', '-webkit-', '-o-', '-moz-'], function (v) {
                        return [v + 'transform', (piv.frame.askance ? 'translateY(-100%) ' : '') + 'rotate(' + piv.deg + 'deg)'];
                     });
                     rotation = ! piv.deg ? undefined : dale.obj (['', '-ms-', '-webkit-', '-o-', '-moz-'], rotation, function (v) {
                        if (piv.deg === 90)  return [v + 'transform-origin', 'left bottom'];
                        if (piv.deg === -90) return [v + 'transform-origin', 'right bottom'];
                     });

                     // 16px is the margin-right
                     return ['div', {class: 'pictures-grid__item', style: style ({'z-index': '1', width: piv.frame.width + 16})}, [
                        ['div', {
                           class: 'pictures-grid__item-picture',
                           id: piv.id,
                           onclick: B.ev (H.stopPropagation, ['click', 'piv', piv.id, piv.index, {raw: 'event'}])
                        }, [
                           ['div', {
                              class: 'inner',
                              style: style ({
                                 'border-radius': 'inherit',
                                 width:  piv.frame.askance ? piv.frame.height : piv.frame.width,
                                 height: piv.frame.askance ? piv.frame.width  : piv.frame.height,
                                 'background-image': 'url(thumb/S/' + piv.id + ')',
                                 'background-position': 'center',
                                 'background-repeat': 'no-repeat',
                                 'background-size': 'cover',
                                 // For pivs rotated -90 degrees, margin-left is frameWidth - CSS.pivWidths [1] + 2px (the 2px are needed, otherwise a sliver of the gray frame can be seen to the right). The -16px on the frame width are from the margin-right.
                                 'margin-left': piv.deg !== -90 ? 0 : dale.obj (CSS.pivWidths, function (v) {
                                    return [v - 16, v - CSS.pivWidths [1] + 2];
                                 }) [piv.frame.width],
                                 rotation: rotation,
                              }),
                           }],
                           piv.vid ? ['div', {class: 'video-playback'}, H.putSvg ('videoPlayback')] : [],
                           ['div', {class: 'mask'}],
                           ['div', {class: 'caption'}, [
                              // ['span', {style: style ({position: 'absolute', left: 5})}, [
                              //    ['span', {class: 'share-icon-button'}, [
                              //       H.putSvg ('shareIcon')
                              //    ]]
                              // ]],
                              ['span', {style: style ({position: 'absolute', right: 5})}, H.formatDate (piv.date)],
                           ]],
                        ]],
                     ]];
                  })
               ]];
            })
         ]];
      })
   ];
}

// *** OPEN VIEW ***

views.open = function () {
   return B.view ([['State', 'open'], ['Data', 'pivs']], function (open, pivs) {
      if (open === undefined) return ['div'];
      var piv = pivs [open.k], next = pivs [open.k + 1];

      var askance = piv.deg === 90 || piv.deg === -90;
      var rotation = ! piv.deg ? undefined : dale.obj (['', '-ms-', '-webkit-', '-o-', '-moz-'], function (v) {
         return [v + 'transform', 'rotate(' + piv.deg + 'deg)'];
      });
      rotation = ! piv.deg ? undefined : dale.obj (['', '-ms-', '-webkit-', '-o-', '-moz-'], rotation, function (v) {
         return ['transform-origin', 'center center'];
      });
      return ['div', {class: 'fullscreen'}, [
         ['div', {class: 'fullscreen__close', onclick: B.ev ('exit', 'fullscreen')}, H.putSvg ('fullScreenClose')],
         ['div', {class: 'fullscreen__nav fullscreen__nav--left', onclick: B.ev ('open', 'prev')}, H.putSvg ('left')],
         ['div', {class: 'fullscreen__nav fullscreen__nav--right', onclick: B.ev ('open', 'next')}, H.putSvg ('right')],
         ['div', {class: 'fullscreen__date'}, [
            ['span', {class: 'fullscreen__date-text'}, H.formatDate (piv.date)],
         ]],
         ['style', media ('screen and (max-width: 767px)', [
            ['.fullscreen__image-container', {padding: 0}],
         ])],
         ['div', {class: 'fullscreen__image-container', style: style ({width: ! askance ? 1 : '100vh', height: ! askance ? 1 : '100vw', rotation: rotation})}, (function () {
            if (! piv.vid) return ['img', {class: 'fullscreen__image', src: 'thumb/M/' + piv.id, alt: 'picture'}];
            if (piv.vid === 'pending') return ['p', 'Video is being converted, please wait...'];
            if (piv.vid === 'error')   return ['p', 'Ouch, there was an error converting this video.'];
            return ['video', {ontouchstart: 'event.stopPropagation ()', class: 'fullscreen__image', controls: true, autoplay: true, src: 'piv/' + piv.id, type: 'video/mp4', poster: 'thumb/M/' + piv.id, loop: true}];
         }) ()],
         ['div', {class: 'fullscreen__actions'}, [
               // ['div', {class: 'fullscreen__action', style: style ({'margin-right': 15})}, [
               //    ['div', {class: 'fullscreen__action-icon-container fullscreen__action-icon-container-rotate'}, H.putSvg ('shareIcon')],
               //    ['div', {class: 'fullscreen__action-text'}, 'Share'],
               // ]],
            H.if (! piv.vid, ['div', {style: style ({'margin-right': 15}), class: 'fullscreen__action', onclick: B.ev ('rotate', 'pivs', 90, piv)}, [
               ['div', {class: 'fullscreen__action-icon-container fullscreen__action-icon-container-rotate'}, H.putSvg ('fullScreenRotate')],
               ['div', {class: 'fullscreen__action-text'}, 'Rotate'],
            ]]),
            ! piv.loc ? [] : ['div', {class: 'fullscreen__action', style: style ({'margin-right': 15}), onclick: B.ev ('open', 'location', piv)}, [
               ['div', {class: 'fullscreen__action-icon-container geotag--open-pictures'}, H.putSvg ('geotagOpen')],
               ['div', {class: 'fullscreen__action-text'}, 'Location'],
            ]],
            ['div', {class: 'fullscreen__action', style: style ({})}, [
                  ['div', {class: 'fullscreen__action-icon-container fullscreen__action-icon-container-rotate'}, H.putSvg ('infoIcon', 24)],
                  ['div', {class: 'fullscreen__action-text'}, 'Info'],
               ]],
            B.prod ? [] : ['a', {href: '#', onclick: B.ev ('debug', 'info', piv.id)}, 'Info']
         ]],
         ['div', {class: 'fullscreen__count'}, [
            ['span', {class: 'fullscreen__count-current'}, open.k + 1],
            '/',
            ['span', {class: 'fullscreen__count-total'}, B.get ('Data', 'pivTotal')],
         ]],
         next ? ['img', {src: 'thumb/M/' + next.id, style: style ({display: 'none'})}] : [],
      ]];
   });
}

// *** SHARE VIEW ***

views.share = function () {
   return ['div', [
      views.header (true, true),
      ['div', {class: 'main-centered'}, [
         ['div', {class: 'main-centered__inner max-width--m'}, [
            // PAGE HEADER
            ['div', {class: 'page-header'}, [
               ['h1', {class: 'page-header__title page-title'}, 'Share'],
               ['h2', {class: 'page-header__subtitle page-subtitle'}, 'Share and manage your tags and pictures']
            ]],
            ['div', {class: 'tags-search-bar'}, [
               H.putSvg ('searchTagIcon'),
               ['input', {class: 'tags-search-bar__search-input', style: 'search', placeholder: 'Search tag or picture name'}],
               ['div', {class: 'tags-search-bar__shared js_toggle-shared'}, [
                  // WHEN SELECTED ADD CLASS app-shared-tags-filtered TO TABLE
                  ['table', {class: 'tags-search-bar-table-search-with-me app-shared-tags-filtered'}, [
                     ['tr', [
                        ['td', H.putSvg ('sharedWithMeSearchIcon')]
                     ]],
                     ['tr', [
                        ['td', [
                           ['span', {class: 'tags-search-bar__shared-title'}, 'Shared with me']
                        ]]
                     ]]
                  ]],
                  // WHEN SELECTED ADD CLASS app-shared-tags-filtered TO TABLE
                  ['table', {class: 'tags-search-bar-table-search-by-me app-shared-tags-filtered'}, [
                     ['tr', [
                        ['td', H.putSvg ('shareItemIcon')]
                     ]],
                     ['tr', [
                        ['td', [
                           ['span', {class: 'tags-search-bar__shared-title'}, 'Shared by me']
                        ]]
                     ]]
                  ]]
               ]]
            ]],
            ['ul', {class: 'tag-list-extended'}, [
               // NOT SHARED TAG
               ['li', {class: 'tag-list-extended__item', style: style ({'flex-wrap': 'wrap'})}, [
                  ['div', {class: 'tag tag--shared tag--hidden', style: style({width: 1})}, [
                     H.putSvg ('tagItem' + H.tagColor ('b'), 24),
                     ['div', {class: 'tag__title', style: style ({display: 'contents'})}, [
                        'Tristan da Cunha',
                        ['span', {class: 'tag__title-amount'}, [
                           ' (',
                           ['em', {class: 'tag__title-number'}, '524'],
                           ')'
                        ]],
                     ]],
                  ]],
                  ['div', {class: 'tag-list-extended__item-info'}, [
                     ['p', 'Shared with:'],
                     ['ul', {class: 'tag-share'}, [
                        ['li', {class: 'tag-share__item tag-share__item--add-person'},
                           H.putSvg ('shareItemIcon', 24)
                        ],
                     ]],
                     ['div', {class: 'tag-list-extended__item-info-buttons'}, [
                        ['a', {href: '', class: 'button button--one'}, 'See pictures'],
                        ['a', {href: '', class: 'button button--three'}, 'Rename tag']
                     ]]
                  ]]
               ]],
               // NOT SHARED TAG EMAIL TEXTAREA
               ['li', {class: 'tag-list-extended__item', style: style ({'flex-wrap': 'wrap'})}, [
                  ['div', {class: 'tag tag--shared tag--hidden', style: style({width: 1})}, [
                     H.putSvg ('tagItem' + H.tagColor ('b'), 24),
                     ['div', {class: 'tag__title', style: style ({display: 'contents'})}, [
                        'Greenland',
                        ['span', {class: 'tag__title-amount'}, [
                           ' (',
                           ['em', {class: 'tag__title-number'}, '240'],
                           ')'
                        ]],
                     ]],
                  ]],
                  ['div', {class: 'tag-list-extended__item-info'}, [
                     ['p', 'Shared with:'],
                     ['ul', {class: 'tag-share'}, [
                        ['li', {class: 'tag-share__item tag-share__item--add-person'},
                           H.putSvg ('shareItemIcon', 24)
                        ],
                        ['li', [
                           ['div', {class: 'email-input-share-div'}, [
                              ['input', {class: 'email-input-share', autocomplete: 'off', type: 'text', placeholder: 'Add the email address you want to share this with'}]
                           ]],
                           ['div', {style: style ({'float': 'right'})}, [
                              ['a', {href: '', class: 'button button--two', style: style ({'margin-right': '6px'})}, 'Cancel'],
                              ['a', {href: '', class: 'button button--one'}, 'Share']
                           ]]
                        ]],
                     ]],
                     ['div', {class: 'tag-list-extended__item-info-buttons', style: style({display: 'none'})}, [
                        ['a', {href: '', class: 'button button--one'}, 'See pictures'],
                        ['a', {href: '', class: 'button button--three'}, 'Rename tag']
                     ]]
                  ]]
               ]],
               // SHARED TAG
               ['li', {class: 'tag-list-extended__item', style: style ({'flex-wrap': 'wrap'})}, [
                  ['div', {class: 'tag tag--shared tag--hidden', style: style({width: 1})}, [
                     H.putSvg ('tagItem' + H.tagColor ('c'), 24),
                     ['div', {class: 'tag__title', style: style ({display: 'contents'})}, [
                        'Whatsapp',
                        ['span', {class: 'tag__title-amount'}, [
                           ' (',
                           ['em', {class: 'tag__title-number'}, '200'],
                           ')'
                        ]],
                        ['div', {class: 'tag__status'}, [
                           ['span', {class: 'tag__status-icon'}, H.putSvg ('shareItemIcon')]
                        ]],
                     ]],
                  ]],
                  ['div', {class: 'tag-list-extended__item-info'}, [
                     ['p', 'Shared with:'],
                     ['ul', {class: 'tag-share'}, [
                        ['li', {class: 'tag-share__item tag-share__item--add-person'},
                           H.putSvg ('shareItemIcon', 24)
                        ],
                        ['li', [
                           ['div', {class: 'emails-container', style: style ({height: 84, overflow: 'hidden'})}, [
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'loremipsum@dolor.com'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'tester@test.com.uy'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'sarasa@gmail.com'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'tester@test.com.uy'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'loremipsum@dolor.com'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'tester@test.com.uy'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'tester@test.com.uy'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'sarasa@gmail.com'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'tester@test.com.uy'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'loremipsum@dolor.com'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'tester@test.com.uy'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                           ]],
                        ]],
                     ]],
                     ['div', {class: 'see-more-div'}, [
                        ['span', {class: 'see-more-span'}, [
                           ['span', {class: 'see-more-icon'}, [
                              H.putSvg ('chevron')
                           ]],
                           ['a', {class: 'see-more-text'}, 'See more']
                        ]]
                     ]],
                     ['div', {class: 'tag-list-extended__item-info-buttons'}, [
                        ['a', {href: '', class: 'button button--one'}, 'See pictures'],
                        ['a', {href: '', class: 'button button--three'}, 'Rename tag']
                     ]]
                  ]]
               ]],
               // SHARED WITH ME
               ['li', {class: 'tag-list-extended__item', style: style ({'flex-wrap': 'wrap'})}, [
                  ['div', {class: 'tag tag--shared tag--hidden', style: style({width: 1})}, [
                     ['span', {style: style({'margin-right, margin-left': '5px'})},
                     H.putSvg ('tagSharedWithMe' + H.tagColor ('b'), 24),
                     ],
                     ['div', {class: 'tag__title', style: style ({display: 'contents'})}, [
                        'Ulaanbaatar',
                        ['span', {class: 'tag__title-amount'}, [
                           ' (',
                           ['em', {class: 'tag__title-number'}, '190'],
                           ')'
                        ]],
                     ]],
                  ]],
                  ['div', {class: 'tag-list-extended__item-info'}, [
                     ['p', 'Shared by:'],
                     ['ul', {class: 'tag-share'}, [
                        ['li', {class: 'tag-share__item-email'}, [
                           ['p', 'loremipsum@dolor.com'],
                           ]],
                     ]],
                     ['div', {class: 'tag-list-extended__item-info-buttons'}, [
                        ['a', {href: '', class: 'button button--one'}, 'See pictures'],
                     ]]
                  ]]
               ]],
               // SHARED PIV
               ['li', {class: 'tag-list-extended__item', style: style ({'flex-wrap': 'wrap'})}, [
                  ['div', {class: 'tag tag--shared tag--hidden', style: style({width: 1})}, [
                     ['span', {class: 'shared-box__image'}, [
                        H.putSvg ('uploadImage', 24)]],
                     ['div', {class: 'tag__title', style: style ({display: 'contents'})}, [
                        '636025_39749827.jpg',
                        ['div', {class: 'tag__status'}, [
                           ['span', {class: 'tag__status-icon'}, H.putSvg ('shareItemIcon')]
                        ]]
                     ]],
                  ]],
                  ['div', {class: 'tag-list-extended__item-info'}, [
                     ['p', 'Shared with:'],
                     ['ul', {class: 'tag-share'}, [
                        ['li', {class: 'tag-share__item tag-share__item--add-person'},
                           H.putSvg ('shareItemIcon', 24)
                        ],
                        ['li', [
                           ['div', {class: 'emails-container', style: style ({height: 84, overflow: 'hidden'})}, [
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'loremipsum@dolor.com'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                              ['div', {class: 'tag-share__item-email'}, [
                                 ['p', 'tester@test.com.uy'],
                                 ['div', {class: 'tag-actions__item tag-actions__item--deselect-email-shared'}, H.putSvg ('itemDeselect')]
                              ]],
                           ]],
                        ]],
                     ]],
                     ['div', {class: 'tag-list-extended__item-info-buttons'}, [
                        ['a', {href: '', class: 'button button--one'}, 'See pictures'],
                     ]]
                  ]]
               ]],
            ]],
            ['div', {class: 'page-section'}, [
               // BACK LINK
               ['div', {class: 'back-link back-link--uploads'}, [
                  ['a', {class: 'back-link__link', onclick: B.ev (H.stopPropagation, ['goto', 'page', 'pics'])}, [
                     H.putSvg ('backLink'),
                     ['span', {class: 'back-link__link-text'}, 'See all photos'],
                  ]],
               ]],
            ]],
         ]]
      ]]
   ]]
}


// *** UPLOAD VIEW ***

views.upload = function () {
   return ['div', [
      views.header (true, true),
      ['div', {class: 'main-centered'}, [
         ['div', {class: 'main-centered__inner max-width--m'}, [
            views.noSpace (),
            // PAGE HEADER
            ['div', {class: 'page-header'}, [
               ['h1', {class: 'page-header__title page-title'}, 'Upload pictures'],
               ['h2', {class: 'page-header__subtitle page-subtitle'}, 'Once your upload starts, you can go to other areas of ac;pic, but don\'t browse away or close the browser!'],
            ]],
            ['div', {class: 'page-section'}, [
               // UPLOAD BOX
               B.view (['Data', 'uploads'], function (uploads) {
                  return ['ul', {class: 'upload-box-list'}, [
                     ['li', {class: 'upload-box-list__item'}, [
                        // UPLOAD BOX
                        ['div', {class: 'upload-box'}, [
                           ['input', {id: 'files-upload',  type: 'file', multiple:  true, style: style ({display: 'none'}), onchange: B.ev ('upload', 'files')}],
                           ['input', {id: 'folder-upload', type: 'file', directory: true, webkitdirectory: true, mozdirectory: true, style: style ({display: 'none'}), onclick: B.ev ('snackbar', 'yellow', 'For a folder with many files, listing the files may take a few minutes. Please wait...', true), onchange: B.ev ('upload', 'folder')}],
                           ['div', {class: 'upload-box__image'}, H.putSvg ('uploadImage')],
                           ['div', {class: 'upload-box__main'}, [
                              // UPLOAD BOX SECTION
                              B.view (['Data', 'account'], function (account) {
                                 var noSpace = account && account.usage.byfs >= account.usage.limit;
                                 return ['div', {class: 'upload-box__section'}, [
                                    ['h3', {class: 'upload-box__section-title'}, 'Upload files'],
                                    // DRAG & DROP
                                    ['div', {draggable: noSpace ? false : undefined, class: 'drag-and-drop'}, [
                                       H.putSvg ('dragDrop'),
                                       H.isMobile () ? [
                                          ['div', {style: style ({cursor: 'pointer', float: 'left', display: 'inline-block', 'margin-right': 10}), class: 'button button--one', onclick: 'c ("#files-upload").click ()'}, 'Upload files'],
                                       ] : [
                                          'Drag and drop photos here or ',
                                          ['div', {style: 'margin-top: 22px;'}, [
                                             ['div', {style: style ({float: 'left', display: 'inline-block', 'margin-right': 10}), class: 'button button--one' + (noSpace ? ' blocked-button' : ''), onclick: noSpace ? '' : 'c ("#files-upload").click ()'}, 'Upload files'],
                                             ['div', {style: style ({float: 'left', display: 'inline-block'}), class: 'button button--one' + (noSpace ? ' blocked-button' : ''), onclick: noSpace ? '' : 'c ("#folder-upload").click ()'}, 'Upload folder'],
                                          ]],
                                       ]
                                    ]],
                                    // UPLOAD SELECTION
                                    B.view (['State', 'upload', 'new'], function (newUpload) {
                                       var selected = B.get ('State', 'upload', 'new', 'files')  || [];
                                       var unsupported = B.get ('State', 'upload', 'new', 'unsupported') || [];
                                       var tooLarge    = B.get ('State', 'upload', 'new', 'tooLarge')    || [];
                                       return ['div', {class: 'upload-box__selection'}, [
                                          ['div', {class: 'upload-selection'}, [
                                             H.putSvg ('uploadSelection'),
                                             ['p', {class: 'upload-selection__text'}, (! selected.length ? 'No' : selected.length) + ' pictures selected'],
                                              H.if (selected.length, ['div', {class: 'upload-selection__remove', onclick: B.ev ('rem', ['State', 'upload'], 'new')}, [
                                                ['div', {class: 'cross-button'}, ['span', {class: 'cross-button__cross'}]],
                                             ]]),
                                          ]],
                                          H.if (unsupported.length, ['div', {class: 'upload-selection no-svg', style: style ({color: CSS.vars ['color--remove']})}, [
                                             H.putSvg ('uploadSelection'),
                                             ['p', {class: 'upload-selection__text'}, [
                                                [unsupported.length, ' file(s) have unsupported formats and will be ignored.']
                                             ]]
                                          ]]),
                                          H.if (tooLarge.length, ['div', {class: 'upload-selection no-svg', style: style ({color: CSS.vars ['color--remove']})}, [
                                             H.putSvg ('uploadSelection'),
                                             ['p', {class: 'upload-selection__text'}, [
                                                [tooLarge.length, ' file(s) are too large and will be ignored.']
                                             ]]
                                          ]]),
                                       ]];
                                    }),
                                    // UPLOAD BOX SECTION
                                    B.view (['State', 'upload', 'new'], function (newUpload) {
                                       if (! B.get ('State', 'upload', 'new', 'files')) return ['div'];
                                       return ['div', {class: 'upload-box__section'}, [
                                          ['h3', {class: 'upload-box__section-title'}, 'Attach tags'],
                                          B.view ([['Data', 'tags'], ['State', 'upload', 'tag']], function (tags, filter) {
                                             filter = H.trim (filter === undefined ? '' : filter);
                                             var showTags = [], filterRegex = H.makeRegex (filter);
                                             dale.go (tags, function (tag) {
                                                if (! H.isUserTag (tag)) return;
                                                if (inc (B.get ('State', 'upload', 'new', 'tags') || [], tag)) return;
                                                if (filter === undefined || filter.length === 0 || tag.match (filterRegex)) showTags.push (tag);
                                             });
                                             if (filter && ! inc (tags, filter)) {
                                                if (H.isUserTag (filter)) showTags.unshift (filter + ' (new tag)');
                                             }
                                             return ['div', {class: 'upload-box__search'}, [
                                                // SEARCH FORM
                                                ['div', {class: 'search-form'}, [
                                                   ['input', {autocomplete: 'off', value: filter, id: 'uploadTag', class: 'search-form__input search-input', type: 'text', placeholder: 'Add existing or new tags', oninput: B.ev ('set', ['State', 'upload', 'tag'])}],
                                                   H.putSvg ('searchForm'),
                                                   ['div', {class: 'search-form__dropdown'}, [
                                                      // TAG LIST DROPDOWN
                                                      ['ul', {class: 'tag-list-dropdown'}, dale.go (showTags, function (tag) {
                                                         return ['li', {class: 'tag-list-dropdown__item', style: style ({cursor: 'pointer'}), onclick: B.ev ('upload', 'tag', tag === filter + ' (new tag)' ? filter : tag)}, [
                                                            ['div', {class: 'tag tag-list__item--' + H.tagColor (tag)}, [
                                                               H.putSvg ('tagItem' + H.tagColor (tag)),
                                                               ['span', {class: 'tag__title'}, tag]
                                                            ]],
                                                         ]];
                                                      })],
                                                   ]],
                                                ]]
                                             ]];
                                          }),
                                          // TAG LIST HORIZONTAL
                                          ['ul', {class: 'tag-list-horizontal'}, [
                                             dale.go (newUpload.tags, function (tag, k) {
                                                return ['li', {class: 'tag-list-horizontal__item tag tag-list__item--' + H.tagColor (tag)}, [
                                                   H.putSvg ('tagItemHorizontal' + H.tagColor (tag)),
                                                   ['span', {class: 'tag__title'}, tag],
                                                   ['div', {class: 'tag__actions', style: style ({height: 24}), onclick: B.ev ('rem', ['State', 'upload', 'new', 'tags'], k)}, [
                                                      ['div', {class: 'tag-actions'}, [
                                                         ['div', {class: 'tag-actions__item tag-actions__item--deselect', style: style ({height: 24})}, H.putSvg ('itemDeselect')],
                                                      ]],
                                                   ]],
                                                ]];
                                             }),
                                          ]],
                                          ['div', [
                                             ['br'], ['br'],
                                             ['div', {style: style ({float: 'left', width: 'inherit', 'margin-right': 10}), class: 'upload-box__section upload-box__section--buttons', onclick: B.ev ('upload', 'tag', true)}, [
                                                ['a', {class: 'upload-box__upload-button button button--two'}, 'Add tag'],
                                             ]],
                                             ['div', {style: style ({float: 'left', width: 'inherit'}), class: 'upload-box__section upload-box__section--buttons', onclick: B.ev (['upload', 'tag', true], ['upload', 'start'])}, [
                                                ['a', {class: 'upload-box__upload-button button button--one'}, 'Start upload'],
                                             ]],
                                          ]],
                                       ]];
                                    }),
                                 ]];
                              })
                           ]]
                        ]],
                     ]],
                     ['div', {class: 'go-back-to-view-pictures'}, [
                        ['p', {class: 'go-back-to-view-pictures-p'}, 'Want to go back to your pics?'],
                        ['a', {class: 'go-back-to-view-pictures-a', onclick: B.ev (H.stopPropagation, ['goto', 'page', 'pics'])}, 'Go back to View Pictures.']
                     ]],
                     // PENDING UPLOADS
                     dale.go (uploads, function (upload) {
                        if (upload.status !== 'uploading') return;
                        // Files that are too large should be detected before uploading and shouldn't be counted towards the total.
                        var done = (upload.ok || 0) + (upload.alreadyUploaded || 0) + (upload.repeated || []).length + (upload.invalid || []).length;
                        return ['li', {class: 'upload-box-list__item'}, [
                           // UPLOAD BOX
                           ['div', {class: 'upload-box upload-box--recent-uploads'}, [
                              ! upload.lastPiv ? ['div', {class: 'upload-box__image'}, H.putSvg ('uploadImage')] : ['div', {class: 'upload-box__image upload-box__image-pic', style: style ({
                                 'background-image': 'url(thumb/S/' + upload.lastPiv.id + ')',
                                 'background-position': 'center',
                                 'background-repeat': 'no-repeat',
                                 'background-size': 'cover',
                                 transform: {90: 'rotate(90deg)', '-90': 'rotate(270deg)', 180: 'rotate(180deg)'} [upload.lastPiv.deg],
                              })}],
                              ['div', {class: 'upload-box__main'}, [
                                 ['div', {class: 'upload-box__section'}, [
                                    ['p', {class: 'upload-progress'}, [
                                       H.putSvg ('uploadProgress'),
                                       ['span', {class: 'upload-progress__amount-uploaded'}, (function () {
                                          var texts = [done + '/' + upload.total + ' uploading'];
                                          if (upload.alreadyUploaded) texts.push (upload.alreadyUploaded + ' already uploaded');
                                          if (upload.repeated) texts.push (upload.repeated.length + ' repeated');
                                          if (upload.invalid)  texts.push (upload.invalid.length  + ' invalid');
                                          if (upload.tooLarge) texts.push (upload.tooLarge.length + ' too large');
                                          return texts.join (', ');
                                       }) ()],
                                    ]],
                                    ['p', {class: 'upload-progress no-svg', style: style ({color: 'red'})}, [
                                       H.if (upload.error, ['span', {class: 'upload-progress__default-text'}, [
                                          'Error:',
                                          teishi.complex (upload.error) ? JSON.stringify (upload.error) : upload.error
                                       ]])
                                    ]],
                                    // UPLOAD BAR
                                    ['div', {class: 'progress-bar'}, [
                                       ['span', {class: 'progress-bar__progress', style: style ({width: Math.round (100 * done / upload.total) + '%'})}],
                                    ]],
                                 ]],
                                 ['div', {class: 'upload-box__section'}, [
                                    // TAG LIST HORIZONTAL
                                    ['ul', {class: 'tag-list-horizontal'}, dale.go (upload.tags, function (tag) {
                                       return ['li', {class: 'tag-list-horizontal__item tag tag-list__item--' + H.tagColor (tag)}, [
                                          H.putSvg ('tagItemHorizontal' + H.tagColor (tag)),
                                          ['span', {class: 'tag__title'}, tag],
                                       ]];
                                    })],
                                 ]],
                                 ['div', {class: 'upload-box__section upload-box__section--buttons'}, [
                                    ['a', {class: 'upload-box__upload-button button button--two', onclick: B.ev ('upload', 'cancel', upload.id)}, 'Cancel'],
                                 ]],
                              ]],
                           ]]
                        ]];
                     }),
                  ]];
               })
            ]],
            // RECENT UPLOADS
            B.view (['Data', 'uploads'], function (uploads) {
               return ['div', {class: 'page-section'}, [
                  ['div', {class: 'recent-uploads'}, [
                     ['h2', {class: 'recent-uploads__title'}, 'Recent uploads'],
                     dale.go (uploads, function (upload) {
                        if (upload.status === 'uploading') return;
                        // Files that are too large should be detected before uploading and shouldn't be counted towards the total.
                        var done = upload.ok || 0;
                        return ['li', {class: 'recent-uploads__list-item'}, [
                           // UPLOAD BOX
                           ['div', {class: 'upload-box upload-box--recent-uploads'}, [
                              ! upload.lastPiv ? ['div', {class: 'upload-box__image'}, H.putSvg ('uploadImage')] : ['div', {class: 'upload-box__image upload-box__image-pic', style: style ({
                                 'background-image': 'url(thumb/S/' + upload.lastPiv.id + ')',
                                 'background-position': 'center',
                                 'background-repeat': 'no-repeat',
                                 'background-size': 'cover',
                                 transform: {90: 'rotate(90deg)', '-90': 'rotate(270deg)', 180: 'rotate(180deg)'} [upload.lastPiv.deg],
                              })}],
                              ['div', {class: 'upload-box__main'}, [
                                 // UPLOAD BOX SECTION
                                 ['div', {class: 'upload-box__section'}, [
                                    ['p', {class: 'upload-progress'}, [
                                       H.putSvg ('uploadProgress'),
                                       ['span', {class: 'upload-progress__amount-uploaded'}, (function () {
                                          var texts = [done + ' pics uploaded'];
                                          if (upload.alreadyUploaded) texts.push (upload.alreadyUploaded + ' already uploaded');
                                          if (upload.repeated) texts.push (upload.repeated.length + ' repeated');
                                          if (upload.invalid)  texts.push (upload.invalid.length  + ' invalid');
                                          if (upload.tooLarge) texts.push (upload.tooLarge.length + ' too large');
                                          return texts.join (', ');
                                       }) ()],
                                       ['LITERAL', '&nbsp'],
                                       ['span', {class: 'upload-progress__default-text'}, '(' + upload.status + ', ' + H.ago (Date.now () - upload.end) + ' ago)'],
                                       ['br'],
                                    ]],
                                    ['p', {class: 'upload-progress no-svg', style: style ({color: 'red'})}, [
                                       H.if (upload.error, ['span', {class: 'upload-progress__default-text'}, [
                                          'Error: ',
                                          teishi.complex (upload.error) ? JSON.stringify (upload.error) : upload.error
                                       ]])
                                    ]]
                                 ]],
                                 ['div', {class: 'upload-box__section'}, [
                                    // TAG LIST HORIZONTAL
                                    ['ul', {class: 'tag-list-horizontal'}, dale.go (upload.tags, function (tag) {
                                       return ['li', {class: 'tag-list-horizontal__item tag tag-list__item--' + H.tagColor (tag)}, [
                                          H.putSvg ('tagItemHorizontal' + H.tagColor (tag)),
                                          ['span', {class: 'tag__title'}, tag],
                                       ]];
                                    })],
                                 ]]
                              ]]
                           ]]
                        ]];
                     })
                  ]]
               ]];
            }),
            ['div', {class: 'page-section'}, [
               // BACK LINK
               ['div', {class: 'back-link back-link--uploads'}, [
                  ['a', {class: 'back-link__link', onclick: B.ev (H.stopPropagation, ['goto', 'page', 'pics'])}, [
                     H.putSvg ('backLink'),
                     ['span', {class: 'back-link__link-text'}, 'See all photos'],
                  ]],
               ]],
            ]],
         ]]
      ]]
   ]];
}

// *** RUN OUT OF SPACE VIEW ***

views.noSpace = function () {
   return B.view (['Data', 'account'], function (account) {
      var noSpace = account && account.usage.byfs >= account.usage.limit;
      if (! noSpace) return ['div'];
      return ['div', {class: 'boxed-alert'}, [
         ['div', {class: 'space-alert__image'}, [
            ['div', {class: 'space-alert-icon'}, H.putSvg ('spaceAlert')]
         ]],
         ['div', {class: 'boxed-alert__main'}, [
            ['div', {class: 'upload-box__section'}, [
               ['p', {class: 'boxed-alert-message'}, [
                  ['span', {class: 'space-alert-icon-small'}, H.putSvg ('spaceAlert')],
                  ['span', {class: 'upload-progress__default-text'}, 'You’ve ran out of space!']
               ]],
               ['div', {class: 'progress-bar'}],
            ]],
            ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
               ['div', {class: 'boxed-alert-button-left button'}, ['a', {onclick: B.ev (H.stopPropagation, ['goto', 'page', 'pics'])}, 'Delete some files']],
               ['div', {class: 'boxed-alert-button-right button'}, ['a', {href: '#/upgrade'}, 'Upgrade your account']],
            ]],
         ]],
      ]];
   });
}

// *** IMPORT VIEW ***

views.import = function () {

   var importLeaveBox = function (status, provider) {
      var className = provider === 'google' ? 'google-drive' : provider;
      return B.view (['State', 'import', 'hideLeaveBox'], function (hide) {
         if (hide) return ['div'];
         return ['div', {class: 'click-double-click-alert main-centered__inner max-width--m'}, [
            ['div', {class: 'boxed-alert', style: style ({'background-color': 'white', 'z-index': '2', 'margin-top': '-190px'})}, [
               ['div', {class: 'space-alert__image'}, [
                  ['div', {class: className + '-icon'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)],
               ]],
               ['div', {class: 'boxed-alert__main'}, [
                  ['div', {class: 'upload-box__section', style: style({'margin-bottom': 0})}, [
                     ['p', {class: 'boxed-alert-message', style: style({'font-size': CSS.typography.fontSize (1.75)})}, [
                        ['span', {class: className + '-icon-small'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)],
                        ['span', {class: 'upload-progress__default-text'}, (status === 'listing' ? 'We’re listing your files' : 'Your pics and videos are being imported')]
                     ]],
                     ['div', {class: 'progress-bar'}],
                  ]],
                  ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                     ['div', {class: 'listing-progress'}, [
                        ['div', {class: 'files-found-so-far', style: style({'padding-top': '10px'})}, [
                           ['div',{style: style({'font-size': CSS.typography.fontSize (1)})}, [
                              ['p', {style: style({'display': 'contents'})}, (status === 'listing' ? 'We’re listing your photos and videos, so you can pick and choose what you want to import.' : 'We’re importing your photos and videos. ')],
                              ['p', {style: style({'display': 'contents', 'text-decoration': 'underline', 'font-weight': CSS.vars.fontPrimarySemiBold})}, (status === 'listing' ? '' : 'Please note that all your imported folders will turn to tags, so you know where to find your pics in ac;pic.')],
                              ['p', {style: style({'margin-top': '10px'})}, (status === 'listing' ? 'This will take a few minutes. You can browse away or even close the browser. We\'ll send you an email when it\'s done!' : 'Depending on how many photos and videos you chose, this can take a while. You can browse away or even close the browser. We\'ll send you an email when it\'s done!')]]],
                        ]],
                     ]],
                     ['div', {class: 'boxed-alert-button-right button', style: style ({float: 'right'}), onclick: B.ev ('set', ['State', 'import', 'hideLeaveBox'], true)}, 'Got it']
                  ]],
               ]],
            ]]
         ]];
      });
   }


   var boxMaker = function (status, provider, data) {
      var className = provider === 'google' ? 'google-drive' : provider;

      if (status === 'listing') return ['div', {class: 'listing-in-process'}, [
         importLeaveBox (status, provider),
         ['div', {class: 'boxed-alert', style: style ({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
            ['div', {class: 'space-alert__image'}, [
               ['div', {class: className + '-icon'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)]
            ]],
            ['div', {class: 'boxed-alert__main'}, [
               ['div', {class: 'upload-box__section'}, [
                  ['p', {class: 'boxed-alert-message'}, [
                     ['span', {class: className + '-icon-small'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)],
                     ['span', {class: 'upload-progress__default-text'}, 'Listing in process...']
                  ]],
                  ['div', {class: 'progress-bar'}],
               ]],
               ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                  ['div', {class: 'listing-progress'}, [
                     ['div', {class: 'files-found-so-far'}, [
                        ['span', data.fileCount],
                        ['div', ' pics & vids found so far'],
                     ]],
                     ['div', {class: 'folders-found-so-far'}, [
                        ['span', data.folderCount],
                        ['div', ' folders found so far'],
                     ]],
                  ]],
                  ['div', {class: 'boxed-alert-button-left button', style: style ({float: 'right'}), onclick: B.ev ('import', 'cancel', provider)}, 'Cancel']
               ]],
            ]],
         ]],
      ]];

      if (status === 'ready') return ['div', {class: 'listing-in-process'}, [
         ['div', {class: 'boxed-alert', style: style ({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
            ['div', {class: 'space-alert__image'}, [
               ['div', {class: className + '-icon'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)]
            ]],
            ['div', {class: 'boxed-alert__main'}, [
               ['div', {class: 'upload-box__section'}, [
                  ['p', {class: 'boxed-alert-message'}, [
                     ['span', {class: className + '-icon-small'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)],
                     ['span', {class: 'upload-progress__default-text'}, 'Your files are ready to be imported']
                  ]],
                  ['div', {class: 'progress-bar'}],
               ]],
               ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                  ['div', {class: 'boxed-alert-button-left button', onclick: B.ev ('import', 'cancel', provider)}, 'Delete list'],
                  ['div', {class: 'boxed-alert-button-right button', onclick: B.ev (['set', ['State', 'imports', provider, 'showFolders'], true], ['set', ['State', 'import', 'hideLeaveBox'], false])}, 'Select folders'],
               ]],
            ]],
         ]],
      ]];

      if (status === 'error' || status === 'stalled') return ['div', {class: 'listing-in-process'}, [
         ['div', {class: 'boxed-alert', style: style({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
            ['div', {class: 'space-alert__image'}, [
               ['div', {class: 'space-alert-icon'}, H.putSvg ('spaceAlert')],
            ]],
            ['div', {class: 'boxed-alert__main'}, [
               ['div', {class: 'upload-box__section'}, [
                  ['p', {class: 'boxed-alert-message'}, [
                     ['span', {class: 'space-alert-icon-small'}, H.putSvg ('spaceAlert')],
                     ['span', {class: 'upload-progress__default-text'}, ['There was an error listing your files: ' + (status === 'stalled' ? 'An upload took too long' : teishi.complex (data.error) ? JSON.stringify (data.error) : data.error)]]
                  ]],
                  ['div', {class: 'progress-bar'}],
               ]],
               ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                  ['div', {class: 'boxed-try-again-alert-button-left button', style: style ({float: 'right'}), onclick: B.ev ('import', 'retry', provider)}, 'Try again']
               ]],
            ]],
         ]]
      ]];

      if (status === 'uploading') return ['div', {class: 'listing-in-process'}, [
         importLeaveBox (status, provider),
         ['div', {class: 'boxed-alert', style: style ({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
            ['div', {class: 'space-alert__image'}, [
               ['div', {class: className + '-icon'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)],
            ]],
            ['div', {class: 'boxed-alert__main'}, [
               ['div', {class: 'upload-box__section'}, [
                  ['p', {class: 'boxed-alert-message'}, [
                     ['span', {class: className + '-icon-small'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)],
                     ['span', {class: 'upload-progress__default-text'}, 'Your pics & vids are being imported...']
                  ]],
                  ['div', {class: 'progress-bar'}, (function () {
                     var done = (data.ok || 0) + (data.alreadyUploaded || 0) + (data.repeated || []).length + (data.invalid || []).length + (data.tooLarge || []).length;
                     return ['span', {class: 'progress-bar__progress', style: style ({width: Math.round (100 * done / data.total) + '%'})}];
                  }) ()],
               ]],
               ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                  ['div', {class: 'listing-progress'}, [
                     ['div', {class: 'files-found-so-far'}, [
                        ['span', (data.ok || 0) + (data.alreadyUploaded || 0) + (data.alreadyImported || 0) + (data.repeated || []).length + (data.invalid || []).length + (data.tooLarge || []).length],
                        ['span', ' / '],
                        ['span', data.total + (data.alreadyImported || 0)],
                        ['div', ' imported so far'],
                     ]],
                  ]],
                  ['div', {class: 'boxed-alert-button-left button', style: style ({float: 'right'}), onclick: B.ev ('import', 'cancel', provider)}, 'Cancel']
               ]],
            ]],
         ]],
      ]];
   }

   return ['div', [
      views.header (true, true),
      ['div', {class: 'main-centered'}, [
         ['div', {class: 'main-centered__inner max-width--m'}, [
            views.noSpace (),
            // PAGE HEADER
            ['div', {class: 'page-header'}, [
               ['h1', {class: 'page-header__title page-title'}, 'Import pictures'],
               ['h2', {class: 'page-header__subtitle page-subtitle'}, 'Once your listing or import starts, you can browse away or even close the browser. We\'ll send you an email when it\'s done!']
            ]],
            B.view ([['Data', 'imports'], ['State', 'imports']], function (importData, importState) {
               if (! importData) return ['div'];
               var showFolders = dale.stopNot (importState, undefined, function (v, provider) {
                  if (v.showFolders) return provider;
               });
               if (showFolders) return views.importFolders (importState [showFolders], importData [showFolders]);
               return ['div', {class: 'page-section'}, [
                  // *** NOTIFY USER WHAT PERMISSIONS ARE NEEDED IN GOOGLE DRIVE ***
                  B.view ([['State', 'import', 'googleOAuthBox'], ['State', 'upload', 'queue']], function (box, queue) {
                     if (! box) return ['div'];
                     var provider = 'google', className = provider === 'google' ? 'google-drive' : provider;
                     // We consider only the first import entry for the provider.
                     var providerData = (importData [provider] || []) [0] || {};
                     return ['div', {class: 'click-double-click-alert main-centered__inner max-width--m'}, [
                        ['div', {class: 'boxed-alert', style: style ({'background-color': 'white', 'z-index': '2', 'margin-top': '-20px'})}, [
                           ['div', {class: 'space-alert__image'}, [
                              ['div', {class: className + '-icon'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)],
                           ]],
                           ['div', {class: 'boxed-alert__main'}, [
                              ['div', {class: 'upload-box__section', style: style({'margin-bottom': 0})}, [
                                 ['p', {class: 'boxed-alert-message', style: style({'font-size': CSS.typography.fontSize (1.75)})}, [
                                    ['span', {class: className + '-icon-small'}, H.putSvg (provider === 'google' ? 'googleDriveIcon' : dropboxIcon)],
                                    ['span', {class: 'upload-progress__default-text'}, 'How to give ac;pic access to your Google Drive?']
                                 ]],
                                 ['div', {class: 'progress-bar'}],
                              ]],
                              ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                                 ['div', {class: 'listing-progress'}, [
                                    ['div', {class: 'files-found-so-far', style: style({'padding-top': '10px'})}, [
                                       ['div',{style: style({'font-size': CSS.typography.fontSize (1)})}, [
                                          ['p', {style: style({'display': 'contents'})}, 'After you log in to your Google Account, '],
                                          ['p', {style: style({'text-decoration': 'underline', 'font-weight': CSS.vars.fontPrimarySemiBold, 'display': 'contents'})}, 'please check all the boxes that Google shows you. '],
                                          ['p', {style: style({'display': 'contents'})}, 'Otherwise, you won’t be able to import.'],
                                          ['p', {style: style({'margin-top': '10px'})}, 'We’ll only ask for what we need to get your photos and videos to ac;pic.']]],
                                    ]],
                                    ['div', {class: 'folders-found-so-far'}, [
                                       ['img', {src: 'assets/img/google-drive-access.png'}]
                                    ]],
                                 ]],
                                 ['div', {class: 'boxed-alert-button-right button', style: style ({float: 'right'}), onclick: 'window.open ("' + providerData.redirect + '"' + (queue && queue.length ? ', "_blank"' : ', "_self"') + ')'}, 'Got it']
                              ]],
                           ]],
                        ]]
                     ]];
                  }),
                  // IMPORT BOX SECTION
                  ['div', {class: 'upload-box'}, [
                     ['div', {class: 'upload-box__image'}, H.putSvg ('uploadImage')],
                     ['div', {class: 'upload-box__main'}, [
                        B.view (['Data', 'account'], function (account) {
                           var noSpace = account && account.usage.byfs >= account.usage.limit;
                           return ['div', {class: 'upload-box__section'}, [
                              ['h3', {class: 'upload-box__section-title'}, 'Import files'],
                              ['div', {class: 'drag-and-drop-import'}, [
                                 ['div', dale.go ([{provider: 'google', class: 'google-drive-logo'}, {provider: 'dropbox', class: 'dropbox-logo', svg: H.putSvg ('dropboxLogo')}], function (provider) {


                                    var attrs = function (ev) {
                                       return {style: style ({position: 'relative', cursor: 'pointer', float: 'left', display: 'inline-block', 'margin-right': 35}), class: provider.class, onclick: ev ? B.ev (ev) : undefined};
                                    }

                                    // If there's no implemented OAuth flow yet, put a button to let the user know.
                                    if (! importData [provider.provider]) return ['div', attrs (['snackbar', 'green', 'Coming soon, hang tight!']), [
                                       provider.svg
                                    ]];

                                    // We consider only the first import entry for the provider.
                                    var providerData = (importData [provider.provider] || []) [0] || {};

                                    // No space left, just show the bare div.
                                    if (noSpace) return ['div', attrs (), provider.svg];

                                    // If the OAuth flow hasn't been started yet, offer a link to start it.
                                    if (providerData.redirect) {
                                       return ['div', attrs (['set', ['State', 'import', 'googleOAuthBox'], true]), provider.svg];
                                    }

                                    // If there's an error, print an error on click.
                                    if (providerData.status === 'error' || providerData.status === 'stalled') return ['div', attrs (['snackbar', 'red', 'There was an error retrieving the list of files, please retry.']), provider.svg];

                                    // If there's an import upload in process, print a warning on click.
                                    if (providerData.status === 'uploading') return ['div', attrs (['snackbar', 'yellow', 'Files being uploaded, please wait.']), provider.svg];

                                    // If there no list or the last import is finished, trigger listing.
                                    if (inc ([undefined, 'cancelled', 'complete'], providerData.status)) return ['div', attrs (['import', 'list', provider.provider]), provider.svg];

                                    // If we are currently listing, print a warning on click.
                                    if (providerData.status === 'listing') return ['div', attrs (['snackbar', 'yellow', 'Files being listed, please wait.']), provider.svg];

                                    // There's already a completed list, show it.
                                    if (providerData.status === 'ready') return ['div', attrs (['set', ['State', 'imports', provider.provider, 'showFolders'], true]), provider.svg];
                                 })]
                              ]],
                           ]];
                        })
                     ]]
                  ]],
                  dale.go (importData, function (data, provider) {
                     data = (data || []) [0];
                     if (data && data.status) return boxMaker (data.status, provider, data);
                  })
               ]];
            }),
            ['div', {class: 'go-back-to-view-pictures'}, [
               ['p', {class: 'go-back-to-view-pictures-p'}, 'Want to go back to your pics?'],
               ['a', {class: 'go-back-to-view-pictures-a', onclick: B.ev (H.stopPropagation, ['goto', 'page', 'pics'])}, 'Go back to View Pictures.']
            ]],
            // RECENT IMPORTS
            ['h2', {class: 'recent-imports__title'}, 'Recent imports'],
            B.view (['Data', 'imports'], function (providers) {
               return ['div', dale.go (providers, function (v, provider) {
                  return dale.go (v, function (v2) {
                     if (! inc (['complete', 'error', 'cancelled'], v2.status)) return;
                     var repeated = (v2.repeated || []).length + (v2.alreadyImported || 0);
                     return ['div', {class: 'upload-box upload-box--recent-uploads', style: style ({'margin-bottom': CSS.typography.spaceVer (1)})}, [
                        ['div', {class: 'space-alert__image'}, [
                           ['div', {class: 'google-drive-icon'}, H.putSvg ('googleDriveIcon')]
                        ]],
                        ['div', {class: 'upload-box__main'}, [
                           ['div', {class: 'upload-box__section'}, [
                              ['p', {class: 'upload-progress'}, [
                                 H.putSvg ('uploadProgress'),
                                 ['span', {class: 'upload-progress__amount-uploaded'}, v2.ok || 0],
                                 ['LITERAL', '&nbsp'],
                                 ['span', {class: 'upload-progress__default-text'}, 'pics imported'],
                                 ! v2.alreadyUploaded ? [] : [
                                    ['span', {class: 'upload-progress__amount-uploaded'}, ', ' + v2.alreadyUploaded],
                                    ['LITERAL', '&nbsp'],
                                    ['span', {class: 'upload-progress__default-text'}, 'already uploaded']
                                 ],
                                 ! repeated ? [] : [
                                    ['span', {class: 'upload-progress__amount-uploaded'}, ', ' + repeated],
                                    ['LITERAL', '&nbsp'],
                                    ['span', {class: 'upload-progress__default-text'}, 'repeated']
                                 ],
                                 ! v2.invalid ? [] : [
                                    ['span', {class: 'upload-progress__amount-uploaded'}, ', ' + v2.invalid.length],
                                    ['LITERAL', '&nbsp'],
                                    ['span', {class: 'upload-progress__default-text'}, 'invalid']
                                 ],
                                 ! v2.tooLarge ? [] : [
                                    ['span', {class: 'upload-progress__amount-uploaded'}, ', ' + v2.tooLarge.length],
                                    ['LITERAL', '&nbsp'],
                                    ['span', {class: 'upload-progress__default-text'}, 'too large']
                                 ],
                                 ['LITERAL', '&nbsp'],
                                 ['span', {class: 'upload-progress__amount-uploaded'}, '(' + v2.status + ', ' + H.ago (Date.now () - v2.end) + ' ago)'],
                                 ['LITERAL', '&nbsp'],
                              ]],
                              ['p', {class: 'upload-progress no-svg', style: style ({color: 'red'})}, [
                                 H.if (v2.error, ['span', {class: 'upload-progress__default-text'}, [
                                    'Error: ',
                                    teishi.complex (v2.error) ? JSON.stringify (v2.error) : v2.error
                                 ]]),
                                 H.if (v2.providerErrors, ['span', {class: 'upload-progress__default-text'}, [
                                    (v2.providerErrors || []).length + ' files could not be retrieved!'
                                 ]])
                              ]],
                           ]],
                        ]],
                     ]];
                  });
               })];
            }),
            // BACK LINK
            ['div', {class: 'page-section'}, [
               ['div', {class: 'back-link back-link--uploads'}, [
                  ['a', {class: 'back-link__link', onclick: B.ev (H.stopPropagation, ['goto', 'page', 'pics'])}, [
                     H.putSvg ('backLink'),
                     ['span', {class: 'back-link__link-text'}, 'See all photos'],
                  ]],
               ]],
            ]],
         ]],
      ]],
   ]];
}

views.importFolders = function (importState, importData) {
   importData = importData [0];
   var folderList = ! importState.currentFolder ? importData.data.roots : importData.data.folders [importState.currentFolder].children;
   folderList = dale.fil (folderList, undefined, function (id) {
       if (importData.data.folders [id]) return id;
    });
   folderList.sort (function (a, b) {
      var nameA = importData.data.folders [a].name;
      var nameB = importData.data.folders [b].name;
      return nameA.toLowerCase () > nameB.toLowerCase () ? 1 : -1;
   });
   var breadcrumb = [], addParent = function (id) {
      breadcrumb.unshift (id);
      if (importData.data.folders [id].parent) addParent (importData.data.folders [id].parent);
   }
   if (importState.currentFolder) addParent (importState.currentFolder);
   breadcrumb.unshift (importData.provider === 'google' ? 'Google Drive' : 'Dropbox');
   (function () {
      // first title is uncompressible
      // last title must always be there but can be compressed (what's the maximum width?)
      // intermediate titles can be either compressed or omitted
      // compute width of '...'
      var breadcrumbContainer = c ('.import-breadcrumb') [0];
      if (! breadcrumbContainer) return;

      // We give ourselves a padding of 5px to the right.
      var availableWidth = breadcrumbContainer.clientWidth - 5;

      var calculateWidth = function (text) {
         var container = document.createElement ('span');
         container.innerHTML = text;
         document.body.insertAdjacentElement ('beforeEnd', container);
         var width = Math.ceil (container.getBoundingClientRect ().width);
         // We add 3px to each item because of a discrepancy when getting the width of the span when it has other spans to the left, vs being the only span.
         width += 3;
         document.body.removeChild (container);
         return width;
      }
      var widths = {};
      dale.go (breadcrumb, function (item, k) {
         widths [k] = calculateWidth (k === 0 ? item : ' > ' + importData.data.folders [item].name);
      });
      widths.dots   = calculateWidth ('...');
      widths.gmdots = calculateWidth ('...');
      // Width used is set to the width of the first item of the breadcrumb, which is always visible.
      var widthUsed = widths [0];
      var shortenedBreadcrumb = [breadcrumb [0]];

      dale.stop (dale.times (breadcrumb.length - 1, breadcrumb.length - 1, -1), true, function (index) {
         var name = importData.data.folders [breadcrumb [index]].name;

         // if not the last element to add (the second one in breadcrumb) leave space for "> ..."
         if ((widthUsed + widths [index] + (index === 1 ? 0 : widths.gmdots)) <= availableWidth) {
            shortenedBreadcrumb.splice (1, 0, {id: breadcrumb [index], name: name});
            widthUsed += widths [index];
            return;
         }

         // to remove = total - available + dots
         var toRemovePixels = widths [index] - (availableWidth - widthUsed) + widths.dots;
         // multiply char width x3 to be on the safe side if the removed characters are much thinner than average
         var toRemoveChars = Math.ceil (name.length * (toRemovePixels / widths [index])) * 3;

         // If less than 8 characters left on shortened name, omit entry altogether.
         if (name.length - toRemoveChars < 8) {
            shortenedBreadcrumb.splice (1, 0, {name: ' > ...'});
            return true;
         }

         var shortenedName = name.slice (0, Math.floor (name.length / 2) - Math.ceil (toRemoveChars / 2));
         shortenedName += '...';
         shortenedName += name.slice (Math.floor (name.length / 2) + Math.floor (toRemoveChars / 2));
         shortenedBreadcrumb.splice (1, 0, {id: breadcrumb [index], name: shortenedName});
         widthUsed += calculateWidth (shortenedName);
         // If we're already shortening the name, we won't have space for the next entry.
         return true;
      });

      breadcrumb = shortenedBreadcrumb;
   }) ();

   var selection = importState.selection || {};

   return ['div', {class: 'import-file-list'}, [
      ['div', {class: 'upload-box'}, [
         ['div', {class: 'listing-table-container'}, [
            ['div', {class: 'import-breadcrumb-container'}, [
               ['div', {class: 'import-breadcrumb-icon'}, [
                  ['div', {class: 'google-drive-icon-small'}, H.putSvg ('googleDriveIcon')]
               ]],
               ['div', {class: 'import-breadcrumb'}, dale.go (breadcrumb, function (item, k) {
                  if (k === 0) return ['span', {class: 'pointer', onclick: B.ev ('rem', ['State', 'imports', importData.provider], 'currentFolder')}, item];
                  // This case is the "> ..." to omit certain items
                  if (! item.id) return ['span', item.name];
                  return ['span', {class: 'pointer', onclick: B.ev ('set', ['State', 'imports', importData.provider, 'currentFolder'], item.id)}, ' > ' + item.name];
               })],
            ]],
            ['div', {class: 'import-process-box'}, [
               ['div', {class: 'import-process-box-back pointer', onclick: B.ev (
                  ['import', 'select', importData.provider],
                  ['rem', ['State', 'imports', importData.provider], 'showFolders'],
                  ['rem', ['State', 'imports', importData.provider], 'currentFolder']
               )}, [
                  ['div', {class: 'import-process-box-back-icon'}, H.putSvg ('backIcon')],
                  ['div', {class: 'import-process-box-back-text'}, 'Back']
               ]],
               ['div', {class: 'import-process-box-list'}, [
                  ['div', {style: importState.currentFolder ? '' : 'display: none', class: 'import-process-box-list-up pointer', onclick: B.ev ('set', ['State', 'imports', importData.provider, 'currentFolder'], importState.currentFolder ? importData.data.folders [importState.currentFolder].parent : '')}, [
                     ['div', {class: 'up-icon'}, H.putSvg ('upIcon')],
                     ['span', 'Up']
                  ]],
                  ['div', {class: 'import-process-box-list-folders', style: style ({height: ! importState.currentFolder ? 210 : 163})}, dale.go (folderList, function (id) {
                     var folder = importData.data.folders [id];
                     // If folder only has unsupported files, do not show it (unless it is the root).
                     if (folder.count === 0 && ! inc (importData.data.roots, id)) return;
                     var selected = !! selection [id];
                     return ['div', {class: 'import-process-box-list-folders-row'}, [
                        ['div', {class: 'select-folder-box pointer'}, [
                           ['label', {class: 'checkbox-container'}, [
                              ['input', {type: 'checkbox', checked: selected, onchange: B.ev (selected ? ['rem', ['State', 'imports', importData.provider, 'selection'], id] : ['set', ['State', 'imports', importData.provider, 'selection', id], true])}],
                              ['span', {class: 'select-folder-box-checkmark'}]
                           ]],
                        ]],
                        ['div', {class: 'folder-icon'}, H.putSvg ('folderIcon')],
                        ['div', {title: folder.name, class: 'import-folder-name pointer', onclick: folder.children ? B.ev ('set', ['State', 'imports', importData.provider, 'currentFolder'], id) : ''}, folder.name],
                        ['div', {class: 'import-folder-files'}, '(' + folder.count + ' files)']
                     ]];
                  })],
               ]],
               ['div', {class: 'import-process-box-selected'}, [
                  ['div', {class: 'import-process-box-selected-title'}, 'Selected Folders'],
                  ['div', {class: 'import-process-box-selected-row-container'}, [
                     dale.go (selection, function (selected, id) {
                        var name = importData.data.folders [id].name;
                        return ['div', {class: 'import-process-box-selected-row'}, [
                           ['div', {class: 'folder-icon'}, H.putSvg ('folderIcon')],
                           ['div', {title: name, class: 'selected-folder-name'}, name],
                           ['div', {class: 'selected-folder-deselect tag-actions__item', onclick: B.ev ('rem', ['State', 'imports', importData.provider, 'selection'], id)}, H.putSvg ('folderDeselect')]
                        ]];
                     })
                  ]],
               ]],
            ]],
            ['div', {class: 'start-import-button button', onclick: B.ev (
               ['import', 'select', importData.provider, true],
               ['rem', ['State', 'imports', importData.provider], 'showFolders'],
               ['rem', ['State', 'imports', importData.provider], 'currentFolder']
            )}, 'Start import'],
         ]],
      ]]
   ]];
}

// *** ACCOUNT VIEW ***

views.account = function () {
   return ['div', [
      views.header (true, true),
      B.view (['Data', 'account'], function (account) {
         if (! account) return ['div'];
         var percUsed = Math.round ((account.usage.byfs / account.usage.limit) * 100);
         var gbUsed = Math.round (account.usage.byfs * 10 / 1000000000) / 10;
         var free   = true;
         return ['div', {class: 'main-centered'}, [
            ['div', {class: 'main-centered__inner max-width--m'}, [
               // PAGE HEADER
               ['div', {class: 'page-header'}, [
                  ['h1', {class: 'page-header__title page-title'}, 'Account'],
                  ['h2', {class: 'page-header__subtitle page-subtitle'}, 'Manage your settings and usage']
               ]],
               ['div', {class: 'page-section'}, [
                  //PAGE CONTENT
                  ['div', {class: 'account-box'}, [
                     ['div', {class: 'account-content-container'}, [
                        ['table', {class: 'geo-and-password-table'}, [
                           ['tr', {class: 'enable-geotagging'}, [
                              ['td', {class: 'text-left-table'},'Geotagging'],
                              ['td', {style: style ({'vertical-align': 'middle'})}, [
                                 ['label', {class: 'switch'}, [
                                    ['input', {id: 'geoCheckbox', type: 'checkbox', checked: account && account.geo, onclick: B.ev ('toggle', 'geo')}],
                                    ['span', {class: 'geo-slider'}]
                                 ]]
                              ]],
                           ]],
                           B.view (['State', 'changePassword'], function (changePassword) {
                              return ['tr', {class: 'change-password'}, [
                                 ['td', {class: 'text-left-table'}, 'Password'],
                                 ['td', {style: style ({'vertical-align': 'middle'})}, [
                                    ! changePassword ? ['span', {class: 'change-password-button button', onclick: B.ev ('set', ['State', 'changePassword'], true)}, 'Change password'] : [],
                                 ]],
                              ]];
                           }),
                        ]],
                        B.view (['State', 'changePassword'], function (changePassword) {
                           if (! changePassword) return ['div'];
                           return ['div', {class: 'change-password-form'}, [
                              ['input', {id: 'password-current', class: 'search-form__input search-input change-password-placeholder', type: 'password', placeholder: 'Enter your current password'}],
                              ['input', {id: 'password-new', class: 'search-form__input search-input change-password-placeholder', type: 'password', placeholder: 'Enter your new password'}],
                              ['input', {id: 'password-new-repeat', class: 'search-form__input search-input change-password-placeholder', type: 'password', placeholder: 'Repeat your new password'}],
                              ['div', {class: 'change-password-buttons'}, [
                                 ['span', {class: 'change-password-button-confirm button', onclick: B.ev ('submit', 'changePassword')}, 'Change password'],
                                 ['span', {class: 'change-password-button-cancel button', onclick: B.ev ('clear', 'changePassword')}, 'Cancel']
                              ]],
                           ]];
                        }),
                        ['h2', {class: 'usage-and-account-type'}, 'Usage and account type'],
                        ['table', {class: 'account-data'}, [
                           ['tr', {class: 'space-usage'}, [
                              ['td', {class: 'text-left-account-data-table'}, 'Usage: ' + percUsed + '% (' + gbUsed + ' GB)'],
                              ['td', {style: style ({'vertical-align': 'middle'}), 'rowspan': '2'}, [
                                 ['span', {class: 'space-usage-bar', style: style ({
                                    background: 'linear-gradient(90deg, #8b8b8b ' + percUsed + '%, #fff ' + percUsed + '%)',
                                 })}],
                              ]],
                           ]],
                           ['tr', {class: 'subtext-left-table'}, [
                              ['td', 'Of your free 5 GB']
                           ]],
                           free ? [] : ['tr', {class: 'space-limit'}, [
                              ['td', {class: 'text-left-account-data-table'}, 'Space limit'],
                              ['td', {style: style ({'vertical-align': 'middle'}), 'rowspan': '2'}, [
                                 ['input', {class: 'search-form__input search-input space-limit-box', type: 'text', placeholder: '100'}]
                              ]],
                           ]],
                           free ? [] : ['tr', {class: 'subtext-left-table'}, [
                              ['td', 'You can set your monthly limit up to 100 GB.']
                           ]],
                           ['tr', {class: 'account-type'}, [
                              ['td', {class: 'text-left-account-data-table'}, [
                                 ['span', 'Account type: '],
                                 ['span', {style: style ({'font-weight': CSS.vars.fontPrimaryMedium})}, 'Free']
                              ]],
                              free ? ['td', {class: 'call-to-action-text'}, ['a', {href: '#/upgrade'}, 'Upgrade your account']] : ['td', {class: 'values-right-table', 'rowspan': '2'}, '€ 3.5 / Month']
                           ]],
                           free ? [] : [
                              ['tr', {class: 'subtext-left-table'}, [
                                 ['td', 'This month you pay for 15 days. Monthly cost is € 7.00']
                              ]],
                              ['tr', {class: 'paid-space-used'}, [
                                 ['td', {class: 'text-left-account-data-table'}, [
                                    ['span', {class: 'right-pointing-triangle'}, '▶ '],
                                    ['span', {class: 'down-pointing-triangle'}, '▼ '],
                                    ['span', 'Paid space used: '],
                                    ['span', {style: style ({'font-weight': CSS.vars.fontPrimaryMedium})}, '55 GB'],
                                 ]],
                                 ['td', {class: 'values-right-table', 'rowspan': '2'}, '€ 1.81 / Month']
                              ]],
                              ['tr', {class: 'subtext-left-table'}, [
                                 ['td', [
                                    ['span',{style: style ({'margin-left': '4%'})}, 'Based on your average space used and your current use.']
                                 ]],
                              ]],
                              ['tr', {class: 'average-paid-space-used'}, [
                                 ['td', {style: style ({'padding-left': '5%'}), class: 'text-left-account-data-table'}, [
                                    ['span', 'Average paid space used: '],
                                    ['span', {style: style ({'font-weight': CSS.vars.fontPrimaryMedium})}, '40 GB']
                                 ]],
                                 ['td', {class: 'values-right-table', 'rowspan': '2'}, '€ 0.01 / Month']
                              ]],
                              ['tr', {class: 'subtext-left-table'}, [
                                 ['td', {style: style ({'padding-left': '5%'})}, 'Average amount of GB you used this month so far.']
                              ]],
                              ['tr', {class: 'paid-space-currently-used'}, [
                                 ['td', {style: style ({'padding-left': '5%'}), class: 'text-left-account-data-table'}, [
                                    ['span', 'Paid space currently using: '],
                                    ['span', {style: style ({'font-weight': CSS.vars.fontPrimaryMedium})}, '70 GB']
                                 ]],
                                 ['td', {class: 'values-right-table', 'rowspan': '2'}, '€ 1.80 / Month']
                              ]],
                              ['tr', {class: 'subtext-left-table'}, [
                                 ['td', {style: style ({'padding-left': '5%'})}, '70 GB * 15 remaining days this month. Each GB is  € 0.05.']
                              ]],
                              ['tr', {class: 'total-estimated-cost'}, [
                                 ['td', {class: 'text-left-account-data-table'}, 'Total estimated cost for this month:'],
                                 ['td', {class: 'values-right-table'}, '€ 3.81']
                              ]],
                           ]
                        ]],
                        ['div', {class: 'cancel-account', onclick: B.ev ('delete', 'account')}, [
                           ['a', {href: ''}, 'Delete my account']
                        ]]
                     ]]
                  ]],
               ]],
            ]],
         ]];
      })
   ]];
}

// *** UPGRADE VIEW ***

views.upgrade = function () {
   return ['div', [
      views.header (true, true),
      ['div', {class: 'main-centered'}, [
         ['div', {class: 'main-centered__inner max-width--m'}, [
            // PAGE HEADER
            ['div', {class: 'page-header'}, [
               ['h1', {class: 'page-header__title page-title'}, 'Upgrade account'],
               ['h2', {class: 'page-header__subtitle page-subtitle'}, 'Get all the space you need']
            ]],
            ['div', {class: 'page-section'}, [
               //PAGE CONTENT
               ['div', {class: 'account-box'}, [
                  ['div', {class: 'account-content-container'}, [
                     ['div', {class: 'free-vs-paid'}, 'Free vs paid plan'],
                     ['table', {class: 'upgrade-table'}, [
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}],
                           ['td', {class: 'free-vs-paid-col-2'}, [
                              ['span', {style: style ({'font-weight': CSS.vars.fontPrimaryMedium, 'font-size': CSS.typography.fontSize (2)})}, 'Free Plan'],
                              ['br'],
                              ['span', {style: style ({'font-size': CSS.typography.fontSize (-1)})}, 'You are here']
                           ]],
                           ['td', {class: 'free-vs-paid-col-3'}, [
                              ['span', {style: style ({'font-weight': CSS.vars.fontPrimaryMedium, 'font-size': CSS.typography.fontSize (2)})}, 'Paid Plan'],
                              ['br'],
                              ['span', {style: style ({'font-size': CSS.typography.fontSize (-1), 'padding-left, padding-right': CSS.vars ['padding--xs']})}, '€ 7/mo + € 0.05 GB/mo']
                           ]],
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Automated tags (Year & Location)'],
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, '✔'],
                           ['td', {class: 'free-vs-paid-col-3'}, '✔']
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Detects duplicate photos & videos'],
                              ['span', {class: 'upgrade-table-info'}, [
                                 ['span', {class: 'upgrade-table-info-icon'}, 'ⓘ'],
                                 ['span', {class: 'upgrade-table-info-comment'}, [
                                    ['span', {class: 'hover-text'}, 'For identical pics and videos, regardless of filename or metadata.']
                                 ]],
                              ]],
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, '✔'],
                           ['td', {class: 'free-vs-paid-col-3'}, '✔']
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Preserve original size and quality'],
                              ['span', {class: 'upgrade-table-info'}, [
                                 ['span', {class: 'upgrade-table-info-icon'}, 'ⓘ'],
                                 ['span', {class: 'upgrade-table-info-comment'}, [
                                    ['span', {class: 'hover-text'}, 'No compression or loss of data in photos & videos.']
                                 ]],
                              ]],
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, '✔'],
                           ['td', {class: 'free-vs-paid-col-3'}, '✔']
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Import from Google Drive & Dropbox']
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, '✔'],
                           ['td', {class: 'free-vs-paid-col-3'}, '✔']
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Share tags'],
                              ['span', {class: 'upgrade-table-info'}, [
                                 ['span', {class: 'upgrade-table-info-icon'}, 'ⓘ'],
                                 ['span', {class: 'upgrade-table-info-comment'}, [
                                    ['span', {class: 'hover-text'}, 'Share by link (anyone with link can access) or with specific user(s).']
                                 ]],
                              ]],
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, '✔'],
                           ['td', {class: 'free-vs-paid-col-3'}, '✔']
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Space available'],
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, [
                              ['span', '2 GB']
                           ]],
                           ['td', {class: 'free-vs-paid-col-3'}, [
                              ['span', '2 TB']
                           ]],
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Control your space usage']
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, '✘'],
                           ['td', {class: 'free-vs-paid-col-3'}, [
                              ['span', 'Set a monthly limit']
                           ]],
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Contribute to Altocode'],
                              ['span', {class: 'upgrade-table-info'}, [
                                 ['span', {class: 'upgrade-table-info-icon'}, 'ⓘ'],
                                 ['span', {class: 'upgrade-table-info-comment'}, [
                                    ['span', {class: 'hover-text'}, 'Your monthly subscription enables us to create and maintain ac;pic.']
                                 ]],
                              ]],
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, '✘'],
                           ['td', {class: 'free-vs-paid-col-3'}, [
                              ['span', '€ 7/mo']
                           ]],
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}, [
                              ['span', {class: 'text-left-account-data-table'}, 'Pay only for what you use'],
                              ['span', {class: 'upgrade-table-info'}, [
                                 ['span', {class: 'upgrade-table-info-icon'}, 'ⓘ'],
                                 ['span', {class: 'upgrade-table-info-comment'}, [
                                    ['span', {class: 'hover-text'}, 'We charge a linear fee based on how much space you use. We charge you at cost, no markup.']
                                 ]],
                              ]],
                           ]],
                           ['td', {class: 'free-vs-paid-col-2'}, '✘'],
                           ['td', {class: 'free-vs-paid-col-3'}, [
                              ['span', '€ 0.05 per GB/mo']]]
                        ]],
                        ['tr', [
                           ['td', {class: 'free-vs-paid-col-1'}],
                           ['td', {class: 'free-vs-paid-col-2'}],
                           ['td', {class: 'free-vs-paid-col-3'}, [
                              ['span', {class: 'call-to-action-upgrade', onclick: B.ev ('snackbar', 'green', 'Coming soon!')}, 'Upgrade now'],
                              ['br'],
                              ['span', {class: 'stripe-message-upgrade'}, 'You’ll be taken to Stripe and then back. Thank you!']
                           ]],
                        ]],
                     ]],
                  ]],
               ]],
            ]],
         ]],
      ]],
   ]];
}

// *** INITIALIZATION ***

B.call ('initialize', []);
