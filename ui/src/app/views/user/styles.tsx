import { StyleRules, Theme } from '@material-ui/core/styles';
import { display } from '@material-ui/system';

export function styles(theme: Theme) {
    return ({
        grid: {
            marginTop: "16px"
        },
        formLabel: {
            marginTop: "16px"
        },
        formSelect: {
            marginTop: "8px"
        },
        formGroup: {
            padding: "16px",
            display: "grid"
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
    } as StyleRules);
}