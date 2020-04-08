const exec=op.inTrigger("Exec");
const next=op.outTrigger("Next");
const dump=op.inTriggerButton("Debug one Frame");

const gl=op.patch.cgl.gl;
const cgl=op.patch.cgl;

var originals={};
var counts={};
var durations={};
var branches={};
var dumpFrame=false;

exec.onTriggered=function()
{
    if(dumpFrame)
    {
        start();
        resetStats();
    }

    next.trigger();

    if(dumpFrame)
    {
        end();
        var rows=[];
        var numGlCalls=0;
        for(var i in originals)
            if(counts[i]>0)
            {
                rows.push([i,counts[i],durations[i]]);
                numGlCalls+=counts[i];
            }

        console.table(rows);

        for(var i in branches)
        {
            var count=0;
            for(var j in branches[i].counts) count+=branches[i].counts[j];

            console.log("branch",i,count,Math.round(count/numGlCalls*100)+"%",branches[i].counts);
        }
        resetStats();
        dumpFrame=false;
    }
};

function profile(func, funcName)
{
    return function ()
    {

        var start = performance.now(),
        returnVal = func.apply(this, arguments),
        duration = performance.now() - start;

        var branchName=CABLES.profilerBranches.join("_");
        if(CABLES.profilerBranches.length==0)branchName="_unknown";
        branches[branchName]=branches[branchName]||{};
        branches[branchName].counts=branches[branchName].counts||{};
        branches[branchName].counts[funcName]=branches[branchName].counts[funcName]||0;
        branches[branchName].counts[funcName]++;

        durations[funcName]+=duration;
        counts[funcName]++;
        return returnVal;
    };
}

function resetStats()
{

    branches={};

    for(var i in originals)
    {
        durations[i]=0;
        counts[i]=0;
    }
}

function start()
{
    console.log("-----------------------------");
    cgl.debugOneFrame=true;
    for(var i in gl)
    {
        if(typeof gl[i]=='function')
        {
            originals[i]=gl[i];
            var orig=originals[i];

            gl[i]=profile(gl[i],''+i);
        }
    }
}

function end()
{
    cgl.debugOneFrame=false;
    for(var i in gl)
        if(typeof gl[i]=='function')
            gl[i]=originals[i];
}


dump.onTriggered=function()
{
    dumpFrame=true;
};

