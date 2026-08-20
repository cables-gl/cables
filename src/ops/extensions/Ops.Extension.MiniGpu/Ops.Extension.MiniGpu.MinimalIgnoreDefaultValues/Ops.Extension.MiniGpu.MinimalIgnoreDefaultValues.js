const
    mini = op.inBool("Minimize patch json", false);

mini.onChange = () =>
{
    CABLES.minimalSeralize = mini.get();
};

op.onDelete = () =>
{
    CABLES.minimalSeralize = false;

};
