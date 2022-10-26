// from https://github.com/ahoiin/supershape.js/blob/master/js/objects.js

const render = op.inTrigger("render");

let pNormalizeSize = op.inValueBool("Normalize Size", true);
let asPointCloud = op.inValueBool("Point Cloud", false);
let pStep = op.inFloat("Step", 0.05);

let a1 = op.inFloat("a1", 1);
let b1 = op.inFloat("b1", 1);
let m1 = op.inFloat("m1", 5);
let n11 = op.inFloat("n11", 1);
let n21 = op.inFloat("n21", 1);
let n31 = op.inFloat("n31", 2);

let a2 = op.inFloat("a2", 1);
let b2 = op.inFloat("b2", 1);
let m2 = op.inFloat("m2", 5);
let n12 = op.inFloat("n12", 1);
let n22 = op.inFloat("n22", 1);
let n32 = op.inFloat("n32", 3);

let trigger = op.outTrigger("Trigger");
let outNumVerts = op.outNumber("Num Vertices");
let outGeom = op.outObject("geom", null, "geometry");

let needsUpdate = true;
let geometry = new CGL.Geometry(op.name);
let mesh = null;
let verts = [];

pNormalizeSize.onChange =
    pStep.onChange =
    a1.onChange =
    b1.onChange =
    m1.onChange =
    n11.onChange =
    n21.onChange =
    n31.onChange =
    a2.onChange =
    b2.onChange =
    m2.onChange =
    n12.onChange =
    n22.onChange =
    n32.onChange = doUpdate;

function doUpdate()
{
    needsUpdate = true;
}

asPointCloud.onChange = function ()
{
    mesh = null;
    needsUpdate = true;
};

render.onTriggered = function ()
{
    if (needsUpdate)update();
    if (mesh) mesh.render(op.patch.cgl.getShader());

    trigger.trigger();
};
function update()
{
    verts.length = 0;
    geometry.clear();
    // geometry=new CGL.Geometry(op.name);
    needsUpdate = false;
    // geometry.dynamic = true;
    let step = pStep.get();
    let q = parseInt(2 * Math.PI / step + 1.3462);
    let o = parseInt(Math.PI / step + 1.5);

    let resize = pNormalizeSize.get();
    let max = 0;

    for (let l = 0; l < (q); l++)
    {
        var u = -Math.PI + l * step;
        for (let h = 0; h < (o); h++)
        {
            var s = -Math.PI / 2 + h * step;
            var m, k, n, g, v, e, t;
            let f = 0;
            let p = 0;
            let w = 0;
            m = Math.cos(m1.get() * u / 4);
            m = 1 / a1.get() * Math.abs(m);
            m = Math.abs(m);
            k = Math.sin(m1.get() * u / 4);
            k = 1 / b1.get() * Math.abs(k);
            k = Math.abs(k);
            g = Math.pow(m, n21.get()) + Math.pow(k, n31.get());
            v = Math.abs(g);
            v = Math.pow(v, (-1 / n11.get()));
            m = Math.cos(m2.get() * s / 4);
            m = 1 / a2.get() * Math.abs(m);
            m = Math.abs(m);
            k = Math.sin(m2.get() * s / 4);
            k = 1 / b2.get() * Math.abs(k);
            k = Math.abs(k);
            e = Math.pow(m, n22.get()) + Math.pow(k, n32.get());
            t = Math.abs(e);
            t = Math.pow(t, (-1 / n12.get()));
            f = v * Math.cos(u) * t * Math.cos(s);
            p = v * Math.sin(u) * t * Math.cos(s);
            w = t * Math.sin(s);
            verts.push(f);
            verts.push(p);
            verts.push(w);

            if (resize)
            {
                max = Math.max(max, Math.abs(f));
                max = Math.max(max, Math.abs(p));
                max = Math.max(max, Math.abs(w));
            }
        }
    }

    if (resize && max > 1) for (let i = 0; i < verts.length; i++) verts[i] /= max;

    if (asPointCloud.get())
    {
        geometry.setPointVertices(verts);
        geometry.mapTexCoords2d();

        mesh = new CGL.Mesh(op.patch.cgl, geometry, op.patch.cgl.gl.POINTS);
        mesh.addVertexNumbers = true;
        mesh.setGeom(geometry);
    }
    else
    {
        for (var u = 0; u < (q - 1); u++)
        {
            for (var s = 0; s < (o - 1); s++)
            {
                let d = u * o + s;
                let c = u * o + s + 1;
                let b = (u + 1) * o + s + 1;
                let a = (u + 1) * o + s;
                // geometry.faces.push(new THREE.Face4(d, c, b, a));
                geometry.verticesIndices.push(d);
                geometry.verticesIndices.push(c);
                geometry.verticesIndices.push(b);

                geometry.verticesIndices.push(a);
                geometry.verticesIndices.push(b);
                geometry.verticesIndices.push(d);
            }
        }
        geometry.vertices = verts;
        geometry.mapTexCoords2d();

        outNumVerts.set(verts.length);

        geometry.calculateNormals({ "forceZUp": true });

        if (!mesh) mesh = new CGL.Mesh(op.patch.cgl, geometry);
        else mesh.setGeom(geometry);
    }

    outGeom.set(null);
    outGeom.set(geometry);
}
