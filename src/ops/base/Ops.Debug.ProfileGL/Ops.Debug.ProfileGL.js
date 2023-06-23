const exec = op.inTrigger("Exec");
const next = op.outTrigger("Next");
const dump = op.inTriggerButton("Debug one Frame");

const gl = op.patch.cgl.gl;
const cgl = op.patch.cgl;

const originals = {};
const counts = {};
const durations = {};
let branches = {};
let dumpFrame = false;

const started = false;


exec.onTriggered = function ()
{
    if (dumpFrame)
    {
        start();
        resetStats();
    }

    next.trigger();

    if (dumpFrame)
    {
        end();
        const rows = [];
        let numGlCalls = 0;
        for (const i in originals)
            if (counts[i] > 0)
            {
                rows.push([i, counts[i], durations[i]]);
                numGlCalls += counts[i];
            }

        console.table(rows);

        const rowsBranches = [];
        for (const i in branches)
        {
            let count = 0;
            for (const j in branches[i].counts) count += branches[i].counts[j];

            op.log("branch", i, branches[i].counts);
            rowsBranches.push([i, count, Math.round(count / numGlCalls * 100) + "%"]);
        }
        console.table(rowsBranches);

        op.log(CABLES.profilerBranchesTimes);

        resetStats();
        dumpFrame = false;
    }
};

function profile(func, funcName)
{
    return function ()
    {
        const start = performance.now(),
            returnVal = func.apply(this, arguments),
            duration = performance.now() - start;

        if (CABLES.profilerBranches && CABLES.profilerBranches.length > 0)
        {
            let branchName = CABLES.profilerBranches.join(" / ");
            if (CABLES.profilerBranches.length == 0)branchName = "_unknown";
            branches[branchName] = branches[branchName] || {};
            branches[branchName].counts = branches[branchName].counts || {};
            branches[branchName].counts[funcName] = branches[branchName].counts[funcName] || 0;
            branches[branchName].counts[funcName]++;
        }

        durations[funcName] += duration;
        counts[funcName]++;
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
    op.log("-----------------------------");
    cgl.debugOneFrame = true;
    for (const i in gl)
    {
        if (typeof gl[i] == "function")
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

dump.onTriggered = function ()
{
    dumpFrame = true;
};
