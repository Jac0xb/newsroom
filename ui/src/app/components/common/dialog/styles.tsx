import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
        dialog: {
            width: 'auto'
        },
        textField: {
            margin: theme.spacing.unit,
            marginLeft: theme.spacing.unit,
            marginRight: theme.spacing.unit,
            width: 200,
        },
        button: {
            margin: theme.spacing.unit,
            color: "primary" ,
        },

    } as StyleRules);
}