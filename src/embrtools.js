(function (context) {

  "use strict";

  var embrtools = context.embrtools = {};

  embrtools.loadImageTexture = function (texture, url, onload) {
    var img = new Image();
    img.crossOrigin = "anonymous"; // Appease the x-domain gods

    img.onload = function () {
      texture.set({ element: img });
      if(typeof onload == 'function')
        onload();
    };
    img.onerror = function (err) {
      console.error("Error loading texture from '%s'", url);
    };

    img.src = url;
  };

})(this);
