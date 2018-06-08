var CGL=CGL||{};

// CGL.MatrixStackOld=function()
// {
//     this._arr=[];
//     this._index=-1;
// }

// CGL.MatrixStackOld.prototype.push=function(m)
// {
//     var copy=mat4.create();
//     mat4.copy(copy,m);
//     this._arr.push(copy);

//     return copy;
// }

// CGL.MatrixStackOld.prototype.pop=function()
// {
//     return this._arr.pop();
// }

// CGL.MatrixStackOld.prototype.length=function()
// {
//     return this._arr.length;
// }

// -------------------------------------------------------------

CGL.MatrixStack=function()
{
    this._arr=[mat4.create()];
    this._index=0;
    this.stateCounter=0;
}

CGL.MatrixStack.prototype.push=function(m)
{
    this._index++;
    this.stateCounter++;

    if( this._index==this._arr.length)
    {
        var copy=mat4.create();
        this._arr.push(copy);
    }

    mat4.copy(this._arr[this._index],m||this._arr[this._index-1]);

    return this._arr[this._index];
}

CGL.MatrixStack.prototype.pop=function()
{
    this.stateCounter++;
    
    this._index--;
    if(this._index<0)this._index=0;

    return this._arr[this._index];
}

CGL.MatrixStack.prototype.length=function()
{
    return this._index;
}

