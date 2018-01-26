var a=op.inValueString('url','');
var result=op.outValue("Result");
var CORS_CABLES_PROXY = 'https://cors.cables.gl/';

a.onChange=update;

update();

function update()
{
    result.set(CORS_CABLES_PROXY + a.get());
}
