#### getting a warning when running the patch in electron

when getting an errormessage about localFileAccess, you have to edit your index.html file:
put this into the CABLES.Patch constructor options: `allowLocalFileAccess:true`

It should then look like this:

```
    CABLES.patch = new CABLES.Patch({
        // ... your old options should stay
        allowLocalFileAccess:true,
    });
```
