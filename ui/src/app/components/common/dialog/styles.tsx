import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
        dialog: {
            width: 'auto'
        },
        textField: {
            margin: theme.spacing(),
            marginLeft: theme.spacing(),
            marginRight: theme.spacing(),
            width: 200,
        },
        button: {
            margin: theme.spacing(),
            color: "primary" ,
        },

    } as StyleRules);
}