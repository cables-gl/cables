
var geometry=op.inObject("Geometry");
var smoothNormals=op.inValueBool("Smooth");
var forceZUp=op.inValueBool("Force Z Up");

var geomOut=op.outObject("Geometry Out");

geomOut.ignoreValueSerialize=true;
geometry.ignoreValueSerialize=true;

geometry.onChange=calc;
smoothNormals.onChange=calc;
forceZUp.onChange=calc;

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

