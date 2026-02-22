const
    update = op.inTrigger("Update"),
    inSizeX=op.inFloat("Size X",1),
    inSizeY=op.inFloat("Size Y",1),
    inSizeZ=op.inFloat("Size Z",1),
    inCenter=op.inBool("Center",false),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{

    const os=op.patch.tempData.compScad;
    os.op(op);

let src= "cube(";

src += "["+os.portValue(inSizeX)+","+os.portValue(inSizeY)+","+os.portValue(inSizeZ)+"]";
if(inCenter.get()) src += ",center=true";
src += ");";

    op.patch.tempData.compScad.addLine(src);

    next.trigger();
};
