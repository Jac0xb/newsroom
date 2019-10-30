import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return ({
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
        topDivider: {
            margin: "0px 24px"
        },
		textField: {
			marginRight: theme.spacing(),
			marginTop: 0,
			marginBottom: 0
			
		}
    } as StyleRules);
}