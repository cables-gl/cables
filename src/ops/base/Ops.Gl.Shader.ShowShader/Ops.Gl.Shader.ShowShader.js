op.name="ShowShader";

var exec=op.inFunction("Exec");
var showFrag=op.inFunctionButton("Show Fragment");
var showVert=op.inFunctionButton("Show Vertex");

var next=op.outFunction("Next");

var shader=null;
showFrag.onTriggered=function()
{
    if(CABLES.UI && shader)
    {
        CABLES.UI.MODAL.showCode('fragment shader',shader.finalShaderFrag);
    }
};

showVert.onTriggered=function()
{
    if(CABLES.UI && shader)
    {
        CABLES.UI.MODAL.showCode('vertex shader',shader.finalShaderVert);
    }
};

exec.onTriggered=function()
{
    shader=op.patch.cgl.getShader();
    next.trigger();

    
};