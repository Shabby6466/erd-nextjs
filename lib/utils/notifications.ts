import { toast } from "sonner"

export const showNotification = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
}

export const showLoading = (message: string = "Loading...") => {
  return toast.loading(message)
}

export const dismissLoading = (toastId: string | number) => {
  toast.dismiss(toastId)
}

export const showConfirmDialog = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  toast(message, {
    action: {
      label: "Confirm",
      onClick: onConfirm,
    },
    ...(onCancel && {
      cancel: {
        label: "Cancel",
        onClick: onCancel,
      },
    }),
  })
}
