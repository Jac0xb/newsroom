import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
        main: {
            paddingTop: "32px",
        },
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
			margin: "0px 24px 24px 24px",
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
			marginBottom: 0
			
		}
    } as StyleRules);
}