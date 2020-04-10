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

var query=null;

var started=false;

const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');


exec.onTriggered=function()
{
    if(dumpFrame)
    {
        start();
        resetStats();
    }

if(!query)
{
query = gl.createQuery();
gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
started=true;

}

    next.trigger();

if(query && started)
{
    gl.endQuery(ext.TIME_ELAPSED_EXT);
    started=false;
}

if(query)
{
    const available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
    if (available)
    {
        const elapsedNanos = gl.getQueryParameter(query, gl.QUERY_RESULT);
        console.log("gpu ms",elapsedNanos/1000000);
        query=null;
    }

}



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


        var rowsBranches=[];
        for(var i in branches)
        {
            var count=0;
            for(var j in branches[i].counts) count+=branches[i].counts[j];

            console.log("branch",i,branches[i].counts);
            rowsBranches.push([i,count,Math.round(count/numGlCalls*100)+"%"]);
        }
        console.table(rowsBranches);


        console.log(CABLES.profilerBranchesTimes);

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

        var branchName=CABLES.profilerBranches.join(" / ");
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
    CABLES.profilerBranchesTimes={};

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

