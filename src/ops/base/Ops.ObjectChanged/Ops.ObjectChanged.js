let inObj = op.inObject("Object");
let next = op.outTrigger("Next");

let obj = null;

inObj.onChange = function ()
{
    if (inObj.get() != obj)
    {
        obj = inObj.get();
        next.trigger();
    }
};
