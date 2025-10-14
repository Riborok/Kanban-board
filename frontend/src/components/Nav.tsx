import { Link, useLocation } from "react-router-dom"

export default function Nav() {
    const location = useLocation()

    const navItems = [
        { path: "/", label: "Главная" },
        { path: "/projects", label: "Проекты" },
        { path: "/profile", label: "Профиль" },
    ]

    return (
        <nav className="mb-8">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-1 inline-flex gap-1">
                {navItems.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path === "/projects" && location.pathname.startsWith("/projects"))

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                px-5 py-2 rounded text-sm font-medium transition-colors
                                ${
                                    isActive
                                        ? "bg-violet-600 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }
                            `}
                        >
                            {item.label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
