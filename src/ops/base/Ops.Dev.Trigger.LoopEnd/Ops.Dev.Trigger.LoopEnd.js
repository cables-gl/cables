const
    inScope = op.inScopeArea(),
    outFinished = op.outTrigger("Finished");

inScope.onChange = () =>
{
    outFinished.trigger();
};
