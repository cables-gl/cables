var CGL=CGL || {};

CGL.Framebuffer=function(_cgl,w,h,options)
{
    var cgl=_cgl;

    var depthTextureExt = cgl.gl.getExtension('WEBGL_depth_texture') || cgl.gl.getExtension( "WEBKIT_WEBGL_depth_texture" ) || cgl.gl.getExtension( "MOZ_WEBGL_depth_texture" );
    if(!depthTextureExt) console.error("no depth texture support");

    var width = w || 512;
    var height = h || 512;

    options=options ||
        {
            isFloatingPointTexture:false
        };

    var texture=new CGL.Texture(cgl,{isFloatingPointTexture:options.isFloatingPointTexture,filter:CGL.Texture.FILTER_LINEAR});
    var textureDepth=new CGL.Texture(cgl,{"isDepthTexture":true});

    var frameBuf = cgl.gl.createFramebuffer();
    var depthBuffer = cgl.gl.createRenderbuffer();

    this.getWidth=function(){ return width; };
    this.getHeight=function(){ return height; };

    this.getTextureColor=function()
    {
        return texture;
    };

    this.getTextureDepth=function()
    {
        return textureDepth;
    };

    this.setFilter=function(f)
    {
        texture.filter=f;
        texture.setSize(width,height);
    };

    this.setSize=function(w,h)
    {
        if(w<2)w=2;
        if(h<2)h=2;

        width=w;
        height=h;


        CGL.profileFrameBuffercreate++;

        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
        cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, depthBuffer);

        texture.setSize(width,height);
        textureDepth.setSize(width,height);


        if(depthTextureExt) cgl.gl.renderbufferStorage(cgl.gl.RENDERBUFFER, cgl.gl.DEPTH_COMPONENT16, width,height);

        cgl.gl.framebufferTexture2D(cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0, cgl.gl.TEXTURE_2D, texture.tex, 0);

        if(depthTextureExt)
        {
            cgl.gl.framebufferRenderbuffer(cgl.gl.FRAMEBUFFER, cgl.gl.DEPTH_ATTACHMENT, cgl.gl.RENDERBUFFER, depthBuffer);

            cgl.gl.framebufferTexture2D(
                cgl.gl.FRAMEBUFFER,
                cgl.gl.DEPTH_ATTACHMENT,
                cgl.gl.TEXTURE_2D,
                textureDepth.tex,
                0 );
        }


        if (!cgl.gl.isFramebuffer(frameBuf)) {
            throw("Invalid framebuffer");
        }
        var status = cgl.gl.checkFramebufferStatus(cgl.gl.FRAMEBUFFER);
        switch (status)
        {
            case cgl.gl.FRAMEBUFFER_COMPLETE:
                break;
            case cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                console.log('FRAMEBUFFER_INCOMPLETE_ATTACHMENT...',width,height,texture.tex,depthBuffer);
                throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            case cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                console.log('FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT');
                throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            case cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                console.log('FRAMEBUFFER_INCOMPLETE_DIMENSIONS');
                throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            case cgl.gl.FRAMEBUFFER_UNSUPPORTED:
                console.log('FRAMEBUFFER_UNSUPPORTED');
                throw new Error("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            default:
                console.log('incomplete framebuffer',status);
                throw new Error("Incomplete framebuffer: " + status);
                // throw("Incomplete framebuffer: " + status);
        }

        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
        cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, null);
        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);
    };

    this.renderStart=function()
    {
        cgl.pushMvMatrix();
        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
        cgl.pushFrameBuffer(frameBuf);

        cgl.pushPMatrix();
        cgl.gl.viewport(0, 0, width,height );

        cgl.gl.clearColor(0,0,0,0);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    };

    this.renderEnd=function()
    {
        cgl.popPMatrix();
        cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, cgl.popFrameBuffer() );

        cgl.popMvMatrix();
        cgl.resetViewPort();
    };

    this.delete=function()
    {
        texture.delete();
        textureDepth.delete();
        cgl.gl.deleteRenderbuffer(depthBuffer);
        cgl.gl.deleteFramebuffer(frameBuf);
    };

    this.setSize(width,height);
};
