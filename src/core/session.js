

// todo: old... remove this from ops...

// var CABLES=CABLES || {};

CABLES.Variable=function()
{
    var value=null;
    var changedCallbacks=[];

    this.onChanged=function(f)
    {
        changedCallbacks.push(f);
    };

    this.getValue=function()
    {
        return value;
    };

    this.setValue=function(v)
    {
        value=v;
        emitChanged();
    };

    var emitChanged=function()
    {
        for(var i=0;i<changedCallbacks.length;i++)
        {
            changedCallbacks[i]();
        }
    };

};

export default CABLES;
