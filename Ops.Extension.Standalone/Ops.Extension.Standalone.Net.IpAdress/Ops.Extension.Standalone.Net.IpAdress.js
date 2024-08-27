
const os= op.require("os");
const
    outIp=op.outString("Local IP"),
    outInter=op.outString("Interface"),
    outData=op.outObject("Data");


get();

async function get()
{
    const ifaces=os.networkInterfaces();

    outData.set(ifaces);
    for(let i in ifaces)
    {

        for(let j=0;j<ifaces[i].length;j++)
        {
            const inf=ifaces[i][j];

            if(inf.family=="IPv4" && !inf.internal)
            {
                outInter.set(i);
                outIp.set(inf.address);
                return;
            }

        }
    }

}
