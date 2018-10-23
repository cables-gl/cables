op.name='Points';

var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var pointSize=op.addInPort(new Port(op,"pointSize"));

var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

pointSize.set(2);

var shader=null;
var mod=null;
var uniPointSize=null;

var cgl=op.patch.cgl;

pointSize.onValueChanged=setPointSize;

function setPointSize()
{
    if(uniPointSize) uniPointSize.setValue(pointSize.get());
}

render.onTriggered=function()
{
    var oldPrim=0;
    if(cgl.getShader()!=shader)
    {
        if(shader && mod)
        {
            shader.removeModule(mod);
            shader=null;
        }

        shader=cgl.getShader();

        var srcHeadVert=''
            .endl()+'uniform float {{mod}}_size;'
            .endl();

        mod=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:'gl_PointSize = {{mod}}_size;'
            });

        uniPointSize=new CGL.Uniform(shader,'f',mod.prefix+'_size',pointSize.get());
    }

    shader=cgl.getShader();
    oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.POINTS;

    trigger.trigger();
    
    shader.glPrimitive=oldPrim;
};



function updateResolution()
{
}
op.onResize=updateResolution;


pointSize.set(2);
