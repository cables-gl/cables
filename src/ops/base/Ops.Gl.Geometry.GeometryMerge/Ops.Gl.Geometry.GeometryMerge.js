var inGeom=op.inObject("Geometry");
var inMerge=op.inFunctionButton("Merge");
var inReset=op.inFunctionButton("Reset");

var outGeom=op.outObject("Geometry Result");
var geom=new CGL.Geometry();

outGeom.set(geom);

inReset.onTriggered=function()
{
    geom.clear();
    outGeom.set(null);
    outGeom.set(geom);
    console.log('reset');
};

inMerge.onTriggered=function()
{
    if(inGeom.get())
    {
        console.log("merge geom!");
        geom.merge(inGeom.get());
        outGeom.set(null);
        outGeom.set(geom);
    }

};