import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
		outerGrid: {
			padding: "32px"
		},
		formGroup: {
			padding: "16px"
		},
		flashMessage: {
			margin: "8px 0 16px 0",
			textAlign: "center",
			padding: "8px",
			backgroundColor: "#dcd3cf",
			color: 'white',
			"& span": {
				fontSize: "16px",
				lineHeight: "16px",
			}
		},
		buttonGroup: {
			display: "flex",
			margin: "24px 24px 24px 24px",
			"& button": {
				heightMax: "36px",
				height: "36px",
				marginRight: "16px"
			},
			flexWrap: 'wrap'
		}
    } as StyleRules);
}

// https://www.colorhexa.com/cfd8dc Color pallete