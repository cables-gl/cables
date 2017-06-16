op.name="ShowShader";


var exec=op.inFunction("Exec");
var show=op.inFunctionButton("Show");

var next=op.outFunction("Next");

var shader=null;
show.onTriggered=function()
{

    if(CABLES.UI && shader)
    {
        console.log('shader', shader );
        CABLES.UI.MODAL.showCode('shader ',shader.finalShaderVert);
    }
    
};

exec.onTriggered=function()
{
    shader=op.patch.cgl.getShader();
    next.trigger();
    
};