Use this op on an array of objects to "slim out" objects.

```
var obj = { animal: "dog", humanoid: "arnold from terminator 2", lunch: "pasta" };

// specify keys humanoid & lunch, the resulting object becomes
obj = { humanoid: "arnold from terminator 2", lunch: "pasta" }

// inverting the filter, the resulting object becomes
obj = { animal: "dog" }
```