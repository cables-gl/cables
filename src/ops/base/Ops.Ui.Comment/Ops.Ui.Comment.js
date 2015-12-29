    var self=this;
    CABLES.Op.apply(this, arguments);

    this.name='Comment';
    var title=this.addInPort(new Port(this,"title",OP_PORT_TYPE_VALUE,{type:'string'}));
    var text=this.addInPort(new Port(this,"text",OP_PORT_TYPE_VALUE,{type:'string'}));

    title.set('comment');
    text.set('');

    title.onValueChange(function()
    {
        this.name=title.get();
        this.uiAttr('title',this.name);
    });
