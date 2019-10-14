const inArr=op.inArray("Array"),
 outArr=op.outArray("Result");

 inArr.onChange=function()
 {
     var arr=inArr.get();
    outArr.set(null);

     if(!arr)
     {
         return;
     }


    var newArr=arr.slice(0);
    newArr=newArr.flat(Infinity);

    outArr.set(newArr);


 };
