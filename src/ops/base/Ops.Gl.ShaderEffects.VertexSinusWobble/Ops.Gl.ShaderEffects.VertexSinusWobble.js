var self=this;
const cgl=op.patch.cgl;

var shader=null;
var module=null;
var uniTime;

const render=op.inTrigger("render");
const next=this.outTrigger("trigger");
const frequency=op.inValueFloat("frequency",1);
const amount=op.inValueSlider("amount",1.0);
const phase=op.inValueFloat("phase",1);
const mul=op.inValueFloat("mul",3);
const add=op.inValueFloat("add",0);
const toAxisX=op.inValueBool("axisX",true);
const toAxisY=op.inValueBool("axisY",true);
const toAxisZ=op.inValueBool("axisZ",true);
var src=op.inValueSelect("Source",[
    "X * Z + Time",
    "X * Y + Time",
    "X + Time",
    "Y + Time",
    "Z + Time"],"X * Z + Time" );

var uniMul=null;
var uniFrequency=null;
var uniAmount=null;
var uniPhase=null;
var uniAdd=null;



src.onChange=
    toAxisZ.onChange=
    toAxisX.onChange=
    toAxisY.onChange=setDefines;

function setDefines()
{
    if(!shader)return;

    if(toAxisX.val)shader.define(module.prefix+'TO_AXIS_X');
        else shader.removeDefine(module.prefix+'TO_AXIS_X');

    if(toAxisY.val)shader.define(module.prefix+'TO_AXIS_Y');
        else shader.removeDefine(module.prefix+'TO_AXIS_Y');

    if(toAxisZ.val)shader.define(module.prefix+'TO_AXIS_Z');
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

render.onLinkChanged=removeModule;
render.onTriggered=function()
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
        uniFrequency=new CGL.Uniform(shader,'f',module.prefix+'frequency',frequency);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'amount',amount);
        uniPhase=new CGL.Uniform(shader,'f',module.prefix+'phase',phase);
        uniMul=new CGL.Uniform(shader,'f',module.prefix+'mul',mul);
        uniAdd=new CGL.Uniform(shader,'f',module.prefix+'add',add);
        setDefines();
    }

    uniTime.setValue(CABLES.now()/1000.0-startTime);
    next.trigger();
};
