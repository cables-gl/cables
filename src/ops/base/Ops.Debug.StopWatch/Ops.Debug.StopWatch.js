const
    exec = op.inTrigger("exec"),
    next = op.outTrigger("next"),
    timeUsed = op.outNumber("Time used"),
    outTImes = op.outArray("Times");

let times = [];
times.length = 100;
for (let i = 0; i < times.length; i++)
{
    times[i] = 0;
}

let count = 0;
outTImes.set(times);

exec.onTriggered = function ()
{
    let start = performance.now();
    next.trigger();
    let end = performance.now();

    let l = end - start;
    times[count] = l;
    count++;
    if (count >= 100)count = 0;

    timeUsed.set(l);
    outTImes.set(null);
    outTImes.set(times);
};
