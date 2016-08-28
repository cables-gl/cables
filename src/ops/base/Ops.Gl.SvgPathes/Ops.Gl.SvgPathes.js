op.name="SvgPathes";

var svgFile=op.addInPort(new Port(op,"object",OP_PORT_TYPE_OBJECT));

var thickness=op.addInPort(new Port(op,"thickness",OP_PORT_TYPE_VALUE));

thickness.set(0.1);

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var meshes=[];
var cgl=op.patch.cgl;

render.onTriggered=function()
{
    for(var i=0;i<meshes.length;i++)
    {
        meshes[i].render(cgl.getShader());
    }
};

svgFile.onValueChanged=parse;
thickness.onValueChanged=parse;

function parse()
{
    meshes.length=0;

    var arr=svgFile.get();
    var geom=null;

    for(var i in arr)
    {
        var verts=[];

        for(var j in arr[i])
        {
            verts.push(arr[i][j][0]-200);
            verts.push(arr[i][j][1]-150);
            verts.push(0);
        }

        var newGeom=CGL.Geometry.LinesToGeom(verts,{thickness:thickness.get()});

        if(!geom)
        {
            geom=newGeom;
        }
        else
        {
            if(geom.vertices.length>50000*3)
            {
                meshes.push(new CGL.Mesh(cgl,geom));
                geom=null;
            }
            else
            geom.merge(newGeom);
        }
    }

    if(geom)
    {
        meshes.push(new CGL.Mesh(cgl,geom));
    }

    console.log(meshes.length+' meshes!');
}