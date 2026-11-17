# MultiPorts

Ports that can have a user defined number of sub ports.

`op.inMultiPort("Numbers", CABLES.OP_PORT_TYPE_NUMBER)`


## Example

This op can have multiple connections ior manually set number of ports. The output will be the sum of all those number ports.

```javascript

const
    nums=op.inMultiPort("Numbers", CABLES.OP_PORT_TYPE_NUMBER),
    outSum=op.outNumber("Sum");

nums.onChange= () =>
{
    let n=0;
    for(let i=0;i<nums.ports.length;i++)
    {
        n+=nums.ports[i].get();
    }

    outSum.set(n);
};

```

