import * as React from 'react';
import { Avatar, Switch } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { NRUser } from 'app/utils/models';
import { styles } from './styles';
import axios from 'axios';
import MaterialTable from "material-table";

export namespace Users {
    export interface Props {
        classes?: any
        history: any
        match?: { params: any }
        location: any
    }

    export interface State {
        users: NRUser[],
        filterInput: string,
        currentUser?: NRUser,
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

        axios.get("/api/currentUser").then((response) => {
            this.setState({currentUser: response.data as NRUser});
        })
    }

    render() {
        const {users} = this.state;

        return (
            <div style={{padding: "32px"}}>
                <MaterialTable
                    title="Users"
                    columns={[
                        {title: "Avatar", render: Users.getUserAvatar},
                        {title: "User Name", render: Users.getUserName},
                        {title: "First Name", field: "firstName"},
                        {title: "Last Name", field: "lastName"},
                        {title: "Email", field: "email"},
                        {title: "Admin", render: (user: NRUser) => this.renderAdminSwitch(user)},
                        // {title: "Delete", render: (user: NRUser) => this.deleteUser.bind(this)(user)}
                    ]}
                    data={users}
                />
            </div>
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

    renderAdminSwitch(user: NRUser) {
        const PrimarySwitch = withStyles((theme) => {
            return {
                switchBase: {
                    '&$checked': {
                        color: theme.palette.primary.main,
                    },
                    '&$checked + $track': {
                        backgroundColor: theme.palette.primary.main,
                    },
                },
                checked: {},
                track: {},
            }
        })(Switch);

        const {currentUser} = this.state;

        return (<PrimarySwitch checked={user.admin === "Y"}
                               disabled={!currentUser || currentUser.admin !== "Y" || currentUser.id == user.id}
                               onChange={(event) => this.setUserAdmin(user, event.target.checked)}/>);
    }

    setUserAdmin(user: NRUser, admin: boolean) {
        axios.put("/api/users/" + user.id, {admin: admin ? "Y" : "N"}).then((response) => {
            user.admin = response.data.admin;

            const users = this.state.users.map((prevUser) => {
                if (prevUser.id === user.id) {
                    return user;
                } else {
                    return prevUser;
                }
            });

            this.setState({users: users});
        });
    }
}

export default withStyles(styles, {withTheme: true})(Users);
