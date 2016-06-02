op.name="Coordinate";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var lat=op.addInPort(new Port(op,"lat"));
var lon=op.addInPort(new Port(op,"lon"));
// var z=op.addInPort(new Port(op,"z"));

var vec=vec3.create();
var cgl=op.patch.cgl;
render.onTriggered=function()
{
    var coord=window.METROPOLIS.latLonCoord(lat.get(),lon.get());
    
    vec3.set(vec, coord.lat,coord.lon,coord.z);
    cgl.pushMvMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
    trigger.trigger();
    cgl.popMvMatrix();

}
