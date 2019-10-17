import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Select, MenuItem, OutlinedInput, FormControl, Paper, Typography, Chip, Button, FormLabel, TextField } from '@material-ui/core';
import { styles } from './styles';
import axios from 'axios';
import { mapStateToProps  } from 'app/store/user/reducers';
import { mapDispatchToProps } from "app/store/user/actions";
import { connect } from "react-redux";
import { UserDispatchers, UserState } from "app/store/user/types";
import {  NRRole } from 'app/utils/models';

export namespace EditUser {
    export interface Props extends UserDispatchers, UserState {
        classes?: any
        match: { 
            params: {
                id: number 
            }
        }
    }
    export interface State { masterList: Array<NRRole>; }
}

class EditUser extends React.Component<EditUser.Props, EditUser.State> {
    constructor(props: EditUser.Props) {
        super(props);
        this.state = { masterList: [] }
    }

    async componentDidMount() {
        this.getGroups()
        this.getUserSummary()
    }

    getGroups = () => {
        axios.get("/api/roles/").then((response) => {
            this.props.fetchSetGroups(response.data as Array<NRRole>)
            this.props.fetchSelectChange("selectedGroups", response.data as Array<NRRole>)
        });
    }

    getUserSummary = () => {
        var selectedGroups = Array<NRRole>()
        const userId = this.props.match.params.id

        axios.get("/api/users/" + userId + "/summary").then((response) => {

            console.log(response.data)

            // Need to add roles from the master group list
            response.data.roles.forEach((role: NRRole)=> {
                // If role matches group, add to list
                this.props.groups.find(function(element) {
                    if(element.id == role.id){
                        selectedGroups.push(element);
                    }
                });
            });

            // Update selected list with current roles
            this.setState({ masterList: selectedGroups })
            this.props.fetchSelectChange("selectedGroups", selectedGroups)
            this.props.fetchSetPermissions(response.data.wfpermissions)
        });
    }

    // TODO: be better to have a call api/users/updaterole
    handleSubmit = () => {
        const userId = this.props.match.params.id

        // Add all selected groups on backend
        this.props.selectedGroups.forEach(group => {
            var rid = group.id;
            axios.put("/api/users/" + userId + " /role/" + rid).then((response) => {
                // console.log(response.data)
            })

            // if no longer selected role, delete
            console.log(this.state.masterList.find(x => x.id != rid))
            this.state.masterList.find(function(element) {
                // TODO: backend error. 
                if(element.id != rid){
                    axios.delete("/api/users/" + userId + " /role/" + element.id).then((response) => {
                        console.log(response.data)
                    })
                }
            });
        });

        // this.props.fetchUpdateUser(,this.props.selectedGroups)
    }

    render() {
        const { classes, flash, permissions, groups, selectedGroups, firstName} = this.props;

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
                            <TextField
                                id="outlined-name"
                                label="First Name"
                                className={classes.textField}
                                value={firstName}
                                onChange={(event) => this.props.fetchHandleTextChange('firstName', event.target.value as string)}
                                margin="normal"
                                variant="outlined"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Groups</FormLabel>
                            <Select
                                multiple
                                value={selectedGroups} 
                                className={classes.formSelect}
                                onChange={(event) => this.props.fetchSelectChange("selectedGroups", event.target.value as Array<NRRole>)}
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
                                {groups.map((group: any, index: number) =>
                                    <MenuItem key={index} value={group}>{group.name}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        <FormControl className={classes.buttonGroup}>
                            <Button variant="contained" className={classes.button} onClick={() => this.handleSubmit()}>Update</Button>
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
