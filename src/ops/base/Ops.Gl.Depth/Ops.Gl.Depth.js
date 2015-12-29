    Op.apply(this, arguments);
    var self=this;
    var cgl=self.patch.cgl;

    this.name='Depth';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.clear=this.addInPort(new Port(this,"clear depth",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    this.enable=this.addInPort(new Port(this,"enable depth testing",OP_PORT_TYPE_VALUE,{ display:'bool' }));
    this.write=this.addInPort(new Port(this,"write to depth buffer",OP_PORT_TYPE_VALUE,{ display:'bool' }));

    this.depthFunc=this.addInPort(new Port(this,"ratio",OP_PORT_TYPE_VALUE ,{display:'dropdown',values:['never','always','less','less or equal','greater', 'greater or equal','equal','not equal']} ));

    var theDepthFunc=cgl.gl.LEQUAL;

    this.depthFunc.onValueChanged=function()
    {
        if(self.depthFunc.get()=='never') theDepthFunc=cgl.gl.NEVER;
        if(self.depthFunc.get()=='always') theDepthFunc=cgl.gl.ALWAYS;
        if(self.depthFunc.get()=='less') theDepthFunc=cgl.gl.LESS;
        if(self.depthFunc.get()=='less or equal') theDepthFunc=cgl.gl.LEQUAL;
        if(self.depthFunc.get()=='greater') theDepthFunc=cgl.gl.GREATER;
        if(self.depthFunc.get()=='greater or equal') theDepthFunc=cgl.gl.EQUAL;
        if(self.depthFunc.get()=='equal') theDepthFunc=cgl.gl.EQUAL;
        if(self.depthFunc.get()=='not equal') theDepthFunc=cgl.gl.NOTEQUAL;
    };

    this.depthFunc.val='less or equal';

    this.clear.val=false;
    this.enable.val=true;
    this.write.val=true;

    this.render.onTriggered=function()
    {
        if(true===self.clear.val) cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);
        if(true!==self.enable.val) cgl.gl.disable(cgl.gl.DEPTH_TEST);
        if(true!==self.write.val) cgl.gl.depthMask(false);

        cgl.gl.depthFunc(theDepthFunc);

        self.trigger.trigger();

        cgl.gl.enable(cgl.gl.DEPTH_TEST);
        cgl.gl.depthMask(true);
        cgl.gl.depthFunc(cgl.gl.LEQUAL);
    };