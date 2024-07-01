let self = this;
let cgl = self.patch.cgl;

this.textureOut = this.addOutPort(new CABLES.Port(this, "texture", CABLES.OP_PORT_TYPE_TEXTURE, { "preview": true }));
this.exe = this.addInPort(new CABLES.Port(this, "exe", CABLES.OP_PORT_TYPE_FUNCTION));

let textures = [];
let texturePorts = [];

function setTextureArray()
{
    textures.length = 0;
    for (let i in self.portsIn)
    {
        if (self.portsIn[i].isLinked() && self.portsIn[i].get())
        {
            textures.push(self.portsIn[i].get());
        }
    }
}

this.getPort = function (name)
{
    let p = self.getPortByName(name);

    if (p) return p;

    if (name.startsWith("texture")) p = addPort(name);
    return p;
};

function checkPorts()
{
    let allLinked = true;
    for (let i in self.portsIn)
    {
        if (!self.portsIn[i].isLinked())
        {
            allLinked = false;
        }
    }

    if (allLinked)
    {
        addPort();
    }

    setTextureArray();
}

function addPort(n)
{
    if (!n)n = "texture" + texturePorts.length;
    let newPort = self.addInPort(new CABLES.Port(self, n, CABLES.OP_PORT_TYPE_TEXTURE));

    newPort.onLinkChanged = checkPorts;
    newPort.onChange = checkPorts;

    texturePorts.push(newPort);
    checkPorts();
}

addPort();

let index = 0;

this.exe.onTriggered = function ()
{
    if (textures.length === 0)
    {
        self.textureOut.set(null);
        return;
    }

    index++;
    if (index > textures.length - 1)index = 0;
    self.textureOut.set(textures[index]);
};

this.textureOut.onPreviewChanged = function ()
{
    if (self.textureOut.showPreview) CGL.Texture.previewTexture = self.textureOut.get();
};
