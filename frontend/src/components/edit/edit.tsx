import { CircularProgress, Container, createStyles, Fab, makeStyles, TextField, Theme, Typography } from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { RECIPE_ERRORS, USER_ERRORS } from '../../lib/errors';
import { Ingredient, Recipe, ResponseError, Step } from '../../lib/models';
import { getRecipe, saveRecipe } from '../../lib/recipes';
import { userContext } from '../../lib/user';
import { RecipePageParams } from '../recipe/recipe';
import { IngredientsEditor } from './ingredient-editor';
import { StepsEditor } from './step-editor';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        actionbutton: {
            position: "fixed",
            bottom: theme.spacing(4),
            right: theme.spacing(4),
            zIndex: theme.zIndex.snackbar
        }
    })
);

export const EditPage = () => {
    const [recipe, setRecipe] = useState<Recipe>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [error, setError] = useState<ResponseError>()
    const [saving, setSaving] = useState(false)

    const params = useParams<RecipePageParams>()
    const context = useContext(userContext)

    const classes = useStyles()

    let history = useHistory()

    useEffect(() => {
        getRecipe(params.recipeId)
            .catch((reason) => {
                setIsLoaded(true)

                console.log(reason);


                if (reason === RECIPE_ERRORS.DOES_NOT_EXIST) {
                    setError({
                        code: 0,
                        msg: "404 onbekend recept."
                    })
                }
                if (reason === USER_ERRORS.PERMISSION_DENIED) {
                    setError({
                        code: 0,
                        msg: "U heeft geen bewerk rechten!"
                    })
                }
            })
            .then((result) => {
                setIsLoaded(true)
                if (result) {
                    setRecipe(result)
                }
            })
    }, [params.recipeId])

    const save = (r: Recipe) => {
        setSaving(true)

        saveRecipe(r)
            .catch((reason) => {
                // TODO: error message
            })
            .then((v) => {
                setSaving(false)
                // TODO: saved message
            })
    }

    function updateIngredients(arr: Ingredient[]) {
        if (recipe) {
            const r: Recipe = {
                ...recipe,
                ingredients: arr
            }
            setRecipe(r)
            console.log(r)

            save(r)
        }
    }

    function updateSteps(arr: Step[]) {
        if (recipe) {
            const r: Recipe = {
                ...recipe,
                steps: arr
            }
            setRecipe(r)
            console.log(r)

            save(r)
        }
    }

    function updateTitle(t: string) {
        if (recipe) {
            const r: Recipe = {
                ...recipe,
                title: t
            }
            setRecipe(r)

            save(r)
        }
    }

    if (!context.state.loggedIn) {
        return <div>Eerst inloggen!</div>
    }

    if (error) {
        // TODO: better error screen.
        return <div>Error: {error.msg}</div>
    } else if (!isLoaded) {
        // TODO: better loading screen.
        return <CircularProgress />
    } else {
        return (
            <Container maxWidth="md" style={{
                paddingTop: 48,
                paddingBottom: 120
            }}>
                <Fab
                    className={classes.actionbutton}
                    color="primary" aria-label="back"
                    disabled={saving}
                    onClick={() => {
                        history.push(`/recipe/${recipe?.id}`)
                    }}>
                    <ArrowBack />
                </Fab>
                <Typography variant="h3" gutterBottom>Recept "{recipe?.title}" bewerken</Typography>
                <TextField
                    id="title-input"
                    variant="outlined"
                    value={recipe?.title}
                    onChange={e => updateTitle(e.target.value)} />
                <IngredientsEditor ingredients={recipe ? recipe.ingredients : []} onUpdate={updateIngredients}></IngredientsEditor>
                <StepsEditor steps={recipe ? recipe.steps : []} onUpdate={updateSteps}></StepsEditor>
            </Container>
        )
    }
}