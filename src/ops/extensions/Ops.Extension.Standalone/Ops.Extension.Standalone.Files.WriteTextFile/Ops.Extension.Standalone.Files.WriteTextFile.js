const fs=op.require("fs");
const
    inFilename=op.inString("Filename",""),
    inStr=op.inString("Content",""),
    exec = op.inTriggerButton("Write"),
    next = op.outTrigger("Next"),
    error = op.outBoolNum("Has Error"),
    errorStr = op.outString("Error");

if(fs)
exec.onTriggered = ()=>
{
    fs.writeFile(inFilename.get(), inStr.get(),
      {
        encoding: "utf8",
        flag: "w"
      },
      (err) =>
      {
        if(err)
        {

            errorStr.set("Error:"+err.message);
        }
        else
        {
            errorStr.set();

        }
        next.trigger();
    });

};
