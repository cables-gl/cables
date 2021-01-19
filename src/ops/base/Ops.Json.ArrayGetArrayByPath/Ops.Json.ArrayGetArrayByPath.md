useful when working with  nested data structures. 

the path defines the way to the array. the given array will be returned

given an array like this:

```
[
    [
        {
            "firstName": "Gordon",
            "lastName": "Freeman"
        }
   ],
   [
        {
            "firstName": "Eli",
            "lastName": "Vance"
        }
    ]
]
```

a path of `0` will result in this array:

```
 [
        {
            "firstName": "Gordon",
            "lastName": "Freeman"
        }
]
```