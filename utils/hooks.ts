import { useCallback, useState } from 'react';

interface IsSaveableOptions<T> {
  requestOptions?: RequestInit;
  formatBody?: (value: T) => Record<string, unknown>;
}

type SaveResponse = { error: true, message: string } | { error: false};

type UseSaveableReturnValue<T, U> = [
  (value: T) => Promise<U | null>,
  boolean,
  SaveResponse
];

export function useSaveable<T, U>(endpoint: string, canSave: boolean, options: IsSaveableOptions<T>): UseSaveableReturnValue<T, U> {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<SaveResponse>({ error: false });

  const save = useCallback(async (value: T) => {
    if (isSaving || !canSave) return null;

    setIsSaving(true);
    setError({ error: false });

    const response = await fetch(endpoint, {
      ...options.requestOptions,
      body: JSON.stringify(options.formatBody ? options.formatBody(value) : value),
    });

    const responseData = await response.json();

    setIsSaving(false);

    if (response.status === 200) return responseData as U;
    
    setError({ error: true, message: responseData.message });

    return null;
  }, [options, canSave, endpoint, isSaving]);

  return [save, isSaving, error];
}
