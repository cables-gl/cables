Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='Picker';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
this.y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
this.enabled=this.addInPort(new Port(this,"enabled",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.enabled.set(true);

this.showPass=this.addInPort(new Port(this,"show picking pass",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.showPass.set(false);

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));



var pixelRGB = new Uint8Array(4);

function renderPickingPass()
{
    cgl.frameStore.renderOffscreen=true;
    cgl.frameStore.pickingpass=true;
    cgl.frameStore.pickingpassNum=0;
    self.trigger.trigger();
    cgl.frameStore.pickingpass=false;
    cgl.frameStore.renderOffscreen=false;
}

this.doRender=function()
{
    if(self.enabled.get())
    {
    
        renderPickingPass();
    
        cgl.gl.readPixels(self.x.get(), cgl.canvas.height-self.y.get(), 1,1,  cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE ,pixelRGB);
        cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
    
        cgl.frameStore.pickedColor=pixelRGB[0];
        cgl.frameStore.pickingpassNum=0;
        self.trigger.trigger();
    
        if(self.showPass.get())
        {
            cgl.frameStore.pickingpassNum=0;
            cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
            renderPickingPass();
        }
        
    }
    else
    {
        self.trigger.trigger();
    }

};

this.render.onTriggered=this.doRender;
