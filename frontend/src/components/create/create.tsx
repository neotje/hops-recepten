import { createStyles, FormHelperText, Grid, IconButton, Input, InputLabel, makeStyles, Typography } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import { Theme } from '@material-ui/core/styles';
import { Cancel } from '@material-ui/icons';
import Add from '@material-ui/icons/Add';
import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Recipe } from '../../lib/models';
import { newRecipe } from '../../lib/recipes';
import { userContext } from '../../lib/user';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        buttons: {
            margin: theme.spacing(2)
        }
    }))

export const CreatePage = () => {
    const context = React.useContext(userContext)
    const classes = useStyles()
    const [title, setTitle] = React.useState("")
    let history = useHistory()

    if (!context.state.loggedIn) {
        return <div>Please login first.</div>
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        newRecipe(title)
            .then((result: Recipe) => {
                console.log(result)
                history.push(`/recipe/${result.id}/edit`)
            })
    }

    return (
        <Grid container justify="center" style={{
            paddingTop: "24px"
        }}>
            <form onSubmit={handleSubmit}>
                <Typography variant="h4">Recept aanmaken</Typography>
                <div>
                    <FormControl margin="dense" required error={false}>
                        <InputLabel htmlFor="title-input">Receptnaam</InputLabel>
                        <Input
                            id="title-input"
                            autoFocus
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            aria-describedby="title-error"
                        />
                        {false ? <FormHelperText id="title-error" error>Oeps</FormHelperText> : ""}
                    </FormControl>
                </div>
                <IconButton className={classes.buttons} color="primary" type="submit" size="small">
                    <Add></Add>
                </IconButton>
                <IconButton className={classes.buttons} component={Link} to="/" size="small">
                    <Cancel></Cancel>
                </IconButton>
            </form>
        </Grid>
    )
}