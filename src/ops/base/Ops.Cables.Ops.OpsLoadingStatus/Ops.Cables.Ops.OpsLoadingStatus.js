const inOps = op.inArray("Ops"),
    outProgress = op.outNumber("Progress"),
    outLoading = op.outBoolNum("Loading");

op.patch.loading.on("finishedTask", updateStatusSoon);
op.patch.loading.on("finishedAll", updateStatusSoon);
op.patch.loading.on("startTask", updateStatusSoon);
op.patch.loading.on("addAssetTask", updateStatusSoon);

let soon = null;
updateStatusSoon();

function updateStatusSoon()
{
    soon = CABLES.idleCallbackSoon(soon, updateStatus);
}

function updateStatus()
{
    const ops = inOps.get() || [];
    const jobs = op.patch.loading.getList();

    for (let j = 0; j < jobs.length; j++)
    {
        if (jobs[j].op && !jobs[j].finished)
        {
            for (let i = 0; i < ops.length; i++)
            {
                if (ops[i] == jobs[j].op)
                {
                    return outLoading.set(true);
                }
            }
        }
    }
    outLoading.set(false);
}
