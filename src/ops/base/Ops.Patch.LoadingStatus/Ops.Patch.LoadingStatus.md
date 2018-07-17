Useful to display a loading animation while your patch is loading assets (3D-models, audio-files, …).   
On the community page a spinner-icon will be shown by default, in the editor and when you export your patch there won’t – this is because you probably want to display your own loading animation. This might change in the future.

#### writing async loading ops

when writing ops, that load data asynchronously, you should tell cables that something is still loading:

```
var loadingId=cgl.patch.loading.start('texture' , filename); // loading starts
// load stuff...
cgl.patch.loading.finished(loadingId);  // loading is finished
```