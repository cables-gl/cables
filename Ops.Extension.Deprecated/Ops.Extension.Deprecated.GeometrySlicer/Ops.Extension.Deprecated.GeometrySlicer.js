let inGeom = op.inObject("Geometry");
let inSlices = op.inValueInt("Slices", 5);
let inDistance = op.inValue("Distance", 0.1);
let outGeom = op.outObject("Result");

inGeom.onChange = update;
inSlices.onChange = update;
inDistance.onChange = update;

function update()
{
    // todo check for unindexed!

    let igeom = inGeom.get();
    if (igeom)
    {
        let geom = igeom.copy();

        let bounds = geom.getBounds();
        let slices = inSlices.get();
        console.log(bounds);

        let step = bounds.y / inSlices.get();

        for (let i = 1; i < inSlices.get(); i++)
        {
            let min = (bounds.minY + step) + ((i - 1) * step);
            let max = (bounds.minY + step) + (i * step);
            let distAdd = i * inDistance.get();

            for (let j = 0; j < igeom.vertices.length; j += 3)
            {
                let y = igeom.vertices[j + 1];
                if (y > min && y < max)
                {
                    geom.vertices[j + 1] = igeom.vertices[j + 1] + distAdd;
                }
            }
        }
        outGeom.set(geom);
    }
}
