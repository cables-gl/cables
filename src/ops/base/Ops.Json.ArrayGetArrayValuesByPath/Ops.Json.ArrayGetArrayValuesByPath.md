useful to interate over nested data structures. 

the path defines the way to the first object. this op will then try to iterate over the array that contains the object with the given property and return all the values fo each object in the array.

given an array like this:

```
[
    [
        {
            "firstName": "Gordon",
            "lastName": "Freeman"
        },
        {
            "firstName": "Eli",
            "lastName": "Vance"
        }
    ],
    [
        {
            "firstName": "Alyx",
            "lastName": "Vance"
        },
        {
            "firstName": "G",
            "lastName": "Man"
        }
    ]
]
```

a path of `0.0.firstName` will result in this array:

```
[
  "Gordon",
  "Alyx",
]
```