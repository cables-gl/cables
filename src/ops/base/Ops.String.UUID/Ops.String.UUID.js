const
    generate = op.inTriggerButton("Generate"),
    result = op.outString("Id");

generate.onTriggered = update;
update();

function update()
{
    result.set(CABLES.uuid());
}
