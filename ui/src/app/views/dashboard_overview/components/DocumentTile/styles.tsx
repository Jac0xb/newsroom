import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {	
		flexAutosize: {
			flex: "flex: 1 1 0"
		},
		documentItem: {
            padding: "16px",
            alignItems: "center",
            flex: "1 1 auto",
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