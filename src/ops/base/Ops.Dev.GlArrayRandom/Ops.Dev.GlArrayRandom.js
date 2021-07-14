const
    render = op.inTrigger("Render"),
    next = op.outTrigger("Next"),


    inRMin=op.inFloat("X Min",0),
    inRMax=op.inFloat("X Max",1),

    inGMin=op.inFloat("Y Min",0),
    inGMax=op.inFloat("Y Max",1),

    inBMin=op.inFloat("Z Min",0),
    inBMax=op.inFloat("Z Max",1),

    inSeed=op.inFloat("Seed",1),


    outTex = op.outTexture("Result");

render.onTriggered = dorender;

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, op.name);
const texMath = new CGL.ShaderTextureMath(cgl, op.objName, { "width":128,"height":128 });

shader.setSource(shader.getDefaultVertexShader(), attachments.randoms_frag);
const
    textureUniform = new CGL.Uniform(shader, "t", "tex", 0),

    uniformRMin = new CGL.Uniform(shader, "f", "rmin", inRMin),
    uniformRMax = new CGL.Uniform(shader, "f", "rmax", inRMax),

    uniformGMin = new CGL.Uniform(shader, "f", "gmin", inGMin),
    uniformGMax = new CGL.Uniform(shader, "f", "gmax", inGMax),

    uniformBMin = new CGL.Uniform(shader, "f", "bmin", inBMin),
    uniformBMax = new CGL.Uniform(shader, "f", "bmax", inBMax),

    uniformSeed = new CGL.Uniform(shader, "f", "seed", inSeed);

updateDefines();

function updateDefines()
{

}

function dorender()
{
    const finTex = texMath.render(shader);
    outTex.set(finTex);
    next.trigger();
}
