// agr alg routes create krne hain , jaha pe /login ka form dikha rha hoga, /register ka form ka dikh rha hoga-- use package->npm i react-router
import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/interview";




export const router = createBrowserRouter([
    {
        path: "/login", // konse path pe konsa element dikh rha hoga
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        path:"/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    }

])