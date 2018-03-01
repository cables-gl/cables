# CustomEventListener

*Ops.Html.Event.CustomEventListener*

Adds a custom event listener to the HTML DOM element.

## Input

### Element [Object]

The HTML DOM element to add the listener to

### Use Capture [Boolean]

If multiple elements register an event listenere setting `Use Capture` will make sure the listener will be called before the regular (bubble) listeners. For more infos read here: [javascript.info/bubbling-and-capturing](https://javascript.info/bubbling-and-capturing).

## Prevent Default [Boolean]

If set the default browser action for the event will not be executed. See [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault).

## Stop Propagation [Boolean]

Stops other elements’ event listeneres from getting called. See [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation).

## Output

### Event Trigger [Trigger]

Trigger when the event occured

### Event Object [Object]

The event object contains details about the event.