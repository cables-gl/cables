var self=this;
var cgl=self.patch.cgl;

op.name='Picker';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
this.y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
this.enabled=this.addInPort(new Port(this,"enabled",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.enabled.set(true);

this.showPass=this.addInPort(new Port(this,"show picking pass",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.showPass.set(false);

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));



var pixelRGB = new Uint8Array(4);
var fb=null;
if(cgl.glVersion==1) fb=new CGL.Framebuffer(cgl,4,4);
    else 
    {
        console.log("new framebuffer...");
        fb=new CGL.Framebuffer2(cgl,4,4,{multisampling:false});
    }



// var tex=this.addOutPort(new Port(this,"pick texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
var tex=op.outTexture("pick texture");
tex.set( fb.getTextureColor() );
 
function renderPickingPass()
{
    cgl.frameStore.renderOffscreen=true;
    cgl.frameStore.pickingpass=true;
    cgl.frameStore.pickingpassNum=0;
    self.trigger.trigger();
    cgl.frameStore.pickingpass=false;
    cgl.frameStore.renderOffscreen=false;
}


var doRender=function()
{
    if(self.enabled.get())
    {
        {
            var minimizeFB=8;
            cgl.resetViewPort();

            var vpW=Math.floor(cgl.canvas.width/minimizeFB);
            var vpH=Math.floor(cgl.canvas.height/minimizeFB);
            if(vpW!=fb.getWidth() || vpH!=fb.getHeight() )
            {
                fb.setSize( vpW,vpH );
            }

            cgl.pushMvMatrix();
            fb.renderStart();
            cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);

            renderPickingPass();

            var x=Math.floor(self.x.get()/minimizeFB);
            var y=Math.floor( vpH-self.y.get()/minimizeFB);
            if(x<0)x=0;
            if(y<0)y=0;
            
            // console.log('',x,y,vpW,vpH);
            cgl.gl.readPixels(x,y, 1,1,  cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE ,pixelRGB);
            // cgl.gl.readPixels(self.x.get(), self.y.get(), 1,1,  cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE ,pixelRGB);

            fb.renderEnd();
            cgl.popMvMatrix();
            //   console.log(cgl.getViewPort()[2],cgl.getViewPort()[3],self.x.get(), self.y.get(),pixelRGB[0]);

            // cgl.gl.enable(cgl.gl.SCISSOR_TEST);
        }

        // cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
    
        cgl.frameStore.pickedColor=pixelRGB[0];
        // console.log(cgl.frameStore.pickedColor);
        cgl.frameStore.pickingpassNum=0;
        self.trigger.trigger();
    
        // if(self.showPass.get())
        // {
        //     cgl.frameStore.pickingpassNum=2;
        //     cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
        //     renderPickingPass();
        // }
      

    }
    else
    {
        self.trigger.trigger();
    }

};

    function preview()
    {
        render();
        tex.val.preview();
    }

    tex.onPreviewChanged=function()
    {
        if(tex.showPreview) self.render.onTriggered=doRender;
        else self.render.onTriggered=doRender;
    };


this.render.onTriggered=doRender;
