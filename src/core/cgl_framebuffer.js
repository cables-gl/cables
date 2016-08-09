var CGL=CGL || {};


CGL.frameBufferStack=[];
CGL.frameBufferStack.push(null);

CGL.Framebuffer=function(_cgl,w,h)
{
    var cgl=_cgl;

    var depthTextureExt = cgl.gl.getExtension('WEBGL_depth_texture') || cgl.gl.getExtension( "WEBKIT_WEBGL_depth_texture" ) || cgl.gl.getExtension( "MOZ_WEBGL_depth_texture" );
    if(!depthTextureExt) console.error('depth buffer ext problem');

    var width = w || 512;
    var height = h || 512;

    var texture=new CGL.Texture(cgl,{filter:CGL.Texture.FILTER_LINEAR});
    var textureDepth=new CGL.Texture(cgl,{isDepthTexture:true});

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
    width=w;
    height=h;


    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
    cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, depthBuffer);

    texture.setSize(width,height);
    textureDepth.setSize(width,height);

    cgl.gl.renderbufferStorage(cgl.gl.RENDERBUFFER, cgl.gl.DEPTH_COMPONENT16, width,height);

    cgl.gl.framebufferTexture2D(cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0, cgl.gl.TEXTURE_2D, texture.tex, 0);
    cgl.gl.framebufferRenderbuffer(cgl.gl.FRAMEBUFFER, cgl.gl.DEPTH_ATTACHMENT, cgl.gl.RENDERBUFFER, depthBuffer);

    cgl.gl.framebufferTexture2D(
        cgl.gl.FRAMEBUFFER,
        cgl.gl.DEPTH_ATTACHMENT,
        cgl.gl.TEXTURE_2D,
        textureDepth.tex,
        0 );

    if (!cgl.gl.isFramebuffer(frameBuf)) {
        throw("Invalid framebuffer");
    }
    var status = cgl.gl.checkFramebufferStatus(cgl.gl.FRAMEBUFFER);
    switch (status) {
        case cgl.gl.FRAMEBUFFER_COMPLETE:
            break;
        case cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        case cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        case cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        case cgl.gl.FRAMEBUFFER_UNSUPPORTED:
            throw("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
        default:
            throw("Incomplete framebuffer: " + status);
    }

    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
    cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, null);
    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);

};

this.renderStart=function()
{
    cgl.pushMvMatrix();
    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
    CGL.frameBufferStack.push(frameBuf);

// console.log('framebuff START ',CGL.frameBufferStack[CGL.frameBufferStack.length-1]);

    cgl.pushPMatrix();
    cgl.gl.viewport(0, 0, width,height );

    cgl.gl.clearColor(0,0,0,0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

};

this.renderEnd=function()
{
    cgl.popPMatrix();

    CGL.frameBufferStack.pop();
    cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, CGL.frameBufferStack[CGL.frameBufferStack.length-1]);
    // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);

    cgl.popMvMatrix();
    cgl.resetViewPort();

};

this.setSize(width,height);

};
