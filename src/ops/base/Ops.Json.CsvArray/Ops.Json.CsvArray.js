const
    filename=op.inUrl("file"),
    result=op.outArray("result"),
    len=op.outNumber("num items");

var reload=function()
{
    CABLES.ajax(
        op.patch.getFilePath(filename.val),
        function(err,_data,xhr)
        {
            try
            {
                var data=JSON.parse(_data);
                result.set(data);
                len.set(data.length);
            }
            catch(e)
            {
                console.log(e);
                result.set(null);
                len.set(0);
            }
        });

};

filename.onChange=reload;