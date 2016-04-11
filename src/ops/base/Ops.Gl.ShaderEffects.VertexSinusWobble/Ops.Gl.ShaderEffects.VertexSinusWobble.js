CABLES.Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

var shader=null;
var uniTime;

this.name='VertexSinusWobble';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.frequency=this.addInPort(new Port(this,"frequency",OP_PORT_TYPE_VALUE));
var uniFrequency=null;
this.frequency.val=1.0;
this.frequency.onValueChanged=function(){ if(uniFrequency)uniFrequency.setValue(self.frequency.val); };

this.amount=this.addInPort(new Port(this,"amount",OP_PORT_TYPE_VALUE));
var uniAmount=null;
this.amount.val=1.0;
this.amount.onValueChanged=function(){ if(uniAmount)uniAmount.setValue(self.amount.val); };


this.phase=this.addInPort(new Port(this,"phase",OP_PORT_TYPE_VALUE));
var uniPhase=null;
this.phase.val=1.0;
this.phase.onValueChanged=function(){ if(uniAmount)uniAmount.setValue(self.phase.val); };


this.toAxisX=this.addInPort(new Port(this,"axisX",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisX.val=true;
this.toAxisX.onValueChanged=setDefines;

this.toAxisY=this.addInPort(new Port(this,"axisY",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisY.val=true;
this.toAxisY.onValueChanged=setDefines;

this.toAxisZ=this.addInPort(new Port(this,"axisZ",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.toAxisZ.val=true;
this.toAxisZ.onValueChanged=setDefines;


function setDefines()
{
    if(!shader)return;

    if(self.toAxisX.val)shader.define(module.prefix+'_TO_AXIS_X');
        else shader.removeDefine(module.prefix+'_TO_AXIS_X');

    if(self.toAxisY.val)shader.define(module.prefix+'_TO_AXIS_Y');
        else shader.removeDefine(module.prefix+'_TO_AXIS_Y');

    if(self.toAxisZ.val)shader.define(module.prefix+'_TO_AXIS_Z');
        else shader.removeDefine(module.prefix+'_TO_AXIS_Z');
}

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_time;'
    .endl()+'uniform float {{mod}}_frequency;'
    .endl()+'uniform float {{mod}}_amount;'
    .endl()+'uniform float {{mod}}_phase;'
    .endl();

var srcBodyVert=''
    .endl()+'float {{mod}}_v=sin( (pos.x*pos.z)*3.0 + {{mod}}_time * {{mod}}_frequency + {{mod}}_phase ) * {{mod}}_amount;'

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




var startTime=Date.now()/1000.0;

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
        uniFrequency=new CGL.Uniform(shader,'f',module.prefix+'_frequency',self.frequency.val);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_amount',self.amount.val);
        uniPhase=new CGL.Uniform(shader,'f',module.prefix+'_phase',self.phase.val);
        setDefines();
    }

    uniTime.setValue(Date.now()/1000.0-startTime);
    self.trigger.trigger();
};