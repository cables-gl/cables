const
    update = op.inTrigger("Update"),
    inFilename=op.inString("Filename",""),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
    let os=op.patch.tempData.compScad;
    let src= "import(\""+inFilename.get() + "\");";

    os.op(op);
    os.addLine(src);

    next.trigger();
};
