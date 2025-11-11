import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white/90 p-4 shadow dark:bg-slate-800 sm:p-6">
                    <div className="">
                        {/* Content */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
