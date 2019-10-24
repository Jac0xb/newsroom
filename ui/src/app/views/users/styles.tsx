import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return ({
        switchBase: {
            color: "red",
            '&$checked': {
                color: "red",
            },
            '&$checked + $track': {
                backgroundColor: "red",
            },
        },
    } as StyleRules);
}