Use this op to "slim" an array of objects.

Only keep objects that have specified key-value pair!

```
var arr = [
  { animal: "dog", food: "veggies" }, 
  { animal: "cat", food: "bird" }, 
  { animal: "bird", food: "veggies" }
];

// specifying key value pair food, veggies, the resulting array becomes

arr = [{ animal: "dog", food: "veggies" }, { animal: "bird", food: "veggies"}];

// inverting the operation, the array becomes

arr = [{ animal: "cat", food: "bird" }];
```