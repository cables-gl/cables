## CSS Rule Conflicts
HTML element created by cables always have a class called "cablesEle".

If you have problems with existing styles of cables, use css selectors to define them to use only childs:
```
.cablesEle.myDiv 
{
    background-color:red;
    border:10px solid blue;
}

.cablesEle h1
{
    color:red;
}
```

## Using assets in CSS properties

Use `{{ASSETPATH}}` to get a URL to file Assets

`    background-image:url({{ASSETPATH}}Cloud03_8x8.png);`
