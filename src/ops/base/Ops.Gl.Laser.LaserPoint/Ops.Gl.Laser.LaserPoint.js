Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='laserpoint';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

var x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE,{ }));
var y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE,{ }));
var z=this.addInPort(new Port(this,"z",OP_PORT_TYPE_VALUE,{ }));


var doSetColor=this.addInPort(new Port(this,"set color",OP_PORT_TYPE_VALUE,{'display':'bool'}));
doSetColor.set(true);

var numPoints=this.addInPort(new Port(this,"num points",OP_PORT_TYPE_VALUE));

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
numPoints.set(1);
{
    // diffuse color

    var r=this.addInPort(new Port(this,"diffuse r",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
    var g=this.addInPort(new Port(this,"diffuse g",OP_PORT_TYPE_VALUE,{ display:'range' }));
    var b=this.addInPort(new Port(this,"diffuse b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    var a=this.addInPort(new Port(this,"diffuse a",OP_PORT_TYPE_VALUE,{ display:'range' }));

    r.set(Math.random());
    g.set(Math.random());
    b.set(Math.random());
}


var vec=vec3.create();
this.render.onTriggered=function()
{
    if(!cgl.frameStore.SplinePoints)return;
    
    vec3.set(vec, x.get(),y.get(),z.get());
    cgl.pushModelMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);


    var pos=[0,0,0];
    vec3.transformMat4(pos, pos, cgl.mvMatrix);

    var obj={x:pos[0],y:pos[1],z:pos[2],num:numPoints.get()};

    if(doSetColor.get())
    {
        obj.colR=r.get();
        obj.colG=g.get();
        obj.colB=b.get();
    }

    cgl.frameStore.laserPoints.push(obj);

    self.trigger.trigger();

    cgl.popModelMatrix();

    
};
