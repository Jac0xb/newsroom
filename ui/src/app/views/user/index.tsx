import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, FormLabel, Select, MenuItem, OutlinedInput, FormControl, Paper, Typography, Chip, Button} from '@material-ui/core';
import { styles } from './styles';
import axios from 'axios';
import { mapStateToProps  } from 'app/store/user/reducers';
import { mapDispatchToProps } from "app/store/user/actions";
import { connect } from "react-redux";
import { UserDispatchers, UserState } from "app/store/user/types";
import { NRGroup, NRRole, NRWorkflow, NRStage } from 'app/utils/models';

import { TreeSelect, Select as AntSelect } from 'antd';
import { Typography as AntTypography } from 'antd';
import { Input } from 'antd';
const { Option } = AntSelect;
const { TextArea } = Input;
import _ from 'lodash';

export namespace EditUser {
    export interface Props extends UserDispatchers, UserState {
        classes?: any
        match: { 
            params: {
                id: number 
            }
        }
    }
    export interface State { masterList: Array<NRRole>; selectedItems: Array<any>; fetchedWorkflows: NRWorkflow[]; fetchedStages: NRStage[]}
}

class EditUser extends React.Component<EditUser.Props, EditUser.State> {
    constructor(props: EditUser.Props) {
        super(props);
        this.state = { masterList: [], selectedItems: [], fetchedWorkflows: [], fetchedStages: [], }
    }

    async componentDidMount() {
        var {data : workflows } = await axios.get<NRWorkflow[]>("/api/workflows");
            
            for (var i = 0; i < workflows.length; i++) {
                let { data : stages } = await axios.get<NRStage[]>(`/api/workflows/${workflows[i].id}/stages`);
                workflows[i].stages = stages;
            }
            
        this.setState({fetchedWorkflows: workflows});

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
        const { classes, flash, permissions, groups, selectedGroups } = this.props;
        
        var treeData = _.map(this.state.fetchedWorkflows, (workflow) => {
            var newWorkflow = { title: workflow.name, value: `${workflow.id}`, children: new Array<{title: string, value: string}>() }

            for (var i = 0; i < workflow.stages.length; i++) {
                let stage = workflow.stages[i] 
                newWorkflow.children.push({ title : stage.name, value: `${workflow.id}-${stage.id}` })
            }

            return newWorkflow;
        })

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
                            <AntTypography.Text strong={true}>Edit Groups</AntTypography.Text>
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
                        <FormControl>
                            <AntTypography.Text strong={true}>Edit Permissions</AntTypography.Text>
                                <TreeSelect
                                    showSearch
                                    treeData={treeData}
                                    value={this.state.selectedItems}
                                    style={{marginBottom: "16px"}}
                                    placeholder="Type to filter.."
                                    allowClear
                                    multiple
                                    treeDefaultExpandAll
                                    onChange={(value) => this.setState({selectedItems: value})}
                                />
                        </FormControl>
                        {/* <FormControl>
                            <FormLabel className={classes.formLabel}>Edit Permissions</FormLabel>
                            <Select 
                                value={""}
                                className={classes.formSelect}
                                onChange={(event) => this.props.fetchSelectChange("selectedGroups", event.target.value as Array<NRRole>)}
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
                        </FormControl> */}
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
