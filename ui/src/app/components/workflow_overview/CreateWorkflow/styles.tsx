import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return (
        {
            layout: {
                width: 'auto',
                marginLeft: theme.spacing.unit * 1,
                marginRight: theme.spacing.unit * 1,
                [theme.breakpoints.up(800 + theme.spacing.unit * 2 * 2)]: {
                  width: 800,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                },
            },
            button: {
                margin: theme.spacing.unit,
                color: "primary" ,
            },
            buttonGroup: {
                padding: theme.spacing.unit * 2,
            },
            dialog: {
                width: 'auto'
            },
            textField: {
                margin: 'normal',
                marginLeft: theme.spacing.unit,
                marginRight: theme.spacing.unit,
                width: 200,
            },



    } as StyleRules);
}