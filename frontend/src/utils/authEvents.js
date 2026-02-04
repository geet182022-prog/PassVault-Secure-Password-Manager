export const triggerLogout = () => {
  window.dispatchEvent(new Event("force-logout"));
};
