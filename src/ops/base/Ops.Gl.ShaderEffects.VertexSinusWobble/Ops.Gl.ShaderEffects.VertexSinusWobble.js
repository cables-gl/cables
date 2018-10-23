var self=this;
var cgl=self.patch.cgl;

var shader=null;
var module=null;
var uniTime;

this.render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

this.frequency=this.addInPort(new Port(this,"frequency",CABLES.OP_PORT_TYPE_VALUE));
var uniFrequency=null;
this.frequency.val=1.0;
// this.frequency.onValueChanged=function(){ if(uniFrequency)uniFrequency.setValue(self.frequency.val); };

this.amount=this.addInPort(new Port(this,"amount",CABLES.OP_PORT_TYPE_VALUE));
var uniAmount=null;
this.amount.val=1.0;
// this.amount.onValueChanged=function(){ if(uniAmount)uniAmount.setValue(self.amount.val); };


this.phase=this.addInPort(new Port(this,"phase",CABLES.OP_PORT_TYPE_VALUE));
var uniPhase=null;
this.phase.val=1.0;

var mul=this.addInPort(new Port(this,"mul",CABLES.OP_PORT_TYPE_VALUE));
var uniMul=null;
mul.set(3.0);

var add=this.addInPort(new Port(this,"add",CABLES.OP_PORT_TYPE_VALUE));
var uniAdd=null;
add.set(0);


this.toAxisX=this.addInPort(new Port(this,"axisX",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisX.val=true;
this.toAxisX.onValueChanged=setDefines;

this.toAxisY=this.addInPort(new Port(this,"axisY",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisY.val=true;
this.toAxisY.onValueChanged=setDefines;

this.toAxisZ=this.addInPort(new Port(this,"axisZ",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisZ.val=true;
this.toAxisZ.onValueChanged=setDefines;

var src=op.addInPort(new Port(op,"Source",CABLES.OP_PORT_TYPE_VALUE ,{display:'dropdown',values:[
    "X * Z + Time",
    "X * Y + Time",
    "X + Time",
    "Y + Time",
    "Z + Time"]} ));
src.onValueChanged=setDefines;


function setDefines()
{
    if(!shader)return;

    if(self.toAxisX.val)shader.define(module.prefix+'TO_AXIS_X');
        else shader.removeDefine(module.prefix+'TO_AXIS_X');

    if(self.toAxisY.val)shader.define(module.prefix+'TO_AXIS_Y');
        else shader.removeDefine(module.prefix+'TO_AXIS_Y');

    if(self.toAxisZ.val)shader.define(module.prefix+'TO_AXIS_Z');
        else shader.removeDefine(module.prefix+'TO_AXIS_Z');
    
    if(!src.get() || src.get()=='X * Z + Time' || src.get()==='') shader.define(module.prefix+'SRC_XZ');
        else shader.removeDefine(module.prefix+'SRC_XZ');

    if(src.get()=='X * Y + Time')shader.define(module.prefix+'SRC_XY');
        else shader.removeDefine(module.prefix+'SRC_XY');

    if(src.get()=='X + Time')shader.define(module.prefix+'SRC_X');
        else shader.removeDefine(module.prefix+'SRC_X');

    if(src.get()=='Y + Time')shader.define(module.prefix+'SRC_Y');
        else shader.removeDefine(module.prefix+'SRC_Y');

    if(src.get()=='Z + Time')shader.define(module.prefix+'SRC_Z');
        else shader.removeDefine(module.prefix+'SRC_Z');
}

var srcHeadVert=''
    .endl()+'UNI float MOD_time;'
    .endl()+'UNI float MOD_frequency;'
    .endl()+'UNI float MOD_amount;'
    .endl()+'UNI float MOD_phase;'
    .endl()+'UNI float MOD_mul;'
    .endl()+'UNI float MOD_add;'
    .endl();

var srcBodyVert=attachments.sinewobble_vert||'';



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

        uniTime=new CGL.Uniform(shader,'f',module.prefix+'time',0);
        uniFrequency=new CGL.Uniform(shader,'f',module.prefix+'frequency',self.frequency);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'amount',self.amount);
        uniPhase=new CGL.Uniform(shader,'f',module.prefix+'phase',self.phase);
        uniMul=new CGL.Uniform(shader,'f',module.prefix+'mul',mul);
        uniAdd=new CGL.Uniform(shader,'f',module.prefix+'add',add);
        setDefines();
    }

    uniTime.setValue(CABLES.now()/1000.0-startTime);
    self.trigger.trigger();
};
