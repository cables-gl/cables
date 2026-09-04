let glExt = null;
let cgl = null;
let query = null;
let glqueryagain = 0;

if (op.patch.cgl) op.patch.cgl.on("heavyEvent", (e) => { heavyEvents.push(e.event); });

function glBeginFrame()
{
    if (!query)
    {
        cgl = op.patch.cgl;
        if (!glExt) glExt = cgl.gl.getExtension("EXT_disjoint_timer_query_webgl2");
        if (glExt)
        {
            query = cgl.gl.createQuery();
            cgl.gl.beginQuery(glExt.TIME_ELAPSED_EXT, query);
        }
    }
}

function glEndFrame()
{
    if (type == "webgl" && glExt && query != null) cgl.gl.endQuery(glExt.TIME_ELAPSED_EXT);
}

function glUpdate()
{
    if (cgl && query)
    {
        const available = cgl.gl.getQueryParameter(query, cgl.gl.QUERY_RESULT_AVAILABLE);
        const disjoint = cgl.gl.getParameter(glExt.GPU_DISJOINT_EXT);

        if (available && !disjoint)
        {
            const gpuTimeNs = cgl.gl.getQueryParameter(query, cgl.gl.QUERY_RESULT);
            gpuTimeMs = gpuTimeNs / 1000000;

            setTimeout(() => { query = null; }, 50); // timer queries seem to work better when not called directly after another...
        }
        else
        {
            glqueryagain++;
            if (glqueryagain > 100)
            {
                query = null;
                glqueryagain = 0;
            }
        }

    }

}
