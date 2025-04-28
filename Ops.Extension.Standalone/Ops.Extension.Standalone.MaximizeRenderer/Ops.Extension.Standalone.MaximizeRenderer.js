const inToggleRenderer = op.inTriggerButton("Toggle renderer");
const inToggleWindow = op.inTriggerButton("Toggle window");

inToggleRenderer.onTriggered = () =>
{
    if (CABLES.CMD && CABLES.CMD.UI)
    {
        CABLES.CMD.UI.toggleMaxRenderer();
    }
};

inToggleWindow.onTriggered = () =>
{
    if (CABLES.CMD && CABLES.CMD.UI)
    {
        CABLES.CMD.UI.windowFullscreen();
    }
};
