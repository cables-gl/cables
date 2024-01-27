const shapeNames = ["sphericalHarmonics", "superformula", "ellipticTorus", "superToroid", "superEllipsoid"]; // ,"Super Ellipsoid","Super Toroid","Elliptical Torus"

const
    exe = op.inTrigger("Update"),
    doRender = op.inBool("Render", true),
    inShape = op.inDropDown("Shape", shapeNames, "sphericalHarmonics"),
    inTess = op.inInt("Tesselation", 5);

op.setPortGroup("Shape", [inShape, inTess]);

const cgl = op.patch.cgl;
const mod = new CGL.ShaderModifier(cgl, op.name);
const params = [];
const numParams = 16;

let mesh = null;
let needsUpdate = true;
let res = 1;

mod.addModule({
    "priority": 6,
    "title": op.name,
    "name": "MODULE_VERTEX_POSITION",
    "srcHeadVert": attachments.supershapes_head_vert,
    "srcBodyVert": attachments.supershapes_body_vert
});

mod.addUniformVert("f", "MOD_res", 1);

for (let i = 0; i < numParams; i++)
{
    const a = op.inFloat("Param " + i, 1);
    // a.onChange=()=>{needsUpdate=true;};
    params[i] = a;
    mod.addUniformVert("f", "params_" + i, a);
}

inShape.onChange =
inTess.onChange = () => { needsUpdate = true; };

exe.onTriggered = update;

function updateGeom()
{
    let e = inTess.get();
    if (e < 1)e = 1;
    if (e > 20)e = 20;

    const t = Math.ceil(360 / e);
    const r = t;
    let u = 0;
    let d = 0;

    const triangles = [];
    const vertices = [];
    const normals = [];
    const coords = [];
    const colors = [];
    const idx = [];

    res = t;

    for (let m = 0; m <= t; m++)
    {
        for (let g = 0; g <= r; g++)
        {
            idx.push(m, g, 0, 0);
            vertices.push(0, 0, 0);
            normals.push(0, 0, 1);
            coords.push(1 - g / r, m / t);

            if (g == 0 || m == 0) continue;

            u = (d = vertices.length / 3 - 1) - (r + 1);

            triangles.push(u - 1, d - 1, d);
            triangles.push(u - 1, d, u);
        }
    }

    const geom = new CGL.Geometry("supershapeGpu");

    geom.setAttribute("attrIdx", idx, 4);
    geom.vertices = vertices;
    geom.texCoords = coords;
    geom.verticesIndices = triangles;
    geom.vertexNormals = normals;

    // geom.calcNormals();
    // geom.unIndex();
    // geom.tangents = tangents;
    // geom.biTangents = biTangents;

    // if (numColumns * numRows > 64000)
    // geom.unIndex();

    const cgl = op.patch.cgl;

    if (!mesh) mesh = op.patch.cg.createMesh(geom);
    else mesh.setGeom(geom);

    console.log(geom.vertices.length / 3);

    needsUpdate = false;
    console.log("updategeom");
}

function update()
{
    if (needsUpdate)updateGeom();
    mod.setUniformValue("MOD_res", res);

    // for(let i=0;i<numParams;i++)
    // mod.setUniformValue("params_"+i, params[i].get());

    mod.define("FORMULA", inShape.get());

    op.setUiAttrib({ "extendTitle": inShape.get() });

    const parms = [];
    for (let i = 0; i < numParams; i++)
    {
        parms[i] = params[i].get();
    }

    if (mesh && doRender.get())
    {
        mod.bind();
        mesh.render(op.patch.cg.getShader());
        mod.unbind();
    }
}
