/*

histogram.js - QuantifyTelemetryEvents.histogram() test

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
var QuantifyTelemetryEvents = require('../index.js');
var Quantify = require('quantify');
var VALID_CONFIG = require('./util/validConfig.js');

function assertEqual(test, thingy, actualValueOfThingy, expectedValueOfThingy) {
    test.equal(actualValueOfThingy, expectedValueOfThingy, "expected value for " + thingy + " was '" + expectedValueOfThingy + "' but received '" + actualValueOfThingy + "'");
}

function assertBaseHistogramEvent(test, event, overrides) {
    overrides = overrides || {};
    if (!('type' in overrides)) {
       assertEqual(test, "event.type", event.type, 'metric');
    }
    if (!('name' in overrides)) {
        assertEqual(test, "event.name", event.name, "some_name");
    }
    if (!('target_type' in overrides)) {
       assertEqual(test, "event.target_type", event.target_type, 'histogram');
    }
    if (!('value' in overrides)) {
        Quantify.HISTOGRAM_MEASURE_FIELDS.forEach(function(field) {
            assertEqual(test, "event.value." + field, event.value[field], 0);
        });
        assertEqual(test, "event.value.measureUnit", event.value.measureUnit, "some_measureUnit");
        assertEqual(test, "event.value.sampleSize", event.value.sampleSize, 0);
        assertEqual(test, "event.value.sampleSizeUnit", event.value.sampleSizeUnit, "some_sampleSizeUnit");
    }
}

var tests = module.exports = {};

tests['returns histogram event'] = function(test) {
    test.expect(16);
    var telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);
    var metricsRegistry = new Quantify();
    metricsRegistry.histogram("foo", {measureUnit: "some_measureUnit", sampleSizeUnit: "some_sampleSizeUnit"});
    var data = metricsRegistry.getMetrics();
    var histogram = data.histograms.foo;
    var event = telemetry.histogram("some_name", histogram);
    assertBaseHistogramEvent(test, event);
    test.done();
};

tests['returns histogram event with metadata'] = function(test) {
    test.expect(17);
    var telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);
    var metricsRegistry = new Quantify();
    var metadata = {some_tag: "some_tag"};
    metricsRegistry.histogram("foo", {measureUnit: "some_measureUnit", sampleSizeUnit: "some_sampleSizeUnit"}, metadata);
    var data = metricsRegistry.getMetrics();
    var histogram = data.histograms.foo;
    var event = telemetry.histogram("some_name", histogram);
    assertBaseHistogramEvent(test, event, metadata);
    assertEqual(test, "event.some_tag", event.some_tag, metadata.some_tag);
    test.done();
};

tests['returns histogram event with metadata containing overrides (for default event properties)'] = function(test) {
    test.expect(16);
    var telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);
    var metricsRegistry = new Quantify();
    var metadata = {type: "blah"};
    metricsRegistry.histogram("foo", {measureUnit: "some_measureUnit", sampleSizeUnit: "some_sampleSizeUnit"}, metadata);
    var data = metricsRegistry.getMetrics();
    var histogram = data.histograms.foo;
    var event = telemetry.histogram("some_name", histogram);
    assertBaseHistogramEvent(test, event, metadata);
    assertEqual(test, "event.type", event.type, metadata.type);
    test.done();
};

tests["should call _telemetry.emit() to emit event"] = function(test) {
    test.expect(1);
    var emittedEvent;
    var telemetry = new QuantifyTelemetryEvents({
            telemetry: {
                emit: function (event) {
                    emittedEvent = event;
                    return emittedEvent;
                }
            }
        });
    var metricsRegistry = new Quantify();
    metricsRegistry.histogram("foo", {measureUnit: "some_measureUnit", sampleSizeUnit: "some_sampleSizeUnit"});
    var data = metricsRegistry.getMetrics();
    var histogram = data.histograms.foo;
    var returnedEvent = telemetry.histogram("some_name", histogram);
    test.strictEqual(emittedEvent, returnedEvent, "emitted event and returned event are not the same");
    test.done();
};
