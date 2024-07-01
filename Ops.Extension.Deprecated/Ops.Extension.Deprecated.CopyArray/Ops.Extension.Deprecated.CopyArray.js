// input ports
let srcArrayPort = op.inArray("Source Array");

// output ports
let srcArrayOutPort = op.outArray("Source Array Out");
let arrayCopyPort = op.outArray("Array Copy");

// change listeners
srcArrayPort.onChange = function ()
{
    let srcArray = srcArrayPort.get();
    if (srcArray)
    {
        // var arrCopy = JSON.parse(JSON.stringify(srcArray));
        let arrCopy = srcArray.slice();
        srcArrayOutPort.set(srcArray);
        arrayCopyPort.set(arrCopy);
        op.log(arrCopy);
    }
    else
    {
        srcArrayOutPort.set([]);
        arrayCopyPort.set([]);
    }
};
