var vows = require("vows"),
    assert = require("assert"),
    reduces = require("../lib/cube/server/reduces");

var suite = vows.describe("reduces");

suite.addBatch({
  "reduces": {
    "contains exactly the expected reduces": function() {
      var keys = [];
      for (var key in reduces) {
        keys.push(key);
      }
      keys.sort();
      assert.deepEqual(keys, ["distinct",
                              "max",
                              "median",
                              "min",
                              "percentile",
                              "sum"]);
    }
  },

  "distinct": {
    topic: function() {
      return reduces.distinct;
    },
    "empty is zero": function(reduce) {
      assert.strictEqual(reduce.empty, 0);
    },
    "is not pyramidal": function(reduce) {
      assert.isTrue(!reduce.pyramidal);
    },
    "returns the number of distinct values": function(reduce) {
      assert.equal(reduce([1, 2, 3, 2, 1]), 3);
    },
    "determines uniqueness based on string coercion": function(reduce) {
      assert.equal(reduce([{}, {}, {}]), 1);
      assert.equal(reduce([{}, "[object Object]", new Object]), 1);
      assert.equal(reduce([new Number(1), 1, "1"]), 1);
      assert.equal(reduce([new Number(1), 2, "3", "2", 3, new Number(1)]), 3);
      assert.equal(reduce([{toString: function() { return 1; }}, 1, 2]), 2);
    }
  },

  "max": {
    topic: function() {
      return reduces.max;
    },
    "empty is undefined": function(reduce) {
      assert.strictEqual(reduce.empty, undefined);
    },
    "is pyramidal": function(reduce) {
      assert.isTrue(reduce.pyramidal);
    },
    "returns the maximum value": function(reduce) {
      assert.equal(reduce([1, 2, 3, 2, 1]), 3);
    },
    "ignores undefined and NaN": function(reduce) {
      assert.equal(reduce([1, NaN, 3, undefined, null]), 3);
    },
    "compares using natural order": function(reduce) {
      assert.equal(reduce([2, 10, 3]), 10);
      assert.equal(reduce(["2", "10", "3"]), "3");
      assert.equal(reduce(["2", "10", 3]), 3); // "2" < "10", "10" < 3
      assert.equal(reduce([3, "2", "10"]), "10"); // "2" < 3, 3 < "10"
    },
    "returns the first of equal values": function(reduce) {
      assert.strictEqual(reduce([1, new Number(1)]), 1);
    }
  },

  "median": {
    topic: function() {
      return reduces.median;
    },
    "empty is zero": function(reduce) {
      assert.strictEqual(reduce.empty, 0);
    },
    "is not pyramidal": function(reduce) {
      assert.isTrue(!reduce.pyramidal);
    },
    "returns the median value": function(reduce) {
      assert.equal(reduce([1, 2, 3, 2, 1]), 2);
      assert.equal(reduce([1, 2, 4, 2, 1, 4, 4, 4]), 3);
    },
    "sorts input in-place": function(reduce) {
      var values = [1, 2, 3, 2, 1];
      reduce(values);
      assert.deepEqual(values, [1, 1, 2, 2, 3]);
    },
    "ignores undefined and NaN": function(reduce) {
      assert.equal(reduce([1, NaN, 3, undefined, 0]), 0);
    }
  },

  "min": {
    topic: function() {
      return reduces.min;
    },
    "empty is undefined": function(reduce) {
      assert.strictEqual(reduce.empty, undefined);
    },
    "is pyramidal": function(reduce) {
      assert.isTrue(reduce.pyramidal);
    },
    "returns the minimum value": function(reduce) {
      assert.equal(reduce([1, 2, 3, 2, 1]), 1);
    },
    "ignores undefined and NaN": function(reduce) {
      assert.equal(reduce([1, NaN, 3, undefined, 0]), 0);
    },
    "compares using natural order": function(reduce) {
      assert.equal(reduce([2, 10, 3]), 2);
      assert.equal(reduce(["2", "10", 3]), 3); // "2" > "10", 3 > "2"
      assert.equal(reduce([3, "2", "10"]), "10"); // 3 > "2", "2" > "10"
    },
    "returns the first of equal values": function(reduce) {
      assert.strictEqual(reduce([1, new Number(1)]), 1);
    }
  },

  "percentile": {
    topic: function() {
      return reduces.percentile;
    },
    "empty is zero": function(reduce) {
      assert.strictEqual(reduce.empty, 0);
    },
    "is not pyramidal": function(reduce) {
      assert.isTrue(!reduce.pyramidal);
    },
    "returns the median value when requested": function(reduce) {
      assert.equal(reduce([1, 2, 3, 2, 1], "0.5"), 2);
      assert.equal(reduce([1, 2, 4, 2, 1, 4, 4, 4], "0.5"), 3);
    },
    "returns a percentile value": function(reduce) {
      assert.equal(reduce([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], '0.9'), 9);
      assert.equal(reduce([10, 1, 2, 3, 5, 7, 6, 4, 8, 9, 0], '0.9'), 9);
    },
    "sorts input in-place": function(reduce) {
      var values = [1, 2, 3, 2, 1];
      reduce(values);
      assert.deepEqual(values, [1, 1, 2, 2, 3]);
    },
    "ignores undefined and NaN": function(reduce) {
      assert.equal(reduce([1, NaN, 3, undefined, 0], "0.5"), 0);
    }
  },

  "sum": {
    topic: function() {
      return reduces.sum;
    },
    "empty is zero": function(reduce) {
      assert.strictEqual(reduce.empty, 0);
    },
    "is pyramidal": function(reduce) {
      assert.isTrue(reduce.pyramidal);
    },
    "returns the sum of values": function(reduce) {
      assert.equal(reduce([1, 2, 3, 2, 1]), 9);
      assert.equal(reduce([1, 2, 4, 2, 1, 4, 4, 4]), 22);
    },
    "does not ignore undefined and NaN": function(reduce) {
      assert.isNaN(reduce([1, NaN, 3, undefined, 0]));
    }
  }
});

suite.export(module);
