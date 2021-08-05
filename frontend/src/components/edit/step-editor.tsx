import { createStyles, Grid, Grow, IconButton, makeStyles, TextField, Theme, Typography } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import Add from '@material-ui/icons/Add';
import React, { useState } from 'react';
import { Step } from '../../lib/models';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        textfield: {
            width: "100%"
        },
        root: {
            marginTop: theme.spacing(4)
        }
    })
);

interface StepsProps {
    steps: Step[]
    onUpdate?: (array: Step[]) => void
}
export const StepsEditor = ({ steps, onUpdate }: StepsProps) => {
    const [list, setList] = useState<Step[]>(steps)
    const [transition, setTransition] = useState<boolean[]>(steps.map((v) => true))

    const classes = useStyles()

    function dispatchUpdate(arr: Step[]) {
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
                if (key === "content") {
                    const updated: Step = { ...item }
                    updated.content = val.replaceAll("\n", "<br>")
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
        newList.push({ content: "" })

        transition.push(true)
        setTransition(transition)

        dispatchUpdate(newList)
    }

    return (
        <Grid className={classes.root}>
            <Grid>
                <Typography variant="h4">Stappen</Typography>
            </Grid>
            {
                list.map((step, i) =>
                    <Grow in={transition[i]} onExited={() => handleRemove(i)}>
                        <Grid item key={i.toString()} container alignItems="center">
                            <Grid xs={1}>
                                <Typography align="center" variant="body1">{i}</Typography>
                            </Grid>
                            <Grid xs={10}>
                                <TextField
                                    id={`step${i}`}
                                    className={classes.textfield}
                                    variant="outlined"
                                    size="small" margin="dense"
                                    value={step.content.replaceAll("<br>", "\n")}
                                    multiline
                                    onChange={e => handleUpdate(i, "content", e.currentTarget.value)} />
                            </Grid>
                            <Grid xs={1}>
                                <IconButton aria-label="delete" onClick={e => {
                                    const newTrans: boolean[] = [...transition]
                                    newTrans[i] = false
                                    setTransition(newTrans)
                                }} color="secondary">
                                    <Delete />
                                </IconButton>
                            </Grid>
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
