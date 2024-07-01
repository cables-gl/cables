// Op.apply(this, arguments);
let self = this;

this.name = "group";
this.exe = this.addInPort(new CABLES.Port(this, "exe", CABLES.OP_PORT_TYPE_FUNCTION));

this.triggers = [];

for (let i = 0; i < 10; i++)
{
    this.triggers.push(this.addOutPort(new CABLES.Port(this, "trigger " + i, CABLES.OP_PORT_TYPE_FUNCTION)));
}

this.exe.onTriggered = function ()
{
    for (let i in self.triggers)
        self.triggers[i].trigger();
};

this.uiAttribs.warning = "\"group\" is deprecated, please use \"sequence now\"";
