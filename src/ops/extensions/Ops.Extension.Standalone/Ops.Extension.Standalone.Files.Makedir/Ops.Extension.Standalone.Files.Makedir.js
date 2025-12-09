
const mkdirp=op.require("mkdirp");

const
    inPath=op.inString("Path","/"),
    exec = op.inTriggerButton("Create"),
    outNext=op.outTrigger("Next");


exec.onTriggered = () =>
{
    mkdirp(inPath.get()).then(
        ()=>
        {
            outNext.trigger();
        });
};

