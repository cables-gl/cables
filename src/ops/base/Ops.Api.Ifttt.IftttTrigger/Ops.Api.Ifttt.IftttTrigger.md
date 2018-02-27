With this op you can trigger an applet on [IFTTT](https://ifttt.com/maker) to send an email, post to Facebook, turn on connected light bulbs and stuff like that.  
Create a new applet on [IFTTT](https://ifttt.com/create), search for `Maker`, then select  `Maker` as the trigger channel (the `if`-channel), select ` Receive a web request` enter an event-name (e.g. `button_pressed`) and press `Create trigger` to save the applet. Now you have to think about what should happen when the event is fired – press the `then`-button and create an action (e.g. send an email).

## Input

### Key [String]

Your API key for the channel.  

After you created a new applet with the maker channel go to [ifttt.com/maker](https://ifttt.com/maker) and click on `Settings` in the top right corner. You will now see some infos – here the URL part is important. Copy the last part of the URL into the `Key`-field in the `IFTTTTrigger`-op settings. E.g. `12345-12345678` for the URL `https://maker.ifttt.com/use/12345-12345678`.

![](img/api_key.jpg)

### Event Name [String]

When you create a new applet on IFTTT you will be asked for an event name for the trigger, use something like `button_pressed` (without spaces). This has to match the one you enter in the applet setup.

### Trigger [Function]

When pressed or triggered by another op it will trigger the recipe on IFTTT.