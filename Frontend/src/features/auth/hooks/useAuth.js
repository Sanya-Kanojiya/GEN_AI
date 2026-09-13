import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";


export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true) // loading ko set krege true pe
        try {
            const data = await login({ email, password }) //API call krege
            setUser(data.user)  //API ka jo respose aayega , uska jo user rhega usko set kr dege user k andar // jo backend ke hme user ka data milne ja rhe hai isi user ko hm set kr rhe hain (controller- auth.controller.js)
        } catch (err) {
        } finally {
            setLoading(false)  // waps loading ko set krege False pe
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }


    const handleLogout = async () => {
        setLoading(true)
        try {
            const data = await logout()
            setUser(null)
        } catch (err) {

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

        const getAndSetUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        getAndSetUser()

    }, [])


    return { user, loading, handleRegister, handleLogin, handleLogout }
}
