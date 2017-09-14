op.name="UrlQueryParams";
var paramName=op.addInPort(new Port(op,"parameter",OP_PORT_TYPE_VALUE,{type:"string"}));
var result=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_VALUE,{type:"string"}));
var def=op.inValueString("Default");

def.onChange=update;

var query = {};
var a = window.location.search.substr(1).split('&');
for (var i = 0; i < a.length; i++)
{
    var b = a[i].split('=');
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
}

function update()
{
    // op.log(query);
    if(!query.hasOwnProperty(paramName.get()))
    {
        result.set(def.get());
    }
    else
    {
        result.set(query[paramName.get()]);
    }
    
}



paramName.onValueChanged=update;
update();

