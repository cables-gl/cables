const
    i = op.inObject("Object"),
    r = op.outObject("Result");

i.onChange = () =>
{
    r.setRef(i.get());
};
