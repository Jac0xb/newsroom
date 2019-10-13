import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, FormLabel, Select, MenuItem, OutlinedInput, FormControl, Paper, Typography, Chip} from '@material-ui/core';
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
        this.getUserSummary()
        this.getGroups()
        
    }

    // getGroups = () => {
    //     var userId = this.props.match.params.id
    //     axios.get("/api/users/" + userId + "/roles").then((response) => {
    //         this.props.fetchSetGroups(response.data)
    //         this.props.fetchSelectChange("selectedGroups", response.data)
    //     });
    // }

    getGroups = () => {
        var userId = this.props.match.params.id
        axios.get("/api/roles/").then((response) => {
            this.props.fetchSetGroups(response.data)
        });
    }

    getUserSummary = () => {
        // TODO
        var userId = this.props.match.params.id
        axios.get("/api/users/" + userId + "/summary").then((response) => {
            console.log(response.data)
            this.props.fetchSelectChange("selectedGroups", response.data.roles)
            this.props.fetchSetPermissions(response.data.wfpermissions)
        });
    }

    render() {
        const { classes, flash, permissions, groups, selectedGroups } = this.props;

        return (
            <React.Fragment>
                <Grid className={classes.grid} container spacing={4} justify="center">
                    <Paper className={classes.formGroup}>
                        {(flash != "") ?
                            <Paper className={classes.flashMessage}>
                                <Typography variant="caption">
                                    {flash}
                                </Typography>
                            </Paper> :
                            <div></div>
                        }
                        <FormControl>
                            <FormLabel className={classes.formLabel}>Edit Groups</FormLabel>
                            <Select
                                multiple
                                value={selectedGroups} 
                                className={classes.formSelect}
                                onChange={(event) => this.props.fetchSelectChange("selectedGroups", event.target.value)}
                                input={<OutlinedInput 
                                    labelWidth={1}
                                    name="groups"
                                    id="outlined-groups-dropdown" 
                                />}
                                renderValue={(selected: any) => (
                                    <div className={classes.chips}>
                                      {selected.map((group: any) => (
                                        <Chip key={group.id} label={group.name} className={classes.chip} />
                                      ))}
                                    </div>
                                  )}
                                >
                                <MenuItem value={""}><em>None</em></MenuItem>
                                {groups.map((group: any, index: number) =>
                                    <MenuItem key={index} value={group}>{group.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel className={classes.formLabel}>Edit Permissions</FormLabel>
                            <Select 
                                value={""}
                                className={classes.formSelect}
                                onChange={(event) => this.props.fetchSelectChange("selectedGroups", event.target.value)}
                                input={<OutlinedInput 
                                    labelWidth={1}
                                    name="permissions"
                                    id="outlined-groups-dropdown" 
                                />}
                                >
                                <MenuItem value={""}><em>None</em></MenuItem>
                                {permissions.map((permission: any, index: number) =>
                                    <MenuItem key={index} value={index}>{permission.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>
                
            </React.Fragment>
        );
    }
}

export default connect<EditUser.Props>(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles, { withTheme: true })(EditUser));
