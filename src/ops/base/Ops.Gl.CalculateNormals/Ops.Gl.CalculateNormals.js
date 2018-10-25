
var geometry=op.addInPort(new CABLES.Port(op,"Geometry",CABLES.OP_PORT_TYPE_OBJECT));
var smoothNormals=op.addInPort(new CABLES.Port(op,"Smooth",CABLES.OP_PORT_TYPE_VALUE,{"display":"bool"}));
var forceZUp=op.addInPort(new CABLES.Port(op,"Force Z Up",CABLES.OP_PORT_TYPE_VALUE,{"display":"bool"}));

var geomOut=op.addOutPort(new CABLES.Port(op,"Geometry Out",CABLES.OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize=true;
geometry.ignoreValueSerialize=true;

geometry.onValueChanged=calc;
smoothNormals.onValueChanged=calc;
forceZUp.onValueChanged=calc;

var geom=null;




function calc()
{
    if(!geometry.get())return;

    var geom=geometry.get().copy();

    if(!smoothNormals.get())geom.unIndex();

    geom.calculateNormals({
        "forceZUp":forceZUp.get()
    });

    geomOut.set(geom);
    
}

