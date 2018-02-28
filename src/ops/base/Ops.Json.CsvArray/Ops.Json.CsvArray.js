
var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var result=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_ARRAY));
var len=op.addOutPort(new Port(op,"num items",OP_PORT_TYPE_VALUE));

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