const cgl=op.patch.cgl;

op.render=op.inTrigger("render");

const
    inInvert=op.inValueBool("Invert"),
    inArea=op.inValueSelect("Area",["Sphere","Box","Axis X","Axis Y","Axis Z","Axis XY","Axis XZ","Axis X Infinite","Axis Y Infinite","Axis Z Infinite"],"Sphere"),
    inSize=op.inValue("Size",1),
    inSizeX=op.inValueFloat("Size X",1),
    inSizeY=op.inValueFloat("Size Y",1),
    inSizeZ=op.inValueFloat("Size Z",1),
    inRepeat=op.inValueBool("Repeat"),
    inRepeatDist=op.inValueFloat("Repeat Distance",0.0),
    x=op.inValue("x"),
    y=op.inValue("y"),
    z=op.inValue("z"),
    inWorldSpace=op.inValueBool("WorldSpace",true);

op.trigger=op.outTrigger("trigger");



op.setPortGroup("Size",[inSize,inSizeY,inSizeX,inSizeZ]);
op.setPortGroup("Position",[x,y,z,inWorldSpace]);


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
inRepeat.onChange=updateRepeat;


function updateInvert()
{
    if(!shader)return;
    if(inInvert.get()) shader.define(moduleVert.prefix+"AREA_INVERT");
        else shader.removeDefine(moduleVert.prefix+"AREA_INVERT");
}

function updateRepeat()
{
    if(!shader)return;
    if(inRepeat.get()) shader.define(moduleVert.prefix+"AREA_REPEAT");
        else shader.removeDefine(moduleVert.prefix+"AREA_REPEAT");
}

function updateArea()
{
    if(!shader)return;

    // shader.removeDefine(moduleVert.prefix+"AREA_AXIS_X");
    // shader.removeDefine(moduleVert.prefix+"AREA_AXIS_Y");
    // shader.removeDefine(moduleVert.prefix+"AREA_AXIS_Z");
    // shader.removeDefine(moduleVert.prefix+"AREA_AXIS_XY");
    // shader.removeDefine(moduleVert.prefix+"AREA_AXIS_XZ");
    // shader.removeDefine(moduleVert.prefix+"AREA_AXIS_X_INFINITE");
    // shader.removeDefine(moduleVert.prefix+"AREA_AXIS_Y_INFINITE");
    // shader.removeDefine(moduleVert.prefix+"AREA_AXIS_Z_INFINITE");

    shader.toggleDefine(moduleVert.prefix+"AREA_BOX",inArea.get()=="Box");
    shader.toggleDefine(moduleVert.prefix+"AREA_SPHERE",inArea.get()=="Sphere");

    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_X",inArea.get()=="Axis X");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_Y",inArea.get()=="Axis Y");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_Z",inArea.get()=="Axis Z");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_XY",inArea.get()=="Axis XY");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_XZ",inArea.get()=="Axis XZ");


    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_X_INFINITE",inArea.get()=="Axis X Infinite");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_Y_INFINITE",inArea.get()=="Axis Y Infinite");
    shader.toggleDefine(moduleVert.prefix+"AREA_AXIS_Z_INFINITE",inArea.get()=="Axis Z Infinite");


    // if(inArea.get()=="Axis X")shader.define(moduleVert.prefix+"AREA_AXIS_X");
    // else if(inArea.get()=="Axis Y")shader.define(moduleVert.prefix+"AREA_AXIS_Y");
    // else if(inArea.get()=="Axis Z")shader.define(moduleVert.prefix+"AREA_AXIS_Z");
    // else if(inArea.get()=="Axis XY")shader.define(moduleVert.prefix+"AREA_AXIS_XY");
    // else if(inArea.get()=="Axis XZ")shader.define(moduleVert.prefix+"AREA_AXIS_XZ");

    // else if(inArea.get()=="Axis X Infinite")shader.define(moduleVert.prefix+"AREA_AXIS_X_INFINITE");
    // else if(inArea.get()=="Axis Y Infinite")shader.define(moduleVert.prefix+"AREA_AXIS_Y_INFINITE");
    // else if(inArea.get()=="Axis Z Infinite")shader.define(moduleVert.prefix+"AREA_AXIS_Z_INFINITE");




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

    if(CABLES.UI && gui.patch().isCurrentOp(op))
        gui.setTransformGizmo(
            {
                posX:x,
                posY:y,
                posZ:z
            });

    if(CABLES.UI && CABLES.UI.renderHelper)
    {
        CABLES.GL_MARKER.drawSphere(op,inSize.get());
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
                srcHeadFrag:attachments.areadiscard_head_frag||'',
                srcBodyFrag:attachments.areadiscard_frag||''
            },moduleVert);

        inSize.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'size',inSize);

        x.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'z',z);


        op.uniformSizeXYZ=new CGL.Uniform(shader,'3f',moduleFrag.prefix+'sizeAxis',inSizeX,inSizeY,inSizeZ);


        inRepeatDist.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'repeat',inRepeatDist);

        updateWorldspace();
        updateArea();
        updateInvert();
        updateRepeat();
    }

    if(!shader)return;

    op.trigger.trigger();
};













