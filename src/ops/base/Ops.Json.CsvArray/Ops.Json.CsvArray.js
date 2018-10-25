
var filename=op.addInPort(new CABLES.Port(op,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var result=op.addOutPort(new CABLES.Port(op,"result",CABLES.OP_PORT_TYPE_ARRAY));
var len=op.addOutPort(new CABLES.Port(op,"num items",CABLES.OP_PORT_TYPE_VALUE));

var reload=function()
{
    CABLES.ajax(
        op.patch.getFilePath(filename.val),
        function(err,_data,xhr)
        {
            var data=JSON.parse(_data);
            result.set(data);
            len.set(data.length);

        });

};

filename.onValueChanged=reload;