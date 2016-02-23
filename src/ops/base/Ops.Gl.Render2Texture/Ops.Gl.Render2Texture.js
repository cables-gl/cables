    var self=this;
    var cgl=self.patch.cgl;


    this.name='render to texture';
    this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    this.useVPSize=this.addInPort(new Port(this,"use viewport size",OP_PORT_TYPE_VALUE,{ display:'bool' }));

    this.width=this.addInPort(new Port(this,"texture width"));
    this.height=this.addInPort(new Port(this,"texture height"));

    var tfilter=this.addInPort(new Port(this,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));


    this.tex=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
    this.texDepth=this.addOutPort(new Port(this,"textureDepth",OP_PORT_TYPE_TEXTURE));


    var fb=new CGL.Framebuffer(cgl);

    self.tex.set( fb.getTextureColor() );
    self.texDepth.set ( fb.getTextureDepth() );

    tfilter.set('linear');
    
    var onFilterChange=function()
    {
        if(tfilter.get()=='nearest') fb.setFilter(CGL.Texture.FILTER_NEAREST);
        else if(tfilter.get()=='linear')  fb.setFilter(CGL.Texture.FILTER_LINEAR);
        else if(tfilter.get()=='mipmap')  fb.setFilter(CGL.Texture.FILTER_MIPMAP);
    };


    function resize()
    {
        // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
        // cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, depthBuffer);
        //
        if(self.useVPSize.val)
        {
            self.width.set( cgl.getViewPort()[2] );
            self.height.set( cgl.getViewPort()[3] );
        }

        fb.setSize( self.width.get(),self.height.get() );
        //
        // texture.setSize(self.width.get(),self.height.get());
        // textureDepth.setSize(self.width.get(),self.height.get());
        //
        // // if(depthBuffer)cgl.gl.deleteRenderbuffer(depthBuffer);
        //
        // cgl.gl.renderbufferStorage(cgl.gl.RENDERBUFFER, cgl.gl.DEPTH_COMPONENT16, self.width.get(),self.height.get());
        //
        // cgl.gl.framebufferTexture2D(cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0, cgl.gl.TEXTURE_2D, texture.tex, 0);
        // cgl.gl.framebufferRenderbuffer(cgl.gl.FRAMEBUFFER, cgl.gl.DEPTH_ATTACHMENT, cgl.gl.RENDERBUFFER, depthBuffer);
        //
        // cgl.gl.framebufferTexture2D(
        //     cgl.gl.FRAMEBUFFER,
        //     cgl.gl.DEPTH_ATTACHMENT,
        //     cgl.gl.TEXTURE_2D,
        //     textureDepth.tex,
        //     0 );
        //
        // if (!cgl.gl.isFramebuffer(frameBuf)) {
        //     throw("Invalid framebuffer");
        // }
        // var status = cgl.gl.checkFramebufferStatus(cgl.gl.FRAMEBUFFER);
        // switch (status) {
        //     case cgl.gl.FRAMEBUFFER_COMPLETE:
        //         break;
        //     case cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
        //         throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        //     case cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
        //         throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        //     case cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
        //         throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        //     case cgl.gl.FRAMEBUFFER_UNSUPPORTED:
        //         throw("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
        //     default:
        //         throw("Incomplete framebuffer: " + status);
        // }
        //
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
        // cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, null);
        // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);

        // console.log('resize r2t',self.width.get(),self.height.get());

    }



    this.width.set(512);
    this.height.set(512);
    this.useVPSize.set(true);

    var oldViewport;

    this.onResize=resize;


    function render()
    {
        // cgl.pushMvMatrix();
        cgl.gl.disable(cgl.gl.SCISSOR_TEST);
        //
        // if(self.useVPSize.get())
        // {
        //     if(texture.width!=cgl.getViewPort()[2] || texture.height!=cgl.getViewPort()[3] )
        //     {
        //         console.log('not the same ? ',texture.width, cgl.getViewPort()[2] , texture.height , cgl.getViewPort()[3]);
        //
        //         for(var i=0;i<self.patch.ops.length;i++)
        //         {
        //             if(self.patch.ops[i].onResize)self.patch.ops[i].onResize();
        //         }
        //     }
        // }
        //
        // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
        //
        // cgl.pushPMatrix();
        // cgl.gl.viewport(0, 0, self.width.get() ,self.height.get() );
        //
        // cgl.gl.clearColor(0,0,0,0);
        // cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
        //
        // self.trigger.trigger();
        //
        // cgl.popPMatrix();
        //
        // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);
        //
        // cgl.popMvMatrix();

        fb.renderStart(cgl);
        self.trigger.trigger();
        fb.renderEnd(cgl);

        cgl.resetViewPort();
        cgl.gl.enable(cgl.gl.SCISSOR_TEST);
    }

    function preview()
    {
        render();
        self.tex.val.preview();
    }

    this.tex.onPreviewChanged=function()
    {
        if(self.tex.showPreview) self.render.onTriggered=preview;
        else self.render.onTriggered=render;
    };

    self.render.onTriggered=render;

    this.useVPSize.onValueChanged=function()
    {
        if(self.useVPSize.val)
        {
            self.width.onValueChanged=null;
            self.height.onValueChanged=null;
        }
        else
        {
            self.width.onValueChanged=resize;
            self.height.onValueChanged=resize;
        }
        resize();
    };


tfilter.onValueChange(onFilterChange);
