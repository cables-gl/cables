const render = op.inTrigger("render");
let inAttrib = op.inValueSelect("Attribute", []);
let inGeom = op.inObject("Geometry");
let inSeed = op.inValue("Seed", 1000);
let inMin = op.inValueSlider("Min", 0.0);
let inMax = op.inValueSlider("Max", 1.0);

let inRandR = op.inValueSlider("Random R", 0.0);
let inRandG = op.inValueSlider("Random G", 0.0);
let inRandB = op.inValueSlider("Random B", 0.0);

const trigger = op.outTrigger("trigger");

let srcHeadFrag = "";
let srcBodyFrag = "";

let attribs = null;

render.onLinkChanged = removeModule;
trigger.onLinkChanged = removeModule;
let needsCodeUpdate = true;

let cgl = op.patch.cgl;
let shader = null;
let uniTime;
let moduleFrag = null;
let module = null;
let attrName = "";
let attrType = "";

function removeModule()
{
    if (shader)
    {
        shader.removeModule(module);
        shader.removeModule(moduleFrag);

        shader = null;
    }

    needsCodeUpdate = true;
}

inAttrib.onChange = function ()
{
    needsCodeUpdate = true;
    // console.log('attrib change!!!!');
};

function updateCode()
{
    if (!attrName || attrName === "")
    {
        needsCodeUpdate = true;
        return;
    }

    srcHeadFrag = ""
        .endl() + "UNI float MOD_seed;"
        .endl() + "UNI float MOD_min;"
        .endl() + "UNI float MOD_max;"
        .endl() + "UNI float MOD_randR;"
        .endl() + "UNI float MOD_randG;"
        .endl() + "UNI float MOD_randB;"

        .endl() + "float MOD_round(float user_a) {"
        .endl() + "   return floor((user_a+0.5));"
        .endl() + "}"

        .endl() + "float MOD_rand(vec2 co){"
        .endl() + "    return fract(sin(dot(co.xy ,vec2(12.9,78.2))) * 43758.3);"
        .endl() + "}"
        .endl();

    srcBodyFrag = ""
        .endl() + "float MOD_coord=MOD_round(" + attrName + "Frag*1000.0)/1000.0+MOD_seed;"

        .endl() + "col.rgb*= (MOD_rand(vec2(MOD_coord))*(MOD_max-MOD_min))+MOD_min ;"

        .endl() + "col.r+=MOD_rand(vec2(MOD_coord*2.0))*MOD_randR;"
        .endl() + "col.g+=MOD_rand(vec2(MOD_coord*3.0))*MOD_randG;"
        .endl() + "col.b+=MOD_rand(vec2(MOD_coord*13.0))*MOD_randB;"
        .endl();

    needsCodeUpdate = false;
}

function updateAttribSelect()
{
    let attrNames = [];
    for (let i in attribs) attrNames.push(i);
    inAttrib.uiAttribs.values = attrNames;
}

inGeom.onChange = function ()
{
    let geom = inGeom.get();
    if (geom) attribs = geom.getAttributes();
    else attribs = null;
    updateAttribSelect();
};

render.onTriggered = function ()
{
    if (!inGeom.get()) return;
    // if(needsCodeUpdate)console.log('needsCodeUpdate');
    // if(!srcBodyFrag)console.log('srcBodyFrag');
    // if(cgl.getShader()!=shader)console.log('cgl.getShader',shader);

    if (cgl.getShader() != shader || needsCodeUpdate || !srcBodyFrag)
    {
        if (shader) removeModule();
        shader = cgl.getShader();
        if (!shader)
        {
            console.log("there is no shader");
            return;
        }
        if (needsCodeUpdate || !srcHeadFrag || !srcBodyFrag) updateCode();

        let attr = inGeom.get().getAttribute(inAttrib.get());
        attrName = inAttrib.get();
        attrType = attr.type;

        shader.addAttribute(
            {
                "type": attrType,
                "name": attrName,
                "nameFrag": attrName + "Frag"
            });

        shader.removeModule(moduleFrag);
        moduleFrag = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_COLOR",
                "srcHeadFrag": srcHeadFrag,
                "srcBodyFrag": srcBodyFrag
            });

        inSeed.uni = new CGL.Uniform(shader, "f", moduleFrag.prefix + "seed", inSeed);
        inMin.uni = new CGL.Uniform(shader, "f", moduleFrag.prefix + "min", inMin);
        inMax.uni = new CGL.Uniform(shader, "f", moduleFrag.prefix + "max", inMax);

        inRandR.uni = new CGL.Uniform(shader, "f", moduleFrag.prefix + "randR", inRandR);
        inRandG.uni = new CGL.Uniform(shader, "f", moduleFrag.prefix + "randG", inRandG);
        inRandB.uni = new CGL.Uniform(shader, "f", moduleFrag.prefix + "randB", inRandB);
    }

    trigger.trigger();
};
