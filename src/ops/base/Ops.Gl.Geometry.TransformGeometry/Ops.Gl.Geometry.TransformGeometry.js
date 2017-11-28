
var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));


var transX=op.inValue("Translate X");
var transY=op.inValue("Translate Y");
var transZ=op.inValue("Translate Z");

var scaleX=op.inValueSlider("Scale X",1);
var scaleY=op.inValueSlider("Scale Y",1);
var scaleZ=op.inValueSlider("Scale Z",1);


var outGeom=op.outObject("Result");


transX.onChange=
transY.onChange=
transZ.onChange=
scaleX.onChange=
scaleY.onChange=
scaleZ.onChange=
geometry.onChange=update;


function update()
{
    
    var oldGeom=geometry.get();
    
    
    if(oldGeom)
    {
        
        var geom=oldGeom.copy();
        
        for(var i=0;i<geom.vertices.length;i+=3)
        {
            geom.vertices[i+0]*=scaleX.get();
            geom.vertices[i+1]*=scaleY.get();
            geom.vertices[i+2]*=scaleZ.get();

            geom.vertices[i+0]+=transX.get();
            geom.vertices[i+1]+=transY.get();
            geom.vertices[i+2]+=transZ.get();

        }
        
        outGeom.set(geom);    
    }
    
    
    
}