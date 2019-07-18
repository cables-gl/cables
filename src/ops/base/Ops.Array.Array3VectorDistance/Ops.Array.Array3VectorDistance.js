const inArray1=op.inArray("Array in 1"),
        inArray2=op.inArray("Array in 2"),
        outArray=op.outArray("Array out"),
        newArr=[];

outArray.set(newArr);

var showingError = false;

inArray1.onChange = inArray2.onChange = update;
function update()
{
    var arr1=inArray1.get();
    var arr2=inArray2.get();

    newArr.length = 0;

    if(!arr1 || !arr2)
    {
        outArray.set(null);
        return;
    }

    if(arr1.length !== arr2.length)
    {
        if(!showingError)
        {
            op.uiAttr({error:"Arrays do not have the same length !"});
            showingError = true;
        }
        return;
    }

    if(showingError)
    {
        showingError = false;
        op.uiAttr({error:null});
    }

    if(newArr.length!=arr1.length)newArr.length=arr1.length;

    var divisibleBy3 = newArr.length % 3 === 0;
    newArr.length = Math.floor(arr1.length/3);

    if(divisibleBy3 === false)
    {
        if(!showingError)
        {
            op.uiAttr({error:"Arrays length not divisible by 3 !"});
            showingError = true;
        }
        return;
    }

    var vec1 = vec3.create();
    var vec2 = vec3.create();

    for(var i=0;i<newArr.length;i++)
    {
        vec3.set(vec1,
                arr1[i*3+0],
                arr1[i*3+1],
                arr1[i*3+2]);

        vec3.set(vec2,
                arr2[i*3+0],
                arr2[i*3+1],
                arr2[i*3+2]);

        newArr[i] = vec3.distance(vec1,vec2) ;
    }

    outArray.set(null);
    outArray.set(newArr);
};
