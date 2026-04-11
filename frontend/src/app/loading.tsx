export default function Loading() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-200 dark:border-zinc-800" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-mint animate-spin" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading...</p>
            </div>
        </div>
    );
}
