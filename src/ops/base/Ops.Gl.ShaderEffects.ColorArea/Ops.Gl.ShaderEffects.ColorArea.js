const cgl=op.patch.cgl;

op.render=op.inTrigger("render");
op.trigger=op.outTrigger("trigger");

const inArea=op.inValueSelect("Area",["Sphere","Axis X","Axis Y","Axis Z","Axis X Infinite","Axis Y Infinite","Axis Z Infinite"],"Sphere");

const inSize=op.inValue("Size",1);
const inAmount=op.inValueSlider("Amount",0.5);

const inFalloff=op.inValueSlider("Falloff",0);
const inInvert=op.inValueBool("Invert");


var inBlend=op.inValueSelect("Blend ",["Normal","Multiply"],"Normal");

const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
r.setUiAttribs({ colorPick: true });

const x=op.inValue("x");
const y=op.inValue("y");
const z=op.inValue("z");

const sizeX=op.inValueSlider("Size X",1);

op.setPortGroup("Position",[x,y,z]);
op.setPortGroup("Color",[inBlend,r,g,b]);

const inWorldSpace=op.inValueBool("WorldSpace",true);

var shader=null;

var srcHeadVert=''
    .endl()+'OUT vec4 MOD_areaPos;'
    .endl();

var srcBodyVert=''
    .endl()+'#ifndef MOD_WORLDSPACE'
    .endl()+'   MOD_areaPos=pos;'
    .endl()+'#endif'
    .endl()+'#ifdef MOD_WORLDSPACE'
    .endl()+'   MOD_areaPos=mMatrix*pos;'
    .endl()+'#endif'
    .endl();

var moduleFrag=null;
var moduleVert=null;

op.render.onLinkChanged=removeModule;
inWorldSpace.onChange=updateWorldspace;
inArea.onChange=updateArea;
inInvert.onChange=updateInvert;
inBlend.onChange=updateBlend;

function updateBlend()
{
    if(!shader)return;

    shader.removeDefine(moduleVert.prefix+"BLEND_NORMAL");
    shader.removeDefine(moduleVert.prefix+"BLEND_MULTIPLY");

    if(inBlend.get()=="Normal") shader.define(moduleVert.prefix+"BLEND_NORMAL");
        else shader.define(moduleVert.prefix+"BLEND_MULTIPLY");
}


function updateInvert()
{
    if(!shader)return;
    if(inInvert.get()) shader.define(moduleVert.prefix+"AREA_INVERT");
        else shader.removeDefine(moduleVert.prefix+"AREA_INVERT");
}

function updateArea()
{
    if(!shader)return;

    shader.removeDefine(moduleVert.prefix+"AREA_AXIS_X");
    shader.removeDefine(moduleVert.prefix+"AREA_AXIS_Y");
    shader.removeDefine(moduleVert.prefix+"AREA_AXIS_Z");
    shader.removeDefine(moduleVert.prefix+"AREA_AXIS_X_INFINITE");
    shader.removeDefine(moduleVert.prefix+"AREA_AXIS_Y_INFINITE");
    shader.removeDefine(moduleVert.prefix+"AREA_AXIS_Z_INFINITE");
    shader.removeDefine(moduleVert.prefix+"AREA_SPHERE");
    if(inArea.get()=="Axis X")shader.define(moduleVert.prefix+"AREA_AXIS_X");
    else if(inArea.get()=="Axis Y")shader.define(moduleVert.prefix+"AREA_AXIS_Y");
    else if(inArea.get()=="Axis Z")shader.define(moduleVert.prefix+"AREA_AXIS_Z");

    else if(inArea.get()=="Axis X Infinite")shader.define(moduleVert.prefix+"AREA_AXIS_X_INFINITE");
    else if(inArea.get()=="Axis Y Infinite")shader.define(moduleVert.prefix+"AREA_AXIS_Y_INFINITE");
    else if(inArea.get()=="Axis Z Infinite")shader.define(moduleVert.prefix+"AREA_AXIS_Z_INFINITE");
    else shader.define(moduleVert.prefix+"AREA_SPHERE");
}

function updateWorldspace()
{
    if(!shader)return;
    if(inWorldSpace.get()) shader.define(moduleVert.prefix+"WORLDSPACE");
        else shader.removeDefine(moduleVert.prefix+"WORLDSPACE");
}

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

op.render.onTriggered=function()
{

    if(CABLES.UI)
    {
        cgl.pushModelMatrix();
        mat4.identity(cgl.mMatrix);
        if(gui.patch().isCurrentOp(op))
            gui.setTransformGizmo(
                {
                    posX:x,
                    posY:y,
                    posZ:z
                });

        if(CABLES.UI.renderHelper ||gui.patch().isCurrentOp(op))
        {
            mat4.translate(cgl.mMatrix,cgl.mMatrix,[x.get(),y.get(),z.get()]);
            CABLES.GL_MARKER.drawSphere(op,inSize.get());
        }
        cgl.popModelMatrix();
    }

    if(!cgl.getShader())
    {
         op.trigger.trigger();
         return;
    }

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

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

        inSize.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'size',inSize);
        inAmount.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'amount',inAmount);

        r.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'r',r);
        g.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'g',g);
        b.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'b',b);

        x.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'z',z);
        sizeX.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'sizeX',sizeX);

        inFalloff.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'falloff',inFalloff);

        updateWorldspace();
        updateArea();
        updateInvert();
        updateBlend();
    }

    if(!shader)return;
    var texSlot=moduleVert.num+5;

    op.trigger.trigger();
};













