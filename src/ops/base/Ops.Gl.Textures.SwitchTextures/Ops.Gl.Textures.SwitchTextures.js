var exec=op.inTrigger("exec");
var num=this.inValueInt("num");
var defaultTransparent=op.inValueBool("Default Texture Transparent",true);
var textureOut=this.outTexture("texture");

var cgl=op.patch.cgl;
var texturePorts=[];
var index=0;
var lastIndex=-1;
var tempTexture=CGL.Texture.getEmptyTexture(cgl);

num.onChange=exec.onTriggered=function(){updateTexture();};


defaultTransparent.onChange=function()
{
    if(defaultTransparent.get()) tempTexture=CGL.Texture.getEmptyTexture(cgl);
        else tempTexture=CGL.Texture.getTempTexture(cgl);

    updateTexture(true);
};

for(var i=0;i<16;i++)
{
    var tex=op.inTexture("texture"+i);
    texturePorts.push(tex);
    tex.onChange=forceUpdateTexture;
}

function forceUpdateTexture()
{
    updateTexture(true);
}

function updateTexture(force)
{
    index=parseInt(num.get(),10);
    if(!force)
    {
        if(index == lastIndex)return;
        if(index != index)return;
    }
    if(
	    isNaN(index) ||
	    index < 0 ||
	    index > texturePorts.length-1
    )
	index = 0;

    if(texturePorts[index].get()) textureOut.set(texturePorts[index].get());
    else textureOut.set(tempTexture);

    lastIndex=index;
}
