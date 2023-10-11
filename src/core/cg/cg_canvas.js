class CgCanvas
{
    constructor(options)
    {
        if (!options)
        {
            console.error("CgCanvas no options");
        }
        else
        {
            this._canvasEle = options.canvasEle;
        }

        this.pixelDensity = 2;
        this.canvasWidth = this.canvasEle.clientWidth;
        this.canvasHeight = this.canvasEle.clientHeight;

        this.setSize(200, 200);
    }

    get canvasEle() { return this._canvasEle; }

    setSize(w, h, ignorestyle)
    {
        console.log("setsize", w, h);
        if (!ignorestyle)
        {
            this.canvasEle.style.width = w + "px";
            this.canvasEle.style.height = h + "px";
        }

        this.canvasEle.width = w * this.pixelDensity;
        this.canvasEle.height = h * this.pixelDensity;

        this.updateSize();
    }

    updateSize()
    {
        this.canvasEle.width = this.canvasWidth = this.canvasEle.clientWidth * this.pixelDensity;
        this.canvasEle.height = this.canvasHeight = this.canvasEle.clientHeight * this.pixelDensity;
    }
}

export { CgCanvas };
