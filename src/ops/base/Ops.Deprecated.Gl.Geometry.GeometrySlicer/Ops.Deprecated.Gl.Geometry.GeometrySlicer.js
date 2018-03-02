
var inGeom=op.inObject("Geometry");
var inSlices=op.inValueInt("Slices",5);
var inDistance=op.inValue("Distance",0.1);
var outGeom=op.outObject("Result");


inGeom.onChange=update;
inSlices.onChange=update;
inDistance.onChange=update;

function update()
{
    // todo check for unindexed!
    
    
    var igeom=inGeom.get();
    if(igeom)
    {
        var geom=igeom.copy();
        
        var bounds=geom.getBounds();
        var slices=inSlices.get();  
        console.log(bounds);
        
        var step=bounds.y/inSlices.get();
        
        for(var i=1;i<inSlices.get();i++)
        {
            var min=(bounds.minY+step)+( (i-1)*step );
            var max=(bounds.minY+step)+( i*step );
            var distAdd=i*inDistance.get();

            for(var j=0;j<igeom.vertices.length;j+=3)
            {
                var y=igeom.vertices[j+1];
                if(y>min && y<max)
                {
                    geom.vertices[j+1]=igeom.vertices[j+1]+distAdd;
                }
            }
        }
        outGeom.set(geom);
    }
}
