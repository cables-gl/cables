const
    urlData = op.inUrl("Font Data"),
    urlTex = op.inUrl("Font Image"),
    outLoaded=op.outBool("Loaded"),
    outNumChars=op.outNumber("Total Chars"),
    outChars=op.outString("Chars"),
    cgl=op.patch.cgl;

var
    loadedData=false,
    loadedTex=false,
    loadingId=0,
    loadingIdTex=0,
    tex;


urlData.onChange=
    urlTex.onChange=load;

const textures=[];

function updateLoaded()
{
    var l=loadedData && loadedTex;
    if(!outLoaded.get() && l) op.patch.emitEvent("FontLoadedMSDF");
    outLoaded.set(l);
}

function load()
{
    if(!urlData.get() || !urlTex.get()) return;

    textures.length=0;

    const varNameData="font_data_"+CABLES.basename(urlData.get());
    const varNameTex="font_tex_"+CABLES.basename(urlData.get());

    op.patch.setVarValue(varNameData,{});
    op.patch.setVarValue(varNameTex,textures);

    op.patch.getVar(varNameData).type="fontData";
    op.patch.getVar(varNameTex).type="fontTexture";

    loadedData=loadedTex=false;
    updateLoaded();

    console.log("loading font...");

    op.patch.loading.finished(loadingId);
    loadingId = op.patch.loading.start("jsonFile", "" + urlData.get());

    op.setUiError("invaliddata",null);
    op.setUiError("jsonerr",null);
    op.setUiError('texurlerror',null);

    var urlDatastr=op.patch.getFilePath(String(urlData.get()));


    // load font data json
    CABLES.ajax( urlDatastr, (err, _data, xhr) => {
        if(err)
        {
            console.error(err);
            return;
        }
        try
        {
            var data = _data;
            if (typeof data === "string") data = JSON.parse(_data);
            console.log(data);
            if(!data.chars || !data.info || !data.info.face)
            {
                op.setUiError("invaliddata","data file is invalid");
                return;
            }

            outNumChars.set(data.chars.length);
            var allChars="";
            for(var i=0;i<data.chars.length;i++)allChars+=data.chars[i].char;
            outChars.set(allChars);

            op.setUiAttrib({"extendTitle":data.info.face});

            op.patch.setVarValue(varNameData,null);
            op.patch.setVarValue(varNameData,
                {
                    "basename":CABLES.basename(urlData.get()),
                    "data":data
                });

            // op.patch.setVarValue(varNameData,data);
            // op.patch.setVarValue(varNameData,{});


            loadedData=true;
            updateLoaded();
        }
        catch (e)
        {
            console.error(e);
            op.setUiError("jsonerr", "Problem while loading json:<br/>" + e);
            op.patch.loading.finished(loadingId);
            updateLoaded();
            isLoading.set(false);
        }
    });




    // load font texture
    loadingIdTex=cgl.patch.loading.start('textureOp',urlTex.get());

    var urlTexstr=op.patch.getFilePath(String(urlTex.get()));

    tex=CGL.Texture.load(cgl,urlTexstr,
        function(err)
        {
            if(err)
            {
                console.log(err);
                op.setUiError('texurlerror','could not load texture');
                cgl.patch.loading.finished(loadingIdTex);
                loadedTex=false;
                return;
            }

            console.log("yeeh loaded texture");

            textures[0]=tex;
            op.patch.setVarValue(varNameTex,null);
            op.patch.setVarValue(varNameTex,textures);


            loadedTex=true;
            cgl.patch.loading.finished(loadingIdTex);
            updateLoaded();
            console.log("FLIPPO",tex.flip);


        },{
            filter:CGL.Texture.FILTER_LINEAR,
            flip:false
        });


}