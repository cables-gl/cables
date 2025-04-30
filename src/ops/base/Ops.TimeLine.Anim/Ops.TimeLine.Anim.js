const
    animVal = op.inValue("Value"),
    inloop = op.inBool("loop", false),
    outAnim = op.outObject("Anim", null, "anim");

animVal.setAnimated(true);
animVal.onChange = update;

inloop.onChange = () =>
{
    animVal.anim.setLoop(inloop.get());
};

function update()
{
    outAnim.setRef(animVal.anim);
}
