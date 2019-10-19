import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return ({
        main : {
            display: "flex",
            justifyContent: "center",
            paddingTop: "64px",
        },
        paper: {
            padding: "128px 128px",
            textAlign: "center"
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
        },
        button: {
            '&:hover': {
                backgroundColor: "#5DB1FF"
            },
            backgroundColor: "#1890ff",
            color: "white"
        }
    } as StyleRules);
}