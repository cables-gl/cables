const
    exec=op.inTrigger("render"),
    inSize=op.inValue("Area size",1),
    inSrc=op.inSwitch("Source",['Vertex position','Object position'],'Vertex position'),
    inStrength=op.inValue("Strength",1),
    inSmooth=op.inValueBool("Smoothstep",false),
    inToZero=op.inValueBool("Min Size Original",false),
    x=op.inValue("Pos X"),
    y=op.inValue("Pos Y"),
    z=op.inValue("Pos Z"),
    next=op.outTrigger("Next");

const cgl=op.patch.cgl;
var needsUpdateToZero=true;
var mscaleUni=null;
var shader=null;
op.setPortGroup("Position",[x,y,z]);
op.setPortGroup("Influence",[inSrc,inStrength,inSmooth,inToZero]);

const srcBodyVert=''
    .endl()+'pos=MOD_scaler(pos,mMatrix*pos,attrVertNormal,mMatrix);' //modelMatrix*
    .endl();

var moduleVert=null;

op.onDelete=exec.onLinkChanged=removeModule;
inToZero.onChange=inSrc.onChange=updateToZero;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

function updateToZero()
{
    if(!shader)
    {
        needsUpdateToZero=true;
        return;
    }

    shader.toggleDefine(moduleVert.prefix+"TO_ZERO",inToZero.get());
    shader.toggleDefine(moduleVert.prefix+"OBJECT_POS",inSrc.get()=="Object position");
    needsUpdateToZero=false;
}


exec.onTriggered=function()
{
    if(!cgl.getShader())
    {
        next.trigger();
        return;
    }

    if(CABLES.UI)
    {
        if(gui.patch().isCurrentOp(op)) gui.setTransformGizmo({posX:x,posY:y,posZ:z});

        if(gui.patch().isCurrentOp(op) ||  CABLES.UI.renderHelper)
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix,cgl.mMatrix,[x.get(),y.get(),z.get()]);
            CABLES.GL_MARKER.drawSphere(op,inSize.get());
            cgl.popModelMatrix();
        }
    }

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.areascale_vert,
                srcBodyVert:srcBodyVert
            });

        inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        inSmooth.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);

        x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);
    }

    if(needsUpdateToZero)updateToZero();
    if(!shader)return;

    next.trigger();
};
