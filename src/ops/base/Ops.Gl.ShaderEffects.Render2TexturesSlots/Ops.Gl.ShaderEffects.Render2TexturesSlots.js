const render = op.inTrigger("Render");
const next = op.outTrigger("Next");

const ports = [];
const boolPorts = [];

const cgl = op.patch.cgl;

const NUM_BUFFERS = 4;

for (let i = 0; i < NUM_BUFFERS; i++)
{
    const p = op.inValueBool("Texture " + i, i === 0);
    // p.onChange=updateBools;
    ports.push(p);
}

function updateBools()
{
    // needsReset=true;
}

let shader = null;
let needsReset = true;
let moduleFrag = null;

let uniBool1, uniBool2, uniBool3, uniBool4;

function removeModule()
{
    if (shader && moduleFrag) shader.removeModule(moduleFrag);
    shader = null;
}

render.onTriggered = function ()
{
    const currentShader = cgl.getShader();
    if (currentShader != shader || needsReset)
    {
        if (shader) removeModule();
        shader = currentShader;

        let srcFrag = "";

        for (let i = 0; i < NUM_BUFFERS; i++)
        {
            boolPorts[i] = ports[i].get();

            srcFrag += "if(MOD_tex" + i + ")outColor" + i + "=col;".endl();
            srcFrag += "else outColor" + i + "=vec4(0.0,0.0,1.0,0.0);".endl();
            // if(boolPorts[i]) srcFrag+='outColor'+i+'=col;'.endl();
            // else srcFrag+='outColor'+i+'=vec4(0.0,0.0,1.0,0.0);'.endl();
        }
        currentShader.setDrawBuffers(boolPorts);

        moduleFrag = shader.addModule(
            {
                "title": op.objName,
                "name": "MODULE_COLOR",
                "priority": 100,
                "srcHeadFrag": "uniform bool MOD_tex1,MOD_tex2,MOD_tex3,MOD_tex0;",
                "srcBodyFrag": srcFrag || ""
            });

        uniBool1 = new CGL.Uniform(shader, "b", moduleFrag.prefix + "tex0", ports[0]);
        uniBool2 = new CGL.Uniform(shader, "b", moduleFrag.prefix + "tex1", ports[1]);
        uniBool3 = new CGL.Uniform(shader, "b", moduleFrag.prefix + "tex2", ports[2]);
        uniBool4 = new CGL.Uniform(shader, "b", moduleFrag.prefix + "tex3", ports[3]);

        needsReset = false;
    }

    next.trigger();
};
