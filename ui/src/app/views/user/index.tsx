import * as React from 'react';
import { Avatar, FormControl } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Grid, FormLabel, Select, MenuItem, OutlinedInput } from '@material-ui/core';
import { styles } from './styles';
import axios from 'axios';
import { mapStateToProps  } from 'app/store/user/reducers';
import { mapDispatchToProps } from "app/store/user/actions";
import { connect } from "react-redux";
import { UserDispatchers, UserState } from "app/store/user/types";

export namespace EditUser {
    export interface Props extends UserDispatchers, UserState {
        classes?: any
        match: { 
            params: {
                id: number 
            }
        }
    }
    export interface State { }
}

class EditUser extends React.Component<EditUser.Props, EditUser.State> {
    constructor(props: EditUser.Props) {
        super(props);
        this.state = { }
    }

    componentDidMount() {
        // TODO: permissions: have backend add GET api/roles/{uid} 
        this.getPermissions()
        this.getGroups()
        
    }

    getGroups = () => {
        var userId = this.props.match.params.id
        axios.get("/api/users/" + userId + "/roles").then((response) => {
            this.props.fetchSetGroups(response.data)
        });
    }

    getPermissions = () => {
        // TODO
        //this.props.fetchSetPermissions()
    }

    render() {
        const { classes, permissions, groups } = this.props;
        console.log(groups)

        return (
            <React.Fragment>
                <Grid className={classes.outerGrid} alignContent={"center"} container spacing={24} direction="row" justify="center" alignItems="center">
                    {/* <FormLabel style={{ marginTop: "16px" }}>Edit Permissions</FormLabel>
                    {permissions.map((permission, index: number) => {
                        <TextField
                        select
                        // key={index}
                        label="Type"
                        margin="normal"
                        variant="filled"
                        value={permission.type}
                        // onChange={changeType}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    >
                        <MenuItem key="Workflows" value="Workflows">Workflows</MenuItem>
                        <MenuItem key="Stages" value="Stages">Stages</MenuItem>
                    </TextField>
                    })} */}
                    <FormControl>
                        <FormLabel style={{ marginTop: "16px" }}>Edit Groups</FormLabel>
                        {groups.map((group, index: number) => {
                            <Select
                                value={group.name}
                                // onChange={this.handleChange}
                                input={<OutlinedInput 
                                    labelWidth={1}
                                    name="age"
                                    id="outlined-age-simple" 
                                />}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem key={group.name} value={group.id}>
                                    {group.name}
                                </MenuItem>
                            </Select>
                        })}
                    </FormControl>
                </Grid>
                
            </React.Fragment>
        );
    }
}

export default connect<EditUser.Props>(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(EditUser));
