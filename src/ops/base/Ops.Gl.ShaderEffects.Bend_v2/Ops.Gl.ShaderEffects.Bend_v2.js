const render = op.inTrigger("render");
const amount = op.inValue("Amount");
const rotX = op.inValue("RotX");
const rotY = op.inValue("RotY");
const rotZ = op.inValue("RotZ");
const scale = op.inValue("Scale", 2);
const offset = op.inValue("Offset", 0.25);
const limited = op.inValueBool("Limited", true);

const next = op.outTrigger("trigger");

const srcHeadVert = attachments.bend_vert;
const srcBodyVert = ""
    .endl() + "   MOD_bendDistort(pos.xyz, norm);"
    .endl();

const uniAmount = null;
const uniRange = null;
const uniTransMatrix = null;
const uniInvTransMatrix = null;
const cgl = op.patch.cgl;

let matricesValid = false;
const transMatrix = mat4.create();
const invTransMatrix = mat4.create();
let amountRadians = 0;

function invalidateMatrices()
{
    matricesValid = false;
}

rotX.onChange = invalidateMatrices;
rotY.onChange = invalidateMatrices;
rotZ.onChange = invalidateMatrices;
scale.onChange = invalidateMatrices;
offset.onChange = invalidateMatrices;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.bend_vert,
    "srcBodyVert": srcBodyVert
});

mod.addUniformVert("f", "MOD_amount", 0);
mod.addUniformVert("2f", "MOD_range", [0, 1]);
mod.addUniformVert("m4", "MOD_transMatrix", transMatrix);
mod.addUniformVert("m4", "MOD_invTransMatrix", invTransMatrix);

amount.onChange = function () { amountRadians = amount.get() * CGL.DEG2RAD; };

mat4.identity(transMatrix);
mat4.identity(invTransMatrix);

const tvec = vec3.create();
const svec = vec4.create();
function updateMatrices()
{
    if (matricesValid) return;

    vec3.set(tvec, offset.get(), 0, 0);

    const s = 1 / scale.get();
    vec3.set(svec, s, s, s);

    mat4.identity(transMatrix);
    mat4.translate(transMatrix, transMatrix, tvec);

    mat4.rotateX(transMatrix, transMatrix, rotX.get() * CGL.DEG2RAD);
    mat4.rotateY(transMatrix, transMatrix, rotY.get() * CGL.DEG2RAD);
    mat4.rotateZ(transMatrix, transMatrix, rotZ.get() * CGL.DEG2RAD);

    mat4.scale(transMatrix, transMatrix, svec);

    mat4.invert(invTransMatrix, transMatrix);
    matricesValid = true;
}

render.onTriggered = function ()
{
    mod.setUniformValue("MOD_range", limited.get() ? [0, 1] : [-99999, 99999]);

    updateMatrices();

    mod.bind();
    mod.setUniformValue("MOD_amount", amountRadians);
    next.trigger();
    mod.unbind();
};
