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
		detailLine: {
			display: "flex",
			alignItems: "center"
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
		},
		detailTable: {
			width: "100%"
		}
    } as StyleRules);
}