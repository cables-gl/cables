var cgl=this.patch.cgl;

this.name='ParticleSinus';
var render=this.addInPort(new Port(this,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var shader=null;

var srcHeadVert=''
    .endl()+'uniform float numVertices;'
    .endl()+'uniform float time;'
    .endl()+'float size=1000.0;'
    .endl();

var srcBodyVert=''
    .endl()+'pos.x = mod(attrVertIndex,size)*0.2;'
    .endl()+'pos.z = float( int((attrVertIndex/size)) ) *0.2;'
    .endl()+'pos.y = sin(  0.0002*attrVertIndex+pos.x+pos.y + time   );'
    .endl();

var module=null;

function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader=null;
    }
}

var uniTime=null;
render.onLinkChanged=removeModule;
var startTime=Date.now();

render.onTriggered=function()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();

        console.log('re init shader module particlesinus');

        shader=cgl.getShader();

        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });
        uniTime=new CGL.Uniform(shader,'f','time',10);

    }
    if(uniTime) uniTime.setValue( (Date.now()-startTime )/1000 );

    trigger.trigger();
};
