import { CGState } from "../cg/cg_state";

/**
 * cables gl context/state manager
 * @external CGL
 * @namespace Context
 * @class
 * @hideconstructor
 */
const Context = function (_patch)
{
    CGState.apply(this);

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

export { Context };
