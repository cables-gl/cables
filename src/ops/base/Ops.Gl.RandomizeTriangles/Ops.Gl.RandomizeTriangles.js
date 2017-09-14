op.name="RandomizeTriangles";

var inGeom=op.inObject("Geometry");
var outGeom=op.outObject("Result");

function shuffleArray(array)
{
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        
    }
    return array;
}


inGeom.onChange=function()
{
    var geom=inGeom.get();
    if(!geom)return;
    if(geom.verticesIndices && geom.verticesIndices.length>0)
    {
        console.log("cannot randomize indexed geom ");
        return;
    }

    var newGeom=geom.copy();
    var order=[];
    var i=0;
    order.length=geom.vertices.length/9;
    for(i=0;i<order.length;i++)order[i]=i;
    order=shuffleArray(order);
    console.log(order);

    var verts=[];
    verts.length=geom.vertices.length;

    for(i=0;i<order.length;i++)
    {
        var ind=order[i];
        for(var j=0;j<9;j++)
            verts[i*9+j]=geom.vertices[ind*9+j];
    }

    newGeom.setVertices(verts);

    outGeom.set(null);
    outGeom.set(newGeom);


};