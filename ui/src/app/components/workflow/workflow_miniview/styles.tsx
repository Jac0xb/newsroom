import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
  return ({
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
    workflow: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "center",
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit,
      [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2
      }
    },
    chip: {
      padding: 0
    },
    arrow: {
      padding: 0,
      verticalAlign: "center"
    },
    radio: {
      padding: 0,
      cursor: "default"
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: theme.spacing.unit
    },
  } as StyleRules);
}