import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return ({
        main : {
            display: "flex",
            justifyContent: "center",
            paddingTop: "64px",
        },
        paper: {
            padding: "128px 128px"
        },
        title: {
            textAlign: "center"
        },        
        subtitle: {
            marginBottom: "16px",
            textAlign: "center"
        },
        googleImage: {
            marginRight: "10px"
        }
    } as StyleRules);
}