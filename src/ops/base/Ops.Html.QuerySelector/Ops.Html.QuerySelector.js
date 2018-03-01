// input
var queryPort = op.inValueString('Query');

// output
var elementPort = op.outObject('Element');

queryPort.onChange = update;

function update() {
    var q = queryPort.get();
    var el = document.querySelector(q);
    elementPort.set(el);
}