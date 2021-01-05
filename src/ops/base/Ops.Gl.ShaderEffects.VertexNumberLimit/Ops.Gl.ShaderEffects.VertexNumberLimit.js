let cgl = op.patch.cgl;
let shader = null;
let uniTime;

const render = op.inTrigger("render");
let limitMax = op.inValueInt("Max", 1000);

const trigger = op.outTrigger("trigger");

let srcHeadVert = ""
    .endl() + "UNI float vertlimitmax;"
    .endl() + "OUT float vertNumberLimitDiscarded;"
    // .endl()+'IN float attrVertIndex;'
    .endl();

let srcBodyVert = ""
    .endl() + "if(attrVertIndex > vertlimitmax) vertNumberLimitDiscarded=1.0; else vertNumberLimitDiscarded=0.0;"
    .endl();

let srcHeadFrag = ""
    .endl() + "IN float vertNumberLimitDiscarded;"
    .endl();

let srcBodyFrag = ""
    .endl() + "if(vertNumberLimitDiscarded>0.0)discard;"
    .endl();

let module = null;
let moduleFrag = null;

function removeModule()
{
    if (shader && module)
    {
        shader.removeModule(module);
        shader.removeModule(moduleFrag);

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

        moduleFrag = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_COLOR",
                "srcHeadFrag": srcHeadFrag,
                "srcBodyFrag": srcBodyFrag
            });

        limitMax.uniform = new CGL.Uniform(shader, "f", "vertlimitmax", limitMax);
    }

    trigger.trigger();
};
