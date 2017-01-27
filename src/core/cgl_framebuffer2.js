
// look at this: https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/fbo_multisample.html


var CGL=CGL || {};

CGL.Framebuffer2=function(cgl,w,h,options)
{
    this._cgl=cgl;

    this._width = 0;
    this._height = 0;

    this._options=options ||
        {
            "isFloatingPointTexture":false
        };

    this._texture=new CGL.Texture(cgl,
        {
            "isFloatingPointTexture":options.isFloatingPointTexture,
            "filter":CGL.Texture.FILTER_LINEAR
        });

    this._textureDepth=new CGL.Texture(cgl,
        {
            "isDepthTexture":true
        });





    this.setSize(w||512 ,h||512);
};




CGL.Framebuffer2.prototype.getWidth=function(){ return this._width; };
CGL.Framebuffer2.prototype.getHeight=function(){ return this._height; };

CGL.Framebuffer2.prototype.getTextureColor=function()
{
    return this._texture;
};

CGL.Framebuffer2.prototype.getTextureDepth=function()
{
    return this._textureDepth;
};

CGL.Framebuffer2.prototype.setFilter=function(f)
{
    this._texture.filter=f;
    this._texture.setSize(this._width,this._height);
};

CGL.Framebuffer2.prototype.delete=function()
{
    this._texture.delete();
    this._textureDepth.delete();
    // cgl.gl.deleteRenderbuffer(depthBuffer);
    // cgl.gl.deleteFramebuffer(frameBuf);
};


CGL.Framebuffer2.prototype.setSize=function(w,h)
{
    this._width=w;
    this._height=h;

    CGL.profileFrameBuffercreate++;


    // var FRAMEBUFFER = {
    //     RENDERBUFFER: 0,
    //     COLORBUFFER: 1
    // };
    // var framebuffers = [
    //     gl.createFramebuffer(),
    //     gl.createFramebuffer()
    // ];

    this._frameBuffer=this._cgl.gl.createFramebuffer();
    this._colorBuffer=this._cgl.gl.createFramebuffer();

    this._texture.setSize(this._width,this._height);
    this._textureDepth.setSize(this._width,this._height);


    this._colorRenderbuffer = this._cgl.gl.createRenderbuffer();
    this._depthRenderbuffer = this._cgl.gl.createRenderbuffer();

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);

    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._colorRenderbuffer);
    this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, 4, this._cgl.gl.RGBA8, this._width, this._height);
    this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.RENDERBUFFER, this._colorRenderbuffer);

    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);
    this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, 4,this._cgl.gl.DEPTH_COMPONENT16, this._width,this._height);
    this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);


    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._colorBuffer);
    this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._texture.tex, 0);


    this._cgl.gl.framebufferTexture2D(
        this._cgl.gl.FRAMEBUFFER,
        this._cgl.gl.DEPTH_ATTACHMENT,
        this._cgl.gl.TEXTURE_2D,
        this._textureDepth.tex,
        0 );






    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);




    // if(w<2)w=2;
    // if(h<2)h=2;
    //
    // width=w;
    // height=h;
    //
    // CGL.profileFrameBuffercreate++;
    //
    // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, frameBuf);
    //
    // //webgl2
    // if(cgl.glVersion>=2) cgl.gl.renderbufferStorageMultisample(cgl.gl.RENDERBUFFER, 4, cgl.gl.RGBA8, width,height);
    //
    // cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, depthBuffer);
    //
    // texture.setSize(width,height);
    // textureDepth.setSize(width,height);
    //
    // if(depthTextureExt) cgl.gl.renderbufferStorage(cgl.gl.RENDERBUFFER, cgl.gl.DEPTH_COMPONENT16, width,height);
    //
    // cgl.gl.framebufferTexture2D(cgl.gl.FRAMEBUFFER, cgl.gl.COLOR_ATTACHMENT0, cgl.gl.TEXTURE_2D, texture.tex, 0);
    //
    // if(depthTextureExt)
    // {
    //     cgl.gl.framebufferRenderbuffer(cgl.gl.FRAMEBUFFER, cgl.gl.DEPTH_ATTACHMENT, cgl.gl.RENDERBUFFER, depthBuffer);
    //     cgl.gl.framebufferTexture2D(
    //         cgl.gl.FRAMEBUFFER,
    //         cgl.gl.DEPTH_ATTACHMENT,
    //         cgl.gl.TEXTURE_2D,
    //         textureDepth.tex,
    //         0 );
    // }
    //
    // if (!cgl.gl.isFramebuffer(frameBuf)) throw("Invalid framebuffer");
    // var status = cgl.gl.checkFramebufferStatus(cgl.gl.FRAMEBUFFER);
    // switch (status)
    // {
    //     case cgl.gl.FRAMEBUFFER_COMPLETE:
    //         break;
    //     case cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
    //         console.log('FRAMEBUFFER_INCOMPLETE_ATTACHMENT...',width,height,texture.tex,depthBuffer);
    //         throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    //     case cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
    //         console.log('FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT');
    //         throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
    //     case cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
    //         console.log('FRAMEBUFFER_INCOMPLETE_DIMENSIONS');
    //         throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
    //     case cgl.gl.FRAMEBUFFER_UNSUPPORTED:
    //         console.log('FRAMEBUFFER_UNSUPPORTED');
    //         throw new Error("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
    //     default:
    //         console.log('incomplete framebuffer',status);
    //         throw new Error("Incomplete framebuffer: " + status);
    //         // throw("Incomplete framebuffer: " + status);
    // }
    //
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
    // cgl.gl.bindRenderbuffer(cgl.gl.RENDERBUFFER, null);
    // cgl.gl.bindFramebuffer(cgl.gl.FRAMEBUFFER, null);
};


CGL.Framebuffer2.prototype.renderStart=function()
{
    this._cgl.pushMvMatrix();

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);
    // this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthBuffer);


    this._cgl.pushFrameBuffer(this._frameBuffer);

    this._cgl.pushPMatrix();
    this._cgl.gl.viewport(0, 0, this._width,this._height );

    this._cgl.gl.clearColor(0,0,0,0);
    this._cgl.gl.clear(this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT);
};

CGL.Framebuffer2.prototype.renderEnd=function()
{
    this._cgl.popPMatrix();

    // Blit framebuffers, no Multisample texture 2d in WebGL 2
    this._cgl.gl.bindFramebuffer(this._cgl.gl.READ_FRAMEBUFFER, this._frameBuffer);
    this._cgl.gl.bindFramebuffer(this._cgl.gl.DRAW_FRAMEBUFFER, this._colorBuffer);
    this._cgl.gl.clearBufferfv(this._cgl.gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
    this._cgl.gl.blitFramebuffer(
        0, 0, this._width, this._height,
        0, 0, this._width, this._height,
        this._cgl.gl.COLOR_BUFFER_BIT, this._cgl.gl.NEAREST
    );


    this._cgl.gl.blitFramebuffer(
        0, 0, this._width, this._height,
        0, 0, this._width, this._height,
        this._cgl.gl.DEPTH_BUFFER_BIT, this._cgl.gl.NEAREST
    );

    // Pass 2

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popFrameBuffer() );


    this._cgl.popMvMatrix();
    this._cgl.resetViewPort();
};
