# Previewing / uploading exported cables patches

*What you will learn:*  

- How to export a cables patch (static HTML, Javascript and CSS)
- How to preview a downloaded cables patch locally in your browser
- How to get around the security warning `Failed to load MyPatch.json…`
- Which local web-server you can use for Windows / Mac / Linux
- How to upload a cables patch to your own FTP server

## Introduction

One of the great features of cables is that you can export a patch at any time by downloading a bundled zip-file of your code including all assets. This means that your exported patch is not dependent on the cables server any more and runs independently, on any common webserver.  

Because of browser’s security restrictions there are a few things to note tho which will be explained in this article.

## Exporting a patch

To export a zip file of your patch including all Javascript-files and optional assets, just click on `Patch` —> `Export` in the cables editor. In some cases you might not want to download the assets (used images, audio files, 3D-models), you can then use `Export without files` instead.  

When your download is finished unzip the archive, the extracted content will look similar to this:

```
/assets					(in case your patch uses images / 3D models, audio files, …)
	some-image.png
	some-audio-file.mp3
/js						(the javascript folder contains the logic of your patch)
	cables.min.js		(minified version of the cables core logic)
	libs.core.min.js	(in case an op depends on third-party libraries)
	ops.js				(bundle of all the ops used in your patch)
	MyPatch.json		(the actual logic of your patch – connections between ops)
    MyPatch_backup.json	(last backup of the patch logic)
index.html				(HTML file showing how to embed the patch)

```

## Previewing an exported patch locally

### How _not_ to do it

If you want to preview the exported patch in your web-browser you might think you can just double click the `index.html` file to open it with e.g. Chrome. This will not work because of browser security restrictions which will prevent your browser from loading the `MyPatch.json` file. The browser window will just be black. When you click `cmd + shift + i` to open the browser console / developer tools, you will see an error like this:

```
Failed to load file:///Users/yourname/Downloads/cables_MyPatch/js/MyPatch.json: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https.
```

### How to do it

In order to preview the cables patch, we need a local web server, which you can access via the `http`-protocol. There are a multitude of options available for each platform, to name a few:

- [Anvil](https://anvilformac.com) (very user-friendly, Mac only)
- [XAMPP](https://www.apachefriends.org/de/index.html) (harder to use, cross-platform)
- [http-server](https://www.npmjs.com/package/http-server) (node.js module, Terminal use required, cross-paltform, easy to use if you know how)

#### Previewing with Anvil (Mac)

First download and install [Anvill](https://anvilformac.com/), then click on menu bar icon and install the required dependency Pow.

Now you can just drag the patch folder (the root folder including all the extracted files) onto the anvil-icon and anvil will create a local .dev-domain for you. Click the newly created dev-domain and your patch should be visible in your browser.

#### Previewing with http-server (Node, cross-platform)

If you know how to use the Terminal and [npm](https://www.npmjs.com/) this might be the best option for you. Assuming you have [node.js](https://nodejs.org/en/) / npm installed, run:

```Bash
npm install http-server -g
```

This will install the [http-server](https://www.npmjs.com/package/http-server) module globally.

Now navigate to the directory of the extracted patch, e.g. 

```Bash
cd /Users/yourname/Downloads/MyPatch
```

And start the local web server:

```
http-server
```

You should now see something like:

```
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.178.102:8080
Hit CTRL-C to stop the server
```

Copy the first URL and open it in your browser of choice. Voilà.

## Uploading a cables patch to your web server via FTP

The security restrictions we talked about before do not apply for common web-servers, so if you rent webspace somewhere, you can just upload the exported files to your server and it should work right away.

First of all you need a FTP client, some choices are:

- [Cyberduck](https://cyberduck.io) (easy to use, Windows / Mac) 
- [Filezilla](https://filezilla-project.org/) (a bit less intuitive to use, cross-platform)

### Uploading with Cyberduck

After you installed [Cyberduck](https://cyberduck.io) log in to your server and drop the exported folder onto the Cyberduck window. You might want to rename the folder first to lowercase (`MyPatch` —> `my-patch`).

Your server filesystem should look something likes this now:

```
some-other-folders/
...
my-patch/
	assets/
	    …
	js/
	    …
	index.html
```

Now you should be able to go to http://your-domain.cool/my-patch to see the patch live and independent from the main cables server. In case you don’t see the patch but get a page not found error you need to find out where your root-folder in the file-system is (your domain points to a different folder on the server). If you cannot find it out by yourself ask your web developer friend / web-hosting provider.

