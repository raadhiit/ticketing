import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router, useForm, usePage, Head } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import  PrimaryButton  from '@/Components/PrimaryButton';
import Modal from '@/Components/Modal';
import { toast } from '@/libs/toast';
import { SquarePen, Trash, Plus } from 'lucide-react';

type Dept = { id: number; name: string; created_at: string | null };
type PaginationLink = { url: string | null; label: string; active: boolean };
type Props = {
    departments: { data: Dept[]; links: PaginationLink[]; from?: number };
    filters: { q?: string; sort?: SortKey; dir?: 'asc' | 'desc' };
};

type SortKey = 'name' | 'created_at';

export default function DepartmentsPage({ departments, filters }: Props) {
    const [q, setQ] = useState(filters.q || '');
    const [sort, setSort] = useState<SortKey>(filters.sort || 'name');
    const [direction, setDirection] = useState<'asc' | 'desc'>(
        filters.dir || 'asc',
    );

    // ==== Form modal (create & edit reuse) ====
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);

    // ==== Confirm delete modal ====
    const [confirm, setConfirm] = useState<{
        open: boolean;
        id?: number;
        name?: string;
    }>({ open: false });

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<{ name: string }>({ name: '' });
    const { isAdmin } = usePage().props as any;

    function onSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            route('departments.index'),
            { q },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    function onReset() {
        setQ('');
        router.get(
            route('departments.index'),
            {},
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    // ===== CREATE / EDIT =====
    function openCreate() {
        clearErrors();
        setFormMode('create');
        setEditingId(null);
        setData('name', '');
        setShowForm(true);
    }

    function openEdit(d: Dept) {
        clearErrors();
        setFormMode('edit');
        setEditingId(d.id);
        setData('name', d.name); // prefill
        setShowForm(true);
    }

    function closeForm() {
        if (processing) return;
        setShowForm(false);
        setEditingId(null);
        reset('name');
    }

    function submitForm(e: FormEvent) {
        e.preventDefault();

        if (formMode === 'create') {
            post(route('departments.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Department created Successfully!');
                    closeForm();
                    router.reload({ only: ['departments'] });
                },
                onError: (errs) => {
                    const msg =
                        (errs.name &&
                            (Array.isArray(errs.name)
                                ? errs.name[0]
                                : errs.name)) ||
                        'Validasi gagal. Periksa input.';
                    toast.warning(msg);
                },
            });
        } else {
            if (!editingId) return;
            put(route('departments.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.info('Department updated');
                    closeForm();
                    router.reload({ only: ['departments'] });
                },
                onError: (errs) => {
                    const msg =
                        (errs.name &&
                            (Array.isArray(errs.name)
                                ? errs.name[0]
                                : errs.name)) ||
                        'Validasi gagal. Periksa input.';
                    toast.warning(msg);
                },
            });
        }
    }

    const start = departments.from ?? 1;

    function onSort(col: SortKey) {
        const nextDir = sort === col && direction === 'asc' ? 'desc' : 'asc';
        setSort(col);
        setDirection(nextDir);
        router.get(
            route('departments.index'),
            { q, sort: col, direction: nextDir },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
        return (
            <span className="ml-1 inline-block h-3 w-3 align-middle">
                {active ? (
                    dir === 'asc' ? (
                        <svg viewBox="0 0 20 20">
                            <path d="M10 6l4 6H6l4-6z" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 20 20">
                            <path d="M10 14l-4-6h8l-4 6z" />
                        </svg>
                    )
                ) : (
                    <svg viewBox="0 0 20 20" className="opacity-40">
                        <path d="M10 6l4 6H6l4-6z" />
                    </svg>
                )}
            </span>
        );
    }

    function openDelete(id: number, name: string) {
        if (!isAdmin) return;
        setConfirm({ open: true, id, name });
    }

    function closeDelete() {
        setConfirm({ open: false });
    }

    function confirmDelete() {
        if (!confirm.id) return;
        router.delete(route('departments.destroy', confirm.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Department deleted');
                closeDelete();
                router.reload({ only: ['departments'] });
            },
            onError: () => {
                toast.error('Gagal menghapus department');
                closeDelete();
            },
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    DEPARTMENTS
                </h2>
            }
        >
            <Head title="Departments" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white p-4 shadow dark:bg-slate-800 sm:p-6">
                    {/* Search */}
                    <form
                        onSubmit={onSearch}
                        className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                        {/* Search + tombol Cari & Reset (satu baris) */}
                        <div className="flex w-full items-center gap-2">
                            <input
                                type="text"
                                name="q"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari nama departemen…"
                                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            />

                            <button
                                type="submit"
                                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cari
                            </button>

                            <button
                                type="button"
                                onClick={onReset}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Tombol tambah bisa di bawah di mobile, di kanan di layar lebar */}
                        <PrimaryButton
                            type="button"
                            onClick={openCreate}
                            className="w-full gap-2 sm:w-auto sm:self-end"
                        >
                            <Plus />
                            Tambah Departemen
                        </PrimaryButton>
                    </form>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-neutral-200 text-xs dark:divide-neutral-700 sm:text-sm">
                                <thead className="bg-gray-800 dark:bg-white/80">
                                    <tr className="text-center">
                                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-3 sm:py-3 sm:text-xs">
                                            No.
                                        </th>
                                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-3 sm:py-3 sm:text-xs">
                                            <button
                                                type="button"
                                                onClick={() => onSort('name')}
                                                className="inline-flex items-center gap-1 hover:underline"
                                            >
                                                Name
                                                <SortIcon
                                                    active={sort === 'name'}
                                                    dir={direction}
                                                />
                                            </button>
                                        </th>
                                        <th className="whitespace-nowrap px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-3 sm:py-3 sm:text-xs">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onSort('created_at')
                                                }
                                                className="inline-flex items-center gap-1 hover:underline"
                                            >
                                                Created At
                                                <SortIcon
                                                    active={
                                                        sort === 'created_at'
                                                    }
                                                    dir={direction}
                                                />
                                            </button>
                                        </th>
                                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-4 sm:py-3 sm:text-xs">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {departments.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-2 py-6 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm"
                                            >
                                                Data tidak ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        departments.data.map((d, idx) => (
                                            <tr
                                                key={d.id}
                                                className="text-center hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/60"
                                            >
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {start + idx}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {d.name}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {d.created_at ?? '—'}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(d)
                                                            }
                                                            className="inline-flex items-center rounded-md bg-slate-300 px-2 py-1 hover:bg-slate-200 dark:bg-white/70 dark:hover:bg-white dark:hover:text-black sm:px-3 sm:py-1.5"
                                                        >
                                                            <SquarePen className="mr-1 h-4 w-4" />
                                                        </button>

                                                        {isAdmin && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openDelete(
                                                                        d.id,
                                                                        d.name,
                                                                    )
                                                                }
                                                                className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 sm:px-3 sm:py-1.5 sm:text-xs"
                                                            >
                                                                <Trash className="mr-1 h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ===== Form Modal (Create/Edit) ===== */}
                    <Modal show={showForm} maxWidth="md" onClose={closeForm}>
                        <form onSubmit={submitForm} className="p-6">
                            <div className="mb-4 flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {formMode === 'create'
                                        ? 'Tambah Department'
                                        : 'Edit Department'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700"
                                    aria-label="Close"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="dept-name"
                                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Name
                                </label>
                                <input
                                    id="dept-name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    autoFocus
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    placeholder="Contoh: IT, Finance, HR"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-500"
                                    disabled={processing}
                                >
                                    Batal
                                </button>
                                <PrimaryButton
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing
                                        ? 'Menyimpan…'
                                        : formMode === 'create'
                                          ? 'Simpan'
                                          : 'Update'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </Modal>

                    {/* ===== Confirm Delete Modal ===== */}
                    <Modal
                        show={confirm.open}
                        maxWidth="sm"
                        onClose={closeDelete}
                    >
                        <div className="p-6">
                            <h3 className="mb-2 text-lg font-semibold text-red-600">
                                Hapus Department?
                            </h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                Anda yakin ingin menghapus{' '}
                                <span className="font-semibold">
                                    "{confirm.name}"
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeDelete}
                                    className="rounded-lg border px-4 py-2 text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </Modal>

                    {/* Pagination */}
                    <nav className="mt-4 flex flex-wrap items-center gap-2">
                        {departments.links.map((link, i) => {
                            const base = 'rounded-md px-3 py-1 text-sm border';
                            const active =
                                'bg-blue-600 border-blue-600 text-white hover:bg-blue-700';
                            const idle =
                                'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800';

                            if (link.url === null) {
                                return (
                                    <span
                                        key={i}
                                        className={`${base} ${idle} cursor-not-allowed opacity-50`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveScroll
                                    className={`${base} ${link.active ? active : idle}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
