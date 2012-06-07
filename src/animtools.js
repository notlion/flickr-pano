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


  // Arcball Camera

  function vec3LengthSq (vec) {
    var x = vec[0], y = vec[1], z = vec[2];
    return x * x + y * y + z * z;
  }

  function getElementOffset (el) {
    var x = 0, y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { x: x, y: y };
  }

  animtools.Arcball = function (canvas, dd) {
    var rotation = quat4.create([ 0, 0, 0, 1 ])
      , initial_rotation = quat4.create()
      , mouse_down_x, mouse_down_y
      , invert_x = true, invert_y = false;

    function getCanvasToSpherePnt (x, y) {
      var sx = canvas.clientWidth / 2
        , sy = canvas.clientHeight / 2
        , sr = Math.sqrt(sx * sx + sy * sy);

      var pos = vec3.create([ (x - sx) / sr, (y - sy) / sr, 0 ]);

      if(invert_x === true) pos[0] *= -1;
      if(invert_y === true) pos[1] *= -1;

      var len2 = vec3LengthSq(pos);
      if(len2 < 1)
        pos[2] = Math.sqrt(1 - len2);

      vec3.normalize(pos);

      return pos;
    }

    function onMouseDrag (e) {
      var off = getElementOffset(canvas)
        , x = e.clientX - off.x
        , y = e.clientY - off.y;

      var pos_from = getCanvasToSpherePnt(mouse_down_x, mouse_down_y);
      var pos_to = getCanvasToSpherePnt(x, y);
      var axis = vec3.cross(pos_to, pos_from, vec3.create());

      var current_rotation = quat4.create([
        axis[0], axis[1], axis[2], vec3.dot(pos_from, pos_to)
      ]);

      quat4.multiply(initial_rotation, current_rotation, rotation);
      quat4.normalize(rotation);

      dd.setDirty();
    }

    function onMouseUp (e) {
      document.removeEventListener("mousemove", onMouseDrag);
      document.removeEventListener("mouseup", onMouseUp);
    }

    function onMouseDown (e) {
      e.preventDefault();
      mouse_down_x = e.clientX;
      mouse_down_y = e.clientY;
      quat4.set(rotation, initial_rotation);
      document.addEventListener("mousemove", onMouseDrag);
      document.addEventListener("mouseup", onMouseUp, true);
    }

    this.setRotation = function (q) {
      quat4.set(q, rotation);
    };

    this.getRotationMat3 = function () {
      return mat3.inverse(quat4.toMat3(rotation));
    };

    canvas.addEventListener("mousedown", onMouseDown);
  };

})(this);
