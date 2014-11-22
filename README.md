# telemetry-events-quantify

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/telemetry-events-quantify.png)](http://npmjs.org/package/telemetry-events-quantify)

Helper for creating and emitting [telemetry events][te-link] for [Quantify][2] metrics.

[te-link]: https://github.com/tristanls/telemetry-events
[2]: https://github.com/tristanls/quantify

## Contributors

[@lpearson05](https://github.com/lpearson05), [@tristanls](https://github.com/tristanls)

## Contents

  * [Installation](#installation)
  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
    * [QuantifyTelemetryEvents](#quantifytelemetryevents)

## Installation

    npm install telemetry-events-quantify

## Usage

To run the below example run:

    npm run readme

```javascript
"use strict";

var events = require('events');
var pkg = require('../package.json');
var Quantify = require('quantify');
var QuantifyTelemetryEvents = require('../index.js');
var TelemetryEvents = require('telemetry-events');

var emitter = new events.EventEmitter();
var metricsRegistry = new Quantify();
var telemetryEvents = new TelemetryEvents({emitter: emitter, package: pkg});
var quantifyTelemetryEmitter = new QuantifyTelemetryEvents({telemetry: telemetryEvents});

emitter.on('telemetry', function (event) {
    console.dir(event);
});

// create some metrics using Quantify
metricsRegistry.counter('errors', 'Err', {server: 'foo'});
metricsRegistry.gauge('cpuLoad', 'Load');
metricsRegistry.histogram('searchResultsReturned', {
    measureUnit: 'Result',
    sampleSizeUnit:  'Req'
});
metricsRegistry.meter('requests', {
    rateUnit: 'Req/s',
    updateCountUnit: 'Req'
});
metricsRegistry.timer('requestLatency', {
    measureUnit: 'ms',
    rateUnit: 'Req/s',
    sampleSizeUnit: 'Req'
}, {
    some: 'other_tag',
    and: 'more_metadata'
});

// get the metrics we want to report
var metrics = metricsRegistry.getMetrics();

quantifyTelemetryEmitter.counter('errors', metrics.counters['errors']);
quantifyTelemetryEmitter.gauge('cpuLoad', metrics.gauges['cpuLoad']);
quantifyTelemetryEmitter.histogram('searchResultsReturned', metrics.histograms['searchResultsReturned']);
quantifyTelemetryEmitter.meter('requests', metrics.meters['requests']);
quantifyTelemetryEmitter.timer('requestLatency', metrics.timers['requestLatency']);

// ...or just call this
quantifyTelemetryEmitter.metrics(metrics);

```

## Tests

    npm test

## Documentation

  * [QuantifyTelemetryEvents](#quantifytelemetryevents)

### QuantifyTelemetryEvents

**Public API**

  * [new QuantifyTelemetryEvents(config)](#new-quantifytelemetryeventsconfig)
  * [telemetry.counter(name, c)](#telemetrycountername-c)
  * [telemetry.gauge(name, g)](#telemetrygaugename-g)
  * [telemetry.histogram(name, h)](#telemetryhistogramname-h)
  * [telemetry.meter(name, m)](#telemetrymetername-m)
  * [telemetry.metrics(metrics)](#telemetrymetricsmetrics) **USE THIS**
  * [telemetry.timer(name, t)](#telemetrytimername-t)

### new QuantifyTelemetryEvents(config)

  * `config`: _Object_
    * `telemetry`: _TelemetryEvents_ Instance of TelemetryEvents to use for processing.

Creates a new QuantifyTelemetryEvents instance.

### telemetry.counter(name, c)

  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `unit`: _String_ Unit to be used for the metric `event.unit` property.
  * `c`: _Object_ Quantify calculated counter to process.
  * Return: _Object_ The event.

Helper to create "metric" event with 'target_type' of "counter". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties (in addition to those added by [TelemeteryEvents][te-link]):

```javascript
{
    type: 'metric',
    name: <name>,
    value: <c.value>,
    unit: <c.unit>,
    target_type: 'counter'
}
```

If `c` has `metadata`, properties of `metadata` will be included with or override the above template.

### telemetry.gauge(name, g)

  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `unit`: _String_ Unit to be used for the metric `event.unit` property.
  * `g`: _Object_ Quantify calculated gauge to process.
  * Return: _Object_ The event.

Helper to create "metric" event with 'target_type' of "gauge". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties (in addition to those added by [TelemeteryEvents][te-link]):

```javascript
{
    type: 'metric',
    name: <name>,
    value: <g.value>,
    unit: <g.unit>,
    target_type: 'gauge'
}
```

If `g` has `metadata`, properties of `metadata` will be included with or override the above template.

### telemetry.histogram(name, h)

  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `h`: _Object_ Quantify calculated histogram to process.
  * Return: _Object_ The event.

Helper to create "metric" event with 'target_type' of "histogram". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties (in addition to those added by [TelemeteryEvents][te-link]):

```javascript
{
    type: 'metric',
    name: <name>,
    value: {
        measureUnit: <h.measureUnit>,
        sampleSize: <h.sampleSize>,
        sampleSizeUnit: <h.sampleSizeUnit>,
        max: <h.max>,
        mean: <h.mean>,
        median: <h.median>,
        min: <h.min>,
        percentile75: <h.percentile75>,
        percentile95: <h.percentile95>,
        percentile98: <h.percentile98>,
        percentile99: <h.percentile99>,
        percentile999: <h.percentile999>,
        standardDeviation: <h.standardDeviation>
    },
    target_type: 'histogram'
}
```

If `h` has `metadata`, properties of `metadata` will be included with or override the above template.

### telemetry.meter(name, m)

  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `m`: _Object_ Quantify calculated meter to process.
  * Return: _Object_ The event.

Helper to create "metric" event with 'target_type' of "meter". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties (in addition to those added by [TelemeteryEvents][te-link]):

```javascript
{
    type: 'metric',
    name: <name>,
    value: {
        rateUnit: <m.rateUnit>,
        updateCount: <m.updateCount>,
        updateCountUnit: <m.updateCountUnit>,
        meanRate: <m.meanRate>,
        oneMinuteRate: <m.oneMinuteRate>,
        fiveMinuteRate: <m.fiveMinuteRate>,
        fifteenMinuteRate: <m.fifteenMinuteRate>
    },
    target_type: 'meter'
}
```

If `m` has `metadata`, properties of `metadata` will be included with or override the above template.

### telemetry.metrics(metrics)

  * `metrics`: _Object_ Result of Quantify.getMetrics(\[filters\]).
  * Return _Array_ Array of events.

Helper to create "metric" events for all target types. If `emitter` was specified in configuration, calling this helper will also emit these events.

### telemetry.timer(name, t)

  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `t`: _Object_ Quantify calculated timer to process.
  * Return: _Object_ The event.

Helper to create "metric" event with 'target_type' of "timer". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties (in addition to those added by [TelemeteryEvents][te-link]):

```javascript
{
    type: 'metric',
    name: <name>,
    value: {
        measureUnit: <t.measureUnit>,
        rateUnit: <t.rateUnit>,
        sampleSize: <t.sampleSize>,
        sampleSizeUnit: <t.sampleSizeUnit>,
        updateCount: <t.sampleSize>,
        meanRate: <t.meanRate>,
        oneMinuteRate: <t.oneMinuteRate>,
        fiveMinuteRate: <t.fiveMinuteRate>,
        fifteenMinuteRate: <t.fifteenMinuteRate>
        max: <t.max>,
        mean: <t.mean>,
        median: <t.median>,
        min: <t.min>,
        percentile75: <t.percentile75>,
        percentile95: <t.percentile95>,
        percentile98: <t.percentile98>,
        percentile99: <t.percentile99>,
        percentile999: <t.percentile999>,
        standardDeviation: <t.standardDeviation>
    },
    target_type: 'timer'
}
```

If `t` has `metadata`, properties of `metadata` will be included with or override the above template.
