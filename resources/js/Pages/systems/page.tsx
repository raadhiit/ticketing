import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, router, useForm, usePage, Head } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import { toast } from "react-toastify";
import { SquarePen, Trash, Plus } from "lucide-react";

type system = { 
    id: number;
    name: string;
    code: string;
    created_at: string | null;
}

type SortKey = "name" | "code" | "created_at";

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
}

type Props = {
    systems: {
        data: system[];
        links: PaginationLink[];
        from?: number;
    };
    filters: {
        q?: string;
        sort?: SortKey;
        dir?: 'asc' | 'desc';
    }
}

export default function SystemPage({ systems, filters }: Props) {
    const [q, setQ] = useState(filters.q || '');
    const [sort, setSort] = useState<SortKey>(filters.sort || 'name');
    const [direction, setDirection] = useState<'asc' | 'desc'>(filters.dir || 'asc');
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [confirm, setConfirm] = useState<{
        open: boolean;
        id?: number;
        name?: string;
        code?: string;
    }>({ open: false });

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<{ name: string; code: string }>({ name: '', code: '' });

    const { isAdmin } = usePage().props as any;
    const start = systems.from ?? 1; 

    function onSearch(e: FormEvent) {
        e.preventDefault
        router.get(
            route('systems.index'),
            { q },
            { preserveState: true, replace: true, preserveScroll: true },
        )
    }

    function onReset() {
        setQ('');
        router.get(
            route('systems.index'),
            {},
            { preserveState: true, replace: true, preserveScroll: true },
        )
    }

    // create or edit
    function openCreate() {
        clearErrors();
        setFormMode('create');
        setEditingId(null);
        setData({
            name: '',
            code: '',
        });
        setShowForm(true);
    }

    function openEdit(s: system) {
        clearErrors();
        setFormMode('edit');
        setEditingId(s.id);
        setData({
            name: s.name ?? '',
            code: s.code ?? '',
        });
        setShowForm(true);
    }

    function closeForm() {
        if (processing) return;
        setShowForm(false);
        setEditingId(null);
        reset('name', 'code');
    }

    function submitForm(e: FormEvent) {
        e.preventDefault();

        if (formMode === 'create') {
            post(route('systems.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('System created Successfully!');
                    closeForm();
                    router.reload({ only: ['systems'] });
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
            })
        } else {
            if (!editingId) return;
            put(route('systems.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.info('System updated');
                    closeForm();
                    router.reload({ only: ['systems'] });
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

    function onSort(col: SortKey) {
        const nextDir = sort === col && direction === 'asc' ? 'desc' : 'asc';
        setSort(col);
        setDirection(nextDir);
        router.get(
            route('systems.index'),
            { q, sort: col, direction: nextDir },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    function SortIcon({
        active,
        dir,
    }: {
        active: boolean;
        dir: 'asc' | 'desc';
    }) {
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
        router.delete(route('systems.destroy', confirm.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('System deleted');
                closeDelete();
                router.reload({ only: ['systems'] });
            },
            onError: () => {
                toast.error('Gagal menghapus system');
                closeDelete();
            },
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    SYSTEMS
                </h2>
            }
        >
            <Head title="Systems" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white/90 p-4 shadow dark:bg-slate-800 sm:p-6">
                    <form
                        onSubmit={onSearch}
                        className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex w-full items-center gap-2">
                            <input
                                type="text"
                                name="q"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari Nama System"
                                className="min-w-0 flex-1 rounded-lg border border-slate-500 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-300 dark:focus:ring-blue-500"
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
                                className="rounded-lg border border-slate-300 bg-slate-700 px-4 py-2 text-sm font-medium text-white/80 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Reset
                            </button>
                        </div>

                        <PrimaryButton
                            type="button"
                            onClick={openCreate}
                            className="w-full gap-2 sm:w-auto sm:self-end"
                        >
                            <Plus />
                            Tambah System
                        </PrimaryButton>
                    </form>

                    <div className="dark:bborder-slate-700 overflow-hidden rounded-lg border border-slate-200">
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
                                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-3 sm:py-3 sm:text-xs">
                                            <button
                                                type="button"
                                                onClick={() => onSort('code')}
                                                className="inline-flex items-center gap-1 hover:underline"
                                            >
                                                Code
                                                <SortIcon
                                                    active={sort === 'code'}
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
                                                Created_at
                                                <SortIcon
                                                    active={
                                                        sort === 'created_at'
                                                    }
                                                    dir={direction}
                                                />
                                            </button>
                                        </th>
                                        <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-4 sm:py-3 sm:text-xs">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {systems.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-2 py-6 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm"
                                            >
                                                Data tidak ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        systems.data.map((s, idx) => (
                                            <tr
                                                key={s.id}
                                                className="text-center hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/60"
                                            >
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {start + idx}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {s.name}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {s.code}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {s.created_at ?? '—'}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(s)
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
                                                                        s.id,
                                                                        s.name,
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

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="system-name"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Name
                                    </label>
                                    <input
                                        id="system-name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        autoFocus
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        placeholder="Contoh: Sistem Informasi Manajemen RS"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="system-code"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Code
                                    </label>
                                    <input
                                        id="system-code"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        autoFocus
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        placeholder="Contoh: SM-1, EM-1, HR-1"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>
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
                                    "{confirm.name}", "{confirm.code}"
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </p>
                            <div className="mt-6 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeDelete}
                                    className="rounded-lg border-md px-4 py-2 text-s bg-slate-900 hover:bg-slate-500 text-white"
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
                </div>
            </div>
        </AuthenticatedLayout>
    );


}
