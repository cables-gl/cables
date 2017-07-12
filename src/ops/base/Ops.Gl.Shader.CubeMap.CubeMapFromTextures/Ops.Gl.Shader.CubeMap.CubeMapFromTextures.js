op.name="CubeMapFromTextures";


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
    var file=op.addInPort(new Port(op,titles[i],OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));
    file.onChange=load;
    inFilenames.push(file);
}

var skyboxCubemap=null;
var gl=op.patch.cgl.gl;


function load()
{
    var ct = 0;
    var img = new Array(numImages);
    var urls = [];
    var i=0;


    var cubemapTargets = [  // targets for use in some gl functions for working with cubemaps
       gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
       gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
       gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z 
    ];


    for(i=0;i<numImages;i++)
    {
        var fn=inFilenames[i].get();
        if(fn.length===0 || fn=="0")
        {
            console.log("load canceled");
            return;
        }
        fn=op.patch.getFilePath(fn);
        urls.push(fn);
    }
    

    for(i = 0; i < 6; i++)
    {
        img[i] = new Image();
        img[i].onload = function()
        {
            ct++;
            if (ct == 6) {
                // document.getElementById("headline").innerHTML = "WebGL Dynamic Cubemap";
                
                skyboxCubemap = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxCubemap);
                
                outTex.set({"cubemap":skyboxCubemap});
                
                try {
                    for (var j = 0; j < 6; j++) {
                        gl.texImage2D(cubemapTargets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    }
                } catch(e) {  // (Could be the security exception in some browsers when reading from the local disk)
                    console.log(e);
                    console.log( "could not load cubemap texture");
                }
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                // if (animating) {
                //     requestAnimationFrame(frame);
                // }
                // else {
                //     draw();
                // }
            }
        };

        img[i].onerror = function() {
            console.log("error while loading cube texture...");
            //  document.getElementById("headline").innerHTML = "ERROR WHILE TRYING TO LOAD SKYBOX TEXTURE";
        };
        img[i].src = urls[i];
    }

    
}