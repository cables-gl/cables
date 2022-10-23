import { CG } from "../cg/cg_constants";
import { CGState } from "../cg/cg_state";

/**
 * cables webgpu context/state manager
 * @external CGP
 * @namespace Context
 * @class
 * @hideconstructor
 */
const Context = function (_patch)
{
    CGState.apply(this);

    this.gApi = CG.GAPI_WEBGPU;
    this._viewport = [0, 0, 256, 256];
    this._shaderStack = [];

    this.getViewPort = function ()
    {
        return [0, 0, this.canvasWidth, this.canvasHeight];
    };

    this.renderStart = function (cgp, identTranslate, identTranslateView)
    {
        this.fpsCounter.startFrame();

        this._startMatrixStacks(identTranslate, identTranslateView);
        this.setViewPort(0, 0, this.canvasWidth, this.canvasHeight);
        this.emitEvent("beginFrame");
    };

    this.renderEnd = function (cgl)
    {
        this._endMatrixStacks();

        this.emitEvent("endFrame");
        this.fpsCounter.endFrame();
    };
};
Context.prototype.setViewPort = function (x, y, w, h)
{
    this._viewport = [x, y, w, h];
};

/**
 * @function getViewPort
 * @memberof Context
 * @instance
 * @description get current gl viewport
 * @returns {Array} array [x,y,w,h]
 */
Context.prototype.getViewPort = function ()
{
    return this._viewPort;
};


Context.prototype.createMesh = function (geom, glPrimitive)
{
    return new CGP.Mesh(this, geom, glPrimitive);
};
Context.prototype.getShader = function ()
{
    return {};
};

/**
 * push a shader to the shader stack
 * @function pushShader
 * @memberof Context
 * @instance
 * @param {Object} shader
 * @function
*/
Context.prototype.pushShader = function (shader)
{
    this._shaderStack.push(shader);
    // currentShader = shader;
};

/**
 * pop current used shader from shader stack
 * @function popShader
 * @memberof Context
 * @instance
 * @function
 */
Context.prototype.popShader = function ()
{
    if (this._shaderStack.length === 0) throw new Error("Invalid shader stack pop!");
    this._shaderStack.pop();
    // currentShader = this._shaderStack[this._shaderStack.length - 1];
};

Context.prototype.getShader = function ()
{
    return this._shaderStack[this._shaderStack.length - 1];
    // if (currentShader) if (!this.frameStore || ((this.frameStore.renderOffscreen === true) == currentShader.offScreenPass) === true) return currentShader;
    // for (let i = this._shaderStack.length - 1; i >= 0; i--) if (this._shaderStack[i]) if (this.frameStore.renderOffscreen == this._shaderStack[i].offScreenPass) return this._shaderStack[i];
};

Context.prototype.pushErrorScope = function ()
{
    this.device.pushErrorScope("validation");
};

Context.prototype.popErrorScope = function ()
{
    this.device.popErrorScope().then((error) =>
    {
        if (error)console.warn("[cgp]", error);
    });
};


export { Context };
