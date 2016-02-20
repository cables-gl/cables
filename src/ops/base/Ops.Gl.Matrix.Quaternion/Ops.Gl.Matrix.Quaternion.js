
var cgl=this.patch.cgl;
var patch=this.patch;
this.name='quaternion';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var x=this.addInPort(new Port(this,"x"));
var y=this.addInPort(new Port(this,"y"));
var z=this.addInPort(new Port(this,"z"));
var w=this.addInPort(new Port(this,"w"));
x.set(0.0);
y.set(0.0);
z.set(0.0);
w.set(0.0);

var q1=quat.create();
var q2=quat.create();
var q=quat.create();
var qMat=mat4.create();

render.onTriggered=function()
{
    if(x.isAnimated())
    {
        var time=patch.timer.getTime();

        var i1=x.anim.getKeyIndex(time);
        var i2=parseInt(x.anim.getKeyIndex(time))+1;
        if(i2>=x.anim.keys.length)i2=x.anim.keys.length-1;
        
        // console.log(i1,i2);
        
        if(i1==i2)
        {
            quat.set(q,
                x.anim.keys[i1].value,
                y.anim.keys[i1].value,
                z.anim.keys[i1].value,
                w.anim.keys[i1].value
            );
        }
        else
        {
            var key1Time=x.anim.keys[i1].time;
            var key2Time=x.anim.keys[i2].time;
            var perc=(time-key1Time)/(key2Time-key1Time);

            quat.set(q1,
                x.anim.keys[i1].value,
                y.anim.keys[i1].value,
                z.anim.keys[i1].value,
                w.anim.keys[i1].value
            );
            
            quat.set(q2, 
                x.anim.keys[i2].value,
                y.anim.keys[i2].value,
                z.anim.keys[i2].value,
                w.anim.keys[i2].value
            );
    
// quat.normalize(q1,q1);
// quat.normalize(q2,q2);

            quat.slerp(q, q1, q2, perc);
            // console.log(perc);
            
        }
    }
    else
    {
        quat.set(q, x.get(),y.get(),z.get(),w.get());
    }
    cgl.pushMvMatrix();

    mat4.fromQuat(qMat, q);
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);

    trigger.trigger();
    cgl.popMvMatrix();
};
