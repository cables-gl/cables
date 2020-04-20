
const
    inVideoId=op.inString("Video ID",""),
    inAccount=op.inString("Account",""),
    inStyle=op.inStringEditor("Style"),
    inShow=op.inTriggerButton("Show"),
    outEle=op.outObject("Element");

const videoEle = document.createElement('video-js');
const id='brightcovevideo'+CABLES.uuid();
inStyle.onChange=updateStyle;
// inAccount.onChange=
    // inVideoId.onChange=create;

inShow.onTriggered=function()
{

    brightcovePlayerLoader({
        refNode: videoContainerEle,
        // refNodeInsert: 'replace',
        accountId: '673545638001',
        playerId: 'default',
        embedId: 'default',
        videoId: '5989140300001'
    })
    .then(function(success) {
        console.log("The player has been created!",success);
        // The player has been created!
    })
    .catch(function(error) {
        console.log("Player creation failed!",error);
    });

};

inStyle.set('\
    position:absolute;\n\
    z-index:9;\n\
    border:0;\n\
    top:10%;\n\
    left:10%;\n\
    width:80%;\n\
    height:80%;\n\
    ');



op.onDelete=function()
{
    if(videoEle) videoEle.remove();
}


// function waitVideoJs()
// {

//     if(!window.videojs)
//     {
//         console.log("video js not found");

//         setTimeout(waitVideoJs,1000);
//         return;
//     }
//     videojsloaded();

// }


// function videojsloaded()
// {


// console.log("videojs.players",videojs.players);

//       let loadVideo = () => {
//         videojs.players[id].ready(function () {

//             console.log("video player ready");

//           var myPlayer = this;
//           myPlayer.catalog.getVideo(inVideoId.get(), function (error, video) {
//             //deal with error
//             myPlayer.catalog.load(video);
//           });
//         });
//       };
// }

    const tagName='brightCoveScriptTag';
    // if(!CABLES[tagName])
    {

        console.log("Adding script");
        CABLES[tagName] = document.createElement('script');
        CABLES[tagName].setAttribute('src','https://players.brightcove.net/673545638001/default_default/index.min.js');
        document.body.appendChild(CABLES[tagName]);
    }


    // function create()
    // {

        const videoContainerEle = document.createElement('div');
        outEle.set(videoContainerEle);



    // videoEle.setAttribute('id',id);
    // videoEle.setAttribute('controls',true);
    // videoEle.setAttribute('class','video');

    // videoEle.dataset.account=inAccount.get();
    // videoEle.dataset.player='default';
    // videoEle.dataset.embed='default';
    // videoEle.dataset['applicationId']="";
    // videoEle.dataset['videoId']=inVideoId.get();

    // updateStyle();



    // waitVideoJs();



    // // videojs.getPlayer('id').ready(function() {
    // //     var myPlayer = this;
    // //     myPlayer.catalog.getVideo(inVideoId.get(), function(error, video)
    // //     {
    // //         //deal with error
    // //         myPlayer.catalog.load(video);
    // //     });
    // // });

// }

function updateStyle()
{
    // if(!active.get()) return;
    if(videoEle) videoEle.style=inStyle.get();
}



