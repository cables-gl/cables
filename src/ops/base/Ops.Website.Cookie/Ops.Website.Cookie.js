const
    outCookie = op.outObject("Cookie"),
    outString = op.outString("Cookie String");

update();

function str_obj(str)
{
    str = str.split(";");
    const result = {};

    for (let i = 0; i < str.length; i++)
    {
        const cur = str[i].split("=");
        if (cur.length > 1) result[cur[0].trim()] = cur[1].trim();
    }
    return result;
}

function update()
{
    outCookie.setRef(str_obj(document.cookie));
    outString.set(document.cookie);
}
