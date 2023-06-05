let clientId = "6f693b837b47b59a17403e79bcff3626";

let soundCloudUrl = op.addInPort(new CABLES.Port(op, "SoundCloud URL", CABLES.OP_PORT_TYPE_VALUE, { "type": "string" }));

let streamUrl = op.addOutPort(new CABLES.Port(op, "Stream URL", CABLES.OP_PORT_TYPE_VALUE));
let artworkUrl = op.addOutPort(new CABLES.Port(op, "Artwork URL", CABLES.OP_PORT_TYPE_VALUE));
let title = op.addOutPort(new CABLES.Port(op, "Title", CABLES.OP_PORT_TYPE_VALUE));
let result = op.addOutPort(new CABLES.Port(op, "Result", CABLES.OP_PORT_TYPE_OBJECT));

// soundCloudUrl.ignoreValueSerialize=true;
streamUrl.ignoreValueSerialize = true;
artworkUrl.ignoreValueSerialize = true;
streamUrl.ignoreValueSerialize = true;
title.ignoreValueSerialize = true;
soundCloudUrl.onChange = resolve;

function resolve()
{
    if (soundCloudUrl.get())
        CABLES.ajax(
            "https://api.soundcloud.com/resolve.json?url=" + soundCloudUrl.get() + "&client_id=" + clientId,
            function (err, _data, xhr)
            {
                try
                {
                    let data = JSON.parse(_data);
                    streamUrl.set(data.stream_url + "?client_id=" + clientId);
                    artworkUrl.set(data.artwork_url);
                    title.set(data.title);
                }
                catch (e) { console.log(e); }
            });
}
