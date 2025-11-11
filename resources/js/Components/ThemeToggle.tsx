import { useDarkMode } from '@/hooks/useDarkMode';

export default function ThemeToggle() {
    const { isDark, toggle } = useDarkMode();

    return (
        <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
        >
            {isDark ? (
                // Icon Sun
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10-9h-2v3h2V4zm7.04.46l-1.41-1.41-1.8 1.79 1.42 1.42 1.79-1.8zM20 11v2h3v-2h-3zm-8 8h-2v3h2v-3zm4.24.76l1.8 1.79 1.41-1.41-1.79-1.8-1.42 1.42zM4.96 19.54l1.41 1.41 1.8-1.79-1.42-1.42-1.79 1.8zM12 6a6 6 0 100 12 6 6 0 000-12z" />
                </svg>
            ) : (
                // Icon Moon
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 2a9.99 9.99 0 00-8.485 4.57A10 10 0 1012 2zm0 18a8 8 0 01-6.32-12.8A9.99 9.99 0 0012 4a8 8 0 010 16z" />
                </svg>
            )}
            <span className="hidden sm:inline">
                {isDark ? 'Light' : 'Dark'}
            </span>
        </button>
    );
}
