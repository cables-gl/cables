# Function

*Ops.Patch.Function*

Execute / trigger from an external script, useful when embedding a cables-patch into a website.

## Inputs

### Function Name [String]

The name of the function you want to define, e.g. when you name the function `myFunction` you can trigger it from your JavaScript-Code using `CABLES.patch.config.myFunction();`

## Trigger [Function]

Execute the trigger from inside cables, for testing or to combine internal / external trigger

## Output

### Trigger [Function]

Triggered every time the input `Trigger` is executed or the function was called from outside cables

