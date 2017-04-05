
// look at this: https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/fbo_multisample.html


var CGL=CGL || {};

CGL.Framebuffer2=function(cgl,w,h,options)
{
    this._cgl=cgl;

    this._width = 0;
    this._height = 0;

    this._colorRenderbuffer=null;
    this._depthRenderbuffer=null;
    this._frameBuffer=null;
    this._colorBuffer=null;

    this._options=options ||
        {
            "isFloatingPointTexture":false
        };

    if(!this._options.hasOwnProperty("multisampling"))this._options.multisampling=true;


    this._texture=new CGL.Texture(cgl,
        {
            "isFloatingPointTexture":this._options.isFloatingPointTexture,
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
    this._cgl.gl.deleteRenderbuffer(this._colorRenderbuffer);
    this._cgl.gl.deleteRenderbuffer(this._depthRenderbuffer);
    this._cgl.gl.deleteFramebuffer(this._frameBuffer);
    this._cgl.gl.deleteFramebuffer(this._colorBuffer);
};


CGL.Framebuffer2.prototype.setSize=function(w,h)
{
    this._width=Math.floor(w);
    this._height=Math.floor(h);

    CGL.profileFrameBuffercreate++;


    if(this._frameBuffer)
    {
        this._cgl.gl.deleteRenderbuffer(this._colorRenderbuffer);
        this._cgl.gl.deleteRenderbuffer(this._depthRenderbuffer);
        this._cgl.gl.deleteFramebuffer(this._frameBuffer);
        this._cgl.gl.deleteFramebuffer(this._colorBuffer);

    }




    this._frameBuffer=this._cgl.gl.createFramebuffer();
    this._colorBuffer=this._cgl.gl.createFramebuffer();

    this._texture.setSize(this._width,this._height);
    this._textureDepth.setSize(this._width,this._height);


    this._colorRenderbuffer = this._cgl.gl.createRenderbuffer();
    this._depthRenderbuffer = this._cgl.gl.createRenderbuffer();

//color renderbuffer
var ext = this._cgl.gl.getExtension('EXT_color_buffer_float');

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);

    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._colorRenderbuffer);

    if(this._options.isFloatingPointTexture) this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.RGBA32F, this._width, this._height);
        else if(this._options.multisampling) this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, 4, this._cgl.gl.RGBA8, this._width, this._height);
            else this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.RGBA8, this._width, this._height);

    this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.RENDERBUFFER, this._colorRenderbuffer);


    //depth renderbuffer

    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);
    if(this._options.isFloatingPointTexture) this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.DEPTH_COMPONENT32F, this._width, this._height);
        else if(this._options.multisampling) this._cgl.gl.renderbufferStorageMultisample(this._cgl.gl.RENDERBUFFER, 4,this._cgl.gl.DEPTH_COMPONENT32F, this._width,this._height);
            else this._cgl.gl.renderbufferStorage(this._cgl.gl.RENDERBUFFER,this._cgl.gl.DEPTH_COMPONENT16, this._width, this._height);


    this._cgl.gl.framebufferRenderbuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.DEPTH_ATTACHMENT, this._cgl.gl.RENDERBUFFER, this._depthRenderbuffer);

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._colorBuffer);
    this._cgl.gl.framebufferTexture2D(this._cgl.gl.FRAMEBUFFER, this._cgl.gl.COLOR_ATTACHMENT0, this._cgl.gl.TEXTURE_2D, this._texture.tex, 0);

    this._cgl.gl.framebufferTexture2D(
        this._cgl.gl.FRAMEBUFFER,
        this._cgl.gl.DEPTH_ATTACHMENT,
        this._cgl.gl.TEXTURE_2D,
        this._textureDepth.tex,
        0 );









    if (!this._cgl.gl.isFramebuffer(this._colorBuffer)) throw("Invalid framebuffer");
    var status = this._cgl.gl.checkFramebufferStatus(this._cgl.gl.FRAMEBUFFER);
    switch (status)
    {
        case this._cgl.gl.FRAMEBUFFER_COMPLETE:
            break;
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            console.log('FRAMEBUFFER_INCOMPLETE_ATTACHMENT...');
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            console.log('FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT');
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
        case this._cgl.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            console.log('FRAMEBUFFER_INCOMPLETE_DIMENSIONS');
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
        case this._cgl.gl.FRAMEBUFFER_UNSUPPORTED:
            console.log('FRAMEBUFFER_UNSUPPORTED');
            throw new Error("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
        default:
            console.log('incomplete framebuffer',status);
            throw new Error("Incomplete framebuffer: " + status);
            // throw("Incomplete framebuffer: " + status);
    }
    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, null);
    this._cgl.gl.bindRenderbuffer(this._cgl.gl.RENDERBUFFER, null);


};


CGL.Framebuffer2.prototype.renderStart=function()
{
    this._cgl.pushMvMatrix();

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._frameBuffer);

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
        this._cgl.gl.COLOR_BUFFER_BIT | this._cgl.gl.DEPTH_BUFFER_BIT, this._cgl.gl.NEAREST
    );


    // this._cgl.gl.blitFramebuffer(
    //     0, 0, this._width, this._height,
    //     0, 0, this._width, this._height,
    //     this._cgl.gl.DEPTH_BUFFER_BIT, this._cgl.gl.NEAREST
    // );

    // Pass 2

    this._cgl.gl.bindFramebuffer(this._cgl.gl.FRAMEBUFFER, this._cgl.popFrameBuffer() );


    this._cgl.popMvMatrix();
    this._cgl.resetViewPort();
};
