const
    exe = op.inTrigger("exe"),
    trigger = op.outTrigger("trigger"),
    inM = op.inBool("Reset Model Transform", true),
    inV = op.inBool("Reset View Transform", true),
    inDV = op.inBool("Default View", true),
    cgl = op.patch.cgl;

let doView = false,
    doModel = false,
    vDefault = false;

const identView = vec3.create();
vec3.set(identView, 0, 0, -2);

exe.onTriggered = ex;

inM.onChange =
    inDV.onChange =
    inV.onChange = updateState;
updateState();

function updateState()
{
    doView = inV.get();
    doModel = inM.get();
    vDefault = inDV.get();
    inDV.setUiAttribs({ "greyout": !doView });
}


function ex()
{
    if (doView)
    {
        cgl.pushViewMatrix();
        mat4.identity(cgl.vMatrix);
        if (vDefault)
        {
            mat4.translate(cgl.vMatrix, cgl.vMatrix, identView);
        }
    }

    if (doModel)
    {
        cgl.pushModelMatrix();
        mat4.identity(cgl.mMatrix);
    }

    trigger.trigger();

    if (doView) cgl.popViewMatrix();
    if (doModel) cgl.popModelMatrix();
}
