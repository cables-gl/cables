const
    paramName=op.inString("parameter"),
    def=op.inString("Default"),
    result=op.outString("result");

def.onChange=paramName.onChange=update;

var query = {};
var a = window.location.search.substr(1).split('&');

update();

for (var i = 0; i < a.length; i++)
{
    var b = a[i].split('=');
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
}

function update()
{
    if(!query.hasOwnProperty(paramName.get()))
    {
        result.set(def.get()||null);
    }
    else
    {
        var v=query[paramName.get()];
        if(v==='true')v=true;
        else if(v==='false')v=false;

        result.set(v);
    }
}

