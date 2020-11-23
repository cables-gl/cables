const
    inArr=op.inArray("Array"),
    inString=op.inString("String",""),
    result=op.outArray("Result");

const arr=[];

    inString.onChange=
    inArr.onChange=
    function()
    {
        const oldArr=inArr.get();
        result.set(null);
        if(!oldArr)return;

        arr.length=oldArr.length+1;
        for(let i=0;i<oldArr.length;i++)
        {
            arr[i]=oldArr[i];
        }

        arr[oldArr.length]=inString.get();

        result.set(arr);

    };
