const
    str=op.inStringEditor("JSON String",'{}',"json"),
    outObj=op.outObject("Result"),
    isValid=op.outValue("Valid");

str.onChange=parse;
parse();

function parse()
{
    try
    {
        var obj=JSON.parse(str.get());
        outObj.set(null);
        outObj.set(obj);
        isValid.set(true);
        op.setUiError("invalidjson",null);
    }
    catch(ex)
    {
        console.log(JSON.stringify(ex));
        isValid.set(false);

        var outStr="";
        var parts=ex.message.split(" ");
        for(var i=0;i<parts.length-1;i++)
        {
            var num=parseFloat(parts[i+1]);
            if(num && parts[i]=="position")
            {
                const outStrA=str.get().substring(num-15, num);
                const outStrB=str.get().substring(num, num+1);
                const outStrC=str.get().substring(num+1, num+15);
                outStr='<span style="font-family:monospace;background-color:black;">'+outStrA+'<span style="font-weight:bold;background-color:red;">'+outStrB+"</span>"+outStrC+" </span>";
            }
        }

        op.setUiError("invalidjson","INVALID JSON<br/>can not parse string to object:<br/><b> "+ex.message+'</b><br/>'+outStr);
    }
}
