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

use css variables to use file urls, e.g: Ops.Html.SetCssVariableUrl

## Nesting

in v3 the nesting parameter was introduced. it will use a the CSS feature [nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting) to make sure the styles are only applied to the correct elements.
the default value will make sure the styles are only apllied to elements below ".cablesContainer" this way only elements that were created below and by cables are influenced.