# GetVar

*Ops.Vars.GetVar*    

This can be compared with environmental variables or global variables, sometimes it is handy to store something in the patch-scope, so all ops can access it. This is definitely *not* the *cables*-way to do things, but sometimes it’s good to reduce cable chaos.  
Can be used for strings, numbers or booleans.

## Input

### Execute

*Type: Function*  

Executes the op, outputs the value of the global variable with name `Name` and makes it available on the output port

### Name

*Type: Value*  
Name of the global variable you want to get

## Output

### Value

*Type: Value*  
Value of the global variable