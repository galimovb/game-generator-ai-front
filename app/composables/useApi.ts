import { sendRedirect } from "h3";

export const useApi = () => {
  const { $api } = useNuxtApp();
  let isRefreshing = false;
  let refreshPromise: Promise<any> | null = null;

  const getCurrentUrl = () =>
    import.meta.server
      ? useRequestURL().pathname + useRequestURL().search
      : window.location.pathname + window.location.search;

  const fetchWithAuth = async <T = any>(
    url: string,
    options: any = {},
    currentUrl?: string,
  ): Promise<T> => {
    const event = import.meta.server ? useRequestEvent() : null;

    const makeRequest = () => $api<T>(url, options);

    try {
      return await makeRequest();
    } catch (err: any) {
      if (err?.response?.status !== 401) throw err;
      if (url.includes("/auth/refresh") || url.includes("/login")) throw err;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = $api("/auth/refresh", { method: "POST" })
          .catch(() => {
            if (import.meta.server && event) {
              return sendRedirect(event, "/login", 302);
            } else {
              return navigateTo("/login");
            }
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      await refreshPromise;

      if (import.meta.client) {
        return await makeRequest();
      } else {
        await sendRedirect(event!, currentUrl!, 302);
        return undefined as T;
      }
    }
  };

  return {
    get: <T = any>(url: string, options?: any) =>
      fetchWithAuth<T>(url, { method: "GET", ...options }, getCurrentUrl()),

    post: <T = any>(url: string, body?: any, options?: any) =>
      fetchWithAuth<T>(
        url,
        { method: "POST", body, ...options },
        getCurrentUrl(),
      ),

    put: <T = any>(url: string, body?: any, options?: any) =>
      fetchWithAuth<T>(
        url,
        { method: "PUT", body, ...options },
        getCurrentUrl(),
      ),

    patch: <T = any>(url: string, body?: any, options?: any) =>
      fetchWithAuth<T>(
        url,
        { method: "PATCH", body, ...options },
        getCurrentUrl(),
      ),

    del: <T = any>(url: string, options?: any) =>
      fetchWithAuth<T>(url, { method: "DELETE", ...options }, getCurrentUrl()),
  };
};
