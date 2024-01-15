const loaded = op.outTrigger("Font Loaded");

document.fonts.ready.then(function (e)
{
    loaded.trigger();
});

document.fonts.addEventListener("loadingdone", (event) =>
{
    console.log("font loaded");
    loaded.trigger();
});
