// Tiny external store so any component (route guards, plain links, session
// expiry handling, etc.) can pop open the global LoginDialog without needing
// to be inside the same component tree as it.

type Listener = () => void;

let open = false;
let returnTo: string | undefined;
let version = 0;
const listeners = new Set<Listener>();

const notify = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

export const openLoginDialog = (nextReturnTo?: string): void => {
  if (open && returnTo === nextReturnTo) return;
  open = true;
  returnTo = nextReturnTo;
  notify();
};

export const closeLoginDialog = (): void => {
  if (!open) return;
  open = false;
  returnTo = undefined;
  notify();
};

export const subscribeLoginDialog = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getLoginDialogSnapshot = (): number => version;

export const isLoginDialogOpen = (): boolean => open;

export const getLoginDialogReturnTo = (): string | undefined => returnTo;
