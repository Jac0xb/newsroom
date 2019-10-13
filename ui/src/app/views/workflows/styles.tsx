import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return (
        {
            button: {
                margin: theme.spacing(),
                color: "primary" ,
            },
            buttonGroup: {
                padding: theme.spacing(2),
            },
            dialog: {
                width: 'auto'
            },
            textField: {
                margin: theme.spacing(1),
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
                width: 200,
            },
            container:
            {
                margin: theme.spacing(1),
                marginLeft: theme.spacing(1),
                marginRight: theme.spacing(1),
			},		
			outerGrid: {
				padding: "16px",
                display: "flex",
                justifyContent: "center",
				flexWrap: "wrap",
				"& > *" : {
					margin: "16px"
				}
            },
            flashMessage: {
                padding: "16px",
                margin: "16px"
            }

    } as StyleRules);
}
