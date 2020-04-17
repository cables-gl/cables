const
    render=op.inTrigger("Render"),
    inArea=op.inValueSelect("Area",["Sphere","Box","Axis X","Axis Y","Axis Z","Axis X Infinite","Axis Y Infinite","Axis Z Infinite"],"Sphere"),
    inSize=op.inValue("Size",1),
    inAmount=op.inValueSlider("Amount",0.5),
    inFalloff=op.inValueSlider("Falloff",0),
    inInvert=op.inValueBool("Invert"),
    inBlend=op.inSwitch("Blend ",["Normal","Multiply"],"Normal"),
    r = op.inValueSlider("r", Math.random()),
    g = op.inValueSlider("g", Math.random()),
    b = op.inValueSlider("b", Math.random()),
    x=op.inValue("x"),
    y=op.inValue("y"),
    z=op.inValue("z"),
    sizeX=op.inValueSlider("Size X",1),
    inWorldSpace=op.inValueBool("WorldSpace",true),
    next=op.outTrigger("Next");

op.setPortGroup("Position",[x,y,z]);
op.setPortGroup("Color",[inBlend,r,g,b]);
r.setUiAttribs({ colorPick: true });

const cgl=op.patch.cgl;
var moduleFrag=null;
var moduleVert=null;
var uniforms={};
var shader=null;
var origShader=null;

const srcHeadVert=''
    .endl()+'OUT vec4 MOD_areaPos;'
    .endl();

const srcBodyVert=''
    .endl()+'#ifndef MOD_WORLDSPACE'
    .endl()+'   MOD_areaPos=pos;'
    .endl()+'#endif'
    .endl()+'#ifdef MOD_WORLDSPACE'
    .endl()+'   MOD_areaPos=mMatrix*pos;'
    .endl()+'#endif'
    .endl();

render.onLinkChanged=removeModule;

inWorldSpace.onChange=
    inArea.onChange=
    inInvert.onChange=
    inBlend.onChange=updateDefines;

render.onTriggered=doRender;

function updateDefines()
{
    if(!shader)return;
    shader.toggleDefine(moduleVert.prefix+"BLEND_NORMAL",inBlend.get()=="Normal");
    shader.toggleDefine(moduleVert.prefix+"BLEND_MULTIPLY",inBlend.get()!="Normal");

    shader.toggleDefine(moduleVert.prefix+"AREA_INVERT",inInvert.get());
    shader.toggleDefine(moduleVert.prefix+"WORLDSPACE",inWorldSpace.get());

    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_X",inArea.get()=="Axis X");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_Y",inArea.get()=="Axis Y");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_Z",inArea.get()=="Axis Z");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_X_INFINITE",inArea.get()=="Axis X Infinite");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_Y_INFINITE",inArea.get()=="Axis Y Infinite");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_Z_INFINITE",inArea.get()=="Axis Z Infinite");
    shader.toggleDefine(moduleVert.prefix+"AREA_SPHERE",inArea.get()=="Sphere");
    shader.toggleDefine(moduleVert.prefix+"AREA_BOX",inArea.get()=="Box");
}

function removeModule()
{
    if(shader) shader.dispose();
    origShader=null;
    shader=null;
}

function doRender()
{
    if(CABLES.UI)
    {
        cgl.pushModelMatrix();
        mat4.identity(cgl.mMatrix);

        if(gui.patch().isCurrentOp(op)) gui.setTransformGizmo({posX:x,posY:y,posZ:z});

        if(CABLES.UI.renderHelper ||gui.patch().isCurrentOp(op))
        {
            mat4.translate(cgl.mMatrix,cgl.mMatrix,[x.get(),y.get(),z.get()]);
            CABLES.GL_MARKER.drawSphere(op,inSize.get());
        }
        cgl.popModelMatrix();
    }

    if(!cgl.getShader())
    {
        next.trigger();
        return;
    }

    if(cgl.getShader()!=origShader)
    {
        if(shader) removeModule();
        origShader=cgl.getShader();
        shader=origShader.copy();

        moduleVert=shader.addModule(
            {
                priority:2,
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        moduleFrag=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_COLOR',
                srcHeadFrag:attachments.colorarea_head_frag,
                srcBodyFrag:attachments.colorarea_frag
            },moduleVert);

        uniforms.inSize=new CGL.Uniform(shader,'f',moduleFrag.prefix+'size',inSize);
        uniforms.inAmount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);

        uniforms.color=new CGL.Uniform(shader,'3f',moduleFrag.prefix+'color',r,g,b);
        uniforms.pos=new CGL.Uniform(shader,'3f',moduleFrag.prefix+'pos',x,y,z);
        uniforms.sizeX=new CGL.Uniform(shader,'f',moduleFrag.prefix+'sizeX',sizeX);
        uniforms.inFalloff=new CGL.Uniform(shader,'f',moduleFrag.prefix+'falloff',inFalloff);

        updateDefines();
    }

    if(!shader)return;

    shader.copyUniforms(origShader);

    cgl.pushShader(shader);
    next.trigger();
    cgl.popShader();
}


