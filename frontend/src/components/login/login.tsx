import React from 'react'
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';

import { loginUser, userContext } from '../../lib/user'
import { FormHelperText, Grid, Input, InputLabel, Typography } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

export const Login = () => {
    const context = React.useContext(userContext)
    const [email, setEmail] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [error, setError] = React.useState<boolean>(false)

    let history = useHistory()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError(false)

        loginUser(email, password)
            .then(u => {
                if (u !== null) {
                    context.dispatch({type: "login"})
                    history.push("/")
                } else {
                    setError(true)
                }
            })
    }

    if (context.state.loggedIn) {
        return <div>Please logout first</div>
    } else {
        return (
            <Grid container justify="center" style={{
                paddingTop: "24px"
            }}>
                <form onSubmit={handleSubmit}>
                    <Typography variant="h4">Inloggen</Typography>
                    <div>
                        <FormControl margin="dense" required error={error}>
                            <InputLabel htmlFor="email-input">E-mail</InputLabel>
                            <Input
                                id="email-input"
                                autoFocus
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                aria-describedby="email-error"
                            />
                            {error ? <FormHelperText id="email-error" error>Onbekende gebruiker</FormHelperText> : ""}
                        </FormControl>
                    </div>
                    <div>
                        <FormControl margin="dense" required error={error}>
                            <InputLabel htmlFor="pass-input">Wachtwoord</InputLabel>
                            <Input id="pass-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </FormControl>
                    </div>
                    <Button variant="contained" type="submit" color="primary" style={{
                        marginTop: "1rem"
                    }}>
                        Inloggen
                    </Button>
                </form>
            </Grid>

        )
    }
}