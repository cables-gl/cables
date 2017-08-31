op.name="AjaxRequest";

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var outData=op.addOutPort(new Port(op,"data",OP_PORT_TYPE_OBJECT));
var isLoading=op.outValue("Is Loading",false);

var jsonp=op.inValueBool("JsonP",false);

outData.ignoreValueSerialize=true;

filename.onChange=delayedReload;
jsonp.onChange=delayedReload;

var loadingId=0;
var reloadTimeout=0;

function delayedReload()
{
    clearTimeout(reloadTimeout);
    reloadTimeout=setTimeout(reload,100);
}

function reload()
{
    if(!filename.get())return;
    
    op.patch.loading.finished(loadingId);
    
    loadingId=op.patch.loading.start('jsonFile',''+filename.get());
    isLoading.set(true);

    var f=CABLES.ajax;
    if(jsonp.get())f=CABLES.jsonp;



    f(
        op.patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            try
            {
                var data=_data;
                if(typeof data === 'string') data=JSON.parse(_data);

                if(outData.get())outData.set(null);
                outData.set(data);
                op.uiAttr({'error':''});
                op.patch.loading.finished(loadingId);
                isLoading.set(false);
            }
            catch(e)
            {
                console.log('exc... ',filename.get(),jsonp.get());
                op.uiAttr({'error':'error loading json'});
                op.patch.loading.finished(loadingId);
                isLoading.set(false);
            }
        });
    
}

