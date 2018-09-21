const onResize=op.outFunction("Resized");

op.patch.cgl.addEventListener("resize",resize);

function resize()
{
    onResize.trigger();
}
