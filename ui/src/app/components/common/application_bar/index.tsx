import * as React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { withStyles} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import MoreIcon from '@material-ui/icons/MoreVert';
import UserIcon from '@material-ui/icons/VerifiedUser';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import {Link} from 'react-router-dom';
import {styles} from "./styles";
import { Cookies, withCookies } from 'react-cookie';
import { compose } from 'recompose';

export namespace PrimarySearchAppBar {
    export interface Props {
		classes: Record<string, string>
		cookies: Cookies
	}
	export interface State {
		anchorEl?: any
		mobileMoreAnchorEl?: any
		sideMenuOpen: boolean
	}
}
class PrimarySearchAppBar extends React.Component<PrimarySearchAppBar.Props, PrimarySearchAppBar.State> {

  state = {
    anchorEl: null,
    mobileMoreAnchorEl: null,
    sideMenuOpen: false,
  };

  handleProfileMenuOpen = (event: React.MouseEvent) => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
    this.handleMobileMenuClose();
  };

  handleMobileMenuOpen = (event: React.MouseEvent) => {
    this.setState({ mobileMoreAnchorEl: event.currentTarget });
  };

  handleMobileMenuClose = () => {
    this.setState({ mobileMoreAnchorEl: null });
  };

  toggleDrawer = (open: boolean) => () =>{
    this.setState({
      sideMenuOpen: open,
    });
  };

  constructor(props: PrimarySearchAppBar.Props) {
      super(props)
  }

  render() {
    const { anchorEl, mobileMoreAnchorEl, sideMenuOpen } = this.state;
    const { classes, cookies } = this.props;
    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const renderMenu = (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={this.handleMenuClose}>My account</MenuItem>
      </Menu>
    );

    const renderMobileMenu = (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMobileMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.handleProfileMenuOpen}>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
          <p>Profile</p>
        </MenuItem>
      </Menu>
    );

    const sideMenuList = (
      	<div className={classes.list}>
			<List>
				{[{title:'Document', url:"/"}, {title:'Workflow', url:"/workflow"}].map((text, index) => (
					<Link key={index} to={text.url} className={classes.itemLinks}>
						<ListItem button>
								<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
								<ListItemText primary={text.title} />
						</ListItem>
					</Link>
				))}
				<ListItem onClick={() => {cookies.set('username', prompt("What is your new user's name?"))}} button>
					<ListItemIcon><UserIcon/></ListItemIcon>
					<ListItemText primary="Change User" />
				</ListItem>
			</List>
			<Divider />
      	</div>
    );

    return (
      <div className={classes.root}>
        <AppBar style={{backgroundColor: "#cfd8dc", boxShadow: 'none' }} position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Open drawer" onClick={this.toggleDrawer(true)}  >
              <MenuIcon/>
            </IconButton>
            <Drawer open={sideMenuOpen} onClose={this.toggleDrawer(false)}>
              <div
                tabIndex={0}
                role="button"
                onClick={this.toggleDrawer(false)}
                onKeyDown={this.toggleDrawer(false)}
              >
                {sideMenuList}
              </div>
          </Drawer>
		  	<Link style={{textDecoration: "none"}} to="/">
				<Typography style={{textDecoration: "none"}} className={classes.title} variant="title" color="inherit" noWrap>
				  Newsroom
				</Typography>
			</Link>
            <div className={classes.grow} />
            <div className={classes.sectionDesktop}>
            </div>
            <div className={classes.sectionMobile}>
              <IconButton aria-haspopup="true" onClick={this.handleMobileMenuOpen} color="inherit">
                <MoreIcon />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>
        {renderMenu}
        {renderMobileMenu}
      </div>
    );
  }
}

// https://stackoverflow.com/questions/51605112/react-recompose-causing-typescript-error-on-props
export default compose<PrimarySearchAppBar.Props, {}>(
	withStyles(styles),
	withCookies
)(PrimarySearchAppBar);