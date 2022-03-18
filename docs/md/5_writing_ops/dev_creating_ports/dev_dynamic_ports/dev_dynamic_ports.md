# Dynamic Ports

Dynamic Ports accept various types.

`inDynamic(name, filter)`

`inDynamic(name, filter, options)`

`inDynamic(name, filter, options, defaultValue)`

## Parameters

- `name` (String, required):
  - The name of the port, e.g. `"My Dynamic Port"`
- `filter` (Array, required):
  - The types which should be accepted for linking, e.g. `[OP_PORT_TYPE_VALUE,CABLES.OP_PORT_TYPE_OBJECT]`
- `options` (Object, optional):
  - The port-options, have a look at the other port-definitions to see what’s possible
  - E.g. `{"display": "range"}` (displays a range-slider when port is not linked)
- `defaultValue` (Any type, optional):
  - The default value to be set, can be any type, e.g. `123`

## Example

This is an op with one dynamic port which can be linked to a value or object port. If it is not linked it will display a range-slider. When the value on the dynamic port changes it will print the value to the developer console.

```javascript

const dynPort = op.inDynamic(
  "My Dynamic Port",
  [
   CABLES.OP_PORT_TYPE_VALUE,
   CABLES.OP_PORT_TYPE_OBJECT
  ],
  {
    "display": "range"
  },
  123
);

dynPort.onChange = function() {
    op.log("value changed: ", dynPort.get());
};
```

Follow this [link](../../dev_callbacks/dev_callbacks) for more information on Callbacks



