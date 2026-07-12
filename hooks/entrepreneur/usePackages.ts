
import { packageService } from '@/src/services/entrepreneur';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// ── Keys ─────────────────────────────────────────────────────────────────────
export const PACKAGE_KEYS = {
  all:    ['packages']          as const,
  detail: (id: string) => ['packages', id] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Public: all active packages */
export const usePackages = () =>
  useQuery({
    queryKey: PACKAGE_KEYS.all,
    queryFn:  packageService.getAll,
    select:   (res) => res?.data ?? [],
  });

/** Admin or student: single package */
export const usePackage = (id: string) =>
  useQuery({
    queryKey: PACKAGE_KEYS.detail(id),
    queryFn:  () => packageService.getById(id),
    enabled:  !!id,
    select:   (res) => res?.data ?? null,
  });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreatePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: packageService.create,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: PACKAGE_KEYS.all });
      Alert.alert('Created!', `Package "${res?.data?.name}" created.`);
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useUpdatePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      packageService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: PACKAGE_KEYS.all });
      qc.invalidateQueries({ queryKey: PACKAGE_KEYS.detail(id) });
      Alert.alert('Updated!', 'Package updated successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useDeletePackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: packageService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PACKAGE_KEYS.all });
      Alert.alert('Done', 'Package deactivated.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};