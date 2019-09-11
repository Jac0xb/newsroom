import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import DocumentIcon from '@material-ui/icons/DeveloperBoard';
import GroupIcon from  '@material-ui/icons/Group';
import WorkflowIcon from '@material-ui/icons/ThreeSixty';
import UserIcon from '@material-ui/icons/Face'
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Link } from 'react-router-dom';
import { styles } from "./styles";
import { compose } from 'recompose';

export namespace Header {
    export interface Category {
        title: string,
        url: string,
        icon: JSX.Element
    }
    export interface Props {
        classes: Record<string, string>
    }
    export interface State {
        sideMenuOpen: boolean
        categories: Category[]
    }
}

class Header extends React.Component<Header.Props, Header.State> {

    constructor(props: Header.Props) {
        super(props)

        this.state = {
            sideMenuOpen: false,
            categories: [   // Icon Page: https://material.io/resources/icons/?style=baseline
                { icon: (<DocumentIcon/>), title: 'Documents', url: "/" },
                { icon: (<WorkflowIcon/>), title: 'Workflows', url: "/workflow" },
                { icon: (<UserIcon/>), title: 'Users', url: '/users'},
                { icon: (<GroupIcon/>), title: 'Groups', url: '/groups'}
            ]
        }
    }

    /**
     * TODO: Document
     */
    createCategories() {

        const { classes } = this.props;

        return <div className={classes.list}>
            <List>
                {
                    this.state.categories.map((category, index) => (
                        <Link key={index} to={category.url} className={classes.itemLinks}>
                            <ListItem button>
                                <ListItemIcon>{category.icon}</ListItemIcon>
                                <ListItemText primary={category.title} />
                            </ListItem>
                        </Link>
                    ))
                }
            </List>
        </div>
    }

    /**
     * TODO: Document
     */
    toggleDrawer(open: boolean) {
        this.setState({ sideMenuOpen: open });
    }

    /**
     * TODO: Document
     */
    render() {
        
        const { sideMenuOpen } = this.state;
        const { classes } = this.props;

        return (
            <header className={classes.root}>
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton className={classes.menuButton} color="inherit" aria-label="Open Drawer" onClick={() => this.toggleDrawer(true)}  >
                            <MenuIcon />
                        </IconButton>
                        <Drawer open={sideMenuOpen} onClose={() => this.toggleDrawer(false)}>
                            <div
                                tabIndex={0}
                                role="button"
                                onClick={() => this.toggleDrawer(false)}
                                onKeyDown={() => this.toggleDrawer(false)}
                            >
                                <Typography variant="overline" className={classes.categoriesTitle}>Views</Typography>
                                {this.createCategories()}
                            </div>
                        </Drawer>
                        <Link style={{ textDecoration: "none" }} to="/">
                            <Typography style={{ textDecoration: "none", color: "white" }} className={classes.title} variant="title" color="inherit" noWrap>
                                Newsroom
                            </Typography>
                        </Link>
                    </Toolbar>
                </AppBar>
            </header>
        );
    }
}

export default compose<Header.Props, {}>(
    withStyles(styles)
)(Header);