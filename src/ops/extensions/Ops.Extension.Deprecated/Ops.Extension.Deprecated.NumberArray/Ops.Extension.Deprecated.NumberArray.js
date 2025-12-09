let numValues = op.inValueInt("numValues");

let values = op.addOutPort(new CABLES.Port(op, "values", CABLES.OP_PORT_TYPE_ARRAY));
values.ignoreValueSerialize = true;

numValues.set(100);

numValues.onChange = init;

let arr = [];
init();

function init()
{
    arr.length = Math.abs(Math.floor(numValues.get())) || 100;
    for (let i = 0; i < arr.length; i++)arr[i] = 0;

    values.set(null);
    values.set(arr);
}
