/*

readme.js: example from the README

The MIT License (MIT)

Copyright (c) 2014-2019 Leora Pearson, Tristan Slominski

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

const events = require("events");
const pkg = require("../package.json");
const Quantify = require("quantify");
const QuantifyTelemetryEvents = require("../index.js");
const TelemetryEvents = require("telemetry-events");

const emitter = new events.EventEmitter();
const metricsRegistry = new Quantify();
const telemetryEvents = new TelemetryEvents(
    {
        emitter,
        package: pkg
    }
);
const quantifyTelemetryEmitter = new QuantifyTelemetryEvents(
    {
        telemetry: telemetryEvents
    }
);

emitter.on("telemetry", event => console.dir(event));

// create some metrics using Quantify
metricsRegistry.counter("errors", "Err",
    {
        server: "foo"
    }
);
metricsRegistry.gauge("cpuLoad", "Load");
metricsRegistry.histogram("searchResultsReturned",
    {
        measureUnit: "Result",
        sampleSizeUnit:  "Req"
    }
);
metricsRegistry.meter("requests",
    {
        rateUnit: "Req/s",
        updateCountUnit: "Req"
    }
);
metricsRegistry.timer("requestLatency",
    {
        measureUnit: "ms",
        rateUnit: "Req/s",
        sampleSizeUnit: "Req"
    },
    {
        some: "other_tag",
        and: "more_metadata"
    }
);

// get the metrics we want to report
const metrics = metricsRegistry.getMetrics();

quantifyTelemetryEmitter.counter("errors", metrics.counters["errors"]);
quantifyTelemetryEmitter.gauge("cpuLoad", metrics.gauges["cpuLoad"]);
quantifyTelemetryEmitter.histogram("searchResultsReturned", metrics.histograms["searchResultsReturned"]);
quantifyTelemetryEmitter.meter("requests", metrics.meters["requests"]);
quantifyTelemetryEmitter.timer("requestLatency", metrics.timers["requestLatency"]);

// ...or just call this
quantifyTelemetryEmitter.metrics(metrics);
