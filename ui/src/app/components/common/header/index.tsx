import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import MailIcon from '@material-ui/icons/Mail';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Link } from 'react-router-dom';
import { styles } from "./styles";
import { compose } from 'recompose';

export namespace Header {
    export interface Category {
        title: string,
        url: string
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
            categories: [
                { title: 'Document', url: "/" },
                { title: 'Workflow', url: "/workflow" }
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
                                <ListItemIcon><MailIcon /></ListItemIcon>
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
            <div className={classes.root}>
                <AppBar style={{ backgroundColor: "#90b3c2", boxShadow: 'none' }} position="static">
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
            </div>
        );
    }
}

export default compose<Header.Props, {}>(
    withStyles(styles)
)(Header);