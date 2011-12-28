exports.putter = function(putter) {
  var values = {},
      queue = [],
      flushInterval,
      flushDelay = 5000;

  function store(value, i, event, name) {
    var v1 = value.values[i];
    event[name] = v1;
    return;
    // bypass all of the value type processing
    switch (value.dstypes[i]) {
      case "gauge": 
      case "absolute": {
        event[name] = v1;
        break;
      }
      case "derive": 
      case "counter": {
        var k = value.host
            + "/" + value.plugin + "/" + value.plugin_instance
            + "/" + value.type + "/" + value.type_instance
            + "/" + name;
        event[name] = k in values
            ? -(values[k] - (values[k] = v1))
            : (values[k] = v1, 0);
        break;
      }
    }
  }

  flushInterval = setInterval(function() {
    var hosts = {},
        latest = Date.now() - 2 * flushDelay, // to coalesce
        retries = [];

    queue.forEach(function(value) {
      if (value.time > latest) {
        retries.push(value);
      } else {
        var host = hosts[value.host] || (hosts[value.host] = {}),
            event = host[value.time] || (host[value.time] = {});
        event = event[value.plugin] || (event[value.plugin] = {host: value.host});
        if (value.plugin_instance) event = event[value.plugin_instance] || (event[value.plugin_instance] = {});
        if (value.type != value.plugin) event = event[value.type] || (event[value.type] = {});
        if (value.values.length == 1) store(value, 0, event, value.type_instance);
        else value.values.forEach(function(d, i) { store(value, i, event, value.dsnames[i]); });
      }
    });

    queue = retries;

    for (var host in hosts) {
      for (var time in hosts[host]) {
        for (var type in hosts[host][time]) {
          putter({
            type: "collectd_" + type,
            time: new Date(+time),
            data: hosts[host][time][type]
          });
        }
      }
    }
  }, flushDelay);

  return function(request, response) {
    var content = "";
    request.on("data", function(chunk) {
      content += chunk;
    });
    request.on("end", function() {
      JSON.parse(content).forEach(function(value) {
        value.time = Math.round(value.time * 1000);
        queue.push(value);
      });
      response.writeHead(200);
      response.end();
    });
  };
};