const
    update = op.inTrigger("Update"),
    inSizeX=op.inFloat("Size X",1),
    inSizeY=op.inFloat("Size Y",1),
    inSizeZ=op.inFloat("Size Z",1),
    inCenter=op.inBool("Center",false),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
let src= "cube(";

src += "["+inSizeX.get()+","+inSizeY.get()+","+inSizeZ.get()+"]";

if(inCenter.get()) src += ",center=true";

src += ");";

    op.patch.tempData.compScad.addLine(src);

    next.trigger();
};
