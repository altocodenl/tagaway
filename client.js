// *** GOTOB V2 SHIM ***
// TODO v2: remove

B.forget ('eventlog');

var T = teishi.time ();
B.listen ('*', [], {priority: 1000000}, function (x) {
   if (B.logall) x.args ? console.log (teishi.time () - T, x.verb, x.path, x.args) : console.log (teishi.time () - T, x.verb, x.path);
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
   media ('screen and (min-width: 1025px)', ['.button--one:hover', {
      'background-color': '#fff',
      color: CSS.vars ['color--one'],
   }]),
   ['.button--two', {
      border: '1px solid ' + CSS.vars.grey,
      color: '#fff',
      'background-color': CSS.vars.grey,
   }],
   media ('screen and (min-width: 1025px)', ['.button--two:hover', {
      color: CSS.vars.grey,
      background: '#fff',
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
   ['.header__upload-button', {'margin-left, margin-right': CSS.vars ['padding--m']}],
   ['.header__import-button', {'margin-left':'22px', 'margin-right':'-12px'}],
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
   ['.sidebar__attach-form, .sidebar__switch', {
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
   ['.sidebar__attach-form', {'margin-top, margin-bottom': CSS.typography.spaceVer (1)}],
   // Sidebar switch
   ['.sidebar__switch', {'margin-bottom': CSS.typography.spaceVer (1)}],
   // Sidebar footer
   ['.sidebar__footer', {
      position: 'fixed',
      'bottom, left': 0,
      height: 114,
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
   // Sidebar -- untag tags
   ['.app-untag-tags', [
      ['.sidebar__attach-form', {display: 'none'}],
      ['.sidebar__section-title--attach', {display: 'none'}],
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
   // *** sidebar-search.scss
   ['.sidebar-search', {
      position: 'relative',
      display: 'flex',
      'width, height': 1,
      'border-top, border-bottom': '1px solid ' + CSS.vars ['border-color'], // ORIGINALLY IN '.sidebar__footer'. MOVED HERE AS A FIX TO ACCOMODATE '.done-tagging-button'
   }],
   ['.sidebar-search__input', {'padding-left, padding-right': CSS.vars ['padding--m']}],
   ['.sidebar-search__icon', {
      position: 'absolute',
      right: CSS.vars ['padding--m'],
      top: 0.5,
      'margin-top': -12,
      'width, height': 24,
      display: 'inline-block',
   }, ['path', {fill: CSS.vars ['grey--link']}]],
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
   ['.app-untag-tags .switch', {background: CSS.vars ['highlight--negative']}],
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
   ['.app-untag-tags .switch::after', {left: 128, width: 110}],
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
      'padding-top': 58, // header height
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
   ['.app-show-organise-bar .pictures-grid__item', {
      transition: CSS.vars.easeOutQuart,
      transform: 'translateY(-58px)' // header height
   }],
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
   }],
   ['.tag-list-horizontal .tag-list-horizontal__item', {
      width: 'auto',
      'margin-right': CSS.vars ['padding--m'],
      display: 'inline-flex',
      'white-space': 'nowrap',
      'margin-top': CSS.typography.spaceVer (0.25),
   }],
   // *** tag-list-extended.scss ***
   // Tag list extended
   ['.tag-list-extended', {
      width: 1,
      'list-style-type': 'none',
      display: 'flex',
      'flex-direction': 'column'
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
      position: 'absolute',
      display: 'flex',
      'flex-direction': 'column',
      width: 1,
      height: 'auto',
      top: CSS.typography.spaceVer (1),
      'padding-left': 27,
      'padding-right': CSS.vars ['padding--m'],
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
   // Tag list -- Sidebar -- Only selected tags
   ['.app-selected-tags .tag-list--sidebar', [
      ['.tag', {display: 'none'}],
      ['.tag--selected', {display: 'flex'}],
   ]],
   // Tag list -- Sidebar -- only attached tags (Untag)
   ['.app-untag-tags .tag-list--attach', [
      ['.tag', {display: 'none'}],
      ['.tag--attached', {display: 'flex'}],
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
   }],
   // Tag title - amount
   ['.tag__title-amount', {
      'white-space': 'nowrap',
      mixin1: CSS.vars.fontPrimaryRegular,
   }],
   // Tag info
   ['.tag__status', {display: 'flex'}],
   ['.tag__status-icon', {
      display: 'inline-block',
      'width, height': 24,
   }, ['path', {fill: CSS.vars ['grey--darker']}]],
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
   ]],
   // Tag actions -- Untag
   ['.app-untag-tags', [
      ['.tag-actions__item--attached', {display: 'flex'}],
      ['.tag-actions:hover', [
         ['.tag-actions__item--attached', {display: 'none'}],
         ['.tag-actions__item--untag', {display: 'flex'}],
      ]],
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
   ['.tag-share__item:hover', {'background-color': 'rgba(' + CSS.toRGBA (CSS.vars.grey) + ', 0.15)'}],
   ['.tag-share__item-icon', {
      display: 'inline-block',
      'width, height': 24,
   }, ['path', {
      fill: 'rgba(' + CSS.toRGBA (CSS.vars ['grey--darker']) + ', 0.7)',
      transition: '250ms linear all',
   }]],
   ['.tag-share__item:hover path', {fill: CSS.vars ['grey--darker']}],
   ['.tag-share__item-img', {
      display: 'inline-block',
      'width, height': 36,
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
   }],
   ['.dropdown__button', {
      mixin1: CSS.vars.fontPrimaryMedium,
      position: 'relative',
      'padding-right': 20,
      color: CSS.vars.grey,
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
      'border-color': CSS.vars.grey + ' transparent transparent transparent',
      transition: CSS.vars.easeOutQuart,
   }]],
   ['.dropdown__button:hover', {color: CSS.vars ['grey--darker']}, ['&::after', {
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
   // BLOCKED BUTTONS WHEN E.noSpace IS SHOWING
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
      height:'30px',
      width:'98px',
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
      display: 'inline-flex',
      position: 'absolute',
      height: CSS.typography.spaceVer (1.5),
   }],
   ['.import-breadcrumb-buffer', {
      padding: CSS.vars ['padding--xl'],
   }],
   ['.import-breadcrumb', {
      height: 'inherit',
      'max-width': 512,
   }],
   ['.import-process-box', {
      display: 'inline-flex',
      'flex-grow': '1',
      height: CSS.typography.spaceVer (11),
      'margin-top': CSS.typography.spaceVer (1.5),
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
      'overflow-y': 'auto',
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
   }],
   ['.import-process-box-list-folders-row', {
      display: 'inline-flex',
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
   }],
   ['.import-folder-files', {
      'color': CSS.vars ['grey--darker'],
      'font-weight': CSS.vars.fontPrimaryMedium,
   }],
   ['.import-process-box-selected', {
      width: .30,
      'overflow-y': 'auto',
      'padding-bottom': CSS.vars ['padding--xs'],
   }],
   ['.import-process-box-selected-title', {
      'text-align': 'center',
      'font-weight': CSS.vars.fontPrimaryMedium,
      'margin-bottom': CSS.vars ['padding--xs'],
   }],
   ['.import-process-box-selected-row', {
      width: 1,
      display: 'inline-flex',
      'align-items': 'center',
      'padding-right, padding-left': CSS.vars ['padding--xs'],
   }],
   ['.selected-folder-name', {
      'margin-right': CSS.vars ['padding--xs'],
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
      'height': 28,
      display: 'inline-block',
      transform: 'scale(1.5)',
   }, ['path', {fill: CSS.vars ['color--remove']}]],
   ['.google-drive-icon-small', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': 7,
   }, ['path', {fill: CSS.vars ['color--remove']}]],
   ['.dropbox-icon', {
      'width': 24,
      'height': 28,
      display: 'inline-block',
      transform: 'scale(1.5)',
   }, ['path', {fill: CSS.vars ['color--remove']}]],
   ['.dropbox-icon-small', {
      display: 'inline-block',
      'width, height': 24,
      'margin-right': 7,
   }, ['path', {fill: CSS.vars ['color--remove']}]],
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
      //'margin-left': .2
   }],
   ['.boxed-alert-button-right:hover', {
      color: '#5b6eff',
      'background-color': '#fff',
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
      'margin-bottom': CSS.typography.spaceVer (2),
      'padding-right': CSS.vars ['padding--m'],
      position: 'relative',
      'z-index': '10'
   }],
   ['.pictures-header__action-bar', {
      'margin-top': CSS.typography.spaceVer (0.5),
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
      height: 140,
      'padding-right': 16,
      'padding-bottom': 18,
      position: 'relative',
   }],
   ['.pictures-grid__item', {width: 100}],
   ['.pictures-grid__item:nth-child(4n+12)', {width: 240}],
   ['.pictures-grid__item:nth-child(3n+0)', {width: 180}],
   ['.pictures-grid__item:nth-child(5n+7)', {width: 140}],
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
   ['.tags-search-bar__search-icon path', {fill: CSS.vars.grey}],
   ['.tags-search-bar__shared', {
      position: 'absolute',
      right: 18,
      top: 0.5,
      transform: 'translateY(-50%)',
      color: CSS.vars ['grey--darker'],
      opacity: '0.6',
      display: 'flex',
      'align-items': 'center',
      cursor: 'pointer'
   }],
   ['.app-shared-tags-filtered .tags-search-bar__shared', {
      opacity: '1',
      color: CSS.vars ['color--one'],
   }],
   ['.tags-search-bar__shared-icon', {
      'width, height': 24,
      display: 'inline-block',
      'margin-right': 4,
   }, ['path', {fill: CSS.vars ['grey--darker']}]],
   ['.app-shared-tags-filtered .tags-search-bar__shared-icon path', {fill: CSS.vars ['color--one']}],
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
      fill: CSS.vars ['grey--lightest'],
   }],
   ['.fullscreen__action-text', {
      color: CSS.vars.grey,
      'font-size': CSS.typography.fontSize (0),
   }],
   ['.fullscreen__action:hover .fullscreen__action-text', {color: CSS.vars ['grey--lightest']}],
];

// *** HELPERS ***

var H = {};

H.pad = function (v) {return v < 10 ? '0' + v : v}

H.dateFormat = function (d) {
   d = new Date (d);
   return H.pad (d.getUTCDate ()) + '/' + H.pad (d.getUTCMonth () + 1) + '/' + d.getUTCFullYear ();
}

H.tagColor = function (tag, a) {
   if (tag.match (/^untagged$/i)) return 'untagged';
   if (H.isYear (tag)) return 'time';
   var r = dale.acc (tag.split (''), tag [0].charCodeAt (), function (a, b) {
      return a + b.charCodeAt ();
   });
   return CSS.vars.tagColors [r % CSS.vars.tagColors.length];
}

H.isYear = function (tag) {
   return tag.match (/^[0-9]{4}$/) && parseInt (tag) >= 1900 && parseInt (tag) <= 2100;
}

H.isGeo = function (tag) {
   return !! tag.match (/^g::/);
}

H.isCountry = function (tag) {
   return !! tag.match (/^g::[A-Z]{2}$/);
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

H.email = /^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/;

H.trim = function (string) {
   return string.replace (/^\s+|\s+$/g, '').replace (/\s+/g, ' ');
}

H.stopPropagation = function (ev) {
   return [['onclick', 'stop', 'propagation', {rawArgs: 'event'}], ev];
}

// *** VIEWS ***

var E = {};

// *** NATIVE RESPONDERS ***

window.onerror = function () {
   B.do.apply (null, ['error', []].concat (dale.do (arguments, function (v) {return v})));
}

window.addEventListener ('hashchange', function () {
   B.do ('read', 'hash');
});

window.addEventListener ('keydown', function (ev) {
   B.do ('key', 'down', (ev || document.event).keyCode);
});

window.addEventListener ('keyup', function (ev) {
   B.do ('key', 'up', (ev || document.event).keyCode);
});

window.addEventListener ('scroll', function (ev) {
   B.do ('scroll', [], ev);
});

window.onbeforeunload = function () {
   if ((B.get ('State', 'upload', 'queue') || []).length) return 'Are you sure you want to leave?';
}

dale.do (['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange', 'MSFullscreenChange'], function (v) {
   document.addEventListener (v, function () {
      if (! document.fullscreenElement && ! document.webkitIsFullScreen && ! document.mozFullScreen && ! document.msFullscreenElement) {
         B.do ('exit', 'fullscreen', true);
      }
   });
});

window.addEventListener ('dragover', function (ev) {
   ev.preventDefault ();
});

window.addEventListener ('drop', function (ev) {
   B.do ('drop', 'files', ev);
   ev.preventDefault ();
});

document.body.addEventListener ('touchstart', function (ev) {
   B.do ('touch', 'start', ev);
});

document.body.addEventListener ('touchend', function (ev) {
   B.do ('touch', 'end', ev);
});

// *** RESPONDERS ***

dale.do ([

   // *** GENERAL RESPONDERS ***

   ['initialize', [], {burn: true}, function (x) {
      document.querySelector ('meta[name="viewport"]').content = 'width=1200';
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
   ['snackbar', [], function (x, snackbar) {
      B.do (x, 'clear', 'snackbar');
      var colors = {green: '#04E762', red: '#D33E43', yellow: '#ffff00'};
      var timeout = setTimeout (function () {
         B.do (x, 'rem', 'State', 'snackbar');
      }, 4000);
      B.do (x, 'set', ['State', 'snackbar'], {color: colors [x.path [0]], message: snackbar, timeout: timeout});
   }],
   [/^get|post$/, [], function (x, headers, body, cb) {
      var path = x.path [0], noCSRF = path === 'requestInvite' || (path.match (/^auth/) && ['auth/logout', 'auth/delete', 'auth/changePassword'].indexOf (path) === -1);
      // CSRF protection
      if (x.verb === 'post' && ! noCSRF) {
         if (type (body, true) === 'formdata') body.append ('csrf', B.get ('Data', 'csrf'));
         else                                  body.csrf = B.get ('Data', 'csrf');
      }
      // TODO v2: uncomment
      //if (signup/login/recover/reset/changepassword) teishi.last (B.r.log).args [1] = 'OMITTED';
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
      if (hash [0] === 'signup') {
         if (hash [1]) {
            B.do (x, 'set', ['Data', 'signup'], teishi.p (decodeURIComponent (hash [1])));
            window.location.hash = '#/signup';
         }
      }
   }],
   ['change', ['State', 'page'], function (x) {
      var page = B.get ('State', 'page'), logged = B.get ('Data', 'csrf'), redirect = B.get ('State', 'redirect');

      if (logged && redirect) {
         page = redirect;
         B.do (x, 'rem', 'State', 'redirect');
      }

      var allowed = logged ? ['pics', 'upload', 'share', 'tags', 'import', 'account', 'upgrade'] : ['login', 'signup', 'recover', 'reset'];

      if (allowed.indexOf (page) === -1) {
         if (! logged) B.do (x, 'set', ['State', 'redirect'], page);
         return B.do (x, 'set', ['State', 'page'], allowed [0]);
      }

      document.title = ['ac;pic', page].join (' - ');

      if (window.location.hash.replace ('#/', '').split ('/') [0] !== page) window.location.hash = '#/' + page;
   }],
   ['test', [], function (x) {
      // TODO v2: use c.loadScript
      //c.loadScript ('testclient.js');
      c.ajax ('get', 'testclient.js', {}, '', function (error, data) {
         var script = document.createElement ('script');
         script.appendChild (document.createTextNode (data.body));
         document.body.appendChild (script);
      });
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
   ['signup', [], function (x) {
      var username = H.trim (c ('#auth-username').value);
      var password = c ('#auth-password').value;
      if (username.match ('@')) return B.do (x, 'snackbar', 'yellow', 'Your username cannot be an email or contain an @ symbol.');
      if (username.length < 3)  return B.do (x, 'snackbar', 'yellow', 'Your username must be at least 3 characters long.');
      if (password.length < 6)  return B.do (x, 'snackbar', 'yellow', 'Your password must be at least 6 characters long.');
      if (c ('#auth-password').value !== c ('#auth-confirm').value) return B.do (x, 'snackbar' ,'red', 'The repeated password does not match.');
      B.do (x, 'post', 'auth/signup', {}, {
         email: B.get ('Data', 'signup', 'email'),
         token: B.get ('Data', 'signup', 'token'),
         username: username,
         password: password
      }, function (x, error, rs) {
         if (error) {
            var parsedError = teishi.p (error.responseText);
            if (parsedError && parsedError.error === 'email')    return B.do (x, 'snackbar', 'red', 'That email is already in use.');
            if (parsedError && parsedError.error === 'username') return B.do (x, 'snackbar', 'red', 'That username is already in use.');
            return B.do (x, 'snackbar', 'red', 'There was an error creating your account.');
         }
         B.do (x, 'set', ['Data', 'csrf'], rs.body.csrf);
      });
   }],
   ['request', 'invite', function (x) {
      var email = prompt ('Send us your email and we\'ll send you an invite link to create your account! We will *only* use your email to send you an invite.');
      if (! email || ! email.match (/^(([a-zA-Z0-9_\.\-]+)@([\da-zA-Z\.\-]+)\.([a-zA-Z\.]{2,6})\s*)$/)) return B.do (x, 'snackbar', 'red', 'Please enter a valid email address.');
      B.do (x, 'post', 'requestInvite', {}, {email: email}, function (x, error) {
         if (error) B.do (x, 'snackbar', 'red', 'There was an error processing your request. Please write us to info@altocode.nl instead.');
         else       B.do (x, 'snackbar', 'green', 'We received your request successfully, hang tight!');
      });
   }],

   // *** PICS RESPONDERS ***

   // TODO v2: remove, use literals
   ['change', [], {priority: -10000}, function (x) {
      var putSvg = function (selector, where, svg) {
         c (selector, function (element) {
            if (! element.innerHTML.match ('^<svg')) element.insertAdjacentHTML (where, svg);
         });
      }
      putSvg ('.account-menu__item', 'afterBegin', '<svg class="account-menu__item-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 11c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm0-1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-2 2h4c1.7 0 3 1.3 3 3v1.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-1.5c0-1.7 1.3-3 3-3zm0 1c-1.1 0-2 .9-2 2v1.5c0 .3.2.5.5.5h7c.3 0 .5-.2.5-.5v-1.5c0-1.1-.9-2-2-2z"/></svg>');
      putSvg ('.sidebar-search', 'beforeEnd', '<svg class="sidebar-search__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19.9 18-4.2-4.2s0 0-.1 0c1.7-2.5 1.4-5.9-.8-8.2-2.5-2.5-6.7-2.5-9.2 0s-2.5 6.7 0 9.2 6.7 2.5 9.2 0c.1-.1.2-.2.2-.2l4.1 4.1c.2.2.5.2.7 0s.2-.5.1-.7zm-5.8-3.9c-2.1 2.1-5.6 2.1-7.8 0s-2.1-5.6 0-7.8 5.6-2.1 7.8 0 2.1 5.6 0 7.8z"/></svg>');
      //putSvg ('.sidebar-header__filter-selected', 'afterBegin', '<svg class="sidebar-header__filter-selected-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.5 16.5c3.9 0 8-2.8 8-5s-4.1-5-8-5-8 2.8-8 5 4.1 5 8 5zm0-1c-3.4 0-7-2.5-7-4s3.6-4 7-4 7 2.5 7 4-3.6 4-7 4zm0-1c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm0-1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>');
      putSvg ('.tag--all-pictures', 'afterBegin', '<svg class="tag__icon tag__icon--all" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12 15.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm0-6c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5zm-4.5-.5c0-.3-.2-.5-.5-.5h-1c-.3 0-.5.2-.5.5s.2.5.5.5h1c.3 0 .5-.2.5-.5zm10.5-3v-1c0-.3-.2-.5-.5-.5s-.5.2-.5.5v1h-2v-.5c0-.8-.6-1.5-1.3-1.5h-3.3c-.8 0-1.4.7-1.4 1.5v.5h-2.5c-1.9 0-3.5 1.6-3.5 3.5v5c0 1.9 1.6 3.5 3.5 3.5h11c1.9 0 3.5-1.6 3.5-3.5v-5c0-1.8-1.3-3.2-3-3.5zm-8-.5c0-.3.2-.5.3-.5h3.3c.2 0 .4.2.4.5v.5h-4zm10 9c0 1.4-1.1 2.5-2.5 2.5h-11c-1.4 0-2.5-1.1-2.5-2.5v-5c0-1.4 1.1-2.5 2.5-2.5h11c1.4 0 2.5 1.1 2.5 2.5z"/></svg>');
      putSvg ('.tag-actions__item--selected', 'afterBegin', '<svg class="tag-actions__item-icon tag-actions__item-icon--selected tag-actions__selected-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.5 16.5c3.9 0 8-2.8 8-5s-4.1-5-8-5-8 2.8-8 5 4.1 5 8 5zm0-1c-3.4 0-7-2.5-7-4s3.6-4 7-4 7 2.5 7 4-3.6 4-7 4zm0-1c1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3 1.3 3 3 3zm0-1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>');
      putSvg ('.tag-actions__item--deselect', 'afterBegin', '<svg class="tag-actions__item-icon tag-actions__item-icon--deselect" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.9 8.8-.7-.7-3.2 3.2-3.2-3.2-.7.7 3.2 3.2-3.2 3.2.7.7 3.2-3.2 3.2 3.2.7-.7-3.2-3.2z"/></svg>');
      putSvg ('.tag-actions__item--attach', 'afterBegin', '<svg class="tag-actions__item-icon tag-actions__item-icon--attach" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m12.5 7h-1v4.5h-4.5v1h4.5v4.5h1v-4.5h4.5v-1h-4.5z"/></svg>');
      putSvg ('.tag-actions__item--attached', 'afterBegin', '<svg class="tag-actions__item-icon tag-actions__item-icon--attached" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m10.3 15.7c-.1 0-.3-.1-.4-.1l-3-3c-.2-.2-.2-.5 0-.7s.5-.2.7 0l2.6 2.6 6.1-6.1c.2-.2.5-.2.7 0s.2.5 0 .7l-6.4 6.4c-.1.2-.2.2-.3.2z"/></svg>');
      putSvg ('.tag-actions__item--untag', 'afterBegin', '<svg class="tag-actions__item-icon tag-actions__item-icon--untag" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19.5 9.4c-.1-.3-.4-.4-.6-.3l-6.5 1.9 1.9-6.4c.1-.3 0-.5-.3-.6s-.5.1-.6.3l-2.1 7.1-2.6.8c.3-.9.1-1.9-.6-2.6-1-1-2.6-1-3.5 0s-1 2.6 0 3.5c.5.5 1.1.7 1.8.7.4 0 .7-.1 1-.2h.1l3.4-1-1 3.4v.2c-.2.3-.2.7-.2 1 0 .7.3 1.3.7 1.8.5.5 1.1.7 1.8.7.6 0 1.3-.2 1.8-.7s.7-1.1.7-1.8-.3-1.3-.7-1.8c-.7-.7-1.7-.9-2.6-.6l.8-2.6 7.1-2.1c.1-.1.3-.4.2-.7zm-14.2 3c-.6-.6-.6-1.5 0-2.1.3-.3.6-.5 1-.5s.8.2 1.1.4c.6.6.6 1.5 0 2.1s-1.6.6-2.1.1zm7.9 3.7c.3.3.4.7.4 1.1s-.2.8-.4 1.1c-.6.6-1.5.6-2.1 0-.3-.3-.4-.7-.4-1.1s.2-.8.4-1.1c.3-.3.7-.4 1.1-.4.4-.1.7.1 1 .4z"/></svg>');
      putSvg ('.tag-list__item--untagged', 'afterBegin', '<svg class="tag__icon tag__icon--untagged" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.6 10.8c0 .5-.1 1.1-.5 1.5l-5 5.9c-.4.5-1 .7-1.5.7s-.9-.2-1.3-.5l-3.8-3.2c-.8-.7-.9-2-.2-2.8l5-5.9c.3-.4.8-.7 1.3-.7l3.5-.3c1.1-.1 2.1.7 2.2 1.8z"/></svg>');
      putSvg ('.tag-list-horizontal__item--untagged', 'afterBegin', '<svg class="tag__icon tag__icon--untagged" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.6 10.8c0 .5-.1 1.1-.5 1.5l-5 5.9c-.4.5-1 .7-1.5.7s-.9-.2-1.3-.5l-3.8-3.2c-.8-.7-.9-2-.2-2.8l5-5.9c.3-.4.8-.7 1.3-.7l3.5-.3c1.1-.1 2.1.7 2.2 1.8z"/></svg>');
      dale.do (CSS.vars.tagColors, function (color) {
         putSvg ('.tag-list__item--' + color,           'afterBegin', '<svg class="tag__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="' + color + '" d="m18.6 10.8c0 .5-.1 1.1-.5 1.5l-5 5.9c-.4.5-1 .7-1.5.7s-.9-.2-1.3-.5l-3.8-3.2c-.8-.7-.9-2-.2-2.8l5-5.9c.3-.4.8-.7 1.3-.7l3.5-.3c1.1-.1 2.1.7 2.2 1.8z"/></svg>');
         putSvg ('.tag-list-horizontal__item--' + color, 'afterBegin', '<svg class="tag__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="' + color + '" d="m18.6 10.8c0 .5-.1 1.1-.5 1.5l-5 5.9c-.4.5-1 .7-1.5.7s-.9-.2-1.3-.5l-3.8-3.2c-.8-.7-.9-2-.2-2.8l5-5.9c.3-.4.8-.7 1.3-.7l3.5-.3c1.1-.1 2.1.7 2.2 1.8z"/></svg>');
      });
      putSvg ('.tag-list__item--time', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock" style="margin-right: 5px"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>');
      putSvg ('.tag-list-horizontal__item--time', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-clock" style="margin-right: 5px"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>');
      putSvg ('.switch-list__button--attach', 'afterBegin', '<svg class="switch-list__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m20.5 11.5c0 .3-.2.5-.5.5h-2.5v2.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-2.5h-2.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5h2.5v-2.5c0-.3.2-.5.5-.5s.5.2.5.5v2.5h2.5c.3 0 .5.2.5.5zm-6.8 1.9-2.6 3.1c-.4.4-1 .5-1.4.1l-3.8-3.2c-.4-.4-.5-1-.1-1.4l5-5.9c.2-.2.4-.3.7-.4l3.5-.3c.6-.1 1 .4 1.1.9 0 .3.3.5.5.5.3 0 .5-.3.5-.5-.1-1.1-1.1-1.9-2.2-1.8l-3.5.3c-.5.1-1 .3-1.3.7l-5 5.9c-.7.8-.6 2.1.2 2.8l3.7 3.3c.4.3.8.5 1.3.5.6 0 1.1-.2 1.5-.7l2.6-3.2c.2-.2.1-.5-.1-.7-.1-.2-.4-.2-.6 0z"/></svg>');
      putSvg ('.switch-list__button--untag', 'afterBegin', '<svg class="switch-list__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m19.5 9.4c-.1-.3-.4-.4-.6-.3l-6.5 1.9 1.9-6.4c.1-.3 0-.5-.3-.6s-.5.1-.6.3l-2.1 7.1-2.6.8c.3-.9.1-1.9-.6-2.6-1-1-2.6-1-3.5 0s-1 2.6 0 3.5c.5.5 1.1.7 1.8.7.4 0 .7-.1 1-.2h.1l3.4-1-1 3.4v.2c-.2.3-.2.7-.2 1 0 .7.3 1.3.7 1.8.5.5 1.1.7 1.8.7.6 0 1.3-.2 1.8-.7s.7-1.1.7-1.8-.3-1.3-.7-1.8c-.7-.7-1.7-.9-2.6-.6l.8-2.6 7.1-2.1c.1-.1.3-.4.2-.7zm-14.2 3c-.6-.6-.6-1.5 0-2.1.3-.3.6-.5 1-.5s.8.2 1.1.4c.6.6.6 1.5 0 2.1s-1.6.6-2.1.1zm7.9 3.7c.3.3.4.7.4 1.1s-.2.8-.4 1.1c-.6.6-1.5.6-2.1 0-.3-.3-.4-.7-.4-1.1s.2-.8.4-1.1c.3-.3.7-.4 1.1-.4.4-.1.7.1 1 .4z"/></svg>');
      putSvg ('.selected-box__close', 'afterBegin', '<svg class="selected-box__close-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.9 8.8-.7-.7-3.2 3.2-3.2-3.2-.7.7 3.2 3.2-3.2 3.2.7.7 3.2-3.2 3.2 3.2.7-.7-3.2-3.2z"/></svg>');
      putSvg ('.organise-bar__button--select-all', 'afterBegin', '<svg class="organise-bar__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7.5 12c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm7 0c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm8.5-2c0-2.2-1.8-4-4-4-1.7 0-3.1 1-3.7 2.5h-9.3c-1.9 0-3.5 1.6-3.5 3.5v8c0 1.3.8 2.5 1.9 3.1l.1.1c.5.2 1 .3 1.5.3h12c1.9 0 3.5-1.6 3.5-3.5v-6.9c.9-.7 1.5-1.8 1.5-3.1zm-17 12.5c-.2 0-.5 0-.7-.1l3.1-3.1c.6-.6 1.5-.6 2.1 0l3.2 3.2zm12 0h-2.9l-3.7-3.7 2.3-2.3c.6-.6 1.6-.6 2.1 0l4.4 4.5c-.3.9-1.2 1.5-2.2 1.5zm2.5-2.6-4-4c-.9-.9-2.6-.9-3.5 0l-2.3 2.3c-.9-.5-2.2-.4-3 .4l-3.3 3.3c-.5-.5-.9-1.1-.9-1.9v-8c0-1.4 1.1-2.5 2.5-2.5h9.1c-.1.2-.1.3-.1.5 0 2.2 1.8 4 4 4 .5 0 1-.1 1.5-.3z"/></svg>')
      putSvg ('.organise-bar__button--rotate div', 'afterBegin', '<svg class="organise-bar__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.5 11.5c-.3 0-.5.2-.5.5 0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c1.5 0 3 .6 4.1 1.6l-.7.7c-.1.1-.1.2-.1.3 0 .3.2.5.5.5l2.4.2c.3 0 .5-.2.4-.4l-.2-2.4c0-.1-.1-.2-.2-.3-.2-.2-.5-.2-.7 0l-.8.8c-1.2-1.3-2.9-2-4.7-2-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7c0-.3-.2-.5-.5-.5z"/></svg>');
      putSvg ('.organise-bar__button--delete', 'afterBegin', '<svg class="organise-bar__button-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m17.5 6.5h-2.5v-.5c0-.8-.7-1.5-1.5-1.5h-3c-.8 0-1.5.7-1.5 1.5v.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5 6 2.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zm-7.5 0v-.5c0-.3.2-.5.5-.5h3c.3 0 .5.2.5.5v.5zm0 10.5c-.3 0-.5-.2-.5-.5v-6.5c0-.3.2-.5.5-.5s.5.2.5.5v6.5c0 .3-.2.5-.5.5zm2 0c-.3 0-.5-.2-.5-.5v-6.5c0-.3.2-.5.5-.5s.5.2.5.5v6.5c0 .3-.2.5-.5.5zm2 0c-.3 0-.5-.2-.5-.5v-6.5c0-.3.2-.5.5-.5s.5.2.5.5v6.5c0 .3-.2.5-.5.5zm3-8v7c0 1.9-1.6 3.5-3.5 3.5h-3c-1.9 0-3.5-1.6-3.5-3.5v-7c0-.3.2-.5.5-.5s.5.2.5.5v7c0 1.4 1.1 2.5 2.5 2.5h3c1.4 0 2.5-1.1 2.5-2.5v-7c0-.3.2-.5.5-.5s.5.2.5.5z"/></svg>');
      putSvg ('.fullscreen__close', 'afterBegin', '<svg class="fullscreen__close-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" > <path d="M11.5,18.8c0,0.4-0.3,0.8-0.7,0.8c0,0,0,0-0.1,0c-0.4,0-0.7-0.3-0.7-0.7l-0.3-3.6l-6.8,6.8c-0.1,0.1-0.3,0.2-0.5,0.2 s-0.4-0.1-0.5-0.2c-0.3-0.3-0.3-0.8,0-1.1l6.8-6.8L5,14c-0.4,0-0.7-0.4-0.7-0.8c0-0.4,0.4-0.7,0.8-0.7l4.4,0.3 c0.4,0,0.8,0.2,1.1,0.5c0.3,0.3,0.5,0.7,0.5,1.1L11.5,18.8z M22.6,1.1c-0.3-0.3-0.8-0.3-1.1,0l-6.8,6.8l-0.3-3.6 c0-0.4-0.4-0.7-0.8-0.7c-0.4,0-0.7,0.4-0.7,0.8l0.3,4.4c0,0.4,0.2,0.8,0.5,1.1c0.3,0.3,0.7,0.5,1.1,0.5l4.4,0.3c0,0,0,0,0.1,0 c0.4,0,0.7-0.3,0.7-0.7c0-0.4-0.3-0.8-0.7-0.8L15.8,9l6.8-6.8C22.9,1.8,22.9,1.4,22.6,1.1z"/>');
      putSvg ('.fullscreen__nav--left', 'afterBegin', '<svg class="fullscreen__nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 36"> <path d="M1,36c-0.2,0-0.4,0-0.5-0.2c-0.5-0.3-0.6-0.9-0.3-1.4L10.5,18L0.2,1.6C-0.1,1.1,0,0.5,0.5,0.2C0.9-0.1,1.6,0,1.8,0.5 l10.4,16.4c0.4,0.6,0.4,1.5,0,2.1L1.8,35.5C1.7,35.8,1.3,36,1,36z"/> </svg>');
      putSvg ('.fullscreen__nav--right', 'afterBegin', '<svg class="fullscreen__nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 36"> <path d="M1,36c-0.2,0-0.4,0-0.5-0.2c-0.5-0.3-0.6-0.9-0.3-1.4L10.5,18L0.2,1.6C-0.1,1.1,0,0.5,0.5,0.2C0.9-0.1,1.6,0,1.8,0.5 l10.4,16.4c0.4,0.6,0.4,1.5,0,2.1L1.8,35.5C1.7,35.8,1.3,36,1,36z"/> </svg>');
      putSvg ('.fullscreen__action-icon-container-rotate', 'afterBegin', '<svg class="fullscreen__action-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.5 11.5c-.3 0-.5.2-.5.5 0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c1.5 0 3 .6 4.1 1.6l-.7.7c-.1.1-.1.2-.1.3 0 .3.2.5.5.5l2.4.2c.3 0 .5-.2.4-.4l-.2-2.4c0-.1-.1-.2-.2-.3-.2-.2-.5-.2-.7 0l-.8.8c-1.2-1.3-2.9-2-4.7-2-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7c0-.3-.2-.5-.5-.5z"/></svg>');
      putSvg ('.upload-box__image', 'afterBegin', '<svg class="upload-box__image-icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7 12c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm7 0c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm5 2c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm3.5-5.7c-.6-.7-1.4-1.2-2.4-1.2l-12-1c-1.7-.2-3.2.9-3.6 2.6-1.1.3-1.9 1.1-2.3 2.1-1.3.5-2.2 1.9-2 3.3l.7 8.2c.1.9.5 1.8 1.2 2.4.6.5 1.4.8 2.2.8h.3l12-1c1-.1 1.8-.6 2.4-1.3.6-.3 1.1-.8 1.5-1.4 0 0 .1 0 .1-.1 1.1-.5 1.8-1.6 1.9-2.8l.7-8c.2-1-.1-1.9-.7-2.6zm-19.5 3.7c0-1.4 1.1-2.5 2.5-2.5h12c1.4 0 2.5 1.1 2.5 2.5v7.9l-4-4c-.9-.9-2.6-.9-3.5 0l-2.3 2.3c-.9-.5-2.2-.4-3 .4l-3.3 3.3c-.5-.5-.9-1.1-.9-1.9zm7 7.3 3.2 3.2h-7.7c-.2 0-.5 0-.7-.1l3.1-3.1c.6-.6 1.5-.6 2.1 0zm-5.4 5.2c-1.4.1-2.6-.9-2.7-2.3l-.7-8.2c-.1-.7.2-1.4.8-1.9v7.9c0 1.9 1.6 3.5 3.5 3.5h10.5zm12.9-2h-3.1c0-.1 0-.3-.1-.4l-3.3-3.3 2.3-2.3c.6-.6 1.6-.6 2.1 0l4.2 4.3c.1.1.2.1.3.1-.5 1-1.4 1.6-2.4 1.6zm4.1-3.8c0 .5-.3 1-.6 1.4 0-.1 0-.1 0-.2v-7.9c0-1.9-1.6-3.5-3.5-3.5h-11.9c.4-1 1.4-1.6 2.5-1.5l12 1c.7.1 1.3.4 1.7.9s.6 1.2.6 1.8z"/></svg>');
      putSvg ('.drag-and-drop', 'afterBegin', '<svg class="drag-and-drop__icon" enable-background="new 0 0 23 33" viewBox="0 0 23 33" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m21.6 20.4h-5.2v-19.4c0-.6-.4-1-1-1h-7.8c-.6 0-1 .4-1 1v19.4h-5.2c-.3 0-.5.1-.7.3-.4.4-.4 1 0 1.4l10.1 10.1c.4.4 1 .4 1.4 0l10.1-10.1c.2-.2.3-.4.3-.7 0-.5-.5-1-1-1z" fill-rule="evenodd"/></svg>');
      putSvg ('.organise-bar__button--download', 'afterBegin', '<svg style="height: 23px;" class="drag-and-drop__icon" enable-background="new 0 0 23 33" viewBox="0 0 23 33" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m21.6 20.4h-5.2v-19.4c0-.6-.4-1-1-1h-7.8c-.6 0-1 .4-1 1v19.4h-5.2c-.3 0-.5.1-.7.3-.4.4-.4 1 0 1.4l10.1 10.1c.4.4 1 .4 1.4 0l10.1-10.1c.2-.2.3-.4.3-.7 0-.5-.5-1-1-1z" fill-rule="evenodd"/></svg>');
      putSvg ('.upload-selection', 'afterBegin', '<svg class="upload-selection__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7 12c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm7 0c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm5 2c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm3.5-5.7c-.6-.7-1.4-1.2-2.4-1.2l-12-1c-1.7-.2-3.2.9-3.6 2.6-1.1.3-1.9 1.1-2.3 2.1-1.3.5-2.2 1.9-2 3.3l.7 8.2c.1.9.5 1.8 1.2 2.4.6.5 1.4.8 2.2.8h.3l12-1c1-.1 1.8-.6 2.4-1.3.6-.3 1.1-.8 1.5-1.4 0 0 .1 0 .1-.1 1.1-.5 1.8-1.6 1.9-2.8l.7-8c.2-1-.1-1.9-.7-2.6zm-19.5 3.7c0-1.4 1.1-2.5 2.5-2.5h12c1.4 0 2.5 1.1 2.5 2.5v7.9l-4-4c-.9-.9-2.6-.9-3.5 0l-2.3 2.3c-.9-.5-2.2-.4-3 .4l-3.3 3.3c-.5-.5-.9-1.1-.9-1.9zm7 7.3 3.2 3.2h-7.7c-.2 0-.5 0-.7-.1l3.1-3.1c.6-.6 1.5-.6 2.1 0zm-5.4 5.2c-1.4.1-2.6-.9-2.7-2.3l-.7-8.2c-.1-.7.2-1.4.8-1.9v7.9c0 1.9 1.6 3.5 3.5 3.5h10.5zm12.9-2h-3.1c0-.1 0-.3-.1-.4l-3.3-3.3 2.3-2.3c.6-.6 1.6-.6 2.1 0l4.2 4.3c.1.1.2.1.3.1-.5 1-1.4 1.6-2.4 1.6zm4.1-3.8c0 .5-.3 1-.6 1.4 0-.1 0-.1 0-.2v-7.9c0-1.9-1.6-3.5-3.5-3.5h-11.9c.4-1 1.4-1.6 2.5-1.5l12 1c.7.1 1.3.4 1.7.9s.6 1.2.6 1.8z"/></svg>');
      putSvg ('.search-form-svg', 'afterBegin', '<svg class="search-form__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path  d="m19.9 18-4.2-4.2s0 0-.1 0c1.7-2.5 1.4-5.9-.8-8.2-2.5-2.5-6.7-2.5-9.2 0s-2.5 6.7 0 9.2 6.7 2.5 9.2 0c.1-.1.2-.2.2-.2l4.1 4.1c.2.2.5.2.7 0s.2-.5.1-.7zm-5.8-3.9c-2.1 2.1-5.6 2.1-7.8 0s-2.1-5.6 0-7.8 5.6-2.1 7.8 0 2.1 5.6 0 7.8z"/></svg>');
      putSvg ('.upload-progress', 'afterBegin', '<svg class="upload-progress__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m7 12c-1.4 0-2.5-1.1-2.5-2.5s1.1-2.5 2.5-2.5 2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5zm0-4c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm7 0c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm5 2c0-.3-.2-.5-.5-.5h-2.5c-.3 0-.5.2-.5.5s.2.5.5.5h2.5c.3 0 .5-.2.5-.5zm3.5-5.7c-.6-.7-1.4-1.2-2.4-1.2l-12-1c-1.7-.2-3.2.9-3.6 2.6-1.1.3-1.9 1.1-2.3 2.1-1.3.5-2.2 1.9-2 3.3l.7 8.2c.1.9.5 1.8 1.2 2.4.6.5 1.4.8 2.2.8h.3l12-1c1-.1 1.8-.6 2.4-1.3.6-.3 1.1-.8 1.5-1.4 0 0 .1 0 .1-.1 1.1-.5 1.8-1.6 1.9-2.8l.7-8c.2-1-.1-1.9-.7-2.6zm-19.5 3.7c0-1.4 1.1-2.5 2.5-2.5h12c1.4 0 2.5 1.1 2.5 2.5v7.9l-4-4c-.9-.9-2.6-.9-3.5 0l-2.3 2.3c-.9-.5-2.2-.4-3 .4l-3.3 3.3c-.5-.5-.9-1.1-.9-1.9zm7 7.3 3.2 3.2h-7.7c-.2 0-.5 0-.7-.1l3.1-3.1c.6-.6 1.5-.6 2.1 0zm-5.4 5.2c-1.4.1-2.6-.9-2.7-2.3l-.7-8.2c-.1-.7.2-1.4.8-1.9v7.9c0 1.9 1.6 3.5 3.5 3.5h10.5zm12.9-2h-3.1c0-.1 0-.3-.1-.4l-3.3-3.3 2.3-2.3c.6-.6 1.6-.6 2.1 0l4.2 4.3c.1.1.2.1.3.1-.5 1-1.4 1.6-2.4 1.6zm4.1-3.8c0 .5-.3 1-.6 1.4 0-.1 0-.1 0-.2v-7.9c0-1.9-1.6-3.5-3.5-3.5h-11.9c.4-1 1.4-1.6 2.5-1.5l12 1c.7.1 1.3.4 1.7.9s.6 1.2.6 1.8z"/></svg>');
      putSvg ('.back-link__link', 'afterBegin', '<svg class="back-link__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m18.5 12c0 .3-.2.5-.5.5h-12.2l3.4 3.4c.2.2.2.5 0 .7-.1.1-.2.1-.4.1-.1 0-.3 0-.4-.1l-3.5-3.5c-.3-.3-.4-.7-.4-1.1s.2-.8.5-1.1l3.5-3.5c.2-.2.5-.2.7 0s.2.5 0 .7l-3.4 3.4h12.2c.3 0 .5.2.5.5z" /></svg>');
      putSvg ('.video-playback', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50px" height="50px" viewBox="0 0 512 512" style="position: absolute" enable-background="new 0 0 512 512" xml:space="preserve"><path fill="#5b6eff" d="M256,0C114.608,0,0,114.608,0,256s114.608,256,256,256s256-114.608,256-256S397.392,0,256,0z M256,496C123.664,496,16,388.336,16,256S123.664,16,256,16s240,107.664,240,240S388.336,496,256,496z"/><polygon style="fill:#5b6eff" points="189.776,141.328 189.776,370.992 388.672,256.16"/></svg>');
      putSvg ('.dropbox-logo', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 324 63.8" style="enable-background:new 0 0 324 63.8;" xml:space="preserve"> <style type="text/css"> .st0{fill:#0061FF;} .st1{display:none;} .st2{display:inline;} .st3{fill:none;} </style> <path class="st0" d="M37.6,12L18.8,24l18.8,12L18.8,48L0,35.9l18.8-12L0,12L18.8,0L37.6,12z M18.7,51.8l18.8-12l18.8,12l-18.8,12 L18.7,51.8z M37.6,35.9l18.8-12L37.6,12L56.3,0l18.8,12L56.3,24l18.8,12L56.3,48L37.6,35.9z"/> <path d="M89.8,12H105c9.7,0,17.7,5.6,17.7,18.4v2.7c0,12.9-7.5,18.7-17.4,18.7H89.8V12z M98.3,19.2v25.3h6.5c5.5,0,9.2-3.6,9.2-11.6 v-2.1c0-8-3.9-11.6-9.5-11.6H98.3z M127.2,19.6h6.8l1.1,7.5c1.3-5.1,4.6-7.8,10.6-7.8h2.1v8.6h-3.5c-6.9,0-8.6,2.4-8.6,9.2v14.8 h-8.4V19.6H127.2z M149.5,36.4v-0.9c0-10.8,6.9-16.7,16.3-16.7c9.6,0,16.3,5.9,16.3,16.7v0.9c0,10.6-6.5,16.3-16.3,16.3 C155.4,52.6,149.5,47,149.5,36.4z M173.5,36.3v-0.8c0-6-3-9.6-7.8-9.6c-4.7,0-7.8,3.3-7.8,9.6v0.8c0,5.8,3,9.1,7.8,9.1 C170.5,45.3,173.5,42.1,173.5,36.3z M186.5,19.6h7l0.8,6.1c1.7-4.1,5.3-6.9,10.6-6.9c8.2,0,13.6,5.9,13.6,16.8v0.9 c0,10.6-6,16.2-13.6,16.2c-5.1,0-8.6-2.3-10.3-6V63h-8.2L186.5,19.6L186.5,19.6z M210,36.3v-0.7c0-6.4-3.3-9.6-7.7-9.6 c-4.7,0-7.8,3.6-7.8,9.6v0.6c0,5.7,3,9.3,7.7,9.3C207,45.4,210,42.3,210,36.3z M230.9,45.9l-0.7,5.9H223v-43h8.2v16.5 c1.8-4.2,5.4-6.5,10.5-6.5c7.7,0.1,13.4,5.4,13.4,16.1v1c0,10.7-5.4,16.8-13.6,16.8C236.1,52.6,232.6,50.1,230.9,45.9z M246.5,35.9 v-0.8c0-5.9-3.2-9.2-7.7-9.2c-4.6,0-7.8,3.7-7.8,9.3v0.7c0,6,3.1,9.5,7.7,9.5C243.6,45.4,246.5,42.3,246.5,35.9z M258.7,36.4v-0.9 c0-10.8,6.9-16.7,16.3-16.7c9.6,0,16.3,5.9,16.3,16.7v0.9c0,10.6-6.6,16.3-16.3,16.3C264.6,52.6,258.7,47,258.7,36.4z M282.8,36.3 v-0.8c0-6-3-9.6-7.8-9.6c-4.7,0-7.8,3.3-7.8,9.6v0.8c0,5.8,3,9.1,7.8,9.1C279.8,45.3,282.8,42.1,282.8,36.3z M302.3,35.1L291,19.6 h9.7l6.5,9.7l6.6-9.7h9.6L311.9,35L324,51.8h-9.5l-7.4-10.7l-7.2,10.7H290L302.3,35.1z"/> <g id="Editble" class="st1"> <g class="st2"> <rect x="-105" y="5" class="st3" width="506" height="71.8"/> <path d="M0.2,13.6h16.3c10.4,0,19,6.1,19,19.8v2.9c0,13.8-8,20-18.7,20H0.2V13.6z M9.4,21.3v27.2h7c5.9,0,9.9-3.9,9.9-12.5v-2.2 c0-8.6-4.1-12.5-10.2-12.5H9.4z M40.4,21.8h7.3l1.1,8c1.4-5.5,4.9-8.3,11.3-8.3h2.2v9.2h-3.7c-7.4,0-9.2,2.6-9.2,9.9v15.8h-9 C40.4,56.4,40.4,21.8,40.4,21.8z M64.3,39.8v-1c0-11.6,7.4-17.9,17.5-17.9c10.3,0,17.5,6.4,17.5,17.9v1c0,11.4-7,17.5-17.5,17.5 C70.6,57.3,64.3,51.2,64.3,39.8z M90.1,39.7v-0.8c0-6.5-3.2-10.3-8.3-10.3c-5,0-8.4,3.5-8.4,10.3v0.8c0,6.2,3.2,9.7,8.3,9.7 C86.9,49.4,90.1,46,90.1,39.7z M104,21.8h7.6l0.9,6.6c1.9-4.4,5.7-7.4,11.4-7.4c8.8,0,14.6,6.4,14.6,18v1 c0,11.4-6.4,17.3-14.6,17.3c-5.5,0-9.2-2.5-11-6.5v17.5H104V21.8z M129.3,39.8V39c0-6.9-3.5-10.3-8.3-10.3c-5,0-8.4,3.8-8.4,10.3 v0.7c0,6.1,3.2,10,8.2,10C126,49.5,129.3,46.1,129.3,39.8z M151.7,50.1l-0.7,6.3h-7.8V10.2h8.8V28c1.9-4.5,5.8-7,11.2-7 c8.2,0.1,14.3,5.8,14.3,17.3v1c0,11.5-5.8,18-14.6,18C157.3,57.3,153.5,54.5,151.7,50.1z M168.5,39.3v-0.8c0-6.4-3.5-9.8-8.3-9.8 c-5,0-8.4,4-8.4,10v0.7c0,6.5,3.3,10.2,8.3,10.2C165.3,49.5,168.5,46.1,168.5,39.3z M181.6,39.8v-1c0-11.6,7.4-17.9,17.5-17.9 c10.3,0,17.5,6.4,17.5,17.9v1c0,11.4-7.1,17.5-17.5,17.5C187.9,57.3,181.6,51.2,181.6,39.8z M207.4,39.7v-0.8 c0-6.5-3.2-10.3-8.3-10.3c-5,0-8.4,3.5-8.4,10.3v0.8c0,6.2,3.2,9.7,8.3,9.7C204.2,49.4,207.4,46,207.4,39.7z M228.3,38.4 l-12.1-16.7h10.4l7,10.4l7.1-10.4H251l-12.3,16.6l13,18h-10.2l-8-11.5l-7.7,11.5h-10.6L228.3,38.4z"/> </g> </g> </svg>');
      putSvg ('.geotag--open-pictures', 'afterBegin', '<svg class="fullscreen__action-icon" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><g transform="translate(0,-952.36218)"><path style="text-indent:0;text-transform:none;direction:ltr;block-progression:tb;baseline-shift:baseline;color:#000000;enable-background:accumulate;" d="m 50,963.37594 c -15.9926,0 -29,13.0074 -29,29 0,5.6716 1.3987,9.74026 4.3438,14.09376 l 23,34 a 2.0002,2.0002 0 0 0 3.3124,0 l 23,-34 C 77.6013,1002.1161 79,998.04754 79,992.37594 c 0,-15.9926 -13.0074,-29 -29,-29 z m 0,4 c 13.8308,0 25,11.1692 25,25 0,5.077 -0.998,7.94526 -3.6562,11.87496 L 50,1035.8134 28.6562,1004.2509 C 25.9981,1000.3213 25,997.45294 25,992.37594 c 0,-13.8308 11.1692,-25 25,-25 z m 0,10 c -7.7083,0 -14,6.2917 -14,14 0,7.7082 6.2917,13.99996 14,13.99996 7.7083,0 14,-6.29176 14,-13.99996 0,-7.7083 -6.2917,-14 -14,-14 z m 0,4 c 5.5465,0 10,4.4535 10,10 0,5.5464 -4.4535,9.99996 -10,9.99996 -5.5465,0 -10,-4.45356 -10,-9.99996 0,-5.5465 4.4535,-10 10,-10 z" fill="#ffffff" fill-opacity="1" marker="none" visibility="visible" display="inline" overflow="visible"/></g></svg>');
      putSvg ('.tag-list__item--geo-city', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" width="16" height="16" style="margin-right: 3px;stroke: black;margin-left: -2px;" xml:space="preserve"><path d="M56.4,5.8C53.6,5,48.9,4.8,46,5.3C28.6,8.5,17.2,26.2,24,42.2c7.7,18,17.4,35.2,26,52.8  c8.6-17.6,18.3-34.7,26-52.7C82.5,27,72.5,10.3,56.4,5.8z M50,49.2c-8.4,0-15.2-6.9-15.2-15.4S41.6,18.5,50,18.5s15.2,6.9,15.2,15.4  S58.4,49.2,50,49.2z"/></svg>');
      putSvg ('.tag-list__item--geo-country', 'afterBegin', '<svg width="16" height="16" style="margin-right: 3px;stroke: black;margin-left: -2px;stroke-width: 1.5;" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><g transform="translate(0,-952.36218)"><path style="text-indent:0;text-transform:none;direction:ltr;block-progression:tb;baseline-shift:baseline;color:#000000;enable-background:accumulate;" d="m 50,963.37594 c -15.9926,0 -29,13.0074 -29,29 0,5.6716 1.3987,9.74026 4.3438,14.09376 l 23,34 a 2.0002,2.0002 0 0 0 3.3124,0 l 23,-34 C 77.6013,1002.1161 79,998.04754 79,992.37594 c 0,-15.9926 -13.0074,-29 -29,-29 z m 0,4 c 13.8308,0 25,11.1692 25,25 0,5.077 -0.998,7.94526 -3.6562,11.87496 L 50,1035.8134 28.6562,1004.2509 C 25.9981,1000.3213 25,997.45294 25,992.37594 c 0,-13.8308 11.1692,-25 25,-25 z m 0,10 c -7.7083,0 -14,6.2917 -14,14 0,7.7082 6.2917,13.99996 14,13.99996 7.7083,0 14,-6.29176 14,-13.99996 0,-7.7083 -6.2917,-14 -14,-14 z m 0,4 c 5.5465,0 10,4.4535 10,10 0,5.5464 -4.4535,9.99996 -10,9.99996 -5.5465,0 -10,-4.45356 -10,-9.99996 0,-5.5465 4.4535,-10 10,-10 z" fill="#000000" fill-opacity="1" marker="none" visibility="visible" display="inline" overflow="visible"/></g></svg>');
      putSvg ('.space-alert-icon, .space-alert-icon-small', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 100 100" x="0px" y="0px"><title>A</title><path d="M58.31932,14.55819a9.60634,9.60634,0,0,0-16.63864,0L6.30209,75.836A9.606,9.606,0,0,0,14.62141,90.245H85.37859A9.606,9.606,0,0,0,93.69791,75.836Zm30.18292,67.884a3.54274,3.54274,0,0,1-3.12365,1.8035H14.62141a3.60675,3.60675,0,0,1-3.12365-5.41L46.87635,17.55783a3.60682,3.60682,0,0,1,6.2473,0L88.50224,78.83567A3.54271,3.54271,0,0,1,88.50224,82.44217Z"/><path d="M50,63.88433a2.99979,2.99979,0,0,0,2.99964-2.99964V34.42886a2.99964,2.99964,0,0,0-5.99928,0V60.88469A2.99979,2.99979,0,0,0,50,63.88433Z"/><path d="M50,69.917a3.1747,3.1747,0,1,0,3.17473,3.17467A3.17465,3.17465,0,0,0,50,69.917Z"/></svg>');
      putSvg ('.google-drive-icon, .google-drive-icon-small', 'afterBegin', '<svg version="1.1" viewBox="0.0 0.0 1024.0 1024.0" fill="none" stroke="none" stroke-linecap="square" stroke-miterlimit="10" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"><clipPath id="p.0"><path d="m0 0l1024.0 0l0 1024.0l-1024.0 0l0 -1024.0z" clip-rule="nonzero"/></clipPath><g clip-path="url(#p.0)"><path fill="#000000" fill-opacity="0.0" d="m0 0l1024.0 0l0 1024.0l-1024.0 0z" fill-rule="evenodd"/><path fill="#000000" fill-opacity="0.0" d="m0 0l1024.0 0l0 1024.0l-1024.0 0z" fill-rule="evenodd"/><g transform=""><clipPath id="p.1"><path d="m0 0l1024.0 0l0 1024.0l-1024.0 0z" clip-rule="evenodd"/></clipPath><image clip-path="url(#p.1)" fill="#000" width="1024.0" height="1024.0" x="0.0" y="0.0" preserveAspectRatio="none" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAYAAAB/HSuDAACAAElEQVR42uy9eZgc1X33mxtncbabN8nNfe4f9943SLNJtmPHSxY7TuzkTWykWbWxCCTNTM9IgNHGbie2bJAE2BYgIUD7NmIZMLukEQiDAIMxGMlgGVnC2A5J3jh54+vES8ymulPVXd1Vp05VnXPqVHXP9OfzPOfRdE/PjPO+cbp/3/P9fb+/8AsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGDOFc/s+r1Xnl+5wHn50wudl1ctKh/3a5vn7xeUj+7PpP28/7zq9yfo+XblqD4f9zrxvCx5nPR68Zz81Lne0X2d6uNJcz55TvnY/nn/edXvG57jl5VP3PNx35e9phHPq+t+l3cCAAAAAJj0OI7zv8196JoHdx8a+unrT5/hnDq21HFOXBI9JyvnRB7n4sCRPWfyvO65qHLiHqu+Pu3ovn6in5WVk/b9tKP7+gl2vr2ifMTHps9rn+WVE/dY9trlMc8lHd3XF3ROrLjf/b+FvCMAAAAAwKRm0aPXfWTW/tXOrPs+57zy+OzXf/5Et/PGs+eOfyheKR/4RSHAWBgQB3jd16U9rzvw674u7flmH/hVB/c0oaBJBn7d16U9rz3w674u7fkGH/hl55UrPsw7AgAAAABMWhzH+cVZ+9e83LdvtdN331XOF/Zf4LgCQPn0OG8eHcj55j9poG9UR4CqU2AyCwErLToCVnKSHAAN5whIcgosn9hCwIkVJ3EBAAAAAMCkZc7Ba873hv/xM+uBK51Zd1/pPPLIWePDf1f1vPb0LOetF8/PcPOve4Ov+3MX1/nYGqonukCgeoNvyykwwYZ7XQeA6s1/5kHfllCQ9TSIOPDSRcO8MwAAAADApGPdU6O/Nnvf2p9VBYB9V3kCwLL7LnZ+VHUBdFeFgNefOdNxji0Z/4B8nuWzpHLSHotH9fVpv0c431pcPnHPi99Pe73qz0/YM1w5ac+bvm54kp+hykl7LB7V16f9HvGUKifuefH7aa9X/fnKOVY5Sc8f03x98HHw+eNLowLAyeU/db674+28QwAAAADApGLe2DVXe4P//vLxhIC7Pud8cNdKZ8/Y2SEXQPl0O68/3eM435hVPi/MLh//sfXTVzlpz/dxQqe3ctK+n9fpqZy074uvi3ts+RztDh/x+ayvmzSnq3LSnjd9nNfprJy074+fb54tdwGcXLGadwgAAAAAmDQMP7JpavXmvyIA9O67yum669POtE1Dzge2DzqvPtZbHfyDToBTR/rkA7uyIKA72KsO/s0mCIiDtemgbyoMZB30VQd+Q0FAHNR1nk8a/ONO0wkC4mBdxIDfKR/kpQN/p8IZf91Ln5CLAN/7u9N4pwAAAACACY8bcjVnbPVDvgDgHnf47xs/fzyy3Jm2eciZtmnYuf7++REHgOcCeKq7Djf9OoP/ZBEC0m7y015v6gTISxBQEQiyCAUZHQG6ToFJN9yrOgCKEgjSbvLTXq/oBHjxjLhMggMEAgIAAADAhOecx77wN2Hrf3n4/+t7Pum07xz2hn/3dGwacp7+8pyIA8A9bz7bm3EFIIsDoNlXAFQH/eDzvRYdA70p1n1VS3+aIGB5sI8b6NNen/Tzk/a2P8tArzvoZxUG0hwAXfG3//5xswhkIsDLl/8V7xgAAAAAMGHxav8OrP1u8ObfP+++danTvnuxN/i7x3UCfOLOhc5/SbIAXnuy2zllvAJgSyBAKEgWBHRv9PtyyADIIwsgRTCIG/BNVwRUnQCTXhDo1swEKGo1oFNxNSBhFeAbs+NqAV/BBQAAAAAAE5Yzxq5dVrP+l2/+3eH/w3dd6rTtWeydoADgnvsOnSkJBOxy3nimx5LlP25gJ/RP/Ybf1DGQZ9hf2kCf0+5/1pv9ptnpzxIGKA74Kjf7pkKAyg2/qWMgIAIcWxizCnDJBbxzAAAAAMCEY9Vzm3599v41PxMFgJ4Hr3SmjZzntI8s8c60bcPe4N+xqeSdj+3pd/7X4Z7AKkBtJUAaCGjNCWAqDCAUmO36Z20JSBIEepy6p//7w3zWtoCmEQ7iBnpbaf82nAE6qwBpzoAeeS3giRU/c15d92u8gwAAAADAhGL2/quvF2/+3fPHoxeXb/9HyqdjW234d4/bCrB5/3ypCyBUC6hs5Y8b8lWt/mI4YLMN/roDfNZBv89w8NdtCSioBUB3QG/adH/T1+e9ApCWAZA26CcIAy+eFRcI+AXeQQAAAABgwjD0zOY22d7/jPs/Ux3+2/cu8U7H9poDYFrlvHvzoPPK4VnSVoC3nuvNmPZvujKgOvA3oxvA5s2+LUeAqgNAdeDvNRMEVDMCsq4QNK1gUI96QJNsgJjz0vlxgYAtvJMAAAAAQMPjhljNPrD6y+Lw77oA3n/HitrtfyUDoH3XcOD2v+RM3zTkTL9lyLnq/nOkLoDXjGoBbab9c/OvHvJXhDAgG+izWP41HQCqN/+qA3zTZQWIu/22LP95p/+nDfeKPxdfC3iIQEAAAAAAaHgWHVr3cdnt/1/f86nywD9SvvmvCgBuDsCW4ert/7RbaufRR+ZKRYA3v9abowPAZDVg1iQUBmyFAaZZ/HWFAdthgAXVAmatESQMUDEroDunG33TMECZMCA8/lZJLgK8cvnf8o4CAAAAAA3L6Ojo22YdWPMPQQGgnAGw2vnDWz/hDfvB2/9qE8CuYWH4H3Smj/+76LZFzk8kAoB77If9ZX1+sg78Sd/v1cgEKGo1oM5ZAGnhf2QBGGQBZLnJV3192mAv+36nRiZAgjDg/t8TmQBwcsX3HWf0bbyzAAAAAEBDMu/g1RfLbv+92r+RWvBfaPgfWeKdaVvK1n9fAPD+vbnk3HHwrGoLQDALID0QMC38T+XmPy0ssI+Tav3XXRUwHfhN6/5MBQLD9P40h4Dq6yfNjb7uzb+qI6Do3X/DDAD/9XG1gCdXLuedBQAAAAAajou/sfs3Zh9Y83r45v8qp7tS+ycb/r0VAP/sHI4M/+6/H94+4Pzg8R6pC+DU830WXAA62QDNmAmQttNvWguoO+TnFQ5Y8Jm0A35ejoAkp0ARYYCdmvV/qqsA4hn/z3r8QlkWwOvOP6/6dd5hAAAAAKChmHfgmo2y2/8PjK5MvPkvCwDD3pm2tSYATL+55ghY98DZ8lpAaSBg2m6+6c4/t/5mN/+2nAK6dYC6rQCa30+7wdd9HmFAUyjIeroLuvnXeD6uFvDExTfwDgMAAAAADUPp6Y3T/OHfv/mX1v6NLIne/FcEgA4vC2CxM21T2AHgiQG3DDrHH50lDwR8ttfSQK+b/j9ZMgJUbvRNHAAqrQB5DP5ZX5dzCCADviVrf1YHgc6NvokDQKUVQKMW8JVL23mnAQAAAIC649X+7V/7pOz2/323L4vU/kUFgPLtf/tu9yx2OrYPh4b/shgw6Fx61wJ5LeBXuh07bQA4APIND2yU0D/ZzzWg5b/pBALdwT6vukBbbQG6KwCV80JMLeCJlY9RCwgAAAAAdefcR9Z11W7/awLAX919RW3gH4kb/oMCwOLqmbZ5KDT8+2fs0DypCPDGV3sNrP+qN/vN1gYgDu+20/1NhQGTQb/HvvU/j5UAk/T/CSUIdBWQCZDXcJ8h3T8p9C/pNccGJSLAMsd5+aLTeccBAAAAgLox6oy+bc7Ymn+SCQDvvPUCpdt/z/ofGP49F4AfCBgY/t0za/ci50ePd0ddAG4g4FHdAEBb9YCTRQhIu8k3DQdMG/jzEgRU0/11BYScVwMm/Y2/bsp/UQJB2k2+aThg2sAv+b773wepC2D5P1ILCAAAAAB1Y97Ba64IDv++APDnd10Sf/tfDf8bjtj/a2fY6dgsCgAlZ/pNg86uA2fFuAC6U2r6smYBNNuNf5/CDr+OA8DUMZB1t99S3Z/uYK9aD6jz87QAWBj0swoDqpkBGR0DxxaEb//9r49fdCnvPAAAAABQOJcev++3Zu1f+2ZftfKvPPx3P/i5cu1fjADQFrP77x3/e+5zO4dCw39ZACg579804Lz6eG9g+O+snC7nra/35rDj38yCQJ+FsL+iMgBkg36PhSwAwzaArKGACAKWw/7y2vk3sPhnqQU8seJN518+/xu8AwEAAABAocw7sHaL7Pb//XesGB/yl1RO0v6/XABo2zXknfZdbi1gQATYWKqcQeeL9yTVAtpK+SfUL/15kzYA1aHe1PJvmvJvyRlgGuLXVC0AXRmdAF0aLQG2Qv1kz5u0AaicmZVawDMFF0DFCfDyRTfzDgQAAAAAhTH4lZvfKQ7/7jndr/3bsyRy6y+9/Zc5AHZXntvlugDcLIDx4f+m8u2/O/x756ZB58kvz0mpBVRN/0+74Uc40Nv5V931z+oU0LX251z7Z+oM0F0ZmLROgLiB3lbaf1ZngO4qgEoNoIJAEFcL+P0rpvNOBAAAAAC541ZRzTqw+umoAHCV80e3Lw0LACMyEWDYads9FLP/Hxj+K6dj25BUADjvjgXOz0LDf3kV4LUnu5xTSgO+bJDvM3j9ZNz91xn88x70ew0zAEx3/i23AOje7Ddd3V+XoSPA5gpAZ4bB39KgH1sLOC+cAeA7AU6seIpaQAAAAADInbMf/sIs2e3/R+8J1P7tWeK0jg/3rSPDevv/MgFg/EzfVPKGfn/497++56EzpVkAbzzTo3Cjr5oVwIqAnWyAorIAdHb+LYcC6oQAqggJrAgUJAAUkQ2Q4RwbkLsATl7azTsSAAAAAOTGqkdX/dKcg2v+Rbz5d887b7sgJAAYBQAGBIC2nUPe6XDP9qGwAFBxAnxsR7/zb14tYGdkFeDUkT7DAR7Lv9nNv20ngMrOv47Fv6D0f92QP10HwKQTAXR3+U0H/G7Llv+0wd2GMDAzuRbw5Mr/6Yz/32TemQAAAAAgF+Yd/Pxngqn//vmQW/snDPuiA6BdIQBQdAB0+AKAmwWwpbwC0FE5vghw876zUgIBxdt93Zv/yWj5tx0G2Jeh5i8PYaA3P2EgS+q/qlDQFLf8WVsAVL9v60Y/7XnNmj9dYeCb50bDAL1AwJWf4p0JAAAAAKxz2cObfnvWvjVvitb/7n2fczr2xof+xaX/V9P+Jen/YQFg2DvtO4ZCg/+0jQPOtBsHnT+8edD5TkwtYC0QcJbBzX2zWf57DbMAVJ/PO/SPLIDJmQWQ1eKv+vpOwywA1eezrga4tYCfkNcCHr/0t3iHAgAAAACrzDmwdqd48++e99+x3Lvp92789wwniADD3gnf/g8n7//7AkAlC6BjSykiAHSMn89+aX5o8PeFgNe+0qUw2Ku2ATSLMKB785/1Rt/W7r9p3V/GHADd9P40oUD19ZPmRl/35t+2QJA1LNDwRj/0esXXvniGZBXADQRcuY13KAAAAACwxjlPrH+3uPPv1f498Jmy9X9ksbYDQBQA4hwA7s1/e8AJ0HGTuwIwUBUAvLNx0PnyobnSVYA3nullwDce/FV2+k1rAbPc/PdYDAcs+EzaAT8vR4Dt500HfNPVgKwhgDNrWQBeLeB58jyAV//+XbxTAQAAAEBm3Kqp2QfXPier/XuPW/snCADxTgAFB8CuBAeAvwawtXz772UBVAQA9+tz9ix0flwNBOwMOQJOHdW58Sf1X08wMN3xt7kS0GPgCNB1Ciha/U2fb4oVgK4cQgPrdVRv8m05BfxawLnyLICTK56lFhAAAAAAMnPWw5+f17c/mvr/0XuvqA3/I9HBX3zsOwDadg95xxcA2tzEf4n9v82//Q84ANyv27aPP755sHb7750B79w2Jq8FfP3pHmr+jC3/pg6AvML+smYBFNQSoCoEcPNvaO235SDoNLT228oIUGgBEJ871h+zCnDRLN6xAAAAAMCYTc8998uzDqz+t7AAsNrp3XeV8w639s8d/EfCaf/i8YUApRWAnUOpDgDvbB3yBv/pN/ougIHxrwecD2/ud/7lcK+wBlAWAk49rzv4s/sf/p5qPWBfwVkAuqF/OawC6IT+qQ7+TScQ6A723Zr1gXk7AbK2AWgc979Xx5dFnQAnVvyb4zxKLSAAAAAAmHHGwWuu6tu/xvFOdff/KufPvnSx07Z3sdQBEOcEiLYAlI9cAFhcHfZ9AcC//ffPtE0lTwAoCwEDzrQN5fP5++ZL1gA6ndergYC2rP/NJgjYsvCb/twESfcXBYG8rP8TRhDo0rD+d1m40c9rsE9K9++0X/uXlgXwzXOiDgD3nFy5incuAAAAANBm+ZEd/63vwNpT3u3/fqH279YlTuveys1/zApAXAhgbQVgce1IBIBq6J/MAeCKAduGqgGAQQHgHePnpUf7JIGAnc6bz/UKA7yOA6DZawBVBQLbIYC64X66AkFB4YBZ2wKa7qY/LTvAtkCQdpNvGg6YNvCbCgJdklpAdw1g+SnnO1f/Nu9gAAAAAKDF3INX760O/wEB4P2jy73hP+IAGJHf/Mc7ACqp/ykOgKATIOgCaN8+7LkAfPu/LwBM3zDoXHLHudIwwJ8/2UW4n/Ubf1uhgFkHfdXQv5wGflVLf5xjIO7xpN//z6sFIO50Z7zxN037N10NEG7+g49DtYDBUMCL9/AOBgAAAADKnPvQhvfXhv811ePW/nk3/74AsLeWARAWAJaU/x1RawGIhgAKKwA7h6UCQMf4vx03lQMAgwLA9PUDzv6H5tYG/0AWwBtf7UnY8acNIH6XP+/VAN3bf9Ud/5yzANJWA3RXBJrGCWA7E6DRVgM6izleLeAySSvA5X/EOxkAAAAApOLV/o1dfaQ2/NdcAO++/cLq8F8VAgIugNrN/+KqACA6APwVANEB4AsArgugzQv/K5+Q7X+78LUrAGwpeQ6A6RvKZ9qGQWfa+gGnd/si50ehWsCaEOAcYdA3bwWQPe7VEAhsp//bSvk3rP2zlfLfNJb/tEyALDf7NkIAdVP+dQUC3Rv/lOdfmCPPAjix4nlqAQEAAAAglbMe+cJZ4s2/e/7ynivCN/8pAoD370i0BjCtBUAUAMTbf1EAcM+0W6ICgHu27ztLKgC8/nQ3A79y7Z9u+r/t8D9TocDUGZBzDaBORkBTOQDiBnpVIUFXILB182+665/VJRAQBI4NSFYB3LPyDN7RAAAAACCWVcdGf2XO2Nofijf/vfsrtX/Bwd9wBcA7AQeA1wYQWQGo1QB6A//OodgVAO/rraXICoArALx/44Dz/WotYDgT4K2v95LurxT+16t5w2/LCWB6o6+6KlCnloBJk+5fb0eALau/anhf1qwAC4N+nBPA/d+X40vDKwBeLeDKHzrPbfpl3tkAAAAAQMrch69d23dA3P1f7fzpXZeMD/tLpAKAPARwSdUBILYDVF0AggNAXAFQFQC8NQD33DIYEQDcc/XdZ0trAV9TrgVs9t3/rAJAUUdFGOgpLgsgbbDXFQiazglgKgDknQFgmg2Q83lxviAAVFwALy+/inc2AAAAAIiw4Jldv+cN/wfWhHb/Ox/8nDf8t1aGf3EFQHQA1DIAloTaAEJOAIkDoJoJsKsmBFT3/3fGZwBUVwG2DjnTNtZWAKZXjvv1E4/MjoQBerWAz/Yw7Gvf4JsO+LbT/3Ut/gWl/+sKA00f+qe7y1/UgJ/1Rj+rMBCXBSB+3z9+LeCyqBDw/bW/wzscAAAAAISYffCa0bIAsDpk/3+fV/u3OOIAiMsAqDkAysN/OBtgWJIDsLjcBBAjAHgZALuiLQDBDADPAbBtyJm2eTDiAHDP8Mg5zs8kWQCvPdmJA8A4DFB1dcBW2r9pGKDlLABbYYBNt+NvuwVA9fu2VwPSVgZ0B/0uSyGBCbWAJy+6nXc4AAAAAKgy/+H1f9rrD/9VEWCN83Gv9m9x4CQ7AIKp/9Wb/5AwEHAA7A44AIIugJgVgFQHwLbymbZxMDT8u2LAO8bP3QfPlGYBvP7Vbgb81CyALDf5qq9PG+xV2wGSMgFyDP0jC8CS1d+2xV/19aZZAKrP284CiHn+pSUBB0DQCXD5B3inAwAAAACv9m/Wwau/6QoAIRHAq/1bWrn5X1IVAdqEExEB9oRv/MOrATUHgC8CiDkAwSaAoAMgWAfoHS8DYDgiAHi1gIIDYPr6fudvtvQ7/xqqBaw5Ak4938w3+qY1gI2SAZB1pz+jMKA7uOtmAYjPTVhhIC3sT/XmX8URUOTNv6oQkNcRVgGqtYDLwufkyheoBQQAAACAX5gzdu0Cf/gPCgB/cc/lwu1/zQUQWgHYGwgBHBkWbvvFcMDF4SaAgADgOwCCYYDBDAB/DSBuBSDkArhpMJQBMG19vzP9hgFnw/3yQMDXn+rG8m+U7l9EGGCadd+0FrBOR0UQaCqbf16OAF2ngGzAV9npN60FtNgCIJ5j/fJVgO9cOp93PAAAAIAmZtXoql+ZNbb2R6IA0HvAr/0L3vwvCYUBho40CHBYmgHgCwB+DoAsCDCyArBDLgBExICKANC+pVILKAgA7xz/+uThvkgWQDkQsBcHgJZDIOvpK+jm35ZTQNHqr+oI0HUKTNqd/jhBIE0oqPfR2fHPwykQFAIEgUBaCzj+9YnlP3IcagEBAAAAmpa+A2u+2LvfH/7XeMcVAP7kSxfH3P5HswDiHAB+G4DYAtAaIwCUwwDDOQCRJoDgwF9ZAxAFADcMsGPr+Ll5MCQAvOOGAe/8/Z3zU2oB2f1X2+U3cRCY7vb3WMwCSHpsYfDP+rqmr/nrVtzlj3u9jZv/Lo1U/6wZARl3/uOef/FsQQConBMrruWdDwAAAKAJ6d+//vd791/llM9qxxcCOvd9zmm7dYnTeuvi8pE6ABZHHAB+E4Bo+RdzANr2lPf9IysAQhCg3wYQcgDsiHcAdFQdAKWyELB1yJl+42DIAeCd6wecQ4fmSkWAN57pYQVAe7BPWxEoKgNAtw2gTqF/WeoBmzr1P22wz+oQ0E33T1sdKCoLIE4QEGsBA6sAL13xe7wDAgAAADQRbhhU34HV98oEgPfduaI2/N8a7wJIagMQ1wCkAoCsDWC3Xw1YCwNsF5oAQm0AEgdA9bgugE2lmgCwfqAqApy9fYHz48e7pCLAqSPNZP3v1XAGFB32l1e6v6EwYGPQx/pvkAFga8c/qyBgy8LfZXnQjwkD9AIBz5QLACdW3k0gIAAAAEATMf/L132oNvzXBIC/vv/vnZbg8H9r8hpAqBZwRK8NwBcAvFWA3cORHICqAyBGAKgN/sPVMMBQG8DWyqnUAgYFANcFsHf/GVEB4PGZzutPd3PTH/t8ngJB2k2+aThg2sCfkyCgKhCYZgRM+pt+1cE/zxDArE6ArgJv/mMEgm8NxbQCXPqnvBMCAAAANAGO4/xi39ja4zIB4F13LNUWAKQOgIQwQGkbQDAIUJID0ObXAe4cDuUAhISAbYILYGvlVFwA0ytrAF4WwPUDzgdvWuT882PdchfA85Nx6NfNAlAd6Psshf/JBvgegxaAtEHfYODPstuvOvA33ZksN/62QgGztgDEvO6F2XFZAC/hAgAAAABoAmYduGYwPPyXz4fvucwb/kUBwM0DCO/+J68AiFkAcQ6AdiELwBMAqmdIyAJYXAsD3B4IBtwhqQSsBAFWBYAtbi2gsAZw/fjj6/uda+6JqQVsmkDAPDIBGmU1oOBaP1EosFX/17SCgWkmwERdDdC9/Y+z/ksEgWOL5KsAL69cxDsiAAAAwCRm1aM73j5rbM1PxOG/e9+VTset5zkt4wP91L2LzV0AohAgrgCMDEfqANPCAMtnODT0i2sAQQEg4gLYUhEBNkTXAFwR4NijfZE1APe8+VzvJE/9zxr6l1cIoG7Kv65AoHnjr2v5Nw37axrLf/BxltA/2eCfx4Bvavk3FQJ00/9VnADdlVpAYRXgxPIfO876X+WdEQAAAGCSMu/g1VfKbv//+K6Lxof/YU8AkLkAVOoAk8MAF0cyAUKrAME1gKALoOIASBIB/DDAWAGgIgK4tYDThTYAVwBYdts5UhfAz5/sbNIb/15LKwN5pfmbrgJYFAhUVgFspf833Y2/7s2/rRt/MaTP9s6/bWdAmlAgnG/OFwSAyirAyZWreGcEAAAAmIScve8L/90d9nsqxx/+T39wldMysthYAEjMAggIAJFmACEM0BcAXBdA2Qkg5ADouAC2SVwAW0vO9I3jQ/8Ni7zB3xcAOq5f5Dx4cI68FvCrPZMk7b9P8cbe5PWmw76twT/nQd80A8B053/SCwNpg3zW8D9b4X2qr08b9LMO/mkZAAorAP556XzJKsD4eflT/w/vkAAAAACTCDfsadbY2gdlt//vG11eGf6HQyJAa14iQEwbQFIOgO8E6BAaAdqSAgG9UwoIAG4t4GA5C6DiAnAFgGk39Dtd2851/r/DXZMsEDBNENBdGVAd+PPOADDNBigwC0B153/ShwJ2FRAOWEQGQGeDZQDoCAWB5184I6YWcMX9BAICAAAATCLOeujav5QN/39136eE4b8mAEyt5AHkLQBEXQBDkUrAqgiwIyAAKIsAwSyAkhcIGAwDdB0A7tn6wBnSLICJXwuou6OfNsDbHvBNd/5VUv8zhAPq3uhnzQBICwOcNEJA1hA/2wO+6c6/7oBuO/1f9eZfePytktwF8MoVH+adEgAAAGASUK79u/plmQDwzts/ESsARFYBKgO/ty4wkq0SMNkFEHACSCoBQyJAkgDg/ru1FAkDbN88WK4FrAgA/irAezf2O997rDciALhfv/X13iZxACQJBbpZAUUJA2k/rysUZBQGdIWApgn/s90CoPr9PIUBldWBvG/6014nnG/MlmcBnFh+EhcAAAAAwCRg7sPXntd3YHVk+P/Q3Zc6U0dqg7/7de2xRATYa8MFkCAAyESAjAKArA3AzQLouKli/xeyAFZ/SV4L+NqkqgVUvdFPer5Xsx0gS6ifzu5/UvifgjCgcuOvO+iTBZAypOs6AWy1A9jKAlC9+e/KONirtgPEOQMC3//mArkL4KWLhnnHBAAAAJjArHtq9Nf6Dqz5ae+B1aHwv1rt33DMSXYBKIkANgUA2RrADr01gLYtJadtc8lbA3DP9A3hNgD/PH5odvXmPxQI+LXuBh/qTdP9s4QF2kz5N73578lm9be1+29a9zfpcwB0HQGqLQC6QkDagK+7EtAoGQBpqwCy77u1gBeGHQDu1yeX/dT57o63884JAAAAMEGZ+/Daa93bf9EB8IG7VoZu/5McAG4OQMvejAKA5TWAtqAAsF3DBRBoBJh2y0CoEtDPAhjaNd/56eNdtRWAwCqAc7QZHAC6w31eNYCq6f6y5y0KAbo3/LrhgE1f+5c1GyCPGkCddP+8hQCFdH+TWsAXz5a7AL590VreOQEAAAAmIMOPrJ/qD/+eAFBxAcx48LPlXf7Y2/+ACJDQCBCXBdAyUj5KLoARMxeAWwnoigBBR4A/9LduKx9RAHDzANq8239fCCg502+UuwDuGjtDugrw+le7J8COv+7zuj/XW+ejO8SnrQbkfPNvyykw4W/60xwAqj/XVedj6+beVj2gbjigf8b/9ksXxKwCXP4HvIMCAAAATCDcMKfesdVjvQEBwHcB/NHosoTd/+Dzi70jrgG07JUN/oYugPHTUjmiCNC6yz1CLeDOsAgQXAcQb/9bt40P/G4NoOACqK4CuFkAbi2gkAXgnr/etMj518e7Iw6AiRUIqDvQ27r51/09ptb+rA4Cw7C/rFkATRUG2OXYq/mz1SJgy9qf1UEgDvOmO/8ZWgJePEMIA/S/XnGAQEAAAACACcT8L3/xr4M3//75yL2fjL3xjwoBi0OrAK23GlQCKggAsVkAwTWAXXIXQFUA2C4XAbz1AFcI8NsAtoXXADpcF8DGQc8F4AcB+iLA+vvOirQBeC6Ap7omueW/z5JAUHQdoGldoOUVgawZAawE1MkBkLUO0FZdoO1WgJnJ51hMLeDLn/wo76QAAAAAE4By7d+a7/YKAoD7dbD2Txz44zMBKiJAMAtAIgLUVgLCIkB1JUAhC6AtIQugdfew5wqQNgLsKOcCtG4vSbIAKk4ATwAoVQUAzwmwZdDp2Fxypq8PCAA3lAWAd9ywyDlxuC9aCzh+3ny2pwFr/bKuBOgO+qqvUw3/y/lGv+hBvynT/W0M9rZv+lXD/2ze6BcZ9qc46Mc5Adz/DssEgBPLXsEFAAAAADABmHfg80v7BOu/e9zaP3eAj7f8y5/P7AIQnABBy3/rnqGqCBBZBYhzAcStAeyMdwHEZwGUnA43EPDmcAbAtOvK/15xx/yIA2Di1wKmCQJ53/jrpvz3FmP5T6sBzKv+D0EgY+ifbct/3M/kLRCk3eSbhgMqtAIcWygXAb618gLeUQEAAAAamFXPPfDrsw+u/blo/e/ef5XTcdt5gT1+uQNA9tg7gTDAlphWgHAoYIIDIMYFkJwFMFQVALzHEgEg6ArwMgAqgYBt28ougFolYPlrNwfAEwK2lmsBp1VcAH4WgN8K8NDDQi1gRRB445nuBh/s0+r/dB0AeQgCPRYGet1BP2MWgO5uf9rrcQDktNtf1I2/7qCfVRhQyQCYqekY6ArUAgbP8p87r677Nd5ZAQAAABqUWWNXX9cnsf5/4K6LQoO72s2/3AUwda9aG0BiHoBKJWBcLaCQBdAq1gLqZAF4oYCDTtvmQWfaplKoEcAXAM7Yca7zn24toCAAvDb+9akjjXyjbyvlv2iHQMFhf7ZqAZOEAm7+NQWCLPV/edUCNspqgGnqv+x1gccvnBVTC7jiC7yzAgAAADQgiw7f0ioO/u45/cFVod394BqA+ipAefCfKtYC7k3PAhAdAC0jwRWAqAjgOwFEAcBtBGgN1gLKsgB2RrMAyrWApZoQsLVUXQPwXACbK1kArgtg42B4FcATAvqdPfvmhRsBKuf1p7tyHOptDfqqA3tRlv+0TABbN/uGQoBu+r+tlP9JKwioDOxdOYf+dSpY+nUGfJWbfVMhQCf9f6amYyBFFHjpPLkI8A9/N5V3WAAAAIAGwg1rmn3w6i+L1n/3vPfO5eHwvlClX4zlXyYMCAJA3CpAUAjQcQG0BNYAWpJcALujqwDtQiBge0UEkIUCirWAXhbAlrIToH3ToDQL4E9v6nf+0a8FFJwAbz1f79v/rM4A3ZWBvISDuIHeVtq/BWeAziqAijMAB4DCTb5MGMjzxj9rG4At639aXaBuGKCCg+CFeTGNACsOEQgIAAAA0ECc/fAXPibe/Ltff/S+T4Vu/sWTNPDHtQH4QkDw96qsAvhOgJAjYI8QCihZBfC+DggAVSfArtoKgHcqTQBxawBlF0CpugpQdQFUnAB+FsD0jaXIGoB71t49X1oL+NpXOuu022/aEmAr3V81rC8vR0Cdav5MVgCaoiUgbnDXDfNTHehNB/+0QT7r4N+VcbDXzQAwGPRNagFPXPo3vNMCAAAANACjo6NvmzW29lWZAPCO2y+I1PdFHyevAIQe3xrTCHBrVACIqwVsTQoEjFkRUMsCGPZEgGAtYFvVCRDjAAhkAbRvKQsA7ZvdQMBAGOB1ZQFg2vjjF77cFxYA/FrA53omUAig7g1/FmGgJ4eVgQarB7Qx8DdV+J/pykDeIYC6A3+j1ANmHPjFE1sLuPwfHGf0bbzjAgAAANSZuQ99fmWvxPr/5/dcFjPwx7sAUlsBAmGA4u+JqwWs3vjHZQJUXQCLY50BbRUXQGtAAGjdPVxdA6i2AgQGf2/QlwgAngMgxgVQzgIYcqbdVApkAPgugH7nE7ee4/yXsAJQDgSc6Zw62kjhfiYZAHlmBWQZ4HvrM+BnvdHH8m84wKe9zrYQoLvLbzrgd1ka6HVC/gyFgW8uiBEBVizjHRcAAACgjlz8jd2/MXtszet9gZv/Pq/270qn/dYlUtt/XA5AmgBQDQMckYQB3poeBqjsAoirBay4AGorAMmBgFUxYLtQCyhzAVRrAQdrtYAbwgLANM8RMODcPzYnHAZYEQTe+GpPg6f+21oRyJrib6sFQPX7lgQA0zDAtBv/pgn/sxEWWA9hwDQrwPaNftrzqlkAKq0Bbi3gJ2S1gK87/7zp13nnBQAAAKgTsw6u3Si7/X//XSsSBv50F4BMCAg/H2gFEMIAs2UBLA5nAoinugZQEwKCYYC1WsBSKBAwnAVQdgG0Vl0Ag+FWgEotYEelFrAqAlRWAWZsWeD80K0FlLQCnHq+N8fBXrfGr55ZAFms/rYt/oqvTxvsdXf/dUMCmz7sL++BXsfqb9Pir/r6mYZZAKrPawoD8bWAG3jnBQAAAKgDA0/e1C4b/k9/8LOxg35cFkB6DWBUAJCuAkgyAMpnOLIKEOcCqAoAIzECQEAEaPMFAGEVoOoA2BnMAaitArRvr1QFurf9ngOgVG0EKK8EDHpiwLQbB7wsAPcEnQCb7z+r4FpAk/R+1cFe5ffZEAZ6DEMCdR0Blm7/dR0BTRf6ZyPdvytDWKCtG33dm38VR4CN239dR4BpBkCnfi3gd65o4x0YAAAAoEDcSqa+sbVPiKF/7vmj0WWJO/9JgkD6zX+0FSAkBIzEZwEkOgAEy39SLaCXBSAJBAw5AYK3/zvFVQA3A6DSCrCtVFsBqLgAyqGAJc8F0L5pQJoF8J4Ni5zvHe6R1gLaDwTUveHXDQes17EV7mdJCFC1/OuuBlDxl/OAb7sGUPfm35ZTQNXyPzOjQKBx4moBTyw/TC0gAAAAQIGc8/DnZ8pu/z9y7ydTb/yTnk+/+Q+KArU1gFAt4Ej4hB0B8VkAidZ/MQywEghYXQOoZAG0BmoB3TWAYC1gzQVQqmYBVEMBg4GAm30hoOR0jP/bsbEsAoSrAfudz915ttQFkH8toO7Nvy2ngK3d/aw/19MYJ+sN/6QQCLo0dv+TMgG6NH7O9k6/+Brd0MB6nSw7/hpOgWMDchHg5Us+zjsxAAAAQAGMOqNvm3VwzT/3Cjf/fu2f6sAftwogywNQdgBIQwA1WgH2hG/9W4RawDbpKkA5DNBfBQgGAoZaAXbUHABBAcDPAqg6AfxWgEoWQPv4cWsBwy6ARd7jw4fmREWAJzqdN7/WY2H3X7Tg28oC6M3YEmBbCFAd8HOqATS19tvKCGia9H/bNX+2VgFkwoDKLn/c623f/Js6ADKuBhypHPe/S9IsgJX/RC0gAAAAQAHMe2jtZbLb/w/efanSzX+aMKBUBygLA4xpBIg6AmLqAP3Hwq2/1BkQEABCrQB+NkBVBBgOZQGEVgEqawDtlUwAsRawnAdQFgA6bh7wAgGDWQDuWbT7XOcnEheAe5yjeaX7m4YH1msVwPbuf0G1f1nrAVkByGj5t+0AsLX7nzXszzQEMC4jQPZzM+2sAFRrAc+NWQW4+BLekQEAAABy5Pxjo7/Zd2Dtm+Luf1dC7Z/qSkDtRDMAEjMBJI0AwVBA+UpANAsgzgkg1gKK1YCtYiNAaBVgOOQCCDsBaiJAcA3AcwJsrdQCbvZdAG4t4IBQC9jvBQLeOTZPKgC88dUuy4N93CBvO92/L+cbf10nQM67/7ZT/5s29K8r40qA7qCv+rok63+nhjPA9sCvKwhkDfvL8nMxtYAnlr/p/Mvnf4N3ZgAAAICcmHPwms2y2//33bnCYNDXcwDEOgEqKwBTZbWDe+NbAUJZAKIgUL3tX1xbBdgTswpQbQOoZQEE1wCqYYCB4zcC+KsA7ZIsgForQFkAaL9lUBoI+JFbFjr/+ni3vBbw670Z6vxshwPqCgJ9BTsCTEP/cg4BNHUC4AAwFAryvvE3Tfnvylkg0HEA6IQDdjrGLQChQMAz4wIBb+GdGQAAACAHBr9y8zvltX+rlG7+9YSB9ME/lAUQ5wIYicsCGNbIAhgKtwNIVwGGQ4GArZJAwPZgM8D2sAjguQC2+wLAkBAIOFjNA3BrAUUBwD3X33uWhUBA3dC+tMwAW46BrKn+trIAGvTGX3XQF+sFJ/1g32UY7leUIDDRb/x1rf6d2bIAkmoBv3/FdN6hAQAAACzi1f4dXP20TAB4T6X2L+vNv1gHqOsEiLQBxIQCxmYB7A1nAUR2/yWrAbJWgDZJI0CwFSCSBeA7AbaVqoGAISfAlkotYCUPYNoNARfAdWUhYPr4Of5or1QEeOvZomoBdXf8bQkBee/4mzxvURQg7M/wRj/rKkDRgoCtTICJuhqg4gKYKxcAji9/ilpAAAAAAIuc/fC6np79VznuSav9Mz1xqwCqx28FiKsFjAoBwu6/KAAIe//iKkBLwAVQWwUYiqwCRASAncE1gJoLoD1SCzgYqgUsuwBKTsdNA9JVgMtvj6kFfHKmoVW/6JR/FUGgJ4MTwCTlP4dBPs3qrzvgp/3+prf4qw7sRVn+4wZ23dA/2e/JY8DXtfxnFAKCN/6y5+NqAU9e1sU7NQAAAIAFVj366C/1HVz7A/Hmv+fAVc70284PVPiZ3/gnv16lDcB/vDgaChgjAPirANIMgMAqQKgNYCS6ClANA0wJBGwLZgHsFFcB3CDAaCBgsBWgLAa4LoABZ9p6+SrAwYfmSEWAN5/p1rjZtyUAqK4Q1Dv9X3dlIKfVgLhBX2fnvynD/7I6A3RXBvISDkyFAVs3/nFWfVMBICdngPvfteNLJVkAK3/gPLrql3jHBgAAAMjInIev/jvx5t89f3b3JaGBfere4UKdAPLVgMXyUMCYRgCpEyBYC7gn/oi1gBEBoJIF4IcBRlwA24MugFIgC0BSC7i5lgfg1QJKAgHbr1vkzNm+wPmPwxIXgBsIeCRreF/WrABbLQGmA7/qMK76+l67u/5Za//SHAJNP/CrDuJFW/vTBn7bg79OeJ/K61WyAjIM/qIjwP36xXNiXAArr+AdGwAAACADlz236bf92r/g6dz/Oaft1sVW7f9x30vLAkgTAJLrAONrAatCgDDwx2YEhFYBAmGAQRfAzqFILWBYABiquAEkLoDNQRfAoNMRCQQsn937z6gM/jMqp1IL+HSXpXR/WxkA9Q4BtL1CkHMYIBkAiiKA6o2+7RUCnfo/m+GARWQAzFR4XEAGgEot4Mn1/zvv3AAAAACGzB5bu0O19i/PoxIKGBQBgqsAaWGAogsgLQvADwSMywIoOwGGI6sANSfAcIoIUBEAtknWAAIugPZNZReAGwTYfl1NAPjjjYucVx8L1gLWhIBTz/dauMHXCfkrQhhQvfnXudnP2fKve4NvY7e/adL/dUP+dB0AWYWArCF+tgd8051/3aE9Q/q/7PEL8+JcANt45wYAAAAw4Jwn1r9bZv3/2IOfsWb3V20NSA7/Cx+xFaAloRownA0wnHzEMMCRsAOgLdgKIFkFqDUCjD8ODP9+NWAwELAtQQRo3TzgtG4ZcNo3l5xpGwclLoB+54t3nxlxAGSvBVTNCsjb8t9jKQzQVhtAwkpAkrVf1wmgmxVA6r/kdapCQZ4p/rZaAFS/n6cwoLI6YPmo1AJ+57J38Q4OAAAAoEG59m/tc6HQv0oLwLvvWFrIrX9cLaDyEdoAxFaA1CyAmFrAlj2L450BEgFAWgu4I1oLGBQApC6AraILoFSuBVzfLw0EfPqR2fJAwK91KQ7gtiz+psJA3o4AW1kAOVj9bVr8Cf9rwCyAzgxOgDxC/7JkAaje/Heapf8nff+FOXIB4NvLn6UWEAAAAECDMw9+YY7M+v+X914RvZ13b90VHAFZXQN6WQDD0jUAEweAGApYHvQXR2oBo4GAwwkuAEEA2BmtBXRFAC8PwBv+A6GAFQGgXAs46LRvHKiuAbQHBIALRs5x/iu0AlA+rz0x0zl1tM9CDWCjZABktfDr/j5DYSAt7E/15l/VEdB0A3/cjX/aYK/6+7IIA50ajgDVFgBdISBtwNddCVANAcz5HFsUIwJc3Mc7OQAAAIACm5577pf7xlb/m3/jXz2B2r96HfU2gMrzt6qtAcS5AOLXABZHwwFleQAJtYCRVgBZIOC2ktOybdBp3ToodQH4ToBpN/ZLVwHuG5PVAs5w3vhqp8Vwv7yFAN0Qv6yCQYOF/dl+vulPHgO+TQdAozkCTOv/LAkBaVkAsbWAK/7NcR6lFhAAAAAgjdkPXf1Z2e3/n959sdLNf9LzWdsB9FcBai4AsRVAHgoorADsTckC2JOyChAUAZJcAKIAENsKMFgVAFrHh383C8D9uj1QC9geCAU8ffNC598f65K2ApQDAU1u/m0N4ll/X5Yb/JzD/nRu8HVv/hniFW/wuw1v/LMKAbo3+Lo/11nnY+v23lI9oFcLOD8mEHDFp3lHBwAAAEhg+ZEd/613bM2p4M6/e2bu+2y19k/V8q98q2/w+1RCAUURwK8HTHYAaIYB6ggAMhfAjlL1iCJAy/ZBp8VdAxDyAFw3QOuWwVozQKUVYJpQC+gLAZvvOzPiAPBcANVaQNWBPKtQYCvsT/V509c12M1/2ut1HASTfse/S1MgyPPmX3eg103/t+UIML3Rz+ogEIZ51UwA6fNxtYDLTjknV1ELCAAAABBH34E1t+rW/tkWBLIKADouACMRYI9kFSCpFjCxEUBwAWyXuQDcoV/SCLDZdwK4LoCBsghwQ3QV4A9vWOR816sFjLYCvPVst0UHQNG7/6ahfzqp/3UMBTQRCHAC5Gj5zyIQdOYgGOR1s29aB2irLtDQCfDCGXIXwInlI7yzAwAAAEg4++AN7wvW/vm3/x974NOhQT9u2NddCTBxChQnACzWdwHEBAK27Co5LTtLYQEgIAL4N//RRgAhENDNAtgmywIoBQIB+6uBgEEnwOdGz5ZmAbz2lZkKg36jhf3pDPo9FkICNWr/bAz2WTMBGPQniPVf9Wa/S9ERkDX8z+KNvs3hXmb5j3MGvLRYLgJ895L38A4PAAAAEMCtTJo1tuZoUADwzx/ecaHVm39bQoG2CKDYCpDfKkDZBdAyPvCXBYGgE2C4tgoQIwKItYDlDIDBWiDg5kog4PoBaS3g4UNzhEYAvxawO2O4X96Wf9XXmwoEpm0COd706wz+TS0QdFlqC+h2iqsBVE3zV32+K6ebfvF7OQsEaTWAKuGA35gV4wJYcYRaQAAAAIAAZz3yhbP8G/+gA+Av7rk8MpibhP/lUROoHwg4LBcAbIkAMcJAVQRIWQVoEQQAXwRocU8gB6A12AqwpRQIBRzwRICOmwdCYYD+WbDzXOcnkiwA92vnaJE3/n0Zb/51d/tVwwIbxNrPjb+F8D+TgT/vxP+sWQB5rADMtDDQ6zoBMgoDadkAx/pjagFXnsE7PQAAAMA4q46N/krvgTU/FG/+u/df6XTcdl7qQF+PDICgADBlZMg79RIApo4P9+6JOAJUBADBBSBvBRiqNgKEBYDy8ZwAmyuNAFsGyi6ADQEXwHW1VYDR/XMTagEbrf5PVxAw2fE3eZ1i6r9tgQChwHA1IGsWgIpg0GlRIMha/9dVp0yAglYDjqSsBrj/uy+vBfyh89ymX+YdHwAAAJqeuQevXivb/f+TL10c2f1XvclPEgjSfo+Ok0Bl6A8LBOlrANU2AUEAmOr9jqEEF4A8ELDFFQcCawDlFYCh2EDAYCtAcA3AdQG0uMP/9kAYoO8ECGQBtG4ecNpurgkAtVrAfufDGxc5PzjcKawClM+pr/fWKcQva/q/rZR/i84Ak5t9av80b/hVf151kLfpDLCV8l/ETb/ugK96s28oBOik/8e9Lq4W8Pjyq3jHBwAAgKZmxVNbf1cc/N0z48HPOq0Zb/61d/pNMwW0VwHyWgNYnO4CSKgFdFcAymsAg6m1gOVmAGEVwGsFGKytAtxYCwSshQL2O9ffe6bEBTDTed0LBOxVaAPI88a/x+IqgOmNf52OqTCAUKBo70/KDuhqgBMnCOgKB1lv/LO2AViy/mdaBRj/O8cvkIsA31/7O7zzAwAAQNMy++Da0eDg74sB771zeezNf9xjVUEgq5AQeay5CjDFPXuHA80Ald8XIwBMrdz+h5wAe4aSVwESAgHFVgD3a++x2ApQ+dcb/LcPVmsBPSfA+GM/ENAXArw1gPHTVgkGFGsBfSFg2nULnZce7ZG6AN76WrfGQG86+JuG99m29lt2AsQN7qoDuunrm27Q70oZ4Ls1RIEiWgBUB3TT19tK9zd9veW0f93BP64d4IW5MVkAy2/nnR8AAACaknMPXv8n4t6/e/72gU+nDvw6g3pR+QDJ1v+s1YA6jQCLpdkAsS4AYRXAdwKIIkB1HaBSC5jeCjDgtN80UM4AEGoBL7k9phbwyZkF3fQ3SjZAHdL+dX9Od+Bv2qBA3V1+XYGg27IgoJsJkEcIYJaBv471gKpCQVwt4HcufT+fAAAAAKCpcCuR+sbWvBi8/ffPuyq1f+KNverNv+ljldclOguUMgCiAsCU4N+JzQKIFwFcN4DnCIjJAvCFAN8FEHIAuJkAu8q1gNUVALEWcPtQbQXAFQIqAkCLe+tfCQT0VwGCgYDtXi3goNOxoT8iALjn4ENzpC6AN5/pLtDyb5LqrzqwF2T5V735t3Wz37Q3/1lD/XQG/e4cbv5t3exnFQJ0B/gcb/6PWrz5lzkBXpgtFwBOrniBWkAAAABoKuY+dM25stq/D99zmdVavyy3/9p1gzYcAAEnQFQAWKwYBlgZ/CPCQMUJILoAdstrAVtTagFlLoBaFkCgFvCWwfIagJAF0LdtgfOjw9FawNfcQMAjvZMoDNCyMKB6s6/rADBN948LHST137IwoJv6r+sAyFoD2JWzE0A3K8CyAJD2fNzrvrkwRgS4aD6fBAAAAKApuHD/+l/tG1vzn+LNv1/7p3tDb7rTn0eooE4Y4JTKiWQB7FXLAjCtBWzxcwA8J0BtFcDPAqg5AYbDw/+OUmAVYKgiAgwGagFLEReA1wiwueR03BhtBXDPzgfnSV0Arz/VWcc6P1sWf92QQMuuAN2wv6av8+tWvPHXGfS76pAFYBr2l1e4ny0ngK12AM2BX3f3X7kWcNl/OMdW/QqfCAAAAGDSM/vgtZ+XBf+l1f6l3cinCQR5OQeCv1t24+87AWIdAYILIC0UMLICUAkFjLvx957fPRQSBqp5AJIsgNAqgCAAeCeQBdAmiACtWwcqdYClsAhwy0B1+A+uAnxg4yLnHx7vjmQBeLWAz/cELP95hP/ZuvnPGuKXURjQDfNLcwiovr4p9/xNVgFsZwEk3dx3Ggz8pq+3daOve/Of042/Sr1f0vNJQkBcLeCJ5dfwiQAAAAAmNRc+vv33ZXv/bu2fuGdvKgTInjdxAJg4BfQcABVBQOYAkPyumhNgKNkJILv1DzzviQABF4CYBZBWC1hrBRiqigBtoVrAwdoqwJZALeDGgVot4LqaC+Dau86UuwC+MnMChPj1ZqgFbLC6P9MBf9ILAqqDu2k4YKPU/ZkO+F1OvmF/WZ7PwfJ/xEQgSKgF/Mc1v8cnAwAAAJiUeMF/B1bfK9v9f8/oUuPBXPyZPC3+Kq+Pu+mPzwSIyQJIcQDECQH+jb8oAEQcACEXwJC3DtBS+TqYBdAWzAHYWRMA/CwAvxawZWvNBVCtBdzi1wKOn00DTscNiyJZAK4Y8PQjfRIRYKbz5rPdddjdN93t173ht3Tzb+t5bv5zuvm35RRQ3fE3fT6vm3/Tur86hf/pCgYqYYDu+UZcLeCyuwkEBAAAgEnJOY/c8EF/4A8KAH91/99pWfdVHQCmr7P191WFgPLj4UgooNgsEG0HiGkDSMkCCLUC+E6AYCuAkAXguwB8ASCcBVCrBWyJzQLwWwFKTsdNg4IAUP56ya75zs+EFQAvEPCJGc6po1mHddPd/6wOAMsDv8qOv47F38bNf1OG/WXNArAZBthlQSBo1Jo/3XYAQ6HA1NpvkhHwrZhawO9e8Sd8QgAAAIBJheM4v9g7tva4zP7/zjs+oTVw6+72m9YFZnUOKGcAVFwAbh1guRJQpQ1AvRWguv8vZgRUVgH8VoDy4D9UawQIrAJU2wAkAoDvAnC/Dq8C+G0AfhaA6wQYcDo21FwA1bNuoXP/wbnSVYA3vtrZYKn/po9ztvTbtvzjACioLtDWsG/b8l+0QJDVAdDp5JL6b1oPKBMCvjErJgtgxUu4AAAAAGBSMfvgtQNi8J/775/fc6l2iJ/u60wFANVMgKTvJ1n/o06AmgAgawWQZwKkhwEmOQGkAoDgBPBXAVqCQYCBMEDP/u87ALYHAwEHay6AzX4WwIDTvilcC+ifv920wPlfj3VKRYBaIGAe4X2mg7ztlYCCBn1d63/T7v4nDfr1SPfvVBz0bVv/s75Od7DP6aY/qyCgmvqfduJqAV9esZBPCgAAADApWPXojrf3jq3+iXjz37XvSqf91vOs1f2ZOgFshQ7KXqfTBiAKAGl5AGItoC8AxAUCBpsAZFkAfi2gf6rZAKFVgIoTYHswDLC8BuAKAC2hWsChSC1g2+by6bixX7oKcPN9ZyTUAhZ901+U5b83n5t/220BTX+TnzUcsOi6P1UnQNE1gCqCgM7gn/MqgKkTIHadYPz/r49fKBEBlv/YOXnhr/KJAQAAACY8cw5efaWs9u8Dd12U6ebe1DGQ9cZf5/clD/ySLACJA0CsBYyuBMhDAatuANEBIMkIcEWASBZApRVArAUMuQCqToChmgtgm8QFEBAB3CyAdrcV4IboKsA7x5975bFuqQjwVmogYF4OANtOAM3X697omw78TbPbnzbUmw76qqF/eQ38qpb+uPrAvAb/rA6ABr/xNwkFfPHsmEDAFZ/lEwMAAABMaIaf3PT/ymv/Vinb97M6BExXAXSFA9UsgGQhYHG1FWCK+PtiBAB/8I8TAMIDfykiCERXAYKnFGoFCK4BiLWAfiuAWAsYWgXwsgDKeQDtG6NrAO75zKi8FvC12FrArOn+9br5zyEDoIgsAHb+NdP9u3O++U9bDYgb+E2zAOq1+z+ZVgPG//O9dH5MLeCq/5tPDgAAADAhcUONeg+u3ScTAN47utzaTn/WXf6inABxqwBJToDI3x+JcwIMJzsBdg/FrgJEWgH8FoCACBBcA2gRHQDBUMBKI4DrAPCEgK2lWBHArQbsWC8XAR57ZLZUBHjzmU6DgV51YM8a4mcpBFC3xs9Wyj+DvmH6v65jwHbtn62U/6Is/3EDe4PU/umm/OsKBP55YV5cIOADBAICAADAhOScQ+s+LBv+P3rfp6xY/23d+Ge9+U/7PaIAEHdCgoDYBhCoBVQVAIKBgDIBQMwIaPFzAIRVADELoNW7+a8N/64LoBoGWHEBtPp5AFUXwPjAv8VvBRio5AEMOu03D0gFgHN2nOv85PAMqQjgHM16s5/2elsrAzk7A7KG+6n8DMJAhlUAFWdAdwE7/3llBOQlFNhaGTAc/LMIAGnWf/E13xqMCQS85EN8ggAAAIAJhVf7d2DNyzIB4B23X2Al3d80JDDv3yt7XdLNv3w1IFgLKG8DEMMAIzf/Qihg5NZ/jxAKGNMKUM0CCOYB7BgshwEGVgKCAoB3tgdFgIHyv5sHA7WAlVaADRIXwLpFzu0HYmoBn+7UtOzrDuiq1v461fzp7vrrDvBNMfCbhPdlWQHQbQkwGexVWwJspfurWvZ1w/xUB3rDwV8nvE+35i/udbGiQF9MFsDyk7gAAAAAYEIx68Caxd2S4f9Dd19qzeJv63VZ2wZ0BISkLIBoJkAtC2BK8PeOyJ0Aca0A8lrAcCBgMAsg6AKQZQEERQBxDSCpFSC8BhBoBai4AEQR4EMbFzo/eKxLXgv49Sy7+bZXCOqcAWC6y68rEOAEyJgNYDrw2w4BNL3h1xUG0gQB3ZUBHWHAghvAlgCQWgu4IE4EKPFJAgAAACYE614d/bXeA6t/Glf7ZyoAZM0KsCUgZFk50HEC+LWAESeAdPAPiwDpYYABF8CesAsgXAsYdQH4gYCtMVkA5Zv/Uq0VYOtgYiCglwVwY9QF0HbdQucLX4qpBQwFAqre/Nsa4Bv85t80A6CpB/0ui7v8RVv+VW/+8xr0s2YA6N7sW84GEG/qTQf/IwYrAEm1gCeW/tQ5uZ5aQAAAAGh8Zh+85lp34O+uHF8A+MBdKzMP/yq3+bbS/3VXA1SyAPw9/tgawMjjoAAQzgKI1gHKawFTswDEx0EXwK5SpBUgHAo4FMoCiLYCxNQCbhZEgE0D0lpA9/GxL8fUAn7NpBYwi1CgmxWQ846/LQGBm/2cwwB1hYI8Uv/jfq7I8D9bYYGqWQE5hwEmrQ7oigMvnhUXCHg1nygAAACgoRk4dN2UuNq/tAF7yt4h7+QpDuSRBaD799McAGItoOgCELMA4hwAohNAbAWIO74AEFcLKLYCxLoAqoGApYAAUIpxAYyfmwYiYYDuuei2+fJawCdNawFNU/1Nj+LvUd3hN7X+kwWQUxaA6vM2HACdFh0BRTsBTAf7guv80gZ63SFf9fUvnTc+9C+NigAvXf4HfLIAAACAhsSr/Rtb/ZBMAPij0WXWBvysdYG2sgCMBYKYG/+4msCpe2tZAJG/LxECfBeAKASIToCQA2BE4gLwhYBdAQGg0ggQzAIIugC8/f9IIGDNBdCyJeACCIgA7hqAKwJ0bFgkbQU4cHCOPBDwq10WLPwNGv6n6xQwrfszEQcm1Y1+1pv/rDf6tlYATOv+VH6fjSwAVUeAaligpRt90xpAWxkA1VrAuXIXwMnlYwQCAgAAQENy9qFrPiob/j9y3ydzs/6H9us1ns/DYaAjBKhlAAzV1gBGolkAcbWAaWGAURGgJHcBhAIB1dYA4l0AwhqAJBCwxRUBJLWAbeOne8u5zo8Oz4y6ANxawCO9GgF/eQz4lgQB3Rt+k5/H2m/xht9UIMi7zi9rBkC96v5MB3zLNYC6g71NIeCYrBZwqeOcvOQv+YQBAAAADcXo6Ojb+sbWfE+2+/+O28/P1eKfl5Mga51g6s/F3PjHZwMsrrgB5L8nbRUguRVAsgrghgG6r6mGAYZbAYJrAImrAN7wnyYC1AIB2yWBgO7Z8cA8eSDgU52GA76pU2CC3fzbcgpwDIf6bku7/7p1gLqtAHnXAarWBGYNEczoAFD9PXmco71xjQDfdZxVv8gnDQAAAGgYZh+69gJx8He//qCk9k8UAWwLA6bW/LwzAiLPp4QBRo/QBiDUAkbrAeVZALI1gOAqgCwPIFILuGtIkgUwGOMCGKy6AMK1gAOeAODe/LdsDtQC3lJ2AbgtAO7xGwHet2Gh8724WsDnTQb+vG7+e+3e/Js6APJqCWi6sD9TB0BeYX+qz5u+Lu8QwLxv/judXMP+VFcElB0BMypHrAVcGsgEGP/3OyuW8EkDAAAAGoJVzz3w671ja34uWv87933Oabt1ScPd/DeKY0A1DFB0AERWAUbMXQCRm/89aasA0VrAOAFAWgvoOwJEF4AnBAx4x8sC2BhdBWhft8i59s4zY1wAM3Ow/BfsAFBN9/dfqxseyLG0+2/6OO8MANOMgLxXA5IyAOKEgJn2HQC2dv9Vw/6M3QLj/39x/BMyF8DPnVfX/RqfOAAAAKDuzDq45rqg9d8/779zpdUb/om2QqD6c+kZAFEXQFItYKoIECsADMeLADIXgLQRYDAUCOgO/FO3lY8fCNiSUgvYVqkFbL8+mgXgnqcO9UlFgDe/1mlpZ1910LeU7q9b45c1vK/phAHV8L+8b/SLHvRNrf1FWf+zOgEUX2ca/pfHjr9yIOCZggPAzwJY9gU+cQAAAEBdOefRjS1By7//9ekPfkZ7kK/XgG+r7s/45+PS/6XPD0dqAeOcAOFwQI0sgD3x1YARF4CwCtCamAVQdgFM3RpoAwiIAOFVgEGnveICEJ0Aw3vOcX4mqwV8YoZz6miPphNAxwGQ802/rlCguhrArn/GlP9GFQhULf+mA39Xzo4A03rAgm76c7P8xx1hFcCrBZTkAXz/8il88gAAAIC64FYT9Y2t+XJQAPBFgPeMLq0O9KoDf1HCgO0aQRt/X28dIKYVQNEFkJYFoLYKIG8FmLpjMNIK4LsAaq0AlUrAreFawKAA4AYCuqd9/aJqBkDQCXDvWEwt4NOdCgN9A4X56ezim4b5qWYMkPpvONDrDvpZswB0d/tVwwJtD/Zp9X+6DgDLgoCtG3/dQT/x9QEB4BtzAy6AgBPgxLJD1AICAABAXTjjkWv/Vmb9L6L2r0jngK1wwMT/GWzUAo4k1wLGrgHIhAANAWDq+OOpOwfVGgEqtYCeCLDddwCUoo0Anggw/vUtgSyA62sCwF9tOtf518OdCYGANnf86yQY2Ar74xSUCVDvm3/dHX9VIaDL8EbfVsp/wQ6Bwm/+k2oBB+S1gN9e+dd8AgEAAIBCGXVG39Z7YM2r3ULwn3um33Z+4s2+rjMg66A/EUIIdQMBvSNbA9ibPRBwyu6SM2VPKSICuM9P3a3WCFB2AQxG2wBcN8DW8vFdANEwwMFKGOCgdzoqtYDBVgD3bLzvjIRaQJMQv4Is/6pWfZ00f1L9M9z06w74qjf7pkKAbvq/rZR/W84A093+giz/aZkAtm72jUWAwCpAqBYw4AQ4sfwfqAUEAACAQpl98NoVYu1fj1f7d0nqgJ82qE+0xgDVG3/brQC1WkB5vaC2AKDaChDKAijFiABDCbWApWotYM0F4K4DDFTXAGqrAINeIGDH9VEB4B3XL3RefqxbKgK89WxX/VP9TYUC3Zt/VVt/nHDASbnJt5X2b9sZoGvtr1f6v422gAKEg7iB3nRlQPb7lIZ/4TlpLaC3CrCUTyIAAABQCOc/uvE3ew+sfl3c/Xdr/1qTBtwYYSBt6LedFdDIIkN6C8CQWihggggwZaTkneRWgOFqK4DnCPBu//3vjX+9azAsALirADsHE1cBgo0AU70cgFI0CyBmFaBtY391FSAoBPz9HWdJBYDXnpyZYdA3FAZUQ/xsOQJ0HAIM+zk4ApKEgyLD/mwP+rZbAHQH9AwD/RHLjoAjFgb/1EF/hnzwr57x/7c4foHECbD8decbn/8NPpEAAABA7owP/xtl1v/33rlcy+qfNKBPhGyAxlgF0BUAdGoBFfIAggKAkAXgBQJuj3MBxNUCDgQcAOFAwI4bFkVXAdYtcr788Gx5LeAznfkO/EXX/5EBYDjs5xUO2Cj1gDrCQD2s/6ZOgM7swsCRAsIBi6gH9GoBJY0A316+nk8kAAAAkCsDT97ULt78u+djD3xG+YZffJ3uz+kO+qYiQD0EhLoIAElZALtLqYGA5Zv/Um0NIFQLWBv4fRGg6gLYGj6uCyCuFaDNzQS4eSBUB+gJAesWOmdum+/8+PBMeSDgkYIs/3ne4Nsa8JtWGLA9wBc14Jvc/NfD8q968686wOdg+T9iMcQvjwFf6gAQawGXhFcAfCfAdy5p5ZMJAAAA5IJbPdR7cO3jYuq/Kwa8e3SpsXVfdwCvt9W/CGEgaeg/baTknTQRQGwR0GoFCAX/yZ4rCVkA0UBA1wFQrgUMrAJsV3EBxAgAbi3ghv7QGkBbxQVw2/658kDApzvzcQCYWP1ttwBQ72eY4m+rBUD1+3nt+Kv+vO0VAdPUfx2hIMcUf1stAKrfP2IhDNCrBZwjzwL49vLD1AICAABALpz58NUzg9b/Wu3fFUYp/1mzAGwP8vVeGQj+fdNGAJ1WADELwE3+l6X/+wKA9/1AFoB0FWCXrBZwKCQCiFkAVREg4AJo2RJtBfByAW4u1wJ2CCLAn21c4PzPx2JqAb8eHPJ7GzfsL+vz3PwbBv7pOgGytgPoDvxJ3+/UyATIO/SvgbIAdAL/dJ0AWdsBjLMAZgi1gEtr5/iKj/MJBQAAAKzi1f6Nrf5n2e7/tErtn6rV3/SGX1dQyJpFYNsRoO2AUBz+y46AsBNAJgBEHQFyF0BVCNg9lHh8AcANBPTOzlJ5FWBnbRXAdwFMDez/i6sA5VaAigNgmy8ADFQFAD8QsMXPArixFghYcwMscj5/d0wt4Fdm5psBoHsjn/Xm31RQYOBXdASotgDkuQrQqfF81p3+rMJAVgu/7u8zFAaOGIYE6joCtK3+KTf/weeP9khyADw3wD854+/RfFIBAAAAa8w+eM0lovXfPX/6pUu0B3fTrIB6Wfvr5QyIt/zHZAGkCABpawAhB0BgFSDUArCn9rglUgs4JF0FEBsBfCEgLACUyjkA24K1gIOBWsCByirA+Pc2DUTaAMpnofPil3vkgYBf62r8uj/bjgCEAEMHgC1HQHdOln/d1YDOBjs5Dfh5h/0dzTsTYEaMI0B4/pvnCCsA1XMRn1QAAADACgNPbvutnv1r3pTV/rUYhPqJw3TV9p5zRkDeKwR5/H29LIDyKsBpsr8zEpcJMKTYCjAccQCEhIDAGoDvBPDCAXcEWwFK0laAYCCguwYQygLYGs0CKNcCDoSCAH0XwLK9Z0sFgJ8/MSO/m/+sz+v+HAO85Rt83Z/rapCTNeXf1s1/2i6/7o1/Tjf9aQ4A1Z87Uu/TVakFXBo+J5a96Rxb9Zt8YgEAAIDMzDq4dpPs9v+9o8ut3vTbXh2w/bq8LP9Jf0d285/sCAgGAgZ+70jcKsBQJAvAFwF8R0DIAbA7JgvA3fv31gAGa0KAJAug2gqwQ7IKsK1UXgEI5QEMVJ0Afi1gdRVgwyIhELAsBux/SF4L+MZXu+xlANi08pum/3Pzb0kIME3/t5UR0Glo7TepAezKccdf1+Kf882/7kCvm/5vKyMgyfIvcwC4X78wT74KcGLZzXxiAQAAgEz0P75+ejDtv8dC7Z/tgd1WeKCpQ8CWsyD2f36lDID4VoDq701ZBQgJAVIXQLwTILYVIOAE8E/19j9QERh0ArQIToCqAOCdgWogYLAW0F8FcF0AnVsWOD+KqQV0juRo6bdl+RcFBgb7gtoA6u0A0E331w0PbJTQv7zqARVrABvWATBDrQ7Qf/zSeTGtABd18MkFAAAAjHCrhXoOrH5advv/h3csTb2x11kJyCIkmGYG6AoHpkJDVmFBNQug9n01AUBcCUhrBSg7ASr/CiGBXhjg7poLoHxKVRdAUARorYgAvgAQbATwcwAirQCbw3kALdVawEWRWkDXBbBt37wMtYA5D/q6ToC4oR9BwFJ4n8rjrow3/Z0WBAFbN/qmP2dj0J/ZONZ/1Zt9Kzf9M+xnAkRqAf1GgOVPUQsIAAAARpz50Be7ZcP/X957hdJAbyutP6uVP69B3bZjQNcBEC8IDMtrAUeSsgCiAkC8CyAcBigKAGItoNgI4A/+rXHVgFtrQkCtFSCQBRCsBbxloNoIEFwFeM8Ni5zvPdolFQHeeq6rmJt/W20BsucRAnIUCnQt/ibOgM4MDgATJ0A9BAFVgcC0TSCn1QDdwd9aG8AMTaHArQXsl9cCfueSTj7BAAAAgBarHn30l3rH1vxAHP679l/pdNx6nvatv8rAn7UFwFSQsNVCkPffTxv8w8+XwwD9E/r7mg4AsRawOvhHhIHAKkA1CLAWCBhsBHDzAKr2/21hF4CbBeA/F3QB+LWAQReAuxLQfuNANAtg/PGaO+W1gK95tYC95oO+aVhf1iwABn3Nwb4rpf4v793+om78VQf4LsOBP+tuv274X8bhPq8sgMJXABIyAPzj1gIeXxoVAE4s/4Hz6Kpf4pMMAAAAKDPr4DVXyHb//+RLF2sPynlZ/VVfbzvsr6haQtVawFgngOACUA0FDGUCJNUC7gk7AcRWAH8NwHcCiFkALUItYForgLgKEKoFvCGcBdBeWQV48lBfTC1gZz4ZADazALI8z42+xR3/vOv/bNUC2g77MxEI8sgCSBEMjiju+B813PFvGEEg5vkX5wtrABVHwMmVl/FJBgAAAJS47LlNv+3W/om3/zP3fVap9i+t/i+rIJBWG2hbYMi6YmDz7ydlAEizAAJOgNDvD7xeDAQUwwBTnQC7JU6A6ipArRZQXAWYGhj+IwKAEAgoNgIEXQDu1203yV0Ag7vOcn4qCQR87YnK7ZmNer+8Uv45McO6qRNAN+Xf9u2+aiZAZ8zrkyz/nRoCga2Uf1PHQA4hf0mDfpaU/1xv9rM4AYKPOyu1gMIqwInlbzr/ds1v8YkGAAAAUpk1tnqHbPf/j0aXGYX6Za39M20NUHUG2LLs28oUUBUAkkIBy98b8k4kC2CvvA1gSmD4l2UB6K4ClAMBa2sAfh5A2AEgaQIIrAK4IkDr9oADQBII2OoHAt4gCgDlWsC7D8yNqQXszCcDIG3At5URgHBgyRmguzKQl3AQd5Ovs/Ofx66/qVBgK/2/oBMnCOgKB5mFAs02APfrF86IhgG65+TybXyiAQAAgETmH97wLtnw/7cPfNpo719HIMhaH6g6kOsKBHn9fVMhIW4FID0UUJ4pEHUChGsBxVWA2s3/cEgIiIQCVhoB/EBAPwsgsgrgCwCiGLBV5gIYlLoAXBHADQSUuQA+ummB84PDnYHh//TKmeGcel5hQDe17KsO8Az0BQ38qoO46uu7Le/6m76+U8Eh0GVx0Nfd9dcd9C23AKgO6Ec1B/qj9XYEiLWAiwMrAAER4OVPvpNPNgAAACDFrQ7qHVv9nEwAeNftF+Yy8JsMyKYZBHnV/2UVBrQFB8VWgJoo4AcBprsAgk4AUQgIOQF2C06APTECgH/EWsAdtVDAUC2gWA3oD//bglkAA7EiQPuN/VERYN1CZ8N9MbWAT+WUBZClFhBhoKAQQNsrBHmHATZqBoDpLn/OoYBxg72ukFDYzr/mwC8+/sascAZAdRVg2deoBQQAAAAp88aunR0e/K/0/v2Ley83vv23sSpQ1MqBbeEh778fd/Mvf1xbBTgtwQUgawUIugCqTgDJzX9sGGDVCTBUdgIERACZCyAxC2BrkgugEggYqQVc5Ewf//dEXC3gs135pPTrZgDoZAUw8Bvc/Ovc7BeZFaB7g2864GdN/+80HPDrVOtnOsAXYvnXSftXzQZwawEXyVcBvn1xH59wAAAAIMSm55775b4DV/17lto/Xau/LWHA1k2+ad2fbSeBcsaBchhguBZwSowLICoA1JwA0lBAMQQwKQsg4AKoZgHslLQB7JDkAWwV1gFisgCqeQAbawJA6xcXeAKA6wK44o4z5bWAT86sbxggN/sFpf5nFQqKuP3XaQFIWh0o8qY/6+qApjCgmvp/xNLNv44wkDjo224BkHzfqwW8MCoAnFj2747zKLWAAAAAUKP34OpV5Rv/K0MCwB9/6aLCbv51fs4kUyCvLAJToSHr30lzAIgCgNQBkOoESM8CqB5BGJhSEQC8NoBdpVoWwK5oFoC4/x8JBlQUATwXgBcI2C8NBDx0aLY0C8ALBNTNAhCH9qxhflj+J2gWQB5Wf5sWf9XXq+7wm1r/C8oC0A37yz3cz8Tqr+MQEM6LZ8fUAq74NJ90AAAAwOO8J276ne4Dq09lrf3LSyDQTf239fu0b+Tr8PeTQgDF54NZAFPE3ydxAkizAAICQJwQEFwRiLoASoFTWQ2oZAFM3REz/AedAJUsgLRAwLabo4GAresWOvO2zXf+U1YL6AYCHjG8+Tex8JMFkMPAb2rh1/19psJAWtif6s2/7gpBUbv/pnV/GQd93fT+NIeA6uut3ejr3vynOQK6KrWAogtg6SnnO5f9Np94AAAA4Bf6Dqy5tbbzf2Wk9q9WJ9eYR2cQt9EukHVwt/n3k0IApc/vDa4CyMMFo0KAPAsgWgsYDgSU1wJKRIBAFsDU7QkiQFwrQIwLoG1DfyQLwD17980RXAB+IOBMOyF+Sc8zsBdQ55dVMGi0sD/bz9tuAdB5voHr/ho27M/g+RfmRsMAPRFg+QifeAAAAJqccx657r2y1P+/uf/vUwfvrMKA6U15ngKByQBf778fvelPcgQMRVoB0moBqy0AvhNgT1QEqDkABiWtADFZADvDWQDlU6oO/q3by9kAogvAFwCmbhnwjugCmLq535m6acBpFVwAresWeC6AP9m4wPmnxzrlgYBf79ZP/U8b8G05BTiKwoDKgJ9n2J/uDb7K9+uZ7p/15t+WU0Bxx9/0+dyFAd26P43wP9l5aVgeCPjKZe/mkw8AAECT4lYD9Y1ddVS2+//O2z9R+M1/vXb087Lum75OWxBJrQEUwgBjBAD5CoDEARBTCxgKBQysBvgCQLUVYKe8FjDSCJDkAvDFgIRVgJZN/U7bhkWRLABXBLj67jOlWQCvfWWmPQdAXi0BDPiKz5u+rtFu/tNe35VD2r/s5t5WFkBBLQGqQkDD3/ynvX6m/HXVWsBIIOARagEBAACalDMOXn1mtPbvSufD91w+oaz+cRZ/W+0CJgO6TkaAjb+fXgNYim0FCP1eqQNAkgUwEucAEEIBhUBA0QUQzAKIqwWUZQG0bE0XANw1ALcWsO368u1/aBVg3ULnxUe6BQdAWQh482td2dL8/ecY6Bs09C+vesC8U/91BYKinQCqToE61QDqDv6FCwRZHQAz1WsBj6+cyycgAACAJmPVsdFf6Tmw+ofhm/8rvdq/9luXSC3+aY6AuO/n5STIq3Ywq3BQ1OpD8Pm0NYAkAUBsA1B1AsTVAiYKADIRQNYKEBQAKo+nbBsYP2URoCXSCFBeB5jqDf9BEWDQad3Y7w38YiPAJ0bOdv4rkAFQdQI8McM5dbQnu4Ufa/8ETffPMuh3Whjss2YC5DXY1znd39agr2v9z9wSoDvYZ80ECBz3f4+ltYDL/91xNv0yn4QAAACaiFkHV6+J7v5f6XzgrpUNG/ZnaxUg71WCuArAIv6+bPdftxUgPgxQHggoWwMIhgAquQCSVgFiXAAqgYC+E6D9hkXVPAA/C8B1Ajw4NkdeC/h0p7nlXyUvAEHAQtifquU/yQnQlaFNIK+bft3B35ZAkHaTbxoOmHHXP+/wP1UBodCbfp3BP+l1slrAyvnW8qv4JAQAANAkXHDoxt+Tpf6f/uCqSl98+OZe1QkwUdoCigrzM/37WQQBlTDAkCBQcQGcJrgAkk9CK4CCC6CaBZDiAvBFgGA7gCgABF0AU91TdQAMlsMAx0/LpvHnNtYEgLbK8O+KADM2z3d+WA0EPD3UCnDqeUthfqZ1fxxLu/2qYYGNYu1v9Bt/UwdAzqsBqpb+wnb9bTkADEMAgz93/Hy5CPDqqt/lExEAAMAkxw3/mXVwzZ2y3f/3jC41GqyLGPzjBuY8bv5t39DbtPqnPZ+0+y8VBPbGrwKk1QJKWwFkAoBKFsAuuQsgVAu4Te4C8Kz/WwdSawFbNyyUrgJsvX9eaPCPrQU0DfvjFCQI6O74x7UDmDgBOi0LBJ0ZMgEaTShIEgQKyACwnQVQN4Egg1Dwwhy5APDt5XcQCAgAADDJmX/o+g/Ubv5rDoD/Eaj9y3rDr5sdIPv5Rg0ZtDHQ5/3300IAZWsAkVYAUweATAjYk1YLWAoFAk5xj2QVYKp/4lYBtvhOgHAWwNRN/V4jQOst5VrA8grAguoqwLvXL3JeOdwlXQV467ku891+hICC0v9tpfzbdAbo3uybtAIUHeqn6wQoKNXfVsp/YZb/uIE9Y+1f2vnWkFwE+N4l7+WTEQAAwCS+/e89sPpYdPf/Kucdgdo/VQGgUSz/tm/ciwoNVP29Jn8/aQUg+ngokAcQ7wSIEwEiYYAhAWBI2hAQEgF2RkWAkAtgR0laC+iFAgZzAIRWgKne8B9oBBg/bTf211YB/EaA8XPVnWcGBv+UWkDTQR9BwJI4oCoU2Er/L3pVwNbKQJbB34YAoFsDWFAooOrr61YPaGtlQDhxtYDfXvZNXAAAAACTlDkH186P3v5f6Xzo7ku10v3r7RBoVEHB1s2+jd+r0woQFACSagEzuQACeQCn7Rr/d1dNAJiyq3zrH1cLOGVHKbQKMLXSCBCtBSw3AfitALV1gIGKE2D831v6q7WArdfVXACtX1zgPP5IX0wtYGdtgGegL3Cn3/RGP00wyKvurzNlFSBtADd9vS0Lv+nrcx70j2qm+usO+NYG/rjBXTfMT/Xm38Ah8M2F4wP/hZXjCwAXuq0AZ/EJCQAAYJJx4f71v9o7tuY/xfC/zn212r+sA3qjD/aNJgzkKTioZADECQC6DoD0QMChSCDgVKkLYDC9EUBwAYSyADxHwECkFrB8+qtOgLabBsI5ABUnQP/Os52fHI6GAbpfc9M/WbIBigwF7DTMBuicACsBBVr/bYcAmoYCagsDaYKA7sqAjjCQVAv4CZkT4D+cY6t+hU9KAAAAk4i+g2uvFUP//No/1bT/uMdpg77s51ScA40qINhuEcjr96StACTlAZxmKgLECgBDsa0AUyouALEWUMwCmLp9oOwEqAgC3gqAf6ouAMEJ4LYBbAoLAG4eQNsN5QDAYBaA6wK4a2y2JAvgdOf1p2dmH/ARBhSt/Vl3+Yu2/Kve/Nu62bctBMRZ/7Pe6Hdmq/uzvfOf26CfNQNA92Y/YzZApBaw4gg4sexqPikBAABMEvofX//7YuifX/sXHCTztvrbOrZ/b9GDeVF/X9UBUBMFhgxqAeNFgNN8u39KLWBcK8CUSiBgJAwwWBEYCARsCQYC+u0AWwK1gJvKtYBeK8DNA0It4EJPBPjITec6PzjcGREA3HPq693Jqf8M+A0aBmhbGFC92dd1AGRN989TGNDJCtB1AHQ6dQ0DLCz8z1ZYYNyNv4bA8NJ5MXkAq/4PPjEBAABMcNxwn56x1ffJav/+8I4LI7f4SU4A2+GAk31loFGEAdVaQGsiQFIOgJAFcFpSFoCwCjAlWAu4QwgDdDMBAqsASbWAfitA24ZFURfA+Lnh3nmRFQDPBfCVmWaDLMJAzlkAOpkARYX+6WQBNFqdn2n9X1r4n8LPHTEY/FUt/oVlAZiG/Vm+6U8MBJwjzwI4vuweAgEBAAAmOGcd+vyfxdX+6d7wpz1v+v1mGejr9ff1AgFLBgKAmgjgD/xpLoDyzX9AAJCJAAFHQG0NoLwKMLXSBlBeBajVAoZXAQbLgYB+BsC6WiPAtHULnOOPdUuzAN78WhcDvfUb/aw3/1lD/LIKA7phfmkOAdXX27rRN60BVA0BLGj337Tuz1QgsJbubxoWqDv4n145KbWAr1z6x3xyAgAAmMC3/71ja4/Lkv+n33a+8Y6/rUHe9soBJ0cBQDcPIKkRYI/QCFDNAiiFsgCmVNoCxCyAKdsDToBt4TWAKcIaQEtAAKiuArgiwKZyFkDrxkXVVQDfCeCKAJffJqsFPN157ckZ3PDXNcTPhkDQqHV/pgN+HjWAOun+OQsBujf8uuGAhR/bA76hIHC0T54F8O1lL+ECAAAAmKDMfejaRcGdf3/4/+Ddl2S2+JsIBLYH+YkuGKTd5Nt0GmSpBYwTAE7bUz6iAHBaZf9fFAGqDoDdUWEgmgVQil0FqO7/B06wFtAVAVw3gLcKsKW2ChB0AVSzANxWgOuDawC1QMBDD88SsgDKToA3vtrJsJ6rA6A7w35/l8FqgO3wP9Pn87r513UAqP6erCfj7wsO9kcMHAG6TgHlHX/d52emOARsrQQIDgCvFnCB3AXwrWUL+AQFAAAwwVj16I63945d9WPR+u/W/rXuXax182864Nt+XdFCQrM4Af5gT/lEnx9y/mAkKgKEB/94F0BECKiuAgyFwgGDwkCwFtBdA6id8BrAlB2lSC1gMAugxW8DCGYBCK0ArZVWgNab+qtBgDUnwEJn9raznf94TOICcAMBjyTc/OMI0Ez9N7X228oIsJn632kgBBRd82frRj+rg8Aw7C9rFkBhYYC6A31BN/9VMcD9d/x/345fIGQBuGfZj52TF/4qn6QAAAAmEH1ja6+X1f69X6H2z7QOMG3A1q0L1BngsfrnsAqg4AJIcgL4qwBeG8DumFBAISPAtfyLjQBVAWCnXACoOgOC6wCSNoCpW/rDrQCuE2BTWQRoW7+oPPhfV3MBuKLAyP650iyA15+ayRBft9R/08d5W/ptW/6LFgh0B/tORYGgoAwAWxkBDWP5t+0AiKsFPEtYAaiKAOv4JAUAADBBOP/Rjf+XbO//4w9+ZnwoGza+6TcN+zN1ApgKDXnd8GcRKBrh72cVAKp/P+aUhYBoLaBcACi7AE7bLREA/FaAnYFWgEAWgH+Ct/9Td9RWAcqBgJVVgEo4YLwAUG4EaLm5vyoA1JwAC50P3LjQefWxmdI8gLee7+amP9fwv7xu9E1/ztagb6vOT/V1Sdb/mRrOgAYJ+zuaMbwvkwAwI6eVAJObfdXXSaz/0lpASSvAy6v+Tz5RAQAANDhe8N+BNftku//vGV1mVPdn6gyIu6m3NajbHsjrvQpQxN9PtvzLno+vBZSvApRSGwFCWQAJtYDiKoDYClBuBBio1gKKWQDVWkDRCeBnAQirAG0bFoZqAb1WgPHHa+/WCATk5JDy352z5b87p5t/220BRd/0N4jl31Y4YOF1f6ZCQd41gBJB4IW5EgFg/JxY8QCBgAAAAA3OmWPrPiy7/f/IvZ+MDJeqDoCsgkBWB0BRmQF5/XxRwoDKf/6kG/9YYWAknAUQ5wSoCQKBDIA9SVkA4VpAMQvAbQSYIqkFDDkBtg9UawEjLoBAIKB7/FaAUBbApv5aK4BbC+gHAn4xEAo4/vULj/RIRYA3n+1ioM/d2m/bCaD7+s6Mu/0mDoA8hn7dLADVgV7XCZBRGNDd7S+87k+1/i/rSoBlIeBbA1EHgOcCWPlBPlkBAAA07u3/L/aMrX5ZtvsfrP3La3A3dQhkfb4Zbu5t/33TVYDTJFkASk6AhCwAcRUgrhZQXAWohQKWym0AFQGg2gZQXQXwwwEHAnkA8lWA1o39IReA7wS4YO9Zzn/JXABPnO6cYshvEOGg6N1/2eBfRBZAZ50EggZZDdBN9z+a983/jJTVANNQwIIFgbhawJPLT+ICAAAAaFBmPbS2JLv992v/0k6aMyDt57Le7Od1E190lsBE+Puym/5EJ8DeoaoTIC4MMM0JUK0DDNz2V4+wChDKAgi4APxAQDEPYErFBdCSUAvoVQF6IsBgeBVArAVcL68FvH9sltQF8MbT1AKa7fabDviqN/u2d/1VLf+mIX5FWf7jBvasIX6WQgB10v9tpvwb1/7ZSvkvyvIffCyrBZRkAZxcPsAnLAAAgAZj1Xd3vL1n/1U/E4f/zn2fy1z7Z3qjr5r+b2tloOhMgXrXEWb5+0mDv6oAkB4KWAqHAu6J5gFEnAC7hCwASS1g2Q0wKDgBKi4A3wEQCQQciLQCiLWA3hqA6wS4KeoCcM/HN5/j/K+YQMBTzzPo2xMKbK0M5O0MMA3368op7M+WUDDT0sqA7PflcPNvuuuf++6/qmCguzKQl3DgigGdcbWAP3Oc9dQCAgAANNTt/9iaa2S3/++7a4Xxjb7p63SFBt1BXtdRYJopYGuVwbaQYfr3o/9vnrz7H/7+UHUV4A/E/zx7widuDSCYB1A9u4RQwKAwsKu2BjBFrAX0AwEDLgBfAPCbAXwBwA8E9NoAQqsA/QEXQE0EcF0A7Rv6hVrAchbA5vvnSgUAagFV0v5Vb+x1X190zZ/urr/uAG868Cel/Xdq3Njrvt5wmNcN78uyAlBIS8AMxZYAW+n+cUO8ihvg9HiHwItnCrWA/lm2lk9aAAAADULp8IbTZMP/xx74dCEDf1ZhwNaOv6kwkNcNftHZACZ/XycMUFYNmNQK4NcCypwAslrASDhgSAgQBICdUQHAzwIQWwGCtYDe8C9kAQRXAVp8J8DNMhfAQuddNyxwvvtYl7wW8DkCAc3q/0xv+rsLuunPKhRkrQU0FQbSBAHdlQGdm/4C6wFtDPyFhgDq3vCbCgOnKwgCMT/30pJoFoD79Suf+u984gIAAKgzldq/h2UCwLtHl2rf/uusBuj+Hls/lzV80PbvseVgyNv5ENcKEGf9lz8OBAIG//6e+FBAUQBIcgFIWwGCToBAIGA0C6Dk1QJWAwFDIkCgDnCr4ALYEnYBVAMBb1woiADlLIDP3inUAh7+uHeatxZQ9ebfllW/0W/+TTMAsrQAzMyQAaA7wOcw4Nvc5S/c8q9685/XoJ8lA0B0BVSef2GOxAEwfk5cOEYgIAAAQJ05+9A1H5UN/3957xXWLf+1odHMcl9vq72tnfzJ9Pf1awElYYAxoYBhIUBwAuxJqAWUZAJ4ln/XBRAMBKw0AvhOAPe0BFYB0moB47IAgnkA1VrA62oiQMsXz3UOP9wrDwR8ppOB39gBkHbTr5sVkPeOvy0BoajwP1thgapZAZZv9FVXBnK3/NsKAzRdEcjbAVA5xwYkWQDj58RFf8EnLwAAgDoxOjr6tp4Dq78nEwCm3Xae0e2/jVYA1TA/W6sEpisGeaXzT7S/nxYCGH1+KBQKKIYBBgf/oACg6gAQawFPE7IAQo0Au6JOgJALQLUW0F8D2CS4ADbKXQALd57t/EQiALgH6393xiwA2zV/qq9X3eE3tf4XlQVgGvaX101/Z75ZAKrP5x7610hZAKo5AAlOgKO9cVkA33WcVb/IJzAAAIA60HtwzXnusN+173Pe8Yf/P/uSvPbvD/wd7oxCQPCxzoCe9YZfVVCw1UaQ9e+bZhEU/T+/agZA6Pm9MasAEiGgdoRVgN2yLICaABCbBRDIA5i6K74WMLoGIHEBJIgAVRfADdFGAFcEuPPAnNAKgH9ef3qmQ3p/EeF/9dr1Txvodev+bAz6MxNWAdJu7LOEBVqw+me9+c96o3/U1sBvWven+/tMswBUHQGB133zHHkWwMsrF/MJDAAAoGBWPffAr/eOrf65ePM/c99nnZa9w5lv7W04BWxnBWQZkE1u4E1v6k3rDuv999Nv/mOyAFJqAWuOAHkbgL8K4A/9VSFAsgYQzAKIqwX08wCqYYA7ggJAnAugPxII6LsA3FrAiACwbqHz4Y0LnH95PKYW8Ou4ALK3Adi+4bdl+dddDehssGM73d+SU8A03d+0FjC3Or+436Ez4M/I+ZyumA0w/p/l+PmBVYCqCPBz57ur3s4nMQAAgALpG1t7vXjz//+z9ybgcZRX1vCfAZKQCZnJ5M/M/88ES/LCDiELSZgkk0mCJXVLsjFgdkstyTZgS16AQJhs8sKaYDZv8iLbYhcQQsCyWRLjHYixjYnxAhkmQ5KZySRfkskEJOO4vq7uru7qqre63uW+b1V3n/M890FqVVehxd11zz33HLs++cjszKRfdtqvcwVA5Pwi7v660gdUG/lyvH7o5L+IGJiSrfv8hoCsWEBmKkCpWECHGMh9Pqo/W8xVgFUBKgBXeUkA2xQw0/SzVAD5WMBsnXBPykcA2F4Adz5+gZ8AsFUAWxJV7AUg+zjv81piUryTfyqlAO+Ov+jjzZw7/RG5++9WbOqplALcxACvIkBUKaC6+x+mAAj4+p6LPF4A+VWABbgTAwAAAABDuHzDgtHexl8k9i+qyb+suz2Vaz6uL5cKEJwOMCXvB+A7byARMDl0FSDb8E9hewOsCY4FdFYBHOm/EwuY9wEoEQs40lEAuEiAkctS1sjelDXarqXt1gl3ZFcBRi+YlCn74xPTte/H45gqgMMvNVfoLr9ooy4b8yc7+Rc9D+/knsoLwJQZoGhDTzX5FzyPrLSfyiNAusGXNf2jkvZTEQFhqQDuWMDu4lWAg18fiTsyAAAAANAMO4Jn/LqbNrgbf0cJcMbD3ZE0/NRxgaoNsqrknirGrxyvL6IAKHhLFKcCBMUCBq0CuEkA7+6/2w/A6wVQUAEUpwK4VQB5Q0CfEqDgBTBqpTsVoEQs4KKUJxEg6wVw7YMXZ/f/PQRA9cQC8sYAijb+phUAVO7+UawANGmQ/BtWAOxSjAM0FvunavqnEg+oMw2gBGHwygUMBUCmfoRYQAAAAADQjPOfu/mcoNi/IOk/1UoA1YqArJRf1/VlJ/Oi6QaqjT3F9fnOHyb99z7uTwSoY5oABngBeNYACmaApVUAjhlg0SoAwwsgLBZwlNcMkOkFYH+essbc2eqLBbRJgGefmeAzA8zEAr7QjEZf2LyPt9GncvcXbfRZ5xNp1mWJgSbORr+Zw7yvuYRLP2+jz3kcb2yf9om+qumfKXd/U9J/XiVA7uO97X4FQKau/iruzAAAAABAEwasTOzfW97Jv/3xSQKxf6aIAmoFgK5JOJXpYKVcX8wMsDgW0Hf+wFSA4FUAnxngGnZcYLEhYCdfLOAqvwpglGMKuLw9twrgUgF4SIAxi9vzsYDZVYCsCuC8lZdbv9+Y9KsAbEPAXZXS4FMdL+v+r3vSL0oUUCkBTCsFwggBzRN/URO/3aYk/6qEgCxBIOsRoGs1IIAIsP8t+swA03Vw1r8jFhAAAAAANOG89bfOYsX+fe6xa4029nFTDuiewFOtKpTL9Xkb/zACwKsC8KcDBKsAgib/TAJgTQgBsKozVAVgEwB1eQKA4QWwLJWPBRx9lz8RwCYB+p86v3gVwIkF3JassMm/rFlfqeN17PbrmvjLNvC6VwN4Jf2yXgDEhICodJ8y9m+3jkaft6E32dgnCL0A7FjASd4VgBwJMHMG7tAAAAAAgBjTNiz64Lnr5h/yEgB27N+o+6eWZYNvSiFAFT+oGtdXbtf3Nv6lVwNcawAeLwDuVYCgNICSsYCdLhJgcrgKIGcI6I8F7PTEAvoTARwvgFGL24oIAFsFYCcCfOruSdZbG5rZsYA7K3Hvn7fRp/YCiNoTgIoQ0G32p2oKaJgQUPUEiHzyL7rjL7L736R3xz+s8Q+MBXTUADMOWa989y9xpwYAAAAAhDh33Y2LWLF/n3hkVujEP+xzkRWBOCoDdKcM6FYWxPX6QWkAgSkB9xcrAfLnu7dU8ccC1oWRAG4VgMsQsC7d/Ns10m0CuKKDQQLkPnYrAZYVVgFsFYBDApywsN2jAsgqAeY/enGRB4CjBBguq1hA0Rg/Kpd/U5J/Xqm+iJs/tat/E2Gjz9uwG5L8h3kCUE32pYkAUfd/Kpd/KmWAhMs/19dzlY8F9NTrM+/BnRoAAAAAEOGi524/gSX9H/vkt6Ua+bgoA6iUAqoTfyrJPlWMX5yuz5cG4DcDrGWsAXi9ALyxgD4VQNA6QL+XAGCQAGGGgH3+VYC6dMNft6LdFQvYHhAL2J6JBbSNAJ04QPcqwO4fjfcbAqbr8E9arOpw/+dt8FU9AqiJA17Jfikiodngrr+IKaCoPwCPRwAxcRDU0FO5/ZMrA0Sl/bpj/4LIAFHigMMjIBML2O1XArzx9dG4YwMAAAAARdgRO+PWzdvibvwdIuD0XOyf0+jzTvZFFQHltkIgSzTg+mJKALYnwBThVACvF8DIez1KAC4vgPTHq9MN/KoOFwHgjwW0SQCn6XdIALvptysfC+hJBRi5rD1TBUPAVDYRYFHWEDBrBpg1BLTryv5LrbcZawDDmxpjYgjI25DLTvR5VwB0NPTNBhUBIgqBFosu5q9JUiHA24wrNPS7DCoCIov5E9n1T2pICZBdBUhwFsfxr5wf4AUwaxNiAQEAAABAdfr/9C0J7+Tf/viffvB1Yel/uZcubwHVtIFKvT5vKoCXAAg0BeQkAIL9AKaUJAC8CoA6W/6fIQQCVAArPSqAFSKxgLlVgLvaXF4AWSLAVgH8cP157FjA7c0VpgIYp7DLL0oQiBID1PF/cfUAkN3lFyUIJIiBXRrNASPzAFDxBmB9TqkESAhM9BVXCHyxgLnad00D7twAAAAAQBI9G3qOHrf+xl86BEC+BudmYv94J/qyngBxJRCoUwRMrxyYuj7V/zdvGkCYAoAdByhKAnQyYgE7M1W8BlDwA7BJgIwHgEMCrGwvUgDYH2dVAB2ZNYCMCmClPxUgrwTIkQAZJcDiVLbxv2NSQQlw+yRrbO8k6zfPNxWlAeQNAV9uKdOdf54Gv0XBA0CXFwD1BF+2wRd9noq5n4wHgIhXgEG3/91EDf5uU5N/05J/3sk/rxKA0yvA/je6v4tBAsz8pZW+d8EdHAAAAABIYPzTN13rNf2z67OPXsvVmKs28CaJAQrzv6iIAe/1dZv9qX7/MtfnMgEMSAWoJVUBpM+9piNdnaGxgFkFQGeRIaBPBRAQC+j4AGQJgM6SsYAn3JNTAdxR7AWw9InzmV4A725rqjIzwBYiYoDKxZ8qBaDU+ePo+s9LFGh28adKAeD9urYdf97nU3sBqLj+qxAFjMd+ehlbBXBg5jW4gwMAAAAAQVy3ZeVx4wdvPOze+bcr8VRPJvZPZadf9Xnlujqgaxe/Gq4vmgiQKVYsYAkSoPbezkzxkAB+FUBIKoDXELAv1/Db8YCr3F4AHTkCwOUHkFEAZMmAvBdAuvEf2ZtNBRi1NOVq/guxgKfeMcn62Y9b/LGAGUPA5gryAhD1BDDhBSBi+Ccq5Rdt8nmPlzX145X4G/QCEDH8E5Xyq6YDCDf8qrF+vMSAaUUAgRdAUSyg2wtgxmHr1z0fxJ0cAAAAAIhM/9fduJy1+3/mwEzhhp7XJFC20dd1Xt2NsWo8n+oOvqoXAPX1eRUAfF4Ak9kKgPv4YwFDCYC8IqAzX/5VANscMOsF4F0FGNXXwVQBuFcB3CRAMQGQ9QMYnfk4ZY2+p+AD4KgAbBLgOw9fyPQCGN6SjNFEX3XyL9q4jytBEPASA5Tu/qKTf97zm979l437M+QFsEvSJFBUEWBsx1+UCNAV/1dq15+nsec9X8DnQbGAB2f04k4OAAAAADgxaeMdJ3sn/3aNffJbJNJ8UQVApZkJmvIkoCYq4nB9MRWA6BoAmwCo7e/MVKAKoGQs4ORQFYAvDSBnCOjEAo70egFkpv/txYaAvljAtvwqwMZnz2WvArzYVKEmfrITf1Ml69qvWymgIuVXMQeMoHYRmvuREQG8kn/R1YBkzEqwweepfVewSYB/ve5E3NEBAAAAQAgysX/rb3yBFft32kNdXJN9U3F/ooRBucUN6m7gdXkF6P7+ZdYAyFQA/f7Jv58YcCkBWKkA7lhAxwugLyv5L3gBdBRiAZezYwEzRMCyVN4QcPSitqI0ACca8LK+y6w/us0AXUqAeO7ui15HVsov6hVANalXPV9zTIp3Mk+lFCDa3Vd93q64VJjLv+zKgKrUX/ZxmRUAJ6WIggUAAIAASURBVBbwvELTvz9XGRXAzO2IBQQAAACAEFz49C0tPtf/dH3x8euFG2yq42SJBNOrAaoTcSrpfLleX5sK4N7SKoD8aoGHAMh7AngIgIwiwG0CGKACqFvdkSk3CTDSWQfIrwJMzjf8XiVAfhXAVgCscCkA3KsAuVSA0Q4JcGerJxYw6wfw8OD5RR4ADgFwaHtTjHf/VRUAouZ/ut3/Vd39dcUA8u72U3kBhB2n2QRQdPKvPQZQVtpP5REQRiCExf3xxvcJxvyJ1t6UXwFgEwEHZzXhzg4AAAAAAtCzYcPR49fP/y/v7n9z+uMTHrhSere/VCNP0YhXy4qAKUl/XK8vTwJMDowGVFUB1K2Z4tr/ZxsCZvf/XakARYkAhVQANxHgVgE4JIDPC8CVCpBp/u1VgMXtfi+A9H/PvmeS9Z/PJ5mrAPGJBVSNAzTl7q9CBFSSAkDW9M/wKgD17r/xHf+gY0XNA+Ni+ifi+i9AEATFAh6c9V+WhVhAAAAAAGDi3HU338CS/n/m0WuEJP+8BEHYZJ8qJYCKICi3FYJKvr5I819zb2e6JgsTAN5UALYXwBSmGWDtmk4fAeBWAWSUAH2OEmByxhDQSwAUpwIUYgFHOoSAOxawN0sC2DXmbu8awKSMCmDB4xPzk3+3EuDQlkRE0n/VRl62wZd9HpWEX1QJEJXZH6+En9rdv1nvxF9UCaB991/V9V+0yZclBqgafSrpP+O4Vy9lqwD2z7gOd3gAAAAA4EH3C3d/qGVw3hG37N8mAZJrezJNHo8UX1YJoNv9v1w9Aqpxsm9CAVD0e+ZYBQhSAhQm/1OYsYBFhoCr/akAbiWAmwAY6f54Zc4MMFPtmfLFAi7LrgLkSYClKWv0HZPy0YAOATAm/d/X7FhAhhfAn19qieGkX4VAEGn0TSsFVN38RQgCykm+rvi/UgSDQUWArOmfdhNAUYJAVAWgixAQSQtIqnkAhMYCdh+x/vvW43CnBwAAAABF0//5q1m7/x9/eIawyR+1AkDVW4DaswANf/mRADWZaX7pVAAWAeCoAPJKAHcqQEAcoPvzjCEgywvAPsYTC5hXAKzyegG0ZwiAUblIwIISoNgLIKsEyHkBLPSbAdokwDUPXuz3AkjX8OZEjBUA1EoAXQ0/b+Ne7hN/0d1+VcWAZGO/KyT+r2wn/rINvOxqgOpuv6gCQLH2XMhQAGRiAftwpwcAAAAAOVy04bunsZr/c578llTjr6uhl1UeaG9EEVMYKQGQlfh3GksF8K4CFEn/+0t4AdhEQGbyXxwLmF8F6MvJ//sKKgB3LKCTCuCLBXQSAXKpAKN7OzJ+AGPubPWtAdi1/pkJ7FjAF5qIG3/TxEHcJvpUO/5Rxf9REQXELv+md/wjIwSaNJn96fQAMOEFoBAL+PrsU3HHBwAAAFQ9MrF/g/NfZu3+n/rQdO79fpldflXigLchj9pLwNRqQ8U09rzET+jEn0EQpJ9Xkz5Hjff8sqkAa/zlSwnINf/OKkDGDHB1Z34VoOAF4FoFsP+7osOXCOCsARRUAKk8AZBPBcipAMYsSlknZEwAi1UA45dfbv1+oz8WcDhd1k6KGD/Zyb6qiR+VCaBsjB+1y3/cTP10u/yHfF220Zd1+dc+2RdZBaBMA6CO96Ny+SdUBgTGAs7YgVhAAAAAoOox8ZmbJ7Cm/194/Drpxl20waeW7KPxrk4lgLgXQDEB4D02jAAIXAXIPV5YCcjWSKdcawB5b4BVnXkVgDcW0Pk8Hwu40r0KkMoqAZZ15BUAbkPA0XcVVAB2IkAmFeD2SdbqJ89nqwC2JTXs+4sqAahWBnQrA2RNAcOO5/UIoCYOvLv3qgQA7wpBxO7/oisD2ogDXsk+L1GgWxmgau6neRVgbxtbBfCvV4/DnR8AAABQtZi6o/eY8YPzfusjAAbnWic+cKVwQy87+Q9q+qkVAqKEhC6vAF0rDLLXN70KoePnz7MK4Hy9JvPx5DwBEGQKWKwI6CwmAvo9RMCazsA4QGcNoM61BuCOBXSrALIkgKvxL1IBtOdVAKxYwPwqwLICATBqSapgBOioANL1yXsmWT9/vkkgFrBFQbIv2qDzSvtNSf3DJvqihEBY8R7fQizhlz2eutGXJAbCGn7eRjyyXX/Z45OcCgGqRp/V+CckUgKolQCNuQqIBSx4AfzGsjYgFhAAAACoToxff8u3WdP/sx69mnTSz2sKqCrhV10dgDdA+X7/LAIgmBCYUqQEqAtQAvhXAthpAP5UgOJVgNq8AoDhBeBSAhRIgE6fAiDvBZBLBcg0/SvafYaAmVWAZe3FqwD35NYA7ij2A7jtkYlMAkA+FlBU6k+1QhC1B4CMCWAzB0nQEuGKQBhBIGMCqLlETQCpVwiMEQRx8wCQ3eXXbQrYaFmvXsJWARyc/U3cAQIAAABVh9SGVX/tjf2zq/Epf+yfbIOvi0CQVQiwnqdyHqpVBGpFQdQTfdOxjPnfXcjk3//5lLwnQNHv/94gIqCTqQTwSv5r8wkA/nSAjBIgRAWQTQWY7IoCLBgCZogAxxBwebu/WCqApalMJCArFWD7c+OZJMDhl5oUdv5Vd/rDjpNt8MdpMPfjafBlJvsmvQJEJ/iyJn+G3P9FiQFRBQAJEaAywZdt8FXd/5OSDb7oZD+pNvn3xgLuu6rgAXAg7wdwxPrZ9X+FO0EAAACgyqb/N90fFvsn2tiregHoltpH1ZiWa2NebsRAWONfyg+gjjMWsMgLwKsEyEv+p2TKSQUoXg/oLDYDXOV4AnhXAezJf3vBELCICOgoqADy1eH3AnCRAKMXtnkIgKwKYGr/JdbbDAJgeFOjdWSXqus/67gWAgWB6OpAXFz/qVYE4mQG2CRALBBJ/qnMAGUUBCQu/rJKAF6vgCbDk35VM8CkZNPPSQzsmRiQCDDrPtwJAgAAAFWDizfe/glW8//VJ74h3PzrIAhEJ/2yO+W6TAVN7cJTN/LlfH23AkDIC+A+vxeAcy4vEcD0AnCpAHhjAYu9ADoKqQDO5zkSYJQTC7iyOBYwQwAEpgK4VAC9xYaAvljAnArgicHzco1/Q65yhoDbkwKNfwuhFwC1lJ/3PLKmfroa/aji/MKaedkG39BqQEV4AVBK/HmP593hF2n0ExF4AbBiAaf6vQAySoCrP447QgAAAKDikY39m7eHRQCc+tA0Uil/2DlE0wBkj1eNEaRKLxC5vkwjbbqB1/n9y6Q32MVq/AsNP4sY8KcCeAmAIDPAPBHgWQPwSv+9KgB+LwBXGsAqrxdAR6gXQCEVIOsFMGqxnQDQ6iMAzllyufXfzycFDAFFzfp4zfziZv6n6t7P29iLnk+WGAgz+xON9+NdITDU8MtK+EXPt1tFDZAkmPzzKgJM7/7Lxv2p+gA0eorx9VfOLY4DLBABryAWEAAAAKh4XPDMbRNZzf/nv3+d8oRft1dA0A4/lTkglcKAegJuykzP9PVVzR1lIwF9hMB9xV4AQecqSQS4YwH7GbGAa/yrABkCYHVpFUCmHAVAX7EXgJMKMHJFR7AXQN4PIGcIeHcrcxVgyQ8u8CkAMoaAW5MCjbtq3J9sg09FCFBN+EXNAeMi8Zdx92/STwSImvgFnUN7g6/L7I/6cR0pAEmCib/mcmIB93vqZ9echztDAAAAoGJhx/6NWzfv997mvzldYx64Qov8n9Lsj4pQ0DF5jqKRl1UqVNr1i1QlJSb+gasBAQRAsBmgS/7vWQPwGwLmFAH9kxleADklgJsAcHkBZM0AO7MEgFMBsYB1RSqAFCMWMKcCWNLmNwS8fZJ16h2TrNefb2aqAP78k2bFyb/oxL/SJv9USgHK3X1RhYCOyb7i+WQn+NrN/kQn+KLPS8akeCf/VEoBXvO/gMftv7V9XQw/gJm/tazeY3CHCAAAAFQkzn16/jyn4W92EQCffnR2bhI62S+n1qgIEG3wqSbFcb8+lQLB9PWj/v6DiIDwVICCF0BtiVQBIQVAP8MLwOUREBgLaJMFDBVAUCJA3gtghXsVIOVLBCgyBLynmAAYdXurNep7k6xvP3Sxp/nPKgIObWkUbORVj1Od/IueR1WKL6oUoJb2657883oFNNEqAsIafFnTP6OT/yTB5D/seBEFgcxuv2iMn+6UAIV0ADsWkLUK8PrMObhDBAAAACoO019c+BGW9N+O/VPd5zelEJDd7aeO+aMyHaSakJs2L5S9vq44xLBUAD5FwBSfKaD3PH5TwGIVQL7x7y82/6v1GgOyVgFKxAI6qQCjcpWR/LtJgJwKgLkGwIoF7PXGArZmyiYBNjx7LjsW8MUmghhA0cbftAJAVNova/rHeh6vKWDUrv8yBEHMTP90xQOSrwTIEARRKgF4lQLU1RiSCuDxB9g/rXgVwCECfv71D+NOEQAAAKgY2CY34wfnP8oiAM54uJu7IS/sTJuV/lObEVKtHuiemMf1+rpWIqi//9Lmf96vTw5MBWCnAUzORwMGrgEwdv+LiYEAL4BVxasAhVjAICVAkCFgdhWgbmm6PIaAoxflCIA7ilcBLll5qfU/zyeYqQBHdlLF74lK/3W7+8vu7uty9zcl/edt3GNm9ifS6O/SKP3fLTvxF1UCRGX2xzvRN+Xuz9voe2MCPc/bcwHbC+DgjAEYAgIAAAAVg4ufWfBp786/XV/94Te1NPi6TQR1TeJ1Sd517chTT+zL/fpMY0juNIDJRdGANd7zcqwChMcCdjBVAMWrAB4VQBAJ0MdSATDMAL2rAHY04NL0x0tT1ug72asADw2ez1QBhMcCyigBKKX81GZ/sgSBaPxfKYIhqkm/qBmgRsk/7/Gy8X+yHgHaJv2ijT8VQRA2yVcxB0yaifvjTQt4bbLfCyCzCjDrk7hjBAAAACpi+j9ucP7eZsb0/+QHpxU1/EEEADUxoGNyL6IYUJ04q6YN4Prmrs+jAPASAD4vgPuCVgAYZoD3higA1viJgWIVQGcJFYDd9LezCQDHC8A2BPQQAPb031YBeL0ARi5KFcUCjrp9UoYAOPueSdZ/ZGIBGzzlxAKK7varKgZMm/qpegCENfq6dv11KQB4Htdo/qe6289rFmhs57/cJ/48HgAJQsWArEKgRDzgKxPYXgAHZ7wKFQAAAABQ9pi4/pZL3ZN/5+N/VIj9KzeFgC6pvy6PAepGu1qvnzeyFPICKCgAagVjAfNeAB5TQNYagHQsYIYAKCYBale0Z6oUCeBVAeS9AHyxgK2ZVYAFj09kxwJuSRDu7rOOazGoBKCOBRSV8FMRAWHu/qaIA0OrAbuIYv3Idv/D3P1lFAFJRbO/OBEFuif/YasBASsCP21lewG8cfVFuHMEAAAAyhbdrw++b/y6G//H6/qffGqONeq+qcITf90rArLKAN0pA7qVBaYm8dQEh/O1cvj+SxEBQakAXiLAFx/oUQIUrQL0e0wBQ0iAuiBDQI8KoLavvYQKgB0LWLcs5wHQmyUC6tKNf93SnApgsd8Q0FYB2CTA3h+3+BIB7PrzS82aXP5NSf55pfpB03oVl39VQqBJg8t/M5GJX7OiMkDS/Z/K5Z9MGSAz2U/GKPZP1OVflCAw2eiX+DwTCzjdTwAc6P6DtbfnvbiDBAAAAMoS5w7Ov5Ul/f/0I1eXNPmLwgcgCtNAWY8A0fOIegPois+L6vpRf//eBp7LFNAVC+g7b6ASoMQqgMf8r2QigJcE6PPHAtY5BEAJEiDQCyCfCuAYArYVVgDy1WrNfuASZizg8OYEJwEQtau/LFFAFfPHu0Kg29lfVAlAtTJgaPIvu+uv3dVfljhIEscHijb+VASAaAygKVNATyygewUgTwbMvBl3kAAAAEDZoX3T3R/1Nv42GVD/5LfzzQ7vZN/7dd0KAeoUAFFlgay0X5eSQHWiL3t9KkVBVN+/9/OgyT9bCTCFrQK4bzJ3LGBwKsDkYAKgSAXQwWcIuCJLAORXARgqgLwXQK+TClBYBWAZAjqrAOufnsBYBWiwDr+Q1BjfJ0sM8Jr4qSoCZL0CqFICZFcBeHfzRY+XbOZFzfuoVwDIlQBhqwBhDbjs8VQSftnjdTf6Ia7+UnGArmNfu9LT/OfqFzd8BHeSAAAAQNkgY/y3bt4TzS7Hf0cJcPpDXWWz+2+KGFDd5VclEFTj8VQbc9PXp/7+eX/+wrGAHgIgyAvASwDUecmAkFhAHwHAWgVY1cEwBGRFAha8AGpX+EmAIi8AtwpgcarYDPD2LAHQsuwy6/fPN/oIgOF0WTuDpv6mGn7T8X/UHgC6TQCDJP7UKwQRxwOKEAOsz424/Sc1rhCYWguISvpPbQLo+fyVgFjA/d2PwxAQAAAAKBtc9Oytn2tmxP595YlvMBshX2MU0eS/XAgEapNBXN/c9Ut5ADC9AIJMAe+dUpIECCcAwlcBale1p8tDAvT5VQC2MWCm0Q+IBazL+QB4UwHqctN/p0bd1Zpp/vNeALlYwNVPXeDxAcgZAm5NcDT2cWj0qSf4sg2+afd/XQ08cYMv6uova95nPNZPtoEPO46aCJCV/POY/KmY/hHv/JdSAtixgKxUgAOzP4M7SgAAAKAspv/j1914oMUz+bfrpAeuEmrUVRt+08SAjnhBkcm+6i489Y4/9eQ9qutT/vxLuv/7yAA2ARBkCBjoBSCgAii5CpAzBLSNAO0qWgPwKQHSx7HSAJzKGQIWpQIsznoBjL6jWAlw5l2TrH97voltCLijmeEBoFsBICv1p04B4CUeqImBJkkzwGZFokDURNAQMRD2fHJigNf1P0k0+Y8zMZAQ8BTgJQoiIAZ2n8tSAFjWwZn7oQIAAAAAYo/z1t2cYkn/3bF/vBN/0w29rvOL7qJTpRLour5qg1yp1+f9+Yt5AYiRAGIqALs68h/XpD+uyX3OMgS01QC2KiDQCyAgFtDb/DupAHkVQIYEaM96AdzTljcCdKcC3PLIRKYXwKGtjQINflxM/3gbcCqJvywxoFsREObWH1GcH1X8n6hJoHFFgHdFIC5xfmHNfKnd/4SAmSCV6V8jp0dAKS8AOxZwEtsL4LVZk3BnCQAAAMQWPRtWvX/c+nl/9Er/g2L/qCT9QYRC1CaBVA267EScOo0A16e5fnCjH0QGyHkBeAmAmv6OTHGrAFiJAKsZfgD2CoBdfe35dQD3KoCtBKh1Gv9lBS+ALAHgUQEsSVmj73CvAmQjAceka9tz4zwEQLYOv5Q0JPXnmdSrTOxF4/3i4gFQysyPp7HnPZ8iMSAb4yfq+m/M9E/UvT9st1/0eKqJvuxKAK8JoKndfw6pf0miIP03vX+6XwVwYMYfrde734c7TAAAACCWGL9u3gJW7N8nH5nFbPx5d/5FlQLVVqqTat3mgrrSDZRj+RS9AqjMALmKpQAoqQKYLLwG4FYAFHkBrG7PTf5dawD250WGgO1FKgCvIWCdax3AIQIcFYBjCDhyaU4FsNAbC5hVAUxec6n1p+cTRSsAGUPATfZN9DiD5n66FQBRKQVUJf+qhIFsg0+kFJB195eNBYxd3J9sg9+kWRFQSimQMEAEiE74Rc0BXfXqxexVgAMzv4c7TAAAACB2mPzcnX/nlf47sX9OE1Rq4q8y+af2DoiLZ4BqY6pKEOD6NNcPrJDJf/HXJ7NjAWUJACkvgE4fCZD1AigmAGwVQC0jFjD7sbMKkMp5ADjxgCmrzjEDTNcYVyygQwDYSoAfDE7wEQB2vbs9IdGIqxIEspN61fNRNeKq51Od4Iua/Sk2+rwKgN0K+/27JFYDyKX+so/rmvyLKgB4z6NalCsBjRKKANbjrlhAtxmgXf/Z87e40wQAAABig0zs3/r5g17TP/vjMx6eIezuL5oOoJoaYIowoHKXp56UU+22676+bqVBFB4F3oa/tBJA1AuAjwTwTv7dngC2R4CjAij2AvDHAtbmVgHyKoCV7fkoQIcE8KUCOKsAOSXAKCcZYHHKpQBwPAFarS8vvdz6dV4FUGwKeOTl5pDGnkoRQC3l523IdSkFmkMac9nHZY+LOL6PSgFA3vCLNviyx+me/CcEY/1Ej6dSBPDu/IsqBUKO23NBgApgxloYAgIAAACxwYXP3PZ5Vuzfl35wg5TkX7QRj9o8MK4pA6oTa6oGXfdxuib22hUAwusAMiqAyaUJgP5CLCCLCKgr5QeQIwFKpQLUOUoAxwfAawaYUwGM9KgA7Bpzd2vRKoBNANgqgMU/uICpAji0NRkSA2jCA4BC8i+rADC5969q+ifj+m/YFFA0DtBY7B+F6Z+M679pU0AewoCHIDDlAUDlEWDHArazSYDXrz0bd5wAAABAHKb/fzFu3fw3WPJ/J/YvjABQ9QQw5RlQbisEpnPucX3NBEB/gB+AsyrQnz3GSwDkzf8EYwHzCoAcCeB4ARQpAFwqgFrHBNBRArgSAdyrACNXsL0AMgRAxgywPasEWJL+2CYAFhR7AZyc/vzghmZ2LOBLTWXQ6IsqAVo0Sfjj6u7P2+hzHici/d9lYKIvTQxQNfpUcX68x4W5+/MqA+Ji9ifo7i9DAOweH0AAzHwdKgAAAAAgcpz33K2d3sm/XWd//1pht35Vyb8u74BKVwxQmwjqfr73saj//0udV4sKQDEWsCgNoN8t+e9krgL4VQCdxbGALgKgtq+DqQIIVgJ0eFIBCgoAmwQYfU9rsRng7VkVwDceuogZCzi8uVFB8s8r7Vc9XtXNX3UVgMrsj1fyz5MW0GwZiwGUNfGLTPIvSwhQpwWYnvTzmv7plvxTmQMKEgLeWECnDs5ox50nAAAAEBlmb1twbMvgvLe9k//EUz1FsX+yu/hUHgBx8wKoVOWAatyhqfhFHVJ+letTEQCOSsCvAOj0KwDu9ccCFq0AuFIBnMqnAqzypwKwCAC3GqDWlQjgNP11bhWAxwtgpIsI8MYCOkqAHz/LNgQ8/GKSw/xPZfIvK9VX9QIwMfHXsdsvav6nSd4vK+2nbvSFiQHV3X5RBUAcpP0iDX1Ss/mf6m5/2PFBlf4d7ZvG8gJ423qz5/24AwUAAAAiwYSnb76thSH9t2P/eBob6sadxwtAR0NngiAwufuvw+zOpELB1PcfnReAxw/A/ffHawYYtgbgIgFKxgLaSoDVhUQAtxdApvnvay/2AlhRUADUlfICyPgB5GIBF7FjAS9afqn1P4xYQFsNcGSnyfg/GVPAcoj/E53869rxj6k5YGSTf9HJPrUXQFyJA1OrAaLu/gpeAK9eFKACmHkL7kABAAAA47j0RwtrmLF/P/xWyQadcvefWllgeuUgbl4DUTfOlXZ9aQIgN5n3ewC4Hw82BPR6AXgVAPnzBK4C5JQAPmIglwaQWwXIewGs7izyA3C8ANxKgHwagGsNwIkF9BMAHkNA2wvgztbiVIDvZeuBtecRxgKqxvhRu/w3x8zUj3dFQNbEz5DkP6hhVzXxIzMBFI3xo3L5NyX5D2rYVU38wkwCdbn/iyoGBFcBXrvC1fx3FT7+5TeOx50oAAAAYAyZ2L+1855lxf6d/nC3cowflWRftvHmfV5c1gJMmtZRXp/q/7tcvn9aBUAnmwBQiAX0Sv69BIA7FrCwCsAmAIoMAfsKzX9diAogbwiYjwXMGgKOWpSyRt/e6lMBfHbh5davNiR9ZoCZWMAdzRFN/sMafCqPAB3EQRPBzj9vgx/RZD+MKNhFtDKgXRmgau4nYvZncuJPtTKguiqgugogqwzw1J7z2SqA/TOehiEgAAAAYAwTn1nwJdb0/4s/+LqU6z/v8RQrADIpAdReAbpSCspJ8l6p11f9/bPd/z2KgPznxSqA/HkCmn9HCVCUCtDv9wJgrQE4qwB1XiVATgVQ6/YG6HOSAXJKgJwvQK1nDcCvAkhlCABmLOCSlDX6bo8KIEcCfPexgFjALY2KO/2qu/q8DXxcJPxUE33VRl+SGAhz++ed2Ac9JzYxf6K7/qKTfVklQCm3/yTnxD4psOufVJzyi5r3Ua8ACCgB9npjAXNKgAOzv4g7UgAAAEA7BgYGjmoZnPdvLALgxAeuFGr4ZRt0am8AXRJ8mAdW1vUjWQcQMQX0/v0HxAKW9AIoavgnZyf//R2edACXEmBVSCoATywgSwXQy0gFSNeYO/wkgJ0K8OpzLUwSQG8soKwJoOiEP24rAireAAZNAUXi/2Qm/btNTfpViQLVWEBZJUAYISC6MiAy6TcZD6ih4ffFAo5jqwAOzHjTsnr+AnemAAAAgFZMeObmK1nN/+ceu1Z6si96nOx5qJ7nnfaKKgiqlUBAiSkCmF4APm+AXKOfWwlgrQIEeQIEVSEVoLNoFaAoDcAmAmwzwJwhoOMH4KgAsmaAHRlDQDcBwFICeNMAvLGAeRWATQIsamOqAGbcd5H1DoMAGNrUQLjzrxrPR9XoUxMBTZLu/6KT/IgafeoGXrbB321q8k8h+W8y6AEg2sDraPAbCXf5qZQA3ljAy4NiAafizhQAAADQhqk7ej8wbt38IVbs30jpWDN1YkCX1J5a6l9OqQMo9Z+/KvHDbQYYFAsYqAAITgXwxwKykgI6CmWvArhUAP5YwPaiOMBMMbwAfLGAeQWAowJoL5AAd6Yb/wXFBIBdg+vPDTAETMbcDDCuk30qM0ANxMAuTQqAUkSBqFeA9h1/kedTeAEkNSsAVGIAkxqIASozQBYx0ChBDCRzsYBdxWaAB2YMWW/NPhZ3qAAAAIAWjFs//w7W9P/MgZkkDb6sF4Csy7+udIBy9QKodmLB9Pev7AVQ9Hgndywg0wvAmw7gkvznjQFZqwB5FUAHUwXgKAFGOgqAvkIqgM8PwKsEcHkBjGSpABbkCIAcCZDsvcz63YZGJglw5OVmjV4Aop4AleYFwPt4TEz/eCf6VDF/3Mfz7vDLSv9NeQHImv3FJc6PKv5P1CSQo/ZcyFYB7Ju5AHeoAAAAADkufe6Okazmf6wr9k+2VM36VFcIVCf/st9PuUyk0eCb/fmzpf4lykMM+JUExVUgAooJAJ8pYL7RD/ICcK0CrGr3pQI4BECtKxowYwyY+9jtBTAy5wfgXQdwewE4qwB2KsDou9iGgKueOJ9tCLg1oTC5F93dF5Xwi55PlhiQjfETdf03ZPonO5FXJQi0Tfx5SYKwhl5XGkBYU58UMPNLEpgFUk30VSf/jZIT/SBFQEgVxQJ2FxQB+2bV4k4VAAAAIIMdNdM8OG8DiwA47aEuZQKAikBQNQeUPU7HBBiNe/UpA7i9AIKUAJ5UgKBYwAIZwFYA5M0A+z2xgGv8cYG1jieAKxbQSQUoGQtYSgXgSQVwrwLUOasAi9qYsYBn3NlqvfnjJrYhYGgsIJWJn+zEPy6mfaLu/rKxgDFVAGib8FNJ/kVXA5IxK+oGn0opIOvuLxsLKFmvBMQCHuj+EWIBAQAAADJc8MytX2U1/194/HrSxp3KxI9KQSDq1m66kadSMJi6vqnGvFJ+/tyTf28soPfvMsAMkCn9dxEAXvO/IAKAuQqwmrEKsLKYBLBXAupKxAKOXJ7KegP0ugkAVyzgPW3WyNsvL5AA35tkjU7X/IGJTAJgOBML2Ezs+K8i5ddl9qeyu6+y2y864Sea/Ks+vptTQRCZuz9vrB/V47xfD9vBF/EESAg8LxGDaiRw+VcgCDKxgB4vgExd/WXcsQIAAADKGLAGjho3OO8td+PftHZO5r8n5GL/RJtxKq8A6kk/9eoA9XFaJedl1MiXC5FA9fvnVgA4j4V4AYStAviIhTVsTwC2F0B7IRbQIQFcXgB1KzsKKoAVPCoA1xrAUo8h4OKUNfoOvwrArm3PjmeSAIdfSmqQ4ptOCRAlA6jc/WVTAzSkAOwiJAioJ//CREFSUtpPFQNoyv2fKuaP2jtAVtpP5REgUfbrhE8F0GWrAP4dsYAAAACAMiasu2kGa/r/2ceuiVzqTy3ll23YeNMIEBdYmVJ/qt9r4N9foOQ/IBXAswbg9QHwEwGllQA+AsBHDORWAVZ3FK0C5L0AXCRAbV9H0RoAcxVgBZ8XQMYPYCE7FrB91UXWn573GwIO27GAu3TFAVKoBcrB9V/2c82SfmrJv3EFAK+7fxMnIRCXFQBZyb9pBYBoY08VF6gaC+hRArw+azruXAEAAABpTHr6u3/ZMjjvkHvyb5cT+xe33f+oiASqlQAqokEXQVBt19f98xf5fbMl/0ErAblmn0kWdDK8ABipAP2dTBVADUMB4FsFWMVIBehzlScWkKUCqGOoAGrTzX/t0pQvFWD0nVkVgL0OMNJFAvxg8LyAWMAEUUyfbIOvixiQ3c2n8gTQbPpH1egHxfyJNvpk7v68zyvl7i/SkMsSA2EmfrIrAbITfN7jeM3/EoKNvGyDT0UKOLGA3V4i4JD1q54P4A4WAAAAkML4wRuXsKb/Hx+YoaWZl23wqdz4dUn+3V/XsSNe6ZL7uF7f5M+fKxbQ7QVwr98MMEgJ4F0FCCQCcgQAaxWgTmAVIK8CKEEC8CUCFAwBHQ8Atwrgnxdfbv3X88kAQ8AmQvd/VSWAaaWAClGggyBo1rsKoJoWYGzSL0oUJImUAKaUAgnOXX/dE39REz/qWEDC2jORkQiQMQRciDtYAAAAQBjnP3PbGGfi7xRV7F/UigFRBQB1ioCsFwFV2oGp60e1M089gY/Fzz/IA6AUAcC6PjMNoHQqgDcWMK8CYKwBMFUADC+AkStLkAAlVABuEiBPANgqgLtbswqA712eJwHsjxc9foFALKDsxJ+3gde9GsBq4JsIFADUSgDB42Um+iINv+xKgHZigMrMT0c6gIxZn6oXADUh0Eg08ZeJ/SMkBvKxgN5VgK+Nwp0sAAAAwA07Smbcuvmb4xL7p9qQ65L66/IYoFYeVEpMXlyuHybV170iEDj59z3emTcFLH6+mhdAaCxg3gvAswbgWQXgjgUMUgHklAB1S9ususWt1qgFfhXASemPD2xoYasAXmoinvzHbaJvenXA8O5/kJRftxdA5J4AVISAbrO/UsdRNP5x8wQwOPkvigWc4Gr+u9yxgJsQCwgAAABw48Jnb2lwJv6UsX9x9whQ9RQwnTIgu7su+v+v6/q6JPrl8v0LE1LeRj/MC8BJBGCdr99fTjRg4HX6O3wkAOsx7ypAUCxgngToKyYBalak0uVSAORIgNplqUwVUgFSRUqAUQvdXgCX50mA6x+6kB0LuLlR0KVfdLefmghoEozpE2nYKUz8iEwAZWL8KFz+jUn+eaX6utIATDb6IiZ+piT/YVJ/qsm+QSJgb4rlBWBZB2eOxR0tAAAAEIqeDT1Ht6yf90svAWB/PuaBK8q60ZdtyKTj2zjd/6kk49S586bc78vl+rK/f9Lr88YBug0B72UoAQLNAItXAYoUAAEkQObrRZ4AfKsAQiqAvBKgQADYhoC1vW2ZjzOrAEuKYwFtQ8DMSsD3Jlk/evZcdizgi0mOST5VfF/clQFNxCsDmpUBvLv8osSB7HnJiALRxl52179JMyEQNPGn8gigJg6CGnoqt3+NhID9urKvy0MA2DXjl9bAxKNwZwsAAACUxIRnbrraO/m3m/+zHrmm7Hf/dRMKrMd5iAHRRlZ0oi270061ylDp15f9+cuYUoqtAOQIACcW0JMGEFRBqwC8KoBanwqgmACoSTf7NSsdP4BsKkBtCS+AjCJgeSq/BpBRAmTk/4VVAJsAqFvSZo1c2FocC/i9bF2w4hLrDxsYKoB0HdnJu6Ove8KvS7Iv2qBH1NCreADskkgJ0NLQJw0qAkQVAlSNvqjbv2iDrtLQNxpUBJQiDhrN16uXFq8AOGTA67Nm4c4WAAAACET34N0falk7/7Db9M+uxqe+Y9VJSOPLveGnMovT0XCKPC8qd3vZ61Pv5qt+/6rSf9bzlQkHbgKgIzASMHMujlhAnxcAiwTgWQPgiQVcwaMCYBkC5rwAlrRZo+4qXgVwlAAPrD2fbQi4LVHmk37R3XzqFYKIPQBkd/lFCQJhYoA6/i+uHgCyu/yiBIEoMSDq6i/a8MfEA6AoFvAq/yrAge7D1v7rjsMdLgAAAMDE+HXzl7sbf4cI0BH7V06rAqZWDqiJh6iur8ttn/r6Or5/Hb//UCVAaBVWAHiUAAUyoIPfD6A/IBWASQK0c8UCOl4AGQIg89+cB4CjBEg3/tk1APu/bflEADsWMOsBULwKcNY9l1tvbSgVC8jbwMs2+KLPk935FyUGRBv4mEz+RU39tDX6osoA1Qm+bIMv+jyenf+EwM6/rkbflNt/1A0+byygxwzQ/vjgjF7c4QIAAAA+TNp4x8neyb/98Vd/+M2ya/JNEwOikm/dUneqtABdsX7Ven1VoiI0DSDMC8BNBLjPG+IFwL0KEKoE6BAiAbIEQMoXC5g3A1zmVwH4YgEdM8BcLOBtj05kGwJuaSSIATQ1+acyA6Ry9xddHYiZGaAx8z/qFAAd8X5RmAGaMv+jTgHg/brhem0qwwsgXT+7+gTc6QIAAAB52FExLYPzXnAIADcRcOqD06tm8k/1PNHdbl3xh7K78EErB1FdX1U5QPH9UzxO/vvnVQBknjc5W6zr9xOmAvCuAqzuKPICsAmAQC+A/CpAKlPeWEBHBZCNBHRiAdusUXe4vAByiQCj07XnR00lDAF1SPl5zyPaoKuex5SUv1mt4RclBGTN/CKP+eOd2Is2+rzHi5j6yXgEmPQCkDH7U308JoqBV84NiAWcsR2xgAAAAEAeE5+9pclr+mdXucX+6SIIZF3fdZ3P1PVFH5dNV4jq+lF//6q/f34PAI8CgHV+pgJAxAugMzQWMNPw97WHJgK4iQCvF0CdNxGgaBWgLbcKkEsFWJhTAXyv2Atgev9F1jsMAmBoU4N1ZFeczf9E3ftF4/p4z6dADOwiPm63ROMemRdAUtIkUFYRYHr3Xzbuz5QXQKOkSaCoIiAGtbfNrwDI+AHMSuCOFwAAAPh/ejZsOHrcuvn/5W78nY9H3z+1KggAXQQCtVcAVeNq+vrKDW6Zf/+q3gElS8gMMNgQMDgVoEN8FaCf1xCweA0gowZYmSoiApw1gBp3KoDHC8C9BlCXUwLkYwHv9KwCZFIBLrcG17NjAd/dnpBo8HUTAqJS/qBz6GrwiZQCohN+mefvilNRmfvpJgJEJ/yi5oCmK2xCT6kUiIgACIoFPDjjPy1rw9G48wUAAKhyjF9/4/Us6f9Zj16NyT/xCgDVpFj1+jL58yLeBtTXF/VW0PH961glIfn9cxsB+okBv5JAkAgoJf9f7ScBauwIwFVhhoA5JUAuItC7ClDH8ALwxgLaSgBnFWDkPa3WaLvxXzCpSAXQuPzy/xramPgViwQ48nJTmU3+ZRt8WaVAUzyKdzJPpRQgm9Srni8Zk+KdzFMpBXhj/0Qn+KLPayyP2nOJ3wwwQwLM/BrufAEAAKoYU5/t/avmwXlHWLF/tWUU+1cuk39Vl37ZSbOqKz+ur3Ze6pSGwFjAkpP/juJGX0gF0CmvAljtTwXIEAGuVYBiLwD/KkDeDHCFowDIPla0CuD2AugteAGMvGNSlgBweQHYBMAZq7o/d+gnEz/DjAXcmlCc/FO5/Yc1+LJKAcrJv8LOv6gUn8oLwJgZoGhDH9bg64oB5NntTyh6AURhBija0Iu6/8ctBjAoFtDrBdB1xHq950O4AwYAAKhSjBuct4YV+3f6w91o8AkUAVTpAqq79bKNqGjDWinXpyYIqCT/JY8TUgGErRUQrQLwGAKuLqgAbBKgZmVh8u9dBXBUAA4BUOtNBXBWAXJKgFGLUtboBa7p/4LsKsCJd7dvs82w7Dq0JbkpOBawJWKpP9XzZCf7hhUApUwAd0msBOyOi+yfevc/GbMSNf0zvQrgleRXiQLAFwvo9gLoXoU7YAAAgCrERRu+e5pX+m/XV574Bpr9iNMFqPLiqU0Pq/X6ZfP7pyIBZFUAq52Jf6d/HWC1nwCo6evIlLMK4BAAvlQAp/F3/AAcH4AVBUNAZw3AbQiYSQFYkKvbJ+W9AP5xxTU1zuvgOztaR4THAup291eN5aPe2ec9H+dxuwRN/WTc/XeZcPenkvCLKgGiMvvjlfDHzd2fWgmQiIe7v3Qs4GR2KsDrs0/FnTAAAEAVIRP799S8l73Sf/vjkx+8Cs29YYJA1yqB7K47rk9rGhj2N0BGcGgnADqVDAGdNYAMIcDwAvDGAnpVAN5YwBonFtBDAtgKAHv6P+qOVmu0XQuyPgB283/K3R03el8P39nWMocZC/hSUtPEn1eaT20OKNrIa5r4i5r4iRIEokoA40oBVTd/EYKAcpKvK/4vSkUARTxgzEmATCxgt18FcLBrB2IBAQAAqggTn7l5glvy79Tnv/81NO5lrBzgfT6VmZ4s0VFp16f++SuVKAlAmQrgNf+z9/1Xu5UBLC+AjjwJkI8JzKcCFFQA7ljAggqg3U8A2JXb/c/W5Zn/2iqAMQva3pk4sOBYHyH61uxjhzY2DrFIAGtXVKZ+KmZ+1IoBQ5J/XWZ+snF/ZK7+VF4AcZn4i3oAqCoGZBv7sPi/ct3tl6iftrpIAJcp4Oszx+GOGAAAoAowdUfvMS2Dc3/rnfwnEfsXeYMfVUMsMsmmlOaX2/VNEQVK51NIBVBSAazhTwfwrwLkiADHD8AVC1izstgPoC5vCthe8ABY7qQBZEmAkfe0Zab/bhLAJgDOWNJ1ftDr4vCL559LFwsYR6KgifC4iAgCVaKgbHf8o4r/oyIKdE/+w9z9VXf8yyj+LzAWMP3vd990hgqg+zdW+p4Qd8YAAAAVjnFP3/RN1u7/px+5Gs17mRMHpK7yGq6vO3Yx7tc3QhxREQAkXgABsYCrC2sA2TSAYkPAYi8Ae/qfKlICOASAWwVgrwNkEgGWptINf7b5t0kAhwgYc0/qX0vJXe2vDW1JvMGMBdzRpKlhV10RoHb5NyT555Xqi7j5R+rqr8vlP26mfqpKgCQBIdCooAQQdfmvsMrHAnoNAWf+C+6MAQAAKhiXbl78YVbsX8OT30nf8CP2z/SuP5XZnK7rU8XnVdr1Tf/+ec6rRgIQEwD9nkZ/jV8ZwEoEyJoCtvtWAbyxgPk0gBUOAZAre/p/9yTX5L9Qnx245pSw10frhctOUYsFpJrsUxEAEbv6yxIFopN/Xll/EHGgTAqoEgaiKwO6iANeyT4vAcC7QmB61z/seF6PgHIjDhKeWECHAOg6Yr3Z89e4QwYAAKhQtAzeeD9r+o/Yv8oyDyy3+MJKu35sVkgCmvMRuSr+nMAQcA272fdN/ld7VAB5JUDBENCtBKhxPAD6suWNBXQMAesWt1oj75xkjbqzNV0FH4BTFrWv5TG7so8Z3pR4ghkLmDEEpHL7V1UE6I7vkyQGeEz8dhEqAkQUArtNmvjxNviqDX0TsYRf9njqRl+WGAhr+AUa5UpVAuw5n60CeH3GvbhDBgAAqEBc9OPbP47YPxADcSIcRE3xKu37115aVQAhBEA/o9lnqQBYSoCcIaDbC8BeA6hbySYAMqsAtvz/bjcB0JpfBfhi3w0f5X2d/OPO9o8yYwE3NxK6/asSBKzzNplv+E3H/8XWA0DGBDCpYYVA91qAqgmgaXf/sIk+9QpBmZQvFtCpa8/AnTIAAEAFIRP7Nzh3D4sAQOwfUgR0rRzg+uVBAJRUAKgkAgStApRQAeTNAFd35GMBa9zyf58ZYNYPoG5Rm1V3V5YAyFRm+t9qnbq442rR18uhzeNmBhsCyjT61BN83obdkORf9wSfqsEXfp6quZ9sA2/aK8C7oy87+Y9K8s87+edt4CvcK+CV8QFeAF27EQsIAABQQRj/9E0XsJr/f3wMsX8gBqKPtyv368eZGBhhWgUQGAvY6TcG9CgA8gSAOxbQvQaQ/lqd2wfAUQJkdv/brJF3tVmj0uUQAKPvbvv9VAmHa2vH1GOGNiZ+51MB2IaAO1Wk/lQKgjCvAM0KAN7JvqwCgDcFwFi8ny4zwFLHyzTyTZZ5M8CEgKcAleRf1vVfhChorOzKxAIySICDs87DHTMAAEAFwL4BHjc47/fe5j/x1Bxr1P1T0DiDGDDWGEfiih+T7z+OKgC/F0CnNUKYAOBYBVjD8AcI8gPIkQDuWMACCdBRpADIqwIWtWam/3W27D9fk6xTlk7/quzr5jtbJ36FaQi4LaHR7E/18bAGPyamf7yTeSqJP/fxopP8IEm/aS+ApAEvgATn7n9CwExQdtoPLwCaWMBprFjA31kWYgEBAADKHuMGb5zLmv5/6pHZaI6rNC7Q1M481fl0uedX0qQ/jAQYwWj4g1QA4kRACQUAq9n3PF7rUwJ0uCrnDdBXIAEcAiBjCtibyjb/d00qIgFOWNiuJGe1n/v2xuROpiHgy02S7v2qygHR84sQBAbc+1WVAyLnj2T3X1bCL3o+WWIgzOxPdMef1wTQ1O6/rIRf9HwVQgzsuZitAtg3owd3zgAAAGWMzm0L/obV/CP2D2WiITbVKJddQx4TFQA7DSD3+b1EJECpVQAWIbCqvZAC0FcwBHSvArg9Aezd/5H3tGVWADIkQI4AOHvFtNGqr5/vbE/VZpv++lzlVgG2NGpWAESlFIiJAkC0sdduBigq5Zc1BzRt9kfh7p8wQASwGvVGjYRBFawA5GMBr2STAD//+odxBw0AAFCGsCdY4wbnPcKO/etCU4SK3Oyu2q9vmgDgUwAUCABlQ0Cm7J/hBVAqFtAxA2SkAtQuacs4/2fKpQI4aeHkXqrX0eHNzX0sFcDhF5MKk3rVyT9VM654PtlJPW88oPY4P1OTfyqlgKxrv4gCQEQhoFqq55Od4FeJ2R+XCuC8AC+ArgEYAgIAAJQhLvrRbZ9kNf9fRuwfCoqAqlYBlJz8u1cB7i2UMgHAWgnoZ6wCrG53kQAdxSoAdyrAipQ1amHW/K9AAGTIgMPjnrj1OKrX0d++0P2hoY2Nh4sJgHpreFO9dWQXlZSftyFXJQokGn6ZRl6UCJB1/yeb/IdJ8WUflz0ubpN/Xq+ABLEiIKzBlzX9q3Bpv2jt7WSTAG/OOhN30gAAAGU2/W8enPcaiwA4CbF/KBSIAI6VACcVgJ8E6OTzAgj7PEcAZFcB2F4AdUuysv88AZAjAc7ondpG/Xr6zrYJraVjAUXd+HmJAAqCwKCkX4fkP9YKAFnTP13xgCZc/2UIAlMeACqSf4p4wIqLBdwLFQAAAEAZ4fx1N19S1Pg/la2zH7sWDRAKBQKASwlAkgqwhiH3937sMQksUgL0MbwAVrRbdfe0WqMWtlmj7knlm/8xi9p+NWANHEX9erphQ8/Rw5sSv/J6Adh15OUmiUZfVAkQkx1/qkaf9bjMBF87IcAr4ad296c2+RNt7HVN9E03+rKNfBUqAV6dFEACzLwId9QAAABlgO7XB9/Xsm7+H1ixfyPvm5Kb6HVkypcZfm8HGiQUqsIJgCAvAG4FAFkqQDtzFSBPBKz2mAHmSIC6xW0ZAmCkXY4K4K5W6/TVV31K1+vqoZcnfsqvAqi3Dm1tJDD/UzX30yz5lyUEqNICeIgAI5N8VXNA0YZf18Sf2uVft+Sf93hZgkDWI6CSqokdC3ig6w/W3p734s4aAAAg5hg/eOMtPul/uvn/xMAsND8oFEpAAZBTAajGAoZ5AbCiAosMAQuxgLXL2626hVkCwCmbADhx8eTndcpV7XMf2ty0gZUK8OefJAUb8qgn/oLn2aW420/lBRCbib/obr+qYkCX+V9UE39VYkB0t5/XLLDKa89FAbGAXTfhzhoAACDGaN9090dZe//1T34bsX8oFIrpA8ClCKBMBfCuAqwpTQK4vQDqFqd8BEDd3W3W2Wtm/4Pu19e3t7X+AzMWcHNDSKMftJtfIfF/YY0+tRdA5J4AMkSBitQ/7Dged38TqwOmVgNEJ/eqE/5qIQzS3+NrV7BJgF/c8BHcYQMAAMQQmdi/dTc+4d75dwiAUx+cViTvD1oB4P06CoUq7xrhavC5lQCsVQBZAoDV8PeXigVMN//L7N3/tiwB4CIBTl065dumXmeHtzV9ix0LmNDg8h9RycT46XD512rSl7TUUwGoXf6plAEyk30KE7+k5l1/3hUBWbM/KAOsVwJiAQ90Pw5DQAAAgBhi4vpbP8OS/n/pBzeg4UGhUKFpAEGEQP7r1F4AeSKgkz39d5MAK1NW3aLWLAHgIgFGLmx7O7Wh5/2mXmff2jb72OGNjW+zlADWLt4Gv1nQAyCmxAHvLj/ruF0EHgHkxAGvZJ+XAKBy/zdVQZN81fhASoJAZBWAyv2/SmpnQ7aCYgEPzDwLd9oAAAAxm/43Dc494J3823XiA1f6JvveCT8m/igUFAA1AUqA/Nd1rAGsZhAAjFjA2qV2w9+am/wXCIBTV01rMf16O7R94rjiNIAsEfDu9kbBOEDVhr6ZpnHnle7L7vqLNuiR7frLHk/d6FOnAIg06DLHU0n4qSb6qo1+hRMDTqMf9PnucWwC4ODM/VABAAAAxAjnPXPTJJb0/3OPXYvGHoVCcasASpsDBqQC9FOQACUMAfvaC7L/ha15AmDU4o4DUdyQ2tcc3pQ4wEoFOLKDIhYw5isCokSBqIlgZMRA0IoAlQlgqYZf50Q/KegREIdJvw5vAEj/lWMB98+6DHfcAAAAMUDPhlXvb147909Fk/+nSsf+8SoAoAxAoapPDRCkAHC8AAqvD5IkwBpOJUCu6pa2FRMAORXA2auuOSmq193hlyedXFgBKKwCHCoyBBT1AIjIK0CXS7+oB4DRRl9lgi9r3mc61k+lgU9qmPzzSvtVd/kh+ZdWBOSVAAGxgPu7/mS93v0+3HkDAABEjPHr5i1gOf9/4pFZyg180HNBDKBQ1RMLWPx4QQHATwB0liYAWLGAzucr7N3/tmzlSIDahZOsExZ3RmpKZV97aEvyMbYhYDLA9V+VGKhQM0Cj5n8Uzw/zCtAt+ed1/U8QTf5lTQTjYgYIYkAuFvDCgFWAGd/FnTcAAECEmPzcnX+Xl/27FADn/PCbbLMuRS8ANP0oVHX4AQQTAQEEgKgfAFcEYIdVuyTd8DsEwKKCCuDsgdl/E/Xr7/+82PoRrwKALxaQ2gugKVovAFFPgLLzAlBt2GWJAd2KgDDJflRxflTxf6ImgVU8+Wd9nokFnMomAf7jho/iDhwAACCiCVTz4NzBot3/XJ3+cBez0eed3ItO+KEIQKEqxw8gPB6ws0gJoIsAqF2WsmoX+wmAU1dPnR6X1+GhbeO6WKsA725PCDT2hrwAZCf3orv7oq79xrwAeBUBvDv+VASBTvd+nsae93zU5n9Uk3/Vnf4qIQZ8DT7HcXuCYgFnrIUhIAAAQASY8NxNZ7Ni/77w+Ne5G3Z4AaBQKK8KoLQHgKsoYgGDSIC+9nTznyMAciSAXaOWpv7P1N7eY2JDxO6YeszwpsbfemMBh9N1ZGfMTft0mfjJTvyNl6q7v+zjsk2+bsJAtsGnUgrIuvvLxgKiSioA8rGAKTYJ8Oa1n8WdOAAAgOHpf9O6uW94J/82CXDCA1cYi/sDYYBCVY8ZoJ8YUFQBlCIB7On/opSPBDh9xfR/itvr8TvbL/hnvwqg3jq0tTFkYq/J7E91d1/kGipSflGlQKiZn+wEn+frOib7qucLm+CLPq5r8h9m9qdCFqhM+KuMIOBRALC+vrslwAug+3WoAAAAAExO/5++uaPI9T9Xn33sGqmJfthxuokEFAoVn1WAEZzlNgVUUQGMWNOeqTwBsDLb9NcsypZDAIxe0rkjjjecGUPAzYkdXi+ATCzgyyLmfzFx96dSAOhKCSAz8RN16VeNAaQy++N9XPa4qCf/VAoAxP3J7f67HnPq1csCSIBZKdyRAwAAGMDsbQuObV479+0i47/0fxuf+o5Vl4v9423kqSb3IARQqMo2BAwzBeQnADpDFQC1S53df0cFkCUAPvfgrNrYqrJeaj/e3fjnYwG3NJbvCoCqm39sVgCod/+jjv2jMP2Tcf03bQooGgcId38tCoHM4+mf476rGCRA99vWmz3vx505AACAZoxbd+NtXtd/++OPD8wINP2TVQLIpARgJQCFKm8CgNcDQCQW0G0eWJIEWOGS/DskwOKUdcLyKXfH/bV5aEvzctYqwOGXkmbc/WV382UbedkGX5uJX1JxJYDKEyDujb6o9F/1OFnzP10T/QQaex4lgPfzPRODVgFuwZ05AACARkx89q4R3sbfrrE//JZQg07VqFMrBkAUoFDlRwSUjAYUUAGMWJ2yaha3FhMAGQ+A9sPjnrj1uLi/Plt7p31waGPDYV8s4KZ668iuCOP+qIkCHsJgl4BngHGlgKqbv2nJv8jxMgQBL4FgetIf5h0Ayb9WQoD1eFAs4C+/cTzu0AEAAHTcXFrWe1oG5z7Hiv077aHpJWP/VBUAqmkBaOxRqMpZBRAiAERIgGVtDALANv676tJyeZ0e3j7hMpYK4N1tifJVAFApAXbrbvh5G/KoJ/6qxIDobr+oAkCXvF/XxB+xf1oVAO7HXwmMBXwGhoAAAAAacN7Tt/wTy/X/i49/nbtR19XQo8FHoao5FpCAAFjVYdUuSfma/5FLU/8+MDBwVPkQtQNHDW9u/PdiL4B6hiGggcY/6FhdxEHsJvpUO/66zf5UVwFKNfoJDV4AJkkDTP6NxwGGEQdBsYBvzPo87tQBAAAIYd8Ap5v9n/sIgHSNuf8K6V1+EeJApNGHlwAKVYUqgIBYwAKRUPADGOGZ/tfasX85AsBWAThKgDPvn3Vmub1e/2nHRZ/0pgFkYgFFDAFVYvxkJ/uqJn6kJoBJwkY/7iZ+qu7/VC7/piT/QQ27qokfTACFXP9FlQH5xwNiAffP+Lll9fwF7tgBAACopv/P3HIFS/r/mUev4WrsVWP/qBt5FApVaQRArmRUACvbM81/Tab5L0z/x/R2PleOslL7//ndLcln/asADdaff5KMftc/7HiqlQEjyoAkgTJA18qALnKAytwvqsl+GFHQSLQyAGWAFFHAQwwExQK+PmMy7tgBAAAIMHVH7wda1s0b8jb/7tg/2RUAnoZfxSuAl2CgIhJAOKBQ0ZEAx/e3p6sj1AywWBGQ/u/SXOO/JFW0BvDFe2f9/+X6uv2nnR1/z/ICGN7cIN/My0r2RRv0UoRAZFL/pILbv2iDznu8bOPPu9MvO9HnNQGkVgKEuf3zTuxFj0fzXlKyH9bghzX8zOMDYwGHrLcWHIs7dwAAAEWMG5x3Jyv274yHZ3BP+lUbbirpPwqFqh5TwOPT//aPd//7ZygAale0Fxp/V520YsoN5f7aPby16RtMQ8AXEmYm/mENPtUKQeQeALK7/NQrBO7jkjFYHaCKBXQfT0kIqMYBwgNAiRAQXRnwfv7KBUGGgAtw5w4AAKCAS5+7YyRr7/8cT+wfb6muCqhO/kWJAkz+Uaj4EwDZyX97oClg/t+nVwGwpqNI+u9UXW/7/6Y29Ly/3F+/rTd73j+8seF/WSSA1C6/7HHUDbxsgy/8PFVzP5UGvknD5F915190Qq/yPB2TfyqpPhp8qcl/0GQ/TBlQ6utBsYD7ZtXiDh4AAEDm5tGy3tM8OO95FgFw6oPTuHb1qRr8qBpziuujeUOhaAkAf8MvqQBYzp7+n77qimSlvI4PbbugmUUAHNrWqH+3fxfn6gBVDKCxyT+VGSC1u39UxICo5J/CC6BRkwJAZTWgiogBnsm+qAKA1yzQ/djugFjA/d0bEAsIAAAggXPX3fpVVvP/hcevl5788xIEoqsEsisGMBVEoWLU5If9+5NYA/D5ATgqgFXtBdO/XONvfzyqt/21SrpxtL+X4S3JfSwS4MgOxUm+qEeAqqu/bHGfR7RBV230de34m/YCEPUEEPECMGn2p/o4FANKZn+iSgCnfhoQC/j6rH/GnTwAAIAABqyBo5oH5/7C2/wnn+qxRt9/hXAjH9Tci6YByB7Puyog2+jLriKgUCj1NQBHEeBTBtxbUAJ4/33mY/889dn7Z4yptNfzoS2Xn5hv/J8fW1AByBoC8rr3i8b18Z4vsh1/Ufd+0bg/3vNRmf9RTf5VTfxU0wDcjbbMxJ7aLBANPffXhc3/WJ83W9a+6QwvgOm/QCwgAACAAMYNzu9iTf/PevRqkkk91eRfdTVA1mMAjTwKZV4ZIBsJ6E0EGNFXvPfvNP+jl3c+VImy0YwKYHPyYZYK4PCLSXF3f1FTv92C0v6olAJkE35Vab/JWD8dJn6yE/+o4/4w4Y+FAoB38s8TC3igaxru6AEAADgw6ZX+v2wZnHvI2/w3PPVtq/a+yUpTf9lJvezxuiX+okQEiAMUSr8XQOHxTs8qQPbrQdP/L9z/9Q9X6uu6teeqD5PGAsrs6Hvj/GSVAmU3+Y/7Tr/KuVQm/DxeATI7/qKPJzh3+tHoc+34yz7O+zwmERAYC3jI+lXPB3BnDwAAEIKWwXmL3ZJ/u8Ji/1QbcVVCQNVEkGoVgdqsEGQBqpp3/4MeL2UC6H48f5xLBVC7st2qWdKWKffu/4nLplxZ6a/tQ1vHT2PGAm5vVJPiiyoFdE/+ydz+vbF6VEqBqCf/srF8sqkBVA2/apyfbKyf6OQfRIEQEaAy+eeKBexeiDt7AACAEjj/mdvGsKT/X/nhN0gn/7JEgmgDz9PIU0zoMdlHofSbAAZ5AYSlAhzfn00DOH5N+hi78V+aylaOABjV2/6bng09R1f667u1Y+oxw5safuNTAdixgDslpf0ypn+yrv/aFQCi0n5Z0z9d8YBRxwFSuPtTNvqqkn8oAEhSAWQl/zIEwWtTAgwBvzYKd/gAAACsm0PLek/T2jlbWQTAKbnYv8JEzaz0X/U4WSUAr6LBlPQfBAUq1i79xH//of8eOc0As5+nn7ei3apJN/41OQIgowRY3GadeV/X56vldf7drRf+EzMWcGujfCwf9c4+7/nI3P1Vd/ep3f2pCYFS0n+VRl62wZd9Hm+jLxrnl5Cc4FcZIRAW6+f+eqkGPuh4USUAMxZwAoMAmG4bAm5GLCAAAAADFzxzW71b8q8S+xfk9q877k9WCUDtAUAteUahqlnyH1Rhk3931fRlp/9O1eSUAKOXT95eTTeGGUPATQ0vuNMA8rGALyfFFAC7iOL/yKT81GZ/sgSBaPyfrEeA7km/bsl/VEoBXjd/TPxjkRbAuxKQjwVsY6sADnafgzt9AAAAF3o2bDi6ZXDef3gJAPvjUfdPJZv8m0oHoFYAqHoLUHsWlGqs0GCiyqWxV/33F7YKUKQGyE3+vQqAT/XPHFFtr/dvv3DZx/KRgEWxgPVyknzdigHjpn6i0n3dioGopf3USgCZhl90oi/S8MuuBEDyL2TWp+oFwEsGBMYCzviVNTDxKNzxAwAA5NAyOH8WS/r/6Ueu5mrMKckBEwoB1ca71HnjvDuNQlXC31+RuqiE9D8//V+ZbfZHLM6WQwKcuHzqHdX6mn9oY3IpMxbwpSRdo+91/dcu9ddFCqgSBSak/okYEAemJ/q8qwGiKwIw+yNdDRBdEeBVApQiBF69hK0C2N81E3f8AAAAaXQ8cetxzWvnHXY3/vbkv/7Jb1s193X6Gn2dzb6sMkB3ygB1GoFpLwHd8YYoSPRVvDVUrh+UBJAnAjLGf63pxr817/6fWQHoTR2q77/2L6v1dd965dq/HNrYcMhnCLip3jrCavx3GXD5Nyb555XqB03rVVz+ozD5423YVU38qEwAZWL8KFz+0dALTfh5CQFeSb+s5D80FnB6rjKJAIetvdM+iDt/AACqHuPWz1vmjf2z6/SHuyNx/jdpGqjqESDbyMh6FKBQ1UA8CCtvSpgBjliWbf7dBEDNkpR12r3TL6z21/7hzS2XFBEAuZWAd7c10sT8Re7qL0sUUMX8Ubn/m14VoFoZ0K0MkDUFpPIIqHLigNcUUJQ44PUICFMCBMUCHpzRizt/AACqGuc/fdNJ7sY/KPbPO/kPUgKYSgmgWgHQdV6ZOEIRIkH3hBarCBUeoxfR35+uv//AFYBV7a6mvy1PBNQuSf3bwMBA1e+CWtbAUUObG37u9QLIGgIqTPRVG31pYoDXxE9VESDrFUCVEiDj9p8UmNiLHm9a4s9q0Bsl4gDR0Es1+rw7/bwNPJkSoD5XYbGA0y1r39UnoAMAAKBKb/6s9zSvnfcia/f/5Aeuis30X2c8ILWEWZYYMBWbhgIhYPJ6Jv+OWSaAI3oLTb9bAXDamqvOwDtAFodemnimzwvg+bHWoS0NdARAZDv+1PF/1B4AvKsB1Dv8sisDrM+jdPWXNQEUnfCDGFAiCkQJBDJioD79ujI+SAXwAmIBAQCozun/Mzcl3ZJ/p/7x+1+LbPIfVYoA1cqBqgcBFfGgi9DA5L88Jvq6dv6p//4ovTx8KoCc8Z978m9/PHp5xzrc+BUTwcNbG9fnVQAuJcDhlxJqE/3dJs38TE7wRcz7ooz10yXVj8vkn7fBF23g0ehz7/zzNPiiDTypF4AdCzip4AFQ5AkwoxHvAAAAVBUysX9r5/63d/LvxP5RNfymiIEwqTFFgxF0fp0T0bg25uVy/UpNXYgbMRCn62eN/9Jf80z/nfrs8pl/h3cADwnwUur/YyUC+GIBeeP9tCsAZKX+VAqCMK8A3ZJ/3sm+qAIgbNIv6hVARQLoNgNEw6/d9Z+CGJBdCQiKBTzY/Wt7DQrvAAAAVA2aB+de5576OwTApx6ZXbJh193Q6zq3KEFAHT8ougtNnaeuaxc8LpLxapfMm7o+tTkm1b8zbyzgiOVs6f+Jy6Zcj1d/Nt7d1nxDkQogpwR494UEncQ/NqZ/vA04pcS/yTJn+qfqBcDzuEgTz0sMiJj68Tb6MlL/KiUGeHf4ZT0CjHkBhMUCTi/Uvq5r8eoPAEBV4LIX7v5Q09q5R7zmf+7YP9FG3ye/1UwgqMYFihIEsukBqmkEoo/Lft1UekG1KxJ0Xz9uv/8o/v6PX+2X/mdIgKVtf+y+u/t9eAcIUAFs6Hn/8MaG/3WnAeQNAXcKuv7LEARG3PtVlQOi54+bez+1+V8Ue/4i7v28jT28AEiIA9m4PxNeADvTx++7wrMKYMcCdh2x9l93HN4BAACoeIwbnLfGu/dvEwCnP9QVuPPP6wUQN3NAaq8AVYKAKl1Al2u/quQ76vz5clcGmP7+o/r7o/r7Zz6+PFXk/O8QAaf2XdmAV//SGNp+QaIoDSBHBBza1iBn+he7mD9V137dSoGwJl83YSC7409FBshM+GVWBtC0a0kBkDUHNFWvnO9XAGRUAN2r8OoPAEBF4/z1t5zqlvw79eUn/kVp8q/6eFxTBVTjBFUVBFSNlCkJP65fndenIshkCbR8rW73Tf7tGtXb/lMY/3GoANI/o6FNDT9lpQIc2ZGkb+iVzyc7qVc9H1Ujrnq+sAm+6OO8z0uU2eSfSimAkpr8UykFVOIAncdf6wxIBZh1Mt4BAACo2Ju7lsF5O73Sf7tOfODKkpN/2TSAqMwCdbr063BN1yWdpjqOymOASnlALWU3ff2ov39dv/+o//5rlmUn/rVLU0VEwCdXdI7GOwCnCuCFS8f4vABsFYBtCKgaAyjV8Ms08rINfVhDXuq8OhQBqg2+7HGqk3/R8/BK8WWVAjADlNr9V33c/XkkZoAMIiATCzjdnwpwsGsHSGIAACoS49bNG+dt/O2Pz/7+tcqTe56vx2XqTzG5Vz1eV8MU1Y4+1Xl1XV/3eeJ+fdXfv66/v1KfC//760tlGn9382//d8yyyQ/gxk6MKH5nU/IB1irA4ReTMZf0U0n+ZRUAJvf+KU3/dK0GUK0AhEn9ec0DveaAKKPmgV5CwFi5iYD6XCyg2xDQUQHMbMY7AAAAFYWpO3qPaVo757deAiDx1Hesuvsm5xv0sAl+mNmfbs8ASqWASCNPbUZITSTomtiavr4pl/qoXfJ1f/9x+f1T/f2HHtefjf3z7f4vaT3yz6tm/TXeAQRJgF2z/npoU/0RrwpgeFN9xDv+VI2+qBIgbmZ/qo1+WCPP2+hTufuLxvjJmvdB2k+y+y9r3kcy6a+Xk/67H7f/ze6b7lcCHOj6jbWh52i8AwAAUDFoefrGb7il/07ZsX8qDbxsQx43jwBVE0GqSawuybVqzKCpiTWuH8/rm/77E/13WbuyPT/5d9fJK6ZOxqu/HA5tG3+FVwFg17vbGzVK/nml/arHq7r56yIIwhp8nuNlCAIqKT+12Z8sQcCrBAAhIDTJ1xX/Z9wcsN6y9lzM8AKYblkHpt+AV38AACoCl25e/OHk2jlHvOZ/duyfPTlzN92qKQCyigHTxIBKjKBK/CDvxJTKZE3WXE132gGuXxnX16UYELp+zvjPWyOXtf+6B9MceRWA1XP00MaGXxepAHKEgLWTwPxPafIvK9VX9QIwMfHXsdsvowAQeVwXMUBl5qeqGMDEXyi+L6iZl1UMSO/813vKfSwrFjBDAByx3uyBagwAgHK/ibPe07J23gPeyb9dpz3URd64RzXB131d1YZIl9Rfl8cAdaMZVXyhqbg+ketTTPipf/66fv+6jit6fIWfALDVAJ94YNbZeAdQw7vbz/s8MxZwa4MVffyfSKNfzvF/ScVGn2LHv9TjJpz+qYgCeAFEQhRon/zXh6wGBBzniwXMEwH3wTcGAICyxiWb7jyD5fr/pR/8i5DLP3UagKypYNxiBKlTBlQ9BXS5rOvaLTflfl+p14/q92/q7y+0VgVM/3vbt+IGjoZAfuf5hm2sVIA/70ha5nf9Zd3/ZV3+oypR938ql39Tkn9eqX7QtF41DQCEAEkqgGwagDQhINnol1IG7O1gpwK8ce1peAcAAKBsb96aB+e84p76OwTACZ7YP12SfdGGPUoVgYmVAtmGSDW+TbRx1RUfZ+r6qjv15X79uP3+qf/+81/vTeUn/m4PgM89OKsW7wBE7yO7UrUsL4DhzfWaJv5JQqKAVxkg6xGggzhICHxd1dwvydn0myIOeCX7ovGBiP0TavypCADeFQIj7v8BlYkF7PIoATJkwG6QyAAAlCXGPXvTeazYv889di1z+l9qwq+aDqCaEmDaK0DFI4DifKopBNSTXNWJtuz1qSbqskoG3deP+vvX9Xcl+/cncnxNzvjPa/530sqpN+LVnxZDm5K3sVQAh19KEE34eaX7srv+og16VBJ+qok+rwkgdUPPa+KnqggQXQFAo09i3qfqFUCaElAv0fDXs+unl3ubfycV4Fy8+gMAUFawY/9aBuf+3rv33/hkIfZPJcavXLwB4jLp19VwUZm1UeW+yzamVDv21XJ96t18XfGAvIaa4rF/7VbNUr/0v7Y3dajlyZ4P4B2AWAWwY+oHhjbWH/IqAYY3jjUYAahCLIiaCMZ9RUDVG0BUOSBLDFDH/1F7AKBKNv2lCAIRhYBJd39uE0BvLOA0vxLgYPfvLKv3GLwDAABQNmgZnD+HZfz3yUdmMRtzXgUA79dFFQPUxEOlEwi6Vg7ien1q88NKvX7cfv/a/v5XpJixf6eumXYBXv314O2N4y9iqQDe3dZgcOdfNZ6PqtGnJgJEXf1lG3ZdjT5VQ6/a+POmAKDB55L+q070vccYc/8XJQbsWMCL2F4AB7q+g1d/AADKAq3PLfwIq/k/54ffKor9C2voeRQBVNJ9XWaApomBqBojUck31aRZdZJMZXJHOcmP8vpx/flHtXLArDVs47+63tSbAwMDR+EdQJMKwBo4amhj45ssEuDIy0nBxj4KM8AkATFQrmaAVMSArpUA0eeHeQWgyS85qac0A+RZHSBPA6AyA/TEAr421UUAuFYC9s7+G7wDAAAQ85s06z3Na+c+6m3+7f3/0x6aHtjYq3oByO70U6UDxD1OUDcxoLrbrzv+UHQX39SKQ6VfX9fvP8q/v5plbUwC4FP3zT4d7wB6cWjzhI+zCIBDWxoi9gIQ9QSoNC8AUU8A3V4AsmZ/qo9j8q/NC0ClYZclBrh3/4m8AF6ZwPYCONg1AENAAABijXM33HYma/ofFPun6gUgShCwvk7RiMsqElSbGlMEgexEWNf5TF1f9PFKu36l/v6lj+9rZ7r+j1nevhY3aGYI5uEtjWu9iQCZWEAuQ0DZGD/R3X1RCT/P+SiIAdkYP9Hd/bg0+iITe5HJvyyhgIafSxHAmwLAu0JgbPefQ+ofpgjY2+khAXJEwIHuj+MdAACA2N6cNa2d+xqLAHBi/3QVlTkglcKg2oqqEdM1+dbtLl+t11eN5TNtYqlU/XbsH3v6X//9nr/FO4AZ/HHrpL9lqQCGN9VrUADINu6yE/+oZP7UJn6yE39TJevar1spAAWAkLu/7OM64vxIzAHTH+8ex44F3Ne1FyQzAACxxIR1cy9mNf+lYv9Ezf54TfxMSfxFPQLiRhzoMlujatBU49yoJevVdP0of/7Uv3+Kv3/b+I/V/J/UN+VavPqbxfDmpuuzjf85ucrFAr7QSLS7L0IeqEj5dZn9qe7uy+72i074Rb0CqCb1quejaoIT1TXpF437C0sFUC3l89WHxAEKNP7MWEAvEdA1Ea/+AADECj17B97bvG7eH1ixf7X3Tlbe+RddHZBVBMgSEtTXLxelAdWkWHXya8olX/ekHdePxiNC2vhvWeoP3YN3vw/vAIbVZnt73ju8seF/mIaAOync/akUALpSAmQn/KK7/6oKAOqGn9rET7TBRwwgiQmgrLu/KMGgzeyP93HZ49J/O/uuYqwCTP+DZfW8F+8AAADEBi3r5t7Mmv6fOTBTq9SfWsov24hTKQvKteHXpSCgalB1H4frx2Nir62Ws6f/p626Yixe/aPB0LbzG/hjAal3/6Ns6OPg+i/7uW5Zv4wHQCOhAgBNvxHlgChBYMwDQNYjgHFcUSxgkRfAjXj1BwAgFpi46e6POg1/Ilfe2L+P5Ur37r/K82SUAVTpArpTAsotXYAqrx3Xx/WVazV7+j9qeccr2MmMUAVgGwJuatxTTABkVwL+vCOpubFXbfB1EQOyu/myjTz1SoBqrJ/qSkCpz+HuTzbxF1UCxM7sT9DdX8ok0B0L6KkD1/y/eAcAACDym7DmwXlPsKb/pzw4Tbgpl23wVRt01fQBqoa80swFVRs5qufLNpyqUvZKvr7J31+kf8MBsX9n3T97JN4BIlYBbL1oFDMWcHO9pcflX4RAEGn0TSsFVIkCaoLAtFmgqpu/yCoASAEpQkCk8dcu+Rc19xMlCAK+/sp5fjPADAHQ9TjIZwAAop3+r7/1M+6m31EAfOnxG6Qaft2l6gVAlTZQrZ4BUTd2utzpRRtd3YSA6e+/bKT8otXHlv6fsGxKP27A4kFAv7Op8V6vAiATC/hiokSjTT3xF230y00BQK0EoGj4ZaT6ql4AmPhHogDgeVyr+Z/qbj+vWSCj9nawVQD7uz6NdwAAACK7+WpaO/eAV/pv15j7rzAi9Rd9XNUzQPZ43Q16HBt/E7vf1JNnquvg+hWw+2/H/i1lTP+Xth05Z+D6v8I7QEzeh3ZM/auhjecccacBZGrjWOuI8cl/3Cb6sqaApib/uif6VC7/iP+TmujrSg2IfDVA1N1fNB3AVbta2LGAB7r3g4QGACASTHj65stY0v/PPnaNb99flweArLmfLhNBVWWB6ZWDuBEKUTeOpk0LK+36cZ30y/z916xkS/9P7Jvcjlf/eOGdLeMns7wADm9vFDTlUzXx020CyNvoy5ryqZr4UZkAysb4Ubv8o0iUALwNu6qJn/dYaRJA1P1fVDEguArw6mVsFcDPZl2CV38AAIyiZ8Oq9zetnfsn7+RfNPbPtBkgb4NNJcWXbbwrJTXAVENIPfE2ZVpX7dePbQUY/43sbf/Png09R+MdIGYqgPTvZOj5hv/0+wGcYx3ZkeBw/w+b5FO5/cdZGVBqkk/l9m8q5k+UMBBdGQBxoFVJQLUyYGzyL7vrz7sKEBgL+CfrdcTQAgBgEInBud9NMKb/H394Btek35QiQDYtQDY+kHcFICx9QLcHQNxSCuLWKFI3tLom8VETKnEjisj+/pexd/8/eV/35/DqH0+8++LEs90eAPlYwK0NGnf0TTb0CQXJvmiDHjfzvrCJvighEFa8x6PpF1oF4N3NFz1eupkXNe+jXgEQUALsuZCtAnht+m149QcAwAguee7Ov2NJ/7/6xDfTN9EdRY29jkZfJRWAKgWA2htAl9QfqQLlcf2oCYeKM+9TMv4Lmv53bMbOZYxVAOnfzdCm+i3FBEAuFvAniYAGnzclIO6TftHdfF0rBFF5AMju8oumAGDSL00IiHgEqE76jccDamj4Wce8NoVNArxx7d/iHQAAAO03WYnBOYNe13+7TnloWmwm/tSrArpNBqm8DGSJAcQSmjlPpVw/bqX6d+p+fk0ve/p/1oNXH493gHjjnR2tI7xpAHYNbx5L3MDLNviiz5Pd+RclBkQb+Kgm/wnFeD6RyT4k/+STf6oGnrzBF3X1523wVYkBbyzghIBEgOlrQU4DAKAVE5676WyW6/8XHr++LKX+VMSArok8tdTfdMMVBYFQzY15tRADuv7+alayp/8n902Zh1f/MiEBNidvZsUCHn6xsYTUnyoG0NTkn8oMkMrdX3R1gDruT2V1AA29Ntd/0XQAlRhAkdUB42aAhMTA3lS64Z+WKxcJcHDmZ/HqDwCAtul/cnDOz1i7/6PunyIl/fcep4sw4NnF1xk/KLpqoJoOoMsLQHdDr+v85brTHjUxUG6TfKXr2c7/jNi/2t7UUMuTPR/AO0CZvE/tmPqBdMM/5PUCGN44lsDVX7Z4zyPaoIt6BKi6+ssW73lkTf14Jf66vABQSl4AQU17ZHF+VPF/oiaBHLWrma0CODD9Z1ABAACgBeeuuzHlnfzb9ZnHrs437kENfNjX47IaoBr7pxo3qPo4VSqBLs+CSlkpKFdCIUqVhQlFitLf/3J27N9pq6adh1f/8sLwpvEXFCsAsvXutvqQ3X7eyX9UO/6i7v2icX2851MhBho1rgrISvjhBWDEvT9st1/0eLKJvurkX2anX+F4XyxgThFwoLsVr/4AAJBi9raBY5NPzXnbu/vf8OR3Ms0AVSMeRiAcH9OiMgeUPY5q4lotXgCo6trxDz3vGrb0v3ZZ+xs9PT1/gXeAMlMBpH9nQ5saf8ZaBTiyI6mhwaciBGTj96gJg6iUAhQTfpHno4SafN2EgWyDT6YUkHX3l40FlK3097rvSoYSoOtt682e9+MdAAAAMnhj/5yPz3i4mznZN9XIq55PdlJPdR2qtICoGnkqBUO5SMZR5fH7F328Zhl7+n/WA7NPxat/mZIA2yae7o8FPMc6tKVeweyvXCf/rAZfRSmQiEnxTv6plAIoLqm/7OPaJv+iCgDZ3X7RCb8CQbBnItsLALGAAABQ4eKNtx/vlf7bH3/liW9I7/RHRRhQmwhST/qpVweojqPyGNBldggiwWwjXS5EAtfzV7Gn/2OWt/8QO5VlTACkf3fDWxJPeL0A7PrzS42aJ/9NxJN/Uem+6nGqk/8k8eRfVLqvOyWgyif/vA2+7HEik38jZn+yCgDChr+oxmbLFwuYIwTemv0PeAcAAED5Jqpp7dxnWQTAyQ9exd2oy5oCxl3qTy3ll23Yec37dJn86VpJQIGIoHhe4Nf77dg/9vQ/MXDDR/EOUN744872j7K8AIY31Qu4/icNKgBkpf2ipn+yrv+6FQCNAh4BKqZ/so0+yAEy0z8Z13/jpoCicYDEsX9htXtCceNfMAR8BuQ1AABKGL/+pi96G3+7Pv/964TM/mQn/FQpAR8rs9hBUSKBaiWAimiIiiCI+vpxJUjK9edPRXQFSv9XtAXE/k2djVf/ysC7W5qu9RIAmVjAFxoJdvqp3P1VY/mod/Z5z0fl7i8a48erGJCV9qPR19roi0r/lXf/RaT/9QYm+rLPy03+i2IB2/wKgEx1fR6v/gAASKHH6vmL5No5P3c3/k6Nvn+qUoNermZ/sjv+og0/tZRfNWbQVEMaV8l5pcXgVcrPX+nvb3WK2fzX9bb/fuJAz3vxDlAhKra9E987vLH+914lwHC6jrzMowBoMjjpFyUKRM0BZaT8SYOTflGigCr+D9J/LYQAdVqA8Ul/XCT/JQgB+/WJFQu4v+vnlgUDWwAAJDBu3Y1TvY2/TQac9ejV3JN+3nhA0edTEAgyk3vdcYOqpoGyhARVCgH19anSCkx5EWh3q9d8fdM//0j//pazCYBTVk//Kl79KwtDWyaMZXkBFGIBozbyU5Xk61YMmJL86zLzU1UMoNFX2u0XVQDETtpP3eiLHu+d/Hs+f/XSoFWAyXj1BwBACFN39H6gaXDukHf334n9E2nUTUz4dSsHVBtyXVJ/XR4D1I1+pZv44fpmry/795f/+mq28d/oZe27sDtZgSqA9O90aFPDTtYqwJ9fNhnzp0tBQLXjrzvmT3csoCwhgN1/LbF+urwAYkscmJr8M6637wpGKkDXkPXWgmPxDgAAADeaB+fdmWBI/72xf9STfV0rAlGtFsimClApC6hSBkQbfGqCQ3USHrWXQbVdP+6//6DYv8/0X1uHV/8KJQFenFjnJwDOsYY3j41A8s8r1Tft8m9K8s8r1deVBoBVANJ4PyqXf2OS/6CGXdXEj8oEkLHrX/JxJxZwOkMJ0H0HXv0BAODCxevuqPVO/pOZ2L9vCkvxwxp9XhPBuKcGUE/8qeP7RBsniuur7HRTeR7onmRX6vWpVg6i+v2X/PtfyZb+n7CicxVe/Ssb72xKrC72AsjFAr7YGLPJPhUBELWrvyxRINrYy+76o+HXShRQufobm/7LEgO8jT61MsBDCORjAacV189mjsCrPwAApacklvWexNo5z3td/+066cGrQnfyeVcARAkCag8AqnSBuBEKskSDaCOvKsFWnUjLToijvj7VRL5cv39d1+f++1vTbtUsZUz/l7Yd+fwT1x2Hd4AKf3/b33Hc0MZzjviUABvPsY7spJD885j4JQgUAbrj+2SJAR4Tv0ZCRYCoQgBxf0ru/rK7/qKTfWklQJjbP+/EXvR43RL/EA8A5/Pd4z0rAPlVgA1YbQMAoCTGrb/xyyzp/z9+/2tKZn1hxIAuqX+lSf91EQNUEnoqbwBTUndTu+nVfn3V3z/V31/NCvb0/9S+q9rw6l8dOLR1fDtrFeDdbQ0G3f5VVwZkTQCjlv5TmwOqegCgjJgFqsYCShMDIvF/MpP+BkOTfgGi4KcBsYCvd38Jr/4AADAxYA0c1TQ49xdu6b/9ceNT37FG3j+Fq8GXTQcQfZ7oyoAKoRCnyb7ulQPV66t6EKieh3qCTD35rrTrx+33X/I8q9jGfyOXpX7Vs6HnaLwDVIkKIP27HtrY8CsWCXBkR0JTo089wZc174uq0aeY4FM0+CAGSjbvVJN/Vcm/tHxfpqGXaeBjNvl3P24rl/Zd5VECTLMTAd5CLCAAAOzp/+D8Ltb0/1OPzFZuvEWOP16j1D+uRTXZl4kZjJPUPW6xfLg+/fUj+/0vY0//z3xo2ll49a8uvL3lvM950wDsOrSlnniyL6sAEN3x5/UUoFIA8E72ZRUAojv+CUst4g+kgFYzQCovAPKVgDAiQXQ1QPOOP48ZIDMWMG8KeBVe/QEAKMLEDYs+mFw755C3+a9/8ttWTfrm+WMcU3uR3X7ZlQHZ1IGoVwZU3f2prk+1mkC1YqDLHd7ULjqur+f65I/3saf/db3tz2M3sgpVAHYs4Ob651kqgD//JGFFZ/an+nhYgx8X0z/eyTyVxB+Tf6ndflWJv6zU3xgxIBvnp5oOINrwl/r6WMbjgbGAh6xf9XwA7wAAAOTRMjhvMWv6f/pD3aESfJGGXtXMT5RQkE0XiJsCQDXOT7Thoz5e9nyij8umK+i6PrW7frl9/3H5/df0smP/zh6Y/Q949a9SFcALl30sPBaQ2r1fVTkgev64uferKgdEz48mnyTGT3R3n0cBQNroeyX9ohN73vPpnvjzqgLqS5AAua+/cgFDAWB7AUxfiFd/AAAyOPdHt41iNf9ffuJfhCf8sh4AqsdRlerKQdwIBGrlgSpBoJpaQC0Np76+atxduV/f9O+f5/+rZiV7+n/S8qk9ePWvbryzOTGfRQIcfrGBWMov2rBHpRSIiwIgKqUACAISEz/Zib+xonb3pyICeCX/nMe9NjlgFaCrDq/+AFDlsKWQybVztrIIgBMfuJLbtI+KICjVgB8vsUqgu5FXPR+V2Z8ugkDWfI2KUKBSPpjOra/061P//Kl+/75ak2LG/tUuTb09cWDBsXgHqPL3v7dmHzu08Zy3WSSAtTOpcVKvej6qRlz1fLKTetXzUTW9iPsjOZ+slF/UK4B7x1/08QbOnf6o3P3DCIOgWMBxfjPAjCHgtM1YfQOAKseEtTeOLRX7p6uxl00JOJ7IC0DXKkLcJ/+q7uq6J726rq/qio/rl+f1RyxnS/9P6Zs+Hq/+gI3D286bwI4FrCdo8GWPE3X1V1UQhDX51CaAopN/xABGavYnqwDgeX6p1QBtJoCyk/8GTR4BY/ml/aJKgZ+2MrwA0h+/0fUVvPoDQJWiZ8OGo5sG5/yHt/m3Y//q7pss1PBHtRrA25Dz7v+Xq9Rfl4KAqkGTOY4iF15XzB6ur/f6JH9/q9mu/3XLUgcx/QDcKrhDmxsOMGMBuQ0BRd34qQgDnvOalPRTSf4TkgQByojrfyxi/2RiAEUbf9MKgDATQNGVAG8soLu6f2UNTDwK7wAAUIVoemruLNb0/5MDs5UbfNXniRIEVCsBH+tXSwkwrRjQlS6gGktoyvSQ6vqqufeiP69Ku34c//5qlrGn/5/o6z4Fr/6AG8NbLzqNzxCQqtEPa9R1TvTj0OgHNfyijT4IAXLpv0gjL9vgSxMD9ZyNvqh5n2yjT+XuL9roh6UBeOrVi71xgNk62NWNV38AqDJ0bLn1uMRTcw57m/9znvwmyc6/KEGga5Wg0sz+dBEE1KsEIg0q5U677CSa2tywkq8f5c+f+/e/ij39H72s43FM/wGWCmB4U8PjzFjAlxoVJv9UaQEJQwQBr7Rf9XhVN3+RVQAQAMou/15iQCZGMJK4P9E0AF3mfrJmf1RKgPTPdt+VfhXAgemHrb09H8Q7AABU0/R/7ZwVrOn/aQ91kTX/H5OY2OsiBGS9AKI2GYzLKgH1SgGVmZws0UE98VYlRCrt+qZ//8XGf8Gxf59Zc8NH8OoPMEmAF1s/wlQBbBqrYQdf1guAauKfVJz8y5r1qXoBYOKv1PTLSvuplABBCgMpib+MWZ+qAsD0CkCYB0DY46565XyXEaDLC+BA9zK8+gNAlWDCczedoBr7p2vyr9q4yyoERBv3j1W4csB0Q06dCqDrOFyfdjVAB/FQs4Ld/J/YN3UGXv2BUhjamryaGQv4QoNio1/p8X9Bu/uI/6sqT4BIdv95VgNEVwTqNZn96Y4FDHk8Ews4zV9vTBuNV38AqAKpY9PgvBdsoz+7vLF/TiP7D2tSmdKpBtDhKaA62aciCqhMC3njEKNWBlDFBuq+vq7YQ90u91FdP+qfv3AFGf/1pn43dUfvMXgHAEq+P+6Yeszwxvr/41MB2IaAL4tI/qlc/qMq2Rg/apd/lJZGPqhhVzXxIzMBlInxo3L5bzA42adSAtSHnN8bC+ipg13bsRoHABWOlsEbE6zp/9mPfS1WE3+q+L6w8/GaCKp6DlS69J964kvd2OrOo5eVtlfa9XURRNx/JwGxf6eumfFlvPoDPHhn07lf5Y8F5N3lZx2XIPAIiJo44N3lFyUOZM+LZp+EKFBNAzC2618v6f5P5RFATRyUMvnjJRJKrAHYX//pJDYJ8Pq0erz6A0CFwo79Sz7V89/O9N9RANj/rb13csmJv2k1AKV54PES51MlHlQVArJFdR7lSWzAOaMyL9SlRMD1o71+0XNWsZv/Ucs7dmC6AYio5IY2NrzMjAXckSBeAYiqoefd6Vfd1edt4NHQG3H7553YBz1HRFGgVeIvqxDgbcRVGvqxBhUBIgqB3Of26worFvBA168tawCxgABQiWheO+9rqrF/cWv4qcwCqRr0clcI6G4MTZ2XypTOlFmfqetTf/9x+v0Hxf59qn/mCLz6A0IqgO0X1/LFAsqaAIpO+OO2IiBKFIiaCIIYMB7/JzPpj40HgOwuvyhBIEoMUMf/qZoFBsUC5mrftGvw6g8AFYbLXrj7Q41re444Tb+jADjnh9/K3FAH7fxTewGoTvZ1rxyI7u5TKQioFQWVTiDoTjGIauWh0r5/E8qSzHlXspv/E5Z1wuEYkMLQpsbl4YaAog07VaNPTQTocukX9QAQ8QpAgy88+Wd9LiPVl23whZ+n6tIv6gGg0wuAaILP6/oftALgfH/7pjJUANOOWPuvOw6v/gBQSdP/dXP6WdP/Ux+aLtXIx40Y4N3pj1rqLyPpP76MiIG4xwvqasx5c+9NXT/q79/o79+O/VvKIACWpg7/8wAyjgE5/PeWjuOGnh972KcC2HiOdWSnqBkgFTFQzmaAjQTEAEposi+jAOBZDeD1CoiV6z8FMUDl4k+VAsD7dVYs4HlsFcCBGavx6g8AFYLz199yqrfxt6f/X/rBDb5GPqyxN50OIJsKwGvmR+ExoLJiQJUOQFW6zh/1xFi2QcX1aa+v43lBsX8nr5oyCa/+gAoObT03xTYEbJCM5atULwBRTwB4AcTS7E/1ceXJP+8Ov6xHgEkvABWpv6LEnzsWsDOABOg6Ca/+AFDmsA2NEoNzXnYb/znmfyc8cEVsGn0VSf7xBCsEqjGAYSaEsmkE1I17XFcFompMKXbhVXbwVa+v6gGgO55Qh0Fk0fVXtTOb/5G9qV8MwNAIUH7/HDhqaGPjL0obAiYlJfyJCLwAZGP8RHf3RV37RckBEANKE3kR5YCMIiCy3X/ZuD9TXgBjJU0CZRUBIcTA7pagWEAY5wJAuWP80/NbWNL/zz52Tb7J51EAxI0QUJnUH99PZy6oOmmnXjmo1qJqhHH9+KRGcF03wPjv9PtnfAqv/gCNCuC8s1gEwKEtYzlMAONu2qfLxE924o+KhQJA24Sft5lXmfDXS5gDRlVU5n4KRMBPLw8gAbqb8OoPAGWKqTt6j0msnfNbZ+LvSP8bnvq2VXvfZJLGm4IwON7gCoCsp4CqOaGuRp5KwUDtUaBr8my6cY3b9XUpH+L8/Qd+rS/Fnv4v73gO0wuAUkU3tKnxRywS4M8/aVSU8usy+1Pd3Re9juzEXlQpgOLa8Rd9PCjuT5UYiM3kn0opwBv7JzrBF33eWLqy/32xYgH3d/3W2tBzNN4BAKAM0TQ4/1/ckn+nPjEwS3jyL+oVEMfJv4q7v+yknuo4qlhCKiKhUhUBVNL5arl+lIqAml729P/zD17393j1Byjxpy0X/z1fLKBsDKDOnf9Ghd1/VQWArpQANP4lG3lRIkDE/V+HRwC3FF/FCyAKM0DRhj6swSeKAfTWngvZKoDXp1+PV38AKDNctXnxhxNr5zBi/75pfWwNvbu/KTKAysRPF2EgKvmnarh5zotVgfKVusfp+nH4PdSsZE//T1jR+W28+gM6MLy5sYcdC1hfhu7+uuIAg4gHNO2xiAEUbfyNKwB43f1lzQO9hEBUUv8YKQCc8wbFAv7s+r/Cqz8AlJFksWlw7oNe4z+7vLF/YZN9qpQAXYoB2RUB2Uk/FSEhSyyIno96ki9LYMQtXQDXL8/rZ/6O0q8jrNi/2qWpt1Mbet6PdwBAB97aNvvYdMP/NosEsHaKNtoqxECjBvM+2cm8bIMPYiDSRj/I7E+00RciBCga+yBFQFzc/ccqrgRonvSXjAWcwFYB7Ot6ACt1AFAmGP/sLaezjP/csX9UjbqKYsCEaoBaAaBbCaDL/b/SJf/lrhiIupGPS/H8/Y1Yzpb+n9Y3vRmv/oBOHN4+bhwzFnB7veSOf1RKAVWiQCZGEISAcUKAKi1A27RfVQFAFf9n2hxQ1c1fhCAQIAH2trNJgDeuPQ2v/gBQBtP/xNo5e1jT/9H3XxHaiAd9rpoWEDfPAB5igJIQUFUAqHoLmPYsgJQf19dCDKxmS//retv3Y0oBmHh/Hd7YcIAZC/gTUwqARAQKAColAFYDSBp9WbM+VQWA8RUAXfF9phQAYfF/EU78RWIBD0x/Be+vABBztDx907le13+7PvfYtVob+rjFBMpO/nka7+M1EAKqkn5ej4EoJ7colPLuf0Ds36ce6DoJr/6AERLghYmnMGMBN58Tw4m+aeIAE/1YKwGovACMpgLUExAFuif/unf8NcT/icYC7p8xHq/+ABBTTBzoeW/T2jm/czf+9scNT37Hqrm3s+RkX1YJwCvxp/ISiJvJoKmUAdEGP2ovAapVCVMmiSA0zP78ZX7/I1alrBFLWjPlbv7HLOt8FNMJwKQKYGhTw6PMWMCXGolMAFVj/GQm+xSu/HD1jyTej9LlX0tDLyvVD5rWy6YB8BACOhp9WZf/CCoTC3glSwXwO2vH1GPwDgAAMUTz2jk9LOn/mQMzmA14qca73Cb/1BN/Fcm+yPlUPQJKHafS+FLHDKJQSsTLGnbsn00GnD3Q8zd49QeMkgB7O/+GGQu46Zwy2fVPcO7pqxILUAZEShSUWgEQ8QAwRhzwSvZlVwF0x/7JEgaiKwOaiYM9EwNUAF3fwqs/AMQMrc8t/Ii76XdWAL7qif0LmvyXavhVvAJ4CYZKWSGQJRqCmm5qhYDoCoIuDwCK6x9v8PrUygFdxEm5fv9hz7ON/9yTf0cJcNKKqV149QeiwNDm5pnMWMD/y96XwEdVne1btdrafu3X//dVJRBwr1Zba/3UtrImmZkE1y5pFcgCaiAJAUVRqwIDKGo3q1VIwhLQWtu0tlUC1qUlhEVU3AVBxK3u1hWXBJH7n3tn7mTmzrlzz3nPe869d+Z9f7/3l2Ry5x5wucnzPs/7PPdHNQB5qEKAF6DzSvsJ0KOCeSxGn3cFQAmgj2pQBEC9ArCUAFFBt39RgM57vSq1QOK+m89jDwFevPRr9PSnogqQJPGUrjl/Zg0AjrqtCQS4oQA96MA+qIMBLAk9ljeALqk3eRMU9t8f5Xw347/2+rcb2tpIkkjlz8/djQ2f37k68p8cFYBpCPiwbqZfdDcfe4WAmP5AmwWKmgiiDQaiyPF/2B4AfpsAYq8QIPbjZ7IHAM9M7qSVOyqqgNSZq37xHZb0f9jfLvVk3Hm9ALyUALIDhaCnB+haOYB6BWB5EMjeR/VAQxXQHFRgjL7unX+V//5L2+tymH/z828taRlBT38qP+uTtT8axTQEXBfRLOHnZf6xADwU4NNQANX9X9TUTxnQ1+X2LwvwIe+LIEj9Icx+ALwC3GIBt7YcS09/KqoAsP9VK2Zvthn/TPf/Q3/fADb7wwLmqgA89n2xzP9EvQBkgTGWdN8vYBj080uLfDDg+/lL6nJM/8w+ZGH9A8RCUAXh529fT/QBZizgxsoA7Pbzrg5gxQAS8x9KM0Bt5n9Y7/fyClAh+VdhBpjveqB0H9UQ8FT2AODpxk3085eKyuc6Y+Xsn7HY/xP/ciGXmR9ECSDyOrYXgG5FgOxggBfAyzL90BUDVekAurwIsIEsnY9zPpYXgDP2z1YAnHDbtFJ6+lMFYgjwyJgh3rGAWMAeas4HBehYgJ4GA1y7/7w7/FDpv1YvABVKAJmd/pjEbj8PgI/46AWgsF1jASdX09Ofisqnall5w75VK2fvcIL/6PKZxpCbz+EG+TwDAl5FAO+qATbDz3st1gABKtGXZfih10PvJ/q6rGJBVqmAdT4USOsG8IX6z9+6ZhHb9f/Q9vpWevpTBal6V1e2Mg0BN8QkXfll3ftF4/rI/M8XRl+W+RcF7tq9AGKcjL1ovF9QPABkJfyi99M5GKhkxwJuad5hbGvZl57+VFQ+1OgV8blO0z/z82P/NEV45x+L4RcF+GH3AoAy9bqZf6zUAmxpv1/nq/IiUCWt1yXlx1J4SP/7T/y/PqS1n/FP7/631u8a2Rn/Mj39qQKlAtjU9OXe7siuHEPA1RXG7kcwFACiDL/bvVUBfBoIKBsQQIA7lPHX3ljmfqoHASygHpHwEggSwJeIBdzaPJue/lRUmqu654avs6T/duyfLNAXjf3DWg3A8gLQxfTrVhJgDRSwGHLV6QfYgFm1hJ7Olzvf/v4QBvtv9jcXnzeWnv5UQaxP1pxay1IBfLo+qsELoBIA8GWUAgTWlSoARO8nag4IVQpwx/6JMvii78Ni7mOIg4EIQBEQELM/mVjAl5v/h57+VFS62AYz9m/lnDtYAwA79k8UiMsOBGRNBLFWEWQGCX4oAkQBPhZTG/TzsZUOYT8f24sh0H//jvE5zL/ZB7fVvdTZ2bkX/QSgCubP5c69enuiL8EMAWWl+KJKAdXMPw0KUM3+oAoAVSkBaCZ+ogA/331lFQERgZ1/3teh10WC14+f4eIF0Px3MgSkotJUP77n2v9jgf+hf7tEWOovqhAQBfCycYF+pQIEdbUASzGgamAAUQpgMsd+udbT+bB//6zrBrexd/+/uWzScfT0pwpy7Xz4zOOZhoBrI8ju/lDzQFHgTwqAQLr+8w4EArMCgL37r4rRx1wRULHT7/OAwC0WcHPzd+npT0Wlgf2Pdc1+hjUAyBf7Jyv9l70OqgTASglQNSDA3vEXva+u86Fmb6KpAtjnYw826Hy155curs+K/bPZ/0PaJ9xNLANVGH4+966J3pM7BCg3PnswhgDsseL3RKX/tPvvi/RfVsKP7u6PJeEXVQL4afbnh7u/yEBA4wDANRaw6Rn6+UxFpbhOv/vKsSzwf8JfpqEy/dCdflklAMT9H1Mx4JeSAGunXtaNHXuVAXq+qhg77B15bMY87OfL/vsf7DD+swcBJ3Q0HUhPf6pQDAEerD6QpQLoy4oF5JXmQwcEovF/JOUPJNMPHRCIKgG0KwVk3fxVDQgiguZ+EaQBAdQjwId+cgx7CPBMy9n09KeiUlQt227Yt6pr9kdO8B9ZPgMc+6d6UIClAJBNCxBJJ/AT8Ks2JeRl7HUPJLBSAOj88J4/JMX+OxUAh7ePv4Ke/lRhqr61VTOcCgCzd22ISu7iiwwQKhEVA9QooB8q7cdSAihfDeAF5GFh/LF2+3nj/sLQZizgRNYQ4CPDiO9DT38qKgU1euWca1ns/7f/1IK++69aIYAN6AvVAwALkKuS+quO9cMCmrrM9uh84L//ZWzp/5C2ug+rVlLWMFXIVADbWvbt7Y58yDQEfFhlLKCX6z9J/QvaEyBwjD7Wjr9f8X+izL/ojn9Idv9zYgF/4rIKMOlqevpTUSFX9YpfHGgB/uWpToH/sjsu1wL0VZkGyg4OeCX+QfcSwGb4ofdTfb5qE8Owno8FsEP792+vYw4AjuqYOJqe/lRhrN41Z5zmVABYsYD3RwSYeVVpAAT0fQXyvMy8KJD3zdVfpct/kEz9WK9juvyHSBmw+Vz2EODZSfvT05+KCotNMIzPVa2Ir8wX+ycK0rEHA9AVAFmPAOxUgbAqCbAZf+z4ONnYOezzsTwK6HyE8zvqc4C/2Qe11W0mYyGqMP/c7u2ObGaqAB6qFHTrh8b8kat/KAcFsmkAWnf9owgDA9GVAVWMP+8OP++gAMv9P4ixgGeyBwBbm7ro5zYVFVKd8a95JzmZf/PzH/z14hzAXLKszmpdSgDZFQBewI+lEBBdQYB4CGAMEGSZeNn7yaYQqFIiYEngoR4JdD7uCkAy9q82C/jbSoAT/zjtCHr6U4W5+tb/+EiWF8DOngqgeZ+u+D4aDChx++dl7N3eA10BQAH+UQm3f1GAzns9FPhDzfuwVwBCrgTYVO82BDiBnv5UVJIVj8f3rFoxvmOMwgAAgABJREFUezuL/T/k9+cp3/3XNRiASPhF3lcoHgGq4gGx7wuVjkPj6bCk63S+3vMHL6lLs/+ZCoBD28b/kVgEqkJQAfT1RG9jqQB2bYghAH4s934C/KGI/wusBwDEBDCqYIXA7y5wwJ8TC3iKywCgebthxPeknwBUVBJ1yl2z65zMv9n/95cLlDD/KrwCZJQA2MoD0VUC3cx/WAYIqlYO6PwiOn+ZGfuXy/4nXts9tOvSr9HTn6oghgCP1v937+ry3bYHgK0E6EurACoBJn5QwE5A31fmH0uqDwX4wu+TMfeTAfC6JP9QV3+oeV+Y3f/dYgHPdhkCtNTS05+KClj1qzq+UNUV/zhrAJCK/TN/ieYB/LoGA15SeyygrhuYh20woDpeEEtyjhVDJ3s+1o677P3CcD72P/8hi+qYsX+HLTy3kZ7+VIVUvWtPncxSAXx6f9SF/Rfd8a/i9BSgwYBWZh+iAOBZDdAe76fKDFBUQcAzOPDLDDAq6AUQKZDBQMwlFrD5Y+P5+Bfo6U9FBaiqlXN+mSP9Xz7L+JaG2D+/BwTY8YO6vQCwBw5BHwzI7pZjxR/6fb6omV6hnc/9z39pfS7zbxr/tdb9J74qvjc9/akKSgWwseHzfasj/3F6AfQl2ngYIuWHAnwC+oE2+5N9XZr5j0qY+kV99ALAluxjxf+JmgSGtN1iATdPupae/lRUgvWjldcOcjL/Zo9yif2zmX4vxl+XSSAP0Odh2EUVAaJ/Puz0AL8HCKoGBLJxcqrM56AAVfZ+dL7c+YMXZu/82wqAb3Y0DqOnP1Uh1ifrTh+eGQdoDwJ2ro14eADIKAIIbAfKvZ/1fZHrfWP8oe79InF/IvfDMv/DYv5ld/oLYCjgFgu49YKB9PSnouJlC8zYv67Z92Xu/Nt95B8afdn5x2bqVZkIysYNYikMiq2xmGLVqQGyAw5ZgIztrq/7fIx//qVL6pjs/8Ht4+8n4z+qQv653tcTXZ+pALD7s4cqJc39aBCgBeTrUgBgMfxowwFRKT/UHNAPsz8Md39oLGAB9WMusYDPNN9DP9epqDjr9Hvmncxy/ReJ/RN9PWiDA2icoG6Jv+ggAntwIHsvbCbfb+UB9oCAzsc/f3Are/f/uFubh9DTn6qQ6+MHzyrNVgAke2eOISBvKoBs04BAiRcA9HXe9/nO+Isy/1hKASiwF1UAQHf7RV3+C2xAsKmWPQR4dsoP6OlPReVRcSO+5+gV8RedzL/ZB/3+XC6ADwH82IMBLJd+WQUA1nUi10MGAboGBn4z/0xGWCPzDzUf1MW0B/182X/+gxezpf+HtU24jp7+VMVQvT2x+axVgF0PxDgAeZUipQC1EPMvCtShMX8yzD+K27/s69Dr/IrrE5X2Y3kEFEg/Opo9ANjS/ALFAlJRedToFXPOZe3+H//nC6R2+4PE+ssMEqC7/dBBBJZyQGQ1oRBiBMOuGMAG6FhAOuh//7zvX8Y2/hvSVrczevNFX6KnP1UxlPH4RV/q7Y7szF4FqDD6VlckfomGAn7qUMQAigJ/XxQAUQM/FQBL8q/bFJBnYFBksX+esYBnuRgCTj6Hnv5UVC512vL4fqNXzO7NGgAkPo/cOcMYfPMELrM/t+9hMfzO+2Dv+IveF3K+CBPPq2jQ5RkAHTQUerqAX6sPdD7/+abxH0v6f9Si886ipz9VMVXf2lPHsrwAPl0XFQT6NBAIJdD3AvK8QF/5QIBXwo/t7o8N9CHAnhh9tFjApxvNj73Gxvh+9PSnomJU1crZN+RI/7vM2L/J6Dv9Oj0CZIA8FoMvCuBVx/aFVfIfVBNBen/A39/hEvvXVvtCZ2fnXvT0pyoqFYAR3/OTnsiLTi8AcwiweyOvlJ8k/9oBPtb1ol4A2nf6VZkDigJ+VYw/1MQvSgMCrljAH7usAjT9lp7+VFSOOuuu6w7Kcv1PKQBG/v0yJqvPC+B5FQO6BwOq0wF4VwSwUwCgioF8XxeSZ0BYVglU/bm94vN0nO/HP//BbdnO/7YC4OhbWo6lpz9VMdbOh358nFMBYMUCrokQoA/6YABq1ierAAgM4y+62y+rGFBl/ofF+ENi/wp8MOCMBUyqAAxj+9TB9PSnokqzAcbnqlbO6XZK/80+4g+TUIB+2BtbISALqEWBvmqAXujKAQyzwSCer4qhD9Lfv3Qxm/0/ZNH4lRQPRFXMP/d718RWOr0AzP7swRjF/4XJHNAL6GN7AfieCoDF3GNdJ+vuH0EaHNBqQH8s4OluhoCr6Oc+FVWqTrtn3ggn829+/r2/XuQJ8KHMPo9poB8xglBlgOqUAew0AugqgoiZIMaqBA0a9N6v0M4ftMyM/atlDgBO+sPUA+jpT1XUQ4ANZx+QrQBIDgD6cmIBqQMd74fl8q8M0EOl+rpd/rGUARBmH8PEj0wAs/qp2n7231YAmL21ZRg9/amKvjqNzr1OWTH7ZSfzH1s+Myv2DyrZFwXsOhQEQTINlPUIgN4H6lFAngH+mOapOl+3GaLuv3+m8V9mH9Fx7qX09Kei2mOPT9ZUXc5aBdi1IZrB5IvGA1IHYlAgYgrodr3WwQGvZJ93AIDl/q+r3QA9dLBQ5MoAMxYwE/inBwBN/6ZYQKqir1O65jbmGP8l+rt/Pl+I+ecF/KJKgnznqRwgyKYAiDL/qlYLsFICsD0AsBQBqq8jj4IQn7/Uzfiv7oPqzvg+9PSnotpjD2NTfJ/e7ooPWEqA3Q8TyPZ1px/K6POuACgB9FENigCoVwBWSgB0FYAXoBOgh3VFql1iAW0lgNmbmibS05+qaKt61U1fruqK70yz/ykFQMWdVyR+ga4HSfgL3RsAOx6QBUxlJPTQwYCqdAFSCBAw9+3P2s5m/4/uaKqkpz8VVX/19px+CisWcOe6CDH9hTBYkI0FlBoMRBWsDEBNAPMBfpWMflTQI4CYfryBQDQ3FjDpBbDTePyiL9HTn6ooq2rl7Pks9v/oP052BfBeAB+qGBB5n1+rAypTBHSvHKjyMsD2BKBVBGpQu8X+tdY/RQZAVFQOFUDi/4m+1RVPOhUAVizgQwSsA7PzzwPwISZ/oXH7lzXv0x3rpwrAE8Bng32X7z3+o+xVgLQnwKSb6OlPVXR1yn1XH5IF/FMKgBF//7kQMMeS7qsyAwzqYAArBhBLuq/KjE8WmAd1MEADh2D34Da28d93b2k6jJ7+VFQMFcADPzuCGQtIhoB4bv1+mQFC3f/RgT7W+728AlRL/nld/yNIzD/v68U0GKgQWwnYfI5LKsDkg+npT1VU0/7Yivg6Fvt/+K0ThQA/z+sqvQDCtjqgygsA6vKvKh1AlxcBBpAPErAv9sECxt+/dDFb+n9I+4TfE/tPRZVHBdATvYXlBbBrQ4yAfJC9AEQ9AbR4AchK/TFi/kRNAnUrApwrAsT0q4sFPI3tBbCleS39XkBVNHXq8qvKc8B/1yzj+3+dLh37xyv1x5b0QxUJfsUFygJ0KKCXld7LpheoYu6hiohiA/gFf75b7F9r7e6Rf4v/Nz39qajyDAE2Nny1d3X5bqcKIDcWkHwAUBl9WeZfFLh7rQoo8wKIAk0CoYqAoLn3e+32i15PwD5XEVDhrgR4ahw7FWDL5DJ6+lMVfMVXrdp79Ir4a84BgBX7d8s5nrv5ojv7ouaA0OuCwvLr9grANgeEXgcFgjJ/fp0AlST/4VAGuMb+LTm3gZ7+VFTe1bvulEbWKsCn66ME4FWvCGCZ+EEZf+0t6+4fRVYKYEn5oQMDKMCngYBQLKCzt0x+1TCq96KnP1VB1+gVc6awdv/N2D9MEz9dEn9Rj4CgDQ6gTD3WOVhpAdimfqoAe7Gf7/fAROnfP8P4r3R+jdXm5we31b0ZXxXfm57+VFQcKgAjvndvd+RNpxmgZQi4kQC7lt196G6/KGMv6hWAxtTL3g8LiMvez4vBF32dmH/p2D+v1zNjATP76UmT6elPVbA1Ye21/1W1fPYuJ/ufL/aPF9hjxQWKpg+w7hsEs0AsaT50dQDK9GOvDmBdJ3I9pmeBLhPCsAH5IA4SWLF/5hDgyCVNP6CnPxUVf3264YdDmYaAayME7nW4+2MpAETN/9AVA6KA3guQyw4KsMz+eF+HXkfMv7oBQeLf/+aG3FSALU27jDfjX6anP1VB1ild8cUs479v/rEZzOTz7vaLKgtEAXqhmgc6VwuwFAPYgB1q+ocFOLHuS1L/cHbpkro0458V+9dWv44MfqioRFUAxuc+6Y6uYw0BPqNYwODGAWpz91eVBiCrANAV+4dh+gdx/SfAL6YEcH4/1WYsYFYcYGoQsLVxIT39qQquTr1n7uHmnr8T/A//26XgvX8VKwFQTwCv9AGsAYCuQQI0TlD36oGTecdSLIier2olASulAGuwUGzn8/7zH9xalyP9N/v4m6cOpqc/FZV4fbzhR4NyBgCryoy+nnIC6tjmfVAgj70SIA3kZVcCsDwBgg70RaX/pAAQA/ocr2+ekD0AsD9/lqKCqQpsml+5Mv4gi/0/7NYGUNwfdvwfz/mYgDxoHgHQlQEsgCwbN4ilBIB6EPgleff7/GKR/OeNcVxUyzT+O6zt3F/R05+KCl69q6PXs1QAux6gWEBfBwU8AwMRoK9dKSDr5q9b8i9yPWRAwDtAoMYZICT6sVMZPgCNhrG1+QFSDVIVTI1eMbeSBf5Puv1CKfZfRjEgy/jLpg1gryD4HSOIFTcoaxoIHUhgpRDQ+XKv6/ZMkP77L6vP2fk3e0hrXe9py+P70dOfikqCPNjYsF9vd0VvTizg6vLEL9EE5LmAOgtoYzP+WmL8ZFz9sbwAsBh/2cGA6G6/qAKAGsf8zyH9d17/1NhcLwCztzVF6elPFfpKxf69KRv7J6oQgCoHZIG7Xwy+6nNlATmW1F93rCAW0FYthffbO6DYzrfPs2P/nNL/by6e9FN6+lNRyVffulPOYsYCrqNYQDR3fyzmP3CMPtaOv5tKwK/VAKzdfeh11GKrAazrKnJjAdNeAE1vGkYnxQJShbtOWTn7QhvwZ3oAHNd5vlKGH9vlH0sJAB0whNVMEJoqIKsuwE4ZwE4jgK4iQM0EdXsJFMX5S+uZ0v8hrfXb4/H4nvT0p6JCUAEk/l/6ZHVku+0BYHUxxALKxPhBmH0MEz80E0BojJ8Kl/+oDy3q/o/l8k9AHxbvx6sEYCgDnvxZ7gDAWgVouoCe/lShrep7r/lqZVd8t5P9L7+jP/ZPFfCXifHDlOyLAnY/VQR+mAbyAnLZ+D5R4KgqPlDX+bKeAlipBYV2fubrg9tymX+zj1488Vh6+lNR4dWHq0Z/hxkLuKaC2H9MZYAboMdy+9cW8yc6MICsDPhlBohp7idi9kdMv5wpoNt1if9unm7IXgGwhgGNu41tLV+hpz9VKGt0V/wW1u7/Ubc1GQMSAHeAD7v/2CsHooBfdCChyisg6EMGLPNBiLIA4uovugIgOqBQdT52GkGxnD9ocXbsnz0IOLi9bjkZ+FBRIasAEv9P9XZHl2emAdhKgM8ejBUPmIdK9kUBOq+0X5vU34vRFx0IYO3oQ4E/704/lNH3GhiQu78c0IcqBCrY/fgP3VYBltHTnyp09cN7rz2KJf2Xjf2zQSu2IgAK+IvdG0C39F/VYABLQg4F5lg7/qrOl/1zh/38rK+XmbF/bOf/YZ0//zo9/amoFAwBHhn/dZYKoK+HVADCu/nYKwS+ewBATfywVwj8bujOPykB1A4KOAYImbGAmf3c1G/Q058qVNP6qq5ZjzpN/8y2Y//8aplYQZUmg9iDh0Jl9lWvHAT1fCzzQ13niwLzMJ1fujDX9d/sQ9vGX0xPfyoqddW3tvLSTA8AWwnw6f2R4pbw8zL/WADeN+Y/JhnPh8XsYw8CRF39RQA7Sf5xJf4QgO81GEjFArK8AJ5ueoRUhVShqVNXXnmaE/ibn594+7TAAny3HXzR1QCodF+UwQ+q1B9q4ofF7ENjBlXt+Psldcdyx6fzHe9PGf85d/8Paqt/r7ozvg89/amoFJILm+L79HVXvOc0A7QMAR+m3X5hJh/L3V901cA3138o868q3k+XGSDWYIBajRmgIxbQ2dubR9PTnyrw1bCx7fNVK+JvO6X/0TtnGkNumZADnJ1eAKq8Abyk/qrjB1V5AWCvCKgaGKgeDIju1uuOPxTdRcd6HboLH7TzsdIZpP8+7bXM3f8j28+L0dOfikp99a49rSpnFWBVmbFzXUXhA/t834cAfV1Sfu77QE39oEBfN6BX5QUg4glAXgA4pn4QjwAPLwDz/5HNE3OVAFua3zaM+N709KcKdI2+a86lmcDf7mP/NCUN7gf4uAKA7QUgOgiQlfTLphcEeVUAI55P1oNANvZPNm5Q9vWwnY/F/Ov4+5d21DNd/w9uq3+MJHpUVJpUAJYhYOQx5wDA7M8eihX37j9Uwh9Y8z9Z936RuL+YxGqBLKMvy/zLAndSAOAMDjik/l6Dgid+mqsASA4CaMWQKrg1puvqr7nF/vGy7kEdEGDFC2KlC6gC8vn+/GH0FtClPMAyB5RluIN6PnTAEqS/f2lbLvNvfn780pZD6elPRaVRBbD+9MOcKwBWLGBPeWG5/UOl/LwKASyAjzYQwGL4IeaAfsX6qTDxgzL+1DgMv6g5oGM4sPk8xhCgcbfx/Pn/TU9/qkBO5RPg/zbW7r8Z+xdUgA9l6lUMCHR4BKheIcAG2lgrAFjnYw8UsKTvWMDZr/NlBwiq//6DFrOl/4e2j19G7D8Vlf7fN3b2RJemvQAyPAF2bYgVpxcABOBDlQKhY/6xlAKqdvqh95Fl+Hm8AmgoIM/8C77++JkMM0Dz6+Zb6fcNqsDVKXdfdQwr9m/o3y5lAn7e3X8VAwMMd38I0y+ye4+tNMC6LuzMP5ZLviqmGVu6Dr2Ozs8+t3RBTe4AYEHN7pN+3/IVevpTUfkwBNgw9iu9q8t356wCdJcZux8pkN1/KJCXvS5wzL+odF/2Or+YflFpP5ZHQLEDfq/dfl4FADQGkPH1pnq2IeC2lm/S058qWOz/ivjjrN3/Q1Oxf7z7/0FfAcBSDGADdizzwLACfl3nYSkGsK+TNb3DAsyFdL79cfCiupzdf/PzwxaNP5ee/lRU/tXO9ac0ZHoA2IOAT9dHC9vdH2oeKAr8tSsARKX9UNM/1vuCaAooGgdI7v5qVgCwzAMzr6vI35mxgFmrAM2PkwqAKjB12t3zznRK/80+8S/TpBn+AQEfEGCtBMgOEmTMCzFTAnQrCVTt+MvGEupaPaDzFZ/fUceU/h/UWvd6fBW58lJR+Uo+JP4f7F0VeT1rCJDq3RtjhQfsseL3RKX/yt39ZXb3Vbj7+xXnJwrksVcCCNjDGP0IH6gX8gJI9FNjXIYAk0+npz+V72VmX1d1xd91DgDM2L/BN08QZvr9AvhQN38sgC6bPoDF9AddAaBqQCALMHnej7G7rooJp/NdpP9tdVnA3+5vLWv+Pj39qaj8r08fOPX7zjQAyxBwbSS8kn/ZAYFo/B80TUC52R90QCAa/8drDqh7IKBa8l/M0v8KAJOvKP7P9fux7FhAu7c2vWtsbPg8Pf2pfK3RK2bPypT+2wOAYzun5Ej/IV4Abu+XHRRAmXtVcYNYKQDQgYSq82mVQAxw6hpUYJnpFfL5pUvqc4C/FfvXPr6HJHhUVAFRAZixgD3R1SwVQChiATEk+aoVA8qN/EQZf54BQhRRMSAK7rEVANhKAFoNkGP8oQoAgGLgiWo3FcAMevpT+VY/vG/e/7Ck/6PuuMwVXKti+FUrB0QVAlDlgCxwx/IC0J0GENaBAbZyAOucQj0fezUg3/1KW2uZu//HLrtgID39qagCNAR45KwSZxqA2X1hjwWUBfrOlACs67S7/ENXA7B2+r2uw3D394P5p9YzKJBZBUh8f9O57CHApgv+Hz39qXyZusfunHW70/Xfjv2DMvuqVgR0rhbwpAFgxA5imAaqihFUZVqoetCArQyApgroMi3Ufb7q2Ees8wctypX9J43/zrmGnv5UVMGrnT2RX7NWAXY9EAsekOeV6ut2+dcm+eeV6qtIA9Bh8gdl9mVN/MgEEFeqD72P6CCAMxYwRwXQ9GdSI1Jpr9ErrvoOM/bvr5cwAT4vAIdeHxYzQF6AixXfx6MKED2/mJh/1V4DWGaDqs7Hiu8L1/l1ObF/Zg9pres9bXl8P3r6U1EFkJRYX/3FBODvda4B9HWXJX6JDhnjjzUA8N3VHzoowIr54x0cRAPS0MGAyK4/DQTE3PplBgCiMYB52i0WcEvjt+npT6WX/V8xezNr9//g35+bw/TnA/i8gJ/XAyCogwNRzwFofCAvs87rUSAbV6g6XUCVQsAvjwBVKQSqlABY8YVBOn9Qe67rv9lHLp30Y3r6U1EFt/rWjv5p5gqAPQT4dF00OG7/Ijv9UEZfFuiDBwO8Jn5YigBRhQBWSgB0FcDLfI93IECA3l9FANQrQEQJ4Hjt0VPYA4CtzZtIBUClrU6/a3a1k/k3Pz/hz9OETPxUAHRss8CgA34sbwAsIA1NJSAFQbgBv2pTPm1//6V1TOn/4Pa6bfF4fE96+lNRBZicSPw/2ru6YlvOKoAZC+iHISB2/B90AKAM8OuO/8P2ANDF6KteISCmX++AAMsDQLDdYgGfnkzkBJX6all5w76VXbN2OJn/yJ0zjNKbJ3C79vMqAWS9BAplVUC1ySB08IClIMBWFBR6+gB2ioCqlYOwnV/almv6Z8X+dUz+Fj39qahCoALoOf3bzjUAs3euqfAP6GMz+LyA3UtxoA3oYzP4UICvajDAy/xjAXgC+LgxgKIMPhTgA973cLl3LODTTTuMTdX70NOfSmmNXhGf63T9N/vbf5riudNfwgnUS4pI6o81GFAltfcbmIdxMKASGPs9GNAdb6jz/NLF9Uz2/+D2+r+TxI6KKiQqgMT/q5/2VPyNNQTY9UBUL7MPVQCI7vjzegqgKQCgUn/sFADewQP2YICX2RdVAMjGANJggM/MT/b9Xl4BCJJ/0VjArc2z6elPpayqV877uhP4mz3y7z9PgKx6od1+L8ZfNh0AOiBQNTDAHgxAVwyw4gyxBg2qvACCGGcYBk8B1YMJ3akEIvcpbWVI/xfUGsf/4cL/pac/FVWIhgAP/PB/mLGAq8uDbfYn+7oXwA+M6R8vAMeS+EMHA6oVAbri/GgwgBvnB3X3R1gLeNg0BDzHZQhAv6tQKZqqV62IL2fF/h15WyM3oJc18xMdKEDTBYK2GgBND5C9n+jroudjAXGoIqLQPQOCGlcoK/nHPn/wwroc0z+zD20ffxE9/amowld9PVUXM1UA90f8c++XVQ6I3l9kQKDFvV9WOSB6/6C593vt9pP5XzAUAbwpAJo9ANKxgGewBwDPNN9BakUq9Dqla87xLPb/B3+9mNv0T+V1WB3UAQFkgAAxB4ReB2XaZc0NyUAw2AMJXWkKUue4GP8Naat7t7ozTnt1VFRhJC02Ve/T1x15x2kG2GcaAj6sycwPqgDwSykQGAWAX0oBbDM/qAJAFODTQECt2Z8upUAeH4AsLwDTELCOPQTYNuk4evpTobL/sa7Zz7AGAAf//hxPQ78BCNJ/L8COHRMocr4fzL/qVQLRdAFdgwMspYJf54dNSaAawAfh/NJ29gDgqIXnRujpT0UV3urtOSXGUgF8uq5CrReA6Oui78MC4tL3gzL1svfDAuKy9/Ni8EVfd8YDEvOvZndf9n1YbL7E/R4dzR4AbGnaSioAKrQafdfss1ng///+fAEY2ENTArC8APwaGPgVHyjr7o/N1GOtNmABdMgggZj/8CsCBnWwwf9BrXWP0A9RKqrwkxe9qyseYQ0BPtsYwwfyXoy+rLt/vvsqUQRAgHxUAtB7AXJVSgFVAB96nSzzT4MCGKD3AuT57iupCHAy/G7Mf+brT57t4gUw+Wf09KeSrpZtN+xbuXzWR87d/4o7r7B+wXYD6ViDANGBgay0P+grAFiKAazrZE3/sJhzrPvSakFxtR375+wTljQeQk9/KqoCGAI89ONDWAOAvp5y/TGAojF/kAGBr5J+LMl/zMCN/wu66R/t/odr919kQFChsBP/LWxuYKgAGj8yDFpfpJKs2MrZ17DY/2P+OJmLsRddCYB6AqhaCcAaNIQlXUB2QABNI4AqE1RL8r28FHSvBKgakBSjGeKgxbVM8H9Ie/1ievJTURVO9a2OLWaqADZE/QH6okoAN2CvfccfC+iLKgFiiiT8OoA+JK6PF+jTQADHvA/bE0BRZyoC7I9P/MRFBdA4j578VOA6/b6rDnCL/cMC+rKmf1jxf4VoAigC0FWtEogqAaDu/2Hb3Q+7d0BBsP8LcsH/oAW1u06+4+L/oqc/FVUBqQC2TPiv3lXlu3JUAN1lxu5HJMz+oNfLuvnLmgaCAT7W9bJu/iKrACrN/ngl/1hpAdR6BgWiwB9pQOAm+fe63i0W8NmL9qenP5X4D0zD+FzlivhdrAHAEX+YKMz48zL2sqaBUMUAVgrBgJAMCrDM/LAZe1kzwaCdr8qzgFoS/C9is/+HLTpnAj39qagKrz7pGX0uMxZwfUT9bj+WFwAW4y89GICa9cl6Aehg/FXs9osqAKhxXf2xvAA0MP48XgDOrx87w00FsJK8jKiE69R/XHkiC/x/PxX7p4r5lwXuWF4AQYsPlAXkWFJ/3bGCWEBfNZD2G6AH4Xw/Ab3Q37+jnm3811b3anxVfG96+lNRFV51dlbv1dtd8SprCLB7Y0xuFcAL6Bd8/J8X0A9r/J8o869qx58GBv7u+COa/WGvAthfP1XLHgJsn/x/9PSn4q54PL5nrGvW81GJ2D/RQQD0emxmX9WKADTeMCipAtD3Y6UM5LuOBxDq9hLAWpVQtfLg9/m6lRCZ7xvUxmb/j1426UR6+lNRFbCyceMZJzFjAddW4MT4Ybv8+9bQGD9sl/+gmfrxrghATfwI6KsB+kE18RNcBci3IuAeC/icYcT3pKc/FVdVrZxTy2L/j//z+doYf6z4Pl5lgKiSIGieAdiMP3Z8nyhwVhUfqOv8sDL5BR9PuNgt9q9+FUnlqKgKfABgxQJG/8U0BHxIgMHnHRRATQFl7xuYQQGvMgDqEYA9OODd4ecdFGC5+tNQQO3AALIyoIjxz+cB4LUK4BYLuG3SWHr6U3lW/aqOL1Qun/mxE/zni/1T0VjmgbyDAaw0AOjgIGjmg9jmgaL3w/YagK4gQAcPQT0fSxHg9/lu6g+v+5S2Jtn/Qam2BwDH3Ta5hJ7+VFRFMAR45KyS3lWjjGTbA4BRRl9PGR6jz7sC4Bug593pl93V5wXwQZHwYzH6bp4CvECUlAC4bv+8AD0iCOiBwN8LyIteb3/9cMQlFrDpY2Nby7709KfKW5UrZ/0yX+xf0AC/jFmgKEAvKQBgrwrwyw4GsCT00MGAX1L7YvAGCMr5pYvY7P/hS86ZS09+Kqriqb6e2FVMQ8ANETEvAKg3gCjDH7gVAdFBgaiJYNBXBGS8AWRMAWkogGsCiL1C4HObQ4DHf8xWATzTdC09+alc69TlVw50An/TB2C4QOyfamZf9coB7/tkzQcHLPPHXBAL6It4BcgoAXSvPMh6GcgONLAGH6oGKlCgr9pzwPP+S2uNQRmxf7YCYPCC2o9HdsS/QE9/KqoiUgGsqv9C76pRH2cqAOzmYvqhgB0L6KMPAlS59It6AIh4Bfix8w+R7keJ2ffN3A8K4EW9AjTt/Lsy/452iwXcQkpHKtYPRDP2ryt+L2sAwIr9OzDxC7XZYZH88wLqAchmgGFJHcAy/4PGDKra8Zdl5FUDUzpfz/mD2muY7P9Riyf9kJ7+VFTFVx+viv6EaQi4rgLfDBBrMAAG90E3A1TF7POa9qk2A6TBQDDNAKEKgoANBpztGgvYdA95HVHl1Cl3X/kDG/Bnuv9/7/bpOcBfBuSrGgxAUwJUpQME0QsAAvBlBwOiJoGq4g9Fd/GxXlftBSC7U491PjQWUOX56euWsqX/Q9rrttIPQyqq4iU9+noqtjq9AMze/VAMR+IPlfqHzgtA1BOg0LwARDwByAvAG7TrUgQo2vHX7QXAjAWscTEEbP4+Pf2p0hU34ntWrpj9kpP5jyyfYRzEGfuHoQYoAUjyRQG9rJmf6PnQdIGg+gSoWBGQMf8TBeiy0nfs87GYb+g/T+zYviCeX9rWL/nPNP/7Znvz0fT0p6Iq4iHAuh8ew1IB7DQNAUWYf4iE321AoHQwAGXuRXf3RV37dXkBQGP8RF3/Cej7owiQifsTuR+S+R8W888aBDxaZRibJzHWABpfpFhAqnRFu2ZMyAT+tgLgu53nK5P86zIRhJoGil6HJeWXXTkImokgVEGAzbxjpRbwnCMDWLEUBkE/H8vc0TP2b4lL7F9b7e3E/lNRkQqgd3XF7bleAGXGZw9E4SZ+UMbfN+M+bBM/KOMfFNM+XmAPHRBQ45j7QZUFigC+bOyfCMPvNSAwPz55FlsF8PSkenr6U+1x2vL4flUr4r3O3f/yOy/niv1zGwzwDgywzP6wBgQi0v0SRGUBtheAyDmYTD72igHUxE/VygBU+YAtcccahKhy+Q/E+ab0vzUb+NsKgBOX/fx/6OlPRUVlrK/+f6wBQN/q8lwQDwX0MkoBVKafVwEgcoaMlF9UKaBjd19mt1+U4acBgdo4wJDs9EPv49kusYBPN/Ua6y/4Ij39i539Xz7retbu/9F/bM4C8k5AHxRFgEwMICQlAMsLQNUqQtgUAbIAH5vpx14dgF7n9/nYSgs/zi9dWJsl+bf7sEXnXEBPfioqKrs+W1M5jeUFsOv+CjkFgKj5X2Dc/bEUAKpSAvxy94felwC/HJCHvg69TgPrL8LoQxQA6VjAH7kkAjReR0/+Iq4frbhyCMv1f9jfLxUG4roGAlCADrmuBDAw8GLqRVMLir2xALKq67BN92QHBtAdfeyYQd/Pdxj/pWP/WmvfadjY9nl6+lNRUaVVABsbPt/XXfFOpgLAUgEkevfDlXAAH6gVgKihPg5Ql7s/dBigYmBA7v7BTwXAkvxrNgUUjQN0+3rTBPYQ4MmmUnr6F+MPPDP2b8Xsbifzb35+2K0TXYG9F9CXXQnQlRKAPUgoQVoJwBo06BosYEvyRe+r63wsjwNZYK/KPLHQzh/Yls382wOAI5ZOLKenPxUVlbN6154ecQ4AzM8/XVcOl/BrN/GD7uZDgTwU4MsMBiIGvnkflieAyEoAAXf47r5qd3+RgYAPwN7rdWc/epqLF0DjKvJCKsIaffeVw6MO9t/sk26/UAioh9UcUNcqgZd3gCxQh4J6XYMCWSCP9X6s3X3VTLwqyT3U60BVjJ/K8wcuqWUa/x3cVvcQ/bCjoqJyI0X6Vpc/2D8E6B8E7N4YFZPyiwJ97UoB2UEBz8AgKuAZoFspgO3yT5J/PUy+rDmgKOBXxPhDXf5lYgGfdIkF3NoyjJ7+RVTVndV7Va6Mv+Lc/Y8un2EMueUcJuPPqwTI93qQBgJQ80GsFAGoF0GheAaoYu5l4waxBgLYCgDslQas86EeDCrPH9SWy/ybfdStzUPo6U9FReVWnzxQfTDLC6DPGQsoC+CVAX5exh6b8ReJ71MJ+HkBOTbjT7F/at3+ZXf7ec0CAyrtx1ACPFLpEgvY9LKRwIT09C+Sit4Vb2BJ/4/rnAqW9AdNCQBl/mWBO1QhIPt6oXsHqAbk2Oeo8iLwI9ZQpdki9vkDF7Gl/4e21rfTk5+KisqretdE27JVAKlYwA1RfOZfOaOvm/kPGqOPvSJAzH+4BwUyUv+IWnd/Vcx/Zj/xM7YKYFvjufTkL4KqufuXX6rsmrkzmsH+m1125+VZQFJ2l99rQAD1ElDtESDrKSDL7GMx+WHzElAVOwjd0VdlWqgq9lB1yoCq3X7s80sXZAN/axCwoHbXyM74l+npT0VF5VXGpqYvJwD/rn4lQEoF0D3K2C3K7PsW4wdh9jFM/Pxy9Vft8g9l9mkQoD4VANPlX5Pk3w2w817vyvJ7vd81FnCn8WrDfvT0L/CqWjl7Piv275u35Y/9kwHyYWT8seL7eN3/sVYGKC1ATaoAVnwhNPZONj6Pd7c+zOebsX8s6f/h7efV05OfioqKt3auq6zPXgVI9q71FXJAX4kyIIqgDFC1MhAWZYCqlQFSBsCBP0bMH5b7v+ZVAayVAdb93GIBtzbeSE/+Aq7T7v7lwU7m3479E2Xk3b7mHQgU6goBdNAgysizvpaJI8SKJ8QaSGArAfw2L8RSImCvABTM+UvqskC/PQgYvKD25bgR35Oe/lRUVNwqgMQzo7e74uXcVYBR2YaA2qT+XsBbNCXAC6AHFdBDJfuiAJ0AvT8Sfuj12EAfOBjwWgVgAXIewC8L/J3tFgv4HPkkFegPNONz0a6Z6zJ3/m0FwGG3NqDt+Acd2Ov2DMAC3FjS/2Jl+nXfV1a6jxWPJ6pAwI7n03W+HfvnHAAcc9vk/6OnPxUVlWh9vGb0SU4zQPPznWsqAujqDzUBxFohCOpgwAvgY68Q0GBATfwfljeAz9J/2ZUBEaY/33WPnuoWC7iWkpIKsKpWzi1zmv5FM2L/eN3+ZZh/iCcA9gBBltlXvXIguruPqSAYEADmPywDBNUpBljnY60qBPn8gYtqs8C/3UPax99LP8yoqKigpMnONZF7mCqAh2I+Mf9erD50MCAK4KEAX/R9suZ+qgA8AXw1igBeBh9q3ucT0McG8FDmP7OfHMceAmxpGkVP/wKq6s7OvWJd8dejjNi/wTdPUArMVSkAgjYY4JXcYzH/uoB52AYDQY8XVAWMeXfqVTP7fpw/qLWf8c/s4285fwA9/amoqMBDgAerD3SmAZidjgX0jfnHMgPEcvcXXR0Iihkglrt/lAYDqEw+xAyQZ7CApADgZfZFFQCyMYAigwG3WMCtza8bBsUCFkxVLo9PiWWw/7YC4DudU5jsfz4lgOjrXgBe58pAyTL1KQKiZoJYHgPQFQNVXgDYA4ewDgagA4Kgnw+9D/b5gxay2f/DFk6I05OfiopKtj5dUzmXpQLYtaHCB2APNeeDAnQsQM97H1GALgv0ScofHi8AHsAe8QD4Gk3/RL0ARF4Xbbd75MQCTrJ7Mj35C4H9XxX/cmx5fJfT+G/UHZcbA2+u92T4RRUBXgMCv5UDWAoBN/M96AqBLPMOPR8LiEMVDoXuRYAFkKHpAUE9X/Z+ya/rcmL/rP3/BXUfVa1s2Zee/lRUVNIqgG0t+/Z2l3/o9AIwWx1zD70vVMIvej+/dvxF3ftF4/p470eDAVxGX5b5l93pjxha3Pu9dvtVm/9ZXeaIBTyPsQbQuMt4/aIv0dM/5DV6RXxRjOH8f+RtTSjMv+xqgF9eALpMBFWbC8pK87HPpxhCf9IMsM/3Sykg8r5M47/M+L9vLG48nZ78VFRUWLVrzak/ZKkAPl1X3i/9V6oAEGX4ZaX9fikFsBh+WWk/KQWCoQDg3enHGgQAGX2sgQEU4MsMBB77IUMBYK4CNLXTkz/Edfo/rj6MFfs39G+XCDP10OtVS/xlBwZYZn8qBgQly8RNBDEk/io9ArAHB7L3U2X2p+p8VcoD1edjKwVKOtjS/8ELajeT8R8VFRWqCiDxTOlbHdnMNgSMAkC+buYfWykQNuYfWylA4F3N7j72br9i938vBl/0daXMf75YwPFsQ8BnGg+hp39If2BVrog/6AT/phrg0FvPQwP40BhAWeY/KIoArB19VasDWNdhxRKqMjssFEWAauYdar4XtPMHteUy/2Yfc3PTUfT0p6Kiwq6+njO+yRoA7Owp08D8i0r3Za+TZf5jCpj/CKJSAJP5J8AvPwjgBeTQ+yIrAngBPvQ6WeZf9D6Pju5n/rMMARs3EKESwqpaGY+y2P8T/zLN0/hPJg5QVPKPBex1DQOwTPxUDQywJP+iQBxr959WC/RI88N8/qAldUz2/6C2uk76YUVFRaVMBdAd6cz2Akj2Zw9ENLv7Q80DRYG/bgWAqLQfavonshpAUn99aQBQYK859g8aAygK/HUpAKxYwLHZKwB2b54Yoad/iKphY9vnK7tmvukE/5HlM4zSm8dLSfmh10GVANBBgy7FAHRFAGv1ADqQgA4WRNINVAB76KChUAcLqnbsZWMJlZ2/NBn7x9r9/9atl36Nnv5UVFSq6r01Y77GUgH0rS7TBOyx4vdEpf+q3f1ld/exd/Z570cDARzzPixPgJAAfVHpv/Tuf5nD/I91rxgjFnCSaQj4pmF0UixgWGr0ivg0p+zf/Hjsn6Yoj/uTVQKIAvVCUQyoWiUQdeuHuv9jAXm/gXqhDQpkgbwsg499/qD2Gib7f+jiCS305KeiolJdvT3RC5ixgPdXGPhmf9ABgWj8H9QjQLXZH3RAIBr/B/UIoFYzKICaASIMCETM/rwGAthpAWjtMhB4otplFaDpAnryh6Cq7237arRr5m5W7N+ApXVg5h46KMBSABSKZ4Aq5YDooEGW8Re9n1/nF0uMYFGc72b811r7n4a2ts/T05+Kikp1GRsbPt/XXfafHBVAoo2Hsd39sTwAZBUDuk39RKX7qhUD1P4qAHheV2j+J7vbD1EAqJD58wwCNp+bmwqwZdJuY8uE/6Knf8Artnzmzazd/2/8oVEY7OtUCMi+HlaA75dCQBZQiwJ91QCdlANskO2XqaGS3f/23AGAKf//xrKmUfTkp6Ki0lWfrKsqyx4AjLQ6HQuI7vIvG+unS+qvaiiAMSggqb9+4M/rBcB6f4X/Zn9YzD62F4DKfuxMdizg043L6Mkf4Dr9rrnfYIH/kzNi/7B3+mVNA7EYfllvAZHBQxCVAapTBrDTCKCrCFAzQeiqhOqVBzJD5BwALGGz/0Pa6smlloqKSq8KwDIELL+fGQu4UZTpxwD4WC7/uiT/vFJ9N7Zelcs/AX0coI/t8i/C7MsoA4Axflgu/9ok/x6eAE/VOVYBUoOAzRMPp6d/QH8gVS6f+QhrAHDI78+TYv/dgLsIsBcF7ljMf5BUATKAXBbYy8b+YcUH8gJfSg0oLq8B3tg/Zx9989TB9PSnoqLSrgJYdeZB+LGAvJJ90fhAv1z9oYMCrJg/qPs/tX5lQD4mX3awoEgZIGvuh272hzQocIsF3DLpYSJcAlindF11iuX0f+cMq6Gxf1gpAKLMvygjz3s+74ABa4UAa+CgOj5Q9X15AT50dUA2rlBWEaBaoUAmhhlDg4U1brF/8+nJT0VF5Vft7K6Yz1oF+GxDRDKOT5VXAFZKgIzbfwRBEQD1CsBKCaAW2/UXBegaAD3PTj+U0eddAUAH/Bxu/7yKACsWkLEKsLWxip78ASoz9i/WNettJ/NfcWd/7B9WqxoMYO34B90bIKjeAlgSeuhggOc+JT4CawLkPnXi/91BCxgDgAU1n47sjH+Znv5UVFR+1et313ypd1XZzhxDwO5Rxm4l8X/YHgB+uf3LrgyIrggQ4PeH8fcC+NgrBD55AEB3+UUHBMKDAd6BAON95v8PmyfmDgC2NL9tGPG96ekfkKpaOfsSJ/Nv9rf/1IIK/qFeATJKAGzmH8ucsNBSBESvk105UOVloHqgAQX6qr0DCnXQ4Bb7d8Si82royU9FReW7CmBNVa3N/GcOAT5dVyHBxLt5BcgCdr+APjaDL2LeR0Bf/86/6GBAFMArAPgirv5QUz8RoK/VA6DM0anXH/9JBvjP6C1NF9OTPwA1Zs3VX2PF/o284zIr9u+ApTVWqxoEiEruWcAbwuBDFQEQSb+OwQCW+Z9KgF2iAHhDga0uYOz3+UEdDGgZOCypYxv/tda+GI/H96SnPxUVld9lGPE9P1ld/iLTEPChCFABILrjz+spgDUY4GX2oQoA0R1/Xk8BUgD4PxioQFAQuJn/ad7xF00HkB0MKFsJyNObzmF5Aew2tjd8lZ7+vv7gMT5XuTJ+m4rYPzcGH2tAoDt+EMsLQLciQHYwAB0QYMUPipoEYqUD6PICwAbSPOeX+Hi+zpUJN+O/b93aeDw9/amoqIJSH/eceiLLC2DnmnKgF4AqiX9QTP94Abjo614An4A+bLdflSLAZyk/rzRfNq5PuxcA72CAQwlgxQI6VQDWWsAfyBDQx6paOe+bNuC3VwDMPvmvF7sCaixFgGicHzTuD+t6aBqBrFJA1QABazAABehQQC8rvcc+Hzu2DzsVodAUAbzXDVzEjv07qL3+H/RDh4qKKmhkTG9P+V2sVYDPHowgxPhBFQFBc++XVQ6I3p8AvV5FgGzcH+/9gIMBaIyf6O4+jwIAHeiXAQA/p3LgqfpcLwDLEHDykfT09+kHTmz5rCdVxf5hDQSwvQKwVwPC7gUAZeSxBwxY5oDQ66CA1a/zVXkRqALyus8f1JoN/AfeNM7qEzqaDqSnPxUVVdDqww2nH8BaA+hjxgJCXftVKwWCogDwSylADTPlwx4Y+KQUwDLxgzL+2tpLAeAVC2h7AUx6gggZP9j/5XPPZMX+nfCXC/Iy/bo8AVQpCaDKA1VAXnRgELRBApSpVz2gEAXwWMBdtUeB6hWCQjh/0EI2+39I+/iZ9OSnoqIKan26JhrPXAGwP9+1oUJyp18VoJe9H5Spl70fFrClAYEaLwAegC+jFEDe6Ze9H1TKL+oVwL3jL/o6x/uePJsRC2gOARpPpye/xqre1LlPbMWs952u/2bs38Bl9VkAnxfwYw8GRIE49uoA9nVYsYS6vAWgTDeU+cdi+rFXB7CuC8v52J4JqkwQXc93xP7ZzH9pa+2HVStb9qWnPxUVVVDLSDyjeleVfej0ArAMAR+GxPzpUgpgAfwoR1yfjLu/bAwgAX4YkIe+Dr3O5/g+LAWAqpQAaRNA0VQAsyMusYCN7xsbGz5PT39NFV0Rv8Ip+zeHAcf8abI2gO+XQkAUwMvGBWJ7AIS9sRQD2IAZy/QPCnixlAWq4gL9Pp+725Kg38n+H7lo4mn05Keiogp67Vo3+ozcVYCRxqfryhCAfNAl/ViSf6gCgMB9MFMBoMx+xF9TQFHA7hYrqE3WjyT5d3u/FQvYyDIFvIye/Brqh/fN+59Mwz+32D8n4McaADjvI+rqj2UiCD1fVAmAlRKANSDQNWSAxgn6PUjAUiyInq9KMYC1woA12MA+Pzv2L1f6n2T/azbRnhkVFVUoVACmIWB3+aZsM8CkEmD3Q1FON35eoO+X2Z8s0Ge9jukJQK1+959H+g/d2ee9H+d1ItJ/EWYeCvDBgwEJCT+KEsCOBZyU6wnwROPX6Omv+AdLtCv+Vyfzb7Zo7J8ujwBZIC+7SiCqBFDl/h90jwBZgA0FyAMk4wGxlACqJf+qdvSxGXs/zx/U1i/5z4r9a2sgp1kqKqrw/K62/rQjWYaAO3tGCcbz6R4E8Lr0y14v6+ZPAwJ/mHxZc0A3hh+aJqCY6XcbDEBiBH2J+4MOCvIMAh473SUWsPF2ImoUVmz5nGOdwN/8PDP2z435zwf4gzwYwE4bgCoAZL0F/PIC0BUjiBU3KGsaqEoBgJ12QOdnf3/g4tqsnX8b/A9ZUHcb/VChoqIKG1nT11Pxh34PgH4vgM8eiEgoAPxaAcCS6st6ARCg94fxl93tr5BUDCCBfqi0H0sJILUaUMYh+edg8GUVAFYsYB1jCGB2w7fo6a/oB0psxezNrAHAwbec6wn0w97YCgHZ+D/V6QJBWw1QDcixgCu2FwEW0MWW6GOfn+/6EkTlA7OX5sb+Wb2gZvd3Os7/b3r6U1FRha3efbT+v3u7R+52rgL0rR6lKf7Pj4EAthcAxf8V1qCANx2gQu/uP5YnQOAYfdlVAJfXH6lixwJubaR1TSXs/50zf8za/T/+zxdwMfaingB+xQhClQGqUwZkmfygeQkExTQQW5mgKmVA1W4/1kACi9lX5f6f7/yB7TXM3f+DF05opic/FRVVWKu3u3JKbizgKGPX/eUB2enHdP9X4fJPjQva830Ndf/HdPnXJPl3A+yyrvxorv7QGD8Zl3+e72e0FQvIUgE0/Yie/IjVsvKGfWNds3Y4mX9W7B+v9N/PtAAs6b8IsJeN/cMG8oWWJoDN+GMDa9nYPdn4PlHgrCo+UNf53AODjtoc4J8y/nsrviq+Nz39qaiowlqGUb1Xb3fZW84BQF/ic2Mjb+xf1MAzDcTY6RdZBeBVBkA9AmhwoIbZx4r5gyoDfGroYEBkBUBLzB/r+yKDAx6PADMWsIGhBGjcYWyq3oee/khV1RWf42T+zc+P/uNkYcAPTQlgXa9ygIBtHiiiLOAZCEAVAqIDCdHBg4hCIYgeAdjmg9hKBCwJvuiAoFDPL8kw/svc/T986cTh9OSnoqIKe31y/6kjnWkAZu9cW+ajuz/vTr/srj4vgCdAHxx3/wgCoy8L9IGDAS+3f17G3u09vq0ACMb1cQN8SSXA4z9mqwA2TYrTkx+hqlfO+7qT+Td7xN8u5QbqheQNoGowAJHwi7zPL2ZfxZklPkr/Ma4rQQS8WOkFsudjrQ5gpxvkO3/gYsbev2n81zZ+Pe2RUVFRFYYKwPhc3+qydbmGgCONz7hjAYO2IiDrDSDK8NNgwP80ABnpvyLAjxn/B2H6A+MBANzlFx4QMN6/aQJ7CLD1wv+lp7/kD47oividmbv/dh/xh0lMgM/L8PMOCnQz/36lCIheJxtPiDWoCNvqABbQhyoUdJ+Ptarg9/lYpoqZXw9ckM3+233MkqZSevpTUVEVzO9yD55R6jQDtFQAa0YFBOhjuvRHJDwAyCvAH08AUQafF7BrkvzzMv9YUn0owBd+XxmH+3+ZwM4/FOjn+f5jp7EHAFsa7yAiR6Jiy+PfdQJ/k/3/wV+nC0v+oUBd1gxQ12DAS2qPBdR1A3O/z1elEFBl/qcb4EIl97LMO5YZn1/nD1zIZv8Pbh//O3ryU1FRFVrtXB35ndMLwPx814YKhYCfd/detRlgBGkwQC3P5GO83+naz+spgKQA4GX2RRUA+Zh+iIlg4Fz/vQYKZbB+qpY9BHjmvO/Qkx/I/se6Zm1zxv6ZPeSWCWg7/VjpAEEzDZQdEGDHD6ryAsBYEdARZ1ji02AAOiDAijnUfb6omZ+qc/IOCBL/fQ2cPy5n97+0tXbn8W0N+9HTn4qKquB+p9vYsF/vqrKdTi+Avu6RiV+iw+4FIOoJQF4A4fIC4AXsXjF+ATH942XmsST+3NeLmPpBPAIUeQE8UukyAGh8hlQAgEqA/p+xYv++++fzhVz/vVYDsIA+VJHgV1ygW4oAFKBDVwiw0wN0DxD8Wh3ANikUBchQQI11P13ni77Oc35m7F/mAODwtoYx9OSnoqIq1PpkXeU4lhfAp+sqNEn+oTF+orv7UAUAeQEEQxEgEgMYQdjpjxha3PtZ3xe53jfGH+reL7DL73k/j/s/cZbLKsCkn9KTX6DqV8W/kAD7Hznl/2V3XG79Ui2y64+x8w9RCgTFHBDbK8AtjlBUsi+bLqAKyMuuHATNW0BXmoHs+arNBbHTDcCDgyW1WcDf7sGttc/H4/E96elPRUVVsCoAI77nJ93lz7OGALsfihjBMe2TNfGDMv7UwVIA8Oz0VyAOAgKiAFDG8POCeRmGvwxgDojRib//5vNYQ4CPjG0t+9LTn7Mql8evFo39g5oBYjH/2N4BQTETlIkT1CHxFwXsqlcIsCX+qgE8lCnXNSDw63zRAQLv+QNb2bF/hy2bdBw9+amoqAq9dm6IHs/yAti5psxlBUAFU+91T+huvyhjT2Z/uGZ+UAYfqhCQbcn7eTHyoq/zvs93xl+U+cdSCvDGAk5MdXoIcBU9+Tnq9PuuOsC582+2GfvHI+WXVQTwrg5grxJgDwawXPqhqwCy1/l9fqGtDKgaOGAx9aqk+0E6v2RRLVP6P6S1dgXtiVFRURWHCsD4XO/q8i5mLOADFQFx949KSvdFFQQE+PVK/qEu/dD7IisCZE0AVTP/KG7/MjF+rK8xUwLydFYsYMYg4NmL9qenv8cPhujyWXezYv8Ou7VBCqBD4wGxlANBYv0xmHvR3X7oIAJLOVBocYJBjTHEjv3DAuiqr/NMF1hqxv7lMv/m58d1tnydnv5UVFRF87veI9VfZw0A+laPCsnuPwH64t799zn2DxoDKAr8tSsAeN39oeaBGlYBHmXFAk40YwHvIqInT1XeNecEFvj/3u3TuQG/7EoAdJCgS/qvy0QQGieINVgQ9QSQNS/ESgnQrSTQteOvO91AdnAQtPMHLqxlSv8Pbqu5nJ78VFRUxVaf9ERmsoYAuzaUSwB52ZUAWU8Acvf3F8hXSK4EyHoChAToewF5XqCP5u4vGuPHqxiASvslhwNP1eQOAMx+tvF4evIzyjTAinXNet4J/s11gINuOUcY0HsBcdHvu4FuKCDX6REgA+SxGHy/AHzYzP78OhvbxE/H+0uWycf/qV5lsLojV/pvDQFaaz6o7ozvQ09/KiqqolMBbIrv07uq7AOmIeBGv9IAMl+PCL4uMyCggUCwVgMgZoA+DAh4VwFk0wKUsf2ygwKs+D9kRYBbLOCWxudMI1R6+jsqtmJ2DYv9P+7PU4XZfZ5BgSzjL5s24DZY0DUY0JEOwLMigJ0CAFUMqDo/rFL+sCoHZOMOlQwq2mpymH+zj1rUcAo9+amoqIq1eteMPpUZC7i+DEnC7wa0sRl/UQBPgF+vqz+WFwAWoBe8jyijDwX86Lv9qhh/qAIAqhgA9BM/c/gApLwAtk0aS0/+jKpe/5svxrpm9uaL/eMF5KKrAVhSf6/rw96yCgFZjwFZoO9XfGCh7/7rih9UdT52/GDO60tqcyL/zC5trXuC9sGoqKiKWgWQeAb2rS5/nKkCeDDi444/ttkfdbh3/H0y+4MMCHR4AWhNBShDGBRoYv49YwGtIUCv8Xz9F+jpb7P/y2f9msX+f/OPzcp3+7FNBKHeAkGJEYQqA1SnDGCnAYgOGGTNBIPuJVCoygSsVAPo+we15Ur/zT6qY+Lh9OSnoqIqehXA2tO/wRoA7GQaAsoqAURj92SZfRoEqHXvF1UCBNTETzbGD8vlXxmgh0r1ofeBAnzkgcDjP3KJBWz8JT35E3X6PdeWsMD/cJfYP1kzQF6AjREzCAHsQVUQqDINhHoEyN4H6lFAqQGFZdqH9edmx/7lAv+k8V/dLcT+U1FRUSVVAJ90l93MjAXcUCHJ/PMODFStDJAyIJimgF7XY8cHZl6ncVAgawroVBQoHxzwSvahqwAKYv88YwHHs/0AXjh/QNE/+CN3zvpnvtg/7N1/2etlVwBEBxLYcYXYSgBVaQFQ80FRE0Lo6oBqhYDqGMOgDy7C4lHgep1b7N/8cbuP77zkq/RrPxUVFVXqd8ENVV/p7R65O2cI0D3S2P0wD/AWHQjkA+gE6MOz2w8dCGDt6EsoBHgAOZTR510BUALoyzQoAqBeAT4oAR49NTcNIKkGuLeoiaDK5XO+zwL/J91+ETrTL2IKKCPhL3RvAFWDAay0AehgQBagy76POhhKA6z7DmpnS/8PaZ8wiX7dp6Kiosqu3jXRJrYhYLmEF4AXo4+9QkCDgXCZAGKvEChi+mXNAmVjAaUGA2UKVgawPAA09VNjHSsAqX6m4aSifNjHjfieseXxl5zgv+LOK4zBt0xAZf9VDBCgCgFZjwG/vAFUpwjoXjlQ5WWA7QlAqwjBVBbkvY+L8d/g1po34qvie9Ov+lRUVFQOFYBRvVdvd/kbTEPAhyJA8z1VAJ4AfnDM/SoAqwCyzH5EjZwfi/mHegAo9QLAZPChAN+nwcAjMcPY3MBSArxYlLGA0a4ZE1js/3c6p/oC8KHAHCLdFwHMsoA/qIMBHkANSR3AkNqrNAPEShfwezAQ1IGDX/GCmfcZ2FbDHAAccXPDUPo1n4qKiopdn6wbPZxpCLgWOxZQVkHA6xVAHSzXf9lBgebBAKYZIMT9H938D+v9Xl4BPpv/ucYCTmQpAeqL6iF/2vL4ftHlM3Y6wf+oOy4zDlxWa+yvkPlX5QUA3enHSgfAalX3F93Fx44fFF01wIolFDUb1B1jGLSVBVXn6/IUKFnMBv+D2+rWkPEfFRUVVT4VgPG53tUje5iGgA/KmPNBAToWoKfBgFpTPyjQV7jjLyPZx5L4Q6X+2mL+oFJ+KMD3czUgMxYwywtgp/HvC75YPOz/8lnXs9j/o/7YpEz6LzsggKYH8J4nC8ShigS/4gKxvABEgbus9B77fCwgDFVEFArAD4rSYOAC9gDgmCVNpfTrPRUVFVX++njDjwaxBgB9PaMEGHdo3B90tYA6GIMD2bg/3vsBBwPQGD+Iez80DUDZYKBMQBHAmwIQEg+AdCzgDx0KgNQQYMuk3xbFw/2Mu68sZYH/YX+7xAKm+6faCWj392kgAL0eag6IpTAotsYyB4ReBwXCfp2vauWgqP0FFrLB/8Ht4ynzlYqKioqzeldHr2MNAXalYwFFUwBkvQOI4fdXASDK8MtK+yFKgQCZ+EEZf61dhmjuF6JBgBULONGpAjCMbS2DCl7eFemauRoz9m9/xUCfF5jLDghkmX9s74CgeAZATfx0Sfxl4wuxmH+/gLzf5wemE3+ngfNzwf+g+TW93+8sInkXFRUVlezviuurv9i7alRvjgqge2Til+ioxI4+llKAwHq4mP+A7/TL3g/K2IsqBbhd/kUZfNH3YQFyHwYE6VhAhxJgS2N3Qa+JnvKPOcNY4P/E2y/My/zvr5HZhzL/WHGB0IEE5HzVAwMMab4IsMdg+rFXB7Cu8/t81SaEfg8MZM8Z2O5i/Nd+3ln06zwVFRWVWO1aX3k2MxZwXTmCFwAB/HAx/6LSfdnrNEX2yUr7sRQEynb+RQG9FyDPd98QKQKeHOu2CnByQT7Mqzur94qumPkyK/av9ObxygC/7tUAL4CtKubPb/PAsCkGsK6TNf3DAsJYygIoEC7qFYEOduxf6YKa7fF4EUa8UFFRUcmqABLPzk+6y7fnNwSEmv6pigek1uPuDzUPlAX+mk0BRQG7rFJAm9mfKgVAAPf+XWMBJ7JSAV42Eli54B7mFV3xBhb7f+yfpuQF/M6BQNAGBNgrAVBPAF2eAWFbIdA9SICaHUKVCdiKAax0A1UDgiCeP7B1HHMAcHj7ed+hX+OpqKioYLVzfdVxzFjAnjIG4Md05aeBQDCBvRsgx3b3FxkISEr/ZZh5KMAHDwawJPyiSoCQmf1xxQL+lOEFkOitDecW1EO85u5ffil658xdrNi/ActqlUr+VcX98VwHceuXlfyr8g7wE8jzAGwoQMaKG8RSAmB5AOiS3Pt9vt9mhyWL2Oz/QW11d1LsHxUVFZWECsCMBeyp+DtTBfBABWL8H9QjgFqt2R90QCAa/wf1CFDM9MsqA3iVANqVArJu/oUwILBjAZ1eAJN2Ga827FcwD/HI8lkLWOz/kbc1eTL8+zsaa1AAZe5VxQ1ipQBAFQO6BwPYMYJYcYNYAwEvDwRZxl827SAs5wfFs4D5+lIz9i8b+JfcNNbq4/9w4f/Sr+9UVFRUkkOAjWf/LzMWcPUoCcaegH2whgGybv2iEn6Nu/4Y0n4sJYCb4kAZsC/ziP8rIsaf1Y+dyVYBbJk0vyAe3pV3xQ/KF/uH1aqVA6IKAahyQBa4++UFoFo5gAHIMaT+umMFsYC2aim83x4Afpw/cGFtDvA3Pz9k4YRL6dd2KioqKpzqWxO9nB0LWC7J3JPUP1wDAuigAEPqH9Hn7o9t9hf6Hf8CiP8TigVM9KaGwaGXb0W74utZA4BDbjmXyex7AXoo0Ne1WqDK5R87DUB0wKBq5SBoHgGyygRVKQPYaQDQVQQok67bS0D5+W7Gf62171V3xvehX9mpqKiokH6X3BTfp3fVqPdyBgD3lyPH9hHQ1yP555Xqu7H1Mi7/Ppj88QJ2WVd+VFf/MkSgD3X5L4J+9BSGGaAVC7gu1Guk5V0zR7nF/nkBdV7AHhRTQFnGX5VkXxR4Q98XFjNAKCCXBfaysX+y8YGiwFn2fFlPAdWpBbL3K2mryWH+zT6045xK+nWdioqKCrd6V1eO9l4BiAoCfAL8wRwUYMX8Ybn/a14VwFoZ0KIMKENQBoiuDBTY4ODJMWwVwNPnjQjlw7q6s3OvaFf8dVbs36Cbx+cAfS8gz+sBgDU4wPYIEL0fND6QdwVANCUA2ysg6AMGKKCXHRBgrxbwDgZk0wCg52OnEeg4v2RJbQ7wN3twW+2jZPxHRUVFpUAFYBoCdlc8mjYB3FChIOaPBgPq3f4rEBQBUK8ArJQA4CoAL2Mvej3PdUp2+6EpAV7Ne32BqAWsWMAGVizg64YRwljA2PL4ZGbsX+cUpZL9/RUrBGRSAURMAUVXCmQHA6oAeliUBLKAXxbAY0nYocAca8df1flB8iZwi/07etE5h9Gv6VRUVFSKVAAbfny4FQOYZv/Jvb+44v+wPQAE4/ywBwKiKwOB9QCA7vJjrxCEuF1jAc9rChf7v/43X2TF/o38e3/s3/4ezcv8iygIDgjxqoBqk0HswUNQBwEiTDwkJUDXoEHVyoOsl4HqVQks80PwoGbRuCzm31YCDJ5fu5R+PaeioqJSW33dFUt2PxgBAnwaDPgD9LEZfKh0X3OsnyqpPhTgC79P1twPCuCL0SvAjAU8h5UIsMvY1PTl0Dygv995ybeO6DjPSPa56T5oyXhhRl611N8vgG9fK2v+hyXdFwXuhSL1xzb/g8YMQoEplnQeW2qPxcirivUDnW/G/s0fx9r9333ab+/9W+P8V+c6e+L8l61Ov9b6eqJftXqiS09qe22O3RNbX5vd2P7G7KaFb8xpauvvxtY3Zpvd3G72W8yevPDteNPCt2eZbX4+efG7OT2l4/1Z/b0jp1uW7Jg5ZdlHM6be/NFMs1tSPTnxmtktN38ys2Wp2R8xe3JH4rpEu30/s6cs+2RGZk9OdPPST65oXvLRFfZ97DZfY71ut32PxJ/tCrPdvnY27/X267z3c7ve7Wve9/H++aD3xehmyfc2C7wOvQ56vtf9m13a7f7Nko1xj6D3vNueXvrHFX97JLM7V/w9q53f92ro+4q1b1t+u9VY14m+337d6/7O69xa+Pquvz5sNtZ1btfbX/O+7vZ97E6cYbXodV7vy/y+/Xlmu73O+/2gd+fKOx69/e6uxzK78647H+u4rWtYqHa1ShaM23bgjWMMuwfcONbqAxaPy8vcezH6vK9DBwSqBgZeUn/V8YOiqwZuoB0b0MsOKFQDfNnBgKhJn6r4Q7/Oh+7iY8UiYnoBDGyvYe7+H33DXGPMrDXG+F89aUz4zVPGhOs2GeN/synx+WbjnOsS/dunU70l/XHCdYn+7dbE588k+/ptxrnXP5vo1Mcbthvn/e4541yrnzfOuzHRv3sh2Te+aDTc9JJx3k2Jj/NfSvS/E18nev7LxsQFryS79dVUv5bo141Jbf3d2PaG0dj+Zn8vfCvR/7G6adHbqX4n0e9aH5sXv5vsJe8ZTYvfS3z+fuJzuz9Iflz8QbITX0/u2GFMXpLqpR9mdQLoW50A6Vltvb7s48Q1rM693nqNdZ/EPTLvY3/tbPY5ue12PfQ+WOeLNtZ9qAuvmx2fN3tc28zxOu99vNrteqz7KO0Oj+9lNtbrbu11vuZucjTW627tdT52Ny5Jttf3ndeJvO58LV+73afYe1Kq3b7mvZ73dbfvu/VPfvGmMeriF54NnbfUYUvPO9oE/JlDALMPaB0rZebn9Tr0+0FZDZCN/ZONG5R9HTuVIKyKASjQlo39k40blH09bOdzKweW1DJd/0tvmmCcMXe5cdYVq42xVz5gAX8L/F+3KQn+UwOACdelhgDXJcH/ORb435oG/+dc/0w/+Dc7Df6fS4J/ewCQAv9Wz099dIL/RE9Kg//XrEFAGvy3J8D/wiTwn9T+Vi74X2iD/3dywf+SFPhfbAP/jE4NANLAv8PuDzPaAfiX5gJ3C6TaQLXj436g7wT8rNcFAK/XoAD7elXnE4ClFgX7zYDBAO99eQE370ABen2zH2BfBHDz3k/0deiAQBGg5/2+2/Wir0MHBFiA3w34ewFy7Oup+QC86HW8gF4U6Duvr/ndu0b5z18wTp72rDHysmePCaVja8mCmn/YzH+mEuDAxeOEd/51MfVBHRBgxQtipQuoAvKyKwdBGwjoUh5gmQPKMvx+ny8bN+j6dRt79/+71/3WGHNFT6JXG2Nm9hgTfvVEDvh3sv8m8M9k/8+9YVuyzQHADduNcxJtM//pAYAD/KfZ/yzw/3I/+G97jc3+p5l/G/g72f932AOAxSn232b+Mxh/u7OY/w539r+Fg7nvHwJ4MP8ZQwAeQC0LsN1AN5ZSgBh+6iAOCEQZfl6lgdd9dSsFhAE59sAAWxEQEMZfFLD7pRSAMvpYAwMoY0+DALmhAJThhw4I3Pqctg+M0fFXLOBv9vBLnr87tMlSR93SMMC5AmB9vWAM2MyPl9mX9Q4IimcA1MRPVOIvmxaAHRMYlIEB1goAlpIAe6AAld7Lns8LyGW9FWQ9EKzYv8U1TNf/ITe2GNVX/Ms4OwH+z7480TN6jJo5660BgCn/N1l/u5PAP1P638/+9w8Ans0ZAGRK/9PMf1r6n8v+m+B/0oJ++f+kttey2f8U+O9n/99isP+50v9kO6X/vMx/rvQ/cxhgvZ4JFjoypP9ugD9nMKBGyo/FvGOdr2JwQMC3eIE81jnNAIAvoxRoDkpDmXqvoYDX+7DAuOT9oEy97P2wgLjs/bwYedHXnRJ/2cEAAXuYAoBXIQBl+HNeX/SR8aOrXzeGXbQ9Df7NHnbZCwNC7dhauqB2DtMLYOFYIeYfCvCxr9MN+KGrA7KxgthKA6zrCk0RIAuwsZl2bOk+9LognV+yIFf6b35+wrw24/Tp/zLOuGSVcebFq4wzLu42zpjebVRf+ahx9rWbEr3ZOOuazYmPTxtjEp+f/YunE70l1VutHvPLZ4wxv0r0L7cZY36xzRj7q2eNMb/ennjtuWT/2vz4vDH21y8YY3/zojHuuheNmkSPve6lxNf/Nmp+a/fLyb7+FWPcb19NfJ7o619LdOLjDa8Ztb973ai94XWj7oY3jLrfvWnUJLo20XU3vmV17Y3/SXx826g3+6Z3jLqb3k70O0b9/HeNunS/l/ja7PcTn79v1C/4wBi/4P1Uf2C1+Vp96w5jfKrrUz2h9cOsHp/qCW0fWT0+0fWpj+NbE59b/WFO2+9zfp15n/GpzzO/dnud932Z3x8POAfrfN7Guo/176VV7r2s9ztf97pO9HrZ65znyt4Xen9qPV23INnYr0Ovs792dr775ruO9/6srnV5rZbzvTzvd/va2bzXi75e7F0zP9n5Xs/8Ps/1MtfZX6vqcal2+zrztXGc1+e7b77Xf/abd41Rlz6fBfwt9v/i564MfWTL8W0N+w24adwupxfAgPljjQM68gP/AwBxgLLS/qCvAGApBrABO1YMYKF4BARdMaBqYIAmuQcCduzzSxbWMHf/D73hcuPkSf80hk66L9X/tHpY07+MkVPXGZErNlkdnbHZ6sgVm40Ks2c8negtRiTR0ZlbjYjZM7YmPn8m0duMikRHZj1rROPbjegss59LdvwFq2OzX7Q6Ovslq2Oz/23E5rxsxOYmPs592aic+0rio9mvGpVXvpbumNWvW11p9lVvGJXz3jRiV5n9llF19X+Mqnn/Sbye7Kqr37a68up3Uv2u1VXXvJd4/b3Ee82v30t+nejKq9+3uuqa943R136Q01XX7Mjq0dcm+hcfGlXXJtv6PNGVic8rr7Ff35HuymuS7fZ15n2c9838WtV10OtFG/t+uroy1VjXib6v0tFu74NeB70+aB27JtnY77O/77zO7WvR66j97ejVyfb6vvM6r6+9rmPd1+17KjuSaq/vO69z+1r0OqyumJds7PfZ33del/m18xpWu90vtH3VDmPY9OdywP/Qadt3nRZ/db+CyG09aOH4s3MGAKYSoG2sMNMPNfuDMvz7h3yFQNcgQdVKANagIWjpAvZ7Ze+rymMgaOer9lhgx/7VGiXzc5n/gQtqjO9ecptxcmMC+Cd62MRETzLbHAB0G8Mm9xhl0x9OAPsE8J+xyWob/EcywH96AGCB/+QAwAT/ERP4pwYAEQv8P2/EzAGABfztNgcASfBfmQD/yX7ZAv/RBPg3O3al3f3gv8oE/gnQb4L/5ADgreQAYJ45AHjbMQB4x4jNeycF/JNdOa8f/PcPAN7PGAB8wOgdeQcAWWDB/CX/Gm/gn/k6BBCLAnlsQI4F5HnvAwXWUKANfR0K0EWBtiiQl72O9T4VAN3t+7zAHgrQRYG51/W896OBQDiBPu8AwAt4814XNKDvBeR5gT7vdVjA3g2QiwJzr+sLDui79MjLX88B/0n2/4WxexRKVXdW75X4xfk15xDA7P2XjJMy/cOK//Mb4EPd/LEAOhaAl2X6IR4EUO+AICkQZAGu7vdjM/FBPL+kfVyO6Z/5+VHXXZNm/k9Osf9J8L/KAv/DJ68xRrSsNSKXP2kx/1Zb4D/F/qeB/9YEyO8H/1EL/Cc6/lyik+A/ZoP/REdmv5D43FQAvJTsBPiPzvm3xf5Xptn/JPhPs/9XvZ5uE/wnBwFvpJh/cwjwltXJAUBKAWAOAhKdBP/vJIH/1SnG3+p3mcx/spOgv5/935HV6SGAg/m3mwXw3YC//Xo+5t3ZokBadhCgepDgF1Ov6hzR870GBrxKAF4FgKyCIOhMv6gCwGtgwDsg4FUAUPsL8LGu9xoIeAF83oGB6IDAC+BjXc87EFDJ+OcD8LIDAl4lAM+AoVDBf/nc942hFzLY/wu3v17daey1RyHVQW3jT8r0AEh7AbSO5VIAQNMBeBUDkEGDH8y96rhB6EBCVjGAlUIQFs8A1eaC0LhBXYMGLDM/rPNzvu7Ijv2ze/D8icb3WpYngP+9FvhPDwAa/5kA/j3pAcDIRI+68EGH9P/pLPY/OiPJ/keyBgDbLfDfL/1/Pin/n/1i1gDAZP+jGQOAWAb7b7L+lVe+6iL975f/2wqAyhT4twYAKfBf5ZD+Zw0ArnkvrQBwGwDkZf5TrD1bAcAP/PtfEwfaMsx9oUv5KyWANpSxl5XkYysGVAN6VYMBUWCPJclXrRigDtZgACrVl1UA6GD8IxxAPyJ4HZYCQPcKAI903+39+YB+sTD8edn/y15msv8jL3/+e3sUWplRBoMWjHuQtQpwwJJxaMAdywsgaPGBsoBcldRfNEVAFUAvdO8A1YAY+xxV5+vyOChpzQb+thLgmKt/m2b+T7Zl/+bHlPTfBP+WAmDKWmNEyxqj7OdPWAOASAr8pxUAM57J2v232f9oSv4fSYN/ewBg7/+/lDUAqEyB/+iVJvjPHABk7/6b7H/VVZns/1v5d//n9cv/M3f/bfa/fwXg/fQKQCb4t9l/1hAgUwFQlbP7jwP8sZl30XPCuqvv144/1uqAqh1/rNeDtruPNVBQLeGngUEwhwK8QF8Vk+/XoEAE6EcUeAFkvh7xoUUHBbJS/0IbFpTNeYct/Z/+3EOhjf3zqkOXNJWy1gB4YgG9+gCgaaDoKgAU6AdttUA0LhArjQA6YJBdMQi6l0BQlAayygRsl38/zi9ZVMt0/T/oxqnGyY33GCdPvDfN/KfN/2zpfwr8m58Pm7zOGHnBhpT0Pyn/T+/+p9l/e+//2Szzv8zd/1jW3n8/+LeZ/6jVr6Sk/zbzn9z9r7zSlv4nO2v3/8q3UsD/7bT037n7b7W195/qq3PZ/8z9f6fpn1P6z9z9v8Z999+tVZnwFSpwh0rlsYA+ljJAVgmAtfsfdIk+1i4/thIAa/ef2p9VAF7JP3S3X/dOv6i0n1fyDzXxU8XwQ6X60Pt4XVfsu//DLnmJPQC4/JXSPQq5BrfV32yy/rmxgONQgD1vjKAXUA9bagA2448V38erDMBaGZDtsCoJsBl3XaaBvPfFik/0TBvoMGP/cpl/s4+duTiH+R+aMv4b3tJjMf4W8z9lnTF88lpjmNkt64yySx9LM//95n8p8J9i/5OO/8+md/9t5t82/7PZ/zT4n5M0/rN8ALKc/zMHALb03wT/b2YMAJLsv8X4Z8j/k8x/kv3vZ/7fTTH/77ky/2b3A393+T9rAFBlf37Nhy5Af4dLGgAOk4+lFCiUwYHsDj7W/SqRVhEwXP2DPjiAmAKKuvWL7vzzAnwswE9Dg2AOCniVAVCPABWDg4gEsBcF+Fhmf1HkQQHWAIB3haCYpP9l8beY4H/o9O237lHodUhnw1eZKoD5Y7l2/UU9AXgHA6KrA7IKAT8GB7JKABnzQdH7yQ4eRAcMQYwx9MMjQFUKgColguwKgLNN4z8n82/24dfPTDL/jSn2f6IN/ldZu/+29H94Sz/7P3zKusTH9cbw8zcYkSueznD9d7L/29O7/1nMf0r6n+n672T/7dg/p+u/teufBv9v5MT+2ZL/TPbfAv4p6X+O63+G83826/++A/h/4Mn8VzFc/3nN/5zgXwTAU9weniIAqhDg3Y3XHd8XBEAvAuShCgEv4ByU+D5SAgRjp192V58XwAdFwo/F6POuAGArAXhN/GQVAVCvAKyUgFDH/l38PHMAUHHJ9q/uUQxV2lbXyPICOLDd3RAQKukXZfQxpP6qgb4MMJf1GICa9ckCbizpv+4uNG+CoAJ+FFPAjtoc0z9zCFA6f7xx4vQ/WcZ/Zuzf0Az5/7Dm1Vm7/8NbMgYB5gCgZV3i8/uNUdMfTe3+9xv/9bP/qXaw/9YgYLa9AtAf+xfLkv+zY/8qbdM/h+u/vfuf3vk3Zf/z+mP/Mtl/SwGQ2vsXjf3Lcf13AHev2D936f8OX131wzYY0OXqD5X6y64QyO7gV12rJ/bPr9UBL0ZfdoUAy72fAH9hDxZETQSDviIg6w0gqhyADgaw4/+wPQCKzvjvCnbs37CLn5u8R7FUdWd8nwHzx36QowK4aYyxf8c4LgUAVCGA9b6gmA/qWhXQtXKANXjA8gTwg/kPQ/oAdoqAqpUDkfcNaBvH3P0/8lfXGidPzNz9T60AOIz/bPZ/+OR1lgJgWMv6xOf3J3vKBqPCVAGkjP9M8F9hKwDiKQVAAvwnBwAs9v+lHNf/yrnZxn82+LeN/ypTKwDO2D/T+K9fAZAd+2fv/icVAO/1KwAcu/9s1/8PPE3/bADtdP0XVQDIuPgXIoCXZfBFGXTs94kCbVGAL/u+IHkBsL7mZf6xTPeggJ2Afrh3/mXj+bCAPvYgIAJ0/xcF7CLv0+kBIMrgQwF+MQ8Gyq/8gBn7N2za9h0Nbcbn9yimGrxwXMSpALBUAG1jlUj+oUA8bFJ/aLygask/NvOvC5jTYCAcgwHReEPndSVLXGL/bmo0vj95RXL3v/He1O7/P42hjf90uP6vSxoAmkOAFPs/Ysr6xOeJnpIcAIy68OF+5j8n9m97VuxfJBX7Zw0A5mS7/psddYn9S8b8vZ4y/3Nn/23mv9/8jxH7xwD/+V3/P2Az/xkDgEoX+b+s+Z8swC/WwQC2a7+qVQOosgB7MBB2M0DsVYN8fw4aDJAZYOZ1EPf/QjEDxBoMqFoJgJoB8q4O0GDgQ2P4Za+w2f9Lno/tUWxlRh2ULBi3heUHsP/iGulUAF4zQVXpANABgaqBgerBADQlQHX8oV9eANABQ9AGBmEZDAhJ/Rn3c8b+2f3tq+Zb+/4nJ0B/pvN/Dvtv9dok+9+S2v2fnAT/w1ruN0ZMMXuDUfHzTdnO//HtOcZ/yQGAbf6Xiv1Ly/77pf8xhvQ/2/ivfwBgMv8W+z8vO/Yvk/3PBf+25N/d9Z+X/U8D7KzYPz7Jf7ILV7qP4c4vA+5lz5e5D1QJAL1P0LwAeAG3rOu+6G6/Kok/Af3C9AIQ9QQoNC8AEU8AHV4AooZ/olJ+KMAvVgVA2dz32OD/wme3Fmzsn1cd1FZ/JGsAcEDrWG5JviiglzXzEz1f1osgKMoBUdd/rPuJvg5NN5AF+lBFRKF7AWDdD2rqx3X2onFZbv+2EuCQ312Ukv3fm5b9D02x/yMs8N/TD/wt+f/apPQ/AfxN9n+Exfyn2hwGtGwwRlywMSv2Lw3+Ex3Lif3L3P1Puf6nYv9s1/9+8P9qhvT/DYv9N43/2Lv/b2eB/+Tef9L4z439d+7+87r+u+7+OwYAXgqAYjPpkwHzlYDvyzL/shJ+qPkf9oBA5HpMRl+Ve7+oG79s7B8x+uFk9GWZf1kJvy4vAGiMn+jufpCAvghjLxrvRx4AnOz/pf+2AP8PUp02/rvi1aP2KNYyJx8DW8etYA4BFo0FMfxuIFvUNFD0OqyWXTkI2gABahoIZepl4waxFAZ+rRwUa/OmAeS0afw3n8H+zx9nHHfZLanYv3tTzL/t/L86Z/ffjAA0P1rsv2n8l9r9HzE1yf6bRoDmAGDYlAeMskufdGH/n89i/5PSf1v+n2T/TfAfvTLX+K8yZfxnDwBs87+s2L957N3/yozd/0rb8G/ee469//fysv9u0n9n7J+X+z9U+l8oLQK8KxUMDKA7/qKv63LtD7ppnyqG3ytlQJdrPw0CwjEUwDbxgzL+QTHtkzXxgzL+Ohvi2q9aKVCQ7P/st9ns//Tn7ipa9t+uY/4w9QBr9985BFgwRsrET1TiL5sWgB0TqDqtQJapVzUg4AXAWIMILObfLyAf9oGBKrM/3h7YXsPc/T/iurkW++90/R/a9K9c47+WNSnmf20K/K9PAn4n+58A/8OnPGiMOH9jcg0gvj3N/Kfl/w7jv5jt/G+z/1eyjP+y2f+Y3Vd5xf6xdv/fS8v/+5n/98DSf7br/4cCzP+OQDP9skA4aOeLKgRkgThUKYAFuGXvJ7qjDwHuGMw/hMHHGAzQ7n84d/dFzpCR8qsy+4Pu7svu9osy/KJeAVhMvez9sMBxUez+X/wCcwAQvej1/feg2mOPQa11M5kqgIVjlQF7aEoAlheAXwMDv+IDZd39oQoArOv8Pt+vQUJBKwIWu8T+3XSO8b1pf0+y/xPv7Qf/k/7p2PtfmwD1ic6Q/lumfy1J+b/J/g+bcn8a/Jvs/4ipDxojLnjIKLv4ibTzf+buvzkAiMVfzGD+M3f/c8G/bfyXvfv/piX/N9n/3Ni/ZORfWvrvjP0zAX8e5p93ADDaAdzdBgBBYf9VAXZRRjzfdZWK7lulQLov+ufXxfzrVgTIMvpQIC97nSrmnwB/ONz9sRQAqlIC/HL3h95X5P46TACh7v6yg4JiUwSMmvEGE/yPvPj5OCH/VH2/84IvHjh/7M6cIcB8MxYQZ7cfOggQHRjIMvVhlfpDrsdYDcA2/YMCbixlAUn9NQ4JWscxjf+OuubXydi/xvuypP9Dm1YlwHyP5fafZP+TH23mP1P6n2b/p2zIYv+HT33IGH7+RutjxYxn+mX/mdJ/G/xnDQDsvX/n7v9rDvb/TU72Pxf8p5n/LOf/bODPvfvvyv7vIOm/Ao8AUdM9VQMDXSsHlQXaUIWArOmfqtUA6mBK/VXFAYbF3V/VwECXu7/MIMAJ3DGAvfP+1Im+aocx9KLc2L+h057d+f0L/v1FQv4ZdXD7hJ+yVADQWECocgA6SFC1EoA1aAhbugB0Jx+aRgBVJmArBrBjFLEHC9D7qBpsgNMFFtcwwf+QGycbJzf/w9r7dw4ATPY/rQBIxf1Zu/8p9n9Yy/qUCiBb+p81ADjf7IesAcCo6Y+zY/8y2P/MAQBL+m9H/iUHAO6xf0IDAM69/3y7/6oGAKoAMjbQVvXnhpr9YQF7LEYdukoQVEYfayUACtCxmHtRoE8DgWCZ+EF386FAHgrwVQ0GoLv5WJ4Aqk3/sCT8okoAYvTFe8Tlr6VBf6b53/Dpz/+MEL+j4kZ8z4Hzx77CjAVcMg59FUB2ZQA7/i8sCgCsVQBdqwSibv1YHgC6dvehoLrYzQZLFoxjyv+PndOWjPyz3P8zY/9WOXb/16XXANLsf8v6NPM/rKUf/A+3wb+tAJiSUgEkuuKKZ6wBQGy27f6fMv7LAP+263+UGfv3Wgb4zx0AsI3/kqZ/bOO/96Wk/1V5QLso+FepANC1o6/6fCwmXtUAQZV3QKEy/VD3fxklAIZkn4YAhe0RABkgiAB93UoBnoFARPB1mQGBbqWArJs/DQjyd/nc942h07bnsv8Xbn+1urpzL0L8jDqkvf4E3lhAaHsx9qq8BWRXC4LqGQAdFOgyE8RSAMju9vt1PtYKQiENBgYszI77s/vQ6y9PAP+k678d/ZeM/fuXO/i3OsX6T065/Vuy//szmP8HksA/0cNSKwBmHODIxMdR0x5JqgByXP8zmf/+AYCb8V9lXvAvHvvHw/57DQAqfZD/5wOglZp39kUAtyoXftXnQxl7v4G96PnQ+D5exl5Gkq9DMUAdXmDPAtrYjL8ogNepAIggegH4GfuXT7ovCsj9ZvwL3vgvFfvn7PJLXzqBkH6eWMCS+TXrRFUAmMy/LHDH8gLQnQbg12oA6zoZJYBfgNoL6PsVH6irQzMg6Khhxv4NvKnWOP6S21Lg/74M9v8+Y1izM/YvCf4zpf+Z7P/wfOx/ivk3wf+I8x82RlzwsFH+88050v9+47+k9D9msf+v5ID//t3/zAFApvT/bY/IP2/pP47zv3/AP2i7+5XXqjMRVLVjL3u+Kql/UBQCGO7+GKsDXoMCLC8AWgEI12qALuY/aIy+27WqVgeCxuhjufxT/J8A+z/nXSb4H37Rc+uLPvbPq45YNmmgxfrfeLbVzlhA7F1/bE8BWWYfi+GHrib4PVCAKgNUpwxgpwFAVxGgTL7fXgKs83UqEez3DWgby9z9P/LX89Ku/xb4b0j0xPss47+c2D/b+M+O/TMBv2X8lxoGWCsA2eA/yfybKoCNVgzgiKnmECA5ABhx4SNGxFIB2AOAjHbZ/c9m/9/glP7nGQA4nP9jCdAfY4D/Sqt3CLP/scT3YgIDAF279Kok+roBtmqXfyizjuXqHzaJPtYuv6o0ANrpL+wYP6gpn6yJH6YJYAQhpg/L5R/K7GPv+kOBPtTln1q8h13yYg74N/f/yy7/90BC+BxV2lqziB0LOE4auENj/6CpAbzKAKyVgbAx/ryAXBbYy8b+YcUH8gJV2fN1exqEopewjf8GL2gwvjd1RXL332L+M3b/mzOM/0zW35L/90v/kwOATOY/V/o/zF4BOP+hDPY/qQAYbg4ALnjEKLtksyv7z979f91lAPBWxgDAyf6/nWv8dzUi+48k/w+CCz/vKgF0kCC7o887AOD5+1QpXBnQ5erv1+AAagoo6tYvGx8o6+rvdQ0NDoLp7s87MPBi8rHc/oOsDMjH5GO5/WMrA6CmgF7X83oE0ODAEfs3600m+z9i+vYOQvacddjvW75y4E1jdufGAuJ5AWApAaArAKIDAmwPgKAOElSZB2LFF2KtAPAOPFTFFcoOElQrFFTEKJa09oP+ATcm2/z8mKtuMH7QcE+G9P++HOO/ETns//p07J/lAZCW/9+fJf1PMv8PpqL/+oH/iJQPgAn+rZ72iFEx87ns3f85LPbfGfuXzf5HrQGAu+u/zf7HrO6P/YtZrD/P7r838I9lAX82+HcqAuyvZRl8rDg6yPmVEiZ4suf7xcSrcuuXAfQYDL0s8OYF+KI7+rri+wjQB1sRAFUI8AL0fAMBvwB9REKyLwrQg2be58Xoiw4EeHb0ea4n0O+I/Zv+XNrtv7+3766Kb/sKIXuBGrygdiIzFrB9nHbAj2HWJyvB31/ifWFMFVA1GMAC3NjeALIAGft8LC+AoHgTDFjEZv8PvvF84+TGe5K7/xPvTTP/Qxv/mc38pwcAJvjPcP1vuT+tABiWGgBY7P9UO/YvNQCYmr37b8n/p5mDgOQAYOS0R41R05/KYP9fyWv81z8AeDOL/XdK/2MJ8J9shvQfi/13df23f0HUx/6LAnvVXgCiDDw0ng97dQCb6S+WFpX6y64QYO3mk9t/YQ8KoEqAsDD9orv5qlYI/PIAgO7yY68QFHOPvOINpvR/2MXPTyJEL1gjV8X3Lpk/9r0cL4Cbxhj7d4zzjdlXvXLA+z5Z88GwpwpgpwiIXqdq5UHWy0B2oIE1+FA1UAEpBDrM2D/27v+xM5aknP/Nnf9/9rP/zd3JAUCzDfzX5Wf/J9+fNv4bYe/+W67/G9PmfyPOT+79D08AflP6PzzF/o+84FFj5LTHrK6Y8azF/tvgPzLnlQzzPyf73w/+oyn2v5/5fzsn9o9p/Jdy/o+l9v6dwL8y1V7sf6WH7N+N8c/8ulID84/FoGO/j+c+lRol99DYvrAOBrBd+kXd+UUBOZShJ2a/uMz9VAF4XQAfuvMvOhgQBfBBYf5F4/lEmH2S/AsY/135gRnxlxv7N237+yPjxt6E6AE1ZGFNGVMF0DbW+HrHOKvDJPk/gPN6lWaAQU0dwDL/0wWwsaX7vgBjCU+AMJ3vZvx3+PWz0rL/5ADgviz2P60AaOl3/reN/9LRf1Ps2L8NGcZ/NvtvKwD6BwD23r+1+39+Uvpvsv8m+B9hqgAuesKIzclv/Gd31GH8F3MOAFLsfzRnAPCep/O/V+yfG2PvHACImv+pNuPDcvfHMgPE2vEXXTnAHgzIxvupGgzIuvOrNgMUuV5UWUCDgcLd8ccyA8Ry9xddNfBrMCA7KBD1CsAaAqgyA4SuCNBKQHaPuOwV5u7/sItfLCckLxMLuGDsJmYs4GK1aQCy7+M184PGGWJJ/wvFCwB7QIAVPyhqEqgq/lCVFwD2degxii7Gf4NuqjdOuvB24+SJ/7QUAEMn/SsJ/ieau/+O2L+U/N+W/ifB//r+nX/G7n+S/U8A/ykP5Uj/h5u7/9Meydj/f8xqcxAw4sLHjLKfP+tq/Bed+3rGEIAV++d0/n+HIf+3wf/7Gbv/76e+fj+D8c8F/2mw7in/5wP9mQMCTFM93V4A0Pvoir/DPr9QmX+oqR/0PlBgDr0PAf1wM/5Qcz4oQMcC9Lz3EQXoskBfl5Q/qtjUTxXQJ6bfu8vmvscG/xdt30Sxf5J1SHvtEcxEgAVjlfgAiEryRT0AZKX3oufLehGoUA4EaTAABehQQC/L8GOfj8W8Q/95YqcXON83oG1clumf3Uf98pepyL9kp3f/m7od4H9tutOxf5Pvzx4AWAMBU/qfHABYrv/nZ0v/++X/G9PRf8khwKMW8z/ywiT4H57okRc+aUTiL+eJ/Xs9J/YvNu8/lvmf3W6xfxbgZ8T+Odn/bOm/t/lfLLMZxn8xR0OZf1n3etkBAnR3XtUuvt/nBw3MYykCRJl/WQk/1PwPa0BAHSxJP/S+snF/vPfza8df1L1fNK6P934ygwERV35Z935eYC96PxoM9PfwS1+ydv1/kLH3b34cdfEr3yAEj6ACGLSg5u85XgDmEGCRvlQA2dUA1ddhSfnD5gUAZcqxBwxY5oCyDL8owMY+XxawY54/YDGb/R8yv8n4weS7ktJ/cwiQKf1vTu39p5n/Ndb+f3r332b/W1LS/yn9u/8W828b/019yDEAeNgYmdr9H5G5+3/hY+kVAPPzEdMeT/QTxqhLt2aB/2iK/a90uP7nSv/dwX/W7n8K+Dt3/92Av5P5d9tNF438w9qxx4r7wzLRw1IOyCoCdAH1sJr+Ybnrew0i/HLtp0FAYQwIRBl+WWm/X0oBLIZfVtrvl1JAluEXfT+1ZOxf/D9M9n/49OfvJPYfqY7rbPk60wtggbsXAK9HAJSpVzUgEJH4H4CoLMD2AghL+gCUqVc9oBAdIGCvBmADeVWpAPnOGcAw/jPZ/2Pm3JQA///Mdv13xP4lo/8yY/9S7H+Lzf6bRoDJYYDJ/A9zSv9T+/8jpibl/yNTu/8W+5+W/6fYf1P6Py0J/kcmwP+IC580Rl74hBGZ9RKD/WfE/s3Llf7HXKT/Jvsfu1pk918g9o9j99/5uirmH0viL7tbL/M6JvOOpRQIq3kflicAlHnHVgpgAU4aEIRbASC6o4+lFAgb888C+DJKgUhAmpf5x1IKUGf30OnPM2L/njWG/Xzb1wm5I1ZpW/1lWex/ShFwwMKxoWD+Zd39oQAf+zrdgwTVigBZgI/N9GOvDkCv8/t82QHDgEXZ0n97AHDojRelWP/MAUAyAcBk/7Pk/ybgb15nAf307v9ke+d/fXrvf0TK+G+Yxf4/YAH/YWn2/yGrR6ad/x/uB/8p9n+EYwBgrgCMuOhJo+zip42oyf7PtXf/+wcAtut/f/Tf21mxfyb7bykALNl/buwfa/c/xhgA5Bj1eSgAnLF/XoMAVVJ42etkpfNBOx87pSAsQF52Zx8qxcdOF8Bi/gnwh5P5F5Xuy14nwvxjKAJkpfiiSoGgAXxZKT6PUgAzJYD6Q2PUjDeY7P/I6c9eQYgdOxawI/6FATeN6c1RAVixgP4Dfi+3f1WrAbwAGhoX6BeAL3TFgKqBAZbkHivGTzY1AaQEMGP/5ucy/wMSH7972S0J4H+PcXJjyvnfjv1zGv+Z0X8tjti/lswBgDP2L9FTH0x1CvxPTUr/rbaY/yT4tyT/1sfHUvv/j6dMAJPsvwn+zSHAyOmbjMiMFzJi/3J3/23WP3bV2xm7/+/k7v7PS+3+p2L/+Hb/87P/VSxA42H25zT9k5XQY5v+BeV87AFBoUv9oeZ92HGAUKWAqtUA6uJQCIia/omsBuiM/xOV9kNN/0RWA3TG//G6+3sBelmPAHL59+irdhhDL3ouDfptD4Bh057trbrB2JcQu4pYwPa6H7O8AMxYQC/pP3ZsoOp0AdEBAW+6gKgSADpoUDUgYN0H0wxQ9L6qPAZkYwmxYxCx0g1kBws85w9oz2X+zc8P/83cFPt/bz/4n2ju/v+rH/w32+B/Xb/xn733nwL/lvQ/bfz3gEP+bw8AUsx/avc/Cf4z2H9r5z+pAkju/afk/xc9lVoBSA4ARk1/2ojOeTUJ/NPMv1P6/3aG9D8Z+xdNsf85AwAH+LeZ/9wBQP7d/5z2MPtzM/+TZaZF3e1lgT0WIMaS3vsdu8d7HyzpPZZLPxTY53PXx5Te896TBgLFBeyx4vdEpf+q3f1ld/exd/Z578d7nQiwF9ndV+XuT0Cf3eVXJXvEZa+y2f+LX/wJIXVFFY/H9yz5/+y9C5Bd1XnnO+VHMpOkZiZlgyTAGNvEdmzHccZOAPV5Sy3hmcp91L3cG7UEthPQq7ulfr8FLSSw49jxA6n1QIi8JsmQm3snmUzGBgkMQoiXkABJoEc/1HpibGMgk5qacnnfs97f2nufPnuv9e199mmtXbVqnz59+mxqxlT4f/////ftWHk2rApw9d5VmQABmg4IkqoSmG4LSNr5zxo7wFZgmwpk7HV/tk58UpF/U9ZB7DWCD92uCX+19u/3vZs3/j0F/hH3nwp/Av+j4D/o/gvqP3f/OwX4jzv/wP0n4l+Q/yn1n/T8KQBQgf8KNPr/Il/3x8F/fO0fc/+J8w+i/71sCFDqP1YV/8e9ct8Jb+nodFX8/xA4/8r9Z87/jwNr/4Lgv7c0998v/FXkXx8A1HP//dT/WpH/wO8tIXrYTjwWU8B0/Z/tgCGpv89K5B97sIBVOcBa/+ci+24ggAn3i7v+z5QRkDTsz3RAEHf9n+k2gaRhf6YDgrjr/1z0P8YQYMvbXq5nMmTt35lz4+Pee5xST/C6ce9X/h0U/nIQsHNl3QRAlrYFxE0AYFcKTFkEWWEGZG2NINa6QayBgC2zAHsgkdTzA0OBHUHnn5xP/eG3vJbVYu0fiP6v+4Gv+/80pf4z8v9Bfe1fJ3H/4QCAnOd59/8F6fwz919E/19kA4BeBf5jtH9B/4fuP4//9xHxf4wmAEp9J7xi9b50/AJ1/hX5n6/7A+A/Af9bFrL2b/n9bwH439ta9//WwADg3UACwA/tk/A/X+y/lvPv7/xjO+62iYGkKPy2iYVGO/dZZQHE/RxWF99WqEcdCLjj6P5Ro/smjn2WYH6tCLT+pBMDaUX+k4L52SYGnPPPDlv7d15b+ydOeejs551CT2Et4KKJVU8FBgDV11c1wVrApIW7aULA9v35zgBIWpBjPyep52dlrWHY3y/csyoQ/SfnhokN3uL1/yjX/uXWPM4GAMT97+Divx2s/esMo/4L4Q/X/j3LxL/o/vNBgIj+M8GvqP+0CtB7lEP/YPyfd/97XwHR/xPU/Sfin5zy8Blt7Z82AODR/+Uh0f96a//qOf9aBSDE/fdT/+slAJJ2/pPq2Ns+P6mof6PX/9Vbf9eo9X2Ncv6TivC7hMCVRfc3HRwkFeFv1MDAVuhjRfizCgfEGgg4kR/tVDb/JDT6n+ubOuDW/qV0/fqfr14UvhawrWbnv97PSTIDFqTAFLja0tnHXiOYdZZAVpMGtsmEpCj/SScLMAYH1+xYFXD+yevPbd7ttazex+L/tPfPqf/c/afiv/2AHv1vP6ii/3QLgBL++U4e+6fi30/9B0dE/6H7D8U/HABw8B+5k+h/sY8Jf5oC6CeDgNe8pePnA2v/lnPyvz/+v5y7/0Hqv6/7D8T/nN1/IN6Xz0H9r5cESApilxRl39ZZj/t9zbp2D1uwY9P/01q7lxTV353mHArYdvmT2gaQttA3jeqnTflPK/IfNaqPvQ3ADQTiO/7a2r/Bs+Fr/0ZmFjllnuJ1/Y5VO0OrAA+umheOP9b6vqj0f6zKQKOYAs0i9E0FMdb6QtO1e7br+6J2+02ff82Dtwep/9Vz43dGmfjn7r+M/3PwX1FQ/4X7T6F/LPovyf+dYe4/d/yJ89/1vKL+C/I/jf6DFIBY+9cr7jz6T4F/Iv5/zCf6T9B7aeA1epYMn/aWURZA+No/jfoPwH/LQ9b+3Rqy8i808u9z/pfDAQAX/8sjUP9F7/+LdY6tsMdao4c9WMD+O5skwa1NMGDA6NzP9T1JPT/pAYEbHFwZSQKsNX+m9P9G1gFaEQcApvT/RlcCTNb8mXT9neCPsfbvnjcDwp8MA3L9U7ucIk/5+vQj639lwfYVP/enAKrvRXLu4yYCmmWgYDpoiCvk41YWTJkCWFWGsM9hbAHI2kDBdkCQ9eeHr/27na74E6JfOP/Xbr/D+0L/X/He/2O0859bzd1/svavHZL/deq/cP/pXcL/hPPPyf/E/d+ouv/FjS9I95/2/ruE8/8Sh/1x97+HO//E8RfdfxH979VdfzIEKNIBwOvV++ve0nvOKeffB/5bLp1/Dvubg/of5v7fGgL9u7UG+b8W/C9sILA8hPqPFXnHWp/XqAh/syYBsNftxU0ExO36Y3X001rf5wT9/KwCxHXyMVkBmFsCbGj/rQiJAFNWANaWAFPaf1wnH4sV4JIAlomAre9Whf50YO1fS8/kz0vjP/wVp8gbcF238/Y/CAwASCIgwlrArB1bwW87GMDq+JsOBpI6zZIosBXc2FBArPV8sSF+BusBF+1aGRr9/+Q371fgPx77p0MA4v4T8J8YAHTw1X+89x/o/m8QEEBG/lfO/3MB6j+99xyW1H8q+LuPSOo/cf/L3P0vCvI/of7TAcAxCv1j3X+eAODuPxH/pYFTXnngtLd865ta9H+5P/ovev8c/Lc8pPvvh/990df/D4P+zTUAiAIBNKHlJ72ez3SNYBKCfz4OBrDW/9lWDZIaONQS6SaC3wloxwaIK/ix6P1p0/5tKwPY9P5lKXf4seCAtgwAd6Kd0tjl0O5/vn/mTqfEG3SVxsfft2ii7UeiBiCrANvbvKt9ot+UCdCoAYLplgDsJADWlgDM77kShH5S34M1QEiq8hD7+XtXac6/OB82+uALAACAAElEQVTattq7acN/qYr//XTtHx0ArObk/w6/+/80jf9L91+Q/zsOgUEA6/7LtX/U+X/ey1MAIHD/uw9T91+u/us+IuP/Yu0fc/85+A9G//tY91/E/4X7zxIAJ6s/s7NkdBbA/xj4bxlMAIDof621f2Hu/61h3X+/6JfC/59qRv1DkwANjLw3MnJ/pQj4pBz8tP4uroA3deidsz8/Bbypg28qyE0Fe6OEPraDb+rQp73WD9PBxxD4bjAQnwVQ2fKOl+ud9Dn/Z6rvTf24NP7E+5wSb+B1w4OrSqFAwF0rExXw2N8bB/5nE7mvJ6iThgFiOfhpPb9ZBgNRO/hJCfOonX7sZMGiHUHqPzmfue8B1ftfw4Q/6f5L8B/s/gvwX0eY+/8MWPsn3H8C/XuOpwDE2j+WACjxyL8g/wvif4m7/yVA/S+Jw8F/ZABAhwCg+1/k7n954GT1vZM8BXDSa93yBk0ALPOt/ZPR//vDqf+RnX9fZF8TrTGo/9D9vzVBZz8qUwCrIpDV9X7NNhjApvYnVTUwXS/oBgNuMBAnAWDa8Y9aOcAaDER19k0TAHE7/lGZAliDgajOvmkCIG7H33a9nxsK1B4AFEYuhHf/+6ZLToFnYC3gNdtvfzl8LWB9yv98YQHE7fbbPh+rYpA0VNB2W0GjBT52YiDtrQRJPZ9G//fcHur+3/DdHk793687/xz8pzn/YgDQ/jSA/ungP+r8A/c/L4Q/7/8Xu5T7r8T/YRD9Z/1/4v6XfWv/aPy/n4v+vhP89WvA+X+9+t7r1PkvDZyuvneK3peMTNHu/zJ/979O9N+/9i/M/YeuvR/+56f+L4+SArAQyNh77xv9/KyKeVs6v2kiwBbql7RAd5A+J+yTTASYRvlNBX5WoH9RBThmxH9ZhqB/UZ15rIi/c/7N6P+VLT8NCH9yCv1Tr7i1fxm5Prb9D26ENQAxCFiwY2VA6EcV+FnjBtiu8zNd93d1TEfedLsB1vaAuf75mnnLQFLC3JYFEJcBgPV9Cx8ma/+C3X9yPjf6MAf/sQQA7f6v0d3/ouj9t7PDuv/P0Ng/XfkHwX/Q/RfxfwL640d2/2X0/zAT/ET8U+q/cv8p8Z/cxdo/Lv7LfSd49P+YL/pPBgCnuPsvzmmvMnjaa733YqD7Xyv67wf/qUHAu+HwP1/sPy71vx70z5TGb/p57Mj/fIf0JUXvtx0gmML64g4c0qL3uzP/6f1xaPy2a/8aRfePK7htnX/TgUKj6f22yYG43+9EfbjIj/rZwtBsqPu/fPzcjU55ZygFcN2OVf9PWBVgQY0UQNwEQNZhgqZCHKubbxrNx35+UtDArA8OTIV4Vp9f7+8I+M9P/Sfnxu+Me4tXs9i/jP6v2aeD/9pFAuAAi/13PK2v/BPQv45nOPm/hvvfBd3/l9jav67DkvwvnH8G/3tZkv/l2j8a/z8mBwBlPgxQ8L/XGf2fR/8FBJDeB0975eFJSf+/lbv//gGAP/pfy/mvBf9bHuL+z9X1rwf9S8oxxxoE2Dj8t86Dg7F+z2ZgYAvxi/vPnzS13w0K5mcywBTuZ0vtTzopUE+Up5UAaFRSoJ4oTysB0KikgBsOqAFBefxHIdT/M15xYOZvnfufseuTf9r+AX8FgJ7tbYlG/JMeGGBXALCSAmltH8AW7ElXCOYbe8B2nZ/tgCD0+XvDo//Xbv+y9zt9fyuj/8r9318V/k9WBb0v/t9+QIp/sfaPCP98p+r9w9V/ZBAg3X8Z/X+Br/17gcX+e5T4p85/VfwXiPvfK9z/V2T0nwwBdOr/ceD+v84HAKz7X+TOPxX+fABAfl56z3ke/1fi3x//rw3/Cwr/W2us/qu39q9W9N9WoCftvCcF+8uaYE8qAYD9/LgJgaQFetLOvxsQzM/KAJaDb7vOL2kooKlTb/t9WELc9vtMnfp6Q4GoEEF3kjv5/plQ8v+S4fMfcIo7i2sBd9w+EMYCuHpXW12BXk/IX1Vnq0CzOP+mVH7TBIDp5xr9/CjvL5iHiQDMjj7mWkHtO3YGnX/y+pNf/7q3ePWjMv5P3X/S/1/3hHL+afT/IAf/HQTin8X/JfgPuP9iAMDAfy/w2L8Q/4c5+f8l4Pyz7n+JR/+LkvzPqP9q9d8xEP0PWfvXfwp0/9UAYMnQaf76jFcemvSWb/1xoPsv3P+o0f8w+F8U97/WQCBulD8t5z/Lgj8JwW7r6Ns68Kafs43uJ70lwDn/V5aQN33f9HNzCXbbRECSAt9W0NcT5EklBeI6/3GFuu1WALcGMN3uf/nuy5rzL7v/A9ODTmln9PriP3b+4qLtK/85UAUgKYC90RgApsI+rWEAFsQv7nYB226/6SACKzkw37YGNAt7ALuCsOih2wOdf3Ku37beu2XdP7LePxH/3Plna/+e0gcAHU/To639E9R/Cf9j4D8q/En3v4tH/zfwAYBY+9fFe/9dhwPkf0b/59H/Huj+v8rX/p2ga/8Y9f81NgiQ7j9b+VcmZ/AUh/+dqgp+NgQoVcU/PQNnvCVj5+Zc+3drnfj/XK6/EjLvRoL/ma79m6+0/CuFEYAF/bMdGDjH3h2MYUBS8EDbyH9WIH6mzn7cNX+2A4K0GQBYkX//4MEJ+xQHAVvfJYT/gPOf65385y9+9/QvOqWd4etDu7/0v/iBgPTsbIsU1Y/7c9qVAKyKgC1EEPv5pskA2+0CcQcHpoMGrMFC1gYUSXX8a/1erP3zJwA+s3kH6/7z/r8C/z3h6/0D8d/JxT9x/rn7n5eDAAH+42fj87L/L3v/nPxf6Aa9f0H+74Vr/5T7T+/9jPxf7lOdfxb9P8E3ALxeFf6nePT/lOr/U+HP3H8i/mkCYHiyep/0lt37ZiD2v3yO7n9o9H9O4Rav++/o+slE700j9FjC3hT2hy3sbQV53KSBGwhcGWv74jj1UaP8JjT+qEK/UbA/W6EfNwmwLCOCH0vo1xL8cYW+GwiYOfxzneLIpfDuf9/M/+4Udsav8fHx9yzc3jYVBgS8em/9bQBxhbpNYiCNQYGtkMdy8NMS8LZOf1oCu9nZAdgDgiiVgYUPrgzt/n/0u/2078/cf977X82GAKT3H7b6T3f/DwH43yEf+I8LfwD/k+4/Ff9q/R8F/vUe5av/GPiPdP/Zyj8yAFBr/0pE/FePXAEIwH9FAP4j0L8yX/1HAYCDSvwT95+If/JzZeQsd/71AUDUtX9f9FH7Jf3/azr9P8ogwESgNxril/XuflafHxcOaDtAMB0QmAp+J/Bd5B8TDhh3PV+cQUCc900FPtbnbWn+tlUAU4GP9Xlsmv9cf+8GANEHApV7366K/cmA+5/vnZwZH/fe4xR2E1wf2bnqN8NSAFfvaDNOANhuC8jaFgHs5EDcQYOt4x/3+xr1fCxhf/WfZHuNYOLPr/67sygk+k/e+62hv1DUfxH9J+A/sfZPuP8dB0LEP+j+A/ifoP6T6L8cAMjY/2E5ACj2HJYDAOb+q7V/Rej+i94/df6P0QEAE//HtbV/Rbn27xTt/YvuP00BDLL4f2WIif8SFf+T8vXS8Ut1nP/a3f9Q6N8f/lMk2N/yBiYA5ltyIKluPVYXP2vPN3XsnbB3J46gt+32YyUA0nD8TZz6uILclAWA5fgvs3T+TWF9tgkA5/gnOwjID52Tjj9MAOQGp37TKesmWgt4zY5V++E2AJkC2LMyFtQv6vtZXBO44E+yAxu0ZQzYCv0kovhZcu7nO7vgmt2rQrv/H//jrVL8awOA9U+EOv+w+0+J/x3PBNz/IiT/S+ef9P5fDET/Zfwf9P5p97/3qFeW1H84ADjGuv4U/ndcgv8g+b8oqf9K/FdI93+Igf9E/5+4/wIESJMAQ1OcBVCL+l+j+w9Eey3wX63uv//9K7X7n5Zzn/bzk16rl5Twx47wu4GBOxiDgjTX/6VZBagn9Jt5/V8UOGA9oZ/2+j934p/K5p8EnH8K/uufftyt/Wuy68YH77wubC3gQp4C8Dv7tg6/LVsgK0kC27WDSVH+sasBcQcMthWDRrMEsNYrNuQ8FL7277ptv+/dtPH/ZfF/sfaPR//z633Rfyr+D9KjRf83QPf/2er7rPufF+JfDABg97+bn67DGvVfrP0j0X8B/iOr/0oi+k9W//Wf4NH/Gmv/CPQP9P5l9H9AB/9J939wip2BSa8yNO0tvftizd5/FPGvCx1c1/9KjuibRuVt1+RhO/NpU/5tu/1YVH935qdgt60IJEH5zwLkD5v+n3WIH8YavyQo/+4k4/SHVQDyAzOh3f/qf3td5xR1M64F3HX7H/prAHQYsKe+8MZy/rOYCsgSNNCUEWD7PbaMgqSEsttCcHtd8J84n/r6tzj0D6z9C43+w97/QXr0tX8cAij7/0T889PFov8s/g8GACL638Oi/6UePggg0f8+GP1n4l8MAMpc/EP3X6z9U91/sfbvlOIADLHov0oATFLRX+aDAJICqAxNVe9TXitZCxg1+h/B/Y9ybLv+7uB08LG+D3t9oO3aQSzaf9JbAtyZH4MCrAGALdXfDxtMenAQReDHqQLMlQxoRWAEJDE4qCfw41QBTKGAtt/rTrxTuvuHoWv/SkNT33BKukmvz/5Z3y8v2N72s0ASYPuKwFrAuI58VFZA1AED1npCrIQANjwQa30hVgXAdI0h1lYB20RA0gmFRg8wBCNg4YOrQsX/h7d1VkX/96rifz8dAmjd//Yn2QAAxv/bfd3/DhX7ZzUA0fsXq/+eo6I/D7v/fvgfFf+Hfe7/UX3tnyD/k3tfDfe/n6/9I6Kfd/+p6B88Le8yAUDc/yEg/gf4oUMANgAgawFNEwA6/K/5EgBYDjlWBz9rz4/bkcdmBWA78UkJeDcYmJ+0/7idflNH33Z9X9JJgKidftuuflQBn3YSIKogN3X0o1YAnKBPn/YvPiM/d9+7Xq5/Suv+07V/PZM/W9Z3+Zedkm7i6/qJO77kTwDQQcCulVaCH/vvmuVgrwc0FcjYbICktgs4NoCl+z8R7v7/5ubd3uLVj1LqP+v+76Pxf7X27ynl/ndy8V8V/hL8B+P/fAAgxL9MAGjRfyH+X6qKf7Dyz7f2D8b/qfsv+/+E/C9W/r2mRf+LPPpflGv/1Po/SP6nvf+hM15laJL/PCWTACT+XwaHrAU0Ev9fc/H/ZmYDxI362wr+pKoD2E6/O24ggFkZMIUAmkIBs1YRsGUDxHX4s1YRiDsoME0AuMFA8gOB0tjl0O5/bmD6K05BN/l12yO3vfeaiZVvBgYA20gKYGVsFoCt8x93UBBn8DAfqgRpVQ6SYhnYMgGwBh+NYgegiv/d4e7/jd8Z5dH/fSHuP4j+U/Afcf9F9D/E/efd/yIfAIjuP3X+NzyvR//JvftF3vvnQwCx8o8eH/VfxP/J2r9etvaPDQBOBAYANPrff1Lv/gPnvzwIqf+6+0+d/8EpngCYpsOAysg5CgKsJ/zTov6nJX4b1flP20HH/ru4AjrpyH1SrAA3FLiynX8sB99UsGdVwPvp+DbOf6sFA6BRrIC4VH9TqB+W0HdDgHCxH5cBsGTrO16udzIQ/c/3nfnRbY9473UKeh5cH3pwVT6UBbCzLRVhbiPO5+tgAEuYY0Xn04raYwnwtJ5v+73Gz6+x9u+a7bd7X+j/66rw30d7/9L9p+A/f/T/gIr+dx6U5H9K/5cJgGdl/D+/QXT+IfiPUf8L5HS/qPX+6ek9Glz7B9x/Qv2nA4A+Eft/LRT8V9K6/yHRfxr/n1TDAB77r3DBL8R/eXimep+h96XjlyMNAEx7/40U/1jCvNGDgbSfj101MK0cJNXFd86/E/wYCYC4Hf+olYO0BwNRoX1pwAAxBgNJdPrTggGa0P/dMRP8URMAxeHzAfefnMrgVMEp53m0FvDaHasOC/cfbgW4ak/tFEAUp9+2058UCyCr1YGkWACmlP+knpMWCwBbyKf9/Frfv3BnePT/E9/8GhP/a9gAQLr/6x6n4r/YDqn/7OTaD4L4/yHf2r9DVPzT/v9G1v3PU+gfGwKo3j8YANBzRNH/aQXgqO7+94m1f8c5BFCB/4pg7Z+M/w+ckrF/Gv3n/X9F/T/DgX9C/LP4P3T+ieivgCFAZfist/z+t2MNAJZ99V16GjUAyEpkPunBQ9xoPFbEHquLb/o9jaLyu8HA/I7s1/ouUxaA6ftYUf9mYwHEZQLMNxZAXCaAYwE0fnhQ3vyWRvuX0f++ySNu7d88uz7x4J0fCWUBTLTN6bDHTQTUGxAklRzIKiQQa0BgSv233UYQ9/24z8de24e9FaEhiYCHwqP/H9p+l3dT5z8w8B9d/befr/3bR8V/APxHu/8HNfdfVAEKG+DaP0H+Z+5/foNP/Ie5/70K/Feovibr/qT7L8B/1Pk/xt1/lgSgIMB+NgAo8eg/I/+fDLr/3O2Hjr94XZbQP9j95+6/GAIMn/WW3n1JE/7LqbgPif+n5P4nva9+ru+P04VPip5v+3zT7nxSXfy0BgSO3u8OBr3fNjkQ9/uzIvRt1/jF7e7HjfDHHQ6YDgZM1/iZ0vtNtgG4wYB517+W4x/2+8LQbKj7v3TojY86xTwPUwDXbFv1V/4qADlX716J5vDHFeLY39tolx9zUGCTFDCFA9o6/HGFMPbzk0oApMUCYO5/W0D8k2Hdp7Y8wN1/Af4LWftHBgC053+Ad/+fVtF/seqPCH4I/tNW/0Hx/4IS/z2HFfVfuv9HZPy/pHX/X1Xd/35B/j/OBgAB9/8UF/4n9e7/IIT/qe6/GASI7j9z/H1DgGExBDjrlUfOesvue8t67V9YMiDNaH9ayQDb9Xe2AwMsiB5WcsA2EeCEujtZSwbYUPuTTgpkBdpnC/EzdfyzAu2zhfiZOv7upLT2b/xHWudfiP9879RfO/d/3m4EWPerYSyAhRPmMMAkqgFJMgKyNkgwdeqxnhPXQTeFEyYVscdKMKTFKKj3/IV7wt3/jzzQw3v/j6kBAPl59X4v5+/+V+950v1vF+R/PgDYwKB/AvyX71TU/zx3/wvdL4ABgIj7h7j/fABQIPH/btj7Z+C/EqX+C8dfX/tXAuA/Fv0H4n/AD/5TA4CyvE+FuP9A/FPhP+NVRtjrJWPnVQJA/EewRfcfw6lu1MAg68+PmxBISqD7oYoY8D2MpII77mA49bbfhyXAo7ACknDqsRICtlH+pGB/tt39qN9vG+WPmxRwJ1rHv977+f7pUPc/N3T2V51Sns9AwN139EAGgKgCXL2rzUjgm64BxKoWZK0aYCq4TQU+ttOPXR0w/Vyjn580hDD0+Q8H1/6Jfz8/N/Ywi/6v5QkALv7z657Uu/8k+g/EP+3/dxwExH/R/wfRfzIA2PC8l+t8HoD/2D1Pz2G+9u+wTv6H4D/R+xd34f73Hw90/0vA/ZfR//7T9EjwH00CnNGEP0wAMNq/GATMqDWAZAAwcla6/+LeStcC1nb/a3X/azn/2FH2pIQ81vNt1+DZbgXI+vOd4HcnC0Ledl2fKbzPNkGQduTfFMZn+r2tltsF0qb7YyUAktoS4I75gKB89xuh3f/CwEyvU8jz/Pr8rtXvX7i97Z9CqwAP3269DtA28m8qxJsVDtioxEBSAwOsyD/2mr+kqf0Yz1+0Swl+be3ft8e9xauB8y/i/2v3V8X9U/rqvw62+k+S/+HaP3I6Dmlr/2T0v4uT/zdC8N9hr0BOl1j9p8f+1QDgVZ4AANF/4vxT8F9w7R8bAJzUoH/kNYP+Aer/0CQ7Evo3xfv/QviDFMAwjP4HhwCV0XPG8f80yf+mDn1a8L6koX+2gj2tykHadH933MFYAxh3zR/WgCBrUf+kBgZp0v3TqATEFexO0GcrCeD/fWXLO15L75Qm/Cn4r2fyv982fvwXnEK+Aq4P7/rSf/BvA6BnjrWAcSP/UeF/poOGWmI/6eh/s1UI0h4kYCUW4j4fi1mANeiIPQDYGx79v2biS95v9/yNpP4T17/lLjYAKIjov+z+P01/zpEEAAX+qe5/ngMAWRJADACY8M+L7r/o/W98QQf/CfFPV/8drb7PBwB93P0nor9XDQBKvcfpkcJfrv97jTn+Evyn1v6VfGv/ylr3n28AAO6/TAAI0T80AyoAYAAgzsis17r5hyFr/+qLfz0BYCa0sYQ1Nl0/rrA2gddF+bzt87Gp+FG/1wl8d5Ls8EcV6HGFftj79f6ukfA+2wg/trC3FfhJDQZMu/lYTABH98+G0Pd/TvxcHL2oRf7FAKA4ePZ3nTK+goCACydWng7bCuBfC4jt4McdCCQlyLPGCLAV2Gn/PXYSICkBjy7UE0oMiLV//gTAJ7/+RwD89xhY+/cEI/+vF/T/p1n3v8MH/qOdf5AA4NH/fOdz9Ajyv4D/sQSA6PzD6D/s/nPoXwD89yql/tPefx8cAAS7/6W+k9L9h91/rfc/NKkJfxbzD3H/h4DoH9FFP/t5lp2Rc3QtIBH/y3jsP0rkfy73H9sxN6XvZ+X5pgMK2yi97fo/2wFDUn/vjov8x/0ekwGBLdyv2SCApjT/ZQkNCNJOCtgOCrAHBG4gYDcUiPK5ypafVkX/ZAD+l+ubPOPAf1fY9dFdq38jkAAgNYAdbUaOf9zEgInjb8MWwGYWZG2NINa6QayBAHYCAHvbQZaeD9f+wQHA9ds6vFvWfc9bvHo/qwCsFmv/GPiPHBn972T33PrqofF/7vzztX8C/udf+5evCv4cWPtXqIr/Ah0AvEjj/2wA8BJ3/kH3n4D/ul/Ru//E6afu/4lg77+fCP/XpfMvYv8lHv0Xa//EEAAKf1EBYNH/adn7D8T+pftPAIAwAcAGAZWRWW/J3Ze12L9f8Nf6eZlvfaAtbR7L8b7Sn28qtJNKDqT9Pe7M78FAUh18UxYAlqA3+R7MDj624x9XwKeVAKgltLEd/7gC3gl+O+c/KvwPpgHyQ+cC0D86COib/YxTxFdgCmDRzlXfD2UB7FlpLfyTEvTY7ACsk/Tzkxbk2M9JikVg+nls2B/m8/3gP3E+u3kHi/7zw9z/fV5+3ROM/L/+KSn+aRqg/YDs/hcA+V+u+vOB/0j3Py+c/y7Y/YfU/5e48w/Efy8E/x2TCQBG/j/Byf9iAHACrP0jsL+TCvzH3f8SiP6XQAJAwv9o/591/ytgAFABCYBKWPR/RDj/7F4ZOeeVqq/JWsC4vf969P+01vSZCm1s2GBSa/VsBwdJOe9u/Z87zTgo8CcC5uv6v6Q6/liwv0Y5+mlXB5zAz2Y1oLL5J1rkX7zO98885tz/K/T69T9fvSh0LWCdFECchIDtGsGoTr4tWyDpikDWqgVJJROSovwn1e3HGkgYswV2rwxA/+jav+8OeLfc9RgX/49J57/W2j9K/pduf/XezhkAG9jJAfhfnq/9I+R/Ef0vSvo/6/4T+n+hC679Oxpc+ydX/3HqP43/M+p/oe8EPSIBUOx7ncb+hesvkgAB6v/AGUD8nwJr/7jwHwTuP0wB+Kj/6n0W/SfCv0R/d84rj12oG/X3/94WpmcrcJN+flpJgKQp+LYQPifc3UlTsCdVEcCi/Gc1oh/3720p/6bOfqPW+Jk4+xgQPwcBbMx6v3qfyw/MBKj/dAAwMrPIKeEr+Lp24o77QlMAD66MFfE3hQbaMgJMhfx82yaA7fhjC+u4wh1rfZ+pcMd+fujzqv87W7Q9ZO1f9b3PDf65t/guSP7n3f+1P9Cj/+0HJANArP6D7j+N/bcf5Ov/dPdfE/8C/MfX/hW6X6KHDgAk/f+oPgCg7v8xtgWgX3X+tfg/hf8J918Q/0/q3X/p+p9WvX+ZANDJ/xUR/4fO/8iMD/inMwAqI2AIQNMA57yl9745p/CPOgDAou9jReajCuxGPz8uA8B2sIDxd25w4E5agwKsNX+mFQLb7806FLDe57HXBzZLMgC7MuCSAY1z/iX47+4fBtb+kVPqm/6aU8BuLeAvLdje9rNAEmCiLXQtIHYFIKnvtV1HmDQrIOuDBmx4IFYSASuCb8pIwHz+QrD2D3b/P/7HW70W0vmn1H+eAiAgwLVPSOo/hf+RCgCN/z9Nyf+0+9/B3X8u+CkLgMf/ifDPEfgf7/3npfBX3f8CX/0nwX89CvzHDhP/BZEAoGv/jsn4f4k6/8eV88/BfyT6T93/fuL+k/tptfYPwP/KnPoP+/9M+Pu6/7L37xf9IBEgYv/DXPjT1+xztApw/zt14X9Yjr4pJT/p59tC+bDW5yURzbcR6E7Qu5Mk7d82ERC36x9XoCct6Fsjdvrjfj7q98wl0LMo6OsJ76iCP6pAr5cUcII+XZhfFAZAGP1/6X3vevn+4Nq/lp7Jn/3u+MVfcgrYXf/i+p13rApLAcC1gEmtB8SO8NtWB5qNDZAVwY8NBcRaDxg3gWC7DjDyYOCh20N7/9c9cKd388a/o9A/Cv7j5H8a/V/Hov9FEfsX5P/2p+XaPyb+RfT/EB0E5Dv46XxOwv8KG2D0H6z962LgPxr/J4K/9wgYAIjY/6sq+k85ACfoAKDIo//FPh3+R8V/30k1BCDgv0Eu/rUBwKTvTEnnvxzo/vuo/7L7P6PI/zwBUJJpAJ0JsHT8ct0KAFb0Hpuuj93NT2s9n2kCIGmqftTPusGAO1lZ/2cDAYzr8Ged6m/azceuEDTK6TeFAGJVCJzTn81EQHH0coD6T05x4OztTvm6i163PXLbexdtX3EpbAhw1UMrrQR+UgME2/WEWCyDZqwOLPiTxm0xwBogJFV5SOv5C3cE3X9yfv1r3+TR/33K+V+t1v6p/n9V/HdWhT+n/otDyP9U+PNhAIn+095/9RD3v9Cl6P/5DWztH6X+V4U/if7naQqAw/9I57+b9/6F+9/9SvW9Vxj5n3f+i70n2IHwv37l/rP4/2nm/nPxX/bD/4bY2j8W9xcMAB79h0OAQPcf0v/FMOCcTAaQBACL/5+lh60EVAOD1q0/DcT+9SQArvONFVVPI/KO0dVv9POdgHcHQ8TbCn1b6F7cLj/236UxCEiC0p+UgG+U82/6OWwBbyrw3VAAl/4PXX//+5V73/ZyvVMB+F+ud/LybY9473XK113y+vDurywOZQFEBALWi9rbCvW5vj9JB36+R/2x4X+NEuZxI/+mzn/Y98aFAS54cFWo+3/Dto3e4jWPMuG/Vjj/bABAKf8dT4HePyf/k8h/JwP/UfEvyf+HVPS/E679e45R/zcC6j93/2kCQOv9H/W5/y9L97/Qe8wriUPBfyckA0CQ/wntn4L/+kTnnw8ABtQAgK38OyPFf0kmAaZ80X//6j8g+mESYPis5vJT0c97/0z88/eH2XtLxi7OSf1PGsZn27FP6/nYlQPswUBW1vu545x9jAQANgwQazAw32CAWHT/uFWDRg0GbAcFcVkB7jQOBlgcvhBw/snrwuDMYqd43RVYC3jtxKrn46QATJz/pFgApp3+pKGCttsKmn0wYDogwFpzmPbz6w4oHmZr/8K6/5+9Z4+3+K59PP7PxD8ZAuTX/UCu/RPr/qj7D5x/Rv0/yMU/qwPkqoes/cuL2L88wPmn3X/R+1fgv0L3Uer+sw0AL1dfv8xgf9VDxT9w/8kAoNB3XKf+E/AfEf+c9q+t/RP0f7DyT3T+y/LosX/yWkb/yV2L/MMUAHP8CfgPwv+0oYBIAfDTuuXHISyAZCLuWOvkbAW6rTA2/Z5GdfGdwHcnycg+Fuwv6ffnGwvA9nvSivJH/Z64At1W6KcV5XeDgWjd/3rCPmr3v7z5J9q6PzEAKPRPveDW/rkr9PrInj/4cCgLYGIFWgXAdEBguj3AdhtB3PdNfz9ftw5gCXRT6j72NgLb5y/cvUpb+ycGADd+Z4x3/vdT8N9iEf1f+7jm/uf5KdK1f0+zVX+0489XABLhT6n/z3II4LO0+09W/uVB9F84/zT23/WiHACw6P9RlgLgA4BS78ta958OAAj4r/c4GwL0k2HAayr6T1b+keh/Pyf/iyFA/6kg+I8D/wT5X0b/hyD1fzrg/lf8rj+E/4m+P4/+M+EfsiFgmK8GHD3nLf/qO74EgNl6Ptt1e7bvYz8f6/NpwQfdcSfL9H7b5EDc709K6JsOBkyd+6hVAdt1f6bVgkYf2wh/3O9zgh6f2m/j/PurAPnBs1r0X5zK6MUPO6XrrjnWAt7+Z6FVgN0rUZ36tJ1/7O0CSQn5ZmUMYDn1jXp+0nBB+v7eVQHhz4YBd3if7/vrquB/VML/2Nq/fRT8B91/Bv7j3X8yBBAr/zp16B9d+8ej/1T4b2CHOv+c/k8SAFT8E/BfL+v8F7uI8D8q1/6VROe/m5P/+5T7X+pV8D+49o+A/4j4Z+4/d/774do/5f6XhyDwj6cAhqZAAmBaW/un3H/u/Gsr/5jQLwkOAGUBnANu/wx3/+FAgL1u3fzDOTv/2MIdi66fNBww7aSAc/jduRKSAaaR/LDPxXk/68cW4hc3IeCn/5sKfKyBAJbDbxvtb1RSwA0Iojn8cw0CSve8qa37kymA/sm/cArXXXNeH31k9b8JTQFsb0Nz+zGcetvnYEX8sRIEWR4YLGhgksB2naDtgADz+Qt3hkf/P/HNr/HoP4v/t9zFov8C/EcPWfkn1v51HGRr/9oPcuf/II37Uw5AJxsCFDqF+88rAF2M/C/AfzQBQDv/bOUfHQJ0sb5/AQ4A+No/lgA4RlMAbABAwH88AdDHnX8i/gX4r4+B/8QgQHT/Re+/JNx/WQGYCpD/Kz7on0b/D4MAykEAW/enQf+GZ/UkgKwCCFbAOa/1vreNBXQ9mjxWZB+7455UVx9LuDth704zDgZMu/tR/y6usDZNCmA7/VETAHGfY9vdj5MUaG1C5x87KeDEerIJgLjfJ7+XrP0bmA44/2QIsHRw8t84heuuutd1O+/oDE0B7GpDd/BNBL6J02+6ZhAraYD1ufmeCEi7ox9X4BuvAXwoPPp/3bY13s2d/1UOAAgAMMfp/8T5D3T/O1j0P9fOqf+djPTPoH/PyJV/JP5P3P8cjf8/J7v/DPwH3H8yAOhh3f9CF4f/9R7x8j2i+/8K6/33sOg/SwAcp+K/RNb/9fMEwACj/tO4v3T/T0n6vyL/C/F/Wrn/kPxfvVek8+9b+ycGAloCYFYK/wqn/7PYP+v+l2Ts3yf4xVAAnMo9l9Gj+6afw34+9nYBbEZBEp1/J1DdSVvIx123F1fg2w4KGkH3t+n+2yYA/MIda0tAWlA/0+i+7eec85+N7v9clP+wzxc3vRGA/pGTH5jscsrWXZGuz+9a/f6FE23vhAIB965MJAmAlQCwhf6ZCm6sZMF8YQRkhT0Q5/MLEBIAtdf+BZ1/cj61dZt3y12PUup/yxrY/WfgvyD1/2nu+LO7XPtHnX+19o9S/yX5n3X/afx/A4f/Sedfgf+I4y/X/nH4H3P+X5EAQCL2qegn4l+s/YPR/wEl/iH4rwxW/pU1+N8ZFf0X7v/glAb/U8T/GdDjD1n7N6Ki/4LyX/YB/8pgIKAGAeznCk0B/NRKMJtC/7Ci+diOfVIDAhf1d+dKqgiYrvnDGhA0awUgrmC3TQqkFfW3pfubwgPjCn+XAMgm9T907d+Wd+TaP3jyPZPvrt7lvd8pW3dFvm7Y8+Vbw1MAK7wPPrwSTdybVgOSYgyYMgGw2AS2WwKSTgyEfceCJoQRYiURonxuwZ5VodH/jzzQVxX/j/HoPxP+JP4v1/7x6L/s/hPXn0f/cwIAKJ3/Z/gQIAT816ngf5L+3826/3QAQIcARzj9nzMABPhPdP97ufjvYbF/SvyXa/9e4xUA3v3vY/C/Ij9S/MsEQFXwD52pAf6bBvA/sPJvJIz4PwMc/LPc/WdR/5K2FhAMC6D7LxMD7G8qo+e8JZsuonTy04q+N+vz3UDAnWbo8EcV6HGFftwkABbsD2Mw0IoY/W+1dOaTEvJRvxeL7m/b3cd27qN+nxsI4Ef/6wn9WomAwujFQPSfrv0bnvn3TtG6K/ZawEUTK18PTQHsWZkaCwDLwU9LwNs6/WklALJWLbCFBWJDAG2rBPJ9vvYvDP73ubGHvcVkAEAi/2se49H//V7LWrX2jyYAqNh/ioH/OkD0v4O5/nQQIKB/RPx3PEuFf2GjP/p/mIp/svYvz8U/jfx3s+4/if6zDQBH2dq/bgb9o6fn1ar4P8bX/gnxf1zr/lPgXx8T/cz5Z73/QPd/UET+wRBARv8BAFD2/qdDxL8O8StD4U/vavWfjP4HGABwEMASAGQIwNYC4kTpo66/w4L+YQv5Rv+9O+5kIfKf9IDAdt2f7YAg7aSACSMgyfV/2AMGLNif6YAg7vo/U0aAO8k6/VG/p7Llp1rkX7r/vWdOurV/7jK6rt/5lU9J5/8BdujrHW2Jw/+w/w6LBYC1bSCt52e1WrBgniYHAmv/dq0Mjf7f+O1xTvzfxwYARPiTQ+B/VfFfFH3/9U/J1X+59Qe403+w+vMzTPyTw9f+FcUAQLj/cgMAcP5p7x+u/TvCoH/dIP5Pov8kAUBcf979L1EAIHP/S1XxX5ApAO78D+juv6D+C/K/SgGcAX3/MxT6J93/QZgAANF/Sv6HoL+z2iCgIsX+OS74+SYA/vkSiP+LagDcBlDi7n+ZnllvydgF79avvYvabY+67i4toeyce3fcmZuij+noY7EAsIR6UoI/qQQAllCPOhBoVPffNJKfdGLAncZF++diAIhTGJoNXfuXHz77Kadk3WWcArhm58p/CK0C7GksCwBr/SC2cMfeMoBVDZiv3f+01g8aPf+hYPSfnGu2fdn77e6/pe5/C3X/91PoH43+rwfRf3I6QPe/k0T/OfkfDACY639IE/+U+u8X/xtZ7F+6/93C/ReHUP9fYQOAbkb+LxDnnwwAZO+fbQAo9HH3X8D/+mD030/9B2v/BoPgPyL8pfsPHX8Z/58B/X1YBxDgv1ne/5+dg/oP+/8gBcBd/wofAohBAFsLmBzsLqn1fybPbwTszx13khTyaScI5hL6STr5SQ8KbIW/bbXAZq0fZoQ/q3BAW+feRf2bf3BQGf9xKPU/3z/135z77y6r6yMP3rlAE/4iCTCxoiFrAW0FfVJrB7GcfSwnH6sqgTXAaJbhBGYVYcHO8Oj/J/7wG6D7L8B/1bNWX/vHxD9LAeR4/J+tABTi/xBLBHDyv1z5t/E5L7dBgf+o60+p/0T4c/o/GQB0qQFAQdQAOPivIMj/PWLt33Gv1HuC9/9F5/8EBf9R+J9w/nn0n9D/mfBXzj8E/1HnX8D/iOAfBL1/Sf2HAwBfBWB4Rhf1PP5fknA/8ZlZmQqAoh8OBWiCQIj/ETUEWAbWAl4p0Dwn3N2Zj0LfNKpvWhHAovxjOP1pRfQxnH1bKj/236fl9EcR/pjbAJzQb6yQr+Xsx/m8eJ0fmAlE/8nrJSNTC5yCdZf9WsCJL20OTQHsbks1BYAxOIgqcLHW90VNBmA/H5sNMF+Ee1rQwAV7Voa6/9dvW+8tXv89b/Ea2P1n8X+x9q+wPgj/o65/J3f/O56R3X8xAChw8j+L/vvI/xtf1Nf+yej/Ed77F91/5fwXOfiPin/S96cr/8QAQKz9Y+R/1vs/qTYA9EPon7qXB/V1f+TORL+I/8+o3r+/6y+Fvnj/HBfzYtXfOU79By7/yFlfBcC3GYA6/+c0578CzlKwFjApaB5WR97m+S7S7447OJF9rDV+tt+b9a5/XFo/1vq+rKz9i0vrN13z56j+zTkoiDoYKN39w9C1f7n+mS1OuboL5brlke5/dfX2tv8pGAAyCbCdrAXUBSvZEICxJcA2CWD7fabwwbgQQtPqgO1WAdtEAHZCYb4lARZOhA8APnPvTub+r9lHhwCC/J9b+4QE/1HhTxgAnaz3T8n//uh/h4D/EeEPyf9iCBCk/pO1f8L9ZwBA1fsviAEAd/4p+I8wAIjzT8R/L6T/w7V/r0vRz+6nZO+/FFj9p4t/tfLPF/8XKYBh1fWvhLn/fO1fiZ6zqgpQ/X3Jv+aP1wNKI6D3L7r/IP4vWQAjvAqw9S0U4dtsTrwT9O5cyev4sLr6UQV81gV9VNieKYQvakfftAKQVhIAax1fUqwArC0B7pjR/ut1+mN9fuu7Xq5vKtD9r/78P2/pPvevnHJ1F9r1oZ13/N9hKYAFO+dOAWCtDExqPaCpQA772WYwkNR2gUYL7fnGJoi09m93ePT/hu8O8Oi/iv8L+J+M/vvi/7n2pyX5nwwA6Nq/DSHR/6r4z3WqBACL/iv3n0b/N/K1f90g/l89+R619q8gEwC8+98rov+A/j/AwH+lfj/4T3f+y1L4n6Fr/2TkH5D/hfBX8X9f93/EXwFQ6/ukuy/j/3q/X+MB+H8HBwBQ+GspgPPe0rsvZUrwO6q+O+40fv2fLQQwrsPfKAcfa1BgmgRIez1gWh1+LDggFr3fCf7Gr/+LCwcsjF4KOP907d/gTJtTrO5Cvca98fdcM9F2AW4DkGsBH1qJ5vxntSqQNGQQi2VgywTAXmt4xQ0Qqv+sC7cHnf9F21d5vzX4Hxn0by0Q/9T9V2v/FPX/Keb8r2dDAL/7T9cAdh4Czj8T/jnN/Qfin/b/Rfw/6P6LtX/U/e/lq//6GPhPHM39J87/ABP/RQ7+E0OA8oBy/mH8n3X/a7n/qvuvKgCQ9u/v/Z+T1H8d/qfXBvTu/6wC//HeP6H++91/OAwgz2jd8iaawHbC3B138AV8Ug6+aZcf+++y4vybfg4bumcq8NNe65eUg28q2J3Qb6zzX8vZj0r7l2fL216uZzII/+udvHjbbY+81ylWd6FfN+z6yk1x1wKmPRhIer0gtvDOetQ+q1H/rA4GFu0KOv/kfPybW4H7/xgV/mzt3+NV0f+kjP0z9/8p5vzz6L9w/2X3v3pyPP4Po/+5DYz8X4Ddfw7+I64/HQB0HZHin7j/JQr9Y9F/tvbvVUX+7yWuP4/9gwEAg/7x6H/fKQD/O+0VgftPo/9DVcE/NAni/1MS+lfm/f+KjP5P64Jfc//PBqF/NMp/Vsb/S2HOPxwGwK0APuEPAYDC/Rf3JWPnvWX3v5OowJ8v6/3ccaeZBgOmf++H7MWN/JsOBpKC/mHR+U2rA1hrAG0GA0k4+6YJgLgd/6iVAzcYSNfZN0kARKkGFIbPB6j/5JRGp292StVdiVxkpcSiiVUH/QkAkQLAEPBJDQxqRfWx1w+aVg2SWn+YNAvArTMEp8bav2u33+ndtOE/03V/Kv7PBgC5dQz8J6L/Bej+tz/NwX+HNPHPhgGHvEIHdP9V958K/w06/I+5/kfoAKDQfZTT/wX472UV/SfuPx0GHK8eDv7rh93/Eyz+T8B/fQz6RwcBA6f1I9z/oclA9B+Kf633LwCAIyGkf772T1D7S9rav1nfcEB3/0sQADiix/zLNQCAZW0gcN5buvmNhghzJ+bdccI+uURAWuv3kmYBJN3tN13LFwf21xpT8Cfl/NsIdlvYn+379QS+E/rNwQKY6/3K5rdCo//5vqln3No/dyV6fWzv+g+FbgSYWCHF+1wCPuuQQFOBbFshsHXeTZ+PJfRN/99zPjEJFu5oCx0AfPL+b2tr/1jvn639IwOAPKD+y7V/7Qe07j8bAByS4r+44Vl6cqEDAA7+k2v/Dqu1f8L97xGvufgnwr/3Fa/Qy1f+9fABQJj7T+P+LPIvxX/1NVz7JxMAPvJ/mQ8AKlr0f8YH//P1/mH8n3f3GfgPiP/Q2L9KBED3n4p60P8Pi/0T0V/2JQHgWkAH6XPHnfQ6+Vj0ftsBQtzvxxL6/t+ZDgbidPEx6P1xafxxoX5Z6/rbOvZx1/thDQjcSYfeH/b7uPC/3OBZOQCAg4DC6IUPOYXqrsSva7e17Q1jAVy9O/sMgLSqB3MJYIztAljR/KTZAGlXDhoGB3xwVY21fxu8W1Y/Kl1/4fzDtX/aAKADiP+Q7n9OrP2j8D+49u8FtvaPO/9FHv9X3f8jHADI3H/S+y918/h/N1j7R6P/x6j4ZwyA17Tuv3T/+9kp8XsZrv0T4L+BGuT/IdX/rwD3P9j3n5FUf839h1R/mRKYlZ/xHyn+ee8/zPGvhCUAfHWApXdfdiLOHXcaMCCIS+03HRhgOf/+akBWoX1JOfy20X4sav+yBsP8bLcBpJ0UcCdaND+pgUG9REDpnjcDvX8q/vun/tQpU3elct34F53/esH2FT/3swAWbG+r6/RnDRZo6tRjPSeug24KJ0wq4o+VYEhrYJDI8/dWxf9EuPv/G/fsCbj/5LUC/z2pgf/ypPu//gB3/p/Ru/8i+q9R/6tnIx8AAPefEP+F+FfuPyf/94D4Pxf+hV7V/afEf+r+H2OifwC6/2QAcFJC/4pwACC6/3L13yQfBvDuP6D+lwPU/2lF/tdW/8Huv1jhpxgAuus/oycARoLDAH/nvxx4fV6L/tP7GOMAkNetW37ihJo77iA76Gl19Od6fpQEgamgN00KYDv9cYU7lvNv6uDbDgawu/9YTn29oUBUiKDtcQOCZKL+pu/P+fut73r5/uDav8U9kz//4vjpf+2UqbvSSwHsWrUulAWwa4Um8KMOAtIaGGDR/bE7+klVB0w/1+jnpw0htHnOwt3h7v/Hvj3qLSbifw0fANzF4/9rQPefO/8F0vunxH8O/uPuf84P/uMDALjyLx9C/s/LtX+H+bo/Tv3v9on/Hkj+P87X/h3n7j/s/jPxT1f+gQGAjP7TBICI/Z/hbr+4g+6/7P/PAPgfIP8H1v4p918Q/0sBwB9LCkDhX+Kdf1ETCMb9Z4McAE34nw8MAdj9orf8q+86keeOOykODGzX8NluBUhqDWAj1/wlGcW3/RyG87+sAUK+nqNvS/dPKingTjIC3/RzYeT/4tjlIPWfdP8HpjqcInVXqlfpifH3LZxo+2nYVoCr9poL+ayvEsRKDGB9Dhv6ZyqEsZIFpg59wyoCe8PF/zXbv+R9ofc/AejfYzL+n1/3ZHDtXwdf+Sfd/4PsEPHfziGAFAbIwX/C/efxf0j+L0rx/xKn/7+kO/+9L3P4Hxf/PYz+L9z/IqT/i7V/xPnvZ2v/yKo/Bv87BaB/uvtfgu6/6P9z+n8F9v2Hwrr+IeIfOv8jZ/W1fyGxf38FoCJOSNQfin4t+j+mbwKgKYDqab33TSfa3HEnQ4wAW+ifrbBPmu7f6AoA1hrAuMI/6QRA2msA46z5w1z/5062oX/1PlfZ8o7X0jsVgP+19Ey+XRr33ucUqbtSv67ZuaI1AAMkg4CdKyI7/GltCUhju0AWBgmmsEPTZAAWPNG/pQFrjSL2gMD/PQt26iv/xL8HH//618Dav33eLWIAwMF/ZABQoAOAJ3n8n7v/7SFr/9pV7z/X+azXAsV/Jwf/Afefdv83qui/cP7zvPsvwX9c+AvwH+39U/dfgP+Oq96/hP+p3j8ZBGjUf9H7H9LBf7L7PwjJ/8D1D5yzOvgvZPUfjPgHqwBnfZsBmPgvh0T/gz+f11YBsui/qgCwIcEFb9n9bzvB5o4T6AlH/23p+nETBvU6/ViOfVKDAezof1Lr9+JG/zHo/jbiHlvox3X6XYR/fgn9uZz+sL/Lj1wI7f7nB6eXOyXqroZcZOXEwom246FVgD1mgjxrjIC01gUmVSWwofWbCOs0IvdJJgbifN+CGmv/rtu22rtp/X9lzj+J/9+lyP8C/JejpH/Y/WfR/xZK/gfgPxL9bwfd/44Q998X/S8I8F8X6/zDtX8FufrvVen+0+5/zzEW/+fEfz/4T0X/T8lBAIn+lwH4ryx7/5MSAFgGa/8U+V9f/aclAPwpAEH9BwkAzf2HPX+QDFDUfyX8/QkAHQh4Xvb/SyP+QQDgAIgUgOVaQHfccYME+0FBXDig7QABCxrYyOg/5qDAdv0fdpQ/bdif6edtaf61mAFuQJCswI/yeZMBwVy/r2z5aaj4z/VNHndr/9zV0OsjD/3+JwIJAHIm2jRBj80CaPZBQZTBgM1AADsBYNvtb9bnz/W5BRMrAuKf/Dvwqa3bqqJfp/4z9/9xvftP3X9yV9T/XPszKvrf8Qy4s96/6P7nRO+f0v+B808HAC/JI7r/jAPwMnX/hehXsf/jFPonXX8q/gH4r4+T//tEBYBF/4sDvgTAgOr8iwSAIv5D4e+L/g+HCX8A7gPkfzYE0KP/JeD4l8BGgJLf+Qfdf7jiT3T//Wv/oPMvkgAwFdB631tOzLnjDsL6PFNBjZUYwBb0zZIAwIjkz/U+VmKgkQMAE0c/ruBPW9C7oUA82r9tt98mAZAfnNU6/6ICUB678AmnQN3V8BTANROr/j8p/AEL4OoH21Jz+JMeCNg69ElF/ZNkDGAKbWzYX1prCWuv/QuP/n/kO72h1H+x9k9S/ztY7D+//ikF/uvwrf3rPMh7/4foAID2/2uA/xj1/0Ut+s9E/0u8+3+Eg//EAECB/4oS/HdCW/unUf8l+O+0D/wnxD8ZCJwB/f9JQP1Xq/8qYe6/NggA4t5H/Wdr/8LBfzQhMFSD+j9H9x/S/wNuv9/5hywAMgC4x60FdMedJOj+2LC9tNb/Zc3RT3stoG2Ef1kDo/42gwIsWJ9b/9ecSYG5hH6Uz9X6uTz+44DwZ+7/1N87999dmbg+/perPxjKAphYUdfBj1sFSIsBgDlQwNgqYPr3WJR/7G0AcZ1524oBKkuAgP+2h6/9+9zow3QAcAvv/YvoP+n+twDwHxP9LP7PnH9O/W8XxP9DPA0gqP989d+G57wWIv679LV/zP2viv/uwxL8J53/niO89y/Af69SBkC+myUASj3HA+C/Ah0E8N4/GAAUaBJAgf8U9f80d/0B+I8nAIjoJ2sA6SpAAf8bnlFr/0aCQwAi5oWgJwMAAf4rDc16xRChL5z/0gioAAjhTxMEs8rpHwl2/dV7IhVwnp7KmM4BgO/TIcCWHzsB6I6L6CM563M9B3MbQFai+ElF9E2dfVs4ny3lPymhX8vZx9oKkBTl353moP9jUP7Dfp/rnw7v/g+fvsopT3dl5rp2xx2bwqoAV+1eYSS842wNyEIVANvxj9rRx3p+UpH5qMkA7OfbMgXm+ruFu1YGnH/y+sZvjXP3fz93/5nz37J2v+z+i7V/4uTWP83i/8T9rwr+XCc7LPp/SHX/4dq/Ttb9ZwMA4vhz8n8XJ/8T979LuP5HtN6/dP9JBYBE//uO8fj/cV/vn5P/+06B3v/JoPsPqf8Dyvknd73zPxPa/a/4e/+A/F8C0X+59m/EJ/5HfMA/UAcQzr9G9g90/8Fr6fSfk06/P/qvhgEX2H2TWwvojhsWYA8esNb82UIBTb83613/uLR+0zV/zUb1jxPZx4D72TIC3OCgMZA/LLjfXH9T2vSGdP1hAqDQNz3uFKe7MnXd+N3OX6wKof8BKwD0bF9BHdNaAl+I93pC3pQVYPt9zTZQMB00JFUtiMM8iCPksZ4fe5DAwX9Q+LO1f1/2fnvj33o33/Uodf8l+O+ufbT3L6L/OeH+09ei+3+QVQA6VedfgP/ywvnn7n+Og/9yvP8vwH/M/X/Jy5MD3H9yL1XFf4mIfu7+E/Gf7zlWvfO1f7wGUOgFA4C+1yX8j6786ztF3X9B/i/2syPEP4T/FfvPqP4/HwJUhOjnd5oIAKKfvC4Nge4/FP8jzPWnqQBeDyjChABkAFTfK/IkQAV0/iHxn9xLw9zlBwkA8TuZDhDif0ysCNSTAJVRNgRwawHdaXaHPy7d3zQhEFeQY7MCsDv6aYl5U+c9isBvrfN3jVjfZzoYwHLobR39elsEHN0/mxF+LEc/KgSw5qDgvndJzD8I/us58z9K49P/0ilOd2Xuun7nHf+nfwBQay1gkuv+mnWrgI3gx4YCmkbo4wwQbCL8cf8Oa7uAf+2fOJ/4+jep6L9lDRkAPCoBgLes3Uej/zmt+8+HAO0HuPN/UK3961DuP3H+A+6/6P1r3X+x9k+Q/4+C6P9RJvzp2r9XZPefRv859V+s/WPi/4TW/Wed/5N87R9w/8XaPw7/YzUAPgQY1Hv/WvSfrP/zk/81CCDo9IPof9D1rxH/5+A/Ef0Xwj7M9fcD/4TYF51/fwog4P7LrQAXvGX3ubWA7rgTN+pvK/ijVgRskwNZqwiYDAow6f7Y9P40o/8m6//qVQZsO/9u7d+VxQaolxwojF4Kjf4XBqf+L6c03ZXJa3x8/D0LJ9rO+mGA5HzwobY5GQC1ov9Rf46bIMgKXDDphEBSA4SkKg+2LANbBsJcf7dgz8qA809eX/dAu3fzuu8x4b9Gwf8E+E+u/RPx/+q9Zf0Br4UOAZj4zxHXv1PdySCg0KHcf0r+73yeOf9c/BfB2j/i+ud595+u++Nr//L0Nen/v1r9PV/7R+B/1VOQ0f/jXr73BO39K/gf6/0X+KHk//7TbAAw6Iv+V09RQAAHwOq/QRX/lwyAEZ/jLxIA5DPDyv0Xp0R7/2c14B8cAkgIoEgIBMj/s+yMMNefOfnnAuv+yhoHQMEARed/CUgBsJ8vUOEvzpK73VpAd+ZflB/b+TcV2lEFPlYSICusANPOf9xOf1xBbirYGxX5x4bzmQp2LKHvhgCN6fxH7fLb/F3l3re9XM+kBv1j4L8z58bHvfc4pemuzF4f2nn7F0LXAu5oQ4XxNZoRgP29WPA/TGFusnUAu7OPDQOMe+DfL5wI7/7/xr07wsn/ax6n4h/C/xj5/4CK/1PyvwD/iRSA6v2L6L8YALDYP1v9R4/o/XertX/S/ZfiX4//l0j0v1et/oMJAOn+876/iv6f0sQ/rQAQAOAQjP9zBgCI/tMEAOz+j4St/JsJuvpc8Bc1ur9KCKgKwKzGDPCT/2G0vwzcfj3ur5IAfvdfiP4lYzAhcKH63gX5Pj2bLnitW91aQHey1b23pfNjwwCxqglRkwXYg4FGufqYg4FWxKpB3MoB5mDAxJHHShDErRpgDQbcwVnrlzYMMM5gID90LtT9Lw3MfsEpTHdl+iKrKRZNrHoqbC3gVXvqO/dY2wGuNBYA9oAAa81h2s+PO2iI+n0Ldq8M7f5/9LvDnPr/GE0AtPDoPx0ArAPRf3Jv5/F/4v5XhX+L6P93PqMPAUj0n2wBIM4/GACI+H9ekv+Z+0+Ef16C/45S8Z/vPlo9L1P4X6FbRf/pEICs/OtmnX/q/NPu/wne+a+eXkH9P6VW/xHKP3X59e6/qgEI8B+n/g+IKoAS/xVB/weRf+X8z3BHf5aKfgn+o6v/ZqTrTzv+YVsARgD4jyQHqMM/q/X+/RwAMhAojaitAKzb76sGaBDAC5wbcIEPCngCYBMbCFQ2XXLC1J0rigVg+z1prdmLG/VPazAQVXDbUvejCnjb9+sJ/GZZ51dPzJuu5XMsgPnJAojLBKg1GCiP/0QT/QL+l+ubOuDW/rmrOVIAD/3+NYEEAF8LaAvzq/e+6e+b7WANBmxZAKYDAtvvS+v59OeH1do/OABYNLHK+9zgX/IBwKN0CLCYAwBz636gRf/Jyr9chxL/zO0/SMn/TPxDBsCzzPknFQDQ/WfO/2Hq/DPRf1gOAArdrO+f7z5CT4mL/yIn/ufpBgAG/iv0sJV/xPUn8X8m/l9T0D9yek/x6D8T/v7of1mA/wbEgZsAFAOgwgcApcFpFvunon/aR/8/K118Jt5nveIggP6NAPd/RKf/l8S2AFoTYIKeDBEqo7roZ0L/fCD6ryUAgNiHzr/f/RfDAG0IwFMBrfe6tYDuNN96Pyzn3jRCP9fzbRIBSQl908FAHCo/Br0/Lo3fdu1fo6L+/mh8XLq+rfNvK9zdYCAblH9T5z/qIAD+Puzzuep/94S5/9X/PrnWKUt3Nc8QYPvKnaFVgN0rIyUAoiYFMKL8mJWDrA0EsAcFWILedrtA3GqADTtgwc620O7/x/94a1Xs7wPRf772j0f/1dq/A2DtH4v+t7SzIQCj/x9k4L9OIf6rwp+Lf0L9byH3jar7T4R/Dqz9k+A/vvavyNf+FUTnH6z9E9H/Aj2v0d4/OXTlX/UUiPvfy8n/vALAQIDM/RcDgCL/Wcb/B6eo+y/hf9rqP/+aP+78c4EvOv6C9l8c8lH9xWeHAPAPVgB4CkDC/+Tqv9nA2j+5BWDkHAAEKqFfHtWHAJVRRfyndyr2WQqgDIcAmy7QGkBl7KK37P53nNh0Z94MCEyo/bYDg0YlBbIG8TN1+G0HBlG3BmAnBRq18g8b4mfq+LuTrQSAKcTPhP5fuufNUPGf65/a5RSlu5rq+vQj63/l6m0rfh7YCrB9hVH0v16EH3tNYFqMgqwnCWzXCdpG+ZN6ftQEwdV7V4VS/6/ddqf3O+1/z6L/ax4DDIB9Xm7tD2Tvn7n/Av7HwH8t0P3nwh+u/Wvh0X/p/vPeP439A/CfgP8x55+B/wq0AvCy6v7TAcCrjPrfRxIAJ6rnuIT/ybV/Avwn4//M/af0/xD3X67840et/Zvijj+HAILVfxUh/OEwAIh30f0X8f8S+H0o/X9kVof/QfBfaPdfiH494s8cfpUAYEIfUP4D7r9vEAAOGQQs3fxDJybdaaijb9vdx3b+bTv9SQn6pGB/rZbdfWzn38TBx1jnlzQU0FSI235fXKFpmhRwA4T0u/s23f6onf/A+1vfJUI/IP5beiZ/Xhr/4a84Remupruu33HHmjAWwIJd8Z1/U4GP/bkkBwlZSAQ0qqOfSHTf4nPi5wUTangFEwCf+uq3lehfs0+5/2uf4M4/GAC0sxQAdf/bGfgv1/4M6/7z/n/OD/8T7j8g/5Pof7GLDQByXPwXafRfrPw7wgcBXPxXRX+eDgAY9Z+C/npZ/D/fe1xS/+np4+4/X/cn7mwIEOz+F/vPaLH/ilz5R6oByv0vCQhgWAKAvmbCvzjMif+A7E8Ef5G7/nr3f5ZDABX8T5D/lavPBgKE/C/WAGrrAEd0EKD4O//aP+j+U4HPXX/6mgwGNvH3NqkagFsL6E5WhLxtZ98mum/zOVt4XzMkApKM4tt+zlbAJ50IwI7ymwpyjDWATvBnj+5fS+Sbfm+994tjb2idfzEAyA9Mr3VK0l1NeZXGx9+3aKLtRwEWAAEC7l2JKtijrgG80tYFZjkxgLHWL+42gjiDiAUPrgql/l+/bYN38xq+9o/H/2/hR4v+C/AfHQIw55/1/4HzT8X/Ien+5+TaP5ICYO6/EP95Dv7Li7V/XWLtX4j472bEfxn9p/1/Bv6jHIA+1fsvCeq/b+0fHQLQ2P8ZFf+X1H+9818Sq//Cov9DsP8PEwBK6Jck+X9WCnvN7R8C2wBGgvA/KuCH+RDA1/8vA+dfsAAqYzr5X1YAfGv/hOsvqwG+2H+FbwAQwl+cpfe4tYDuZKfbn/TAwBb6Z/u5ZqT7L0NMCNhC/2w/lzWYXxwGAIawd3T/+bENwHYdoNHavy3veC29k0H3v3fqx6XxJ97nlKS7mva6dseKij8FQJMAO9uMnH5T2B/WYMF0gIDJLJgPWwqwkgiJPf9hsvYvvPv/6bEHvZvvepRG/+Hav8VrH+fkfx38R2P/7az3T6L/uXZA/a+elurrQgdz/lu4+y+p/1r3nzn/rP/Pyf8g+k9OXlL/BfhPDACY+C/5wH8F4vz3vS6p/yQFANf+FQdE1/8MW/83IPr/KgFQFnH/oSkG+6MDAfZa0v65+NdXAIpeP1/lNzKr1vtx8B8U/jAJIP5OOv8C9jesUgAC9lfmjj/5nU73PwdWArL3mNOvrwBkAwHh8PP3RAJg7EIABMiGARe91i0/ceLUHdToPRal31TYp0XXj/p9aQt8LEq/7Vo+W7p+XEhgUhH+tIS+bRIAC/bnBgPJCnnTbj4WE8CkElAYuRDa/c8PnF3iFKS7mvoiqyuu2X77y2FbAT64J3kBXytqjyXUsRMDjRL4thDBtP8+buQ/LmuA1FT8wp+cj35rlIr/xZz4L1IALWv2U+e/hZP/GfyPQ/84+E9B/56h4D+ZBODuv4r+v8Ci/7D3v5EJ/8JGDv7j0f+CrACI7v8rau0f6f5z2j+L//PoPwEAAvgf7ftz0U+gf2QAIFb+lQD4rzwkgH+T0v0XPABB/JfCn4v9ykgt+J8g96vYf2nkLID9zWjpgPJwrdV/s9qavzKA+/nX/hHBrsH/RlTPH0b/WexfkP65sB85rwn+Jdz9l7F/DgEsV4W/rArcfclb/tV3nQB2J7GOvulgAatygJUEMInyNzMEEIsRgLH+L0sQv6jRftPPY9H8sQcEbiCQbUaAn96PNSAo3/vT8Oh//9Qrbu2fu+bF9dGdX/41PwyQDgMm2iInAEy3A0RNDGBtIbAV9mkNANLaDpCWcx930DDn5x9aGRD+5Czadof3hb7/RNf8sci/WP1H1v6x6L9IANDOfzuP/hP3n5P/JfivQ3T/RfyfQf9aNogEwAsqASDJ/2rtn4D/iei/AP/l6QCAdf4LpPffzdb+kQRAvpe7/31w7d/rNPJPif+U/H+aDgHKAwz8J7r/xUFRA2CinzIAqPCflu6/XPc3yNf/+WL/JVEJGFERfyb+2RCADgPoZ1XMXzn+s9oWgCIfIIgEgIj6l3zwP+H8h67/k4L/XIj4BwmAUVEDUOJfvF8eU46/TABUXy/ZxM7Se990gtcddGFuCsuz7eLbCu2oiYFav8MS9EkNBuIKe6xIftKJgUZXALA7+NiOf1zx7gR/esI+TJBjO/5xkwDi8/mhc6Huf6H/3K855eiueZMCWLRjxd+EVQGufrANVbibRvht35/vDABbhz6pqD/282n3f+dKTfiLJMDH/+hrcu2fEP4t1Z9bSPQfuP+5dkH9f0pS/0kCIC/df9H95+C/Dt7938C7/zwFQIW/1v9Xa//gAIDF/4X7/yodAhQ5+Z+K/+7jPPp/Arj/TPzT6D89zPkXvf8yp/7D7j/bAKAggGUY/5exf54A8MP+hkEVQHb//dH/Ot1/8Td8aCA6/37nHwr9EqD+lwH8zw8BFGJ/iY/6L51/2P8P6fzD+L/8nVwL6ICAV4p4z3rFIGnnP6mOf9Zhf9h0fyyhH3d9HxbUb1kDBwRJUP5tYX/uNMbRx64IYFYDSuM/Chf/fdN/69x/d82r65N/2v6B0AFAxLWA9Y6ts+//DmwnP2ssgWaFDJqu+4v6/QseWhVw/sm5dtta73fa/4F1/+96DAAA92niP6+5/0/L6H8Lof6T1X+dz/AawCHm/gPwnyD/E9dfDAAKXPiL3n/BL/5J/L+buf/FHhX9L9Co/3FG/e/l7n/vCUn9LwjqP137d5qlAKp34vyXBxT5X6z9I4JfrPyj4n9IdP4nVRJAHOr2TwPHf0Y5+8O6s18Enf6iHBao97RtAOJzvPtfCaH+C1FPXP+SRvnngn/svCb45Wsg9IXwh1UA6PZL939UHwQQx18NBC7SQ95r3eyAgFdqRN82Ko8l9JOG6PkHIFjPb9aIvqnATjoJgNX9NxXpSa33S4ryb9vtd0MA3K6/qdCPKsxNIH6mf5/rnw4dACwZPv8BpxjdNf+AgDu/NOxnAdDXu9vQhH3UNYKm2wKwhPx82yZg47hjJAWwnl9r7d+nt2zjwv8x7v6ztX+L1+7n4p+v/qsK/4KI/q8/wKj/7QfB2r+DtAYAyf/5Tuj8C/f/Bdr7F8T/Qjcj/qvIv+j/H6UDgCIH/5EhAF35R6j/3cfpIcI/3/saWPvHyP9FSvtnp8ip/3TVn3/tHwX+8b6/HABMa84/I/+zU4HUf1EB8K39oxF/EvkXPX7o+IN7WdQDxOuhWR3+BxgAkP6vnH4OBhzVHf8lHAIou/9j+lCA3QHx37/qbxN0/i9qSQAi+sXAQAwCWu/7qRPW7kQW7nMJfYxBgm1HP+76QIwBQzMMDrA6/Vhr/rCo/mkNDrAYAPUEusm2AJvBgksGZAsKWO/zWJWBWt9X2vRGuPvfe2bMKUV3zcvr04/c9gsLtrX9cyAFUBVaH9y70igJEKUCEGUwEFfIx60smDIFsKoMzTZoSKtCoH1mdzj1/4YHeqri/1Hv5ru+L7v/rAawT679k+T/dkb+p+A/3v+nzn+HvvaPAQCfrd6f9Vqo6H/Oy21k4j+3QcH/iPOfI4OAbub+M8ef0P6V+BfRf3knzn8fc/8LHPqnqP+vsd4/d/8LPP4vKgBE/EPwnyL+T8o7df4HRPyfAf9o9J+6/sD5B+JfbgMQjj/t8bPYf3FoBsD/oPjXif/0PsLEf4mv/fPH/0UFgKUCYNRfUf4h+R86/UL0szWBqvdfHoMMgPAKgID/lYHzzxIBfAAw7lIAzU7l938+SYceq6sfl9LfqPV9aQv6MOHcigDbiwvhqyf4lzVofZ+NoMdw6LG6+lEHAw7e11xCP25kP65Aj/v5WFsAtr7rtfRNh6z9m/znL3739C86peiueXt9aNeX/7c4awGxYH1JCe6sswHmW2UgqfWAdO3f9mD0f8G2Nu+zw3/KxX9V+K8ha/949H/tD6T7r4l/IvrbBfmfR/47fN1/6vw/K+F/Yu1fTgP/iSNSAEz8E+K/TALItX/HaPefrf47Rjv/pZ7j9DWk/jP3/yQbAPSd5uA/JvwF+K8kgX+nOeVfxf9J3L8SiP7PAAbAtOr8j/hSANzpL/HOf3HorHL/Je1/hicBZrXuv2QB8AFAWYP9zUqnH3b+YfRfJgDGBA9Ah/0tGYMVAB8McNMF4OgLCCB0+JXTL2oBog6gAIFuLaAbNKT/d1EHA0mtB8QW/Fl1+k2j/rYVAix6f1bX/mHBAuMMHExo/24wkE0WQD2Bj10hiPK5wsjF8LV//TP/h1OI7prX1/j4+HuqQmsqbAjwwYfaIicATBMCWH9nmjzAgBimKfSzOkDA3iJABlBh0f+Pfese1vvnxP/A2r91wv1/kol+vvZPkP9p9J+L/xaaBDjE6P/C/e/kzj9f+8cGAId59/9FSv7Py+j/EXWnQwBB/WfCn7r/RPQT17+Hu/99xyj5X4L/+No/4f4XepnzzwCAp+UR4D/a/e8/I6P/IgVQ4RUAKvgF/V8kAKDzL+F/QNCPcPd/2Of+y3SAEv6q+6/I/7TbzysAaq3frOb+lyAMcEyB/zQGAHf/y8L1B3c/2I+9Pg8EfhD8B7cBKAbABZkEWLLpslsLOE8FfFIOflp/l1bkPssCvtUiKdBqmCBIO3KfVQGfFKU/KQHvBH5zwP2SEPDGzn/1VO5922vpmQyI/1zv5Mz4uPcepxDdNe+vD++547cCCQDCAtjRZh35t2UBZC1qn9Wo/7waDOxZVWPt35e93+76z0z4r3lUdv9191+B//IiBdDOu/9+5190/zn4Lw/Bf761fzD6T+P/XPgXyamK/1w3GwAw91+A/45R8j9Z80fAf6W+45r7L8n/vTz2389TABz+J6j/Rer8M7dfvafi/2zdn6L+0yoAcP3lfQS6/wD8x1MAZTEAgCsBfdR/Gf0Hwp9WAIZntdi/AgCCNX+iAjAKBgCjkOqvg//k2r8RPxdAAADP6wmAUSj2lesP77AGQM7SzW4t4Hyg82MNBpKGEWJVDUySBfNhMJA0DBCr429aOUh6MBC3098oGKAbDFwZgwHbQUFcVoD/5IfO13L//51Thu66Ii6y4mLhRNv+sBTAVXvaULYCRIX5YTAGbCoGSUMFm62y0IjBwNUTYdH/Fd4nvvoNCv4jq//E2j86AODgPy3+3/GU7PwTp1+6/9L5f4YfBv9T5P8X5MlvgOA/NgCg4D8f9T8PxH9erv5j0f8ijf0z6n++Vw0ASP9fgP/E0Zz/AQD+k6/FEID1/8s89i8HAYPQ+Vfr/jTwn0bz50A/ufYPnhmdASArAmcBKHAWrPnjtH+f8y+EfmlEX/knov/+LQDQ+RcMgEqA8H8epAAUBNDv/osEQFg1QAwDyFl2n1sLmFWHHwuqF7eLbwvhM/0eU2Fu+j1ZE/q2At32e7DX70VlC2Q9so8V8Y8LCXSCPtvC3hTOF7fbb+v0h31Pefwn4eC//unH3do/d11R1w0Pf3mhPwFAUwATK2JF8uMKdJPvi+PIx30+9vaAuP98zcoksF0XKL/nwbYA9I+c6x5o925e9z2w8m8/B/89BoQ/6P63gwFA9eSp6D/I3P/Og7r73/Esd/6f4wBABf3Ly7V/LPov4v8F7v4XKACQcAAI+f9VSv5n9P9jNP4vov8kBVDo091/Bf47JcF/fuhfiff8Zed/AGwBGOLUf1oBmFH9/yG/6AfQP5+LL6L/pRGx3k9UBaDrrxgAkgUg6P6A+i/I/+VRPfYvGADlUX0oELbyT9QARAJAgv0E9E++d16rBdAKAFj7B4n/tdz/ytgllgK4xwEBm6GTnwQ933aAYArri1oViFstwBwQZInKj0Xvj0vjt137ZzMgaGTU39b5t3Xq436fGwxkc3Bgu+4v6veZDAZyAzNU8N/S7XP/R2YWOUXorivuumbbym2hKYDdbcYOf9KsAOxoPvbzkxLo8zUZsGB7uPv/6XsmePdfX/23eM3+EPAfj//ztX8w/k/I//kOsfaPdP6f5c7/8+CAtX88/p+v1f2nzv/L0vmnA4DqnUT/S3wAUKTuPxsAiLV/1PHvFfA/5f6LAUBB9P+J888hgKLzz5IATPiz2P8kc/7lGsBpFfn3DQPE2j85CCCx/0Eg8IHjr17rawGL3P1nAl84/v4KwHltI4AfBhgg/o8oga8GAioJIF190f0fm8PxF0mBTRd8gv9ijUHARa9161tOkDfRgCBuUsB0YGDa8Tf950+a2p91aF/Uzn9ch98UDhjlc60JJgWylgAwFe5zve8Ec/MlAOI6/LbRfuykQOmeN8Pd/4HJ7U4JuuuKvD77Z32/XBVgP6POPxwCbFdrAbErAFhJAdvnYDv/jRLyjX6+lfu/qy20+/+R7wwz8U/i/2sek84/7f7L6D9f+9fByP8tUPy3c/J/J+//dx7Suv9U9Hcy9z9P3X9O/efkf+X+H/GKXYz8X+Duf6kq/os9r8j4v4j+C/efvKbin5x+0P33uf9S/A+yI8S/Dvs7w0n/TPTTrj91/QX4T1H/pfuvvfaJe1IBAGv/isD5L/pBgHz1H/mddP752j8h9CH1H76G0f+yXO8HV/1B8N95GfFX6wAv+Nx/WAe4CBgAfvjfRd/ngu6/eL3k7stOcKco2LGEe9LPj5sQSFqg2w4Gku7+x+3oxxXuWM5/XAcfa51f0t1/GyGOkRCwjfK7Tv+V4fxjJwXirv3L9U8F1/71TP5sWd/lX3ZK0F1Xbgpg98rfD0sBEHGWZkcfuzpg+7lGPz8rg4TEzt6Voc7/wm2rvN/q/0vl/t+luv8tax/XBwCC+k+i/5z8L51/6v4TFoBY/ceI/2ztn4r+E/K/6P5T4c97/373vwDcf9H5L9DO/6tVQc96/8z95/d+5v4L8J90//tPVoU/6/3L+D9x/MUAgAr9SY38L7v/QvCDu4T/DYMBgAQCzkohXwROPnP2ZzTaf2lYdf4hI6Codf9nNcq/WgOoBgJ63B9UAEb11X7q9QXl/o+yqP8SX+c/SPu/qBH/Aw7/Jp3+H5oI2HTJa733x07EJyzkbR19Wwfe9HO20f2ktwTYsgiyBvHDjuLbfs5WwGclEYBF9zdNACS1JcCddJ3/uNF928/Fcf7rfaY4drkW+O9OpwDddUVftz1y23sXbm97MzAA2EZSAG3GkX7bCoDpwAAr8h9XIGMlC0yFeLNVBPxr/8T5+Dfuq4r/7zPqPyT/g+h/Qa79I84/dP9J1x86/yL6f4it/ZPgP//aP+b650D3Xzj+rPPPXhc5+K/YyxIAtALQy8R/sRvC/05I578E4v/M+efk/34e+x/wu/+nZf+fpgBk9H+SR/6n6QrAwNo/P/xPruxTgl6Ket/qv1qnDKL/kPYfjPoD+N/wOUX952LfXwNQFQAAARzV3X8Z+Yfin6cBYAJAuP7+JEDwXAIpAH7fdMmtBUyp2580td8W+oc1MIjzfBNh3myR/rQGBrbQP9vPZSXOn1b3v1GC3g0HskH3N4UHxhX+tgOCypZ3vJbe4Nq/lr4zP7rtEe+9TgG664q/rtu9ohiaAti5Ak3g20b/MZ9vkgSwhf1hDRZMBw1YAwKUAcVD4e7/tdvu9H57w38BAwDV/W9Z90Qg+p9vVykA0ftvaQfiv111/5X4B+6/JP8z4j9b++fv/jPoHzvC/X9FJgDE2j8a+e89zsj/EPwXEP+n2Nq/QUj7V6v+xACgJLv/nPqvuf+89w8SABAACAcARZEAAGA/Gf0f8UX+wWsq/qGDTwcBs77oP6gDgCGAH/xX686c/vM+d/98qOuvfr7oE/t+p/9CKPgPVgDK5PUmNhBotrWApkIbK3qP/XxbZzzpxEBSjnrcpEFWBgJYlH5TYY9F148b/U97fZ+pkLetBNgyARzdf34Le9P1e7bRf9PPFUYuSPAfhP/l+qZLTvm5y13/gq0FXLR95eGwIcAH97Ql0v1Pq0qAReu3jfInJdSxEwNpJAkWTKwIHQD8+v3f5tF/Af97lMX/1+wPdv+F8NfAf9D5Z+Kf3Fv87v+G57Xov+j+y+h/lx79z4G1f9T1lwBAf/T/mFz7J6L/pX4B/WPOv1z753f/h3j0f0AH/1WGWO9fMACk809Fv+r/SwjgsM/JH2HCndUAQpz/YSD4R8CQQHT+iegf1YF/fvdfrQU8Hxr317v/Av53QVsBuGQMflaB/yjtv0YVQF/5d9G3CSAMAnjJVxVgP1+JawGxBgXYjr3t802TALZRetPnN0tkv1FOf1JrBLEj+8uQ6P5Rnfqozr/poAA78u+6/s0J+zMdEMRd/2fKCJjrlDe/FRr9z/VNHnFr/9zlLnDduGv1x0JTABMrrAGAaSQH4g4abB3/uN/XqOc3ajBRE/y3O9z9v/6BLu/mNd+Twl9G/zXwH+z+P+W1kO4/df15979dCH8OAfSD/6pHuP8U/sfdf0L8p+4/HQAclvF/kQAQA4A8B/8Vuo95edr/P8YGAL1sACDI/2QAUOTuf7H3FAf/CQCg3v0vySEAd/9597/MnX/V/RcJAJ4CoPH/4Po/0fmXxH+RABgE8X/Y/a+VANAEPmAADAcdf9n9Hz1fNwEAVwBW/IJ/FML+fL1/rQpwUYv+66LfDwAMxv7p7+++RA/5eck9l52wT7hbj9XFz9rzTR37Zqfzx3X0sbr4GEJ9mYVz36gKQNKC3NbxjyrgbWGC7iQ7CDCN5CedGDA5+aHZ0AHA4v7ZjznF5y53BVMAfxm6FvDBtkQFfiMSAlhR/6ifTzqK32gGQKTn7yVr/8Ld/89segi4/2r932IN/PckW/fHo/9E+EPwH3P/D6roPxH/HSr6nwsB/7F1fy9K558eSf0Xr1/2ikT4E/o/cflB95+4/1T498Dof/X0vu6V+nTqvyD/a+4/jPxr3X/u+PMhAKP/z7D3APBPVgCGZ3yOPuv/M+p/2Ko/Bf7zvy8i/wL+54f9Bbr/o77oPxf3IuIvnX/fur8KdPPFAGAsJPY/poYCivTvj/vXiv7XeM0HAWX+elmTrwXEpusn9fy5PteItXrYg4OkIvxZHxjEce5bE6wO2Eb4sQYPyxo8IMCoCJgMDpyjPz+HBBhr/ZKM+gfW/o3/KBz81zv11879d5e7Qq7r/+O6X5Wi/4Hfo0euBUwgBYCZDEh6ywB2NSDugMHWyW80S4D8DWFKhIn/j35nzLt5NVv7J4T/LXeR1X/7dOd/vYD+Cff/adn9z/Huf0v7QZACUO5/CxwAbIBr/w5ra/9E/z/XxaL/RU7+Z84/7/4T8d99jEf/Sff/Na37D6n/YgAgwH8lrfMP+/6nQe+fC38h/qHzr1UAfPC/YSXmyyIFMCQAgDPBNX9DIvIvhgSzMvpf8ol8RfjXX5dDVv/JKsAIGACAuD8EAEL4nxwU1Oz/6+C/MOe/FgCwDIS/ZABo57IGBExrXV1aTr5pVD3p52MLfGzKv223H4vqjyXS04roY3X5owpsLMp/ViB/pmv8kqL8m3b73SCgOZz+KFUAzG0AWEK/1sn1T2vCXzAA/sPQ2V91Ss9d7qpxLdy2oj80BbBrRWJdfwzYn+nzTRkBcb8nrnDHYg6kxRSoe2qA/xZtu8P7QvffqLV/ovdPwX+PgwHAkyz6z49w/yn5v+Mg6P2zw6L/evw/B+L/YgCQqwp+OACA7n+x52UQ/X+V9/6P8QEA6P7L3v8J3v0n4l8I/5Oa+1+SxP/TSvTTw+L/xQG19o91/if16D+N/yvRX4Zr/+QAQKz9O8uj/7PA3VfR/0AiAAIARQpArv+b9bn/5+VdpACU06+o/2HRfzkkECwAHwiw5vo/IOrnTAFsqh39l699Z8mmy17rFrcW0DYyjzX4wF4faLt2EGt9n+2AYK7vzaLzb9rpx14faEv1T3NwEKfTbwoFrPd57PWBbiDQXIMCrDV/2FT/SO7/3eFr/woD04NO4bnLXXNcn9+1+v0LtrX9U/hawJWZSwLYRvuT+t6oAt+0OoD1fOxtBLXev3qHvvZP/O/q43/0VUr9v+nO77MUAB0A7PMWr+Xgv3Xc/V/HnH+6+k8MALj4bwHwP7IFoKX9EAcACuL/8wH3P8cPqwAcDqz9g73/goj/y+g/d/+r93zva7L3L06+93Xp/ot7Saz9A/H/khT+YvXfJOj+kxSAIv+XZe/f5/771/6J7v/wrBb/FwmA4lDt3r8Q/yVf778cSAKcV3cwBNCc/1CXH7wPY/+0MlBD9Ie4/rVTACzSX661BhC4/yWSCtiktgGIIcCy+99pSBQ+rpA2dejjCmIsRx+rI48d7c9qNN/0e7EceiwGQNzOfVbW9yWdBIja6Y/z+bmEu62T7wT9/KD9x+30Y7MCsLYE1AT/bXmnKvangmv/eib/+23jx3/BKTx3uateFWDPl3/XdC1g1gcDWFsAbNkESXX8sZ6PySa4ak9bqPt/3fa13k3r/pve+V+9j94D1P8ORv2n7j9Y+6f6/wcV+R9Q/1voCXb/6do/Iv43MvI/W/P3kqT/F2nvX5H/SQKACf9j0vVndzgAEOC/k9rKP3of8HX/B8/oxH95F+A/CP8D0f8hsPZveCbUyS9qx0/+h5sCwKpAEf8Hzn8t4n9wI0BI5B8kAPwVAFkFAHF/Jvx9HICx8Ph/8My1+s+XAIB34f6DtYCtyGsB0+7mxxX2SdP9ow4G0lrPZ5oAaObOfutXGw8LxKb7YzEAsr72D2uwgD1wcIOBK3P9n+kAICnBH1z7dyk0+p8fnP1fnbJzl7siAgEX7Fh5KsACQFgLmNUtAmlXDpJiGZgyAGzXLM41YFgw0Sb/9wMTAL9+7wMs+r/mUer+33wXJ/+vUeR/kgBokf3/A7r7367gfyQFQJz/vBgA8P5/C3D+hfvfIsS/cP9B9D9PDxkGMPc/xw8h/0PwH7lD6n9eDAF6T3LoHx8CwN4/6P6XfLF/Bv5j3X+57m9gyitW70U/+T9A/+fCf/is5v5Lwe8H/oGBQRHG/rn7L+9c8Jd83X9/BUBb8yeTAPqpBNz/EKc/JAVQ4qfsi/6rlX8X5nb+pct/MaT7z4YExPlfwhMAdAhw309R4XaYnXtb5x/LQcf+u7gCOunIfVKsgKx0/JdZUv1NnfdGR+6zKuCTovQnJeBNBb4bDDTW+cdy8OPA+5IQ+v5TIdH/zT8lTn/Q/e+bPDM+7r3HKTt3uSvi9ZGdq34zlAWwg6UAPrCXnSwMA+J08LGFOVZ0HlNwY3b6rWGAu3XhL85HHujlvf993i1rHqNDgMV3+df+geg/HACQ2P96DvzrVGv/WkT3H5D/ifvf0kmEP4j/d73IBgDdL2nd/7xc/8fi/1r0n/b/Wfefif9jQfCftvZPkf8L/ae0AUBJCn82CBAcgDD3Xw4DqOCfltA/4uwXJQSQC3q49s8X/fefIoQAQvE/x9FW/8kBgH787j95XRrVXf8KXPknfg5d+3dRGwbA1X/091Lk13L/megvh3X/x4IMADYMuOQtHb+cCvW+kWv9sgIjxOr4x60cJNnFT8P5N436Yz0n7aqBabKg0YOBuB38tGGAWHR/t94vm86+aQIgbsc/auUAKwFQ4Udf+3cuIP6J+58bnPpNp+jc5a6YKYBFO1d9PzAAeOD3vA8+2JYZ4Z/UgMA04t/o58cdNCS1HYD+vDcc/LdgW5v32eE/oQMAdojzv5/F/9dU7+vAAIBC/56S0f/F7U97i9c/DcB/ogbAe/+dzwHy//M09q/Af4dZ/F9C/6pnIyH/K/GfA+4/A/9V73T13zHm/vfytX/i3neCi//XpfsvxL8g/2vRf0D/J/fCAIHTTALxPwWgf9Oq9x/o/M+EivoiTQCE9/51139W/3vp8qsNAND5D9sIUBIr/3xdfy0BoEEAxRBA9f+pw++P/0ei/tfo+Yeu+rukRf/LARDgZVoDWMJfk7N0y09SifQnRee3ZQGE/T1GxB6ri2/6PY2i8md1jZ+tQLf9HlNhbvo9WUsA2Ar0Wt3/tFkAzvmfH7A/2/frCfykEgDl8Z+Egv9yfVOPubV/7nKXwfXhXasWhbIAJoIsgKiJAKzkgO26QCwWgOmAwNRhx34+lvMf9v0LdrYFoH/kfPSbm/WVf6L/v0aB/1qI87+ODwBoAkCs/QPU/85npPCn4L/2Z6v3Z73FnT7qP3H9N7DTQuF/YABA+/8vSfI/E/8vc9f/FUb9D7j/r9E6gAL/sQEAhf/1nVSDAEH9h8J/8AwV/dL5573/srb6T638o+/73H9F/z+rxf/97n8Y5V+wAeQwAMT+ZeR/DgZAgP4PI/6jvlWAciAAOv80EcCdfyn8z4cS//1xf8UFCPb+YQWgHDYU4GK/vAnA/0QSANQAxACgcjcBAr6LTq9Pyrk3jbBjOf+2EXpbWCHWgCDtxEDaNH7b5IAprC9qVSButQBrQNDoqL+t828b4Y/7fU7QNye93zY5EPf7sYV+7bV/Z2XfnxwxAMiPvLnIKTl3ucvwumbnqq+FsQCuylgKAMupT/r5SX3OtBqA/Xx59qyqsfbvK94XNv6dd9Odj2oJAAr+W/cD6v4vXifW/jHqf249c/2J+896/wcZ7Z8OApj7n9dW/j2nqP8g+q+7/0e07j+5E+hfvoucV/XVf0Tsdx+nkf+8XPt3QkX/e1+j4D/R/Rfivwi6/yXh+gviv2/ln1j7V+RHJgC4+C/S2P90CPxvVoP+BZz9UOI/WAvI3XzIAAhPAJz3isD9VwOAc4HIfyXE9VcpAX3tX8UH/GOd/4uBBEDJtwYw3PkP6f/XiP4v0eL/YgBwWasELN38I3S4XlLdfKx1f1gQPVM4ILaAT0uoJ/0M2yi/LWzPdgtAo6j9zQrtM4X4xWUJwPdtHHs3EEhH5KeVAGhUUsDkFO/+Yaj7X+yb+bpTcO5yl8X1+V2rf+nqbW0/C6QAtrO1gLUc/bjvZxUmaLtOEGtbgC2c0DbiH3eQcNVEePf/4/d/w7v5zjnc//VC/B/w8u2c+t/O3f92EP3vPMhYADQB8Cy/i+g/g//R7r8Q/11E/L9UfZ9sAHiJin8yCFDO/1FJ/c8D95+R/7n7L6j/vYr6nxdr/6T4P00P6f3T7v+ADv4rDPjo/2IAMADW//HoP1v9pyL/YfR/IugLwskfmpXk/6KAAvrSAOz3s9L9Vw7/bIjbH3T/9fdYv186/0D8l0aVu6/qARfA+/ogwA8CDF/5V2vt36WQdX9h0D+VAICdf+H8a6/vZj/XWwtoK4SxBgjY0fxav8OG3zXaeU8K9tdo5992TV/c59t29+MmBbAEuO332QrxWt8Z9/m23f04SQEnxrPPAoj7fty/wxLvtt9X2fqu19IXXPu3uHvyZ787fvGXnIJzl7ssr0U72m4PJADIz7va0CL/2IMBrGh+Wh39pKoDpp+zef5VD64IRP/J6w9t6/RuWvuP3PXfxyGAnPy/7gnu/D/l5WX3vyr81x2Q7n/Lek7+J9T/dg4BJO4/Jf4/q6/9484/GQLkNqjuv0gAkCFAHpD/CfQv1yXAfywBQNf/EdHPyf8FCv7Tqf9FEPln5H/W/Rfkf20Q0K8SAIV+nfxfGpyStP8yGAIUufuviP8zSsgT0R8g/8/y7j/7XAEMAmASoMCTA9L1Jz+HDAGKwzANcB5sB2Cv1Yo/dYdr/0rC9R85r4n8kr/vL96D4D8p8GsJ/zkSAdz9L42Bzv+Ycv4pHFA4/2NM9JdDhgCV8TesHHCsz6X9fNvoftJbArDWAGZF8GMLeWy6v2kCAPv5GAOHZqD71xLaGE4/xpYAd5pD4Jt+Lqpgr5UqwEoEhMH+4PvFscvh4L+B6a845eYudyFctz1y23sXbltxKYwH8MG9bZl09pstMYC91s828m86MKDd/+1tAeef/G/lN8Z3eTfd+X3v5tWM+n/L6keZ+F/7eHDtH4n+dwjy/9NU7EvqP+j/53n8v6WDC3/R/d+o3H8i+ls2sPV/kPovyP+Q+p/rEmv/XuUJAL72T0b/Ve+/CMB/Yu1foe9UEPzXf5o7/3AF4Bnl/HPivxgCFAdDwH/D8PVZvQJAhP4gEftzEf/hasBZufoP9v+p4B/RBwFlLfavBgHlUV30a26/P/pPnX+4AvC8L+Kv7nLtn68CoEf7L4YMBC75kgAXQ51/f+xfXwN4iQ4BZAKAn9atb6GtAUwK8mcL/cva820GFM3k4KfNAFj21WQgf6YMgqSrAWmL/bS6/7bQP1OR7wYEzb0GMM6aP9MBQVq9/8q9b3stvVNS9Ivuf0vv5OXbHvHe65Sbu9yFxQLYtSIXygLYsSLV6H+zVQiwBgmNfn7k9Ye79AGRGADc8O1h2vsnop8BAIn4J/f93uK1ivpP4X/rD8gNAIs5+Z+u+mtnq/4W02HAIZoCoOKfdP95CoAAAFuk8/8iGwBUj4j+09V/PPZP3X9aBXhZDQB4BUAK/h7e++9ha/+I8+93/6H4JyfffyoA/oOuP0sCsP5/kR6SAlBDAEj+l91/Lv6LEPIH1v5JZ5/H/8Pgf4UhAP6jnX8V/y/VEPslOhRQsL8Sd/9h7F9WA0b5ekDfZgAR95euvxgE1BD8UPSXAkDAi771f7roL9VY+1eGq//GdAZAmff/5QCAC38BA6zc84Y17A9LWNvS7bHX5GFXAuJ+b7MIfKwOv6nQxxL2WBH6uEmDtNf3mQp5rG6+7Vo+WyEf9XvdQKA5hb6J059EhD+26AeJgMLw+VD3v9g/lXeKzV3uQrzoWsCJlc+HrQX8wJ42NCHfKIFvCxFM+++xkwAo0MHq/79dvS3Y/V+4bZX3W31/RYX/zasB+O+ufVXB/4QU/yT6Tx1/mgIQzr8C/zHXXx0a/SfOf/tz0vlnwl+B/0jvn8X+mfsvwH9kCJDzuf+FHib+cxz8R9x/tvpPRf8F+E+4/0T45+nPPPrvX/kH0gAl2f/nwl/S/6dk9J9CAIcU9b9cY/VfkUf/C8Os018cnJFr//yr/1T0Hzj/NPKvu/9Q9LNBwHnfUCBk1d+oEvyVAACQJwGEqB8N1gAU/f8iHwhc5O+H9P5DnX9YBYCr/sDqv7FLGtxvCXf5yz73X0IA72b3JWAQ0BpxLaBtEsDvZKe1/g+LKWC6/s92wJDU32cl8o89WMCm79uu/8sKxC+qU2/a2cdmB2Ct/8MeMLiTjMDH+rwtzd8WGhg38h9Y+7f5rYDzT9f+9U+94Nb+uctdCVwLd/zeDRoDQCQBwFpAv4AXr21ZAGkxAtIaNKQFEzSFC5oMJK7eEXT+yetf+8ZWTv0X0D8e/V+zn1H/1z7JV/2x+D9d/0cGANz9J91/4vwTxz/XzsQ/2wLAe/+A/B9w/jey6D9x/1kC4Ajo/R+lK/9I7J/B/16h4p8mAGTvnyQAhPt/XA4A8nztHwX+gei/7Pz3cxggdf7FXaz9O8Oj/yIBoNb+0QoAEf48BcASACIJAGP/s6DfPwuEv54AIMOBArwD2n9ZOvyzMglQhPR/eYDzL4YCYU7/yHnZ+RcVgNKoAgKKO1z5VxrTEwA0ERAi8P2df/XzJS3yX96kJwDKoO9fqZECKIMVgHoCgA0D2HtvaGsBbTvwWFsAsBID2M+3TSCkQe3PYnIAm8Jfb/0fluMf17HPOp3fVGhHFdTYjn9cx94J++bu/JvC+mxZAGk7/rUGAy0DZzXhL05p6NINTqm5y12JpQBW/WlYFeCDu9saGs1POjlg69DH+V6M55g+33grwUNtodH/a757p/eFjr/jwD8B/2Pgv5b1T3C3/0kvJ6L/7U8B8v9BX/efJwEI8b9d9P6fo9F/0v8n4p/E/3OdgPwve//M/c91HWWxf+7+kwEAXfnXA9b+dR9j1P+e415OrP6D7n/v65z8LyoALPpPhD+J/xf8XX9I/ieHg/8k7G+Ag/9A1F85/vA9Luw53E+4/1r0nx4/C8C39g90/0u+vr+f+q9tBOCx/8roeVAD8CcBLmjU/1Dnfyw4CICv4Wdr9f+DA4FLalCwKUj/r8iOPwf8jV2SSQAY9xevhftf3vQGe796X7r5TWOhbbIdwES4J9WxT3ogkDbsr1nW9NkOCrDX9GFXA7Ia9U8qOZC0859UhN8NDLI9KKgn9OfT+r/S+I8Czj993Tv5F879d5e7ErxueLjr30Lhr60FnEOQ1/s56SRAo4YTWFsFTP8eY41glH+eBRNB6B85n7rvOyz6fyeg/t+1z7tlzePM/ScDACr+Qfd/vSL/i+j/YtL57xDd/0OM+s/Bf3QIQFMAIPpPoH8bXpQDAOr+dynqvxT/Xcz5z/O1fzT6333My/Puf56s/eth3X/m/J9g4h90/wX1v9QPoH90EKAGAMT9LwDwXxH0/4tiEACGAMzJn9FBgKLLr3X/dep/UbIA9Oh/gPofcmDcn9D/ixD6J5z/UUD/H/VT/wH9H3T7K3w4UBrzOf2jPPIPOv4i+h/s+s/h/IO4vwABlsZ06J+i/l/SKgHqXJaJgCXc9WfJgDfkzxUKBHy7IZR9U2fd9vm2zjoW1T/rVH5TwZ7U87Ep/6bdfiyqf9rRfps1fjaUfVsqP/bfu4Mr2pOi/ydF+W/UmYv+39I/HVz7R9z/8el/6xSau9yV8LVoR1t3WBWAAOBsBXuzbhPAdtxrue9JPd/Y+Sevd4dT/z/03Y3eTWu+x+L/vPu/eLVw/5nzT1f+8fi/oP7LtX807n9Q9f47RQ2ARf9znWIAwMS/oP7TlX9a9P8IPXDtX5E6/7z7z8F/dABAD1v9l+8R5H92WO9fRP/B2j8a+wfQP0n9P6NF/wn0ryzJ/5NU9JdB/L8kRP8wj/wP671/1vmfBeJ+Ntz5H4bwv1kJ/yvz+H/Q6fdH/s+ByL9vAMDf1yF/IAkgNgDwwYCqAIg+P4cAjkHn/6I2GBAivyQTAIoF4B8AlMOgfzwFUAYVgCVhGwAA/E+D/oEj36epgDe8JZvfNFrfVy8ZgBXZx1rjhz1YwBoQNDsMMKpwx1qzF5X+n1RloNmo/liDAtvvw6oMYA8I3MkG5M8W7ldrIBGXEZDE4GAuBkCp+n+D/c4/OYWBmV6nzNzlrhSuz+9a/f6rt694R9sGQAYB237P+8BDbZGcfdtEgG1CIOuDhqTXB6I9fy9Z+xdcD0mGAJ8ZfYjG/VX3n4H/gu7/AQ7/OyDhfwL8x7r+B/lha/9o5L/9WbD27wUA/zvMDoH+bVTgPyH+c5T6f5SS/0XnPwcGAMT9V93/17T4f57ce5njTxgAIvpf4o5/nvf/CxoEUKUAShz8B51/tvaPvx4Gsf8hUAXgXf8iIP9DYS96//6jwwCZ+C8Csr+4E7e/5O/+D0P3n78XoQJARfzI+SDVX64DBOkAsAWgJIn//tj/BZkCgLC/MnD7Zfx/k7rDrr9WARhTvX8h7Mub/IL/UujvKoIFsPUt6woAVuQda31e1uB5SQt6W9ieqUMft9Nv29U37dzbRvMblQTAcuixuvqmnfuo6/uSivC7wUBjIvxYjn7UCkCjkgB+h78e/I/8rrzlndC1f7meyXdX7/Le75SZu9yV0nXdztv/faAGwFMAYUK9UYK7WRMFaa0HNN0CIKP/O9u0yL84H/32Jk7738fvDAK4eA1z/4X4p+5/xwHa+6fgv46n2fF1/0X0P8/X/Unnv1NF/3M8+p/beFiP/m/kop8DAKn7TwYAXazzr9b+MfAfI/8f94l/kgJ4nQ8ATvIBwEkq9EuA9k/Ef2FQiP7TegqAOv2i+w8PiP+LBMAQSABw8V+U91ne659Vzv9wUPyzesCs+hvh/oeQ/8ua6NcHAiL6Xwaxf3iH8X8BB5Tv8eh/afSCrABA8r9/7V9oBWBOCOBFLf5f3uSL/ms/X5buvyL/6/F/yQQAAwHi/MtBQPW+dJwBATG7+UmtB8SG8mVhMNBM6/7SqgxgQQSTcvqvlBO3m49dIXAC3g0WTOj9UQV/IysChep/L4RF/4t9U7/rFJm73JXiRWAbC3esfF1UAGAV4IN72mIzAKImA0ydf9MhQFYHCNhbBOJ+jv7+oZVe2BBo4bY7vM/3/A2N/t+y5rHq4RsA7twnoX/U+Rfr/tYzBsDidSz+z2L+B2XkX51D/z97bx4k53GeeW5Itsfj2fWORRwkdYxka3zJlu2VRkB33dWkNhS7s7GxsQyiQdEnhaNx9t2NPgFQY4XGkk3h4AFS9sx41g6tJ+byjkfiTZDgTUAkwQtAo9HoEycp7k44HA7VVh5v5vtm5ldd9X35VR/IjMioo6u7SPsP8X2f5/k9lexOof5D7V/rTkn+l/T/1t3C+g/2/9xeyPtL9R+B/7D6n2PW/06w/evaP0b+F8P/29z6n1O1f2eU/R/Af6oBgA/84ASQ5H+p/gsGACL+s8to/4r0Lwd/qf6roV4O8ED0h8q/vEP9B0hgwXAAFIzhHqv/BWntF6+n1TKgCGR/tAhQDAA08CtHgGwAwAwAXPtnvi5aroBZ4gLgUYEa9H+s+tOrnQBtZhRgWBP/8WBfHjVek88sVErVy9+rPt5+8Gqqlve0svor5fuX60Af93NJafuN/N7tTRjg4w74y2kxkITq3+iA73uAjzvgh8XA8h/c61H64w7svgZ930uAWpl/rv4feL+S6Tpnwf9ae869F8B/4YSzBOfmw7/zOacL4P52bwP0crX6L8dawjTqBWt9bq2j9o/dX/qX30TU/0eV+t8CtX/bnxaZfzn4Y+u/yP6D8n+Cgv84/E8A/1pZ/h8N/yL7/0p1yH+FRwBM6j+3/3dq678g/gvwH1P/Ve1f9XW2G7L/QvnPcfr/u0r9h+E/Jx0A5PY7yP887z+B4H9I9a/eEiL9iyWAfM3r/rT6r+3/kzr7P4gr/zDxf0pGByLgf4MXbfo/WgYQLoAC/V1U0D8x+M+o12U13E9ry/8wqv8bxjV/M5byD88tpX+EvhaD/5yA/JH35OcMuF9J2f/nDfifVPfBCYAZABL8x5T/MmoFYEuANvmcLwG+/iNvvfe+aPy+vr/Z1v00FwO3p/D7vhYDacMI61H+fdYANmsxkJS6v1xggL7o/qHeb2Vm+psFA/S1GPCd6a93MZAbuEhUf7UI6Jn6tTCJhRPOUrkAjrb/tekA4C6AY81hAfge5Jej4p90MVCP1b9hxsDDm53q/8cPbat8aet/QYP/D7jyL8B/T4nKvw5M/gfl/7gY/jug+q86/Hc8z+F/mZ0S/Meo/zteJNn/rMr+i8E/s+c1Cf7T5P8sXwCckhwAvQAAFwAb+rndH9R/Sf1n6n9eWv2h9i/XI1wABa7+M8s/cgDI6r9i3xll+xcwwHOG9f+8zv8rxR/Z/1ULwAU1xOcV/X8KWfzN3P8UWQbkpWtADfTS+s+q/4oGC0Bb/6DeO6kAAIAASURBVKmqD4M/RADo+/SzUANYlkN/0WwDIC0As+TnWPEv1ogA2AsC6gAoG+R/rtgPzxHrv1D354jiXzIAgLoFQKr/yAXAbtvYQuW2A1caHnCXioq/XL5/pVv2fTsCkg7caQ/ovhT75RoJSHtAT4sFEJT/wAKIU8u3ElkApfGr9uDPsv89Z/8mqP/hhLOE5zPH7lmP2wDUIuBou3PQT0u5X+zvLzWLYLlEABJZ/nH2/+hmd+3f/iPC+r8FHABS/d/yOAH/cfr/juP8OVsAMPWfZf+Z9T8jh36h/LMGAID/MdX/Ran6o+y/XABkdgP5/1Wh+mP7P1L/s9XHfBej/78pq/5Y9d9pbvsX97RS/jkDgNT+CeWfgf+s2r/+s7wNIN+r1f+iVP8B/leUg39JZv4L8prwP7EEkAo+1P31Y8v/JIH8wRIgLy9Q/7mqj+B/psIPdX9imAdnwLQF/SOZ/n20/q+0T8P/9ECvrf7Y7g/Py8MzdKgnHICZ6IFfKf9zhPxPrP/DCPo3opcAGO4HywAx6M8R2n/ZGPrhtsGyYFQ6BMYWKl/++gexMvhxafxxP+/b8r9SqftpKfeNDty+lf+kFv64sMKVRO+vB9IXV/lPauFv9O+FgX7lDvtxavwaze7HdQCkzQIo1+kIwJ/L9U06FwBt+ybWhwksnHCW+Hz8/rvvddYCHtvsLfPfLKU+aeRguTkFfC8KRO2fm/r/mUM9lQ3VgZ/X/oH6L2v/9PAv1f8dx7X6v0PX/mXkAoDX/kHuny0CuPr/grD+73pJU/9l9j+3V5D/s7tF7R8m//MlQNcP+eCf3SvU/6yE//G6v06IAJzm9v9cD1T/scH/baL+57vfE+p/n0H9l7b/fN9ZVQEo6v6Q9b9PW/+5+j+ogX/FQQz/0wp/flA7ALD6j/P+uibQyP1L1V8M9rAEEC6AglH5B4O8eo1q/uA1fK5sKP6lfToGYFr8lfWfMABmSea/iD/bqPIP1H9jEcAV/2Fs/dePMPhjun+bagCQA/8I4gLIKEAJFgHAA+C1gJe8wPiSwu58f/+NepPW7yVdGCSF+C2VJb8ZC4EkVn7fdP+4CwLfdP+wEFjdDoC4g3tcxX8pbi0HQH5kQQ39OPuf6Z74epi8wglnGZxP/+nv/vTaI+1/Z7oA1h5htYDpWvwbHdjTjhCstPaBRpX/Nd/dXFnnoP6z935j4N/I4V/Y/1t4A8CjtWv/dgjyv4D/SfUfqv+qj7ldLwjw305s/RcLgMwusP4z5R/o/9r6z5R/AQE8ya3/eQX8E8M/t/13gvovh3++AND0f6H8v6eiALj2L4+s/1z5l4M/WP85+A/B/0q48g+Uf0z9RyDAIqn8u1DJ92tlHwb9PKoAzKMYADwvmjR/gwNQQNR/cAIA+E+xARD9H7cAKNs/RACU1X/aUfM3rSIAtPLPpv7jQb9tBOf756wawCKi/hcxCFBB/mgFYBtY/5X9X7MAhBNgQccBRuaR6r+g+QDS/s8XAGPV1ywKcPB6agN62sp7WrC/5Taw+xrcfSnyvhYQSQf0OE4BnwP4l1NS/uNm9xthBjRa3+fTKRCG5+Wd8Y+b3U+a7W9UsW/UKeAL6lfX37n3w0q2d8Ki/me6zv7dHd+++A/D5BVOOMvkfOL+r95lOgD46wfa6xqQF1P+47YB+P5csxcJy60lYN2DtvLP7i/80YHKhq99v7Lhnu9XNm55lCv//H6Nqv8c/rdDZ//B+i8y/yd07d/O5xX5nw//Oxn47yWl/ovh/1UF/4PsP6v8Yw4AqPzLQu5fqf+vi+o/Rv3vfpMP/3lp+8+S2j9h/SfZ/25Z+4cWAEWl/kMNoFb/S2r4n+Dqf4Gr/9IBgGv+ZARADP5TesBnyv+gHujzKPufN5wCtAZwSqn/Ban+C+v/lOUA0Kq/Qfs33ACK9I8cAAr2t09DAIvDCAQ4bC4CUP2fYf0ntP8RW/mPcgAQ6B+uARymHIAyqP6GA6DNaABok/Z+Qv5H2X94DcN/m1wIQC1g3BpA39b9leYISGuQT6roJ1Xg434uqXXfd7vAUkH9fEP4klL6fSj9PloCopwDYVGwMhcEvq37jTgI0sz817sIcH2uMDRP1H9wABT6LtwdJq5wwllGZ7wy/pH1R9pnXGC4NY9s9l7zlxY8cLUwAlK5D99lZf557d+h3618cde/q2xE1n+u/H+N1f4J8J9W/+FK8F8Htf7DIkBk/5nyL2r/MrvAAUCt/60q9y8XAMr2L9T/Alf+2QIAWf8Z9A/V/onqv7edtX+c/s8XAJIBAJl/pPxz1V8uAgq9mvwvMv/nZARgQoH/eCxAKf86CkCGeKjyw1A/5Qy4YFX/iXjAFKn9KzpUf+IIYLV/huIPij4M/QABVA4AIwIA9X/FIV0DSCz/wwj6h5R/HRGYtSCA7uy/zPaDA2DEfYHqD0N/m8r1YwbAnFX7BxEAUvuH6P9i6F+gDgBYBIwyIOC1ZaHYB+t+c7P/vqB/vhwAaWf1VwrMb6kWBvW6BeIO52GwX91tAEkXBs2k+6fRBgCLgPKBD3jtn5n9z3Sfm73jju99NExc4YSz3FgAD/x2ixUDqN4197fHXgDUywSIywxodHEQd9Hga7GwlAsKBnZ0Zf9/5RvfRrn/R+Xw77D+s0e5AGAAwCxk/4H8v/NEpbVDqP65XQz8J63/0v4PtX/a+s8G/1dE9h/U/73a9p9hLgCk/EPuXxD/36wUWO2fVP6zCvyHav848O8dkf3veU/b/mEB0PueHPpFGwCQ/2HwL6Dsv6b+ixgAWwCUsPVfwf0g2z9FrP159HNl/R8UdX/49/Ly9zD4Tz9OWdb/IrL/q2UADP1qyL+o4H8K9rdvmtT+aaL/tKX6Wy4AR+1fNPRPD/+g+hfRc1P5J/b/Ye0MKCPVH1v/MfG/jB7bRjULwGQAgPrPHQD8zvP3cC2gD+v9aloI+LLe+7LQN6qE+6Lr1/v5pLV8SQf5Rv990q7jSzJo+xzsfQ3kjToNwkJgZQzySSMBSZkAadP9F7PwN2r9j3IC5AdnLOgfu/n+ydYwaYUTzjI8rJJj/ZG7nsMRAOwCaMYAn1Tp98UgWG3sAAZ0dLk7PnFoZ2XDlr/R2f8tWv3ngz+p/TsuIYDHZfWfVv+F9V86AST4jzkAOPmfZ/5fRMO/qf4z6v9rcvA/xR/ZIiBr1v51vS7Bf1r9Z8+x9V+4AN5S1n++COgW5P9CrwD/scvp/31U/QcIYAEN/yVk+y8h+F8Bqf8aAoiAf8j6j10BBPI3YL62h/+SrAIsoYGfVgBOk1YAoP/D0K/q/nANIIL/QeZffdYY/HH1X3l41lgKzIrIQKT1f85yACjonxz+zfq/EqkARA6AUV39p6v+5pD1X6v9JTT0t6EIQHnMHQNgj7dVH2931ALWO6DfaBA/Xxl934p90u+P6wRIWveXdEHge8GQJs3fx2IhKX3flxMgrQVDuCs7GhAXBhh30G+2U6DWQqC0/7oa/rEDINMz8UKo/QsnnGV8bn3wtz/lcgGsPbrJCwsg7kIgabSgWcyA5boYWHek3bkA+PXxBw31H8B/jzvI/5L6T7L/z0no3wmd+eevn5fWf5n930mz/xl+tf1fqP+nhANAZv8Z9Z9Z/0H5zyr1n923KgWm+ssFAFb/Re3fO1L9R/b/vvdQ7d8ZRfwH6J+o/zuHHABI+Qf7v1H5Vxi01X/I/vMlQP+kZfcvRkD/8vJ3i/Jayr+q+UOPJO+PLP04/79P1/9B3p98Fln+i3IJYC4CikPa6s9+Rgf7GeNxVtb5GVfl+2ep9X/YHPznkRsAsv+IASCXAdgBoAZ/VP1Xcgz/TO1vG0MMAPVc3NvufX9FKPcrnQWQNAOfVPFP4/uTDORfXuVWft8ZfN+Kf6OKfRjsV/7AniSD71vxb3SAT2vgdw325QYdAJm+Kcv6z+5t/bOfChNWOOEs83Pz4fZHzFpAHgV4aHPi+r+4n0+7ZWCpB/Q0v3/dg271/zN/sg9R/x/V2f8tj3PlPwPKvyL/PyPU/w5U+9eBh39YACDrP9D/97xcyaHsPwz/uc7XuPrPwX/S/p9V1H9t/4cFQF4uACAGAOq/Gv57BPhP2P7fUcM/KP6Y/K8z/+AEOCsGfUn9Z8q/WgJw6r8Y/LH6z1kA0s5PlgB4yEewv8Kg7QgoSscADP5FU9E3ogBFkv1Hwz+o+CjTryIBSPHHcQB96SLARf0ntX9S/S/LZQAM/E7Ffxgp/kb+X9v753R1XwT1X+X/Ufa/TBwC80YLwLwa/k0OgF4AzIs7Lt+rPt6I2X/fdP20vt8XbDAthT6pEyDN7P9yXBbUO+g3a3GQloU/LAxurIx/FJwv7WiAb0W/0ShAcewyIf7D8J/rmfizMFmFE84KOJ/9810/u/bwph+TNgBeC9gem/If9Vnfyn5aSv5SswRiLz4iav/WH76r8lu9f4HU/x+I3P89j1Vatz1pZP8l+G/7swr8JxYAEvzHKv869AKA2/7VAkCr/2D9Z7l/5gDI7n5NXMj+S+U/J9V/Nvyz6r98lxz+OfxPgv9I7d9bCvzHav8K3e8S9b8gs/85GP5739PqP6r+07l/Sf2vXmX9R3Z/fc+LIR5R/3X1H6oArH42bywHCiT7T2n/QP/H1n7I/WMGQIEsCKbV4qCMHAB4EaCq/yDrT6IBGvhnUv/Lw3rwLzoq/2pn/8UCoIjs/0XTAYAXA8oBMM+XAwAFLKElgB7+YbCnyn+bHPxLSP0H2F/JsP6XlSNgQT0CEDBY9JNb5X0N+r6cAc2m/CfN9i8XpT+uVd4XzK9ZtXu+fz/clVHvlzblP66yv1Q1fotR/suui2r/aPb/3I+/Mn7mZ8NkFU44KyUK8MBdu5xRgAfb6xpwfdX31esM8P39zWYKpJb9v99t/f+nf/T1ygY2+N/zKFoAPOYA/zHr/3Fp/39W5P7B+t+BFgAw/AP4b9dLivzPh38M/jPJ/3uY4n9KkP/5o6j9w8q/oP6j2r8uAP+dVrV/OaP2j4P/2AKAWf+h5o8N//0w9GvlX9P+Ze1f/4R6FPA/WvsHy4DSIAX+icus/xj8B04B6gDIo9eE9m+Q/wuk9g+5AAYF6K+kcv+Y5m+o/bjqz8j+F1HOHwP/xCPK/ctoQBm5ANpGZmvAAFHmH6z/ZPifddD/DdK/tP5H1/6JnD98Ri0CYElgLQL0MqCMlP82vAgYn7dqAQPFv7FFgS9qf9xMv+/6wHp+zyc0cKVZ/+MuBhq11tf7/b7rA30tCMJdHVDAxT7vuz4wTWdA2YMzgNf+jSw4a/9yfef2hokqnHBW0Ck+Of4T649sfh8Gf+UEOLypcpOjFnAxJ0BSRX+xxUDSNoC43++7jcCXQ0HU/rmt/7ce/oPKF3f+Zzn8P6of2d3+ZKUF5/659f94Jcus/zvkAsAY/lslB4DU/u1+iTsBeP6fWP9f5cM/zf7r2j9h+wfrPxv+JfiPWf0V+M9U/99WtX9q+O9+jy8ACr2I/t+nFwB4+Afyvxr++SIA7P+C/F+UEYACzv0Pony/hP7lB3WlXxHT/wcvGK0AF9RniP0f1P9BSvy31P/Bi1TVR1V/RdkAUEKKvwYAItL/EGoCGJ5x0v9d1v96r8r6oxaAonqcJbn/Ehr+xet5w+pPrf/40Rz6FeSPD/7zhAFQRgwAZftHTQBt8vVtDiDgcrbCNzpIx1XoG1XSfSn6vij9vq39q22g96XQ+8rqx83cL7WFPywGmjO8xx3k4zoEfGf0m2X1X0zRb7QlwLylgz+qDvsTxP7Pb+e5D76w5ZWfDBNVOOGssPPph37vf3a6AB5oT9wC0OiiIK2BuxE2wUpjA6yLUP9/5eB9lQ1f+35lwz3fl9T/H7hr/yD3X73U+n+C2v93CvBfluf/QfV/Sav/u1Huny8AXpPqPxv6KfgvJ8F/ub1A/n9TWP87Jfm/G9n/DfCfyP6/q7L/hd73FPkf1/4VJflfRwBQ7V+fVv+VA2DQNfgbuX9l/zfAf+ozk5r2b/ACwP6PLf0mA6BgkP+Lhv1ff54yAFTNn6oHlBBAtAhw1v6hYd9cBBDY33Ct7D91AZi0f8wBwNA/6zoGf23/X9AQQAX+m6eKPwICtiH7vw0DpPf2ez+4YRX8tCj9cb/fN93fN33f98C/XK3/SxU1SHvhEAb4cBuFACZZOCw3qn+9Vv+o38vtm3Fm/wv9k18Jk1Q44azAw2sBD28+jYd/GCJvOhbPAVDvz+MwBXwuHtJqG4ir/Df687UPbSYQR/j/26fu2yty/4T8L+j/LXL4V+R/OfyzRYCu/UPqv4L+sdo/af3n5H9t/df2fzb4y+w/LABg+Jc3v1db/7PS+q/t/1HZf23/F4M/uADeFYM/yf3LoR/U/16q/hck+Z/D/+Aaqn9N6N+gzvzrn+llQZ40AUiHAAL/RZH/C0j9J+R/nO3H6r9yBUwj2r8c4qUjoAyLAbQEKNZyAeC6vyjKv2sBoDL+syj7P2vV/Sn1f2TeenSp/kT9x59BC4CS4QDA2X+s/uvHBdIM0Lb/8pLD7ZqV+U9LwW/W7zU6QMf9O83+ft+wvbSs+41a5X3/XqMDfNwBPywGVoYjwBelP60BfqmU/7ifq7UYKB5432n9z/acezvU/oUTzgo+txy5+1dcLoA197d7Geh9K/lpW+19Kfipfv93o2v/Pj/8Xb4AYPn/DaD8c/X/yUrrNhP8d5xT/1u4/f85vQCoDv+tO3T2P7tTZP9bZe2fgv+h7L+w/RvZ/72Q+49Q/xH1H6v/OZT9z0PtXw+A/7T6jxcABUn+B8Ufqv+KUPnXr6F/SvnH1n+s/iPrv678E0O9Uv8HTQcAAv6h6j9h+4fhf8pJ/8eZ/6JV/ScuH+hh+EfKP6kBhJo/FAdQlX+I/l9C5P9o+B+t/LPhf9T6Hwn9Qw0APNOPWQDI+k/Uf0L6RyBAo/avjK3/oy61X7gA2DKgzbkEYC6A95cl9X65LAaa/f1xFxW+IwdpwfqatRiIa/VPqxYw7ahB3JaAcAMM0EfUoJ73V8JiwPV7uQG79o9n/wcv/GqYoMIJZ4W7AG45uvnfm4MkXwIci88CMFsAGs32N/p7aUUM0oIKJokssIiGa/j/+T8eFcM/qP9bBPhv45bHqPKvqP/itsr8P1f+Zd4fOwDY8A8OgFZ+kfq/+2Vp/X8FWf9fk6o/2P9PVTKwAGCZ/y7tAFDkf7YI6H5Tgf+0+v+OsP8r8N+7Av7Hh/8zxhJAWv97zxL7fwHR/4X6P6EdALLyjyv/UP/HFwEU/McZAP1A/J8kToC8EQcgTgDT/g/Z/31TRt5f5PpJBMCo+ysa4D/tDpihLgCk9ttZf0ccQCn/0REAOvhT279F/R+mcYCyJP5Hgf9KpOoPWf4t5Z8uA7T6Px9B/rcdAG0w/I9f4pWA5fHLkUDA5VCn54vO75sFkBad31cWP+7fSYsFsNIs+76t+WkN6L4G+rAYWFmW/aQLgWazAJo12Neb/a/37xTHrlrqP7uZ7on/FNT/cMJZBeez3/29tU4WwNHkLIBGB/SkCr/v7/el/De68Ij87kfc1v+bj9xd+ULnXyHq/2PC9v81Vvv3FLf/K/gfZP9h+O/Qwz9T/rH6r2IAUPvnsP6zgb91t7b/C/CfUP/ZAiAjyf8M/JftfF2D/1juv5uq/9lOtgR4qzrEa/Cftv/T2j9l/ecXVf5V3y/2odo/E/oHSwCi+Bvq/6AG/6nHAUcEwHIASOq/UffnGvyxyl9wWf/VZ6Yt279W/mfQ4K+dAMwxUB6eiWQAAP0/Cv5XrhEBwJV/VhTAyPfDwsAa/JHy71T/R925fxj8NfSP2v8V9d9Q/YkDYBweL/FlwG0Hrqc+4NejSN+eonIfF6bnS/lPaqFPCiv0tSBoxmIgjQG/0YHbt/Kf1MIfd0ERhujVRe2Pq/wntfA3+vd81/v5WhzUVfeHfp7tnUR1f/p+ZXBubZicwglnlZyb7//qmDMK8FB73Wq8L6XeR7uAL2u+7+9PHDG4v50M/qr27xvfkMq/rv3byK3/j9m1f3IBoMB/YP3fgYb+Dhj88fAvHABq+Ff2/1cqrbsR+X/vSZ39t2r/UPUfWwCA+o9q/wD+l1fqv1b+1QKgDzL/Gv6H1f+CqvyD/D9W/yciiP+TtvoP9P9+M/uvwX95gxVQMMn/Dst/AQH/gPhPAYA680+Uf8MBQOr+HOp/qeYSwNUAMLO48m8M/MVhh/o/DLZ/wwkwGuEAMIj/OAJAlgMkBqDr/srECYBBgPOW7V8tAca1E+D2r/+oKZZ33w6AuAp73IVB0u/37RxotlNgpdbzpeUAiDu4N+ocCNT+cJNk/OM6BHwN+L6cAr4U/np+vzByiVj+IQKQ6Zo4ECamcMJZTS6A7+z6B+sOb/pbcwHAsuZrUoD4+bLyN/r9zbL4L9YyEGdBsTai9u/jhzoqX9r2/wj1fwsa/u95TCn/LP+vFwBS+d8uqP+C/A/Zf8YCeE7B/4D637oLlgBg/X9FXQz+U+r/XpH7F++fkrV/r/OhP8ep/2wBYFb+nebqf677bXm19T/X/a4Y9KXiTwCAfVj9F48Fov5PIAeAVv519Z+MAgzSyj9l+++nNn+z+k9l/wch929T/wH656z+c+X+jeEfRwDIc/K69qBfRNl/t/pfZw1ghPJvugAwALDkGP75zw31v4wq/0poEVBC2X9X9V/ZyP3De6VRx2fGETdALgLaZC2g70E+6SCclvPAV91fUgt/0gE9raz+coT9NSOj36jFP2mdX9zIQK2FQxiUV392v9HvSZLdXw6wv7SVf+v9ez+stHZPWNn/TOfZvy2On//pMDGFE84qO7ceuetOUJcXqwVsdkY/rehA3M8txfevdYD/2P9/fnX8qIT+PYrI/67sv7b/g/W/hS0BOnDmX9zWjucrrcj6z5T/FgT+y/Dh/1X+2LrrVVX7x6v/Ok8KHoAk/2eZ+t/1hrb+dwviv7L+G+o/WP8J/K/73Uq25z2L/J/rRZl/TP3vQ+o/If9PuMF/A7TyD6v/bLjP9U/yRYA5+Ocd2X81/EN1oGsJQJYBWP2nDgDlAuBOAaT2o8x/yUH05wuBYTf5X1v5Z8hjrQVAcWhOW/+HXeR/PfDr5/Mo/z9vLQFc6j9xAGDrf/V1cUSD//SAb3IAhOoPsQGi/o/bz8XvSheAUQt4exMG+UYVcV9W+KSfS2rdT7slICkscLUO8nGVet/W/bRbAsJd3XR/Xw6AxSB9vqz9aSv/9ToA6v1cbt+cpfyzm++f3BwmpXDCWYVnfHz8I+uPbrrgigLc9PDmRAO/79q/uAsDX5b/uAuDRr9f1/61O7P//+S+Hgr+k+R/Ufv3lLL+t8q8f2bHcVH71wHK/wme/xfZf13/x8B/GXaB/C+z/607mQMA1H9h++cOgN1iAaDJ/6f08I+Uf1L7hx0A0vaf4+R/yP0D+O89lPtH2f9+NuyL2j/sACiS2r9z2vYPTgCn9f+C5QCA4Z9C/iatvH+eNABIB4Cl7l+0av+c9H9L+b+oFgHU+j8TQf93OACGReYfE/9r5f91BeBcNPHfqAAkyr/BACBMALIIwEuABfIcK//AAyCKPmkCoOC/tvEFJ/G/DVv/x2gEgLsA6qgFjKvQpw3vS/r34w7ijQ7szYoc3L5Kb1yrf73KfqODeD2fa2ZWPywIgnPAB/QvakGw1FDAuIyAeqF/7JYOfFDJdJ2zqP/ZnrMXx8crHwmTUjjhrNLzift/+0v11AImdQD4XiSk/f1xnQFe4IkM/HfYsQCovvf5vn8th//HuP2fuwDuqT7f+oSw/ivlX2T/2SKghS0DSO5fLgCUE+B5Rf0X9v+XKfwPav+k+i8iAML6zx65+t95sjrki9o/gP/x7D+z/+99Q2X/c91v8QVAVj4q8B/P/FP7f06S/9UCoA9o/5IBwJ0ArAIQHAAG8X/gfCVffcyrwf+8yv1Dzp9b/NUCQNT+uTP+dv2fWhgMOoj/csDPD1wUSj52AUgnALxPFgAm8R/b/VELAAz/BXb3YdV/1oL/8Z8baj+GAtqLAAMAaC4ARnTun/2cuQWiiP/i92HwnyPqf3EYgf9QBWBplFr5S4YLAA//OB7QNm63APC/M3aJLgPGxXvs3nbwelMo/WkN1knp9ml9/1JZ75fjQiBJbZ6vGj3fToC4Fv64g3xarIBw04X4+crmJ63lSzrI1/t36/2cr8E+yhGwGPQP39zAtKX8s5sdPL8hTEjhhLOKD6v2WHek/RnnEqBOF4CPKECzogS+aP1JLf/45+bn1j1ILf+wAPiFbx2Q1H9s/X+UWP9bpfovoH9g/T+OFgDS9q+o/89z5b91x4v8ZozsP1P/2W2VSwBd+3dKZf+5+q+G/x9WMtwFIKz/fPBX1v83VfZfWf8B/Fe92e53FPgPaP+5Hmn770Oqf69D+WeDP7f+T1DrP4H9GfZ/ZOXPucB/gxcimAB6CVBE8L+CA/5ncwCmUQSAZv7ZZ7TdH96fUVEAnPuPAgFqNwB1AGj1f8Zp/RcLgVkK/uPDvVgCuMB/JvBPxQCk7V+R/0cc1H9T+VeW/3mi+LPn/H019CMHwPgCiQGAQ0AtBBwAwDbmABgzXAD/4kNvGX3fjoGk3x93QeGLKRC3/i8ty/5qsfz7cgzEbQtICg30NfCHe+MyAtKs//O9YPAF+4u7IIj6fHH8mrP2L9szcTzU/oUTzg1wPn7srk+4awE3eWkEqHfYbwZMMC5c0PdCIvL7j91FLP/w/4ubD/1e5Yu7/oOw/1eHfmAA4Nq/VoD+QQygOvi3bD/Oc/+89q9DK/8C/seUf5n7l9b/1p0vCdv/bpH9b90loH9M5ecuAO4AEHl/yP0z+F+Ggf/2nOL2f1D/eQSALQD2svq/N5H1/zSH/mVJ5Z8EAHa/K4d+Yf3P9Zzhr7kTAFwAvWerPz+LlP+J6vPq7cO2f6H2gwOgaOT/8zznD+R/bednDgBt+58Un+l3cACk8g/Z/4ID8sce+WcGo+B/0076v1D6ZzQHYB+t/nMr/1L9d9T/sc/Rgb8W/I8q/kW5BCgZ2X++EBjS2f/iEGYC6EGfqfzu/P+C+Jmh+qucPqoAdDkAylj5H6PQQGz5L41RBwB/PXpJvc+WAbcduJYahT+uYp/k+29fwu+Pq9gv9WCe1vf7zuynlcH3rfg3qtiHgT8M9j4V/0YV+6XI+sfJ7CdhALjU/2z1v21w3R8sAIrj058Ik1E44dwg55Yjdz3grgXc3LDV3rfyn2TwTvr9vloJ6m0ZWHfUnf3/5W98i6v/MPzr2r/HufJv2f+l9Z8vALD6vxMDAAX5nyv/fAHwYnXgf8mq/VPk/72vKfhfDpP/OzX1P8sv1P69ocB/AALUyr+4ebUAkLV/3aD+n9G1f/1A+6fZf1L7R8B/ogGAD/OmA2Bgkij/GPyX59GAyQjLP7X/q7o/E/w3aFr8p8ngD8+13Z+q/rTuj0YCXBWAUeA/Zf3HEMDI/L8N+yP5fyf1fx7l/w3wn3QDmIM/yf+PzFvgPwUANBYBtaj/OP+PYX9laf3HmX/7+SXx+9VH37WAiw26vmGDvrLzvhcHaVn4lzvsz3dNX9xogOufo1Z23/fiIM3sfxiwV240oFmLg7Qs/MsVDthIG0Bh9LKl/LMlQK534liYiMIJ5wY66//13f9o7eFNP7aWAEc2paL4p80USLtlIA1nAVu2WLWM1eH/k4d2VjZs/RsE/hO5f+4AYMP/tqcV/I9Q/7eD9f9E9flzOvO/87lKC3u+4wVp/39BKP8sBrATwH8vS+o/U/+lC6B6ofaPKf9sAZDhToBT3P4v4H8SANj5phj6eQzgzUqmS1b+yQVAltX+dYHqz+z/7/KbN6j/vAqwOuxzJwCC/wHsTzAAJij4z0H9zxtUf7b5Vg4A5gboM6n/k8Tur5wAEvqnlP/Bi3yJUNznrvoD6j9jASjHAHofBvyCvBj+V0JWfzbMq4F+SLMA9PuzdvXfMI4BzCIlf5a+HrZfm9T/wtCsFQOAQZ9n+Uds+B8e/tlnxOf0a9UEwKMAC4T6XxrFaj84AeYN6J+h/BuLAB0BuCRZAHr4Fy6ASzoWsP9KQwNuUpif79q7ZlH+kyrrvqj+K82iHxe2F+f706T8J832B6X/xqzxi6vsJ6Xy+/79tAZ5U6lPOuAv+vv3fljJ9Ew4sv/nflwcv/Tfh4konHButCjAg1/d7nQBPNieGgzQd0uAr+9Pqvwv9nesz1Wfr4uo/fvc6DFp/X9MK/+M+r/1cbEAgOGfPx7Xuf8dkvzPrP8sArBTPLZuPyGhfxL8t1Oo/wD+46q/fGzl+X9t/eeq/15h/c9J9R8WAFls/4fcP6j/0v4v4H86+w/2f8j+F3q1/Z9HANTwr7P/fPiXC4CizP4r6z9T/geQ6g/2/0Gp/A9OIfVf2/9B+c8b1H+S/5cxAUX2d9T+FRa1/FPrv6n+lzDwD0UAVDyA1Psh1R+9byr/yvI/Mlvb+o8f5aBv5f9h+Ldq/yT8b3ie5PrLSP0XC4EFFAtAmf1R2gCAAYAlkuvHVX80CqCXBRT416aU/0sqAgAOAHzNWkAflvlaf6eRxYHv709aO+irvi8tqv9qaQdIatmvd8BfbHHguz4wLARurJq/uM6AuIuBuEr+Uin79dD6k9T8mX8nPzTvrP3L9U3sDJNQOOHcgKc4Pv4T64+0X+FD/3fu1EuAw5s4mb4ZPIC0WgDiLhp8Z/2jXq990Fb/2f3Mn+wTef97vq+p/xL816LAfxoAmOl4mi8AWO6fWf953n/7cxr81yGp/ztF9r+Fq/7VR8j+75S5fzbw78Lgv5NS/T8plwAnZROAgP8x8B/Y//mwv1e4ALKdQv0H8J+w/QvrPxv4BQdA5P7zPZr8LzgAAP17Tw7/Z/ijAP6d4+o/DP/5vvOCATAgaf9y6Oe2/v5Jq8aPW/+5qq/V/1z/pP45UvxJGwAo/wPa7s9p/9INAEsADf+bli0BYP+nmX9wAkBcQN8Z6QgwM/3T1qCvn88S4B9+38r9jyDI35B+BPJ/0aH4Y+Wf/2xY5/75UK9iAHPE8k/UfgQALEvwH1sa8Edj8BfwPw36IwyAMar8l6A6kEP+NP1f3AUJ/rukHsH6X5afEe9fjm3dTxoBiJuRb1Z9XhoW/uU00CdV5OM6BBrN9CfN6sfN3C/1QB+WBMvbERDXIZA0ox83AtAsJ0AjdXzlGL8XxyFQOvijSqb7nEX9b+2auFocr/xEmITCCecGPbc+tPk2JxDwgfYlXQA0qx4wbgtAIjbBI5utzD+76w9/tfKb3X8hgX/Vu+UHlRa5AGjZ9iTJ/Qv6/3EF/2vlw/+zQvGH4X+niAEw+F+mQ5D/MztfEsr/jhel+g+5f2395wuA3QwCKFT/nAQACg4Atv6/we3+3P7PLf+nq8P/WwIECNl/af3Pdr1D6v+41R+r/4oDIAb/nAT/cfu/XADQ7P+EHvyR/V/VACqCP4L/Raj+pv1fKf/S/k/y/y7iP7L5Ywigaf0HKz99nCH2fzz0K8V/OJr8b+b8F7X6D5vkf9v+H5X/J49A/jdgf0rtl/Z+5gDANYFU/Tcz//Mq8w8DfpsJA8S0f0T9h/dKY9j6r6GAcBULYP9l4QI4+H6igd9XNn+p6vniLihuFEU+7cWC7wiBL4hgUPrD9bkoiOsEaHY9YLMy/Enp/o0sAHKDs07yf6Zv4vYwAYUTzg18WPXH+sN3nSIOAHkZof5j393M70pdBKS1QEgSOVh7f7tT/f/sN+8V1v97oPaP3ccqG7c+gbL/z4glAMv+7xD2f6b8t8Dwv12S/7fLwZ+p/ztE7r9lB9j+X1LZ/1ZZ+8ccAMz637rrVbkEEOA/3gaw9zVe+8fU/+weVvtXHf67gPr/Jlf/2SNT/7PS/p/lV1j/c1L1z0oGgK77e09l/bn1v1fY//PS/s8Gfkb+Zxes//k+of7z1zDw98vM/wCF/mE1Pydz/QWV8Z8kdn9wAOhlgXxfDvXC+k8ZAJz6P4AHf63w47w/sfcPGa/l5zRAcEa3AgzNSFaAHvoL+2bJaw3/0/T/oqP6z14MULs/PAcnANj8uUtgSAP/MAOgBM4AFAWg5H98F4jqj+v+xPviM4QFgCIBbcgFUBpdoJT/MUT5lxGAElH66fM2/Lp6b0e1gEkHb19KvK+s/lJ//2qr5Uuq/McdoNP6O3EH+LgDflgKrE64X73Kvy/oXtwBv9m1fvUO7PU4A8ox/k7xwPsW9I/dbPfE66H2L5xwwvnvPv7Qb/+ikwVwNNoF4Hsx4Av+t1QsgsWo/+oe22wp/+zeeuhrlX+2469V7R+z/28E9R/Z/gH8p6B/CPzHq/8U9f85RP6H7L+E/u16maj/vO5vzyuq9i/La/9O8QUAy/9neAzgh5L8zwb/18USQFL/mfrPnAC69k/D/7j63y1Uf6j+K0jYXw4AgBL8p2CAAP7rP6et/yT7LxcBUvlXmX9U+wdLgBw4AIi936D/Dxq2f0T+B+u/Wf0Hg38RE/8tFgDEBnQMoESq/4TyXyKkf0T+H0a2flL9N6thgLWI/1LVh8o+7AAoOlwALgdAcRgBAEc0/A/X/VHiP7L8IwYAUf3HzLo/2wnQFmH9BwdAaUwvAtrGdBQAswBUPMAY/HlNoHQBsHvbwWuJlf64Sr4vun6jkQPfWfwvL8FiIA6Mb6lhgGl8fxzLf5LFQK33g/IfFgNxogO+agCbpfzXq+zHdQA0mvGP+v1s/0Wn+l8anvmlMPmEE0443AVwy/3t/zewALAbYM2x9hWp9CddEKT1/WbtH9xfPnifAv+J6r9HufrPa/+2PY2WAOAAEIsApf5vB+v/CWn9f15cpvx3vKCt/zuF9T/Dyf9C/W+F2j9m++dRAGH557Z/HgH4YSW3RzoA9goHALf+M9u/bADIcDeAzv5z+B/Y/rsB/PeucAD0gQNAqv8S9scvwP+k8g9LAAEAPK8cAIr8T6j/k2qgB0Uf8v/U+j+pf47bAtQSAA38UvkvkhYA0/4/jaz/0/J9oerj/H9pyHYA8LtPRwGKxAEwTXgATNU3WwBs6v/M4tb/Ea30m9A/eF0e0Xl/eCQtAKMI/Ico/7AMwC0AJQP8h1sAQPnHir9uAaCVgG0q649o/8QBAABAOegD/G9sgVj/xWcuE0YA1AKmVT/XqNXed82d7+9frcp/XDr/YrV6jVrt03o/LRZAiATcGIN9XDhf3AG91sC/HJT/tFgAcd8n6v/4VUv5Zzffc/7fBfU/nHDCUeeX/9WOm5wsgCMrmwXga0EQtz2AvHfMzv6z55+8b29l4z2PKsV/o1wAsGUApf5D3R+m/wP1/4Sw/lcfReXfCV35x8B/HP6nwX9ZWfvXsktcDP8T1H9B/mfU/1wnqP+C+s8XAN1C+WdLAG755/b/t5T1n9P+WQRALgBU7V918M/2yLw/RAB6JPwPLwCk8l9kCwBJ+1fKP4sAqPy/WAQA/E8N9gz6ZzgAAPzHB36k+ueNuACn/nMOwJRN/jdqAKEFAOB/MNTb0D+xFCiixYCi/xMHgBj8C1L5J+R/OfQrqz9S/fVSwM0A0HdO/lwDAGnefw45BDT5Hy8DSsM4/z+nbP4w9IsFwYKy/pcA/oeea0V/3rL9C0fAvLL+4yaAMo4AkKw/WgaM4hYAbfc3YwGcA8BfX660HbiSqAYwqYU+LvzP94JgJQ/0PhX5RpX7pBb6pM6DtL4/1PvdmMp93L8b18IfF/63XAj+9dL7XT8vx1D+6/n72d7zTvW/bXD6pjDxhBNOOOTccuSuIdMBwF0AD7UvWxZAWgsBX9+v3n/krsraI5uc2f9fH3yEq/8bufovAIDc+r/1SbUAIMo/p/5L9X/7s7LyT6j/rXIZQKz/bAnAh39Z+7dLqv+7Ze5/Jwz/cgGwR9T/ZTpP8ihAZo9YAAjyvwD/ZfeK7L+q/FPZfwn+k9n/vLT957qF6p9X9n+p/vdoB0ABOAC9uvqPLwJ69eDPlwGDKPM/iHL/kP0f1IN9fsBd+5dHDADhABADPzwHdZ+/N2gD/mDYp0BA9JrU/V3Utn8J/FPK/74ZxQZgn+EKv2MRUHC0AOgFwWz9tX8jiPzvoP9jB0BZDvtA/C8NRyj+SPkXn4kG/wHcrziCmwCE5Z+R+oXyP49o//TywX5MZ//bxqjlX0MAEfAPZf7b8OCPnABt+y9Vbrv3fW/Kf1zF3fdA3qxB/curFOJnDrm+rf1x6f5JB/pww01T4U9q7V8qp0BaVv64bQBxHQGF4QVn7V+mZ2IkTDrhhBOOdT73vTt+at3h9v9mDam8FrAxFsByXxjEhf3FXTSse8Bt/f/5b4/K2r8foOH/scoGVPsnlH8x+LMFQCur/JPVf2LgBwcAPBfDv1b/pf1/l8z/S/t/6y5q/QfyP1j/s9L+z4b/rKz9g9y/AP+d5pV/2S6A/sncv8z+c/Bft2YAsOw/U//5IgDI/1L5Zy6AXO8ZZf9n1n+h/uvsf7Ffq/4K/NdPlf8CKP/9Uv3v0/n//IAB/htw1P7JgV8o/xed1P+ig/qv6/8uIos/jQKIAR8BApUDgFr9IRKglX9d7SfaALD9f1Y5Ayzl34oCzOnXZuYfwwCHUL0fuTb9HxYBlvI/rPP/xZEFxQQw6/90zn9eLQfgZ23jdvZfMwAuqTiA4AFcUvR/8Vzn/zH9nw38JQUGvCwXAuJ5efyKAgI2ms1Pa0D3ndVvFuxvucH7fA3uvqz89f4dX8q7L6dAuMEBEEf5d31/EqfAclD9kyj1cR0EdcH/7v2w0to9YSn/rV3n/ttXvnPmH4RJJ5xwwnGejx+56/8k6j84AoxaQN8DfrOggr7o/g19T4T1f/3huytf6PwrlP2Xyj+v/XsKkf9R7Z8EALZsF+q/gv3tFLZ/U/1v4eA/iABo638rz/5r638Gav8Y8K9TLAGU+s+s/3sl+K/rTb4AyLIlQKfkAHTr7D+2/TP1X3AA3lO1fzD4A/2/IGv/8r1iCQCDP18CgOpfvcIFcB5l/s/bDgCp5ucGpmT2ny0Cprjt36z/y/XbCwD2Hgz+fLDny4ApZfPn4D8LAjitOABq6Jfvl4Yo6d90ADD1H1cBgsIvsv7TGgA4hLP/iP6v2ACzKCrgigBI1V8N+7NK/SfK/xByAgxh9d+o+BvV9H+zBlDZ/mWWvwhuAJzrN55r2v+8Gvy1a0AvBVS9H6j8o6D0y+y/svkvaIUfoH8y+08dAJf58N/GXQCX+RLg9oPXvVj3G3UKNEv5X64Df1qDvC+6f9Iavrg1f76+33e7QLirYxng04rfiFOgGcp/I3/H9yCf9HONtAOYn8/tm7OUf3azvRN3hAknnHDCiTzj4+MfWXv4zgmXVf2mhzc3bYBfLVGD2rV/35Tq//crG7Zo9X/j1seN7P/TMvv/THXAF7l/q/Zvh4QAqtq/F6Xl/0VV+4fBfxk5/PNHRv3fDXZ/kf3P7TklqwBfVwuA7F5R/ZeX8D+2BADyP1P/6fD/rgT/ieEflH9h+8fK/3sy839WDf7CATCBroT/9YsFQBEcAKj2D1v+1e3Hln8KBiSLgH4BCSximz/O+e/TS4CClf2nrzXdHz3umyb5f1wTqGr/hmd0BABT/1ETQGGIKv/AAoiG/qGsPzgFrMHf4AAM4ez/nKr7K2EmwKir9m+B1P5Z1v8RXf1XGsX2/nm1BGgbM90BC1YUgA/7KAJQy/pvRgB0/l8O/vtF/r+MGgHY69u+/qPYA/pSK/Y36k0C7/OxcEgK/fOVvQ8DfbhL4RBoFPrXrGjASoH+Jf0c3NKBDyqtnecs9T/TdW5yfLzykTDhhBNOODXPJx+4+4uWA4A9v39xFkDakYDltmhY1FGA1H98b/3O9sqGbf9Vwv7A/v9oZeM9zPr/lKr9a5X2f6j8I9b/7c8R5R+T/wn4bwddALTu0oN/ZpdcAMjsf0ZyAPKdYP0X2f8cp/6L3D8b/IX1/02R/e8R2X9+Ze0fBv/p4V8uAnrPSOCfyP8L+78E//UC/G9COgAo9V/Y+MUCoIAUfQX5k9C/HAYCqqz/pAQBIlYAes2GflD+AfyHqf/q9QDlAWgb/zRqAqARAA3/m1GKv2YBuLP94vUsgf5R2B9W/6ni74T/OcB/2vIvhvsiWgDA0A/QPxP2h5V/cArwAR/s/yOY9q9fg9KPrf/6Lij4Hx7825S9HzcByAUAAvyB/R8/LxvDv7b+X1ZRgLK8Jb4cuFr3oJ1Wxj/t719uA3rag35SJb7ZdP1Gavl8RgLCvTEy/HGdAb7q9xq1/i8l3b+cwqDfqNJf7+eiav+KfVNfDJNNOOGEs+hhFSHrj9z1hGtwZQOtj4F8ObID0oAIrjvizv7/6v6jhvX/B5UWrv4/QcB/2e3PKNt/63ZU+8cGflD/O2QMQDoAePWfcgCI7D+H/+1+hcD/tPov6/449E+o/xnuAGCD/xsc/Mey/7AAgOc899+ls/8c+AcLAFn7V1DQPwT/k7R/FgOACICy/vOBX4P/eO5f2v1h8MfWfwXx41b96vA/oAd6+Kyy/g8aTgAF/7ugHAD8tQH8M9V+GPrFQmCa1AJqtf+iyv1jV4CG/4nBX0UApIW/gJYAdBEwg7L+MxYDwO0EkER/afsn8D+j/k+zAGTVH14EwB2eU7A/bPmH7H8Z6v2GtfpfRoM9G+iLI3QRIHL+gvTPn+OqQGPwL49i5f8Sov9fMtoALqk6wLKy/ZvOgMtK/ectAOAAkO/fdu8Hiaz8vgb5pAP+SqnfS0rfXy7fH9cJ4Isp0OxFQrg37qLAZ/2fLyt/s2F/ZU8LgjjQP/N1afyaI/d/tvrfaGefCrV/4YQTTv0ugEd+/1bsAFBOgKObYg3w9Q72zVoMNKM1YM2Dbuv/p+7rFcP/PT9ADoBHuf1fD/9wjysHQAuu/VPWf7YIkNn/jheq93lU+fcSh/4R9Z8tAfbI7P9uyP4L1Z89tu4VUQBR+fcGh//x7D9/LjL/rAUgIwd/uBz+1w3qv3YA5ED9B+VfXREDAAeAUv+5A+C8HvylAwBq/goDqAWgHy0AlPUfHAB40J/Ujwb0L98/pbL/hX0XIx0AdCkwrRgAAABUVv9BTP/H782gn2kXAM7+48y/6QDQC4FZVAloOgHQAmAEwwA17V8N/cOzFvSvPKyz/2U09BcJA2BOtwAML6AFwDyq+3M4AAzlXwEARxcIHwAWB23jyAEwZjAAkOUfAIAw2GPV31T+cQtA2/hl6gAY1w4A/nz/lVQH6qUezFf6YiBpBj6p4p90II/rAPA1qIeBPwz2cbL4cf9eUsfAUi0A4ir6ceB+5QQtAOxmeied6n+mb+rWMNGEE044DZ2bD20+5K4F3GwN5EttzV920YDqP8u6w/YCYN3hzZXP9/0bov6r7P+2J4zaP3FbpPrfukPX/sHwr1R/Dv8zqP877ew/r/1DEQCu+O8Vw3+GP8fUfxj+Re4/x8B/0hEA9H8O/pPUfwH8e4eT/3MG9T+r8v9nVNVfXl6m/kPlX4FY/+Xwr+j/k9XBfBLVAGKInxz8XdR/sPwjx4BiAQzKYX9AD/6m6l9AEQBQ+XUNoLb+k5z/UBQEEAH/9pn0f/x81sr+a9VfQwDB/l8cppZ/i/oPA/8QdQGUZOUffl6GVoDhOaL8l1DdX3F4nmT+S8r6r0n/mPpfRFEAvQwwmwBo5r9M6v+kyj+6QEF/Cvan1X9K/Uevx3TtXxmG/vHLCgJInQBXKm0eawGbPbB/eYVa/NP+fl+wwbQU+qSLhzDgh8F/KWsB07LwL3f6f61Bv9yE+r/C6GVL+efqf8+5I2GSCSeccBo+tz645WfWHm7/e6sV4PCdkbWAUQN5owsD306ARn8v6UKBtSa41P9f+NYBQ/mX6v8WAf5r3Qa1f0+TBQC/UPmnrP8ndAVgh6j9a2GPnP7/kqb+8/o/Y/jfJRwAWQ79Y8P/a7z2jw3+OZn7z0gGALf7dwnqf5ar/28q5R/AfzD8CwDge1r9B+u/K/svb6EPqP/nVOUfH/z7ZNa//7yi/ruq/1Tun9P/p+zBf1A7AgoYEKgiADr7z4B/nPIveQBFQv0Xgz+o//lB6gKARYGy+g+6rf9Q9SeGe1r9B3EATP3H0D8721/H4F99XRjS6n/REQUA5b8k4X84519SzoF53QyAqv6U7d8Y/CnwT/wcBn6c+y8j5V8vALAjABwAl0jln+kCINZ/uRwA63+JtALYSwDlApALAHACQC1gMwf3L68ii35Sq7yvQb+egdnH4O6b8h9uGOjjDPpxlf20nQC+sv++BnZfrQBpUf7ruvd+WMn0nLft/53n/v7LPfP/KEwy4YQTTqzziQfv3uKsBXxwc6JBfrW1CUTV/uF786E/qHxx938U1H+k/G/gtX9PGvb/Z5T9v0Wq/62Q/Qfq/3ZU+7fzheqjrPwD+79U/1u5+v+ys/aPOwD44H9SvGbZ/72nhAug83Vu9xcAwNOi8q9T2/+x+s+H/x4UAWB0f0z+78W1f2dV7R/L/Rf6z5HcP6/96xP0f4D/qfo/iAIMilx/Tl4Y6nN9kwoAmMPWfxj4B7X1ny0L+IAPqj8o/wNTlvKv6f848+9Q+Ieo/R+s/7r2b4bU/vHPDtsuAHAAUHs/LAxmCfzPRf8nMEBH5p8/l7V/iviPoH+K+j9q0v6p5Z9cDPoz1H7MAdDWf80AwLn/MqkIXFD5fj3Am6+p2k+dAJeRU+Cysv/r7P8lRf8Xy4Ar+nH/lcptB6/fkNC+pV48JI0CJM30+64PTLoQWGpoYLg31uLBV83fSqP6N2LZ9wH3S8oIYDc/tOCs/cv0nN8aJphwwgkn9rnje3d8dP2R9stmFGDNoTsrH3uk3Rrc610IJHUE+GYN+Fw6ME6CawHwS3/4R0bt36NS/dfWf1gAMPBfpuNpTf3f/myE+g/kf6D+v+gY/iX4D9P/YQEgrf96+P8hV/95/p/n/t8Q4D9p+dfZ/9NS/Yfqv3eF9V+S/wsS/Mcs/1le9XdG1v5p8n+ekP+R5b/vvBz+J5XyX8DqPyj8MPgD/K8PDf0S/Jcjg/+Uqv0ToMCLVP23sv5a+Vc/GzAU/6Fp3QTgqPoD5b+Ehv4CigCofD8Z/mdQNCBK+Z9xwP/myNDP3i8g+j8b9guKCaBt/0r9l8M/JvybVn/KA9CDv3YEgO1/XmX7iyMLDmVfLwHMoR/q/sq47s9gAYALwGn/J9GAS6jm7xIB/1m5f/leiTgBrpBawOWe0felkPvK4Metw/OV1W+U0r9U9X1hUA83CZ3fdx1f1O80q74v7mLAl0KfVNGvNwKQ1AlQOvij6uBv1/61dp+9csf3Kh8NE0w44YST6Hz8wc0lFwuA2dzrHdSXStlv9vcyPoJr+P/EoZ3VYf/7FvhvgwX+c9f+CfK/rP3bKR0AkPvvENn/FlgCSAaAov7z6j9a/8dr//a+pqr/crL2T9j+3xDWf07/Py2q/6T6n0W1f3z4d9T+mdb/rLT851H2X9X+saG/F9X+SRdAHmz/2Ppv0vwR8I/b/5mqTzL/1O5PKwEvENifeJxyZv+LAAccnJZOgGm1JDBhf6oGcGjGAQI0Bn815E8T2r8C/w1Btl8vAkD5j6L/O9837f7oQt2fgv4N2dl/cxHAh/Vhnfsvotq/IlL/FcRvREcAIPtfMhoCzNo/Yv8H67+k/bcRCKBd98ejAJjqDy4AY/AvG9n/8n4NAFSP1ctqAYOCn47VP226f60B38fCwQd9Pyj44aYVHVhM0U8aIfBF72+W9T9u/V9bwsVCUudA1O/nBmec4L/WnslymFzCCSecxIdViNx8ePOrJAIgB9uPHWuPVPTjMAHisgOSRhGiftbQAuGRuyprj7jV/18bPaaH/y3a+m/W/nH1n9P+n6HD/3ZD/eePz2vq/46XLOu/HvxfUbV/2d0nJfEfwH+v8do/vhDYA+r/69oB0Cmr/jpPo+z/aUn9f5tn/7NK/cfEfwr947n/nveU/b9AqP/UAcA5AEr1P49Uf2rlz0uFnyv/fcL+r63/8FwP/rl+3ACA1H9084NyCSBt//lBPfxj9R9HAAr7pikAcJ9mAGD7PwH/YfUfhn5L/deDfsEg/zut/vjRMewXhmal5d9U//UVdH9gAcwTFoAa9E3q/7Cm/+PHomH/1y0A7mEfD/261s8c9Beo5X/0kqX+ExcAsv+XxuwIQEktA65o9Z88XpEugPdvqMHdF1zP1wCd9u81OmjHHcQbXQyERUAY6ONk/htdDDQ6kMcd2NO0/Keh4MfN8vv+Pdct7r/upv53nzsZav/CCSccb+cTR776WScL4Gh7qgp8WrWCaTgLGBfBNfx/5o/3WeA/vgDY8phl/bfAf2D9B9gfU/6rt4UN/5z6/zyH/7HBn4H/WNafX0X+x9Z/Bv8Tij+v/uPU/1PyQu2fBP91vims/51S+cfZfzb4y+Efg/949l9Z/xH5nyv+ehmghv8+AP9J+j/U/vU7rP/S9s+t/IN6oAcAYH7AaAUw1H66DECqv4QAiqy/7QDAkD+2ACgiFoAY9C+S2j/+OKQfcf0f2P8VMwAP+mbtn2H9h+fRiv+cxQGwHQCzBv1fDvtG7R95NOz/ZYD8DVMIoGnh18q/zQLA1X9loxrQ7QDALgAK/cPUfwAAMqu/yv/DsE+gf7AkQE0AygFwxXYBjFMXwHIe2H3T+dNeDDT7++MuKuJEDkItX7jLfTHgK+Nfb+TA12IgrtXfl4Og0e/3tRjAN1v97xjXAiDfe/GfhoklnHDC8eoCWH/orv/LYgFUn9/00KbYmX5f7QC+BvnYf/9h9/C//vDdld/s/kuj9u9RB/hP2P4zsgnAUv93gOoPuX+w/8vMv3IBYPX/VVX9lwXbv1T+uf1/70mt/O/5oQL/ceo/H/pPcwggU/yh9k/T/0XdHyj/yvqPwX8q78+Ufw0AhMo/kv9XAMAJrfqj+j+xEMCDPbL/96FGgH5d9ZczlH8FABy4QDL/NtH/oqL9QyWgcgGg/H+BKP66BpA4AJDtv4SG/oKy+1MngJ37Ry0AQyYLwFT+EQfAofyri5YAJcsJMK+cAEUEASwOLxgtAAvaHTCMFH8MAxzVPAA85PPH0flo9X9UD/o647+gAIDYCaCV/8uRHACu/MOQP4aI/2MY+keH/5JU/8vqUQMBV1OdXlpQvaQsAF/1e43C9NKq2fP9/eHemIN9Ujhfo5Z93xb/5QT9K3uo32v0fV8sgMLYFbf63zXxl0H9DyeccLyfT/3b7T/nZAEcaV90oG+UBRC3PWAxx0BqTICjm+z/u1TvZ7/5L6rD/6Nq6OfP72HW/8cjqP9P6+w/DP8d2PYvFgCc/M+Gfpn/B+s/3Iwc/jn8j6j/AvzXquB/p8Tw34mq/zoF+C/L4X9vyOz/W0T9z3PVH5YA72r7vwT/8ecS+pcnUYCzSvlXg3/vBHIA2Ll/cALA8M4He17Td0Hl/nO4FrDf7QBQ6j8M/zICkDey/trqb1f86UEf6v4uKhcAtvwD9K9oZv5hITCEM/8zigEAAz9eCOjsvx7+yyOmE0DD/wpDGvqnHQBU/S8C8E8uDMoI+ld0qP8i+79gOAEWyOBPbP+oBrA0itT/Mc0BwEuAtjEE/RvVsD/KANBDf5tsARCsAUr81+r/JZLzL4876v+Q3V+/vkJ5APv1EgBqAdOG9C21IyAten7S748L64tb4+fr874H/bAYWN3KvS96f6M0/qS1f0tF98cDcxy6flLlP2mdX6Ofz/ZOWtR/dv+XgQs/FyaVcMIJJ5Wz/kj7gIsFsOah9kUt+3EcAHGdAr4dALW+b01E7d8th7ZU/tn2/6xy/0T9J9b/Z5D1/1ml/AP4zzn8k8H/JUv9jwL/cfWfLQA4AFBQ/9XtBPCfGP6zXdT6n5XDPwb/Yeo/g/5lLes/LAEAAEiVf6j8g9o/GPhxDCBvqPo5nP2Xg79YDkyiQR+/rwf//KBB/h9w2/6d2X8E+iOkf6nu84WAUf2nVH/cADCEmgAQ+A8vBMAB4G4AmLWUf7EgQE4AVPsHw38J0/+H7Mo/bPu3s//4vQUSAVCUf1D8RxYI6R/X/pXII10CkPgAyf4jtX/UrvrDTAAC/SPgv0sO9f8yqfxTtn/5nukAYI9tB68ta8t/3L+dtNfeV91f3Ix/3H/+tKn9YVAP18eCoFGFP+nCwJeFf7nV/MXN/DcK8Yur+NdzC9X/fXWq/z3nB8OEEk444aR2Pve9O35q3eH2/xcWAOryWsDNTbf4NzqwpxEhWHPEVv7Z/01+6cB3pPUfDf9M/d8i1f9tdPgn2X+l/j8nif/Pafv/DgH+awEAIAb/yeq/VlD+d9Hsf1Zm/7N7T3H1X+T9Bf0/I8n/zOrPGQBdb1QHfEb9l+p/z9vC8t8llf8uTf7Pw+DfIx0AOAKA6P9a/T8nlP8+of4L5X+SkP8L6OaR+p9T9v8pav03HQCG+l8whn6i/CPVH1f/FSUMEA/9ehlwUdv8Bw0AIF4EoOw/Hfqp5V+R/yMy/07FHz6Phn+o/nM1AJRA4R8G5R+ggJoBgB0AEAEojeCqP2n/R9T/IlH85x3q/4JB/9dNAS7lH6r/MAxQU/7txYAa9jHx31L87fo/0RZwRbsA9uvBH/L/sACA1/XUAibNrqeVkV+K7/cRMUgLvhfXKeBr4EsLNhjujeEAiDuIN5rpT2ugT/r34g7icZgB5QQDfVyngPlzUfs3YVP/O8/9f3eMV34qTCjhhBNOqufWo1/936NqAeMq6o1GB+L+XV/KP7wfpf5/8r5OZfeHCIAg/7tq/57m2f+WbYj8z+F/J4wFAFL+2eNOl/VfqP8tGPyH1P8MH/5PyuFfKP8Zmf3PSvU/1ykz/7L2T2T/GfQPwH9A/X/XIP+fkUuAM5L0fwap/2cQ9V/a/pX6f16o//2TCPwXof6rAX+KD/25fpv8j2GAuX6d+c9Lun9xEDkAUP4/76r9kxe/dsH/zMFf/GyG1v5BA8AwsvcPUas/yfyjz0S5AAD+V8RDP8r8Ex6AGvjnZeZ/npD/ge4vogBzTvVfvQaln5D/51EFoLb7m0sAgP1Z6v+YA/w3esnI/ttOAEL+J7V/oPgj9X+MUv7Lhv2fLAHA+r//CnEJpAEETGuQT6roJ1Xg434uqXU/7ZaApCyCMAyHm6YVP+nn0lL+4wz85RQggHFhfHH/biN/v9YiITc4G0H+n/w/wmQSTjjhpH7Gx8c/svbwprOWC4ABAR/enAj6l3RhUA8jwBt7ANX+mQuRzw/8qUH+fzSy9k9k/59Ryr+w/sPwf0I/B/DfDrD/2+q/sv8r9f81tQBQ4L+9jto/Sf7n1v9O0/ovsv9c+e96mywALPW/V2f9xdDPIgBU+S8YtX95Bf4DF8AkZQCAso+Uf7v2DxT/SSvzLyCANPtv1f65rP8GA4AP/UPT0hVAa/9M+B+pBIT8vzHsY9XfJP9HWf9r1//NOuv/8BLABAAWjQgAHvJLRv0fDPw8+4/gf5T4P68YAJr4T+n/ZgVg2SL+LxhK/yX3+3j4H79swf9oBMCw/uNFABrwldqvoID4PfaZq/xzt937/rKy+jcD3pfk78cdxOv5nM8oQbMdAOGG68MhkBT6l1Y0YCkYAG0JGABxB3ufdP+oWzrwAVP6XbV/E+PjlY+EySSccMJpyvn4Q5t/02wD4AuAo5si1fs4C4B6mQBxowdJ/nmY48Fl/f/0t0Y1+E9m/zcy6//XHq9s3P4Usv7r4V8sAJ6h5H+o/ZMQQKH+Py+t/0b2n+T+X9bZ/11I/d8DzzX4Lyut/wr856j947n/bqT+KwbAu7b6bywAwP5fIMT/c9QBoNR7pPwPGIP8gOkAEIO/mf2PtP8PXKT5f+wAGHDk/fECYN+0HQEYRHV+SP0n9n+D7g+LAOs9R+6/lupvLQRGMPF/zmH714sAAP/ZxH8Y9ikHQOX91SO1/mPLPyX/o2WAUf2n7f/zEXl/RPzHQz+o/qMLNYn/OgpQY+gnWX/sAgD7P83+a0YAPL+qgIBpWu+TUPp9KvFJYH9xqP5Jqf/Nst6HhcCNrdzHzfAnreVLStdvFBKYloU/rUG/LaFi70vR9wX9E7V/0071P9c7+T+FiSSccMJp2uG1gEfv+r6zFvBYu3daf1Irv3dGgLT+m//+6w/9TuULu/6K5v5V7d9TWv3fRiMA2vp/vDrsP4vAfydk7Z+A/1HiPwb/vSqz/xT8l0HgP6b+55j1fw9Y/3+orf973+DW/xwf/N/Sw7+y/7+j4H9Q/cfr/Uj2H+f/39O5/95zNPtvqf/S+o9t//0696/hf1r5p9Z/e+iHmEC+BvAv74D/4QrAAo4BRFT96UdN/bdz/3b2P8r6byr/NPdvVP05WAC6CWCWOABw9t9S/03iP3YBjMxT4N8wcgaQCAB2AswjACAFAjpVf+IAuKR5ALAIGL1kKf9U/b9E7fxjeBFwiVj/y2Mu9R+DAC/buX80+DP7v7oJXAC+FgW+HQNJvz+uEyCplT5p/V+w7Ie7HGF/cRcEjToBklr2fS0B6rX2x/18W4P1fL6hgXEXAsXxaxHW/4lHQ+1fOOGE0/Tz6SO/e7NrAcCgePXW//luAYjrGGj496Nq/77xDWr9h9q/LU/QBQCm/287jpT/Z5H1/zm1AMjw1y9UP/OCHPzRIgCp/y2y+g+G/ywo/8z6z1+f0rl/sP2D+t9lZP+h9q/rbQ3+Q9Z/DP3LyoGf2/2V9f8MIv6fQwyA84b13yb/Fwa0hT+PyP/W0F8DAAjW/7xR+ccXAfumVK1f3hr8caXfReuR5v2nnSDAojHom+R/XQM4S9R/nP2vxwGgbP9O4B+NAJSG9DKAW/lH0CLAIP9HOQDsyr8Fnv0vjmDF33QA1KD9o+w/VvwJ8G8UPY6aP0fZ/zG33b9kgP/svL9W/1UFIHIAuBgA8Nx0Afii0/vO4K/W74+r2C/1YB+WCmGwj5PFj/v3kjoGfA/6SRcDSTP4zVb8k/6dTO+kcwFQHD9/c5hEwgknnCU5649s/jZWwtV9aHNNmJ8vq389iwLfrQFrjrVXXIuPW76zrbJh6/fd6v/2p4zB/7h6BPVfkf53SPV/B6r9Y7n/Drv2D+z/yvoP2f9degHAsv8Zrv6flOC/14n6n5Xgv5x8jnP/uvbvHQT+ezdS8XdR//OE+o/Af8j+XyCLgPPU9g/Z/z6o/9PqP83/X7Dy/0r5N/L/eUT8zzscAAXD/g9Kvkv9N+n/aqCPoP67n9uLgMXr/+ZqEv9dmX8X+K80TB0AOvOPng8b7yPwn14E2A4ATf2fp7Z/I/NPwH/E+m8r/xb4bwwR/2tQ/2n1n70IoDEAkwlgLwC4C+Dg9dRr+hpR3n1R9ptVq+d7cZCWhT84AcJtJt3f16Cf1ueWGxMgLSig7/dj1f6NXnYO/609E/eFCSSccMJZsnPrg1t+Zs2hTX9vDcSH3bWAcSn/UZ/1ruzXsRBYc3iTk/z/ufEH9PB/zw80/X/r45WWrU9xB4DO/j8jYgCI/M9z/9uR+r9d1/61AP1/xwuVFq7+g/X/ZUn9l+C/PZj8L26GLwBOCfWf5f+l+p+VtX+Q/WfPM11vStu/yP6r2j+e/5cRgC6xAMgS+J9Q/FX1X49cAoD1v9dh/e/Def/zbvAfLACk/Z+o/OYdwA0BkP2f0vl/NfRPOW3/BdP6vw9Z/9ESgPyMD/ozKgZAqf/RWX8TAijq+/DwP1Nj8I92ASjr/xC2+puvbet/cXi+BvVfDveO6j8K/7PBf/y1Af2jLgFk91fPKeVfOwRs8F8U9V/Z/q3cPyj+euDX1P8rJPdfGo9W/tvQo6sWsJFsezPo/75r75pF+U+a7fdF9Q83DPSNDPpxB+y0nQC+sv9LNdDHHfTjQvyarfRb994PK5keZ+3f3//z8dmfCRNIOOGEs6Tn5gfaf8+EAfKLagEbtfD7qu9b7O81+v03PbCp4oIffuq+XjH4b0HEf1b7d89jxPrfYlD/Wy31H654j+f+mfLvUP/VAmC3gP7x7P8uWvvH1P/WvdINwFV/mf3f+4aw/leHfbEAeANB/04L6r9S/991q/+9Z6j9Hyn/CvynrP+g+kv7v1T8ae7/PKr9mxK2f3AB9BmKv5X7pywAGPwt6z+CAOad9H9K/S8Y9X929p86AdQiYEguApT1fxrZ/hcj/s/Uof7rQT+S/o+Hf1X7N2+4AOZQ7n8OuQEW1CO2/pdMxd/VAACLgDED+mdwAOjQj9wARPUH679b/S8R+7/JA0DtAGbtH1j/EQNAD/yXndZ/9hyr/2V1r3nL6Ce1zDfqCGjW9/v650466Aeqf7grYfHgq+bPF9W/WYsDXwyAxQbyuG0BUXV9vrL+5s0Pzbuz/z2TfxAmj3DCCWfJzx3fu+Oj6w7dOYeHfxiQP/ZIe13K/2KLgqSKfr3fX/P3qv8uaw/btX/rDm+ufL7nz6Xy/5huAEDgP636PyWgf0z5Z5fV/m2X2X8Y/rc/J0j/cDn473me+29BAMAMu1j9J/C/V5X6D7l/VftXHf6ZCyDXJSv/uqT9ny0AAPrHFwHvSOK/Vv8B/Kdt/2d03R8M/9wJcJbk/wsu8J+q/UNOAFP9V3dKWf/VwD9gOgKm9M8x8R9FAKD2z537N/L/ZNi/aLx2RAD2odo/45G6AKJr/yIjAMPRuf+CsQAoIcXfRfw3H4uOCABxACAXAFH/RzX534YAGq6AMeM9bPsftev9NPE/Yugnj5etCAA4AEq4BQCp/3j4LxlDf8l4xMq/Vv/RAmD8auW2ez/wWofnKyvfaOY9aX1fs5X4tAb4sBgIN8ngnbSOLy1WgK+WgGZl+pNm9etdDJSbNNA3XPvXZdf+Vd+bv+N7lY+GySOccMJZFueWo5tyrgXAmvs3NTRwJ60LTAoRrPX32b+Ly/r/C986UNmwhUL/+AKAWf+3Sev/Np39z2x/BlH/n9X2f1X795xU/09wy79Q/V90qP+v8sG/Var+bPjP7sbZ/5PVwV7a/hX5/3We/efWf579l3V/XUb2X1L/heoPtX+a9q+s/31S+cc8AJT9LwD1v3dCPZK8P7H/X3Bk/7H1f9IJAaT2/ws09++g/5vqfi0eAIb+FS0ewAxaCrgJ/7XI/zTz31j2nywCVAVgFAdgXjMARqIy/9TyX1J5/wUH8X/eWATMEwcAzv6XLTCgAQGUg38ZVQBGswCwoo9y/9j+b1b/1XFhAUBs/+hS1R8/aidAm6wFjDuYJ6Xr+7Lup13PV28tYMjsh7uaFgW+6f6+s/nLtfbP12KhUYhg3AhBlEMgzs0NzkTU/p0vhIkjnHDCWTZH1AK2v2jBAKv3Yw+3180AiMsK8MEUqPl7D0fV/v1+5Qsd/5Fm/r8mXABa/X/GWAKA+n9c1/6B+g/DP8v88wsOAFD/tfKv1P+dryjrv1D/Nflf1ACe4kN/RgIAs3L4z0ryfxaWAGQBIK8k/udk9p/m/s9Y4D+m/Bcs8v+EQf5H0D/1iOz8A1r5F6r+lLT/m9Z/4z2Z/ceZf2z/j1b/Tfu/m+xvuwJM6/+0kwEQNfTXrfY78/4w9Nt2/6LpAFA1gC71f642A0Cp/vq5pf4b2X8787+AuAAu9R/d0Uu0+m+0tgtA2f7HMADwksr/lxzAvxKKAJgDfwlb/knm/yp5n0YA5BLgwPXYg3mjCnpc5d3XAJ225T4tVkBYDISbBtwvroKftuU+qRNgKQb3skdKf5IBvm2JlH9e+7f/eoT1f+LlUPsXTjjhLLvzqaO///NOFsCRTakN5nEt/40o/+yuPUpVf/h3+8Wv/7Gu/EPU/41bnxDDvxr8j4sYwDZp/1e1fxj8J+n/kvwvoH/P68o/UP8l8T8D1n+p/kP2H8j/OW79P8Wt/4L8L8F/AP3bCxGAN1X1Hyb/Y/U/byr/TO3n6r/gAOShAhBT/7EDAOz//ehKB0BhYBJl+aH2b0rb//smqf1/gNb9mVGAKPUfFgAFy/Z/kdb+YaVfvnZm/qULoIiHfkPlLw4ZdYAY+gesAOIYqCP7z2F/iP5vLAVKRPmft+F/8PMRN/0f0/7163kL+qcYAGTAnyfkf9cyAKv/ZdUGcEnX/S1C/tduAJr3L0Wq/1fQAgDD/i6TfL9L/bfJ/zT/D6/hPRMImLQdIG0YoC+6fqORg7Sy+GHAD3clLQZ8ZfzrjRw0W9lvNNO/VDDApar3i6z967vgJv/3Tv1CmDTCCSecZekCuPnIV/+VywWw5tjmhrL4jbYANJrtb+T3WKWh+e/DlgCf+M7Oypfu+b62/d8j1P+NWx4zFH/xmCG1f1L5B/W/Q5L/5WMG8v/Vwb9FRQBe5uo/1P2J6r9XlfVfgP9Oqto/Qf3/obL/g/WfKf8w/Ge63lLUfw7968Hgv3clB0Bn/7Mk/4/V/zMK/Fcgyr8c/HkFoK790+C/Sdv+PzClaf59WuXX1v9Jq+4PnouqP5PsPxVZ82cDAafpIxn2p6nlf9Bd/RdF/Xe9bw76pWF78C+YS4DhxcF/hAOgBn+q8peGDeV/2AH+c7oA5qPt/2OGxR8p/wT4Zyr/LgDgqD34Y8u/rfxr8B/O/5eiqv/GKfWfAP+c5P+ryAFwBS0BsAvgmhcWQFrv+8rix/07S0XlD4uBcGsNyXGV/EYHd181e3EH/Di/txSWfV8W/0Yhgc1W+p21f2NX3MN/97k/D+p/OOGEs2zPzz245X90LgAOp8MCaJQB0PDfe2QzrzQ0lX9e+zd0TCv+Cv5XHf63PKms/61Q/ccXAtr6r5R/TP/vOIHAfy9o5V+B/6D272Ux/O/G0L+TivzPwH+5vacqOTX4i+w/z/13Cet/zmH9zyrrP0D/hAsgb1X+ndGVfz1nlQMg33dWDv5a9S/gyr/+KPo/pvlfoMq/Sf4foI84KsBt/hj8hx6J+o/z/wNmDMDM+ZuKP3YCzJDBXw/205EcgMWBf4vV/80ZEQDtAOAD/hAM/mjoR/Z/k/5fHI6q/psnTgCs/hct4N88tfhL4r+L/F8mEQCc+79kAwAN9V/l/zHVX+X+Hbb/MXPov6Kp//uN3P9+w/4/Lgf8car+46HfjgFcEz+790feaPiNvp+07i9p7V+z6vfCQB9umsq9L3p/o9b8pLV/SRYES1nvl1T5T2rhT4sFEEv97znvXAAUx8//4zBhhBNOOMv6rDvS3u1aArAKvXqV90Zv3EXAYgsBVmXoghv+k28PCsUfUf+Z8r8B1H+Z9VcOgG3PCPs/QP9w7p9V/qkIgBz+We2fzP63ouw/DP7skZH++QJgl5H73wvLALD+69q/rAT/Ydu/Uv8l9R+Gfzf4j9b+5ZELQNX+AfSv17T+Y+DfeUr9x5V/svYvL5cAWO2PrgG8oGr/9NB/0SD/T0Vk/hH0b5+D7m8R/2dIBACGfjMGQG4k8X+mfvDf8Nyi6j+p+TMcAPZwD06ABfQcLQPw8G8R/3EEQAz5uvZv3ukA0LV+eugvR8D+ohoAyrj2D6n92hEQMfxj4j/O/gP9H9f+OTkA1PZvqv96IcCWANe9wfnSWhw0i9ofBvVwV8OCoFGFP+nCoNbnGrHwr1RoX1KIX1zFf6lvofq/qU7wX99Eb5gswgknnGV/vvDglp9ce/jOH1lLgEN3qlrApEp9UxYED7c7lf/1h++u/FbXXyLi/2Pqtmx9EpH/n1ILAG7559b/Z0TlH9j9d2Drv2YAkOF/x0uC+r9T5/7VAoAN/7tPoto/tgCA3L8m/wv1X+T+Bf3/DaX+51DtX64Lhv/3BPhPVv/R4V/C/3rOEPifyv5LB4Cp/hfI0I8vUvOlis8WADkH6Z8uA+hzGP7VcF+T/m9S/6dV9h8cANTyP03p/4PTi9r8xfNZS/3X7oBayv+cAwY4F13/N6Sz/Wb1n9UCMGJT/8lz1AKAq/+I+m9k/kuI/K/U/jEH/R+r/qMU/qcXBMbgL5V/k/6Pqf/kuVH9V3ap/2bmfz+NAVDV3yT+a3eA6QBQroCD73tR0H1l5X07BZpVtxcWCOGmOcg3S/lPmulPa6BP+vfiDuK+HAJJrfxLDfsjtX8Hf1Rp7ZqwwX+d5z7c8mDlJ8NkEU444ayIc+sDd/9zCwbIBugH2r3Q/X3XALpe33R0kzP7/9lv/qFW/6Xqz9R/Dv5Dg3+LtP63bBODPwX/oez/9ud07p+D/14gEYCMUv/RAmD3KwT8B9Z/rv7vlbV/3Povsv/CAfCmdADI4V/Z/9/W1X+k9k87ALK45q8Hgf/kIgCT/wt9VP23iP8DKPsPVn6s/gMIsJ9GAHIo/59TCwFD8TeWADj/rwf+aQoBtBR/V/2fi/Y/Y5D/p50AwOKQsQCA52joLw271f8CcgFg4j9+Tgf/eeN5tN3fVQNYwvl+s/YPhv0RM9ePYX/6ObH7Oyr+cN6fkP+dSwDTAWCq/ggCaBL/Ud0fcQDsv2yT/y31/6rlAqAQwOrjAfzeNRUFuD3GQO87OpBWS4BvRkEY+MNdDnV9vqz4ST+XdIBfLo6AehcBrs+VPTgA0moJSOPmBufc5P++qf8tTBThhBPOijkMVrL2aPs7zlrAY+3erf7e6wKPtRPLP/yz33JoS+VLHf/FUv7ZbbWs/88o1Z+A/7ZLy/+O55QbIKOs/zD8Vwf+Dkn9V9n/VzT4b5fO/nPr/x4NAczs0eR/VfsnlX++AOiya/9yRP1/h1j/2dCv8v99tvJfwMR/Av+bULV/WPkvDDhq/xD8j6v/0vpvRgDE37Jr/yz1v2HoH3UCYAYAqP2g/OMIgBr+VdZ/mjAACmjoL9Sq/lvM+k9o/1r5LzlqAJXajzP/hsW/5Bj6CfzPtP6PuMF+pP4vkvZPn5cdywDbCWDn/7X1/7Jd+0dy/1T1V0uA/bbVv7Qo9f8qqQM0IwB0+Bev+XsHrlXaDl5PNIj7XBD4UujDgB5uYATErwGMY/lfCTV+zc7+17tA8D3Qp7UgKB54v9Laec4G//Wcey+A/8IJJ5wVdz5xtP3zThbA0U2pZ/+T/h7U/pn/7L988JAa+BnxXzsATPX/aan+P6MWANr6D9l/g/hfHfxb+PD/ggL/cfVfDv8tXP2Xyv8uU/0/yWv/1PCPwH98AdApFX8C/jutlH8O/2OW/y679o8M/3zof4/k/zX4Tw//wv5vZP8J/Z8N7ib0T6j/AP+Lsv/jCsAChv4Z9n+bAYDAfybxfx+KABjgP4sFoMB/CPq3GPEfVf+5bf81FgPG0F8wGQBo6Mf2f5z9x4sA7ARg+X8M/9P2f03/x1l/DP4rGeA/y+5v1P1pur9B/MdD/+iCVftHGACG9Z/Y/8dM+z9aBuyn6j92AOjB/qrjuWPot6z/riucAAwI6MP67jtj70uJDwuBcJfTgJ7U+h93QPddu1fv31suir6vSEBSJsBypvvXutn+i071P9s/8RthkggnnHBWpAtg/dH2v3YuAY61exnkF6sFjOMAuOmhdgv6x55/8r4urfjD4M9fPy6p/09r+v/Wp7n6LxwAUvXnVv9nEfhPRAAy3PL/vLT8C/hfyw6w/wvif0YO/+I5Vv9PcvWfU/9Z9n8vBf/lulDtHyj/yv6PrP8S/odz/7AEUNZ/yP73Svt/Dwb/SQeAK/dfw/qfB+u/igDY0L+c1RQwhXL/CPxHAIDU+m8r/WYE4CKh/5Pc/6CZ/Z82rP8z2gFABv9ZqwGg8Yvs/sbgX0KPYP0vGUN/pANgxEX7XyCDP7ymwL8Fav23KgDn7eq/MXMJ4AD+4fo/s/rPyP6rO2aA/0i932U1wJfGafafqP9G9t+sAmyrFQM4QOv/2lATAH+s/vy2g9djZf19QwPjDvy+HQThhruaGAG+6v+SWvYbhQYmVerTjgbUWgTUuzAoN8ANWMqFQHH8mtv633X2b4L6H0444azY85lj96x3LQCYwp504E/FOcBq/w45agwPbar82uCfSbX/cQP895Qe/LdL2j9csP4D+R9I/x3CAZBhF2r/IP/PFwHa+s+z/zD8o+o/pv5n98raP67+S/I/y/x3vi4cAHvlAkDm/nX2HxYA76jsP5D/bfVfDv99uvLPhv5R+z93AJhDv1oEYGV/itT+WUO/sRTIGY/YAZC37P5Tlu1fLwOmySJA5/wvksHftv0blX9D2AEwvWj1X7GuGMAcrf5zgf+GTAeAWQFoZ/stBgACAJaG8eA/b1T/RSn/89bAD0N/ecwA/ZHHS9T6P4qo/4YDwLT9lxxDfwlFBGjm/7JF/gfl3wQAmtn/tgPm0O9mAGjr/zW0ELhGbtvBD5bdQL7Ug3lYDIS7HAZ7X5b8tB0DSx0B8J3B96341zvAty1DB0C2d9Jd+9d7/uYwQYQTTjgr+qy/v/0PnS6Ah9qXPPtv3jX327Z/dj/z7VGk+EME4PHKRkb9l+q/Hv6Py8H/WUT9B8Vfqv8QBeiAyr/nEfUfwf/YAmA3yv4z5R9Z/1v3aPBfltT+vc6z/qD+a+q/Df5TiwAA/yHbP6H+E/K/A/wHFxgAWPnH+X9T/e9H1n+c+Teo/3kE/oPaP2z/d9P+p4z8/7Tx3GX9pzGAIgz3+HkE+M9V/UcdAGj4H66V/bep/y71H9P/Ve6fcABsxd+9FHAsAkYX7ApAJ/hvgTx3U//rAP8tQv3XLAAM/nNX/5VR9Z96RMN+KaLqz7T+u4Z/qvRTJwBW/8USQSwB0rL6J10UJP1cGOLDXcnZfd+1gGll/Fcq7C+t1oC0ogHNvvmRS+7av+6Jb4bJIZxwwlnx59N/+rs/fdPhTX93kzlYH76TK+5L5QKw7rHNFvSP3XWHfrvyhT3/wYL+cfV/m1b/BQNADv8y+6+t/89p6//2Ewj8B1cr/+K+RMF/Kvv/mrT9C+t/lmX/gfrPHuXwn+0U1H8+/IPyzyCARvZfU//fIdR/sPwrBwAf/M/ZlX9c7RfKv8r9A/ivf9LhApikuX+L+g9OALoIIJWApuUfuwBQI0DeqPwzlwBk4Ddz/oT6j7L+g9F5f7UEGJpxDP6z7iVAlAOAZPxnrco/bfeXQ/uQnft3DfyQ+VcDP6H+04HfzP+TJgB0y2oxgBwCY4b1Hy0BxNBvxABGHXl/tADAyn/JMfAT6j8G/5H8/xUdD3DB/8Zdtn+Z/x+PzvkT2/9+cALA82sSCPh+Uyj4aVH9ww13JVn0fWX502oDWG4Kv68av6SU/aRU/uVE9V/03vthJdNj1/61dp79uzu+ffEfhskhnHDCWRXnlvs33+1S1tc80N5UGGCtz910xK3+f/Yb30SZf23/37j1KZH7V/R/Mfi3Yts/XID+cfDfCan+Y+v/S4r+nzHU/5adAP0D6/9rCvwnlgHVoX8PHv4F/I8N/pz878z+g/X/HaX+Q/YfOwDEPaugf3lgAEj1vyCXAFj5Lyjo33lk/T/vrv1jEYA+Svu3M//0uoB/Ju3fbAHAir/ZAFB0AQClwq+s/5gJYA79Q1ELAdv6XzCG/9KiLgBb/efOAWsRgJV/GPah/k9+boRm/nX2XwMAdQRADu1W/R8l/gvlf94JAHTX/9GqvzJ+H8EAibXf5AA4Ff8rxqNW/gn0z8z8O3L/1BHgsv5fMxgA1xT936wC1M+vV277+oexqf5pQft8DfxhcRDuSoICJs3oN1ofmJTqv1wXB3GhgIt93ldkYDk7A/JD8071v7X3/O+GiSGccMJZNWe8Mv6RdYc3zSj7v7y8FvDh9iVX/296iA7/4AS45b7tlS9t/a+c8r+BZf/Vfaw62IsFQCtT+7n1H+r+kO1/u4b9iaFf5P7F8P88jwC0YPu/HP4B9sfJ/ztfEdZ/pf7rBQAf/CH3vxfy/0L9z3Lw32nRBNBNa//4EgBq/7q09T9n5v57zsrHM0r9B/J/zdo/TP8fmFTEf5L7V/n/KaH+I/p/DjkF8DIgZ+T+VdZ/YIpk/5XiPxAB/jMAgFbtH777KAOgMOQg/Q/Z0D+6BGhA/eeKPxD/jRjAkOkCwLn/Oar+AxgQAQDN4R/X/pVI/Z/5aKr/lPRPhv4xQ/HHAMBRhwtgdMGq/VP2fyMGAOo/dgGUjCVAycj9YwBgqUbun9r+67xk6DdcAQf0e1AL6HugTmvwDgN9uM0c3Bsd5OM6BBaD5C2X+r60B/p6M/1Js/ptDYD4yit8oG/klg58UGntcqj/Xedm77jjex8NE0M44YSzqs66h77a6q4FvHPJFwBrDrvV/18de4AO/ltZ7v8Jkf3nNX9y8FcLAKj8e862/nc8K63/J7T1n1X+7TBq/3D2H6B/Ru0fs/7TBYCo/QPwH1P+xX0DWf/fssB/NbP/pAHgLM3+G8q/rv2bRGo/zf/b6r+o/ss76P9uDgAa9F32/8GpCBfANAEBYpK/y/avlwEzjsw/Jf+7a/9mjcWAMfQPN9gEYDkAkNKPFgAK7IeHfifxH7UBoAVA0REFwC4Amv03lwHzzkrAsrEI0BwAt/2f5PzVYG8S/13kf3sRoBV+Df0r4eF//IrO/FsuAIgDuCIBNez/ePg/cI04AJLUAoZ6vnDDjb9Y8E33953BX661f74WC+UIKr/vCMFKWQzkBqbd4L/+c9kwKYQTTjir7rBKk3VH259zDdpRLoCf+247v6mq/w+4h/9P/kmftv4T8v8TctB/Fqn+x6n6v92E/p2Q6r9Q/cUC4EWt/lef4+GfDfyt8uLav6xS/k9q6j+z/cNl1v9OkffPdL5pkP/FAoCo/4b1X6v9QP3X9n+V/Xep/70a+ldQ6r+b/I/V/3w/tf/roV/8fq6f/p7K+ZNM/0UD9Kdt//kBA/gX5QLYF80AsMj/UdC/fbNE9bfz/3W4AEzC//Ccnf231P85WvmnHl3kf1v9Vy6A0VqZ/wUj929D/8DuT+v+kP1/lC4Caqr/6l5GwL/LVgSgZAz8JSPzT8n/AAK86hz2G1H+25zwvwgngBz+RSPA+3UP8GkM+GEpEO5KzvzHHfCXynIf5TBY7oO7L0p/WgN83AF/OSwFStX/PXDW/vVMvBBq/8IJJ5xVe26+f9OnnSyAI425ALwtBh5pd9b+rT20ufIbfX/Bh/0NPPevL8v+t2x9prKR1/xp1V8r/89q5b8DE/9PKPW/pQNs/y9K6r+A/4nhH9R/ZP3fLWz/AP4TEMBT0vb/QzT8vyGp/29WX5/m+X+t/r/FB38x/L+rwH+s9s9d/XdWLgW07V8Q/4H+L5T/AgH/UfI/p/4bFn42/Of7ZfZfVv6Z1X+2A2CKwP9I/h+iAJF2f/frInIBFDHgD9H+dQ3gNMrw00WAiwPgVP4bIf6bj2jwL5LBX6v+GPpH7jDN/iuFH73GtX9Fkv+n6r85/JdxFSC2/o8a1n8y+C+QvL9V+zfuerxkQ//GohwAZgOAYf/HsD8L/Hclsv7PXQMoB3sA/1nKv+kMuE5qAUMWP9xA5186GKCvjH+9kYNmK/uNZvCbDQP0RfePGzVYipvpm3Kr/wNznw4TQjjhhLO6lwCH2x9xsQBuerC9KYp/PbV/P/8vD1iDP18GbHlKKf1Y+W/F0L8OZPlH6r+i/Xe8gIZ/BP7bxbL/L8sra/92vWZZ/9nznKz9w9T/nFT/2QX1H6j/SvXvAss/Vf/J4K+G/zOE+q+s/73nHJV/cuAH4J9aBlywaP45IP5L5d+q/kPLAr4oAPCfsvpftGr/XE4AvRCYJtZ/bPMnir8C/2Hav1b+tQtg2h74cebfGvRnGrD+66G/YOT9AfhHMv9Dc3T4V+A/V9Wf47lcBBRN279D+afAv3mnA6A86nAAjBrW/xrDPwX/IeW/VgvAfgP8tx8p/1G5f2f+vx4WwDXj8ao7AmDctgP0MiBgMwf6sBgIdzWyAJL+nWbV7C23xYCvAb2tDgdAuQksgJUSCSiMXXGr/90TfxYmg3DCCWfVnzWP/P7/sObQnT+2Bu/Dm2IP8vUuDciC4eF25/B/86Hfr3xh19/ooV+5AJ7glX+m5V/b/o9r238HZP5l5R+H/p1Q1v/WndIBsAvAf1D593KlRToAsPU/g2v/uPIv1P/MXpH9z3W9IeB/ewX1P9tpkv+p+p+D2j8z9w8RADn859XF6j9T/idk5R9k/w3bP879Y/u/Av/R3L9+PmlU/pnqPyj/OPc/5Rj8sc1/mqr/GPw3GFX9pysAsf0/kv5v2P71MiDCBTBcx+BvZP7N58TiT17P0Zy/qf4PU+Afrf4zif8LTvW/PLaglX+T+D8alfdH1YDq0Yb+lVxOAKz2G06AEiH+I/BfLfK/MfgTVX+8FuxPuwDaDkRxAK5Gqv/87te1gKGuL9zgCGjsc3FgfXFr/Hx9vtGowFJR++Mq/0kt/I3+vRUJ/2O1f73nHQuAcz/+yvjVnw2TQTjhhHNDnPUPbN6zBqn/igXwwJ3OYT4NZwCLHbgWAL/49T9Gg7++3PqP1H819GPlvwMr/8/R4Z8p/2D9V+C/6vC/4yVt/UfDf1YN/8L+36pq/07p7L+0/wvg32lp/38Dqf+I/N/1trT9a/U/b1b+9Z2tvjbAfyj7LxYB53Xln7L/n6f2/34K/iPqf5/O/hPbv7P2DxwAFw3gn7vyD1f9mXV/puKva/3s56YDIEr913GAWWf2v3bmf84dA4jK/mPg3xAFAao74lb6VeYf3lMRAG39VwyAEXPgxxEAqv6XncC/S04HAFH/HZV/JVL1d8mZ/dfLASMCgIB/pPrPfCTq/1WH+l/PvWYr/weu6hiAAQPki4ID1zUP4ICuBQxDYbjhJqfrp/V3kyr1KxXa1+ggHpcl4EuxXwkLgfzwglP9z3Wf7wwTQTjhhHPDnOKT4z+x9vCm960B/NCdPJeflAWw2PssbuAa/j/+nd2c9L9hy5OVjVueQguAJ/mQry3/1QF/23E0+KPMP3pPZP4x9R/n/tnwr5V/Mfy/Ksj/XP0/yS8o/617Ue6fLQFA/Ue1f2r45+T/0wT6l0O5f+ECMDP/tvrPH/twBAAN/S71f8Cs/pvSxH9J/deVfxccDgBa/Ydp/1bmHyv/KP+Prf9WPGAftf/jxYDO/qP8P8r0qxaACPu/PfzXT//HdX+FqEWASf9Htn/VAIBJ/yMU+ldCuf/isEn9N+v+7Oo/iACUXTEADPUDGOAi9P8yGebx8G+0ALjU/zGa+S+hRYBp+bciAOM26b9sMQCw+u8Y+Ouw/SvVH7L/6LlYBLy/qJIflP5wVwO8zxcTwJeV33QSRCnySRcDaVv8kw7ivhYISbP7q63mzwL/HfyRu/av89wHX9jyyk+GiSCccMK5oc7NR+/6iosFsOaBTbEH/Lo+9wir/TOqCOX93MifisFfLgC+JId/BvwDpV9l/ju03T9DbP8w/D8vFH+Z/W8B+/8Om/ovrP+viMq/3a8h6/9ruvaPv0bZ/05E/pdWfw7/k+C/XBeo/5D9f0ctAHIG+E/l/SH7X71A/ifZ/16j+o+Q/8/Xrv3r1wsAq/pvgA7++vkUUf9dDgBYBOTx0D9g2P8tu/9Fdw0gGvyLLvUfOQBEDGDWQfs3yP/DDUAADfCfpf47Kv+KDgigWftXNBsBZATAJP+XrCWAmf1fcNj+MeyPPid5/1Gb9m+R/40lQAln/9ECoOSA/ZXGjedmKwCx+1+JpPu3OX92LSLvfzUy82/DAK8TBwB3B0TUAoYb7o1M909qxffdLuBL+W+2IyAu3d+XAyCtloCVdnP7Zp3qf7br3P8aJoFwwgnnhju8FvBw+2nXIP6xY5tTawVY84Bb/f/0H+/jkD82/JOrrP/Hkc0fhn+6CMDKv1L/OfTvBZH7l8p/6w5c+Vd9vftlrfzL7D+A/1jtH6/+4+C/U9L2z+4bqvZPUP8R+K9Lgv+k9T+HwH85VPtn5f9hCaDUfwP6Z9n+J43BHy0CzOGfk/+NjD+2/hsRAMj8510uAGP4Lxj1fwUjAgBDf8Fh9S/ug6z/DF0S1Mr/o9o/lf+PBPvN1AH/m6WD/7BJ/J9Hdv95q/bPZf23HQGoArAG8d+2/lPlv2wq/yQCUB/x3xr+sRNgzKD+O/P/oO67lgDGjVD+G4sBYKv/tUVq/9DAr1R/7QZoUw4A8RgGxXBD9t/PwB7XKZBWNGC51/z5rgNM6hRYDVZ/8xYPvB8B/jv3dqj9CyeccG5cF8Dh3/ncTY4FwE1HNzkH+8UG/UUdAxHgv3XfuavyWz1/JRcAT0kXwFOK+g/D/UbmANj2rMz2Y9Xfpf5r6F8LcwB0SPu/K/e/C6B/kvwP1H8g/3eekvl/Df5jDoDcXgn+4wuANxwLgHfUAkDZ/7vMBQDK/Mvav7x0AsACAOB/yvrPHADY8t+Pcv9m7R/A//oukAUAdQJMUvt/v2H/R6p/3nQADKCh3yL/a+gfhf1d1MM9cQrMoCWBK+u/2HuzteF/Q3NoUSAt/2jYL+DaPxMAiIn/huW/6LD/w+fo0I+t/2D7xzDACPv/qNkQYID/xjAA0GQBXCKLADfx/xJV/A27f2TdH4H+XUZ2/8vuFoDFiP/jVyJU/wja/4H6IwBE/d9/XS4S3LWA4Ya7Egf5pJGAuAN6o0N5o5DApaL0NzrI+8rmJ63lSzrIp8UKWIqb7b/oXAC09kz9WpgAwgknnBvaBbD+yOZ/76wFPNbuVflnly0WrMhB9X72m3/IIX8btjwhlX+5CGDW/+pA32IM+Grgx3n/jhNi8OeqP2T+pfWfD/648u9leV/R4D+w/qMFQAaB/4Tqf0rY/vkV6n9Wqv9A/8fgPw38e1tl/7OG+s/Af5D/V7l/Qv2H5+e1E4BU/U1qB8DABbIEoA4AuQDA8L+BC04IIK7+yxvZ/yj136r8wxBAF/DPov3PUACgyv07sv9DlPhv0v/t6r+5CPs/sv07rP948DeBf5j+rzL/Vu4fxQWQ8l9CmX8MAcQAQG3/X7CVf8j5IxdAedQc9mXuf3Qx9R85AMyqv3H4LFX+sb2/bMYBxl3U/6uO6r96rP9XaywEotT/63T4328sAZD6r1wAAQgY7gpS6pvNDvBdI+jbsu9rEeA7o582OyCpEyCtBcOyUf/HrkbV/v2noP6HE044N/y59cH2NU4WwJFNasCv1wkQ9Tn+3rFNlvLPvuuWQ1srX+p4DC0ABPF/49Ynq4O/UP+58g+0/+108FeW/44T1c9Ub4fI/AvSv7T9M5s/gP9A+d/9Clf+VfZ/l53955V/bAEgVX+V/WfWfwb947V/bAlwWqn/LPuf4y6At23wHxr+Nf3/LMn/syUAHvwp+R/s/5PU9q+cAADvM3P/buCfqfrD88Kgrv7DuX+d9zcBgNNGBeA0qQJ0Vv5B3h8zAuQSQDkAhmqR/12DP7b9z9SR/Tds/9gBQIj/83IpUCvvvwgHwOkC0A4AW+2fr0H+dwAASc2fI/s/aub9DQAgIv9j5R9HBEqR0D9E/t9/xQkDbNz2bw75i4H/rkc4AK4bw/81ugg4IICAYQANd7ksAXxn631l8X0N6nEH9qWy//vO4PtW/BtV7Fdr1t9S/3snnQuArwzOrQ3/5R9OOOGEUz3rj24+eJPDmv+xhzY1NOjHqf375QNHKi1M7d9Kb8u2pystO57llxP++X3Wmfdv5YM/pv3L4R8r/zuo+s/BfztfUZl/ofxL279U/3OK+q/Bf4L6L9X/6tCfQeA/cd/m0L9c1zuk9i+H6v6U9b8Hgf+c1H+4NcB/7PmAreib1P9o8B+qC+zHtn+H8m80AGD7f8HK/tvUfyf4b9BYBERm/uF5NPgv+s5FxAEc4L8I6r/VAKA+Qx0ARPEHJ8AwqvsboeA//TyKAzDvdAHgzH/ZjAKMmVGACPWfLAOM7H9UDMCV+Uc5f8IBILb+WrT/Kw3U/tWxEDhw3bD/S7v/AUP9l8M/ewwugHBDxj9ZdCCpch/1O8u95s93xt837K/WQmC1Zv/zIwtR6v/Xw3/xhxNOOOHI89nv7PoHaw/d+beWE+DwnZzan5j+/yC1/MPf/9SfdOmBX2b/Rf3fU0L1N6z+LdvF5XZ/sP3LyxX/DjH4t7DHHS+q2j+e/98hlgCtaPjn2f/q8N+6iyr/LdX3WpD1nw//7HEPcwG8wZcAOVn7p2z/4ACQ4L+sgv69w3P/eTT4Z5UL4IxaBAD1XxP/ofYPKf+9SP23XAAX7Px/H7X/uxwAWPkX1n8D/Dcg3QCOyj/TBYBVf0Xtxy4AbPG3qP8zFvivnto/yPsXiOpPHQAFnPkfQgN/lPV/CFv9sd2fqvz1Uf/lwK+q/0wHgEH9t2j/tvW/NIqGe1z7N3rJCf4rO+v/7Kq/Eqb/jzmo/w4GgMr777/syPtHZf5rV/+VxqvXUf1X4j+rM/evGgEcyv/+67YL4OD7lbYwTIbbpAHdZ5bfF2W/kQHfp7NgpQz0cQf9uNn7Rgdv37+/Yu+9H1Zau+3av0zn2b8tjp//6fBf/OGEE044OApw9K7NN2EQIAzs92+Krfzznz/SXllzyKH+H9pU+fV9/5ao/gIA+HT1Oav6E9l/POSTwX8HtvzLyr+dLxhXWP8x9C8joX8m+I9b/eUCQFP/Afon1f8uMfBz6z+v/6O5f5717xHqfw6p/+zmXdl/DACUj6D8i0dp/e+d0MsAlP0vKPu/rexz8J9h/afD/6RF/hf2/4vEAZA3VH1a+4fs/0YVoAL9oed29n+a5v5x/d/QDLH+w4CPGwBcDoBSzdo/Y+iPIv8jdR9+z8z+k0WAqgZcQIsBG/qHs/9q6Hfm/uctq38Zg/8IA+ASUf3LRhyALwNGo2r/LlP7/5ixGHAN/Ga1nyv37936v5j93wH9O2Da/a+hCkCt/OMlQNu9AQgY7sphAMSFAjZK609aH5iU6r/YZ5ZqcRAXCtgord9Xfd+NUvuX3zfvVP9zPRe+Gv5LP5xwwgnHOOPj4x9Zd/jOCy6b/s89vKnm4B/FCuDW//s32S0DrPbvW6OVDVufqd6nK1/aIu7Grew+U8lsP6HBfkzd3/4ct/lnpPrfsv15ftXgj4B/TO3nDgAY/ontX0D/NnL1/zWV+2/dfVK6AKrPFfiPKf4/1Pn/PTL7zwZ+qf5j6j8o/5nOtxX4Dw//RP3vPsOvCf8rGOq/HvzPu8F/QPAfuGDX/vXJ9xzkf/I7jto/nPun1v+L1qNW/xH0b1Cr/0VHDIDa/mdoNaBsAljUBYCGe7oEmLFBf66hXz4WjCVACRP/hxzWf4fSb7oB1JXKP7gAcO6f5PxH3EO/Gv7H5g31nwIAKfEf5/4XLCeAzv1flssAPPQDBFA+GtV/JTzs78eWf/1+cSxK8dfPmcJvRwTqXQhED/+lCC5A2wGH4o+XAAffF88PBhZAuM234jc6yMd1CCTN6Dervi/tgT4uPK/W5///9s4kxq4zu+9ApwEvnCwsdsvdnbYROAmSGM4ksareUK8GMjCSTXadptymBk5izQNZxSKLLBaHDIgCJNbg7o7slXeBYWQRBIatptSSOM+kKFLiKJGUSIqklE7gleGX+83n++59Nb1XItX6/YCDe+/37nvs3nTXOed//mdVEyZ8C53RX71ET4CvkxKgd+//qVfGruZd/7dcuTk7W/8Gf+kDABTw6z9d21Hk0v/EH/5wSdL/X3v9mbyiQK/9e7b+9Oj/tgWAt3XSrwoBKsra9f+QD53g+1AFgaTjP2C7/Xrdnwmd/OsCgLoet0WAE/mVf4npn1v5513/x85qx39VAHBy/8j533b/lfGfUQDI2X+78m/Lh4nz/2XR/b+Sl//7uB6c/yeuJbP/Uv6fyP5t57+2LZn/nyxw/pcbABLZv5z/79p+s8DxXxYD4qRfuv33iEKAHAWIHP5lwj9d1PE3CX/q/O+fF2T6V+D8vzPv9h/P/lvpf7oJoIH8X8789zZy/BfO/z1FZAnj0AAAKltJREFUxQDvAXAnL/+P3P7Dqr/Y7X+O2f/Z1Pn/Xiz/b7D6L539z60B3CNMANNoKP1faKK/SDPARiqAIkPAXEGAtYDEV8/Vf6kmgM2OELRqNr9VSoDHbXRg1QILA8vd6f86RW3qVmH3v3vrrTJ/4QMANECtRvnWq8/8vGgrwBOvP7Pgzr97XvFag7V//+klm/y/Uy9tfqfevultHR2b3zXde5vw+06/e+5XXf6Q9Jvno/rMzP0f0zP/1QFh+pdFeVB1/e26vyz5rwyqsHJ/u/6vYmf+qzbUCEBl5GwWVvo/et5K/5Xp3/vB9X/Lxez+YnZ+KXL+70yc/133P5j+XU7M/0zn36gATOe/ttVErusvu//bku6/M/+bvNFA/t+o+++c/5MOfzL7n+/+x+MAkQdANAogVQC3Ey+A28m6v7kVAI3N/m6L1X+J4d8Cuv+pB4CU/8/V/Y+vdyMFQHD+F8+FCb/r9t9tkPQ36v6LSD0AZsL9nN3/3QWmf7uLZ/97xQhALuHf0ygeLLIQIL0AFiD93xNM/1ZHHgAN5v+LVAB7hQoAQ0DiPyyfFL9ZV/+ldt5btVavGRf/xzGJXy6X/uVK4Jea4P+yFwZ6s/9tb2D89w5r/wAA5uGJ19b8RvFawB8uygxwxX9fk0v8VXzv5f56R9+bWeL/tk7+TRgFQFnN9cvod4Z+KoLLvz4fOOxN/owC4Ji9D4m/6v5XBkPnXxcAnOmflfz7GD1lOv+u+2+l/zrxd7J/Lf1/r15Ra//sCsCaMP4z3f8P7Py/7f5vsQWAicvC/d8UAFTnv0sk/7L776X/k0kBYEp19a+bhH7KJvNS+i9M/zonwyhAo9V/Zm1g3vhPSv9TFUAwAkyM/4q6/8mcf09kAGiKAY2M/9KZfyn9lyqBBa/786aABTP/00XO/8Xmf/MbAcbSf9n1L3L/X5XbAHAnbwCYFgailX95478i53+fzOdm/V0xoKj779b6BSWAkvn37jadfx3RzH+Q9YfVgMn8/+xiFQD5rn/vvN1/aQD4eeHqv/g+FAJQARDL6brf7L/zZY8aLHW94KMuDCy28/5lmwG2yt3/67ber1FUs791igoA/2rbJ7/JX/YAAAsZBXj1mZ8UufY/8dM1C1YArHi1eO3fb+95vd6huv0u1AiAKgb0m+6/MfVzCb9VA9iuf1QQcEZ/+vyYVgL4xH/gePZsZv/LLvm3K/8qbu3f8Gk7/x9W/lWGz+i5f2/8N2rm/k0R4IK+VsZi47+aXfunV/8513/b+Tfz/nL+Xzj+Z9Gp1wCK5N8Z/gnjP9fp75YeAFOx6V+Q/9sRACH7953/qYLkP6cAuKlXARZ1/lPJf2QOuONWMhpwS5wXrf27lev8F6kBZOLfM93Y+G8uA8DuVPrfYN2fUQSY6C3o/Dvpf3hOkn4h++8Ra/960iKAmPnPy/+tWWCB6/+q3Kx/ft3fKvF5bPYnpP9SCbA7PwZgCgFy3j8eAUhn/hsaABa6/+c7/KEY8NDeN5L7GzVAvAXg8yj5j9b8Fbn972nU+Q+bAJwfwGpUACT2j0iy36oEfaleAMsl8X/cFADNJuirF6gAWGqC3qqE/utQGOie+axR9/91/qIHAFgg337tB397xSs//Ju0e6+S+qLOf1oIWPGTNTnTPxW/8V+nsoQ/S/Q3v6s7/6oAoOb/1bNL8lXCX/KJvkv+D9tE34wAVN2c/4BZ71e214ouBDjTP9H5HzSJf5D+n0m6/6YAYM7P+lDSfyP/N51/1fGvJmv/tNnf2KV6ddzG2AemEOCl/x+GtX9bLvvVf112FMDL/r0BoE38U/O/KeH+PxU7+HeqmHRr/z72SX/q/O/XAcpiQJHjv+j857r/0v1/qijZvxl1/qNkf/vt7Dv5rn/O/G/aJP/5TQCNjP/mcf633X9dUIjWAMad/yD5v1No/pd2/9MxgJD4h2s689+zK+/+nzf/uxM7/++ORwF8MSCd+5/JG//J7r9O8GfuxV1/WQSIZP/3heO/LAK4xD7M/Ss1QDD/a5T0u2LBgyVsAVjM6j859/+woPv/RW7u3yT9UglggqT4lzPJX65EfrFmeq3q/Dcr4V+q+V+rCgSPi2v/Ujv/zUr4F/t7X/dOf9Hav+rWawUFgKt/828nL/0d/qIHAFgE3/npjwaK1gKq5L7RCIBZ+7cmt/ZPf/eVZ+r/YurPssT/XV0EUFHS13e0uZ9P8PuP2MT+qHX0t2HPVOLvnqtC7l8dEom/lv4fs67/J43p35CV/o8Yx38ddu6/Nmpk/1WvADjn5f9a6j+iJP/W9V8VAZTpn5b8v590/i/55N+v+9Oz/h96wz838y9X/pm1f9eyMxNeAWATfi35n5Tdf5PE16KVf6bzL2f//cx/kfR/m0rypezfdv+3fVw461+bCo7/6QrAbqEE6EkLAUXdf5vs94iEv9Dp3ykAGnT/u6cXUASIZv4/nWftX5L0J9eeVAWwK+789+68E6/+m5mr+5/K/pP1gEIBoH9v5m6u+7+qgRIgVQD4IoBXAYgRACH57535LIwCiOTfJPmh+5/r+M/Ot+pvgTP/e9zMf5z86/Ok89+bFAD87H+0+m+O694vROIvNgGIWL3/FyTNxLIpA1o1479UL4Hldu1/XAsBrZ7xX6qXAK79LVr7t/NuYfe/c+uVYf6SBwBYJD2zs9988tU193NeAFlyr5L8tOvvu/8/znf+1fd+67/sq7frzv9BXQTwodb7DRwLCX+fKwDEV9P1PxpW+w04l3/V9T9ukn4l+bemf2U9++8c/0/ZAsBpvfKvamX/2vVfd/3N2j/l+u+k/7r771f+qe6/MwC84OX/VWX8N3bJmv45A8APjOx/i+j8W8M/Jfk36/+c67+c/79mZv8nirv/kfu/6/xP2s7/Ntf9N591Tqj5/xs5p/+a8ASoSem/6/rPsfqvu8DoTxYFuoXjf7wVIHT8u/S5lPrfLjAAbGz8F4oFVh2w4xOrFIhn/uNzYQQ4LYoA0/kNAFrWP13gA7Arcf+33f7uaXW9G20A0Mm6O98Vz/5375TO/3eSMYB45j81A4zd/83MvyoK9Mwk8//67J4O7/Q/+5n4btr9D2v/gtnf/Tm2AMQr/3rl2r/ZdMY/VgXEkv8HyYz/gzln/hsqAfZ+ntybWL13rhGALwqMAM1ZrzADRAVALEenvhWFhlYk4ktVCrQqAW/295pNxFtVQGh2dn+xSgG6/sL4b98v6pXxgrV/49ce9MzWv8lf8gAAS+B7r/3od4vW+Kkkv1AB8Edr6kXeAd95eV195chfZsl+lvz3vavd/kubD+kCgE7q+4183yf6/eKs/5iX9/sZ/3673k91/f3VJf7HvfS/PGhk/zr514m/WflXsa7/1VEj+68Mn9Xz/2b1X1j7Vx1RSb/p/ivjPyf9N67/7xvTP+38b13/o7V/l43kf4tb+xc6//psq0j+s9Bu/974z5j/6W7+pJj9twqA2qSY+U+c/6X8v1M/57v/nZNu9v+mn/2vTeWLALVtwul/Ksz/m/Nbyfx/LPnXCf/ULWEUGCsAeqQCIIuu7bdyBoBd24MKICf9l/P+O4uM/2yyP/1prvsv3f973ez/DlEEsMm/TvCn3Vl+E0Dk/J8a/1nn/6j7LxQAq5yUf+ZOpBRYJeT/PW5UwDn62y6/UQTIef+4CLDKFwNcIWBuBYAqBvTszjv+9yRdf3evE385/5+T/jdK+EOnPzqfte+mRn+zcvb/QcPkP5j9xfeFs/970o5/0v3fF28EwBCQRL7ZTnuznf9W/G4rtwQ0U3BoZfK9XO7+rVIALNeWAPn+110R0Jn9jVDY/Z+4/q/5Cx4AYImo1SlPvvrMuVwBIItfez3f/VebAoqM//7hf3y53vHioSzxP2QS/76D9Y4+1f03a/y8m7/t6kfS/sFj4dzK/LW8fzAk/5VB0/k3iX92Npwl/d70zyT/OrL78rDp/Bu5v3P8P6e7/2rln177Z1f+KeO/qjP9s7P/NTv3r5N+l/zrQkC89k+OAFR1IcCMAXQVrf3LknyV+OfW/iXu/9EKPy37N9fOiZDUO/M/OQIgO//G9V+u/QsROvpzzf/fyq39i2b9txe5/4fVfz1+nl90+tMRgCL3/x2h8x+t/ZtvA8DO5L7Q+f9O0v3/1Hf9C+f/dwazv1436y8N/3bdEdL/O5H7f7oC0BUBVs2kawJjt3+/AjCS/d+Lpf+yCOA7+/dEsn8vv+5PrvpzJoB7iub/ndv/Z17274sAkRIgXwhY1aAQkHb7zdq/BwuY//885/ifm/WX3f49czn/NzqTawFJkpH6N78GcKkKgKWuEWxW8r/cCoCv6ux/s6Z/y7Ue8OsWPdn/Phca/41ffY+1fwAATfLd19b+kxUFhn5PJGsB1YaAove+9wfDWuavCwCuCNB3sF7uO1wvDRrTPpPgHzedf18AOOol/mGtn31v0En+j4lZ/xP10oA1/HNmf9btXyX/5aHY8E9L/1XnX8/8n9FFANXpl2v/VFRGL/jkvzpm5v+19N+u/Ot03X+tAPgwS/aN2Z++br3sO/6dW65E0n+V+Nd05z8Y/9Umrut5fyf31yZ+k8EA0En9u2T337n9i7V/0vgvmP8l0v/tN2PJ/3a7CtAn+0IZILwAVFe/KxkFcEm++SxO/Lut7F+rAeYy/hNz/zk/AJvAG0XA7YaO/11e+h8n/d78L5H+p0l/j5D9p91+pwAwsv94FMCFlvjvvBv5APRI8z9p/Le7YN5fdP+dKqBHmP9paf+ue6IQcC+R/9+zyoDY7T+Y/+WN/7z8f3de/i8LAtLsr7fQ8f+B8AZIZv+9+V+qBHgYnauOf68sCESu/5/nV//tTTYB7Em6/3Ot/tuXSP6zkPeq82+u5n41CfJjn6A3uzavVS79rVYCtHrGfrFKgy97fd9SE/lWzeY3u5av2USegsACu//bPi4sANS2f/Tb/OUOANASFcAP/7RoFOCJ1+1awD/+vfq3Xs1/ruJ3dv9JlvAf1gl/x+bDvhBQ6juqE/iyDaUAKA+YgkDZFgI6ReKvCwVDMk7kZv114j9guv5K9m+Sf1sIGD1jVQBndPdfyf5N998pAIzpnwnh+j9+Qcz+K+O/i17632md/9Xsf5fq9m9xBQC3AeBykP7bYoBRAZjE33T/rwUFwIQpArjuf/e2dAtAnPx3Tpruv3H7/yiS//u5/2RdoE76t93UpoHdU2Le360BnEq6/lOpB0C8BaBLSP9d5z8dB/Cdf1EUUMm8T/StAqBrx22f5Key/7zh3+3Gnf+dn8ZjAEnnX5/tSI3/7oitAHdEUeDTxPAvkf77szjxl13/nl2x4V+vLQhI479IASBd/2caG/71zNz1CX+x679Y/+cVAK5YkFcBuITfFwL2BNm/7Py77n+vS+xni9z/5zD+izr9cZe/N1n9l1MB5Gb+HwYFQGoAWLjyr0j6/3lO+p8bA2At4NdW8v9lKQYWUkBopRLgcTPxa/WMfjOFglUtHCVYasJPx3+O7v/uB8XS//Hrf0b3HwCgRXz/j9Y/UTTb79YCfuvHxWv/fvO/TevkXyf+WbhCgLpW7Ly+ipKb3x8wRQDn6l/xRn/HTQHAyvxV0l8W33eSf9/5H4o7/6oIoKT/FSX9t6v+OkeM4V9l5IwtAJy3CgCb/I+ZDQAVPQZgnf/VCECW+FfHshj/wM/+e9m/7f6bZN9J/03XXxkAqvNub/rnFAB27d+EVADcEAqA60EJYBN5af7XZd3/u2yXv9P7ANywz8H8r2bn/p30X39XdPhrtggQuf/beX85HhBm+28Kl/9w3uOT/OAD4Lv3cu4/SfjVfVfODPAT7wUQFQR25BN/MzIQr/5zCX93tBLQJP1y9t8UC+TMf+POv3kvnv1X1+6doSAQigDOEDBd+XcnGhWQ6wJXJe7/Pdbwz3X7lQrAJ/7ymigAXOffJfy96co/N/u/u2jm331+P1xtou/N/5LE33xXJvr3vQ9AXgEQZP9SAbCqQAHQW2j+J2T/SeK/umEh4PPY+b+RAmCfKALYAoC+kjz/Us/yt9qFf6HrAZvt+C+2Y/9Vk/K3ega/1R3/xXbsSeybj+rW64UFgNXbb63gL3YAgBby5E9+NFPk7q+S/6LzJ19ZW39q4n/pZN8VAUqbj+irdu0fsHP6g25t3wk7w38sSu6Dqd9xK/U/bhP9EzqqQvKvY+i0dvVXXf+KTf71szb7cyGl/2f9yr/aqHP9P6+7/pXsXiX/vvu/xXT/q7b77+T/Nef67xQArvufrP7Tnf8JN/sv1v1NmO5/3O2/Hpn6+fl/XwD42M/7d8oZ/6Tj71b+mTO75s+t/Usc/4tn/uP5/9j476bo6Evp/21hBihc/ud0/P8knvmf/iSnBGg081/s+h+vAEzX/aXu/71SDbAr2QAQGf/djR3/d5oEv9v5AqQrAHcVyfvvRC7/q3KjAKEIULz2L2wCMEqAvPQ/GgOYvRfP+0vHf39+P3b/L3D9d/fRGMCe4AVgEv37BWsAH8zjBfAwmf0XBYBI3l9g/BeZAC7E9X8e479oDMDK//fZ+/2oAL5Oa/oWOxrQ6hn/Vq31+6pJ/R/1jH+rzf6Q+rc2unfdazD7f20vf6kDALSYf/Dy0K9865U1f1U0519kEvj3X/rP9XL/ET3X74oAOlSXP0vYywMnfFRsVAeOm4LAwAmf4LvP3HN5wCX/IemvRk7/p0zXfyhI/6s28Tcr/4wCwIRx/Nedf7Hyr6Jc/0ed7N92/3Xn30n+bfI/bpz/veGflvwbFYDu+Lv1f/bZGf/pzr/u+FvJ/4Rb+ycS/8kbsfR/6qPQ0d9W7Prv1wBO5hUDtcng8G8KAiISuX9NzP6n59L9v0es/kvd/4MawHb2t4eZf/N8OxoD6BHGf+4zdz5vou/k/jbhj9f9WW8A6QEgOv3BByB2/1fRm/gAyPPIHDAx/ut2fgDCCDBsAnDPd7z0P0r4Z+6G9X674zEAfb6rWPKfuv+7mX/d2Z8Js/5e5j+TSv7tVXf4xVaAPYnZn5zzn01VAE4JIDv+93PbAHptwl/Y2XdeALMPc8WAUASYQwWwN18I6M2NATQwBIy6/sEHYNVeUQTAEPCxl+i3yjRvuf/9VpvuLZer/5ct7W92jd9SzfZa4crfyu8TBbH//9YrW64VrP27+lf/5uXLv8Jf6gAAy8B3Xn3m382X+Ju1f5vq7f3v6Dn/ki4AHDHyf1UQ8Ov5Tum5/aqb27dR1VdbEBgKKoEw4+++Zzv8quM/ZBL/qk36zZq/M2bVn0r8bddfS//9qr+z9dr4ed3trzmX/1Ej/VdXk/Sbzn+n7fx3jpnuf9Hav86tofPvXP9V0m+S/8vC8f+ql/xrFYALl8A7yX/B3H/nNlcA+Nh3/jsnbhR3/kXBIKz8S1b9JZ1/7wHg5f63Ik8AZ/InPQAisz8v8Q8z/1L63xN1/2/lzP6c1L9o/V9RAcCoBD5tuAGgu8ADoDe3ASAYAPY4H4DEBFDed08HFUCPlfz3JJ1/1/VPpf/O+M8n/bvjrr9TDHjlQOL4Hzr9tvsvPACizr+c6Z8Rpn9SCZBsAPDvz97313j9n7n2COl/kPwnXf9IETC/+39QATyMrg1DqgCKDP+K1v95WX+DWf+CMyf9X+WVANnz/l+QpP+SFx5ateZvocqA5RoZ+Kq5+reqUNDs77VqZKDVBQLi/9Vr2f/fN1j79wx/oQMALBOzs7PfWPHKmhuNEn8X/2j/j+sdfcd0aLO//mM6+S+rq03+y4PCtM/J93WctB1999lJf66Sf530D572Rn8VJ/V3MWxHAEZO665/VZn+jZzTM/8V2/1X8n8z438ue86S/hGT/Cu5v5b9j1+wBoAXrdmf6f679X9V2/mXc//O/M/M+sfGfy7xV8Z/fu5/wqz8c3P/tcnr+fV/IqH3nX9VCJhwXf0b1gzwhp/xd2fO8V93+O3qv9q2MPevRwGs83+XnO/fHowA5cy/T/alB4Aw+ety16lbYjPA7VAMEDP+Ug0QeQFMh6Q/ZwK4I4wAyEJAd+QB8GmU9Hcn8n//+Q6jAvCJ/3QYBzCJfX4TQM90kP4bP4B47Z9L3PUowEzc8Q9mgHeCGmCXWAlovytVAPFVegDcjTwAVonCQM9M8ARwHgDeANArAT6z33XSfqcEuO/X/vWma/5mw+feAFCu/XNGgPMk/E4ZYN6xKoDZhwUjAA+Szv/DeO3fnnTt38M5ZP9fNDAD/Dzn/C/n/1fvi5UA+nmvKQIwCjB3Ertc7vrNdugXO9Pf7Kz+UmfuH7WEf6mFgVZ16Fs1q7/YmfuFFASW4gmAEqA10Zv9729l7GqR9P+j2dn6N/gLHQBgGfnuT9aunGsM4Pt/MF4v9R830XfcFgKUEuCYl+brEQAr21fd+06XzLtkf+iUMPMLyX112M32n7ZhvzdkZf/K6M91/kfCvL9Z93fOz/vrgoCe+bemf+NGAVAdc1dj/Fcbf1/P/Vdt91/J/k0B4FIoAHjp/2W/AtAn/878T3sAmCKAWf9n5P9+A4BP+E3X30v7p0Qnf1taAAgy/5o3DIy9AGpW+m/ObvrZf6cCkHP+XXb1X/f2WAEQpP9i9n9H7PLvTf+mzMq/oAAwyb5O7rcns/85D4DEDHB7kfO/Suhll19cndnfjk8it38ZvTtT53/n+H/HX9Ouf7wKMHH+3xnL/90awLSTL1cAhq7/neJ5f2/6d8/P/IeRgHvm+43k/zNx0t9r1/x5A8C0+5/K/yMlwGfxzH809//AFgBit/+wESCe+Q8jAKmz/4PCDn9vkQogmv138v+HhSaAxav/Cmb/9+bd/l3nX0ZcCDBBsv/4jw4s5/q/Vszmz1ckaFWn/6vS0V8us8Ci/xyrlmGEgAR+mbv/2d8XhWv/Jm+285c5AMAyo1asfPu13ztQ1Plf8coP6/9s+k91st+hk//jVgVw3Mzupx37XPf/VBgNGBZnQ/HVyf1d0l8Wodb8lbPQ6/6s239lJLj9V0fPesd/1/3X96PW9M+6/XfqxN92/u3sv4kP9No/lfxXt4RQMv/OiSt+3t+5/isfALf2z3gAFHX/b/hrl1ACePd+v/bvI7v2Tyb4H4nE/4YvGATXf7v2zyb+zgPAzPl/HEn+a2INoN4KsE16Acgk/6a/70q6/pEHgEvqnUKgIMkPUeT2/8mCnv154gHQLbcA7LBJ/3RYA+hc/50KIHreKWb+vQpAjADYhN9FkPvHM/6yw++T/l3x2IAPNz6w+24u8XcO/5EHgB8J+MwXDHQC7zwAvNv/Pd39l+7/bgNA7+4g+XdbAFznXyX+PaLT39vA/C/yBdjzIPEAkFsAHkamf8bhX3gCzD5sWBCIZ/8/j2X/cyb+JunvlYWAfV807v7vjRUAoTDgigG2CMBawEcy899M579VUvnlltwvdW3f4zrjP18CvtgOequ/t9gEfqkJPoWBJtb+Zf/fULz278pbrP0DAPiSWPHjH/zdou7/33tptt72wlv1lc+/qaPtueyqIjtrX/9OvS2L9nVv1ztUqPv1b9dL2bW0wYQ5fztcs8/MVZ2pd97WoX9DvW+jtDG7bnw3u2ax4WB2b6J942F7f0hHScWLh3WU1XWTiiPZ87Essuumo/WOLMqbj+lQ5x0vHs+uJ7LrsXql74SO0osn66XNKk7VS32n6+X+U1mcsfdZ9J2y19P6vDKQRXYt95/VUVExcLZeHTyvozJ4Lovz9bKKgex56D0d5cEsBrJw9zrO10vZO6V++77+frjKMGfv1av299S9juEL9WoSlaGis/fF+fv16ogJdVYRzzqG5fWieW/4og7zzkXxnMalgjP3/iXxublXZ+b8AxuXwnX0Ax+VERP6Obt2jn6ow9yH5079fnYds89jJqr63XDvziviXMd49uy+Y5/dmYraeDhL7/3zFnHdYo0jxy/Xq/6zy/5c/6541qqTLUZx4pQnxnxS/4FkntW9C/tc8+MqV7Ozq/5zo2C5aj0s5OjKVXsexlh8QUtfr9prKHJ1bg2fd269np1dDwoYbYB53Zthqs/1OxM29L0qit0w706a+9rWG/YzE+68a8KGfv5If9fERzbssyqWTdoze68LahPmvnubPRNRs+fd28J3ZNGrJ1HFLCaW+r3l+p35okuM/LTivcV+/6v276fR6He65olG7y30321V1KZMtOq9xX5/qf/+fN9r9P5Czxt9TjQf1a3XCgsAPbO3vs9f5AAAXyJPvrrmVZn8f/vl5+r/fPP/rD+19i/r//L3/yKKlc/+zBYD3jLXZw/oMx/Pqesb9bYs1HXlc+ba9rz67IB51vEz+7k9198/UH9ahX5PFR7eMp89f8BcXzhQb1+X/btZmOvP620vqHhbx8rsfqV/fsecrXs3OzuYvZ/F+nez75j7tnXq/lC9Y/2helsWK9cfNrHuiI729VlsOFJv23A0+1zdH83OjtY7Nh6tlzaq67F6x4Zj2bmL4/X2jSpO1Ns3ncg+P66v+nnjyXrHppPZ88l620YbG06Gd/17ITpeNKHu2zaaQkWHKlboOGWeN5/Sv9uRPbdnoa7qTBUzOuyzOm/fZM5Km09nn5+276nraV3oUKHu3Zm6mvMz9vmM/q56NhHu1Wchzorzs/7MnJ8N531nk/Pw7D7z5+653zyrokvJFl/MO+fia/+5enkg3Hf0mdBn9lkVXPS5Kryo84Hz+l6f23AFmZL+PPv+YIjKkPw8jvJQKP6oKA3K8/eyZ1v4UfeuIKSLQhfsZ+a+rAs9F/yzvh8yVxdl/XkS8rMh9ZsmTKHH3Jt33tdXVeRR5+F74bw6HJ7NNXtXFW/Ud3RRyBSGytm17K5DF/W9/2zIFopGL/lCkCn82ILQ6MVQCBIFIX0fxQf1si4AZd8ZyxeGZIEo96wKROI78rvuc10IGr8yb3RuiWMh35HfW+j7rfidynjz/95Co5L8e5V5/v1Gny/1dxp9b7nOG33eKBb7/nL/TqsjOLgXPy/0/YWeN/q8USz2/eX+HSLp/m+9/of8JQ4A8CXz6y+t/dUVr6z5a1cA+K1//1KW7GfJ/1obWeL/VBZPr31DJ+dPP6sSfxcHTKxV5z8zyfrzKon/mQ11/4a9f8Mm9G/6z5zC4KnsN9p0wv9mCKU8eCEL9c4LLt7SyoS253+uCwTtWcKvVARtNvnX9ypUsq8TflMAaFtnQhUBOtabIsDKdYey50M20T9sIkv+29abpF9Fx0aT9HdsMKGKACrh18n/+mP1Upboq2KAT9w3HdcJvbmapF8VAHTyL55NEcAUAFwRoMPeu99q2xjOdaK/6ZT+focLWwhQyX17dlXJvk7+XegigEn4dQJviwAm4T8lEv3T9nNRBHCJf58433w6SfjzhQCX6IfEXhYGwtUXAPpDsq/ufRFAJv794ay02ST7HX2uIHBOFwN8ot9vzkoybAHAFQHM5+dtYSAUAVzoYoBL/NXnOvG3Cf3AeXtuvlMZMooP/b5TawyFQoBO9AeNEsScm4S/ZIsBFfvslCKhCPCeTdxlIeC9XMLvigE+0R+OCwD+veFQBKgMiWLBsCsC2LCJvo7B98NnQ/Yzm+y7xN8pPHTiP2TVIiNBHaLftQl/2SlGRi/6ZL9zNBQBqiOiCJBdy/ZMJf0Vl6jrxP6Sv3fFAPd51SX7BQm/jrFQDHCFAfd+59jlphP3R1UYWK5E/st6b7GJeLP//kIT+oX++0v9vcctoZeJ7kIS7sUWBhZ6vtCEu9nfI6F/9FEZu/rXv7v1zq/ylzgAwKNQAbz2zIsq+f/uy31ZMv7nWcL/hikCqPiR6f6bZN524591hYADUagiQOM40PDqkn6T3Ked/zd111+HHkv4uQ5VBDCd/7etEkB0/9fZWB+Sf1UMaPf3h3SoIoDq/Ktkf+V62/lfbzv/KuHXyf8RXwRot4m/KgDoxH/9Md3577Ddf9253+SUACFZb4u6//muf5svIITOv3su2c6/UgC4xN91+n3n30YpUgCcLiwG6M6/HXnIFQJcQu+VAHHXPyT6MvE/m5yfTQoCZxsoAvJKgKjz3xcKAK5Q0CHeKffL757z3X+X6Kchu/8lm/i7zr9L6E3CHxQBvuvvxzrse4kCwBUH3PhGySb/rhhglADvhfNBWwgYsEm/TfR9d9++07DjPyQS+bQgMBy/VxYJf5r4B1WB6/xf8J1/nfTbAoAsBJTdvUv8vRLgolEI2MS/PBxGQlwRoCK6/6ZQcCm61x3+UdPxl0qAtONfHsl3/9POvysGuMKAvIbu/4fht0cvN0zIH7dEfbkT/OX4dypL6PA3WzBotvO/1I7/49rhX2ji3moFwFIT98UqB5rt2FMQeATd/y1X+/kLHADgEfGD//GDv/Xkq7//i3+886c6+X8qS/xdEUDfrzUJ/9M6UTeJ+dOi+9+mRwLeMqqA50RRwMr5VRffJ/bPHYg6/U/7jr8oMDxvEv+VtvuvCwMuydfJf3jWsv91xk9gZZb8r7TJ/0qV6L/gOv823AjAetP999J/K//XCoANQQHQ7jr/NvlXiX5pY172HxL3MAagO/9C/q9VABtO+mTfdfvbCgoBUVHgxVBIcCMAOnF38v9NIfFX9+02yZfSf5/w2xEAL/1POv7uPiT4cdc/3/GPQxYDpPQ/Svj7zuae/QjAZpH4i0KA7PiXhPzfjASYrr5O6EUxoEN0/mNVwPnwvpD9u86/GQ0wyX9JdP3dKIAaAXAFhPKgkP27goCX+JvPZPffjQBIJUDc3Q+Jf2nwQq7rXylI/EuJEsAl+VL6X0kKAVWX1AvZf0VK/YX036sChsMIQFnK/4dM4h8KAheFSiAZARgRPhCjogAQSf8/iKT/JmF3hQAzAhAl/FLW3+A+VQV0JkoAUwhQcXlZpPmPewFhqZ3yVv/7rU7QFzpi0GyCvlilwOMu4V/q+VIKDYtJxFutFCABf8Td/y1X7vfMvvlN/gIHAHiE/NOX/rjcseHI3o71B/eZOOyvpY0HQ6w/GD+noT8/bCL7bvuGg/tXrj+4X139fRbq8w77W5VN7+yvbHhnv7rvkL+/6eB+9VmHfS5vOra3Y9ORvaUXD++rvHhkn7pXZ+penbnPK/rz7Pf7TuwpZ1HqPzmrrh32vj2LUv9pf61k14q+Htf3pc3Z82Zz1plFlkRnz+aq7/tNuHP3bN5R3zu7W0X7ZhGbzmdxWkf2PR3psz7rF+eD2e8MZt/LfitLXLM4a+71ub3vN/fqrGT/zYr7fLM5K/ddmNHXgQsz5b5zM9XsWhvK7gfCfXXonL+6c3Omns9kz+f0swzznro376rvlAff3+W/l90XRZZE6kifG50v7r33wjvu88HwrKKW3ddGw7m6r4mrPx8ufo7O7e91jV3aqe47Ry7t7Br7UIe67xxx1xDqXRXpc6PzinjuHGt8rr83/uF019Ysxsx9HFem/edbr/gz82zO1NW97847R8VvjIrz5Pu5740XxRX/n8Pdm3/3ivjsmji/Nl0RZxXxfiX6vvzvl/7e3CHfr03c2OGie5sJeTbXOUE8yqhuvb5dRbPnS/1+o+c0lvq7C/335vv3i35vIf85idZGZevHv8Nf3gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPDY8P8BwCSEjkrwbyAAAAAASUVORK5CYII="/></g></g></svg>');
      putSvg ('.dropbox-icon, .dropbox-icon-small', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" role="img" width="32px" height="32px" viewBox="0 0 32 32" style="fill: rgb(0, 97, 255);"><title></title><path d="M8 2.4l8 5.1-8 5.1-8-5.1 8-5.1zm16 0l8 5.1-8 5.1-8-5.1 8-5.1zM0 17.7l8-5.1 8 5.1-8 5.1-8-5.1zm24-5.1l8 5.1-8 5.1-8-5.1 8-5.1zM8 24.5l8-5.1 8 5.1-8 5.1-8-5.1z"></path></svg>');
      putSvg ('.folder-icon', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 36 36" style="enable-background:new 0 0 36 36;" xml:space="preserve"><g><path d="M32.5,13.5H30V10c0-0.28-0.22-0.5-0.5-0.5H15.81l-1.86-3.72C13.86,5.61,13.69,5.5,13.5,5.5h-10C3.22,5.5,3,5.72,3,6v24   c0,0,0,0,0,0s0,0,0,0v0c0,0,0,0,0,0c0,0,0,0,0,0s0,0,0,0v0v0c0,0,0,0,0,0c0,0.13,0.05,0.24,0.13,0.33c0.03,0.03,0.06,0.06,0.1,0.08   c0,0,0,0,0,0c0.07,0.04,0.15,0.07,0.24,0.08c0.01,0,0.02,0,0.03,0c0,0,0,0,0.01,0H28.5c0.23,0,0.43-0.16,0.49-0.38l4-16   c0.04-0.15,0-0.31-0.09-0.43S32.65,13.5,32.5,13.5z M4,6.5h9.19l1.86,3.72c0.08,0.17,0.26,0.28,0.45,0.28H29v3H7.5   c-0.23,0-0.43,0.16-0.49,0.38L4,25.94V6.5z M28.11,29.5H4.14l3.75-15h23.97L28.11,29.5z"/></g></svg>');
      putSvg ('.up-icon', 'afterBegin', '<svg class="up-icon__svg" enable-background="new 0 0 23 33" viewBox="0 0 23 33" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m21.6 20.4h-5.2v-19.4c0-.6-.4-1-1-1h-7.8c-.6 0-1 .4-1 1v19.4h-5.2c-.3 0-.5.1-.7.3-.4.4-.4 1 0 1.4l10.1 10.1c.4.4 1 .4 1.4 0l10.1-10.1c.2-.2.3-.4.3-.7 0-.5-.5-1-1-1z" fill-rule="evenodd"/></svg>');
      putSvg ('.import-process-box-back-icon', 'afterBegin', '<svg class="import-process-box-back-icon__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 36"> <path d="M1,36c-0.2,0-0.4,0-0.5-0.2c-0.5-0.3-0.6-0.9-0.3-1.4L10.5,18L0.2,1.6C-0.1,1.1,0,0.5,0.5,0.2C0.9-0.1,1.6,0,1.8,0.5 l10.4,16.4c0.4,0.6,0.4,1.5,0,2.1L1.8,35.5C1.7,35.8,1.3,36,1,36z"/> </svg>');
      putSvg ('.selected-folder-deselect', 'afterBegin', '<svg class="selected-folder-deselect__icon" enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m15.9 8.8-.7-.7-3.2 3.2-3.2-3.2-.7.7 3.2 3.2-3.2 3.2.7.7 3.2-3.2 3.2 3.2.7-.7-3.2-3.2z"/></svg>');
   }],
   ['change', ['State', 'page'], {priority: -10000}, function (x) {
      if (B.get ('State', 'page') !== 'pics') return;
      if (! B.get ('Data', 'account')) B.do (x, 'query', 'account');
      if (! B.get ('State', 'query')) B.do (x, 'set', ['State', 'query'], {tags: [], sort: 'newest'});
      else B.do (x, 'query', 'pics');
      B.do (x, 'query', 'tags');
      B.do (x, 'change', ['State', 'selected']);
   }],
   ['change', ['State', 'query'], function (x) {
      if (! teishi.eq (x.path, ['State', 'query', 'recentlyTagged'])) B.do (x, 'set', ['State', 'nPics'], 20);
      B.do (x, 'query', 'pics');
   }],
   ['change', ['State', 'selected'], function (x) {
      c ('.pictures-grid__item-picture', function (pic) {
         pic.classList [B.get ('State', 'selected', pic.id) ? 'add' : 'remove'] ('selected');
      });
      var selectedPictures = dale.keys (B.get ('State', 'selected')).length > 0;
      var classes = {
         browse:   ['app-pictures',  'app-all-tags'],
         organise: ['app-organise', 'app-show-organise-bar', State.untag ? 'app-untag-tags' : 'app-attach-tags'],
      }
      var target = c ('#pics');
      if (! target) return;

      // This timeout is needed because on certain occasions, if the classes are changed before a redraw, the CSS won't be applied correctly.
      // Without the timeout, sidebar__inner remains transformed 50% to the left.
      setTimeout (function () {
         dale.do (classes, function (classes, mode) {
            dale.do (classes, function (v) {
               if (mode === 'browse')   target.classList [selectedPictures ? 'remove' : 'add']    (v);
               if (mode === 'organise') target.classList [selectedPictures ? 'add'    : 'remove'] (v);
            });
         });
      }, 0);

      if (B.get ('State', 'untag') && ! selectedPictures) B.do (x, 'rem', 'State', 'untag');

      if (! selectedPictures && B.get ('State', 'query', 'recentlyTagged')) {
         B.do (x, 'rem', ['State', 'query'], 'recentlyTagged');
         B.do (x, 'snackbar', 'green', 'You can find your pictures under the tags you just used.');
      }
   }],
   ['change', ['State', 'untag'], function (x) {
      var untag = B.get ('State', 'untag');
      var target = c ('#pics');
      target.classList.remove (untag ? 'app-attach-tags' : 'app-untag-tags');
      if (dale.keys (B.get ('State', 'selected')).length) target.classList.add (untag ? 'app-untag-tags'  : 'app-attach-tags');
   }],
   ['query', 'pics', function (x) {
      var query = B.get ('State', 'query');
      if (! query) return;

      B.do (x, 'post', 'query', {}, {tags: query.tags, sort: query.sort, from: 1, to: 10000, recentlyTagged: query.recentlyTagged}, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error getting your pictures.');

         B.do (x, 'set', ['Data', 'queryTags'], rs.body.tags);
         var selected = dale.obj (rs.body.pics, function (pic) {
            if (B.get ('State', 'selected', pic.id)) return [pic.id, true];
         });
         B.set (['State', 'selected'], selected);

         if (B.get ('State', 'open') === undefined) {
            B.do (x, 'set', ['Data', 'pics'], rs.body.pics);
            B.do (x, 'change', ['State', 'selected'], selected);
            return;
         }

         var open = B.get ('Data', 'pics') [B.get ('State', 'open')];
         var newOpen = dale.stopNot (rs.body.pics, undefined, function (pic, k) {
            if (pic.id === open.id) return k;
         });
         // If opened picture is no longer in query, exit open.
         if (newOpen === undefined) {
            B.do (x, 'set', ['Data', 'pics'], rs.body.pics);
            B.do (x, 'exit', 'fullscreen');
            return;
         }
         // Otherwise, update the index of the opened picture.
         // We first set the values, then trigger the change event, to prevent the picture flickering.
         B.set (['State', 'open'], newOpen);
         B.set (['Data', 'pics'], rs.body.pics);
         B.do (x, 'change', ['State', 'open']);
         B.do (x, 'change', ['Data', 'pics']);
         B.do (x, 'change', ['State', 'selected'], selected);

      });
   }],
   ['click', 'pic', function (x, id, k) {
      var last = B.get ('State', 'lastClick') || {time: 0};
      // If the last click was also on this picture and happened less than 500ms ago, we open the picture in fullscreen.
      if (last.id === id && teishi.time () - B.get ('State', 'lastClick').time < 500) {
         B.do (x, 'rem', ['State', 'selected'], id);
         B.do (x, 'set', ['State', 'open'], k);
         return;
      }

      B.do (x, 'set', ['State', 'lastClick'], {id: id, time: teishi.time ()});

      var lastIndex = dale.stopNot (B.get ('Data', 'pics'), undefined, function (pic, k) {
         if (pic.id === last.id) return k;
      });

      // Single select/unselect
      if (! B.get ('State', 'shift') || lastIndex === undefined) {
         if (! B.get ('State', 'selected', id)) return B.do (x, 'set', ['State', 'selected', id], true);
         else                                   return B.do (x, 'rem', ['State', 'selected'], id);
      }

      // Multiple select/unselect
      dale.do (dale.times (Math.max (lastIndex, k) - Math.min (lastIndex, k) + 1, Math.min (lastIndex, k)), function (k) {
         // Instead of triggering events for each picture, we directly override the value (to avoid triggering n redraws for n pictures).
         B.set (['State', 'selected', B.get ('Data', 'pics', k, 'id')], true);
      });
      // We manually trigger the change event.
      B.do (x, 'change', ['State', 'selected']);
   }],
   ['key', /down|up/, function (x, keyCode) {
      if (keyCode === 16) B.do (x, 'set', ['State', 'shift'], x.path [0] === 'down');
      if (keyCode === 13 && document.activeElement === c ('#newTag'))    B.do (x, 'tag', 'pics', true);
      if (keyCode === 13 && document.activeElement === c ('#uploadTag')) B.do (x, 'upload', 'tag', true);
   }],
   ['toggle', 'tag', function (x, tag) {
      var index = B.get ('State', 'query', 'tags').indexOf (tag);
      if (index > -1) {
         if (tag === 'untagged' && B.get ('State', 'query', 'recentlyTagged')) B.rem (['State', 'query'], 'recentlyTagged');
         return B.do (x, 'rem', ['State', 'query', 'tags'], index);
      }

      var isNormalTag = ! H.isYear (tag) && ! H.isGeo (tag);
      B.do (x, 'set', ['State', 'query', 'tags'], dale.fil (B.get ('State', 'query', 'tags'), undefined, function (existingTag) {
         if (existingTag === 'untagged' && isNormalTag) return;
         if (tag === 'untagged' && ! H.isYear (existingTag) && ! H.isGeo (existingTag)) return;
         return existingTag;
      }).concat (tag));
   }],
   ['select', 'all', function (x) {
      B.do (x, 'set', ['State', 'selected'], dale.obj (B.get ('Data', 'pics'), function (pic) {
         return [pic.id, true];
      }));
   }],
   ['query', 'tags', function (x) {
      B.do (x, 'get', 'tags', {}, '', function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error getting your tags.');
         B.do (x, 'set', ['Data', 'tags'], rs.body);
         if (! B.get ('State', 'query', 'tags')) return;
         var filterRemovedTags = dale.fil (B.get ('State', 'query', 'tags'), undefined, function (tag) {
            if (rs.body [tag]) return tag;
         });
         if (filterRemovedTags.length === B.get ('State', 'query', 'tags').length) return;
         B.do (x, 'set', ['State', 'query', 'tags'], filterRemovedTags);
      });
   }],
   ['tag', 'pics', function (x, tag, del, ev) {
      if (ev) ev.stopPropagation ();
      if (tag === true) tag = B.get ('State', 'newTag');
      if (! tag) return;
      if (del && ! confirm ('Are you sure you want to remove the tag ' + tag + ' from all selected pictures?')) return;
      if (['all', 'untagged'].indexOf (tag.toLowerCase ()) > -1) return B.do (x, 'snackbar', 'yellow', 'Sorry, you cannot use that tag.');
      if (H.isYear (tag) || H.isGeo (tag)) return B.do (x, 'snackbar', 'yellow', 'Sorry, you cannot use that tag.');

      var ids = dale.keys (B.get ('State', 'selected'));
      if (ids.length === 0) return;

      var query = B.get ('State', 'query');
      if (! del && query.tags.indexOf ('untagged') > -1) {
         dale.do (ids, function (id) {
            if ((query.recentlyTagged || []).indexOf (id) === -1) B.add (['State', 'query', 'recentlyTagged'], id);
         });
      }
      var payload = {tag: tag, ids: ids, del: del}
      B.do (x, 'post', 'tag', {}, payload, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error ' + (del ? 'untagging' : 'tagging') + ' the picture(s).');
         if (! del) B.do (x, 'snackbar', 'green', 'Just tagged ' + dale.keys (B.get ('State', 'selected')).length + ' picture(s) with tag ' + tag);
         B.do (x, 'query', 'pics');
         B.do (x, 'query', 'tags');
         if (tag === B.get ('State', 'newTag')) B.do (x, 'rem', 'State', 'newTag');
      });
   }],
   ['rotate', 'pics', function (x, deg, pic) {
      var pics = pic ? [pic.id] : dale.keys (B.get ('State', 'selected'));
      if (pics.length === 0) return;
      B.do (x, 'post', 'rotate', {}, {deg: deg, ids: pics}, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error rotating the picture(s).');
         B.do (x, 'query', 'pics');
      });
   }],
   ['delete', 'pics', function (x, deg) {
      var pics = dale.keys (B.get ('State', 'selected'));
      if (pics.length === 0) return;
      if (! confirm ('Are you sure you want to delete the ' + pics.length + ' selected pictures?')) return;
      B.do (x, 'post', 'delete', {}, {ids: pics}, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error deleting the picture(s).');
         B.do (x, 'query', 'pics');
         B.do (x, 'query', 'tags');
      });
   }],
   ['goto', 'tag', function (x, tag) {
      B.do ('set', ['State', 'selected'], {});
      B.do ('set', ['State', 'query', 'tags'], [tag]);
   }],
   ['scroll', [], function (x, e) {
      if (B.get ('State', 'page') !== 'pics') return;
      var lastScroll = B.get ('State', 'lastScroll');
      if (lastScroll && (Date.now () - lastScroll.time < 10)) return;
      B.do (x, 'set', ['State', 'lastScroll'], {y: window.scrollY, time: Date.now ()});
      if (lastScroll && lastScroll.y > window.scrollY) return;

      var lastPic = teishi.last (c ('.pictures-grid__item-picture'));
      if (! lastPic) return;

      if (window.innerHeight < lastPic.getBoundingClientRect ().top) return;

      if ((B.get ('Data', 'pics') || []).length <= B.get ('State', 'nPics')) return;

      B.do (x, 'set', ['State', 'nPics'], B.get ('State', 'nPics') + 20);
      B.do (x, 'change', ['State', 'selected']);
   }],
   ['change', [], {priority: -10000}, function (x) {
      if (B.get ('State', 'page') !== 'pics') return;
      if (! teishi.eq (x.path, ['Data', 'pics']) && ! teishi.eq (x.path, ['State', 'nPics']) && ! teishi.eq (x.path, ['Data', 'tags'])) return;
      // We fill the screen with pictures.
      var lastPic = teishi.last (c ('.pictures-grid__item-picture'));
      if (! lastPic) return;
      if (window.innerHeight < lastPic.getBoundingClientRect ().top) return;
      if ((B.get ('Data', 'pics') || []).length <= B.get ('State', 'nPics')) return;
      B.do (x, 'set', ['State', 'nPics'], B.get ('State', 'nPics') + 20);
   }],
   ['download', [], function (x) {
      var ids = dale.keys (B.get ('State', 'selected'));
      if (! ids.length) return;
      if (ids.length === 1) {
         var a = document.createElement ('a');
         a.href     = 'pic/' + ids [0];
         a.download = 'pic/' + ids [0];
         document.body.appendChild (a);
         a.click ();
         document.body.removeChild (a);
         return;
      }
      B.do (x, 'post', 'download', {}, {ids: ids}, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error downloading your picture(s).');
         window.open ('download/' + rs.body.id);
      });
   }],
   ['stop', 'propagation', function (x, ev) {
      ev.stopPropagation ();
   }],

   // *** OPEN RESPONDERS ***

   ['key', 'down', function (x, keyCode) {
      if (B.get ('State', 'open') === undefined) return;
      if (keyCode === 37) B.do (x, 'open', 'prev');
      if (keyCode === 39) B.do (x, 'open', 'next');
   }],
   ['enter', 'fullscreen', function (x) {
      document.body.style.overflow = 'hidden';
      dale.do (['requestFullScreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'], function (v) {
         if (type (document.documentElement [v]) === 'function') document.documentElement [v] ();
      });
      if (! window.ActiveXObject) return;
      var wscript = new ActiveXObject ('WScript.Shell');
      if (wscript) wscript.SendKeys ('{F11}');
   }],
   ['exit', 'fullscreen', function (x, exited) {
      document.body.style.overflow = '';
      if (B.get ('State', 'open') !== undefined) B.do (x, 'rem', 'State', 'open');
      if (exited) return;
      dale.do (['exitFullScreen', 'webkitExitFullscreen', 'mozCancelFullScreen', 'msExitFullscreen'], function (v) {
         if (type (document [v]) === 'function') document [v] ();
      });
      if (! window.ActiveXObject) return;
      var wscript = new ActiveXObject ('WScript.Shell');
      if (wscript) wscript.SendKeys ('{ESC}');
   }],
   ['change', ['State', 'open'], function (x) {
      var target = c ('#pics'), open = B.get ('State', 'open') !== undefined;
      if (! open) return target.classList.remove ('app-fullscreen');
      target.classList.add ('app-fullscreen');
      B.do (x, 'enter', 'fullscreen');
   }],
   ['open', /prev|next/, function (x) {
      var open = B.get ('State', 'open');
      if (x.path [0] === 'next') B.do (x, 'set', ['State', 'open'], B.get ('Data', 'pics', open + 1) ? open + 1 : 0);
      else                       B.do (x, 'set', ['State', 'open'], B.get ('Data', 'pics', open - 1) ? open - 1 : B.get ('Data', 'pics').length - 1);
   }],
   ['touch', 'start', function (x, ev) {
      if (B.get ('State', 'open') === undefined) return;
      B.do (x, 'set', ['State', 'lastTouch'], {x: ev.changedTouches [0].pageX, time: Date.now ()});
   }],
   ['touch', 'end', function (x, ev) {
      if (B.get ('State', 'open') === undefined) return;
      var lastTouch = B.get ('State', 'lastTouch');
      if (! lastTouch) return;
      B.do (x, 'rem', 'State', 'lastTouch');
      if (Date.now () - lastTouch.t > 1000) return;
      if (Math.abs (ev.changedTouches [0].pageX - lastTouch.x) < 100) return;
      if (ev.changedTouches [0].pageX > lastTouch.x) B.do (x, 'open', 'prev');
      else                                           B.do (x, 'open', 'next');
   }],
   ['goto', 'location', function (x, pic) {
      var url = 'https://www.google.com/maps/place/' + pic.loc [0] + ',' + pic.loc [1];
      var loc = window.open (url, '_blank');
      loc.focus ();
   }],

   // *** UPLOAD RESPONDERS ***

   ['change', ['State', 'page'], function (x) {
      if (B.get ('State', 'page') !== 'upload') return;
      if (! B.get ('Data', 'account')) B.do (x, 'query', 'account');
      if (! B.get ('Data', 'tags'))    B.do (x, 'query', 'tags');
   }],
   ['drop', 'files', function (x, ev) {
      if (B.get ('State', 'page') !== 'upload') return;
      dale.do (ev.dataTransfer.files, function (file) {
         if (window.allowedFormats.indexOf (file.type) === -1) B.add (['State', 'upload', 'new', 'format'], file.name);
         else                                                  B.add (['State', 'upload', 'new', 'files'], file);
      });
      // TODO: why do we need this timeout?
      setTimeout (function () {
         B.do (x, 'change', ['State', 'upload', 'new']);
      }, 0);
   }],
   ['upload', /files|folder/, function (x) {
      var input = c ('#' + x.path [0] + '-upload');
      dale.do (input.files, function (file) {
         if (window.allowedFormats.indexOf (file.type) === -1) B.add (['State', 'upload', 'new', 'format'], file.name);
         else                                                  B.add (['State', 'upload', 'new', 'files'], file);
      });
      B.do (x, 'change', ['State', 'upload', 'new']);
      input.value = '';
   }],
   ['upload', 'start', function (x) {
      var uid = Date.now ();
      dale.do (B.get ('State', 'upload', 'new', 'files'), function (file) {
         B.add (['State', 'upload', 'queue'], {uid: uid, file: file, tags: B.get ('State', 'upload', 'new', 'tags')});
      });
      B.do (x, 'rem', ['State', 'upload'], 'new');
      B.do (x, 'change', ['State', 'upload', 'queue']);
   }],
   ['upload', 'cancel', function (x, uid) {
      B.do (x, 'add', ['State', 'upload', 'cancelled'], uid);
      B.do (x, 'set', ['State', 'upload', 'queue'], dale.fil (B.get ('State', 'upload', 'queue'), undefined, function (file) {
         if (file.uid !== uid) return file;
      }));
   }],
   ['upload', 'tag', function (x, tag) {
      if (tag === true) tag = c ('#uploadTag').value;
      if (type (tag) !== 'string' || tag === '') return;
      if (H.isYear (tag) || tag === 'all' || tag === 'untagged') return B.do (x, 'snackbar', 'yellow', 'Sorry, you cannot use that tag.');
      B.do (x, 'add', ['State', 'upload', 'new', 'tags'], tag);
      B.do (x, 'rem', ['State', 'upload'], 'tag');
   }],
   ['change', ['State', 'upload', 'queue'], function (x) {
      var queue = B.get ('State', 'upload', 'queue');
      var MAXSIMULT = 2, uploading = 0;
      dale.stop (queue, false, function (file) {
         if (uploading === MAXSIMULT) return false;
         if (file.uploading) return uploading++;
         file.uploading = true;
         uploading++;

         var f = new FormData ();
         f.append ('lastModified', file.file.lastModified || file.file.lastModifiedDate || new Date ().getTime ());
         f.append ('uid', file.uid);
         f.append ('pic', file.file);
         if (file.tags) f.append ('tags', JSON.stringify (file.tags));
         B.do (x, 'set', ['State', 'upload', 'summary', file.uid, 'tags'], file.tags || []);
         B.do (x, 'post', 'upload', {}, f, function (x, error, rs) {
            dale.do (B.get ('State', 'upload', 'queue'), function (v, i) {
               if (v === file) B.do (x, 'rem', ['State', 'upload', 'queue'], i);
            });
            var lastFromUpload = ! dale.stopNot (B.get ('State', 'upload', 'queue'), undefined, function (v) {
               if (v.uid === file.uid) return v;
            });

            if (! error) B.do (x, 'add', ['State', 'upload', 'summary', file.uid, 'ok'], {id: rs.body.id, deg: rs.body.deg});
            else if (error && error.status === 409 && error.responseText.match ('repeated')) B.do (x, 'add', ['State', 'upload', 'summary', file.uid, 'repeat'], file.file.name);
            else {
               if (error.status === 409) {
                  B.do (x, 'set', ['State', 'upload', 'queue'], []);
                  return B.do (x, 'snackbar', 'yellow', 'Alas! You\'ve exceeded the maximum capacity for your account so you cannot upload any more pictures.');
               }
               B.do (x, 'add', ['State', 'upload', 'summary', file.uid, 'error'], {name: file.file.name, error: error.responseText});
               return B.do (x, 'snackbar', 'red', 'There was an error uploading your pictures.');
            }

            if (lastFromUpload) {
               var cancelled = B.get ('State', 'upload', 'cancelled').indexOf (file.uid) > -1;
               if (cancelled) {
                  B.do (x, 'snackbar', 'green', 'Upload cancelled successfully. ' + (B.get ('State', 'upload', 'summary', file.uid, 'ok') || []).length + ' pictures were uploaded.');
               }
               else B.do (x, 'snackbar', 'green', 'Upload completed successfully. You can see the pictures in the "View Pictures" section.');
            }

            B.do (x, 'query', 'account');
            B.do (x, 'query', 'tags');
            // If we're back in the pics page, refresh the query after each successful upload.
            if (B.get ('State', 'page') === 'pics') B.do (x, 'query', 'pics');
         });
      });
   }],

   // *** IMPORT RESPONDERS ***

   ['change', ['State', 'page'], function (x) {
      if (B.get ('State', 'page') !== 'import') return;
      if (! B.get ('Data', 'account')) B.do (x, 'query', 'account');
      if (! B.get ('Data', 'tags'))    B.do (x, 'query', 'tags');
   }],

   ['import', 'list', function (x, provider) {
      B.do (x, 'get', 'import/list/' + provider, {}, '', function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error retrieving the list of files.');
         if (rs.body.redirect) return location.replace (rs.body.redirect);
         B.do (x, 'set', ['Data', 'import', 'google'], rs.body);
      });
   }],

   // *** ACCOUNT RESPONDERS ***

   ['change', ['State', 'page'], function (x) {
      if (B.get ('State', 'page') !== 'account') return;
      if (! B.get ('Data', 'account')) B.do (x, 'query', 'account');
   }],

   ['query', 'account', function (x, cb) {
      B.do (x, 'get', 'account', {}, '', function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error getting your account information.');
         B.do (x, 'set', ['Data', 'account'], rs.body);
         if (cb) cb ();
      });
   }],

   ['dismiss', 'geo', function (x) {
      B.do (x, 'post', 'geo', {}, {operation: 'dismiss'}, function (x, error, rs) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error communicating with the server.');
         B.do (x, 'query', 'account');
         B.do (x, 'snackbar', 'green', 'Understood! You can always turn on geotagging from Account.');
      });
   }],

   ['toggle', 'geo', function (x) {
      var operation = B.get ('Data', 'account', 'geo') ? 'disable' : 'enable';
      B.do (x, 'post', 'geo', {}, {operation: operation}, function (x, error, rs) {
         if (error) {
            if (error.status === 409) {
               if (c ('#geoCheckbox')) c ('#geoCheckbox').checked = true;
               return B.do (x, 'snackbar', 'yellow', 'Geotagging is currently in process and cannot be disabled; please wait a few minutes and try again.');
            }
            return B.do (x, 'snackbar', 'red', 'There was an error ' + operation + 'd geotagging.');
         }
         if (operation === 'disable') {
            B.do (x, 'clear', 'updateGeotags');
            B.do (x, 'query', 'pics');
         }
         if (operation === 'enable') {
            B.do (x, 'set', ['State', 'updateGeotags'], setInterval (function () {
               B.do (x, 'query', 'account', function () {
                  B.do (x, 'query', 'pics');
                  if (! B.get ('Data', 'account', 'geoInProgress')) return B.do (x, 'clear', 'updateGeotags');
               });
            }, 3000));
         }
         B.do (x, 'query', 'account');
         B.do (x, 'snackbar', 'green', 'Geotagging ' + operation + 'd successfully. You can always change this from Account.');
      });
   }],

   ['clear', 'updateGeotags', function (x) {
      if (! B.get ('State', 'updateGeotags')) return;
      clearInterval (B.get ('State', 'updateGeotags'));
      B.do (x, 'rem', 'State', 'updateGeotags');
   }],

   ['submit', 'changePassword', function (x) {
      if (! c ('#password-current').value) return B.do (x, 'snackbar', 'yellow', 'Please enter your current password.');
      if (! c ('#password-new').value)     return B.do (x, 'snackbar', 'yellow', 'Please enter your new password.');
      if (c ('#password-new').value !== c ('#password-new-repeat').value) return B.do (x, 'snackbar', 'yellow', 'The repeated password does not match.');
      B.do (x, 'post', 'auth/changePassword', {}, {old: c ('#password-current').value, new: c ('#password-new').value}, function (x, error) {
         if (error) return B.do (x, 'snackbar', 'red', 'There was an error changing your password.');
         B.do (x, 'snackbar', 'green', 'Your password was changed successfully.');
         B.do (x, 'clear', 'changePassword');
      });
   }],

   ['clear', 'changePassword', function (x) {
      c ('#password-current').value     = '';
      c ('#password-new').value         = '';
      c ('#password-new-repeat').value  = '';
      B.do (x, 'rem', 'State', 'changePassword');
   }],

], function (v) {
   B.listen.apply (null, v);
});

// *** LOGO VIEW ***

E.logo = function (size) {
   return [
      ['span', {style: style ({'font-weight': 'bold', color: '#5b6eff', 'font-size': size})}, 'ac;pic'],
   ];
}

// *** BASE VIEW ***

E.base = function () {
   return [
      ['style', CSS.litc],
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
                  ['p', {class: 'auth-card__header-text'}, 'A home for your pictures'],
               ]],
               // Because the inputs' values are not controlled by gotoB, if they're recycled their values could appear in other inputs.
               // By setting the form to be opaque, we prevent them being recycled.
               ['form', {onsubmit: 'event.preventDefault ()', class: 'enter-form auth-card__form', opaque: true}, [
                  ['input', {id: 'auth-username', type: 'text', class: 'enter-form__input', placeholder: 'Username or email'}],
                  ['input', {id: 'auth-password', type: 'password', class: 'enter-form__input', placeholder: 'Password'}],
                  ['input', B.ev ({type: 'submit', class: 'enter-form__button enter-form__button--1 enter-form__button--submit', value: 'Log in'}, ['onclick', 'login', []])],
                  //['a', {href: '#/recover', class: 'enter-form__forgot-password'}, 'Forgot password?'],
                  ['a', B.ev ({class: 'enter-form__forgot-password'}, ['onclick', 'snackbar', 'green', 'Coming soon, hang tight!']), 'Forgot password?'],
                  ['a', B.ev ({class: 'enter-form__forgot-password'}, ['onclick', 'request', 'invite']), 'Don\'t have an account? Request an invite.'],
               ]]
            ]]
         ]],
      ]],
   ];
}

// *** SIGNUP VIEW ***

E.signup = function () {
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
                  ['p', {class: 'auth-card__header-text'}, 'A home for your pictures'],
               ]],
               // Because the inputs' values are not controlled by gotoB, if they're recycled their values could appear in other inputs.
               // By setting the form to be opaque, we prevent them being recycled.
               ['form', {onsubmit: 'event.preventDefault ()', class: 'enter-form auth-card__form', opaque: true}, [
                  ['input', {id: 'auth-username', type: 'username', class: 'enter-form__input', placeholder: 'Username'}],
                  ['input', {id: 'auth-password', type: 'password', class: 'enter-form__input', placeholder: 'Password'}],
                  ['input', {id: 'auth-confirm', type: 'password', class: 'enter-form__input', placeholder: 'Repeat password'}],
                  ['input', B.ev ({type: 'submit', class: 'enter-form__button enter-form__button--1 enter-form__button--submit', value: 'Create account'}, ['onclick', 'signup', []])],
               ]]
            ]]
         ]],
      ]],
   ];
}

// *** HEADER VIEW ***

E.header = function (showUpload, showImport) {
   return ['header', {class: 'header'}, [
      ['div', {class: 'header__brand'}, [
         ['div', {class: 'logo'}, ['a', {href: '#/pics'}, E.logo (24)]],
      ]],
      // MAIN MENU
      ['div', {class: 'header__menu'}, [
         ['ul', {class: 'main-menu'}, [
            ['li', {class: 'main-menu__item main-menu__item--pictures'}, ['a', {href: '#/pics', class: 'main-menu__item-link'}, 'View pictures']],
            ['li', {class: 'main-menu__item'},                           ['a', B.ev ({class: 'main-menu__item-link'}, H.stopPropagation (['onclick', 'snackbar', 'green', 'Coming soon, hang tight!'])), 'Manage tags']],
         ]]
      ]],
      // ACCOUNT MENU
      ['div', {class: 'header__user'}, [
         ['ul', {class: 'account-menu'}, [
            // TODO v2: add inline SVG
            ['li', {class: 'account-menu__item', opaque: true}, [
               ['ul', {class: 'account-sub-menu'}, [
                  ['li', {class: 'account-sub-menu__item'}, ['a', {href: '#/account', class: 'account-sub-menu__item-link'}, 'Account']],
                  ['li', {class: 'account-sub-menu__item'}, ['a', B.ev ({class: 'account-sub-menu__item-link'}, H.stopPropagation (['onclick', 'logout', []])), 'Logout']],
               ]],
            ]],
         ]],
      ]],
      //IMPORT BUTTON
      ['div', {class: 'header__import-button', style: style ({opacity: showImport ? '1' : '0'})}, ['a', {href: '#/import', class: 'button button--one'}, 'Import']],
      // UPLOAD BUTTON
      ['div', {class: 'header__upload-button', style: style ({opacity: showUpload ? '1' : '0'})}, ['a', {href: '#/upload', class: 'button button--one'}, 'Upload']],
   ]];
}

// *** EMPTY VIEW ***

E.empty = function () {
   return [
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
               ['p', {class: 'tip__text'}, ['You have no tags yet. ', ['a', {href: '#/upload'}, 'Upload'], ' some photos and add some tags.']],
            ]],
         ]],
         ['div', {class: 'sidebar__footer'}, [
            // TODO v2: add inline SVG
            ['div', {class: 'sidebar-search', opaque: true}, [
               ['input', {class: 'sidebar-search__input search-input', type: 'text', placeholder: 'Search for tag'}],
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
                  ['a', {href: '#/import', class: 'button button--one', style: style({'margin-right': '10px'})}, 'Import pictures'],
                  ['a', {href: '#/upload', class: 'button button--one'}, 'Upload pictures'],
               ]],
            ]],
         ]],
      ]],
   ];
}

// *** PICS VIEW ***

E.pics = function () {
   return ['div', B.ev ({id: 'pics', class: 'app-pictures app-all-tags'}, ['onclick', 'rem', 'State', 'selected']), [
      E.header (true, true),
      E.open (),
      // TODO v2: merge two elements into one
      B.view (['Data', 'pics'], function (x, pics) {
         return B.view (['Data', 'tags'], function (x, tags) {
            if (! pics || ! tags) return;
            if (tags.all === 0) return E.empty ();
            return [
               ['style', [
                  ['.tag-list__item--time', {width: 0.33, float: 'left'}],
                  ['.tag-list__item--geo-country', {width: 0.33, float: 'left'}],
                  ['.tag--bolded .tag__title', {color: CSS.vars ['color--one'], 'font-weight': 'bold'}],
                  ['.tag--bolded svg', {stroke: CSS.vars ['color--one'], 'stroke-width': 4}],
                  ['.clear-both', {clear: 'both'}],
               ]],
               ['div', {class: 'sidebar'}, [
                  ['div', {class: 'sidebar__inner'}, [
                     // Sidebar section View pictures
                     ['div', {class: 'sidebar__inner-section'}, [
                        ['div', {class: 'sidebar__header'}, [
                           ['div', {class: 'sidebar-header'}, [
                              ['h1', {class: 'sidebar-header__title'}, 'View pictures'],
                              // TODO v2: add inline SVG
                              // TODO: why must specify height so it looks exactly the same as markup?
                              ['div', {class: 'sidebar-header__filter-selected', opaque: true}],
                           ]],
                        ]],
                        // *** QUERY LIST ***
                        // TODO v2: merge two elements into one
                        B.view (['State', 'filter'], {attrs: {class: 'sidebar__tags'}}, function (x, filter) {
                           filter = (filter || '').trim ();
                           return B.view (['State', 'query', 'tags'], {tag: 'ul', attrs: {class: 'tag-list tag-list--sidebar tag-list--view'}}, function (x, selected) {
                              var geotagSelected = dale.stop (selected, true, function (tag) {
                                 return H.isGeo (tag);
                              });

                              return B.view (['Data', 'queryTags'], function (x, tags) {
                                 return B.view (['Data', 'account'], function (x, account) {
                                    if (! account) return;
                                    var firstGeo = true, suggestGeotagging = account.geo !== true;
                                    if (suggestGeotagging) dale.stop (account.logs, true, function (log) {
                                       if (log.a === 'geo' && log.op === 'dismiss') {
                                          suggestGeotagging = false;
                                          return true;
                                       }
                                    });

                                    var yearlist = dale.fil (tags, undefined, function (tag) {
                                       if (! H.isYear (tag)) return;
                                       if (B.get ('State', 'query', 'tags').indexOf (tag) > -1) return tag;
                                       if (! filter) return tag;
                                       if (tag.match (H.makeRegex (filter))) return tag;
                                    }).sort (function (a, b) {return a - b});

                                    var taglist = dale.fil (tags, undefined, function (tag) {
                                       if (H.isYear (tag)) return;
                                       if (B.get ('State', 'query', 'tags').indexOf (tag) > -1) return tag;
                                       if (! filter) return tag;
                                       if (tag.match (H.makeRegex (filter))) return tag;
                                    }).sort (function (a, b) {
                                       if (H.isCountry (a) && H.isCountry (b)) return a.toLowerCase () > b.toLowerCase () ? 1 : -1;
                                       if (H.isCountry (a) && ! H.isCountry (b)) return -1;
                                       if (! H.isCountry (a) && H.isCountry (b)) return 1;
                                       if (H.isGeo (a) && H.isGeo (b)) return a.toLowerCase () > b.toLowerCase () ? 1 : -1;
                                       if (H.isGeo (a) && ! H.isGeo (b)) return -1;
                                       if (! H.isGeo (a) && H.isGeo (b)) return 1;

                                       var aSelected = B.get ('State', 'query', 'tags').indexOf (a) > -1;
                                       var bSelected = B.get ('State', 'query', 'tags').indexOf (b) > -1;
                                       if (aSelected !== bSelected) return aSelected ? -1 : 1;
                                       return a.toLowerCase () > b.toLowerCase () ? 1 : -1;
                                    });
                                    var all      = teishi.eq (selected, []);
                                    var untagged = selected.indexOf ('untagged') > -1;
                                    var makeTag  = function (which) {
                                       // Ignore geotags for cities if no other (country) geotag is selected.
                                       if (H.isGeo (which) && ! H.isCountry (which) && ! geotagSelected) return;

                                       var tag = which;
                                       var action = H.stopPropagation (['onclick', 'toggle', 'tag', tag]);
                                       if (which === 'all') {
                                          var Class = 'tag-list__item tag tag--all-pictures' + (all ? ' tag--selected' : '');
                                          tag = 'All pictures';
                                          action = H.stopPropagation (['onclick', 'set', ['State', 'query', 'tags'], []]);
                                       }
                                       else if (which === 'untagged') {
                                          var Class = 'tag-list__item tag tag-list__item--untagged' + (untagged ? ' tag--selected' : '');
                                          var tag = 'Untagged';
                                          var action = H.stopPropagation (['onclick', 'toggle', 'tag', 'untagged']);
                                       }
                                       else if (H.isYear (which)) {
                                          var Class = 'tag-list__item tag tag-list__item--time' + (selected.indexOf (which) > -1 ? ' tag--bolded' : '');
                                       }
                                       else if (H.isGeo (which)) {
                                          var isCountry = H.isCountry (which);
                                          if (isCountry) {
                                             var Class = 'tag-list__item tag tag-list__item--geo-country';
                                             if (selected.indexOf (which) > -1) Class += ' tag--bolded';
                                             if (firstGeo) {
                                                Class += ' clear-both';
                                                firstGeo = false;
                                             }
                                          }
                                          else {
                                             var Class = 'tag-list__item tag tag-list__item--geo-city';
                                             if (selected.indexOf (which) > -1) Class += ' tag--selected';
                                          }
                                       }
                                       else {
                                          var Class = 'tag-list__item tag tag-list__item--' + H.tagColor (which) + (selected.indexOf (which) > -1 ? ' tag--selected' : '');
                                       }

                                       // TODO v2: add inline SVG
                                       return [
                                          ['li', B.ev ({class: Class, opaque: true}, action), [
                                             ['span', {class: 'tag__title'}, tag.replace (/^g::/, '')],
                                             // TODO: why must specify height so it looks exactly the same as markup?
                                             ['div', {class: 'tag__actions', style: style ({height: 24})}, [
                                                ['div', {class: 'tag-actions'}, [
                                                   // TODO v2: add inline SVG
                                                   ['div', {class: 'tag-actions__item tag-actions__item--selected', opaque: true}],
                                                   // TODO v2: add inline SVG
                                                   ['div', {class: 'tag-actions__item tag-actions__item--deselect', opaque: true}],
                                                   // TODO v2: add inline SVG
                                                   ['div', {class: 'tag-actions__item tag-actions__item--attach', opaque: true}],
                                                   // TODO v2: add inline SVG
                                                   ['div', {class: 'tag-actions__item tag-actions__item--attached', opaque: true}],
                                                   // TODO v2: add inline SVG
                                                   ['div', {class: 'tag-actions__item tag-actions__item--untag', opaque: true}],
                                                ]]
                                             ]]
                                          ]],
                                       ];
                                    }
                                    return [
                                       makeTag ('all'),
                                       makeTag ('untagged'),
                                       dale.do (yearlist, makeTag),
                                       H.if (suggestGeotagging, [
                                          ['p', {class: 'suggest-geotagging'}, [
                                             ['a', B.ev ({class: 'suggest-geotagging-enable'}, ['onclick', 'toggle', 'geo', true]), 'Turn on geotagging'],
                                             ['a', B.ev ({class: 'suggest-geotagging-dismiss'}, ['onclick', 'dismiss', 'geo']), 'Maybe later'],
                                          ]],
                                          ['br'],
                                       ]),
                                       dale.do (taglist, makeTag)
                                    ];
                                 });
                              });
                           });
                        }),
                     ]],
                     // Sidebar section -- Organise pictures
                     ['div', {class: 'sidebar__inner-section'}, [
                        ['div', B.ev ({class: 'sidebar__close-section-button'}, H.stopPropagation (['onclick', 'rem', 'State', 'selected'])), [
                           ['div', {class: 'cross-button cross-button--big'}, [
                              ['span', {class: 'cross-button__cross'}],
                           ]],
                        ]],
                        ['div', {class: 'sidebar__header'}, [
                           ['div', {class: 'sidebar-header'}, [
                              B.view (['State', 'selected'], {tag: 'h1', attrs: {class: 'sidebar-header__title'}}, function (x, selected) {
                                 return [
                                    'Organize pictures ',
                                    ['span', ['(', ['em', dale.keys (selected).length], ')']],
                                 ];
                              }),
                           ]],
                        ]],
                        ['div', {class: 'sidebar__switch'}, [
                           // Switch
                           ['div', {class: 'switch'}, [
                              ['ul', {class: 'switch-list'}, [
                                 ['li', B.ev ({class: 'switch-list__item'}, H.stopPropagation (['onclick', 'rem', 'State', 'untag'])), [
                                    // TODO v2: add inline SVG
                                    ['div', {class: 'switch-list__button switch-list__button--attach', opaque: true}, [
                                       ['span', {class: 'switch-list__button-text'}, 'Attach tag'],
                                    ]],
                                 ]],
                                 ['li', B.ev ({class: 'switch-list__item', style: style ({width: 110})}, H.stopPropagation (['onclick', 'set', ['State', 'untag'], true])), [
                                    // TODO v2: add inline SVG
                                    ['div', {class: 'switch-list__button switch-list__button--untag', opaque: true}, [
                                       ['span', {class: 'switch-list__button-text'}, 'Untag '],
                                       ['span', {class: 'switch-list__button-text-amount'}, ' '],
                                    ]],
                                 ]],
                              ]],
                           ]],
                        ]],
                        ['div', B.ev ({class: 'sidebar__attach-form'}, ['onclick', 'stop', 'propagation', {rawArgs: 'event'}]), [
                           B.view (['State', 'newTag'], {attrs: {class: 'attach-form'}}, function (x, newTag) {
                              return [
                                 ['h4', {class: 'sidebar__section-title'}, 'Attach new tag'],
                                 ['input', B.ev ({id: 'newTag', class: 'attach-form__input attach-input', type: 'text', placeholder: 'Add tag name', value: newTag}, ['oninput', 'set', ['State', 'newTag']])],
                                 ['div', B.ev ({style: style ({cursor: 'pointer', 'margin-left': 0.48, 'margin-top': 10}), class: 'button button--one'}, H.stopPropagation (['onclick', 'tag', 'pics', true])), 'Add new tag']
                              ];
                           }),
                        ]],
                        // TODO v2: merge two elements into one
                        B.view (['State', 'untag'], {attrs: {class: 'sidebar__tags'}}, function (x, untag) {
                           return B.view (['State', 'filter'], function (x, filter) {
                              filter = (filter || '').trim ();
                              return [
                                 ['h4', {class: 'sidebar__section-title sidebar__section-title--untag'}, 'Remove current tags'],
                                 // *** TAG/UNTAG LIST ***
                                 B.view (['State', 'selected'], {tag: 'ul', attrs: {class: 'tag-list tag-list--attach'}}, function (x, selected) {
                                    var selectedTags = {};
                                    if (selected) dale.do (B.get ('Data', 'pics'), function (pic) {
                                       if (! selected [pic.id]) return;
                                       dale.do (pic.tags, function (tag) {
                                          if (! selectedTags [tag]) selectedTags [tag] = 0;
                                          selectedTags [tag]++;
                                       });
                                    });
                                    var editTags = dale.fil (tags, undefined, function (number, tag) {
                                       if (H.isYear (tag) || H.isGeo (tag) || tag === 'all' || tag === 'untagged') return;
                                       if (filter) {
                                          if (! tag.match (H.makeRegex (filter))) return;
                                       }
                                       if (! selectedTags [tag]) selectedTags [tag] = 0;
                                       return tag;
                                    }).sort (function (a, b) {
                                       if (selectedTags [a] !== selectedTags [b]) return selectedTags [b] - selectedTags [a];
                                       return a.toLowerCase () > b.toLowerCase () ? 1 : -1;
                                    });

                                    return dale.do (editTags, function (tag) {
                                       var attached = untag ? selectedTags [tag] : selectedTags [tag] === dale.keys (selected).length;
                                       // TODO v2: add inline SVG
                                       return ['li', B.ev ({class: 'tag-list__item tag tag-list__item--' + H.tagColor (tag) + (attached ? ' tag--attached' : ''), opaque: true}, H.stopPropagation (['onclick', 'goto', 'tag', tag])), [
                                          ['span', {class: 'tag__title'}, tag],
                                          ['div', B.ev ({class: 'tag__actions'}, H.stopPropagation (['onclick', 'tag', 'pics', tag, untag, {rawArgs: 'event'}])), [
                                             ['div', {class: 'tag-actions'}, [
                                                // TODO v2: add inline SVG
                                                ['div', {class: 'tag-actions__item tag-actions__item--selected', opaque: true}],
                                                // TODO v2: add inline SVG
                                                ['div', {class: 'tag-actions__item tag-actions__item--deselect', opaque: true}],
                                                // TODO v2: add inline SVG
                                                ['div', {class: 'tag-actions__item tag-actions__item--attach', opaque: true}],
                                                // TODO v2: add inline SVG
                                                ['div', {class: 'tag-actions__item tag-actions__item--attached', opaque: true}],
                                                // TODO v2: add inline SVG
                                                ['div', {class: 'tag-actions__item tag-actions__item--untag', opaque: true}],
                                             ]],
                                          ]],
                                       ]];
                                    });
                                 }),
                              ];
                           });
                        })
                     ]],
                  ]],

                  // SIDEBAR SEARCH
                  B.view (['State', 'query'], {attrs: B.ev ({class: 'sidebar__footer'}, ['onclick', 'stop', 'propagation', {rawArgs: 'event'}])}, function (x, query) {
                     var tags = query ? query.tags : [];
                     return [
                        B.view (['State', 'filter'], {attrs: {class: 'sidebar-search', opaque: true}}, function (x, filter) {
                           return ['input', B.ev ({class: 'sidebar-search__input search-input', type: 'text', value: filter, placeholder: tags.length ? 'Filter tags' : 'Search for tag'}, ['oninput', 'set', ['State', 'filter']])];
                        }),
                        // DONE TAGGING BUTTON
                        B.view (['State', 'selected'], function (x, selected) {
                           if (tags.indexOf ('untagged') > -1 && dale.keys (selected).length) return ['div', B.ev ({class: 'done-tagging-button button'}, H.stopPropagation (['onclick', 'rem', 'State', 'selected'])), 'Done tagging'];
                        }),
                     ];
                  }),
               ]],
               // ORGANISE BAR
               B.view (['State', 'selected'], {tag: 'div', attrs: {class: 'organise-bar'}}, function (x, selected) {
                  return ['div', {class: 'organise-bar__inner'}, [
                     ['div', {class: 'organise-bar__selected'}, [
                        ['div', {class: 'selected-box'}, [
                           // TODO v2: add inline SVG
                           ['span', B.ev ({class: 'selected-box__close', opaque: true}, H.stopPropagation (['onclick', 'rem', 'State', 'selected']))],
                           ['span', {class: 'selected-box__count'}, dale.keys (selected).length],
                        ]],
                        ['p', {class: 'organise-bar__selected-title'}, 'Selected'],
                     ]],
                     // TODO v2: add inline SVG
                     ['div', B.ev ({class: 'organise-bar__button organise-bar__button--select-all', opaque: true}, H.stopPropagation (['onclick', 'select', 'all'])), [
                        ['span', {class: 'organise-bar__button-title'}, 'Select all'],
                     ]],
                     ['div', B.ev ({class: 'organise-bar__button organise-bar__button--rotate'}, H.stopPropagation (['onclick', 'rotate', 'pics', 90])), [
                        // TODO v2: add inline SVG
                        ['div', {class: 'organise-bar__button-icon-container', opaque: true}],
                        ['span', {class: 'organise-bar__button-title'}, 'Rotate'],
                     ]],
                     // TODO v2: add inline SVG
                     ['div', B.ev ({class: 'organise-bar__button organise-bar__button--select-all', opaque: true}, H.stopPropagation (['onclick', 'rem', 'State', 'selected'])), [
                        ['span', {class: 'organise-bar__button-title'}, 'Unselect all'],
                     ]],
                     ['div', B.ev ({class: 'organise-bar__button organise-bar__button--download', opaque: true}, H.stopPropagation (['onclick', 'download', []])), [
                        ['span', {class: 'organise-bar__button-title'}, 'Download'],
                     ]],
                     // TODO v2: add inline SVG
                     ['div', B.ev ({class: 'organise-bar__button organise-bar__button--delete', opaque: true}, H.stopPropagation (['onclick', 'delete', 'pics'])), [
                        ['span', {class: 'organise-bar__button-title'}, 'Delete'],
                     ]],
                  ]];
               }),
               // MAIN
               ['div', {class: 'main main--pictures'}, [
                  ['div', {class: 'main__inner'}, [
                     B.view (['State', 'selected'], {attrs: {class: 'pictures-header'}}, function (x, selected) {
                        selected = dale.keys (selected).length;
                        return [
                           ['h2', {class: 'pictures-header__title page-title'}, [pics.length + ' pictures', H.if (selected, [', ', selected, ' selected'])]],
                           ['div', {class: 'pictures-header__action-bar'}, [
                              ['div', {class: 'pictures-header__selected-tags'}, [
                                 B.view (['State', 'query', 'tags'], {tag: 'ul', attrs: {class: 'tag-list-horizontal'}}, function (x, tags) {
                                    return dale.do (tags, function (tag) {
                                       var Class = 'tag tag-list-horizontal__item ';
                                       if (H.isGeo (tag)) Class += H.isCountry (tag) ? 'tag-list__item--geo-country' : 'tag-list__item--geo-city';
                                       else               Class += 'tag-list-horizontal__item--' + H.tagColor (tag);
                                       // TODO v2: add inline SVG
                                       return ['li', {class: Class, opaque: true}, [
                                          ['span', {class: 'tag__title'}, tag === 'untagged' ? 'Untagged' : tag.replace (/^g::/, '')],
                                          // TODO: why must specify height so it looks exactly the same as markup?
                                          ['div', {class: 'tag__actions', style: style ({height: 24})}, [
                                             ['div', {class: 'tag-actions'}, [
                                                // TODO v2: add inline SVG
                                                ['div', B.ev ({class: 'tag-actions__item tag-actions__item--deselect', opaque: true, style: style ({height: 24})}, H.stopPropagation (['onclick', 'toggle', 'tag', tag]))],
                                             ]],
                                          ]],
                                       ]];
                                    });
                                 }),
                              ]],
                              ['div', {class: 'pictures-header__sort'}, [
                                 B.view (['State', 'query'], {attrs: {class: 'dropdown'}}, function (x, query) {
                                    if (! query) return;
                                    return [
                                       ['div', {class: 'dropdown__button'}, query.sort === 'upload' ? 'recently uploaded' : query.sort],
                                       ['ul', {class: 'dropdown__list'}, [
                                          dale.do (['newest', 'oldest', 'upload'], function (sort) {
                                             return ['li', B.ev ({class: 'dropdown__list-item'}, H.stopPropagation (['onclick', 'set', ['State', 'query', 'sort'], sort])), sort === 'upload' ? 'recently uploaded' : sort];
                                          })
                                       ]],
                                    ];
                                 }),
                              ]],
                           ]],
                        ];
                     }),
                     // PICTURES GRID
                     ['div', {class: 'pictures-grid'}, E.grid ()],
                  ]],
               ]],
            ];
         });
      })
   ]];
}

// *** GRID VIEW ***

E.grid = function () {
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
      // TODO v2: merge two elements into one
      B.view (['State', 'nPics'], function (x, nPics) {
         if (! nPics) return;
         return B.view (['Data', 'pics'], {attrs: {style: style ({'min-height': window.innerHeight})}}, function (x, pics) {
            return dale.do (pics.slice (0, nPics), function (pic, k) {
               var askance = pic.deg === 90 || pic.deg === -90;
               var rotation = ! pic.deg ? undefined : dale.obj (['', '-ms-', '-webkit-', '-o-', '-moz-'], function (v) {
                  return [v + 'transform', (askance ? 'translateY(-100%) ' : '') + 'rotate(' + pic.deg + 'deg)'];
               });
               rotation = ! pic.deg ? undefined : dale.obj (['', '-ms-', '-webkit-', '-o-', '-moz-'], rotation, function (v) {
                  if (pic.deg === 90)  return [v + 'transform-origin', 'left bottom'];
                  if (pic.deg === -90) return [v + 'transform-origin', 'right bottom'];
               });
               // 122w 224h 102m-left

               // If following the CSS rules only:
               // 140: 6, 11, 16, 21, 26
               // 180: 2, 5, 8, 14, 17, 20, 23
               // 240: 15, 19, 27
               // 100: rest
               //if (k > 10 && ((k - 7) % 4) === 0) frameWidth = 240;
               //if (((k + 1) % 3) === 0)           frameWidth = 180;
               //if (k > 5 && ((k - 1) % 5) === 0)  frameWidth = 140;

               var picWidth = askance ? pic.dimh : pic.dimw, picHeight = askance ? pic.dimw : pic.dimh;
               var picRatio = picWidth / picHeight;

               // padding right: 16px, padding left: 18px
               var frameHeight = 140 - 18, frameWidth, sizes = [100 - 16, 140 - 16, 180 - 16, 240 - 16];
               if      (picRatio <= (sizes [0] / frameHeight)) frameWidth = sizes [0];
               else if (picRatio <= (sizes [1] / frameHeight)) frameWidth = sizes [1];
               else if (picRatio <= (sizes [2] / frameHeight)) frameWidth = sizes [2];
               else    frameWidth = sizes [3];

               // TODO: understand this magic number.
               if (pic.deg === -90) var margin = dale.obj ([[sizes [0], -36], [sizes [1], 0], [sizes [2], 42], [sizes [3], 102]], function (v) {
                  return [v [0], v [1]];
               });

               return ['div', {class: 'pictures-grid__item', style: style ({'z-index': '1', width: frameWidth + 16})}, [
                  ['div', B.ev ({
                     class: 'pictures-grid__item-picture',
                     id: pic.id,
                  }, H.stopPropagation (['onclick', 'click', 'pic', pic.id, k])), [
                     ['div', {
                        class: 'inner',
                        style: style ({
                           'border-radius': 'inherit',
                           width: askance ? frameHeight : frameWidth,
                           height: askance ? frameWidth : frameHeight,
                           'background-image': 'url(thumb/200/' + pic.id + ')',
                           'background-position': 'center',
                           'background-repeat': 'no-repeat',
                           'background-size': 'cover',
                           'margin-left': pic.deg !== -90 ? 0 : margin [frameWidth],
                           rotation: rotation,
                        }),
                     }],
                     pic.vid ? ['div', {class: 'video-playback', opaque: true}] : [],
                     ['div', {class: 'mask'}],
                     ['div', {class: 'caption'}, [
                        //['span', [['i', {class: 'icon ion-pricetag'}], ' ' + pic.tags.length]],
                        ['span', {style: style ({position: 'absolute', right: 5})}, H.dateFormat (pic.date)],
                     ]],
                  ]],
               ]];
            });
         });
      })
   ];
}

// *** OPEN VIEW ***

E.open = function () {
   return B.view (['State', 'open'], {attrs: {class: 'fullscreen'}}, function (x, open) {
      if (open === undefined) return;
      // TODO v2: merge two elements into one
      return B.view (['Data', 'pics'], {attrs: {class: 'fullscreen'}}, function (x, pics) {
         var pic = pics [open], next = pics [open + 1];

         var askance = pic.deg === 90 || pic.deg === -90;
         var rotation = ! pic.deg ? undefined : dale.obj (['', '-ms-', '-webkit-', '-o-', '-moz-'], function (v) {
            return [v + 'transform', 'rotate(' + pic.deg + 'deg)'];
         });
         rotation = ! pic.deg ? undefined : dale.obj (['', '-ms-', '-webkit-', '-o-', '-moz-'], rotation, function (v) {
            return ['transform-origin', 'center center'];
         });

         return [
            // TODO v2: add inline SVG
            ['div', B.ev ({class: 'fullscreen__close', opaque: true}, ['onclick', 'exit', 'fullscreen'])],
            // TODO v2: add inline SVG
            ['div', B.ev ({class: 'fullscreen__nav fullscreen__nav--left', opaque: true}, ['onclick', 'open', 'prev'])],
            // TODO v2: add inline SVG
            ['div', B.ev ({class: 'fullscreen__nav fullscreen__nav--right', opaque: true}, ['onclick', 'open', 'next'])],
            ['div', {class: 'fullscreen__date'}, [
               ['span', {class: 'fullscreen__date-text'}, H.dateFormat (pic.date)],
            ]],
            ['style', media ('screen and (max-width: 767px)', [
               ['.fullscreen__image-container', {padding: 0}],
            ])],
            ['div', {class: 'fullscreen__image-container', style: style ({width: ! askance ? 1 : '100vh', height: ! askance ? 1 : '100vw', rotation: rotation})}, [
               ! pic.vid ? ['img', {class: 'fullscreen__image', src: 'thumb/900/' + pic.id, alt: 'picture'}] : ['video', {ontouchstart: 'event.stopPropagation ()', class: 'fullscreen__image', controls: true, autoplay: true, src: 'pic/' + pic.id, type: 'video/mp4', poster: 'thumb/900/' + pic.id, preload: 'auto'}],
            ]],
            ['div', {class: 'fullscreen__actions'}, [
               H.if (! pic.vid, ['div', B.ev ({style: style ({'margin-right': 15}), class: 'fullscreen__action'}, ['onclick', 'rotate', 'pics', 90, pic]), [
                  // TODO v2: add inline SVG
                  ['div', {class: 'fullscreen__action-icon-container fullscreen__action-icon-container-rotate', opaque: true}],
                  ['div', {class: 'fullscreen__action-text'}, 'Rotate'],
               ]]),
               ! pic.loc ? [] : ['div', B.ev ({class: 'fullscreen__action'}, ['onclick', 'goto', 'location', pic]), [
                  // TODO v2: add inline SVG
                  ['div', {class: 'fullscreen__action-icon-container geotag--open-pictures', opaque: true}],
                  ['div', {class: 'fullscreen__action-text'}, 'Location'],
               ]]
            ]],
            ['div', {class: 'fullscreen__count'}, [
               ['span', {class: 'fullscreen__count-current'}, open + 1],
               '/',
               ['span', {class: 'fullscreen__count-total'}, pics.length],
            ]],
            next ? ['img', {src: 'thumb/900/' + next.id, style: style ({display: 'none'})}] : [],
         ];
      });
   });
}

// *** UPLOAD VIEW ***

E.upload = function () {
   return ['div', [
      ['style', ['.upload-box__image-pic svg', {display: 'none'}]],
      E.header (true, true),
      ['div', {class: 'main-centered'}, [
         ['div', {class: 'main-centered__inner max-width--m'}, [
            E.noSpace (),
            // PAGE HEADER
            ['div', {class: 'page-header'}, [
               ['h1', {class: 'page-header__title page-title'}, 'Upload pictures'],
               ['h2', {class: 'page-header__subtitle page-subtitle'}, 'Start organizing your pictures'],
            ]],
            ['div', {class: 'page-section'}, [
               // UPLOAD BOX
               B.view (['State', 'upload', 'summary'], {tag: 'ul', attrs: {class: 'upload-box-list'}}, function (x, summary) {
                  return [
                     ['li', {class: 'upload-box-list__item'}, [
                        // UPLOAD BOX
                        ['div', {class: 'upload-box'}, [
                           ['input', B.ev ({id: 'files-upload',  type: 'file', multiple:  true, style: style ({display: 'none'})}, ['onchange', 'upload', 'files'])],
                           ['input', B.ev ({id: 'folder-upload', type: 'file', directory: true, webkitdirectory: true, mozdirectory: true, style: style ({display: 'none'})}, ['onchange', 'upload', 'folder'])],
                           // TODO v2: add inline SVG
                           ['div', {class: 'upload-box__image', opaque: true}],
                           ['div', {class: 'upload-box__main'}, [
                              // UPLOAD BOX SECTION
                              B.view (['Data', 'account'], {attrs: {class: 'upload-box__section'}}, function (x, account) {
                                 var noSpace = account && account.usage.fsused >= account.usage.limit;
                                 return [
                                    ['h3', {class: 'upload-box__section-title'}, 'Upload files'],
                                    // DRAG & DROP
                                    // TODO v2: add inline SVG
                                    ['div', {draggable: noSpace ? false : undefined, class: 'drag-and-drop', opaque: true}, H.isMobile () ? [
                                       ['div', {style: style ({cursor: 'pointer', float: 'left', display: 'inline-block', 'margin-right': 10}), class: 'button button--one', onclick: 'c ("#files-upload").click ()'}, 'Upload files'],
                                    ] : [
                                       'Drag and drop photos here or ',
                                       ['br'], ['br'],
                                       ['div', [
                                          ['div', {style: style ({float: 'left', display: 'inline-block', 'margin-right': 10}), class: 'button button--one' + (noSpace ? ' blocked-button' : ''), onclick: noSpace ? '' : 'c ("#files-upload").click ()'}, 'Upload files'],
                                          ['div', {style: style ({float: 'left', display: 'inline-block'}), class: 'button button--one' + (noSpace ? ' blocked-button' : ''), onclick: noSpace ? '' : 'c ("#folder-upload").click ()'}, 'Upload folder'],
                                       ]],
                                    ]],
                                    // UPLOAD SELECTION
                                    B.view (['State', 'upload', 'new'], {attrs: {class: 'upload-box__selection'}}, function (x, newUpload) {
                                       var selected = B.get ('State', 'upload', 'new', 'files')  || [];
                                       var format   = B.get ('State', 'upload', 'new', 'format') || [];
                                       return [
                                          // TODO v2: add inline SVG
                                          ['div', {class: 'upload-selection', opaque: true}, [
                                             ['p', {class: 'upload-selection__text'}, (! selected.length ? 'No' : selected.length) + ' pictures selected'],
                                              H.if (selected.length, ['div', B.ev ({class: 'upload-selection__remove'}, [
                                                ['onclick', 'rem', ['State', 'upload'], 'new'],
                                             ]), [
                                                ['div', {class: 'cross-button'}, ['span', {class: 'cross-button__cross'}]],
                                             ]]),
                                          ]],
                                          // TODO v2: add inline SVG
                                          H.if (format.length, ['div', {opaque: true, class: 'upload-selection no-svg', style: style ({color: CSS.vars ['color--remove']})}, [
                                             ['style', ['.no-svg svg', {display: 'none'}]],
                                             ['p', {class: 'upload-selection__text'}, [
                                                [format.length, ' files have unsupported formats and will be ignored:'],
                                                ['ul', dale.do (format, function (file) {return ['li', file]})]
                                             ]]
                                          ]]),
                                       ];
                                    }),
                                    // UPLOAD BOX SECTION
                                    B.view (['State', 'upload', 'new'], function (x, newUpload) {
                                       if (! B.get ('State', 'upload', 'new', 'files')) return;
                                       return ['div', {class: 'upload-box__section'}, [
                                          ['h3', {class: 'upload-box__section-title'}, 'Attach tags'],
                                          // TODO v2: merge two elements into one
                                          B.view (['Data', 'tags'], {attrs: {class: 'upload-box__search'}}, function (x, tags) {
                                             // SEARCH FORM
                                             return B.view (['State', 'upload', 'tag'], {attrs: {class: 'search-form'}}, function (x, filter) {
                                                var Tags = dale.fil (tags, undefined, function (v, tag) {
                                                   if (H.isYear (tag) || H.isGeo (tag) || tag === 'all' || tag === 'untagged') return;
                                                   if ((B.get ('State', 'upload', 'new', 'tags') || []).indexOf (tag) > -1) return;
                                                   if (filter === undefined || filter.length === 0) return tag;
                                                   if (tag.match (H.makeRegex (filter))) return tag;
                                                });
                                                if (filter && dale.keys (tags).indexOf (filter) === -1) {
                                                   if (! H.isYear (filter) && ! H.isGeo (filter) && filter !== 'all' && filter !== 'untagged') Tags.unshift (filter + ' (new tag)');
                                                }
                                                return [
                                                   ['input', B.ev ({autocomplete: 'off', value: filter, id: 'uploadTag', class: 'search-form__input search-input', type: 'text', placeholder: 'Add existing or new tags'}, ['oninput', 'set', ['State', 'upload', 'tag']])],
                                                   // TODO v2: add inline SVG, remove span
                                                   ['span', {class: 'search-form-svg', opaque: true}],
                                                   ['div', {class: 'search-form__dropdown'}, [
                                                      // TAG LIST DROPDOWN
                                                      ['ul', {class: 'tag-list-dropdown'}, dale.do (Tags, function (tag) {
                                                         return ['li', B.ev ({class: 'tag-list-dropdown__item', style: style ({cursor: 'pointer'})}, ['onclick', 'upload', 'tag', tag]), [
                                                            // TODO v2: add inline SVG
                                                            ['div', {class: 'tag tag-list__item--' + H.tagColor (tag), opaque: true}, [
                                                               ['span', {class: 'tag__title'}, tag]
                                                            ]],
                                                         ]];
                                                      })],
                                                   ]],
                                                ];
                                             });
                                          }),
                                          // TAG LIST HORIZONTAL
                                          ['ul', {class: 'tag-list-horizontal'}, [
                                             dale.do (newUpload.tags, function (tag, k) {
                                                // TODO v2: add inline SVG
                                                return ['li', {class: 'tag-list-horizontal__item tag tag-list__item--' + H.tagColor (tag), opaque: true}, [
                                                   ['span', {class: 'tag__title'}, tag],
                                                   // TODO: why must specify height so it looks exactly the same as markup?
                                                   ['div', B.ev ({class: 'tag__actions', style: style ({height: 24})}, ['onclick', 'rem', ['State', 'upload', 'new', 'tags'], k]), [
                                                      ['div', {class: 'tag-actions'}, [
                                                         // TODO v2: add inline SVG
                                                         // TODO: why must specify height so it looks exactly the same as markup?
                                                         ['div', {class: 'tag-actions__item tag-actions__item--deselect', opaque: true, style: style ({height: 24})}],
                                                      ]],
                                                   ]],
                                                ]];
                                             }),
                                          ]],
                                          ['div', [
                                             ['br'], ['br'],
                                             ['div', B.ev ({style: style ({float: 'left', width: 'inherit', 'margin-right': 10}), class: 'upload-box__section upload-box__section--buttons'}, ['onclick', 'upload', 'tag', true]), [
                                                ['a', {class: 'upload-box__upload-button button button--two'}, 'Add tag'],
                                             ]],
                                             ['div', B.ev ({style: style ({float: 'left', width: 'inherit'}), class: 'upload-box__section upload-box__section--buttons'}, [
                                                ['onclick', 'upload', 'tag', true],
                                                ['onclick', 'upload', 'start']
                                             ]), [
                                                ['a', {class: 'upload-box__upload-button button button--one'}, 'Start upload'],
                                             ]],
                                          ]],
                                       ]];
                                    }),
                                 ];
                              })
                           ]]
                        ]],
                     ]],
                     // PENDING UPLOADS
                     dale.do (summary, function (upload, id) {
                        return B.view (['State', 'upload', 'queue'], function (x, queue) {
                           var pending = {};
                           dale.do (queue, function (file) {
                              if (! pending [file.uid]) pending [file.uid] = 0;
                              pending [file.uid]++;
                           });
                           // If no pending files for this upload, ignore.
                           if (! pending [id]) return;
                           return ['li', {class: 'upload-box-list__item'}, [
                              // UPLOAD BOX
                              ['div', {class: 'upload-box upload-box--recent-uploads'}, [
                                 // TODO v2: add inline SVG
                                 (! upload.ok || ! upload.ok [0]) ? ['div', {class: 'upload-box__image', opaque: true}] : ['div', {class: 'upload-box__image upload-box__image-pic', opaque: true, style: style ({
                                    'background-image': 'url(thumb/200/' + teishi.last (upload.ok).id + ')',
                                    'background-position': 'center',
                                    'background-repeat': 'no-repeat',
                                    'background-size': 'cover',
                                    transform: {90: 'rotate(90deg)', '-90': 'rotate(270deg)', 180: 'rotate(180deg)'} [teishi.last (upload.ok).deg],
                                 })}],
                                 ['div', {class: 'upload-box__main'}, [
                                    ['div', {class: 'upload-box__section'}, [
                                       // TODO v2: add inline SVG
                                       ['p', {class: 'upload-progress', opaque: true}, [
                                          ['span', {class: 'upload-progress__amount-uploaded'}, ! upload.ok ? 0 : upload.ok.length],
                                          '/',
                                          ['span', {class: 'upload-progress__amount'}, pending [id] + (! upload.ok ? 0 : upload.ok.length)],
                                          ['LITERAL', '&nbsp'],
                                          ['span', {class: 'upload-progress__default-text'}, 'uploading...'],
                                          H.if (upload.repeat, ['span', {class: 'upload-progress__default-text'}, ' (' + (upload.repeat || []).length + ' repeated) ']),
                                       ]],
                                       ['p', {class: 'upload-progress no-svg', opaque: true, style: style ({color: 'red'})}, [
                                          ['style', ['.no-svg svg', {display: 'none'}]],
                                          H.if (upload.error, ['span', {class: 'upload-progress__default-text'}, [
                                             'Errors:',
                                             ['ul', dale.do (upload.error, function (e) {
                                                return ['li', [e.name, ': ', e.error.slice (0, 100), e.error.length > 100 ? '...' : '']];
                                             })],
                                          ]]),
                                       ]],
                                       // UPLOAD BAR
                                       ['div', {class: 'progress-bar'}, [
                                          ['span', {class: 'progress-bar__progress', style: style ({width: Math.round (100 * (upload.ok ? upload.ok.length : 0) / ((upload.ok ? upload.ok.length : 0) + pending [id].length)) + '%'})}],
                                       ]],
                                    ]],
                                    ['div', {class: 'upload-box__section'}, [
                                       /*
                                       ['h3', {class: 'upload-box__section-title'}, [
                                          'Tags ',
                                          ['span', {class: 'upload-box__section-title-note'}, '(You can always manage tags later)'],
                                       ]],
                                       */
                                       // TAG LIST HORIZONTAL
                                       ['ul', {class: 'tag-list-horizontal'}, dale.do (upload.tags, function (tag) {
                                          // TODO v2: add inline SVG
                                          return ['li', {opaque: true, class: 'tag-list-horizontal__item tag tag-list__item--' + H.tagColor (tag)}, [
                                             ['span', {class: 'tag__title'}, tag],
                                          ]];
                                       })],
                                    ]],
                                    ['div', {class: 'upload-box__section upload-box__section--buttons'}, [
                                       ['a', B.ev ({class: 'upload-box__upload-button button button--two'}, ['onclick', 'upload', 'cancel', parseInt (id)]), 'Cancel'],
                                    ]],
                                 ]],
                              ]]
                           ]];
                        });
                     }),
                  ];
               })
            ]],
            // RECENT UPLOADS
            // TODO v2: merge three elements into one
            B.view (['State', 'upload', 'queue'], {attrs: {class: 'page-section'}}, function (x, queue) {
               var pending = {};
               dale.do (queue, function (file) {
                  if (! pending [file.uid]) pending [file.uid] = 0;
                  pending [file.uid]++;
               });
               return B.view (['State', 'upload', 'summary'], {attrs: {class: 'recent-uploads'}}, function (x, uploads) {
                  uploads = uploads || {};
                  return [
                     ['h2', {class: 'recent-uploads__title'}, 'Recent uploads'],
                     B.view (['Data', 'account'], {tag: 'ul', attrs: {class: 'recent-uploads__list'}}, function (x, account) {
                        var serverUploads = {}, rotations = {};
                        dale.do (account ? account.logs : [], function (log) {
                           if (log.a !== 'upl') return;
                           if (! serverUploads [log.uid]) serverUploads [log.uid] = {ok: [], tags: log.tags};
                           serverUploads [log.uid].ok.push (log.id);
                           if (log.deg) rotations [log.id] = log.deg;
                        });
                        var allUploads = [];
                        dale.do (dale.keys (uploads).concat (dale.keys (serverUploads)), function (k) {
                           k = parseInt (k);
                           // Don't repeat ids.
                           if (allUploads.indexOf (k) !== -1) return;
                           // If pending files for this upload, ignore.
                           if (pending [k]) return;
                           // Show uploads from the last 60 minutes only.
                           if (k >= Date.now () - 1000 * 60 * 60) allUploads.push (k);
                        });
                        allUploads.sort (function (a, b) {return b - a});
                        return dale.do (allUploads, function (id) {
                           var upload = uploads [id] || {};
                           var serverUpload = serverUploads [id] || {};
                           var ok = teishi.c (upload.ok) || [];
                           dale.do (serverUpload.ok, function (id) {
                              var exists = dale.stopNot (ok, undefined, function (item) {
                                 if (item.id === id) return id;
                              });
                              if (! exists) ok.push ({id: id, deg: rotations [id]});
                           });

                           return ['li', {class: 'recent-uploads__list-item'}, [
                              // UPLOAD BOX
                              ['div', {class: 'upload-box upload-box--recent-uploads'}, [
                                 ! ok [0] ? ['div', {class: 'upload-box__image', opaque: true}] : ['div', {class: 'upload-box__image upload-box__image-pic', opaque: true, style: style ({
                                    'background-image': 'url(thumb/200/' + teishi.last (ok).id + ')',
                                    'background-position': 'center',
                                    'background-repeat': 'no-repeat',
                                    'background-size': 'cover',
                                    transform: {90: 'rotate(90deg)', '-90': 'rotate(270deg)', 180: 'rotate(180deg)'} [rotations [teishi.last (ok).id]],
                                 })}],
                                 ['div', {class: 'upload-box__main'}, [
                                    // UPLOAD BOX SECTION
                                    ['div', {class: 'upload-box__section'}, [
                                       // TODO v2: add inline SVG
                                       ['p', {class: 'upload-progress', opaque: true}, [
                                          ['span', {class: 'upload-progress__amount-uploaded'}, ok.length],
                                          ['LITERAL', '&nbsp'],
                                          ['span', {class: 'upload-progress__default-text'}, 'pictures uploaded'],
                                          ['LITERAL', '&nbsp'],
                                          H.if (upload.repeat, ['span', {class: 'upload-progress__default-text'}, ' (' + (upload.repeat || []).length + ' repeated) ']),
                                          ['LITERAL', '&nbsp'],
                                          ['span', {class: 'upload-progress__default-text'}, ' (' + Math.round ((Date.now () - parseInt (id)) / 60000) + ' minutes ago)'],
                                          ['br'],
                                       ]],
                                       ['p', {class: 'upload-progress no-svg', opaque: true, style: style ({color: 'red'})}, [
                                          ['style', ['.no-svg svg', {display: 'none'}]],
                                          H.if (upload.error, ['span', {class: 'upload-progress__default-text'}, [
                                             'Errors:',
                                             ['ul', dale.do (upload.error, function (e) {
                                                return ['li', [e.name, ': ', e.error.slice (0, 100), e.error.length > 100 ? '...' : '']];
                                             })],
                                          ]]),
                                       ]],
                                    ]],
                                    ['div', {class: 'upload-box__section'}, [
                                       /*
                                       ['h3', {class: 'upload-box__section-title'}, [
                                          'Tags ',
                                          ['span', {class: 'upload-box__section-title-note'}, '(You can always manage tags later)'],
                                       ]],
                                       */
                                       // TAG LIST HORIZONTAL
                                       ['ul', {class: 'tag-list-horizontal'}, dale.do (upload.tags || serverUpload.tags, function (tag) {
                                          // TODO v2: add inline SVG
                                          return ['li', {opaque: true, class: 'tag-list-horizontal__item tag tag-list__item--' + H.tagColor (tag)}, [
                                             ['span', {class: 'tag__title'}, tag],
                                          ]];
                                       })],
                                    ]],
                                 ]]
                              ]]
                           ]];
                        });
                     })
                  ];
               });
            }),
            ['div', {class: 'page-section'}, [
               // BACK LINK
               ['div', {class: 'back-link back-link--uploads'}, [
                  // TODO v2: add inline SVG
                  ['a', {class: 'back-link__link', href: '#/pics', opaque: true}, [
                     ['span', {class: 'back-link__link-text'}, 'See all photos'],
                  ]],
               ]],
            ]],
         ]]
      ]]
   ]];
}

// *** RUN OUT OF SPACE VIEW ***

E.noSpace = function () {
   return B.view (['Data', 'account'], function (x, account) {
      var noSpace = account && account.usage.fsused >= account.usage.limit;
      if (noSpace) return ['div', {class: 'boxed-alert'}, [
         ['div', {class: 'space-alert__image', opaque: true}, [
            ['div', {class: 'space-alert-icon', opaque: true}]
         ]],
         ['div', {class: 'boxed-alert__main'}, [
            ['div', {class: 'upload-box__section'}, [
               ['p', {class: 'boxed-alert-message'}, [
                  ['span', {class: 'space-alert-icon-small', opaque: true}],
                  ['span', {class: 'upload-progress__default-text'}, 'You’ve ran out of space!']
               ]],
               ['div', {class: 'progress-bar'}],
            ]],
            ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
               ['div', {class: 'boxed-alert-button-left button'}, ['a', {href: '#/pics'}, 'Delete some files']],
               ['div', {class: 'boxed-alert-button-right button'}, ['a', {href: '#/upgrade'}, 'Upgrade your account']],
            ]],
         ]],
      ]];
   });
}

// *** IMPORT VIEW ***

E.importList = function (list, provider) {
   return B.view (['State', 'import', provider], {attrs: {class: 'import-file-list'}}, function (x, Import) {
      Import = Import || {};

      if (! list.list) return ['div', [
         ['p', ['In progress']],
         ['p', ['pics so far ', list.fileCount || 0]],
         ['p', ['folders so far ', list.folderCount || 0]],
         ! list.error ? [] : ['p', ['ERROR ', list.error]]
      ]];

      var folderList = ! Import.currentFolder ? list.list.roots : list.list.folders [Import.currentFolder].children;
      return ['div', {class: 'upload-box'}, [
         ['div', {class: 'import-breadcrumb-container'}, [
            ['div', {class: 'import-breadcrumb-buffer'}],
            ['div', {class: 'import-breadcrumb'}, 'My Drive > Vacations > Lorem ipsum > Dolor sit amet > Consectetur']
         ]],
         ['div', {class: 'import-process-box'}, [
            ['div', {class: 'import-process-box-back'}, [
               ['div', {class: 'import-process-box-back-icon', opaque: true}],
               ['div',{class: 'import-process-box-back-text'}, 'Back']
            ]],
            ['div', {class: 'import-process-box-list'}, [
               ! Import.currentFolder ? [] : ['div', B.ev ({class: 'import-process-box-list-up'}, ['onclick', 'set', ['State', 'import', provider, 'currentFolder'], list.list.folders [Import.currentFolder].parent]), [
                  ['div', {class: 'up-icon', opaque: true}],
                  ['span', 'Up']
               ]],
               ['div', {class: 'import-process-box-list-folders'}, dale.do (folderList, function (id) {
                  var folder = list.list.folders [id];
                  if (! folder) return;
                  return ['div', {class: 'import-process-box-list-folders-row'}, [
                     ['div', {class: 'select-folder-box'}, [
                        ['label', {class: 'checkbox-container'}, [
                           ['input', {type: 'checkbox', checked: false}],
                           ['span', {class: 'select-folder-box-checkmark'}]
                        ]],
                     ]],
                     ['div', {class: 'folder-icon', opaque: true}],
                     ['div', ! folder.children ? {class: 'import-folder-name'} : B.ev ({class: 'import-folder-name'}, ['onclick', 'set', ['State', 'import', provider, 'currentFolder'], id]), folder.name],
                     ['div', {class: 'import-folder-files'}, '(' + folder.count + ' files)']
                  ]];
                  /*

                  ['div', {class: 'import-process-box-list-folders-row'}, [
                     ['div', {class: 'select-folder-box'}, [
                        ['label', {class: 'checkbox-container'}, [
                           ['input', {type: 'checkbox', checked: 'checked'}],
                           ['span', {class: 'select-folder-box-checkmark'}]
                        ]],
                     ]],
                     ['div', {class: 'folder-icon', opaque: true}],
                     ['div', {class: 'import-folder-name'}, 'Las Vegas 2010'],
                     ['div', {class: 'import-folder-files'}, '(100 files)']
                  ]],
                  ['div', {class: 'import-process-box-list-folders-row'}, [
                     ['div', {class: 'select-folder-box'}, [
                        ['label', {class: 'checkbox-container'}, [
                           ['input', {type: 'checkbox'}],
                           ['span', {class: 'select-folder-box-checkmark'}]
                        ]],
                     ]],
                     ['div', {class: 'folder-icon', opaque: true}],
                     ['div', {class: 'import-folder-name'}, 'Japan 2019'],
                     ['div', {class: 'import-folder-files'}, '(125 files)']
                  ]],
                  ['div', {class: 'import-process-box-list-folders-row'}, [
                     ['div', {class: 'select-folder-box'}, [
                        ['label', {class: 'checkbox-container'}, [
                           ['input', {type: 'checkbox'}],
                           ['span', {class: 'select-folder-box-checkmark'}]
                        ]],
                     ]],
                     ['div', {class: 'folder-icon', opaque: true}],
                     ['div', {class: 'import-folder-name'}, 'Los Angeles 2018'],
                     ['div', {class: 'import-folder-files'}, '(567 files)']
                  ]],
                  ['div', {class: 'import-process-box-list-folders-row'}, [
                     ['div', {class: 'select-folder-box'}, [
                        ['label', {class: 'checkbox-container'}, [
                           ['input', {type: 'checkbox'}],
                           ['span', {class: 'select-folder-box-checkmark'}]
                        ]],
                     ]],
                     ['div', {class: 'folder-icon', opaque: true}],
                     ['div', {class: 'import-folder-name'}, 'Germany 2017'],
                     ['div', {class: 'import-folder-files'}, '(985 files)']
                  ]],
                              ['div', {class: 'import-process-box-list-folders-row'}, [
                     ['div', {class: 'select-folder-box'}, [
                        ['label', {class: 'checkbox-container'}, [
                           ['input', {type: 'checkbox'}],
                           ['span', {class: 'select-folder-box-checkmark'}]
                        ]],
                     ]],
                     ['div', {class: 'folder-icon', opaque: true}],
                     ['div', {class: 'import-folder-name'}, 'Teotihuacan, Mexico 2016'],
                     ['div', {class: 'import-folder-files'}, '(4567 files)']
                  ]],
                  ['div', {class: 'import-process-box-list-folders-row'}, [
                     ['div', {class: 'select-folder-box'}, [
                        ['label', {class: 'checkbox-container'}, [
                           ['input', {type: 'checkbox'}],
                           ['span', {class: 'select-folder-box-checkmark'}]
                        ]],
                     ]],
                     ['div', {class: 'folder-icon', opaque: true}],
                     ['div', {class: 'import-folder-name'}, 'Buenos Aires 2015'],
                     ['div', {class: 'import-folder-files'}, '(4567 files)']
                  ]],
                  ['div', {class: 'import-process-box-list-folders-row'}, [
                     ['div', {class: 'select-folder-box'}, [
                        ['label', {class: 'checkbox-container'}, [
                           ['input', {type: 'checkbox'}],
                           ['span', {class: 'select-folder-box-checkmark'}]
                        ]],
                     ]],
                     ['div', {class: 'folder-icon', opaque: true}],
                     ['div', {class: 'import-folder-name'}, 'NYC 2014'],
                     ['div', {class: 'import-folder-files'}, '(567 files)']
                  ]],
               */
               })],
            ]],
            ['div', {class: 'import-process-box-selected'}, [
               ['div', {class: 'import-process-box-selected-title'}, 'Selected Folders'],
               ['div', {class: 'import-process-box-selected-row'}, [
                  ['div', {class: 'folder-icon'}],
                  ['div', {class: 'selected-folder-name'}, 'Las Vegas 2010'],
                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
               ]],
               ['div', {class: 'import-process-box-selected-row'}, [
                  ['div', {class: 'folder-icon'}],
                  ['div', {class: 'selected-folder-name'}, 'Joe’s wedding'],
                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
               ]],
               ['div', {class: 'import-process-box-selected-row'}, [
                  ['div', {class: 'folder-icon'}],
                  ['div', {class: 'selected-folder-name'}, 'Mom’s birthday'],
                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
               ]],
               ['div', {class: 'import-process-box-selected-row'}, [
                  ['div', {class: 'folder-icon'}],
                  ['div', {class: 'selected-folder-name'}, 'Camping 2005'],
                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
               ]],
               ['div', {class: 'import-process-box-selected-row'}, [
                  ['div', {class: 'folder-icon'}],
                  ['div', {class: 'selected-folder-name'}, 'Birthday 2012'],
                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
               ]],
               ['div', {class: 'import-process-box-selected-row'}, [
                  ['div', {class: 'folder-icon'}],
                  ['div', {class: 'selected-folder-name'}, 'Party at Steven’s'],
                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
               ]],
               ['div', {class: 'import-process-box-selected-row'}, [
                  ['div', {class: 'folder-icon'}],
                  ['div', {class: 'selected-folder-name'}, 'Miami 2014'],
                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
               ]],
               ['div', {class: 'import-process-box-selected-row'}, [
                  ['div', {class: 'folder-icon'}],
                  ['div', {class: 'selected-folder-name'}, 'Mexico 2013'],
                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
               ]],
            ]],
         ]],
      ]];
   });
}

E.importBox = function () {
   return ['div', {class:'upload-box'}, [
      // IMPORT BOX
      ['div', {class:'upload-box__image', opaque: true}],
      ['div', {class:'upload-box__main'}, [
         // IMPORT BOX SECTION
         ['div', {class: 'upload-box__section'},[
            ['h3', {class: 'upload-box__section-title'}, 'Import files'],
            ['div', {class: 'drag-and-drop-import', opaque: true}, [
               ['div', [
                  // TODO: when dynamizing, place condition on responder to check if there's enough space left.
                  ['div', B.ev ({style: style ({cursor: 'pointer', float: 'left', display: 'inline-block', 'margin-right': 35}), class: 'google-drive-logo'}, ['onclick', 'import', 'list', 'google'])],
                  ['div', {style: style ({cursor: 'pointer', float: 'left', display: 'inline-block'}), class: 'dropbox-logo'}]
               ]],
            ]],
         ]]
      ]],
   ]];
}

E.import = function (list) {
   var folderList = [
      [['Entire Drive'], 280],
      [['Entire Drive', 'Vacations'], 225],
      [['Entire Drive', 'Vacations', 'Las Vegas 2010'], 100],
      [['Entire Drive', 'Vacations', 'Japan 2019'], 125]
   ];

   return ['div', [
      E.header (true, true),
      ['div', {class: 'main-centered'}, [
         ['div', {class: 'main-centered__inner max-width--m'}, [
            E.noSpace (),
            // PAGE HEADER
            ['div', {class: 'page-header'}, [
               ['h1', {class: 'page-header__title page-title'}, 'Import pictures'],
               ['h2', {class: 'page-header__subtitle page-subtitle'}, 'Start organizing your pictures']
            ]],
            B.view (['Data', 'import', 'google'], {attrs: {class: 'page-section'}}, function (x, list) {
               return [
                  list ? E.importList (list, 'google') : E.importBox (),
                  // LISTING ALERT
                  ['div', {class: 'listing-in-process'}, [
						    ['div', {class: 'boxed-alert', style: style({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
                        ['div', {class: 'space-alert__image', opaque: true}, [
                           ['div', {class: 'google-drive-icon', opaque: true}]
                        ]],
                        ['div', {class: 'boxed-alert__main'}, [
                           ['div', {class: 'upload-box__section'}, [
                              ['p', {class: 'boxed-alert-message'}, [
                                 ['span', {class: 'google-drive-icon-small', opaque: true}],
                                 ['span', {class: 'upload-progress__default-text'}, 'Listing in process...']
                              ]],
                              ['div', {class: 'progress-bar'}],
                           ]],
                           ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
	                       		['div', {class:'listing-progress'}, [
	                       			['div', {class:'files-found-so-far'}, [
	                       				['span', 'XXXXX'],
	                       				['div', ' pics & vids found so far'],
	                       				]],
	                       			['div', {class:'folders-found-so-far'}, [
	                       				['span', 'XXXXX'],
	                       				['div', ' folders found so far'],
	                       				]],
	                       			]],
                              ['div', {class: 'boxed-alert-button-left button', style: style({float: 'right'})}, 'Cancel']
		                        ],           
	                        ]],
	                     ]],
	                  ]],
						],
						// READY TO BE IMPORTED ALERT
						['div', {class: 'listing-in-process'}, [
						    ['div', {class: 'boxed-alert', style: style({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
	                        ['div', {class: 'space-alert__image', opaque: true}, [
	                           ['div', {class: 'google-drive-icon', opaque: true}]
	                        ]],
	                        ['div', {class: 'boxed-alert__main'}, [
	                           ['div', {class: 'upload-box__section'}, [
	                              ['p', {class: 'boxed-alert-message'}, [
	                                 ['span', {class: 'google-drive-icon-small', opaque: true}],
	                                 ['span', {class: 'upload-progress__default-text'}, 'Your files are ready to be imported']
	                              ]],
	                              ['div', {class: 'progress-bar'}],
	                           ]],
	                           ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
	                              ['div', {class: 'boxed-alert-button-left button'}, 'Delete list'],
	                              ['div', {class: 'boxed-alert-button-right button'}, ['a', {href: '#/upgrade'}, 'Select folders'],
	                           ]],
	                        ]],
	                     ]],
							]],
						],
						// FILES BEING IMPORTED ALERT
						['div', {class: 'listing-in-process'}, [
						    ['div', {class: 'boxed-alert', style: style({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
                        ['div', {class: 'space-alert__image', opaque: true}, [
                           ['div', {class: 'google-drive-icon', opaque: true}]
                        ]],
                        ['div', {class: 'boxed-alert__main'}, [
                           ['div', {class: 'upload-box__section'}, [
                              ['p', {class: 'boxed-alert-message'}, [
                                 ['span', {class: 'google-drive-icon-small', opaque: true}],
                                 ['span', {class: 'upload-progress__default-text'}, 'Your pics & vids are being imported...']
                              ]],
                              ['div', {class: 'progress-bar'}],
                           ]],
                           ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                       		['div', {class:'listing-progress'}, [
                       			['div', {class:'files-found-so-far'}, [
                       				['span', 'XXXXX'],
                       				['span', ' / '],
                       				['span', 'XXXXX'],
                       				['div', ' imported so far'],
                       				]],
                       			]],
                              ['div', {class: 'boxed-alert-button-left button', style: style({float: 'right'})}, 'Cancel']
		                        ],           
	                        ]],
	                     ]],
	                  ]],
						],
                  // RECENT IMPORTS
                  ['h2', {class:'recent-imports__title'}, 'Recent imports'],
                  // BACK LINK
                  ['div', {class: 'page-section'}, [
                     ['div', {class: 'back-link back-link--uploads'}, [
                        ['a', {class: 'back-link__link', href: '#/pics', opaque: true}, [
                           ['span', {class: 'back-link__link-text'}, 'See all photos'],
                        ]],
                     ]],
                  ]],
               ];
            })
         ]],
      ]],
   ]];
}

// *** ACCOUNT VIEW ***

E.account = function () {
   return [
      E.header (true, true),
      B.view (['Data', 'account'], function (x, account) {
         if (! account) return;
         var percUsed = Math.round ((account.usage.fsused / account.usage.limit) * 100);
         var gbUsed = Math.round (account.usage.fsused * 10 / 1000000000) / 10;
         var free   = account.type !== 'free';
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
                              B.view (['Data', 'account'], {tag: 'td', attrs: {style: style ({'vertical-align': 'middle'})}}, function (x, account) {
                                 return ['label', {class: 'switch'}, [
                                    ['input', B.ev ({id: 'geoCheckbox', type: 'checkbox', checked: account && account.geo}, ['onclick', 'toggle', 'geo'])],
                                    ['span', {class: 'geo-slider'}]
                                 ]];
                              }),
                           ]],
                           B.view (['State', 'changePassword'], {tag: 'tr', attrs: {class: 'change-password'}}, function (x, changePassword) {
                              return [
                                 ['td', {class: 'text-left-table'}, 'Password'],
                                 ['td', {style: style ({'vertical-align': 'middle'})}, [
                                    ! changePassword ? ['span', B.ev ({class: 'change-password-button button'}, ['onclick', 'set', ['State', 'changePassword'], true]), 'Change password'] : [],
                                 ]],
                              ];
                           }),
                        ]],
                        B.view (['State', 'changePassword'], {attrs: {class: 'change-password-form'}}, function (x, changePassword) {
                           if (! changePassword) return;
                           return [
                              ['input', {id: 'password-current', class: 'search-form__input search-input change-password-placeholder', type: 'password', placeholder: 'Enter your current password'}],
                              ['input', {id: 'password-new', class: 'search-form__input search-input change-password-placeholder', type: 'password', placeholder: 'Enter your new password'}],
                              ['input', {id: 'password-new-repeat', class: 'search-form__input search-input change-password-placeholder', type: 'password', placeholder: 'Repeat your new password'}],
                              ['div', {class: 'change-password-buttons'}, [
                                 ['span', B.ev ({class: 'change-password-button-confirm button'}, ['onclick', 'submit', 'changePassword']), 'Change password'],
                                 ['span', B.ev ({class: 'change-password-button-cancel button'}, ['onclick', 'clear', 'changePassword']), 'Cancel']
                                 ]],
                           ];
                        }),
                        ['h2', {class: 'usage-and-account-type'}, 'Usage and account type'],
                        ['table', {class: 'account-data'}, [
                           ['tr', {class: 'space-usage'}, [
                              ['td', {class: 'text-left-account-data-table'}, 'Usage: ' + percUsed + '% (' + gbUsed + ' GB)'],
                              ['td', {style: style ({'vertical-align': 'middle'}), 'rowspan':'2'}, [
                                 ['span', {class: 'space-usage-bar', style: style ({
                                    background: 'linear-gradient(90deg, #8b8b8b ' + percUsed + '%, #fff ' + percUsed + '%)',
                                 })}],
                              ]],
                           ]],
                           ['tr', {class: 'subtext-left-table'}, [
                              ['td', 'Of your free 2 GB']
                           ]],
                           free ? [] : ['tr', {class: 'space-limit'}, [
                              ['td', {class: 'text-left-account-data-table'}, 'Space limit'],
                              ['td', {style: style ({'vertical-align': 'middle'}), 'rowspan':'2'}, [
                                 ['input', {class: 'search-form__input search-input space-limit-box', type: 'text', placeholder: '100'}]
                              ]],
                           ]],
                           free ? [] : ['tr', {class: 'subtext-left-table'}, [
                              ['td', 'You can set your monthly limit up to 100 GB.']
                           ]],
                           ['tr', {class: 'account-type'}, [
                              ['td', {class: 'text-left-account-data-table'}, [
                                 ['span', 'Account type: '],
                                 ['span', {style: style ({'font-weight': CSS.vars.fontPrimaryMedium})}, account.type [0].toUpperCase () + account.type.slice (1)]
                              ]],
                              free ? ['td', {class: 'call-to-action-text'}, ['a', {href: '#/upgrade'}, 'Upgrade your account']] : ['td', {class: 'values-right-table', 'rowspan':'2'}, '€ 3.5 / Month']
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
                                 ['td', {class: 'values-right-table', 'rowspan':'2'}, '€ 1.81 / Month']
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
                                 ['td', {class: 'values-right-table', 'rowspan':'2'}, '€ 0.01 / Month']
                              ]],
                              ['tr', {class: 'subtext-left-table'}, [
                                 ['td', {style: style ({'padding-left': '5%'})}, 'Average amount of GB you used this month so far.']
                              ]],
                              ['tr', {class: 'paid-space-currently-used'}, [
                                 ['td', {style: style ({'padding-left': '5%'}), class: 'text-left-account-data-table'}, [
                                    ['span', 'Paid space currently using: '],
                                    ['span', {style: style ({'font-weight': CSS.vars.fontPrimaryMedium})}, '70 GB']
                                 ]],
                                 ['td', {class: 'values-right-table', 'rowspan':'2'}, '€ 1.80 / Month']
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
                        free ? [] : ['div', {class: 'cancel-account'}, [
                           ['a', {href: ''}, 'Downgrade your subscription']
                        ]]
                     ]]
                  ]],
               ]],
            ]],
         ]];
      })
   ];
}

// *** UPGRADE VIEW ***

E.upgrade = function () {
   return ['div', [
      E.header (true, true),
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
                                    ['span', {class: 'hover-text'}, 'We charge a lineal fee based on how much space you use. We charge you at cost, no markup.']
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
                              ['span', B.ev ({class: 'call-to-action-upgrade'}, ['onclick', 'snackbar', 'green', 'Coming soon!']), 'Upgrade now'],
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

B.do ('initialize', []);
