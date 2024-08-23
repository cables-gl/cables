const
    time = op.inValue("Time"),
    speed = op.inFloat("Frequency", 1),
    type = op.inValueSelect("Type", ["sine", "triangle", "ramp up", "ramp down", "square"], "sine"),
    phase = op.inValue("Phase", 0),
    rangeMin = op.inValue("Range Min", -1),
    rangeMax = op.inValue("Range Max", 1),
    result = op.outNumber("Result");

let v = 0;
type.onChange = updateType;

updateType();

const PI2 = Math.PI / 2;

function updateType()
{
    if (type.get() == "sine") time.onChange = sine;
    if (type.get() == "ramp up") time.onChange = rampUp;
    if (type.get() == "ramp down") time.onChange = rampDown;
    if (type.get() == "square") time.onChange = square;
    if (type.get() == "triangle") time.onChange = triangle;
}

function updateTime()
{
    return (time.get() * speed.get()) + phase.get();
}

function square()
{
    let t = updateTime() + 0.5;
    v = t % 2.0;
    if (v <= 1.0)v = -1;
    else v = 1;
    v = CABLES.map(v, -1, 1, rangeMin.get(), rangeMax.get());
    result.set(v);
}

function rampUp()
{
    let t = (updateTime() + 1);
    v = t % 1.0;
    v -= 0.5;
    v *= 2.0;
    v = CABLES.map(v, -1, 1, rangeMin.get(), rangeMax.get());
    result.set(v);
}

function rampDown()
{
    let t = updateTime();
    v = t % 1.0;
    v -= 0.5;
    v *= -2.0;
    v = CABLES.map(v, -1, 1, rangeMin.get(), rangeMax.get());
    result.set(v);
}

function triangle()
{
    let t = updateTime();
    v = t % 2.0;
    if (v > 1) v = 2.0 - v;
    v -= 0.5;
    v *= 2.0;
    v = CABLES.map(v, -1, 1, rangeMin.get(), rangeMax.get());
    result.set(v);
}

function sine()
{
    let t = updateTime() * Math.PI - (PI2);
    v = Math.sin((t));
    v = CABLES.map(v, -1, 1, rangeMin.get(), rangeMax.get());
    result.set(v);
}
