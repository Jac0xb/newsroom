import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return (
        {
          paper: {
            marginTop: theme.spacing.unit * 3,
            marginBottom: theme.spacing.unit * 3,
            padding: theme.spacing.unit * 2,
            [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
              marginTop: theme.spacing.unit * 6,
              marginBottom: theme.spacing.unit * 6,
              padding: theme.spacing.unit * 3,
            },
          },


    } as StyleRules);
}