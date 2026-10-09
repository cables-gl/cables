const idx = op.inValueInt("Index");
const valuePorts = [];
const result = op.outNumber("Result");

idx.onChange = update;
updateUi();

for (let i = 0; i < 16; i++)
{
    let p = op.inFloat("Value " + i);
    valuePorts.push(p);
    p.onChange = update;
}

function update()
{
    const i = idx.get();
    if (i >= 0 && valuePorts[i])
    {
        result.set(valuePorts[i].get());
    }
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
