const
    render=op.inTrigger("render"),
    next=op.outTrigger("trigger"),
    inMode=op.inSwitch("Mode",['Rotate','Translate'],'Translate'),
    inSize=op.inValue("Size",1),
    inStrength=op.inValue("Strength",1),
    inSmooth=op.inValueBool("Smooth",true),
    x=op.inValue("x"),
    y=op.inValue("y"),
    z=op.inValue("z"),
    inNoiseScale=op.inValue("Noise Scale",0.5),
    tx=op.inValue("Noise X"),
    ty=op.inValue("Noise Y"),
    tz=op.inValue("Noise Z");

const cgl=op.patch.cgl;
op.setPortGroup("Noise",[inNoiseScale,tx,ty,tz]);
op.setPortGroup("Area Position",[x,y,z]);

var needsUpdateToZero=true;
var mscaleUni=null;
var shader=null;
var uniforms={};
var srcHeadVert=attachments.areascale_vert;
var moduleVert=null;
var srcBodyVert=''
    .endl()+'mMatrix=MOD_translate(mMatrix);' //modelMatrix*
    .endl();

render.onLinkChanged=removeModule;
inMode.onChange=updateMode;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

function updateMode()
{
    if(!shader)return;
    shader.toggleDefine(moduleVert.prefix+"DO_ROTATE",inMode.get()=="Rotate");
    shader.toggleDefine(moduleVert.prefix+"DO_TRANSLATE",inMode.get()=="Translate");
}

render.onTriggered=function()
{
    if(!cgl.getShader())
    {
        next.trigger();
        return;
    }

    if(CABLES.UI)
    {
        if(gui.patch().isCurrentOp(op)) gui.setTransformGizmo({ posX:x, posY:y, posZ:z });
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
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        updateMode();

        uniforms.inSizeUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        uniforms.inStrengthUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        uniforms.inSmoothUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);
        uniforms.inNoiseScaleUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'noiseScale',inNoiseScale);

        uniforms.xUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        uniforms.yUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        uniforms.zUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);

        uniforms.txUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'tx',tx);
        uniforms.tyUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'ty',ty);
        uniforms.tzUniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'tz',tz);
    }


    if(!shader)return;

    next.trigger();
};
