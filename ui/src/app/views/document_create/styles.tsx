import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
		outerGrid: {
			padding: "24px"
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
		}
    } as StyleRules);
}

// https://www.colorhexa.com/cfd8dc Color pallete