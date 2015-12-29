    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='ColorPick';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
    this.y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));

    this.r=this.addOutPort(new Port(this,"r",OP_PORT_TYPE_VALUE));
    this.g=this.addOutPort(new Port(this,"g",OP_PORT_TYPE_VALUE));
    this.b=this.addOutPort(new Port(this,"b",OP_PORT_TYPE_VALUE));
    this.a=this.addOutPort(new Port(this,"a",OP_PORT_TYPE_VALUE));

    var pixelValues = new Uint8Array(4);
    // var canvas = document.getElementById("glcanvas");

    function render()
    {
        cgl.gl.readPixels(self.x.val, cgl.canvas.height-self.y.val, 1,1,  cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE ,pixelValues);
        self.r.val=pixelValues[0]/255;
        self.g.val=pixelValues[1]/255;
        self.b.val=pixelValues[2]/255;
        self.a.val=pixelValues[3]/255;
    }

    this.render.onTriggered=render;
