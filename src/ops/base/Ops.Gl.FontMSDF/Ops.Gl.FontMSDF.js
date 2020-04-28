const
    urlData = op.inUrl("Font Data"),
    urlTex = op.inUrl("Font Image"),
    urlTex1 = op.inUrl("Font Image 1"),
    urlTex2 = op.inUrl("Font Image 2"),
    urlTex3 = op.inUrl("Font Image 3"),
    outLoaded=op.outBool("Loaded"),
    outNumChars=op.outNumber("Total Chars"),
    outChars=op.outString("Chars"),
    cgl=op.patch.cgl;

var
    loadedData=false,
    loadedTex=false,
    loadingId=0;


urlData.onChange=
    urlTex.onChange=
    urlTex1.onChange=
    urlTex2.onChange=
    urlTex3.onChange=load;

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

            op.patch.loading.finished(loadingId);
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

    for(var i=0;i<4;i++)
    {
        const num=i;

        var texPort=urlTex;
        if(i==1)texPort=urlTex1;
        if(i==2)texPort=urlTex2;
        if(i==3)texPort=urlTex3;

        if(!texPort.get())continue;

        const loadingIdTex=cgl.patch.loading.start('textureOp',texPort.get());
        const urlTexstr=op.patch.getFilePath(String(texPort.get()));

        CGL.Texture.load(cgl,urlTexstr,
            function(err,tex)
            {
                if(err)
                {
                    op.setUiError('texurlerror','could not load texture');
                    cgl.patch.loading.finished(loadingIdTex);
                    loadedTex=false;
                    return;
                }
// console.log("loaded...",tex);
                textures[num]=tex;
                op.patch.setVarValue(varNameTex,null);
                op.patch.setVarValue(varNameTex,textures);

                loadedTex=true;
                cgl.patch.loading.finished(loadingIdTex);
                updateLoaded();
            },{
                filter:CGL.Texture.FILTER_LINEAR,
                flip:false
            });
    }



}