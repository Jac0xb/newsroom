import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
        main: {
            padding: "32px"
        },
		outerGrid: {
			padding: "24px"
		},
		formGroup: {
            padding: "32px"
		},
		flashMessage: {
			textAlign: "center",
			padding: "8px",
			backgroundColor: "#1890ff",
            color: 'white',
            marginBottom: "16px",
			"& span": {
				fontSize: "16px",
				lineHeight: "16px",
			}
		},
		buttonGroup: {
			display: "flex",
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