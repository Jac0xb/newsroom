import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
        layout: {
            //display: "flex",
        },
        drawer: {
            width: 240,
            flexShrink: 0,
        },
        drawerPaper: {
            zIndex: 1,
            minWidth: 250,
            top: 'auto',
        },
        toolbar: theme.mixins.toolbar,

    } as StyleRules);
}