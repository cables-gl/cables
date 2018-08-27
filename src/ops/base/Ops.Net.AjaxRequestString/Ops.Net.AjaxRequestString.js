const filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));
const reloadBtn=op.inFunctionButton("reload");
const jsonp=op.inValueBool("JsonP",false);
const outData=op.outValue("Result");
const isLoading=op.outValue("Is Loading",false);

filename.onChange=delayedReload;
reloadBtn.hidePort();
reloadBtn.onTriggered=reload;
jsonp.onChange=delayedReload;

var loadingId=0;
var reloadTimeout=0;

function delayedReload()
{
    clearTimeout(reloadTimeout);
    reloadTimeout=setTimeout(reload,100);
}


op.onFileChanged=function(fn)
{
    if(filename.get() && filename.get().indexOf(fn)>-1)
    {
        reload();
    }
};


function reload()
{
    if(!filename.get())return;

    op.patch.loading.finished(loadingId);

    loadingId=op.patch.loading.start('jsonFile',''+filename.get());
    isLoading.set(true);

    var f=CABLES.ajax;
    if(jsonp.get())f=CABLES.jsonp;

    f(
        op.patch.getFilePath(filename.get())+'?nc='+CABLES.uuid(),
        function(err,data,xhr)
        {
            try
            {
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
