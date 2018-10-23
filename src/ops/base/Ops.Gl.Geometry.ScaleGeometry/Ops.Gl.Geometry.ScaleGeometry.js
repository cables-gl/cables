var geometry=op.addInPort(new Port(op,"Geometry",CABLES.OP_PORT_TYPE_OBJECT));

var scale=op.inValue("Scale",1);

var outGeom=op.outObject("Result");

scale.onChange=
geometry.onChange=update;


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

        for(var i=0;i<geom.vertices.length;i+=3)
        {
            geom.vertices[i+0]*=scale.get();
            geom.vertices[i+1]*=scale.get();
            geom.vertices[i+2]*=scale.get();
        }

        outGeom.set(geom);
    }
    
    
    
}