import React from "react";
import { useEffect } from "react";
import { config } from "../config";
import { User, UserAction, UserContext, UserInterface } from "./models";

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



export const userReducer = (state: UserInterface, action: UserAction): UserInterface => {
    switch (action.type) {
        case "login":
            return {
                ...state,
                loggedIn: true
            }

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
    loggedIn: false
}

export const userContext = React.createContext<UserContext>({
    state: initialState,
    dispatch: (v) => { }
})

export const UserProvider: React.FC = ({ children }) => {
    const [state, dispatch] = React.useReducer(userReducer, initialState)

    useEffect(() => {
        isLoggedIn().then((res) => {
            if (res) {
                dispatch({ type: "login" })
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