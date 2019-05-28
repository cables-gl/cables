const
    render=op.inTrigger("render"),
    next=op.outTrigger("trigger"),
    inScale=op.inValueFloat("Scale",1),
    inSize=op.inValueFloat("Size",1),
    inStrength=op.inValueFloat("Strength",1),
    inCalcNormals=op.inValueBool("Calc Normals",true),
    inFalloff=op.inValueSlider("Falloff",0.5),
    output=op.inValueSelect("Output",['Mul Normal','Add XYZ','Add Z'],'Add XYZ'),
    x=op.inValueFloat("x"),
    y=op.inValueFloat("y"),
    z=op.inValueFloat("z"),
    scrollx=op.inValueFloat("Scroll X"),
    scrolly=op.inValueFloat("Scroll Y"),
    scrollz=op.inValueFloat("Scroll Z");

const cgl=op.patch.cgl;
inCalcNormals.onChange=updateCalcNormals;
var inWorldSpace=op.inValueBool("WorldSpace");
var shader=null;
var moduleVert=null;
output.onChange=updateOutput;
render.onLinkChanged=removeModule;

var mscaleUni=null;
inWorldSpace.onChange=updateWorldspace;

function updateCalcNormals()
{
    if(!shader)return;
    shader.toggleDefine(moduleVert.prefix+"CALC_NORMALS",inCalcNormals.get());
}

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

function updateOutput()
{
    if(!shader)return;

    shader.toggleDefine(moduleVert.prefix+"METH_ADD_XYZ",output.get()=='Add XYZ');
    shader.toggleDefine(moduleVert.prefix+"METH_ADD_Z",output.get()=='Add Z');
    shader.toggleDefine(moduleVert.prefix+"METH_MULNORM",output.get()=='Mul Normal');
}

function updateWorldspace()
{
    if(!shader)return;
    if(inWorldSpace.get()) shader.define(moduleVert.prefix+"WORLDSPACE");
        else shader.removeDefine(moduleVert.prefix+"WORLDSPACE");
}

function getScaling(mat)
{
    var m31 = mat[8];
    var m32 = mat[9];
    var m33 = mat[10];
    return Math.hypot(m31, m32, m33);
}

render.onTriggered=function()
{
    if(!cgl.getShader())
    {
        next.trigger();
        return;
    }

    var modelScale=getScaling(cgl.mMatrix);
    if(mscaleUni)mscaleUni.setValue(modelScale);

    if(CABLES.UI)
    {
        cgl.pushModelMatrix();

        if(CABLES.UI && (gui.patch().isCurrentOp(op) ||  CABLES.UI.renderHelper))
        {
            cgl.pushModelMatrix();
            mat4.translate(cgl.mMatrix,cgl.mMatrix,[x.get(),y.get(),z.get()]);
            CABLES.GL_MARKER.drawSphere(op,inSize.get());
            cgl.popModelMatrix();
        }

        if(gui.patch().isCurrentOp(op))
            gui.setTransformGizmo(
                {
                    posX:x,
                    posY:y,
                    posZ:z
                });

        cgl.popModelMatrix();
    }

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.perlindeform_vert,
                srcBodyVert:attachments.perlindeform_body_vert
            });

        inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        inScale.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scale',inScale);

        scrollx.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollx',scrollx);
        scrolly.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrolly',scrolly);
        scrollz.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollz',scrollz);

        x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);
        inFalloff.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'fallOff',inFalloff);

        mscaleUni=new CGL.Uniform(shader,'f',moduleVert.prefix+'mScale',1);

        updateOutput();
        updateWorldspace();
        updateCalcNormals();
    }

    if(!shader)return;

    next.trigger();
};













