const
    goback = op.inTrigger("Back"),
    goforw = op.inTrigger("Forward");

goback.onTriggered = () =>
{
    history.back();
};

goforw.onTriggered = () =>
{
    history.forward();
};
