import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
  return ({
    layout: {
      marginTop: theme.spacing.unit,
      marginBottom: theme.spacing.unit
    },
    stepper: {
      padding: 0,
      marginBottom: theme.spacing.unit
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: theme.spacing.unit
    },
  } as StyleRules);
}