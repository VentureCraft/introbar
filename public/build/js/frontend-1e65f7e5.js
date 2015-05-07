/*!
 * Modernizr v2.8.3
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.8.3',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq) && matchMedia(mq).matches || false;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   goo.gl/v3V4Gp
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /**
     * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
        /*jshint evil:true */
        /** version */
        var version = '3.7.0';

        /** Preset options */
        var options = window.html5 || {};

        /** Used to skip problem elements */
        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        /** Not all elements can be cloned in IE **/
        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        /** Detect whether the browser supports default html5 styles */
        var supportsHtml5Styles;

        /** Name of the expando, to work with multiple documents or to re-shiv one document */
        var expando = '_html5shiv';

        /** The id for the the documents expando */
        var expanID = 0;

        /** Cached data for each document */
        var expandoData = {};

        /** Detect whether the browser supports unknown elements */
        var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
            // assign a false positive if detection fails => unable to shiv
            supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

        /*--------------------------------------------------------------------------*/

        /**
         * Creates a style sheet with the given CSS text and adds it to the document.
         * @private
         * @param {Document} ownerDocument The document.
         * @param {String} cssText The CSS text.
         * @returns {StyleSheet} The style element.
         */
        function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

        /**
         * Returns the value of `html5.elements` as an array.
         * @private
         * @returns {Array} An array of shived element node names.
         */
        function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

        /**
         * Returns the data associated to the given document
         * @private
         * @param {Document} ownerDocument The document.
         * @returns {Object} An object of data.
         */
        function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

        /**
         * returns a shived element for the given nodeName and document
         * @memberOf html5
         * @param {String} nodeName name of the element
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived element.
         */
        function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

          // Avoid adding some elements to fragments in IE < 9 because
          // * Attributes like `name` or `type` cannot be set/changed once an element
          //   is inserted into a document/fragment
          // * Link elements with `src` attributes that are inaccessible, as with
          //   a 403 response, will cause the tab/window to crash
          // * Script elements appended to fragments will execute when their `src`
          //   or `text` property is set
          return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

        /**
         * returns a shived DocumentFragment for the given document
         * @memberOf html5
         * @param {Document} ownerDocument The context document.
         * @returns {Object} The shived DocumentFragment.
         */
        function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

        /**
         * Shivs the `createElement` and `createDocumentFragment` methods of the document.
         * @private
         * @param {Document|DocumentFragment} ownerDocument The document.
         * @param {Object} data of the document.
         */
        function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
            //abort shiv
            if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                          // unroll the `createElement` calls
                                                          getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

        /*--------------------------------------------------------------------------*/

        /**
         * Shivs the given document.
         * @memberOf html5
         * @param {Document} ownerDocument The document to shiv.
         * @returns {Document} The shived document.
         */
        function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                          // corrects block display not defined in IE6/7/8/9
                                          'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                            // adds styling not present in IE6/7/8/9
                                            'mark{background:#FF0;color:#000}' +
                                            // hides non-rendered elements
                                            'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

        /*--------------------------------------------------------------------------*/

        /**
         * The `html5` object is exposed so that more elements can be shived and
         * existing shiving can be detected on iframes.
         * @type Object
         * @example
         *
         * // options can be changed before the script is included
         * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
         */
        var html5 = {

          /**
           * An array or space separated string of node names of the elements to shiv.
           * @memberOf html5
           * @type Array|String
           */
          'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

          /**
           * current version of html5shiv
           */
          'version': version,

          /**
           * A flag to indicate that the HTML5 style sheet should be inserted.
           * @memberOf html5
           * @type Boolean
           */
          'shivCSS': (options.shivCSS !== false),

          /**
           * Is equal to true if a browser supports creating unknown/HTML5 elements
           * @memberOf html5
           * @type boolean
           */
          'supportsUnknownElements': supportsUnknownElements,

          /**
           * A flag to indicate that the document's `createElement` and `createDocumentFragment`
           * methods should be overwritten.
           * @memberOf html5
           * @type Boolean
           */
          'shivMethods': (options.shivMethods !== false),

          /**
           * A string to describe the type of `html5` object ("default" or "default print").
           * @memberOf html5
           * @type String
           */
          'type': 'default',

          // shivs the document according to the specified `html5` object options
          'shivDocument': shivDocument,

          //creates a shived element
          createElement: createElement,

          //creates a shived documentFragment
          createDocumentFragment: createDocumentFragment
        };

        /*--------------------------------------------------------------------------*/

        // expose html5
        window.html5 = html5;

        // shiv the document
        shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

/*!
 * jQuery JavaScript Library v2.1.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-04-28T16:01Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//

var arr = [];

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	version = "2.1.4",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		// Support: Android<4.0, iOS<6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.0-pre
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-12-16
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];
	nodeType = context.nodeType;

	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	if ( !seed && documentIsHTML ) {

		// Try to shortcut find operations when possible (e.g., not under DocumentFragment)
		if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType !== 1 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;
	parent = doc.defaultView;

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Support tests
	---------------------------------------------------------------------- */
	documentIsHTML = !isXML( doc );

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\f]' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// Option to run scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within the set
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// Index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// We once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};


function Data() {
	// Support: Android<4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Data.uid++;
}

Data.uid = 1;
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android<4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};
var data_priv = new Data();

var data_user = new Data();



//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend({
	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// Ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};

var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// Support: Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
})();
var strundefined = typeof undefined;



support.focusinBubbles = "onfocusin" in window;


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: Android<4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Support: Firefox, Chrome, Safari
// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					data_priv.remove( doc, fix );

				} else {
					data_priv.access( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}

function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Fix IE bugs, see support tests
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Fix IE cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit, PhantomJS
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type, key,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( jQuery.acceptData( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each(function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				});
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optimization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		if ( elem.ownerDocument.defaultView.opener ) {
			return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
		}

		return window.getComputedStyle( elem, null );
	};



function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];
	}

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: iOS < 6
		// A tribute to the "awesome hack by Dean Edwards"
		// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {
				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var pixelPositionVal, boxSizingReliableVal,
		docElem = document.documentElement,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	if ( !div.style ) {
		return;
	}

	// Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
		"position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computePixelPositionAndBoxSizingReliable() {
		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";
		div.innerHTML = "";
		docElem.appendChild( container );

		var divStyle = window.getComputedStyle( div, null );
		pixelPositionVal = divStyle.top !== "1%";
		boxSizingReliableVal = divStyle.width === "4px";

		docElem.removeChild( container );
	}

	// Support: node.js jsdom
	// Don't assume that getComputedStyle is a property of the global object
	if ( window.getComputedStyle ) {
		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computePixelPositionAndBoxSizingReliable();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computePixelPositionAndBoxSizingReliable();
				}
				return boxSizingReliableVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
					"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				docElem.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

				docElem.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		});
	}
})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
	// Swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// Return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// Shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// Check for vendor prefixed names
	var capName = name[0].toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// Both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// At this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// At this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// At this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// Check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// Use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend({

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// Gets hook for the prefixed version, then unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set (#7116)
			if ( value == null || value !== value ) {
				return;
			}

			// If a number, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Support: IE9-11+
			// background-* props affect original clone's values
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// Try prefixed name followed by the unprefixed name
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// Certain elements can have dimension info if we invisibly show them
				// but it must have a current display style that would benefit
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// Assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// Passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails.
			// Simple values such as "10px" are parsed to Float;
			// complex values such as "rotate(1rad)" are returned as-is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// Use step hook for back compat.
			// Use cssHook if its there.
			// Use .style if available and use plain properties where available.
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes
Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*.
					// Use string for doubling so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur(),
				// break the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// We're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// Handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// Ensure the complete handler is called before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// Height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// Store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// Not quite $.extend, this won't overwrite existing keys.
			// Reusing 'index' because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// Don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// If we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// Resolve when we played the last frame; otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// Normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// Show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// Animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// Start the next in the queue if the last step wasn't forced.
			// Timers currently will call their complete callbacks, which
			// will dequeue but only if they were gotoEnd.
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// Enable finishing flag on private data
			data.finish = true;

			// Empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// Look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// Look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// Turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn = input.value !== "";

	// Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected = opt.selected;

	// Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<=11+
	// An input loses its value after becoming a radio
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
})();


var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {
			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
});




var rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = arguments.length === 0 || typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// Toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed `false`,
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// Handle most common string cases
					ret.replace(rreturn, "") :
					// Handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
						optionSet = true;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = window.location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// Aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// Extract error from statusText and normalize for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// Shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
};
jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrId = 0,
	xhrCallbacks = {},
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
	});
}

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr(),
					id = ++xhrId;

				xhr.open( options.type, options.url, options.async, options.username, options.password );

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");

				// Create the abort callback
				callback = xhrCallbacks[ id ] = callback("abort");

				try {
					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {
					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};




var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// Support: BlackBerry 5, iOS 3 (original iPhone)
		// If we don't have gBCR, just use 0,0 rather than error
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// Assume getBoundingClientRect is there when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Support: Safari<7+, Chrome<37+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
// getComputedStyle returns percent when specified for top/left/bottom/right;
// rather than make the css module depend on the offset module, just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// If curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// Margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in AMD
// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

// Spectrum Colorpicker v1.4.1
// https://github.com/bgrins/spectrum
// Author: Brian Grinstead
// License: MIT

(function (window, $, undefined) {
    "use strict";

    var defaultOpts = {

        // Callbacks
        beforeShow: noop,
        move: noop,
        change: noop,
        show: noop,
        hide: noop,

        // Options
        color: false,
        flat: false,
        showInput: false,
        allowEmpty: false,
        showButtons: true,
        clickoutFiresChange: false,
        showInitial: false,
        showPalette: false,
        showPaletteOnly: false,
        togglePaletteOnly: false,
        showSelectionPalette: true,
        localStorageKey: false,
        appendTo: "body",
        maxSelectionSize: 7,
        cancelText: "cancel",
        chooseText: "choose",
        togglePaletteMoreText: "more",
        togglePaletteLessText: "less",
        clearText: "Clear Color Selection",
        noColorSelectedText: "No Color Selected",
        preferredFormat: false,
        className: "", // Deprecated - use containerClassName and replacerClassName instead.
        containerClassName: "",
        replacerClassName: "",
        showAlpha: false,
        theme: "sp-light",
        palette: [["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]],
        selectionPalette: [],
        disabled: false
    },
    spectrums = [],
    IE = !!/msie/i.exec( window.navigator.userAgent ),
    rgbaSupport = (function() {
        function contains( str, substr ) {
            return !!~('' + str).indexOf(substr);
        }

        var elem = document.createElement('div');
        var style = elem.style;
        style.cssText = 'background-color:rgba(0,0,0,.5)';
        return contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
    })(),
    inputTypeColorSupport = (function() {
        var colorInput = $("<input type='color' value='!' />")[0];
        return colorInput.type === "color" && colorInput.value !== "!";
    })(),
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    markup = (function () {

        // IE does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (IE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate (p, color, className, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = tinycolor(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += (tinycolor.equals(color, current)) ? " sp-thumb-active" : "";
                var formattedString = tiny.toString(opts.preferredFormat || "rgb");
                var swatchStyle = rgbaSupport ? ("background-color:" + tiny.toRgbString()) : "filter:" + tiny.toFilter();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.noColorSelectedText)
                    )
                    .html()
                );
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < spectrums.length; i++) {
            if (spectrums[i]) {
                spectrums[i].hide();
            }
        }
    }

    function instanceOptions(o, callbackContext) {
        var opts = $.extend({}, defaultOpts, o);
        opts.callbacks = {
            'move': bind(opts.move, callbackContext),
            'change': bind(opts.change, callbackContext),
            'show': bind(opts.show, callbackContext),
            'hide': bind(opts.hide, callbackContext),
            'beforeShow': bind(opts.beforeShow, callbackContext)
        };

        return opts;
    }

    function spectrum(element, o) {

        var opts = instanceOptions(o, element),
            flat = opts.flat,
            showSelectionPalette = opts.showSelectionPalette,
            localStorageKey = opts.localStorageKey,
            theme = opts.theme,
            callbacks = opts.callbacks,
            resize = throttle(reflow, 10),
            visible = false,
            dragWidth = 0,
            dragHeight = 0,
            dragHelperHeight = 0,
            slideHeight = 0,
            slideWidth = 0,
            alphaWidth = 0,
            alphaSlideHelperWidth = 0,
            slideHelperHeight = 0,
            currentHue = 0,
            currentSaturation = 0,
            currentValue = 0,
            currentAlpha = 1,
            palette = [],
            paletteArray = [],
            paletteLookup = {},
            selectionPalette = opts.selectionPalette.slice(0),
            maxSelectionSize = opts.maxSelectionSize,
            draggingClass = "sp-dragging",
            shiftMovementDirection = null;

        var doc = element.ownerDocument,
            body = doc.body,
            boundElement = $(element),
            disabled = false,
            container = $(markup, doc).addClass(theme),
            pickerContainer = container.find(".sp-picker-container"),
            dragger = container.find(".sp-color"),
            dragHelper = container.find(".sp-dragger"),
            slider = container.find(".sp-hue"),
            slideHelper = container.find(".sp-slider"),
            alphaSliderInner = container.find(".sp-alpha-inner"),
            alphaSlider = container.find(".sp-alpha"),
            alphaSlideHelper = container.find(".sp-alpha-handle"),
            textInput = container.find(".sp-input"),
            paletteContainer = container.find(".sp-palette"),
            initialColorContainer = container.find(".sp-initial"),
            cancelButton = container.find(".sp-cancel"),
            clearButton = container.find(".sp-clear"),
            chooseButton = container.find(".sp-choose"),
            toggleButton = container.find(".sp-palette-toggle"),
            isInput = boundElement.is("input"),
            isInputTypeColor = isInput && inputTypeColorSupport && boundElement.attr("type") === "color",
            shouldReplace = isInput && !flat,
            replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
            offsetElement = (shouldReplace) ? replacer : boundElement,
            previewElement = replacer.find(".sp-preview-inner"),
            initialColor = opts.color || (isInput && boundElement.val()),
            colorOnShow = false,
            preferredFormat = opts.preferredFormat,
            currentPreferredFormat = preferredFormat,
            clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
            isEmpty = !initialColor,
            allowEmpty = opts.allowEmpty && !isInputTypeColor;

        function applyOptions() {

            if (opts.showPaletteOnly) {
                opts.showPalette = true;
            }

            toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);

            if (opts.palette) {
                palette = opts.palette.slice(0);
                paletteArray = $.isArray(palette[0]) ? palette : [palette];
                paletteLookup = {};
                for (var i = 0; i < paletteArray.length; i++) {
                    for (var j = 0; j < paletteArray[i].length; j++) {
                        var rgb = tinycolor(paletteArray[i][j]).toRgbString();
                        paletteLookup[rgb] = true;
                    }
                }
            }

            container.toggleClass("sp-flat", flat);
            container.toggleClass("sp-input-disabled", !opts.showInput);
            container.toggleClass("sp-alpha-enabled", opts.showAlpha);
            container.toggleClass("sp-clear-enabled", allowEmpty);
            container.toggleClass("sp-buttons-disabled", !opts.showButtons);
            container.toggleClass("sp-palette-buttons-disabled", !opts.togglePaletteOnly);
            container.toggleClass("sp-palette-disabled", !opts.showPalette);
            container.toggleClass("sp-palette-only", opts.showPaletteOnly);
            container.toggleClass("sp-initial-disabled", !opts.showInitial);
            container.addClass(opts.className).addClass(opts.containerClassName);

            reflow();
        }

        function initialize() {

            if (IE) {
                container.find("*:not(input)").attr("unselectable", "on");
            }

            applyOptions();

            if (shouldReplace) {
                boundElement.after(replacer).hide();
            }

            if (!allowEmpty) {
                clearButton.hide();
            }

            if (flat) {
                boundElement.after(container).hide();
            }
            else {

                var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                if (appendTo.length !== 1) {
                    appendTo = $("body");
                }

                appendTo.append(container);
            }

            updateSelectionPaletteFromStorage();

            offsetElement.bind("click.spectrum touchstart.spectrum", function (e) {
                if (!disabled) {
                    toggle();
                }

                e.stopPropagation();

                if (!$(e.target).is("input")) {
                    e.preventDefault();
                }
            });

            if(boundElement.is(":disabled") || (opts.disabled === true)) {
                disable();
            }

            // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
            container.click(stopPropagation);

            // Handle user typed input
            textInput.change(setFromTextInput);
            textInput.bind("paste", function () {
                setTimeout(setFromTextInput, 1);
            });
            textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

            cancelButton.text(opts.cancelText);
            cancelButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                hide("cancel");
            });

            clearButton.attr("title", opts.clearText);
            clearButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();
                isEmpty = true;
                move();

                if(flat) {
                    //for the flat style, this is a change event
                    updateOriginalInput(true);
                }
            });

            chooseButton.text(opts.chooseText);
            chooseButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                if (isValid()) {
                    updateOriginalInput(true);
                    hide();
                }
            });

            toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);
            toggleButton.bind("click.spectrum", function (e) {
                e.stopPropagation();
                e.preventDefault();

                opts.showPaletteOnly = !opts.showPaletteOnly;

                // To make sure the Picker area is drawn on the right, next to the
                // Palette area (and not below the palette), first move the Palette
                // to the left to make space for the picker, plus 5px extra.
                // The 'applyOptions' function puts the whole container back into place
                // and takes care of the button-text and the sp-palette-only CSS class.
                if (!opts.showPaletteOnly && !flat) {
                    container.css('left', '-=' + (pickerContainer.outerWidth(true) + 5));
                }
                applyOptions();
            });

            draggable(alphaSlider, function (dragX, dragY, e) {
                currentAlpha = (dragX / alphaWidth);
                isEmpty = false;
                if (e.shiftKey) {
                    currentAlpha = Math.round(currentAlpha * 10) / 10;
                }

                move();
            }, dragStart, dragStop);

            draggable(slider, function (dragX, dragY) {
                currentHue = parseFloat(dragY / slideHeight);
                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;
                }
                move();
            }, dragStart, dragStop);

            draggable(dragger, function (dragX, dragY, e) {

                // shift+drag should snap the movement to either the x or y axis.
                if (!e.shiftKey) {
                    shiftMovementDirection = null;
                }
                else if (!shiftMovementDirection) {
                    var oldDragX = currentSaturation * dragWidth;
                    var oldDragY = dragHeight - (currentValue * dragHeight);
                    var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                    shiftMovementDirection = furtherFromX ? "x" : "y";
                }

                var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                if (setSaturation) {
                    currentSaturation = parseFloat(dragX / dragWidth);
                }
                if (setValue) {
                    currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                }

                isEmpty = false;
                if (!opts.showAlpha) {
                    currentAlpha = 1;
                }

                move();

            }, dragStart, dragStop);

            if (!!initialColor) {
                set(initialColor);

                // In case color was black - update the preview UI and set the format
                // since the set function will not run (default color is black).
                updateUI();
                currentPreferredFormat = preferredFormat || tinycolor(initialColor).format;

                addColorToSelectionPalette(initialColor);
            }
            else {
                updateUI();
            }

            if (flat) {
                show();
            }

            function paletteElementClick(e) {
                if (e.data && e.data.ignore) {
                    set($(e.target).closest(".sp-thumb-el").data("color"));
                    move();
                }
                else {
                    set($(e.target).closest(".sp-thumb-el").data("color"));
                    move();
                    updateOriginalInput(true);
                    hide();
                }

                return false;
            }

            var paletteEvent = IE ? "mousedown.spectrum" : "click.spectrum touchstart.spectrum";
            paletteContainer.delegate(".sp-thumb-el", paletteEvent, paletteElementClick);
            initialColorContainer.delegate(".sp-thumb-el:nth-child(1)", paletteEvent, { ignore: true }, paletteElementClick);
        }

        function updateSelectionPaletteFromStorage() {

            if (localStorageKey && window.localStorage) {

                // Migrate old palettes over to new format.  May want to remove this eventually.
                try {
                    var oldPalette = window.localStorage[localStorageKey].split(",#");
                    if (oldPalette.length > 1) {
                        delete window.localStorage[localStorageKey];
                        $.each(oldPalette, function(i, c) {
                             addColorToSelectionPalette(c);
                        });
                    }
                }
                catch(e) { }

                try {
                    selectionPalette = window.localStorage[localStorageKey].split(";");
                }
                catch (e) { }
            }
        }

        function addColorToSelectionPalette(color) {
            if (showSelectionPalette) {
                var rgb = tinycolor(color).toRgbString();
                if (!paletteLookup[rgb] && $.inArray(rgb, selectionPalette) === -1) {
                    selectionPalette.push(rgb);
                    while(selectionPalette.length > maxSelectionSize) {
                        selectionPalette.shift();
                    }
                }

                if (localStorageKey && window.localStorage) {
                    try {
                        window.localStorage[localStorageKey] = selectionPalette.join(";");
                    }
                    catch(e) { }
                }
            }
        }

        function getUniqueSelectionPalette() {
            var unique = [];
            if (opts.showPalette) {
                for (var i = 0; i < selectionPalette.length; i++) {
                    var rgb = tinycolor(selectionPalette[i]).toRgbString();

                    if (!paletteLookup[rgb]) {
                        unique.push(selectionPalette[i]);
                    }
                }
            }

            return unique.reverse().slice(0, opts.maxSelectionSize);
        }

        function drawPalette() {

            var currentColor = get();

            var html = $.map(paletteArray, function (palette, i) {
                return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts);
            });

            updateSelectionPaletteFromStorage();

            if (selectionPalette) {
                html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts));
            }

            paletteContainer.html(html.join(""));
        }

        function drawInitial() {
            if (opts.showInitial) {
                var initial = colorOnShow;
                var current = get();
                initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial", opts));
            }
        }

        function dragStart() {
            if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                reflow();
            }
            container.addClass(draggingClass);
            shiftMovementDirection = null;
            boundElement.trigger('dragstart.spectrum', [ get() ]);
        }

        function dragStop() {
            container.removeClass(draggingClass);
            boundElement.trigger('dragstop.spectrum', [ get() ]);
        }

        function setFromTextInput() {

            var value = textInput.val();

            if ((value === null || value === "") && allowEmpty) {
                set(null);
                updateOriginalInput(true);
            }
            else {
                var tiny = tinycolor(value);
                if (tiny.isValid()) {
                    set(tiny);
                    updateOriginalInput(true);
                }
                else {
                    textInput.addClass("sp-validation-error");
                }
            }
        }

        function toggle() {
            if (visible) {
                hide();
            }
            else {
                show();
            }
        }

        function show() {
            var event = $.Event('beforeShow.spectrum');

            if (visible) {
                reflow();
                return;
            }

            boundElement.trigger(event, [ get() ]);

            if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                return;
            }

            hideAll();
            visible = true;

            $(doc).bind("click.spectrum", hide);
            $(window).bind("resize.spectrum", resize);
            replacer.addClass("sp-active");
            container.removeClass("sp-hidden");

            reflow();
            updateUI();

            colorOnShow = get();

            drawInitial();
            callbacks.show(colorOnShow);
            boundElement.trigger('show.spectrum', [ colorOnShow ]);
        }

        function hide(e) {

            // Return on right click
            if (e && e.type == "click" && e.button == 2) { return; }

            // Return if hiding is unnecessary
            if (!visible || flat) { return; }
            visible = false;

            $(doc).unbind("click.spectrum", hide);
            $(window).unbind("resize.spectrum", resize);

            replacer.removeClass("sp-active");
            container.addClass("sp-hidden");

            var colorHasChanged = !tinycolor.equals(get(), colorOnShow);

            if (colorHasChanged) {
                if (clickoutFiresChange && e !== "cancel") {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
            }

            callbacks.hide(get());
            boundElement.trigger('hide.spectrum', [ get() ]);
        }

        function revert() {
            set(colorOnShow, true);
        }

        function set(color, ignoreFormatChange) {
            if (tinycolor.equals(color, get())) {
                // Update UI just in case a validation error needs
                // to be cleared.
                updateUI();
                return;
            }

            var newColor, newHsv;
            if (!color && allowEmpty) {
                isEmpty = true;
            } else {
                isEmpty = false;
                newColor = tinycolor(color);
                newHsv = newColor.toHsv();

                currentHue = (newHsv.h % 360) / 360;
                currentSaturation = newHsv.s;
                currentValue = newHsv.v;
                currentAlpha = newHsv.a;
            }
            updateUI();

            if (newColor && newColor.isValid() && !ignoreFormatChange) {
                currentPreferredFormat = preferredFormat || newColor.getFormat();
            }
        }

        function get(opts) {
            opts = opts || { };

            if (allowEmpty && isEmpty) {
                return null;
            }

            return tinycolor.fromRatio({
                h: currentHue,
                s: currentSaturation,
                v: currentValue,
                a: Math.round(currentAlpha * 100) / 100
            }, { format: opts.format || currentPreferredFormat });
        }

        function isValid() {
            return !textInput.hasClass("sp-validation-error");
        }

        function move() {
            updateUI();

            callbacks.move(get());
            boundElement.trigger('move.spectrum', [ get() ]);
        }

        function updateUI() {

            textInput.removeClass("sp-validation-error");

            updateHelperLocations();

            // Update dragger background color (gradients take care of saturation and value).
            var flatColor = tinycolor.fromRatio({ h: currentHue, s: 1, v: 1 });
            dragger.css("background-color", flatColor.toHexString());

            // Get a format that alpha will be included in (hex and names ignore alpha)
            var format = currentPreferredFormat;
            if (currentAlpha < 1 && !(currentAlpha === 0 && format === "name")) {
                if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                    format = "rgb";
                }
            }

            var realColor = get({ format: format }),
                displayColor = '';

             //reset background info for preview element
            previewElement.removeClass("sp-clear-display");
            previewElement.css('background-color', 'transparent');

            if (!realColor && allowEmpty) {
                // Update the replaced elements background with icon indicating no color selection
                previewElement.addClass("sp-clear-display");
            }
            else {
                var realHex = realColor.toHexString(),
                    realRgb = realColor.toRgbString();

                // Update the replaced elements background color (with actual selected color)
                if (rgbaSupport || realColor.alpha === 1) {
                    previewElement.css("background-color", realRgb);
                }
                else {
                    previewElement.css("background-color", "transparent");
                    previewElement.css("filter", realColor.toFilter());
                }

                if (opts.showAlpha) {
                    var rgb = realColor.toRgb();
                    rgb.a = 0;
                    var realAlpha = tinycolor(rgb).toRgbString();
                    var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                    if (IE) {
                        alphaSliderInner.css("filter", tinycolor(realAlpha).toFilter({ gradientType: 1 }, realHex));
                    }
                    else {
                        alphaSliderInner.css("background", "-webkit-" + gradient);
                        alphaSliderInner.css("background", "-moz-" + gradient);
                        alphaSliderInner.css("background", "-ms-" + gradient);
                        // Use current syntax gradient on unprefixed property.
                        alphaSliderInner.css("background",
                            "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                    }
                }

                displayColor = realColor.toString(format);
            }

            // Update the text entry input as it changes happen
            if (opts.showInput) {
                textInput.val(displayColor);
            }

            if (opts.showPalette) {
                drawPalette();
            }

            drawInitial();
        }

        function updateHelperLocations() {
            var s = currentSaturation;
            var v = currentValue;

            if(allowEmpty && isEmpty) {
                //if selected color is empty, hide the helpers
                alphaSlideHelper.hide();
                slideHelper.hide();
                dragHelper.hide();
            }
            else {
                //make sure helpers are visible
                alphaSlideHelper.show();
                slideHelper.show();
                dragHelper.show();

                // Where to show the little circle in that displays your current selected color
                var dragX = s * dragWidth;
                var dragY = dragHeight - (v * dragHeight);
                dragX = Math.max(
                    -dragHelperHeight,
                    Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                );
                dragY = Math.max(
                    -dragHelperHeight,
                    Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                );
                dragHelper.css({
                    "top": dragY + "px",
                    "left": dragX + "px"
                });

                var alphaX = currentAlpha * alphaWidth;
                alphaSlideHelper.css({
                    "left": (alphaX - (alphaSlideHelperWidth / 2)) + "px"
                });

                // Where to show the bar that displays your current selected hue
                var slideY = (currentHue) * slideHeight;
                slideHelper.css({
                    "top": (slideY - slideHelperHeight) + "px"
                });
            }
        }

        function updateOriginalInput(fireCallback) {
            var color = get(),
                displayColor = '',
                hasChanged = !tinycolor.equals(color, colorOnShow);

            if (color) {
                displayColor = color.toString(currentPreferredFormat);
                // Update the selection palette with the current color
                addColorToSelectionPalette(color);
            }

            if (isInput) {
                boundElement.val(displayColor);
            }

            colorOnShow = color;

            if (fireCallback && hasChanged) {
                callbacks.change(color);
                boundElement.trigger('change', [ color ]);
            }
        }

        function reflow() {
            dragWidth = dragger.width();
            dragHeight = dragger.height();
            dragHelperHeight = dragHelper.height();
            slideWidth = slider.width();
            slideHeight = slider.height();
            slideHelperHeight = slideHelper.height();
            alphaWidth = alphaSlider.width();
            alphaSlideHelperWidth = alphaSlideHelper.width();

            if (!flat) {
                container.css("position", "absolute");
                container.offset(getOffset(container, offsetElement));
            }

            updateHelperLocations();

            if (opts.showPalette) {
                drawPalette();
            }

            boundElement.trigger('reflow.spectrum');
        }

        function destroy() {
            boundElement.show();
            offsetElement.unbind("click.spectrum touchstart.spectrum");
            container.remove();
            replacer.remove();
            spectrums[spect.id] = null;
        }

        function option(optionName, optionValue) {
            if (optionName === undefined) {
                return $.extend({}, opts);
            }
            if (optionValue === undefined) {
                return opts[optionName];
            }

            opts[optionName] = optionValue;
            applyOptions();
        }

        function enable() {
            disabled = false;
            boundElement.attr("disabled", false);
            offsetElement.removeClass("sp-disabled");
        }

        function disable() {
            hide();
            disabled = true;
            boundElement.attr("disabled", true);
            offsetElement.addClass("sp-disabled");
        }

        initialize();

        var spect = {
            show: show,
            hide: hide,
            toggle: toggle,
            reflow: reflow,
            option: option,
            enable: enable,
            disable: disable,
            set: function (c) {
                set(c);
                updateOriginalInput();
            },
            get: get,
            destroy: destroy,
            container: container
        };

        spect.id = spectrums.push(spect) - 1;

        return spect;
    }

    /**
    * checkOffset - get the offset below/above and left/right element depending on screen position
    * Thanks https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.datepicker.js
    */
    function getOffset(picker, input) {
        var extraY = 0;
        var dpWidth = picker.outerWidth();
        var dpHeight = picker.outerHeight();
        var inputHeight = input.outerHeight();
        var doc = picker[0].ownerDocument;
        var docElem = doc.documentElement;
        var viewWidth = docElem.clientWidth + $(doc).scrollLeft();
        var viewHeight = docElem.clientHeight + $(doc).scrollTop();
        var offset = input.offset();
        offset.top += inputHeight;

        offset.left -=
            Math.min(offset.left, (offset.left + dpWidth > viewWidth && viewWidth > dpWidth) ?
            Math.abs(offset.left + dpWidth - viewWidth) : 0);

        offset.top -=
            Math.min(offset.top, ((offset.top + dpHeight > viewHeight && viewHeight > dpHeight) ?
            Math.abs(dpHeight + inputHeight - extraY) : extraY));

        return offset;
    }

    /**
    * noop - do nothing
    */
    function noop() {

    }

    /**
    * stopPropagation - makes the code only doing this a little easier to read in line
    */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
    * Create a function bound to a given object
    * Thanks to underscore.js
    */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    /**
    * Lightweight drag helper.  Handles containment within the element, so that
    * when dragging, the x is within [0,element.width] and y is within [0,element.height]
    */
    function draggable(element, onmove, onstart, onstop) {
        onmove = onmove || function () { };
        onstart = onstart || function () { };
        onstop = onstop || function () { };
        var doc = element.ownerDocument || document;
        var dragging = false;
        var offset = {};
        var maxHeight = 0;
        var maxWidth = 0;
        var hasTouch = ('ontouchstart' in window);

        var duringDragEvents = {};
        duringDragEvents["selectstart"] = prevent;
        duringDragEvents["dragstart"] = prevent;
        duringDragEvents["touchmove mousemove"] = move;
        duringDragEvents["touchend mouseup"] = stop;

        function prevent(e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.returnValue = false;
        }

        function move(e) {
            if (dragging) {
                // Mouseup happened outside of window
                if (IE && document.documentMode < 9 && !e.button) {
                    return stop();
                }

                var touches = e.originalEvent.touches;
                var pageX = touches ? touches[0].pageX : e.pageX;
                var pageY = touches ? touches[0].pageY : e.pageY;

                var dragX = Math.max(0, Math.min(pageX - offset.left, maxWidth));
                var dragY = Math.max(0, Math.min(pageY - offset.top, maxHeight));

                if (hasTouch) {
                    // Stop scrolling in iOS
                    prevent(e);
                }

                onmove.apply(element, [dragX, dragY, e]);
            }
        }

        function start(e) {
            var rightclick = (e.which) ? (e.which == 3) : (e.button == 2);
            var touches = e.originalEvent.touches;

            if (!rightclick && !dragging) {
                if (onstart.apply(element, arguments) !== false) {
                    dragging = true;
                    maxHeight = $(element).height();
                    maxWidth = $(element).width();
                    offset = $(element).offset();

                    $(doc).bind(duringDragEvents);
                    $(doc.body).addClass("sp-dragging");

                    if (!hasTouch) {
                        move(e);
                    }

                    prevent(e);
                }
            }
        }

        function stop() {
            if (dragging) {
                $(doc).unbind(duringDragEvents);
                $(doc.body).removeClass("sp-dragging");
                onstop.apply(element, arguments);
            }
            dragging = false;
        }

        $(element).bind("touchstart mousedown", start);
    }

    function throttle(func, wait, debounce) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var throttler = function () {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    }

    /**
    * Define a jQuery plugin
    */
    var dataID = "spectrum.id";
    $.fn.spectrum = function (opts, extra) {

        if (typeof opts == "string") {

            var returnValue = this;
            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function () {
                var spect = spectrums[$(this).data(dataID)];
                if (spect) {
                    var method = spect[opts];
                    if (!method) {
                        throw new Error( "Spectrum: no such method: '" + opts + "'" );
                    }

                    if (opts == "get") {
                        returnValue = spect.get();
                    }
                    else if (opts == "container") {
                        returnValue = spect.container;
                    }
                    else if (opts == "option") {
                        returnValue = spect.option.apply(spect, args);
                    }
                    else if (opts == "destroy") {
                        spect.destroy();
                        $(this).removeData(dataID);
                    }
                    else {
                        method.apply(spect, args);
                    }
                }
            });

            return returnValue;
        }

        // Initializing a new instance of spectrum
        return this.spectrum("destroy").each(function () {
            var options = $.extend({}, opts, $(this).data());
            var spect = spectrum(this, options);
            $(this).data(dataID, spect.id);
        });
    };

    $.fn.spectrum.load = true;
    $.fn.spectrum.loadOpts = {};
    $.fn.spectrum.draggable = draggable;
    $.fn.spectrum.defaults = defaultOpts;

    $.spectrum = { };
    $.spectrum.localization = { };
    $.spectrum.palettes = { };

    $.fn.spectrum.processNativeColorInputs = function () {
        if (!inputTypeColorSupport) {
            $("input[type=color]").spectrum({
                preferredFormat: "hex6"
            });
        }
    };

    // TinyColor v1.0.0
    // https://github.com/bgrins/TinyColor
    // Brian Grinstead, MIT License

    (function() {

    var trimLeft = /^[\s,#]+/,
        trimRight = /\s+$/,
        tinyCounter = 0,
        math = Math,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathRandom = math.random;

    var tinycolor = function tinycolor (color, opts) {

        color = (color) ? color : '';
        opts = opts || { };

        // If input is already a tinycolor, return itself
        if (color instanceof tinycolor) {
           return color;
        }
        // If we are called as a function, call using new instead
        if (!(this instanceof tinycolor)) {
            return new tinycolor(color, opts);
        }

        var rgb = inputToRGB(color);
        this._r = rgb.r,
        this._g = rgb.g,
        this._b = rgb.b,
        this._a = rgb.a,
        this._roundA = mathRound(100*this._a) / 100,
        this._format = opts.format || rgb.format;
        this._gradientType = opts.gradientType;

        // Don't let the range of [0,255] come back in [0,1].
        // Potentially lose a little bit of precision here, but will fix issues where
        // .5 gets interpreted as half of the total, instead of half of 1
        // If it was supposed to be 128, this was already taken care of by `inputToRgb`
        if (this._r < 1) { this._r = mathRound(this._r); }
        if (this._g < 1) { this._g = mathRound(this._g); }
        if (this._b < 1) { this._b = mathRound(this._b); }

        this._ok = rgb.ok;
        this._tc_id = tinyCounter++;
    };

    tinycolor.prototype = {
        isDark: function() {
            return this.getBrightness() < 128;
        },
        isLight: function() {
            return !this.isDark();
        },
        isValid: function() {
            return this._ok;
        },
        getFormat: function() {
            return this._format;
        },
        getAlpha: function() {
            return this._a;
        },
        getBrightness: function() {
            var rgb = this.toRgb();
            return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        },
        setAlpha: function(value) {
            this._a = boundAlpha(value);
            this._roundA = mathRound(100*this._a) / 100;
            return this;
        },
        toHsv: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this._a };
        },
        toHsvString: function() {
            var hsv = rgbToHsv(this._r, this._g, this._b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (this._a == 1) ?
              "hsv("  + h + ", " + s + "%, " + v + "%)" :
              "hsva(" + h + ", " + s + "%, " + v + "%, "+ this._roundA + ")";
        },
        toHsl: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this._a };
        },
        toHslString: function() {
            var hsl = rgbToHsl(this._r, this._g, this._b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (this._a == 1) ?
              "hsl("  + h + ", " + s + "%, " + l + "%)" :
              "hsla(" + h + ", " + s + "%, " + l + "%, "+ this._roundA + ")";
        },
        toHex: function(allow3Char) {
            return rgbToHex(this._r, this._g, this._b, allow3Char);
        },
        toHexString: function(allow3Char) {
            return '#' + this.toHex(allow3Char);
        },
        toHex8: function() {
            return rgbaToHex(this._r, this._g, this._b, this._a);
        },
        toHex8String: function() {
            return '#' + this.toHex8();
        },
        toRgb: function() {
            return { r: mathRound(this._r), g: mathRound(this._g), b: mathRound(this._b), a: this._a };
        },
        toRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ")" :
              "rgba(" + mathRound(this._r) + ", " + mathRound(this._g) + ", " + mathRound(this._b) + ", " + this._roundA + ")";
        },
        toPercentageRgb: function() {
            return { r: mathRound(bound01(this._r, 255) * 100) + "%", g: mathRound(bound01(this._g, 255) * 100) + "%", b: mathRound(bound01(this._b, 255) * 100) + "%", a: this._a };
        },
        toPercentageRgbString: function() {
            return (this._a == 1) ?
              "rgb("  + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%)" :
              "rgba(" + mathRound(bound01(this._r, 255) * 100) + "%, " + mathRound(bound01(this._g, 255) * 100) + "%, " + mathRound(bound01(this._b, 255) * 100) + "%, " + this._roundA + ")";
        },
        toName: function() {
            if (this._a === 0) {
                return "transparent";
            }

            if (this._a < 1) {
                return false;
            }

            return hexNames[rgbToHex(this._r, this._g, this._b, true)] || false;
        },
        toFilter: function(secondColor) {
            var hex8String = '#' + rgbaToHex(this._r, this._g, this._b, this._a);
            var secondHex8String = hex8String;
            var gradientType = this._gradientType ? "GradientType = 1, " : "";

            if (secondColor) {
                var s = tinycolor(secondColor);
                secondHex8String = s.toHex8String();
            }

            return "progid:DXImageTransform.Microsoft.gradient("+gradientType+"startColorstr="+hex8String+",endColorstr="+secondHex8String+")";
        },
        toString: function(format) {
            var formatSet = !!format;
            format = format || this._format;

            var formattedString = false;
            var hasAlpha = this._a < 1 && this._a >= 0;
            var needsAlphaFormat = !formatSet && hasAlpha && (format === "hex" || format === "hex6" || format === "hex3" || format === "name");

            if (needsAlphaFormat) {
                // Special case for "transparent", all other non-alpha formats
                // will return rgba when there is transparency.
                if (format === "name" && this._a === 0) {
                    return this.toName();
                }
                return this.toRgbString();
            }
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "prgb") {
                formattedString = this.toPercentageRgbString();
            }
            if (format === "hex" || format === "hex6") {
                formattedString = this.toHexString();
            }
            if (format === "hex3") {
                formattedString = this.toHexString(true);
            }
            if (format === "hex8") {
                formattedString = this.toHex8String();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }

            return formattedString || this.toHexString();
        },

        _applyModification: function(fn, args) {
            var color = fn.apply(null, [this].concat([].slice.call(args)));
            this._r = color._r;
            this._g = color._g;
            this._b = color._b;
            this.setAlpha(color._a);
            return this;
        },
        lighten: function() {
            return this._applyModification(lighten, arguments);
        },
        brighten: function() {
            return this._applyModification(brighten, arguments);
        },
        darken: function() {
            return this._applyModification(darken, arguments);
        },
        desaturate: function() {
            return this._applyModification(desaturate, arguments);
        },
        saturate: function() {
            return this._applyModification(saturate, arguments);
        },
        greyscale: function() {
            return this._applyModification(greyscale, arguments);
        },
        spin: function() {
            return this._applyModification(spin, arguments);
        },

        _applyCombination: function(fn, args) {
            return fn.apply(null, [this].concat([].slice.call(args)));
        },
        analogous: function() {
            return this._applyCombination(analogous, arguments);
        },
        complement: function() {
            return this._applyCombination(complement, arguments);
        },
        monochromatic: function() {
            return this._applyCombination(monochromatic, arguments);
        },
        splitcomplement: function() {
            return this._applyCombination(splitcomplement, arguments);
        },
        triad: function() {
            return this._applyCombination(triad, arguments);
        },
        tetrad: function() {
            return this._applyCombination(tetrad, arguments);
        }
    };

    // If input is an object, force 1 into "1.0" to handle ratios properly
    // String input requires "1.0" as input, so 1 will be treated as 1
    tinycolor.fromRatio = function(color, opts) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                if (color.hasOwnProperty(i)) {
                    if (i === "a") {
                        newColor[i] = color[i];
                    }
                    else {
                        newColor[i] = convertToPercentage(color[i]);
                    }
                }
            }
            color = newColor;
        }

        return tinycolor(color, opts);
    };

    // Given a string or object, convert that input to RGB
    // Possible string inputs:
    //
    //     "red"
    //     "#f00" or "f00"
    //     "#ff0000" or "ff0000"
    //     "#ff000000" or "ff000000"
    //     "rgb 255 0 0" or "rgb (255, 0, 0)"
    //     "rgb 1.0 0 0" or "rgb (1, 0, 0)"
    //     "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
    //     "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
    //     "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
    //     "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
    //     "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
    //
    function inputToRGB(color) {

        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var ok = false;
        var format = false;

        if (typeof color == "string") {
            color = stringInputToObject(color);
        }

        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                color.s = convertToPercentage(color.s);
                color.v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, color.s, color.v);
                ok = true;
                format = "hsv";
            }
            else if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                color.s = convertToPercentage(color.s);
                color.l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, color.s, color.l);
                ok = true;
                format = "hsl";
            }

            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }

        a = boundAlpha(a);

        return {
            ok: ok,
            format: color.format || format,
            r: mathMin(255, mathMax(rgb.r, 0)),
            g: mathMin(255, mathMax(rgb.g, 0)),
            b: mathMin(255, mathMax(rgb.b, 0)),
            a: a
        };
    }


    // Conversion Functions
    // --------------------

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>

    // `rgbToRgb`
    // Handle bounds / percentage checking to conform to CSS color spec
    // <http://www.w3.org/TR/css3-color/>
    // *Assumes:* r, g, b in [0, 255] or [0, 1]
    // *Returns:* { r, g, b } in [0, 255]
    function rgbToRgb(r, g, b){
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255
        };
    }

    // `rgbToHsl`
    // Converts an RGB color value to HSL.
    // *Assumes:* r, g, and b are contained in [0, 255] or [0, 1]
    // *Returns:* { h, s, l } in [0,1]
    function rgbToHsl(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return { h: h, s: s, l: l };
    }

    // `hslToRgb`
    // Converts an HSL color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
    function hslToRgb(h, s, l) {
        var r, g, b;

        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);

        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHsv`
    // Converts an RGB color value to HSV
    // *Assumes:* r, g, and b are contained in the set [0, 255] or [0, 1]
    // *Returns:* { h, s, v } in [0,1]
    function rgbToHsv(r, g, b) {

        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);

        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max === 0 ? 0 : d / max;

        if(max == min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h, s: s, v: v };
    }

    // `hsvToRgb`
    // Converts an HSV color value to RGB.
    // *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
    // *Returns:* { r, g, b } in the set [0, 255]
     function hsvToRgb(h, s, v) {

        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);

        var i = math.floor(h),
            f = h - i,
            p = v * (1 - s),
            q = v * (1 - f * s),
            t = v * (1 - (1 - f) * s),
            mod = i % 6,
            r = [v, q, p, p, t, v][mod],
            g = [t, v, v, q, p, p][mod],
            b = [p, p, t, v, v, q][mod];

        return { r: r * 255, g: g * 255, b: b * 255 };
    }

    // `rgbToHex`
    // Converts an RGB color to hex
    // Assumes r, g, and b are contained in the set [0, 255]
    // Returns a 3 or 6 character hex
    function rgbToHex(r, g, b, allow3Char) {

        var hex = [
            pad2(mathRound(r).toString(16)),
            pad2(mathRound(g).toString(16)),
            pad2(mathRound(b).toString(16))
        ];

        // Return a 3 character hex if possible
        if (allow3Char && hex[0].charAt(0) == hex[0].charAt(1) && hex[1].charAt(0) == hex[1].charAt(1) && hex[2].charAt(0) == hex[2].charAt(1)) {
            return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
        }

        return hex.join("");
    }
        // `rgbaToHex`
        // Converts an RGBA color plus alpha transparency to hex
        // Assumes r, g, b and a are contained in the set [0, 255]
        // Returns an 8 character hex
        function rgbaToHex(r, g, b, a) {

            var hex = [
                pad2(convertDecimalToHex(a)),
                pad2(mathRound(r).toString(16)),
                pad2(mathRound(g).toString(16)),
                pad2(mathRound(b).toString(16))
            ];

            return hex.join("");
        }

    // `equals`
    // Can be called with any tinycolor input
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) { return false; }
        return tinycolor(color1).toRgbString() == tinycolor(color2).toRgbString();
    };
    tinycolor.random = function() {
        return tinycolor.fromRatio({
            r: mathRandom(),
            g: mathRandom(),
            b: mathRandom()
        });
    };


    // Modification Functions
    // ----------------------
    // Thanks to less.js for some of the basics here
    // <https://github.com/cloudhead/less.js/blob/master/lib/less/functions.js>

    function desaturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s -= amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function saturate(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.s += amount / 100;
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    }

    function greyscale(color) {
        return tinycolor(color).desaturate(100);
    }

    function lighten (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l += amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    function brighten(color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var rgb = tinycolor(color).toRgb();
        rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
        rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
        rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
        return tinycolor(rgb);
    }

    function darken (color, amount) {
        amount = (amount === 0) ? 0 : (amount || 10);
        var hsl = tinycolor(color).toHsl();
        hsl.l -= amount / 100;
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    }

    // Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
    // Values outside of this range will be wrapped into this range.
    function spin(color, amount) {
        var hsl = tinycolor(color).toHsl();
        var hue = (mathRound(hsl.h) + amount) % 360;
        hsl.h = hue < 0 ? 360 + hue : hue;
        return tinycolor(hsl);
    }

    // Combination Functions
    // ---------------------
    // Thanks to jQuery xColor for some of the ideas behind these
    // <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

    function complement(color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    }

    function triad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function tetrad(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
            tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
        ];
    }

    function splitcomplement(color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [
            tinycolor(color),
            tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
            tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
        ];
    }

    function analogous(color, results, slices) {
        results = results || 6;
        slices = slices || 30;

        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];

        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    }

    function monochromatic(color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;

        while (results--) {
            ret.push(tinycolor({ h: h, s: s, v: v}));
            v = (v + modification) % 1;
        }

        return ret;
    }

    // Utility Functions
    // ---------------------

    tinycolor.mix = function(color1, color2, amount) {
        amount = (amount === 0) ? 0 : (amount || 50);

        var rgb1 = tinycolor(color1).toRgb();
        var rgb2 = tinycolor(color2).toRgb();

        var p = amount / 100;
        var w = p * 2 - 1;
        var a = rgb2.a - rgb1.a;

        var w1;

        if (w * a == -1) {
            w1 = w;
        } else {
            w1 = (w + a) / (1 + w * a);
        }

        w1 = (w1 + 1) / 2;

        var w2 = 1 - w1;

        var rgba = {
            r: rgb2.r * w1 + rgb1.r * w2,
            g: rgb2.g * w1 + rgb1.g * w2,
            b: rgb2.b * w1 + rgb1.b * w2,
            a: rgb2.a * p  + rgb1.a * (1 - p)
        };

        return tinycolor(rgba);
    };


    // Readability Functions
    // ---------------------
    // <http://www.w3.org/TR/AERT#color-contrast>

    // `readability`
    // Analyze the 2 colors and returns an object with the following properties:
    //    `brightness`: difference in brightness between the two colors
    //    `color`: difference in color/hue between the two colors
    tinycolor.readability = function(color1, color2) {
        var c1 = tinycolor(color1);
        var c2 = tinycolor(color2);
        var rgb1 = c1.toRgb();
        var rgb2 = c2.toRgb();
        var brightnessA = c1.getBrightness();
        var brightnessB = c2.getBrightness();
        var colorDiff = (
            Math.max(rgb1.r, rgb2.r) - Math.min(rgb1.r, rgb2.r) +
            Math.max(rgb1.g, rgb2.g) - Math.min(rgb1.g, rgb2.g) +
            Math.max(rgb1.b, rgb2.b) - Math.min(rgb1.b, rgb2.b)
        );

        return {
            brightness: Math.abs(brightnessA - brightnessB),
            color: colorDiff
        };
    };

    // `readable`
    // http://www.w3.org/TR/AERT#color-contrast
    // Ensure that foreground and background color combinations provide sufficient contrast.
    // *Example*
    //    tinycolor.isReadable("#000", "#111") => false
    tinycolor.isReadable = function(color1, color2) {
        var readability = tinycolor.readability(color1, color2);
        return readability.brightness > 125 && readability.color > 500;
    };

    // `mostReadable`
    // Given a base color and a list of possible foreground or background
    // colors for that base, returns the most readable color.
    // *Example*
    //    tinycolor.mostReadable("#123", ["#fff", "#000"]) => "#000"
    tinycolor.mostReadable = function(baseColor, colorList) {
        var bestColor = null;
        var bestScore = 0;
        var bestIsReadable = false;
        for (var i=0; i < colorList.length; i++) {

            // We normalize both around the "acceptable" breaking point,
            // but rank brightness constrast higher than hue.

            var readability = tinycolor.readability(baseColor, colorList[i]);
            var readable = readability.brightness > 125 && readability.color > 500;
            var score = 3 * (readability.brightness / 125) + (readability.color / 500);

            if ((readable && ! bestIsReadable) ||
                (readable && bestIsReadable && score > bestScore) ||
                ((! readable) && (! bestIsReadable) && score > bestScore)) {
                bestIsReadable = readable;
                bestScore = score;
                bestColor = tinycolor(colorList[i]);
            }
        }
        return bestColor;
    };


    // Big List of Colors
    // ------------------
    // <http://www.w3.org/TR/css3-color/#svg-color>
    var names = tinycolor.names = {
        aliceblue: "f0f8ff",
        antiquewhite: "faebd7",
        aqua: "0ff",
        aquamarine: "7fffd4",
        azure: "f0ffff",
        beige: "f5f5dc",
        bisque: "ffe4c4",
        black: "000",
        blanchedalmond: "ffebcd",
        blue: "00f",
        blueviolet: "8a2be2",
        brown: "a52a2a",
        burlywood: "deb887",
        burntsienna: "ea7e5d",
        cadetblue: "5f9ea0",
        chartreuse: "7fff00",
        chocolate: "d2691e",
        coral: "ff7f50",
        cornflowerblue: "6495ed",
        cornsilk: "fff8dc",
        crimson: "dc143c",
        cyan: "0ff",
        darkblue: "00008b",
        darkcyan: "008b8b",
        darkgoldenrod: "b8860b",
        darkgray: "a9a9a9",
        darkgreen: "006400",
        darkgrey: "a9a9a9",
        darkkhaki: "bdb76b",
        darkmagenta: "8b008b",
        darkolivegreen: "556b2f",
        darkorange: "ff8c00",
        darkorchid: "9932cc",
        darkred: "8b0000",
        darksalmon: "e9967a",
        darkseagreen: "8fbc8f",
        darkslateblue: "483d8b",
        darkslategray: "2f4f4f",
        darkslategrey: "2f4f4f",
        darkturquoise: "00ced1",
        darkviolet: "9400d3",
        deeppink: "ff1493",
        deepskyblue: "00bfff",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1e90ff",
        firebrick: "b22222",
        floralwhite: "fffaf0",
        forestgreen: "228b22",
        fuchsia: "f0f",
        gainsboro: "dcdcdc",
        ghostwhite: "f8f8ff",
        gold: "ffd700",
        goldenrod: "daa520",
        gray: "808080",
        green: "008000",
        greenyellow: "adff2f",
        grey: "808080",
        honeydew: "f0fff0",
        hotpink: "ff69b4",
        indianred: "cd5c5c",
        indigo: "4b0082",
        ivory: "fffff0",
        khaki: "f0e68c",
        lavender: "e6e6fa",
        lavenderblush: "fff0f5",
        lawngreen: "7cfc00",
        lemonchiffon: "fffacd",
        lightblue: "add8e6",
        lightcoral: "f08080",
        lightcyan: "e0ffff",
        lightgoldenrodyellow: "fafad2",
        lightgray: "d3d3d3",
        lightgreen: "90ee90",
        lightgrey: "d3d3d3",
        lightpink: "ffb6c1",
        lightsalmon: "ffa07a",
        lightseagreen: "20b2aa",
        lightskyblue: "87cefa",
        lightslategray: "789",
        lightslategrey: "789",
        lightsteelblue: "b0c4de",
        lightyellow: "ffffe0",
        lime: "0f0",
        limegreen: "32cd32",
        linen: "faf0e6",
        magenta: "f0f",
        maroon: "800000",
        mediumaquamarine: "66cdaa",
        mediumblue: "0000cd",
        mediumorchid: "ba55d3",
        mediumpurple: "9370db",
        mediumseagreen: "3cb371",
        mediumslateblue: "7b68ee",
        mediumspringgreen: "00fa9a",
        mediumturquoise: "48d1cc",
        mediumvioletred: "c71585",
        midnightblue: "191970",
        mintcream: "f5fffa",
        mistyrose: "ffe4e1",
        moccasin: "ffe4b5",
        navajowhite: "ffdead",
        navy: "000080",
        oldlace: "fdf5e6",
        olive: "808000",
        olivedrab: "6b8e23",
        orange: "ffa500",
        orangered: "ff4500",
        orchid: "da70d6",
        palegoldenrod: "eee8aa",
        palegreen: "98fb98",
        paleturquoise: "afeeee",
        palevioletred: "db7093",
        papayawhip: "ffefd5",
        peachpuff: "ffdab9",
        peru: "cd853f",
        pink: "ffc0cb",
        plum: "dda0dd",
        powderblue: "b0e0e6",
        purple: "800080",
        red: "f00",
        rosybrown: "bc8f8f",
        royalblue: "4169e1",
        saddlebrown: "8b4513",
        salmon: "fa8072",
        sandybrown: "f4a460",
        seagreen: "2e8b57",
        seashell: "fff5ee",
        sienna: "a0522d",
        silver: "c0c0c0",
        skyblue: "87ceeb",
        slateblue: "6a5acd",
        slategray: "708090",
        slategrey: "708090",
        snow: "fffafa",
        springgreen: "00ff7f",
        steelblue: "4682b4",
        tan: "d2b48c",
        teal: "008080",
        thistle: "d8bfd8",
        tomato: "ff6347",
        turquoise: "40e0d0",
        violet: "ee82ee",
        wheat: "f5deb3",
        white: "fff",
        whitesmoke: "f5f5f5",
        yellow: "ff0",
        yellowgreen: "9acd32"
    };

    // Make it easy to access colors via `hexNames[hex]`
    var hexNames = tinycolor.hexNames = flip(names);


    // Utilities
    // ---------

    // `{ 'name1': 'val1' }` becomes `{ 'val1': 'name1' }`
    function flip(o) {
        var flipped = { };
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }

    // Return a valid alpha value [0,1] with all invalid values being set to 1
    function boundAlpha(a) {
        a = parseFloat(a);

        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }

        return a;
    }

    // Take input from [0, n] and return it as [0, 1]
    function bound01(n, max) {
        if (isOnePointZero(n)) { n = "100%"; }

        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));

        // Automatically convert percentage into number
        if (processPercent) {
            n = parseInt(n * max, 10) / 100;
        }

        // Handle floating point rounding errors
        if ((math.abs(n - max) < 0.000001)) {
            return 1;
        }

        // Convert into [0, 1] range if it isn't already
        return (n % max) / parseFloat(max);
    }

    // Force a number between 0 and 1
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }

    // Parse a base-16 hex value into a base-10 integer
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

    // Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
    // <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
    }

    // Check to see if string passed in is a percentage
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf('%') != -1;
    }

    // Force a hex value to have 2 characters
    function pad2(c) {
        return c.length == 1 ? '0' + c : '' + c;
    }

    // Replace a decimal with it's percentage value
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }

        return n;
    }

    // Converts a decimal to a hex value
    function convertDecimalToHex(d) {
        return Math.round(parseFloat(d) * 255).toString(16);
    }
    // Converts a hex value to a decimal
    function convertHexToDecimal(h) {
        return (parseIntFromHex(h) / 255);
    }

    var matchers = (function() {

        // <http://www.w3.org/TR/css3-values/#integers>
        var CSS_INTEGER = "[-\\+]?\\d+%?";

        // <http://www.w3.org/TR/css3-values/#number-value>
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";

        // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";

        // Actual matching.
        // Parentheses and commas are optional, but not required.
        // Whitespace can take the place of commas or opening paren
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

        return {
            rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
            rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
            hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
            hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
            hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
            hex3: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            hex6: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            hex8: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
        };
    })();

    // `stringInputToObject`
    // Permissive string parsing.  Take in a number of formats, and output an object
    // based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
    function stringInputToObject(color) {

        color = color.replace(trimLeft,'').replace(trimRight, '').toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color == 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: "name" };
        }

        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        if ((match = matchers.rgba.exec(color))) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        if ((match = matchers.hsl.exec(color))) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        if ((match = matchers.hsla.exec(color))) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        if ((match = matchers.hsv.exec(color))) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        if ((match = matchers.hex8.exec(color))) {
            return {
                a: convertHexToDecimal(match[1]),
                r: parseIntFromHex(match[2]),
                g: parseIntFromHex(match[3]),
                b: parseIntFromHex(match[4]),
                format: named ? "name" : "hex8"
            };
        }
        if ((match = matchers.hex6.exec(color))) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? "name" : "hex"
            };
        }
        if ((match = matchers.hex3.exec(color))) {
            return {
                r: parseIntFromHex(match[1] + '' + match[1]),
                g: parseIntFromHex(match[2] + '' + match[2]),
                b: parseIntFromHex(match[3] + '' + match[3]),
                format: named ? "name" : "hex"
            };
        }

        return false;
    }

    window.tinycolor = tinycolor;
    })();


    $(function () {
        if ($.fn.spectrum.load) {
            $.fn.spectrum.processNativeColorInputs();
        }
    });

})(window, jQuery);

;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

/*
 * Foundation Responsive Library
 * http://foundation.zurb.com
 * Copyright 2014, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/

(function ($, window, document, undefined) {
  'use strict';

  var header_helpers = function (class_array) {
    var i = class_array.length;
    var head = $('head');

    while (i--) {
      if (head.has('.' + class_array[i]).length === 0) {
        head.append('<meta class="' + class_array[i] + '" />');
      }
    }
  };

  header_helpers([
    'foundation-mq-small',
    'foundation-mq-small-only',
    'foundation-mq-medium',
    'foundation-mq-medium-only',
    'foundation-mq-large',
    'foundation-mq-large-only',
    'foundation-mq-xlarge',
    'foundation-mq-xlarge-only',
    'foundation-mq-xxlarge',
    'foundation-data-attribute-namespace']);

  // Enable FastClick if present

  $(function () {
    if (typeof FastClick !== 'undefined') {
      // Don't attach to body if undefined
      if (typeof document.body !== 'undefined') {
        FastClick.attach(document.body);
      }
    }
  });

  // private Fast Selector wrapper,
  // returns jQuery object. Only use where
  // getElementById is not available.
  var S = function (selector, context) {
    if (typeof selector === 'string') {
      if (context) {
        var cont;
        if (context.jquery) {
          cont = context[0];
          if (!cont) {
            return context;
          }
        } else {
          cont = context;
        }
        return $(cont.querySelectorAll(selector));
      }

      return $(document.querySelectorAll(selector));
    }

    return $(selector, context);
  };

  // Namespace functions.

  var attr_name = function (init) {
    var arr = [];
    if (!init) {
      arr.push('data');
    }
    if (this.namespace.length > 0) {
      arr.push(this.namespace);
    }
    arr.push(this.name);

    return arr.join('-');
  };

  var add_namespace = function (str) {
    var parts = str.split('-'),
        i = parts.length,
        arr = [];

    while (i--) {
      if (i !== 0) {
        arr.push(parts[i]);
      } else {
        if (this.namespace.length > 0) {
          arr.push(this.namespace, parts[i]);
        } else {
          arr.push(parts[i]);
        }
      }
    }

    return arr.reverse().join('-');
  };

  // Event binding and data-options updating.

  var bindings = function (method, options) {
    var self = this,
        bind = function(){
          var $this = S(this),
              should_bind_events = !$this.data(self.attr_name(true) + '-init');
          $this.data(self.attr_name(true) + '-init', $.extend({}, self.settings, (options || method), self.data_options($this)));

          if (should_bind_events) {
            self.events(this);
          }
        };

    if (S(this.scope).is('[' + this.attr_name() +']')) {
      bind.call(this.scope);
    } else {
      S('[' + this.attr_name() +']', this.scope).each(bind);
    }
    // # Patch to fix #5043 to move this *after* the if/else clause in order for Backbone and similar frameworks to have improved control over event binding and data-options updating.
    if (typeof method === 'string') {
      return this[method].call(this, options);
    }

  };

  var single_image_loaded = function (image, callback) {
    function loaded () {
      callback(image[0]);
    }

    function bindLoad () {
      this.one('load', loaded);

      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        var src = this.attr( 'src' ),
            param = src.match( /\?/ ) ? '&' : '?';

        param += 'random=' + (new Date()).getTime();
        this.attr('src', src + param);
      }
    }

    if (!image.attr('src')) {
      loaded();
      return;
    }

    if (image[0].complete || image[0].readyState === 4) {
      loaded();
    } else {
      bindLoad.call(image);
    }
  };

  /*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

  window.matchMedia || (window.matchMedia = function() {
      "use strict";

      // For browsers that support matchMedium api such as IE 9 and webkit
      var styleMedia = (window.styleMedia || window.media);

      // For those that don't support matchMedium
      if (!styleMedia) {
          var style       = document.createElement('style'),
              script      = document.getElementsByTagName('script')[0],
              info        = null;

          style.type  = 'text/css';
          style.id    = 'matchmediajs-test';

          script.parentNode.insertBefore(style, script);

          // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
          info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

          styleMedia = {
              matchMedium: function(media) {
                  var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                  // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                  if (style.styleSheet) {
                      style.styleSheet.cssText = text;
                  } else {
                      style.textContent = text;
                  }

                  // Test if media query is true or false
                  return info.width === '1px';
              }
          };
      }

      return function(media) {
          return {
              matches: styleMedia.matchMedium(media || 'all'),
              media: media || 'all'
          };
      };
  }());

  /*
   * jquery.requestAnimationFrame
   * https://github.com/gnarf37/jquery-requestAnimationFrame
   * Requires jQuery 1.8+
   *
   * Copyright (c) 2012 Corey Frang
   * Licensed under the MIT license.
   */

  (function(jQuery) {


  // requestAnimationFrame polyfill adapted from Erik Möller
  // fixes from Paul Irish and Tino Zijdel
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  var animating,
      lastTime = 0,
      vendors = ['webkit', 'moz'],
      requestAnimationFrame = window.requestAnimationFrame,
      cancelAnimationFrame = window.cancelAnimationFrame,
      jqueryFxAvailable = 'undefined' !== typeof jQuery.fx;

  for (; lastTime < vendors.length && !requestAnimationFrame; lastTime++) {
    requestAnimationFrame = window[ vendors[lastTime] + 'RequestAnimationFrame' ];
    cancelAnimationFrame = cancelAnimationFrame ||
      window[ vendors[lastTime] + 'CancelAnimationFrame' ] ||
      window[ vendors[lastTime] + 'CancelRequestAnimationFrame' ];
  }

  function raf() {
    if (animating) {
      requestAnimationFrame(raf);

      if (jqueryFxAvailable) {
        jQuery.fx.tick();
      }
    }
  }

  if (requestAnimationFrame) {
    // use rAF
    window.requestAnimationFrame = requestAnimationFrame;
    window.cancelAnimationFrame = cancelAnimationFrame;

    if (jqueryFxAvailable) {
      jQuery.fx.timer = function (timer) {
        if (timer() && jQuery.timers.push(timer) && !animating) {
          animating = true;
          raf();
        }
      };

      jQuery.fx.stop = function () {
        animating = false;
      };
    }
  } else {
    // polyfill
    window.requestAnimationFrame = function (callback) {
      var currTime = new Date().getTime(),
        timeToCall = Math.max(0, 16 - (currTime - lastTime)),
        id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };

  }

  }( $ ));

  function removeQuotes (string) {
    if (typeof string === 'string' || string instanceof String) {
      string = string.replace(/^['\\/"]+|(;\s?})+|['\\/"]+$/g, '');
    }

    return string;
  }

  window.Foundation = {
    name : 'Foundation',

    version : '5.5.2',

    media_queries : {
      'small'       : S('.foundation-mq-small').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'small-only'  : S('.foundation-mq-small-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'medium'      : S('.foundation-mq-medium').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'medium-only' : S('.foundation-mq-medium-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'large'       : S('.foundation-mq-large').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'large-only'  : S('.foundation-mq-large-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xlarge'      : S('.foundation-mq-xlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xlarge-only' : S('.foundation-mq-xlarge-only').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
      'xxlarge'     : S('.foundation-mq-xxlarge').css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, '')
    },

    stylesheet : $('<style></style>').appendTo('head')[0].sheet,

    global : {
      namespace : undefined
    },

    init : function (scope, libraries, method, options, response) {
      var args = [scope, method, options, response],
          responses = [];

      // check RTL
      this.rtl = /rtl/i.test(S('html').attr('dir'));

      // set foundation global scope
      this.scope = scope || this.scope;

      this.set_namespace();

      if (libraries && typeof libraries === 'string' && !/reflow/i.test(libraries)) {
        if (this.libs.hasOwnProperty(libraries)) {
          responses.push(this.init_lib(libraries, args));
        }
      } else {
        for (var lib in this.libs) {
          responses.push(this.init_lib(lib, libraries));
        }
      }

      S(window).load(function () {
        S(window)
          .trigger('resize.fndtn.clearing')
          .trigger('resize.fndtn.dropdown')
          .trigger('resize.fndtn.equalizer')
          .trigger('resize.fndtn.interchange')
          .trigger('resize.fndtn.joyride')
          .trigger('resize.fndtn.magellan')
          .trigger('resize.fndtn.topbar')
          .trigger('resize.fndtn.slider');
      });

      return scope;
    },

    init_lib : function (lib, args) {
      if (this.libs.hasOwnProperty(lib)) {
        this.patch(this.libs[lib]);

        if (args && args.hasOwnProperty(lib)) {
            if (typeof this.libs[lib].settings !== 'undefined') {
              $.extend(true, this.libs[lib].settings, args[lib]);
            } else if (typeof this.libs[lib].defaults !== 'undefined') {
              $.extend(true, this.libs[lib].defaults, args[lib]);
            }
          return this.libs[lib].init.apply(this.libs[lib], [this.scope, args[lib]]);
        }

        args = args instanceof Array ? args : new Array(args);
        return this.libs[lib].init.apply(this.libs[lib], args);
      }

      return function () {};
    },

    patch : function (lib) {
      lib.scope = this.scope;
      lib.namespace = this.global.namespace;
      lib.rtl = this.rtl;
      lib['data_options'] = this.utils.data_options;
      lib['attr_name'] = attr_name;
      lib['add_namespace'] = add_namespace;
      lib['bindings'] = bindings;
      lib['S'] = this.utils.S;
    },

    inherit : function (scope, methods) {
      var methods_arr = methods.split(' '),
          i = methods_arr.length;

      while (i--) {
        if (this.utils.hasOwnProperty(methods_arr[i])) {
          scope[methods_arr[i]] = this.utils[methods_arr[i]];
        }
      }
    },

    set_namespace : function () {

      // Description:
      //    Don't bother reading the namespace out of the meta tag
      //    if the namespace has been set globally in javascript
      //
      // Example:
      //    Foundation.global.namespace = 'my-namespace';
      // or make it an empty string:
      //    Foundation.global.namespace = '';
      //
      //

      // If the namespace has not been set (is undefined), try to read it out of the meta element.
      // Otherwise use the globally defined namespace, even if it's empty ('')
      var namespace = ( this.global.namespace === undefined ) ? $('.foundation-data-attribute-namespace').css('font-family') : this.global.namespace;

      // Finally, if the namsepace is either undefined or false, set it to an empty string.
      // Otherwise use the namespace value.
      this.global.namespace = ( namespace === undefined || /false/i.test(namespace) ) ? '' : namespace;
    },

    libs : {},

    // methods that can be inherited in libraries
    utils : {

      // Description:
      //    Fast Selector wrapper returns jQuery object. Only use where getElementById
      //    is not available.
      //
      // Arguments:
      //    Selector (String): CSS selector describing the element(s) to be
      //    returned as a jQuery object.
      //
      //    Scope (String): CSS selector describing the area to be searched. Default
      //    is document.
      //
      // Returns:
      //    Element (jQuery Object): jQuery object containing elements matching the
      //    selector within the scope.
      S : S,

      // Description:
      //    Executes a function a max of once every n milliseconds
      //
      // Arguments:
      //    Func (Function): Function to be throttled.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      // Returns:
      //    Lazy_function (Function): Function with throttling applied.
      throttle : function (func, delay) {
        var timer = null;

        return function () {
          var context = this, args = arguments;

          if (timer == null) {
            timer = setTimeout(function () {
              func.apply(context, args);
              timer = null;
            }, delay);
          }
        };
      },

      // Description:
      //    Executes a function when it stops being invoked for n seconds
      //    Modified version of _.debounce() http://underscorejs.org
      //
      // Arguments:
      //    Func (Function): Function to be debounced.
      //
      //    Delay (Integer): Function execution threshold in milliseconds.
      //
      //    Immediate (Bool): Whether the function should be called at the beginning
      //    of the delay instead of the end. Default is false.
      //
      // Returns:
      //    Lazy_function (Function): Function with debouncing applied.
      debounce : function (func, delay, immediate) {
        var timeout, result;
        return function () {
          var context = this, args = arguments;
          var later = function () {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
            }
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, delay);
          if (callNow) {
            result = func.apply(context, args);
          }
          return result;
        };
      },

      // Description:
      //    Parses data-options attribute
      //
      // Arguments:
      //    El (jQuery Object): Element to be parsed.
      //
      // Returns:
      //    Options (Javascript Object): Contents of the element's data-options
      //    attribute.
      data_options : function (el, data_attr_name) {
        data_attr_name = data_attr_name || 'options';
        var opts = {}, ii, p, opts_arr,
            data_options = function (el) {
              var namespace = Foundation.global.namespace;

              if (namespace.length > 0) {
                return el.data(namespace + '-' + data_attr_name);
              }

              return el.data(data_attr_name);
            };

        var cached_options = data_options(el);

        if (typeof cached_options === 'object') {
          return cached_options;
        }

        opts_arr = (cached_options || ':').split(';');
        ii = opts_arr.length;

        function isNumber (o) {
          return !isNaN (o - 0) && o !== null && o !== '' && o !== false && o !== true;
        }

        function trim (str) {
          if (typeof str === 'string') {
            return $.trim(str);
          }
          return str;
        }

        while (ii--) {
          p = opts_arr[ii].split(':');
          p = [p[0], p.slice(1).join(':')];

          if (/true/i.test(p[1])) {
            p[1] = true;
          }
          if (/false/i.test(p[1])) {
            p[1] = false;
          }
          if (isNumber(p[1])) {
            if (p[1].indexOf('.') === -1) {
              p[1] = parseInt(p[1], 10);
            } else {
              p[1] = parseFloat(p[1]);
            }
          }

          if (p.length === 2 && p[0].length > 0) {
            opts[trim(p[0])] = trim(p[1]);
          }
        }

        return opts;
      },

      // Description:
      //    Adds JS-recognizable media queries
      //
      // Arguments:
      //    Media (String): Key string for the media query to be stored as in
      //    Foundation.media_queries
      //
      //    Class (String): Class name for the generated <meta> tag
      register_media : function (media, media_class) {
        if (Foundation.media_queries[media] === undefined) {
          $('head').append('<meta class="' + media_class + '"/>');
          Foundation.media_queries[media] = removeQuotes($('.' + media_class).css('font-family'));
        }
      },

      // Description:
      //    Add custom CSS within a JS-defined media query
      //
      // Arguments:
      //    Rule (String): CSS rule to be appended to the document.
      //
      //    Media (String): Optional media query string for the CSS rule to be
      //    nested under.
      add_custom_rule : function (rule, media) {
        if (media === undefined && Foundation.stylesheet) {
          Foundation.stylesheet.insertRule(rule, Foundation.stylesheet.cssRules.length);
        } else {
          var query = Foundation.media_queries[media];

          if (query !== undefined) {
            Foundation.stylesheet.insertRule('@media ' +
              Foundation.media_queries[media] + '{ ' + rule + ' }', Foundation.stylesheet.cssRules.length);
          }
        }
      },

      // Description:
      //    Performs a callback function when an image is fully loaded
      //
      // Arguments:
      //    Image (jQuery Object): Image(s) to check if loaded.
      //
      //    Callback (Function): Function to execute when image is fully loaded.
      image_loaded : function (images, callback) {
        var self = this,
            unloaded = images.length;

        function pictures_has_height(images) {
          var pictures_number = images.length;

          for (var i = pictures_number - 1; i >= 0; i--) {
            if(images.attr('height') === undefined) {
              return false;
            };
          };

          return true;
        }

        if (unloaded === 0 || pictures_has_height(images)) {
          callback(images);
        }

        images.each(function () {
          single_image_loaded(self.S(this), function () {
            unloaded -= 1;
            if (unloaded === 0) {
              callback(images);
            }
          });
        });
      },

      // Description:
      //    Returns a random, alphanumeric string
      //
      // Arguments:
      //    Length (Integer): Length of string to be generated. Defaults to random
      //    integer.
      //
      // Returns:
      //    Rand (String): Pseudo-random, alphanumeric string.
      random_str : function () {
        if (!this.fidx) {
          this.fidx = 0;
        }
        this.prefix = this.prefix || [(this.name || 'F'), (+new Date).toString(36)].join('-');

        return this.prefix + (this.fidx++).toString(36);
      },

      // Description:
      //    Helper for window.matchMedia
      //
      // Arguments:
      //    mq (String): Media query
      //
      // Returns:
      //    (Boolean): Whether the media query passes or not
      match : function (mq) {
        return window.matchMedia(mq).matches;
      },

      // Description:
      //    Helpers for checking Foundation default media queries with JS
      //
      // Returns:
      //    (Boolean): Whether the media query passes or not

      is_small_up : function () {
        return this.match(Foundation.media_queries.small);
      },

      is_medium_up : function () {
        return this.match(Foundation.media_queries.medium);
      },

      is_large_up : function () {
        return this.match(Foundation.media_queries.large);
      },

      is_xlarge_up : function () {
        return this.match(Foundation.media_queries.xlarge);
      },

      is_xxlarge_up : function () {
        return this.match(Foundation.media_queries.xxlarge);
      },

      is_small_only : function () {
        return !this.is_medium_up() && !this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_medium_only : function () {
        return this.is_medium_up() && !this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_large_only : function () {
        return this.is_medium_up() && this.is_large_up() && !this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_xlarge_only : function () {
        return this.is_medium_up() && this.is_large_up() && this.is_xlarge_up() && !this.is_xxlarge_up();
      },

      is_xxlarge_only : function () {
        return this.is_medium_up() && this.is_large_up() && this.is_xlarge_up() && this.is_xxlarge_up();
      }
    }
  };

  $.fn.foundation = function () {
    var args = Array.prototype.slice.call(arguments, 0);

    return this.each(function () {
      Foundation.init.apply(Foundation, [this].concat(args));
      return this;
    });
  };

}(jQuery, window, window.document));

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.reveal = {
    name : 'reveal',

    version : '5.5.2',

    locked : false,

    settings : {
      animation : 'fadeAndPop',
      animation_speed : 250,
      close_on_background_click : true,
      close_on_esc : true,
      dismiss_modal_class : 'close-reveal-modal',
      multiple_opened : false,
      bg_class : 'reveal-modal-bg',
      root_element : 'body',
      open : function(){},
      opened : function(){},
      close : function(){},
      closed : function(){},
      on_ajax_error: $.noop,
      bg : $('.reveal-modal-bg'),
      css : {
        open : {
          'opacity' : 0,
          'visibility' : 'visible',
          'display' : 'block'
        },
        close : {
          'opacity' : 1,
          'visibility' : 'hidden',
          'display' : 'none'
        }
      }
    },

    init : function (scope, method, options) {
      $.extend(true, this.settings, method, options);
      this.bindings(method, options);
    },

    events : function (scope) {
      var self = this,
          S = self.S;

      S(this.scope)
        .off('.reveal')
        .on('click.fndtn.reveal', '[' + this.add_namespace('data-reveal-id') + ']:not([disabled])', function (e) {
          e.preventDefault();

          if (!self.locked) {
            var element = S(this),
                ajax = element.data(self.data_attr('reveal-ajax')),
                replaceContentSel = element.data(self.data_attr('reveal-replace-content'));

            self.locked = true;

            if (typeof ajax === 'undefined') {
              self.open.call(self, element);
            } else {
              var url = ajax === true ? element.attr('href') : ajax;
              self.open.call(self, element, {url : url}, { replaceContentSel : replaceContentSel });
            }
          }
        });

      S(document)
        .on('click.fndtn.reveal', this.close_targets(), function (e) {
          e.preventDefault();
          if (!self.locked) {
            var settings = S('[' + self.attr_name() + '].open').data(self.attr_name(true) + '-init') || self.settings,
                bg_clicked = S(e.target)[0] === S('.' + settings.bg_class)[0];

            if (bg_clicked) {
              if (settings.close_on_background_click) {
                e.stopPropagation();
              } else {
                return;
              }
            }

            self.locked = true;
            self.close.call(self, bg_clicked ? S('[' + self.attr_name() + '].open:not(.toback)') : S(this).closest('[' + self.attr_name() + ']'));
          }
        });

      if (S('[' + self.attr_name() + ']', this.scope).length > 0) {
        S(this.scope)
          // .off('.reveal')
          .on('open.fndtn.reveal', this.settings.open)
          .on('opened.fndtn.reveal', this.settings.opened)
          .on('opened.fndtn.reveal', this.open_video)
          .on('close.fndtn.reveal', this.settings.close)
          .on('closed.fndtn.reveal', this.settings.closed)
          .on('closed.fndtn.reveal', this.close_video);
      } else {
        S(this.scope)
          // .off('.reveal')
          .on('open.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.open)
          .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.opened)
          .on('opened.fndtn.reveal', '[' + self.attr_name() + ']', this.open_video)
          .on('close.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.close)
          .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.settings.closed)
          .on('closed.fndtn.reveal', '[' + self.attr_name() + ']', this.close_video);
      }

      return true;
    },

    // PATCH #3: turning on key up capture only when a reveal window is open
    key_up_on : function (scope) {
      var self = this;

      // PATCH #1: fixing multiple keyup event trigger from single key press
      self.S('body').off('keyup.fndtn.reveal').on('keyup.fndtn.reveal', function ( event ) {
        var open_modal = self.S('[' + self.attr_name() + '].open'),
            settings = open_modal.data(self.attr_name(true) + '-init') || self.settings ;
        // PATCH #2: making sure that the close event can be called only while unlocked,
        //           so that multiple keyup.fndtn.reveal events don't prevent clean closing of the reveal window.
        if ( settings && event.which === 27  && settings.close_on_esc && !self.locked) { // 27 is the keycode for the Escape key
          self.close.call(self, open_modal);
        }
      });

      return true;
    },

    // PATCH #3: turning on key up capture only when a reveal window is open
    key_up_off : function (scope) {
      this.S('body').off('keyup.fndtn.reveal');
      return true;
    },

    open : function (target, ajax_settings) {
      var self = this,
          modal;

      if (target) {
        if (typeof target.selector !== 'undefined') {
          // Find the named node; only use the first one found, since the rest of the code assumes there's only one node
          modal = self.S('#' + target.data(self.data_attr('reveal-id'))).first();
        } else {
          modal = self.S(this.scope);

          ajax_settings = target;
        }
      } else {
        modal = self.S(this.scope);
      }

      var settings = modal.data(self.attr_name(true) + '-init');
      settings = settings || this.settings;


      if (modal.hasClass('open') && target.attr('data-reveal-id') == modal.attr('id')) {
        return self.close(modal);
      }

      if (!modal.hasClass('open')) {
        var open_modal = self.S('[' + self.attr_name() + '].open');

        if (typeof modal.data('css-top') === 'undefined') {
          modal.data('css-top', parseInt(modal.css('top'), 10))
            .data('offset', this.cache_offset(modal));
        }

        modal.attr('tabindex','0').attr('aria-hidden','false');

        this.key_up_on(modal);    // PATCH #3: turning on key up capture only when a reveal window is open

        // Prevent namespace event from triggering twice
        modal.on('open.fndtn.reveal', function(e) {
          if (e.namespace !== 'fndtn.reveal') return;
        });

        modal.on('open.fndtn.reveal').trigger('open.fndtn.reveal');

        if (open_modal.length < 1) {
          this.toggle_bg(modal, true);
        }

        if (typeof ajax_settings === 'string') {
          ajax_settings = {
            url : ajax_settings
          };
        }

        if (typeof ajax_settings === 'undefined' || !ajax_settings.url) {
          if (open_modal.length > 0) {
            if (settings.multiple_opened) {
              self.to_back(open_modal);
            } else {
              self.hide(open_modal, settings.css.close);
            }
          }

          this.show(modal, settings.css.open);
        } else {
          var old_success = typeof ajax_settings.success !== 'undefined' ? ajax_settings.success : null;
          $.extend(ajax_settings, {
            success : function (data, textStatus, jqXHR) {
              if ( $.isFunction(old_success) ) {
                var result = old_success(data, textStatus, jqXHR);
                if (typeof result == 'string') {
                  data = result;
                }
              }

              if (typeof options !== 'undefined' && typeof options.replaceContentSel !== 'undefined') {
                modal.find(options.replaceContentSel).html(data);
              } else {
                modal.html(data);
              }

              self.S(modal).foundation('section', 'reflow');
              self.S(modal).children().foundation();

              if (open_modal.length > 0) {
                if (settings.multiple_opened) {
                  self.to_back(open_modal);
                } else {
                  self.hide(open_modal, settings.css.close);
                }
              }
              self.show(modal, settings.css.open);
            }
          });

          // check for if user initalized with error callback
          if (settings.on_ajax_error !== $.noop) {
            $.extend(ajax_settings, {
              error : settings.on_ajax_error
            });
          }

          $.ajax(ajax_settings);
        }
      }
      self.S(window).trigger('resize');
    },

    close : function (modal) {
      var modal = modal && modal.length ? modal : this.S(this.scope),
          open_modals = this.S('[' + this.attr_name() + '].open'),
          settings = modal.data(this.attr_name(true) + '-init') || this.settings,
          self = this;

      if (open_modals.length > 0) {

        modal.removeAttr('tabindex','0').attr('aria-hidden','true');

        this.locked = true;
        this.key_up_off(modal);   // PATCH #3: turning on key up capture only when a reveal window is open

        modal.trigger('close.fndtn.reveal');

        if ((settings.multiple_opened && open_modals.length === 1) || !settings.multiple_opened || modal.length > 1) {
          self.toggle_bg(modal, false);
          self.to_front(modal);
        }

        if (settings.multiple_opened) {
          self.hide(modal, settings.css.close, settings);
          self.to_front($($.makeArray(open_modals).reverse()[1]));
        } else {
          self.hide(open_modals, settings.css.close, settings);
        }
      }
    },

    close_targets : function () {
      var base = '.' + this.settings.dismiss_modal_class;

      if (this.settings.close_on_background_click) {
        return base + ', .' + this.settings.bg_class;
      }

      return base;
    },

    toggle_bg : function (modal, state) {
      if (this.S('.' + this.settings.bg_class).length === 0) {
        this.settings.bg = $('<div />', {'class': this.settings.bg_class})
          .appendTo('body').hide();
      }

      var visible = this.settings.bg.filter(':visible').length > 0;
      if ( state != visible ) {
        if ( state == undefined ? visible : !state ) {
          this.hide(this.settings.bg);
        } else {
          this.show(this.settings.bg);
        }
      }
    },

    show : function (el, css) {
      // is modal
      if (css) {
        var settings = el.data(this.attr_name(true) + '-init') || this.settings,
            root_element = settings.root_element,
            context = this;

        if (el.parent(root_element).length === 0) {
          var placeholder = el.wrap('<div style="display: none;" />').parent();

          el.on('closed.fndtn.reveal.wrapped', function () {
            el.detach().appendTo(placeholder);
            el.unwrap().unbind('closed.fndtn.reveal.wrapped');
          });

          el.detach().appendTo(root_element);
        }

        var animData = getAnimationData(settings.animation);
        if (!animData.animate) {
          this.locked = false;
        }
        if (animData.pop) {
          css.top = $(window).scrollTop() - el.data('offset') + 'px';
          var end_css = {
            top: $(window).scrollTop() + el.data('css-top') + 'px',
            opacity: 1
          };

          return setTimeout(function () {
            return el
              .css(css)
              .animate(end_css, settings.animation_speed, 'linear', function () {
                context.locked = false;
                el.trigger('opened.fndtn.reveal');
              })
              .addClass('open');
          }, settings.animation_speed / 2);
        }

        if (animData.fade) {
          css.top = $(window).scrollTop() + el.data('css-top') + 'px';
          var end_css = {opacity: 1};

          return setTimeout(function () {
            return el
              .css(css)
              .animate(end_css, settings.animation_speed, 'linear', function () {
                context.locked = false;
                el.trigger('opened.fndtn.reveal');
              })
              .addClass('open');
          }, settings.animation_speed / 2);
        }

        return el.css(css).show().css({opacity : 1}).addClass('open').trigger('opened.fndtn.reveal');
      }

      var settings = this.settings;

      // should we animate the background?
      if (getAnimationData(settings.animation).fade) {
        return el.fadeIn(settings.animation_speed / 2);
      }

      this.locked = false;

      return el.show();
    },

    to_back : function(el) {
      el.addClass('toback');
    },

    to_front : function(el) {
      el.removeClass('toback');
    },

    hide : function (el, css) {
      // is modal
      if (css) {
        var settings = el.data(this.attr_name(true) + '-init'),
            context = this;
        settings = settings || this.settings;

        var animData = getAnimationData(settings.animation);
        if (!animData.animate) {
          this.locked = false;
        }
        if (animData.pop) {
          var end_css = {
            top: - $(window).scrollTop() - el.data('offset') + 'px',
            opacity: 0
          };

          return setTimeout(function () {
            return el
              .animate(end_css, settings.animation_speed, 'linear', function () {
                context.locked = false;
                el.css(css).trigger('closed.fndtn.reveal');
              })
              .removeClass('open');
          }, settings.animation_speed / 2);
        }

        if (animData.fade) {
          var end_css = {opacity : 0};

          return setTimeout(function () {
            return el
              .animate(end_css, settings.animation_speed, 'linear', function () {
                context.locked = false;
                el.css(css).trigger('closed.fndtn.reveal');
              })
              .removeClass('open');
          }, settings.animation_speed / 2);
        }

        return el.hide().css(css).removeClass('open').trigger('closed.fndtn.reveal');
      }

      var settings = this.settings;

      // should we animate the background?
      if (getAnimationData(settings.animation).fade) {
        return el.fadeOut(settings.animation_speed / 2);
      }

      return el.hide();
    },

    close_video : function (e) {
      var video = $('.flex-video', e.target),
          iframe = $('iframe', video);

      if (iframe.length > 0) {
        iframe.attr('data-src', iframe[0].src);
        iframe.attr('src', iframe.attr('src'));
        video.hide();
      }
    },

    open_video : function (e) {
      var video = $('.flex-video', e.target),
          iframe = video.find('iframe');

      if (iframe.length > 0) {
        var data_src = iframe.attr('data-src');
        if (typeof data_src === 'string') {
          iframe[0].src = iframe.attr('data-src');
        } else {
          var src = iframe[0].src;
          iframe[0].src = undefined;
          iframe[0].src = src;
        }
        video.show();
      }
    },

    data_attr : function (str) {
      if (this.namespace.length > 0) {
        return this.namespace + '-' + str;
      }

      return str;
    },

    cache_offset : function (modal) {
      var offset = modal.show().height() + parseInt(modal.css('top'), 10) + modal.scrollY;

      modal.hide();

      return offset;
    },

    off : function () {
      $(this.scope).off('.fndtn.reveal');
    },

    reflow : function () {}
  };

  /*
   * getAnimationData('popAndFade') // {animate: true,  pop: true,  fade: true}
   * getAnimationData('fade')       // {animate: true,  pop: false, fade: true}
   * getAnimationData('pop')        // {animate: true,  pop: true,  fade: false}
   * getAnimationData('foo')        // {animate: false, pop: false, fade: false}
   * getAnimationData(null)         // {animate: false, pop: false, fade: false}
   */
  function getAnimationData(str) {
    var fade = /fade/i.test(str);
    var pop = /pop/i.test(str);
    return {
      animate : fade || pop,
      pop : pop,
      fade : fade
    };
  }
}(jQuery, window, window.document));

/*
	Redactor v10.0.9
	Updated: March 16, 2015

	http://imperavi.com/redactor/

	Copyright (c) 2009-2015, Imperavi LLC.
	License: http://imperavi.com/redactor/license/

	Usage: $('#content').redactor();
*/

(function($)
{
	'use strict';

	if (!Function.prototype.bind)
	{
		Function.prototype.bind = function(scope)
		{
			var fn = this;
			return function()
			{
				return fn.apply(scope);
			};
		};
	}

	var uuid = 0;

	var reUrlYoutube = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w.\-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
	var reUrlVimeo = /https?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;

	// Plugin
	$.fn.redactor = function(options)
	{
		var val = [];
		var args = Array.prototype.slice.call(arguments, 1);

		if (typeof options === 'string')
		{
			this.each(function()
			{
				var instance = $.data(this, 'redactor');
				var func;

				if (options.search(/\./) != '-1')
				{
					func = options.split('.');
					if (typeof instance[func[0]] != 'undefined')
					{
						func = instance[func[0]][func[1]];
					}
				}
				else
				{
					func = instance[options];
				}

				if (typeof instance !== 'undefined' && $.isFunction(func))
				{
					var methodVal = func.apply(instance, args);
					if (methodVal !== undefined && methodVal !== instance)
					{
						val.push(methodVal);
					}
				}
				else
				{
					$.error('No such method "' + options + '" for Redactor');
				}
			});
		}
		else
		{
			this.each(function()
			{
				$.data(this, 'redactor', {});
				$.data(this, 'redactor', Redactor(this, options));
			});
		}

		if (val.length === 0) return this;
		else if (val.length === 1) return val[0];
		else return val;

	};

	// Initialization
	function Redactor(el, options)
	{
		return new Redactor.prototype.init(el, options);
	}

	// Functionality
	$.Redactor = Redactor;
	$.Redactor.VERSION = '10.0.9';
	$.Redactor.modules = ['alignment', 'autosave', 'block', 'buffer', 'build', 'button',
						  'caret', 'clean', 'code', 'core', 'dropdown', 'file', 'focus',
						  'image', 'indent', 'inline', 'insert', 'keydown', 'keyup',
						  'lang', 'line', 'link', 'list', 'modal', 'observe', 'paragraphize',
						  'paste', 'placeholder', 'progress', 'selection', 'shortcuts',
						  'tabifier', 'tidy',  'toolbar', 'upload', 'utils'];

	$.Redactor.opts = {

		// settings
		lang: 'en',
		direction: 'ltr', // ltr or rtl

		plugins: false, // array

		focus: false,
		focusEnd: false,

		placeholder: false,

		visual: true,
		tabindex: false,

		minHeight: false,
		maxHeight: false,

		linebreaks: false,
		replaceDivs: true,
		paragraphize: true,
		cleanStyleOnEnter: false,
		enterKey: true,

		cleanOnPaste: true,
		cleanSpaces: true,
		pastePlainText: false,

		autosave: false, // false or url
		autosaveName: false,
		autosaveInterval: 60, // seconds
		autosaveOnChange: false,
		autosaveFields: false,

		linkTooltip: true,
		linkProtocol: 'http',
		linkNofollow: false,
		linkSize: 50,

		imageEditable: true,
		imageLink: true,
		imagePosition: true,
		imageFloatMargin: '10px',
		imageResizable: true,

		imageUpload: null,
		imageUploadParam: 'file',

		uploadImageField: false,

		dragImageUpload: true,

		fileUpload: null,
		fileUploadParam: 'file',

		dragFileUpload: true,

		s3: false,

		convertLinks: true,
		convertUrlLinks: true,
		convertImageLinks: true,
		convertVideoLinks: true,

		preSpaces: 4, // or false
		tabAsSpaces: false, // true or number of spaces
		tabKey: true,

		scrollTarget: false,

		toolbar: true,
		toolbarFixed: true,
		toolbarFixedTarget: document,
		toolbarFixedTopOffset: 0, // pixels
		toolbarExternal: false, // ID selector
		toolbarOverflow: false,

		source: true,
		buttons: ['html', 'formatting', 'bold', 'italic', 'deleted', 'unorderedlist', 'orderedlist',
				  'outdent', 'indent', 'image', 'file', 'link', 'alignment', 'horizontalrule'], // + 'underline'

		buttonsHide: [],
		buttonsHideOnMobile: [],

		formatting: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		formattingAdd: false,

		tabifier: true,

		deniedTags: ['script', 'style'],
		allowedTags: false, // or array

		removeComments: false,
		replaceTags: [
			['strike', 'del']
		],
		replaceStyles: [
            ['font-weight:\\s?bold', "strong"],
            ['font-style:\\s?italic', "em"],
            ['text-decoration:\\s?underline', "u"],
            ['text-decoration:\\s?line-through', 'del']
        ],
        removeDataAttr: false,

		removeAttr: false, // or multi array
		allowedAttr: false, // or multi array

		removeWithoutAttr: ['span'], // or false
		removeEmpty: ['p'], // or false;

		activeButtons: ['deleted', 'italic', 'bold', 'underline', 'unorderedlist', 'orderedlist',
						'alignleft', 'aligncenter', 'alignright', 'justify'],
		activeButtonsStates: {
			b: 'bold',
			strong: 'bold',
			i: 'italic',
			em: 'italic',
			del: 'deleted',
			strike: 'deleted',
			ul: 'unorderedlist',
			ol: 'orderedlist',
			u: 'underline'
		},

		shortcuts: {
			'ctrl+shift+m, meta+shift+m': { func: 'inline.removeFormat' },
			'ctrl+b, meta+b': { func: 'inline.format', params: ['bold'] },
			'ctrl+i, meta+i': { func: 'inline.format', params: ['italic'] },
			'ctrl+h, meta+h': { func: 'inline.format', params: ['superscript'] },
			'ctrl+l, meta+l': { func: 'inline.format', params: ['subscript'] },
			'ctrl+k, meta+k': { func: 'link.show' },
			'ctrl+shift+7':   { func: 'list.toggle', params: ['orderedlist'] },
			'ctrl+shift+8':   { func: 'list.toggle', params: ['unorderedlist'] }
		},
		shortcutsAdd: false,

		// private
		buffer: [],
		rebuffer: [],
		emptyHtml: '<p>&#x200b;</p>',
		invisibleSpace: '&#x200b;',
		imageTypes: ['image/png', 'image/jpeg', 'image/gif'],
		indentValue: 20,
		verifiedTags: 		['a', 'img', 'b', 'strong', 'sub', 'sup', 'i', 'em', 'u', 'small', 'strike', 'del', 'cite', 'ul', 'ol', 'li'], // and for span tag special rule
		inlineTags: 		['strong', 'b', 'u', 'em', 'i', 'code', 'del', 'ins', 'samp', 'kbd', 'sup', 'sub', 'mark', 'var', 'cite', 'small'],
		alignmentTags: 		['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',  'DL', 'DT', 'DD', 'DIV', 'TD', 'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION', 'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE'],
		blockLevelElements: ['PRE', 'UL', 'OL', 'LI'],


		// lang
		langs: {
			en: {
				html: 'HTML',
				video: 'Insert Video',
				image: 'Insert Image',
				table: 'Table',
				link: 'Link',
				link_insert: 'Insert link',
				link_edit: 'Edit link',
				unlink: 'Unlink',
				formatting: 'Formatting',
				paragraph: 'Normal text',
				quote: 'Quote',
				code: 'Code',
				header1: 'Header 1',
				header2: 'Header 2',
				header3: 'Header 3',
				header4: 'Header 4',
				header5: 'Header 5',
				bold: 'Bold',
				italic: 'Italic',
				fontcolor: 'Font Color',
				backcolor: 'Back Color',
				unorderedlist: 'Unordered List',
				orderedlist: 'Ordered List',
				outdent: 'Outdent',
				indent: 'Indent',
				cancel: 'Cancel',
				insert: 'Insert',
				save: 'Save',
				_delete: 'Delete',
				insert_table: 'Insert Table',
				insert_row_above: 'Add Row Above',
				insert_row_below: 'Add Row Below',
				insert_column_left: 'Add Column Left',
				insert_column_right: 'Add Column Right',
				delete_column: 'Delete Column',
				delete_row: 'Delete Row',
				delete_table: 'Delete Table',
				rows: 'Rows',
				columns: 'Columns',
				add_head: 'Add Head',
				delete_head: 'Delete Head',
				title: 'Title',
				image_position: 'Position',
				none: 'None',
				left: 'Left',
				right: 'Right',
				center: 'Center',
				image_web_link: 'Image Web Link',
				text: 'Text',
				mailto: 'Email',
				web: 'URL',
				video_html_code: 'Video Embed Code or Youtube/Vimeo Link',
				file: 'Insert File',
				upload: 'Upload',
				download: 'Download',
				choose: 'Choose',
				or_choose: 'Or choose',
				drop_file_here: 'Drop file here',
				align_left: 'Align text to the left',
				align_center: 'Center text',
				align_right: 'Align text to the right',
				align_justify: 'Justify text',
				horizontalrule: 'Insert Horizontal Rule',
				deleted: 'Deleted',
				anchor: 'Anchor',
				link_new_tab: 'Open link in new tab',
				underline: 'Underline',
				alignment: 'Alignment',
				filename: 'Name (optional)',
				edit: 'Edit',
				upload_label: 'Drop file here or '

			}
		}
	};

	// Functionality
	Redactor.fn = $.Redactor.prototype = {

		keyCode: {
			BACKSPACE: 8,
			DELETE: 46,
			DOWN: 40,
			ENTER: 13,
			SPACE: 32,
			ESC: 27,
			TAB: 9,
			CTRL: 17,
			META: 91,
			SHIFT: 16,
			ALT: 18,
			RIGHT: 39,
			LEFT: 37,
			LEFT_WIN: 91
		},

		// Initialization
		init: function(el, options)
		{
			this.$element = $(el);
			this.uuid = uuid++;

			// if paste event detected = true
			this.rtePaste = false;
			this.$pasteBox = false;

			this.loadOptions(options);
			this.loadModules();

			// formatting storage
			this.formatting = {};

			// block level tags
			$.merge(this.opts.blockLevelElements, this.opts.alignmentTags);
			this.reIsBlock = new RegExp('^(' + this.opts.blockLevelElements.join('|' ) + ')$', 'i');

			// setup allowed and denied tags
			this.tidy.setupAllowed();

			// setup denied tags
			if (this.opts.deniedTags !== false)
			{
				var tags = ['html', 'head', 'link', 'body', 'meta', 'applet'];
				for (var i = 0; i < tags.length; i++)
				{
					this.opts.deniedTags.push(tags[i]);
				}
			}

			// load lang
			this.lang.load();

			// extend shortcuts
			$.extend(this.opts.shortcuts, this.opts.shortcutsAdd);

			// start callback
			this.core.setCallback('start');

			// build
			this.start = true;
			this.build.run();
		},

		loadOptions: function(options)
		{
			this.opts = $.extend(
				{},
				$.extend(true, {}, $.Redactor.opts),
				this.$element.data(),
				options
			);
		},
		getModuleMethods: function(object)
		{
			return Object.getOwnPropertyNames(object).filter(function(property)
			{
				return typeof object[property] == 'function';
			});
		},
		loadModules: function()
		{
			var len = $.Redactor.modules.length;
			for (var i = 0; i < len; i++)
			{
				this.bindModuleMethods($.Redactor.modules[i]);
			}
		},
		bindModuleMethods: function(module)
		{
			if (typeof this[module] == 'undefined') return;

			// init module
			this[module] = this[module]();

			var methods = this.getModuleMethods(this[module]);
			var len = methods.length;

			// bind methods
			for (var z = 0; z < len; z++)
			{
				this[module][methods[z]] = this[module][methods[z]].bind(this);
			}
		},

		alignment: function()
		{
			return {
				left: function()
				{
					this.alignment.set('');
				},
				right: function()
				{
					this.alignment.set('right');
				},
				center: function()
				{
					this.alignment.set('center');
				},
				justify: function()
				{
					this.alignment.set('justify');
				},
				set: function(type)
				{
					// focus
					if (!this.utils.browser('msie')) this.$editor.focus();

					this.buffer.set();
					this.selection.save();

					// get blocks
					this.alignment.blocks = this.selection.getBlocks();
					this.alignment.type = type;

					// set alignment
					if (this.alignment.isLinebreaksOrNoBlocks())
					{
						this.alignment.setText();
					}
					else
					{
						this.alignment.setBlocks();
					}

					// sync
					this.selection.restore();
					this.code.sync();
				},
				setText: function()
				{
					var wrapper = this.selection.wrap('div');
					$(wrapper).attr('data-tagblock', 'redactor').css('text-align', this.alignment.type);
				},
				setBlocks: function()
				{
					$.each(this.alignment.blocks, $.proxy(function(i, el)
					{
						var $el = this.utils.getAlignmentElement(el);
						if (!$el) return;

						if (this.alignment.isNeedReplaceElement($el))
						{
							this.alignment.replaceElement($el);
						}
						else
						{
							this.alignment.alignElement($el);
						}

					}, this));
				},
				isLinebreaksOrNoBlocks: function()
				{
					return (this.opts.linebreaks && this.alignment.blocks[0] === false);
				},
				isNeedReplaceElement: function($el)
				{
					return (this.alignment.type === '' && typeof($el.data('tagblock')) !== 'undefined');
				},
				replaceElement: function($el)
				{
					$el.replaceWith($el.html());
				},
				alignElement: function($el)
				{
					$el.css('text-align', this.alignment.type);
					this.utils.removeEmptyAttr($el, 'style');
				}
			};
		},
		autosave: function()
		{
			return {
				enable: function()
				{
					if (!this.opts.autosave) return;

					this.autosave.html = false;
					this.autosave.name = (this.opts.autosaveName) ? this.opts.autosaveName : this.$textarea.attr('name');

					if (this.opts.autosaveOnChange) return;
					this.autosaveInterval = setInterval(this.autosave.load, this.opts.autosaveInterval * 1000);
				},
				onChange: function()
				{
					if (!this.opts.autosaveOnChange) return;
					this.autosave.load();
				},
				load: function()
				{
					this.autosave.source = this.code.get();

					if (this.autosave.html === this.autosave.source) return;
					if (this.utils.isEmpty(this.autosave.source)) return;

					// data
					var data = {};
					data['name'] = this.autosave.name;
					data[this.autosave.name] = this.autosave.source;
					data = this.auotsave.getHiddenFields(data);

					// ajax
					var jsxhr = $.ajax({
						url: this.opts.autosave,
						type: 'post',
						data: data
					});

					jsxhr.done(this.autosave.success);
				},
				getHiddenFields: function(data)
				{
					if (this.opts.autosaveFields === false || typeof this.opts.autosaveFields !== 'object')
					{
						return data;
					}

					$.each(this.opts.autosaveFields, $.proxy(function(k, v)
					{
						if (v !== null && v.toString().indexOf('#') === 0) v = $(v).val();
						data[k] = v;

					}, this));

					return data;

				},
				success: function(data)
				{
					var json;
					try
					{
						json = $.parseJSON(data);
					}
					catch(e)
					{
						//data has already been parsed
						json = data;
					}

					var callbackName = (typeof json.error == 'undefined') ? 'autosave' :  'autosaveError';

					this.core.setCallback(callbackName, this.autosave.name, json);
					this.autosave.html = this.autosave.source;
				},
				disable: function()
				{
					clearInterval(this.autosaveInterval);
				}
			};
		},
		block: function()
		{
			return {
				formatting: function(name)
				{
					this.block.clearStyle = false;
					var type, value;

					if (typeof this.formatting[name].data != 'undefined') type = 'data';
					else if (typeof this.formatting[name].attr != 'undefined') type = 'attr';
					else if (typeof this.formatting[name]['class'] != 'undefined') type = 'class';

					if (typeof this.formatting[name].clear != 'undefined')
					{
						this.block.clearStyle = true;
					}

					if (type) value = this.formatting[name][type];

					this.block.format(this.formatting[name].tag, type, value);

				},
				format: function(tag, type, value)
				{
					if (tag == 'quote') tag = 'blockquote';

					var formatTags = ['p', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
					if ($.inArray(tag, formatTags) == -1) return;

					this.block.isRemoveInline = (tag == 'pre' || tag.search(/h[1-6]/i) != -1);

					// focus
					if (!this.utils.browser('msie')) this.$editor.focus();

					this.block.blocks = this.selection.getBlocks();

					this.block.blocksSize = this.block.blocks.length;
					this.block.type = type;
					this.block.value = value;

					this.buffer.set();
					this.selection.save();

					this.block.set(tag);

					this.selection.restore();
					this.code.sync();

				},
				set: function(tag)
				{
					this.selection.get();
					this.block.containerTag = this.range.commonAncestorContainer.tagName;

					if (this.range.collapsed)
					{
						this.block.setCollapsed(tag);
					}
					else
					{
						this.block.setMultiple(tag);
					}
				},
				setCollapsed: function(tag)
				{
					var block = this.block.blocks[0];
					if (block === false) return;

					if (block.tagName == 'LI')
					{
						if (tag != 'blockquote') return;

						this.block.formatListToBlockquote();
						return;
					}

					var isContainerTable = (this.block.containerTag  == 'TD' || this.block.containerTag  == 'TH');
					if (isContainerTable && !this.opts.linebreaks)
					{

						document.execCommand('formatblock', false, '<' + tag + '>');

						block = this.selection.getBlock();
						this.block.toggle($(block));

					}
					else if (block.tagName.toLowerCase() != tag)
					{
						if (this.opts.linebreaks && tag == 'p')
						{
							$(block).prepend('<br>').append('<br>');
							this.utils.replaceWithContents(block);
						}
						else
						{
							var $formatted = this.utils.replaceToTag(block, tag);

							this.block.toggle($formatted);

							if (tag != 'p' && tag != 'blockquote') $formatted.find('img').remove();
							if (this.block.isRemoveInline) this.utils.removeInlineTags($formatted);
							if (tag == 'p' || this.block.headTag) $formatted.find('p').contents().unwrap();

							this.block.formatTableWrapping($formatted);
						}
					}
					else if (tag == 'blockquote' && block.tagName.toLowerCase() == tag)
					{
						// blockquote off
						if (this.opts.linebreaks)
						{
							$(block).prepend('<br>').append('<br>');
							this.utils.replaceWithContents(block);
						}
						else
						{
							var $el = this.utils.replaceToTag(block, 'p');
							this.block.toggle($el);
						}
					}
					else if (block.tagName.toLowerCase() == tag)
					{
						this.block.toggle($(block));
					}

					if (typeof this.block.type == 'undefined' && typeof this.block.value == 'undefined')
					{
						$(block).removeAttr('class').removeAttr('style');
					}

				},
				setMultiple: function(tag)
				{
					var block = this.block.blocks[0];
					var isContainerTable = (this.block.containerTag  == 'TD' || this.block.containerTag  == 'TH');

					if (block !== false && this.block.blocksSize === 1)
					{
						if (block.tagName.toLowerCase() == tag &&  tag == 'blockquote')
						{
							// blockquote off
							if (this.opts.linebreaks)
							{
								$(block).prepend('<br>').append('<br>');
								this.utils.replaceWithContents(block);
							}
							else
							{
								var $el = this.utils.replaceToTag(block, 'p');
								this.block.toggle($el);
							}
						}
						else if (block.tagName == 'LI')
						{
							if (tag != 'blockquote') return;

							this.block.formatListToBlockquote();
						}
						else if (this.block.containerTag == 'BLOCKQUOTE')
						{
							this.block.formatBlockquote(tag);
						}
						else if (this.opts.linebreaks && ((isContainerTable) || (this.range.commonAncestorContainer != block)))
						{
							this.block.formatWrap(tag);
						}
						else
						{
							if (this.opts.linebreaks && tag == 'p')
							{
								$(block).prepend('<br>').append('<br>');
								this.utils.replaceWithContents(block);
							}
							else if (block.tagName === 'TD')
							{
								this.block.formatWrap(tag);
							}
							else
							{
								var $formatted = this.utils.replaceToTag(block, tag);

								this.block.toggle($formatted);

								if (this.block.isRemoveInline) this.utils.removeInlineTags($formatted);
								if (tag == 'p' || this.block.headTag) $formatted.find('p').contents().unwrap();
							}
						}
					}
					else
					{

						if (this.opts.linebreaks || tag != 'p')
						{
							if (tag == 'blockquote')
							{
								var count = 0;
								for (var i = 0; i < this.block.blocksSize; i++)
								{
									if (this.block.blocks[i].tagName == 'BLOCKQUOTE') count++;
								}

								// only blockquote selected
								if (count == this.block.blocksSize)
								{
									$.each(this.block.blocks, $.proxy(function(i,s)
									{
										var $formatted = false;
										if (this.opts.linebreaks)
										{
											$(s).prepend('<br>').append('<br>');
											$formatted = this.utils.replaceWithContents(s);
										}
										else
										{
											$formatted = this.utils.replaceToTag(s, 'p');
										}

										if ($formatted && typeof this.block.type == 'undefined' && typeof this.block.value == 'undefined')
										{
											$formatted.removeAttr('class').removeAttr('style');
										}

									}, this));

									return;
								}

							}


							this.block.formatWrap(tag);
						}
						else
						{
							var classSize = 0;
							var toggleType = false;
							if (this.block.type == 'class')
							{
								toggleType = 'toggle';
								classSize = $(this.block.blocks).filter('.' + this.block.value).length;

								if (this.block.blocksSize == classSize) toggleType = 'toggle';
								else if (this.block.blocksSize > classSize) toggleType = 'set';
								else if (classSize === 0) toggleType = 'set';

							}

							var exceptTags = ['ul', 'ol', 'li', 'td', 'th', 'dl', 'dt', 'dd'];
							$.each(this.block.blocks, $.proxy(function(i,s)
							{
								if ($.inArray(s.tagName.toLowerCase(), exceptTags) != -1) return;

								var $formatted = this.utils.replaceToTag(s, tag);

								if (toggleType)
								{
									if (toggleType == 'toggle') this.block.toggle($formatted);
									else if (toggleType == 'remove') this.block.remove($formatted);
									else if (toggleType == 'set') this.block.setForce($formatted);
								}
								else this.block.toggle($formatted);

								if (tag != 'p' && tag != 'blockquote') $formatted.find('img').remove();
								if (this.block.isRemoveInline) this.utils.removeInlineTags($formatted);
								if (tag == 'p' || this.block.headTag) $formatted.find('p').contents().unwrap();

								if (typeof this.block.type == 'undefined' && typeof this.block.value == 'undefined')
								{
									$formatted.removeAttr('class').removeAttr('style');
								}


							}, this));
						}
					}
				},
				setForce: function($el)
				{
					// remove style and class if the specified setting
					if (this.block.clearStyle)
					{
						$el.removeAttr('class').removeAttr('style');
					}

					if (this.block.type == 'class')
					{
						$el.addClass(this.block.value);
						return;
					}
					else if (this.block.type == 'attr' || this.block.type == 'data')
					{
						$el.attr(this.block.value.name, this.block.value.value);
						return;
					}
				},
				toggle: function($el)
				{
					// remove style and class if the specified setting
					if (this.block.clearStyle)
					{
						$el.removeAttr('class').removeAttr('style');
					}

					if (this.block.type == 'class')
					{
						$el.toggleClass(this.block.value);
						return;
					}
					else if (this.block.type == 'attr' || this.block.type == 'data')
					{
						if ($el.attr(this.block.value.name) == this.block.value.value)
						{
							$el.removeAttr(this.block.value.name);
						}
						else
						{
							$el.attr(this.block.value.name, this.block.value.value);
						}

						return;
					}
					else
					{
						$el.removeAttr('style class');
						return;
					}
				},
				remove: function($el)
				{
					$el.removeClass(this.block.value);
				},
				formatListToBlockquote: function()
				{
					var block = $(this.block.blocks[0]).closest('ul, ol');

					$(block).find('ul, ol').contents().unwrap();
					$(block).find('li').append($('<br>')).contents().unwrap();

					var $el = this.utils.replaceToTag(block, 'blockquote');
					this.block.toggle($el);
				},
				formatBlockquote: function(tag)
				{
					document.execCommand('outdent');
					document.execCommand('formatblock', false, tag);

					this.clean.clearUnverified();
					this.$editor.find('p:empty').remove();

					var formatted = this.selection.getBlock();

					if (tag != 'p')
					{
						$(formatted).find('img').remove();
					}

					if (!this.opts.linebreaks)
					{
						this.block.toggle($(formatted));
					}

					this.$editor.find('ul, ol, tr, blockquote, p').each($.proxy(this.utils.removeEmpty, this));

					if (this.opts.linebreaks && tag == 'p')
					{
						this.utils.replaceWithContents(formatted);
					}

				},
				formatWrap: function(tag)
				{
					if (this.block.containerTag == 'UL' || this.block.containerTag == 'OL')
					{
						if (tag == 'blockquote')
						{
							this.block.formatListToBlockquote();
						}
						else
						{
							return;
						}
					}

					var formatted = this.selection.wrap(tag);
					if (formatted === false) return;

					var $formatted = $(formatted);

					this.block.formatTableWrapping($formatted);

					var $elements = $formatted.find(this.opts.blockLevelElements.join(',') + ', td, table, thead, tbody, tfoot, th, tr');

					if ((this.opts.linebreaks && tag == 'p') || tag == 'pre' || tag == 'blockquote')
					{
						$elements.append('<br />');
					}

					$elements.contents().unwrap();

					if (tag != 'p' && tag != 'blockquote') $formatted.find('img').remove();

					$.each(this.block.blocks, $.proxy(this.utils.removeEmpty, this));

					$formatted.append(this.selection.getMarker(2));

					if (!this.opts.linebreaks)
					{
						this.block.toggle($formatted);
					}

					this.$editor.find('ul, ol, tr, blockquote, p').each($.proxy(this.utils.removeEmpty, this));
					$formatted.find('blockquote:empty').remove();

					if (this.block.isRemoveInline)
					{
						this.utils.removeInlineTags($formatted);
					}

					if (this.opts.linebreaks && tag == 'p')
					{
						this.utils.replaceWithContents($formatted);
					}

				},
				formatTableWrapping: function($formatted)
				{
					if ($formatted.closest('table').length === 0) return;

					if ($formatted.closest('tr').length === 0) $formatted.wrap('<tr>');
					if ($formatted.closest('td').length === 0 && $formatted.closest('th').length === 0)
					{
						$formatted.wrap('<td>');
					}
				},
				removeData: function(name, value)
				{
					var blocks = this.selection.getBlocks();
					$(blocks).removeAttr('data-' + name);

					this.code.sync();
				},
				setData: function(name, value)
				{
					var blocks = this.selection.getBlocks();
					$(blocks).attr('data-' + name, value);

					this.code.sync();
				},
				toggleData: function(name, value)
				{
					var blocks = this.selection.getBlocks();
					$.each(blocks, function()
					{
						if ($(this).attr('data-' + name))
						{
							$(this).removeAttr('data-' + name);
						}
						else
						{
							$(this).attr('data-' + name, value);
						}
					});
				},
				removeAttr: function(attr, value)
				{
					var blocks = this.selection.getBlocks();
					$(blocks).removeAttr(attr);

					this.code.sync();
				},
				setAttr: function(attr, value)
				{
					var blocks = this.selection.getBlocks();
					$(blocks).attr(attr, value);

					this.code.sync();
				},
				toggleAttr: function(attr, value)
				{
					var blocks = this.selection.getBlocks();
					$.each(blocks, function()
					{
						if ($(this).attr(name))
						{
							$(this).removeAttr(name);
						}
						else
						{
							$(this).attr(name, value);
						}
					});
				},
				removeClass: function(className)
				{
					var blocks = this.selection.getBlocks();
					$(blocks).removeClass(className);

					this.utils.removeEmptyAttr(blocks, 'class');

					this.code.sync();
				},
				setClass: function(className)
				{
					var blocks = this.selection.getBlocks();
					$(blocks).addClass(className);

					this.code.sync();
				},
				toggleClass: function(className)
				{
					var blocks = this.selection.getBlocks();
					$(blocks).toggleClass(className);

					this.code.sync();
				}
			};
		},
		buffer: function()
		{
			return {
				set: function(type)
				{
					if (typeof type == 'undefined' || type == 'undo')
					{
						this.buffer.setUndo();
					}
					else
					{
						this.buffer.setRedo();
					}
				},
				setUndo: function()
				{
					this.selection.save();
					this.opts.buffer.push(this.$editor.html());
					this.selection.restore();
				},
				setRedo: function()
				{
					this.selection.save();
					this.opts.rebuffer.push(this.$editor.html());
					this.selection.restore();
				},
				getUndo: function()
				{
					this.$editor.html(this.opts.buffer.pop());
				},
				getRedo: function()
				{
					this.$editor.html(this.opts.rebuffer.pop());
				},
				add: function()
				{
					this.opts.buffer.push(this.$editor.html());
				},
				undo: function()
				{
					if (this.opts.buffer.length === 0) return;

					this.buffer.set('redo');
					this.buffer.getUndo();

					this.selection.restore();

					setTimeout($.proxy(this.observe.load, this), 50);
				},
				redo: function()
				{
					if (this.opts.rebuffer.length === 0) return;

					this.buffer.set('undo');
					this.buffer.getRedo();

					this.selection.restore();

					setTimeout($.proxy(this.observe.load, this), 50);
				}
			};
		},
		build: function()
		{
			return {
				run: function()
				{
					this.build.createContainerBox();
					this.build.loadContent();
					this.build.loadEditor();
					this.build.enableEditor();
					this.build.setCodeAndCall();
				},
				isTextarea: function()
				{
					return (this.$element[0].tagName === 'TEXTAREA');
				},
				createContainerBox: function()
				{
					this.$box = $('<div class="redactor-box" />');
				},
				createTextarea: function()
				{
					this.$textarea = $('<textarea />').attr('name', this.build.getTextareaName());
				},
				getTextareaName: function()
				{
					return ((typeof(name) == 'undefined')) ? 'content-' + this.uuid : this.$element.attr('id');
				},
				loadContent: function()
				{
					var func = (this.build.isTextarea()) ? 'val' : 'html';
					this.content = $.trim(this.$element[func]());
				},
				enableEditor: function()
				{
					this.$editor.attr({ 'contenteditable': true, 'dir': this.opts.direction });
				},
				loadEditor: function()
				{
					var func = (this.build.isTextarea()) ? 'fromTextarea' : 'fromElement';
					this.build[func]();
				},
				fromTextarea: function()
				{
					this.$editor = $('<div />');
					this.$textarea = this.$element;
					this.$box.insertAfter(this.$element).append(this.$editor).append(this.$element);
					this.$editor.addClass('redactor-editor');

					this.$element.hide();
				},
				fromElement: function()
				{
					this.$editor = this.$element;
					this.build.createTextarea();
					this.$box.insertAfter(this.$editor).append(this.$editor).append(this.$textarea);
					this.$editor.addClass('redactor-editor');

					this.$textarea.hide();
				},
				setCodeAndCall: function()
				{
					// set code
					this.code.set(this.content);

					this.build.setOptions();
					this.build.callEditor();

					// code mode
					if (this.opts.visual) return;
					setTimeout($.proxy(this.code.showCode, this), 200);
				},
				callEditor: function()
				{
					this.build.disableMozillaEditing();
					this.build.setEvents();
					this.build.setHelpers();

					// load toolbar
					if (this.opts.toolbar)
					{
						this.opts.toolbar = this.toolbar.init();
						this.toolbar.build();
					}

					// modal templates init
					this.modal.loadTemplates();

					// plugins
					this.build.plugins();

					// observers
					setTimeout($.proxy(this.observe.load, this), 4);

					// init callback
					this.core.setCallback('init');
				},
				setOptions: function()
				{
					// textarea direction
					$(this.$textarea).attr('dir', this.opts.direction);

					if (this.opts.linebreaks) this.$editor.addClass('redactor-linebreaks');

					if (this.opts.tabindex) this.$editor.attr('tabindex', this.opts.tabindex);

					if (this.opts.minHeight) this.$editor.css('minHeight', this.opts.minHeight);
					if (this.opts.maxHeight) this.$editor.css('maxHeight', this.opts.maxHeight);

				},
				setEventDropUpload: function(e)
				{
					e.preventDefault();

					if (!this.opts.dragImageUpload || !this.opts.dragFileUpload) return;

					var files = e.dataTransfer.files;
					this.upload.directUpload(files[0], e);
				},
				setEventDrop: function(e)
				{
					this.code.sync();
					setTimeout(this.clean.clearUnverified, 1);
					this.core.setCallback('drop', e);
				},
				setEvents: function()
				{
					// drop
					this.$editor.on('drop.redactor', $.proxy(function(e)
					{
						e = e.originalEvent || e;

						if (window.FormData === undefined || !e.dataTransfer) return true;

						if (e.dataTransfer.files.length === 0)
						{
							return this.build.setEventDrop(e);
						}
						else
						{
							this.build.setEventDropUpload(e);
						}

						setTimeout(this.clean.clearUnverified, 1);
						this.core.setCallback('drop', e);

					}, this));


					// click
					this.$editor.on('click.redactor', $.proxy(function(e)
					{
						var event = this.core.getEvent();
						var type = (event == 'click' || event == 'arrow') ? false : 'click';

						this.core.addEvent(type);
						this.utils.disableSelectAll();
						this.core.setCallback('click', e);

					}, this));

					// paste
					this.$editor.on('paste.redactor', $.proxy(this.paste.init, this));

					// keydown
					this.$editor.on('keydown.redactor', $.proxy(this.keydown.init, this));

					// keyup
					this.$editor.on('keyup.redactor', $.proxy(this.keyup.init, this));

					// textarea keydown
					if ($.isFunction(this.opts.codeKeydownCallback))
					{
						this.$textarea.on('keydown.redactor-textarea', $.proxy(this.opts.codeKeydownCallback, this));
					}

					// textarea keyup
					if ($.isFunction(this.opts.codeKeyupCallback))
					{
						this.$textarea.on('keyup.redactor-textarea', $.proxy(this.opts.codeKeyupCallback, this));
					}

					// focus
					if ($.isFunction(this.opts.focusCallback))
					{
						this.$editor.on('focus.redactor', $.proxy(this.opts.focusCallback, this));
					}

					var clickedElement;
					$(document).on('mousedown', function(e) { clickedElement = e.target; });

					// blur
					this.$editor.on('blur.redactor', $.proxy(function(e)
					{
						if (this.rtePaste) return;
						if (!this.build.isBlured(clickedElement)) return;

						this.utils.disableSelectAll();
						if ($.isFunction(this.opts.blurCallback)) this.core.setCallback('blur', e);

					}, this));
				},
				isBlured: function(clickedElement)
				{
					var $el = $(clickedElement);

					return (!$el.hasClass('redactor-toolbar, redactor-dropdown') && !$el.is('#redactor-modal') && $el.parents('.redactor-toolbar, .redactor-dropdown, #redactor-modal').length === 0);
				},
				setHelpers: function()
				{
					// autosave
					this.autosave.enable();

					// placeholder
					this.placeholder.enable();

					// focus
					if (this.opts.focus) setTimeout(this.focus.setStart, 100);
					if (this.opts.focusEnd) setTimeout(this.focus.setEnd, 100);

				},
				plugins: function()
				{
					if (!this.opts.plugins) return;
					if (!RedactorPlugins) return;

					$.each(this.opts.plugins, $.proxy(function(i, s)
					{
						if (typeof RedactorPlugins[s] === 'undefined') return;

						if ($.inArray(s, $.Redactor.modules) !== -1)
						{
							$.error('Plugin name "' + s + '" matches the name of the Redactor\'s module.');
							return;
						}

						if (!$.isFunction(RedactorPlugins[s])) return;

						this[s] = RedactorPlugins[s]();

						// get methods
						var methods = this.getModuleMethods(this[s]);
						var len = methods.length;

						// bind methods
						for (var z = 0; z < len; z++)
						{
							this[s][methods[z]] = this[s][methods[z]].bind(this);
						}

						if ($.isFunction(this[s].init)) this[s].init();


					}, this));

				},
				disableMozillaEditing: function()
				{
					if (!this.utils.browser('mozilla')) return;

					// FF fix
					try {
						document.execCommand('enableObjectResizing', false, false);
						document.execCommand('enableInlineTableEditing', false, false);
					} catch (e) {}
				}
			};
		},
		button: function()
		{
			return {
				build: function(btnName, btnObject)
				{
					var $button = $('<a href="#" class="re-icon re-' + btnName + '" rel="' + btnName + '" />').attr('tabindex', '-1');

					// click
					if (btnObject.func || btnObject.command || btnObject.dropdown)
					{
						this.button.setEvent($button, btnName, btnObject);
					}

					// dropdown
					if (btnObject.dropdown)
					{
						var $dropdown = $('<div class="redactor-dropdown redactor-dropdown-' +  + this.uuid + ' redactor-dropdown-box-' + btnName + '" style="display: none;">');
						$button.data('dropdown', $dropdown);
						this.dropdown.build(btnName, $dropdown, btnObject.dropdown);
					}

					// tooltip
					if (this.utils.isDesktop())
					{
						this.button.createTooltip($button, btnName, btnObject.title);
					}

					return $button;
				},
				setEvent: function($button, btnName, btnObject)
				{
					$button.on('touchstart click', $.proxy(function(e)
					{
						if ($button.hasClass('redactor-button-disabled')) return false;

						var type = 'func';
						var callback = btnObject.func;

						if (btnObject.command)
						{
							type = 'command';
							callback = btnObject.command;
						}
						else if (btnObject.dropdown)
						{
							type = 'dropdown';
							callback = false;
						}

						this.button.onClick(e, btnName, type, callback);

					}, this));
				},
				createTooltip: function($button, name, title)
				{
					var $tooltip = $('<span>').addClass('redactor-toolbar-tooltip redactor-toolbar-tooltip-' + name).hide().html(title);
					$tooltip.appendTo('body');

					$button.on('mouseover', function()
					{
						if ($(this).hasClass('redactor-button-disabled')) return;

						var pos = $button.offset();

						$tooltip.show();
						$tooltip.css({
							top: (pos.top + $button.innerHeight()) + 'px',
							left: (pos.left + $button.innerWidth()/2 - $tooltip.innerWidth()/2) + 'px'
						});
					});

					$button.on('mouseout', function()
					{
						$tooltip.hide();
					});

				},
				onClick: function(e, btnName, type, callback)
				{
					this.button.caretOffset = this.caret.getOffset();

					e.preventDefault();

					if (this.utils.browser('msie')) e.returnValue = false;

					if (type == 'command') this.inline.format(callback);
					else if (type == 'dropdown') this.dropdown.show(e, btnName);
					else this.button.onClickCallback(e, callback, btnName);
				},
				onClickCallback: function(e, callback, btnName)
				{
					var func;

					if ($.isFunction(callback)) callback.call(this, btnName);
					else if (callback.search(/\./) != '-1')
					{
						func = callback.split('.');
						if (typeof this[func[0]] == 'undefined') return;

						this[func[0]][func[1]](btnName);
					}
					else this[callback](btnName);

					this.observe.buttons(e, btnName);
				},
				get: function(key)
				{
					return this.$toolbar.find('a.re-' + key);
				},
				setActive: function(key)
				{
					this.button.get(key).addClass('redactor-act');
				},
				setInactive: function(key)
				{
					this.button.get(key).removeClass('redactor-act');
				},
				setInactiveAll: function(key)
				{
					if (typeof key === 'undefined')
					{
						this.$toolbar.find('a.re-icon').removeClass('redactor-act');
					}
					else
					{
						this.$toolbar.find('a.re-icon').not('.re-' + key).removeClass('redactor-act');
					}
				},
				setActiveInVisual: function()
				{
					this.$toolbar.find('a.re-icon').not('a.re-html').removeClass('redactor-button-disabled');
				},
				setInactiveInCode: function()
				{
					this.$toolbar.find('a.re-icon').not('a.re-html').addClass('redactor-button-disabled');
				},
				changeIcon: function(key, classname)
				{
					this.button.get(key).addClass('re-' + classname);
				},
				removeIcon: function(key, classname)
				{
					this.button.get(key).removeClass('re-' + classname);
				},
				setAwesome: function(key, name)
				{
					var $button = this.button.get(key);
					$button.removeClass('redactor-btn-image').addClass('fa-redactor-btn');
					$button.html('<i class="fa ' + name + '"></i>');
				},
				addCallback: function($btn, callback)
				{
					var type = (callback == 'dropdown') ? 'dropdown' : 'func';
					var key = $btn.attr('rel');
					$btn.on('touchstart click', $.proxy(function(e)
					{
						if ($btn.hasClass('redactor-button-disabled')) return false;
						this.button.onClick(e, key, type, callback);

					}, this));
				},
				addDropdown: function($btn, dropdown)
				{
					var key = $btn.attr('rel');
					this.button.addCallback($btn, 'dropdown');

					var $dropdown = $('<div class="redactor-dropdown redactor-dropdown-' +  + this.uuid + ' redactor-dropdown-box-' + key + '" style="display: none;">');
					$btn.data('dropdown', $dropdown);

					// build dropdown
					if (dropdown) this.dropdown.build(key, $dropdown, dropdown);

					return $dropdown;
				},
				add: function(key, title)
				{
					if (!this.opts.toolbar) return;

					var btn = this.button.build(key, { title: title });
					btn.addClass('redactor-btn-image');

					this.$toolbar.append($('<li>').append(btn));

					return btn;
				},
				addFirst: function(key, title)
				{
					if (!this.opts.toolbar) return;

					var btn = this.button.build(key, { title: title });
					btn.addClass('redactor-btn-image');
					this.$toolbar.prepend($('<li>').append(btn));

					return btn;
				},
				addAfter: function(afterkey, key, title)
				{
					if (!this.opts.toolbar) return;

					var btn = this.button.build(key, { title: title });
					btn.addClass('redactor-btn-image');
					var $btn = this.button.get(afterkey);

					if ($btn.length !== 0) $btn.parent().after($('<li>').append(btn));
					else this.$toolbar.append($('<li>').append(btn));

					return btn;
				},
				addBefore: function(beforekey, key, title)
				{
					if (!this.opts.toolbar) return;

					var btn = this.button.build(key, { title: title });
					btn.addClass('redactor-btn-image');
					var $btn = this.button.get(beforekey);

					if ($btn.length !== 0) $btn.parent().before($('<li>').append(btn));
					else this.$toolbar.append($('<li>').append(btn));

					return btn;
				},
				remove: function(key)
				{
					this.button.get(key).remove();
				}
			};
		},
		caret: function()
		{
			return {
				setStart: function(node)
				{
					// inline tag
					if (!this.utils.isBlock(node))
					{
						var space = this.utils.createSpaceElement();

						$(node).prepend(space);
						this.caret.setEnd(space);
					}
					else
					{
						this.caret.set(node, 0, node, 0);
					}
				},
				setEnd: function(node)
				{
					this.caret.set(node, 1, node, 1);
				},
				set: function(orgn, orgo, focn, foco)
				{
					// focus
					// disabled in 10.0.7
					// if (!this.utils.browser('msie')) this.$editor.focus();

					orgn = orgn[0] || orgn;
					focn = focn[0] || focn;

					if (this.utils.isBlockTag(orgn.tagName) && orgn.innerHTML === '')
					{
						orgn.innerHTML = this.opts.invisibleSpace;
					}

					if (orgn.tagName == 'BR' && this.opts.linebreaks === false)
					{
						var parent = $(this.opts.emptyHtml)[0];
						$(orgn).replaceWith(parent);
						orgn = parent;
						focn = orgn;
					}

					this.selection.get();

					try
					{
						this.range.setStart(orgn, orgo);
						this.range.setEnd(focn, foco);
					}
					catch (e) {}

					this.selection.addRange();
				},
				setAfter: function(node)
				{
					try
					{
						var tag = $(node)[0].tagName;

						// inline tag
						if (tag != 'BR' && !this.utils.isBlock(node))
						{
							var space = this.utils.createSpaceElement();

							$(node).after(space);
							this.caret.setEnd(space);
						}
						else
						{
							if (tag != 'BR' && this.utils.browser('msie'))
							{
								this.caret.setStart($(node).next());
							}
							else
							{
								this.caret.setAfterOrBefore(node, 'after');
							}
						}
					}
					catch (e)
					{
						var space = this.utils.createSpaceElement();
						$(node).after(space);
						this.caret.setEnd(space);
					}
				},
				setBefore: function(node)
				{
					// block tag
					if (this.utils.isBlock(node))
					{
						this.caret.setEnd($(node).prev());
					}
					else
					{
						this.caret.setAfterOrBefore(node, 'before');
					}
				},
				setAfterOrBefore: function(node, type)
				{
					// focus
					if (!this.utils.browser('msie')) this.$editor.focus();

					node = node[0] || node;

					this.selection.get();

					if (type == 'after')
					{
						try {

							this.range.setStartAfter(node);
							this.range.setEndAfter(node);
						}
						catch (e) {}
					}
					else
					{
						try {
							this.range.setStartBefore(node);
							this.range.setEndBefore(node);
						}
						catch (e) {}
					}


					this.range.collapse(false);
					this.selection.addRange();
				},
				getOffsetOfElement: function(node)
				{
					node = node[0] || node;

					this.selection.get();

					var cloned = this.range.cloneRange();
					cloned.selectNodeContents(node);
					cloned.setEnd(this.range.endContainer, this.range.endOffset);

					return $.trim(cloned.toString()).length;
				},
				getOffset: function()
				{
					var offset = 0;
				    var sel = window.getSelection();

				    if (sel.rangeCount > 0)
				    {
				        var range = window.getSelection().getRangeAt(0);
				        var caretRange = range.cloneRange();
				        caretRange.selectNodeContents(this.$editor[0]);
				        caretRange.setEnd(range.endContainer, range.endOffset);
				        offset = caretRange.toString().length;
				    }

					return offset;
				},
				setOffset: function(start, end)
				{
					if (typeof end == 'undefined') end = start;
					if (!this.focus.isFocused()) this.focus.setStart();

					var sel = this.selection.get();
					var node, offset = 0;
					var walker = document.createTreeWalker(this.$editor[0], NodeFilter.SHOW_TEXT, null, null);

					while (node = walker.nextNode())
					{
						offset += node.nodeValue.length;
						if (offset > start)
						{
							this.range.setStart(node, node.nodeValue.length + start - offset);
							start = Infinity;
						}

						if (offset >= end)
						{
							this.range.setEnd(node, node.nodeValue.length + end - offset);
							break;
						}
					}

					this.range.collapse(false);
					this.selection.addRange();
				},
				// deprecated
				setToPoint: function(start, end)
				{
					this.caret.setOffset(start, end);
				},
				getCoords: function()
				{
					return this.caret.getOffset();
				}
			};
		},
		clean: function()
		{
			return {
				onSet: function(html)
				{
					html = this.clean.savePreCode(html);

					// convert script tag
					html = html.replace(/<script(.*?[^>]?)>([\w\W]*?)<\/script>/gi, '<pre class="redactor-script-tag" style="display: none;" $1>$2</pre>');

					// replace dollar sign to entity
					html = html.replace(/\$/g, '&#36;');

					// replace special characters in links
					html = html.replace(/<a href="(.*?[^>]?)®(.*?[^>]?)">/gi, '<a href="$1&reg$2">');

					if (this.opts.replaceDivs) html = this.clean.replaceDivs(html);
					if (this.opts.linebreaks)  html = this.clean.replaceParagraphsToBr(html);

					// save form tag
					html = this.clean.saveFormTags(html);

					// convert font tag to span
					var $div = $('<div>');
					$div.html(html);
					var fonts = $div.find('font[style]');
					if (fonts.length !== 0)
					{
						fonts.replaceWith(function()
						{
							var $el = $(this);
							var $span = $('<span>').attr('style', $el.attr('style'));
							return $span.append($el.contents());
						});

						html = $div.html();
					}
					$div.remove();

					// remove font tag
					html = html.replace(/<font(.*?[^<])>/gi, '');
					html = html.replace(/<\/font>/gi, '');

					// tidy html
					html = this.tidy.load(html);

					// paragraphize
					if (this.opts.paragraphize) html = this.paragraphize.load(html);

					// verified
					html = this.clean.setVerified(html);

					// convert inline tags
					html = this.clean.convertInline(html);

					return html;
				},
				onSync: function(html)
				{
					// remove spaces
					html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');
					html = html.replace(/&#x200b;/gi, '');

					if (this.opts.cleanSpaces)
					{
						html = html.replace(/&nbsp;/gi, ' ');
					}

					if (html.search(/^<p>(||\s||<br\s?\/?>||&nbsp;)<\/p>$/i) != -1)
					{
						return '';
					}

					// reconvert script tag
					html = html.replace(/<pre class="redactor-script-tag" style="display: none;"(.*?[^>]?)>([\w\W]*?)<\/pre>/gi, '<script$1>$2</script>');

					// restore form tag
					html = this.clean.restoreFormTags(html);

					var chars = {
						'\u2122': '&trade;',
						'\u00a9': '&copy;',
						'\u2026': '&hellip;',
						'\u2014': '&mdash;',
						'\u2010': '&dash;'
					};
					// replace special characters
					$.each(chars, function(i,s)
					{
						html = html.replace(new RegExp(i, 'g'), s);
					});

					// remove br in the of li
					html = html.replace(new RegExp('<br\\s?/?></li>', 'gi'), '</li>');
					html = html.replace(new RegExp('</li><br\\s?/?>', 'gi'), '</li>');
					// remove verified
					html = html.replace(new RegExp('<div(.*?[^>]) data-tagblock="redactor"(.*?[^>])>', 'gi'), '<div$1$2>');
					html = html.replace(new RegExp('<(.*?) data-verified="redactor"(.*?[^>])>', 'gi'), '<$1$2>');
					html = html.replace(new RegExp('<span(.*?[^>])\srel="(.*?[^>])"(.*?[^>])>', 'gi'), '<span$1$3>');
					html = html.replace(new RegExp('<img(.*?[^>])\srel="(.*?[^>])"(.*?[^>])>', 'gi'), '<img$1$3>');
					html = html.replace(new RegExp('<img(.*?[^>])\sstyle="" (.*?[^>])>', 'gi'), '<img$1 $2>');
					html = html.replace(new RegExp('<img(.*?[^>])\sstyle (.*?[^>])>', 'gi'), '<img$1 $2>');
					html = html.replace(new RegExp('<span class="redactor-invisible-space">(.*?)</span>', 'gi'), '$1');
					html = html.replace(/ data-save-url="(.*?[^>])"/gi, '');

					// remove image resize
					html = html.replace(/<span(.*?)id="redactor-image-box"(.*?[^>])>([\w\W]*?)<img(.*?)><\/span>/gi, '$3<img$4>');
					html = html.replace(/<span(.*?)id="redactor-image-resizer"(.*?[^>])>(.*?)<\/span>/gi, '');
					html = html.replace(/<span(.*?)id="redactor-image-editter"(.*?[^>])>(.*?)<\/span>/gi, '');

					// remove font tag
					html = html.replace(/<font(.*?[^<])>/gi, '');
					html = html.replace(/<\/font>/gi, '');

					// tidy html
					html = this.tidy.load(html);

					// link nofollow
					if (this.opts.linkNofollow)
					{
						html = html.replace(/<a(.*?)rel="nofollow"(.*?[^>])>/gi, '<a$1$2>');
						html = html.replace(/<a(.*?[^>])>/gi, '<a$1 rel="nofollow">');
					}

					// reconvert inline
					html = html.replace(/\sdata-redactor-(tag|class|style)="(.*?[^>])"/gi, '');
					html = html.replace(new RegExp('<(.*?) data-verified="redactor"(.*?[^>])>', 'gi'), '<$1$2>');
					html = html.replace(new RegExp('<(.*?) data-verified="redactor">', 'gi'), '<$1>');

					return html;
				},
				onPaste: function(html, setMode)
				{
					html = $.trim(html);

					html = html.replace(/\$/g, '&#36;');

					// convert dirty spaces
					html = html.replace(/<span class="s1">/gi, '<span>');
					html = html.replace(/<span class="Apple-converted-space">&nbsp;<\/span>/gi, ' ');
					html = html.replace(/<span class="Apple-tab-span"[^>]*>\t<\/span>/gi, '\t');
					html = html.replace(/<span[^>]*>(\s|&nbsp;)<\/span>/gi, ' ');

					if (this.opts.pastePlainText)
					{
						return this.clean.getPlainText(html);
					}

					if (!this.utils.isSelectAll() && typeof setMode == 'undefined')
					{
						if (this.utils.isCurrentOrParent(['FIGCAPTION', 'A']))
						{
							return this.clean.getPlainText(html, false);
						}

						if (this.utils.isCurrentOrParent('PRE'))
						{
							html = html.replace(/”/g, '"');
							html = html.replace(/“/g, '"');
							html = html.replace(/‘/g, '\'');
							html = html.replace(/’/g, '\'');

							return this.clean.getPreCode(html);
						}

						if (this.utils.isCurrentOrParent(['BLOCKQUOTE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']))
						{
							html = this.clean.getOnlyImages(html);

							if (!this.utils.browser('msie'))
							{
								var block = this.selection.getBlock();
								if (block && block.tagName == 'P')
								{
									html = html.replace(/<img(.*?)>/gi, '<p><img$1></p>');
								}
							}

							return html;
						}

						if (this.utils.isCurrentOrParent(['TD']))
						{
							html = this.clean.onPasteTidy(html, 'td');

							if (this.opts.linebreaks) html = this.clean.replaceParagraphsToBr(html);

							html = this.clean.replaceDivsToBr(html);

							return html;
						}


						if (this.utils.isCurrentOrParent(['LI']))
						{
							return this.clean.onPasteTidy(html, 'li');
						}
					}


					html = this.clean.isSingleLine(html, setMode);

					if (!this.clean.singleLine)
					{
						if (this.opts.linebreaks)  html = this.clean.replaceParagraphsToBr(html);
						if (this.opts.replaceDivs) html = this.clean.replaceDivs(html);

						html = this.clean.saveFormTags(html);
					}


					html = this.clean.onPasteWord(html);
					html = this.clean.onPasteExtra(html);

					html = this.clean.onPasteTidy(html, 'all');


					// paragraphize
					if (!this.clean.singleLine && this.opts.paragraphize)
					{
						html = this.paragraphize.load(html);
					}

					html = this.clean.removeDirtyStyles(html);
					html = this.clean.onPasteRemoveSpans(html);
					html = this.clean.onPasteRemoveEmpty(html);


					html = this.clean.convertInline(html);

					return html;
				},
				onPasteWord: function(html)
				{
					// comments
					html = html.replace(/<!--[\s\S]*?-->/gi, '');

					// style
					html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

					if (/(class=\"?Mso|style=\"[^\"]*\bmso\-|w:WordDocument)/.test(html))
					{
						html = this.clean.onPasteIeFixLinks(html);

						// shapes
						html = html.replace(/<img(.*?)v:shapes=(.*?)>/gi, '');
						html = html.replace(/src="file\:\/\/(.*?)"/, 'src=""');

						// list
						html = html.replace(/<p(.*?)class="MsoListParagraphCxSpFirst"([\w\W]*?)<\/p>/gi, '<ul><li$2</li>');
						html = html.replace(/<p(.*?)class="MsoListParagraphCxSpMiddle"([\w\W]*?)<\/p>/gi, '<li$2</li>');
						html = html.replace(/<p(.*?)class="MsoListParagraphCxSpLast"([\w\W]*?)<\/p>/gi, '<li$2</li></ul>');
						// one line
						html = html.replace(/<p(.*?)class="MsoListParagraph"([\w\W]*?)<\/p>/gi, '<ul><li$2</li></ul>');
						// remove ms word's bullet
						html = html.replace(/·/g, '');
						html = html.replace(/<p class="Mso(.*?)"/gi, '<p');

						// classes
						html = html.replace(/ class=\"(mso[^\"]*)\"/gi,	"");
						html = html.replace(/ class=(mso\w+)/gi, "");

						// remove ms word tags
						html = html.replace(/<o:p(.*?)>([\w\W]*?)<\/o:p>/gi, '$2');

						// ms word break lines
						html = html.replace(/\n/g, ' ');

						// ms word lists break lines
						html = html.replace(/<p>\n?<li>/gi, '<li>');
					}

					// remove nbsp
					if (this.opts.cleanSpaces)
					{
						html = html.replace(/(\s|&nbsp;)+/g, ' ');
					}

					return html;
				},
				onPasteExtra: function(html)
				{
					// remove google docs markers
					html = html.replace(/<b\sid="internal-source-marker(.*?)">([\w\W]*?)<\/b>/gi, "$2");
					html = html.replace(/<b(.*?)id="docs-internal-guid(.*?)">([\w\W]*?)<\/b>/gi, "$3");

					// google docs styles
			 		html = html.replace(/<span[^>]*(font-style: italic; font-weight: bold|font-weight: bold; font-style: italic)[^>]*>/gi, '<span style="font-weight: bold;"><span style="font-style: italic;">');
			 		html = html.replace(/<span[^>]*font-style: italic[^>]*>/gi, '<span style="font-style: italic;">');
					html = html.replace(/<span[^>]*font-weight: bold[^>]*>/gi, '<span style="font-weight: bold;">');
					html = html.replace(/<span[^>]*text-decoration: underline[^>]*>/gi, '<span style="text-decoration: underline;">');

					html = html.replace(/<img>/gi, '');
					html = html.replace(/\n{3,}/gi, '\n');
					html = html.replace(/<font(.*?)>([\w\W]*?)<\/font>/gi, '$2');

					// remove dirty p
					html = html.replace(/<p><p>/gi, '<p>');
					html = html.replace(/<\/p><\/p>/gi, '</p>');
					html = html.replace(/<li>(\s*|\t*|\n*)<p>/gi, '<li>');
					html = html.replace(/<\/p>(\s*|\t*|\n*)<\/li>/gi, '</li>');

					// remove space between paragraphs
					html = html.replace(/<\/p>\s<p/gi, '<\/p><p');

					// remove safari local images
					html = html.replace(/<img src="webkit-fake-url\:\/\/(.*?)"(.*?)>/gi, '');

					// bullets
					html = html.replace(/<p>•([\w\W]*?)<\/p>/gi, '<li>$1</li>');

					// FF fix
					if (this.utils.browser('mozilla'))
					{
						html = html.replace(/<br\s?\/?>$/gi, '');
					}

					return html;
				},
				onPasteTidy: function(html, type)
				{
					// remove all tags except these
					var tags = ['span', 'a', 'pre', 'blockquote', 'small', 'em', 'strong', 'code', 'kbd', 'mark', 'address', 'cite', 'var', 'samp', 'dfn', 'sup', 'sub', 'b', 'i', 'u', 'del',
								'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'p', 'br', 'video', 'audio', 'iframe', 'embed', 'param', 'object', 'img', 'table',
								'td', 'th', 'tr', 'tbody', 'tfoot', 'thead', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
					var tagsEmpty = false;
					var attrAllowed =  [
							['a', '*'],
							['img', ['src', 'alt']],
							['span', ['class', 'rel', 'data-verified']],
							['iframe', '*'],
							['video', '*'],
							['audio', '*'],
							['embed', '*'],
							['object', '*'],
							['param', '*'],
							['source', '*']
						];

					if (type == 'all')
					{
						tagsEmpty = ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
						attrAllowed =  [
							['table', 'class'],
							['td', ['colspan', 'rowspan']],
							['a', '*'],
							['img', ['src', 'alt', 'data-redactor-inserted-image']],
							['span', ['class', 'rel', 'data-verified']],
							['iframe', '*'],
							['video', '*'],
							['audio', '*'],
							['embed', '*'],
							['object', '*'],
							['param', '*'],
							['source', '*']
						];
					}
					else if (type == 'td')
					{
						// remove all tags except these and remove all table tags: tr, td etc
						tags = ['ul', 'ol', 'li', 'span', 'a', 'small', 'em', 'strong', 'code', 'kbd', 'mark', 'cite', 'var', 'samp', 'dfn', 'sup', 'sub', 'b', 'i', 'u', 'del',
								'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'br', 'iframe', 'video', 'audio', 'embed', 'param', 'object', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

					}
					else if (type == 'li')
					{
						// only inline tags and ul, ol, li
						tags = ['ul', 'ol', 'li', 'span', 'a', 'small', 'em', 'strong', 'code', 'kbd', 'mark', 'cite', 'var', 'samp', 'dfn', 'sup', 'sub', 'b', 'i', 'u', 'del', 'br',
								'iframe', 'video', 'audio', 'embed', 'param', 'object', 'img'];
					}

					var options = {
						deniedTags: false,
						allowedTags: tags,
						removeComments: true,
						removePhp: true,
						removeAttr: false,
						allowedAttr: attrAllowed,
						removeEmpty: tagsEmpty
					};

					// denied tags
					if (this.opts.deniedTags)
					{
						options.deniedTags = this.opts.deniedTags;
					}

					// allowed tags
					if (this.opts.allowedTags)
					{
						options.allowedTags = this.opts.allowedTags;
					}

					return this.tidy.load(html, options);

				},
				onPasteRemoveEmpty: function(html)
				{
					html = html.replace(/<(p|h[1-6])>(|\s|\n|\t|<br\s?\/?>)<\/(p|h[1-6])>/gi, '');

					// remove br in the end
					if (!this.opts.linebreaks) html = html.replace(/<br>$/i, '');

					return html;
				},
				onPasteRemoveSpans: function(html)
				{
					html = html.replace(/<span>(.*?)<\/span>/gi, '$1');
					html = html.replace(/<span[^>]*>\s|&nbsp;<\/span>/gi, ' ');

					return html;
				},
				onPasteIeFixLinks: function(html)
				{
					if (!this.utils.browser('msie')) return html;

					var tmp = $.trim(html);
					if (tmp.search(/^<a(.*?)>(.*?)<\/a>$/i) === 0)
					{
						html = html.replace(/^<a(.*?)>(.*?)<\/a>$/i, "$2");
					}

					return html;
				},
				isSingleLine: function(html, setMode)
				{
					this.clean.singleLine = false;

					if (!this.utils.isSelectAll() && typeof setMode == 'undefined')
					{
						var blocks = this.opts.blockLevelElements.join('|').replace('P|', '').replace('DIV|', '');

						var matchBlocks = html.match(new RegExp('</(' + blocks + ')>', 'gi'));
						var matchContainers = html.match(/<\/(p|div)>/gi);

						if (!matchBlocks && (matchContainers === null || (matchContainers && matchContainers.length <= 1)))
						{
							var matchBR = html.match(/<br\s?\/?>/gi);
							var matchIMG = html.match(/<img(.*?[^>])>/gi);
							if (!matchBR && !matchIMG)
							{
								this.clean.singleLine = true;
								html = html.replace(/<\/?(p|div)(.*?)>/gi, '');
							}
						}
					}

					return html;
				},
				stripTags: function(input, allowed)
				{
				    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
				    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;

				    return input.replace(tags, function ($0, $1) {
				        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
				    });
				},
				savePreCode: function(html)
				{
					html = this.clean.savePreFormatting(html);
					html = this.clean.saveCodeFormatting(html);

					return html;
				},
				savePreFormatting: function(html)
				{
					var pre = html.match(/<pre(.*?)>([\w\W]*?)<\/pre>/gi);
					if (pre !== null)
					{
						$.each(pre, $.proxy(function(i,s)
						{
							var arr = s.match(/<pre(.*?)>([\w\W]*?)<\/pre>/i);

							arr[2] = arr[2].replace(/<br\s?\/?>/g, '\n');
							arr[2] = arr[2].replace(/&nbsp;/g, ' ');

							if (this.opts.preSpaces)
							{
								arr[2] = arr[2].replace(/\t/g, Array(this.opts.preSpaces + 1).join(' '));
							}

							arr[2] = this.clean.encodeEntities(arr[2]);

							// $ fix
							arr[2] = arr[2].replace(/\$/g, '&#36;');

							html = html.replace(s, '<pre' + arr[1] + '>' + arr[2] + '</pre>');

						}, this));
					}

					return html;
				},
				saveCodeFormatting: function(html)
				{
					var code = html.match(/<code(.*?[^>])>(.*?)<\/code>/gi);
					if (code !== null)
					{
						$.each(code, $.proxy(function(i,s)
						{
							var arr = s.match(/<code(.*?[^>])>(.*?)<\/code>/i);

							arr[2] = arr[2].replace(/&nbsp;/g, ' ');
							arr[2] = this.clean.encodeEntities(arr[2]);

							// $ fix
							arr[2] = arr[2].replace(/\$/g, '&#36;');

							html = html.replace(s, '<code' + arr[1] + '>' + arr[2] + '</code>');

						}, this));
					}

					return html;
				},
				getTextFromHtml: function(html)
				{
					html = html.replace(/<br\s?\/?>|<\/H[1-6]>|<\/p>|<\/div>|<\/li>|<\/td>/gi, '\n');

					var tmp = document.createElement('div');
					tmp.innerHTML = html;
					html = tmp.textContent || tmp.innerText;

					return $.trim(html);
				},
				getPlainText: function(html, paragraphize)
				{
					html = this.clean.getTextFromHtml(html);
					html = html.replace(/\n/g, '<br />');

					if (this.opts.paragraphize && typeof paragraphize == 'undefined' && !this.utils.browser('mozilla'))
					{
						html = this.paragraphize.load(html);
					}

					return html;
				},
				getPreCode: function(html)
				{
					html = html.replace(/<img(.*?) style="(.*?)"(.*?[^>])>/gi, '<img$1$3>');
					html = html.replace(/<img(.*?)>/gi, '&lt;img$1&gt;');
					html = this.clean.getTextFromHtml(html);

					if (this.opts.preSpaces)
					{
						html = html.replace(/\t/g, Array(this.opts.preSpaces + 1).join(' '));
					}

					html = this.clean.encodeEntities(html);

					return html;
				},
				getOnlyImages: function(html)
				{
					html = html.replace(/<img(.*?)>/gi, '[img$1]');

					// remove all tags
					html = html.replace(/<([Ss]*?)>/gi, '');

					html = html.replace(/\[img(.*?)\]/gi, '<img$1>');

					return html;
				},
				getOnlyLinksAndImages: function(html)
				{
					html = html.replace(/<a(.*?)href="(.*?)"(.*?)>([\w\W]*?)<\/a>/gi, '[a href="$2"]$4[/a]');
					html = html.replace(/<img(.*?)>/gi, '[img$1]');

					// remove all tags
					html = html.replace(/<(.*?)>/gi, '');

					html = html.replace(/\[a href="(.*?)"\]([\w\W]*?)\[\/a\]/gi, '<a href="$1">$2</a>');
					html = html.replace(/\[img(.*?)\]/gi, '<img$1>');

					return html;
				},
				encodeEntities: function(str)
				{
					str = String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
					return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
				},
				removeDirtyStyles: function(html)
				{
					if (this.utils.browser('msie')) return html;

					var div = document.createElement('div');
					div.innerHTML = html;

					this.clean.clearUnverifiedRemove($(div));

					html = div.innerHTML;
					$(div).remove();

					return html;
				},
				clearUnverified: function()
				{
					if (this.utils.browser('msie')) return;

					this.clean.clearUnverifiedRemove(this.$editor);

					var headers = this.$editor.find('h1, h2, h3, h4, h5, h6');
					headers.find('span').removeAttr('style');
					headers.find(this.opts.verifiedTags.join(', ')).removeAttr('style');

					this.code.sync();
				},
				clearUnverifiedRemove: function($editor)
				{
					$editor.find(this.opts.verifiedTags.join(', ')).removeAttr('style');
					$editor.find('span').not('[data-verified="redactor"]').removeAttr('style');

					$editor.find('span[data-verified="redactor"], img[data-verified="redactor"]').each(function(i, s)
					{
						var $s = $(s);
						$s.attr('style', $s.attr('rel'));
					});

				},
				setVerified: function(html)
				{
					if (this.utils.browser('msie')) return html;

					html = html.replace(new RegExp('<img(.*?[^>])>', 'gi'), '<img$1 data-verified="redactor">');
					html = html.replace(new RegExp('<span(.*?[^>])>', 'gi'), '<span$1 data-verified="redactor">');

					var matches = html.match(new RegExp('<(span|img)(.*?)style="(.*?)"(.*?[^>])>', 'gi'));

					if (matches)
					{
						var len = matches.length;
						for (var i = 0; i < len; i++)
						{
							try {

								var newTag = matches[i].replace(/style="(.*?)"/i, 'style="$1" rel="$1"');
								html = html.replace(matches[i], newTag);

							}
							catch (e) {}
						}
					}

					return html;
				},
				convertInline: function(html)
				{
					var $div = $('<div />').html(html);

					var tags = this.opts.inlineTags;
					tags.push('span');

					$div.find(tags.join(',')).each(function()
					{
						var $el = $(this);
						var tag = this.tagName.toLowerCase();
						$el.attr('data-redactor-tag', tag);

						if (tag == 'span')
						{
							if ($el.attr('style')) $el.attr('data-redactor-style', $el.attr('style'));
							else if ($el.attr('class')) $el.attr('data-redactor-class', $el.attr('class'));
						}

					});

					html = $div.html();
					$div.remove();

					return html;
				},
				normalizeLists: function()
				{
					this.$editor.find('li').each(function(i,s)
					{
						var $next = $(s).next();
						if ($next.length !== 0 && ($next[0].tagName == 'UL' || $next[0].tagName == 'OL'))
						{
							$(s).append($next);
						}

					});
				},
				removeSpaces: function(html)
				{
					html = html.replace(/\n/g, '');
					html = html.replace(/[\t]*/g, '');
					html = html.replace(/\n\s*\n/g, "\n");
					html = html.replace(/^[\s\n]*/g, ' ');
					html = html.replace(/[\s\n]*$/g, ' ');
					html = html.replace( />\s{2,}</g, '> <'); // between inline tags can be only one space
					html = html.replace(/\n\n/g, "\n");
					html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');

					return html;
				},
				replaceDivs: function(html)
				{
					if (this.opts.linebreaks)
					{
						html = html.replace(/<div><br\s?\/?><\/div>/gi, '<br />');
						html = html.replace(/<div(.*?)>([\w\W]*?)<\/div>/gi, '$2<br />');
					}
					else
					{
						html = html.replace(/<div(.*?)>([\w\W]*?)<\/div>/gi, '<p$1>$2</p>');
					}

					html = html.replace(/<div(.*?[^>])>/gi, '');
					html = html.replace(/<\/div>/gi, '');

					return html;
				},
				replaceDivsToBr: function(html)
				{
					html = html.replace(/<div\s(.*?)>/gi, '<p>');
					html = html.replace(/<div><br\s?\/?><\/div>/gi, '<br /><br />');
					html = html.replace(/<div>([\w\W]*?)<\/div>/gi, '$1<br /><br />');

					return html;
				},
				replaceParagraphsToBr: function(html)
				{
					html = html.replace(/<p\s(.*?)>/gi, '<p>');
					html = html.replace(/<p><br\s?\/?><\/p>/gi, '<br />');
					html = html.replace(/<p>([\w\W]*?)<\/p>/gi, '$1<br /><br />');
					html = html.replace(/(<br\s?\/?>){1,}\n?<\/blockquote>/gi, '</blockquote>');

					return html;
				},
				saveFormTags: function(html)
				{
					return html.replace(/<form(.*?)>([\w\W]*?)<\/form>/gi, '<section$1 rel="redactor-form-tag">$2</section>');
				},
				restoreFormTags: function(html)
				{
					return html.replace(/<section(.*?) rel="redactor-form-tag"(.*?)>([\w\W]*?)<\/section>/gi, '<form$1$2>$3</form>');
				}
			};
		},
		code: function()
		{
			return {
				set: function(html)
				{
					html = $.trim(html.toString());

					// clean
					html = this.clean.onSet(html);

					this.$editor.html(html);
					this.code.sync();

					if (html !== '') this.placeholder.remove();

					setTimeout($.proxy(this.buffer.add, this), 15);
					if (this.start === false) this.observe.load();

				},
				get: function()
				{
					var code = this.$textarea.val();

					// indent code
					code = this.tabifier.get(code);

					return code;
				},
				sync: function()
				{
					setTimeout($.proxy(this.code.startSync, this), 10);
				},
				startSync: function()
				{
					var html = this.$editor.html();

					// is there a need to synchronize
					if (this.code.syncCode && this.code.syncCode == html)
					{
						// do not sync
						return;
					}

					// save code
					this.code.syncCode = html;

					// before clean callback
					html = this.core.setCallback('syncBefore', html);

					// clean
					html = this.clean.onSync(html);

					// set code
					this.$textarea.val(html);

					// after sync callback
					this.core.setCallback('sync', html);

					if (this.start === false)
					{
						this.core.setCallback('change', html);
					}

					this.start = false;

					// autosave on change
					this.autosave.onChange();
				},
				toggle: function()
				{
					if (this.opts.visual)
					{
						this.code.showCode();
					}
					else
					{
						this.code.showVisual();
					}
				},
				showCode: function()
				{
					this.code.offset = this.caret.getOffset();
					var scroll = $(window).scrollTop();

					var height = this.$editor.innerHeight();

					this.$editor.hide();

					var html = this.$textarea.val();
					this.modified = this.clean.removeSpaces(html);

					// indent code
					html = this.tabifier.get(html);

					this.$textarea.val(html).height(height).show().focus();
					this.$textarea.on('keydown.redactor-textarea-indenting', this.code.textareaIndenting);

					$(window).scrollTop(scroll);

					if (this.$textarea[0].setSelectionRange)
					{
						this.$textarea[0].setSelectionRange(0, 0);
					}

					this.$textarea[0].scrollTop = 0;

					this.opts.visual = false;

					this.button.setInactiveInCode();
					this.button.setActive('html');
					this.core.setCallback('source', html);
				},
				showVisual: function()
				{
					if (this.opts.visual) return;

					var html = this.$textarea.hide().val();

					if (this.modified !== this.clean.removeSpaces(html))
					{
						this.code.set(html);
					}

					this.$editor.show();

					if (!this.utils.isEmpty(html))
					{
						this.placeholder.remove();
					}

					this.caret.setOffset(this.code.offset);

					this.$textarea.off('keydown.redactor-textarea-indenting');

					this.button.setActiveInVisual();
					this.button.setInactive('html');

					this.observe.load();
					this.opts.visual = true;
					this.core.setCallback('visual', html);
				},
				textareaIndenting: function(e)
				{
					if (e.keyCode !== 9) return true;

					var $el = this.$textarea;
					var start = $el.get(0).selectionStart;
					$el.val($el.val().substring(0, start) + "\t" + $el.val().substring($el.get(0).selectionEnd));
					$el.get(0).selectionStart = $el.get(0).selectionEnd = start + 1;

					return false;
				}
			};
		},
		core: function()
		{
			return {
				getObject: function()
				{
					return $.extend({}, this);
				},
				getEditor: function()
				{
					return this.$editor;
				},
				getBox: function()
				{
					return this.$box;
				},
				getElement: function()
				{
					return this.$element;
				},
				getTextarea: function()
				{
					return this.$textarea;
				},
				getToolbar: function()
				{
					return (this.$toolbar) ? this.$toolbar : false;
				},
				addEvent: function(name)
				{
					this.core.event = name;
				},
				getEvent: function()
				{
					return this.core.event;
				},
				setCallback: function(type, e, data)
				{
					var callback = this.opts[type + 'Callback'];
					if ($.isFunction(callback))
					{
						return (typeof data == 'undefined') ? callback.call(this, e) : callback.call(this, e, data);
					}
					else
					{
						return (typeof data == 'undefined') ? e : data;
					}
				},
				destroy: function()
				{
					this.core.setCallback('destroy');

					// off events and remove data
					this.$element.off('.redactor').removeData('redactor');
					this.$editor.off('.redactor');

					$(document).off('click.redactor-image-delete.' + this.uuid);
					$(document).off('click.redactor-image-resize-hide.' + this.uuid);
					$(document).off('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid);
					$("body").off('scroll.redactor.' + this.uuid);
					$(this.opts.toolbarFixedTarget).off('scroll.redactor.' + this.uuid);

					// common
					this.$editor.removeClass('redactor-editor redactor-linebreaks redactor-placeholder');
					this.$editor.removeAttr('contenteditable');

					var html = this.code.get();

					// dropdowns off
					this.$toolbar.find('a').each(function()
					{
						var $el = $(this);
						if ($el.data('dropdown'))
						{
							$el.data('dropdown').remove();
							$el.data('dropdown', {});
						}
					});


					if (this.build.isTextarea())
					{
						this.$box.after(this.$element);
						this.$box.remove();
						this.$element.val(html).show();
					}
					else
					{
						this.$box.after(this.$editor);
						this.$box.remove();
						this.$element.html(html).show();
					}

					// paste box
					if (this.$pasteBox) this.$pasteBox.remove();

					// modal
					if (this.$modalBox) this.$modalBox.remove();
					if (this.$modalOverlay) this.$modalOverlay.remove();

					// buttons tooltip
					$('.redactor-toolbar-tooltip').remove();

					// autosave
					clearInterval(this.autosaveInterval);

				}
			};
		},
		dropdown: function()
		{
			return {
				build: function(name, $dropdown, dropdownObject)
				{
					if (name == 'formatting' && this.opts.formattingAdd)
					{
						$.each(this.opts.formattingAdd, $.proxy(function(i,s)
						{
							var name = s.tag;
							if (typeof s['class'] != 'undefined')
							{
								name = name + '-' + s['class'];
							}

							s.type = (this.utils.isBlockTag(s.tag)) ? 'block' : 'inline';
							var func = (s.type == 'inline') ? 'inline.formatting' : 'block.formatting';

							if (this.opts.linebreaks && s.type == 'block' && s.tag == 'p') return;

							this.formatting[name] = {
								tag: s.tag,
								style: s.style,
								'class': s['class'],
								attr: s.attr,
								data: s.data,
								clear: s.clear
							};

							dropdownObject[name] = {
								func: func,
								title: s.title
							};

						}, this));

					}

					$.each(dropdownObject, $.proxy(function(btnName, btnObject)
					{
						var $item = $('<a href="#" class="redactor-dropdown-' + btnName + '">' + btnObject.title + '</a>');
						if (name == 'formatting') $item.addClass('redactor-formatting-' + btnName);

						$item.on('click', $.proxy(function(e)
						{
							e.preventDefault();

							var type = 'func';
							var callback = btnObject.func;
							if (btnObject.command)
							{
								type = 'command';
								callback = btnObject.command;
							}
							else if (btnObject.dropdown)
							{
								type = 'dropdown';
								callback = btnObject.dropdown;
							}

							this.button.onClick(e, btnName, type, callback);
							this.dropdown.hideAll();

						}, this));

						$dropdown.append($item);

					}, this));
				},
				show: function(e, key)
				{
					if (!this.opts.visual)
					{
						e.preventDefault();
						return false;
					}

					var $button = this.button.get(key);

					// Always re-append it to the end of <body> so it always has the highest sub-z-index.
					var $dropdown = $button.data('dropdown').appendTo(document.body);

					// ios keyboard hide
					if (this.utils.isMobile() && !this.utils.browser('msie'))
					{
						document.activeElement.blur();
					}

					if ($button.hasClass('dropact'))
					{
						this.dropdown.hideAll();
					}
					else
					{
						this.dropdown.hideAll();
						this.core.setCallback('dropdownShow', { dropdown: $dropdown, key: key, button: $button });

						this.button.setActive(key);

						$button.addClass('dropact');

						var keyPosition = $button.offset();

						// fix right placement
						var dropdownWidth = $dropdown.width();
						if ((keyPosition.left + dropdownWidth) > $(document).width())
						{
							keyPosition.left = Math.max(0, keyPosition.left - dropdownWidth);
						}

						var left = keyPosition.left + 'px';
						if (this.$toolbar.hasClass('toolbar-fixed-box'))
						{
							var top = this.$toolbar.innerHeight() + this.opts.toolbarFixedTopOffset;
							var position = 'fixed';
							if (this.opts.toolbarFixedTarget !== document)
							{
								top = (this.$toolbar.innerHeight() + this.$toolbar.offset().top) + this.opts.toolbarFixedTopOffset;
								position = 'absolute';
							}

							$dropdown.css({ position: position, left: left, top: top + 'px' }).show();
						}
						else
						{
							var top = ($button.innerHeight() + keyPosition.top) + 'px';

							$dropdown.css({ position: 'absolute', left: left, top: top }).show();
						}

						this.core.setCallback('dropdownShown', { dropdown: $dropdown, key: key, button: $button });
					}

					$(document).one('click', $.proxy(this.dropdown.hide, this));
					this.$editor.one('click', $.proxy(this.dropdown.hide, this));

					// disable scroll whan dropdown scroll
					var $body = $(document.body);
					var width = $body.width();

					$dropdown.on('mouseover', function() {

						$body.addClass('body-redactor-hidden');
						$body.css('margin-right', ($body.width() - width) + 'px');

					 });

					$dropdown.on('mouseout', function() {

						$body.removeClass('body-redactor-hidden').css('margin-right', 0);

					});


					e.stopPropagation();
				},
				hideAll: function()
				{
					this.$toolbar.find('a.dropact').removeClass('redactor-act').removeClass('dropact');

					$(document.body).removeClass('body-redactor-hidden').css('margin-right', 0);
					$('.redactor-dropdown-' + this.uuid).hide();
					this.core.setCallback('dropdownHide');
				},
				hide: function (e)
				{
					var $dropdown = $(e.target);
					if (!$dropdown.hasClass('dropact'))
					{
						$dropdown.removeClass('dropact');
						this.dropdown.hideAll();
					}
				}
			};
		},
		file: function()
		{
			return {
				show: function()
				{
					this.modal.load('file', this.lang.get('file'), 700);
					this.upload.init('#redactor-modal-file-upload', this.opts.fileUpload, this.file.insert);

					this.selection.save();

					this.selection.get();
					var text = this.sel.toString();

					$('#redactor-filename').val(text);

					this.modal.show();
				},
				insert: function(json, direct, e)
				{
					// error callback
					if (typeof json.error != 'undefined')
					{
						this.modal.close();
						this.selection.restore();
						this.core.setCallback('fileUploadError', json);
						return;
					}

					var link;
					if (typeof json == 'string')
					{
						link = json;
					}
					else
					{
						var text = $('#redactor-filename').val();
						if (typeof text == 'undefined' || text === '') text = json.filename;

						link = '<a href="' + json.filelink + '" id="filelink-marker">' + text + '</a>';
					}

					if (direct)
					{
						this.selection.removeMarkers();
						var marker = this.selection.getMarker();
						this.insert.nodeToCaretPositionFromPoint(e, marker);
					}
					else
					{
						this.modal.close();
					}

					this.selection.restore();
					this.buffer.set();

					this.insert.htmlWithoutClean(link);

					if (typeof json == 'string') return;

					var linkmarker = $(this.$editor.find('a#filelink-marker'));
					if (linkmarker.length !== 0)
					{
						linkmarker.removeAttr('id').removeAttr('style');
					}
					else linkmarker = false;

					this.core.setCallback('fileUpload', linkmarker, json);

				}
			};
		},
		focus: function()
		{
			return {
				setStart: function()
				{
					this.$editor.focus();

					var first = this.$editor.children().first();

					if (first.length === 0) return;
					if (first[0].length === 0 || first[0].tagName == 'BR' || first[0].nodeType == 3)
					{
						return;
					}

					if (first[0].tagName == 'UL' || first[0].tagName == 'OL')
					{
						var child = first.find('li').first();
						if (!this.utils.isBlock(child) && child.text() === '')
						{
							// empty inline tag in li
							this.caret.setStart(child);
							return;
						}
					}

					if (this.opts.linebreaks && !this.utils.isBlockTag(first[0].tagName))
					{
						this.selection.get();
						this.range.setStart(this.$editor[0], 0);
						this.range.setEnd(this.$editor[0], 0);
						this.selection.addRange();

						return;
					}

					// if node is tag
					this.caret.setStart(first);
				},
				setEnd: function()
				{
					if (this.utils.browser('mozilla') || this.utils.browser('msie'))
					{
						var last = this.$editor.children().last();

						this.$editor.focus();
						this.caret.setEnd(last);
					}
					else
					{
						this.selection.get();

						try {
							this.range.selectNodeContents(this.$editor[0]);
							this.range.collapse(false);

							this.selection.addRange();
						}
						catch (e) {}
					}

				},
				isFocused: function()
				{
					var focusNode = document.getSelection().focusNode;
					if (focusNode === null) return false;

					if (this.opts.linebreaks && $(focusNode.parentNode).hasClass('redactor-linebreaks')) return true;
					else if (!this.utils.isRedactorParent(focusNode.parentNode)) return false;

					return this.$editor.is(':focus');
				}
			};
		},
		image: function()
		{
			return {
				show: function()
				{
					this.modal.load('image', this.lang.get('image'), 700);
					this.upload.init('#redactor-modal-image-droparea', this.opts.imageUpload, this.image.insert);

					this.selection.save();
					this.modal.show();

				},
				showEdit: function($image)
				{
					var $link = $image.closest('a');

					this.modal.load('imageEdit', this.lang.get('edit'), 705);

					this.modal.createCancelButton();
					this.image.buttonDelete = this.modal.createDeleteButton(this.lang.get('_delete'));
					this.image.buttonSave = this.modal.createActionButton(this.lang.get('save'));

					this.image.buttonDelete.on('click', $.proxy(function()
					{
						this.image.remove($image);

					}, this));

					this.image.buttonSave.on('click', $.proxy(function()
					{
						this.image.update($image);

					}, this));

					$('#redactor-image-title').val($image.attr('alt'));

					if (!this.opts.imageLink) $('.redactor-image-link-option').hide();
					else
					{
						var $redactorImageLink = $('#redactor-image-link');

						$redactorImageLink.attr('href', $image.attr('src'));
						if ($link.length !== 0)
						{
							$redactorImageLink.val($link.attr('href'));
							if ($link.attr('target') == '_blank') $('#redactor-image-link-blank').prop('checked', true);
						}
					}

					if (!this.opts.imagePosition) $('.redactor-image-position-option').hide();
					else
					{
						var floatValue = ($image.css('display') == 'block' && $image.css('float') == 'none') ? 'center' : $image.css('float');
						$('#redactor-image-align').val(floatValue);
					}

					this.modal.show();

				},
				setFloating: function($image)
				{
					var floating = $('#redactor-image-align').val();

					var imageFloat = '';
					var imageDisplay = '';
					var imageMargin = '';

					switch (floating)
					{
						case 'left':
							imageFloat = 'left';
							imageMargin = '0 ' + this.opts.imageFloatMargin + ' ' + this.opts.imageFloatMargin + ' 0';
						break;
						case 'right':
							imageFloat = 'right';
							imageMargin = '0 0 ' + this.opts.imageFloatMargin + ' ' + this.opts.imageFloatMargin;
						break;
						case 'center':
							imageDisplay = 'block';
							imageMargin = 'auto';
						break;
					}

					$image.css({ 'float': imageFloat, display: imageDisplay, margin: imageMargin });
					$image.attr('rel', $image.attr('style'));
				},
				update: function($image)
				{
					this.image.hideResize();
					this.buffer.set();

					var $link = $image.closest('a');

					$image.attr('alt', $('#redactor-image-title').val());

					this.image.setFloating($image);

					// as link
					var link = $.trim($('#redactor-image-link').val());
					if (link !== '')
					{
						// test url (add protocol)
						var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}';
						var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
						var re2 = new RegExp('^' + pattern, 'i');

						if (link.search(re) == -1 && link.search(re2) === 0 && this.opts.linkProtocol)
						{
							link = this.opts.linkProtocol + '://' + link;
						}

						var target = ($('#redactor-image-link-blank').prop('checked')) ? true : false;

						if ($link.length === 0)
						{
							var a = $('<a href="' + link + '">' + this.utils.getOuterHtml($image) + '</a>');
							if (target) a.attr('target', '_blank');

							$image.replaceWith(a);
						}
						else
						{
							$link.attr('href', link);
							if (target)
							{
								$link.attr('target', '_blank');
							}
							else
							{
								$link.removeAttr('target');
							}
						}
					}
					else if ($link.length !== 0)
					{
						$link.replaceWith(this.utils.getOuterHtml($image));

					}

					this.modal.close();
					this.observe.images();
					this.code.sync();


				},
				setEditable: function($image)
				{
					if (this.opts.imageEditable)
					{
						$image.on('dragstart', $.proxy(this.image.onDrag, this));
					}

					$image.on('mousedown', $.proxy(this.image.hideResize, this));
					$image.on('click.redactor touchstart', $.proxy(function(e)
					{
						this.observe.image = $image;

						if (this.$editor.find('#redactor-image-box').length !== 0) return false;

						this.image.resizer = this.image.loadEditableControls($image);

						$(document).on('click.redactor-image-resize-hide.' + this.uuid, $.proxy(this.image.hideResize, this));
						this.$editor.on('click.redactor-image-resize-hide.' + this.uuid, $.proxy(this.image.hideResize, this));

						// resize
						if (!this.opts.imageResizable) return;

						this.image.resizer.on('mousedown.redactor touchstart.redactor', $.proxy(function(e)
						{
							this.image.setResizable(e, $image);
						}, this));


					}, this));
				},
				setResizable: function(e, $image)
				{
					e.preventDefault();

				    this.image.resizeHandle = {
				        x : e.pageX,
				        y : e.pageY,
				        el : $image,
				        ratio: $image.width() / $image.height(),
				        h: $image.height()
				    };

				    e = e.originalEvent || e;

				    if (e.targetTouches)
				    {
				         this.image.resizeHandle.x = e.targetTouches[0].pageX;
				         this.image.resizeHandle.y = e.targetTouches[0].pageY;
				    }

					this.image.startResize();


				},
				startResize: function()
				{
					$(document).on('mousemove.redactor-image-resize touchmove.redactor-image-resize', $.proxy(this.image.moveResize, this));
					$(document).on('mouseup.redactor-image-resize touchend.redactor-image-resize', $.proxy(this.image.stopResize, this));
				},
				moveResize: function(e)
				{
					e.preventDefault();

					e = e.originalEvent || e;

					var height = this.image.resizeHandle.h;

		            if (e.targetTouches) height += (e.targetTouches[0].pageY -  this.image.resizeHandle.y);
		            else height += (e.pageY -  this.image.resizeHandle.y);

					var width = Math.round(height * this.image.resizeHandle.ratio);

					if (height < 50 || width < 100) return;

		            this.image.resizeHandle.el.width(width);
		            this.image.resizeHandle.el.height(this.image.resizeHandle.el.width()/this.image.resizeHandle.ratio);

		            this.code.sync();
				},
				stopResize: function()
				{
					this.handle = false;
					$(document).off('.redactor-image-resize');

					this.image.hideResize();
				},
				onDrag: function(e)
				{
					if (this.$editor.find('#redactor-image-box').length !== 0)
					{
						e.preventDefault();
						return false;
					}

					this.$editor.on('drop.redactor-image-inside-drop', $.proxy(function()
					{
						setTimeout($.proxy(this.image.onDrop, this), 1);

					}, this));
				},
				onDrop: function()
				{
					this.image.fixImageSourceAfterDrop();
					this.observe.images();
					this.$editor.off('drop.redactor-image-inside-drop');
					this.clean.clearUnverified();
					this.code.sync();
				},
				fixImageSourceAfterDrop: function()
				{
					this.$editor.find('img[data-save-url]').each(function()
					{
						var $el = $(this);
						$el.attr('src', $el.attr('data-save-url'));
						$el.removeAttr('data-save-url');
					});
				},
				hideResize: function(e)
				{
					if (e && $(e.target).closest('#redactor-image-box').length !== 0) return;
					if (e && e.target.tagName == 'IMG')
					{
						var $image = $(e.target);
						$image.attr('data-save-url', $image.attr('src'));
					}

					var imageBox = this.$editor.find('#redactor-image-box');
					if (imageBox.length === 0) return;

					if (this.opts.imageEditable)
					{
						this.image.editter.remove();
					}

					$(this.image.resizer).remove();

					imageBox.find('img').css({
						marginTop: imageBox[0].style.marginTop,
						marginBottom: imageBox[0].style.marginBottom,
						marginLeft: imageBox[0].style.marginLeft,
						marginRight: imageBox[0].style.marginRight
					});

					imageBox.css('margin', '');
					imageBox.find('img').css('opacity', '');
					imageBox.replaceWith(function()
					{
						return $(this).contents();
					});

					$(document).off('click.redactor-image-resize-hide.' + this.uuid);
					this.$editor.off('click.redactor-image-resize-hide.' + this.uuid);

					if (typeof this.image.resizeHandle !== 'undefined')
					{
						this.image.resizeHandle.el.attr('rel', this.image.resizeHandle.el.attr('style'));
					}

					this.code.sync();

				},
				loadResizableControls: function($image, imageBox)
				{
					if (this.opts.imageResizable && !this.utils.isMobile())
					{
						var imageResizer = $('<span id="redactor-image-resizer" data-redactor="verified"></span>');

						if (!this.utils.isDesktop())
						{
							imageResizer.css({ width: '15px', height: '15px' });
						}

						imageResizer.attr('contenteditable', false);
						imageBox.append(imageResizer);
						imageBox.append($image);

						return imageResizer;
					}
					else
					{
						imageBox.append($image);
						return false;
					}
				},
				loadEditableControls: function($image)
				{
					var imageBox = $('<span id="redactor-image-box" data-redactor="verified">');
					imageBox.css('float', $image.css('float')).attr('contenteditable', false);

					if ($image[0].style.margin != 'auto')
					{
						imageBox.css({
							marginTop: $image[0].style.marginTop,
							marginBottom: $image[0].style.marginBottom,
							marginLeft: $image[0].style.marginLeft,
							marginRight: $image[0].style.marginRight
						});

						$image.css('margin', '');
					}
					else
					{
						imageBox.css({ 'display': 'block', 'margin': 'auto' });
					}

					$image.css('opacity', '.5').after(imageBox);


					if (this.opts.imageEditable)
					{
						// editter
						this.image.editter = $('<span id="redactor-image-editter" data-redactor="verified">' + this.lang.get('edit') + '</span>');
						this.image.editter.attr('contenteditable', false);
						this.image.editter.on('click', $.proxy(function()
						{
							this.image.showEdit($image);
						}, this));

						imageBox.append(this.image.editter);

						// position correction
						var editerWidth = this.image.editter.innerWidth();
						this.image.editter.css('margin-left', '-' + editerWidth/2 + 'px');
					}

					return this.image.loadResizableControls($image, imageBox);

				},
				remove: function(image)
				{
					var $image = $(image);
					var $link = $image.closest('a');
					var $figure = $image.closest('figure');
					var $parent = $image.parent();
					if ($('#redactor-image-box').length !== 0)
					{
						$parent = $('#redactor-image-box').parent();
					}

					var $next;
					if ($figure.length !== 0)
					{
						$next = $figure.next();
						$figure.remove();
					}
					else if ($link.length !== 0)
					{
						$parent = $link.parent();
						$link.remove();
					}
					else
					{
						$image.remove();
					}

					$('#redactor-image-box').remove();

					if ($figure.length !== 0)
					{
						this.caret.setStart($next);
					}
					else
					{
						this.caret.setStart($parent);
					}

					// delete callback
					this.core.setCallback('imageDelete', $image[0].src, $image);

					this.modal.close();
					this.code.sync();
				},
				insert: function(json, direct, e)
				{
					// error callback
					if (typeof json.error != 'undefined')
					{
						this.modal.close();
						this.selection.restore();
						this.core.setCallback('imageUploadError', json);
						return;
					}

					var $img;
					if (typeof json == 'string')
					{
						$img = $(json).attr('data-redactor-inserted-image', 'true');
					}
					else
					{
						$img = $('<img>');
						$img.attr('src', json.filelink).attr('data-redactor-inserted-image', 'true');
					}


					var node = $img;
					var isP = this.utils.isCurrentOrParent('P');
					if (isP)
					{
						// will replace
						node = $('<blockquote />').append($img);
					}

					if (direct)
					{
						this.selection.removeMarkers();
						var marker = this.selection.getMarker();
						this.insert.nodeToCaretPositionFromPoint(e, marker);
					}
					else
					{
						this.modal.close();
					}

					this.selection.restore();
					this.buffer.set();

					this.insert.html(this.utils.getOuterHtml(node), false);

					var $image = this.$editor.find('img[data-redactor-inserted-image=true]').removeAttr('data-redactor-inserted-image');

					if (isP)
					{
						$image.parent().contents().unwrap().wrap('<p />');
					}
					else if (this.opts.linebreaks)
					{
						$image.before('<br>').after('<br>');
					}

					if (typeof json == 'string') return;

					this.core.setCallback('imageUpload', $image, json);

				}
			};
		},
		indent: function()
		{
			return {
				increase: function()
				{
					// focus
					if (!this.utils.browser('msie')) this.$editor.focus();

					this.buffer.set();
					this.selection.save();

					var block = this.selection.getBlock();

					if (block && block.tagName == 'LI')
					{
						this.indent.increaseLists();
					}
					else if (block === false && this.opts.linebreaks)
					{
						this.indent.increaseText();
					}
					else
					{
						this.indent.increaseBlocks();
					}

					this.selection.restore();
					this.code.sync();
				},
				increaseLists: function()
				{
					document.execCommand('indent');

					this.indent.fixEmptyIndent();
					this.clean.normalizeLists();
					this.clean.clearUnverified();
				},
				increaseBlocks: function()
				{
					$.each(this.selection.getBlocks(), $.proxy(function(i, elem)
					{
						if (elem.tagName === 'TD' || elem.tagName === 'TH') return;

						var $el = this.utils.getAlignmentElement(elem);

						var left = this.utils.normalize($el.css('margin-left')) + this.opts.indentValue;
						$el.css('margin-left', left + 'px');

					}, this));
				},
				increaseText: function()
				{
					var wrapper = this.selection.wrap('div');
					$(wrapper).attr('data-tagblock', 'redactor');
					$(wrapper).css('margin-left', this.opts.indentValue + 'px');
				},
				decrease: function()
				{
					this.buffer.set();
					this.selection.save();

					var block = this.selection.getBlock();
					if (block && block.tagName == 'LI')
					{
						this.indent.decreaseLists();
					}
					else
					{
						this.indent.decreaseBlocks();
					}

					this.selection.restore();
					this.code.sync();
				},
				decreaseLists: function ()
				{
					document.execCommand('outdent');

					var current = this.selection.getCurrent();

					var $item = $(current).closest('li');
					var $parent = $item.parent();
					if ($item.length !== 0 && $parent.length !== 0 && $parent[0].tagName == 'LI')
					{
						$parent.after($item);
					}

					this.indent.fixEmptyIndent();

					if (!this.opts.linebreaks && $item.length === 0)
					{
						document.execCommand('formatblock', false, 'p');
						this.$editor.find('ul, ol, blockquote, p').each($.proxy(this.utils.removeEmpty, this));
					}

					this.clean.clearUnverified();
				},
				decreaseBlocks: function()
				{
					$.each(this.selection.getBlocks(), $.proxy(function(i, elem)
					{
						var $el = this.utils.getAlignmentElement(elem);
						var left = this.utils.normalize($el.css('margin-left')) - this.opts.indentValue;

						if (left <= 0)
						{
							if (this.opts.linebreaks && typeof($el.data('tagblock')) !== 'undefined')
							{
								$el.replaceWith($el.html() + '<br />');
							}
							else
							{
								$el.css('margin-left', '');
								this.utils.removeEmptyAttr($el, 'style');
							}
						}
						else
						{
							$el.css('margin-left', left + 'px');
						}

					}, this));
				},
				fixEmptyIndent: function()
				{
					var block = this.selection.getBlock();

					if (this.range.collapsed && block && block.tagName == 'LI' && this.utils.isEmpty($(block).text()))
					{
						var $block = $(block);
						$block.find('span').not('.redactor-selection-marker').contents().unwrap();
						$block.append('<br>');
					}
				}
			};
		},
		inline: function()
		{
			return {
				formatting: function(name)
				{
					var type, value;

					if (typeof this.formatting[name].style != 'undefined') type = 'style';
					else if (typeof this.formatting[name]['class'] != 'undefined') type = 'class';

					if (type) value = this.formatting[name][type];

					this.inline.format(this.formatting[name].tag, type, value);

				},
				format: function(tag, type, value)
				{
					// Stop formatting pre and headers
					if (this.utils.isCurrentOrParent('PRE') || this.utils.isCurrentOrParentHeader()) return;

					var tags = ['b', 'bold', 'i', 'italic', 'underline', 'strikethrough', 'deleted', 'superscript', 'subscript'];
					var replaced = ['strong', 'strong', 'em', 'em', 'u', 'del', 'del', 'sup', 'sub'];

					for (var i = 0; i < tags.length; i++)
					{
						if (tag == tags[i]) tag = replaced[i];
					}

					this.inline.type = type || false;
					this.inline.value = value || false;

					this.buffer.set();

					if (!this.utils.browser('msie'))
					{
						this.$editor.focus();
					}

					this.selection.get();

					if (this.range.collapsed)
					{
						this.inline.formatCollapsed(tag);
					}
					else
					{
						this.inline.formatMultiple(tag);
					}
				},
				formatCollapsed: function(tag)
				{
					var current = this.selection.getCurrent();
					var $parent = $(current).closest(tag + '[data-redactor-tag=' + tag + ']');

					// inline there is
					if ($parent.length !== 0 && (this.inline.type != 'style' && $parent[0].tagName != 'SPAN'))
					{
						// remove empty
						if (this.utils.isEmpty($parent.text()))
						{
							this.caret.setAfter($parent[0]);

							$parent.remove();
							this.code.sync();
						}
						else if (this.utils.isEndOfElement($parent))
						{
							this.caret.setAfter($parent[0]);
						}

						return;
					}

					// create empty inline
					var node = $('<' + tag + '>').attr('data-verified', 'redactor').attr('data-redactor-tag', tag);
					node.html(this.opts.invisibleSpace);

					node = this.inline.setFormat(node);

					var node = this.insert.node(node);
					this.caret.setEnd(node);

					this.code.sync();
				},
				formatMultiple: function(tag)
				{
					this.inline.formatConvert(tag);

					this.selection.save();
					document.execCommand('strikethrough');

					this.$editor.find('strike').each($.proxy(function(i,s)
					{
						var $el = $(s);

						this.inline.formatRemoveSameChildren($el, tag);

						var $span;
						if (this.inline.type)
						{
							$span = $('<span>').attr('data-redactor-tag', tag).attr('data-verified', 'redactor');
							$span = this.inline.setFormat($span);
						}
						else
						{
							$span = $('<' + tag + '>').attr('data-redactor-tag', tag).attr('data-verified', 'redactor');
						}

						$el.replaceWith($span.html($el.contents()));

						if (tag == 'span')
						{
							var $parent = $span.parent();
							if ($parent && $parent[0].tagName == 'SPAN' && this.inline.type == 'style')
							{
								var arr = this.inline.value.split(';');

								for (var z = 0; z < arr.length; z++)
								{
									if (arr[z] === '') return;
									var style = arr[z].split(':');
									$parent.css(style[0], '');

									if (this.utils.removeEmptyAttr($parent, 'style'))
									{
										$parent.replaceWith($parent.contents());
									}

								}

							}
						}

					}, this));

					// clear text decoration
					if (tag != 'span')
					{
						this.$editor.find(this.opts.inlineTags.join(', ')).each($.proxy(function(i,s)
						{
							var $el = $(s);
							var property = $el.css('text-decoration');
							if (property == 'line-through')
							{
								$el.css('text-decoration', '');
								this.utils.removeEmptyAttr($el, 'style');
							}
						}, this));
					}

					if (tag != 'del')
					{
						var _this = this;
						this.$editor.find('inline').each(function(i,s)
						{
							_this.utils.replaceToTag(s, 'del');
						});
					}

					this.selection.restore();
					this.code.sync();

				},
				formatRemoveSameChildren: function($el, tag)
				{
					var self = this;
					$el.children(tag).each(function()
					{
						var $child = $(this);

						if (!$child.hasClass('redactor-selection-marker'))
						{
							if (self.inline.type == 'style')
							{
								var arr = self.inline.value.split(';');

								for (var z = 0; z < arr.length; z++)
								{
									if (arr[z] === '') return;

									var style = arr[z].split(':');
									$child.css(style[0], '');

									if (self.utils.removeEmptyAttr($child , 'style'))
									{
										$child.replaceWith($child.contents());
									}

								}
							}
							else
							{
								$child.contents().unwrap();
							}
						}

					});
				},
				formatConvert: function(tag)
				{
					this.selection.save();

					var find = '';
					if (this.inline.type == 'class') find = '[data-redactor-class=' + this.inline.value + ']';
					else if (this.inline.type == 'style')
					{
						find = '[data-redactor-style="' + this.inline.value + '"]';
					}

					var self = this;
					if (tag != 'del')
					{
						this.$editor.find('del').each(function(i,s)
						{
							self.utils.replaceToTag(s, 'inline');
						});
					}

					if (tag != 'span')
					{
						this.$editor.find(tag).each(function()
						{
							var $el = $(this);
							$el.replaceWith($('<strike />').html($el.contents()));

						});
					}

					this.$editor.find('[data-redactor-tag="' + tag + '"]' + find).each(function()
					{
						if (find === '' && tag == 'span' && this.tagName.toLowerCase() == tag) return;

						var $el = $(this);
						$el.replaceWith($('<strike />').html($el.contents()));

					});

					this.selection.restore();
				},
				setFormat: function(node)
				{
					switch (this.inline.type)
					{
						case 'class':

							if (node.hasClass(this.inline.value))
							{
								node.removeClass(this.inline.value);
								node.removeAttr('data-redactor-class');
							}
							else
							{
								node.addClass(this.inline.value);
								node.attr('data-redactor-class', this.inline.value);
							}


						break;
						case 'style':

							node[0].style.cssText = this.inline.value;
							node.attr('data-redactor-style', this.inline.value);

						break;
					}

					return node;
				},
				removeStyle: function()
				{
					this.buffer.set();
					var current = this.selection.getCurrent();
					var nodes = this.selection.getInlines();

					this.selection.save();

					if (current && current.tagName === 'SPAN')
					{
						var $s = $(current);

						$s.removeAttr('style');
						if ($s[0].attributes.length === 0)
						{
							$s.replaceWith($s.contents());
						}
					}

					$.each(nodes, $.proxy(function(i,s)
					{
						var $s = $(s);
						if ($.inArray(s.tagName.toLowerCase(), this.opts.inlineTags) != -1 && !$s.hasClass('redactor-selection-marker'))
						{
							$s.removeAttr('style');
							if ($s[0].attributes.length === 0)
							{
								$s.replaceWith($s.contents());
							}
						}
					}, this));

					this.selection.restore();
					this.code.sync();

				},
				removeStyleRule: function(name)
				{
					this.buffer.set();
					var parent = this.selection.getParent();
					var nodes = this.selection.getInlines();

					this.selection.save();

					if (parent && parent.tagName === 'SPAN')
					{
						var $s = $(parent);

						$s.css(name, '');
						this.utils.removeEmptyAttr($s, 'style');
						if ($s[0].attributes.length === 0)
						{
							$s.replaceWith($s.contents());
						}
					}

					$.each(nodes, $.proxy(function(i,s)
					{
						var $s = $(s);
						if ($.inArray(s.tagName.toLowerCase(), this.opts.inlineTags) != -1 && !$s.hasClass('redactor-selection-marker'))
						{
							$s.css(name, '');
							this.utils.removeEmptyAttr($s, 'style');
							if ($s[0].attributes.length === 0)
							{
								$s.replaceWith($s.contents());
							}
						}
					}, this));

					this.selection.restore();
					this.code.sync();
				},
				removeFormat: function()
				{
					this.buffer.set();
					var current = this.selection.getCurrent();

					this.selection.save();

					document.execCommand('removeFormat');

					if (current && current.tagName === 'SPAN')
					{
						$(current).replaceWith($(current).contents());
					}


					$.each(this.selection.getNodes(), $.proxy(function(i,s)
					{
						var $s = $(s);
						if ($.inArray(s.tagName.toLowerCase(), this.opts.inlineTags) != -1 && !$s.hasClass('redactor-selection-marker'))
						{
							$s.replaceWith($s.contents());
						}
					}, this));

					this.selection.restore();
					this.code.sync();

				},
				toggleClass: function(className)
				{
					this.inline.format('span', 'class', className);
				},
				toggleStyle: function(value)
				{
					this.inline.format('span', 'style', value);
				}
			};
		},
		insert: function()
		{
			return {
				set: function(html, clean)
				{
					this.placeholder.remove();

					html = this.clean.setVerified(html);

					if (typeof clean == 'undefined')
					{
						html = this.clean.onPaste(html, false);
					}

					this.$editor.html(html);
					this.selection.remove();
					this.focus.setEnd();
					this.clean.normalizeLists();
					this.code.sync();
					this.observe.load();

					if (typeof clean == 'undefined')
					{
						setTimeout($.proxy(this.clean.clearUnverified, this), 10);
					}
				},
				text: function(text)
				{
					this.placeholder.remove();

					text = text.toString();
					text = $.trim(text);
					text = this.clean.getPlainText(text, false);

					this.$editor.focus();

					if (this.utils.browser('msie'))
					{
						this.insert.htmlIe(text);
					}
					else
					{
						this.selection.get();

						this.range.deleteContents();
						var el = document.createElement("div");
						el.innerHTML = text;
						var frag = document.createDocumentFragment(), node, lastNode;
						while ((node = el.firstChild))
						{
							lastNode = frag.appendChild(node);
						}

						this.range.insertNode(frag);

						if (lastNode)
						{
							var range = this.range.cloneRange();
							range.setStartAfter(lastNode);
							range.collapse(true);
							this.sel.removeAllRanges();
							this.sel.addRange(range);
						}
					}

					this.code.sync();
					this.clean.clearUnverified();
				},
				htmlWithoutClean: function(html)
				{
					this.insert.html(html, false);
				},
				html: function(html, clean)
				{
					this.placeholder.remove();

					if (typeof clean == 'undefined') clean = true;

					this.$editor.focus();

					html = this.clean.setVerified(html);

					if (clean)
					{
						html = this.clean.onPaste(html);
					}

					if (this.utils.browser('msie'))
					{
						this.insert.htmlIe(html);
					}
					else
					{
						if (this.clean.singleLine) this.insert.execHtml(html);
						else document.execCommand('insertHTML', false, html);

						this.insert.htmlFixMozilla();

					}

					this.clean.normalizeLists();

					// remove empty paragraphs finaly
					if (!this.opts.linebreaks)
					{
						this.$editor.find('p').each($.proxy(this.utils.removeEmpty, this));
					}

					this.code.sync();
					this.observe.load();

					if (clean)
					{
						this.clean.clearUnverified();
					}

				},
				htmlFixMozilla: function()
				{
					// FF inserts empty p when content was selected dblclick
					if (!this.utils.browser('mozilla')) return;

					var $next = $(this.selection.getBlock()).next();
					if ($next.length > 0 && $next[0].tagName == 'P' && $next.html() === '')
					{
						$next.remove();
					}

				},
				htmlIe: function(html)
				{
					if (this.utils.isIe11())
					{
						var parent = this.utils.isCurrentOrParent('P');
						var $html = $('<div>').append(html);
						var blocksMatch = $html.contents().is('p, :header, dl, ul, ol, div, table, td, blockquote, pre, address, section, header, footer, aside, article');

						if (parent && blocksMatch) this.insert.ie11FixInserting(parent, html);
						else this.insert.ie11PasteFrag(html);

						return;
					}

					document.selection.createRange().pasteHTML(html);

				},
				execHtml: function(html)
				{
					html = this.clean.setVerified(html);

					this.selection.get();

					this.range.deleteContents();

					var el = document.createElement('div');
					el.innerHTML = html;

					var frag = document.createDocumentFragment(), node, lastNode;
					while ((node = el.firstChild))
					{
						lastNode = frag.appendChild(node);
					}

					this.range.insertNode(frag);

					this.range.collapse(true);
					this.caret.setAfter(lastNode);

				},
				node: function(node, deleteContents)
				{
					node = node[0] || node;

					var html = this.utils.getOuterHtml(node);
					html = this.clean.setVerified(html);

					if (html.match(/</g) !== null)
					{
						node = $(html)[0];
					}

					this.selection.get();

					if (deleteContents !== false)
					{
						this.range.deleteContents();
					}

					this.range.insertNode(node);
					this.range.collapse(false);
					this.selection.addRange();

					return node;
				},
				nodeToPoint: function(node, x, y)
				{
					node = node[0] || node;

					this.selection.get();

					var range;
					if (document.caretPositionFromPoint)
					{
					    var pos = document.caretPositionFromPoint(x, y);

					    this.range.setStart(pos.offsetNode, pos.offset);
					    this.range.collapse(true);
					    this.range.insertNode(node);
					}
					else if (document.caretRangeFromPoint)
					{
					    range = document.caretRangeFromPoint(x, y);
					    range.insertNode(node);
					}
					else if (typeof document.body.createTextRange != "undefined")
					{
				        range = document.body.createTextRange();
				        range.moveToPoint(x, y);
				        var endRange = range.duplicate();
				        endRange.moveToPoint(x, y);
				        range.setEndPoint("EndToEnd", endRange);
				        range.select();
					}
				},
				nodeToCaretPositionFromPoint: function(e, node)
				{
					node = node[0] || node;

					var range;
					var x = e.clientX, y = e.clientY;
					if (document.caretPositionFromPoint)
					{
					    var pos = document.caretPositionFromPoint(x, y);
					    var sel = document.getSelection();
					    range = sel.getRangeAt(0);
					    range.setStart(pos.offsetNode, pos.offset);
					    range.collapse(true);
					    range.insertNode(node);
					}
					else if (document.caretRangeFromPoint)
					{
					    range = document.caretRangeFromPoint(x, y);
					    range.insertNode(node);
					}
					else if (typeof document.body.createTextRange != "undefined")
					{
				        range = document.body.createTextRange();
				        range.moveToPoint(x, y);
				        var endRange = range.duplicate();
				        endRange.moveToPoint(x, y);
				        range.setEndPoint("EndToEnd", endRange);
				        range.select();
					}

				},
				ie11FixInserting: function(parent, html)
				{
					var node = document.createElement('span');
					node.className = 'redactor-ie-paste';
					this.insert.node(node);

					var parHtml = $(parent).html();

					parHtml = '<p>' + parHtml.replace(/<span class="redactor-ie-paste"><\/span>/gi, '</p>' + html + '<p>') + '</p>';
					$(parent).replaceWith(parHtml);
				},
				ie11PasteFrag: function(html)
				{
					this.selection.get();
					this.range.deleteContents();

					var el = document.createElement("div");
					el.innerHTML = html;

					var frag = document.createDocumentFragment(), node, lastNode;
					while ((node = el.firstChild))
					{
						lastNode = frag.appendChild(node);
					}

					this.range.insertNode(frag);
					this.range.collapse(false);
					this.selection.addRange();
				}
			};
		},
		keydown: function()
		{
			return {
				init: function(e)
				{
					if (this.rtePaste) return;

					var key = e.which;
					var arrow = (key >= 37 && key <= 40);

					this.keydown.ctrl = e.ctrlKey || e.metaKey;
					this.keydown.current = this.selection.getCurrent();
					this.keydown.parent = this.selection.getParent();
					this.keydown.block = this.selection.getBlock();

			        // detect tags
					this.keydown.pre = this.utils.isTag(this.keydown.current, 'pre');
					this.keydown.blockquote = this.utils.isTag(this.keydown.current, 'blockquote');
					this.keydown.figcaption = this.utils.isTag(this.keydown.current, 'figcaption');

					// shortcuts setup
					this.shortcuts.init(e, key);

					this.keydown.checkEvents(arrow, key);
					this.keydown.setupBuffer(e, key);
					this.keydown.addArrowsEvent(arrow);
					this.keydown.setupSelectAll(e, key);

					// callback
					var keydownStop = this.core.setCallback('keydown', e);
					if (keydownStop === false)
					{
						e.preventDefault();
						return false;
					}

					// ie and ff exit from table
					if (this.opts.enterKey && (this.utils.browser('msie') || this.utils.browser('mozilla')) && (key === this.keyCode.DOWN || key === this.keyCode.RIGHT))
					{
						var isEndOfTable = false;
						var $table = false;
						if (this.keydown.block && this.keydown.block.tagName === 'TD')
						{
							$table = $(this.keydown.block).closest('table');
						}

						if ($table && $table.find('td').last()[0] === this.keydown.block)
						{
							isEndOfTable = true;
						}

						if (this.utils.isEndOfElement() && isEndOfTable)
						{
							var node = $(this.opts.emptyHtml);
							$table.after(node);
							this.caret.setStart(node);
						}
					}

					// down
					if (this.opts.enterKey && key === this.keyCode.DOWN)
					{
						this.keydown.onArrowDown();
					}

					// turn off enter key
					if (!this.opts.enterKey && key === this.keyCode.ENTER)
					{
						e.preventDefault();
						// remove selected
						if (!this.range.collapsed) this.range.deleteContents();
						return;
					}

					// on enter
					if (key == this.keyCode.ENTER && !e.shiftKey && !e.ctrlKey && !e.metaKey)
					{
						var stop = this.core.setCallback('enter', e);
						if (stop === false)
						{
							e.preventDefault();
							return false;
						}

						if (this.keydown.blockquote && this.keydown.exitFromBlockquote(e) === true)
						{
							return false;
						}

						var current, $next;
						if (this.keydown.pre)
						{
							return this.keydown.insertNewLine(e);
						}
						else if (this.keydown.blockquote || this.keydown.figcaption)
						{
							current = this.selection.getCurrent();
							$next = $(current).next();

							if ($next.length !== 0 && $next[0].tagName == 'BR')
							{
								return this.keydown.insertBreakLine(e);
							}
							else if (this.utils.isEndOfElement() && (current && current != 'SPAN'))
							{
								return this.keydown.insertDblBreakLine(e);
							}
							else
							{
								return this.keydown.insertBreakLine(e);
							}
						}
						else if (this.opts.linebreaks && !this.keydown.block)
						{
							current = this.selection.getCurrent();
							$next = $(this.keydown.current).next();



							if ($next.length !== 0 && $next[0].tagName == 'BR')
							{
								return this.keydown.insertBreakLine(e);
							}
							else if (current !== false && $(current).hasClass('redactor-invisible-space'))
							{
								this.caret.setAfter(current);
								$(current).contents().unwrap();

								return this.keydown.insertDblBreakLine(e);
							}
							else
							{
								if (this.utils.isEndOfEditor())
								{
									return this.keydown.insertDblBreakLine(e);
								}
								else if ($next.length === 0 && current === false && typeof $next.context != 'undefined')
								{
									return this.keydown.insertBreakLine(e);
								}

								return this.keydown.insertBreakLine(e);
							}
						}
						else if (this.opts.linebreaks && this.keydown.block)
						{
							setTimeout($.proxy(this.keydown.replaceDivToBreakLine, this), 1);
						}
						// paragraphs
						else if (!this.opts.linebreaks && this.keydown.block)
						{
							if (this.keydown.block.tagName !== 'LI')
							{
								setTimeout($.proxy(this.keydown.replaceDivToParagraph, this), 1);
							}
							else
							{
								current = this.selection.getCurrent();
								var $parent = $(current).closest('li');
								var $list = $parent.closest('ul,ol');

								if ($parent.length !== 0 && this.utils.isEmpty($parent.html()) && $list.next().length === 0)
								{
									var node = $(this.opts.emptyHtml);
									$list.after(node);
									this.caret.setStart(node);

									return false;
								}
							}
						}
						else if (!this.opts.linebreaks && !this.keydown.block)
						{
							return this.keydown.insertParagraph(e);
						}
					}

					// Shift+Enter or Ctrl+Enter
					if (key === this.keyCode.ENTER && (e.ctrlKey || e.shiftKey))
					{
						return this.keydown.onShiftEnter(e);
					}


					// tab or cmd + [
					if (key === this.keyCode.TAB || e.metaKey && key === 221 || e.metaKey && key === 219)
					{
						return this.keydown.onTab(e, key);
					}

					// image delete and backspace
					if (key === this.keyCode.BACKSPACE || key === this.keyCode.DELETE)
					{
						if (this.utils.browser('mozilla') && this.keydown.current && this.keydown.current.tagName === 'TD')
						{
							e.preventDefault();
							return false;
						}

						var nodes = this.selection.getNodes();
						if (nodes)
						{
							var len = nodes.length;
							var last;
							for (var i = 0; i < len; i++)
							{
								var children = $(nodes[i]).children('img');
								if (children.length !== 0)
								{
									var self = this;
									$.each(children, function(z,s)
									{
										var $s = $(s);
										if ($s.css('float') != 'none') return;

										// image delete callback
										self.core.setCallback('imageDelete', s.src, $s);
										last = s;
									});
								}
								else if (nodes[i].tagName == 'IMG')
								{
									if (last != nodes[i])
									{
										// image delete callback
										this.core.setCallback('imageDelete', nodes[i].src, $(nodes[i]));
										last = nodes[i];
									}
								}
							}
						}
					}

					// backspace
					if (key === this.keyCode.BACKSPACE)
					{
						this.keydown.removeInvisibleSpace();
						this.keydown.removeEmptyListInTable(e);
					}

					this.code.sync();
				},
				checkEvents: function(arrow, key)
				{
					if (!arrow && (this.core.getEvent() == 'click' || this.core.getEvent() == 'arrow'))
					{
						this.core.addEvent(false);

						if (this.keydown.checkKeyEvents(key))
						{
							this.buffer.set();
						}
					}
				},
				checkKeyEvents: function(key)
				{
					var k = this.keyCode;
					var keys = [k.BACKSPACE, k.DELETE, k.ENTER, k.SPACE, k.ESC, k.TAB, k.CTRL, k.META, k.ALT, k.SHIFT];

					return ($.inArray(key, keys) == -1) ? true : false;

				},
				addArrowsEvent: function(arrow)
				{
					if (!arrow) return;

					if ((this.core.getEvent() == 'click' || this.core.getEvent() == 'arrow'))
					{
						this.core.addEvent(false);
						return;
					}

				    this.core.addEvent('arrow');
				},
				setupBuffer: function(e, key)
				{
					if (this.keydown.ctrl && key === 90 && !e.shiftKey && !e.altKey && this.opts.buffer.length) // z key
					{
						e.preventDefault();
						this.buffer.undo();
						return;
					}
					// undo
					else if (this.keydown.ctrl && key === 90 && e.shiftKey && !e.altKey && this.opts.rebuffer.length !== 0)
					{
						e.preventDefault();
						this.buffer.redo();
						return;
					}
					else if (!this.keydown.ctrl)
					{
						if (key == this.keyCode.BACKSPACE || key == this.keyCode.DELETE || (key == this.keyCode.ENTER && !e.ctrlKey && !e.shiftKey) || key == this.keyCode.SPACE)
						{
							this.buffer.set();
						}
					}
				},
				setupSelectAll: function(e, key)
				{
					if (this.keydown.ctrl && key === 65)
					{
						this.utils.enableSelectAll();
					}
					else if (key != this.keyCode.LEFT_WIN && !this.keydown.ctrl)
					{
						this.utils.disableSelectAll();
					}
				},
				onArrowDown: function()
				{
					var tags = [this.keydown.blockquote, this.keydown.pre, this.keydown.figcaption];

					for (var i = 0; i < tags.length; i++)
					{
						if (tags[i])
						{
							this.keydown.insertAfterLastElement(tags[i]);
							return false;
						}
					}
				},
				onShiftEnter: function(e)
				{
					this.buffer.set();

					if (this.utils.isEndOfElement())
					{
						return this.keydown.insertDblBreakLine(e);
					}

					return this.keydown.insertBreakLine(e);
				},
				onTab: function(e, key)
				{
					if (!this.opts.tabKey) return true;
					if (this.utils.isEmpty(this.code.get()) && this.opts.tabAsSpaces === false) return true;

					e.preventDefault();

					var node;
					if (this.keydown.pre && !e.shiftKey)
					{
						node = (this.opts.preSpaces) ? document.createTextNode(Array(this.opts.preSpaces + 1).join('\u00a0')) : document.createTextNode('\t');
						this.insert.node(node);
						this.code.sync();
					}
					else if (this.opts.tabAsSpaces !== false)
					{
						node = document.createTextNode(Array(this.opts.tabAsSpaces + 1).join('\u00a0'));
						this.insert.node(node);
						this.code.sync();
					}
					else
					{
						if (e.metaKey && key === 219) this.indent.decrease();
						else if (e.metaKey && key === 221) this.indent.increase();
						else if (!e.shiftKey) this.indent.increase();
						else this.indent.decrease();
					}

					return false;
				},
				replaceDivToBreakLine: function()
				{
					var blockElem = this.selection.getBlock();
					var blockHtml = blockElem.innerHTML.replace(/<br\s?\/?>/gi, '');
					if ((blockElem.tagName === 'DIV' || blockElem.tagName === 'P') && blockHtml === '' && !$(blockElem).hasClass('redactor-editor'))
					{
						var br = document.createElement('br');

						$(blockElem).replaceWith(br);
						this.caret.setBefore(br);

						this.code.sync();

						return false;
					}
				},
				replaceDivToParagraph: function()
				{
					var blockElem = this.selection.getBlock();
					var blockHtml = blockElem.innerHTML.replace(/<br\s?\/?>/gi, '');
					if (blockElem.tagName === 'DIV' && blockHtml === '' && !$(blockElem).hasClass('redactor-editor'))
					{
						var p = document.createElement('p');
						p.innerHTML = this.opts.invisibleSpace;

						$(blockElem).replaceWith(p);
						this.caret.setStart(p);

						this.code.sync();

						return false;
					}
					else if (this.opts.cleanStyleOnEnter && blockElem.tagName == 'P')
					{
						$(blockElem).removeAttr('class').removeAttr('style');
					}
				},
				insertParagraph: function(e)
				{
					e.preventDefault();

					this.selection.get();

					var p = document.createElement('p');
					p.innerHTML = this.opts.invisibleSpace;

					this.range.deleteContents();
					this.range.insertNode(p);

					this.caret.setStart(p);

					this.code.sync();

					return false;
				},
				exitFromBlockquote: function(e)
				{
					if (!this.utils.isEndOfElement()) return;

					var tmp = $.trim($(this.keydown.block).html());
					if (tmp.search(/(<br\s?\/?>){2}$/i) != -1)
					{
						e.preventDefault();

						if (this.opts.linebreaks)
						{
							var br = document.createElement('br');
							$(this.keydown.blockquote).after(br);

							this.caret.setBefore(br);
							$(this.keydown.block).html(tmp.replace(/<br\s?\/?>$/i, ''));
						}
						else
						{
							var node = $(this.opts.emptyHtml);
							$(this.keydown.blockquote).after(node);
							this.caret.setStart(node);
						}

						return true;

					}

					return;

				},
				insertAfterLastElement: function(element)
				{
					if (!this.utils.isEndOfElement()) return;

					this.buffer.set();

					if (this.opts.linebreaks)
					{
						var contents = $('<div>').append($.trim(this.$editor.html())).contents();
						var last = contents.last()[0];
						if (last.tagName == 'SPAN' && last.innerHTML === '')
						{
							last = contents.prev()[0];
						}

						if (this.utils.getOuterHtml(last) != this.utils.getOuterHtml(element)) return;

						var br = document.createElement('br');
						$(element).after(br);
						this.caret.setAfter(br);

					}
					else
					{
						if (this.$editor.contents().last()[0] !== element) return;

						var node = $(this.opts.emptyHtml);
						$(element).after(node);
						this.caret.setStart(node);
					}
				},
				insertNewLine: function(e)
				{
					e.preventDefault();

					var node = document.createTextNode('\n');

					this.selection.get();

					this.range.deleteContents();
					this.range.insertNode(node);

					this.caret.setAfter(node);

					this.code.sync();

					return false;
				},
				insertBreakLine: function(e)
				{
					return this.keydown.insertBreakLineProcessing(e);
				},
				insertDblBreakLine: function(e)
				{
					return this.keydown.insertBreakLineProcessing(e, true);
				},
				insertBreakLineProcessing: function(e, dbl)
				{
					e.stopPropagation();

					this.selection.get();
					var br1 = document.createElement('br');

					if (this.utils.browser('msie'))
					{
						this.range.collapse(false);
						this.range.setEnd(this.range.endContainer, this.range.endOffset);
					}
					else
					{
						this.range.deleteContents();
					}

					this.range.insertNode(br1);

					if (dbl === true)
					{

						var $next = $(br1).next();
						if ($next.length !== 0 && $next[0].tagName === 'BR' && this.utils.isEndOfEditor())
						{
							this.caret.setAfter(br1);
							this.code.sync();
							return false;
						}

						var br2 = document.createElement('br');
						this.range.insertNode(br2);
						this.caret.setAfter(br2);
					}
					else
					{
						this.keydown.insertBreakLineProcessingAfter(br1);
					}

					this.code.sync();
					return false;
				},
				insertBreakLineProcessingAfter: function(node)
				{
					var space = this.utils.createSpaceElement();
					$(node).after(space);
					this.selection.selectElement(space);

					$(space).replaceWith(function()
					{
						return $(this).contents();
					});
				},
				removeInvisibleSpace: function()
				{
					var $current = $(this.keydown.current);
					if ($current.text().search(/^\u200B$/g) === 0)
					{
						$current.remove();
					}
				},
				removeEmptyListInTable: function(e)
				{
					var $current = $(this.keydown.current);
					var $parent = $(this.keydown.parent);
					var td = $current.closest('td');

					if (td.length !== 0 && $current.closest('li') && $parent.children('li').length === 1)
					{
						if (!this.utils.isEmpty($current.text())) return;

						e.preventDefault();

						$current.remove();
						$parent.remove();

						this.caret.setStart(td);
					}
				}
			};
		},
		keyup: function()
		{
			return {
				init: function(e)
				{
					if (this.rtePaste) return;

					var key = e.which;

					this.keyup.current = this.selection.getCurrent();
					this.keyup.parent = this.selection.getParent();
					var $parent = this.utils.isRedactorParent($(this.keyup.parent).parent());

					// callback
					var keyupStop = this.core.setCallback('keyup', e);
					if (keyupStop === false)
					{
						e.preventDefault();
						return false;
					}

					// replace to p before / after the table or body
					if (!this.opts.linebreaks && this.keyup.current.nodeType == 3 && this.keyup.current.length <= 1 && (this.keyup.parent === false || this.keyup.parent.tagName == 'BODY'))
					{
						this.keyup.replaceToParagraph();
					}

					// replace div after lists
					if (!this.opts.linebreaks && this.utils.isRedactorParent(this.keyup.current) && this.keyup.current.tagName === 'DIV')
					{
						this.keyup.replaceToParagraph(false);
					}


					if (!this.opts.linebreaks && $(this.keyup.parent).hasClass('redactor-invisible-space') && ($parent === false || $parent[0].tagName == 'BODY'))
					{
						$(this.keyup.parent).contents().unwrap();
						this.keyup.replaceToParagraph();
					}

					// linkify
					if (this.keyup.isLinkify(key))
					{
						this.formatLinkify(this.opts.linkProtocol, this.opts.convertLinks, this.opts.convertUrlLinks, this.opts.convertImageLinks, this.opts.convertVideoLinks, this.opts.linkSize);

						this.observe.load();
						this.code.sync();
					}

					if (key === this.keyCode.DELETE || key === this.keyCode.BACKSPACE)
					{
						// clear unverified
						this.clean.clearUnverified();

						if (this.observe.image)
						{
							e.preventDefault();

							this.image.hideResize();

							this.buffer.set();
							this.image.remove(this.observe.image);
							this.observe.image = false;

							return false;
						}

						// remove empty paragraphs
						this.$editor.find('p').each($.proxy(this.utils.removeEmpty, this));

						// remove invisible space
						if (this.opts.linebreaks && this.keyup.current && this.keyup.current.tagName == 'DIV' && this.utils.isEmpty(this.keyup.current.innerHTML))
						{
							$(this.keyup.current).after(this.selection.getMarkerAsHtml());
							this.selection.restore();
							$(this.keyup.current).remove();
						}

						// if empty
						return this.keyup.formatEmpty(e);
					}
				},
				isLinkify: function(key)
				{
					return this.opts.convertLinks && (this.opts.convertUrlLinks || this.opts.convertImageLinks || this.opts.convertVideoLinks) && key === this.keyCode.ENTER && !this.utils.isCurrentOrParent('PRE');
				},
				replaceToParagraph: function(clone)
				{
					var $current = $(this.keyup.current);

					var node;
					if (clone === false)
					{
						node = $('<p>').append($current.html());
					}
					else
					{
						node = $('<p>').append($current.clone());
					}

					$current.replaceWith(node);
					var next = $(node).next();
					if (typeof(next[0]) !== 'undefined' && next[0].tagName == 'BR')
					{
						next.remove();
					}

					this.caret.setEnd(node);
				},
				formatEmpty: function(e)
				{
					var html = $.trim(this.$editor.html());

					if (!this.utils.isEmpty(html)) return;

					e.preventDefault();

					if (this.opts.linebreaks)
					{
						this.$editor.html(this.selection.getMarkerAsHtml());
						this.selection.restore();
					}
					else
					{
						html = '<p><br /></p>';

						this.$editor.html(html);
						this.focus.setStart();
					}

					this.code.sync();

					return false;
				}
			};
		},
		lang: function()
		{
			return {
				load: function()
				{
					this.opts.curLang = this.opts.langs[this.opts.lang];
				},
				get: function(name)
				{
					return (typeof this.opts.curLang[name] != 'undefined') ? this.opts.curLang[name] : '';
				}
			};
		},
		line: function()
		{
			return {
				insert: function()
				{
					this.buffer.set();

					var blocks = this.selection.getBlocks();
 					if (blocks[0] !== false && this.line.isExceptLastOrFirst(blocks))
	 				{
	 					if (!this.utils.browser('msie')) this.$editor.focus();
	 					return;
					}

					if (this.utils.browser('msie'))
					{
						this.line.insertInIe();
					}
					else
					{
						this.line.insertInOthersBrowsers();
					}
				},
				isExceptLastOrFirst: function(blocks)
				{
					var exceptTags = ['li', 'td', 'th', 'blockquote', 'figcaption', 'pre', 'dl', 'dt', 'dd'];

					var first = blocks[0].tagName.toLowerCase();
					var last = this.selection.getLastBlock();

					last = (typeof last == 'undefined') ? first : last.tagName.toLowerCase();

					var firstFound = $.inArray(first, exceptTags) != -1;
					var lastFound = $.inArray(last, exceptTags) != -1;

					if ((firstFound && lastFound) || firstFound)
					{
						return true;
					}
				},
				insertInIe: function()
				{
					this.utils.saveScroll();
					this.buffer.set();

					this.insert.node(document.createElement('hr'));

					this.utils.restoreScroll();
					this.code.sync();
				},
				insertInOthersBrowsers: function()
				{
					this.buffer.set();

					var extra = '<p id="redactor-insert-line"><br /></p>';
					if (this.opts.linebreaks) extra = '<br id="redactor-insert-line">';

					document.execCommand('insertHTML', false, '<hr>' + extra);

					this.line.setFocus();
					this.code.sync();
				},
				setFocus: function()
				{
					var node = this.$editor.find('#redactor-insert-line');
					var next = $(node).next()[0];

					if (next)
					{
						this.caret.setAfter(node);
						node.remove();
					}
					else
					{
						node.removeAttr('id');
					}
				}
			};
		},
		link: function()
		{
			return {
				show: function(e)
				{
					if (typeof e != 'undefined' && e.preventDefault) e.preventDefault();

					this.modal.load('link', this.lang.get('link_insert'), 600);

					this.modal.createCancelButton();
					this.link.buttonInsert = this.modal.createActionButton(this.lang.get('insert'));

					this.selection.get();

					this.link.getData();
					this.link.cleanUrl();

					if (this.link.target == '_blank') $('#redactor-link-blank').prop('checked', true);

					this.link.$inputUrl = $('#redactor-link-url');
					this.link.$inputText = $('#redactor-link-url-text');

					this.link.$inputText.val(this.link.text);
					this.link.$inputUrl.val(this.link.url);

					this.link.buttonInsert.on('click', $.proxy(this.link.insert, this));

					// hide link's tooltip
					$('.redactor-link-tooltip').remove();

					// show modal
					this.selection.save();
					this.modal.show();
					this.link.$inputUrl.focus();
				},
				cleanUrl: function()
				{
					var thref = self.location.href.replace(/\/$/i, '');
					this.link.url = this.link.url.replace(thref, '');
					this.link.url = this.link.url.replace(/^\/#/, '#');
					this.link.url = this.link.url.replace('mailto:', '');

					// remove host from href
					if (!this.opts.linkProtocol)
					{
						var re = new RegExp('^(http|ftp|https)://' + self.location.host, 'i');
						this.link.url = this.link.url.replace(re, '');
					}

				},
				getData: function()
				{
					this.link.$node = false;

					var $el = $(this.selection.getCurrent()).closest('a');
					if ($el.length !== 0 && $el[0].tagName === 'A')
					{
						this.link.$node = $el;

						this.link.url = $el.attr('href');
						this.link.text = $el.text();
						this.link.target = $el.attr('target');
					}
					else
					{
						this.link.text = this.sel.toString();
						this.link.url = '';
						this.link.target = '';
					}

				},
				insert: function()
				{
					var target = '';
					var link = this.link.$inputUrl.val();
					var text = this.link.$inputText.val();

					if ($.trim(link) === '')
					{
						this.link.$inputUrl.addClass('redactor-input-error').on('keyup', function()
						{
							$(this).removeClass('redactor-input-error');
							$(this).off('keyup');

						});

						return;
					}

					// mailto
					if (link.search('@') != -1 && /(http|ftp|https):\/\//i.test(link) === false)
					{
						link = 'mailto:' + link;
					}
					// url, not anchor
					else if (link.search('#') !== 0)
					{
						if ($('#redactor-link-blank').prop('checked'))
						{
							target = '_blank';
						}

						// test url (add protocol)
						var pattern = '((xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,}';
						var re = new RegExp('^(http|ftp|https)://' + pattern, 'i');
						var re2 = new RegExp('^' + pattern, 'i');
						var re3 = new RegExp('\.(html|php)$', 'i');
						if (link.search(re) == -1 && link.search(re3) == -1 && link.search(re2) === 0 && this.opts.linkProtocol)
						{
							link = this.opts.linkProtocol + '://' + link;
						}
					}

					this.link.set(text, link, target);
					this.modal.close();
				},
				set: function(text, link, target)
				{
					text = $.trim(text.replace(/<|>/g, ''));

					this.selection.restore();

					if (text === '' && link === '') return;
					if (text === '' && link !== '') text = link;

					if (this.link.$node)
					{
						this.buffer.set();

						this.link.$node.text(text).attr('href', link);
						if (target !== '')
						{
							this.link.$node.attr('target', target);
						}
						else
						{
							this.link.$node.removeAttr('target');
						}

						this.code.sync();
					}
					else
					{
						if (this.utils.browser('mozilla') && this.link.text === '')
						{
							var $a = $('<a />').attr('href', link).text(text);
							if (target !== '') $a.attr('target', target);

							this.insert.node($a);
							this.selection.selectElement($a);
						}
						else
						{
							var $a;
							if (this.utils.browser('msie'))
							{
								$a = $('<a href="' + link + '">').text(text);
								if (target !== '') $a.attr('target', target);

								$a = $(this.insert.node($a));
								this.selection.selectElement($a);
							}
							else
							{
								document.execCommand('createLink', false, link);

								$a = $(this.selection.getCurrent()).closest('a');
								if (this.utils.browser('mozilla'))
								{
									$a = $('a[_moz_dirty=""]');
								}

								if (target !== '') $a.attr('target', target);
								$a.removeAttr('style').removeAttr('_moz_dirty');

								if (this.link.text !== '' || this.link.text != text)
								{

									$a.text(text);
									this.selection.selectElement($a);
								}
							}
						}

						this.code.sync();
						this.core.setCallback('insertedLink', $a);

					}

					// link tooltip
					setTimeout($.proxy(function()
					{
						this.observe.links();

					}, this), 5);
				},
				unlink: function(e)
				{
					if (typeof e != 'undefined' && e.preventDefault)
					{
						e.preventDefault();
					}

					var nodes = this.selection.getNodes();
					if (!nodes) return;

					this.buffer.set();

					var len = nodes.length;
					for (var i = 0; i < len; i++)
					{
						var $node = $(nodes[i]).closest('a');
						$node.replaceWith($node.contents());
					}

					// hide link's tooltip
					$('.redactor-link-tooltip').remove();

					this.code.sync();

				},
				toggleClass: function(className)
				{
					this.link.setClass(className, 'toggleClass');
				},
				addClass: function(className)
				{
					this.link.setClass(className, 'addClass');
				},
				removeClass: function(className)
				{
					this.link.setClass(className, 'removeClass');
				},
				setClass: function(className, func)
				{
					var links = this.selection.getInlinesTags(['a']);
					if (links === false) return;

					$.each(links, function()
					{
						$(this)[func](className);
					});
				}
			};
		},
		list: function()
		{
			return {
				toggle: function(cmd)
				{
					this.placeholder.remove();
					if (!this.utils.browser('msie')) this.$editor.focus();

					this.buffer.set();
					this.selection.save();

					var parent = this.selection.getParent();
					var $list = $(parent).closest('ol, ul');

					if (!this.utils.isRedactorParent($list) && $list.length !== 0)
					{
						$list = false;
					}

					var isUnorderedCmdOrdered, isOrderedCmdUnordered;
					var remove = false;
					if ($list && $list.length)
					{
						remove = true;
						var listTag = $list[0].tagName;

						isUnorderedCmdOrdered = (cmd === 'orderedlist' && listTag === 'UL');
						isOrderedCmdUnordered = (cmd === 'unorderedlist' && listTag === 'OL');
					}

					if (isUnorderedCmdOrdered)
					{
						this.utils.replaceToTag($list, 'ol');
					}
					else if (isOrderedCmdUnordered)
					{
						this.utils.replaceToTag($list, 'ul');
					}
					else
					{
						if (remove)
						{
							this.list.remove(cmd);
						}
						else
						{
							this.list.insert(cmd);
						}
					}


					this.selection.restore();
					this.code.sync();
				},
				insert: function(cmd)
				{
					var parent = this.selection.getParent();
					var current = this.selection.getCurrent();
					var $td = $(current).closest('td, th');

					if (this.utils.browser('msie') && this.opts.linebreaks)
					{
						this.list.insertInIe(cmd);
					}
					else
					{
						document.execCommand('insert' + cmd);
					}

					var $list = $(this.selection.getParent()).closest('ol, ul');

					if ($td.length !== 0)
					{
						var prev = $td.prev();
						var html = $td.html();
						$td.html('');
						if (prev && prev.length === 1 && (prev[0].tagName === 'TD' || prev[0].tagName === 'TH'))
						{
							$(prev).after($td);
						}
						else
						{
							$(parent).prepend($td);
						}

						$td.html(html);
					}

					if (this.utils.isEmpty($list.find('li').text()))
					{
						var $children = $list.children('li');
						$children.find('br').remove();
						$children.append(this.selection.getMarkerAsHtml());
					}

					if ($list.length)
					{
						// remove block-element list wrapper
						var $listParent = $list.parent();
						if (this.utils.isRedactorParent($listParent) && $listParent[0].tagName != 'LI' && this.utils.isBlock($listParent[0]))
						{
							$listParent.replaceWith($listParent.contents());
						}
					}

					if (!this.utils.browser('msie'))
					{
						this.$editor.focus();
					}

					this.clean.clearUnverified();
				},
				insertInIe: function(cmd)
				{
					var wrapper = this.selection.wrap('div');
					var wrapperHtml = $(wrapper).html();

					var tmpList = (cmd == 'orderedlist') ? $('<ol>') : $('<ul>');
					var tmpLi = $('<li>');

					if ($.trim(wrapperHtml) === '')
					{
						tmpLi.append(this.selection.getMarkerAsHtml());
						tmpList.append(tmpLi);
						this.$editor.find('#selection-marker-1').replaceWith(tmpList);
					}
					else
					{
						var items = wrapperHtml.split(/<br\s?\/?>/gi);
						if (items)
						{
							for (var i = 0; i < items.length; i++)
							{
								if ($.trim(items[i]) !== '')
								{
									tmpList.append($('<li>').html(items[i]));
								}
							}
						}
						else
						{
							tmpLi.append(wrapperHtml);
							tmpList.append(tmpLi);
						}

						$(wrapper).replaceWith(tmpList);
					}
				},
				remove: function(cmd)
				{
					document.execCommand('insert' + cmd);

					var $current = $(this.selection.getCurrent());

					this.indent.fixEmptyIndent();

					if (!this.opts.linebreaks && $current.closest('li, th, td').length === 0)
					{
						document.execCommand('formatblock', false, 'p');
						this.$editor.find('ul, ol, blockquote').each($.proxy(this.utils.removeEmpty, this));
					}

					var $table = $(this.selection.getCurrent()).closest('table');
					var $prev = $table.prev();
					if (!this.opts.linebreaks && $table.length !== 0 && $prev.length !== 0 && $prev[0].tagName == 'BR')
					{
						$prev.remove();
					}

					this.clean.clearUnverified();

				}
			};
		},
		modal: function()
		{
			return {
				callbacks: {},
				loadTemplates: function()
				{
					this.opts.modal = {
						imageEdit: String()
						+ '<section id="redactor-modal-image-edit">'
							+ '<label>' + this.lang.get('title') + '</label>'
							+ '<input type="text" id="redactor-image-title" />'
							+ '<label class="redactor-image-link-option">' + this.lang.get('link') + '</label>'
							+ '<input type="text" id="redactor-image-link" class="redactor-image-link-option" />'
							+ '<label class="redactor-image-link-option"><input type="checkbox" id="redactor-image-link-blank"> ' + this.lang.get('link_new_tab') + '</label>'
							+ '<label class="redactor-image-position-option">' + this.lang.get('image_position') + '</label>'
							+ '<select class="redactor-image-position-option" id="redactor-image-align">'
								+ '<option value="none">' + this.lang.get('none') + '</option>'
								+ '<option value="left">' + this.lang.get('left') + '</option>'
								+ '<option value="center">' + this.lang.get('center') + '</option>'
								+ '<option value="right">' + this.lang.get('right') + '</option>'
							+ '</select>'
						+ '</section>',

						image: String()
						+ '<section id="redactor-modal-image-insert">'
							+ '<div id="redactor-modal-image-droparea"></div>'
 						+ '</section>',

						file: String()
						+ '<section id="redactor-modal-file-insert">'
							+ '<div id="redactor-modal-file-upload-box">'
								+ '<label>' + this.lang.get('filename') + '</label>'
								+ '<input type="text" id="redactor-filename" /><br><br>'
								+ '<div id="redactor-modal-file-upload"></div>'
							+ '</div>'
						+ '</section>',

						link: String()
						+ '<section id="redactor-modal-link-insert">'
							+ '<label>URL</label>'
							+ '<input type="url" id="redactor-link-url" />'
							+ '<label>' + this.lang.get('text') + '</label>'
							+ '<input type="text" id="redactor-link-url-text" />'
							+ '<label><input type="checkbox" id="redactor-link-blank"> ' + this.lang.get('link_new_tab') + '</label>'
						+ '</section>'
					};


					$.extend(this.opts, this.opts.modal);

				},
				addCallback: function(name, callback)
				{
					this.modal.callbacks[name] = callback;
				},
				createTabber: function($modal)
				{
					this.modal.$tabber = $('<div>').attr('id', 'redactor-modal-tabber');

					$modal.prepend(this.modal.$tabber);
				},
				addTab: function(id, name, active)
				{
					var $tab = $('<a href="#" rel="tab' + id + '">').text(name);
					if (active)
					{
						$tab.addClass('active');
					}

					var self = this;
					$tab.on('click', function(e)
					{
						e.preventDefault();
						$('.redactor-tab').hide();
						$('.redactor-' + $(this).attr('rel')).show();

						self.modal.$tabber.find('a').removeClass('active');
						$(this).addClass('active');

					});

					this.modal.$tabber.append($tab);
				},
				addTemplate: function(name, template)
				{
					this.opts.modal[name] = template;
				},
				getTemplate: function(name)
				{
					return this.opts.modal[name];
				},
				getModal: function()
				{
					return this.$modalBody.find('section');
				},
				load: function(templateName, title, width)
				{
					this.modal.templateName = templateName;
					this.modal.width = width;

					this.modal.build();
					this.modal.enableEvents();
					this.modal.setTitle(title);
					this.modal.setDraggable();
					this.modal.setContent();

					// callbacks
					if (typeof this.modal.callbacks[templateName] != 'undefined')
					{
						this.modal.callbacks[templateName].call(this);
					}

				},
				show: function()
				{
					// ios keyboard hide
					if (this.utils.isMobile() && !this.utils.browser('msie'))
					{
						document.activeElement.blur();
					}

					$(document.body).removeClass('body-redactor-hidden');
					this.modal.bodyOveflow = $(document.body).css('overflow');
					$(document.body).css('overflow', 'hidden');

					if (this.utils.isMobile())
					{
						this.modal.showOnMobile();
					}
					else
					{
						this.modal.showOnDesktop();
					}

					this.$modalOverlay.show();
					this.$modalBox.show();

					this.modal.setButtonsWidth();

					this.utils.saveScroll();

					// resize
					if (!this.utils.isMobile())
					{
						setTimeout($.proxy(this.modal.showOnDesktop, this), 0);
						$(window).on('resize.redactor-modal', $.proxy(this.modal.resize, this));
					}

					// modal shown callback
					this.core.setCallback('modalOpened', this.modal.templateName, this.$modal);

					// fix bootstrap modal focus
					$(document).off('focusin.modal');

					// enter
					this.$modal.find('input[type=text],input[type=url],input[type=email]').on('keydown.redactor-modal', $.proxy(this.modal.setEnter, this));
				},
				showOnDesktop: function()
				{
					var height = this.$modal.outerHeight();
					var windowHeight = $(window).height();
					var windowWidth = $(window).width();

					if (this.modal.width > windowWidth)
					{
						this.$modal.css({
							width: '96%',
							marginTop: (windowHeight/2 - height/2) + 'px'
						});
						return;
					}

					if (height > windowHeight)
					{
						this.$modal.css({
							width: this.modal.width + 'px',
							marginTop: '20px'
						});
					}
					else
					{
						this.$modal.css({
							width: this.modal.width + 'px',
							marginTop: (windowHeight/2 - height/2) + 'px'
						});
					}
				},
				showOnMobile: function()
				{
					this.$modal.css({
						width: '96%',
						marginTop: '2%'
					});

				},
				resize: function()
				{
					if (this.utils.isMobile())
					{
						this.modal.showOnMobile();
					}
					else
					{
						this.modal.showOnDesktop();
					}
				},
				setTitle: function(title)
				{
					this.$modalHeader.html(title);
				},
				setContent: function()
				{
					this.$modalBody.html(this.modal.getTemplate(this.modal.templateName));
				},
				setDraggable: function()
				{
					if (typeof $.fn.draggable === 'undefined') return;

					this.$modal.draggable({ handle: this.$modalHeader });
					this.$modalHeader.css('cursor', 'move');
				},
				setEnter: function(e)
				{
					if (e.which != 13) return;

					e.preventDefault();
					this.$modal.find('button.redactor-modal-action-btn').click();
				},
				createCancelButton: function()
				{
					var button = $('<button>').addClass('redactor-modal-btn redactor-modal-close-btn').html(this.lang.get('cancel'));
					button.on('click', $.proxy(this.modal.close, this));

					this.$modalFooter.append(button);
				},
				createDeleteButton: function(label)
				{
					return this.modal.createButton(label, 'delete');
				},
				createActionButton: function(label)
				{
					return this.modal.createButton(label, 'action');
				},
				createButton: function(label, className)
				{
					var button = $('<button>').addClass('redactor-modal-btn').addClass('redactor-modal-' + className + '-btn').html(label);
					this.$modalFooter.append(button);

					return button;
				},
				setButtonsWidth: function()
				{
					var buttons = this.$modalFooter.find('button');
					var buttonsSize = buttons.length;
					if (buttonsSize === 0) return;

					buttons.css('width', (100/buttonsSize) + '%');
				},
				build: function()
				{
					this.modal.buildOverlay();

					this.$modalBox = $('<div id="redactor-modal-box" />').hide();
					this.$modal = $('<div id="redactor-modal" />');
					this.$modalHeader = $('<header />');
					this.$modalClose = $('<span id="redactor-modal-close" />').html('&times;');
					this.$modalBody = $('<div id="redactor-modal-body" />');
					this.$modalFooter = $('<footer />');

					this.$modal.append(this.$modalHeader);
					this.$modal.append(this.$modalClose);
					this.$modal.append(this.$modalBody);
					this.$modal.append(this.$modalFooter);
					this.$modalBox.append(this.$modal);
					this.$modalBox.appendTo(document.body);
				},
				buildOverlay: function()
				{
					this.$modalOverlay = $('<div id="redactor-modal-overlay">').hide();
					$('body').prepend(this.$modalOverlay);
				},
				enableEvents: function()
				{
					this.$modalClose.on('click.redactor-modal', $.proxy(this.modal.close, this));
					$(document).on('keyup.redactor-modal', $.proxy(this.modal.closeHandler, this));
					this.$editor.on('keyup.redactor-modal', $.proxy(this.modal.closeHandler, this));
					this.$modalBox.on('click.redactor-modal', $.proxy(this.modal.close, this));
				},
				disableEvents: function()
				{
					this.$modalClose.off('click.redactor-modal');
					$(document).off('keyup.redactor-modal');
					this.$editor.off('keyup.redactor-modal');
					this.$modalBox.off('click.redactor-modal');
					$(window).off('resize.redactor-modal');
				},
				closeHandler: function(e)
				{
					if (e.which != this.keyCode.ESC) return;

					this.modal.close(false);
				},
				close: function(e)
				{
					if (e)
					{
						if (!$(e.target).hasClass('redactor-modal-close-btn') && e.target != this.$modalClose[0] && e.target != this.$modalBox[0])
						{
							return;
						}

						e.preventDefault();
					}

					if (!this.$modalBox) return;

					this.modal.disableEvents();

					this.$modalOverlay.remove();

					this.$modalBox.fadeOut('fast', $.proxy(function()
					{
						this.$modalBox.remove();

						setTimeout($.proxy(this.utils.restoreScroll, this), 0);

						if (e !== undefined) this.selection.restore();

						$(document.body).css('overflow', this.modal.bodyOveflow);
						this.core.setCallback('modalClosed', this.modal.templateName);

					}, this));

				}
			};
		},
		observe: function()
		{
			return {
				load: function()
				{
					this.observe.images();
					this.observe.links();
				},
				buttons: function(e, btnName)
				{
					var current = this.selection.getCurrent();
					var parent = this.selection.getParent();

					if (e !== false)
					{
						this.button.setInactiveAll();
					}
					else
					{
						this.button.setInactiveAll(btnName);
					}

					if (e === false && btnName !== 'html')
					{
						if ($.inArray(btnName, this.opts.activeButtons) != -1) this.button.toggleActive(btnName);
						return;
					}

					//var linkButtonName = (this.utils.isCurrentOrParent('A')) ? this.lang.get('link_edit') : this.lang.get('link_insert');
					//$('body').find('a.redactor-dropdown-link').text(linkButtonName);

					$.each(this.opts.activeButtonsStates, $.proxy(function(key, value)
					{
						var parentEl = $(parent).closest(key);
						var currentEl = $(current).closest(key);

						if (parentEl.length !== 0 && !this.utils.isRedactorParent(parentEl)) return;
						if (!this.utils.isRedactorParent(currentEl)) return;
						if (parentEl.length !== 0 || currentEl.closest(key).length !== 0)
						{
							this.button.setActive(value);
						}

					}, this));

					var $parent = $(parent).closest(this.opts.alignmentTags.toString().toLowerCase());
					if (this.utils.isRedactorParent(parent) && $parent.length)
					{
						var align = ($parent.css('text-align') === '') ? 'left' : $parent.css('text-align');
						this.button.setActive('align' + align);
					}
				},
				addButton: function(tag, btnName)
				{
					this.opts.activeButtons.push(btnName);
					this.opts.activeButtonsStates[tag] = btnName;
				},
				images: function()
				{
					this.$editor.find('img').each($.proxy(function(i, img)
					{
						var $img = $(img);

						// IE fix (when we clicked on an image and then press backspace IE does goes to image's url)
						$img.closest('a').on('click', function(e) { e.preventDefault(); });

						if (this.utils.browser('msie')) $img.attr('unselectable', 'on');

						this.image.setEditable($img);

					}, this));

					$(document).on('click.redactor-image-delete.' + this.uuid, $.proxy(function(e)
					{
						this.observe.image = false;
						if (e.target.tagName == 'IMG' && this.utils.isRedactorParent(e.target))
						{
							this.observe.image = (this.observe.image && this.observe.image == e.target) ? false : e.target;
						}

					}, this));

				},
				links: function()
				{
					if (!this.opts.linkTooltip) return;

					this.$editor.find('a').on('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid, $.proxy(this.observe.showTooltip, this));
					this.$editor.on('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid, $.proxy(this.observe.closeTooltip, this));
					$(document).on('touchstart.redactor.' + this.uuid + ' click.redactor.' + this.uuid, $.proxy(this.observe.closeTooltip, this));
				},
				getTooltipPosition: function($link)
				{
					return $link.offset();
				},
				showTooltip: function(e)
				{
					var $link = $(e.target);
					var $parent = $link.closest('a');
					var tag = ($link.length !== 0) ? $link[0].tagName : false;

					if ($parent[0].tagName === 'A')
					{
						if (tag === 'IMG') return;
						else if (tag !== 'A') $link = $parent;
					}

					if (tag !== 'A')
					{
						return;
					}

					var pos = this.observe.getTooltipPosition($link);
					var tooltip = $('<span class="redactor-link-tooltip"></span>');

					var href = $link.attr('href');
					if (href === undefined)
					{
						href = '';
					}

					if (href.length > 24) href = href.substring(0, 24) + '...';

					var aLink = $('<a href="' + $link.attr('href') + '" target="_blank" />').html(href).addClass('redactor-link-tooltip-action');
					var aEdit = $('<a href="#" />').html(this.lang.get('edit')).on('click', $.proxy(this.link.show, this)).addClass('redactor-link-tooltip-action');
					var aUnlink = $('<a href="#" />').html(this.lang.get('unlink')).on('click', $.proxy(this.link.unlink, this)).addClass('redactor-link-tooltip-action');

					tooltip.append(aLink).append(' | ').append(aEdit).append(' | ').append(aUnlink);
					tooltip.css({
						top: (pos.top + parseInt($link.css('line-height'), 10)) + 'px',
						left: pos.left + 'px'
					});

					$('.redactor-link-tooltip').remove();
					$('body').append(tooltip);
				},
				closeTooltip: function(e)
				{
					e = e.originalEvent || e;

					var target = e.target;
					var $parent = $(target).closest('a');
					if ($parent.length !== 0 && $parent[0].tagName === 'A' && target.tagName !== 'A')
					{
						return;
					}
					else if ((target.tagName === 'A' && this.utils.isRedactorParent(target)) || $(target).hasClass('redactor-link-tooltip-action'))
					{
						return;
					}

					$('.redactor-link-tooltip').remove();
				}

			};
		},
		paragraphize: function()
		{
			return {
				load: function(html)
				{
					if (this.opts.linebreaks) return html;
					if (html === '' || html === '<p></p>') return this.opts.emptyHtml;

					this.paragraphize.blocks = ['table', 'div', 'pre', 'form', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dl', 'blockquote', 'figcaption',
					'address', 'section', 'header', 'footer', 'aside', 'article', 'object', 'style', 'script', 'iframe', 'select', 'input', 'textarea',
					'button', 'option', 'map', 'area', 'math', 'hr', 'fieldset', 'legend', 'hgroup', 'nav', 'figure', 'details', 'menu', 'summary', 'p'];

					html = html + "\n";

					this.paragraphize.safes = [];
					this.paragraphize.z = 0;

					html = html.replace(/(<br\s?\/?>){1,}\n?<\/blockquote>/gi, '</blockquote>');

					html = this.paragraphize.getSafes(html);
					html = this.paragraphize.getSafesComments(html);
					html = this.paragraphize.replaceBreaksToNewLines(html);
					html = this.paragraphize.replaceBreaksToParagraphs(html);
					html = this.paragraphize.clear(html);
					html = this.paragraphize.restoreSafes(html);

					html = html.replace(new RegExp('<br\\s?/?>\n?<(' + this.paragraphize.blocks.join('|') + ')(.*?[^>])>', 'gi'), '<p><br /></p>\n<$1$2>');

					return $.trim(html);
				},
				getSafes: function(html)
				{
					var $div = $('<div />').append(html);

					// remove paragraphs in blockquotes
					$div.find('blockquote p').replaceWith(function()
					{
						return $(this).append('<br />').contents();
					});

					html = $div.html();

					$div.find(this.paragraphize.blocks.join(', ')).each($.proxy(function(i,s)
					{
						this.paragraphize.z++;
						this.paragraphize.safes[this.paragraphize.z] = s.outerHTML;
						html = html.replace(s.outerHTML, '\n{replace' + this.paragraphize.z + '}');

					}, this));

					return html;
				},
				getSafesComments: function(html)
				{
					var commentsMatches = html.match(/<!--([\w\W]*?)-->/gi);

					if (!commentsMatches) return html;

					$.each(commentsMatches, $.proxy(function(i,s)
					{
						this.paragraphize.z++;
						this.paragraphize.safes[this.paragraphize.z] = s;
						html = html.replace(s, '\n{replace' + this.paragraphize.z + '}');
					}, this));

					return html;
				},
				restoreSafes: function(html)
				{
					$.each(this.paragraphize.safes, function(i,s)
					{
						s = (typeof s !== 'undefined') ? s.replace(/\$/g, '&#36;') : s;
						html = html.replace('{replace' + i + '}', s);

					});

					return html;
				},
				replaceBreaksToParagraphs: function(html)
				{
					var htmls = html.split(new RegExp('\n', 'g'), -1);

					html = '';
					if (htmls)
					{
						var len = htmls.length;
						for (var i = 0; i < len; i++)
						{
							if (!htmls.hasOwnProperty(i)) return;

							if (htmls[i].search('{replace') == -1)
							{
								htmls[i] = htmls[i].replace(/<p>\n\t?<\/p>/gi, '');
								htmls[i] = htmls[i].replace(/<p><\/p>/gi, '');

								if (htmls[i] !== '')
								{
									html += '<p>' +  htmls[i].replace(/^\n+|\n+$/g, "") + "</p>";
								}
							}
							else html += htmls[i];
						}
					}

					return html;
				},
				replaceBreaksToNewLines: function(html)
				{
					html = html.replace(/<br \/>\s*<br \/>/gi, "\n\n");
					html = html.replace(/<br\s?\/?>\n?<br\s?\/?>/gi, "\n<br /><br />");

					html = html.replace(new RegExp("\r\n", 'g'), "\n");
					html = html.replace(new RegExp("\r", 'g'), "\n");
					html = html.replace(new RegExp("/\n\n+/"), 'g', "\n\n");

					return html;
				},
				clear: function(html)
				{
					html = html.replace(new RegExp('</blockquote></p>', 'gi'), '</blockquote>');
					html = html.replace(new RegExp('<p></blockquote>', 'gi'), '</blockquote>');
					html = html.replace(new RegExp('<p><blockquote>', 'gi'), '<blockquote>');
					html = html.replace(new RegExp('<blockquote></p>', 'gi'), '<blockquote>');

					html = html.replace(new RegExp('<p><p ', 'gi'), '<p ');
					html = html.replace(new RegExp('<p><p>', 'gi'), '<p>');
					html = html.replace(new RegExp('</p></p>', 'gi'), '</p>');
					html = html.replace(new RegExp('<p>\\s?</p>', 'gi'), '');
					html = html.replace(new RegExp("\n</p>", 'gi'), '</p>');
					html = html.replace(new RegExp('<p>\t?\t?\n?<p>', 'gi'), '<p>');
					html = html.replace(new RegExp('<p>\t*</p>', 'gi'), '');

					return html;
				}
			};
		},
		paste: function()
		{
			return {
				init: function(e)
				{
					if (!this.opts.cleanOnPaste)
					{
						setTimeout($.proxy(this.code.sync, this), 1);
						return;
					}

					this.rtePaste = true;

					this.buffer.set();
					this.selection.save();
					this.utils.saveScroll();

					this.paste.createPasteBox();

					$(window).on('scroll.redactor-freeze', $.proxy(function()
					{
						$(window).scrollTop(this.saveBodyScroll);

					}, this));

					setTimeout($.proxy(function()
					{
						var html = this.$pasteBox.html();

						this.$pasteBox.remove();

						this.selection.restore();
						this.utils.restoreScroll();

						this.paste.insert(html);

						$(window).off('scroll.redactor-freeze');

					}, this), 1);

				},
				createPasteBox: function()
				{
					this.$pasteBox = $('<div>').html('').attr('contenteditable', 'true').css({ position: 'fixed', width: 0, top: 0, left: '-9999px' });

					$('body').append(this.$pasteBox);
					this.$pasteBox.focus();
				},
				insert: function(html)
				{
					html = this.core.setCallback('pasteBefore', html);

					// clean
					html = (this.utils.isSelectAll()) ? this.clean.onPaste(html, false) : this.clean.onPaste(html);

					html = this.core.setCallback('paste', html);

					if (this.utils.isSelectAll())
					{
						this.insert.set(html, false);
					}
					else
					{
						this.insert.html(html, false);
					}

					this.utils.disableSelectAll();
					this.rtePaste = false;

					setTimeout($.proxy(this.clean.clearUnverified, this), 10);

					// clean empty spans
					setTimeout($.proxy(function()
					{
						var spans = this.$editor.find('span');
						$.each(spans, function(i,s)
						{
							var html = s.innerHTML.replace(/[\u200B-\u200D\uFEFF]/, '');
							if (html === '' && s.attributes.length === 0) $(s).remove();

						});

					}, this), 10);
				}
			};
		},
		placeholder: function()
		{
			return {
				enable: function()
				{
					if (!this.placeholder.is()) return;

					this.$editor.attr('placeholder', this.$element.attr('placeholder'));

					this.placeholder.toggle();
					this.$editor.on('keyup.redactor-placeholder', $.proxy(this.placeholder.toggle, this));

				},
				toggle: function()
				{
					var func = 'removeClass';
					if (this.utils.isEmpty(this.$editor.html(), false)) func = 'addClass';
					this.$editor[func]('redactor-placeholder');
				},
				remove: function()
				{
					this.$editor.removeClass('redactor-placeholder');
				},
				is: function()
				{
					if (this.opts.placeholder)
					{
						return this.$element.attr('placeholder', this.opts.placeholder);
					}
					else
					{
						return !(typeof this.$element.attr('placeholder') == 'undefined' || this.$element.attr('placeholder') === '');
					}
				}
			};
		},
		progress: function()
		{
			return {
				show: function()
				{
					$(document.body).append($('<div id="redactor-progress"><span></span></div>'));
					$('#redactor-progress').fadeIn();
				},
				hide: function()
				{
					$('#redactor-progress').fadeOut(1500, function()
					{
						$(this).remove();
					});
				}

			};
		},
		selection: function()
		{
			return {
				get: function()
				{
					this.sel = document.getSelection();

					if (document.getSelection && this.sel.getRangeAt && this.sel.rangeCount)
					{
						this.range = this.sel.getRangeAt(0);
					}
					else
					{
						this.range = document.createRange();
					}
				},
				addRange: function()
				{
					try {
						this.sel.removeAllRanges();
					} catch (e) {}

					this.sel.addRange(this.range);
				},
				getCurrent: function()
				{
					var el = false;
					this.selection.get();

					if (this.sel && this.sel.rangeCount > 0)
					{
						el = this.sel.getRangeAt(0).startContainer;
					}

					return this.utils.isRedactorParent(el);
				},
				getParent: function(elem)
				{
					elem = elem || this.selection.getCurrent();
					if (elem)
					{
						return this.utils.isRedactorParent($(elem).parent()[0]);
					}

					return false;
				},
				getBlock: function(node)
				{
					node = node || this.selection.getCurrent();

					while (node)
					{
						if (this.utils.isBlockTag(node.tagName))
						{
							return ($(node).hasClass('redactor-editor')) ? false : node;
						}

						node = node.parentNode;
					}

					return false;
				},
				getInlines: function(nodes, tags)
				{
					this.selection.get();

					if (this.range && this.range.collapsed)
					{
						return false;
					}

					var inlines = [];
					nodes = (typeof nodes == 'undefined' || nodes === false) ? this.selection.getNodes() : nodes;
					var inlineTags = this.opts.inlineTags;
					inlineTags.push('span');

					if (typeof tags !== 'undefined')
					{
						for (var i = 0; i < tags.length; i++)
						{
							inlineTags.push(tags[i]);
						}
					}

					$.each(nodes, $.proxy(function(i,node)
					{
						if ($.inArray(node.tagName.toLowerCase(), inlineTags) != -1)
						{
							inlines.push(node);
						}

					}, this));

					return (inlines.length === 0) ? false : inlines;
				},
				getInlinesTags: function(tags)
				{
					this.selection.get();

					if (this.range && this.range.collapsed)
					{
						return false;
					}

					var inlines = [];
					var nodes =  this.selection.getNodes();
					$.each(nodes, $.proxy(function(i,node)
					{
						if ($.inArray(node.tagName.toLowerCase(), tags) != -1)
						{
							inlines.push(node);
						}

					}, this));

					return (inlines.length === 0) ? false : inlines;
				},
				getBlocks: function(nodes)
				{
					this.selection.get();

					if (this.range && this.range.collapsed)
					{
						return [this.selection.getBlock()];
					}

					var blocks = [];
					nodes = (typeof nodes == 'undefined') ? this.selection.getNodes() : nodes;
					$.each(nodes, $.proxy(function(i,node)
					{
						if (this.utils.isBlock(node))
						{
							this.selection.lastBlock = node;
							blocks.push(node);
						}

					}, this));

					return (blocks.length === 0) ? [this.selection.getBlock()] : blocks;
				},
				getLastBlock: function()
				{
					return this.selection.lastBlock;
				},
				getNodes: function()
				{
					this.selection.get();

					var startNode = this.selection.getNodesMarker(1);
					var endNode = this.selection.getNodesMarker(2);
					var range = this.range.cloneRange();

					if (this.range.collapsed === false)
					{
						var startContainer = range.startContainer;
						var startOffset = range.startOffset;

						// end marker
						this.selection.setNodesMarker(range, endNode, false);

						// start marker
						range.setStart(startContainer, startOffset);
						this.selection.setNodesMarker(range, startNode, true);
					}
					else
					{
						this.selection.setNodesMarker(range, startNode, true);
						endNode = startNode;
					}

					var nodes = [];
					var counter = 0;

					var self = this;
					this.$editor.find('*').each(function()
					{
						if (this == startNode)
						{
							var parent = $(this).parent();
							if (parent.length !== 0 && parent[0].tagName != 'BODY' && self.utils.isRedactorParent(parent[0]))
							{
								nodes.push(parent[0]);
							}

							nodes.push(this);
							counter = 1;
						}
						else
						{
							if (counter > 0)
							{
								nodes.push(this);
								counter = counter + 1;
							}
						}

						if (this == endNode)
						{
							return false;
						}

					});

					var finalNodes = [];
					var len = nodes.length;
					for (var i = 0; i < len; i++)
					{
						if (nodes[i].id != 'nodes-marker-1' && nodes[i].id != 'nodes-marker-2')
						{
							finalNodes.push(nodes[i]);
						}
					}

					this.selection.removeNodesMarkers();

					return finalNodes;

				},
				getNodesMarker: function(num)
				{
					return $('<span id="nodes-marker-' + num + '" class="redactor-nodes-marker" data-verified="redactor">' + this.opts.invisibleSpace + '</span>')[0];
				},
				setNodesMarker: function(range, node, type)
				{
					try {
						range.collapse(type);
						range.insertNode(node);
					}
					catch (e) {}
				},
				removeNodesMarkers: function()
				{
					$(document).find('span.redactor-nodes-marker').remove();
					this.$editor.find('span.redactor-nodes-marker').remove();
				},
				fromPoint: function(start, end)
				{
					this.caret.setOffset(start, end);
				},
				wrap: function(tag)
				{
					this.selection.get();

					if (this.range.collapsed) return false;

					var wrapper = document.createElement(tag);
					wrapper.appendChild(this.range.extractContents());
					this.range.insertNode(wrapper);

					return wrapper;
				},
				selectElement: function(node)
				{
					this.caret.set(node, 0, node, 1);
				},
				selectAll: function()
				{
					this.selection.get();
					this.range.selectNodeContents(this.$editor[0]);
					this.selection.addRange();
				},
				remove: function()
				{
					this.selection.get();
					this.sel.removeAllRanges();
				},
				save: function()
				{
					this.selection.createMarkers();
				},
				createMarkers: function()
				{
					this.selection.get();

					var node1 = this.selection.getMarker(1);

					this.selection.setMarker(this.range, node1, true);

					if (this.range.collapsed === false)
					{
						var node2 = this.selection.getMarker(2);
						this.selection.setMarker(this.range, node2, false);
					}

					this.savedSel = this.$editor.html();
				},
				getMarker: function(num)
				{
					if (typeof num == 'undefined') num = 1;

					return $('<span id="selection-marker-' + num + '" class="redactor-selection-marker"  data-verified="redactor">' + this.opts.invisibleSpace + '</span>')[0];
				},
				getMarkerAsHtml: function(num)
				{
					return this.utils.getOuterHtml(this.selection.getMarker(num));
				},
				setMarker: function(range, node, type)
				{
					range = range.cloneRange();

					try {
						range.collapse(type);
						range.insertNode(node);
					}
					catch (e)
					{
						this.focus.setStart();
					}
				},
				restore: function()
				{
					var node1 = this.$editor.find('span#selection-marker-1');
					var node2 = this.$editor.find('span#selection-marker-2');

					if (node1.length !== 0 && node2.length !== 0)
					{
						this.caret.set(node1, 0, node2, 0);
					}
					else if (node1.length !== 0)
					{
						this.caret.set(node1, 0, node1, 0);
					}
					else
					{
						this.$editor.focus();
					}

					this.selection.removeMarkers();
					this.savedSel = false;

				},
				removeMarkers: function()
				{
					this.$editor.find('span.redactor-selection-marker').each(function(i,s)
					{
						var text = $(s).text().replace(/[\u200B-\u200D\uFEFF]/g, '');
						if (text === '') $(s).remove();
						else $(s).replaceWith(function() { return $(this).contents(); });
					});
				},
				getText: function()
				{
					this.selection.get();

					return this.sel.toString();
				},
				getHtml: function()
				{
					var html = '';

					this.selection.get();
					if (this.sel.rangeCount)
					{
						var container = document.createElement('div');
						var len = this.sel.rangeCount;
						for (var i = 0; i < len; ++i)
						{
							container.appendChild(this.sel.getRangeAt(i).cloneContents());
						}

						html = container.innerHTML;
					}

					return this.clean.onSync(html);
				},
				replaceWithHtml: function(html)
				{
					html = this.selection.getMarkerAsHtml(1) + html + this.selection.getMarkerAsHtml(2);

					this.selection.get();

					if (window.getSelection && window.getSelection().getRangeAt)
					{
						this.range.deleteContents();
						var div = document.createElement("div");
						div.innerHTML = html;

						var frag = document.createDocumentFragment(), child;
						while ((child = div.firstChild))
						{
							frag.appendChild(child);
						}

						this.range.insertNode(frag);
					}
					else if (document.selection && document.selection.createRange)
					{
						this.range.pasteHTML(html);
					}

					this.selection.restore();
					this.code.sync();
				}
			};
		},
		shortcuts: function()
		{
			return {
				init: function(e, key)
				{
					// disable browser's hot keys for bold and italic
					if (!this.opts.shortcuts)
					{
						if ((e.ctrlKey || e.metaKey) && (key === 66 || key === 73)) e.preventDefault();
						return false;
					}

					$.each(this.opts.shortcuts, $.proxy(function(str, command)
					{
						var keys = str.split(',');
						var len = keys.length;
						for (var i = 0; i < len; i++)
						{
							if (typeof keys[i] === 'string')
							{
								this.shortcuts.handler(e, $.trim(keys[i]), $.proxy(function()
								{
									var func;
									if (command.func.search(/\./) != '-1')
									{
										func = command.func.split('.');
										if (typeof this[func[0]] != 'undefined')
										{
											this[func[0]][func[1]].apply(this, command.params);
										}
									}
									else
									{
										this[command.func].apply(this, command.params);
									}

								}, this));
							}

						}

					}, this));
				},
				handler: function(e, keys, origHandler)
				{
					// based on https://github.com/jeresig/jquery.hotkeys
					var hotkeysSpecialKeys =
					{
						8: "backspace", 9: "tab", 10: "return", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
						20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
						37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 59: ";", 61: "=",
						96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
						104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/",
						112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
						120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 173: "-", 186: ";", 187: "=",
						188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'"
					};


					var hotkeysShiftNums =
					{
						"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
						"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<",
						".": ">",  "/": "?",  "\\": "|"
					};

					keys = keys.toLowerCase().split(" ");
					var special = hotkeysSpecialKeys[e.keyCode],
						character = String.fromCharCode( e.which ).toLowerCase(),
						modif = "", possible = {};

					$.each([ "alt", "ctrl", "meta", "shift"], function(index, specialKey)
					{
						if (e[specialKey + 'Key'] && special !== specialKey)
						{
							modif += specialKey + '+';
						}
					});


					if (special) possible[modif + special] = true;
					if (character)
					{
						possible[modif + character] = true;
						possible[modif + hotkeysShiftNums[character]] = true;

						// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
						if (modif === "shift+")
						{
							possible[hotkeysShiftNums[character]] = true;
						}
					}

					for (var i = 0, len = keys.length; i < len; i++)
					{
						if (possible[keys[i]])
						{
							e.preventDefault();
							return origHandler.apply(this, arguments);
						}
					}
				}
			};
		},
		tabifier: function()
		{
			return {
				get: function(code)
				{
					if (!this.opts.tabifier) return code;

					// clean setup
					var ownLine = ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot'];
					var contOwnLine = ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'];
					var newLevel = ['p', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'pre', 'select', 'td', 'th', 'tr', 'ul'];

					this.tabifier.lineBefore = new RegExp('^<(/?' + ownLine.join('|/?' ) + '|' + contOwnLine.join('|') + ')[ >]');
					this.tabifier.lineAfter = new RegExp('^<(br|/?' + ownLine.join('|/?' ) + '|/' + contOwnLine.join('|/') + ')[ >]');
					this.tabifier.newLevel = new RegExp('^</?(' + newLevel.join('|' ) + ')[ >]');

					var i = 0,
					codeLength = code.length,
					point = 0,
					start = null,
					end = null,
					tag = '',
					out = '',
					cont = '';

					this.tabifier.cleanlevel = 0;

					for (; i < codeLength; i++)
					{
						point = i;

						// if no more tags, copy and exit
						if (-1 == code.substr(i).indexOf( '<' ))
						{
							out += code.substr(i);

							return this.tabifier.finish(out);
						}

						// copy verbatim until a tag
						while (point < codeLength && code.charAt(point) != '<')
						{
							point++;
						}

						if (i != point)
						{
							cont = code.substr(i, point - i);
							if (!cont.match(/^\s{2,}$/g))
							{
								if ('\n' == out.charAt(out.length - 1)) out += this.tabifier.getTabs();
								else if ('\n' == cont.charAt(0))
								{
									out += '\n' + this.tabifier.getTabs();
									cont = cont.replace(/^\s+/, '');
								}

								out += cont;
							}

							if (cont.match(/\n/)) out += '\n' + this.tabifier.getTabs();
						}

						start = point;

						// find the end of the tag
						while (point < codeLength && '>' != code.charAt(point))
						{
							point++;
						}

						tag = code.substr(start, point - start);
						i = point;

						var t;

						if ('!--' == tag.substr(1, 3))
						{
							if (!tag.match(/--$/))
							{
								while ('-->' != code.substr(point, 3))
								{
									point++;
								}
								point += 2;
								tag = code.substr(start, point - start);
								i = point;
							}

							if ('\n' != out.charAt(out.length - 1)) out += '\n';

							out += this.tabifier.getTabs();
							out += tag + '>\n';
						}
						else if ('!' == tag[1])
						{
							out = this.tabifier.placeTag(tag + '>', out);
						}
						else if ('?' == tag[1])
						{
							out += tag + '>\n';
						}
						else if (t = tag.match(/^<(script|style|pre)/i))
						{
							t[1] = t[1].toLowerCase();
							tag = this.tabifier.cleanTag(tag);
							out = this.tabifier.placeTag(tag, out);
							end = String(code.substr(i + 1)).toLowerCase().indexOf('</' + t[1]);

							if (end)
							{
								cont = code.substr(i + 1, end);
								i += end;
								out += cont;
							}
						}
						else
						{
							tag = this.tabifier.cleanTag(tag);
							out = this.tabifier.placeTag(tag, out);
						}
					}

					return this.tabifier.finish(out);
				},
				getTabs: function()
				{
					var s = '';
					for ( var j = 0; j < this.tabifier.cleanlevel; j++ )
					{
						s += '\t';
					}

					return s;
				},
				finish: function(code)
				{
					code = code.replace(/\n\s*\n/g, '\n');
					code = code.replace(/^[\s\n]*/, '');
					code = code.replace(/[\s\n]*$/, '');
					code = code.replace(/<script(.*?)>\n<\/script>/gi, '<script$1></script>');

					this.tabifier.cleanlevel = 0;

					return code;
				},
				cleanTag: function (tag)
				{
					var tagout = '';
					tag = tag.replace(/\n/g, ' ');
					tag = tag.replace(/\s{2,}/g, ' ');
					tag = tag.replace(/^\s+|\s+$/g, ' ');

					var suffix = '';
					if (tag.match(/\/$/))
					{
						suffix = '/';
						tag = tag.replace(/\/+$/, '');
					}

					var m;
					while (m = /\s*([^= ]+)(?:=((['"']).*?\3|[^ ]+))?/.exec(tag))
					{
						if (m[2]) tagout += m[1].toLowerCase() + '=' + m[2];
						else if (m[1]) tagout += m[1].toLowerCase();

						tagout += ' ';
						tag = tag.substr(m[0].length);
					}

					return tagout.replace(/\s*$/, '') + suffix + '>';
				},
				placeTag: function (tag, out)
				{
					var nl = tag.match(this.tabifier.newLevel);

					if (tag.match(this.tabifier.lineBefore) || nl)
					{
						out = out.replace(/\s*$/, '');
						out += '\n';
					}

					if (nl && '/' == tag.charAt(1)) this.tabifier.cleanlevel--;
					if ('\n' == out.charAt(out.length - 1)) out += this.tabifier.getTabs();
					if (nl && '/' != tag.charAt(1)) this.tabifier.cleanlevel++;

					out += tag;

					if (tag.match(this.tabifier.lineAfter) || tag.match(this.tabifier.newLevel))
					{
						out = out.replace(/ *$/, '');
						//out += '\n';
					}

					return out;
				}
			};
		},
		tidy: function()
		{
			return {
				setupAllowed: function()
				{
					if (this.opts.allowedTags) this.opts.deniedTags = false;
					if (this.opts.allowedAttr) this.opts.removeAttr = false;

					if (this.opts.linebreaks) return;

					var tags = ['p', 'section'];
					if (this.opts.allowedTags) this.tidy.addToAllowed(tags);
					if (this.opts.deniedTags) this.tidy.removeFromDenied(tags);

				},
				addToAllowed: function(tags)
				{
					var len = tags.length;
					for (var i = 0; i < len; i++)
					{
						if ($.inArray(tags[i], this.opts.allowedTags) == -1)
						{
							this.opts.allowedTags.push(tags[i]);
						}
					}
				},
				removeFromDenied: function(tags)
				{
					var len = tags.length;
					for (var i = 0; i < len; i++)
					{
						var pos = $.inArray(tags[i], this.opts.deniedTags);
						if (pos != -1)
						{
							this.opts.deniedTags.splice(pos, 1);
						}
					}
				},
				load: function(html, options)
				{
					this.tidy.settings = {
						deniedTags: this.opts.deniedTags,
						allowedTags: this.opts.allowedTags,
						removeComments: this.opts.removeComments,
						replaceTags: this.opts.replaceTags,
						replaceStyles: this.opts.replaceStyles,
						removeDataAttr: this.opts.removeDataAttr,
						removeAttr: this.opts.removeAttr,
						allowedAttr: this.opts.allowedAttr,
						removeWithoutAttr: this.opts.removeWithoutAttr,
						removeEmpty: this.opts.removeEmpty
					};

					$.extend(this.tidy.settings, options);

					html = this.tidy.removeComments(html);

					// create container
					this.tidy.$div = $('<div />').append(html);

					// clean
					this.tidy.replaceTags();
					this.tidy.replaceStyles();
					this.tidy.removeTags();

					this.tidy.removeAttr();
					this.tidy.removeEmpty();
					this.tidy.removeParagraphsInLists();
					this.tidy.removeDataAttr();
					this.tidy.removeWithoutAttr();

					html = this.tidy.$div.html();
					this.tidy.$div.remove();

					return html;
				},
				removeComments: function(html)
				{
					if (!this.tidy.settings.removeComments) return html;

					return html.replace(/<!--[\s\S]*?-->/gi, '');
				},
				replaceTags: function(html)
				{
					if (!this.tidy.settings.replaceTags) return html;

					var len = this.tidy.settings.replaceTags.length;
					var replacement = [], rTags = [];
					for (var i = 0; i < len; i++)
					{
						rTags.push(this.tidy.settings.replaceTags[i][1]);
						replacement.push(this.tidy.settings.replaceTags[i][0]);
					}

					this.tidy.$div.find(replacement.join(',')).each($.proxy(function(n,s)
					{
						var tag = rTags[n];
						$(s).replaceWith(function()
						{
							var replaced = $('<' + tag + ' />').append($(this).contents());

							for (var i = 0; i < this.attributes.length; i++)
							{
								replaced.attr(this.attributes[i].name, this.attributes[i].value);
							}

							return replaced;
						});

					}, this));

					return html;
				},
				replaceStyles: function()
				{
					if (!this.tidy.settings.replaceStyles) return;

					var len = this.tidy.settings.replaceStyles.length;
					this.tidy.$div.find('span').each($.proxy(function(n,s)
					{
						var $el = $(s);
						var style = $el.attr('style');
						for (var i = 0; i < len; i++)
						{
							if (style && style.match(new RegExp('^' + this.tidy.settings.replaceStyles[i][0], 'i')))
							{
								var tagName = this.tidy.settings.replaceStyles[i][1];
								$el.replaceWith(function()
								{
									var tag = document.createElement(tagName);
									return $(tag).append($(this).contents());
								});
							}
						}

					}, this));

				},
				removeTags: function()
				{
					if (!this.tidy.settings.deniedTags && this.tidy.settings.allowedTags)
					{
						this.tidy.$div.find('*').not(this.tidy.settings.allowedTags.join(',')).each(function(i, s)
						{
							if (s.innerHTML === '') $(s).remove();
							else $(s).contents().unwrap();
						});
					}

					if (this.tidy.settings.deniedTags)
					{
						this.tidy.$div.find(this.tidy.settings.deniedTags.join(',')).each(function(i, s)
						{
							if (s.innerHTML === '') $(s).remove();
							else $(s).contents().unwrap();
						});
					}
				},
				removeAttr: function()
				{
					var len;
					if (!this.tidy.settings.removeAttr && this.tidy.settings.allowedAttr)
					{

						var allowedAttrTags = [], allowedAttrData = [];
						len = this.tidy.settings.allowedAttr.length;
						for (var i = 0; i < len; i++)
						{
							allowedAttrTags.push(this.tidy.settings.allowedAttr[i][0]);
							allowedAttrData.push(this.tidy.settings.allowedAttr[i][1]);
						}


						this.tidy.$div.find('*').each($.proxy(function(n,s)
						{
							var $el = $(s);
							var pos = $.inArray($el[0].tagName.toLowerCase(), allowedAttrTags);
							var attributesRemove = this.tidy.removeAttrGetRemoves(pos, allowedAttrData, $el);

							if (attributesRemove)
							{
								$.each(attributesRemove, function(z,f) {
									$el.removeAttr(f);
								});
							}
						}, this));
					}

					if (this.tidy.settings.removeAttr)
					{
						len = this.tidy.settings.removeAttr.length;
						for (var i = 0; i < len; i++)
						{
							var attrs = this.tidy.settings.removeAttr[i][1];
							if ($.isArray(attrs)) attrs = attrs.join(' ');

							this.tidy.$div.find(this.tidy.settings.removeAttr[i][0]).removeAttr(attrs);
						}
					}

				},
				removeAttrGetRemoves: function(pos, allowed, $el)
				{
					var attributesRemove = [];

					// remove all attrs
					if (pos == -1)
					{
						$.each($el[0].attributes, function(i, item)
						{
							attributesRemove.push(item.name);
						});

					}
					// allow all attrs
					else if (allowed[pos] == '*')
					{
						attributesRemove = [];
					}
					// allow specific attrs
					else
					{
						$.each($el[0].attributes, function(i, item)
						{
							if ($.isArray(allowed[pos]))
							{
								if ($.inArray(item.name, allowed[pos]) == -1)
								{
									attributesRemove.push(item.name);
								}
							}
							else if (allowed[pos] != item.name)
							{
								attributesRemove.push(item.name);
							}

						});
					}

					return attributesRemove;
				},
				removeAttrs: function (el, regex)
				{
					regex = new RegExp(regex, "g");
					return el.each(function()
					{
						var self = $(this);
						var len = this.attributes.length - 1;
						for (var i = len; i >= 0; i--)
						{
							var item = this.attributes[i];
							if (item && item.specified && item.name.search(regex)>=0)
							{
								self.removeAttr(item.name);
							}
						}
					});
				},
				removeEmpty: function()
				{
					if (!this.tidy.settings.removeEmpty) return;

					this.tidy.$div.find(this.tidy.settings.removeEmpty.join(',')).each(function()
					{
						var $el = $(this);
						var text = $el.text();
						text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
						text = text.replace(/&nbsp;/gi, '');
						text = text.replace(/\s/g, '');

		    	    	if (text === '' && $el.children().length === 0)
		    	    	{
			    	    	$el.remove();
		    	    	}
					});
				},
				removeParagraphsInLists: function()
				{
					this.tidy.$div.find('li p').contents().unwrap();
				},
				removeDataAttr: function()
				{
					if (!this.tidy.settings.removeDataAttr) return;

					var tags = this.tidy.settings.removeDataAttr;
					if ($.isArray(this.tidy.settings.removeDataAttr)) tags = this.tidy.settings.removeDataAttr.join(',');

					this.tidy.removeAttrs(this.tidy.$div.find(tags), '^(data-)');

				},
				removeWithoutAttr: function()
				{
					if (!this.tidy.settings.removeWithoutAttr) return;

					this.tidy.$div.find(this.tidy.settings.removeWithoutAttr.join(',')).each(function()
					{
						if (this.attributes.length === 0)
						{
							$(this).contents().unwrap();
						}
					});
				}
			};
		},
		toolbar: function()
		{
			return {
				init: function()
				{
					return {
						html:
						{
							title: this.lang.get('html'),
							func: 'code.toggle'
						},
						formatting:
						{
							title: this.lang.get('formatting'),
							dropdown:
							{
								p:
								{
									title: this.lang.get('paragraph'),
									func: 'block.format'
								},
								blockquote:
								{
									title: this.lang.get('quote'),
									func: 'block.format'
								},
								pre:
								{
									title: this.lang.get('code'),
									func: 'block.format'
								},
								h1:
								{
									title: this.lang.get('header1'),
									func: 'block.format'
								},
								h2:
								{
									title: this.lang.get('header2'),
									func: 'block.format'
								},
								h3:
								{
									title: this.lang.get('header3'),
									func: 'block.format'
								},
								h4:
								{
									title: this.lang.get('header4'),
									func: 'block.format'
								},
								h5:
								{
									title: this.lang.get('header5'),
									func: 'block.format'
								}
							}
						},
						bold:
						{
							title: this.lang.get('bold'),
							func: 'inline.format'
						},
						italic:
						{
							title: this.lang.get('italic'),
							func: 'inline.format'
						},
						deleted:
						{
							title: this.lang.get('deleted'),
							func: 'inline.format'
						},
						underline:
						{
							title: this.lang.get('underline'),
							func: 'inline.format'
						},
						unorderedlist:
						{
							title: '&bull; ' + this.lang.get('unorderedlist'),
							func: 'list.toggle'
						},
						orderedlist:
						{
							title: '1. ' + this.lang.get('orderedlist'),
							func: 'list.toggle'
						},
						outdent:
						{
							title: '< ' + this.lang.get('outdent'),
							func: 'indent.decrease'
						},
						indent:
						{
							title: '> ' + this.lang.get('indent'),
							func: 'indent.increase'
						},
						image:
						{
							title: this.lang.get('image'),
							func: 'image.show'
						},
						file:
						{
							title: this.lang.get('file'),
							func: 'file.show'
						},
						link:
						{
							title: this.lang.get('link'),
							dropdown:
							{
								link:
								{
									title: this.lang.get('link_insert'),
									func: 'link.show'
								},
								unlink:
								{
									title: this.lang.get('unlink'),
									func: 'link.unlink'
								}
							}
						},
						alignment:
						{
							title: this.lang.get('alignment'),
							dropdown:
							{
								left:
								{
									title: this.lang.get('align_left'),
									func: 'alignment.left'
								},
								center:
								{
									title: this.lang.get('align_center'),
									func: 'alignment.center'
								},
								right:
								{
									title: this.lang.get('align_right'),
									func: 'alignment.right'
								},
								justify:
								{
									title: this.lang.get('align_justify'),
									func: 'alignment.justify'
								}
							}
						},
						horizontalrule:
						{
							title: this.lang.get('horizontalrule'),
							func: 'line.insert'
						}
					};
				},
				build: function()
				{
					this.toolbar.hideButtons();
					this.toolbar.hideButtonsOnMobile();
					this.toolbar.isButtonSourceNeeded();

					if (this.opts.buttons.length === 0) return;

					this.$toolbar = this.toolbar.createContainer();

					this.toolbar.setOverflow();
					this.toolbar.append();
					this.toolbar.setFormattingTags();
					this.toolbar.loadButtons();
					this.toolbar.setFixed();

					// buttons response
					if (this.opts.activeButtons)
					{
						this.$editor.on('mouseup.redactor keyup.redactor focus.redactor', $.proxy(this.observe.buttons, this));
					}

				},
				createContainer: function()
				{
					return $('<ul>').addClass('redactor-toolbar').attr('id', 'redactor-toolbar-' + this.uuid);
				},
				setFormattingTags: function()
				{
					$.each(this.opts.toolbar.formatting.dropdown, $.proxy(function (i, s)
					{
						if ($.inArray(i, this.opts.formatting) == -1) delete this.opts.toolbar.formatting.dropdown[i];
					}, this));

				},
				loadButtons: function()
				{
					$.each(this.opts.buttons, $.proxy(function(i, btnName)
					{
						if (!this.opts.toolbar[btnName]) return;

						if (btnName === 'file')
						{
							 if (this.opts.fileUpload === false) return;
							 else if (!this.opts.fileUpload && this.opts.s3 === false) return;
						}

						if (btnName === 'image')
						{
							 if (this.opts.imageUpload === false) return;
							 else if (!this.opts.imageUpload && this.opts.s3 === false) return;
						}

						var btnObject = this.opts.toolbar[btnName];
						this.$toolbar.append($('<li>').append(this.button.build(btnName, btnObject)));

					}, this));
				},
				append: function()
				{
					if (this.opts.toolbarExternal)
					{
						this.$toolbar.addClass('redactor-toolbar-external');
						$(this.opts.toolbarExternal).html(this.$toolbar);
					}
					else
					{
						this.$box.prepend(this.$toolbar);
					}
				},
				setFixed: function()
				{
					if (!this.utils.isDesktop()) return;
					if (this.opts.toolbarExternal) return;
					if (!this.opts.toolbarFixed) return;

					this.toolbar.observeScroll();
					$(this.opts.toolbarFixedTarget).on('scroll.redactor.' + this.uuid, $.proxy(this.toolbar.observeScroll, this));

				},
				setOverflow: function()
				{
					if (this.utils.isMobile() && this.opts.toolbarOverflow)
					{
						this.$toolbar.addClass('redactor-toolbar-overflow');
					}
				},
				isButtonSourceNeeded: function()
				{
					if (this.opts.source) return;

					var index = this.opts.buttons.indexOf('html');
					if (index !== -1)
					{
						this.opts.buttons.splice(index, 1);
					}
				},
				hideButtons: function()
				{
					if (this.opts.buttonsHide.length === 0) return;

					$.each(this.opts.buttonsHide, $.proxy(function(i, s)
					{
						var index = this.opts.buttons.indexOf(s);
						this.opts.buttons.splice(index, 1);

					}, this));
				},
				hideButtonsOnMobile: function()
				{
					if (!this.utils.isMobile() || this.opts.buttonsHideOnMobile.length === 0) return;

					$.each(this.opts.buttonsHideOnMobile, $.proxy(function(i, s)
					{
						var index = this.opts.buttons.indexOf(s);
						this.opts.buttons.splice(index, 1);

					}, this));
				},
				observeScroll: function()
				{
					var scrollTop = $(this.opts.toolbarFixedTarget).scrollTop();
					var boxTop = 1;

					if (this.opts.toolbarFixedTarget === document)
					{
						boxTop = this.$box.offset().top;
					}

					if (scrollTop > boxTop)
					{
						this.toolbar.observeScrollEnable(scrollTop, boxTop);
					}
					else
					{
						this.toolbar.observeScrollDisable();
					}
				},
				observeScrollEnable: function(scrollTop, boxTop)
				{
					var top = this.opts.toolbarFixedTopOffset + scrollTop - boxTop;
					var left = 0;
					var end = boxTop + this.$box.height() - 32;
					var width = this.$box.innerWidth();

					this.$toolbar.addClass('toolbar-fixed-box');
					this.$toolbar.css({
						position: 'absolute',
						width: width,
						top: top + 'px',
						left: left
					});

					this.toolbar.setDropdownsFixed();
					this.$toolbar.css('visibility', (scrollTop < end) ? 'visible' : 'hidden');
				},
				observeScrollDisable: function()
				{
					this.$toolbar.css({
						position: 'relative',
						width: 'auto',
						top: 0,
						left: 0,
						visibility: 'visible'
					});

					this.toolbar.unsetDropdownsFixed();
					this.$toolbar.removeClass('toolbar-fixed-box');


				},
				setDropdownsFixed: function()
				{
					var top = this.$toolbar.innerHeight() + this.opts.toolbarFixedTopOffset;
					var position = 'fixed';
					if (this.opts.toolbarFixedTarget !== document)
					{
						top = (this.$toolbar.innerHeight() + this.$toolbar.offset().top) + this.opts.toolbarFixedTopOffset;
						position = 'absolute';
					}

					$('.redactor-dropdown-' + this.uuid).each(function()
					{
						$(this).css({ position: position, top: top + 'px' });
					});
				},
				unsetDropdownsFixed: function()
				{
					var top = (this.$toolbar.innerHeight() + this.$toolbar.offset().top);
					$('.redactor-dropdown-' + this.uuid).each(function()
					{
						$(this).css({ position: 'absolute', top: top + 'px' });
					});
				}
			};
		},
		upload: function()
		{
			return {
				init: function(id, url, callback)
				{
					this.upload.direct = false;
					this.upload.callback = callback;
					this.upload.url = url;
					this.upload.$el = $(id);
					this.upload.$droparea = $('<div id="redactor-droparea" />');

					this.upload.$placeholdler = $('<div id="redactor-droparea-placeholder" />').text(this.lang.get('upload_label'));
					this.upload.$input = $('<input type="file" name="file" />');

					this.upload.$placeholdler.append(this.upload.$input);
					this.upload.$droparea.append(this.upload.$placeholdler);
					this.upload.$el.append(this.upload.$droparea);

					this.upload.$droparea.off('redactor.upload');
					this.upload.$input.off('redactor.upload');

					this.upload.$droparea.on('dragover.redactor.upload', $.proxy(this.upload.onDrag, this));
					this.upload.$droparea.on('dragleave.redactor.upload', $.proxy(this.upload.onDragLeave, this));

					// change
					this.upload.$input.on('change.redactor.upload', $.proxy(function(e)
					{
						e = e.originalEvent || e;
						this.upload.traverseFile(this.upload.$input[0].files[0], e);
					}, this));

					// drop
					this.upload.$droparea.on('drop.redactor.upload', $.proxy(function(e)
					{
						e.preventDefault();

						this.upload.$droparea.removeClass('drag-hover').addClass('drag-drop');
						this.upload.onDrop(e);

					}, this));
				},
				directUpload: function(file, e)
				{
					this.upload.direct = true;
					this.upload.traverseFile(file, e);
				},
				onDrop: function(e)
				{
					e = e.originalEvent || e;
					var files = e.dataTransfer.files;

					this.upload.traverseFile(files[0], e);
				},
				traverseFile: function(file, e)
				{
					if (this.opts.s3)
					{
						this.upload.setConfig(file);
						this.upload.s3uploadFile(file);
						return;
					}

					var formData = !!window.FormData ? new FormData() : null;
					if (window.FormData)
					{
						this.upload.setConfig(file);

						var name = (this.upload.type == 'image') ? this.opts.imageUploadParam : this.opts.fileUploadParam;
						formData.append(name, file);
					}

					this.progress.show();
					this.core.setCallback('uploadStart', e, formData);
					this.upload.sendData(formData, e);
				},
				setConfig: function(file)
				{
					this.upload.getType(file);

					if (this.upload.direct)
					{
						this.upload.url = (this.upload.type == 'image') ? this.opts.imageUpload : this.opts.fileUpload;
						this.upload.callback = (this.upload.type == 'image') ? this.image.insert : this.file.insert;
					}
				},
				getType: function(file)
				{
					this.upload.type = 'image';
					if (this.opts.imageTypes.indexOf(file.type) == -1)
					{
						this.upload.type = 'file';
					}
				},
				getHiddenFields: function(obj, fd)
				{
					if (obj === false || typeof obj !== 'object') return fd;

					$.each(obj, $.proxy(function(k, v)
					{
						if (v !== null && v.toString().indexOf('#') === 0) v = $(v).val();
						fd.append(k, v);

					}, this));

					return fd;

				},
				sendData: function(formData, e)
				{
					// append hidden fields
					if (this.upload.type == 'image')
					{
						formData = this.upload.getHiddenFields(this.opts.uploadImageFields, formData);
						formData = this.upload.getHiddenFields(this.upload.imageFields, formData);
					}
					else
					{
						formData = this.upload.getHiddenFields(this.opts.uploadFileFields, formData);
						formData = this.upload.getHiddenFields(this.upload.fileFields, formData);
					}

					var xhr = new XMLHttpRequest();
					xhr.open('POST', this.upload.url);

					// complete
					xhr.onreadystatechange = $.proxy(function()
					{
					    if (xhr.readyState == 4)
					    {
					        var data = xhr.responseText;

							data = data.replace(/^\[/, '');
							data = data.replace(/\]$/, '');

							var json;
							try
							{
								json = (typeof data === 'string' ? $.parseJSON(data) : data);
							}
							catch(err)
							{
								json = {
									error: true
								};
							}


							this.progress.hide();

							if (!this.upload.direct)
							{
								this.upload.$droparea.removeClass('drag-drop');
							}

							this.upload.callback(json, this.upload.direct, e);
					    }
					}, this);


					/*
					xhr.upload.onprogress = $.proxy(function(e)
					{
						if (e.lengthComputable)
						{
							var complete = (e.loaded / e.total * 100 | 0);
							//progress.value = progress.innerHTML = complete;
						}

					}, this);
					*/


					xhr.send(formData);
				},
				onDrag: function(e)
				{
					e.preventDefault();
					this.upload.$droparea.addClass('drag-hover');
				},
				onDragLeave: function(e)
				{
					e.preventDefault();
					this.upload.$droparea.removeClass('drag-hover');
				},
				clearImageFields: function()
				{
					this.upload.imageFields = {};
				},
				addImageFields: function(name, value)
				{
					this.upload.imageFields[name] = value;
				},
				removeImageFields: function(name)
				{
					delete this.upload.imageFields[name];
				},
				clearFileFields: function()
				{
					this.upload.fileFields = {};
				},
				addFileFields: function(name, value)
				{
					this.upload.fileFields[name] = value;
				},
				removeFileFields: function(name)
				{
					delete this.upload.fileFields[name];
				},


				// S3
				s3uploadFile: function(file)
				{
					this.upload.s3executeOnSignedUrl(file, $.proxy(function(signedURL)
					{
						this.upload.s3uploadToS3(file, signedURL);
					}, this));
				},
				s3executeOnSignedUrl: function(file, callback)
				{
					var xhr = new XMLHttpRequest();

					var mark = '?';
					if (this.opts.s3.search(/\?/) != '-1') mark = '&';

					xhr.open('GET', this.opts.s3 + mark + 'name=' + file.name + '&type=' + file.type, true);

					// Hack to pass bytes through unprocessed.
					if (xhr.overrideMimeType) xhr.overrideMimeType('text/plain; charset=x-user-defined');

					var that = this;
					xhr.onreadystatechange = function(e)
					{
						if (this.readyState == 4 && this.status == 200)
						{
							that.progress.show();
							callback(decodeURIComponent(this.responseText));
						}
						else if (this.readyState == 4 && this.status != 200)
						{
							//setProgress(0, 'Could not contact signing script. Status = ' + this.status);
						}
					};

					xhr.send();
				},
				s3createCORSRequest: function(method, url)
				{
					var xhr = new XMLHttpRequest();
					if ("withCredentials" in xhr)
					{
						xhr.open(method, url, true);
					}
					else if (typeof XDomainRequest != "undefined")
					{
						xhr = new XDomainRequest();
						xhr.open(method, url);
					}
					else
					{
						xhr = null;
					}

					return xhr;
				},
				s3uploadToS3: function(file, url)
				{
					var xhr = this.upload.s3createCORSRequest('PUT', url);
					if (!xhr)
					{
						//setProgress(0, 'CORS not supported');
					}
					else
					{
						xhr.onload = $.proxy(function()
						{
							if (xhr.status == 200)
							{
								//setProgress(100, 'Upload completed.');

								this.progress.hide();

								var s3file = url.split('?');

								if (!s3file[0])
								{
									 // url parsing is fail
									 return false;
								}


								if (!this.upload.direct)
								{
									this.upload.$droparea.removeClass('drag-drop');
								}

								var json = { filelink: s3file[0] };
								if (this.upload.type == 'file')
								{
									var arr = s3file[0].split('/');
									json.filename = arr[arr.length-1];
								}

								this.upload.callback(json, this.upload.direct, false);


							}
							else
							{
								//setProgress(0, 'Upload error: ' + xhr.status);
							}
						}, this);

						xhr.onerror = function()
						{
							//setProgress(0, 'XHR error.');
						};

						xhr.upload.onprogress = function(e)
						{
							/*
							if (e.lengthComputable)
							{
								var percentLoaded = Math.round((e.loaded / e.total) * 100);
								setProgress(percentLoaded, percentLoaded == 100 ? 'Finalizing.' : 'Uploading.');
							}
							*/
						};

						xhr.setRequestHeader('Content-Type', file.type);
						xhr.setRequestHeader('x-amz-acl', 'public-read');

						xhr.send(file);
					}
				}
			};
		},
		utils: function()
		{
			return {
				isMobile: function()
				{
					return /(iPhone|iPod|BlackBerry|Android)/.test(navigator.userAgent);
				},
				isDesktop: function()
				{
					return !/(iPhone|iPod|iPad|BlackBerry|Android)/.test(navigator.userAgent);
				},
				isString: function(obj)
				{
					return Object.prototype.toString.call(obj) == '[object String]';
				},
				isEmpty: function(html, removeEmptyTags)
				{
					html = html.replace(/[\u200B-\u200D\uFEFF]/g, '');
					html = html.replace(/&nbsp;/gi, '');
					html = html.replace(/<\/?br\s?\/?>/g, '');
					html = html.replace(/\s/g, '');
					html = html.replace(/^<p>[^\W\w\D\d]*?<\/p>$/i, '');
					html = html.replace(/<iframe(.*?[^>])>$/i, 'iframe');
					html = html.replace(/<source(.*?[^>])>$/i, 'source');

					// remove empty tags
					if (removeEmptyTags !== false)
					{
						html = html.replace(/<[^\/>][^>]*><\/[^>]+>/gi, '');
						html = html.replace(/<[^\/>][^>]*><\/[^>]+>/gi, '');
					}

					html = $.trim(html);

					return html === '';
				},
				normalize: function(str)
				{
					if (typeof(str) === 'undefined') return 0;
					return parseInt(str.replace('px',''), 10);
				},
				hexToRgb: function(hex)
				{
					if (typeof hex == 'undefined') return;
					if (hex.search(/^#/) == -1) return hex;

					var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
					hex = hex.replace(shorthandRegex, function(m, r, g, b)
					{
						return r + r + g + g + b + b;
					});

					var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
					return 'rgb(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ')';
				},
				getOuterHtml: function(el)
				{
					return $('<div>').append($(el).eq(0).clone()).html();
				},
				getAlignmentElement: function(el)
				{
					if ($.inArray(el.tagName, this.opts.alignmentTags) !== -1)
					{
						return $(el);
					}
					else
					{
						return $(el).closest(this.opts.alignmentTags.toString().toLowerCase(), this.$editor[0]);
					}
				},
				removeEmptyAttr: function(el, attr)
				{
					var $el = $(el);
					if (typeof $el.attr(attr) == 'undefined')
					{
						return true;
					}

					if ($el.attr(attr) === '')
					{
						$el.removeAttr(attr);
						return true;
					}

					return false;
				},
				removeEmpty: function(i, s)
				{
					var $s = $(s);

					$s.find('.redactor-invisible-space').removeAttr('style').removeAttr('class');

					if ($s.find('hr, br, img, iframe, source').length !== 0) return;
					var text = $.trim($s.text());
					if (this.utils.isEmpty(text, false))
					{
						$s.remove();
					}
				},

				// save and restore scroll
				saveScroll: function()
				{
					this.saveEditorScroll = this.$editor.scrollTop();
					this.saveBodyScroll = $(window).scrollTop();

					if (this.opts.scrollTarget) this.saveTargetScroll = $(this.opts.scrollTarget).scrollTop();
				},
				restoreScroll: function()
				{
					if (typeof this.saveScroll === 'undefined' && typeof this.saveBodyScroll === 'undefined') return;

					$(window).scrollTop(this.saveBodyScroll);
					this.$editor.scrollTop(this.saveEditorScroll);

					if (this.opts.scrollTarget) $(this.opts.scrollTarget).scrollTop(this.saveTargetScroll);
				},

				// get invisible space element
				createSpaceElement: function()
				{
					var space = document.createElement('span');
					space.className = 'redactor-invisible-space';
					space.innerHTML = this.opts.invisibleSpace;

					return space;
				},

				// replace
				removeInlineTags: function(node)
				{
					var tags = this.opts.inlineTags;
					tags.push('span');

					if (node.tagName == 'PRE') tags.push('a');

					$(node).find(tags.join(',')).not('span.redactor-selection-marker').contents().unwrap();
				},
				replaceWithContents: function(node, removeInlineTags)
				{
					var self = this;
					$(node).replaceWith(function()
					{
						if (removeInlineTags === true) self.utils.removeInlineTags(this);

						return $(this).contents();
					});

					return $(node);
				},
				replaceToTag: function(node, tag, removeInlineTags)
				{
					var replacement;
					var self = this;
					$(node).replaceWith(function()
					{
						replacement = $('<' + tag + ' />').append($(this).contents());

						for (var i = 0; i < this.attributes.length; i++)
						{
							replacement.attr(this.attributes[i].name, this.attributes[i].value);
						}

						if (removeInlineTags === true) self.utils.removeInlineTags(replacement);

						return replacement;
					});

					return replacement;
				},

				// start and end of element
				isStartOfElement: function()
				{
					var block = this.selection.getBlock();
					if (!block) return false;

					var offset = this.caret.getOffsetOfElement(block);

					return (offset === 0) ? true : false;
				},
				isEndOfElement: function(element)
				{
					if (typeof element == 'undefined')
					{
						var element = this.selection.getBlock();
						if (!element) return false;
					}

					var offset = this.caret.getOffsetOfElement(element);
					var text = $.trim($(element).text()).replace(/\n\r\n/g, '');

					return (offset == text.length) ? true : false;
				},
				isEndOfEditor: function()
				{
					var block = this.$editor[0];

					var offset = this.caret.getOffsetOfElement(block);
					var text = $.trim($(block).html().replace(/(<([^>]+)>)/gi,''));

					return (offset == text.length) ? true : false;
				},

				// test blocks
				isBlock: function(block)
				{
					block = block[0] || block;

					return block && this.utils.isBlockTag(block.tagName);
				},
				isBlockTag: function(tag)
				{
					if (typeof tag == 'undefined') return false;

					return this.reIsBlock.test(tag);
				},

				// tag detection
				isTag: function(current, tag)
				{
					var element = $(current).closest(tag);
					if (element.length == 1)
					{
						return element[0];
					}

					return false;
				},

				// select all
				isSelectAll: function()
				{
					return this.selectAll;
				},
				enableSelectAll: function()
				{
					this.selectAll = true;
				},
				disableSelectAll: function()
				{
					this.selectAll = false;
				},

				// parents detection
				isRedactorParent: function(el)
				{
					if (!el)
					{
						return false;
					}

					if ($(el).parents('.redactor-editor').length === 0 || $(el).hasClass('redactor-editor'))
					{
						return false;
					}

					return el;
				},
				isCurrentOrParentHeader: function()
				{
					return this.utils.isCurrentOrParent(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
				},
				isCurrentOrParent: function(tagName)
				{
					var parent = this.selection.getParent();
					var current = this.selection.getCurrent();

					if ($.isArray(tagName))
					{
						var matched = 0;
						$.each(tagName, $.proxy(function(i, s)
						{
							if (this.utils.isCurrentOrParentOne(current, parent, s))
							{
								matched++;
							}
						}, this));

						return (matched === 0) ? false : true;
					}
					else
					{
						return this.utils.isCurrentOrParentOne(current, parent, tagName);
					}
				},
				isCurrentOrParentOne: function(current, parent, tagName)
				{
					tagName = tagName.toUpperCase();

					return parent && parent.tagName === tagName ? parent : current && current.tagName === tagName ? current : false;
				},


				// browsers detection
				isOldIe: function()
				{
					return (this.utils.browser('msie') && parseInt(this.utils.browser('version'), 10) < 9) ? true : false;
				},
				isLessIe10: function()
				{
					return (this.utils.browser('msie') && parseInt(this.utils.browser('version'), 10) < 10) ? true : false;
				},
				isIe11: function()
				{
					return !!navigator.userAgent.match(/Trident\/7\./);
				},
				browser: function(browser)
				{
					var ua = navigator.userAgent.toLowerCase();
					var match = /(opr)[\/]([\w.]+)/.exec( ua ) ||
		            /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		            /(webkit)[ \/]([\w.]+).*(safari)[ \/]([\w.]+)/.exec(ua) ||
		            /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		            /(msie) ([\w.]+)/.exec( ua ) ||
		            ua.indexOf("trident") >= 0 && /(rv)(?::| )([\w.]+)/.exec( ua ) ||
		            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		            [];

					if (browser == 'safari') return (typeof match[3] != 'undefined') ? match[3] == 'safari' : false;
					if (browser == 'version') return match[2];
					if (browser == 'webkit') return (match[1] == 'chrome' || match[1] == 'opr' || match[1] == 'webkit');
					if (match[1] == 'rv') return browser == 'msie';
					if (match[1] == 'opr') return browser == 'webkit';

					return browser == match[1];
				}
			};
		}
	};

	$(window).on('load.tools.redactor', function()
	{
		$('[data-tools="redactor"]').redactor();
	});

	// constructor
	Redactor.prototype.init.prototype = Redactor.prototype;

	// LINKIFY
	$.Redactor.fn.formatLinkify = function(protocol, convertLinks, convertUrlLinks, convertImageLinks, convertVideoLinks, linkSize)
	{
		var urlCheck = '((?:http[s]?:\\/\\/(?:www\\.)?|www\\.){1}(?:[0-9A-Za-z\\-%_]+\\.)+[a-zA-Z]{2,}(?::[0-9]+)?(?:(?:/[0-9A-Za-z\\-#\\.%\+_]*)+)?(?:\\?(?:[0-9A-Za-z\\-\\.%_]+(?:=[0-9A-Za-z\\-\\.%_\\+]*)?)?(?:&(?:[0-9A-Za-z\\-\\.%_]+(?:=[0-9A-Za-z\\-\\.%_\\+]*)?)?)*)?(?:#[0-9A-Za-z\\-\\.%_\\+=\\?&;]*)?)';
		var regex = new RegExp(urlCheck, 'gi');
		var rProtocol = /(https?|ftp):\/\//i;
		var urlImage = new RegExp('(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*\\.(?:jpg|gif|png))(?:\\?([^#]*))?(?:#(.*))?', 'gi');

		var childNodes = (this.$editor ? this.$editor[0] : this).childNodes, i = childNodes.length;
		while (i--)
		{
			var n = childNodes[i];

			if (n.nodeType === 3 && n.parentNode !== 'PRE')
			{
				var html = n.nodeValue;

				// youtube & vimeo
				if (convertVideoLinks && html)
				{
					var iframeStart = '<iframe width="500" height="281" src="',
						iframeEnd = '" frameborder="0" allowfullscreen></iframe>';

					if (html.match(reUrlYoutube))
					{
						html = html.replace(reUrlYoutube, iframeStart + '//www.youtube.com/embed/$1' + iframeEnd);
						$(n).after(html).remove();
					}
					else if (html.match(reUrlVimeo))
					{
						html = html.replace(reUrlVimeo, iframeStart + '//player.vimeo.com/video/$2' + iframeEnd);
						$(n).after(html).remove();
					}
				}

				// image
				if (convertImageLinks && html && html.match(urlImage))
				{
					var matches = html.match(urlImage);
					html = html.replace(urlImage, '<img src="' + matches + '" />');

					$(n).after(html).remove();
					return;
				}

				// link
				if (html.search(/\$/g) != -1) html = html.replace(/\$/g, '&#36;');

				var matches = html.match(regex);
				if (convertUrlLinks && html && matches)
				{
					var len = matches.length;
					for (var z = 0; z < len; z++)
					{
						// remove dot in the end
						if (matches[z].match(/\.$/) !== null) matches[z] = matches[z].replace(/\.$/, '');

						var href = matches[z];
						var text = href;

						var space = '';
						if (href.match(/\s$/) !== null) space = ' ';

						var addProtocol = protocol + '://';
						if (href.match(rProtocol) !== null) addProtocol = '';

						if (text.length > linkSize) text = text.substring(0, linkSize) + '...';
						text = text.replace(/&#36;/g, '$').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

						// buffer
						var buffer = [];
						var links = html.match('<a(.*?)</a>');
						if (links !== null)
						{
							var len = links.length;
							for (i = 0; i < len; i++)
							{
								buffer[i] = links[i];
								html = html.replace(links[i], '{abuffer' + i + '}');
							}
						}

						html = html.replace(href, '<a href=\"' + addProtocol + $.trim(href) + '\">' + $.trim(text) + '</a>' + space);

						// rebuffer
						$.each(buffer, function(i,s)
						{
							html = html.replace('{abuffer' + i + '}', s);
						});
					}

					$(n).after(html).remove();
				}
			}
			else if (n.nodeType === 1 && !/^(pre|a|button|textarea)$/i.test(n.tagName))
			{
				$.Redactor.fn.formatLinkify.call(n, protocol, convertLinks, convertUrlLinks, convertImageLinks, convertVideoLinks, linkSize);
			}
		}
	};

})(jQuery);
$().ready(function () {

    // kickstart foundation
    $(document).foundation({
        equalizer: {
            // Specify if Equalizer should make elements equal height once they become stacked.
            equalize_on_stack: false
        }
    });

    // bezier curve
    var easingSwiftOut = [.55, 0, .1, 1];
    var easingSwiftIn = [.9, 0, .45, 1];

    $('input[type=color]').spectrum({
        preferredFormat: "hex",
        chooseText: "Select",
        showInitial: true,
        clickoutFiresChange: true,
        showInput: true
    });


    $('.wysiwyg').redactor({
        buttons: ['bold', 'italic', 'link']
    });

});