/*

metrics.js - QuantifyTelemetryEvents.metrics() test

The MIT License (MIT)

Copyright (c) 2014 Leora Pearson, Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

"use strict";

var events = require('events');
var Quantify = require('quantify');
var QuantifyTelemetryEvents = require('../index.js');
var VALID_CONFIG = require('./util/validConfig.js');

var telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);

var UNIT_MAP = {
    'counter': 'unit',
    'gauge': 'unit',
    'histogram': {
        measureUnit: 'measure-unit',
        sampleSizeUnit: 'sample-size-unit'
    },
    'meter': {
        rateUnit: 'rate-unit',
        updateCountUnit: 'update-count-unit'
    },
    'timer': {
        measureUnit: 'measure-unit',
        rateUnit: 'rate-unit',
        sampleSizeUnit: 'sample-size-unit'
    }
};

var tests = module.exports = {};

tests["should call individual metric methods"] = function (test) {
    test.expect(5);
    var metricsRegistry = new Quantify();
    Quantify.METRIC_TYPES.forEach(function (entry, i) {
        metricsRegistry[entry]("foo", UNIT_MAP[entry]);
    });
    var metrics = metricsRegistry.getMetrics();
    Quantify.METRIC_TYPES.forEach(function (entry, i) {
        telemetry[entry] = function(name, metric) {
            test.deepEqual(metric, metrics[Quantify.METRICS[i]][name]);
        };
    });
    telemetry.metrics(metrics);
    test.done();
};

tests["should call specified individual metric methods"] = function (test) {
    test.expect(4);
    var metricsRegistry = new Quantify();
    Quantify.METRIC_TYPES.forEach(function (entry, i) {
        if (entry == "gauge") {
            return;
        }
        metricsRegistry[entry]("foo", UNIT_MAP[entry]);
    });
    var metrics = metricsRegistry.getMetrics();
    Quantify.METRIC_TYPES.forEach(function (entry, i) {
        telemetry[entry] = function(name, metric) {
            test.deepEqual(metric, metrics[Quantify.METRICS[i]][name]);
        };
    });
    telemetry.metrics(metrics);
    test.done();
};

tests["should return array of events created by specified individual metric methods"] = function (test) {
    test.expect(7);
    var metricsRegistry = new Quantify();
    Quantify.METRIC_TYPES.forEach(function (entry, i) {
        if (entry == "gauge") {
            return;
        }
        metricsRegistry[entry]("foo", UNIT_MAP[entry]);
    });
    var metrics = metricsRegistry.getMetrics();
    Quantify.METRIC_TYPES.forEach(function (entry) {
        telemetry[entry] = function(name, metric) {
            return entry;
        };
    });
    var events = telemetry.metrics(metricsRegistry.getMetrics());
    test.ok(events instanceof Array, "should have returned an array of events");
    test.equal(events.length, 4);
    Quantify.METRIC_TYPES.forEach(function (entry) {
        if (entry == "gauge") {
            test.ok(events.indexOf(entry) < 0, entry + " should not be in events");
            return;
        }
        test.ok(events.indexOf(entry) >= 0, entry + " is missing from events");
    });
    test.done();
};
