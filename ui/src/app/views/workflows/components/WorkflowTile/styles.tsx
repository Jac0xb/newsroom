import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return (
        {
            button: {
                margin: theme.spacing(1),
                marginTop: theme.spacing(1),
            },

            documentItem: {
                display: "flex",
                maxWidth: "300px",
                minWidth: "300px",
                padding: "16px",
                margin: "16px",
                flexDirection: "column",
                alignContent: "space-between",
                alignSelf: "center",
                "& h2": {

                },
                "& hr": {
                    marginBottom: "8px"
                },
                "& a": {
                    color: "#263238",
                    fontStyle: "italic",
                    textDecoration: "none",
                }
            },
            noWrap: {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
            },
            buttonGroup: {
                paddingTop: theme.spacing(2),
                display: "flex",
                flexDirection: "row-reverse"
            }
        } as StyleRules);
}