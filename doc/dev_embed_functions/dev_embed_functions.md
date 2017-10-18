# External Triggers

Sometimes you need to trigger a cables-port from outside cables, e.g. when you embed a cables-patch into a website.  

Using the op [Ops.Patch.Function](../ops/Ops.Patch.Function/Ops.Patch.Function.md) you can define a function name which is visble from outside cables, just give it a name by setting the input-port `Function Name`, e.g. `myFunction` and you can trigger the op from your website’s JavaScript-code using `CABLES.patch.config.myFunction();`

If you need to pass a parameter, you can set a cables variable first (see [Variables](../dev_embed_vars/dev_embed_vars.md)) and then trigger it.