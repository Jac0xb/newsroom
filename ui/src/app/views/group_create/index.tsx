import * as React from 'react';
import { Grid, Paper, FormGroup, FormLabel, TextField, MenuItem, Button, Typography } from '@material-ui/core';
import axios from 'axios';
import Select from '@material-ui/core/Select';
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
        permissions: { id: number, type: string }[]
    }
}

// Add refresh button to workflows.
class GroupCreate extends React.Component<GroupCreate.Props, GroupCreate.State> {

    constructor(props: GroupCreate.Props, context?: any) {
        super(props, context);
        this.state = { permissions: [], name: "", submitted: false, availableStages: [], availableWorkflows: [], flash: "" }
    }

    componentDidMount() {
        //const id = this.props.match.params.id;

        axios.get("/api/workflows").then((response) => {
            console.log(response.data);

            const workflows = response.data;

            this.setState({ availableWorkflows: workflows })

            var stages = []

            for (var i = 0; i < workflows.length; i++) {
                for (var j = 0; j < workflows[i].stages.length; j++) {
                    stages.push(workflows[i].stages[j]);
                }
            }

            this.setState({ availableStages: stages })

        }).catch((error) => {
            console.log(error)
        });
    }

    onSubmit() {
        this.setState({ flash: "" })

        axios.post("/api/documents", { name: this.state.name }).then((response: any) => {

            if (response) {
                this.setState({ submitted: true })
            }

        }).catch((error) => {
            this.setState({ flash: error.response.data.message });
        });
    }

    addNewPermission() {
        var newPermissions = [...this.state.permissions]
        newPermissions.push({ id: -1, type: "" })
        this.setState({ permissions: newPermissions })
    }

    modifyPermission(index: number, permission: { id: number, type: string }) {
        var newPermissions = [...this.state.permissions]
        newPermissions[index] = permission;
        this.setState({ permissions: newPermissions })
    }

    renderPermission(index: number, permission: { id: number, type: string }) {

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


        var renderItems = (permission.type === "Stages") ? this.state.availableWorkflows : this.state.availableStages;
        var itemsElement = undefined;

        if (permission.type !== "") {
            itemsElement = <TextField
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
                <MenuItem disabled value="-1"><em>None</em></MenuItem>
                {renderItems.map(item => (
                    <MenuItem key={item.name} value={item.id}>
                        {item.name}
                    </MenuItem>
                ))}
            </TextField>
        }

        return <React.Fragment>
            <FormLabel>New Group</FormLabel>
            <TextField
                select
                label="Type"
                margin="normal"
                variant="filled"
                value={permission.type}
                onChange={changeType}
                InputLabelProps={{
                    shrink: true,
                }}
            >
                <MenuItem key="Workflow" value="Workflow">Workflow</MenuItem>
                <MenuItem key="Stages" value="Stage">Stage</MenuItem>
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
                                <FormLabel>Create Group</FormLabel>
                                <TextField
                                    label="Group Name"
                                    placeholder="Sports Editor Group"
                                    margin="normal"
                                    variant="filled"
                                    value={this.state.name}
                                    onChange={(c) => this.setState({ name: c.target.value })}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                                <Button style={{ width: "calc(3*52px)" }} variant={"contained"} onClick={this.addNewPermission.bind(this)}>
                                    Add New Permission
                                </Button>
                                {this.state.permissions.map((permission, index: number) => {
                                    return this.renderPermission(index, permission)
                                })}
                            </FormGroup>
                            <Button variant="contained" onClick={this.onSubmit.bind(this)} className={classes.button}>Create</Button>
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