useful when working with nested data structures.

the path defines the way to the string. the stringwill be returned

given an object like this:

```
{
    "data": { "names": [ "alyx","gordon","eli","g-man"] }
}
```

a path of data.names.1 will return `gordon`:
