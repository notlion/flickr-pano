// Flickr supports cross-domain image loading, but only from Flash.
// For WebGL we need to proxy all image loads and give them a more liberal
// CORS policy. Hopefully this will change soon!

var http = require("http");
var url = require("url");

var server = http.createServer(function (req, res) {
  var query = url.parse(req.url, true).query;

  function replyNotFound () {
    res.writeHead(404);
    res.end("none");
  }

  if(query && query.img) {
    // Grab Image from Flickr
    var img_url = url.parse(query.img);
    http.get({
      host: img_url.host,
      path: img_url.path,
      headers: req.headers
    },
    function (flickr_res) {
      if(flickr_res.statusCode == 200) {
        flickr_res.headers["access-control-allow-origin"] = "*";
        res.writeHead(200, flickr_res.headers);
        flickr_res.on("data", function (chunk) {
          res.write(chunk, "binary"); // .. and Write to Client
        });
        flickr_res.on("end", function () {
          res.end();
        });
      }
      else {
        replyNotFound();
      }
    }).on("error", function (err) {
      replyNotFound();
    });
  }
  else {
    replyNotFound();
  }
});

var port = process.env.PORT || 1337;

server.listen(port, function () {
  console.log("Listening on port " + port);
});
