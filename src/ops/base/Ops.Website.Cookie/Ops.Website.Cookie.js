op.name="Cookie";

var outCookie=op.outObject("Cookie");

update();

function str_obj(str)
{
    str = str.split(';');
    
    console.log('strings',str);
    
    var result = {};
    
    for (var i = 0; i < str.length; i++)
    {
        var cur = str[i].split('=');
        if(cur.length>1) result[cur[0].trim()] = cur[1].trim();
    }
    return result;
}

function update()
{
    outCookie.set(str_obj(document.cookie));
}