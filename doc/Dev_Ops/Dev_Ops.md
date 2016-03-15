# Developing Ops

## Basic Setup

```
this.name = 'my very special op';
```

## Adding Ports

See [Creating Ports](../dev_Creating_Ports/dev_Creating_Ports.md)

## Logging

```
`this.log( 'hello world' );`.   
```

Do **not** use `console.log()`!   
`this.log()` is not shown if the patch is embedded and the silent parameter is set, also you get a reference to the op which is producing the log-message.

## UI Attributes

These attributes are visible in the op parameter panel and can be used for debugging purposes.

- `warning`: Shows a warning message in op parameter panel
- `info`: Shows an information message in op parameter panel

You should always check if the user is in the cables development environment or if it is running embedded on a website.  

```
if(CABLES.UI) {
    this.uiAttr( { warning: 'this is a warning...' } );
}
```
