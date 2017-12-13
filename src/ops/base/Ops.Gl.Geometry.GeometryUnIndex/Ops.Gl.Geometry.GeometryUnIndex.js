
var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));
var result=op.outObject("Result");

geometry.onChange=function()
{
    var geom=geometry.get();

    if(geom)
    {
        var newGeom=geom.copy();
        newGeom.unIndex();
        newGeom.verticesIndices=[];
        newGeom.calculateNormals();
        result.set(newGeom);
    }
    else
    {
        result.set(null);
    }

};