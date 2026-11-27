// stand-in for the sdk's McpServer in the web editor: there is no node there, so tools and resources are only collected

class McpToolRegistry
{
    constructor()
    {
        this._registeredTools = {};
        this._registeredResources = {};
    }

    // same argument order as McpServer.tool: name, [description], [params shape], [annotations], handler
    tool(name, ...args)
    {
        const handler = args.pop();
        const description = typeof args[0] == "string" ? args.shift() : "";
        const shape = args[0] || {};
        this._registeredTools[name] = { "description": description, "shape": shape, "handler": handler };
    }

    registerResource(name, template, meta, handler)
    {
        this._registeredResources[name] = { "template": template, "meta": meta, "handler": handler };
    }

    isConnected() { return false; }

    sendResourceListChanged() {}

    close() {}

    // answers one mcp json-rpc message, resolves with the response or null for notifications
    async handleMessage(msg, info)
    {
        if (!msg || msg.id === undefined || msg.id === null) return null;

        try
        {
            return { "jsonrpc": "2.0", "id": msg.id, "result": await this._dispatch(msg.method, msg.params || {}, info) };
        }
        catch (e)
        {
            return { "jsonrpc": "2.0", "id": msg.id, "error": { "code": e.code || -32603, "message": e.message } };
        }
    }

    async _dispatch(method, params, info)
    {
        switch (method)
        {
            case "initialize":
                return {
                    "protocolVersion": params.protocolVersion || "2025-06-18",
                        "capabilities": { "tools": {}, "resources": {} },
                        "serverInfo": { "name": info.name, "version": info.version },
                        "instructions": info.instructions
                };

            case "ping":
                return {};

            case "tools/list":
                return {
                    "tools": Object.keys(this._registeredTools).map((name) =>
                    {
                        const t = this._registeredTools[name];
                        return { "name": name, "description": t.description, "inputSchema": z.toJSONSchema(z.object(t.shape)) };
                    })
                };

            case "tools/call":
                return this._callTool(params.name, params.arguments || {});

            case "resources/list":
                return { "resources": await this._listResources() };

            case "resources/templates/list":
                return {
                    "resourceTemplates": Object.keys(this._registeredResources).map((name) =>
                    {
                        const r = this._registeredResources[name];
                        return { "name": name, "uriTemplate": String(r.template.uriTemplate), ...r.meta };
                    })
                };

            case "resources/read":
                return this._readResource(params.uri);
        }
        throw Object.assign(new Error("method not found: " + method), { "code": -32601 });
    }

    // like the sdk, invalid arguments and exceptions become an error result the client model can read
    async _callTool(name, args)
    {
        const t = this._registeredTools[name];
        if (!t) throw Object.assign(new Error("unknown tool: " + name), { "code": -32602 });

        const parsed = z.object(t.shape).safeParse(args);
        if (!parsed.success) return { "content": [{ "type": "text", "text": "invalid arguments for tool " + name + ": " + parsed.error.message }], "isError": true };

        try
        {
            return await t.handler(parsed.data);
        }
        catch (e)
        {
            return { "content": [{ "type": "text", "text": e.message }], "isError": true };
        }
    }

    async _listResources()
    {
        const list = [];
        for (const name of Object.keys(this._registeredResources))
        {
            const listCallback = resourceListCallback(this._registeredResources[name].template);
            if (listCallback) list.push(...(await listCallback()).resources);
        }
        return list;
    }

    _readResource(uri)
    {
        for (const name of Object.keys(this._registeredResources))
        {
            const r = this._registeredResources[name];
            const vars = matchUriTemplate(String(r.template.uriTemplate), uri);
            if (vars) return r.handler(new URL(uri), vars);
        }
        throw Object.assign(new Error("resource not found: " + uri), { "code": -32002 });
    }
}

// the standalone registers the sdk's ResourceTemplate, the web editor McpResourceTemplate
function resourceListCallback(template)
{
    return template.listCallback || (template.callbacks && template.callbacks.list);
}

// only the simple {name} form of rfc 6570 is used by the resources here
function matchUriTemplate(template, uri)
{
    const names = [];
    const pattern = template.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\w+)\}/g, (m, name) =>
    {
        names.push(name);
        return "([^/]+)";
    });
    const match = new RegExp("^" + pattern + "$").exec(uri);
    if (!match) return null;
    const vars = {};
    names.forEach((name, i) => { vars[name] = decodeURIComponent(match[i + 1]); });
    return vars;
}

class McpResourceTemplate
{
    constructor(uriTemplate, callbacks)
    {
        this.uriTemplate = uriTemplate;
        this.callbacks = callbacks;
    }
}
