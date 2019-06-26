import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Drawer, List, ListItem, Divider, ListItemText, ListItemIcon } from '@material-ui/core';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';


export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any 
    }
    export interface State {

    }
}
class WorkflowMenuBar extends React.Component<WorkflowMenuBar.Props, WorkflowMenuBar.State, any> {

    constructor(props: WorkflowMenuBar.Props) {
        super(props)
        this.state = {
            
        }
    }
    render() {

        const { classes } = this.props;
        const {  } = this.state;

        return (
        <main className={classes.layout}>
             <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                paper: classes.drawerPaper,
                }}
            >
                <List>
                {['Tool 1', 'Tool 2'].map((text, index) => (
                    <ListItem button key={text}>
                    <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
                    <ListItemText primary={text} />
                    </ListItem>
                ))}
                </List>
                <Divider />
                <List>
                {['Help'].map((text, index) => (
                    <ListItem button key={text}>
                    {/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
                    <ListItemText primary={text} />
                    </ListItem>
                ))}
                </List>
            </Drawer>
        </main>
        );
    }
    }

export default withStyles(styles, {withTheme: true})(WorkflowMenuBar);