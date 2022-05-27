const
    exec = op.inTrigger("Exec"),
    inLimit = op.inInt("Limit Error Logs Num", 1),
    inStop = op.inBool("Stop trigger after limit", false),
    next = op.outTrigger("Next");

const gl = op.patch.cgl.gl;
const cgl = op.patch.cgl;

const originals = {};
let shouldStart = true;
let count = 0;
let errorCount = 0;
let history = [];

exec.onLinkChanged =
next.onLinkChanged = () =>
{
    end();
    shouldStart = true;
};

console.log("[gl context info]", op.patch.cgl.getInfo());

exec.onTriggered = function ()
{
    count = 0;
    if (shouldStart) start();

    if (errorCount >= inLimit.get() && inStop.get()) return;

    next.trigger();

    shouldStart = false;
};

function glGetError()
{
    return op.patch.cgl.gl.getError();
    // return originals["getError"].apply(this, arguments);
}

function profile(func, funcName)
{
    return function ()
    {
        if (errorCount >= inLimit.get()) return;

        count++;
        // const start = performance.now(),
        let returnVal = func.apply(this, arguments);

        history.push({ "f": funcName, "a": arguments });

        // op.patch.cgl.gl.getError();
        const error = glGetError();

        if (error != gl.NO_ERROR)
        {
            let errStr = "";
            if (error == gl.OUT_OF_MEMORY) errStr = "OUT_OF_MEMORY";
            if (error == gl.INVALID_ENUM) errStr = "INVALID_ENUM";
            if (error == gl.INVALID_OPERATION) errStr = "INVALID_OPERATION";
            if (error == gl.INVALID_FRAMEBUFFER_OPERATION) errStr = "INVALID_FRAMEBUFFER_OPERATION";
            if (error == gl.INVALID_VALUE) errStr = "INVALID_VALUE";
            if (error == gl.CONTEXT_LOST_WEBGL)
            {
                this.aborted = true;
                errStr = "CONTEXT_LOST_WEBGL";
            }
            if (error == gl.NO_ERROR) errStr = "NO_ERROR";

            console.warn("GL ERROR " + count + "th command: ", funcName);
            console.log("arguments", arguments);

            console.log("gl error [" + this.canvas.id + "]: ", error, errStr);
            op.patch.printTriggerStack();
            console.log((new Error()).stack);

            op.patch.printTriggerStack();
            if (errorCount == 0)
            {
                for (let i = 0; i < history.length; i++)
                {
                    let str = history[i].f + "(";
                    for (let j in history[i].a)
                    {
                        if (j != 0)str += ", ";

                        const typ = typeof history[i].a[j];

                        if (typ == "number" || typ == "boolean")
                        {
                            str += history[i].a[j];
                        }
                        else if (typ == "string")
                        {
                            let argStr = history[i].a[j] + "";
                            if (argStr.length > 20)argStr = argStr.substr(0, 20) + "...";
                            argStr = argStr.replace(/(\r\n|\n|\r)/gm, "");

                            str += "\"" + argStr + "\"";
                        }
                        else
                        {
                            // console.log(typeof history[i].a[j],history[i].a[j]);
                            let argStr = JSON.stringify(history[i].a[j]) + "";

                            if (argStr.length > 20)argStr = argStr.substr(0, 20) + "...";
                            str += argStr;
                        }
                    }
                    str += ")";
                    console.log("[GL] " + i + ": gl." + str);
                }
            }

            const error2 = glGetError();
            console.log("err after", error2);
            errorCount++;

            if (errorCount == inLimit.get()) console.log("gl Errors stopping after " + inLimit.get() + " errors");
        }

        return returnVal;
    };
}

function start()
{
    for (const i in gl)
    {
        if (typeof gl[i] == "function" && i != "getError")
        {
            originals[i] = gl[i];
            const orig = originals[i];

            gl[i] = profile(gl[i], "" + i);
        }
    }
}

function end()
{
    cgl.debugOneFrame = false;
    for (const i in gl)
        if (originals[i] && typeof gl[i] == "function")
            gl[i] = originals[i];
}
