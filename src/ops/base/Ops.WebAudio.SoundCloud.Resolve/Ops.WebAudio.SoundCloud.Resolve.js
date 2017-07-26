op.name="SoundCloud Resolve";

var clientId="6f693b837b47b59a17403e79bcff3626";

var streamUrl=op.addOutPort(new Port(op,"Stream URL",OP_PORT_TYPE_VALUE));
var result=op.addOutPort(new Port(op,"Result",OP_PORT_TYPE_OBJECT));

var url='http://soundcloud.com/lowcountrykingdom/another-ordinary-day';
CABLES.ajax(
    'http://api.soundcloud.com/resolve.json?url='+url+'&client_id='+clientId,
    function(err,_data,xhr)
    {
        var data=JSON.parse(_data);
streamUrl.set(data.stream_url+"?client_id="+clientId);

        console.log(data);
    });

