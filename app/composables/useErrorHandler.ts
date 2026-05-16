export const useErrorHandler = () => {
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) {
      return (
        (err as any).data?.errorMessage ??
        (err as any).data?.error ??
        err.message
      );
    }
    return "Неизвестная ошибка";
  };

  return { getErrorMessage };
};
