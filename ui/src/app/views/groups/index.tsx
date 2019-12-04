import * as React from 'react';
import { Avatar, Button, AppBar } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { NRRole as NRGroup } from 'app/utils/models';
import { styles } from './styles';
import axios from 'axios';
import MaterialTable from "material-table";
import { Link } from 'react-router-dom';

export namespace Groups {
    export interface Props {
        classes?: any
        history: any
        match?: { params: any }
        location: any
    }

    export interface State {
        groups: NRGroup[],
        filterInput: string
    }
}

class Groups extends React.Component<Groups.Props, Groups.State> {
    constructor(props: Groups.Props, context?: any) {
        super(props, context);
        this.state = {
            groups: [],
            filterInput: ""
        }
    }

    componentDidMount() {
        axios.get("/api/roles").then((response) => {
            this.setState({groups: response.data})
        });
    }

    render() {
        const {classes} = this.props;
        const {groups} = this.state;

        return (
            <main className={classes.main} style={{marginTop: "132px"}}>
                <AppBar color="default" style={{marginTop: "64px", padding: "16px"}}>
                    <Link style={{ textDecoration: "none" }} to={"/groups/create"}>
                        <Button variant="contained" >
                            Create Group
                        </Button>
                    </Link>
                </AppBar>
                <div className={classes.table}>
                    <MaterialTable
                        columns={[
                            {title: "Avatar", render: Groups.getGroupAvatar},
                            {title: "Name", render: Groups.getGroupName},
                            {title: "Created", field: "created"},
                            {title: "Last Updated", field: "lastUpdated"},
                            {title: "Description", field: "description"},
                            {title: "", render: (group: any) => this.deleteGroup.bind(this)(group)}
                        ]}
                        data={groups}
                        options={
                            {
                                pageSize: 8,
                                search: false
                            }
                        }
                        title="Groups"/>
                </div>
            </main>
        );
    }

    static getGroupAvatar(group: any) {
        // TODO Get Image Avatar
        return <Avatar style={{transform: "scale(0.75)"}}>{group.name.substring(0, 2)}</Avatar>
    }

    static getGroupName(group: any) {
        return <Link style={{ textDecoration: "none" }} to={`/groups/${group.id}`}>
            {group.name}
        </Link>
    }

    deleteGroup(group: any) {

        var onClick = async () => {
            
            await axios.delete(`/api/roles/${group.id}`);

            var response = await axios.get("/api/roles")
                
            this.setState({groups: response.data})
        } 

        return (<Button style={{transform: "scale(0.75)"}} variant="contained" onClick={onClick}>
            Remove
        </Button>)
    }
}

export default withStyles(styles, {withTheme: true})(Groups);
