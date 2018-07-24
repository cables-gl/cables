var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));
var fontname=op.addInPort(new Port(op,"family",OP_PORT_TYPE_VALUE,{ type:'string' } ));

filename.onChange=addStyle;
fontname.onChange=addStyle;

var timeOut=-1;

var outLoaded=op.outValue("Loaded");
var fontFaceObj;

function addStyle()
{

    if(filename.get() && fontname.get())
    {
        if(document.fonts) {
            fontFaceObj = new FontFace(fontname.get(), 'url(' + filename.get() + ')');
            //console.log(fontFaceObj);
            
            // Add the FontFace to the FontFaceSet
            document.fonts.add(fontFaceObj);
            
            // Get the current status of the FontFace
            // (should be 'unloaded')
            // console.info('Current status', fontFaceObj.status);
            
            // Load the FontFace
            fontFaceObj.load();
            
            // Get the current status of the Fontface
            // (should be 'loading' or 'loaded' if cached)
            // console.info('Current status', fontFaceObj.status);
            
            // Wait until the font has been loaded, log the current status.
            fontFaceObj.loaded.then((fontFace) => {
                // console.info('Current status', fontFace.status);
                // console.log(fontFace.family, 'loaded successfully.');
                outLoaded.set(true);
                
                // Throw an error if loading wasn't successful
            }, (fontFace) => {
            console.error('Font loading error! Current status', fontFaceObj.status);
            });
        } else { // font loading api not supported
            var fileUrl=op.patch.getFilePath(String(filename.get()));
            var styleStr=''
                .endl()+'@font-face'
                .endl()+'{'
                .endl()+'  font-family: "'+fontname.get()+'";'
                .endl()+'  src: url("'+fileUrl+'") format("truetype");'
                .endl()+'}';
        
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = styleStr;
            document.getElementsByTagName('head')[document.getElementsByTagName('head').length-1].appendChild(style);
            // TODO: Poll if font loaded
        }
    }
}
