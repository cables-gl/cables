var inGeom=op.inObject("Geometry");
var inGeom2=op.inObject("Geometry 2");
var inMerge=op.inTriggerButton("Merge");
var inReset=op.inTriggerButton("Reset");

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
    if(inGeom.get() || inGeom2.get())
    {
        console.log("merge geom!");
        if(inGeom.get())geom.merge(inGeom.get());
        if(inGeom2.get())geom.merge(inGeom2.get());
        outGeom.set(null);
        outGeom.set(geom);
    }

};