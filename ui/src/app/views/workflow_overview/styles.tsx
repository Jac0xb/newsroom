import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return (
        {
            button: {
                margin: theme.spacing.unit,
                color: "primary" ,
            },
            buttonGroup: {
                padding: theme.spacing.unit * 2,
            },
            dialog: {
                width: 'auto'
            },
            textField: {
                margin: theme.spacing.unit,
                marginLeft: theme.spacing.unit,
                marginRight: theme.spacing.unit,
                width: 200,
            },
            container:
            {
                margin: theme.spacing.unit,
                marginLeft: theme.spacing.unit,
                marginRight: theme.spacing.unit,
			},		
			outerGrid: {
				padding: "16px",
                display: "flex",
                justifyContent: "center",
				flexWrap: "wrap",
				"& > *" : {
					margin: "16px"
				}
			}

    } as StyleRules);
}
