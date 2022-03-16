let text = op.inStringEditor("text", "hello world");
let inRestart = op.inTriggerButton("Restart");
let speed = op.inValue("Speed", 500);
let speedVariation = op.inValueSlider("Speed Variation");
const showCursor = op.inBool("Show Cursor", true);

let outText = op.outString("Result");
let outChanged = op.outTrigger("Changed");
let outFinished = op.outTrigger("Finished");

outText.set("  \n  ");
let pos = 0;
let updateInterval = 0;
let cursorblink = true;
let finished = false;

function setNewTimeout()
{
    clearTimeout(updateInterval);
    let ms = speed.get() * (Math.random() * (speedVariation.get() * 2 - 1));
    if (text.get() && pos > text.get().length)ms = speed.get();
    updateInterval = setTimeout(update, speed.get() + ms);
}

inRestart.onTriggered = function ()
{
    finished = false;
    pos = 0;
    setNewTimeout();
};

function update()
{
    if (!text.get() || text.get() === "" || text.get() === "0" || text.get() == "0")
    {
        outText.set(" ");
        return;
    }

    let t = text.get().substring(0, pos);
    cursorblink = !cursorblink;

    if (pos > text.get().length && cursorblink)
    {
        if (showCursor.get())
        {
            // t+=' ';
            // pos++;
        }

        if (!finished)
        {
            outFinished.trigger();
            finished = true;
        }
    }
    else
    {
        finished = false;
        if (showCursor.get())
        {
            t += "_";
        }
        pos++;
    }

    outText.set(t);
    outChanged.trigger();
    setNewTimeout();
}

text.onChange = function ()
{
    finished = false;
    pos = 0;
    setNewTimeout();
    outText.set("");
};
