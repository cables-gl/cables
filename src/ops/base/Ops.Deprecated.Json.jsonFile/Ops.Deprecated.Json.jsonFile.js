op.name='jsonFile';

var filename=op.addInPort(new Port(op,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var result=op.addOutPort(new Port(op,"result",CABLES.OP_PORT_TYPE_OBJECT));

result.ignoreValueSerialize=true;
var patch=op.patch;

var loadingId=0;
var reload=function()
{
    if(!filename.get())return;
    
    patch.loading.finished(loadingId);
    
    loadingId=patch.loading.start('jsonFile',''+filename.get());

    CABLES.ajax(
        patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            try
            {
                var data=JSON.parse(_data);
                if(result.get())result.set(null);
                result.set(data);
                op.uiAttr({'error':''});
                patch.loading.finished(loadingId);
            }
            catch(e)
            {
                op.uiAttr({'error':'error loading json'});
                patch.loading.finished(loadingId);
            }
        });
    
};

filename.onValueChanged=reload;