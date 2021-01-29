

## blue on touch outline/filled elements

disable highlighting canvas and elements on touch effect:
warning: this can potentially a problem for screen readers or vision impaired people!

```
*
{
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
```

## rubberband scrolling

to remove rubberband scrolling effect on ios, add `overflow:hidden` to your body style

```
body {
    overflow: hidden;
}
```
