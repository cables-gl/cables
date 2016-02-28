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




    this.width.set(512);
    this.height.set(512);
    this.useVPSize.set(true);

    var oldViewport;


    function render()
    {
        // cgl.pushMvMatrix();
        
        
        if(self.useVPSize.val)
        {
            self.width.set( cgl.getViewPort()[2] );
            self.height.set( cgl.getViewPort()[3] );
        }

        if(fb.getWidth()!=self.width.get() || fb.getHeight()!=self.height.get() )
        {
            console.log('r2t resize', self.width.get(),self.height.get() );    
            fb.setSize( self.width.get(),self.height.get() );
        }

        // cgl.gl.disable(cgl.gl.SCISSOR_TEST);
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
        // cgl.gl.enable(cgl.gl.SCISSOR_TEST);
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

    // this.useVPSize.onValueChanged=function()
    // {
    //     if(self.useVPSize.val)
    //     {
    //         self.width.onValueChanged=null;
    //         self.height.onValueChanged=null;
    //     }
    //     else
    //     {
    //         self.width.onValueChanged=resize;
    //         self.height.onValueChanged=resize;
    //     }
    //     resize();
    // };


tfilter.onValueChange(onFilterChange);
