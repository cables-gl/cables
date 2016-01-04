CABLES.Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='texture empty';
this.width=this.addInPort(new Port(this,"width",OP_PORT_TYPE_VALUE));
this.height=this.addInPort(new Port(this,"height",OP_PORT_TYPE_VALUE));

this.textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));
this.tex=new CGL.Texture(cgl);

var sizeChanged=function()
{
    self.tex.setSize(self.width.get(),self.height.get());
    self.textureOut.set( self.tex );
};

this.width.onValueChanged=sizeChanged;
this.height.onValueChanged=sizeChanged;

this.width.set(8);
this.height.set(8);
