    Op.apply(this, arguments);
    var self=this;
var cgl=this.patch.cgl;
    this.name='stromerzeuger';
    this.result=this.addOutPort(new Port(this,"result"));
    
    var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
    var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

    
    var volatile=this.addInPort(new Port(this,"volatile",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var flexible=this.addInPort(new Port(this,"flexible",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var notstrom=this.addInPort(new Port(this,"notstrom",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var power2heat=this.addInPort(new Port(this,"power2heat",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var verbraucher=this.addInPort(new Port(this,"verbraucher",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var regelenergie=this.addInPort(new Port(this,"regelenergie",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var boerse=this.addInPort(new Port(this,"boerse",OP_PORT_TYPE_VALUE,{display:'bool'}));
    
    var out_top1=this.addOutPort(new Port(this,"top1",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var out_top2=this.addOutPort(new Port(this,"top2",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var out_bot1=this.addOutPort(new Port(this,"bottom1",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var out_bot2=this.addOutPort(new Port(this,"bottom2",OP_PORT_TYPE_VALUE,{display:'bool'}));
    
    var out_volatile=this.addOutPort(new Port(this,"out volatile",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var out_flexible=this.addOutPort(new Port(this,"out flexible",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var out_notstrom=this.addOutPort(new Port(this,"out notstrom",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var out_verbraucher=this.addOutPort(new Port(this,"out verbraucher",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var out_power2heat=this.addOutPort(new Port(this,"out power2heat",OP_PORT_TYPE_VALUE,{display:'bool'}));
    var out_cursor=this.addOutPort(new Port(this,"cursor",OP_PORT_TYPE_VALUE,{display:'bool'}));


    var update=function()
    {
        if(cgl.frameStore.pickingpass)return;


        var vtop1=false;
        var vtop2=false;
        var vbottom1=false;
        var vbottom2=false;

        var vout_volatile=false;
        var vout_flexible=false;
        var vout_notstrom=false;
        var vout_verbraucher=false;
        var vout_power2heat=false;
        
        var cursor=false;

        
        if(volatile.get())
        {
            vtop1=true;
            vtop2=false;
            vbottom1=true;
            vbottom2=true;
            cursor=true;
            vout_volatile=true;
        }
        else if(flexible.get())
        {
            vtop1=true;
            vtop2=true;
            vbottom1=false;
            vbottom2=true;
            vout_flexible=true;
            cursor=true;
        }
        else if(notstrom.get())
        {
            vtop1=true;
            vtop2=true;
            vbottom1=false;
            vbottom2=false;
            vout_notstrom=true;
            cursor=true;
        }
        else if( power2heat.get())
        {
            vtop1=true;
            vtop2=true;
            vbottom1=false;
            vbottom2=false;
            vout_power2heat=true;
            cursor=true;
        }
        else if(verbraucher.get())
        {
            vtop1=true;
            vtop2=true;
            vbottom1=true;
            vbottom2=true;
            vout_verbraucher=true;
            cursor=true;
        }
        else if(regelenergie.get())
        {
            vtop1=true;
            vtop2=true;
            vbottom1=false;
            vbottom2=false;

            vout_volatile=false;
            vout_flexible=true;
            vout_notstrom=true;
            vout_verbraucher=true;
            vout_power2heat=true;
            cursor=true;
        }
        else if(boerse.get())
        {
            vtop1=true;
            vtop2=false;
            vbottom1=true;
            vbottom2=true;

            vout_volatile=true;
            vout_flexible=true;
            vout_notstrom=false;
            vout_verbraucher=true;
            vout_power2heat=false;
            cursor=true;
        }

        out_top1.set(vtop1);
        out_top2.set(vtop2);
        out_bot1.set(vbottom1);
        out_bot2.set(vbottom2);

        out_volatile.set(vout_volatile);
        out_flexible.set(vout_flexible);
        out_notstrom.set(vout_notstrom);
        out_verbraucher.set(vout_verbraucher);
        out_power2heat.set(vout_power2heat);
        out_cursor.set(cursor);
        trigger.trigger();
    }

    // volatile.onValueChanged=update;
    // flexible.onValueChanged=update;
    // notstrom.onValueChanged=update;
    // boerse.onValueChanged=update;
    // regelenergie.onValueChanged=update;
    // verbraucher.onValueChanged=update;
    // power2heat.onValueChanged=update;
    update();
    
    render.onTriggered=update;
