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
    this._viewport=[0,0,256,256];

    this.getViewPort = function ()
    {
        return [0, 0, this.canvasWidth, this.canvasHeight];
    };

    this.renderStart = function (cgp, identTranslate, identTranslateView)
    {
        this._startMatrixStacks(identTranslate, identTranslateView);
        this.setViewPort(0, 0, this.canvasWidth, this.canvasHeight);
        this.emitEvent("beginFrame");
    };

    this.renderEnd = function (cgl)
    {
        this._endMatrixStacks();

        this.emitEvent("endFrame");
    };
};
Context.prototype.setViewPort = function (x,y,w,h)
{
    this._viewport=[x,y,w,h];
}

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

export { Context };
