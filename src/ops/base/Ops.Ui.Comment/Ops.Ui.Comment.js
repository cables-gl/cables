op.name='Comment';
var title=op.addInPort(new Port(op,"title",OP_PORT_TYPE_VALUE,{type:'string'}));
var text=op.addInPort(new Port(op,"text",OP_PORT_TYPE_VALUE,{type:'string'}));

title.set('comment');
text.set('');

title.onValueChange(function()
{
    op.name=title.get();
    op.uiAttr('title',op.name);
});
