import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Plus, SquarePen, Trash } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState, FormEvent } from 'react';
import Modal from '@/Components/Modal';

type PaginationLink = {
    url: string | null;
    label: string;
    action: boolean;
}

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from?: number;
}

type Project = {
    id: number;
    name: string;
    code: string;
    system_id: number;
    description: string;
    start_date: string;
    end_date: string;
    created_at: string | null;
};

type Kanban = {
    id: number;
    name: string;
    project: Pick<Project, 'id' | 'name'> | null;
    project_id: number;
    created_at: string | null;
}

type SortDir = 'asc' | 'desc';
type SortKey = 'name' | 'created_at';

type Props = {
    kanbans: Paginated<Kanban>;
    projects: Project[];
    filters: {
        q?: string;
        sort?: SortKey;
        dir?: SortDir;
    };
    q?: string;
    sort?: SortKey;
    dir?: SortDir;
};

export default function KanbanPage({ projects, kanbans, filters }: Props) {
    const [q, setQ] = useState(filters.q || '');
    const [sort, setSort] = useState<SortKey>(filters.sort || 'name');
    const [direction, setDirection] = useState<SortDir>(filters.dir || 'asc');
    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [confirm, setConfirm] = useState<{
        open: boolean;
        id?: number;
        name?: string;
    }>({ open: false });
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<{ name: string; project_id: number | ''; }>({
            name: '',
            project_id: '',
    })

    const { isAdmin } = usePage().props as any;
    const start = kanbans.from ?? 1;

    function openCreate() {
        clearErrors();
        setFormMode('create');
        setEditingId(null);
        setData({
            name: '',
            project_id: '',
        });
        setShowForm(true);
    }

    function openEdit(k: Kanban) {
        clearErrors();
        setFormMode('edit');
        setEditingId(k.id);
        setData({
            name: k.name ?? '',
            project_id: k.project_id ?? '',
        });
        setShowForm(true);
    }

    function closeForm() {
        if (processing) return;
        setShowForm(false);
        setEditingId(null);
        reset('name', 'project_id');
    }
    
    function submitForm(e: FormEvent) {
        e.preventDefault();

        if (formMode === 'create') {
            post(route('kanbans.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kanban created successfully!');
                    closeForm();
                    router.reload({ only: ['kanbans'] });
                },
                onError: (errs) => {
                    const msg =
                        (errs.name &&
                            (Array.isArray(errs.name)
                                ? errs.name[0]
                                : errs.name)) ||
                        (errs.system_id &&
                            (Array.isArray(errs.project_id)
                                ? errs.project_id[0]
                                : errs.project_id)) ||
                        'Validasi gagal. Periksa input.';
                    toast.warning(msg);
                },
            });
        } else {
            if (!editingId) return;
            put(route('kanbans.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.info('kanban updated');
                    closeForm();
                    router.reload({ only: ['kanbans'] });
                },
                onError: (errs) => {
                    const msg =
                        (errs.name &&
                            (Array.isArray(errs.name)
                                ? errs.name[0]
                                : errs.name)) ||
                        (errs.system_id &&
                            (Array.isArray(errs.project_id)
                                ? errs.project_id[0]
                                : errs.project_id)) ||
                        'Validasi gagal. Periksa input.';
                    toast.warning(msg);
                },
            });
        }
    }

    function onSort(col: SortKey) {
        const nextDir: SortDir =
            sort === col && direction === 'asc' ? 'desc' : 'asc';
        setSort(col);
        setDirection(nextDir);
        router.get(
            route('kanbans.index'),
            { q, sort: col, direction: nextDir },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }
        
    function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
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
        router.delete(route('kanbans.destroy', confirm.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kanban deleted');
                closeDelete();
                router.reload({ only: ['kanbans'] });
            },
            onError: () => {
                toast.error('Gagal menghapus kanban');
                closeDelete();
            },
        });
    }
    
    return (
        <AuthenticatedLayout>
            <Head title="Kanban Board" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white/90 p-4 shadow dark:bg-slate-800 sm:p-6">
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                                    Kanban Boards
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Daftar papan kanban per project.
                                </p>
                            </div>

                            <PrimaryButton
                                type="button"
                                onClick={openCreate}
                                className="w-full gap-2 sm:w-auto sm:self-end"
                            >
                                <Plus />
                                Tambah Board
                            </PrimaryButton>
                        </div>
                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-800/60">
                                    <tr className="text-center">
                                        <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            No.
                                        </th>
                                        <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Nama Board
                                        </th>
                                        <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <button
                                                type="button"
                                                onClick={() => onSort('name')}
                                                className="inline-flex items-center gap-1 hover:underline"
                                            >
                                                Nama Project
                                                <SortIcon
                                                    active={sort === 'name'}
                                                    dir={direction}
                                                />
                                            </button>
                                        </th>
                                        <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Created At
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            ACTION
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-700 dark:bg-slate-900">
                                    {kanbans.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-2 py-6 text-center text-sm text-slate-500 dark:text-slate-400 sm:text-sm"
                                            >
                                                Data Tidak Ditemukan
                                            </td>
                                        </tr>
                                    ) : (
                                        kanbans.data.map((k, idx) => (
                                            <tr
                                                key={k.id}
                                                className="text-center hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/60"
                                            >
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {start + idx}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {k.name}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {k.project?.name}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {k.created_at ?? '—'}
                                                </td>
                                                <td className="px-4 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(k)
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
                                                                        k.id,
                                                                        k.name,
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

                    {/* Modal form create/edit */}
                    <Modal show={showForm} maxWidth="xl" onClose={closeForm}>
                        <form onSubmit={submitForm} className="space-y-3 p-6">
                            <div className="mb-4 flex items-start justify-between">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {formMode === 'create'
                                        ? 'Tambah Board'
                                        : 'Edit Board'}
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
                                        htmlFor="board-name"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Board Name
                                    </label>
                                    <input
                                        id="project-name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        autoFocus
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        placeholder="Contoh:"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="board-project"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Project
                                    </label>
                                    <select
                                        id="board-project"
                                        value={data.project_id}
                                        onChange={(e) =>
                                            setData(
                                                'project_id',
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : '',
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    >
                                        <option value="">Pilih project…</option>
                                        {projects.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.project_id && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.project_id}
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

                    {/* Modal konfirmasi delete */}
                    <Modal
                        show={confirm.open}
                        maxWidth="sm"
                        onClose={closeDelete}
                    >
                        <div className="p-6">
                            <h3 className="mb-2 text-lg font-semibold text-red-600">
                                Hapus Project?
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
                                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-500"
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