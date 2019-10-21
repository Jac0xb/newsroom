import { fade } from '@material-ui/core/styles/colorManipulator';
import { StyleRules, Theme } from '@material-ui/core/styles';

export function styles(theme: Theme)  {
        return ({
        root: {
        	width: '100%',
        },
        header: {
			position: "fixed",
            maxHeight: "64px", 
            minHeight: "64px",
            boxShadow: 'none'
        },
        grow: {
        	flexGrow: 1,
        },
        menuButton: {
			color: 'white',
			marginLeft: -12,
			marginRight: 20,
        },
        title: {
			display: 'block',
			color: '#263238',
			[theme.breakpoints.up('sm')]: {
				display: 'block',
			},
        },
        categoriesTitle: {
            textAlign: 'center',
            paddingTop: '19px'
        },
        search: {
			position: 'relative',
			borderRadius: theme.shape.borderRadius,
			backgroundColor: fade(theme.palette.common.white, 0.15),
			'&:hover': {
				backgroundColor: fade(theme.palette.common.white, 0.25),
			},
			marginRight: theme.spacing(2),
			marginLeft: 0,
			width: '100%',
			[theme.breakpoints.up('sm')]: {
				marginLeft: theme.spacing(3),
				width: 'auto',
			},
        },
        searchIcon: {
			width: theme.spacing(9),
			height: '100%',
			position: 'absolute',
			pointerEvents: 'none',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			},
			inputRoot: {
			color: 'inherit',
			width: '100%',
        },
        inputInput: {
			paddingTop: theme.spacing(),
			paddingRight: theme.spacing(),
			paddingBottom: theme.spacing(),
			paddingLeft: theme.spacing(10),
			transition: theme.transitions.create('width'),
			width: '100%',
			[theme.breakpoints.up('md')]: {
				width: 200,
			},
        },
        sectionDesktop: {
			display: 'none',
			[theme.breakpoints.up('md')]: {
				display: 'flex',
			},
        },
        sectionMobile: {
			display: 'flex',
			[theme.breakpoints.up('md')]: {
				display: 'none',
			},
		},
		itemLinks: {
			textDecoration: 'none',
		}
    } as StyleRules);
}