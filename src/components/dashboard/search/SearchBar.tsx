type SearchBarProps = {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
};

export default function SearchBar({
    placeholder = "Buscar parcela, dueño...",
    value,
    onChange,
}: SearchBarProps) {
    return (
        <div className="relative group">
            <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
            </span>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                className="pl-xl pr-md py-2 bg-surface-container text-on-surface rounded-full border-none focus-within:ring-2 focus-within:ring-primary/20 w-64 text-sm transition-all focus:w-80 outline-none placeholder:text-on-surface-variant/70"
            />
        </div>
    );
}
