const inLoading = op.inBool("Loading Active", false);

let loadingId = null;
let uuid = CABLES.uuid();

op.onDelete = stop;

function stop()
{
    op.patch.loading.finished(loadingId);
}

inLoading.onChange = () =>
{
    if (inLoading.get())
    {
        loadingId = op.patch.loading.start(op.objName, loadingId, op);
    }
    else
    {
        stop();
    }
};
