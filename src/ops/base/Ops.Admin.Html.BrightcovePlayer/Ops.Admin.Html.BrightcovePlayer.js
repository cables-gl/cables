
const
    inVideoId = op.inString("Video ID", ""),
    inAccount = op.inString("Account", ""),
    inStyle = op.inStringEditor("Style"),
    inShow = op.inTriggerButton("Show"),
    outEle = op.outObject("Element");

const videoEle = document.createElement("video-js");
const id = "brightcovevideo" + CABLES.uuid();
inStyle.onChange = updateStyle;
// inAccount.onChange=
// inVideoId.onChange=create;

inShow.onTriggered = function ()
{
    brightcovePlayerLoader({
        "refNode": videoContainerEle,
        // refNodeInsert: 'replace',
        "accountId": "673545638001",
        "playerId": "default",
        "embedId": "default",
        "videoId": "5989140300001"
    })
        .then(function (success)
        {
            op.log("The player has been created!", success);
        // The player has been created!
        })
        .catch(function (error)
        {
            op.log("Player creation failed!", error);
        });
};

inStyle.set("\
    position:absolute;\n\
    z-index:9;\n\
    border:0;\n\
    top:10%;\n\
    left:10%;\n\
    width:80%;\n\
    height:80%;\n\
    ");

op.onDelete = function ()
{
    if (videoEle) videoEle.remove();
};

const tagName = "brightCoveScriptTag";

op.log("Adding script");
CABLES[tagName] = document.createElement("script");
CABLES[tagName].setAttribute("src", "https://players.brightcove.net/673545638001/default_default/index.min.js");
document.body.appendChild(CABLES[tagName]);

const videoContainerEle = document.createElement("div");
outEle.set(videoContainerEle);

function updateStyle()
{
    if (videoEle) videoEle.style = inStyle.get();
}
