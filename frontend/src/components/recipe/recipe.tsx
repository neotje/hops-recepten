import React, { useContext, useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Checkbox, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Fab, createStyles, makeStyles, Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import { useHistory, useParams } from "react-router-dom"
import { config } from '../../config';
import { Ingredient, Recipe, ResponseError, Step } from '../../lib/models';
import { getRecipe } from '../../lib/recipes';
import { RECIPE_ERRORS } from '../../lib/errors';
import { Edit } from '@material-ui/icons';
import { userContext } from '../../lib/user';

export interface RecipePageParams {
    recipeId: string
}

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

export const RecipePage = () => {
    const params = useParams<RecipePageParams>()

    const [error, setError] = useState<ResponseError>();
    const [isLoaded, setIsLoaded] = useState(false)
    const [recipe, setRecipe] = useState<Recipe>()
    const [checked, setChecked] = useState<number[]>([]);

    const context = useContext(userContext)

    let history = useHistory()

    const classes = useStyles();

    useEffect(() => {
        getRecipe(params.recipeId)
            .catch((reason) => {
                setIsLoaded(true)

                console.log(reason);


                if (reason === RECIPE_ERRORS.DOES_NOT_EXIST) {
                    setError({
                        code: 0,
                        msg: "Oeps! het recept bestaat niet."
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

    const handleToggle = (value: number) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    if (error) {
        return <div>Error: {error.msg}</div>
    } else if (!isLoaded) {
        return <CircularProgress />
    } else {

        return (
            <Container maxWidth="md" style={{
                paddingTop: 16,
                paddingBottom: 120
            }}>
                {
                    context.state.loggedIn &&
                    <Fab className={classes.actionbutton} color="primary" aria-label="edit" onClick={() => {
                        history.push(`/recipe/${recipe?.id}/edit`)
                    }}>
                        <Edit />
                    </Fab>
                }
                <Typography variant="h2" gutterBottom>{recipe?.title}</Typography>
                <Typography variant="subtitle1">{recipe?.author.name}</Typography>
                <img src={`${config.apiUrl}/recipes/${recipe?.id}/image`} alt="result of recipe" style={{
                    maxWidth: "100%",
                    marginTop: 16,
                    marginBottom: 16
                }} />

                <List
                    subheader={
                        <Typography variant="h5" gutterBottom>Ingedienten:</Typography>
                    }
                    style={{
                        minWidth: 320
                    }}
                >
                    {
                        recipe?.ingredients.map((value: Ingredient, index: number) => {
                            return (
                                <ListItem key={value.name} dense>
                                    <ListItemIcon>
                                        {value.amount}
                                    </ListItemIcon>
                                    <ListItemText>{value.name}</ListItemText>
                                    <ListItemSecondaryAction>
                                        <Checkbox
                                            edge="start"
                                            onChange={handleToggle(index)}
                                            checked={checked.indexOf(index) !== -1}
                                            tabIndex={-1}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )
                        })
                    }
                </List>

                {
                    recipe?.steps.map((step: Step, index: number) => {
                        return (
                            <Accordion expanded>
                                <AccordionSummary>
                                    <Typography>Stap {index + 1}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>
                                        <div dangerouslySetInnerHTML={{
                                            __html: step.content
                                        }}></div>
                                    </Typography>
                                </AccordionDetails>
                            </Accordion>
                        )
                    })
                }
            </Container>
        )
    }
}