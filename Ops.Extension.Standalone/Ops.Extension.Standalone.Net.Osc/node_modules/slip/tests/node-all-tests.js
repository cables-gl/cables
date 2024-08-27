/*global require, __dirname*/
/*jshint nomen: false*/

var testRunner = require("qunit");

testRunner.setup({
    log: {
        assertions: true,
        errors: true,
        tests: true,
        summary: true,
        globalSummary: true,
        testing: true
    }
});

testRunner.run([
    {
        code: {
            path: __dirname + "/../src/slip.js",
            namespace: "slip"
        },
        tests: __dirname + "/slip-tests.js"
    }
]);
