const clientId="6f693b837b47b59a17403e79bcff3626";

const
    soundCloudUrl=op.inString("SoundCloud URL"),
    streamUrl=op.outString("Stream URL"),
    artworkUrl=op.outString("Artwork URL"),
    title=op.outString("Title"),
    result=op.outObject("Result");

streamUrl.ignoreValueSerialize=true;
artworkUrl.ignoreValueSerialize=true;
streamUrl.ignoreValueSerialize=true;
title.ignoreValueSerialize=true;
soundCloudUrl.onChange=resolve;

function resolve()
{
    if(soundCloudUrl.get())
        CABLES.ajax(
            'https://api.soundcloud.com/resolve.json?url='+soundCloudUrl.get()+'&client_id='+clientId,
            function(err,_data,xhr)
            {
                try
                {
                    var data=JSON.parse(_data);
                    streamUrl.set(data.stream_url+"?client_id="+clientId);
                    artworkUrl.set(data.artwork_url);
                    title.set(data.title);
                    op.log('stream url:'+data.stream_url);
                    op.log(data);
                }
                catch(e)
                {
                    console.log(e);
                }
            });

}
