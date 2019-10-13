import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
  return (
    {
      main: {
        width: 'auto',
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
        [theme.breakpoints.up(800 + theme.spacing(4))]: {
          marginLeft: '10px',
          marginRight: '10px'
        },
        paddingTop: "16px",
      },
      documentTitlePaper: {
        marginTop: theme.spacing(),
        marginBottom: theme.spacing(),
        padding: theme.spacing(),
        [theme.breakpoints.up(800 + theme.spacing(5))]: {
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
          padding: theme.spacing(2),
        }
      },
      documentTitleTextField: {
        margin: 0
      },
      paper: {
        marginTop: theme.spacing(),
        marginBottom: theme.spacing(),
        padding: theme.spacing(),
        [theme.breakpoints.up(800 + theme.spacing(5))]: {
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
          padding: theme.spacing(2),
        },
      },
      heading: {
        marginBottom: theme.spacing(),
      },
      sectionItem: {
        marginBottom: theme.spacing(2),
        marginTop: theme.spacing(2)
      },
      button: {
        marginTop: theme.spacing(2),
        '&:not(:last-child)': {
        }
      },
      editor: {
        padding: theme.spacing(4)
      }


    } as StyleRules);
}