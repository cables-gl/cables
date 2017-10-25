var self=this;
var cgl=self.patch.cgl;

var shader=null;
var module=null;
var uniTime;

this.name='VertexSinusWobble';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.frequency=this.addInPort(new Port(this,"frequency",OP_PORT_TYPE_VALUE));
var uniFrequency=null;
this.frequency.val=1.0;
// this.frequency.onValueChanged=function(){ if(uniFrequency)uniFrequency.setValue(self.frequency.val); };

this.amount=this.addInPort(new Port(this,"amount",OP_PORT_TYPE_VALUE));
var uniAmount=null;
this.amount.val=1.0;
// this.amount.onValueChanged=function(){ if(uniAmount)uniAmount.setValue(self.amount.val); };


this.phase=this.addInPort(new Port(this,"phase",OP_PORT_TYPE_VALUE));
var uniPhase=null;
this.phase.val=1.0;

var mul=this.addInPort(new Port(this,"mul",OP_PORT_TYPE_VALUE));
var uniMul=null;
mul.set(3.0);

var add=this.addInPort(new Port(this,"add",OP_PORT_TYPE_VALUE));
var uniAdd=null;
add.set(0);


this.toAxisX=this.addInPort(new Port(this,"axisX",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisX.val=true;
this.toAxisX.onValueChanged=setDefines;

this.toAxisY=this.addInPort(new Port(this,"axisY",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisY.val=true;
this.toAxisY.onValueChanged=setDefines;

this.toAxisZ=this.addInPort(new Port(this,"axisZ",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisZ.val=true;
this.toAxisZ.onValueChanged=setDefines;

var src=op.addInPort(new Port(op,"Source",OP_PORT_TYPE_VALUE ,{display:'dropdown',values:[
    "X * Z + Time",
    "X * Y + Time",
    "X + Time",
    "Y + Time",
    "Z + Time"]} ));
src.onValueChanged=setDefines;


function setDefines()
{
    if(!shader)return;

    if(self.toAxisX.val)shader.define(module.prefix+'_TO_AXIS_X');
        else shader.removeDefine(module.prefix+'_TO_AXIS_X');

    if(self.toAxisY.val)shader.define(module.prefix+'_TO_AXIS_Y');
        else shader.removeDefine(module.prefix+'_TO_AXIS_Y');

    if(self.toAxisZ.val)shader.define(module.prefix+'_TO_AXIS_Z');
        else shader.removeDefine(module.prefix+'_TO_AXIS_Z');
    
    if(!src.get() || src.get()=='X * Z + Time' || src.get()==='') shader.define(module.prefix+'_SRC_XZ');
        else shader.removeDefine(module.prefix+'_SRC_XZ');

    if(src.get()=='X * Y + Time')shader.define(module.prefix+'_SRC_XY');
        else shader.removeDefine(module.prefix+'_SRC_XY');

    if(src.get()=='X + Time')shader.define(module.prefix+'_SRC_X');
        else shader.removeDefine(module.prefix+'_SRC_X');

    if(src.get()=='Y + Time')shader.define(module.prefix+'_SRC_Y');
        else shader.removeDefine(module.prefix+'_SRC_Y');

    if(src.get()=='Z + Time')shader.define(module.prefix+'_SRC_Z');
        else shader.removeDefine(module.prefix+'_SRC_Z');
}

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_time;'
    .endl()+'uniform float {{mod}}_frequency;'
    .endl()+'uniform float {{mod}}_amount;'
    .endl()+'uniform float {{mod}}_phase;'
    .endl()+'uniform float {{mod}}_mul;'
    .endl()+'uniform float {{mod}}_add;'
    .endl();

var srcBodyVert=''
    .endl()+'#ifdef {{mod}}_SRC_XZ'
    .endl()+'   float {{mod}}_v=(pos.x*pos.z)+{{mod}}_add;'
    .endl()+'#endif'
    .endl()+'#ifdef {{mod}}_SRC_XY'
    .endl()+'   float {{mod}}_v=(pos.x*pos.y)+{{mod}}_add;'
    .endl()+'#endif'
    .endl()+'#ifdef {{mod}}_SRC_X'
    .endl()+'   float {{mod}}_v=pos.x+{{mod}}_add;'
    .endl()+'#endif'
    .endl()+'#ifdef {{mod}}_SRC_Y'
    .endl()+'   float {{mod}}_v=pos.y+{{mod}}_add;'
    .endl()+'#endif'
    .endl()+'#ifdef {{mod}}_SRC_Z'
    .endl()+'   float {{mod}}_v=pos.z+{{mod}}_add;'
    .endl()+'#endif'


    .endl()+'{{mod}}_v=sin( {{mod}}_time+( {{mod}}_v*{{mod}}_mul  )* {{mod}}_frequency + {{mod}}_phase ) * {{mod}}_amount;'

    .endl()+'#ifdef {{mod}}_TO_AXIS_X'
    .endl()+'   pos.x+={{mod}}_v;'
    .endl()+'#endif'

    .endl()+'#ifdef {{mod}}_TO_AXIS_Y'
    .endl()+'   pos.y+={{mod}}_v;'
    .endl()+'#endif'

    .endl()+'#ifdef {{mod}}_TO_AXIS_Z'
    .endl()+'   pos.z+={{mod}}_v;'
    .endl()+'#endif'

    .endl();




var startTime=CABLES.now()/1000.0;

function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader=null;
    }
}

this.render.onLinkChanged=removeModule;
this.render.onTriggered=function()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        uniTime=new CGL.Uniform(shader,'f',module.prefix+'_time',0);
        uniFrequency=new CGL.Uniform(shader,'f',module.prefix+'_frequency',self.frequency);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_amount',self.amount);
        uniPhase=new CGL.Uniform(shader,'f',module.prefix+'_phase',self.phase);
        uniMul=new CGL.Uniform(shader,'f',module.prefix+'_mul',mul);
        uniAdd=new CGL.Uniform(shader,'f',module.prefix+'_add',add);
        setDefines();
    }

    uniTime.setValue(CABLES.now()/1000.0-startTime);
    self.trigger.trigger();
};
