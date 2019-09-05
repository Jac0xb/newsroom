import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
		documentItem: {
			minWidth: "200px",
			padding: "16px",
			"& h2": {
				
			},
			"& hr": {
				marginBottom: "16px"
			},
			"& a": {
				color: "#263238",
				fontStyle: "italic",
				textDecoration: "none",
			},
		},
		noWrap: {
			overflow: "hidden",
			textOverflow: "ellipsis",
			whiteSpace: "nowrap"
		},
		detailLine: {
			display: "flex",
			alignItems: "center",
			width: "100%"
		},
		flexGrow: {
			flexGrow: 1
		},
		linkIcon: {
			width: "20px",
			height: "20px",
			marginLeft: "5px"
		},
		buttonGroup: {
			marginTop: "8px",
            display: "flex",
			justifyContent: "flex-end"
        }
    } as StyleRules);
}