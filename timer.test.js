/*

timer.test.js - QuantifyTelemetryEvents.timer() test

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
const pkg = require("./package.json");
const QuantifyTelemetryEvents = require("./index.js");
const Quantify = require("quantify");
const VALID_CONFIG = require("./test/validConfig.js");

expect.extend(
    {
        toBeISO8601Date(received)
        {
            const pass = received === new Date(received).toISOString();
            if (pass)
            {
                return (
                    {
                        message: () => `expected ${received} not to be ISO8601 Date`,
                        pass: true
                    }
                );
            }
            return (
                {
                    message: () => `expected ${received} to be ISO8601 Date`,
                    pass: false
                }
            );
        }
    }
);

describe("timer", () =>
{
    let common, metrics, telemetry, value;
    beforeEach(() =>
        {
            common =
            {
                provenance:
                [
                    {
                        module: pkg.name,
                        version: pkg.version
                    }
                ],
                timestamp: expect.toBeISO8601Date()
            };
            telemetry = new QuantifyTelemetryEvents(VALID_CONFIG);
            metrics = new Quantify();
            value =
            {
                measureUnit: "some_measureUnit",
                rateUnit: "some_rateUnit",
                sampleSize: 0,
                sampleSizeUnit: "some_sampleSizeUnit",
                updateCount: 0,
                ...[ ...Quantify.TIMER_RATE_FIELDS, ...Quantify.TIMER_MEASURE_FIELDS ].reduce(
                    (o, f) => Object.assign(o,
                        {
                            [f]: 0
                        }
                    ),
                    {}
                )
            };
        }
    );
    it("returns timer event", () =>
        {
            metrics.timer("foo",
                {
                    measureUnit: "some_measureUnit",
                    rateUnit: "some_rateUnit",
                    sampleSizeUnit: "some_sampleSizeUnit"
                }
            );
            const event = telemetry.timer("some_name", metrics.getMetrics().timers.foo);
            expect(event).toEqual(
                {
                    type: "metric",
                    name: "some_name",
                    target_type: "timer",
                    value,
                    ...common
                }
            );
        }
    );
    it("returns timer event with metadata", () =>
        {
            const metadata =
            {
                some_tag: "some_tag"
            };
            metrics.timer(
                "foo",
                {
                    measureUnit: "some_measureUnit",
                    rateUnit: "some_rateUnit",
                    sampleSizeUnit: "some_sampleSizeUnit"
                },
                metadata
            );
            const event = telemetry.timer("some_name", metrics.getMetrics().timers.foo);
            expect(event).toEqual(
                {
                    type: "metric",
                    name: "some_name",
                    target_type: "timer",
                    value,
                    ...metadata,
                    ...common
                }
            );
        }
    );
    it("does not change original metadata", () =>
        {
            const metadata =
            {
                provenance: []
            };
            metrics.timer(
                "foo",
                {
                    measureUnit: "some_measureUnit",
                    rateUnit: "some_rateUnit",
                    sampleSizeUnit: "some_sampleSizeUnit"

                },
                metadata
            );
            const event = telemetry.timer("some_name", metrics.getMetrics().timers.foo);
            expect(metadata).toEqual(
                {
                    provenance: []
                }
            );
        }
    );
    it("returns timer event with metadata containing overrides (for default event properties)", () =>
        {
            const metadata =
            {
                type: "blah"
            };
            metrics.timer(
                "foo",
                {
                    measureUnit: "some_measureUnit",
                    rateUnit: "some_rateUnit",
                    sampleSizeUnit: "some_sampleSizeUnit"
                },
                metadata
            );
            const event = telemetry.timer("some_name", metrics.getMetrics().timers.foo);
            expect(event).toEqual(
                {
                    name: "some_name",
                    target_type: "timer",
                    value,
                    ...metadata,
                    ...common
                }
            );
        }
    );
    it("should call _telemetry.emit() to emit event", () =>
        {
            let emittedEvent;
            telemetry = new QuantifyTelemetryEvents(
                {
                    telemetry:
                    {
                        emit: event =>
                        {
                            emittedEvent = event;
                            return emittedEvent;
                        }
                    }
                }
            );
            metrics.timer(
                "foo",
                {
                    measureUnit: "some_measureUnit",
                    rateUnit: "some_rateUnit",
                    sampleSizeUnit: "some_sampleSizeUnit"
                }
            );
            const event = telemetry.timer("some_name", metrics.getMetrics().timers.foo);
            expect(event).toBe(emittedEvent);
        }
    );
});
