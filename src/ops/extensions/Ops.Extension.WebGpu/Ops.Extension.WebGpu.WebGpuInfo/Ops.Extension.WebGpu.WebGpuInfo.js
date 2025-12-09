const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    outLimits = op.outObject("Limits"),

    outAdVendor = op.outString("Vendor"),
    outAdArch = op.outString("Architecture"),
    outPresform = op.outString("Presentation Format");

let done = false;
exec.onTriggered = () =>
{
    const cgp = op.patch.cgp;

    if (cgp && !done)
    {
        done = true;
        const adapterInfo = cgp.adapter.info;
        outAdVendor.set(adapterInfo.vendor);
        outAdArch.set(adapterInfo.architecture);

        const limits = {};
        for (let i in cgp.device.limits) limits[i] = cgp.device.limits[i];
        outLimits.setRef(limits);

        outPresform.set(cgp.presentationFormat);
    }

    next.trigger();
};
