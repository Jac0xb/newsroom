import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
		outerGrid: {
			padding: "16px",
			display: "flex",
			flexWrap: "wrap",
			"& > *" : {
				margin: "8px"
			}
		},
		buttonGroup: {
			display: "flex",
			margin: "24px 24px 0px 24px",
			"& button": {
				heightMax: "36px",
				height: "36px",
				marginRight: "16px"
			},
			flexWrap: 'wrap'
		},
		textField: {
			marginRight: theme.spacing.unit,
			marginTop: 0,
			mrginBottom: 0,
			width: 300
		}
    } as StyleRules);
}