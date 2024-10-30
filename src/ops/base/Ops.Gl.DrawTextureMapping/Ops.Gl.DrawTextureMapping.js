const
    render = op.inTrigger("Render"),
    inGeom = op.inObject("Geometry", null, "geometry"),
    numPoints = op.inValue("Num Points"),
    next = op.outTrigger("Next");

let cgl = op.patch.cgl;

let mesh = null;
let attr = null;
let points = [];

inGeom.onChange = function ()
{
    let geom = inGeom.get();

    if (!geom || !geom.verticesIndices) return;

    points.length = 0;
    let newgeom = new CGL.Geometry("texturemapping");

    for (let i = 0; i < geom.verticesIndices.length; i += 3)
    {
        var index;

        index = geom.verticesIndices[i + 0];
        points.push(geom.texCoords[index * 2 + 0]);
        points.push(geom.texCoords[index * 2 + 1]);
        points.push(0);

        index = geom.verticesIndices[i + 1];
        points.push(geom.texCoords[index * 2 + 0]);
        points.push(geom.texCoords[index * 2 + 1]);
        points.push(0);

        index = geom.verticesIndices[i + 1];
        points.push(geom.texCoords[index * 2 + 0]);
        points.push(geom.texCoords[index * 2 + 1]);
        points.push(0);

        index = geom.verticesIndices[i + 2];
        points.push(geom.texCoords[index * 2 + 0]);
        points.push(geom.texCoords[index * 2 + 1]);
        points.push(0);

        index = geom.verticesIndices[i + 2];
        points.push(geom.texCoords[index * 2 + 0]);
        points.push(geom.texCoords[index * 2 + 1]);
        points.push(0);

        index = geom.verticesIndices[i + 0];
        points.push(geom.texCoords[index * 2 + 0]);
        points.push(geom.texCoords[index * 2 + 1]);
        points.push(0);
    }

    newgeom.vertices = points;

    // if(!mesh)
    mesh = new CGL.Mesh(cgl, newgeom);

    // else mesh.setGeom(geom );
    // if(!(points instanceof Float32Array))
    // {
    //     if(points.length!=buff.length)
    //     {
    //         buff=new Float32Array(points.length);
    //         buff.set(points);
    //     }
    //     else
    //     {
    //         buff.set(points);
    //     }
    // }
    // else
    // {
    //     buff=points;
    // }
    // attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);
};

render.onTriggered = function ()
{
    if (points.length === 0) return;
    if (!mesh) return;
    // if (op.instanced(render)) return;

    let shader = cgl.getShader();
    if (!shader) return;

    let oldPrim = shader.glPrimitive;

    shader.glPrimitive = cgl.gl.LINES;

    // if(numPoints.get()<=0)attr.numItems=buff.length/3;
    // else attr.numItems=Math.min(numPoints.get(),buff.length/3);

    mesh.render(shader);

    shader.glPrimitive = oldPrim;

    next.trigger();
};
