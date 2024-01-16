const loaded = op.outTrigger("Font Loaded");

document.fonts.ready.then(function (e)
{
    loaded.trigger();
});

document.fonts.addEventListener("loadingdone", (event) =>
{
    loaded.trigger();
});
