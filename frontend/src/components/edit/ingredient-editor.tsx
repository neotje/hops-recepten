import { createStyles, Grid, Grow, IconButton, makeStyles, TextField, Theme, Typography } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import Add from '@material-ui/icons/Add';
import React, { useState } from 'react';
import { Ingredient } from '../../lib/models';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        ingredientField: {
            marginLeft: theme.spacing(1)
        },
        root: {
            marginTop: theme.spacing(4)
        }
    })
);

interface IngredientsProps {
    ingredients: Ingredient[]
    onUpdate?: (array: Ingredient[]) => void
}
export const IngredientsEditor = ({ ingredients, onUpdate }: IngredientsProps) => {
    const [list, setList] = useState<Ingredient[]>(ingredients)
    const [transition, setTransition] = useState<boolean[]>(ingredients.map((v) => true))

    const classes = useStyles()

    function dispatchUpdate(arr: Ingredient[]) {
        setList(arr)
        console.log(arr);

        if (onUpdate) {
            onUpdate(arr)
        }
    }

    function handleUpdate(index: number, key: string, val: string) {
        console.log(index, key, val);

        const newList = list.map((item, i) => {
            if (i === index) {
                if (key === "amount") {
                    const updated: Ingredient = { ...item }
                    updated.amount = val
                    return updated
                }
                if (key === "name") {
                    const updated: Ingredient = { ...item }
                    updated.name = val
                    return updated
                }
            }

            return item
        })

        dispatchUpdate(newList)
    }

    function handleRemove(index: number) {
        const newList = list.filter((item, i) => i !== index)

        transition[index] = true
        setTransition(transition)

        dispatchUpdate(newList)
    }

    function handleAdd() {
        const newList = [...list]
        newList.push({ amount: "", name: "" })

        transition.push(true)
        setTransition(transition)

        dispatchUpdate(newList)
    }

    return (
        <Grid className={classes.root}>
            <Grid>
                <Typography variant="h4">Ingredienten</Typography>
            </Grid>
            {
                list.map((ingredient, i) =>
                    <Grow in={transition[i]} onExited={() => handleRemove(i)}>
                        <Grid item key={i.toString()} container>
                            <TextField
                                id={`amount${i}`}
                                className={classes.ingredientField}
                                variant="outlined"
                                size="small" margin="dense"
                                value={ingredient.amount}
                                onChange={e => handleUpdate(i, "amount", e.currentTarget.value)} />
                            <TextField
                                id={`name${i}`}
                                className={classes.ingredientField}
                                variant="outlined"
                                size="small" margin="dense"
                                value={ingredient.name}
                                onChange={e => handleUpdate(i, "name", e.currentTarget.value)} />
                            <IconButton aria-label="delete" onClick={e => {
                                const newTrans: boolean[] = [...transition]
                                newTrans[i] = false
                                setTransition(newTrans)
                            }} color="secondary">
                                <Delete />
                            </IconButton>
                        </Grid>
                    </Grow>
                )
            }

            <Grid>
                <IconButton aria-label="add" onClick={e => handleAdd()} color="primary">
                    <Add />
                </IconButton>
            </Grid>
        </Grid>
    )
}
