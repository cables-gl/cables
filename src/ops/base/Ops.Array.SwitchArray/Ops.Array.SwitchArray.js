let idx = op.inValueInt("Index");
let valuePorts = [];
let result = op.outArray("Result");

idx.onChange =
idx.onLinkChanged = update;
op.on("init", update);

for (let i = 0; i < 10; i++)
{
    let p = op.inArray("Array " + i);
    valuePorts.push(p);
    p.onChange = update;
    p.onLinkChanged = update;
}

function update()
{
    if (idx.get() >= 0 && valuePorts[idx.get()] && valuePorts[idx.get()].isLinked())
    {
        result.setRef(valuePorts[idx.get()].get());
    }
    else
        result.setRef([]);
}


/* minimalcore:start */
function updateUi()
{
  if(!CABLES.UI)return;
  for (let i = 0; i < valuePorts.length; i++) valuePorts[i].setUiAttribs({arrow:i==idx.get()})
}
idx.on("change",updateUi);
updateUi();
/* minimalcore:end */

