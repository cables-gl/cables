"use strict";

CABLES.LoadingStatus=function()
{
    this._loadingAssets={};
    this._cbFinished=[];
    this._percent=0;
    this._count=0;
    this._countFinished=0;
    this._order=0;
    this._startTime=0;
};

CABLES.LoadingStatus.prototype.setOnFinishedLoading=function(cb)
{
    this._cbFinished.push(cb);
};

CABLES.LoadingStatus.prototype.getNumAssets=function()
{
    return this._countFinished;
};

CABLES.LoadingStatus.prototype.getProgress=function()
{
    return this._percent;
};

CABLES.LoadingStatus.prototype.checkStatus=function()
{
    this._countFinished=0;
    this._count=0;

    for(var i in this._loadingAssets)
    {
        this._count++;
        if(!this._loadingAssets[i].finished)
        {
            this._countFinished++;
        }
    }

    this._percent=(this._count-this._countFinished)/this._count;

    if(CGL.onLoadingAssetsFinished)
    {
        console.error('CGL.onLoadingAssetsFinished is deprecated, please use config parameter onFinishedLoading with scene/patch constructor');
        setTimeout(this._cbFinished,200);
    }

    if(this._countFinished===0)
    {
        for(var j=0;j<this._cbFinished.length;j++)
        {
            setTimeout(this._cbFinished[j],200);
        }
        this.print();
    }
};

CABLES.LoadingStatus.prototype.print=function()
{
    var rows=[];
    
    for(var i in this._loadingAssets)
        rows.push([
            this._loadingAssets[i].order,
            this._loadingAssets[i].type,
            this._loadingAssets[i].name,
            (this._loadingAssets[i].timeEnd-this._loadingAssets[i].timeStart)/1000+'s'
        ]);

    console.groupCollapsed( 'finished loading '+(this._order+1)+' assets in '+ (Date.now()-this._startTime)/1000 +'s' );
    console.table(rows);
    console.groupEnd();
}

CABLES.LoadingStatus.prototype.finished=function(id)
{
    if(this._loadingAssets[id])
    {
        this._loadingAssets[id].finished=true;
        this._loadingAssets[id].timeEnd=Date.now();
    }

    this.checkStatus();
};

CABLES.LoadingStatus.prototype.start=function(type,name)
{
    if(this._startTime==0)this._startTime=Date.now();
    var id=CABLES.generateUUID();
    
    this._loadingAssets[id]=({id:id,type:type,name:name,finished:false,timeStart:Date.now(),order:this._order});
    this._order++;

    return id;
};

