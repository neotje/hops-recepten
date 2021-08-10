import React from 'react'
import { logoutUser, userContext } from '../../lib/user'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Button, Grid } from '@material-ui/core';
import { useHistory, Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: "static",
        },
        loginButton: {
            margin: theme.spacing(1),
        },
    })
);


export const Navigation = () => {
    const context = React.useContext(userContext)
    const classes = useStyles()
    let history = useHistory();

    const onLogoutBtn = () => {
        logoutUser().then(
            (res) => {
                if (res) {
                    history.push("/")
                    context.dispatch({ type: "logout" })
                }
            }
        )
    }

    const onHomeBtn = () => {
        history.push("/")
    }

    return (
        <Grid className={classes.root} justifyContent="flex-end" container direction="row">
            <Grid item>
                <Button className={classes.loginButton} color="primary" onClick={onHomeBtn}>Home</Button>
            </Grid>
            <Grid item>
                {
                    context.state.loggedIn
                        ? <Button className={classes.loginButton} color="inherit" onClick={onLogoutBtn}>Uitloggen</Button>
                        : <Button className={classes.loginButton} color="inherit" component={Link} to="/login">Inloggen</Button>
                }
            </Grid>
        </Grid>
    )
}