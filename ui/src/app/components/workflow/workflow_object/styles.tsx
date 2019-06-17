import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return (
        {
          button: {
            margin: theme.spacing.unit,
            marginTop: theme.spacing.unit,
          },
          documentItem: {
          width: "300px",
          padding: "16px",
          flex: "1 1 26%",
          minWidth: "200px",
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
          paddingTop: theme.spacing.unit * 2,
          display: "flex",
          flexDirection: "row-reverse"
            }
    } as StyleRules);
}