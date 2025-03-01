import { Route, Routes } from "react-router-dom";
import HomePage from "../views/Home_Page";

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
        </Routes>
    )
}

export default Router;