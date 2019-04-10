import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return (
          {layout: {
            width: 'auto',
            marginLeft: theme.spacing.unit * 2,
            marginRight: theme.spacing.unit * 2,
            [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
              width: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
            },
          },
          paper: {
            marginTop: theme.spacing.unit * 3,
            marginBottom: theme.spacing.unit * 3,
            padding: theme.spacing.unit * 2,
            [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
              marginTop: theme.spacing.unit * 6,
              marginBottom: theme.spacing.unit * 6,
              padding: theme.spacing.unit * 3,
            },
    }
    } as StyleRules);
}