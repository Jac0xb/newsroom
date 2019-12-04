import { StyleRules, Theme } from '@material-ui/core/styles';
import { display } from '@material-ui/system';

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
        closedDrawer: {
            zIndex: 1,
            minWidth: 64,
            top: 'auto',
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
        buttonGroup: {
            margin: 16,
            position: "fixed",
            bottom: 0,
            right: 0,
            width: 220

        },
        button: {
            margin: 8
        },
        stageButtonGroup:{
            width: "100%",
            display: "flex",
            alignSelf: "center",
        },
        stageButton:{
            flexGrow: 1

        },
        focusedDeleteButton: {
            background:"rgb(220, 0, 78)",
            backgroundColor:"rgb(220, 0, 78)"
        },
        deleteButton: {
            margin: 8,
            background:"rgb(220, 0, 78)",
            backgroundColor:"rgb(220, 0, 78)"
            // backgroundColor: "red",
            // color: "white",
            // "& > *": {
            //     backgroundColor: "red"
            // }
        },
        toolbar: theme.mixins.toolbar,
        triggerCont: {
            paddingLeft: 40,
        },

    } as StyleRules);
}