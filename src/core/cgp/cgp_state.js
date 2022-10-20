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

    this.gApi = CGL.GAPI_WEBGPU;

    this.getViewPort = function ()
    {
        return [0, 0, this.canvasWidth, this.canvasHeight];
    };

    this.renderStart = function (cgl, identTranslate, identTranslateView)
    {
        this._startMatrixStacks(identTranslate, identTranslateView);

        this.emitEvent("beginFrame");
    };

    this.renderEnd = function (cgl)
    {
        this._endMatrixStacks();

        this.emitEvent("endFrame");
    };
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
