import { Grid, Paper, Typography, TextField, Button, InputAdornment } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import axios from 'axios';
import * as React from 'react';
import { styles } from './styles';

export namespace LoginPage {
  export interface Props {
    classes?: any
    loginClick: any
  }
  export interface State {
    username: string
    password: string
  }
}
class LoginPage extends React.Component<LoginPage.Props, LoginPage.State, any> {


    constructor(props: LoginPage.Props) {
        super(props)
        this.state = {
            username: '',
            password: '',
        }
    }

    handleTextChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {

        if(name == "username")
            this.setState({ username: event.target.value });
        if(name == "password")
            this.setState({ password: event.target.value });
    };

    render() {

        const { classes, loginClick } = this.props;
        const { username, password } = this.state;

        return (
        <React.Fragment>
            <main>
                <div>
                    <Grid container className={classes.grid} justify="center">
                        <Paper className={classes.paper} elevation={1}>
                            <Typography variant="h5" component="h3">
                                Login 
                            </Typography>
                            <TextField
                                required
                                onChange={this.handleTextChange("username")}
                                id="username-required"
                                label="Username"
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                                value={username}
                                
                            />
                            <TextField
                                required
                                onChange={this.handleTextChange("password")}
                                id="password-required"
                                label="Password"
                                className={classes.textField}
                                margin="normal"
                                variant="outlined"
                                value={password}
                                type={'password'}
                            />
                            <Grid container className={classes.grid} justify="center">
                                <Button variant="contained" color="primary" className={classes.button} onClick={() => loginClick(username,password)}>Login</Button>
                            </Grid>
                        </Paper>
                    </Grid>
                </div>
            </main>
        </React.Fragment>
        );
    }
}

export default withStyles(styles, { withTheme: true })(LoginPage);