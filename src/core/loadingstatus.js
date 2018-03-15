CABLES.LoadingStatus=function()
{
    // console.log('created loadingmanager');
    var loadingAssets={};
    var cbFinished=[];
    var percent=0;

    this.setOnFinishedLoading=function(cb)
    {
        cbFinished.push(cb);
    };

    this.getProgress=function()
    {
        return percent;
    };

    this.checkStatus=function()
    {
        // console.log('--------');
        var countFinished=0;
        var count=0;
        for(var i in loadingAssets)
        {
            count++;
            if(!loadingAssets[i].finished)
            {
                countFinished++;
            }
        }

        percent=(count-countFinished)/count;

        if(CGL.onLoadingAssetsFinished)
        {
            console.error('CGL.onLoadingAssetsFinished is deprecated, please use config parameter onFinishedLoading with scene/patch constructor');
            setTimeout(cbFinished,200);
        }

        if(countFinished===0)
        {
            for(var j=0;j<cbFinished.length;j++)
            {
                setTimeout(cbFinished[j],200);
            }
        }
    };

    this.finished=function(id)
    {
        if(loadingAssets[id])
        {
            loadingAssets[id].finished=true;
        }
        this.checkStatus();
    };

    this.start=function(type,name)
    {
        var id=CABLES.generateUUID();

        // console.log('start loading',name);
        loadingAssets[id]=({id:id,type:type,name:name,finished:false});
        // console.log('LOAD: '+loadingAssets[id].type+': '+loadingAssets[id].finished+': '+loadingAssets[id].name );

        return id;
    };
};
