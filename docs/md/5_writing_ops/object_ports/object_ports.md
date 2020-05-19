# Object Ports

Object ports can accept any kind of object, e.g.:

```
{
  'foo': 'bar',
  'baz': 123
}
```

These objects can be as complex as necessary.

Every op using object ports must regulate which ports it can link to on its own to make sure there are no incompatible connections. A simple way to do this when working with JavaScript classes is the following:

```javascript
var port = op.inObject("MonoSynth");
port.shouldLink = function() {
  if(p1 == this && p2 instanceof MonoSynth) return true;
    if(p2 == this && p1 instanceof MonoSynth) return true;
    return false; // no MonoSynth object
};
```

This way when trying to connect another port with this port it will be checked if the object on the other port is of type `MonoSynth`.

If you don’t implement the `shouldLink` method in your port every object-port can connect to it, which will most likely lead to errors.

**TODO:** Explain how to set the rejection message

