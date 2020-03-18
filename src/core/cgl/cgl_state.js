// import { vec3, mat4 } from "gl-matrix";
import { CONSTANTS } from "./constants";
import { Shader } from "./cgl_shader";
import { MatrixStack } from "./cgl_matrixstack";
import { Log } from "../log";


/**
 * cables gl context/state manager
 * @external CGL
 * @namespace Context
 * @class
 * @hideconstructor
 */
const Context = function (_patch)
{
    var self = this;
    var viewPort = [0, 0, 0, 0];
    this.glVersion = 0;
    this.glUseHalfFloatTex = false;
    this.clearCanvasTransparent = true;
    this.clearCanvasDepth = true;
    this.patch = _patch;
    this.debugOneFrame=false;

    this.maxTextureUnits=0;
    this.currentProgram=null;

    this.temporaryTexture = null;
    this.frameStore = {};
    this.gl = null;

    /**
     * Current projection matrix
     * @memberof Context
     * @instance
     * @type {mat4}
     */
    this.pMatrix = mat4.create();
    /**
     * Current model matrix
     * @memberof Context
     * @instance
     * @type {mat4}
     */
    this.mMatrix = mat4.create();
    /**
     * Current view matrix
     * @memberof Context
     * @instance
     * @type {mat4}
     */
    this.vMatrix = mat4.create();
    this._textureslots = [];

    this._pMatrixStack = new MatrixStack();
    this._mMatrixStack = new MatrixStack();
    this._vMatrixStack = new MatrixStack();
    this._glFrameBufferStack = [];
    this._frameBufferStack = [];
    this._shaderStack = [];

    Object.defineProperty(this, "mvMatrix", {
        get()
        {
            return this.mMatrix;
        },
        set(m)
        {
            this.mMatrix = m;
        },
    }); // todo: deprecated

    this.canvas = null;
    this.pixelDensity = 1;
    mat4.identity(this.mMatrix);
    mat4.identity(this.vMatrix);

    var simpleShader = new Shader(this, "simpleshader");

    simpleShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
    simpleShader.setSource(Shader.getDefaultVertexShader(), Shader.getDefaultFragmentShader());

    var currentShader = simpleShader;
    var aborted = false;
    var cbResize = [];

    this.addEventListener = function (event, cb)
    {
        if (event == "resize") cbResize.push(cb);
    };

    this.removeEventListener = function (event, cb)
    {
        if (event == "resize")
        {
            for (var i in cbResize)
            {
                if (cbResize[i] == cb)
                {
                    cbResize.splice(i, 1);
                    return;
                }
            }
        }
    };

    this.exitError = function (msgId, msg)
    {
        this.patch.exitError(msgId, msg);
        this.aborted = true;
    };

    this.setCanvas = function (canv)
    {
        if (typeof canv === "string") this.canvas = document.getElementById(canv);
        else this.canvas = canv;

        if (!this.patch.config.canvas) this.patch.config.canvas = {};

        if (!this.patch.config.canvas.hasOwnProperty("preserveDrawingBuffer")) this.patch.config.canvas.preserveDrawingBuffer = false;
        if (!this.patch.config.canvas.hasOwnProperty("premultipliedAlpha")) this.patch.config.canvas.premultipliedAlpha = false;
        if (!this.patch.config.canvas.hasOwnProperty("alpha")) this.patch.config.canvas.alpha = false;

        if (this.patch.config.hasOwnProperty("clearCanvasColor")) this.clearCanvasTransparent = this.patch.config.clearCanvasColor;
        if (this.patch.config.hasOwnProperty("clearCanvasDepth")) this.clearCanvasDepth = this.patch.config.clearCanvasDepth;

        if(!this.patch.config.canvas.forceWebGl1)
            this.gl = this.canvas.getContext("webgl2", this.patch.config.canvas);

        if (this.gl && this.gl.getParameter(this.gl.VERSION)!="WebGL 1.0")
        {
            this.glVersion = 2;
        }
        else
        {
            this.gl = this.canvas.getContext("webgl", this.patch.config.canvas) || this.canvas.getContext("experimental-webgl", this.patch.config.canvas);
            this.glVersion = 1;

            // safari
            if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent))
            {
                this.glUseHalfFloatTex = true;
            }

            // ios
            if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
            {
                if (!this.patch.config.canvas.hasOwnProperty("powerPreference")) this.patch.config.canvas.powerPreference = "high-performance";
            }
        }

        if (!this.gl)
        {
            this.exitError("NO_WEBGL", "sorry, could not initialize WebGL. Please check if your Browser supports WebGL.");
            return;
        }
        this.gl.getExtension("OES_standard_derivatives");
        // this.gl.getExtension("GL_OES_standard_derivatives");
        var instancingExt = this.gl.getExtension("ANGLE_instanced_arrays") || this.gl;
        
        this.maxTextureUnits=this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS);
        this.maxTexSize=this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);

        if (instancingExt.vertexAttribDivisorANGLE)
        {
            this.gl.vertexAttribDivisor = instancingExt.vertexAttribDivisorANGLE.bind(instancingExt);
            this.gl.drawElementsInstanced = instancingExt.drawElementsInstancedANGLE.bind(instancingExt);
        }
        self.updateSize();
    };

    this.updateSize = function ()
    {
        this.canvas.width = this.canvasWidth = this.canvas.clientWidth * this.pixelDensity;
        this.canvas.height = this.canvasHeight = this.canvas.clientHeight * this.pixelDensity;
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
    this.getViewPort = function ()
    {
        return viewPort;
    };

    this.resetViewPort = function ()
    {
        this.gl.viewport(viewPort[0], viewPort[1], viewPort[2], viewPort[3]);
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
    this.setViewPort = function (x, y, w, h)
    {
        viewPort[0] = Math.round(x);
        viewPort[1] = Math.round(y);
        viewPort[2] = Math.round(w);
        viewPort[3] = Math.round(h);
        this.gl.viewport(viewPort[0], viewPort[1], viewPort[2], viewPort[3]);
    };

    this.beginFrame = function ()
    {
        if(this.patch.isEditorMode())
        {
            gui.metaTexturePreviewer.render();
            if (CABLES.UI.patchPreviewer) CABLES.UI.patchPreviewer.render();
        }

        this.pushShader(simpleShader);
    };

    this.screenShot = function (cb, doScreenshotClearAlpha,mimeType, quality)
    {
        if (doScreenshotClearAlpha)
        {
            this.gl.clearColor(1, 1, 1, 1);
            this.gl.colorMask(false, false, false, true);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.colorMask(true, true, true, true);
        }

        if (this.canvas && this.canvas.toBlob)
        {
            this.canvas.toBlob((blob) =>
            {
                if (cb) cb(blob);
                else Log.log("no screenshot callback...");
            },mimeType,quality);
        }
    };

    this.endFrame = function ()
    {
        if(this.patch.isEditorMode()) CABLES.GL_MARKER.drawMarkerLayer(this);

        this.setPreviousShader();
        if (this._vMatrixStack.length() > 0) Log.warn("view matrix stack length !=0 at end of rendering...");
        if (this._mMatrixStack.length() > 0) Log.warn("mvmatrix stack length !=0 at end of rendering...");
        if (this._pMatrixStack.length() > 0) Log.warn("pmatrix stack length !=0 at end of rendering...");
        if (this._glFrameBufferStack.length > 0) Log.warn("glFrameBuffer stack length !=0 at end of rendering...");
        if (this._stackDepthTest.length > 0) Log.warn("depthtest stack length !=0 at end of rendering...");
        if (this._stackDepthWrite.length > 0) Log.warn("depthwrite stack length !=0 at end of rendering...");
        if (this._stackDepthFunc.length > 0) Log.warn("depthfunc stack length !=0 at end of rendering...");
        if (this._stackBlend.length > 0) Log.warn("blend stack length !=0 at end of rendering...");
        if (this._stackBlendMode.length > 0) Log.warn("blendMode stack length !=0 at end of rendering...");
        if (this._shaderStack.length > 0) Log.warn("this._shaderStack length !=0 at end of rendering...");
        if (this._stackCullFace.length > 0) Log.warn("this._stackCullFace length !=0 at end of rendering...");
        if (this._stackCullFaceFacing.length > 0) Log.warn("this._stackCullFaceFacing length !=0 at end of rendering...");

        if (oldCanvasWidth != self.canvasWidth || oldCanvasHeight != self.canvasHeight)
        {
            oldCanvasWidth = self.canvasWidth;
            oldCanvasHeight = self.canvasHeight;
            this.setSize(self.canvasWidth / this.pixelDensity, self.canvasHeight / this.pixelDensity);
            this.updateSize();

            for (var i = 0; i < cbResize.length; i++) cbResize[i]();
        }
    };

    // shader stack
    this.getShader = function ()
    {
        if (currentShader) if (!this.frameStore || ((this.frameStore.renderOffscreen === true) == currentShader.offScreenPass) === true) return currentShader;

        for (var i = this._shaderStack.length - 1; i >= 0; i--) if (this._shaderStack[i]) if (this.frameStore.renderOffscreen == this._shaderStack[i].offScreenPass) return this._shaderStack[i];
    };

    this.getDefaultShader = function ()
    {
        return simpleShader;
    };

    /**
     * push a shader to the shader stack
     * @function pushShader
     * @memberof Context
     * @instance
     * @param {Object} shader
     * @function
     */
    this.pushShader=
    this.setShader = function (shader)
    {
        this._shaderStack.push(shader);
        currentShader = shader;
    };

    /**
     * pop current used shader from shader stack
     * @function popShader
     * @memberof Context
     * @instance
     * @function
     */
    this.popShader=
    this.setPreviousShader = function ()
    {
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
    this.pushGlFrameBuffer = function (fb)
    {
        this._glFrameBufferStack.push(fb);
    };

    /**
     * pop framebuffer stack
     * @function popGlFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Object} current framebuffer or null
     */
    this.popGlFrameBuffer = function ()
    {
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
    this.getCurrentGlFrameBuffer = function ()
    {
        if (this._glFrameBufferStack.length === 0) return null;
        return this._glFrameBufferStack[this._glFrameBufferStack.length - 1];
    };

    /**
     * push a framebuffer to the framebuffer stack
     * @function pushGlFrameBuffer
     * @memberof Context
     * @instance
     * @param {Framebuffer} framebuffer
     */
    this.pushFrameBuffer = function (fb)
    {
        this._frameBufferStack.push(fb);
    };

    /**
     * pop framebuffer stack
     * @function popFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Framebuffer} current framebuffer or null
     */
    this.popFrameBuffer = function ()
    {
        if (this._frameBufferStack.length == 0) return null;
        this._frameBufferStack.pop();
        return this._frameBufferStack[this._frameBufferStack.length - 1];
    };

    /**
     * get current framebuffer
     * @function getCurrentFrameBuffer
     * @memberof Context
     * @instance
     * @returns {Framebuffer} current framebuffer or null
     */
    this.getCurrentFrameBuffer = function ()
    {
        if (this._frameBufferStack.length === 0) return null;
        return this._frameBufferStack[this._frameBufferStack.length - 1];
    };

    var identView = vec3.create();
    vec3.set(identView, 0, 0, 2);
    var ident = vec3.create();
    vec3.set(ident, 0, 0, 0);

    this.renderStart = function (cgl, identTranslate, identTranslateView)
    {
        if (!identTranslate) identTranslate = ident;
        if (!identTranslateView) identTranslateView = identView;

        this.pushDepthTest(true);
        this.pushDepthWrite(true);
        this.pushDepthFunc(cgl.gl.LEQUAL);
        this.pushCullFaceFacing(cgl.gl.BACK);
        this.pushCullFace(false);

        if (this.clearCanvasTransparent)
        {
            cgl.gl.clearColor(0, 0, 0, 0);
            cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
        }
        if (this.clearCanvasDepth) cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT);

        cgl.setViewPort(0, 0, cgl.canvasWidth, cgl.canvasHeight);

        mat4.perspective(cgl.pMatrix, 45, cgl.canvasWidth / cgl.canvasHeight, 0.1, 1000.0);
        mat4.identity(cgl.mMatrix);
        mat4.identity(cgl.vMatrix);
        mat4.translate(cgl.mMatrix, cgl.mMatrix, identTranslate);
        mat4.translate(cgl.vMatrix, cgl.vMatrix, identTranslateView);

        cgl.pushPMatrix();
        cgl.pushModelMatrix();
        cgl.pushViewMatrix();

        cgl.pushBlendMode(CONSTANTS.BLEND_MODES.BLEND_NORMAL, false);

        for (var i = 0; i < this._textureslots.length; i++) this._textureslots[i] = null;

        cgl.beginFrame();
    };

    this.renderEnd = function (cgl, identTranslate)
    {
        cgl.popViewMatrix();
        cgl.popModelMatrix();
        cgl.popPMatrix();

        this.popDepthTest();
        this.popDepthWrite();
        this.popDepthFunc();
        this.popCullFaceFacing();
        this.popCullFace();
        this.popBlend();
        this.popBlendMode();

        cgl.endFrame();
    };

    this.getTexture = function (slot)
    {
        return this._textureslots[slot];
    };

    this.setTexture = function (slot, t, type)
    {
        if (this._textureslots[slot] != t)
        {
            this.gl.activeTexture(this.gl.TEXTURE0 + slot);
            this.gl.bindTexture(type || this.gl.TEXTURE_2D, t);
            this._textureslots[slot] = t;
        }
    };

    this.fullScreen = function ()
    {
        if (this.canvas.requestFullscreen) this.canvas.requestFullscreen();
        else if (this.canvas.mozRequestFullScreen) this.canvas.mozRequestFullScreen();
        else if (this.canvas.webkitRequestFullscreen) this.canvas.webkitRequestFullscreen();
        else if (this.canvas.msRequestFullscreen) this.canvas.msRequestFullscreen();
    };

    this.setSize = function (w, h)
    {
        this.canvas.style.width = w + "px";
        this.canvas.style.height = h + "px";

        this.canvas.width = w * this.pixelDensity;
        this.canvas.height = h * this.pixelDensity;

        this.updateSize();
    };

    this._resizeToWindowSize = function ()
    {
        this.setSize(window.innerWidth, window.innerHeight);
        this.updateSize();
    };

    this._resizeToParentSize = function ()
    {
        // Log.log("_resizeToParentSize");
        var p = this.canvas.parentElement;
        if (!p)
        {
            console.error("cables: can not resize to container element");
            return;
        }
        this.setSize(p.clientWidth, p.clientHeight);
        // Log.log("_resizeToParentSize", p.clientWidth, p.clientHeight);

        this.updateSize();
    };

    this.setAutoResize = function (parent)
    {
        window.removeEventListener("resize", this._resizeToWindowSize.bind(this));
        window.removeEventListener("resize", this._resizeToParentSize.bind(this));

        if (parent == "window")
        {
            window.addEventListener("resize", this._resizeToWindowSize.bind(this));
            window.addEventListener("orientationchange", this._resizeToWindowSize.bind(this));
            this._resizeToWindowSize();
        }
        if (parent == "parent")
        {
            window.addEventListener("resize", this._resizeToParentSize.bind(this));
            this._resizeToParentSize();
        }
    };

    this.printError = function (str)
    {
        var error = this.gl.getError();
        if (error != this.gl.NO_ERROR)
        {
            var errStr = "";
            if (error == this.gl.OUT_OF_MEMORY) errStr = "OUT_OF_MEMORY";
            if (error == this.gl.INVALID_ENUM) errStr = "INVALID_ENUM";
            if (error == this.gl.INVALID_OPERATION) errStr = "INVALID_OPERATION";
            if (error == this.gl.INVALID_FRAMEBUFFER_OPERATION) errStr = "INVALID_FRAMEBUFFER_OPERATION";
            if (error == this.gl.INVALID_VALUE) errStr = "INVALID_VALUE";
            if (error == this.gl.CONTEXT_LOST_WEBGL) errStr = "CONTEXT_LOST_WEBGL";
            if (error == this.gl.NO_ERROR) errStr = "NO_ERROR";

            Log.log("gl error: ", str, error, errStr);
        }
    };

    this.saveScreenshot = function (filename, cb, pw, ph,noclearalpha)
    {
        this.patch.renderOneFrame();

        var w = this.canvas.clientWidth;
        var h = this.canvas.clientHeight;

        if (pw)
        {
            this.canvas.width = pw;
            w = pw;
        }
        if (ph)
        {
            this.canvas.height = ph;
            h = ph;
        }

        function padLeft(nr, n, str)
        {
            return Array(n - String(nr).length + 1).join(str || "0") + nr;
        }

        var d = new Date();

        var dateStr = "".concat(String(d.getFullYear()) + String(d.getMonth() + 1) + String(d.getDate()), "_").concat(padLeft(d.getHours(), 2)).concat(padLeft(d.getMinutes(), 2)).concat(padLeft(d.getSeconds(), 2));

        if (!filename) filename = "cables_" + dateStr + ".png";
        else filename += ".png";

        this.patch.cgl.screenShot(function(blob)
        {
            this.canvas.width = w;
            this.canvas.height = h;
            if (blob)
            {
                var anchor = document.createElement("a");

                anchor.download = filename;
                anchor.href = URL.createObjectURL(blob);

                setTimeout(function()
                {
                    anchor.click();
                    if (cb) cb(blob);
                },100);

            }
            else
            {
                Log.log("screenshot: no blob");
            }
        }.bind(this), noclearalpha);
    };
};


/**
 * push a matrix to the view matrix stack
 * @function pushviewMatrix
 * @memberof Context
 * @instance
 * @param {mat4} viewmatrix
 */
Context.prototype.pushViewMatrix = function ()
{
    this.vMatrix = this._vMatrixStack.push(this.vMatrix);
};

/**
 * pop view matrix stack
 * @function popViewMatrix
 * @memberof Context
 * @instance
 * @returns {mat4} current viewmatrix
 * @function
 */
Context.prototype.popViewMatrix = function ()
{
    this.vMatrix = this._vMatrixStack.pop();
};

Context.prototype.getViewMatrixStateCount = function ()
{
    return this._vMatrixStack.stateCounter;
};

/**
 * push a matrix to the projection matrix stack
 * @function pushPMatrix
 * @memberof Context
 * @instance
 * @param {mat4} projectionmatrix
 */
Context.prototype.pushPMatrix = function ()
{
    this.pMatrix = this._pMatrixStack.push(this.pMatrix);
};

/**
 * pop projection matrix stack
 * @function popPMatrix
 * @memberof Context
 * @instance
 * @returns {mat4} current projectionmatrix
 */
Context.prototype.popPMatrix = function ()
{
    this.pMatrix = this._pMatrixStack.pop();
    return this.pMatrix;
};

Context.prototype.getProjectionMatrixStateCount = function ()
{
    return this._pMatrixStack.stateCounter;
};

/**
 * push a matrix to the model matrix stack
 * @function pushModelMatrix
 * @memberof Context
 * @instance
 * @param {mat4} modelmatrix
 * @example
 * // see source code of translate op:
 * cgl.pushModelMatrix();
 * mat4.translate(cgl.mMatrix,cgl.mMatrix, vec);
 * trigger.trigger();
 * cgl.popModelMatrix();
 */
Context.prototype.pushMvMatrix = Context.prototype.pushModelMatrix = function ()
{
    // deprecated
    // var copy = mat4.clone(this.mMatrix);
    this.mMatrix = this._mMatrixStack.push(this.mMatrix);
};

/**
 * pop model matrix stack
 * @function popModelMatrix
 * @memberof Context
 * @instance
 * @returns {mat4} current modelmatrix
 */
Context.prototype.popMvMatrix = Context.prototype.popmMatrix = Context.prototype.popModelMatrix = function ()
{
    // todo: DEPRECATE
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
Context.prototype.modelMatrix = function ()
{
    return this.mMatrix;
};

// state depthtest

/**
 * push depth testing enabled state
 * @function pushDepthTest
 * @param {Boolean} enabled
 * @memberof Context
 * @instance
 */
Context.prototype._stackDepthTest = [];
Context.prototype.pushDepthTest = function (b)
{
    this._stackDepthTest.push(b);
    if (!b) this.gl.disable(this.gl.DEPTH_TEST);
    else this.gl.enable(this.gl.DEPTH_TEST);
};
/**
 * current state of depth testing
 * @function stateCullFace
 * @returns {Boolean} enabled
 * @memberof Context
 * @instance
 */
Context.prototype.stateDepthTest = function ()
{
    return this._stackDepthTest[this._stackDepthTest.length - 1];
};

/**
 * pop depth testing state
 * @function popCullFace
 * @memberof Context
 * @instance
 */
Context.prototype.popDepthTest = function ()
{
    this._stackDepthTest.pop();

    if (!this._stackDepthTest[this._stackDepthTest.length - 1]) this.gl.disable(this.gl.DEPTH_TEST);
    else this.gl.enable(this.gl.DEPTH_TEST);
};

// --------------------------------------
// state depthwrite

/**
 * push depth write enabled state
 * @function pushDepthTest
 * @param {Boolean} enabled
 * @memberof Context
 * @instance
 */
Context.prototype._stackDepthWrite = [];
Context.prototype.pushDepthWrite = function (b)
{
    this._stackDepthWrite.push(b);
    this.gl.depthMask(b);
};

/**
 * current state of depth writing
 * @function stateCullFace
 * @returns {Boolean} enabled
 * @memberof Context
 * @instance
 */
Context.prototype.stateDepthWrite = function ()
{
    return this._stackDepthWrite[this._stackDepthWrite.length - 1];
};

/**
 * pop depth writing state
 * @function popCullFace
 * @memberof Context
 * @instance
 */
Context.prototype.popDepthWrite = function ()
{
    this._stackDepthWrite.pop();
    this.gl.depthMask(this._stackDepthWrite[this._stackDepthWrite.length - 1]);
};


// --------------------------------------
// state CullFace

/**
 * push face culling face enabled state
 * @function pushCullFaceFacing
 * @param {Boolean} enabled
 * @memberof Context
 * @instance
 */
Context.prototype._stackCullFace = [];
Context.prototype.pushCullFace = function (b)
{
    this._stackCullFace.push(b);

    if(b) this.gl.enable(this.gl.CULL_FACE);
    else this.gl.disable(this.gl.CULL_FACE);
};

/**
 * current state of face culling
 * @function stateCullFace
 * @returns {Boolean} enabled
 * @memberof Context
 * @instance
 */
Context.prototype.stateCullFace = function ()
{
    return this._stackCullFace[this._stackCullFace.length - 1];
};

/**
 * pop face culling enabled state
 * @function popCullFace
 * @memberof Context
 * @instance
 */
Context.prototype.popCullFace = function ()
{
    this._stackCullFace.pop();

    if(this._stackCullFace[this._stackCullFace.length - 1]) this.gl.enable(this.gl.CULL_FACE);
    else this.gl.disable(this.gl.CULL_FACE);
};


// --------------------------------------
// state CullFace Facing



/**
 * push face culling face side
 * @function pushCullFaceFacing
 * @param {Number} cgl.gl.FRONT_AND_BACK, cgl.gl.BACK or cgl.gl.FRONT
 * @memberof Context
 * @instance
 */
Context.prototype._stackCullFaceFacing = [];
Context.prototype.pushCullFaceFacing = function (b)
{
    this._stackCullFaceFacing.push(b);
    this.gl.cullFace(this._stackCullFaceFacing[this._stackCullFaceFacing.length - 1]);
};

/**
 * current state of face culling side
 * @function stateCullFaceFacing
 * @returns {Boolean} enabled
 * @memberof Context
 * @instance
 */
Context.prototype.stateCullFaceFacing = function ()
{
    return this._stackCullFaceFacing[this._stackCullFaceFacing.length - 1];
};

/**
 * pop face culling face side
 * @function popCullFaceFacing
 * @memberof Context
 * @instance
 */
Context.prototype.popCullFaceFacing = function ()
{
    this._stackCullFaceFacing.pop();
    if(this._stackCullFaceFacing.length>0) this.gl.cullFace(this._stackCullFaceFacing[this._stackCullFaceFacing.length - 1]);
};


// --------------------------------------
// state depthfunc

Context.prototype._stackDepthFunc = [];

/**
 * enable / disable depth testing
 * like `gl.depthFunc(boolean);`
 * @function pushDepthFunc
 * @memberof Context
 * @instance
 * @param {Boolean} depthtesting
 */
Context.prototype.pushDepthFunc = function (f)
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
Context.prototype.stateDepthFunc = function ()
{
    if (this._stackDepthFunc.length > 0) return this._stackDepthFunc[this._stackDepthFunc.length - 1];
    return false;
};

/**
 * pop depth testing and set the previous state
 * @function popDepthFunc
 * @memberof Context
 * @instance
 */
Context.prototype.popDepthFunc = function ()
{
    this._stackDepthFunc.pop();
    if (this._stackDepthFunc.length > 0) this.gl.depthFunc(this._stackDepthFunc[this._stackDepthFunc.length - 1]);
};



Context.prototype._stackBlend = [];

/**
 * enable / disable blend
 * like gl.enable(gl.BLEND); / gl.disable(gl.BLEND);
 * @function pushBlend
 * @memberof Context
 * @instance
 * @param {Boolean} blending
 */
Context.prototype.pushBlend = function (b)
{
    this._stackBlend.push(b);
    if (!b) this.gl.disable(this.gl.BLEND);
    else this.gl.enable(this.gl.BLEND);
};

/**
 * pop blend state and set the previous state
 * @function popBlend
 * @memberof Context
 * @instance
 */
Context.prototype.popBlend = function ()
{
    this._stackBlend.pop();

    if (!this._stackBlend[this._stackBlend.length - 1]) this.gl.disable(this.gl.BLEND);
    else this.gl.enable(this.gl.BLEND);
};

/**
 * current state of blend
 * @function stateBlend
 * @returns {boolean} blending enabled/disabled
 * @memberof Context
 * @instance
 */
Context.prototype.stateBlend = function ()
{
    return this._stackBlend[this._stackBlend.length - 1];
};

export const BLENDS = {
    BLEND_NONE: 0,
    BLEND_NORMAL: 1,
    BLEND_ADD: 2,
    BLEND_SUB: 3,
    BLEND_MUL: 4,
};

Context.prototype._stackBlendMode = [];
Context.prototype._stackBlendModePremul = [];

/**
 * push and switch to predefined blendmode (CONSTANTS.BLEND_MODES.BLEND_NONE,CONSTANTS.BLEND_MODES.BLEND_NORMAL,CONSTANTS.BLEND_MODES.BLEND_ADD,CONSTANTS.BLEND_MODES.BLEND_SUB,CONSTANTS.BLEND_MODES.BLEND_MUL)
 * @function pushBlendMode
 * @memberof Context
 * @instance
 * @param {Number} blendmode
 * @param {Boolean} premultiplied mode
 */
Context.prototype.pushBlendMode = function (blendMode, premul)
{
    this._stackBlendMode.push(blendMode);
    this._stackBlendModePremul.push(premul);

    const n = this._stackBlendMode.length - 1;

    this.pushBlend(this._stackBlendMode[n] !== CONSTANTS.BLEND_MODES.BLEND_NONE);
    this._setBlendMode(this._stackBlendMode[n], this._stackBlendModePremul[n]);
};

/**
 * pop predefined blendmode / switch back to previous blendmode
 * @function pushBlendMode
 * @memberof Context
 * @instance
 */
Context.prototype.popBlendMode = function ()
{
    this._stackBlendMode.pop();
    this._stackBlendModePremul.pop();

    const n = this._stackBlendMode.length - 1;

    this.popBlend(this._stackBlendMode[n] !== CONSTANTS.BLEND_MODES.BLEND_NONE);

    if (n > 0) this._setBlendMode(this._stackBlendMode[n], this._stackBlendModePremul[n]);
};

Context.prototype.glGetAttribLocation = function (prog, name)
{
    const l = this.gl.getAttribLocation(prog, name);
    if (l == -1)
    {
        // Log.log("get attr loc -1 ",name);
        // debugger;
    }
    return l;
};

Context.prototype._setBlendMode = function (blendMode, premul)
{
    const gl = this.gl;

    if (blendMode == CONSTANTS.BLEND_MODES.BLEND_NONE)
    {
        // this.gl.disable(this.gl.BLEND);
    }
    else if (blendMode == CONSTANTS.BLEND_MODES.BLEND_ADD)
    {
        if (premul)
        {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
        }
        else
        {
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        }
    }
    else if (blendMode == CONSTANTS.BLEND_MODES.BLEND_SUB)
    {
        if (premul)
        {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ZERO, gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA);
        }
        else
        {
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
        }
    }
    else if (blendMode == CONSTANTS.BLEND_MODES.BLEND_MUL)
    {
        if (premul)
        {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
        }
        else
        {
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
        }
    }
    else if (blendMode == CONSTANTS.BLEND_MODES.BLEND_NORMAL)
    {
        if (premul)
        {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
        else
        {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }
    }
    else
    {
        Log.log("setblendmode: unknown blendmode");
    }
};

export { Context };
