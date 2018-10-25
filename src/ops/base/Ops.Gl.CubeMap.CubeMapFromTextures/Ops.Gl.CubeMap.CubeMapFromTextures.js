//http://codeflow.org/entries/2011/apr/18/advanced-webgl-part-3-irradiance-environment-map/

var outTex=op.outObject("cubemap");
var numImages=6;

var inFilenames=[];

var titles=[
        "posx", "negx", 
        "posy", "negy", 
        "posz", "negz"
    ];

for(var i=0;i<numImages;i++)
{
    var file=op.addInPort(new CABLES.Port(op,titles[i],CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));
    file.onChange=load;
    inFilenames.push(file);
}

var loadingId=0;
var skyboxCubemap=null;
var gl=op.patch.cgl.gl;
var cgl=op.patch.cgl;
var texCount=0;

function loadCubemapTexture(target, texture, url)
{
    var image = new Image();
    image.crossOrigin = '';
    image.onload = function()
    {
        cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, true);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, texture);
        cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, true);
        cgl.gl.texImage2D(target, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, image);

        texCount++;
        if(texCount==6)
        {
            cgl.gl.generateMipmap(cgl.gl.TEXTURE_CUBE_MAP);
            outTex.set({"cubemap":skyboxCubemap});
            cgl.patch.loading.finished(loadingId);
        }
        
        cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, null);
    };
    image.onerror = function()
    {
        console.log("error while loading cube texture...",url);
        op.uiAttr({'error':'onerr could not load cubemap texture  '});
        cgl.patch.loading.finished(loadingId);

    };

    image.src = url;
}

function load()
{
    for(var i=0;i<numImages;i++)
    {
        var fn=inFilenames[i].get();
        if(fn.length===0 || fn=="0")
        {
            console.log("filename error");
            return;
        }
    }
    loadingId=cgl.patch.loading.start('cubemap texture','');


    texCount=0;
    skyboxCubemap = cgl.gl.createTexture();
    cgl.gl.bindTexture(cgl.gl.TEXTURE_CUBE_MAP, skyboxCubemap);
  
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_S, cgl.gl.CLAMP_TO_EDGE);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_WRAP_T, cgl.gl.CLAMP_TO_EDGE);

    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.LINEAR_MIPMAP_LINEAR);
    cgl.gl.texParameteri(cgl.gl.TEXTURE_CUBE_MAP, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.LINEAR);

    loadCubemapTexture(cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_X, skyboxCubemap, op.patch.getFilePath(inFilenames[0].get()));
    loadCubemapTexture(cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, skyboxCubemap, op.patch.getFilePath(inFilenames[1].get()));
    
    loadCubemapTexture(cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, skyboxCubemap, op.patch.getFilePath(inFilenames[3].get()));
    loadCubemapTexture(cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, skyboxCubemap, op.patch.getFilePath(inFilenames[2].get()));
    
    loadCubemapTexture(cgl.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, skyboxCubemap, op.patch.getFilePath(inFilenames[4].get()));
    loadCubemapTexture(cgl.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, skyboxCubemap, op.patch.getFilePath(inFilenames[5].get()));
}