import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
        main: {
            paddingTop: "32px"
        },
		outerGrid: {
			padding: "24px"
		},
		formPaper: {
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
			margin: "0px 24px 24px 24px",
			"& button": {
				heightMax: "36px",
				height: "36px",
				marginRight: "16px"
			},
			flexWrap: 'wrap'
        },
        formGroup: {
            marginBottom: "16px"
        },
        formButtonGroup: {
            display: "flex",
            flexDirection: "row-reverse"
        }
    } as StyleRules);
}

// https://www.colorhexa.com/cfd8dc Color pallete