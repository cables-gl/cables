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
    }

    get canvasEle() { return this._canvasEle; }

    setSize(w, h)
    {

    }
}

export { CgCanvas };
