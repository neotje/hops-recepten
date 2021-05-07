import React, { useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Checkbox, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import { useParams } from "react-router-dom"
import { config } from '../../config';
import { Ingredient, Recipe, ResponseError, Step } from '../../lib/models';

interface RecipePageParams {
    recipeId: string
}

export const RecipePage = () => {
    const params = useParams<RecipePageParams>()

    const [error, setError] = useState<ResponseError>();
    const [isLoaded, setIsLoaded] = useState(false)
    const [recipe, setRecipe] = useState<Recipe>()
    const [checked, setChecked] = React.useState<number[]>([]);

    useEffect(() => {
        fetch(`${config.apiUrl}/recipes/${params.recipeId}`)
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true)

                    if (result.error) {
                        setError(result.error)
                    } else {
                        setRecipe(result.recipe)
                    }
                },
                (error) => {
                    setIsLoaded(true)
                    setError({
                        code: 0,
                        msg: error.message
                    })
                }
            )
    }, [])

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