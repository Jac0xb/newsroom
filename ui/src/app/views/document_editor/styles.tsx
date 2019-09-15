import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
  return (
    {
      main: {
        width: 'auto',
        marginLeft: theme.spacing.unit * 1,
        marginRight: theme.spacing.unit * 1,
        [theme.breakpoints.up(800 + theme.spacing.unit * 2 * 2)]: {
          marginLeft: '10px',
          marginRight: '10px'
        },
        paddingTop: "64px",
      },
      documentTitlePaper: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
        padding: theme.spacing.unit,
        [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
          marginTop: theme.spacing.unit * 2,
          marginBottom: theme.spacing.unit * 2,
          padding: theme.spacing.unit * 2,
        }
      },
      documentTitleTextField: {
        margin: 0
      },
      paper: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
        padding: theme.spacing.unit,
        [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
          marginTop: theme.spacing.unit * 2,
          marginBottom: theme.spacing.unit * 2,
          padding: theme.spacing.unit * 2,
        },
      },
      heading: {
        marginBottom: theme.spacing.unit,
      },
      sectionItem: {
        marginBottom: theme.spacing.unit * 2,
        marginTop: theme.spacing.unit * 2
      },
      button: {
        marginTop: theme.spacing.unit * 2,
        '&:not(:last-child)': {
        }
      },
      editor: {
        padding: theme.spacing.unit * 4
      }


    } as StyleRules);
}