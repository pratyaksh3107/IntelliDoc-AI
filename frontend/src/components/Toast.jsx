import { CheckCircle, XCircle, Info, X } from "lucide-react";

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
};

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || Info;
  return (
    <div className={`toast toast-${toast.type}`} onClick={() => onDismiss(toast.id)}>
      <Icon size={15} />
      <span>{toast.message}</span>
      <X size={13} style={{ marginLeft: "auto", opacity: 0.6, cursor: "pointer" }} />
    </div>
  );
}

export default Toast;
