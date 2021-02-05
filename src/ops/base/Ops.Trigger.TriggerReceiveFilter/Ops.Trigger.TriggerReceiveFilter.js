const prefixIn = op.inString("Prefix","");
const triggerOut = op.outTrigger("Trigger Out");

const listener = (triggerName) => {
    const prefix = prefixIn.get();
    if(prefix) {
        if(triggerName.startsWith(prefix)) {
            triggerOut.trigger();
        }
    }else{
        triggerOut.trigger();
    }
}

prefixIn.onChange= () => {
    if(prefixIn.get()) {
        op.setUiAttrib({ "extendTitle": prefixIn.get() });
    }
}

op.patch.addEventListener("namedTriggerSent", listener);
