import { Button, Grid, Paper } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { styles } from './styles';

export namespace LoginPage {
    export interface Props {
        classes?: any
    }
}

class LoginPage extends React.Component<LoginPage.Props> {
    constructor(props: LoginPage.Props) {
        super(props);
    }

    handleLogin() {
        window.location.href = "/auth/google";
    }

    render() {
        const {classes} = this.props;

        return (
            <React.Fragment>
                <main>
                    <Grid container justify="center">
                        <Paper className={classes.paper} elevation={1}>
                            <Button variant="contained"
                                    color="primary"
                                    className={classes.button}
                                    onClick={this.handleLogin}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                                     alt="Google Logo"
                                     width={30}
                                     height={30}/>
                                Sign In with Google</Button>
                        </Paper>
                    </Grid>
                </main>
            </React.Fragment>
        );
    }
}

export default withStyles(styles, {withTheme: true})(LoginPage);