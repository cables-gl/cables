const
    queryPort = op.inString("Query"),
    elementPort = op.outObject("Element");

queryPort.onChange = update;

function update()
{
    const q = queryPort.get();
    try
    {
        const el = document.querySelector(q);
        elementPort.set(el);
    }
    catch (e)
    {
        op.error(e);
    }
}
