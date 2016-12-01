op.name="IFTTTTrigger";

var dummyKey = "1234567890";
var dummyEventName = "your_event_name";

var key = op.inValueString("Key", dummyKey);
var eventName = op.inValueString("Event Name", dummyEventName);
var trigger = op.addInPort( new Port( this, "Trigger", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));

// Complete URL looks like this:
// https://maker.ifttt.com/trigger/button_pressed/with/key/1234567-12345678901234
var baseUrlPart1 = "https://maker.ifttt.com/trigger/";
var baseUrlPart2 = "/with/key/";

trigger.onTriggered = function() {
  var url = baseUrlPart1 + eventName.get() + baseUrlPart2 + key.get();
  op.log("IFTTT Triggering: " + url);

  if(key.get()) {
    if(key.get().trim() == dummyKey) {
        // TODO: Show warning
        //op.uiAttr( { 'warning': 'You have to enter your own API key first! Check out the docs below!' } );
    } else {
      // TODO: Hide warning
      //op.uiAttr( { 'warning': null } ); // clear warning
      CABLES.ajax (
        url,
        function(err, _data, xhr) {
          if(err) {
            op.log("Error: Could not trigger IFTTT applet :/");
          }
        });
    }
  }
};
