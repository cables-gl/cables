var patch=this.patch;
Op.apply(this, arguments);

this.name='jsonFile';
var self=this;
filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));
var result=this.addOutPort(new Port(this,"result",OP_PORT_TYPE_OBJECT));
result.ignoreValueSerialize=true;

var reload=function()
{

CABLES.ajax(
    patch.getFilePath(filename.get()),
    function(err,_data,xhr)
    {
        try
        {
            var data=JSON.parse(_data);
            result.set(data);
            self.uiAttr({'warning':''});
        }
        catch(e)
        {
            self.uiAttr({'warning':'error loading json'});
        }
    });
    
};

filename.onValueChanged=reload;