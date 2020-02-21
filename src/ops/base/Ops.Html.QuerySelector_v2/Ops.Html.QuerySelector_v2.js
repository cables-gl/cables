// input
var queryPort = op.inString('Query');

// output
var elementPort = op.outObject('Element');

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