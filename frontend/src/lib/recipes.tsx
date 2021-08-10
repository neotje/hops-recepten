import { config } from "../config";
import { Recipe } from "./models";

export function newRecipe(title: string): Promise<Recipe> {
    return fetch(`${config.apiUrl}/recipes/new`, {
        method: "POST",
        body: JSON.stringify({
            'title': title
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })
        .then(res => res.json())
        .then(result => {
            if (result.error) {
                throw result.code
            }

            var r: Recipe = result.recipe
            return r
        })
}

export function getRecipe(id: string): Promise<Recipe> {
    return fetch(`${config.apiUrl}/recipes/${id}`, { credentials: "include" })
        .then(res => res.json())
        .then(result => {
            if (result.error) {
                throw result.error.code
            }

            var r: Recipe = result.recipe
            return r
        })
}

export function setRecipeImage(id: string, file: File) {
    const data = new FormData()
    data.append('image', file)

    return fetch(`${config.apiUrl}/recipes/${id}/image`, {
        method: "POST",
        body: data,
        credentials: "include"
    })
        .then(res => res.json())
        .then(result => {
            if (result.error) {
                throw result.error.code
            }

            return result
        })
}

export function saveRecipe(recipe: Recipe): Promise<any> {
    return Promise.all([
        fetch(`${config.apiUrl}/recipes/${recipe.id}/steps/set`, {
            method: "POST",
            body: JSON.stringify({ 'steps': recipe.steps }),
            headers: { 'Content-Type': 'application/json' },
            credentials: "include"
        }),
        fetch(`${config.apiUrl}/recipes/${recipe.id}/ingredients/set`, {
            method: "POST",
            body: JSON.stringify({ 'ingredients': recipe.ingredients }),
            headers: { 'Content-Type': 'application/json' },
            credentials: "include"
        }),
        fetch(`${config.apiUrl}/recipes/${recipe.id}/title/set`, {
            method: "POST",
            body: JSON.stringify({ 'title': recipe.title }),
            headers: { 'Content-Type': 'application/json' },
            credentials: "include"
        }),
    ]).then((responses) => {
        var resultPromises = responses.map((resp) => {
            return resp.json()
        })

        return Promise.all(resultPromises)
            .then((results) => {
                for (const res of results) {
                    if (res.error) {
                        throw res.error.code
                    }
                }
            })
    })
}