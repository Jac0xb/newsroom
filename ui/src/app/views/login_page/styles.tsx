import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return ({
        paper: {
            marginTop: theme.spacing.unit * 3
        }
    } as StyleRules);
}