# Developing Ops

## Basic Setup

```
this.name = 'my very special op';
```

## Adding Ports

See [Creating Ports](../dev_Creating_Ports/Creating_Ports.md)

## Logging

```
this.log( 'hello world' );.   
```

Do **not** use `console.log()`!   
`this.log()` is not shown if the patch is embedded and the silent parameter is set, also you get a reference to the op which is producing the log-message.

## UI Attributes

These attributes are visible in the op parameter panel and can be used for debugging purposes.

- `info`: Shows an information message in op parameter panel
- `warning`: Shows a warning message in op parameter panel
- `error`: Shows an error message in op parameter panel and colors the op red

```
this.uiAttr( { 'info': 'Something happened, not too serious but still...' } );
this.uiAttr( { 'warning': 'Something happened, not too serious but still...' } );
this.uiAttr( { 'error': 'Big problem here, this is serious!' } );
```
