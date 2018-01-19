
var cgl=op.patch.cgl;

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inArea=op.inValueSelect("Area",["Sphere","Axis X","Axis Y","Axis Z","Axis X Infinite","Axis Y Infinite","Axis Z Infinite"],"Sphere");

var inSize=op.inValue("Size",1);
var inAmount=op.inValueSlider("Amount",0.5);

var inFalloff=op.inValueSlider("Falloff",0);
var inInvert=op.inValueBool("Invert");

{
    // rgba colors
    var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
    r.set(Math.random());
    
    var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range'}));
    g.set(Math.random());
    
    var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.set(Math.random());
}

var inBlend=op.inValueSelect("Blend ",["Normal","Multiply"],"Normal");


{
    // position
    var x=op.inValue("x");
    var y=op.inValue("y");
    var z=op.inValue("z");
}

var inWorldSpace=op.inValueBool("WorldSpace",true);

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













