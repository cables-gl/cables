var CGL = CGL || {};

CGL.State = function() {
    var self = this;
    var mvMatrixStack = [];
    var vMatrixStack = [];
    var pMatrixStack = [];
    var shaderStack = [];
    var frameBufferStack = [null];
    var viewPort = [0, 0, 0, 0];
    this.glVersion = 0;

    this.temporaryTexture = null;
    this.frameStore = {};
    this.gl = null;
    this.pMatrix = mat4.create();
    this.mvMatrix = mat4.create(); // this is only modelmatrix not modelviewmatrix!!
    this.vMatrix = mat4.create();
    this.canvas = null;
    this.pixelDensity=1;
    mat4.identity(self.mvMatrix);
    mat4.identity(self.vMatrix);

    var simpleShader = new CGL.Shader(this, "simpleshader");
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

    this.setCanvas = function(id) {
        CGL.TextureEffectMesh = CGL.TextureEffectMesh || null;
        this.canvas = document.getElementById(id);

        if (!this.patch.config.canvas) this.patch.config.canvas = {};

        if (!this.patch.config.canvas.hasOwnProperty('preserveDrawingBuffer')) this.patch.config.canvas.preserveDrawingBuffer = this.patch.config.canvas.preserveDrawingBuffer;
        if (!this.patch.config.canvas.hasOwnProperty('premultipliedAlpha')) this.patch.config.canvas.premultipliedAlpha = this.patch.config.canvas.premultipliedAlpha;
        if (!this.patch.config.canvas.hasOwnProperty('alpha')) this.patch.config.canvas.alpha = this.patch.config.canvas.alpha;
        if (!this.patch.config.canvas.hasOwnProperty('antialias')) this.patch.config.canvas.antialias = this.patch.config.canvas.antialias;

        this.gl = this.canvas.getContext('webgl2');
        if (this.gl) {
            this.glVersion = 2;
        } else {
            this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            this.glVersion = 1;
        }


        if (!this.gl) {
            if (this.patch.config.onError) this.patch.config.onError('NO_WEBGL', 'sorry, could not initialize WebGL. Please check if your Browser supports WebGL.');
            this.aborted = true;
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

        // console.log('this.canvas.clientWidth',this.canvas.clientWidth);cd
        // console.log('this.canvas.width',this.canvas.width);
        // console.log('this.canvasWidth',this.canvasWidth);
        // console.log('-----------');
    };

    this.canvasWidth = -1;
    this.canvasHeight = -1;
    var oldCanvasWidth = -1;
    var oldCanvasHeight = -1;

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
            gui.preview.render();
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

        this.canvas.toBlob(
            function(blob) {
                if (cb) cb(blob);
                else console.log("no screenshot callback...");
            }.bind(this));
    }

    this.endFrame = function() {

        if(CABLES.UI && CABLES.UI.renderHelper)
        {
            CABLES.GL_MARKER.drawMarkerLayer(this);
        }

        self.setPreviousShader();
        if (vMatrixStack.length > 0) console.warn('view matrix stack length !=0 at end of rendering...');
        if (mvMatrixStack.length > 0) console.warn('mvmatrix stack length !=0 at end of rendering...');
        if (pMatrixStack.length > 0) console.warn('pmatrix stack length !=0 at end of rendering...');
        if (shaderStack.length > 0) console.warn('shaderStack length !=0 at end of rendering...');

        if (this._stackDepthTest.length > 0) console.warn('depthtest stack length !=0 at end of rendering...');
        if (this._stackDepthWrite.length > 0) console.warn('depthwrite stack length !=0 at end of rendering...');
        if (this._stackDepthFunc.length > 0) console.warn('depthfunc stack length !=0 at end of rendering...');

        mvMatrixStack.length = 0;
        vMatrixStack.length = 0;
        pMatrixStack.length = 0;
        shaderStack.length = 0;

        if (oldCanvasWidth != self.canvasWidth || oldCanvasHeight != self.canvasHeight) {
            
            oldCanvasWidth = self.canvasWidth;
            oldCanvasHeight = self.canvasHeight;
            this.setSize(self.canvasWidth,self.canvasHeight);
            this.updateSize();
            
            for (var i = 0; i < cbResize.length; i++) cbResize[i]();
        }
    };

    // shader stack
    this.getShader = function() {
        if (currentShader)
            if (!this.frameStore || (true === this.frameStore.renderOffscreen == currentShader.offScreenPass === true))
                return currentShader;

        for (var i = shaderStack.length - 1; i >= 0; i--)
            if (shaderStack[i])
                if (this.frameStore.renderOffscreen == shaderStack[i].offScreenPass)
                    return shaderStack[i];

        // console.log('no shader found?');
    };

    this.getDefaultShader = function() {
        return simpleShader;
    };

    this.setShader = function(shader) {
        shaderStack.push(shader);
        currentShader = shader;
    };

    this.setPreviousShader = function() {
        if (shaderStack.length === 0) throw "Invalid shader stack pop!";
        shaderStack.pop();
        currentShader = shaderStack[shaderStack.length - 1];
    };

    this.pushFrameBuffer = function(fb) {
        frameBufferStack.push(fb);
    };

    this.popFrameBuffer = function() {
        if (frameBufferStack.length == 1) return null;
        frameBufferStack.pop();
        return frameBufferStack[frameBufferStack.length - 1];
    };

    // view matrix stack

    this.pushViewMatrix = function() {
        var copy = mat4.clone(self.vMatrix);
        // var copy = mat4.create();
        // mat4.copy(copy,self.mvMatrix);
        vMatrixStack.push(copy);
    };

    this.popViewMatrix = function() {
        if (vMatrixStack.length === 0) throw "Invalid view popMatrix!";
        self.vMatrix = vMatrixStack.pop();
    };

    // model matrix stack

    this.pushMvMatrix = function() {
        var copy = mat4.clone(self.mvMatrix);
        mvMatrixStack.push(copy);
    };

    this.popMvMatrix = function() {
        if (mvMatrixStack.length === 0) throw "Invalid modelview popMatrix!";
        self.mvMatrix = mvMatrixStack.pop();
    };
    this.popModelMatrix = this.popMvMatrix;
    this.pushModelMatrix = this.pushMvMatrix;
    this.modelMatrix = function() {
        return self.mvMatrix;
    };

    // projection matrix stack

    this.pushPMatrix = function() {
        var copy = mat4.create();
        mat4.copy(copy, self.pMatrix);
        pMatrixStack.push(copy);
    };

    this.popPMatrix = function() {
        if (pMatrixStack.length === 0) throw "Invalid projection popMatrix!";
        self.pMatrix = pMatrixStack.pop();
    };

    var identView = vec3.create();
    vec3.set(identView, 0, 0, 02);
    var ident = vec3.create();
    vec3.set(ident, 0, 0, 0);

    this.renderStart = function(cgl, identTranslate, identTranslateView) {
        if (!identTranslate) identTranslate = ident;
        if (!identTranslateView) identTranslateView = identView;
        // cgl.gl.enable(cgl.gl.DEPTH_TEST);
        this.pushDepthTest(true);
        this.pushDepthWrite(true);
        this.pushDepthFunc(cgl.gl.LEQUAL);

        cgl.gl.clearColor(0, 0, 0, 0);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

        // cgl.setViewPort(0, 0, cgl.canvas.clientWidth*this.pixelDensity, cgl.canvas.clientHeight*this.pixelDensity);
        cgl.setViewPort(0, 0, cgl.canvasWidth, cgl.canvasHeight);

        mat4.perspective(cgl.pMatrix, 45, cgl.canvasWidth / cgl.canvasHeight, 0.1, 1000.0);

        cgl.pushPMatrix();
        cgl.pushMvMatrix();
        cgl.pushViewMatrix();

        mat4.identity(cgl.mvMatrix);
        mat4.identity(cgl.vMatrix);
        mat4.translate(cgl.mvMatrix, cgl.mvMatrix, identTranslate);
        // mat4.translate(cgl.mvMatrix,cgl.mvMatrix, identTranslate);
        mat4.translate(cgl.vMatrix, cgl.vMatrix, identTranslateView);

        cgl.gl.enable(cgl.gl.BLEND);
        // cgl.gl.blendFunc(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA);
        cgl.gl.blendEquationSeparate( cgl.gl.FUNC_ADD, cgl.gl.FUNC_ADD );
        cgl.gl.blendFuncSeparate( cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA, cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA );

        cgl.beginFrame();
    };

    this.renderEnd = function(cgl, identTranslate) {
        cgl.popViewMatrix();
        cgl.popMvMatrix();
        cgl.popPMatrix();

        this.popDepthTest();
        this.popDepthWrite();
        this.popDepthFunc();

        cgl.endFrame();
    };

    this.setTexture = function(slot, t) {
        this.gl.activeTexture(this.gl.TEXTURE0 + slot);
        this.gl.bindTexture(this.gl.TEXTURE_2D, t);
    };

    this.fullScreen = function() {
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
        self.updateSize();
    };

    this.setAutoResizeToWindow = function(resize) {
        if (resize) {
            window.addEventListener('resize', this._resizeToWindowSize.bind(this));
            this._resizeToWindowSize();
        } else {
            window.removeEventListener('resize', this._resizeToWindowSize.bind(this));
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
        // console.log(pw,ph);
        this.patch.renderOneFrame();

        var w = $('#glcanvas').attr('width');
        var h = $('#glcanvas').attr('height');

        if (pw) {
            $('#glcanvas').attr('width', pw);
            w = pw;
        }
        if (ph) {
            $('#glcanvas').attr('height', ph);
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

        // var projectStr = this.patch.name;
        // projectStr = projectStr.split(' ').join('_');

        if (!filename) filename = 'cables_'+ dateStr + '.png';
        else filename += '.png';

        this.patch.cgl.doScreenshotClearAlpha = $('#render_removeAlpha').is(':checked');

        // console.log('this.patch.cgl.doScreenshotClearAlpha ',this.patch.cgl.doScreenshotClearAlpha);
        // this.patch.cgl.doScreenshot = true;

        // this.patch.cgl.screenShot = function(blob) {
        this.patch.cgl.screenShot(function(blob)
        {
            $('#glcanvas').attr('width', w);
            $('#glcanvas').attr('height', h);
            this.onScreenShot = null;
            if(blob)
            {
                var anchor = document.createElement('a');

                anchor.setAttribute('download', filename);
                anchor.setAttribute('href', URL.createObjectURL(blob));
                document.body.appendChild(anchor);
    
                anchor.click();
                if (cb) cb(blob);
            }
            else
            {
                console.log("screenshot: no blob");
            }


        }.bind(this),true);
    };
};


// state depthtest

CGL.State.prototype._stackDepthTest=[];
CGL.State.prototype.pushDepthTest=function(b)
{
    this._stackDepthTest.push(b);
    if(!b) this.gl.disable(this.gl.DEPTH_TEST);
        else this.gl.enable(this.gl.DEPTH_TEST);
};

CGL.State.prototype.stateDepthTest=function()
{
    return this._stackDepthTest[this._stackDepthTest.length-1];
}

CGL.State.prototype.popDepthTest=function()
{
    this._stackDepthTest.pop();

    if(!this._stackDepthTest[this._stackDepthTest.length-1])  this.gl.disable(this.gl.DEPTH_TEST);
        else this.gl.enable(this.gl.DEPTH_TEST);
};

// state depthwrite

CGL.State.prototype._stackDepthWrite=[];
CGL.State.prototype.pushDepthWrite=function(b)
{
    this._stackDepthWrite.push(b);
    this.gl.depthMask(b);
};

CGL.State.prototype.stateDepthWrite=function()
{
    return this._stackDepthWrite[this._stackDepthWrite.length-1];
}

CGL.State.prototype.popDepthWrite=function()
{
    this._stackDepthWrite.pop();
    this.gl.depthMask(this._stackDepthWrite[this._stackDepthWrite.length-1]);
};


// state depthfunc

CGL.State.prototype._stackDepthFunc=[];
CGL.State.prototype.pushDepthFunc=function(f)
{
    this._stackDepthFunc.push(f);
    this.gl.depthFunc(f);
};

CGL.State.prototype.stateDepthFunc=function()
{
    if(this._stackDepthFunc.length>0) return this._stackDepthFunc[this._stackDepthFunc.length-1];
    return false;
}

CGL.State.prototype.popDepthFunc=function()
{
    this._stackDepthFunc.pop();
    if(this._stackDepthFunc.length>0) this.gl.depthFunc(this._stackDepthFunc[this._stackDepthFunc.length-1]);
};


