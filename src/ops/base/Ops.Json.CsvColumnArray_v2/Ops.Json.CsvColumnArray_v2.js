const
    colName=op.inString("Column Name","name"),
    inArr=op.inArray("CSV Array"),
    result=op.outArray("Result");

colName.onChange=
    inArr.onChange=update;

function update()
{
    let iArr=inArr.get();
    let iName=colName.get();

    if(!iArr)
    {
        result.set(null);
        return;
    }

    if(iArr[0].hasOwnProperty(iName))
    {
        let arr=[];

        for(let i=0;i<iArr.length;i++)
        {
            arr.push(iArr[i][iName]);
        }
        result.set(arr);
    }

}