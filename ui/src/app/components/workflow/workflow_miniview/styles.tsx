import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
  return ({
    stepper: {
      padding: 0,
    },
    details: {
    },
    actions: {
      width: "100%",
      display: "flex",
      justifyContent: "space-around"
    }
  } as StyleRules);
}