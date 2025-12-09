const render = op.inTrigger("render");
let inAttrib = op.inValueSelect("Attribute", []);
let inGeom = op.inObject("Geometry");
let limitMax = op.inValue("Max", 1000);
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
};

function updateCode()
{
    if (attrName === "") return;

    srcHeadFrag = ""
        .endl() + "UNI float MOD_max;";

    srcBodyFrag = ""
        .endl() + "if(" + attrName + "Frag>=MOD_max)discard;"
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
    if (cgl.getShader() != shader || needsCodeUpdate || !srcBodyFrag)
    {
        let attr = inGeom.get().getAttribute(inAttrib.get());
        if (!attr) return;
        attrName = inAttrib.get();
        attrType = attr.type;

        if (shader) removeModule();
        shader = cgl.getShader();
        if (!shader) return;
        if (needsCodeUpdate || !srcHeadFrag || !srcBodyFrag) updateCode();

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

        limitMax.uniMax = new CGL.Uniform(shader, "f", moduleFrag.prefix + "max", limitMax);
    }

    trigger.trigger();
};
