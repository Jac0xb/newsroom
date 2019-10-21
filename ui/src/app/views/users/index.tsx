import * as React from 'react';
import { Avatar, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { NRUser } from 'app/utils/models';
import { styles } from './styles';
import axios from 'axios';
import MaterialTable from "material-table";
import { Link } from 'react-router-dom';

export namespace Users {
    export interface Props {
        classes?: any
        history: any
        match?: { params: any }
        location: any
    }

    export interface State {
        users: NRUser[],
        filterInput: string
    }
}

class Users extends React.Component<Users.Props, Users.State> {
    constructor(props: Users.Props, context?: any) {
        super(props, context);
        this.state = {
            users: [],
            filterInput: ""
        }
    }

    componentDidMount() {
        axios.get("/api/users").then((response) => {
            this.setState({users: response.data})
        });
    }

    render() {
        const {users} = this.state;

        return (
            <React.Fragment>
                <MaterialTable
                    title="Users"
                    columns={[
                        {title: "Avatar", render: Users.getUserAvatar},
                        {title: "User Name", render: Users.getUserName},
                        {title: "First Name", field: "firstName"},
                        {title: "Last Name", field: "lastName"},
                        {title: "Email", field: "email"},
                        {title: "", render: (user: NRUser) => this.deleteUser.bind(this)(user)}
                    ]}
                    data={users}
                />
            </React.Fragment>
        );
    }

    static getUserAvatar(user: NRUser) {
        return <Avatar>{user.firstName.substring(0, 1) + user.lastName.substring(0, 1)}</Avatar>
    }

    static getUserName(user: NRUser) {
        // return <Link style={{ textDecoration: "none" }} to={`/users/${user.id}`}>
        //     {user.userName}
        // </Link>
        return (<div>{user.userName}</div>)
    }

    deleteUser(user: NRUser) {
        var onClick = async () => {
            
            await axios.delete(`/api/users/${user.id}`);

            var response = await axios.get("/api/roles")
                
            this.setState({users: response.data})
        } 

        return (
            // <Button variant="contained" onClick={onClick}>
            //     Delete
            // </Button>
            <div></div>
        )
    }
}

export default withStyles(styles, {withTheme: true})(Users);
