const
    inAnim = op.inObject("Anim"),
    outTimes = op.outArray("Time"),
    outValues = op.outArray("Values");

inAnim.onChange = update;

function update()
{
    const arrTimes = [];
    const arrValues = [];

    const anim = inAnim.get() || new CABLES.Anim();
    if (anim)
    {
        for (let i = 0; i < anim.keys.length; i++)
        {
            console.log(anim.keys[i]);
            arrTimes.push(anim.keys[i].time);
            arrValues.push(anim.keys[i].value);
        }
    }

    outTimes.setRef(arrTimes);
    outValues.setRef(arrValues);
}
