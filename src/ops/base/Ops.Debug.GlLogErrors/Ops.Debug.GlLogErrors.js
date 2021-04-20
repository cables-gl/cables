const exec = op.inTrigger("Exec");
const next = op.outTrigger("Next");

const gl = op.patch.cgl.gl;
const cgl = op.patch.cgl;

const originals = {};
const counts = {};
const durations = {};
let branches = {};
let firsttime = true;

let count=0;

exec.onTriggered = function ()
{
    count=0;
    if (firsttime)
    {
        start();
    }

    next.trigger();

    firsttime = false;

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
        count++;
        // const start = performance.now(),
        let returnVal = func.apply(this, arguments);
        // op.patch.cgl.gl.getError();
        const error=glGetError();

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

            console.warn("GL ERROR "+count+"th command: ",funcName);
            console.log("arguments",arguments);

            console.log("gl error [" + this.canvas.id + "]: ", error, errStr);
            op.patch.printTriggerStack();
            console.log((new Error()).stack);

            const error2=glGetError();
            console.log("err after",error2);

        }



        return returnVal;
    };
}

function resetStats()
{
    branches = {};
    CABLES.profilerBranchesTimes = {};

    for (const i in originals)
    {
        durations[i] = 0;
        counts[i] = 0;
    }
}

function start()
{

    for (const i in gl)
    {
        if (typeof gl[i] == "function" && i!="getError")
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
        if (typeof gl[i] == "function")
            gl[i] = originals[i];
}

