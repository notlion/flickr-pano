(function (context) {

  var embrtools = context.embrtools = {};

  embrtools.createImageTexture = function (url, onload) {
    var texture = new Embr.Texture();
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

    return texture;
  };

})(this);
