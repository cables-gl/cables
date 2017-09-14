op.name="Cookie";

var outCookie=op.outObject("Cookie");

update();

function str_obj(str)
{
    str = str.split(';');
    var result = {};
    for (var i = 0; i < str.length; i++) {
        var cur = str[i].split('=');
        result[cur[0].trim()] = cur[1].trim();
    }
    return result;
}

function update()
{
    outCookie.set(str_obj(document.cookie));
}