const
    inObj1 = op.inObject("Object1"),
    inObj2 = op.inObject("Object2"),
    inObj3 = op.inObject("Object3"),
    inObj4 = op.inObject("Object4"),
    inObj5 = op.inObject("Object5");

let outObj = op.outObject("Out Object");

inObj1.onChange = function ()
{
    outObj.setRef(inObj1.get());
};

inObj2.onChange = function ()
{
    outObj.setRef(inObj2.get());
};

inObj3.onChange = function ()
{
    outObj.setRef(inObj3.get());
};

inObj4.onChange = function ()
{
    outObj.setRef(inObj4.get());
};

inObj5.onChange = function ()
{
    outObj.setRef(inObj5.get());
};
