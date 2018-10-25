var paramName=op.addInPort(new CABLES.Port(op,"parameter",CABLES.OP_PORT_TYPE_VALUE,{type:"string"}));
var result=op.addOutPort(new CABLES.Port(op,"result",CABLES.OP_PORT_TYPE_VALUE,{type:"string"}));
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
    if(!query.hasOwnProperty(paramName.get()))
    {
        result.set(def.get()||false);
    }
    else
    {
        var v=query[paramName.get()];
        if(v==='true')v=true;
        else if(v==='false')v=false;
        
        result.set(v);
    }
}

paramName.onValueChanged=update;
update();
