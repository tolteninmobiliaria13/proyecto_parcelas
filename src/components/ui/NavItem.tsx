import { NavLink } from "react-router-dom";

type NavItemProps = {
    title: string;
    path: string;
    icon: string;
    onClick?: () => void;
};

export default function NavItem({
    title,
    path,
    icon,
    onClick,
}: NavItemProps) {
    return (
        <NavLink
            to={path}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-md px-md py-sm rounded-lg transition-all duration-200 ${
                    isActive
                        ? "bg-secondary text-on-secondary opacity-90 shadow-sm"
                        : "text-on-primary/70 hover:text-on-primary hover:bg-primary-fixed-dim/10"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    <span 
                        className="material-symbols-outlined"
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                        {icon}
                    </span>
                    {title}
                </>
            )}
        </NavLink>
    );
}