#### Exported patch is black

When you want to view an exported cables patch locally you cannot just double click the downloaded `index.html` file from the exported zip. What happens if you do so is that the file `index.html` will be opened in your browser through the `file://` protocol, which you can verify by looking at the URL, which will look something like `file:///Users/you/Downloads/cables_your_patch/index.html`. You will see nothing but a black screen.

The problem here is that the browser prevents the site from loading the patch data (from the `.json` patch file). For this you need a local webserver. See [Previewing an exported patch locally](/dev_embed_webservers/dev_embed_webservers.html#previewing-an-exported-patch-locally) for local webserver recommendations.