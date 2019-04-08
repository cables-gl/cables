
var cgl=op.patch.cgl;

op.render=op.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var inScale=op.inValue("Scale",1);
var inSize=op.inValue("Size",1);
var inStrength=op.inValue("Strength",1);
var inSmooth=op.inValueBool("Smooth",true);

var output=op.inValueSelect("Output",['Add XYZ','Add Z'],'Add XYZ');

var x=op.inValue("x");
var y=op.inValue("y");
var z=op.inValue("z");



var scrollx=op.inValue("Scroll X");
var scrolly=op.inValue("Scroll Y");
var scrollz=op.inValue("Scroll Z");

var shader=null;

var inWorldSpace=op.inValueBool("WorldSpace");

var moduleVert=null;

function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

output.onChange=updateOutput;
op.render.onLinkChanged=removeModule;


inWorldSpace.onChange=updateWorldspace;

function updateOutput()
{
    if(!shader)return;
    if(output.get()=='Add XYZ') shader.define(moduleVert.prefix+"METH_ADD_XYZ");
        else shader.removeDefine(moduleVert.prefix+"METH_ADD_XYZ");

    if(output.get()=='Add Z') shader.define(moduleVert.prefix+"METH_ADD_Z");
        else shader.removeDefine(moduleVert.prefix+"METH_ADD_Z");

}

function updateWorldspace()
{
    if(!shader)return;
    shader.toggleDefine(moduleVert.prefix+"WORLDSPACE",inWorldSpace.get());
}


op.render.onTriggered=function()
{
    if(!cgl.getShader())
    {
        op.trigger.trigger();
        return;
    }

    if(CABLES.UI)
    {
        cgl.pushModelMatrix();
        mat4.identity(cgl.mMatrix);

        if(CABLES.UI.renderHelper)
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
        inSmooth.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);
        inScale.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scale',inScale);

        scrollx.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollx',scrollx);
        scrolly.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrolly',scrolly);
        scrollz.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'scrollz',scrollz);

        x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);

        updateOutput();
        updateWorldspace();
    }


    if(!shader)return;

    op.trigger.trigger();
};













