
var inGeom=op.inObject("Geometry");

var render=op.inFunction("Render");

var outMinX=op.outValue("Min X");
var outMaxX=op.outValue("Max X");
var outMinY=op.outValue("Min Y");
var outMaxY=op.outValue("Max Y");

var outMinZ=op.outValue("Min Z");
var outMaxZ=op.outValue("Max Z");

var outCenterX=op.outValue("Center X");
var outCenterY=op.outValue("Center Y");
var outCenterZ=op.outValue("Center Z");

var outWidth=op.outValue("Width");
var outHeight=op.outValue("Height");
var outLength=op.outValue("Length");


var wireMesh=null;
var bounds=null;
var cgl=op.patch.cgl;
inGeom.onChange=function()
{
    var geom=inGeom.get();
    if(geom)
    {
        bounds=geom.getBounds();
        // console.log('bounds ',bounds);
        
        outMinX.set(bounds.minX);
        outMaxX.set(bounds.maxX);
    
        outMinY.set(bounds.minY);
        outMaxY.set(bounds.maxY);

        outMinZ.set(bounds.minZ);
        outMaxZ.set(bounds.maxZ);
        
        outWidth.set(Math.abs(bounds.minX)+Math.abs(bounds.maxX));
        outLength.set(Math.abs(bounds.minY)+Math.abs(bounds.maxY));
        outHeight.set(Math.abs(bounds.minZ)+Math.abs(bounds.maxZ));
        
        outCenterX.set( (bounds.minX+bounds.maxX)/2 );
        outCenterY.set( (bounds.minY+bounds.maxY)/2 );
        outCenterZ.set( (bounds.minZ+bounds.maxZ)/2 );
    }
    else
    {
        bounds=null;
        outMinX.set(0);
        outMaxX.set(0);
    
        outMinY.set(0);
        outMaxY.set(0);

        outMinZ.set(0);
        outMaxZ.set(0);
    }

};

var vec=vec3.create();

render.onTriggered=function()
{
    if(!wireMesh) wireMesh=new CGL.WireCube(cgl);

    if(bounds)
    {
        vec3.set(vec, 
            outCenterX.get(),
            outCenterY.get(),
            outCenterZ.get()
            );
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);

        wireMesh.render(cgl,
            outWidth.get()/2,
            outLength.get()/2,
            outHeight.get()/2
            );
        
        cgl.popMvMatrix();    
    }

};