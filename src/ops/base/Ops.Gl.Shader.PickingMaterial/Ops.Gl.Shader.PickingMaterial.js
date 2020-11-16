const cgl = op.patch.cgl;

const render = op.inTrigger("render");
const next = op.outTrigger("trigger");

const isPicked = op.addOutPort(new CABLES.Port(op, "is picked", CABLES.OP_PORT_TYPE_VALUE));

const pickedTrigger = op.outTrigger("On Picked");

const doBillboard = op.addInPort(new CABLES.Port(op, "billboard", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
doBillboard.set(false);

doBillboard.onChange = function ()
{
    if (doBillboard.get()) shader.define("BILLBOARD");
    else shader.removeDefine("BILLBOARD");
};

const cursor = op.addInPort(new CABLES.Port(op, "cursor", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["", "pointer", "auto", "default", "crosshair", "move", "n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "text", "wait", "help"] }));
cursor.set("pointer");

function doRender()
{
    cgl.frameStore.pickingpassNum += 2;
    const currentPickingColor = cgl.frameStore.pickingpassNum;

    if (cgl.frameStore.pickingpass)
    {
        // isPicked.set(false);

        pickColorUniformR.setValue(currentPickingColor / 255);
        cgl.pushShader(shader);
        next.trigger();
        cgl.popShader();
    }
    else
    {
        isPicked.set(cgl.frameStore.pickedColor == currentPickingColor);

        if (cgl.frameStore.pickedColor == currentPickingColor)
        {
            if (cursor.get().length > 0 && cgl.canvas.style.cursor != cursor.get())
            {
                cgl.canvas.style.cursor = cursor.get();
            }
            pickedTrigger.trigger();
        }
        else
        {
        }


        next.trigger();
    }
}

const srcVert = ""
    .endl() + "IN vec3 vPosition;"
    .endl() + "UNI mat4 projMatrix;"
    .endl() + "UNI mat4 mvMatrix;"

    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   #ifdef BILLBOARD"
    .endl() + "       vec3 position=vPosition;"
    .endl() + "       gl_Position = projMatrix * mvMatrix * vec4(( "
    .endl() + "           position.x * vec3("
    .endl() + "               mvMatrix[0][0],"
    .endl() + "               mvMatrix[1][0], "
    .endl() + "               mvMatrix[2][0] ) +"
    .endl() + "           position.y * vec3("
    .endl() + "               mvMatrix[0][1],"
    .endl() + "               mvMatrix[1][1], "
    .endl() + "               mvMatrix[2][1]) ), 1.0);"
    .endl() + "   #endif "

    .endl() + "   #ifndef BILLBOARD"
    .endl() + "       gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);"
    .endl() + "   #endif"

    .endl() + "}";

const srcFrag = ""

    .endl() + "UNI float r;"
    .endl() + ""
    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   outColor= vec4(r,1.0,0.0,1.0);"
    .endl() + "}";

var shader = new CGL.Shader(cgl, "PickingMaterial");
shader.offScreenPass = true;
shader.setSource(srcVert, srcFrag);


var pickColorUniformR = new CGL.Uniform(shader, "f", "r", 0);

render.onTriggered = doRender;
doRender();
