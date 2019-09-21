import * as React from 'react';
import { Avatar, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Group } from 'app/models';
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
        groups: Group[],
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
            <main className={classes.main}>
                <Link style={{ textDecoration: "none" }} to={"/groups_create"}>
                    <Button variant="contained" className={classes.buttonGroup} >
                        Create Group
                    </Button>
                </Link>
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
                        title="Groups"/>
                </div>
            </main>
        );
    }

    static getGroupAvatar(group: any) {
        // TODO Get Image Avatar
        return <Avatar>{group.name.substring(0, 2)}</Avatar>
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

        return (<Button variant="contained" onClick={onClick}>
            Remove
        </Button>)
    }
}

export default withStyles(styles, {withTheme: true})(Groups);
