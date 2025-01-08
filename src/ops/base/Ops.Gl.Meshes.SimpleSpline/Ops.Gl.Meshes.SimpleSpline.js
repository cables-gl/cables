const
    render = op.inTrigger("Render"),
    inPoints = op.inArray("Points"),
    numPoints = op.inValueInt("Num Points"),
    outGeom = op.outObject("Geometry"),
    lineMode = op.inSwitch("Mode", ["Lines", "Line Strip", "Line Loop"]),
    texCoords = op.inSwitch("TexCoords", ["0", "0-1", "Random", "Fill"], "0"),
    inTexCoords = op.inArray("TexCoords Array"),
    inVertCols = op.inArray("Vertex Colors"),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
const geom = new CGL.Geometry("simplespline");
outGeom.set(geom);

geom.vertices = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let mesh = new CGL.Mesh(cgl, geom);
let buff = new Float32Array();
let bufTexCoord = new Float32Array();
let bufNorms = new Float32Array();
let needsRebuild = true;
let attr;
let currentTexCoords = "";

inVertCols.onChange =
inTexCoords.onChange =
texCoords.onChange =
numPoints.onChange =
inPoints.onChange = () => { needsRebuild = true; };

op.toWorkPortsNeedToBeLinked(inPoints);

function rebuild()
{
    const points = inPoints.get();

    if (!points || points.length === 0) return;

    const newLength = points.length;

    if (!(points instanceof Float32Array))
    {
        if (newLength !== buff.length)
        {
            buff = new Float32Array(newLength);
            bufNorms = new Float32Array(newLength);
            mesh.setAttribute(CGL.SHADERVAR_VERTEX_NORMAL, bufNorms, 3);

            buff.set(points);
        }
        else
        {
            buff.set(points);
        }
    }
    else
    {
        buff = points;
    }

    attr = mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION, buff, 3);

    op.setUiError("vertColWrongLength", null);

    if (inVertCols.get())
    {
        console.log("1");
        if (inVertCols.get().length / 4 !== buff.length / 3)
        {
            console.log("2");
            op.setUiError("vertColWrongLength", "Vertex color does not have the correct length! (should be " + buff.length / 3 * 4 + ")");
            return;
        }
        else
        {
            console.log("3");
            op.setUiError("vertColWrongLength", null);
            geom.vertexColors = inVertCols.get();
        }
    }
    else
    {
        console.log("4");
        op.setUiError("vertColWrongLength", null);
        geom.vertexColors = [];
    }

    const numTc = (newLength / 3) * 2;

    op.setUiError("wrongtcnum", null);

    if (inTexCoords.get())
    {
        const intc = inTexCoords.get();
        if (intc.length / 2 !== buff.length / 3) op.setUiError("wrongtcnum", "texcoord array length is wrong. should be " + buff.length / 3 * 2);

        const attrTc = mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD, intc, 2);
    }
    else if (currentTexCoords !== texCoords.get() || mesh.getAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD).numItems !== numTc / 2)
    {
        currentTexCoords = texCoords.get();

        if (bufTexCoord.length !== numTc) bufTexCoord = new Float32Array(numTc);

        if (texCoords.get() === "0-1")
        {
            for (let i = 0; i < numTc; i += 2)
            {
                bufTexCoord[i] = i / numTc;
                bufTexCoord[i + 1] = 0.5;
            }
        }
        else if (texCoords.get() === "Fill")
        {
            const sizel = Math.sqrt(numTc / 2);

            let idx = 0;
            for (let j = 0; j < sizel; j++)
            {
                for (let i = 0; i < sizel; i++)
                {
                    idx++;
                    bufTexCoord[idx * 2 + 0] = i / sizel;
                    bufTexCoord[idx * 2 + 1] = j / sizel;
                }
            }
        }
        else if (texCoords.get() === "Random")
        {
            for (let i = 0; i < numTc; i += 2)
            {
                bufTexCoord[i] = Math.random();
                bufTexCoord[i + 1] = Math.random();
            }
        }
        else
        {
            for (let i = 0; i < numTc; i += 2)
            {
                bufTexCoord[i] = 0;
                bufTexCoord[i + 1] = 0;
            }
        }
        mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD, bufTexCoord, 2);
    }

    needsRebuild = false;
}

render.onTriggered = function ()
{
    if (!inPoints.get()) return;
    if (needsRebuild) rebuild();
    const shader = cgl.getShader();
    if (!shader) return;

    const oldPrim = shader.glPrimitive;
    if (lineMode.get())
    {
        switch (lineMode.get())
        {
        case "Line Loop":
            shader.glPrimitive = cgl.gl.LINE_LOOP;
            break;
        case "Line Strip":
            shader.glPrimitive = cgl.gl.LINE_STRIP;
            break;
        case "Lines":
        default:
            shader.glPrimitive = cgl.gl.LINES;
            break;
        }
    }
    else
    {
        shader.glPrimitive = cgl.gl.LINES;
    }

    if (attr)
    {
        if (numPoints.get() <= 0) attr.numItems = buff.length / 3;
        else attr.numItems = Math.min(numPoints.get(), buff.length / 3);
    }

    if (mesh && buff.length !== 0) mesh.render(shader);

    shader.glPrimitive = oldPrim;

    next.trigger();
};
