
let silent = false;

const Log =
{
    log()
    {
        if (silent) return;
        const args = ["[core]"];
        args.push.apply(args, arguments);
        Function.prototype.apply.apply(console.log, [console, args]);
    },
    warn(a)
    {
        if (silent) return;

        const args = ["[core]"];
        args.push.apply(args, arguments);

        Function.prototype.apply.apply(console.warn, [console, args]);
    },
    error(a)
    {
        const args = ["[core]"];
        args.push.apply(args, arguments);

        Function.prototype.apply.apply(console.error, [console, args]);
    },
    setSilent(s)
    {
        silent = s;
    }

};


export { Log };
