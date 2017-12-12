
var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));

var x=op.inValueBool("x");
var y=op.inValueBool("y");
var z=op.inValueBool("z");


var outGeom=op.outObject("Result");

x.onChange=update;
y.onChange=update;
z.onChange=update;
geometry.onChange=update;


function update()
{
    var oldGeom=geometry.get();

    if(oldGeom)
    {
        var geom=oldGeom.copy();
        geom.center(x.get(),y.get(),z.get());
       
        outGeom.set(geom);
    }
    
    
    
}