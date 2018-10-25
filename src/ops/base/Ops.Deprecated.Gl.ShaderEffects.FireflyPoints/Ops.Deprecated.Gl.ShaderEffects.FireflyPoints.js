
var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var next=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

op.frequency=op.addInPort(new CABLES.Port(op,"frequency",CABLES.OP_PORT_TYPE_VALUE));
var uniFrequency=null;
op.frequency.val=1.0;

op.amount=op.addInPort(new CABLES.Port(op,"amount",CABLES.OP_PORT_TYPE_VALUE));
var uniAmount=null;
op.amount.val=1.0;

op.phase=op.addInPort(new CABLES.Port(op,"phase",CABLES.OP_PORT_TYPE_VALUE));
var uniPhase=null;
op.phase.val=1.0;

var mul=op.addInPort(new CABLES.Port(op,"mul",CABLES.OP_PORT_TYPE_VALUE));
var uniMul=null;
mul.set(3.0);

var add=op.addInPort(new CABLES.Port(op,"add",CABLES.OP_PORT_TYPE_VALUE));
var uniAdd=null;
add.set(0);


op.toAxisX=op.addInPort(new CABLES.Port(op,"axisX",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
op.toAxisX.val=true;
op.toAxisX.onValueChanged=setDefines;

op.toAxisY=op.addInPort(new CABLES.Port(op,"axisY",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
op.toAxisY.val=true;
op.toAxisY.onValueChanged=setDefines;

op.toAxisZ=op.addInPort(new CABLES.Port(op,"axisZ",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
op.toAxisZ.val=true;
op.toAxisZ.onValueChanged=setDefines;

var cgl=op.patch.cgl;

var shader=null;
var module=null;
var uniTime;



var src=op.addInPort(new CABLES.Port(op,"Source",CABLES.OP_PORT_TYPE_VALUE ,{display:'dropdown',values:[
    "X * Z + Time",
    "X * Y + Time",
    "X + Time",
    "Y + Time",
    "Z + Time"]} ));
src.onValueChanged=setDefines;


function setDefines()
{

}

var srcHeadVert=attachments.firefly_head_vert;

var srcBodyVert=attachments.firefly_vert;





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
        uniFrequency=new CGL.Uniform(shader,'f',module.prefix+'frequency',op.frequency);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'amount',op.amount);
        uniPhase=new CGL.Uniform(shader,'f',module.prefix+'phase',op.phase);
        uniMul=new CGL.Uniform(shader,'f',module.prefix+'mul',mul);
        uniAdd=new CGL.Uniform(shader,'f',module.prefix+'add',add);
        setDefines();
    }

    uniTime.setValue(CABLES.now()/1000.0-startTime);
    next.trigger();
};
