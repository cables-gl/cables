const next = op.outTrigger("Next");

op.patch.on("PatchStart", () =>
{
    console.log("PatchStart!!!!!!!!!!!!!");
    next.trigger();
});
