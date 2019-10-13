import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return ({
		documentGrid: {
			display: "flex",
			flexWrap: "wrap",
			"& > *" : {
				margin: "16px"
            },
            justifyContent: "center"
		},
		buttonGroup: {
			display: "flex",
			padding: "24px",
			"& button": {
				heightMax: "36px",
				height: "36px",
				marginRight: "16px"
			},
			flexWrap: 'wrap'
		},
		textField: {
			marginRight: theme.spacing(),
			marginTop: 0,
			marginBottom: 0
			
		}
    } as StyleRules);
}