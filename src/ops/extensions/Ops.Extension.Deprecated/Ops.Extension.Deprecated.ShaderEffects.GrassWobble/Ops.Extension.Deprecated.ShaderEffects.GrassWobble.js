let render = op.inTrigger("render");
let trigger = op.outTrigger("trigger");

let frequency = op.inValue("frequency", 1);
let mul = op.inValue("mul", 0.1);

let cgl = op.patch.cgl;

let uniFrequency = null;
let shader = null;
let module = null;
let uniTime;

let srcHeadVert = ""
    .endl() + "UNI float MOD_time;"
    .endl() + "UNI float MOD_frequency;"
    .endl() + "UNI float MOD_mul;"

    .endl();

let srcBodyVert = ""

    .endl() + "vec3 MOD_pos=(pos).xyz;"
    .endl() + "float rndSrc=mMatrix[3].z+mMatrix[3].x;"

    .endl() + "#ifdef INSTANCING"
    .endl() + "   rndSrc=instMat[3].z+instMat[3].x;"
    .endl() + "#endif"

    .endl() + "float MOD_v=abs(pos.y*MOD_mul)*sin( ((MOD_time*MOD_frequency)+rndSrc) ) ;"

    .endl() + "pos.x+=MOD_v;"
    .endl() + "pos.z+=MOD_v;"

    .endl();

let startTime = CABLES.now() / 1000.0;

function removeModule()
{
    if (shader && module)
    {
        shader.removeModule(module);
        shader = null;
    }
}

render.onLinkChanged = removeModule;
render.onTriggered = function ()
{
    if (cgl.getShader() != shader)
    {
        if (shader) removeModule();
        shader = cgl.getShader();
        module = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": srcBodyVert
            });

        uniTime = new CGL.Uniform(shader, "f", module.prefix + "time", 0);
        uniFrequency = new CGL.Uniform(shader, "f", module.prefix + "frequency", frequency);
        mul.uniform = new CGL.Uniform(shader, "f", module.prefix + "mul", mul);
    }

    uniTime.setValue(CABLES.now() / 1000.0 - startTime);
    trigger.trigger();
};
