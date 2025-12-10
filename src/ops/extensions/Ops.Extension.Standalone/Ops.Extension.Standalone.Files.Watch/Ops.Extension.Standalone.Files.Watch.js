
const fs=op.require("fs");
const
    inFilename=op.inString("Path",""),
    inActive=op.inBool("Active",true),

    outEvent=op.outString("Event Type"),
    outFilename=op.outString("Event Filename"),
    next = op.outTrigger("Event happened"),
    outStr=op.outString("Content"),
    error = op.outBoolNum("Has Error"),
    errorStr = op.outString("Error");

let watcher=null;
op.onDelete=stop;
start();

inFilename.onChange=
inActive.onChange=()=>
{
    if(!inActive.get())stop();
    else start();
}

function start()
{
    if(watcher)stop();

    try
    {
        error.set(false);
        errorStr.set("");

        watcher=fs.watch(inFilename.get(),
            (event, filename)=>
            {
                outEvent.set(event||"");
                outFilename.set(filename||"");

                next.trigger();
            });

    }
    catch(e)
    {
        error.set(true);
        errorStr.set(e.message);
    }

};


function stop()
{
    if(watcher)watcher.close()
    watcher=null;
}