Creates a sub-patch, so you can bundle together certain ops in a group. To define which ports of the ops should be accessible outside you have to connect ports to the dyn port, you can then use them for the inner routing of the sub-patch (via the PatchInput-op).
If you want to make outputs accessible outside the sub-patch, you have to drag a cable to the dyn-port of PatchOutput.
Currently sub-patches cannot have output-ports, this will probably be added in the furure.

