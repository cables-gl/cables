useful when working with nested data structures. 

the path defines the way to the object . the given object will be returned

given an array like this:

```
[
    [
        {
            "name": "alyx"
        },
        {
            "name": "eli"
        }
    ],
    [
        {
            "name": "gordon"
        }
    ] 
]
```

a path of `0.1` will result in this array:

```
[
    {
        "name": "alyx"
    },
    {
        "name": "eli"
    }
]
```