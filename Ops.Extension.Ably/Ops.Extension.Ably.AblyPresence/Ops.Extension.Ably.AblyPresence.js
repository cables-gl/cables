const inConnection = op.inObject("Connection", null, "Ably");
const inActive = op.inBool("Active", false);
const inChannel = op.inString("Channel");
const inName = op.inString("Name");
const inIgnoreOwn = op.inBool("Ignore Own Presence", false);
const inPresenceData = op.inObject("Presence Data");
const inDelay = op.inInt("Update Delay ms", 0);
const sendTrigger = op.inTriggerButton("Send");

const outMembers = op.outArray("Members");

let channel = null;
let subscription = false;
let delayTimeout = null;

inConnection.onChange = () =>
{
    if (!inConnection.get()) return;
    if (inChannel.get() && inName.get())
    {
        unsubscribe(inChannel.get(), inName.get());
        subscribe(inChannel.get(), inName.get());
    }
};

sendTrigger.onTriggered = () =>
{
    update(channel, inName.get());
};

inActive.onChange = () =>
{
    if (inActive.get())
    {
        subscribe(inChannel.get(), inName.get());
    }
    else
    {
        unsubscribe(inChannel.get(), inName.get(), true);
    }
};

inChannel.onChange = () =>
{
    subscribe(inChannel.get(), inName.get());
};

inName.onChange = () =>
{
    subscribe(inChannel.get(), inName.get());
};

function update(c, name)
{
    if (!subscription) return;
    if (!inActive.get()) return;
    if (!inConnection.get()) return;
    if (!c) return;
    if (!name) return;
    if (!inPresenceData.get()) return;
    c.presence.update(inPresenceData.get());
}

function subscribe(c, name)
{
    if (subscription) return;
    if (!inActive.get()) return;
    if (!inConnection.get()) return;
    if (!name) return;

    subscription = true;
    const ablyInstance = inConnection.get();
    if (ablyInstance && ablyInstance.channels)
    {
        channel = ablyInstance.channels.get(c);
        if (channel)
        {
            // unsubscribe(c, name);
            try
            {
                const presenceData = inPresenceData.get();
                channel.presence.enter([presenceData], (err) =>
                {
                    if (err) { return op.log("Error entering presence", err); }
                    channel.presence.get((err, membersData) =>
                    {
                        if (err) { return op.log("Error fetching presence data"); }
                        outMembers.set(membersData);
                    });
                    channel.presence.subscribe((presenceMsg) =>
                    {
                        if (inDelay.get() && inDelay.get() > 0)
                        {
                            if (!delayTimeout)
                            {
                                delayTimeout = setTimeout(() =>
                                {
                                    handlePresence(presenceMsg);
                                    delayTimeout = null;
                                }, inDelay.get());
                            }
                        }
                        else
                        {
                            handlePresence(presenceMsg);
                        }
                    });
                });
            }
            catch (e)
            {
                op.log("ERROR: failed to update presence data", inPresenceData.get());
                subscription = false;
            }
        }
        else
        {
            subscription = false;
        }
    }
    else
    {
        subscription = false;
    }
}

function handlePresence(presenceMsg)
{
    channel.presence.get((err, membersData) =>
    {
        membersData.forEach((member) =>
        {
            if (member.data && Array.isArray(member.data))
            {
                if (member.data.length === 0)
                {
                    member.data = {};
                }
                else
                {
                    member.data = member.data[0];
                }
            }
        });
        if (inIgnoreOwn.get())
        {
            const ablyInstance = inConnection.get();
            if (ablyInstance)
            {
                membersData = membersData.filter((member) =>
                {
                    return member.clientId !== ablyInstance.options.clientId;
                });
            }
        }
        outMembers.set(membersData);
    });
}

function unsubscribe(c, name, ignoreInactive)
{
    if (!subscription) return;
    if (!inActive.get() && !ignoreInactive) return;
    if (!inConnection.get()) return;
    if (!c) return;
    if (!name) return;

    const ablyInstance = inConnection.get();
    if (ablyInstance && ablyInstance.channels)
    {
        channel = ablyInstance.channels.get(c);
        if (channel)
        {
            channel.presence.unsubscribe();
            channel.presence.leave();
            subscription = false;
        }
    }
}
