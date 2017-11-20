# LoadingStatus

*Ops.LoadingStatus*

Useful to display a loading animation while your patch is loading assets (3D-models, audio-files, …).   
On the community page a spinner-icon will be shown by default, in the editor and when you export your patch there won’t – this is because you probably want to display your own loading animation. This might change in the future.

## Input

### Execute

*Type: Function*  
Executes the op

### Pre Render Times

*Type: Value*  

## Output

### Finished

*Type: Function*
Triggers when all assets have been loaded

### Status 

*Type: Value*  

### Pre Render Status

*Type: Value*

### Num Assets

*Type: Value*  

### Loading

*Type: Function*  
Triggers while there are still assets left to load, use this for your loading animations  


