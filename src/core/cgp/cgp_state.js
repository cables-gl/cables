import { Logger } from "cables-shared-client";
import { Geometry } from "../cg/cg_geom.js";
import defaultShaderSrcVert from "./cgp_shader_default.wgsl";

import { CgContext } from "../cg/cg_state.js";
import { CgpShader } from "./cgp_shader.js";
import { Texture } from "./cgp_texture.js";
import { CgTexture } from "../cg/cg_texture.js";
import { Patch } from "../core_patch.js";
import { CgpMesh } from "./cgp_mesh.js";
import { CgpUniform } from "./cgp_uniform.js";

// https://github.com/greggman/webgpu-utils
// https://developer.chrome.com/blog/from-webgl-to-webgpu/
// https://gpuweb.github.io/gpuweb/explainer/

/**
 * cables webgpu context/state manager
 * @class
 * @namespace external:CGP
 * @hideconstructor
 */
export class CgpContext extends CgContext
{

    branchProfiler = null;

    /**
     * @param {Patch} _patch
     */
    constructor(_patch)
    {
        super(_patch);
        this.patch = _patch;

        this.lastErrorMsg = "";

        this._log = new Logger("WebGpuContext");
        this.gApi = CgContext.API_WEBGPU;
        this._viewport = [0, 0, 256, 256];
        this._shaderStack = [];
        this._simpleShader = null;
        this.frame = 0;
        this.catchErrors = true;

        this._stackCullFaceFacing = [];
        this._stackDepthTest = [];
        this._stackCullFace = [];
        this._stackDepthFunc = [];
        this._stackDepthWrite = [];
        this._stackErrorScope = [];
        this._stackBlend = [];
        this._stackErrorScopeLogs = [];

        this.currentPipeDebug = null;
        this.canvasAttachments = [];

        /** @type {GPUDevice} */
        this.device = null;

        /** @type {GPURenderPassEncoder} */
        this.passEncoder = null;

        this._defaultBlend = {
            "color": {
                "operation": "add",
                "srcFactor": "one",
                "dstFactor": "zero",
            },
            "alpha": {
                "operation": "add",
                "srcFactor": "one",
                "dstFactor": "zero",
            },
        };

        // this.DEPTH_FUNCS = [
        //     "never",
        //     "always",
        //     "less",
        //     "less-equal",
        //     "greater",
        //     "greater-equal",
        //     "equal",
        //     "not-equal"
        // ];

        this.CULL_MODES = [
            "none",
            "back",
            "front",
            "none" // both does not exist in webgpu
        ];

        /** @type {GPUTextureFormat} */
        this.presentationFormat = "bgra8unorm";
    }

    get supported()
    {
        return !!navigator.gpu;
    }

    /// ////////////////////

    /**
     * Description
     * @param {any} cgp
     * @param {any} identTranslate
     * @param {any} identTranslateView
     * @returns {any}
     */
    renderStart(cgp, identTranslate, identTranslateView)
    {

        this.frame++;
        this.pushErrorScope("cgpstate internal", { "scope": "internal" });
        this.pushErrorScope("cgpstate out-of-memory", { "scope": "out-of-memory" });

        if (!this._simpleShader)
        {
            this._simpleShader = new CgpShader(this, "simple default shader");
            this._simpleShader.setSource(defaultShaderSrcVert);

            this._simpleShader.addUniform(new CgpUniform(this._simpleShader, "4f", "color", [1, 1, 0, 1]), GPUShaderStage.FRAGMENT);
        }

        this.fpsCounter.startFrame();

        this._startMatrixStacks(identTranslate, identTranslateView);
        this.setViewPort(0, 0, this.canvasWidth, this.canvasHeight);

        this.pushShader(this._simpleShader);
        this.pushDepthTest(true);
        this.pushDepthWrite(true);
        this.pushDepthFunc("less-equal");

        this.pushBlend(this._defaultBlend);

        this._execOneTimeCallbacks();

        this.emitEvent("beginFrame");
    }

    renderEnd()
    {
        this._endMatrixStacks();

        this.popShader();
        this.popDepthFunc();
        this.popDepthWrite();
        this.popDepthTest();

        this.popErrorScope();
        this.popErrorScope();

        if (this._stackErrorScope.length > 0)console.log("error scope stack length invalid...");
        this._stackErrorScope.length = 0;

        this.emitEvent("endFrame");
        this.fpsCounter.endFrame();
    }

    setViewPort(x, y, w, h)
    {
        this._viewport = [x, y, w, h];
    }

    /**
     * @function getViewPort
     * @memberof Context
     * @instance
     * @description get current gl viewport
     * @returns {Array} array [x,y,w,h]
     */
    getViewPort()
    {
        return this._viewPort;
    }

    /**
     * @param {Geometry} geom
     * @param {any} glPrimitive
     * @returns {CgpMesh}
     */
    createMesh(geom, glPrimitive)
    {
        return new CgpMesh(this, geom);
    }

    /**
     * @function popViewPort
     * @memberof Context
     * @instance
     * @description pop viewPort stack
     */
    popViewPort()
    {
        this._viewPortStack.pop();

        if (this._viewPortStack.length == 0)
            this._viewPort = [0, 0, this.canvasWidth, this.canvasHeight];
        else
            this.setViewPort(this._viewPortStack[this._viewPort.length - 1]);
    }

    /**
     * @function pushViewPort
     * @memberof Context
     * @instance
     * @description push a new viewport onto stack
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */

    pushViewPort(x, y, w, h)
    {
        this._viewPortStack.push([x, y, w, h]);
        this._viewPort = [x, y, w, h];
    }

    /**
     * push a shader to the shader stack
     * @function pushShader
     * @memberof Context
     * @instance
     * @param {Object} shader
     * @function
    */
    pushShader(shader)
    {
        this._shaderStack.push(shader);
        // currentShader = shader;
    }

    /**
     * pop current used shader from shader stack
     * @function popShader
     * @memberof Context
     * @instance
     * @function
     */
    popShader()
    {
        if (this._shaderStack.length === 0) throw new Error("Invalid shader stack pop!");
        this._shaderStack.pop();
        // currentShader = this._shaderStack[this._shaderStack.length - 1];
    }

    getShader()
    {
        return this._shaderStack[this._shaderStack.length - 1];
        // if (currentShader) if (!this.frameStore || ((this.frameStore.renderOffscreen === true) == currentShader.offScreenPass) === true) return currentShader;
        // for (let i = this._shaderStack.length - 1; i >= 0; i--) if (this._shaderStack[i]) if (this.frameStore.renderOffscreen == this._shaderStack[i].offScreenPass) return this._shaderStack[i];
    }

    /**
     * @param {GPUDevice} device
     */
    setDevice(device)
    {
        this.device = device;

        if (this._emptyTexture) this._emptyTexture = this._emptyTexture.dispose();
        if (this._defaultTexture) this._defaultTexture = this._defaultTexture.dispose();
        if (this._errorTexture) this._errorTexture = this._errorTexture.dispose();

        this.emitEvent("deviceChange");
    }

    /**
     * @typedef ErrorScopeOptions
     * @property {Logger} [logger]
     * @property {GPUErrorFilter} [scope]
    */

    /**
     * @param {String} name
     * @param {ErrorScopeOptions} options
     */
    pushErrorScope(name, options = { })
    {
        if (this.catchErrors)
        {
            this._stackErrorScope.push(name);
            this._stackErrorScopeLogs.push(options.logger || null);
            this.device.pushErrorScope(options.scope || "validation");
        }
    }

    /**
     * @param {Function} [cb]
     */
    popErrorScope(cb)
    {
        if (this.catchErrors)
        {
            const name = this._stackErrorScope.pop();
            const logger = this._stackErrorScopeLogs.pop();
            this.device.popErrorScope().then((error) =>
            {
                if (error)
                {
                    if (this.lastErrorMsg == error.message)
                    {
                        // this._log.warn("last error once more...");
                    }
                    else
                    {
                        (logger || this._log).error(error.constructor.name, "in ERROR SCOPE:", name);
                        (logger || this._log).error(error.message);
                    }
                    this.lastErrorMsg = error.message;

                    if (cb)cb(error);
                }
            });
        }
    }

    /**
     * push depth testing enabled state
     * @function pushDepthTest
     * @param {Boolean} b enabled
     * @memberof Context
     * @instance
     */
    pushDepthTest(b)
    {
        this._stackDepthTest.push(b);
    }

    /**
     * current state of depth testing
     * @function stateDepthTest
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateDepthTest()
    {
        return this._stackDepthTest[this._stackDepthTest.length - 1];
    }

    /**
     * pop depth testing state
     * @function popDepthTest
     * @memberof Context
     * @instance
     */
    popDepthTest()
    {
        this._stackDepthTest.pop();
    }

    // --------------------------------------
    // state depthwrite

    /**
     * push depth write enabled state
     * @function pushDepthWrite
     * @param {Boolean} b enabled
     * @memberof Context
     * @instance
     */
    pushDepthWrite(b)
    {
        b = b || false;
        this._stackDepthWrite.push(b);
    }

    /**
     * current state of depth writing
     * @function stateCullFace
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateDepthWrite()
    {
        return this._stackDepthWrite[this._stackDepthWrite.length - 1];
    }

    /**
     * pop depth writing state
     * @function popCullFace
     * @memberof Context
     * @instance
     */
    popDepthWrite()
    {
        this._stackDepthWrite.pop();
    }

    // --------------------------------------
    // state depthfunc

    /**
     * @function pushDepthFunc
     * @memberof Context
     * @instance
     * @param {GPUCompareFunction} depthFunc depth compare func
     */
    pushDepthFunc(depthFunc)
    {
        this._stackDepthFunc.push(depthFunc);
    }

    /**
     * @function stateDepthFunc
     * @memberof Context
     * @instance
     * @returns {GPUCompareFunction}
     */
    stateDepthFunc()
    {
        if (this._stackDepthFunc.length > 0) return this._stackDepthFunc[this._stackDepthFunc.length - 1];
        return "less";
    }

    /**
     * pop depth compare func
     * @function popDepthFunc
     * @memberof Context
     * @instance
     */
    popDepthFunc()
    {
        this._stackDepthFunc.pop();
    }

    // --------------------------------------
    // state CullFace

    /**
     * push face culling face enabled state
     * @function pushCullFace
     * @param {Boolean} b enabled
     * @memberof Context
     * @instance
     */
    pushCullFace(b)
    {
        this._stackCullFace.push(b);
    }

    /**
     * current state of face culling
     * @function stateCullFace
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateCullFace()
    {
        return this._stackCullFace[this._stackCullFace.length - 1];
    }

    /**
     * pop face culling enabled state
     * @function popCullFace
     * @memberof Context
     * @instance
     */
    popCullFace()
    {
        this._stackCullFace.pop();
    }

    // --------------------------------------
    // state CullFace Facing

    /**
     * push face culling face side
     * @function pushCullFaceFacing
     * @memberof Context
     * @param b
     * @instance
     */
    pushCullFaceFacing(b)
    {
        this._stackCullFaceFacing.push(b);
    }

    /**
     * current state of face culling side
     * @function stateCullFaceFacing
     * @returns {Boolean} enabled
     * @memberof Context
     * @instance
     */
    stateCullFaceFacing()
    {
        return this._stackCullFaceFacing[this._stackCullFaceFacing.length - 1];
    }

    /**
     * pop face culling face side
     * @function popCullFaceFacing
     * @memberof Context
     * @instance
     */
    popCullFaceFacing()
    {
        this._stackCullFaceFacing.pop();
    }

    pushBlend(b)
    {
        this._stackBlend.push(b);
    }

    popBlend()
    {
        this._stackBlend.pop();
    }

    /**
     * @returns {GPUBlendComponent}
     */
    stateBlend()
    {
        return this._stackBlend[this._stackBlend.length - 1];
    }

    getEmptyTexture()
    {
        if (this._emptyTexture) return this._emptyTexture;
        const size = 8;
        this._emptyTexture = new Texture(this, {});
        this._emptyTexture.initFromData(CgTexture.getDefaultTextureData("empty", size), size, size);
        return this._emptyTexture;
    }

    getErrorTexture()
    {
        // if (this._errorTexture) return this._errorTexture;
        const size = 256;
        this._errorTexture = new Texture(this, {});
        this._errorTexture.initFromData(CgTexture.getDefaultTextureData("stripes", size, { "r": 1, "g": 0, "b": 0 }), size, size);
        return this._errorTexture;
    }

    getDefaultTexture()
    {
        if (this._defaultTexture) return this._defaultTexture;
        const size = 256;
        this._defaultTexture = new Texture(this, {});
        this._defaultTexture.initFromData(CgTexture.getDefaultTextureData("stripes", size), size, size);
        return this._defaultTexture;
    }

    /**
     * @param {function} cb
     * @param {boolean} doScreenshotClearAlpha
     * @param {string} mimeType
     * @param {number} quality
     */
    screenShot(cb, doScreenshotClearAlpha, mimeType, quality)
    {
        if (this.canvas && this.canvas.toBlob)
        {
            this.canvas.toBlob((blob) =>
            {
                if (cb) cb(blob);
                else this._log.log("no screenshot callback...");
            }, mimeType, quality);
        }

    }

}
