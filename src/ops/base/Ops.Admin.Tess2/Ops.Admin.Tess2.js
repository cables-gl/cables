
const
    inExec=op.inTriggerButton("Update"),
    inWinding=op.inDropDown("Combine",['Positive','Odd','Intersect'],"Positive"),
    inPath=op.inArray("2d Point Path"),
    inPath2=op.inArray("Path 2"),
    inPath3=op.inArray("Path 3"),
    outGeom=op.outObject("Geometry");

inExec.onTriggered=tess;

function tess()
{
    // var Tess2 = require('tess2');

    // Define input
    // var ca = [0,0, 10,0, 5,10];
    // var cb = [0,2, 10,2, 10,6, 0,6];
    // var contours = [ca,cb];

    var points=inPath.get();

    if(!points || points.length===0)
    {
        outGeom.set(null);
        return;
    }

    var contours=[points];

    var points2=inPath2.get();
    if(points2 && points2.length>0) contours.push(points2);

    var points3=inPath3.get();
    if(points3 && points3.length>0) contours.push(points3);


    // console.log('contours',contours);

    var winding=Tess2.WINDING_ODD;
    if(inWinding.get()=="Positive")
    {
        winding=Tess2.WINDING_POSITIVE;
    }
    if(inWinding.get()=="Intersect")
    {
        winding=Tess2.WINDING_ABS_GEQ_TWO;
    }

    var res=null;
    try {
        // Tesselate
        res = Tess2.tesselate({
        	contours: contours,
        	windingRule: winding,
        	elementType: Tess2.POLYGONS,
        	polySize: 3,
        	vertexSize: 2
        });
    } catch (e) {}

    if(res)
    {
        const geom=new CGL.Geometry("tess2geom");

        var verts3=[];
        for(var i=0;i<res.vertices.length;i+=2)
        {
            verts3.push(res.vertices[i+0],res.vertices[i+1],0);
        }

        geom.vertices=verts3;
        geom.verticesIndices=res.elements;
        geom.calculateNormals();
        geom.mapTexCoords2d();


        outGeom.set(null);
        outGeom.set(geom);

    }


}





