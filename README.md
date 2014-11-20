# quantify-telemetry-events

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/quantify-telemetry-events.png)](http://npmjs.org/package/quantify-telemetry-events)

Helper for creating and emitting telemetry events.

## Contributors

[@lpearson05](https://github.com/lpearson05), [@tristanls](https://github.com/tristanls)

## Contents

  * [Installation](#installation)
  * [Usage](#usage)
  * [Tests](#tests)
  * [Documentation](#documentation)
    * [QuantifyTelemetryEvents](#quantifytelemetryevents)

## Installation

    npm install quantify-telemetry-events

## Usage

To run the below example run:

    npm run readme

```javascript
"use strict";

var events = require('events');
var pkg = require('../package.json');
var Quantify = require('quantify');
var QuantifyTelemetryEvents = require('../index.js');

var emitter = new events.EventEmitter();
var metricsRegistry = new Quantify();
var telemetry = new QuantifyTelemetryEvents({emitter: emitter, package: pkg});

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

telemetry.counter('errors', metrics.counters['errors']);
telemetry.gauge('cpuLoad', metrics.gauges['cpuLoad']);
telemetry.histogram('searchResultsReturned', metrics.histograms['searchResultsReturned']);
telemetry.meter('requests', metrics.meters['requests']);
telemetry.timer('requestLatency', metrics.timers['requestLatency']);

```

## Tests

    npm test

## Documentation

  * [QuantifyTelemetryEvents](#quantifytelemetryevents)

### QuantifyTelemetryEvents

**Public API**

  * [new QuantifyTelemetryEvents(config)](#new-quantifytelemetryeventsconfig)
  * [telemetry.counter(name, c)](#telemetrycountername-c)
  * [telemetry.emit(event)](#telemetryemitevent)
  * [telemetry.gauge(name, g)](#telemetrygaugename-g)
  * [telemetry.histogram(name, h)](#telemetryhistogramname-h)
  * [telemetry.meter(name, m)](#telemetrymetername-m)
  * [telemetry.timer(name, t)](#telemetrytimername-t)

### new QuantifyTelemetryEvents(config)

  * `config`: _Object_
    * `package`: _Object_ Contents of `package.json`.
      * `name`: _String_ Module name.
      * `version`: _String_ Module version.
    * `emitter`: _EventEmitter_ _(Default: undefined)_ An optional event emitter to emit events when `log()` is called.
    * `eventName`: _String_ _(Default: 'telemetry')_ An optional event name used for event emission if `emitter` is specified.

Creates a new QuantifyTelemetryEvents instance.

### telemetry.counter(name, c)

  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `unit`: _String_ Unit to be used for the metric `event.unit` property.
  * `c`: _Object_ Quantify calculated counter to process.
  * Return: _Object_ The event.

Helper to create "metric" event with 'target_type' of "counter". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties:

```javascript
{
    type: 'metric',
    timestamp: new Date().toISOString(),
    module: <package.name>,
    version: <package.version>,
    name: <name>,
    value: <c.value>,
    unit: <c.unit>,
    target_type: 'counter'
}
```

If `c` has `metadata`, properties of `metadata` will be included with or override the above template.

### telemetry.emit(event)

  * `event`: _Object_ Event to be emitted.

Calling this method if `emitter` is not defined does nothing.

When `emitter` is defined, calling this method will emit the `event` using `eventName`, if provided, or "telemetry" (by default).

### telemetry.gauge(name, g)

  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `unit`: _String_ Unit to be used for the metric `event.unit` property.
  * `g`: _Object_ Quantify calculated gauge to process.
  * Return: _Object_ The event.

Helper to create "metric" event with 'target_type' of "gauge". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties:

```javascript
{
    type: 'metric',
    timestamp: new Date().toISOString(),
    module: <package.name>,
    version: <package.version>,
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

Helper to create "metric" event with 'target_type' of "histogram". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties:

```javascript
{
    type: 'metric',
    timestamp: new Date().toISOString(),
    module: <package.name>,
    version: <package.version>,
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

Helper to create "metric" event with 'target_type' of "meter". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties:

```javascript
{
    type: 'metric',
    timestamp: new Date().toISOString(),
    module: <package.name>,
    version: <package.version>,
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

### telemetry.timer(name, t)

  * `name`: _String_ Name of the metric to be used for `event.name` property.
  * `t`: _Object_ Quantify calculated timer to process.
  * Return: _Object_ The event.

Helper to create "metric" event with 'target_type' of "timer". If `emitter` was specified in configuration, calling this helper will also emit this event. The created event object will have the following properties:

```javascript
{
    type: 'metric',
    timestamp: new Date().toISOString(),
    module: <package.name>,
    version: <package.version>,
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
