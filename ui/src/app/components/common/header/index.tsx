import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles, StyledProps, StyledComponentProps } from '@material-ui/core/styles';
import MailIcon from '@material-ui/icons/Mail';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { styles } from "./styles";
import { Button, Grid } from "@material-ui/core";
import { compose } from 'recompose';
var image = require("./logo.png");


export namespace Header {
    export interface Category {
        title: string,
        url: string
    }

    
    export interface Props {
        loggedIn?: boolean
    }

    export interface ComposedProps extends Header.Props, StyledComponentProps, RouteComponentProps {

    }

    export interface State {
        categories: Category[];
        route: string;
    }

    export class Component extends React.Component<Header.ComposedProps, Header.State> {

        constructor(props: Header.ComposedProps) {
            super(props)
    
            this.state = {
                route: "/",
                categories: [
                    {title: 'Document', url: "/"},
                    {title: 'Workflow', url: "/workflow"},
                    {title: 'Users', url: '/users'},
                    {title: 'Groups', url: '/groups'}
                ]
            }
        }
    
        componentDidMount() {
            var route = window.location.pathname;
            this.setState({route});
        }
    
        /**
         * TODO: Document
         */
        createCategories() {
    
            const {classes} = this.props;

            if (!classes)
                return;

            return <div className={classes.list}>
                <List>
                    {
                        this.state.categories.map((category, index) => (
                            <Link key={index} to={category.url} className={classes.itemLinks}>
                                <ListItem button>
                                    <ListItemIcon><MailIcon/></ListItemIcon>
                                    <ListItemText primary={category.title}/>
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
        }
    
        logout() {
            window.location.href = "/auth/logout";
        }
    
        /**
         * TODO: Document
         */
        render() {
    
            const {classes, loggedIn} = this.props;
            
            if (!classes)
                return;

            return (
                <AppBar className={classes.header}>
                    <div style={{display: "flex", margin: "auto 0px", "alignItems": "center"}}>
                        <Link style={{textDecoration: "none", marginRight: "16px", padding: "0px 16px", display: "flex"}} to="/">
                            <img src={String(image)} style={{height: "32px"}}  />
                        </Link>
                        <div style={{flexGrow: 1, display: "flex"}}>
                            {
                                this.state.categories.map((category) => {
                                    
                                    var highlight: "normal" | "lighter" | undefined = "lighter";
                                    if(category.url == this.props.location.pathname) {
                                        highlight = "normal";
                                    }
    
                                    return <Link to={category.url} onClick={() => {this.setState({route: category.url})}}>
                                        <Typography style={{fontWeight: highlight, color: "white", marginTop: "4px", marginRight: "16px", lineHeight: "1"}}>
                                            {category.title}
                                        </Typography>
                                    </Link>;
                                })
                            }
                        </div>
                        <div style={{padding: "0px 16px", marginTop: "4px"}}>
                            { (loggedIn) ?  (
                            <Button style={{color: "white"}} onClick={() => this.logout()}>
                                Sign Out
                            </Button>
                            ) : []}
                        </div>
                    </div>
                </AppBar>
            );
        }
    }

}

export default compose<Header.ComposedProps, Header.Props>(
    withRouter,
    withStyles(styles, {withTheme: true})
)(Header.Component);