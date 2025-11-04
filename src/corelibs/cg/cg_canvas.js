import { Logger } from "cables-shared-client";

export class CgCanvas
{
    hasFocus = false;

    forceAspect = 0;
    pixelDensity = 1;
    _oldWidthRp = -1;
    _oldHeightRp = -1;

    /**
     * @param {{ canvasEle: any; cg: any; }} options
     */
    constructor(options)
    {
        this._log = new Logger("CgCanvas");
        if (!options)
        {
            this._log.error("CgCanvas no options");
        }
        else
        {
            this._canvasEle = options.canvasEle;
        }

        if (!options.cg) this._log.error("CgCanvas options has no cg");
        // if (!options.canvasEle) this._log.error("CgCanvas options has no canvasEle");

        this._cg = options.cg;
        if (this.canvasEle)
        {
            this.canvasWidth = this.canvasEle.clientWidth;
            this.canvasHeight = this.canvasEle.clientHeight;

            this.setSize(this.canvasWidth, this.canvasHeight);
            this.canvasEle.addEventListener("focus", () => { this.hasFocus = true; });
            this.canvasEle.addEventListener("blur", () => { this.hasFocus = false; });
        }
    }

    /**
     * @returns {HTMLElement}
     */
    get canvasEle() { return this._canvasEle; }

    /**
     * @param {Number} w
     * @param {Number} h
     * @param {any} ignorestyle
     * @returns {any}
     */
    setSize(w, h, ignorestyle = false)
    {
        let offY = 0;
        if (this.forceAspect)
        {
            let nh = w / this.forceAspect;
            if (nh < h)offY = (h - nh) / 2;
            h = nh;
        }

        if (this._oldWidthRp != w * this.pixelDensity || this._oldHeightRp != h * this.pixelDensity)
        {
            this._oldWidthRp = this.canvasEle.width = w * this.pixelDensity;
            this._oldHeightRp = this.canvasEle.height = h * this.pixelDensity;

            if (!ignorestyle)
            {
                this.canvasEle.style.width = w + "px";
                this.canvasEle.style.height = h + "px";
                this.canvasEle.style.marginTop = offY + "px";
            }

            this.updateSize();

            this._cg.emitEvent("resize");
        }
    }

    updateSize()
    {
        this.canvasEle.width = this.canvasWidth = Math.ceil(this.canvasEle.clientWidth * this.pixelDensity);
        this.canvasEle.height = this.canvasHeight = Math.ceil(this.canvasEle.clientHeight * this.pixelDensity);
        // console.log("text", this.canvasEle.width, this.canvasEle.clientWidth, this.canvasEle.getBoundingClientRect().width);
    }

    dispose()
    {
        if (this._canvasEle) this._canvasEle.remove();
        this._canvasEle = null;
    }
}
