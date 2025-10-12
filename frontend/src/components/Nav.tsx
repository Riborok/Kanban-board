import { useState } from "react"

export interface NavProps {
  current: PageKey
  onChange: (page: PageKey) => void
}

type PageKey = "home" | "projects" | "profile"

export default function Nav({ current, onChange }: NavProps) {
    const [hovered, setHovered] = useState<PageKey | null>(null);

    const item = (key: PageKey, label: string) => {
        const isActive = current === key;
        const isHovered = hovered === key;

        return (
            <button
                key={key}
                onClick={() => onChange(key)}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                className={`
                    mr-2 rounded-md px-3 py-1.5 border-2 text-sm transition-colors
                    ${isActive
                        ? 'border-violet-600'
                        : isHovered
                            ? 'border-gray-700'
                            : 'border-white'
                    }
                `}
            >
                {label}
            </button>
        );
    };

    return (
        <nav className="mb-5 flex gap-4 justify-center">
            {item('home', 'Главная')}
            {item('projects', 'Проекты')}
            {item('profile', 'Профиль')}
        </nav>
    );
}
