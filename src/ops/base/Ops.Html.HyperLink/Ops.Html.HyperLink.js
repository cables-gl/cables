const
    exec = op.inTrigger("open"),
    inUrl = op.inValueString("URL", "http://cables.gl");

exec.onTriggered = function ()
{
    op.patch.getDocument().location.href = inUrl.get();
};
