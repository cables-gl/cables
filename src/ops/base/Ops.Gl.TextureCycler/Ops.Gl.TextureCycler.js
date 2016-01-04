var self=this;
var cgl=self.patch.cgl;

this.name='TextureCycler';

this.textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
this.exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));

var textures=[];
var texturePorts=[];

function setTextureArray()
{
    textures.length=0;
    for(var i in self.portsIn)
    {
        if(self.portsIn[i].isLinked() && self.portsIn[i].get())
        {
            textures.push(self.portsIn[i].get());
        }
    }
}

this.getPort=function(name)
{
    var p=self.getPortByName(name);

    if(p)return p;

    if(name.startsWith('texture')) p=addPort(name);
    return p;
};

function checkPorts()
{
    var allLinked=true;
    for(var i in self.portsIn)
    {
        if(!self.portsIn[i].isLinked())
        {
            allLinked=false;
        }
    }

    if(allLinked)
    {
        addPort();
    }

    setTextureArray();
}

function addPort(n)
{
    if(!n)n="texture"+texturePorts.length;
    var newPort=self.addInPort(new Port(self,n,OP_PORT_TYPE_TEXTURE));

    // newPort.onLink=checkPorts;
    newPort.onLinkChanged=checkPorts;
    newPort.onValueChanged=checkPorts;

    texturePorts.push(newPort);
    checkPorts();
}

addPort();

var index=0;

this.exe.onTriggered=function()
{
    if(textures.length===0)
    {
        self.textureOut.set(null);
        return;
    }

    index++;
    if(index>textures.length-1)index=0;
    self.textureOut.set(textures[index]);
};

this.textureOut.onPreviewChanged=function()
{
    if(self.textureOut.showPreview) CGL.Texture.previewTexture=self.textureOut.get();
};
