const cgl = op.patch.cgl;

const render = op.inTrigger("render");
const next = op.outTrigger("trigger");

const isPicked = op.outBool("is picked");

const pickedTrigger = op.outTrigger("On Picked");

const doBillboard = op.inBool("billboard", false); // op.addInPort(new CABLES.Port(op, "billboard", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
doBillboard.set(false);

doBillboard.onChange = function ()
{
    if (doBillboard.get()) shader.define("BILLBOARD");
    else shader.removeDefine("BILLBOARD");
};

const cursor = op.inDropDown("cursor", ["pointer", "auto", "default", "crosshair", "move", "n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize", "text", "wait", "help"]);

cursor.set("pointer");

function doRender()
{
    cgl.frameStore.pickingpassNum += 2;
    const currentPickingColor = cgl.frameStore.pickingpassNum;

    if (cgl.frameStore.pickingpass)
    {
        // isPicked.set(false);

        pickColorUniformR.setValue(currentPickingColor / 511);
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

const srcVert = attachments.pick_vert;

const srcFrag = attachments.pick_frag;

const shader = new CGL.Shader(cgl, "PickingMaterial");
shader.offScreenPass = true;
shader.setSource(srcVert, srcFrag);

const pickColorUniformR = new CGL.Uniform(shader, "f", "r", 0);

render.onTriggered = doRender;
doRender();
