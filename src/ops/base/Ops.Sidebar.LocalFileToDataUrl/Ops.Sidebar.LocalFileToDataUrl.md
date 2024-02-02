Let the user select a file from their local harddrive. The file is not loaded to any server, it is just loaded in to memory.
You can connect the dataUrl output to a texture op to load an image as a texture in cables.

Internally it uses an `&lt;input type="file"/&gt;` , the way standard html file select 

### Accept Parameter

- A valid case-insensitive filename extension, starting with a period (".") character. For example: `.jpg`, `.pdf`, or `.doc`
- Multiple extensions seperated by comma, like `.png,.jpg`
- A valid MIME type string, with no extensions.
- The string `audio/*` meaning "any audio file".
- The string `video/*` meaning "any video file".
- The string `image/*` meaning "any image file".
