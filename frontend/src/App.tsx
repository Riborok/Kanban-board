import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"
import Nav from "./components/Nav"
import Home from "./pages/Home"
import Projects from "./pages/Projects"
import Profile from "./pages/Profile"
import { AppProvider } from "./context/AppContext"

function App() {
    return (
        <AppProvider>
            <Router>
                <div>
                    <Nav />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:id" element={<Projects />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </div>
            </Router>
        </AppProvider>
    )
}

export default App
