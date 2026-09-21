const
    inScope = op.inScopeArea(),
    outFinished = op.outTrigger("Finished"),
    outArr = op.outArray("Comp Result");

inScope.onChange = (data) =>
{
    const arr = inScope.get();
    if (arr) outArr.setRef(inScope.get().arr);
    else outArr.setRef([]);

    outFinished.trigger();
};
