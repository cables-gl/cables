const
    update = op.inTrigger("Update"),
    inHeight=op.inFloat("Height",1),
    inRadius=op.inFloat("Radius",1),
    inRadiusBottom=op.inFloat("Radius Bottom",1),
    inRadiusTop=op.inFloat("Radius Top",1),
    inCenter=op.inBool("Center",false),
    next = op.outTrigger("Next");

update.onTriggered = () =>
{
let src= "cylinder(";

src += "h="+inHeight.get();

if(inRadiusTop.get()==0&&inRadiusBottom.get()==0)
{
    src+=",r="+inRadius.get();
}
else
{
    src += ",r1="+(inRadiusTop.get()+inRadius.get());
    src += ",r2="+(inRadiusBottom.get()+inRadius.get());
}

if(inCenter.get()) src += ",center=true";

src += ");";

op.patch.tempData.compScad.addLine(src);

next.trigger();
};
