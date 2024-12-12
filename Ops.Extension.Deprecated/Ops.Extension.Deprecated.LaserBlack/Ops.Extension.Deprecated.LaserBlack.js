// Op.apply(this, arguments);
let self = this;
let cgl = self.patch.cgl;

this.name = "Laser Black";
this.render = this.addInPort(new CABLES.Port(this, "render", CABLES.OP_PORT_TYPE_FUNCTION));

let doSetColor = this.addInPort(new CABLES.Port(this, "set color", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
doSetColor.set(true);

// var numPoints=this.addInPort(new CABLES.Port(this,"num points",CABLES.OP_PORT_TYPE_VALUE));

this.trigger = this.addOutPort(new CABLES.Port(this, "trigger", CABLES.OP_PORT_TYPE_FUNCTION));

this.render.onTriggered = function ()
{
    if (!cgl.tempData.SplinePoints) return;
    let pos = [0, 0, 0];
    vec3.transformMat4(pos, [0, 0, 0], cgl.mvMatrix);

    let obj = { "black": true, "x": pos[0], "y": pos[1], "z": pos[2], "num": 11, "colR": 0, "colG": 0, "colB": 0 };
    cgl.tempData.laserPoints.push(obj);

    // obj={black:true,x:pos[0],y:pos[1],z:pos[2],num:3,colR:0,colG:0,colB:0};

    // cgl.tempData.laserPoints.push(obj);

    self.trigger.trigger();
};
