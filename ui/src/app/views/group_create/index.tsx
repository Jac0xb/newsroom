import * as React from 'react';
import { Grid, Paper, FormGroup, FormLabel, TextField, MenuItem, Button, Typography } from '@material-ui/core';
import axios from 'axios';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './styles'
import { Redirect, Link } from 'react-router-dom';
import { withCookies, Cookies } from 'react-cookie';
import { compose } from 'recompose';

export namespace GroupCreate {
    export interface Props {
        classes: Record<string, string>
        match?: { params: any }
        cookies: Cookies
    }
    export interface State {
        submitted: boolean
        fetchedWorkflows: { name: string, id: number }[]
        fetchedStages: { name: string, id: number }[]
        fetchedUsers: { name: string, id: number }[]
        flash?: string

        name?: string
        permissions: SimplePermission[]
        users:  { name: string, id: number }[]
    }
    export interface SimplePermission {
        id: number
        access: number
        type?: string
    }
}

// Add refresh button to workflows.
class GroupCreate extends React.Component<GroupCreate.Props, GroupCreate.State> {

    constructor(props: GroupCreate.Props, context?: any) {
        super(props, context);
        this.state = { 
            permissions: [], 
            users: [],
            name: "", 
            flash: "", 
            submitted: false, 
            fetchedUsers: [], fetchedStages: [], fetchedWorkflows: [] 
        }
    }

    componentDidMount() {

        axios.get("/api/workflows").then((response) => {

            var fetchedWorkflows = response.data;
            var fetchedStages = []

            for (var i = 0; i < fetchedWorkflows.length; i++) {
                for (var j = 0; j < fetchedWorkflows[i].stages.length; j++) {
                    fetchedStages.push(fetchedWorkflows[i].stages[j]);
                }
            }

            this.setState({ fetchedWorkflows, fetchedStages })

        }).catch((error) => {
            console.log(error)
        });


        axios.get("/api/users").then((response) => {
            
            var fetchedUsers = response.data.map((user:any) => {
                return {id: user.id, name: user.userName}
            });

            this.setState({ fetchedUsers })

        }).catch((error) => {
            console.log(error)
        });
    }

    /**
     * On submit.
     */
    onSubmit() {

        this.setState({ flash: "" })
        
        var users : {id: number}[] = [];
        var wfpermissions: GroupCreate.SimplePermission[] = [];
        var stpermissions: GroupCreate.SimplePermission[] = [];
        
        for (var i = 0; i < this.state.permissions.length; i++) {
            if (this.state.permissions[i].id === -1) {
                this.setState({ flash: "No type/item was designated for one of your permissions." });
                return;
            }
        }

        if (this.state.permissions.length === 0) {
            this.setState({ flash: "You have not given this group any permissions." });
            return;
        }

        if (this.state.name === "") {
            this.setState({ flash: "No group name was given." });
            return;
        }

        this.state.permissions.map((permission) => {
            
            if (permission.type === "Stages") {
                stpermissions.push({id: permission.id, access: permission.access})
            }
            else {
                wfpermissions.push({id: permission.id, access: permission.access}) 
            }
        })

        users = this.state.users.map((users) => {
            return {id: users.id}
        })

        console.log({name: this.state.name, wfpermissions, stpermissions, users})

        axios.post("/api/roles", {name: this.state.name, wfpermissions, stpermissions, users}).then((response: any) => {

            if (response) {
                this.setState({ submitted: true })
            }

        }).catch((error) => {
            this.setState({ flash: error.response.data.message });
        });
    }

    addNewPermission() {
        var newPermissions = [...this.state.permissions]
        newPermissions.push({ id: -1, type: "", access: 0 })
        this.setState({ permissions: newPermissions })
    }

    removePermission() {

        if (this.state.permissions.length <= 0)
            return;

        var newPermissions = [...this.state.permissions]
        newPermissions.pop();
        this.setState({ permissions: newPermissions })
    }

    modifyPermission(index: number, permission: GroupCreate.SimplePermission) {
        var newPermissions = [...this.state.permissions]
        newPermissions[index] = permission;
        this.setState({ permissions: newPermissions })
    }

    renderPermission(index: number, permission: GroupCreate.SimplePermission) {

        var changeType = (c: any) => {
            var newPermission = Object.assign({}, permission);
            newPermission.type = c.target.value;
            newPermission.id = -1;
            this.modifyPermission(index, newPermission)
        }

        var changeID = (c: any) => {
            var newPermission = Object.assign({}, permission);
            newPermission.id = parseInt(c.target.value);
            this.modifyPermission(index, newPermission)
        }

        var changeAccess = (c: any) => {
            var newPermission = Object.assign({}, permission);
            newPermission.access = parseInt(c.target.value);
            this.modifyPermission(index, newPermission)
        }



        var renderItems = (permission.type === "Stages") ? this.state.fetchedStages : this.state.fetchedWorkflows;
        var itemsElement = undefined;

        if (permission.type !== "") {
            itemsElement = (<React.Fragment>
            <TextField
                select
                label={permission.type}
                margin="normal"
                variant="filled"
                value={permission.id}
                onChange={changeID}
                InputLabelProps={{
                    shrink: true,
                }}
            >
                <MenuItem key={-1} disabled value="-1"><em>None</em></MenuItem>
                {renderItems.map(item => (
                    <MenuItem key={item.id} value={item.id}>
                        {item.name}
                    </MenuItem>
                ))}
            </TextField>
            <TextField
                select
                style={{marginTop: "16px"}}
                label="Access Type"
                margin="none"
                variant="filled"
                value={permission.access}
                onChange={changeAccess}
                InputLabelProps={{
                    shrink: true,
                }}
            >
                <MenuItem key={0} value="0">Read</MenuItem>
                <MenuItem key={1} value="1">Write</MenuItem>
            </TextField>
            </React.Fragment>)
        }

        return <React.Fragment >
            <div style={{paddingTop: "16px", borderBottom: "rgba(0, 0, 0, 0.26) solid 1px", marginRight: "64px"}}></div>
            <TextField
                select
                key={index}
                style={{marginTop: "16px"}}
                label="Type"
                margin="none"
                variant="filled"
                value={permission.type}
                onChange={changeType}
                InputLabelProps={{
                    shrink: true,
                }}
            >
                <MenuItem key="Workflows" value="Workflows">Workflows</MenuItem>
                <MenuItem key="Stages" value="Stages">Stages</MenuItem>
            </TextField>
            {itemsElement}
        </React.Fragment>
    }

    addUser(e: any) {

        var newUsers = [...this.state.users]
        var newUser: any = undefined;

        for (var i = 0; i < this.state.users.length; i++) {
            if (this.state.users[i].id === e.target.value)
            {
                return;
            }
        }
        for (var i = 0; i < this.state.fetchedUsers.length; i++) {
            if (this.state.fetchedUsers[i].id === e.target.value)
            {
                newUser = this.state.fetchedUsers[i]
            }
        }

        newUsers.push(newUser)
        this.setState({users: newUsers})
    }

    renderUsers() {

        return (<React.Fragment>
            <TextField
                select
                label="User"
                margin="normal"
                variant="filled"
                value={-1}
                onChange={this.addUser.bind(this)}
                InputLabelProps={{
                    shrink: true,
                }}
            >
            <MenuItem key={-1} disabled value="-1"><em>None</em></MenuItem>
            {this.state.fetchedUsers.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                    {item.name}
                </MenuItem>
            ))}
            </TextField>
            {
                this.state.users.map((users) => {
                    return (
                        <div key={users.id}>
                            {users.name}
                        </div>
                    )
                })
            }
        </React.Fragment>)
    }

    render() {

        if (this.state.submitted) {
            return <Redirect push to="/" />;
        }
        const { classes } = this.props;
        
        return (
            <React.Fragment>
                <div className={classes.buttonGroup}>
                    <Link style={{ textDecoration: "none" }} to="/groups">
                        <Button style={{ width: "calc(4*52px)" }} variant={"contained"}>
                            Back
						</Button>
                    </Link>
                </div>
                <Grid className={classes.outerGrid} alignContent={"center"} container spacing={24} direction="row" justify="center" alignItems="center">
                    <Grid item xs={8} md={6}>
                        <Paper className={classes.formGroup}>
                            {(this.state.flash != "") ?
                                <Paper className={classes.flashMessage}>
                                    <Typography variant="caption">
                                        {this.state.flash}
                                    </Typography>
                                </Paper> :
                                <div></div>
                            }
                            <FormGroup>
                                <FormLabel style={{marginTop:"16px"}}>
                                    Create Group
                                </FormLabel>
                                <TextField
                                    label="Group Name"
                                    placeholder="Sports Editor Group"
                                    style={{marginTop: "16px"}}
                                    margin="none"
                                    variant="filled"
                                    value={this.state.name}
                                    onChange={(c) => this.setState({ name: c.target.value })}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <FormLabel style={{marginTop:"16px"}}>
                                    Permissions
                                </FormLabel>
                                {this.state.permissions.map((permission, index: number) => {
                                    return this.renderPermission(index, permission)
                                })}
                                <div style={{display: "flex", justifyContent:"space-evenly"}}>
                                    <Button style={{marginTop: "16px", width: "calc(4*52px)" }} variant={"contained"} onClick={this.addNewPermission.bind(this)}>
                                        New Permission
                                    </Button>
                                    <Button style={{marginTop: "16px", width: "calc(4*52px)" }} variant={"contained"} onClick={this.removePermission.bind(this)}>
                                        Remove Permission
                                    </Button>
                                </div>
                                <FormLabel style={{marginTop:"16px"}}>
                                    Users
                                </FormLabel>
                                {this.renderUsers()}
                            </FormGroup>
                            <Button variant="contained" onClick={this.onSubmit.bind(this)} style={{marginTop: "16px"}} className={classes.button}>Create</Button>
                        </Paper>
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}

export default compose<GroupCreate.Props, {}>(
    withStyles(styles, { withTheme: true }),
    withCookies
)(GroupCreate);