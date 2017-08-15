op.name="FontFile";

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));
var fontname=op.addInPort(new Port(op,"family",OP_PORT_TYPE_VALUE,{ type:'string' } ));

filename.onChange=addStyle;
fontname.onChange=addStyle;

var timeOut=-1;

var outLoaded=op.outValue("Loaded");

function addStyle()
{

    if(filename.get() && fontname.get())
    {
        
        console.log('FONT ',filename.get() , fontname.get());
        
        var styleStr=''
            .endl()+'@font-face'
            .endl()+'{'
            .endl()+'  font-family: "'+fontname.get()+'";'
            .endl()+'  src: url("'+filename.get()+'") format("truetype");'
            .endl()+'}';
    
        
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = styleStr;
        document.getElementsByTagName('head')[document.getElementsByTagName('head').length-1].appendChild(style);

    }
        

}


