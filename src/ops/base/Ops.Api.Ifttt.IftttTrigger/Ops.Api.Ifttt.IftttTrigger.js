let dummyKey = "1234567890";
let dummyEventName = "your_event_name";

let key = op.inValueString("Key", dummyKey);
let eventName = op.inValueString("Event Name", dummyEventName);
let trigger = op.inTriggerButton("Trigger");

// Complete URL looks like this:
// https://maker.ifttt.com/trigger/button_pressed/with/key/1234567-12345678901234
let baseUrlPart1 = "https://maker.ifttt.com/trigger/";
let baseUrlPart2 = "/with/key/";

trigger.onTriggered = function ()
{
    let url = baseUrlPart1 + eventName.get() + baseUrlPart2 + key.get();
    op.log("IFTTT Triggering: " + url);

    if (key.get())
    {
        if (key.get().trim() == dummyKey)
        {
            if (CABLES.UI)
            {
                op.uiAttr({ "warning": "You have to enter your own API key first! Check out the docs below!" });
                op.refreshParams();
            }
        }
        else
        {
            if (CABLES.UI)
            {
                op.uiAttr({ "warning": null }); // clear UI warning
                op.refreshParams();
            }
            CABLES.ajax(
                url,
                function (err, _data, xhr)
                {
                    if (err)
                    {
                        op.log("Error: Could not trigger IFTTT applet :/");
                    }
                }
            );
        }
    }
};
