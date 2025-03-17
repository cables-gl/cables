export class WebGpuOp
{
    constructor(op)
    {
        this._op = op;
        this.supported = !!navigator.gpu;

        if (!op.patch.cgp)
        {
            op.patch.cgp = new CABLES.CGP.Context(op.patch);
        }

        this.checkSupport();
    }

    /**
     * @param {Op} op
     * @returns {boolean}
     */
    checkSupport()
    {

        if (!this.supported)
        {
            this._op.setUiError("nowebgpu", "Your browser does not support webgpu", 2);
            this._op.setEnabled(false);
        }
        return this.supported;

    }
}
