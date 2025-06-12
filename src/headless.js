import fs from "fs";

global.window = {
    "navigator": {
        "userAgent": "node"
    },
    "performance": {
        "now": () =>
        {
            return Date.now();
        }
    },
    "addEventListener": function () { return; },
    "setImmediate": setImmediate
};
global.CABLES = {};
global.cancelAnimationFrame = () =>
{
    return true;
};

import("./core/index.js").then((c) =>
{
    global.CABLES = { ...global.CABLES, ...c };
    global.CABLES.Op.prototype.setUiError = function (id, txt, level = 2, options = {})
    {
        if (txt) console.log("ERROR in", this.name, level, id, txt, options);
    };
    const args = process.argv ? process.argv.slice(2) : [];
    const patchData = fs.readFileSync(args[0]).toString();
    const ops = fs.readFileSync(args[1]).toString();
    // eslint-disable-next-line no-new-func
    let evalFunc = new Function(ops).bind(global);
    evalFunc();
    const patch = new c.Patch({ "patch": patchData });
    patch.exec(0);
});
