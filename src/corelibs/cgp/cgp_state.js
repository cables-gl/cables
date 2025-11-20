import { Logger } from "cables-shared-client";
import { Patch } from "cables";
import { Geometry, CgContext, CgTexture } from "../cg/index.js";

import { CgpShader } from "./cgp_shader.js";
import { Texture } from "./cgp_texture.js";
import { CgpMesh } from "./cgp_mesh.js";
import { CgpUniform } from "./cgp_uniform.js";
import defaultShaderSrcVert from "./cgp_shader_default.wgsl";

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

    #log = new Logger("WebGpuContext");
    branchProfiler = null;
    #stackCullFaceFacing = [];
    #stackDepthTest = [];
    #stackCullFace = [];
    #stackDepthFunc = [];
    #stackDepthWrite = [];
    #stackErrorScope = [];
    #stackBlend = [];
    #stackErrorScopeLogs = [];
    #stackMultisampling = [];
    currentPipeDebug = null;
    canvasAttachments = [];

    #viewport = [0, 0, 256, 256];
    #shaderStack = [];
    #simpleShader = null;
    frame = 0;
    catchErrors = true;

    /** @type {GPUDevice} */
    device = null;

    /** @type {GPURenderPassEncoder} */
    passEncoder = null;

    DEPTH_FUNCS = [
        "never",
        "always",
        "less",
        "less-equal",
        "greater",
        "greater-equal",
        "equal",
        "not-equal"
    ];

    CULL_MODES = [
        "none",
        "back",
        "front",
        "none" // both does not exist in webgpu
    ];

    /**
     * @param {Patch} _patch
     */
    constructor(_patch)
    {
        super(_patch);
        this.patch = _patch;

        this.lastErrorMsg = "";

        this.gApi = CgContext.API_WEBGPU;

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

        if (!this.#simpleShader)
        {
            this.#simpleShader = new CgpShader(this, "simple default shader");
            this.#simpleShader.setSource(defaultShaderSrcVert);

            this.#simpleShader.addUniform(new CgpUniform(this.#simpleShader, "4f", "color", [1, 1, 0, 1]), GPUShaderStage.FRAGMENT);
        }

        this.fpsCounter.startFrame();

        this._startMatrixStacks(identTranslate, identTranslateView);
        this.setViewPort(0, 0, this.canvasWidth, this.canvasHeight);

        this.pushShader(this.#simpleShader);
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

        if (this.#stackErrorScope.length > 0)console.log("error scope stack length invalid...");
        this.#stackErrorScope.length = 0;

        this.emitEvent("endFrame");
        this.fpsCounter.endFrame();
    }

    /**
     * @param {number} x
     * @param {number} [y]
     * @param {number} [w]
     * @param {number} [h]
     */
    setViewPort(x, y, w, h)
    {
        this.#viewport = [x, y, w, h];
    }

    /**
     * get current gl viewport
     * @returns {Array} array [x,y,w,h]
     */
    getViewPort()
    {
        return this._viewPort;
    }

    /**
     * @param {Geometry} geom
     * @returns {CgpMesh}
     */
    createMesh(geom)
    {
        return new CgpMesh(this, geom);
    }

    /**
     * pop viewPort stack
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
     * @param {Object} shader
    */
    pushShader(shader)
    {
        this.#shaderStack.push(shader);
        // currentShader = shader;
    }

    /**
     * pop current used shader from shader stack
     */
    popShader()
    {
        if (this.#shaderStack.length === 0) throw new Error("Invalid shader stack pop!");
        this.#shaderStack.pop();
        // currentShader = this._shaderStack[this._shaderStack.length - 1];
    }

    getShader()
    {
        return this.#shaderStack[this.#shaderStack.length - 1];
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
     * @param {string} name
     */
    pushErrorScope(name, options = { })
    {
        if (this.catchErrors)
        {
            this.#stackErrorScope.push(name);
            this.#stackErrorScopeLogs.push(options.logger || null);
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
            const name = this.#stackErrorScope.pop();
            const logger = this.#stackErrorScopeLogs.pop();
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
                        (logger || this.#log).error(error.constructor.name, "in ERROR SCOPE:", name);
                        (logger || this.#log).error(error.message);
                    }
                    this.lastErrorMsg = error.message;

                    if (cb)cb(error);
                }
            });
        }
    }

    /**
     * push depth testing enabled state
     * @param {Boolean} b enabled
     */
    pushDepthTest(b)
    {
        this.#stackDepthTest.push(b);
    }

    getDepthCompare()
    {
        let depthComp = this.stateDepthFunc();
        if (!this.stateDepthTest())depthComp = "always";
        return depthComp;
    }

    /**
     * current state of depth testing
     * @returns {Boolean} enabled
     */
    stateDepthTest()
    {
        return this.#stackDepthTest[this.#stackDepthTest.length - 1];
    }

    /**
     * pop depth testing state
     */
    popDepthTest()
    {
        this.#stackDepthTest.pop();
    }

    // --------------------------------------
    // state depthwrite

    /**
     * push depth write enabled state
     * @param {Boolean} b enabled
     */
    pushDepthWrite(b)
    {
        b = b || false;
        this.#stackDepthWrite.push(b);
    }

    /**
     * current state of depth writing
     * @returns {Boolean} enabled
     */
    stateDepthWrite()
    {
        return this.#stackDepthWrite[this.#stackDepthWrite.length - 1];
    }

    /**
     * pop depth writing state
     */
    popDepthWrite()
    {
        this.#stackDepthWrite.pop();
    }

    // --------------------------------------
    // state depthfunc

    /**
     * @param {GPUCompareFunction} depthFunc depth compare func
     */
    pushDepthFunc(depthFunc)
    {
        this.#stackDepthFunc.push(depthFunc);
    }

    /**
     * @returns {GPUCompareFunction}
     */
    stateDepthFunc()
    {
        if (this.#stackDepthFunc.length > 0) return this.#stackDepthFunc[this.#stackDepthFunc.length - 1];
        return "less";
    }

    /**
     * pop depth compare func
     */
    popDepthFunc()
    {
        this.#stackDepthFunc.pop();
    }

    /**
     * push face culling face enabled state
     * @param {Boolean} b enabled
     */
    pushCullFace(b)
    {
        this.#stackCullFace.push(b);
    }

    /**
     * @returns {number}
     */
    stateMultisampling()
    {
        return this.#stackMultisampling[this.#stackMultisampling.length - 1];
    }

    /**
     * @param {number} samples
     */
    pushMultisampling(samples)
    {
        this.#stackMultisampling.push(samples);
    }

    popMultisampling()
    {
        this.#stackMultisampling.pop();
    }

    // --------------------------------------
    // state CullFace Facing

    /**
     * push face culling face side
     * @param {string} b
     */
    pushCullFaceFacing(b)
    {
        this.#stackCullFaceFacing.push(b);
    }

    /**
     * current state of face culling side
     * @returns {string}
     */
    stateCullFaceFacing()
    {
        return this.#stackCullFaceFacing[this.#stackCullFaceFacing.length - 1];
    }

    /**
     * pop face culling face side
     */
    popCullFaceFacing()
    {
        this.#stackCullFaceFacing.pop();
    }

    pushBlend(b)
    {
        this.#stackBlend.push(b);
    }

    popBlend()
    {
        this.#stackBlend.pop();
    }

    /**
     * @returns {GPUBlendComponent}
     */
    stateBlend()
    {
        return this.#stackBlend[this.#stackBlend.length - 1];
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
     * @param {boolean} _doScreenshotClearAlpha
     * @param {string} mimeType
     * @param {number} quality
     */
    screenShot(cb, _doScreenshotClearAlpha, mimeType, quality)
    {
        if (this.canvas && this.canvas.toBlob)
        {
            this.canvas.toBlob((blob) =>
            {
                if (cb) cb(blob);
                else this.#log.log("no screenshot callback...");
            }, mimeType, quality);
        }

    }

}
