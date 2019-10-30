import * as React from 'react';
import { Divider, Grid, Paper, FormGroup, FormLabel, TextField, MenuItem, Button, Typography } from '@material-ui/core';
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
        availableWorkflows: { name: string, id: number }[]
        availableStages: { name: string, id: number }[]
        flash?: string
        name?: string
        group?: any
        permissions: SimplePermission[]
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
            name: "", 
            submitted: false, 
            availableStages: [], 
            availableWorkflows: [], 
            flash: "",
            group: {name: ""}
        }
    }

    componentDidMount() {
        
        var { match } = this.props;

        if (match) {
            axios.get(`/api/roles/${match.params.id}`).then((response) => {
                console.log(response.data)
                this.setState({group: response.data})
            })
        }

        axios.get("/api/workflows").then((response) => {

            var availableWorkflows = response.data;
            var availableStages = []

            for (var i = 0; i < availableWorkflows.length; i++) {
                for (var j = 0; j < availableWorkflows[i].stages.length; j++) {
                    availableStages.push(availableWorkflows[i].stages[j]);
                }
            }

            this.setState({ availableWorkflows, availableStages })

        }).catch((error) => {
            console.log(error)
        });
    }

    onSubmit() {

        this.setState({ flash: "" })

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

        // get role id from url, not ideal, not a fan
        var getUrl = (window.location.href).split('/')
        var roleID = getUrl[getUrl.length-1]

        // quick fix, real bad, not a fan
        var url = "/api/roles/" + roleID + "/";
        var access = 0;

        this.state.permissions.map((permission) => {

            access = permission.access

            if (permission.type === "Stages") {
                // /api/roles/rid/stage/sid
                url += "stage/"+ permission.id
                // stpermissions.push({ id: permission.id, access: permission.access })
            }
            else {
                // /api/roles/rid/workflow/wid
                url += "workflow/"+ permission.id
                // wfpermissions.push({ id: permission.id, access: permission.access })
            }
        })

        console.log({ name: this.state.name, wfpermissions, stpermissions })

        axios.put(url, { access }).then((response: any) => {

            if (response) {
                console.log(response)
                this.setState({ submitted: true })
            }

        }).catch((error) => {
            this.setState({ flash: error.response.data.message || "Something has gone terribly wrong. We don't even know." });
        });
    }

    addNewPermission() {
        var newPermissions = [...this.state.permissions]
        newPermissions.push({ id: -1, type: "", access: 0 })
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



        var renderItems = (permission.type === "Stages") ? this.state.availableStages : this.state.availableWorkflows;
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
                        <MenuItem key={item.name} value={item.id}>
                            {item.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Access Type"
                    margin="normal"
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

        return <React.Fragment key={index}>
            <FormLabel style={{ marginTop: "16px" }}>New Permission</FormLabel>
            <TextField
                select
                key={index}
                label="Type"
                margin="normal"
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
                <Grid className={classes.outerGrid} alignContent={"center"} container spacing={4} direction="row" justify="center" alignItems="center">
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
                            <Typography variant="h3">
                                {this.state.group.name}
                            </Typography>
                            <Divider style={{margin: "16px"}}/>
                            <FormGroup style={{marginTop: "16px"}}>
                                <FormLabel>Add Permission</FormLabel>
                                <Button style={{}} variant={"contained"} onClick={this.addNewPermission.bind(this)}>
                                    Add New Permission
                                </Button>
                                {this.state.permissions.map((permission, index: number) => {
                                    return this.renderPermission(index, permission)
                                })}
                            </FormGroup>
                            <Button style={{marginTop: "16px"}} variant="contained" onClick={this.onSubmit.bind(this)} className={classes.button}>Create</Button>

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