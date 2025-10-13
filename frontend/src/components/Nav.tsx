import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

export default function Nav() {
    const [hovered, setHovered] = useState<string | null>(null)
    const location = useLocation()

    const item = (path: string, label: string) => {
        const isActive = location.pathname === path ||
                        (path === '/projects' && location.pathname.startsWith('/projects'))
        const isHovered = hovered === path

        return (
            <Link
                key={path}
                to={path}
                onMouseEnter={() => setHovered(path)}
                onMouseLeave={() => setHovered(null)}
                className={`
                    mr-2 rounded-md px-3 py-1.5 border-2 text-sm
                    ${isActive
                        ? 'border-violet-600'
                        : isHovered
                            ? 'border-gray-700'
                            : 'border-white'
                    }
                `}
            >
                {label}
            </Link>
        )
    }

    return (
        <nav className="mb-5 flex gap-4 justify-center">
            {item('/', 'Главная')}
            {item('/projects', 'Проекты')}
            {item('/profile', 'Профиль')}
        </nav>
    )
}
