const
    queryPort = op.inString('Query'),
    elementPort = op.outObject('Element');

queryPort.onChange = update;

function update() {
    var q = queryPort.get();
    try
    {
        var el = document.querySelector(q);
        elementPort.set(el);
    }
    catch(e)
    {
        console.log(e);
    }
}