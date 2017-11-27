op.name="VertexNumberLimit";

var cgl=op.patch.cgl;

var shader=null;
var uniTime;

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var limitMax=op.inValue("Max",1000);

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var srcHeadVert=''
    .endl()+'uniform float {{mod}}_max;'
    .endl()+'OUT float vertNumberLimitDiscarded;'
    // .endl()+'IN float attrVertIndex;'
    .endl();

var srcBodyVert=''
    .endl()+'if(attrVertIndex > {{mod}}_max) vertNumberLimitDiscarded=1.0; else vertNumberLimitDiscarded=0.0;'
    .endl();



var srcHeadFrag=''
    .endl()+'IN float vertNumberLimitDiscarded;'
    .endl();

var srcBodyFrag=''
    .endl()+'if(vertNumberLimitDiscarded>0.0)discard;'
    .endl();




var startTime=Date.now()/1000.0;

function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader.removeModule(moduleFrag);

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

        moduleFrag=shader.addModule(
            {
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            });

        uniMax=new CGL.Uniform(shader,'f',module.prefix+'_max',limitMax);
        // setDefines();
    }

    // uniTime.setValue(Date.now()/1000.0-startTime);
    trigger.trigger();
};
