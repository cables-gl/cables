// input
let queryPort = op.inValueString("Query");

// output
let elementPort = op.outObject("Element");

queryPort.onChange = update;

function update()
{
    let q = queryPort.get();
    try
    {
        let el = document.querySelector(q);
        elementPort.set(el);
    }
    catch (e)
    {
        console.log(e);
    }
}
