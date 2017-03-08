/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {

  'use strict';

  // defaultPrevented is broken in IE.
  // https://connect.microsoft.com/IE/feedback/details/790389/event-defaultprevented-returns-false-after-preventdefault-was-called
  var workingDefaultPrevented = (function() {
    var e = document.createEvent('Event');
    e.initEvent('foo', true, true);
    e.preventDefault();
    return e.defaultPrevented;
  })();

  if (!workingDefaultPrevented) {
    var origPreventDefault = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function() {
      if (!this.cancelable) {
        return;
      }

      origPreventDefault.call(this);

      Object.defineProperty(this, 'defaultPrevented', {
        get: function() {
          return true;
        },
        configurable: true
      });
    };
  }

  var isIE = /Trident/.test(navigator.userAgent);

  // CustomEvent constructor shim
  if (!window.CustomEvent || isIE && (typeof window.CustomEvent !== 'function')) {
    window.CustomEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
      return e;
    };
    window.CustomEvent.prototype = window.Event.prototype;
  }

  // Event constructor shim
  if (!window.Event || isIE && (typeof window.Event !== 'function')) {
    var origEvent = window.Event;
    window.Event = function(inType, params) {
      params = params || {};
      var e = document.createEvent('Event');
      e.initEvent(inType, Boolean(params.bubbles), Boolean(params.cancelable));
      return e;
    };
    if (origEvent) {
      for (var i in origEvent) {
        window.Event[i] = origEvent[i];
      }
    }
    window.Event.prototype = origEvent.prototype;
  }

  if (!window.MouseEvent || isIE && (typeof window.MouseEvent !== 'function')) {
    var origMouseEvent = window.MouseEvent;
    window.MouseEvent = function(inType, params) {
      params = params || {};
      var e = document.createEvent('MouseEvent');
      e.initMouseEvent(inType,
        Boolean(params.bubbles), Boolean(params.cancelable),
        params.view || window, params.detail,
        params.screenX, params.screenY, params.clientX, params.clientY,
        params.ctrlKey, params.altKey, params.shiftKey, params.metaKey,
        params.button, params.relatedTarget);
      return e;
    };
    if (origMouseEvent) {
      for (var i in origMouseEvent) {
        window.MouseEvent[i] = origMouseEvent[i];
      }
    }
    window.MouseEvent.prototype = origMouseEvent.prototype;
  }

  // ES6 stuff
  if (!Array.from) {
    Array.from = function(object) {
      return [].slice.call(object);
    };
  }

  if (!Object.assign) {
    var assign = function(target, source) {
      var n$ = Object.getOwnPropertyNames(source);
      for (var i = 0, p; i < n$.length; i++) {
        p = n$[i];
        target[p] = source[p];
      }
    }

    Object.assign = function(target, sources) {
      var args = [].slice.call(arguments, 1);
      for (var i = 0, s; i < args.length; i++) {
        s = args[i];
        if (s) {
          assign(target, s);
        }
      }
      return target;
    }
  }

  defineParentNodeProperties(Document);
  defineParentNodeProperties(DocumentFragment);

  /** 
   * Defines the `ParentNode` properties on the constructor prototype.
   * https://developer.mozilla.org/en-US/docs/Web/API/ParentNode
   */
  function defineParentNodeProperties(constructor) {
    if ('firstElementChild' in constructor.prototype === false) {
      Object.defineProperty(constructor.prototype, 'firstElementChild', {
        get: function() {
          var child = this.firstChild;
          while (child && child.nodeType !== Node.ELEMENT_NODE) {
            child = child.nextSibling;
          }
          return child;
        },
        configurable: true,
        enumerable: true
      });
    }

    if ('lastElementChild' in constructor.prototype === false) {
      Object.defineProperty(constructor.prototype, 'lastElementChild', {
        get: function() {
          var child = this.childNodes[this.childNodes.length - 1];
          while (child && child.nodeType !== Node.ELEMENT_NODE) {
            child = child.previousSibling;
          }
          return child;
        },
        configurable: true,
        enumerable: true
      });
    }

    if ('children' in constructor.prototype === false) {
      Object.defineProperty(constructor.prototype, 'children', {
        get: function() {
          var child = this.firstElementChild,
            children = [];
          while (child) {
            children.push(child);
            child = child.nextElementSibling;
          }
          return children;
        },
        configurable: true,
        enumerable: true
      });
    }

    if ('childElementCount' in constructor.prototype === false) {
      Object.defineProperty(constructor.prototype, 'childElementCount', {
        get: function() {
          var child = this.firstElementChild,
            count = 0;
          while (child) {
            count++;
            child = child.nextElementSibling;
          }
          return count;
        },
        configurable: true,
        enumerable: true
      });
    }
  }

})(window.WebComponents);