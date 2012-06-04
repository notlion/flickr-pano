(function (context) {

  "use strict";

  var animtools = context.animtools = {};


  var requestAnimFrameFn = (function () {
    return window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.oRequestAnimationFrame      ||
           window.msRequestAnimationFrame     ||
           function (callback) {
             window.setTimeout(callback, 1000 / 60);
           };
  })();
  animtools.requestAnimationFrame = function (callback) {
    requestAnimFrameFn.call(window, callback); // Call in window scope
  };


  var DirtyDraw = animtools.DirtyDraw = function () {
    var dirty = false
      , draw_fn = null
      , self = this;

    function callDraw () {
      dirty = false;
      draw_fn.call(self);
    }

    this.setDirty = function (_dirty) {
      if(_dirty === undefined)
        _dirty = true;
      if(_dirty !== dirty) {
        dirty = _dirty;
        if(dirty && draw_fn)
          requestAnimFrameFn.call(window, callDraw);
      }
      return self;
    };
    this.getDirty = function () {
      return dirty;
    };

    this.setDrawFn = function (fn) {
      draw_fn = fn;
      return self;
    };
  };

})(this);
