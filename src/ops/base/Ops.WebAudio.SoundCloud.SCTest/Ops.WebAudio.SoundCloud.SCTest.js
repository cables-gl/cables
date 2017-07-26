op.name="SoundCloud";

// https://developers.soundcloud.com/docs/api/sdks<script> 
var clientId="6f693b837b47b59a17403e79bcff3626";

$('head').append('<script src="https://connect.soundcloud.com/sdk/sdk-3.1.2.js"></script>');

// $.get(''+
//     permalink_url+'/tracks&client_id='+client_id , function (result) {
//         console.log(result);
//     });
var url='http://soundcloud.com/lowcountrykingdom/another-ordinary-day';
CABLES.ajax(
    'http://api.soundcloud.com/resolve.json?url='+url+'&client_id='+clientId,
    function(err,data,xhr)
    {
        console.log(data);
    });



function init()
{
    if(!window.hasOwnProperty("SC"))
    {
        setTimeout(init, 200);
        console.log('waiting for soundcloud...')
        return;
    }
    

    SC.initialize({ client_id: clientId });



SC.stream('/tracks/47580057').then(function(player){
  player.play();
  console.log('playing...');
});

// SC.get('/user/katermukke/tracks').then(function(tracks){
//   alert('Latest track: ' + tracks[0].title);
// });

    
}

init();
