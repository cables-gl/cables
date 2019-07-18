const
    exec=op.inTrigger("Render"),
    inBlend=op.inValueSelect("Blendmode",['None','Normal','Add','Subtract','Multiply'],'Normal'),
    inPremul=op.inValueBool("Premultiplied"),
    next=op.outTrigger("Next");

const cgl=op.patch.cgl;
var blendMode=0;
inBlend.onChange=update;
update();

function update()
{
    if(inBlend.get()=="Normal")blendMode=CGL.BLEND_NORMAL;
        else if(inBlend.get()=="Add")blendMode=CGL.BLEND_ADD;
        else if(inBlend.get()=="Subtract")blendMode=CGL.BLEND_SUB;
        else if(inBlend.get()=="Multiply")blendMode=CGL.BLEND_MUL;
        else blendMode=CGL.BLEND_NONE;

    if(CABLES.UI)
    {
        var blstr='';
        if(inBlend.get()=="Normal")blstr='';
            else if(inBlend.get()=="Add")blstr='Add';
            else if(inBlend.get()=="Subtract")blstr='Sub';
            else if(inBlend.get()=="Multiply")blstr='Mul';
            else blstr='None';

        op.setUiAttrib({"extendTitle":blstr});
    }

}

exec.onTriggered=function()
{
    cgl.pushBlendMode(blendMode,inPremul.get());
    cgl.pushBlend(blendMode!=CGL.BLEND_NONE);
    next.trigger();
    cgl.popBlend();
    cgl.popBlendMode();
	cgl.gl.blendEquationSeparate( cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD );
	cgl.gl.blendFuncSeparate( cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA );
};
