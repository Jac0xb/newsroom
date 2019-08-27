import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return ({
        menuGroup: {
            position: 'fixed',
            left: 0,
            right: 0,
            zIndex: 1,
        },
        workflowContent: {
            // marginTop: theme.spacing.unit * 3,
            padding: theme.spacing.unit * 2,
            display: "flex",
            overflowX: "auto",
        },
        content: {
            display: 'inline-flex',
        },
        menuSpacerHeight: {
            height: 64,
        },
        menuSpacerWidth: {
            width: 250,
        },
        stagePlusButton: {
            display: "inline-flex"
        },
        stageGrid: {
            margin: theme.spacing.unit,
            minWidth: "200px",
            maxWidth: "400px"
        },
        fab: {
            margin: theme.spacing.unit,
            alignSelf: "center",
        },
        '@global': {
            '*::-webkit-scrollbar': {
                width: '0px'
            },
            '*::-webkit-scrollbar-track': {
                '-webkit-box-shadow': 'inset 0 0 0px rgba(0,0,0,0)'
            },
            '*::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(185,185,185,0.5)',
                borderRadius: 10,
                outline: '0px solid white',
            }
        },
    } as StyleRules);
}