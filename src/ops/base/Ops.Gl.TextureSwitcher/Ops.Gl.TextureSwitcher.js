Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='TextureSwitcher';

this.num=this.addInPort(new Port(this,"num",OP_PORT_TYPE_VALUE));
this.textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));

var texturePorts=[];
var index=0;

function updateTexture()
{
    index=parseInt(self.num.get(),10);
    if(index>texturePorts.length-1)index=0;
    if(index<0)index=0;
    self.textureOut.set(texturePorts[index].get());
    console.log('texswitch',index);
}

for(var i=0;i<5;i++)
{
    var tex=this.addInPort(new Port(this,"texture"+i,OP_PORT_TYPE_TEXTURE));
    texturePorts.push(tex);
    tex.onValueChanged=updateTexture;
}




this.textureOut.onPreviewChanged=function()
{
    if(self.textureOut.showPreview) CGL.Texture.previewTexture=self.textureOut.get();
};

this.num.onValueChanged=updateTexture;
