/*

gauge.js - QuantifyTelemetryEvents.gauge() test

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

function assertBaseGaugeEvent(test, event, overrides) {
    overrides = overrides || {};
    if (!('type' in overrides)) {
       assertEqual(test, "event.type", event.type, 'metric');
    }
    if (!('name' in overrides)) {
        assertEqual(test, "event.name", event.name, "some_name");
    }
    if (!('target_type' in overrides)) {
       assertEqual(test, "event.target_type", event.target_type, 'gauge');
    }
    if (!('value' in overrides)) {
        assertEqual(test, "event.value", event.value, 0);
    }
    if (!('unit' in overrides)) {
        assertEqual(test, "event.unit", event.unit, "some_unit");
    }
}

var tests = module.exports = {};

tests['returns gauge event'] = function(test) {
    test.expect(5);
    var telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);
    var metricsRegistry = new Quantify();
    metricsRegistry.gauge("foo", "some_unit");
    var data = metricsRegistry.getMetrics();
    var gauge = data.gauges.foo;
    var event = telemetry.gauge("some_name", gauge);
    assertBaseGaugeEvent(test, event);
    test.done();
};

tests['returns gauge event with metadata'] = function(test) {
    test.expect(6);
    var telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);
    var metricsRegistry = new Quantify();
    var metadata = {some_tag: "some_tag"};
    metricsRegistry.gauge("foo", "some_unit", metadata);
    var data = metricsRegistry.getMetrics();
    var gauge = data.gauges.foo;
    var event = telemetry.gauge("some_name", gauge);
    assertBaseGaugeEvent(test, event, metadata);
    assertEqual(test, "event.some_tag", event.some_tag, metadata.some_tag);
    test.done();
};

tests['returns gauge event with metadata containing overrides (for default event properties)'] = function(test) {
    test.expect(5);
    var telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);
    var metricsRegistry = new Quantify();
    var metadata = {type: "blah"};
    metricsRegistry.gauge("foo", "some_unit", metadata);
    var data = metricsRegistry.getMetrics();
    var gauge = data.gauges.foo;
    var event = telemetry.gauge("some_name", gauge);
    assertBaseGaugeEvent(test, event, metadata);
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
    metricsRegistry.gauge("foo", "some_unit");
    var data = metricsRegistry.getMetrics();
    var gauge = data.gauges.foo;
    var returnedEvent = telemetry.gauge("some_name", gauge);
    test.strictEqual(emittedEvent, returnedEvent, "emitted event and returned event are not the same");
    test.done();
};
