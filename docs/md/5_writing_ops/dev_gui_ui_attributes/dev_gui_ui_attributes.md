# GUI/UI attributes

## Group Ports

to bundle ports into groups and set a visual divider between them:

```
op.setPortGroup('Display',[portScale,portFont]);
op.setPortGroup('Alignment',[portAlign,portVAlign]);
op.setPortGroup('Color',[r,g,b,a]);
```

## Hide port
To hide a port on a op but still have a UI element use the following code

```javascript
portName.setUiAttribs({ "hidePort": true });
```

## Warnings and Errors

Ui attributes of an op can be set to give the user warnings and give visual feedback about things that may require their attention.

To do this use the following format:
```javascript
if(condition) op.setUiError("errorID", "error ID/must be unique per error","Error message to show in UI",0);
//this resets the error message so it disappears
else op.setUiError("errorID",null);
```
The number in the last part of the function defines what kind of error is shown
0 - hint / grey color
1 - warning / orange color
2 - error / red color / this will also place a red dot on the right hand side of the op
<br>
![Button](../dev_callbacks/img/dev_callbacks_error_UI_example.png)
<br>
example code to show an error:
```javascript
//create a port of the type boolean
const switch1=op.inBool("Error",false);
//if port changes run this function
switch1.onChange=function()
{
	if(switch1.get()) op.setUiError("error1","switch 1 is true",2);
    else op.setUiError("error1",null);
}
```
