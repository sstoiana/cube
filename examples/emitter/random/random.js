var util = require("util"),
    dgram = require('dgram'),
    options = require("./random-config"),
    count = 0,
    batch = 10,
    hour = 60 * 60 * 1000,
    start = Date.now(),
    offset = -Math.abs(random()) * 0.1 * hour;

var client = {
  send: function(data) {
    var message = new Buffer(JSON.stringify(data));
    var client = dgram.createSocket("udp4");
    client.send(message, 0, message.length, options['udp-port'], options['udp-host']);
    client.close();
  }
};

// Emit random values.
var interval = setInterval(function() {
  for (var i = -1; ++i < batch;) {
    client.send({
      type: "random",
      time: new Date(Date.now() + random() * 2 * hour + offset),
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

// Sample from a normal distribution with mean 0, stddev 1.
function random() {
  var x = 0, y = 0, r;
  do {
    x = Math.random() * 2 - 1;
    y = Math.random() * 2 - 1;
    r = x * x + y * y;
  } while (!r || r > 1);
  return x * Math.sqrt(-2 * Math.log(r) / r);
}
