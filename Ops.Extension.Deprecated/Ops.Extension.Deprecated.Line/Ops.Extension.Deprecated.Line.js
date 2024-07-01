op.name = "Lines";

let render = op.inTrigger("render");
let pointSize = op.addInPort(new CABLES.Port(op, "pointSize"));
let mode = op.addInPort(new CABLES.Port(op, "Draw Mode", CABLES.OP_PORT_TYPE_VALUE, {
    "display": "dropdown", "values": ["Line Strip", "Line Loop", "Lines"] }));

let trigger = op.outTrigger("trigger");

pointSize.set(2);

let cgl = op.patch.cgl;
let shader = null;
let mod = null;
let uniPointSize = null;
let drawMode = cgl.gl.LINE_STRIP;

mode.onChange = function ()
{
    drawMode = cgl.gl.LINES;
    if (mode.get() == "Line Loop")drawMode = cgl.gl.LINE_LOOP;
    else if (mode.get() == "Lines")drawMode = cgl.gl.LINES;
    else drawMode = cgl.gl.LINE_STRIP;
};

pointSize.onChange = function ()
{
    if (uniPointSize)uniPointSize.setValue(pointSize.get());
};

render.onTriggered = function ()
{
    let oldPrim = 0;
    // if(cgl.getShader()!=shader)
    // {
    //     if(shader && mod)
    //     {
    //         shader.removeModule(mod);
    //         shader=null;
    //     }

    //     shader=cgl.getShader();

    //     var srcHeadVert=''
    //         .endl()+'uniform float {{mod}}_size;'
    //         .endl();

    //     mod=shader.addModule(
    //         {
    //             name:'MODULE_VERTEX_POSITION',
    //             srcHeadVert:srcHeadVert,
    //         });

    //     uniPointSize=new CGL.Uniform(shader,'f',mod.prefix+'_size',pointSize.get());

    // }

    shader = cgl.getShader();
    if (shader)
    {
        oldPrim = shader.glPrimitive;

        shader.glPrimitive = drawMode;

        cgl.gl.lineWidth(pointSize.get());
        trigger.trigger();

        shader.glPrimitive = oldPrim;
    }
};

function updateResolution()
{
}

op.onResize = updateResolution;
pointSize.set(2);
