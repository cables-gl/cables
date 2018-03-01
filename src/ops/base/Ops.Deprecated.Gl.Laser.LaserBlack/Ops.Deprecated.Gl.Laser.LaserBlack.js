Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='Laser Black';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));



var doSetColor=this.addInPort(new Port(this,"set color",OP_PORT_TYPE_VALUE,{'display':'bool'}));
doSetColor.set(true);

// var numPoints=this.addInPort(new Port(this,"num points",OP_PORT_TYPE_VALUE));

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));



this.render.onTriggered=function()
{
    if(!cgl.frameStore.SplinePoints)return;
    var pos=[0,0,0];
    vec3.transformMat4(pos, [0,0,0], cgl.mvMatrix);


    
    var obj={black:true,x:pos[0],y:pos[1],z:pos[2],num:11,colR:0,colG:0,colB:0};
    cgl.frameStore.laserPoints.push(obj);
    
    // obj={black:true,x:pos[0],y:pos[1],z:pos[2],num:3,colR:0,colG:0,colB:0};

    // cgl.frameStore.laserPoints.push(obj);

    self.trigger.trigger();
};
