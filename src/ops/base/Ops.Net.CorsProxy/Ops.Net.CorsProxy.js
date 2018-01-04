var a=op.inValueString('url','');
var result=op.outValue("Result");

a.onChange=update;

update();

function update()
{
    var str='https://cors.cables.gl/';

    result.set(str + a.get());
}