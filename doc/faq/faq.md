# FAQ

#### How to disable page scrolling on mobile?

In the Javascript code (inside the exported `index.html` file) add the following at the end:

```Javascript
function preventBehavior(e) {
  e.preventDefault(); 
};

var canvas = document.getElementById('glcanvas');
canvas.addEventListener('touchmove', preventBehavior, false);
```

#### How to remove grey rectangles on touch (mobile)?

On iOS Safari you will see a grey / black rectangle around the element being touched. If your patch uses touch events this will lead to the whole patch being grey / black when the user touches the screen.

To disable this add the following rule to your stylesheet (CSS):

```css
body {
  -webkit-tap-highlight-color: rgba(0,0,0,0); // hide grey rectangle on iOS touch
}
```

