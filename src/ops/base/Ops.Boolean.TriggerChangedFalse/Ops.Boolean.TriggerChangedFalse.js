let val = op.inValueBool("Value", false);
let next = op.outTrigger("Next");

let oldVal = 0;

val.onChange = function ()
{
    let newVal = val.get();
    if (oldVal && !newVal)
    {
        oldVal = false;
        next.trigger();
    }
    else
    {
        oldVal = true;
    }
};
