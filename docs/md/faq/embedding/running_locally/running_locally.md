#### How to run exported patches on your local machine

Patches that do not use assets (images/audio-files/3d-models) should be fine to run in a browser on your local machine.
Just [export a ZIP-File](../../../4_export_embed/dev_embed/export_zip/export_zip) and open `index.html` in your browser of choice.

However, if you are using any kind of assets you browser will most likely give you a  security warning in the dev-console. Something like this:

```
The HTMLMediaElement passed to createMediaElementSource has 
a cross-origin resource, the node will output silence.
```

Some of the features you may need might be only working when connected via HTTPS or not allowed at all when running locally.

There are [several ways](https://stackoverflow.com/questions/18586921/how-to-launch-html-using-chrome-at-allow-file-access-from-files-mode?rq=1) around this but your best solution would be to run a local webserver.

A few ways of doing this [are covered in our documentation](../../../4_export_embed/dev_embed_webservers/dev_embed_webservers).
Be aware that browser security guidlines are constantly changing and so is webserver software.

Your best bet might be exporting to one of the hosting services that cables provides and export option for (like [netlify](../../../4_export_embed/dev_embed/export_netlify/export_netlify) or [github pages](../../../4_export_embed/dev_embed/export_github/export_github)) or
put your exported patch on an actual webserver connected to the internet and providing a proper HTTPS connection.
