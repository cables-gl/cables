# How to serve files externally and fix CORS headers

## When does this happen?

Sometimes you want to access ressouces on different servers than your patch is running on, these may be
images, some api or any different file. Check [this patch](https://cables.gl/p/5FQ08W) for example, that
loads data from an API to get the current temperature in Berlin.

For this the provider of the API has to allow for access of the data from a browser by providing
certain HTTP-Headers (see below). Really often this is not the case.

## How do i know this happens to me?

First of all, you won't see the files loaded, no images, no data from the API. Check your developer tools (ctrl+shift+i or cmd+option+i) console
in the browser and you will, most likely, see something like this:

```
Access to XMLHttpRequest at 'https://www.metaweather.com/api/location/638242/' from origin 'https://devsandbox.cables.gl'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This means the provider of the data/images (you?) has not set the correct headers (yet). This is **only fixable on the serverside**,
not in cables.

## What is CORS?
Currently, client-side scripts (e.g., JavaScript) are prevented from accessing much of the Web of 
Linked Data due to "same origin" restrictions implemented in all major Web browsers.

While enabling such access is important for all data, it is especially important for Linked Open Data and 
related services; without this, our data simply is not open to all clients.

CORS gives the **providers** of data on webservers a way to tell the browser to load/not load that resource.

## How to fix this?

[This page](https://www.w3.org/wiki/CORS_Enabled) gives a comprehensive overview on how to fix this **on the
side of the provider of the files** in various webservers and programming languages. It basically boils down
to adding this to your HTTP-Response headers:

```
 Access-Control-Allow-Origin: *
 Access-Control-Allow-Origin: http://example.com:8080
```
