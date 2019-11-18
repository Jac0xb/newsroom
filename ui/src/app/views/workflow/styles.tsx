import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return ({
        main: {
            marginTop: "16px"
        },
        menuGroup: {
            position: 'fixed',
            left: 0,
            right: 0,
            zIndex: 1,
        },
        workflowContent: {
            padding: theme.spacing(2),
            overflowX: "auto",
        },
        spacer: {
            height: 48,
        },
        stage: {
            width: "100%",
        },
        stageGrid: {
            margin: theme.spacing(),
            minWidth: "200px",
            maxWidth: "400px"
        },
        buttonGroup: {
            padding: 16,
        },
        flashMessage: {
            padding: "16px",
            margin: "16px"
        }
    } as StyleRules);
}