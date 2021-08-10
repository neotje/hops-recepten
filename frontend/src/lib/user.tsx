import React from "react";
import { useEffect } from "react";
import { config } from "../config";
import { EmptyUser, Recipe, User, UserAction, UserContext, UserInterface } from "./models";

export function getCurrentUser(): Promise<User | null> {
    return fetch(`${config.apiUrl}/user`, { credentials: "include" })
        .then(res => res.json())
        .then(result => {
            if (!result.error) {
                var u: User = result.user
                return u
            }
            return null
        })
}

export function isLoggedIn(): Promise<boolean> {
    return getCurrentUser().then(user => {
        return user != null
    })
}

export function loginUser(email: string, password: string): Promise<User | null> {
    return fetch(`${config.apiUrl}/user/login`, {
        method: 'POST',
        body: JSON.stringify({
            'email': email,
            'password': password
        }),
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include"
    })
        .then(res => res.json())
        .then(result => {
            if (!result.error) {
                var u: User = result.user
                return u
            }
            return null
        })
}

export function logoutUser(): Promise<boolean> {
    return fetch(`${config.apiUrl}/user/logout`, { credentials: "include" })
        .then(res => res.json())
        .then(result => {
            if (!result.error) {
                return true
            }
            return false
        })
}

export function userIsEditor(u: User): boolean {
    return config.editGroup.indexOf(u.type) !== -1
}

export function userIsAuthor(u: User, r: Recipe): boolean{
    if (!userIsEditor(u)) {
        return false
    }

    if (u.type == "admin") {
        return true
    }

    if (r.author.email == u.email) {
        return true
    }

    return false
}



export const userReducer = (state: UserInterface, action: UserAction): UserInterface => {
    switch (action.type) {
        case "login":
            if (action.data) {
                return {
                    ...state,
                    loggedIn: true,
                    user: action.data
                }
            }
            return state
            
        case "logout":
            return {
                ...state,
                loggedIn: false
            }

        default:
            return state
    }
}

const initialState: UserInterface = {
    loggedIn: false,
    user: EmptyUser 
}

export const userContext = React.createContext<UserContext>({
    state: initialState,
    dispatch: (v) => { }
})

export const UserProvider: React.FC = ({ children }) => {
    const [state, dispatch] = React.useReducer(userReducer, initialState)

    useEffect(() => {
        getCurrentUser().then((user) => {
            if (user !== null) {
                dispatch({ type: "login", data: user })
            } else {
                dispatch({ type: "logout" })
            }
        })
    }, [])

    return (
        <userContext.Provider value={{ state, dispatch }}>
            {children}
        </userContext.Provider>
    )
}