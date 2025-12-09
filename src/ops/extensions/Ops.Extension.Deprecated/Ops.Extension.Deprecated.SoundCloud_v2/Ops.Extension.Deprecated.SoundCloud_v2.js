const
    soundCloudUrl = op.inString("SoundCloud URL"),
    clientId = op.inString("SoundCloud Client Id", "6f693b837b47b59a17403e79bcff3626"),
    clientSecret = op.inString("SoundCloud Client Secret", "efdeff51dee9e7357e2a4394b49d340a"),
    streamFormats = op.inDropDown("Formats", []),
    streamUrl = op.outString("Stream URL"),
    artworkUrl = op.outString("Artwork URL"),
    title = op.outString("Title"),
    result = op.outObject("Result");

streamUrl.ignoreValueSerialize = true;
artworkUrl.ignoreValueSerialize = true;
streamUrl.ignoreValueSerialize = true;
title.ignoreValueSerialize = true;
soundCloudUrl.onChange = streamFormats.onChange = resolve;

let accessToken = null;

const fetchData = (token) =>
{
    op.setUiError("error", null);

    const baseUrl = "https://api.soundcloud.com";
    const resolveUrl = baseUrl + "/resolve.json?url=" + soundCloudUrl.get();
    fetch(resolveUrl, {
        "headers": {
            "Authorization": "OAuth " + token
        }
    }).then((response) => { return response.json(); }).then((data) =>
    {
        const trackUrl = baseUrl + "/tracks/" + data.id + "/streams";
        fetch(trackUrl, {
            "headers": {
                "Authorization": "OAuth " + token
            }
        }).then((response) => { return response.json(); }).then((trackData) =>
        {
            const availableFormats = Object.keys(trackData);
            streamFormats.setUiAttribs({ "values": availableFormats });
            let formatUrl = trackData[availableFormats[0]];
            if (streamFormats.get() && trackData.hasOwnProperty(streamFormats.get()))
            {
                formatUrl = trackData[streamFormats.get()];
            }
            try
            {
                streamUrl.set(formatUrl);
                artworkUrl.set(data.artwork_url);
                title.set(data.title);
                result.set(data);
            }
            catch (e)
            {
                op.setUiError("error", "failed to load track from soundcloud");
                op.logError(e);
            }
        });
    });
};

function resolve()
{
    op.setUiError("credentials", null);
    if (!clientId.get() || !clientSecret.get())
    {
        op.setUiError("credentials", "SoundClound credentials missing - provide client id and secret");
    }
    if (soundCloudUrl.get())
    {
        fetch("https://api.soundcloud.com/oauth2/token", {
            "method": "POST",
            "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "body": new URLSearchParams({
                "client_id": clientId.get(),
                "client_secret": clientSecret.get(),
                "grant_type": "client_credentials"
            })
        }).then((response) => { return response.json(); }).then((data) =>
        {
            const newToken = data.access_token;
            accessToken = newToken;
            fetchData(newToken);
        });
    }
}
