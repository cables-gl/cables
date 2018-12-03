
var exe=op.inTrigger("Exe");
var maxDepth=op.inValue("max Depth",4);
var deeper=op.inValueSlider("Possibility");
var seed=op.inValue("Seed",0);

var inScale=op.inValueSlider("Scale",1);

var width=op.inValue("Width",4);
var height=op.inValue("Height",3);


var next=op.outTrigger("Next");
var outIndex=op.outValue("Index");
var outDepth=op.outValue("depth");


var globalScale=1;
var vPos=vec3.create();
var vScale=vec3.create();

var hhalf=0;
var whalf=0;

var cgl=op.patch.cgl;
var index=0;
function drawSquare(x,y,depth,scale)
{
    
    var godeeper=Math.seededRandom()>deeper.get()*0.9;

    if(depth>maxDepth.get() )godeeper=false;
    
    if( godeeper)
    {
        depth++;
        var st=1/(depth*depth);

        for(var _x=0;_x<2;_x++)
        {
            for(var _y=0;_y<2;_y++)
            {
                var xx=_x*scale/2;
                var yy=_y*scale/2;
                
                drawSquare(
                    x+xx-scale/4,
                    y+yy-scale/4,
                    depth,
                    scale/2*globalScale);
            }
        }
    }
    else
    {
        cgl.pushModelMatrix();
        vec3.set(vScale,scale,scale,scale);
        vec3.set(vPos,x-whalf+0.5,y-hhalf+0.5,0);
        index++;
        outIndex.set(index);
        outDepth.set(depth);
        
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,vPos);
        mat4.scale(cgl.mvMatrix,cgl.mvMatrix,vScale);
        next.trigger();
    
        cgl.popModelMatrix();
    }

}



exe.onTriggered=function()
{
    index=0;
    Math.randomSeed=seed.get();;

whalf=width.get()/2;
hhalf=height.get()/2;

globalScale=inScale.get();

    for(var x=0;x<width.get();x++)
    {
        for(var y=0;y<height.get();y++)
        {

            drawSquare(x,y,0,globalScale);
            var sc=1;


        }
    }
    
    
    
};