const outTime = op.outNumber("time");

op.patch.on("timelineScrub", update);

function update(scrubbedTime)
{
    outTime.set(scrubbedTime);
}
