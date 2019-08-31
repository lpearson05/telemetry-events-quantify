/*

metrics.test.js - QuantifyTelemetryEvents.metrics() test

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

const countdown = require("./test/countdown.js");
const events = require("events");
const pkg = require("./package.json");
const QuantifyTelemetryEvents = require("./index.js");
const Quantify = require("quantify");
const VALID_CONFIG = require("./test/validConfig.js");

const UNIT_MAP =
{
    "counter": "unit",
    "gauge": "unit",
    "histogram":
    {
        measureUnit: "measure-unit",
        sampleSizeUnit: "sample-size-unit"
    },
    "meter":
    {
        rateUnit: "rate-unit",
        updateCountUnit: "update-count-unit"
    },
    "timer":
    {
        measureUnit: "measure-unit",
        rateUnit: "rate-unit",
        sampleSizeUnit: "sample-size-unit"
    }
};

describe("metrics", () =>
{
    let metrics, telemetry;
    beforeEach(() =>
        {
            metrics = new Quantify();
            telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);
        }
    );
    it("should call individual metric methods", done =>
        {
            const finish = countdown(done, 5);
            Quantify.METRIC_TYPES.map(entry => metrics[entry]("foo", UNIT_MAP[entry]));
            const ms = metrics.getMetrics();
            Quantify.METRIC_TYPES.map(
                (entry, i) =>
                    telemetry[entry] = (name, metric) =>
                    {
                        expect(metric).toEqual(ms[Quantify.METRICS[i]][name]);
                        finish();
                    }
            );
            telemetry.metrics(ms);
        }
    );
    it("should call specified individual metric methods", done =>
        {
            const finish = countdown(done, 4);
            Quantify.METRIC_TYPES
                .filter(e => e != "gauge")
                .map(entry => metrics[entry]("foo", UNIT_MAP[entry]));
            const ms = metrics.getMetrics();
            Quantify.METRIC_TYPES.map(
                (entry, i) =>
                    telemetry[entry] = (name, metric) =>
                    {
                        expect(metric).toEqual(ms[Quantify.METRICS[i]][name]);
                        finish();
                    }
            );
            telemetry.metrics(ms);
        }
    );
    it("should return array of events created by specified individual metric methods", () =>
        {
            Quantify.METRIC_TYPES
                .filter(e => e != "gauge")
                .map(entry => metrics[entry]("foo", UNIT_MAP[entry]));
            Quantify.METRIC_TYPES.map(
                entry =>  telemetry[entry] = () => entry
            );
            const events = telemetry.metrics(metrics.getMetrics());
            expect(events).toEqual(Quantify.METRIC_TYPES.filter(e => e != "gauge"));
        }
    );
});
