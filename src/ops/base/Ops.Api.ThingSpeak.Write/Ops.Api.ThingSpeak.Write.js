let dummyKey = "12345";

let write = op.addInPort(new CABLES.Port(this, "Write", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let field = op.inString("Field", "field1");
let value = op.inString("Value", "");
let writeApiKey = op.inString("Write API Key", dummyKey);

let apiUrl = "https://api.thingspeak.com/update?";

let finished = op.outTrigger("When Finished");
let success = op.outValue("Success", false);
let rows = op.outValue("Rows", 0);

function httpGetAsync(theUrl, callback)
{
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function ()
    {
        if (xmlHttp.readyState == 4)
        {
            if (xmlHttp.status == 200)
            {
                callback(xmlHttp.responseText);
            }
            else
            {
                op.log("ThingSpeak Error! Status: " + xmlHttp.status + ", " + xmlHttp.statusText + ", see https://de.mathworks.com/help/thingspeak/error-codes.html");
            }
        }
    };
    xmlHttp.open("POST", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function handleResponse(response)
{
    if (isNaN(response))
    {
        op.uiAttr({ "error": "Error: Write failed. Response: " + response });
        success.set(false);
        rows.set(0);
    }
    else
    {
        if (response == 0)
        {
            success.set(false);
            rows.set(0);
            op.uiAttr({ "error": "Error: Write failed. Maybe you write too often!? Response: " + response });
        }
        else
        {
            rows.set(response);
            success.set(true);
            // TODO: Remove UI-Error Attribute
        }
    }
    finished.trigger();
}

write.onTriggered = function ()
{
    success.set(false);
    if (writeApiKey.get() !== dummyKey)
    {
        let requestUrl = apiUrl + "api_key=" + writeApiKey.get() + "&" + field.get() + "=" + value.get();
        httpGetAsync(requestUrl, handleResponse);
    }
    else
    {
        op.uiAttr({ "error": "API Key or API URL invalid!" });
    }
};
