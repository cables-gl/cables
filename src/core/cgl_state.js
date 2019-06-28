var CGL = CGL || {};

/**
 * @external CGL
 * @namespace Context
 * @class
 */
CGL.Context = function(_patch) {
    var self = this;
    var viewPort = [0, 0, 0, 0];
    this.glVersion = 0;
    this.clearCanvasTransparent=true;
    this.clearCanvasDepth=true;
    this.patch = _patch;

    this.temporaryTexture = null;
    this.frameStore = {};
    this.gl = null;
    this.pMatrix = mat4.create();
    this.mMatrix = mat4.create();
    this.vMatrix = mat4.create();
    this._textureslots=[];

    this._pMatrixStack=new CGL.MatrixStack();
    this._mMatrixStack=new CGL.MatrixStack();
    this._vMatrixStack=new CGL.MatrixStack();
    this._glFrameBufferStack = [];
    this._frameBufferStack=[];
    this._shaderStack = [];

    Object.defineProperty(this, 'mvMatrix', { get: function() { return this.mMatrix; }, set: function(m) { this.mMatrix=m; } }); // todo: deprecated

    this.canvas = null;
    this.pixelDensity=1;
    mat4.identity(this.mMatrix);
    mat4.identity(this.vMatrix);

    var simpleShader = new CGL.Shader(this, "simpleshader");
    
    simpleShader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
    simpleShader.setSource(CGL.Shader.getDefaultVertexShader(), CGL.Shader.getDefaultFragmentShader());

    var currentShader = simpleShader;
    var aborted = false;
    var cbResize = [];

    this.addEventListener = function(event, cb) {
        if (event == 'resize') cbResize.push(cb);
    };

    this.removeEventListener = function(event, cb) {
        if (event == 'resize') {
            for (var i in cbResize)
                if (cbResize[i] == cb) {
                    cbResize.splice(i, 1);
                    return;
                }
        }
    };

    this.exitError=function(msgId,msg)
    {
        this.patch.exitError(msgId,msg);
        this.aborted = true;
    }

    this.setCanvas = function(canv) {

        CGL.TextureEffectMesh = CGL.TextureEffectMesh || null;

        if (typeof canv === 'string') this.canvas = document.getElementById(canv);
            else this.canvas=canv;

        if (!this.patch.config.canvas) this.patch.config.canvas = {};

        if (!this.patch.config.canvas.hasOwnProperty('preserveDrawingBuffer')) this.patch.config.canvas.preserveDrawingBuffer = false;
        if (!this.patch.config.canvas.hasOwnProperty('premultipliedAlpha')) this.patch.config.canvas.premultipliedAlpha = false;
        if (!this.patch.config.canvas.hasOwnProperty('alpha')) this.patch.config.canvas.alpha = false;
        
        if (this.patch.config.hasOwnProperty('clearCanvasColor')) this.clearCanvasTransparent = this.patch.config.clearCanvasColor;
        if (this.patch.config.hasOwnProperty('clearCanvasDepth')) this.clearCanvasDepth = this.patch.config.clearCanvasDepth;


        if( (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) && !this.patch.config.canvas.hasOwnProperty('powerPreference')) this.patch.config.canvas.powerPreference = "high-performance";

        // if (!this.patch.config.canvas.hasOwnProperty('antialias')) this.patch.config.canvas.antialias = false;
        this.gl = this.canvas.getContext('webgl2',this.patch.config.canvas);
        if (this.gl) {
            this.glVersion = 2;
        } else {
            this.gl = this.canvas.getContext('webgl',this.patch.config.canvas) || this.canvas.getContext('experimental-webgl',this.patch.config.canvas);
            this.glVersion = 1;
        }

        if (!this.gl) {
            this.exitError('NO_WEBGL', 'sorry, could not initialize WebGL. Please check if your Browser supports WebGL.');
            return;
        } else {
            var derivativeExt = this.gl.getExtension("GL_OES_standard_derivatives");
            var instancingExt = this.gl.getExtension("ANGLE_instanced_arrays") || this.gl;

            if (instancingExt.vertexAttribDivisorANGLE) {
                this.gl.vertexAttribDivisor = instancingExt.vertexAttribDivisorANGLE.bind(instancingExt);
                this.gl.drawElementsInstanced = instancingExt.drawElementsInstancedANGLE.bind(instancingExt);
            }
            self.updateSize();
        }
    };

    this.updateSize=function()
    {
        this.canvas.width = this.canvasWidth = this.canvas.clientWidth*this.pixelDensity;
        this.canvas.height = this.canvasHeight = this.canvas.clientHeight*this.pixelDensity;
    };

    this.canvasWidth = -1;
    this.canvasHeight = -1;
    this.canvasScale = 1;
    var oldCanvasWidth = -1;
    var oldCanvasHeight = -1;

    /**
     * @function getViewPort
     * @memberof Context
     * @instance
     * @description get current gl viewport
     * @returns {Array} array [x,y,w,h]
     */
    this.getViewPort = function() {
        return viewPort;
    };

    this.resetViewPort = function() {
        this.gl.viewport(
            viewPort[0],
            viewPort[1],
            viewPort[2],
            viewPort[3]);
    };

    /**
     * @function setViewPort
     * @memberof Context
     * @instance
     * @description set current gl viewport
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */
    this.setViewPort = function(x, y, w, h) {
        viewPort[0] = Math.round(x);
        viewPort[1] = Math.round(y);
        viewPort[2] = Math.round(w);
        viewPort[3] = Math.round(h);
        this.gl.viewport(
            viewPort[0],
            viewPort[1],
            viewPort[2],
            viewPort[3]);
    };

    this.beginFrame = function() {

        if (CABLES.UI) {
            gui._texturePreviewer.render();
            if (CABLES.UI.patchPreviewer) CABLES.UI.patchPreviewer.render();
        }

        self.setShader(simpleShader);
    };

    this.screenShot=function(cb,doScreenshotClearAlpha)
    {
        if(doScreenshotClearAlpha) {
            this.gl.clearColor(1, 1, 1, 1);
            this.gl.colorMask(false, false, false, true);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.colorMask(true, true, true, true);
        }

        if(this.canvas && this.canvas.toBlob)
            this.canvas.toBlob(
                function(blob) {
                    if (cb) cb(blob);
                    else console.log("no screenshot callback...");
                }.bind(this));
    }

    this.endFrame = function() {

        if(CABLES.UI)
            CABLES.GL_MARKER.drawMarkerLayer(this);

        self.setPreviousShader();
        if (this._vMatrixStack.length() > 0) console.warn('view matrix stack length !=0 at end of rendering...');
        if (this._mMatrixStack.length() > 0) console.warn('mvmatrix stack length !=0 at end of rendering...');
        if (this._pMatrixStack.length() > 0) console.warn('pmatrix stack length !=0 at end of rendering...');
        if (this._glFrameBufferStack.length > 0) console.warn('glFrameBuffer stack length !=0 at end of rendering...');
        if (this._stackDepthTest.length > 0) console.warn('depthtest stack length !=0 at end of rendering...');
        if (this._stackDepthWrite.length > 0) console.warn('depthwrite stack length !=0 at end of rendering...');
        if (this._stackDepthFunc.length > 0) console.warn('depthfunc stack length !=0 at end of rendering...');
        if (this._stackBlend.length > 0) console.warn('blend stack length !=0 at end of rendering...');
        if (this._stackBlendMode.length > 0) console.warn('blendMode stack length !=0 at end of rendering...');
        if (this._shaderStack.length > 0) console.warn('this._shaderStack length !=0 at end of rendering...');

        if (oldCanvasWidth != self.canvasWidth || oldCanvasHeight != self.canvasHeight) {
            oldCanvasWidth = self.canvasWidth;
            oldCanvasHeight = self.canvasHeight;
            this.setSize(self.canvasWidth/this.pixelDensity,self.canvasHeight/this.pixelDensity);
            this.updateSize();
            
            for (var i = 0; i < cbResize.length; i++) cbResize[i]();
        }
    };

    // shader stack
    this.getShader = function() {
        if (currentShader)
            if (!this.frameStore || (true === this.frameStore.renderOffscreen == currentShader.offScreenPass === true))
                return currentShader;

        for (var i = this._shaderStack.length - 1; i >= 0; i--)
            if (this._shaderStack[i])
                if (this.frameStore.renderOffscreen == this._shaderStack[i].offScreenPass)
                    return this._shaderStack[i];
    };

    this.getDefaultShader = function() {
        return simpleShader;
    };

    this.setShader = function(shader) {
        this._shaderStack.push(shader);
        currentShader = shader;
    };

    this.setPreviousShader = function() {
        if (this._shaderStack.length === 0) throw "Invalid shader stack pop!";
        this._shaderStack.pop();
        currentShader = this._shaderStack[this._shaderStack.length - 1];
    };

    /**
     * push a framebuffer to the framebuffer stack
     * @function pushGlFrameBuffer
     * @memberof Context
     * @instance
     * @param {Object} framebuffer
     * @function
     */
    this.pushGlFrameBuffer = function(fb) {
        this._glFrameBufferStack.push(fb);
    };

    /**
     * pop framebuffer stack
     * @function popGlFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Object} current framebuffer or null
     */
    this.popGlFrameBuffer = function() {
        if (this._glFrameBufferStack.length == 0) return null;
        this._glFrameBufferStack.pop();
        return this._glFrameBufferStack[this._glFrameBufferStack.length - 1];
    };

    /**
     * get current framebuffer 
     * @function getCurrentFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Object} current framebuffer or null
     */
    this.getCurrentGlFrameBuffer=function()
    {
        if (this._glFrameBufferStack.length === 0) return null;
        return this._glFrameBufferStack[this._glFrameBufferStack.length - 1];
    }

    /**
     * push a framebuffer to the framebuffer stack
     * @function pushGlFrameBuffer
     * @memberof Context
     * @instance
     * @param {CGL.FrameBuffer} framebuffer
     */
    this.pushFrameBuffer = function(fb) {
        this._frameBufferStack.push(fb);
    };

    /**
     * pop framebuffer stack
     * @function popFrameBuffer
     * @memberof Context
     * @instance
     * @returns {CGL.FrameBuffer} current framebuffer or null
     */
    this.popFrameBuffer = function() {
        if (this._frameBufferStack.length == 0) return null;
        this._frameBufferStack.pop();
        return this._frameBufferStack[this._frameBufferStack.length - 1];
    };

    /**
     * get current framebuffer 
     * @function getCurrentFrameBuffer
     * @memberof Context
     * @instance
     * @returns {CGL.FrameBuffer} current framebuffer or null
     */
    this.getCurrentFrameBuffer=function()
    {
        if (this._frameBufferStack.length === 0) return null;
        return this._frameBufferStack[this._frameBufferStack.length - 1];
    }

    var identView = vec3.create();
    vec3.set(identView, 0, 0, 2);
    var ident = vec3.create();
    vec3.set(ident, 0, 0, 0);

    this.renderStart = function(cgl, identTranslate, identTranslateView) {
        if (!identTranslate) identTranslate = ident;
        if (!identTranslateView) identTranslateView = identView;

        this.pushDepthTest(true);
        this.pushDepthWrite(true);
        this.pushDepthFunc(cgl.gl.LEQUAL);
        
        if(this.clearCanvasTransparent)
        {
            cgl.gl.clearColor(0,0,0,0);
            cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
        }
        if(this.clearCanvasDepth) cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

        cgl.setViewPort(0, 0, cgl.canvasWidth, cgl.canvasHeight);

        mat4.perspective(cgl.pMatrix, 45, cgl.canvasWidth / cgl.canvasHeight, 0.1, 1000.0);
        mat4.identity(cgl.mMatrix);
        mat4.identity(cgl.vMatrix);
        mat4.translate(cgl.mMatrix, cgl.mMatrix, identTranslate);
        mat4.translate(cgl.vMatrix, cgl.vMatrix, identTranslateView);

        cgl.pushPMatrix();
        cgl.pushModelMatrix();
        cgl.pushViewMatrix();

        cgl.pushBlendMode(CGL.BLEND_NORMAL,false);

        for(var i=0;i<this._textureslots.length;i++)
            this._textureslots[i]=null;

        cgl.beginFrame();
    };

    this.renderEnd = function(cgl, identTranslate) {
        cgl.popViewMatrix();
        cgl.popModelMatrix();
        cgl.popPMatrix();

        this.popDepthTest();
        this.popDepthWrite();
        this.popDepthFunc();
        this.popBlend();
        this.popBlendMode();

        cgl.endFrame();
    };

    this.getTexture= function(slot)
    {
        return this._textureslots[slot];
    }

    this.setTexture = function(slot, t, type)
    {
        if(this._textureslots[slot]!=t)
        {
            this.gl.activeTexture(this.gl.TEXTURE0 + slot);
            this.gl.bindTexture(type||this.gl.TEXTURE_2D, t);
            this._textureslots[slot]=t;
        }
    };

    this.fullScreen = function()
    {
        if (this.canvas.requestFullscreen) this.canvas.requestFullscreen();
            else if (this.canvas.mozRequestFullScreen) this.canvas.mozRequestFullScreen();
            else if (this.canvas.webkitRequestFullscreen) this.canvas.webkitRequestFullscreen();
            else if (this.canvas.msRequestFullscreen) this.canvas.msRequestFullscreen();
    };

    this.setSize=function(w,h)
    {
        this.canvas.style.width = w+"px";
        this.canvas.style.height = h+"px";

        this.canvas.width = w*this.pixelDensity;
        this.canvas.height = h*this.pixelDensity;

        this.updateSize();
    }

    this._resizeToWindowSize = function() {
        this.setSize(window.innerWidth,window.innerHeight);
        this.updateSize();
    };

    this._resizeToParentSize = function() {
        var p=this.canvas.parentElement;
        if(!p)
        {
            console.error("cables: can not resize to container element");
            return;
        }
        this.setSize(p.clientWidth,p.clientHeight);
        console.log("_resizeToParentSize",p.clientWidth,p.clientHeight);

        this.updateSize();
    };

    this.setAutoResize = function(parent) {
        
        window.removeEventListener('resize', this._resizeToWindowSize.bind(this));
        window.removeEventListener('resize', this._resizeToParentSize.bind(this));

        if(parent=='window')
        {
            window.addEventListener('resize', this._resizeToWindowSize.bind(this));
            window.addEventListener('orientationchange', this._resizeToWindowSize.bind(this));
            this._resizeToWindowSize();
        }
        if(parent=='parent')
        {
            window.addEventListener('resize', this._resizeToParentSize.bind(this));
            this._resizeToParentSize();
        }
    };

    this.printError = function(str) {
        var error = this.gl.getError();
        if (error != this.gl.NO_ERROR) {
            var errStr = '';
            if (error == this.gl.OUT_OF_MEMORY) errStr = "OUT_OF_MEMORY";
            if (error == this.gl.INVALID_ENUM) errStr = "INVALID_ENUM";
            if (error == this.gl.INVALID_OPERATION) errStr = "INVALID_OPERATION";
            if (error == this.gl.INVALID_FRAMEBUFFER_OPERATION) errStr = "INVALID_FRAMEBUFFER_OPERATION";
            if (error == this.gl.INVALID_VALUE) errStr = "INVALID_VALUE";
            if (error == this.gl.CONTEXT_LOST_WEBGL) errStr = "CONTEXT_LOST_WEBGL";
            if (error == this.gl.NO_ERROR) errStr = "NO_ERROR";

            console.log("gl error: ", str, error, errStr);
        }
    };


    this.saveScreenshot = function(filename, cb, pw, ph) {
        this.patch.renderOneFrame();

        var w = this.canvas.clientWidth;
        var h = this.canvas.clientHeight;

        if (pw) {
            this.canvas.width=pw;
            w = pw;
        }
        if (ph) {
            this.canvas.height=ph;
            h = ph;
        }

        function padLeft(nr, n, str) {
            return Array(n - String(nr).length + 1).join(str || '0') + nr;
        }

        var d = new Date();

        var dateStr = String(d.getFullYear()) +
            String(d.getMonth() + 1) +
            String(d.getDate()) + '_' +
            padLeft(d.getHours(), 2) +
            padLeft(d.getMinutes(), 2) +
            padLeft(d.getSeconds(), 2);

        if (!filename) filename = 'cables_'+ dateStr + '.png';
        else filename += '.png';

        this.patch.cgl.screenShot(function(blob)
        {
            this.canvas.width=w;
            this.canvas.height=h;
            if(blob)
            {
                var anchor = document.createElement('a');

                anchor.download=filename;



                anchor.href=URL.createObjectURL(blob);
                document.body.appendChild(anchor);
    
                anchor.click();
                if(cb) cb(blob);
                anchor.remove(); 
            }
            else
            {
                console.log("screenshot: no blob");
            }

        }.bind(this),true);
    };
};


/**
 * push a matrix to the view matrix stack
 * @function pushviewMatrix
 * @memberof Context
 * @instance
 * @param {mat4} viewmatrix
 */
CGL.Context.prototype.pushViewMatrix = function() {
    this.vMatrix=this._vMatrixStack.push(this.vMatrix);
};

/**
 * pop view matrix stack
 * @function popViewMatrix
 * @memberof Context
 * @instance
 * @returns {mat4} current viewmatrix 
 * @function
 */
CGL.Context.prototype.popViewMatrix = function() {
    this.vMatrix = this._vMatrixStack.pop();
};

CGL.Context.prototype.getViewMatrixStateCount = function() {
    return this._vMatrixStack.stateCounter;
};


/**
 * push a matrix to the projection matrix stack
 * @function pushPMatrix
 * @memberof Context
 * @instance
 * @param {mat4} projectionmatrix
 */
CGL.Context.prototype.pushPMatrix = function() {
    this.pMatrix=this._pMatrixStack.push(this.pMatrix);
};

/**
 * pop projection matrix stack
 * @function popPMatrix
 * @memberof Context
 * @instance
 * @returns {mat4} current projectionmatrix 
 */
CGL.Context.prototype.popPMatrix = function() {
    this.pMatrix = this._pMatrixStack.pop();
    return this.pMatrix;
};

CGL.Context.prototype.getProjectionMatrixStateCount = function() {
    return this._pMatrixStack.stateCounter;
};

/**
 * push a matrix to the model matrix stack
 * @function pushModelMatrix
 * @memberof Context
 * @instance
 * @param {mat4} modelmatrix
 */
CGL.Context.prototype.pushMvMatrix = // deprecated
CGL.Context.prototype.pushModelMatrix = function()
{
    // var copy = mat4.clone(this.mMatrix);
    this.mMatrix=this._mMatrixStack.push(this.mMatrix);
};

/**
 * pop model matrix stack
 * @function popModelMatrix
 * @memberof Context
 * @instance
 * @returns {mat4} current modelmatrix 
 */
CGL.Context.prototype.popMvMatrix = // todo: DEPRECATE
CGL.Context.prototype.popmMatrix =
CGL.Context.prototype.popModelMatrix = function() {
    // if (this._mMatrixStack.length === 0) throw "Invalid modelview popMatrix!";
    this.mMatrix = this._mMatrixStack.pop();
    return this.mMatrix;
};

/**
 * get model matrix 
 * @function modelMatrix
 * @memberof Context
 * @instance
 * @returns {mat4} current modelmatrix 
 */
CGL.Context.prototype.modelMatrix = function() {
    return this.mMatrix;
};


// state depthtest

CGL.Context.prototype._stackDepthTest=[];
CGL.Context.prototype.pushDepthTest=function(b)
{
    this._stackDepthTest.push(b);
    if(!b) this.gl.disable(this.gl.DEPTH_TEST);
        else this.gl.enable(this.gl.DEPTH_TEST);
};

CGL.Context.prototype.stateDepthTest=function()
{
    return this._stackDepthTest[this._stackDepthTest.length-1];
}

CGL.Context.prototype.popDepthTest=function()
{
    this._stackDepthTest.pop();

    if(!this._stackDepthTest[this._stackDepthTest.length-1])  this.gl.disable(this.gl.DEPTH_TEST);
        else this.gl.enable(this.gl.DEPTH_TEST);
};

// state depthwrite

CGL.Context.prototype._stackDepthWrite=[];
CGL.Context.prototype.pushDepthWrite=function(b)
{
    this._stackDepthWrite.push(b);
    this.gl.depthMask(b);
};

CGL.Context.prototype.stateDepthWrite=function()
{
    return this._stackDepthWrite[this._stackDepthWrite.length-1];
}

CGL.Context.prototype.popDepthWrite=function()
{
    this._stackDepthWrite.pop();
    this.gl.depthMask(this._stackDepthWrite[this._stackDepthWrite.length-1]);
};


// state depthfunc

CGL.Context.prototype._stackDepthFunc=[];

/**
 * enable / disable depth testing 
 * like `gl.depthFunc(boolean);`
 * @function pushDepthFunc
 * @memberof Context
 * @instance
 * @param {Boolean} depthtesting
 */
CGL.Context.prototype.pushDepthFunc=function(f)
{
    this._stackDepthFunc.push(f);
    this.gl.depthFunc(f);
};

/**
 * current state of blend 
 * @function stateDepthFunc
 * @memberof Context
 * @instance 
 * @returns {Boolean} depth testing enabled/disabled
 */
CGL.Context.prototype.stateDepthFunc=function()
{
    if(this._stackDepthFunc.length>0) return this._stackDepthFunc[this._stackDepthFunc.length-1];
    return false;
}

/**
 * pop depth testing and set the previous state
 * @function popDepthFunc
 * @memberof Context
 * @instance
 */
CGL.Context.prototype.popDepthFunc=function()
{
    this._stackDepthFunc.pop();
    if(this._stackDepthFunc.length>0) this.gl.depthFunc(this._stackDepthFunc[this._stackDepthFunc.length-1]);
};



CGL.Context.prototype._stackBlend=[];


/**
 * enable / disable blend 
 * like gl.enable(gl.BLEND); / gl.disable(gl.BLEND);
 * @function pushBlend
 * @memberof Context
 * @instance
 * @param {Boolean} blending
 */
CGL.Context.prototype.pushBlend=function(b)
{
    this._stackBlend.push(b);
    if(!b) this.gl.disable(this.gl.BLEND);
        else this.gl.enable(this.gl.BLEND);
};

/**
 * current state of blend 
 * @function stateBlend
 * @returns {boolean} blending enabled/disabled
 * @memberof Context
 * @instance
 */
CGL.Context.prototype.stateBlend=function()
{
    return this._stackBlend[this._stackBlend.length-1];
}

/**
 * pop blend state and set the previous state
 * @function popBlend
 * @memberof Context
 * @instance
 */
CGL.Context.prototype.popBlend=function()
{
    this._stackBlend.pop();

    if(!this._stackBlend[this._stackBlend.length-1])  this.gl.disable(this.gl.BLEND);
        else this.gl.enable(this.gl.BLEND);
};


CGL.BLEND_NONE=0;
CGL.BLEND_NORMAL=1;
CGL.BLEND_ADD=2;
CGL.BLEND_SUB=3;
CGL.BLEND_MUL=4;

CGL.Context.prototype._stackBlendMode=[];
CGL.Context.prototype._stackBlendModePremul=[];

/**
 * push and switch to predefined blendmode (CGL.BLEND_NONE,CGL.BLEND_NORMAL,CGL.BLEND_ADD,CGL.BLEND_SUB,CGL.BLEND_MUL)
 * @function pushBlendMode
 * @memberof Context
 * @instance
 * @param {Number} blendmode
 * @param {Boolean} premultiplied mode
 */
CGL.Context.prototype.pushBlendMode=function(blendMode,premul)
{
    this._stackBlendMode.push(blendMode);
    this._stackBlendModePremul.push(premul);
    
    const n=this._stackBlendMode.length-1;

    this.pushBlend(this._stackBlendMode[n]!==CGL.BLEND_NONE);
    this._setBlendMode(this._stackBlendMode[n],this._stackBlendModePremul[n]);
}

/**
 * pop predefined blendmode / switch back to previous blendmode
 * @function pushBlendMode
 * @memberof Context
 * @instance
 */
CGL.Context.prototype.popBlendMode=function()
{
    this._stackBlendMode.pop();
    this._stackBlendModePremul.pop();

    const n=this._stackBlendMode.length-1;
    
    this.popBlend(this._stackBlendMode[n]!==CGL.BLEND_NONE);

    if(n>0)
        this._setBlendMode(this._stackBlendMode[n],this._stackBlendModePremul[n]);
}

CGL.Context.prototype.glGetAttribLocation=function(prog,name)
{
    const  l=this.gl.getAttribLocation(prog, name);
    if(l==-1)
    {
        // console.log("get attr loc -1 ",name);
        // debugger;
    }
    return l;
}



CGL.Context.prototype._setBlendMode=function(blendMode,premul)
{
    const gl=this.gl;

    if(blendMode==CGL.BLEND_NONE)
    {
        // this.gl.disable(this.gl.BLEND);
    }
    else
    if(blendMode==CGL.BLEND_ADD)
    {
        if(premul)
        {
			gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
			gl.blendFuncSeparate( gl.ONE, gl.ONE, gl.ONE, gl.ONE );
        }
        else
        {
			gl.blendEquation( gl.FUNC_ADD );
			gl.blendFunc( gl.SRC_ALPHA, gl.ONE );
        }
    }
    else if(blendMode==CGL.BLEND_SUB)
    {
        if(premul)
        {
			gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
			gl.blendFuncSeparate( gl.ZERO, gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA );
        }
        else
        {
			gl.blendEquation( gl.FUNC_ADD );
			gl.blendFunc( gl.ZERO, gl.ONE_MINUS_SRC_COLOR );
        }
    }
    else if(blendMode==CGL.BLEND_MUL)
    {
        if(premul)
        {
			gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
			gl.blendFuncSeparate( gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA );
        }
        else
        {
			gl.blendEquation( gl.FUNC_ADD );
			gl.blendFunc( gl.ZERO, gl.SRC_COLOR );
        }
    }
    else if(blendMode==CGL.BLEND_NORMAL)
    {
        if(premul)
        {
			gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
			gl.blendFuncSeparate( gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
        }
        else
        {
			gl.blendEquationSeparate( gl.FUNC_ADD, gl.FUNC_ADD );
			gl.blendFuncSeparate( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA );
        }
    }
    else
    {
        console.log("setblendmode: unknown blendmode");
    }


};

