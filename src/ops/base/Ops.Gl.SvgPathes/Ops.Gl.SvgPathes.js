var render=op.inTrigger('render');
var svgFile=op.addInPort(new CABLES.Port(op,"object",CABLES.OP_PORT_TYPE_OBJECT));

var thickness=op.addInPort(new CABLES.Port(op,"thickness",CABLES.OP_PORT_TYPE_VALUE));

var outEach=op.outTrigger("Each");
var outPoints=op.outArray("Points");


thickness.set(0.1);

var paths=[];

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    
    for(var i=0;i<paths.length;i++)
    {
        outPoints.set(null);
        outPoints.set(paths[i]);
        outEach.trigger();
    }

};

svgFile.onChange=parse;
thickness.onChange=parse;
var doCenter=parse;

function parse()
{

    var arr=svgFile.get();
    var geom=null;
    paths.length=0;

    for(var i in arr)
    {
        var verts=[];

        for(var j in arr[i])
        {
            verts.push(arr[i][j][0]-200);
            verts.push(arr[i][j][1]-150);
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

    console.log(paths.length+' meshes!');
}