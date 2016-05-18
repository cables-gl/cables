CABLES.LoadingStatus=function()
{
    // console.log('created loadingmanager');
    var loadingAssets={};
    var cbFinished=null;
    var percent=0;

    this.setOnFinishedLoading=function(cb)
    {
        cbFinished=cb;
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
                // console.log(loadingAssets[i].type+': '+loadingAssets[i].finished+': '+loadingAssets[i].name );
            }
            // if(countFinished===0) console.log('all loaded');
        }

        percent=(count-countFinished)/count;
        // console.log(countFinished+'/'+count,'perc:',percent);

        if(CGL.onLoadingAssetsFinished)
        {
            console.warn('CGL.onLoadingAssetsFinished is deprecated, please use config parameter onFinishedLoading with scene/patch constructor');
            cbFinished=CGL.onLoadingAssetsFinished;
        }

        if(countFinished===0 && cbFinished)
        {
            setTimeout(cbFinished,200);
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
        var id=generateUUID();
        loadingAssets[id]=({id:id,type:type,name:name,finished:false});
        // console.log('LOAD: '+loadingAssets[id].type+': '+loadingAssets[id].finished+': '+loadingAssets[id].name );

        return id;
    };
};
