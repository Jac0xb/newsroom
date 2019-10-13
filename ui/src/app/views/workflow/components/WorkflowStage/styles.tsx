import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
    return (
    {
        layout: {
            display: "flex",
        },
        stage: {
            padding: theme.spacing(2),
            minWidth: "380px",
            background: "#f8efd6",
            boxShadow: 'none',
        },
        headingDiv: {
            display: 'inline-flex',
            width: '100%',
            alignItems: 'center',

        },
        heading: {
            width: 'inherit',
        },
        // buttonGroup: {
        //     paddingTop: theme.spacing.unit * 2,
        //     display: "flex",
        //     flexDirection: "row-reverse"
        // },
        // button: {
        //     margin: theme.spacing.unit,
        // },
        documentGrid: {
            display: "block",
            paddingTop: "12px",
            "& > *": {
                marginBottom: "16px"
            }
        }

    } as StyleRules);
}