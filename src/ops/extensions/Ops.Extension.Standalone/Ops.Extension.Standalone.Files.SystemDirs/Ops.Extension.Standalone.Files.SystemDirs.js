
const fs = op.require("fs");

const paths = op.patch.config.paths || {};

op.outString("Home", paths.home);
op.outString("Downloads", paths.downloads);
op.outString("Documents", paths.documents);
op.outString("Desktop", paths.desktop);
op.outString("Exe", paths.exe);

