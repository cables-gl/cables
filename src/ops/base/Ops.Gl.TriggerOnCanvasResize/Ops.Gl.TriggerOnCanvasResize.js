const onResize = op.outTrigger("Resized");

let listener = op.patch.cgl.on("resize", resize);

function resize()
{
    onResize.trigger();
}

op.onDelete = () =>
{
    op.patch.cgl.off(listener);
};
