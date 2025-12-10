const render = op.inTrigger("render");
const svgFile = op.addInPort(new CABLES.Port(op, "object", CABLES.OP_PORT_TYPE_OBJECT));

const thickness = op.addInPort(new CABLES.Port(op, "thickness", CABLES.OP_PORT_TYPE_VALUE));

const outEach = op.outTrigger("Each");
const outPoints = op.outArray("Points");

thickness.set(0.1);

const paths = [];

const cgl = op.patch.cgl;

render.onTriggered = function ()
{
    for (let i = 0; i < paths.length; i++)
    {
        outPoints.set(null);
        outPoints.set(paths[i]);
        outEach.trigger();
    }
};

svgFile.onChange = parse;
thickness.onChange = parse;
const doCenter = parse;

function parse()
{
    const arr = svgFile.get();
    const geom = null;
    paths.length = 0;

    for (const i in arr)
    {
        const verts = [];

        for (const j in arr[i])
        {
            verts.push(arr[i][j][0] - 200);
            verts.push(arr[i][j][1] - 150);
            verts.push(0);
        }

        paths.push(verts);

        // var newGeom=CGL.Geometry.LinesToGeom(verts,{thickness:thickness.get()});

        // if(!geom)
        // {
        //     geom=newGeom;
        // }
        // else
        // {
        //     if(geom.vertices.length>50000*3)
        //     {
        //         meshes.push(new CGL.Mesh(cgl,geom));
        //         geom=null;
        //     }
        //     else
        //     geom.merge(newGeom);
        // }
    }

    // if(geom)
    // {
    //     meshes.push(new CGL.Mesh(cgl,geom));
    // }
}
