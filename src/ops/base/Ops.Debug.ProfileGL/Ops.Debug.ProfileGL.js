var exec=op.inFunction("Exec");
var next=op.outFunction("Next");

var dump=op.inFunctionButton("Debug one Frame");
var gl=op.patch.cgl.gl;

var originals={};
var counts={};
var durations={};
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
    
        for(var i in originals)
            if(counts[i]>0)
                rows.push([i,counts[i],durations[i]]);

        console.table(rows);
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
    
        durations[funcName]+=duration;
        counts[funcName]++;
        return returnVal;
    };
}

function resetStats()
{
    for(var i in originals)
    {
        durations[i]=0;
        counts[i]=0;
    }
}

function start()
{
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
    for(var i in gl)
        if(typeof gl[i]=='function')
            gl[i]=originals[i];
}


dump.onTriggered=function()
{
    dumpFrame=true;   
}