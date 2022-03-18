# Trigger Ports

This page will explain how to create an input and output port of the type`Trigger`and how to make a `Button` in the UI pane of the op which can be clicked with the mouse to trigger an event<br>
![Button](../img/creating_ports_trigger_port_color.png) <br>

Click this [link](https://cables.gl/ui/#/project/5b9f692e671e52e512ab3af3) to see an example of all port types and code examples

Trigger ports are used to trigger another op. If you have a patch that creates visuals then you need to add the`MainLoop op`which has a `trigger port`. This updates all connected ports 60 times a second.
Trigger ports can also be triggered under certain conditions <br>
For example the `Mouse op` sends a trigger out of the `click port` once a user has clicked in the preview pane

```javascript
// strict mode allows us to write cleaner code
"use strict";

// Create a input port of the type Trigger
const inExecute  = op.inTrigger("Trigger In",{"display": "button"});
// create a button in UI panel of the op which can be clicked
const inButton   = op.inTriggerButton("Press me");

// Create a output port of the type Trigger
const outTrigger = op.outTrigger("Trigger out");

// when input port is triggered call the function 'update'
inExecute.onTriggered = update;
// if user presses the button in the op pane call function 'update'
inButton.onTriggered = update;

// this function runs every time the input port is triggered
function update()
{
    // send a trigger out of the output port
    outTrigger.trigger();
}
```

Follow this [link](../../dev_callbacks/dev_callbacks) for more information on Callbacks
