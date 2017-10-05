# Embedding Patches

## Variables

To work with variables in cables you can use the ops `SetVariable` / `SetVariableString` and `Variable`.
Variables are handy if you need the same values in many locations in your patch and don’t neet to see the connections or if you want to set a variable from outside cables.

![Button](img/vars.png)

- `SetVariable` – Set the value of the variable (for Number / Boolean)
- `SetVariableString` – Set the value of the variable (for String)
- `Variable` - Read the variable value (for Number / Boolean / String)

In a typical Situations you have one `SetVariable` / `SetVariableString` op and multiple `Variable` ops.

## Settings variables from outside cables

When you embed a patch into your website (see [Docs: Embedding](https://docs.cables.gl/dev_embed/dev_embed.html)) you can set cables-variables in your JavaScript-code:

```javascript
var myVar = CABLES.patch.getVar("IsInteracting");

if(myVar) {
    // get the current value
    var currentValue = myVar.getValue(); 

    // change the value
    myVar.setValue(true);    
}
```

### Listening to variable changes

You can add a listener to a variable which gets called every time the variable changes:

```javascript
var myVar = CABLES.patch.getVar("IsInteracting");

if(myVar) {
	// will be called every time value changes
    myVar.addListener(function(newValue) {
        console.log(newValue);
    });
}
```
