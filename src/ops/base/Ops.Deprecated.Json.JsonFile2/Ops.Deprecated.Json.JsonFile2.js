op.name="JsonFile2";

var filename=op.addInPort(new CABLES.Port(op,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var outData=op.addOutPort(new CABLES.Port(op,"data",CABLES.OP_PORT_TYPE_OBJECT));
var isLoading=op.outValue("Is Loading",false);

var jsonp=op.inValueBool("JsonP",false);

outData.ignoreValueSerialize=true;
var patch=op.patch;


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
    
    patch.loading.finished(loadingId);
    
    loadingId=patch.loading.start('jsonFile',''+filename.get());
    isLoading.set(true);

    var f=CABLES.ajax;
    if(jsonp.get())f=CABLES.jsonp;

    f(
        patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            try
            {
                var data=_data;
                if(typeof data === 'string') data=JSON.parse(_data);

                if(outData.get())outData.set(null);
                outData.set(data);
                op.uiAttr({'error':''});
                patch.loading.finished(loadingId);
                isLoading.set(false);
            }
            catch(e)
            {
                op.uiAttr({'error':'error loading json'});
                patch.loading.finished(loadingId);
                isLoading.set(false);
            }
        });
    
};

