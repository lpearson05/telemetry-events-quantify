/*

index.js: quantify-telemetry-events

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

var Quantify = require('quantify');

module.exports = QuantifyTelemetryEvents;

/*
  * `config`: _Object_
    * `telemetry`: _TelemetryEvents_ Instance of TelemetryEvents to use for processing.
*/
var REQUIRED_CONFIG_PROPERTIES = ["package"];

function QuantifyTelemetryEvents(config) {
    var self = this;

    config = config || {};

    REQUIRED_CONFIG_PROPERTIES.forEach(function(property) {
        if (!(self["_" + property] = config[property])) {
            throw new Error("config is missing required property: " + property);
        }
    });

    self._emitter = config.emitter;
    if (self._emitter) {
        self._eventName = config.eventName || "telemetry";
    } else {
        if (config.eventName) {
            throw new Error("'eventName' property specified in 'config' without corresponding 'emitter' property");
        }
    }
};

/*
  * `event`: _Object_ Event to be emitted.
*/
QuantifyTelemetryEvents.prototype.emit = function emit(event) {
    var self = this;

    if (self._emitter) {
        self._emitter.emit(self._eventName, event);
    }
};

/*
  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `unit`: _String_ Unit to be used for the metric `event.unit` property.
  * `c`: _Object_ Quantify calculated counter to process.
*/
QuantifyTelemetryEvents.prototype.counter = function counter(name, unit, c) {
    var self = this;

    var event = {
        type: 'metric',
        timestamp: new Date().toISOString(),
        module: self._package.name,
        version: self._package.version,
        name: name,
        value: c.value,
        unit: unit,
        target_type: 'counter'
    };
    if (c.metadata) {
        Object.keys(c.metadata).forEach(function(key) {
            event[key] = c.metadata[key];
        });
    }

    self.emit(event);

    return event;
};

/*
  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `unit`: _String_ Unit to be used for the metric `event.unit` property.
  * `g`: _Object_ Quantify calculated gauge to process.
*/
QuantifyTelemetryEvents.prototype.gauge = function gauge(name, unit, g) {
    var self = this;

    var event = {
        type: 'metric',
        timestamp: new Date().toISOString(),
        module: self._package.name,
        version: self._package.version,
        name: name,
        value: g.value,
        unit: unit,
        target_type: 'gauge'
    };
    if (g.metadata) {
        Object.keys(g.metadata).forEach(function(key) {
            event[key] = g.metadata[key];
        });
    }

    self.emit(event);

    return event;
};

/*
  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `measureUnit`: _String_ Unit to be used for the metric `event.value.measureUnit` property for all HISTOGRAM_MEASURE_FIELDS.
  * `sampleSizeUnit`: _String_ Unit to be used for the metric `event.value.sampleSizeUnit` property for `size` field.
  * `h`: _Object_ Quantify calculated histogram to process.
*/
QuantifyTelemetryEvents.prototype.histogram = function histogram(name, measureUnit, sampleSizeUnit, h) {
    var self = this;

    var value = {
        measureUnit: measureUnit,
        sampleSize: h.sampleSize,
        sampleSizeUnit: sampleSizeUnit
    };
    Quantify.HISTOGRAM_MEASURE_FIELDS.forEach(function (field) {
        value[field] = h[field];
    });
    var event = {
        type: 'metric',
        timestamp: new Date().toISOString(),
        module: self._package.name,
        version: self._package.version,
        name: name,
        target_type: 'histogram',
        value: value
    };
    if (h.metadata) {
        Object.keys(h.metadata).forEach(function(key) {
            event[key] = h.metadata[key];
        });
    }

    self.emit(event);

    return event;
};

/*
  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `rateUnit`: _String_ Unit to be used for the metric `event.value.rateUnit` property for all METER_RATE_FIELDS.
  * `updateCountUnit`: _String_ Unit to be used for the metric `event.value.updateCountUnit` property for `count` field.
  * `m`: _Object_ Quantify calculated meter to process.
*/
QuantifyTelemetryEvents.prototype.meter = function meter(name, rateUnit, updateCountUnit, m) {
    var self = this;

    var value = {
        rateUnit: rateUnit,
        updateCount: m.updateCount,
        updateCountUnit: updateCountUnit
    };
    Quantify.METER_RATE_FIELDS.forEach(function (field) {
        value[field] = m[field];
    });
    var event = {
        type: 'metric',
        timestamp: new Date().toISOString(),
        module: self._package.name,
        version: self._package.version,
        name: name,
        target_type: 'meter',
        value: value
    };
    if (m.metadata) {
        Object.keys(m.metadata).forEach(function(key) {
            event[key] = m.metadata[key];
        });
    }

    self.emit(event);

    return event;
};

/*
  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `measureUnit`: _String_ Unit to be used for the metric `event.value.measureUnit` property for all TIMER_MEASURE_FIELDS.
  * `rateUnit`: _String_ Unit to be used for the metric `event.value.rateUnit` property for all TIMER_RATE_FIELDS.
  * `sampleSizeUnit`: _String_ Unit to be used for the metric `event.value.sampleSizeUnit` property for `size` field.
  * `t`: _Object_ Quantify calculated timer to process.
*/
QuantifyTelemetryEvents.prototype.timer = function timer(name, measureUnit, rateUnit, sampleSizeUnit, t) {
    var self = this;

    var value = {
        measureUnit: measureUnit,
        rateUnit: rateUnit,
        sampleSize: t.sampleSize,
        sampleSizeUnit: sampleSizeUnit,
        updateCount: t.updateCount
    };
    Quantify.TIMER_RATE_FIELDS.forEach(function (field) {
        value[field] = t[field];
    });
    Quantify.TIMER_MEASURE_FIELDS.forEach(function (field) {
        value[field] = t[field];
    });
    var event = {
        type: 'metric',
        timestamp: new Date().toISOString(),
        module: self._package.name,
        version: self._package.version,
        name: name,
        target_type: 'timer',
        value: value
    };
    if (t.metadata) {
        Object.keys(t.metadata).forEach(function(key) {
            event[key] = t.metadata[key];
        });
    }

    self.emit(event);

    return event;
};
