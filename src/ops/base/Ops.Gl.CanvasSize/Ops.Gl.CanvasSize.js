    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='CanvasSize';
    this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.width=this.addOutPort(new Port(this,"width",OP_PORT_TYPE_VALUE));
    this.height=this.addOutPort(new Port(this,"height",OP_PORT_TYPE_VALUE));

    var w=0,h=0;

    this.exe.onTriggered=function()
    {
        if(cgl.canvasHeight!=h) h=self.height.val=cgl.canvasHeight;
        if(cgl.canvasWidth!=w) w=self.width.val=cgl.canvasWidth;
        self.trigger.trigger();
    };