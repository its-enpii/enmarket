'use server';

import { getTranslations } from 'next-intl/server';
import { ApiRequestError, apiPost } from '@/lib/api';

export interface CustomBuildFormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitCustomRequestAction(
  _prev: CustomBuildFormState,
  formData: FormData,
): Promise<CustomBuildFormState> {
  const t = await getTranslations('customBuild');

  const payload = {
    nama: formData.get('nama')?.toString() ?? '',
    email: formData.get('email')?.toString() ?? '',
    wa: formData.get('wa')?.toString() ?? '',
    jenis_proyek: formData.get('jenis_proyek')?.toString() ?? '',
    deskripsi: formData.get('deskripsi')?.toString() ?? '',
    budget_range: formData.get('budget_range')?.toString() ?? '',
    timeline: formData.get('timeline')?.toString() ?? '',
  };

  try {
    await apiPost<{ success: boolean; request_id: number }>('/api/custom-requests', payload);
    return { success: true };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return {
        error: err.body?.message ?? t('errorGeneric'),
        fieldErrors: err.body?.errors,
      };
    }
    return { error: t('errorGeneric') };
  }
}
