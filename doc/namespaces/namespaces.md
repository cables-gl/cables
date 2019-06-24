# Guidelines
This is a set of rules that will help you to develop ops inside of cables.

Every op that draws/renders a mesh should have a geometry ouput
Every material op should output a shader
Every op that draws something should have a checkbox called "Render". Disabling this stops the shape appearing on screen.

# Naming standards
ANY op with the name VALUE should be renamed to `Number`
ANY op with the name Boolean should become `Bool`
ANY op with the name Animation should become `Anim`
ANY op with the name Variable should become `Var`
ANY op related to a physicsbody gets the prefix `body`
ANY op which reports the info about a dataType should start with the word Info

# Data conversion
If a data type is converted to another then both data names should be in the op name
like ArrayToString or NumberToBool

# Ports
Any op with a `trigger in` should have this as the first input port, it should also have a `trigger out` as well.This avoids having to use too many sequence ops.
If an op has a `finished` trigger when an action has been completed then this trigger port should always be to the right of the `trigger out` port. 

# Anim ops
Should have a `boolean` finished output port to show if the state is running or not.

# Array ops
All array ops should output null if no array is connected or being processed.
Use `inValueInt` to look up the index of the array.

All arrays should make a copy of an array and not a reference.

```
var arrIn;
var newArray;
// This line below is a reference.This will modify the array in the op before this one. 
//Better to avoid doing this
newArray = arrIn ; 
//It's better to make a deep copy like this 
for(var i = 0 ; i < arrIn; i++)
{
  newArray[i] = arrIn[i];
}
```
# Namespaces

Every op has two short name, e.g. `KeyboardInput` and a namespace, e.g. `Ops.Devices.Keyboard.KeyboardInput`.  

The name will be presented to the user in the patch-view, the long version exists to group similar ops together. In the op-add-dialog (when pressing `ESC` in the patch-view) users can click on any part of the namespace to view all ops with that namespace.

Op names cannot start with a number.

## Naming Conventions

All namespace-segments as well as the op name must be written in upper camel case, e.g. `KeyboardInput`, not `keyboard_input` or `keyboardInput`.

If your op uses an abbreviation, e.g. `MIDI` only the first character should be capitalized, so if you made a MIDI-input, a good name would be `MidiInput`.

**Please note:** Op-namespaces can not contain the full namespace of another op, e.g. if an op `Ops.Devices.Keyboard` exists,s you cannot put your newly created op in the namespace `Ops.Devices.Keyboard.KeyboardInput`.


