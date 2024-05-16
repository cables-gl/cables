useful when working with nested data structures. 

the path defines the way to the object . the given object will be returned

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

a path of `data.persons.1` will result in this object:

```
{
  "name": "eli"
}
```