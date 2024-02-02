
const
    render = op.inTrigger("render"),
    inTex = op.inTexture("Texture"),

    inStrength = op.inFloat("Multiply", 1),
    inWhat = op.inSwitch("Transform", ["Translate", "Scale"], "Translate"),
    inInput = op.inSwitch("Input", ["R", "G", "B"], "R"),
    inAxis = op.inSwitch("Axis", ["X", "Y", "Z", "All"], "Z"),
    inMeth = op.inSwitch("Method", ["+", "-", "*", "/"], "+"),
    inNormalize = op.inBool("Normalize", false),
    inSmoothstep = op.inBool("Smoothstep", false),
    inColorize = op.inBool("Colorize", true),
    inColorMul = op.inFloat("Color Mul", 1),

    next = op.outTrigger("Next"),
    outArr = op.outArray("Position Array");

const cgl = op.patch.cgl;

const posArr = [];
const shader = null;

inAxis.onChange =
inMeth.onChange =
inInput.onChange =
inWhat.onChange =
inColorize.onChange =
inNormalize.onChange =
    updateDefines;


const srcHeadVert = ""
    .endl() + "#ifndef ATTRIB_instanceIndex"
    .endl() + "  #define ATTRIB_instanceIndex"
    .endl() + "  IN float instanceIndex;"
    .endl() + "#endif"
    .endl() + "#ifdef MOD_COLORIZE"
    .endl() + "   OUT vec4 MOD_color;"
    .endl() + "#endif"

    .endl();


const srcHeadFrag = ""
    .endl() + "#ifdef MOD_COLORIZE"
    .endl() + "   IN vec4 MOD_color;"
    .endl() + "#endif"
    .endl();

const srcBodyFrag = ""
    .endl() + "#ifdef MOD_COLORIZE"
    .endl() + "   col*=MOD_color*MOD_colorMul;"
    .endl() + "#endif"
    .endl();

const moduleVert = null;
const moduleFrag = null;

inTex.onChange = updateLookupTexture;


const mod = new CGL.ShaderModifier(cgl, op.name, { "op": op });
mod.addModule({
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": srcHeadVert,
    "srcBodyVert": attachments.transformByTex_vert
});
mod.addModule({
    "title": op.name,
    "name": "MODULE_COLOR",
    srcHeadFrag,
    srcBodyFrag
});
mod.addUniform("f", "MOD_strength", inStrength);
mod.addUniform("t", "MOD_tex", 0);
mod.addUniform("f", "MOD_colorMul", inColorMul);


function updateDefines()
{
    mod.toggleDefine("MOD_AXIS_X", inAxis.get() == "X");
    mod.toggleDefine("MOD_AXIS_Y", inAxis.get() == "Y");
    mod.toggleDefine("MOD_AXIS_Z", inAxis.get() == "Z");
    mod.toggleDefine("MOD_AXIS_ALL", inAxis.get() == "All");

    mod.toggleDefine("MOD_INPUT_R", inInput.get() == "R");
    mod.toggleDefine("MOD_INPUT_G", inInput.get() == "G");
    mod.toggleDefine("MOD_INPUT_B", inInput.get() == "B");

    mod.toggleDefine("MOD_MATH_ADD", inMeth.get() == "+");
    mod.toggleDefine("MOD_MATH_SUB", inMeth.get() == "-");
    mod.toggleDefine("MOD_MATH_MUL", inMeth.get() == "*");
    mod.toggleDefine("MOD_MATH_DIV", inMeth.get() == "/");

    mod.toggleDefine("MOD_NORMALIZE", inNormalize.get());
    mod.toggleDefine("MOD_COLORIZE", inColorize.get());
    mod.toggleDefine("MOD_SMOOTHSTEP", inSmoothstep.get());
}


function updateLookupTexture()
{
    const tex = inTex.get() || CGL.Texture.getEmptyTexture(cgl);
    // if (!inTex.get()) return;
    // if (!shader) return;


    mod.define("MOD_TEX_WIDTH", tex.width + ".0");
    mod.define("MOD_TEX_HEIGHT", tex.height + ".0");

    const wh = tex.width * tex.height;
    if (outArr.get() && outArr.get().length == wh * 3) return;
    const w = tex.width;
    const h = tex.height;
    const stepX = 1 / tex.width;
    const stepY = stepX;
    posArr.length = wh * 3;

    let idx = 0;
    for (let x = 0; x < w; x++)
    {
        for (let y = 0; y < h; y++)
        {
            idx = (x + y * w) * 3;
            posArr[idx + 0] = (x - w / 2) * stepX;
            posArr[idx + 1] = (y - h / 2) * stepY;
            posArr[idx + 2] = 0;
        }
    }

    outArr.set(null);
    outArr.set(posArr);
}

render.onTriggered = function ()
{
    if (inTex.get())
    {
        if (!cgl.getShader())
        {
            //  next.trigger();
            return;
        }

        if (cgl.getShader() != shader)
        {
            // if (shader) removeModule();
            // shader = cgl.getShader();

            // moduleVert = shader.addModule(
            //     {
            //         "title": op.objName,
            //         "name": "MODULE_VERTEX_POSITION",
            //         "srcHeadVert": srcHeadVert,
            //         "srcBodyVert": attachments.transformByTex_vert
            //     });


            // moduleFrag = shader.addModule(
            //     {
            //         "title": op.objName,
            //         "name": "MODULE_COLOR",
            //         "srcHeadFrag": srcHeadFrag,
            //         "srcBodyFrag": srcBodyFrag
            //     }, moduleVert);

            // inStrength.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "strength", inStrength);
            // inTex.uniform = new CGL.Uniform(shader, "t", moduleVert.prefix + "tex", 0);
            // inColorMul.uniform = new CGL.Uniform(shader, "f", moduleVert.prefix + "colorMul", inColorMul);


            // updateDefines();
            // updateLookupTexture();
        }


        // shader.pushTexture(inTex.uniform, inTex.get().tex);

        if (inTex.get()) mod.pushTexture("MOD_tex", inTex.get().tex);
        else mod.pushTexture("MOD_tex", CGL.Texture.getEmptyTexture(cgl).tex);

        // cgl.setTexture(7, inTex.get().tex);
    }

    mod.bind();

    next.trigger();

    mod.unbind();
};
