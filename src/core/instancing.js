
var CABLES=CABLES||{};

CABLES.Instancing=function()
{
    this._loops=[];
    this._index=0;
};

CABLES.Instancing.prototype.pushLoop=function(maxNum)
{
    this._loops.push( Math.abs(Math.floor(maxNum)) );
};

CABLES.Instancing.prototype.popLoop=function()
{
    this._loops.pop();
    this._index--;
    if(this._loops.length===0) this._index=0;
};

CABLES.Instancing.prototype.numLoops=function()
{
    return this._loops.length;
};

CABLES.Instancing.prototype.numCycles=function()
{
    if(this._loops.length===0)return 0;
    var num=this._loops[0];
    for(var i=1;i<this._loops.length;i++)
        num*=this._loops[i];

    return num;
};

CABLES.Instancing.prototype.inLoop=function()
{
    return this._loops.length>0;
};

CABLES.Instancing.prototype.increment=function()
{
    this._index++;
};

CABLES.Instancing.prototype.index=function()
{
    return this._index;
};
