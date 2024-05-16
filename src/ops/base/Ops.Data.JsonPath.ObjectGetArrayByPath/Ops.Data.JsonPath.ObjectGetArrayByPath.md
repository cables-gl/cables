useful when working with  nested data structures. 

the path defines the way to the array. the given array will be returned

given an object like this:

```
{
    "data": { 
        "persons": [ 
            {
                "name": "alyx"
            },
            {
                "name": "eli"
            },
            {
                "name": "gordon"
            }
        ] 
    }
}
```

a path of `data.persons` will result in this array:

```
 [ 
            {
                "name": "alyx"
            },
            {
                "name": "eli"
            },
            {
                "name": "gordon"
            }
        ] 
```