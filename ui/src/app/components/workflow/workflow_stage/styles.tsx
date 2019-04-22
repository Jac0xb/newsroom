import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
       stage: {
            padding: theme.spacing.unit * 2,
        },
        buttonGroup: {
            paddingTop: theme.spacing.unit * 2,
        },
        button: {

        },
        documentGrid: {
            display: "block",
            paddingTop: "12px"
        }

    } as StyleRules);
}