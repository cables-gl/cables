op.name='Lines';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var pointSize=op.addInPort(new Port(op,"pointSize"));

var cgl=op.patch.cgl;

pointSize.set(2);
var shader=null;
var module=null;
var uniPointSize=null;

pointSize.onValueChanged=function()
{
    if(uniPointSize)uniPointSize.setValue(pointSize.get());
};

render.onTriggered=function()
{
    var oldPrim=0;
    if(cgl.getShader()!=shader)
    {
        if(shader && module)
        {
            shader.removeModule(module);
            shader=null;
        }

        shader=cgl.getShader();

        var srcHeadVert=''
            .endl()+'uniform float {{mod}}_size;'
            .endl();

        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                // srcBodyVert:'gl_LineWidth = {{mod}}_size;'
            });

        uniPointSize=new CGL.Uniform(shader,'f',module.prefix+'_size',pointSize.get());

    }

    shader=cgl.getShader();
    oldPrim=shader.glPrimitive;
    shader.glPrimitive=cgl.gl.LINE_STRIP;

    // cgl.points=true;
    trigger.trigger();
    cgl.gl.lineWidth(pointSize.get());

    shader.glPrimitive=oldPrim;
    // cgl.points=false;

};



function updateResolution()
{
}
op.onResize=updateResolution;


pointSize.set(2);
