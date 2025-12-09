const
    inId = op.inString("ID", "fail"),
    inMessage = op.inString("Message", "a critical error happened!"),
    exit = op.inTriggerButton("Exit");

exit.onTriggered = () =>
{
    // op.patch.exitError(inId.get(), inMessage.get());
};
