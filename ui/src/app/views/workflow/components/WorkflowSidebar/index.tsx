import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Drawer, List, ListItem, Divider, ListItemText, ListItemIcon, TextField } from '@material-ui/core';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';


export namespace WorkflowMenuBar {
    export interface Props {
        classes?: any
        textName: string
        textDesc: string 
        onTextChange: Function
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
                anchor="right"
                className={classes.drawer}
                variant="permanent"
                classes={{
                paper: classes.drawerPaper,
                }}
            >
                <TextField
                    id="name"
                    label="Name"
                    className={classes.textField}
                    value={this.props.textName}
                    onChange={(event) => this.props.onTextChange('name', event.target.value)}
                    margin="normal"
                />
                <TextField
                    id="desc"
                    label="Description"
                    className={classes.textField}
                    value={this.props.textDesc}
                    onChange={(event) => this.props.onTextChange('description', event.target.value)}
                    margin="normal"
                    variant="standard"
                />
                {/* <Divider /> */}
                <List>
                {['Triggers', 'Due Date'].map((text, index) => (
                    <ListItem button key={text}>
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