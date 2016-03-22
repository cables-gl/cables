# KeyPressLearn

*Ops.Devices.Keyboard.KeyPressLearn*  

Can be used to trigger on a certain key press. Press the `learn` button and then press a certain key – you should see the `key code` value change.
Once the op has learned a certain key it fill trigger on the `on press` port once the key is pressed.  
You can also decide weather or not key events in the whole document or only inside the canvas should trigger by setting the `canvas only` checkbox.

## Ports

### Input

#### learn

Press learn and directly afterwards (3 Seconds) press a key, this one will from now on trigger on the output port `on press` once the key has been pressed.

#### key code

In most cases you won’t have to use this directly, just use the `learn` button. It contains the key code on which to respond. You can use [keycode.info](http://keycode.info/) to find out the key code you are looking for.

#### canvas only

If you want to only trigger when a key has been pressed while the canvas has the focus (when you clicked in the canvas before) use `true`. If you want key presses to trigger even if the canvas is not in focus set it to `false` (global mode).

*Default: true*  

### Output

#### on press

Triggers every time the learned key is pressed.