# How to serve files externally and fix CORS headers

## When does this happen?

Sometimes you want to access ressouces on different servers than your patch is running on, these may be
images, some api or any different file. Check [this patch](https://cables.gl/p/5FQ08W) for example, that
loads data from an API to get the current temperature in Berlin.

For this the provider of the API has to allow for access of the data from a browser by providing
certain HTTP-Headers (see below). Really often this is not the case.

## How do i know this happens to me?

use this cors test to see if your headers are set correctly: https://cors-test.codehappy.dev/

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
Access-Control-Allow-Origin: https://cables.gl
Access-Control-Allow-Origin: https://sandbox.cables.gl
```

or more broadly:

```
Access-Control-Allow-Origin: *
```

## Okay, I did this, still does not work, what else?

So, let's assume you are using [HttpRequest](https://cables.gl/op/Ops.Json.HttpRequest_v3). Check that you do not have
the JSONP-Checkbox toggled on. Once that is on, all the above does not cause any problems, but your browser is loading
the external ressouce as if it were a JavaScript-File. We cannot control these requests and we also cannot send any
additional headers with them.

Next thing to check is your network tab in the dev-tools of the browser you are using. Is there any request failing?
If there is, check wether or not the "method" is given as "OPTIONS". Then fix these errors.

## OPTIONS?!

Before any CORS request the browser is advised to do an additional request (a so-called ["preflight"](https://livebook.manning.com/book/cors-in-action/chapter-4/)), using the HTTP 
"OPTIONS" method (instead of "GET" for example). If that fails, the browser will not attempt to "GET" the requested ressouce.

Make sure that the/your API you are talking to answers properly to preflight requests. If you are dealing with PHP, a very
hacky way of doing this is something like:

```php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header("HTTP/1.1 200 OK");
}
```

This greatly varies with webservers, languages, CMS versions, frameworks and everything around it though, so try to find
a way to set this in a sensible way for your setup.
