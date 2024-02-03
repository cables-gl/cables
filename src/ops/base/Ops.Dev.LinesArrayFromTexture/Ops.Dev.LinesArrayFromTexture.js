const
    render = op.inTrigger("render"),
    inAxis = op.inSwitch("Axis", ["XYZ", "XY"], "XYZ"),
    inTex = op.inTexture("Texture", null, "texture"),
    // inTexPS = op.inTexture("Point Size", null, "texture"),
    inNorm = op.inBool("Normalize", false),
    // inMode = op.inSwitch("Mode", ["Absolute", "Add"], "Absolute"),
    trigger = op.outTrigger("Trigger");

const cgl = op.patch.cgl;
// let inTexUniform = null;
let mesh = null;
let numVerts = 0;

const mod = new CGL.ShaderModifier(cgl, op.name, { "opId": op.id });
mod.addModule({
    "priority": 0,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": "",
    "srcBodyVert": attachments.splinetex_vert
});

mod.addUniformVert("t", "MOD_tex");
mod.addUniformVert("t", "MOD_texPointSize");

render.onTriggered = doRender;
updateDefines();

mod.addUniformVert("f", "MOD_texSize", 0);

inNorm.onChange =
    // inTexPS.onChange =
    inAxis.onChange = updateDefines;

inTex.onChange = setupMesh;
setupMesh();
updateDefines();

function updateDefines()
{
    mod.toggleDefine("MOD_AXIS_XY", inAxis.get() == "XY");
    mod.toggleDefine("MOD_AXIS_XYZ", inAxis.get() == "XYZ");
    mod.toggleDefine("MOD_NORMALIZE", inNorm.get());
    // mod.toggleDefine("MOD_HAS_PS_TEX", inTexPS.get());
}

function doRender()
{
    mod.bind();
    if (!inTex.get() || !inTex.get().tex) return;
    if (inTex.get())mod.pushTexture("MOD_tex", inTex.get().tex);

    mod.setUniformValue("MOD_texSize", inTex.get().width + 1);

    const shader = cgl.getShader();
    shader.glPrimitive = cgl.gl.LINES;

    // console.log(numVerts);
    if (numVerts > 0 && mesh)
    {
        // shader.bindTextures();
        // console.log(2);
        mesh.render(shader);
    }

    trigger.trigger();
    mod.unbind();
}

function setupMesh()
{
    if (!inTex.get()) return;

    if (inTex.get() == CGL.Texture.getEmptyTexture(op.patch.cgl)) return;

    const tw = inTex.get().width;
    const w = (inTex.get().width) * 2;
    const h = (inTex.get().height);

    // const num = Math.max(0, Math.floor(inNum.get()));
    const num = w * h;

    if (num == numVerts) return;

    let verts = new Float32Array(num * 3);
    let texCoords = new Float32Array(num * 2);

    let biasX = 0.5 * (1.0 / tw);
    let biasY = 0.5 * (1.0 / h);

    // let bias=0;

    //     for(let y=0;y<h;y++)
    //     for(let x=0;x<w;x+=2)
    //     {
    //         texCoords[(y*w+x)*2]=(x)/(w)+bias;
    //         texCoords[(y*w+x)*2+1]=y/h;

    //         texCoords[(y*w+x)*2+2]=(x*2)/(w)+bias;
    //         texCoords[(y*w+x)*2+3]=y/h;
    //     }

    // for(let y=0;y<h;y++)
    // for(let x=0;x<w;x+=1)
    // {
    //     texCoords[(y*w+x)*2] = (x/w)+biasX;
    //     texCoords[(y*w+x)*2+1] = (y/h)+biasY;

    //     texCoords[(y*w+(x+1))*2] = (((x/2))/(w))+biasX;
    //     texCoords[(y*w+(x+1))*2+1] = (y/h)+biasY;

    //     // bias=0;
    //     // texCoords[(y*w+x)*2] = (x)+bias;
    //     // texCoords[(y*w+x)*2+1] = (y)+bias;

    //     // texCoords[(y*w+(x+1))*2] = (((x/2)))+bias;
    //     // texCoords[(y*w+(x+1))*2+1] = (y)+bias;

    // }

    for (let x = 0; x < tw; x++)
        for (let y = 0; y < h; y++)
        {
            texCoords[(x + y * tw) * 4] = ((x + 1) / tw) + biasX;
            texCoords[(x + y * tw) * 4 + 1] = (y / h) + biasY;

            texCoords[(x + y * tw) * 4 + 2] = ((x) / tw) + biasX;
            texCoords[(x + y * tw) * 4 + 3] = (y / h) + biasY;

            // texCoords[(x + y * tw) * 4 ] = 1.0-texCoords[(x + y * tw) * 4 ];
            // texCoords[(x + y * tw) * 4 + 2] = 1.0-texCoords[(x + y * tw) * 4 + 2];

            // console.log((x + y * tw) * 4 + 3);
        }

    // for(let i=0;i<texCoords.length;i++) texCoords[i]=1.0-texCoords[i];

    // console.log(texCoords);
    // console.log(
    //     texCoords[0],
    //     texCoords[2],
    //     texCoords[4],
    //     texCoords[6],
    //     texCoords[8],
    //     texCoords[10]);

    const geom = new CGL.Geometry("splineFromTexture");
    geom.setPointVertices(verts);
    geom.setTexCoords(texCoords);
    geom.verticesIndices = [];
    numVerts = verts.length / 3;

    // console.log("numVerts",numVerts);
    console.log("lines  numVerts", numVerts, texCoords.length / 2);

    if (mesh)mesh.dispose();

    // if (strip.get()) shader.glPrimitive = cgl.gl.LINES;
    // else
    if (numVerts > 0) mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.LINES });

    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
}
