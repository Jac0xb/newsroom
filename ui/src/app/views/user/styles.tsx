import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme) {
    return ({
        grid: {
            marginTop: "16px"
        },
        formGroup: {
            padding: "16px",
            display: "grid",
            marginTop: "16px",
            minWidth: "400px",
		},
        formLabel: {
            marginBottom: "8px"
        },
        formSelect: {
            marginBottom: "16px"
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
        buttonGroup:{
            alignItems: "flex-end",
        },
        button: {
            width: "30%",
        },
    } as StyleRules);
}