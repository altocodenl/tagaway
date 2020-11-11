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
      // TODO: when updating google drive png, use version with right bottom corner in orange
      // putSvg ('.google-drive-icon, .google-drive-icon-small', 'afterBegin', '<svg viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="94" height="94"/><path d="M10.7219 73.2906L14.4917 79.8021C15.275 81.1729 16.401 82.25 17.7229 83.0333L31.1865 59.7292H4.25937C4.25937 61.2469 4.65104 62.7646 5.43437 64.1354L10.7219 73.2906Z" fill="#0066DA"/><path d="M47 32.3125L33.5365 9.00833C32.2146 9.79166 31.0885 10.8687 30.3052 12.2396L5.43437 55.3229C4.65104 56.6938 4.25937 58.2115 4.25937 59.7292H31.1865L47 32.3125Z" fill="#00AC47"/><path d="M47 32.3125L60.4635 9.00833C59.1416 8.22499 57.6239 7.83333 56.0573 7.83333H37.9427C36.376 7.83333 34.8583 8.27395 33.5364 9.00833L47 32.3125Z" fill="#00832D"/><path d="M62.8135 59.7292H31.1864L17.7229 83.0333C19.0448 83.8167 20.5625 84.2083 22.1292 84.2083H71.8708C73.4375 84.2083 74.9552 83.7677 76.2771 83.0333L62.8135 59.7292Z" fill="#2684FC"/><path d="M76.2771 83.0333C77.599 82.25 78.725 81.1729 79.5083 79.8021L81.075 77.1094L88.5656 64.1354C89.3489 62.7646 89.7406 61.2469 89.7406 59.7292H62.8625L76.2771 83.0333Z" fill="#EA4335"/><path d="M76.1302 33.7813L63.6948 12.2396C62.9115 10.8687 61.7854 9.79166 60.4635 9.00833L47 32.3125L62.8135 59.7292H89.6917C89.6917 58.2115 89.3 56.6938 88.5167 55.3229L76.1302 33.7813Z" fill="#FFBA00"/></svg>');
      putSvg ('.google-drive-icon, .google-drive-icon-small', 'afterBegin', '<svg viewBox="0 0 94 94" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="94" height="94"/><path d="M10.7219 73.2906L14.4917 79.8021C15.275 81.1729 16.401 82.25 17.7229 83.0333L31.1865 59.7292H4.25937C4.25937 61.2469 4.65104 62.7646 5.43437 64.1354L10.7219 73.2906Z" fill="#0066DA"/><path d="M47 32.3125L33.5365 9.00833C32.2146 9.79166 31.0885 10.8687 30.3052 12.2396L5.43437 55.3229C4.65104 56.6938 4.25937 58.2115 4.25937 59.7292H31.1865L47 32.3125Z" fill="#00AC47"/><path d="M47 32.3125L60.4635 9.00833C59.1416 8.22499 57.6239 7.83333 56.0573 7.83333H37.9427C36.376 7.83333 34.8583 8.27395 33.5364 9.00833L47 32.3125Z" fill="#00832D"/><path d="M62.8135 59.7292H31.1864L17.7229 83.0333C19.0448 83.8167 20.5625 84.2083 22.1292 84.2083H71.8708C73.4375 84.2083 74.9552 83.7677 76.2771 83.0333L62.8135 59.7292Z" fill="#2684FC"/><path d="M76.2771 83.0333C77.599 82.25 78.725 81.1729 79.5083 79.8021L81.075 77.1094L88.5656 64.1354C89.3489 62.7646 89.7406 61.2469 89.7406 59.7292H62.8625L76.2771 83.0333Z" fill="#2684FC"/><path d="M76.1302 33.7813L63.6948 12.2396C62.9115 10.8687 61.7854 9.79166 60.4635 9.00833L47 32.3125L62.8135 59.7292H89.6917C89.6917 58.2115 89.3 56.6938 88.5167 55.3229L76.1302 33.7813Z" fill="#FFBA00"/></svg>');
      putSvg ('.dropbox-icon, .dropbox-icon-small', 'afterBegin', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style="fill: rgb(0, 97, 255);"><title></title><path d="M8 2.4l8 5.1-8 5.1-8-5.1 8-5.1zm16 0l8 5.1-8 5.1-8-5.1 8-5.1zM0 17.7l8-5.1 8 5.1-8 5.1-8-5.1zm24-5.1l8 5.1-8 5.1-8-5.1 8-5.1zM8 24.5l8-5.1 8 5.1-8 5.1-8-5.1z"></path></svg>');
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

E.import = function () {

   var boxMaker = function (type, provider, data) {
      var className = provider === 'google' ? 'google-drive' : provider;

      if (type === 'listing') return ['div', {class: 'listing-in-process'}, [
         ['div', {class: 'boxed-alert', style: style ({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
            ['div', {class: 'space-alert__image', opaque: true}, [
               ['div', {class: className + '-icon', opaque: true}]
            ]],
            ['div', {class: 'boxed-alert__main'}, [
               ['div', {class: 'upload-box__section'}, [
                  ['p', {class: 'boxed-alert-message'}, [
                     ['span', {class: className + '-icon-small', opaque: true}],
                     ['span', {class: 'upload-progress__default-text'}, 'Listing in process...']
                  ]],
                  ['div', {class: 'progress-bar'}],
               ]],
               ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                  ['div', {class:'listing-progress'}, [
                     ['div', {class:'files-found-so-far'}, [
                        ['span', data.fileCount],
                        ['div', ' pics & vids found so far'],
                     ]],
                     ['div', {class:'folders-found-so-far'}, [
                        ['span', data.folderCount],
                        ['div', ' folders found so far'],
                     ]],
                  ]],
                  // TODO: implement cancel
                  ['div', {class: 'boxed-alert-button-left button', style: style ({float: 'right'})}, 'Cancel']
               ]],
            ]],
         ]],
      ]];

      if (type === 'listReady') return ['div', {class: 'listing-in-process'}, [
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
                  // TODO: implement cancel
                  ['div', {class: 'boxed-alert-button-left button'}, 'Delete list'],
                  ['div', B.ev ({class: 'boxed-alert-button-right button'}, ['onclick', 'set', ['State', 'import', 'list'], provider]), 'Select folders'],
               ]],
            ]],
         ]],
      ]];

      if (type === 'importing') return ['div', {class: 'listing-in-process'}, [
         ['div', {class: 'boxed-alert', style: style({'margin-top, margin-bottom': CSS.vars ['padding--s']})}, [
            ['div', {class: 'space-alert__image', opaque: true}, [
               ['div', {class: 'dropbox-icon', opaque: true}]
            ]],
            ['div', {class: 'boxed-alert__main'}, [
               ['div', {class: 'upload-box__section'}, [
                  ['p', {class: 'boxed-alert-message'}, [
                     ['span', {class: 'dropbox-icon-small', opaque: true}],
                     ['span', {class: 'upload-progress__default-text'}, 'Your pics & vids are being imported...']
                  ]],
                  ['div', {class: 'progress-bar'}],
               ]],
               ['div', {class: 'upload-box__section', style: style ({display: 'inline-block'})}, [
                  ['div', {class:'listing-progress'}, [
                     ['div', {class:'files-found-so-far'}, [
                        // TODO: dynamize
                        ['span', 'XXXXX'],
                        ['span', ' / '],
                        ['span', data.fileCount],
                        ['div', ' imported so far'],
                     ]],
                  ]],
                  // TODO: implement cancel
                  ['div', {class: 'boxed-alert-button-left button', style: style ({float: 'right'})}, 'Cancel']
               ]],
            ]],
         ]],
      ]];
   }

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
            B.view (['Data', 'import'], {attrs: {class: 'page-section'}}, function (x, importData) {
               return B.view (['State', 'import'], function (x, importState) {
                  if (importState && importState.list) return E.importList (importState, importData [importState.list]);
                  return [
                     // IMPORT BOX SECTION
                     ['div', {class:'upload-box'}, [
                        ['div', {class:'upload-box__image', opaque: true}],
                        ['div', {class:'upload-box__main'}, [
                           B.view (['Data', 'account'], {attrs: {class: 'upload-box__section'}}, function (x, account) {
                              var noSpace = account && account.usage.fsused >= account.usage.limit;
                              return [
                                 ['h3', {class: 'upload-box__section-title'}, 'Import files'],
                                 ['div', {class: 'drag-and-drop-import', opaque: true}, [
                                    ['div', [
                                       // TODO: when migrating to gotoB v2, don't use foo.bar if there's no space.
                                       ['div', B.ev ({style: style ({cursor: 'pointer', float: 'left', display: 'inline-block', 'margin-right': 35}), class: 'google-drive-logo'}, noSpace ? ['onclick', 'foo', 'bar'] : ['onclick', 'import', 'list', 'google'])],
                                       ['div', {style: style ({cursor: 'pointer', float: 'left', display: 'inline-block'}), class: 'dropbox-logo'}]
                                    ]],
                                 ]],
                              ];
                           })
                        ]],
                     ]],
                     dale.do (importData, function (data, provider) {
                        if (! data.end)       return boxMaker ('listing',   provider, data);
                        if (! data.importing) return boxMaker ('listReady', provider, data);
                        return boxMaker ('importing', provider, data);
                     })
                  ];
               })
            }),
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
         ]],
      ]],
   ]];
}

E.importList = function (importState, importData) {
   var folderList = ! importState.current ? importData.list.roots : importData.list.folders [importState.current].children;
   return ['div', {class: 'import-file-list'}, [
      ['div', {class: 'upload-box'}, [
	      ['div', {class:'listing-table-container'}, [
	         ['div', {class: 'import-breadcrumb-container'}, [
	            ['div', {class: 'import-breadcrumb-icon'}, [
		            ['div', {class:'google-drive-icon-small'}]
		            ]],
	            ['div', {class: 'import-breadcrumb'}, 'My Drive > Vacations > Lorem ipsum > Dolor sit amet > Consectetur']
	         ]],
	         ['div', {class: 'import-process-box'}, [
	            ['div', {class: 'import-process-box-back'}, [
	               ['div', {class: 'import-process-box-back-icon', opaque: true}],
	               ['div',{class: 'import-process-box-back-text'}, 'Back']
	            ]],
	            ['div', {class: 'import-process-box-list'}, [
	               ! importState.current ? [] : ['div', B.ev ({class: 'import-process-box-list-up'}, ['onclick', 'set', ['State', 'import', 'current'], importData.list.folders [importState.current].parent]), [
	                  ['div', {class: 'up-icon', opaque: true}],
	                  ['span', 'Up']
	               ]],
	               ['div', {class: 'import-process-box-list-folders'}, dale.do (folderList, function (id) {
	                  var folder = importData.list.folders [id];
	                  if (! folder) return;
	                  return ['div', {class: 'import-process-box-list-folders-row'}, [
	                     ['div', {class: 'select-folder-box'}, [
	                        ['label', {class: 'checkbox-container'}, [
	                           ['input', {type: 'checkbox', checked: false}],
	                           ['span', {class: 'select-folder-box-checkmark'}]
	                        ]],
	                     ]],
	                     ['div', {class: 'folder-icon', opaque: true}],
	                     ['div', ! folder.children ? {class: 'import-folder-name'} : B.ev ({class: 'import-folder-name'}, ['onclick', 'set', ['State', 'import', 'current'], id]), folder.name],
	                     ['div', {class: 'import-folder-files'}, '(' + folder.count + ' files)']
	                  ]];
	               })],
	            ]],
	            ['div', {class: 'import-process-box-selected'}, [
	               ['div', {class: 'import-process-box-selected-title'}, 'Selected Folders'],
	               ['div', {class:'import-process-box-selected-row-container'}, [
                  dale.do (['Las Vegas 2010', 'Joe\'s wedding', 'Mom\'s birthday', 'Camping 2005', 'Birthday 2012', 'Party at Steven\'s', 'Miami 2014', 'Mexico 2013'], function (folder) {
                     return ['div', {class: 'import-process-box-selected-row'}, [
   	                  ['div', {class: 'folder-icon'}],
   	                  ['div', {class: 'selected-folder-name'}, folder],
   	                  ['div', {class: 'selected-folder-deselect tag-actions__item', opaque: true}]
   	               ]];
                  })
                  ]],
	            ]],
	         ]],
	         ['div', {class:'start-import-button button'}, 'Start import'],
        	]],
      ]]
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
