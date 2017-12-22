
var colName=op.inValueString("Column Name","name");
var inArr=op.inArray("CSV Array");

var result=op.outArray("Result");

colName.onChange=update;
inArr.onChange=update;

function update()
{
    
    var iArr=inArr.get();
    var iName=colName.get();
    
    if(!iArr)
    {
        result.set(null);
        return;
    }
    
    if(iArr[0].hasOwnProperty(iName))
    {
        var arr=[];

        for(var i=0;i<iArr.length;i++)
        {
            arr.push(iArr[i][iName]);
        }
        result.set(arr);
    }
    
}