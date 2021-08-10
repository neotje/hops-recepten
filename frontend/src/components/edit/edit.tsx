import { Button, CircularProgress, Container, createStyles, Fab, Grid, IconButton, makeStyles, TextField, Theme, Typography } from '@material-ui/core';
import { ArrowBack, PhotoCamera } from '@material-ui/icons';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { config } from '../../config';
import { RECIPE_ERRORS, USER_ERRORS } from '../../lib/errors';
import { EmptyRecipe, Ingredient, Recipe, ResponseError, Step } from '../../lib/models';
import { getRecipe, saveRecipe, setRecipeImage } from '../../lib/recipes';
import { userContext } from '../../lib/user';
import { RecipePageParams } from '../recipe/recipe';
import { IngredientsEditor } from './ingredient-editor';
import { StepsEditor } from './step-editor';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        actionContainer: {
            position: "fixed",
            bottom: theme.spacing(4),
            right: theme.spacing(4),
            zIndex: theme.zIndex.snackbar
        },
        actionButton: {
            position: "relative"
        },
        actionButtonProgress: {
            position: "absolute",
            left: 0
        },
        uploadBtnRoot: {
            '& > *': {
                margin: theme.spacing(2),
            },
        },
        imageGrid: {
            marginTop: theme.spacing(2)
        }
    })
);

export const EditPage = () => {
    const [recipe, setRecipe] = useState<Recipe>()
    const [isLoaded, setIsLoaded] = useState(false)
    const [error, setError] = useState<ResponseError>()
    const [saving, setSaving] = useState(false)
    const [imgURL, setImgURL] = useState(`${config.apiUrl}/recipes/${recipe?.id}/image`)
    const [timer, setTimer] = useState<NodeJS.Timeout>()

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
                    const r: Recipe = {
                        ...result
                    }
                    setRecipe(r)
                    setImgURL(`${config.apiUrl}/recipes/${r.id}/image`)
                }
            })
    }, [params.recipeId])

    const save = (r: Recipe) => {
        setSaving(true)

        if (timer) {
            clearTimeout(timer)
            setTimer(undefined)
        }

        setTimer(setTimeout(() => {
            saveRecipe(r)
                .catch((reason) => {
                    // TODO: error message
                })
                .then((v) => {
                    setSaving(false)
                    // TODO: saved message
                })
        }, 3000))
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

    function upload(files: FileList | null) {
        if (files && recipe) {
            setSaving(true)
            setImgURL("")

            setRecipeImage(recipe.id, files[0]).then(result => {
                console.log(result)
                setSaving(false)
                setImgURL(`${config.apiUrl}/recipes/${recipe?.id}/image`)
            })
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
                <div className={classes.actionContainer}>
                    <Fab
                        className={classes.actionButton}
                        color="primary" aria-label="back"
                        disabled={saving}
                        onClick={() => {
                            history.push(`/recipe/${recipe?.id}`)
                        }}>
                        <ArrowBack />
                    </Fab>
                    {
                        saving && <CircularProgress className={classes.actionButtonProgress} size={56}/>
                    }
                </div>

                <Typography variant="h3" gutterBottom>Recept "{recipe?.title}" bewerken</Typography>
                <TextField
                    id="title-input"
                    variant="outlined"
                    value={recipe?.title}
                    onChange={e => updateTitle(e.target.value)} />

                <Grid container alignItems="center" className={classes.imageGrid}>
                    <Grid item>
                        <div className={classes.uploadBtnRoot}>
                            <input accept="image/*" style={{ display: "none" }} id="icon-button-file" type="file" onChange={e => upload(e.target.files)} />
                            <label htmlFor="icon-button-file">
                                <IconButton color="primary" aria-label="upload picture" component="span">
                                    <PhotoCamera />
                                </IconButton>
                            </label>
                        </div>
                    </Grid>
                    <Grid item>
                        <img src={imgURL} style={{
                            maxHeight: "30vh"
                        }} />
                    </Grid>
                </Grid>

                {
                    recipe && <IngredientsEditor ingredients={recipe.ingredients} onUpdate={updateIngredients}></IngredientsEditor>
                }
                {
                    recipe && <StepsEditor steps={recipe.steps} onUpdate={updateSteps}></StepsEditor>
                }
            </Container>
        )
    }
}