const onResize = op.outTrigger("Resized");

let listener = op.patch.cgl.on("resize", resize);

function resize()
{
    console.log((new Error()).stack);

    onResize.trigger();
}

op.onDelete = () =>
{
    op.patch.cgl.off(listener);
};
