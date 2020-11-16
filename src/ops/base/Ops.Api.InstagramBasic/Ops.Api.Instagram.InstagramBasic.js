
const API_URL = "https://graph.instagram.com/me/media?fields=";
const API_FIELDS = "caption,media_url,media_type,permalink,timestamp,username";
const inApiKey = op.inString("API Key");
const inAllowedHashtags = op.inString("Allowed hashtags (comma separated, leave empty for all)");
const inButton = op.inTriggerButton("Fetch API");
const inAllowVideos = op.inBool("Include videos", false);
const inEntryLimit = op.inInt("Max entries",20);

const outTrigger = op.outTrigger("Trigger out");
const outKeyVal = op.outArray("Entries");
const outNumElements = op.outNumber("Number of Instagram entries");

inButton.onTriggered = update;
inAllowedHashtags.onChange = updateHashtags;

var CORS_CABLES_PROXY = 'https://cors.cables.gl/';

let hashtags = [];


function updateHashtags()
{
    if (!inAllowedHashtags.get())
    {
        hashtags = [];
    }
    else
    {
        let str = inAllowedHashtags.get().replace(/\s+/g, ""); // remove spaces
        str = str.replace(/#+/g, ""); // remove # if people used that
        hashtags = str.split(",");
        // console.log(str);
    }
}

function update()
{
    if (!inApiKey.get())
    {
        // not a string
    }
    else
    {
        const getUrl = API_URL + API_FIELDS + "&access_token=" + inApiKey.get() + "&limit=" + inEntryLimit.get();

        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function ()
        {
            if (this.readyState == 4 && this.status == 200)
            {
                const data = JSON.parse(this.responseText);
                const arr = [];
                // ok lets filter only the hashtags and content types we want to see
                for (let i = 0; i < data.data.length; i++)
                {
                    if (data.data[i].media_type === "VIDEO" && !inAllowVideos.get())
                    {
                        // no video
                    }
                    else
                    {
                        // console.log(data.data[i].caption);
                        let foundHashtags = [];
                        if(data.data[i].caption != undefined) {
                            const f = data.data[i].caption.match(/#\w+/mg);
                            if (f != null) foundHashtags = f.map((s) => s.substr(1));
                            // console.log(foundHashtags);
                        }

                        if (hashtags.length == 0)
                        {
                            var d = data.data[i];
                            //d.media_url = CORS_CABLES_PROXY + d.media_url;
                            arr.push(data.data[i]);
                        }
                        else
                        {
                            for (let x = 0; x < foundHashtags.length; x++)
                            {
                                for (let y = 0; y < hashtags.length; y++)
                                {
                                    if (foundHashtags[x] === hashtags[y])
                                    {
                                        arr.push(data.data[i]);
                                    }
                                }
                            }
                        }
                    }
                }

                outKeyVal.set(arr);
                outNumElements.set(arr.length);

                outTrigger.trigger();
                console.log(arr);
            }
        };
        xhttp.open("GET", getUrl, true);
        xhttp.send();
    }
}
