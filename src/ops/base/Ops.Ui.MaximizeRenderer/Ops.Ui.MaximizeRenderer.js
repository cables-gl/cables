const inMaxRenderer = op.inTriggerButton("Toggle maximized");
const outMaxRenderer = op.outBoolNum("Maximized", false);

let windowListener = null;
let rendererListener = null;

if (window.gui)
{
    rendererListener = window.gui.on("canvasModeChange", (event) =>
    {
        outMaxRenderer.set(event === 2);
    });
}

inMaxRenderer.onTriggered = () =>
{
    if (window.gui)
    {
        window.gui.toggleMaximizeCanvas();
    }
};

op.onDelete = () =>
{
    if (rendererListener) window.gui.off(rendererListener);
};
