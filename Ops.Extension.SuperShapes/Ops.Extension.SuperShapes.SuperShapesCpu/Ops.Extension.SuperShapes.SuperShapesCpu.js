const shapeNames = ["Spherical Harmonics", "Superformula", "Super Ellipsoid", "Super Toroid", "Elliptical Torus"];

const
    exe = op.inTrigger("Update"),
    inShape = op.inDropDown("Shape", shapeNames),
    inTess = op.inInt("Tesselation", 5),
    outArr = op.outArray("Coords", null, 3),
    outFaces = op.outArray("Faces", null, 3),
    outCoords = op.outArray("TexCoords", null, 2);

op.setPortGroup("Shape", [inShape, inTess]);

inShape.onChange =
inTess.onChange = () => { needsUpdate = true; };

let needsUpdate = true;
const params = [];
const numParams = 16;
for (let i = 0; i < numParams; i++)
{
    const a = op.inFloat("Param " + i, 1);
    a.onChange = () => { needsUpdate = true; };
    params[i] = a;
}

exe.onTriggered = update;

const flattenArray = (arr) => { return [].concat.apply([], arr); }; // .flat() only availible in Node 11+

/// //////////////

function update()
{
    if (!needsUpdate) return;
    needsUpdate = false;

    const mesh = { "triangles": [], "vertices": [], "normals": [], "coords": [], "colors": [], "lines": [] };

    const e = inTess.get();
    const t = Math.ceil(360 / e);
    const r = Math.ceil(360 / e);
    let u = 0;
    let d = 0;

    for (let m = 0; m <= t; m++)
        for (let g = 0; g <= r; g++)
            mesh.vertices.push([0, 0, 0]),
            mesh.normals.push([0, 0, 1]),
            mesh.coords.push([1 - g / r, m / t]),
            mesh.colors.push([1, 1, 1, 1]),
            g > 0 && m > 0 && (u = (d = mesh.vertices.length - 1) - (r + 1),
            mesh.triangles.push([u - 1, d - 1, d]),
            mesh.triangles.push([u - 1, d, u]),
            mesh.lines.push([u - 1, d - 1]),
            mesh.lines.push([u - 1, u]));

    const parms = [];
    for (let i = 0; i < numParams; i++)
    {
        parms[i] = params[i].get();
    }

    // console.log("vertrs bef:",mesh.triangles)

    let gen = null;
    if (inShape.get() == shapeNames[0]) gen = new SphericalHarmonics(parms);
    if (inShape.get() == shapeNames[1]) gen = new SuperFormula(parms);
    if (inShape.get() == shapeNames[2]) gen = new SuperEllipsoid(parms);
    if (inShape.get() == shapeNames[3]) gen = new SuperToroid(parms);
    if (inShape.get() == shapeNames[4]) gen = new EllipticTorus(parms);
    // [1, 2.5, 2, -2.8, 1, 1.5, 0, -1.9,       2,1,1,1,1,1,1,1,1,1,3,2,2,2,2,2,2]);

    if (gen)
        for (let i = 0; i < 8; i++)
            params[i].setUiAttribs({ "greyout": i > gen.numParams() });

    if (gen)
        gen.generate(r, t, mesh.vertices, mesh.normals, { "min": [0, 0, 0], "max": [0, 0, 0] });

    // console.log("vertrs bef:",mesh.triangles)

    outArr.setRef(flattenArray(mesh.vertices));
    outFaces.setRef(flattenArray(mesh.triangles));
    outCoords.setRef(flattenArray(mesh.coords));
}
