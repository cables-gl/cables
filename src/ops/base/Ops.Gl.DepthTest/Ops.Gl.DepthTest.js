// todo:rename to depthtest

var render=op.inTrigger("Render");
var enable=op.inValueBool("Enable depth testing",true);
var meth=op.inValueSelect("Depth Test Method",['never','always','less','less or equal','greater', 'greater or equal','equal','not equal'],'less or equal');
var write=op.inValueBool("Write to depth buffer",true);
var trigger=op.outTrigger("Next");

var cgl=op.patch.cgl;
var compareMethod=cgl.gl.LEQUAL;

meth.onChange=updateFunc;

function updateFunc()
{
    if(meth.get()=='never') compareMethod=cgl.gl.NEVER;
    else if(meth.get()=='always') compareMethod=cgl.gl.ALWAYS;
    else if(meth.get()=='less') compareMethod=cgl.gl.LESS;
    else if(meth.get()=='less or equal') compareMethod=cgl.gl.LEQUAL;
    else if(meth.get()=='greater') compareMethod=cgl.gl.GREATER;
    else if(meth.get()=='greater or equal') compareMethod=cgl.gl.GEQUAL;
    else if(meth.get()=='equal') compareMethod=cgl.gl.EQUAL;
    else if(meth.get()=='not equal') compareMethod=cgl.gl.NOTEQUAL;
}

render.onTriggered=function()
{
    cgl.pushDepthTest(enable.get());
    cgl.pushDepthWrite(write.get());
    cgl.pushDepthFunc(compareMethod);

    trigger.trigger();

    cgl.popDepthTest();
    cgl.popDepthWrite();
    cgl.popDepthFunc();
};