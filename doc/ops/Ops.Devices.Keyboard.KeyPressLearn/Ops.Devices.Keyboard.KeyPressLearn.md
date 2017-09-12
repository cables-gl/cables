# KeyPressLearn

*Ops.Devices.Keyboard.KeyPressLearn*  

Can be used to trigger on a certain key press. Press the `Learn` button and then press a certain key – you should see the `Key Code` value change.
Once the op has learned a certain key it will trigger on the `On Press` port once the key is pressed.  
You can also decide weather or not key events in the whole document or only inside the canvas should trigger by setting the `Canvas Only` checkbox.  
Please note, that the key values of *KeyPressLearn* differ from the [KeyPress](../Ops.Devices.Keyboard.KeyPress/Ops.Devices.Keyboard.KeyPress.md)-op.  
Here you will find a table listing all keys and there key codes: [Javascript Key Codes](http://www.cambiaresearch.com/articles/15/javascript-key-codes)


## Input

### Learn

*Type: Function*  
Press learn and directly afterwards (3 Seconds) press a key, this one will from now on trigger on the output port `On Press` once the key has been pressed.

### Key Code

*Type: Value*  
In most cases you won’t have to use this directly, just use the `Learn` button. It contains the key code on which to respond. You can use [keycode.info](http://keycode.info/) to find out the key code you are looking for.

### Canvas Only

*Type: Value (Default: true)*  
If you want to only trigger when a key has been pressed while the canvas has the focus (when you clicked in the canvas before) use `true`. If you want key presses to trigger even if the canvas is not in focus set it to `false` (global mode). 

## Output

### On Press

*Type: Function*  
Triggers every time the learned key is pressed down (and also triggers while it is hold down).

### On Release 

*Type: Function*  
Triggers every time the learned key is released (once).