this.name="lissajous transform anim";

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
var z=this.addInPort(new Port(this,"z",OP_PORT_TYPE_VALUE));
var pointSkip=this.addInPort(new Port(this,"skip",OP_PORT_TYPE_VALUE));
var numPoints=this.addInPort(new Port(this,"num points",OP_PORT_TYPE_VALUE));


x.set(2);
y.set(4);
z.set(8);

pointSkip.set(40);
numPoints.set(3200);


var animsX=[];
var animsY=[];
var animsZ=[];

var cgl=this.patch.cgl;
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

 

function getPoints()
{
    var step=parseFloat(pointSkip.get()) || 1;
    if(step<1)step=1;

    if(animsX.length==0)
    {
        for(var i = 0; i < numPoints.get(); i+=step)
        {
            animsX.push(new CABLES.TL.Anim());
            animsY.push(new CABLES.TL.Anim());
            animsZ.push(new CABLES.TL.Anim());
        }
    }
    

    var count=0;
    var t=Date.now()/1000;

    for(var i = 0; i < numPoints.get(); i+=step)
    {
        animsX[count].defaultEasing=CABLES.TL.EASING_SMOOTHSTEP;
        animsY[count].defaultEasing=CABLES.TL.EASING_SMOOTHSTEP;
        animsZ[count].defaultEasing=CABLES.TL.EASING_SMOOTHSTEP;
        
        // console.log(count);
        var oldX=animsX[count].getValue(t);
        var oldY=animsY[count].getValue(t);
        var oldZ=animsZ[count].getValue(t);

        animsX[count].clear();
        animsY[count].clear();
        animsZ[count].clear();

        animsX[count].setValue(t,oldX);
        animsY[count].setValue(t,oldY);
        animsZ[count].setValue(t,oldZ);

        var dur=1.0;
        animsX[count].setValue(t+dur,Math.sin( (i * x.get()) * 0.001 ));
        animsY[count].setValue(t+dur,Math.cos( (i * y.get()) * 0.001 ));
        animsZ[count].setValue(t+dur,Math.sin( (i * z.get()) * 0.001 ));

count++;
        // points[count]=vec;
    }

    
}



function doRender()
{
    var step=parseFloat(pointSkip.get()) || 1;
    if(step<1)step=1;

    var count=0;
    var vec=vec3.create();
    var t=Date.now()/1000;
    
    if(animsX.length==0)getPoints();
    for(var i = 0; i < numPoints.get(); i+=step)
    {
        console.log(count,animsX.length);
        
        vec3.set(vec,
            animsX[count].getValue(t),
            animsY[count].getValue(t),
            animsZ[count].getValue(t));
        
        cgl.pushMvMatrix();

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec );
        trigger.trigger();

        cgl.popMvMatrix();
        count++;
    }
}

x.onValueChange(getPoints);
y.onValueChange(getPoints);
z.onValueChange(getPoints);

render.onTriggered=doRender;
