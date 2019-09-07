import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return ({
        loginBox: {
            margin: '128px'
        },
        grid: {
            marginTop: '20px',
          },
          paper: {
            ...theme.mixins.gutters(),
            paddingTop: theme.spacing.unit * 2,
            paddingBottom: theme.spacing.unit * 2,
          },
          button: {
            maxHeight: '40px',
            margin: theme.spacing.unit,
            textTransform: "none",
          },
          textField: {
            marginLeft: 8,
            marginRight: 8,
          },
          register:{ 
            marginTop: 2,
          }
    } as StyleRules);
}