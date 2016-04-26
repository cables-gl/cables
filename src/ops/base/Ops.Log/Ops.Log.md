# Log

*Ops.Log*  

Logs function calls, values or arrays to the browser’s console.
If you want to log values or arrays, you have to make sure the op is executed regularly (e.g. by connecting the `Execute`-port to the [Renderer](../Ops.Gl.Renderer/Ops.Gl.Renderer.md)-op. Every time the value / array changes it will be printed to the console.  
When you want to log function calls, you don’t have to connect anything besides the function you want to log.

## Input

### Execute

*Type: Function*  
Executes the op, needed if you want to log values or arrays

### Function Input

*Type: Function*    
Prints a message to the browser’s developer console every time the port is triggered

### Value Input

*Type: Value*    
Prints a message every time the value changes. You have to connect the `Execute`-port for this to work (see above).

### Array Input

*Type: Array*    
Prints a message every time the array changes. You have to connect the `Execute`-port for this to work (see above).



