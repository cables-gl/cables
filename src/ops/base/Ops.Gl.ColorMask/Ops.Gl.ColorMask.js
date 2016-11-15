op.name="ColorMask";

var exec=op.inFunction("Execute");

var inR=op.inValueBool("Red",true);
var inG=op.inValueBool("Green",true);
var inB=op.inValueBool("Blue",true);
var inA=op.inValueBool("Alpha",true);

var next=op.outFunction("Next");


var cgl=op.patch.cgl;

exec.onTriggered=function()
{
    var old=cgl.gl.getParameter(cgl.gl.COLOR_WRITEMASK);
    

    cgl.gl.colorMask(inR.get(),inG.get(),inB.get(),inA.get());

    next.trigger();
    

    op.patch.cgl.gl.colorMask(old[0],old[1],old[2],old[3]);
};