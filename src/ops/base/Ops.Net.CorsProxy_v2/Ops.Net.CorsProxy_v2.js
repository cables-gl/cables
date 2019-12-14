var a=op.inString('URL','');
var result=op.outString("CORS URL");
var CORS_CABLES_PROXY = 'https://cors.cables.gl/';

a.onChange=update;

update();

function update()
{
    result.set(CORS_CABLES_PROXY + a.get());
}
