
var patch=this.patch;
this.name='csv json array';

var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var result=this.addOutPort(new Port(this,"result",OP_PORT_TYPE_ARRAY));
var len=this.addOutPort(new Port(this,"num items",OP_PORT_TYPE_VALUE));

var reload=function()
{
    CABLES.ajax(
        patch.getFilePath(filename.val),
        function(err,_data,xhr)
        {
            var data=JSON.parse(_data)
            result.set(data);
            len.set(data.length);

        });

};

filename.onValueChanged=reload;