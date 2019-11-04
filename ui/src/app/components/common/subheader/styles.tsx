import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return ({
        appBar: {
            zIndex: 1000,
            position: "fixed",
            top:"64px",
            maxHeight: 48,
            minHeight: 48,
            display: "flex"
        }
    } as StyleRules);
}