CABLES=CABLES||{};
CABLES.Profiler=function()
{
    var items={};
    var currentId=null;
    var currentStart=0;

    this.getItems=function()
    {
        return items;
    };

    this.clear=function()
    {
        items={};
    };

    this.add=function(type,object)
    {
        if(currentId!==null)
            if(!object || object.id!=currentId)
            {
                if(items[currentId])
                {
                    // console.log(currentStart);
                    items[currentId].timeUsed+=(performance.now()-currentStart);
                }
            }

        if(object!==null)
        {
            if(!items[object.id])
                items[object.id]=
                {
                    numTriggers:0,
                    timeUsed:0
                };

            items[object.id].numTriggers++;
            items[object.id].title=object.parent.name+' '+object.name;

            currentId=object.id;
            currentStart=performance.now();

        }
        else
        {
            currentId=null;
        }

    };

    this.print=function()
    {
        console.log('--------');
        for(var i in items)
        {
            console.log(items[i].title+': '+items[i].numTriggers+' / '+items[i].timeUsed);
        }
    };






};
