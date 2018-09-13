var exec=op.inFunction("exec");
var num=this.addInPort(new Port(this,"num",OP_PORT_TYPE_VALUE));
var defaultTransparent=op.inValueBool("Default Texture Transparent",true);
var textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));

var cgl=op.patch.cgl;
var texturePorts=[];
var index=0;
var lastIndex=-1;

var tempTexture=CGL.Texture.getEmptyTexture(cgl);

defaultTransparent.onChange=function()
{
    if(defaultTransparent.get()) tempTexture=CGL.Texture.getEmptyTexture(cgl);
        else tempTexture=CGL.Texture.getTempTexture(cgl);

    updateTexture(true);
};




for(var i=0;i<16;i++)
{
    var tex=this.addInPort(new Port(this,"texture"+i,OP_PORT_TYPE_TEXTURE));
    texturePorts.push(tex);
    tex.onValueChanged=forceUpdateTexture;
}

exec.onTriggered=updateTexture;
num.onChange=updateTexture;


function forceUpdateTexture()
{
    updateTexture(true);
}

function updateTexture(force)
{
    index=parseInt(num.get(),10);
    if(!force)
    {
        if(index==lastIndex)return;
        if(index!=index)return;
    }
    if(index<0)index=0;
    if(index>texturePorts.length-1)index=0;

    if(texturePorts[index].get()) textureOut.set(texturePorts[index].get());
        else textureOut.set(tempTexture);

    lastIndex=index;
}
