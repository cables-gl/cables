var render=op.addInPort(new CABLES.Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var next=op.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var inArea=op.inValueSelect("Area",["Sphere","Axis X","Axis Y","Axis Z","Axis X Infinite","Axis Y Infinite","Axis Z Infinite"],"Sphere");

var inAmount=op.inValue("Amount",1);
var inSize=op.inValue("Size",20);
var inFalloff=op.inValueSlider("Falloff",0.5);
var inScale=op.inValueSlider("Scale",1);
var inInvert=op.inValueBool("Invert");


{
    // position
    var x=op.inValue("x");
    var y=op.inValue("y");
    var z=op.inValue("z");
}




var shader=null;
var moduleVert=null;
var cgl=op.patch.cgl;

inInvert.onChange=updateInvert;
inArea.onChange=updateArea;

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


function removeModule()
{
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}

render.onLinkChanged=removeModule;

render.onTriggered=function()
{
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
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.submeshfracture_head_vert,
                srcBodyVert:attachments.submeshfracture_vert
            });

        inAmount.amount=new CGL.Uniform(shader,'f',moduleVert.prefix+'amount',inAmount);
        inSize.unif=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        inFalloff.unif=new CGL.Uniform(shader,'f',moduleVert.prefix+'falloff',inFalloff);
        inScale.unif=new CGL.Uniform(shader,'f',moduleVert.prefix+'scale',inScale);
        
        
        x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);
        updateArea();
        updateInvert();
    }

    if(!shader)return;

    next.trigger();
};
