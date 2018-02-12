#### How to disable page scrolling on mobile?

In the Javascript code (inside the exported `index.html` file) add the following at the end:

```Javascript
function preventBehavior(e) {
  e.preventDefault(); 
};

var canvas = document.getElementById('glcanvas');
canvas.addEventListener('touchmove', preventBehavior, false);
```

#### 