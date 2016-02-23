var patch=this.patch;
Op.apply(this, arguments);

this.name='jsonFile';

filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var result=this.addOutPort(new Port(this,"result",OP_PORT_TYPE_OBJECT));
result.ignoreValueSerialize=true;

var reload=function()
{

CABLES.ajax(
    patch.getFilePath(filename.get()),
    function(err,_data,xhr)
    {
        var data=JSON.parse(_data);
        result.set(data);
        // console.log('data',data);
    });
    
};

filename.onValueChanged=reload;