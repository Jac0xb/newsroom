import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
		documentItem: {
			minHeight: "200px",
			minWidth: "200px",
			padding: "16px",
			"& h2": {
				
			},
			"& hr": {
				marginBottom: "16px"
			}
		},
		outerGrid: {
			padding: "24px"
		}

    } as StyleRules);
}