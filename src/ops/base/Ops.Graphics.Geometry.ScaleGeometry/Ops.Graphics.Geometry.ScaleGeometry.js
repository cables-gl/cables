let geometry = op.inObject("Geometry");
let scale = op.inValue("Scale", 1);
let outGeom = op.outObject("Result");

scale.onChange = geometry.onChange = update;

function update()
{
    let oldGeom = geometry.get();

    if (oldGeom)
    {
        let geom = oldGeom.copy();
        let rotVec = vec3.create();
        let emptyVec = vec3.create();
        let transVec = vec3.create();
        let centerVec = vec3.create();
        let s = scale.get();

        for (let i = 0; i < geom.vertices.length; i += 3)
        {
            geom.vertices[i + 0] *= s;
            geom.vertices[i + 1] *= s;
            geom.vertices[i + 2] *= s;
        }

        outGeom.set(geom);
    }
    else outGeom.set(null);
}
