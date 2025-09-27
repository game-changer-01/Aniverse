import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false); // avoid hydration mismatch for portal
  useEffect(() => { setMounted(true); }, []);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = ++idCounter;
    const ttl = toast.ttl ?? 4000;
    setToasts(t => [...t, { id, ...toast }]);
    if (ttl > 0) {
      setTimeout(() => remove(id), ttl);
    }
  }, [remove]);

  const api = { push, remove };

  return (
    <ToastContext.Provider value={api}>
      {children}
  {mounted && createPortal(
        <div className="toast-stack" role="region" aria-live="polite" aria-label="Notifications">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type || 'info'}`} role={t.type === 'error' || t.type === 'warning' ? 'alert' : 'status'}>
              <div className="toast-content">
                {t.icon && <span className="toast-icon" aria-hidden>{t.icon}</span>}
                <div className="toast-text">
                  {t.title && <strong className="toast-title">{t.title}</strong>}
                  {t.message && <div className="toast-message">{t.message}</div>}
                </div>
                <button className="toast-close" onClick={() => remove(t.id)} aria-label="Close notification">×</button>
              </div>
              <div className="toast-bar" />
            </div>
          ))}
        </div>,
        document.body
      )}
      <style jsx>{`
        .toast-stack { position:fixed; top:1rem; right:1rem; display:flex; flex-direction:column; gap:.75rem; z-index:9999; max-width:340px; }
        .toast { background:rgba(20,22,30,0.9); backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:.85rem 1rem 1rem; box-shadow:var(--shadow-md); overflow:hidden; animation:slideIn .5s ease; }
        .toast-success { border-color: var(--color-accent); }
        .toast-error { border-color: var(--color-accent-alt); }
        .toast-warning { border-color: #ffa94d; }
        .toast-content { display:flex; align-items:flex-start; gap:.75rem; }
        .toast-icon { font-size:1.25rem; line-height:1; }
        .toast-title { display:block; font-size:.9rem; margin-bottom:.15rem; letter-spacing:.5px; }
        .toast-message { font-size:.8rem; opacity:.85; line-height:1.4; }
        .toast-close { background:none; border:none; color:#fff; cursor:pointer; font-size:1rem; opacity:.6; transition:opacity .2s; margin-left:.25rem; }
        .toast-close:hover { opacity:1; }
        .toast-bar { position:absolute; left:0; bottom:0; height:3px; background:linear-gradient(90deg,var(--color-accent), var(--color-accent-alt)); animation:bar 4s linear forwards; }
        @keyframes bar { from { width:100%; } to { width:0%; } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px) scale(.95);} to { opacity:1; transform:translateX(0) scale(1);} }
      `}</style>
    </ToastContext.Provider>
  );
};
