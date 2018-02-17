
var exec=op.inFunction("Update");
var next=op.outFunction("Next");

var outError=op.outValue("glGetError");


var depthStack=op.outValue("Stack Depthtest");
var depthWrite=op.outValue("Depth Writing");
var depthWriteStack=op.outValue("Stack Depth Writing");
var depthFunc=op.outValue("DepthFunc");
var depthFuncStack=op.outValue("Stack DepthFunc");



var cgl=op.patch.cgl;
exec.onTriggered=function()
{
    depthStack.set(cgl.stateDepthTest());

    depthWrite.set(cgl.gl.getParameter(cgl.gl.DEPTH_WRITEMASK));
    depthWriteStack.set(cgl.stateDepthWrite());

    depthFunc.set(depthFuncToString(cgl.gl.getParameter(cgl.gl.DEPTH_FUNC)));
    depthFuncStack.set(depthFuncToString(cgl.stateDepthFunc()));
    
    outError.set(errorToString(cgl.gl.getError()));

    next.trigger();
};

function errorToString(e)
{
    if(e==cgl.gl.NO_ERROR)return "NO_ERROR";
    if(e==cgl.gl.OUT_OF_MEMORY)return "OUT_OF_MEMORY";
    if(e==cgl.gl.INVALID_ENUM)return "INVALID_ENUM";
    if(e==cgl.gl.INVALID_OPERATION)return "INVALID_OPERATION";
    if(e==cgl.gl.INVALID_FRAMEBUFFER_OPERATION)return "INVALID_FRAMEBUFFER_OPERATION";
    if(e==cgl.gl.INVALID_VALUE)return "INVALID_VALUE";
    if(e==cgl.gl.CONTEXT_LOST_WEBGL)return "CONTEXT_LOST_WEBGL";
    
}

function depthFuncToString(f)
{
    if(f==cgl.gl.NEVER)return 'NEVER';
    if(f==cgl.gl.LESS)return 'LESS';
    if(f==cgl.gl.EQUAL)return 'EQUAL';
    if(f==cgl.gl.LEQUAL)return 'LEQUAL';
    if(f==cgl.gl.GREATER)return 'GREATER';
    if(f==cgl.gl.NOTEQUAL)return 'NOTEQUAL';
    if(f==cgl.gl.GEQUAL)return 'GEQUAL';
    if(f==cgl.gl.ALWAYS)return 'ALWAYS';
}