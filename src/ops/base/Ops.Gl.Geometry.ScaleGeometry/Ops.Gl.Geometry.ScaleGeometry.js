var geometry=op.inObject("Geometry");
var scale=op.inValue("Scale",1);
var outGeom=op.outObject("Result");

scale.onChange=geometry.onChange=update;

function update()
{
    var oldGeom=geometry.get();

    if(oldGeom)
    {
        var geom=oldGeom.copy();
        var rotVec=vec3.create();
        var emptyVec=vec3.create();
        var transVec=vec3.create();
        var centerVec=vec3.create();
        var s=scale.get();

        for(var i=0;i<geom.vertices.length;i+=3)
        {
            geom.vertices[i+0]*=s;
            geom.vertices[i+1]*=s;
            geom.vertices[i+2]*=s;
        }

        outGeom.set(geom);
    }
}