const
    outAngle = op.outNumber("Angle"),
    outType = op.outString("Type");

screen.orientation.addEventListener("change", update);
update();

function update()
{
    outAngle.set(screen.orientation.angle);
    outType.set(screen.orientation.type);
}
