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
let os=op.patch.tempData.compScad


src += "h="+inHeight.get();

if(inRadiusTop.get()==0&&inRadiusBottom.get()==0)
{
    src+=",r="+os.portValue(inRadius);
}
else
{
    src += ",r1="+(os.portValue(inRadiusTop)+"+"+os.portValue(inRadius));
    src += ",r2="+(os.portValue(inRadiusBottom)+"+"+os.portValue(inRadius));
}

if(inCenter.get()) src += ",center=true";

src += ");";

os.op(op);
os.addLine(src);

next.trigger();
};
