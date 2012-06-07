(function () {

  function Viewport () {
    var canvas, gl, plane, shader, bg_texture, pano_texture
      , transform = mat4.identity()
      , dd, arcball;

    mat4.rotateX(transform, Math.PI / 2);

    function initGLContext () {
      try {
        gl = canvas.getContext("webgl") ||
             canvas.getContext("experimental-webgl");
      }
      catch(err) {}

      if(gl)
        Embr.setContext(gl);
      else
        console.error("Could not create a GL context. Boo.");
    }

    function initGfx () {
      var vsrc = document.getElementById("prog-vs").textContent;
      var fsrc = document.getElementById("prog-fs").textContent;
      shader = new Embr.Program(vsrc, fsrc).link();

      var positions = [ -1, -1, 0, 1, -1, 1, 0, 1, 1, -1, 0, 1, 1, 1, 0, 1 ];
      var texcoords = [ -1, -1, -1, 1, 1, -1, 1, 1, ];
      plane = new Embr.Vbo(gl.TRIANGLE_STRIP)
        .setAttr("position", { data: positions, size: 4 })
        .setAttr("texcoord", { data: texcoords, size: 2 })
        .setProg(shader);

      bg_texture = new Embr.Texture();
      embrtools.loadImageTexture(bg_texture, "img/grid.png", onTextureLoaded);

      hq_texture = new Embr.Texture();
    }

    function onTextureLoaded () {
      dd.setDirty();
    }

    this.init = function (_canvas) {
      canvas = _canvas;

      initGLContext();
      initGfx();

      dd = new animtools.DirtyDraw().setDrawFn(this.draw);
      arcball = new animtools.Arcball(canvas, dd);

      this.layout();
    };

    this.loadPhoto = function (id) {
      $.ajax({
        url:      "http://api.flickr.com/services/rest/",
        dataType: "jsonp",
        jsonp:    "jsoncallback",
        data: {
          "format": "json",
          "method": "flickr.photos.getSizes",
          "api_key": "70e4fbb4653619825eeb58f31d66075b",
          "photo_id": id
        }
      }).done(function (res) {
        console.log(res);
        var url = "http://localhost:1337/?img=" + res.sizes.size[10].source;
        // var url = res.sizes.size[10].source;
        embrtools.loadImageTexture(hq_texture, url, onTextureLoaded);
      });
    };

    this.onMouseDown = function (e) {
    };
    this.onMouseUp = function (e) {
    };

    this.layout = function () {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      dd.setDirty();
    };

    this.draw = function () {
      gl.viewport(0, 0, canvas.width, canvas.height);
      bg_texture.bind(0);
      hq_texture.bind(1);
      shader.use({
        u_transform: arcball.getRotationMat3(),
        u_bg_texture: bg_texture.params.unit,
        u_hq_texture: hq_texture.params.unit,
        u_scale: 1,
        u_aspect: canvas.width / canvas.height
      })
      plane.draw();
    };
  }

  var view;

  window.addEventListener("load", function () {
    view = new Viewport();
    view.init(document.getElementById("gl-canvas"));
    view.loadPhoto("7299382820");
  });
  window.addEventListener("resize", function () {
    view.layout();
  });

})();
