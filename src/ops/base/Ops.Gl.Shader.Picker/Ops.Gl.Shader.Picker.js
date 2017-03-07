
var cgl=op.patch.cgl;

op.name='Picker';
op.render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

op.x=op.addInPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
op.y=op.addInPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
op.enabled=op.addInPort(new Port(op,"enabled",OP_PORT_TYPE_VALUE,{display:'bool'}));
op.enabled.set(true);

op.showPass=op.addInPort(new Port(op,"show picking pass",OP_PORT_TYPE_VALUE,{display:'bool'}));
op.showPass.set(false);

op.trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));



var pixelRGB = new Uint8Array(4);
var fb=null;
if(cgl.glVersion==1) fb=new CGL.Framebuffer(cgl,4,4);
    else 
    {
        console.log("new framebuffer...");
        fb=new CGL.Framebuffer2(cgl,4,4,{multisampling:false});
    }



// var tex=op.addOutPort(new Port(op,"pick texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
var tex=op.outTexture("pick texture");
tex.set( fb.getTextureColor() );
 
function renderPickingPass()
{
    cgl.frameStore.renderOffscreen=true;
    cgl.frameStore.pickingpass=true;
    cgl.frameStore.pickingpassNum=0;
    op.trigger.trigger();
    cgl.frameStore.pickingpass=false;
    cgl.frameStore.renderOffscreen=false;
}


var doRender=function()
{
    if(op.enabled.get())
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

            var x=Math.floor(op.x.get()/minimizeFB);
            var y=Math.floor( vpH-op.y.get()/minimizeFB);
            if(x<0)x=0;
            if(y<0)y=0;
            
            // console.log('',x,y,vpW,vpH);
            cgl.gl.readPixels(x,y, 1,1,  cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE ,pixelRGB);
            // cgl.gl.readPixels(op.x.get(), op.y.get(), 1,1,  cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE ,pixelRGB);

            fb.renderEnd();
            cgl.popMvMatrix();
            //   console.log(cgl.getViewPort()[2],cgl.getViewPort()[3],op.x.get(), op.y.get(),pixelRGB[0]);

            // cgl.gl.enable(cgl.gl.SCISSOR_TEST);
        }

        // cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
    
        cgl.frameStore.pickedColor=pixelRGB[0];
        // console.log(cgl.frameStore.pickedColor);
        cgl.frameStore.pickingpassNum=0;
        op.trigger.trigger();
    
        // if(op.showPass.get())
        // {
        //     cgl.frameStore.pickingpassNum=2;
        //     cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
        //     renderPickingPass();
        // }
      

    }
    else
    {
        op.trigger.trigger();
    }

};

function preview()
{
    render();
    tex.val.preview();
}

tex.onPreviewChanged=function()
{
    if(tex.showPreview) op.render.onTriggered=doRender;
    else op.render.onTriggered=doRender;
};


op.render.onTriggered=doRender;
