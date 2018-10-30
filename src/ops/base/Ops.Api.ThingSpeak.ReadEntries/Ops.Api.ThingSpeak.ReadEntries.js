op.name="ReadEntries";

// see https://de.mathworks.com/help/thingspeak/get-a-channel-feed.html

var dummyKey = "12345";
var dummyChannelId = "12345";

var read = op.addInPort( new CABLES.Port( this, "Read",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var channelId = op.inValue("Channel ID", dummyChannelId);
var readApiKey = op.inValueString("Read API Key", dummyKey);

// https://api.thingspeak.com/channels/12345/feeds.json?results=2
var apiUrlPart1 = "https://api.thingspeak.com/channels/";
var apiUrlPart2 = "/feeds.json";

var finished = op.outTrigger("When Finished");
var entries = op.outArray("Entries");
var channelInfos = op.outObject("Channel Infos");
var success = op.outValue("Success", false);

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4) {
            if(xmlHttp.status == 200){
                callback(JSON.parse(xmlHttp.responseText));
            } else {
                op.log("ThingSpeak Error! Status: " + xmlHttp.status + ', ' + xmlHttp.statusText + ", see https://de.mathworks.com/help/thingspeak/error-codes.html");
            }
        }
    };
    xmlHttp.open("GET", theUrl, true); // true for asynchronous
    xmlHttp.send(null);
}

function handleResponse(response) {
    if(response == -1) {
        success.set(false);
        op.uiAttr( { 'error': 'Error: You do not have access to the channel!' } );
    } else {
        entry.set(response.feeds);
        channelInfos.set(response.channel);
        success.set(true);
        // TODO: Remove UI-Error Attribute
    }
    finished.trigger();
}

read.onTriggered = function(){
    success.set(false);
    if(channelId.get() !== dummyChannelId) {
        var requestUrl = apiUrlPart1 + channelId.get() + apiUrlPart2;
        if(readApiKey.get() != dummyKey){
            requestUrl += "?" + "api_key=" + readApiKey.get();
        }
        httpGetAsync(requestUrl, handleResponse);
    } else {
        op.uiAttr( { 'error': 'You need to enter a channel Id!' } );
    }
};
