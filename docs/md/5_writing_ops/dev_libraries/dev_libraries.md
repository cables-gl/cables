# Libraries

#### How can I use external libraries in cables?

There is a variety of external libraries available in cables. Once you created your [own OP](https://dev.cables.gl/docs/5_writing_ops/dev_hello_op/dev_hello_op) you find
the selection of libraries from the "code" menu on the right side of the editor, when the op is selected. Select any available
libraries, save and reload the patch and you can use them in your ops.

![Button](img/libs.png)

### What if the library I need is not in that list?

Upload the `.js`-file to any patch, just like you would with images or other assets. For all the ops you have
editing rights for you can now select "use library from patch assets..." from the above dropdown. The filemanager
will open and you can pick the library to use in your own op(s).

Be aware that this makes the patch the source for that library, once you delete the patch, the ops will no
longer work. Fear not though: cables will warn you before deleting such patches.

If you plan to make your ops public somehow preferrably pick libraries that have been put under MIT-License for the
least conflict with cables' own licencing.
