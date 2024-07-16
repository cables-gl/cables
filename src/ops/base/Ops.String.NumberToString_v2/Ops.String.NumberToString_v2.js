const
    val = op.inValue("Number"),
    decPlaces = op.inInt("Decimal Places", 4),
    result = op.outString("Result");

let doDec = false;
let decm = 1;
decPlaces.onChange = updateDecm;
val.onChange = update;
updateDecm();
update();

function updateDecm()
{
    doDec = decPlaces.get() < 100;
    decm = Math.pow(10, decPlaces.get());
    update();
}

function update()
{
    if (doDec)
        result.set(String(Math.round(val.get() * decm) / decm));
    else
        result.set(String(val.get() || 0));
}
