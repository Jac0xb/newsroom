import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return (
        {
            layout: {
                marginTop: theme.spacing.unit * 3,
                marginBottom: theme.spacing.unit * 3,
                padding: theme.spacing.unit * 2,
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
            extendedIcon: {
                marginRight: theme.spacing.unit,
            },


    } as StyleRules);
}