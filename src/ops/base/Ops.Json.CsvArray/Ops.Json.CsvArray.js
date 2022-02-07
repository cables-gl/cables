const
    filename = op.inUrl("file"),
    result = op.outArray("result"),
    len = op.outNumber("num items");

const reload = function ()
{
    CABLES.ajax(
        op.patch.getFilePath(filename.get()),
        function (err, _data, xhr)
        {
            try
            {
                const data = JSON.parse(_data);
                result.set(data);
                len.set(data.length);
            }
            catch (e)
            {
                op.logError(e);
                result.set(null);
                len.set(0);
            }
        });
};

filename.onChange = reload;
