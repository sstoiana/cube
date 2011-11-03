var util = require("util"),
    dgram = require('dgram'),
    options = require("./quantity-config"),
    count = 0,
    batch = 10,
    start = Date.now(),
    offset = 0;

var client = {
  send: function(data) {
    var message = new Buffer(JSON.stringify(data));
    var client = dgram.createSocket("udp4");
    client.send(message, 0, message.length, 1180, "localhost");
    client.close();
  }
};

// Emit random values.
var interval = setInterval(function() {
  for (var i = -1; ++i < batch;) {
    client.send({
      type: "random",
      time: new Date(Date.now()),
      data: {random: Math.random()}
    });
    count++;
  }
  var duration = Date.now() - start;
  console.log(count + " events in " + duration + " ms: " + Math.round(1000 * count / duration) + " sps");
}, 10);

// Display stats on shutdown.
process.on("SIGINT", function() {
  clearInterval(interval);
});
