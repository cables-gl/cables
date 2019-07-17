
// var CABLES=CABLES||{};

const Instancing=function()
{
    this._loops=[];
    this._indizes=[];
    this._index=0;
};

Instancing.prototype.pushLoop=function(maxNum)
{
    this._loops.push( Math.abs(Math.floor(maxNum)) );
    this._indizes.push( this._index);
};

Instancing.prototype.popLoop=function()
{
    this._loops.pop();
    // this._index--;
    this._index=this._indizes.pop();
    if(this._loops.length===0) this._index=0;
};

Instancing.prototype.numLoops=function()
{
    return this._loops.length;
};

Instancing.prototype.numCycles=function()
{
    if(this._loops.length===0)return 0;
    var num=this._loops[0];
    for(var i=1;i<this._loops.length;i++)
        num*=this._loops[i];

    return num;
};

Instancing.prototype.inLoop=function()
{
    return this._loops.length>0;
};

Instancing.prototype.increment=function()
{
    this._index++;
};

Instancing.prototype.index=function()
{
    return this._index;
};

export default Instancing;
