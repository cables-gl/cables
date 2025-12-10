Logs function calls, values, arrays or objects to the browser’s console.
If you want to log arrays or objects, you have to make sure the op is executed regularly (e.g. by connecting the `Execute`-port of Ops.Gl.MainLoop.  
Every time the value / array / object changes it will be printed to the console.  
If you want to log an array or an object you might need to connect the `Execute` port.
When you want to log function calls, you don’t have to connect anything besides the function you want to log (to `Function Input`).
