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
        formComp:{
            margin: 10,
        },
        formLabel:{
            paddingBottom: 8,
        },
        drawerPaper: {
            zIndex: 1,
            minWidth: 250,
            top: 'auto',
        },
        textField: {
            margin: 0,
            paddingBottom: 8,
        },
        toolbar: theme.mixins.toolbar,

    } as StyleRules);
}