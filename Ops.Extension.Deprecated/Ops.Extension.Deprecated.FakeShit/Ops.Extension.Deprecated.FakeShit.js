op.name = "OverwriteTranslation";

let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let trigger = op.outTrigger("trigger");

let scale = op.outValue("Scale");

let cgl = op.patch.cgl;

let v = vec3.create();

exe.onTriggered = function ()
{
    cgl.pushModelMatrix();

    let x = cgl.mvMatrix[12];
    let y = cgl.mvMatrix[13];
    let z = cgl.mvMatrix[14];

    mat4.identity(cgl.mvMatrix);

    cgl.mvMatrix[12] = x;
    cgl.mvMatrix[14] = z;

    y *= 0.55;
    y = Math.max(0.85, y);
    mat4.scale(cgl.mvMatrix, cgl.mvMatrix, [y, y, y]);

    scale.set(y);

    trigger.trigger();

    cgl.popModelMatrix();
};
