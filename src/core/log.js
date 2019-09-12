
var silent=false;

const Log=
{
    log:function()
    {
        if (silent) return;
        const args = ["[core]"];
        args.push.apply(args, arguments);
        Function.prototype.apply.apply(console.log, [console, args]);
    },
    warn:function(a)
    {
        if (silent) return;

        var args = ["[core]"];
        args.push.apply(args, arguments);

        Function.prototype.apply.apply(console.warn, [console, args]);
    },
    error:function(a)
    {
        var args = ["[core]"];
        args.push.apply(args, arguments);

        Function.prototype.apply.apply(console.error, [console, args]);
    },
    setSilent:function(s)
    {
        silent=s;
    }
    
}


export { Log }
