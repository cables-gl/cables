CABLES.Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='ImageStream';

this.url=this.addInPort(new Port(this,"url"));
this.url.val="http://localhost:5600/images";

this.tex=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));

var texture=new CGL.Texture(cgl);
texture.setSize(320,240);

$('#glcanvas').append('<img id="imagestream">');

var image = document.getElementById('imagestream');

this.tex.val=texture;

image.onload = function ()
{
    texture.image=image;
    texture.initTexture(image);
    console.log('loaded');
};

function run()
{
    var source = new EventSource(self.url.val);

    source.addEventListener('message', function(event)
    {
        image.src = event.data;
    });
}

setTimeout(run, 500);
