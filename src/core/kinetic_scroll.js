// TODO remove...

CABLES=CABLES||{};

CABLES.InertiaAnim=function(cb)
{
    this._inVelocity=0;

    this._lastVal=0;
    this._lastTime=0;

    this.value=0;
    this._cb=cb;

    this.INERTIA_SCROLL_FACTOR=3.5;
    this.INERTIA_ACCELERATION=0.95;
    this._firstTime=true;

    this.bounds=null;
};


CABLES.InertiaAnim.prototype.updateSmooth=function()
{
    this.value += this._inVelocity * this.INERTIA_SCROLL_FACTOR;
    this._inVelocity *= this.INERTIA_ACCELERATION;

    // console.log(this.value);
    if(this._cb)this._cb(this.value);
    // console.log('.');

    if(Math.abs(this._inVelocity) < 0.1)
    {
        clearInterval(this._smoothInterval);
        this._inVelocity = 0;
    }

};

CABLES.InertiaAnim.prototype.get=function()
{
    return this.value;
};

CABLES.InertiaAnim.prototype.release=function()
{
    clearInterval(this._smoothInterval);
    this._smoothInterval=setInterval(this.updateSmooth.bind(this), 16.7);
    this._firstTime=true;

};

CABLES.InertiaAnim.prototype.set=function(_value)
{
    if(this._firstTime)
    {
        clearInterval(this._smoothInterval);
        this.value=_value;
        this._lastTime=CABLES.now();
        this._firstTime=false;
    }

    var dist=(_value-this.value);
    // console.log('dist',dist,_value);
    this._inVelocity = dist / (CABLES.now()-this._lastTime+0.0000001);


    this.value=_value;
    if(this._cb)this._cb(this.value);



    // console.log('this._inVelocity ',this._inVelocity);
    this._lastTime=CABLES.now();

};
