var render=op.inTrigger("Render");

var numX=op.inValueInt("Num X",5);
var numY=op.inValueInt("Num Y",5);

var spaceX=op.inValue("Space X",1);
var spaceY=op.inValue("Space Y",1);

var next=op.outTrigger("Next");
var outIndex=op.outValue("Index");

var outX=op.outValue("x index");
var outY=op.outValue("y index");

var matOrig=mat4.create();
var vec=vec3.create();

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    cgl.pushModelMatrix();
    
    mat4.copy(matOrig, cgl.modelMatrix());

    var mx=spaceX.get();
    var my=spaceY.get();
    
    var maxX=Math.floor(numX.get());
    var maxY=Math.floor(numY.get());
    
    var alX=((maxX-1)*mx)/2;
    var alY=((maxY-1)*my)/2;

    var i=0;
    for(var y=0;y<maxY;y++)
    {
        outY.set(y);
        
        for(var x=0;x<maxX;x++)
        {
            vec3.set(vec, 
                x*mx-alX,
                y*my-alY,
                0);

            outX.set(x);

            mat4.translate(cgl.mvMatrix,matOrig, vec);

            outIndex.set(i);
            i++;
            
            next.trigger();
        }
    }
    
    cgl.popModelMatrix();

};