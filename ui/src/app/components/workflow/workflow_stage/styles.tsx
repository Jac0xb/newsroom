import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
       stage: {
            padding: theme.spacing.unit * 2,
            minWidth: "380px",
        },
        buttonGroup: {
			paddingTop: theme.spacing.unit * 2,
			display: "flex",
			flexDirection: "row-reverse"
        },
        button: {
            margin: theme.spacing.unit,
        },
        documentGrid: {
            display: "block",
			paddingTop: "12px",
			"& > *": {
				marginBottom: "16px"
			}
        }

    } as StyleRules);
}