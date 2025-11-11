import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Plus, SquarePen, Trash } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


// Reusable types
type PaginationLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from?: number;
};

type SystemRow = {
    id: number;
    name: string;
    code: string;
    created_at: string | null;
};

type ProjectRow = {
    id: number;
    name: string;
    code: string;
    system_id: number;
    description: string;
    start_date: string;
    end_date: string;
    system: Pick<SystemRow, 'id' | 'name' | 'code'> | null;
    created_at: string | null;
};

type SortDir = 'asc' | 'desc';
type SortKey = 'name' | 'created_at' | 'code'; // sesuaikan dengan kolom sort di backend

type Props = {
    projects: Paginated<ProjectRow>;
    systems: SystemRow[]; // list untuk dropdown
    filters: {
        q?: string;
        sort?: SortKey;
        dir?: SortDir;
    };
};

export default function ProjectsPage({ projects, systems, filters }: Props) {
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
    useForm<{ name: string; system_id: number | ''; code: string; description: string; start_date: string; end_date:string; }>({
        name: '',
        system_id: '',
        code: '',
        description: '',
        start_date: '',
        end_date: '',
    });
    
    const [startDateObj, setStartDateObj] = useState<Date | null>(
        data.start_date ? new Date(data.start_date) : null,
    );
    
    const [endDateObj, setEndDateObj] = useState<Date | null>(
        data.end_date ? new Date(data.end_date) : null,
    );
    const formatDate = (date: Date) => date.toISOString().slice(0,10);
    const { isAdmin } = usePage().props as any;
    const start = projects.from ?? 1;

    // search
    function onSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            route('projects.index'),
            { q },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    function onReset() {
        setQ('');
        router.get(
            route('projects.index'),
            {},
            { preserveState: true, replace: true, preserveScroll: true },
        );
    }

    // create or edit
    function openCreate() {
        clearErrors();
        setFormMode('create');
        setEditingId(null);
        setData({
            name: '',
            system_id: '',
            code: '',
            description: '',
            start_date: '',
            end_date: '',
        });
        setStartDateObj(null);
        setEndDateObj(null);
        setShowForm(true);
    }

    function openEdit(p: ProjectRow) {
        clearErrors();
        setFormMode('edit');
        setEditingId(p.id);
        setData({
            name: p.name ?? '',
            system_id: p.system_id ?? '',
            code: p.code ?? '',
            description: p.description ?? '',
            start_date: p.start_date ?? '',
            end_date: p.end_date ?? '',
        });
        setStartDateObj(p.start_date ? new Date(p.start_date) : null);
        setEndDateObj(p.end_date ? new Date(p.end_date) : null);
        setShowForm(true);
    }

    function closeForm() {
        if (processing) return;
        setShowForm(false);
        setEditingId(null);
        reset('name', 'system_id', 'code', 'description', 'start_date', 'end_date');
    }

    function submitForm(e: FormEvent) {
        e.preventDefault();

        if (formMode === 'create') {
            post(route('projects.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Project created successfully!');
                    closeForm();
                    router.reload({ only: ['projects'] });
                },
                onError: (errs) => {
                    const msg =
                        (errs.name &&
                            (Array.isArray(errs.name)
                                ? errs.name[0]
                                : errs.name)) ||
                        (errs.system_id &&
                            (Array.isArray(errs.system_id)
                                ? errs.system_id[0]
                                : errs.system_id)) ||
                        'Validasi gagal. Periksa input.';
                    toast.warning(msg);
                },
            });
        } else {
            if (!editingId) return;
            put(route('projects.update', editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.info('Project updated');
                    closeForm();
                    router.reload({ only: ['projects'] });
                },
                onError: (errs) => {
                    const msg =
                        (errs.name &&
                            (Array.isArray(errs.name)
                                ? errs.name[0]
                                : errs.name)) ||
                        (errs.system_id &&
                            (Array.isArray(errs.system_id)
                                ? errs.system_id[0]
                                : errs.system_id)) ||
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
            route('projects.index'),
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
        router.delete(route('projects.destroy', confirm.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Project deleted');
                closeDelete();
                router.reload({ only: ['projects'] });
            },
            onError: () => {
                toast.error('Gagal menghapus project');
                closeDelete();
            },
        });
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    PROJECTS
                </h2>
            }
        >
            <Head title="Projects" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white/90 p-4 shadow dark:bg-slate-800 sm:p-6">
                    {/* Search + tombol tambah */}
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
                                placeholder="Cari nama project…"
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
                            Tambah Project
                        </PrimaryButton>
                    </form>

                    {/* Tabel projects */}
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
                                                Project
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
                                                System
                                                <SortIcon
                                                    active={sort === 'code'}
                                                    dir={direction}
                                                />
                                            </button>
                                        </th>
                                        <th className='px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-3 sm:py-3 sm:text-xs'>
                                            Start Date
                                        </th>
                                        <th className='px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-3 sm:py-3 sm:text-xs'>
                                            End Date
                                        </th>
                                        <th className='px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-3 sm:py-3 sm:text-xs'>
                                            Description
                                        </th>
                                        <th className="whitespace-nowrap px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black sm:px-3 sm:py-3 sm:text-xs">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onSort('created_at')
                                                }
                                                className="inline-flex items-center gap-1 hover:underline"
                                            >
                                                Created at
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
                                    {projects.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-2 py-6 text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm"
                                            >
                                                Data tidak ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        projects.data.map((p, idx) => (
                                            <tr
                                                key={p.id}
                                                className="text-center hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800/60"
                                            >
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {start + idx}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {p.name}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {p.system
                                                        ? `${p.system.code}`
                                                        : '—'}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {p.start_date ?? '—'}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {p.end_date ?? '—'}
                                                </td>
                                                <td className="px-4 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {p.description ?? '—'}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    {p.created_at ?? '—'}
                                                </td>
                                                <td className="px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm">
                                                    <div className="flex flex-wrap items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEdit(p)
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
                                                                        p.id,
                                                                        p.name,
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
                                        ? 'Tambah Project'
                                        : 'Edit Project'}
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

                            <div className="grid gap-3 sm:grid-cols-3">
                                {/* Project name */}
                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="project-name"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Project Name
                                    </label>
                                    <input
                                        id="project-name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        autoFocus
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        placeholder="Contoh: Implementasi HRIS"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="project-code"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Project Code
                                    </label>
                                    <input
                                        id="project-code"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        autoFocus
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        placeholder="Contoh: PRSIMRS-1"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                {/* System dropdown */}
                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="project-system"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        System
                                    </label>
                                    <select
                                        id="project-system"
                                        value={data.system_id}
                                        onChange={(e) =>
                                            setData(
                                                'system_id',
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : '',
                                            )
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    >
                                        <option value="">Pilih system…</option>
                                        {systems.map((sys) => (
                                            <option key={sys.id} value={sys.id}>
                                                {sys.code}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.system_id && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.system_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="project-start_date"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Tanggal Mulai
                                    </label>
                                    <DatePicker
                                        id="project-start_date"
                                        selected={startDateObj}
                                        onChange={(date: Date | null) => {
                                            setStartDateObj(date);
                                            setData(
                                                'start_date',
                                                date ? formatDate(date) : '',
                                            );
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Pilih tanggal mulai…"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        wrapperClassName="w-full"
                                    />

                                    {errors.start_date && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {Array.isArray(errors.start_date)
                                                ? errors.start_date[0]
                                                : errors.start_date}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="project-end_date"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        End Date
                                    </label>

                                    <DatePicker
                                        id="project-end_date"
                                        selected={endDateObj}
                                        onChange={(date: Date | null) => {
                                            setEndDateObj(date);
                                            setData(
                                                'end_date',
                                                date ? formatDate(date) : '',
                                            );
                                        }}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Pilih tanggal selesai…"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        wrapperClassName="w-full"
                                    />

                                    {errors.end_date && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {Array.isArray(errors.end_date)
                                                ? errors.end_date[0]
                                                : errors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="sm:grid-cols grid gap-3">
                                <div className="flex flex-col space-y-1">
                                    <label
                                        htmlFor="project-description"
                                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="project-description"
                                        value={data.description}
                                        onChange={(e) => {
                                            setData(
                                                'description',
                                                e.target.value,
                                            );
                                        }}
                                        autoFocus
                                        rows={5}
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        placeholder="Contoh:Project untuk mendukung operasional bla bla bla"
                                    />
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
