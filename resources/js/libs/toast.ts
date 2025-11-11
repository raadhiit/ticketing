// resources/js/libs/toast.ts
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

const PALETTE: Record<ToastKind, { accent: string; icon: string }> = {
    success: { accent: '#16a34a', icon: '✓' }, // green-600
    error: { accent: '#dc2626', icon: '✕' }, // red-600
    info: { accent: '#2563eb', icon: 'ℹ︎' }, // blue-600
    warning: { accent: '#f59e0b', icon: '!' }, // yellow-500
};

function renderHTML(
    kind: ToastKind,
    title: string | undefined,
    message: string,
    duration: number,
) {
    const p = PALETTE[kind];
    return `
    <div class="toasty">
      <div class="toasty-icon" style="background:${p.accent}1a;border:1px solid ${p.accent}33;color:${p.accent}">
        ${p.icon}
      </div>
      <div class="toasty-body">
        ${title ? `<div class="toasty-title">${title}</div>` : ''}
        <div class="toasty-msg">${message}</div>
        <div class="toasty-bar" style="--dur:${duration}ms;background:${p.accent}"></div>
      </div>
    </div>
  `;
}

function show(
    message: string,
    kind: ToastKind = 'info',
    opts?: { title?: string; duration?: number; onClick?: () => void },
) {
    const duration = opts?.duration ?? 3000;
    const html = renderHTML(kind, opts?.title, message, duration);
    const accent = PALETTE[kind].accent;

    Toastify({
        text: html,
        escapeMarkup: false, // penting: biar HTML di atas dirender
        gravity: 'top',
        position: 'right',
        duration,
        close: false,
        stopOnFocus: true,
        onClick: opts?.onClick,
        offset: { x: 16, y: 16 },
        className: `toasty-container toasty-${kind}`,
        // styling container → glassmorphism + border aksen
        style: {
            background: '#0b1726cc', // gelap transparan
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${accent}33`,
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,.25)',
            padding: '0',
        },
    }).showToast();
}

export const toast = {
    success: (
        m: string,
        o?: { title?: string; duration?: number; onClick?: () => void },
    ) => show(m, 'success', o),
    error: (
        m: string,
        o?: { title?: string; duration?: number; onClick?: () => void },
    ) => show(m, 'error', o),
    info: (
        m: string,
        o?: { title?: string; duration?: number; onClick?: () => void },
    ) => show(m, 'info', o),
    warning: (
        m: string,
        o?: { title?: string; duration?: number; onClick?: () => void },
    ) => show(m, 'warning', o),

    // Konsumsi flash dari server (opsional)
    from(payload?: { message?: string; type?: ToastKind; title?: string }) {
        if (!payload?.message) return;
        const t = (['success', 'error', 'info', 'warning'] as const).includes(
            payload.type as any,
        )
            ? (payload.type as ToastKind)
            : 'info';
        show(payload.message, t, { title: payload.title });
    },
} as const;

export default toast;
