some browsers (mostly mobile) support the native web-share-api and open a sharing dialog that let's you select an app to share content with.

when triggered, this op opens the sharing dialog on browsers that support the api.

some browsers (i.e. firefox mobile) do not implement sharing files at the moment, the op will fall back to sharing without and image in these cases.

if you do this in/from an iframe make sure you allow the "web-share" feature to make this work on firefox.