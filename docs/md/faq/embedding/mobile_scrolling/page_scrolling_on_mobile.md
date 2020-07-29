#### How to disable page scrolling on mobile?
There are 2 methods for this:

In the Javascript code (inside the exported `index.html` file) add the following at the end:

```Javascript
function preventBehavior(e) {
  e.preventDefault(); 
};

var canvas = document.getElementById('glcanvas');
canvas.addEventListener('touchmove', preventBehavior, false);
```

You can also add the [touchscreen op](https://cables.gl/op/Ops.Devices.TouchScreen) for mobile/tablets/touchscreens and disable the following settings.
`Disable scaling`
or
`Disable scroll`