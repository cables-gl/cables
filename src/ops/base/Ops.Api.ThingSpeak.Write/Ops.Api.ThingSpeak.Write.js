op.name="ThingSpeakWrite";

var dummyKey = "12345";

var write = op.addInPort( new CABLES.Port( this, "Write",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var field= op.inValueString("Field", "field1");
var value = op.inValueString("Value", "");
var writeApiKey = op.inValueString("Write API Key", dummyKey);

var apiUrl = "https://api.thingspeak.com/update?";

var finished = op.outTrigger("When Finished");
var success = op.outValue("Success", false);
var rows = op.outValue("Rows", 0);

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            if(xmlHttp.status == 200){
                callback(xmlHttp.responseText);
            } else {
                op.log("ThingSpeak Error! Status: " + xmlHttp.status + ', ' + xmlHttp.statusText + ", see https://de.mathworks.com/help/thingspeak/error-codes.html");
            }
        }
    };
    xmlHttp.open("POST", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function handleResponse(response) {
    if(isNaN(response)) {
        op.uiAttr( { 'error': 'Error: Write failed. Response: ' + response } );
        success.set(false);
        rows.set(0);
    } else {
        if(response == 0) {
            success.set(false);
            rows.set(0);
            op.uiAttr( { 'error': 'Error: Write failed. Maybe you write too often!? Response: ' + response } );
        } else {
            rows.set(response);
            success.set(true);
            // TODO: Remove UI-Error Attribute
        }
    }
    finished.trigger();
}

write.onTriggered = function(){
    success.set(false);
    if(writeApiKey.get() !== dummyKey) {
        var requestUrl = apiUrl + "api_key=" + writeApiKey.get() + "&" + field.get() + "=" + value.get();
        httpGetAsync(requestUrl, handleResponse);

    } else {
        op.uiAttr( { 'error': 'API Key or API URL invalid!' } );
    }
};
