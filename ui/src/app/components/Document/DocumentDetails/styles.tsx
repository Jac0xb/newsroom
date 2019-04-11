import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return (
          {layout: {
            width: 'auto',
            marginLeft: theme.spacing.unit * 1,
            marginRight: theme.spacing.unit * 1,
            [theme.breakpoints.up(800 + theme.spacing.unit * 2 * 2)]: {
              width: 800,
              marginLeft: 'auto',
              marginRight: 'auto',
            },
          },
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
          heading: {
            marginBottom: theme.spacing.unit,
          },
          sectionItem: {
            marginBottom: theme.spacing.unit * 2,
            marginTop: theme.spacing.unit * 2
          },
          buttonGroup: {
            display: "flex",
            justifyContent: "flex-end",
          },
          button: {
            marginTop: theme.spacing.unit * 2,
            '&:not(:last-child)': {
              marginRight: 20
            }
          },


    } as StyleRules);
}