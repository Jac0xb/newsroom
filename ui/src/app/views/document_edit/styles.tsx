import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
  return (
    {
      documentTitlePaper: {
        //marginTop: "calc(64px + 16px)",
        marginBottom: theme.spacing(),
        padding: theme.spacing()
      },
      documentTitleTextField: {
        margin: 0
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