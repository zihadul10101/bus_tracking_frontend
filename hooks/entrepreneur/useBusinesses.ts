
import { BusinessCreateInput, businessService } from '@/src/services/entrepreneur';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// ── Keys ─────────────────────────────────────────────────────────────────────
export const BUSINESS_KEYS = {
  all:       (params?: any) => ['businesses', 'public', params]  as const,
  mine:      ()             => ['businesses', 'mine']            as const,
  adminAll:  (params?: any) => ['businesses', 'admin', params]   as const,
  detail:    (id: string)   => ['businesses', 'detail', id]      as const,
};

// ── Public queries ────────────────────────────────────────────────────────────

export const usePublicBusinesses = (params?: {
  category?: string;
  search?:   string;
  featured?: boolean;
  page?:     number;
  limit?:    number;
  sortBy?:   string;
}) =>
  useQuery({
    queryKey: BUSINESS_KEYS.all(params),
    queryFn:  () => businessService.getAll(params),
    select:   (res) => ({
      data:  res?.data  ?? [],
      total: res?.total ?? 0,
      page:  res?.page  ?? 1,
    }),
  });

export const useBusinessDetail = (id: string) =>
  useQuery({
    queryKey: BUSINESS_KEYS.detail(id),
    queryFn:  () => businessService.getById(id),
    enabled:  !!id,
    select:   (res) => res?.data ?? null,
  });

// ── Student queries ────────────────────────────────────────────────────────────

export const useMyBusinesses = () =>
  useQuery({
    queryKey: BUSINESS_KEYS.mine(),
    queryFn:  businessService.getMyBusinesses,
    select:   (res) => res?.data ?? [],
  });

// ── Admin queries ─────────────────────────────────────────────────────────────

export const useAdminBusinesses = (params?: {
  status?: string;
  page?:   number;
  limit?:  number;
}) =>
  useQuery({
    queryKey: BUSINESS_KEYS.adminAll(params),
    queryFn:  () => businessService.adminGetAll(params),
    select:   (res) => ({
      data:  res?.data  ?? [],
      total: res?.total ?? 0,
    }),
  });

// ── Student mutations ─────────────────────────────────────────────────────────

export const useCreateBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BusinessCreateInput) => businessService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.mine() });
      Alert.alert('Submitted!', 'Your business has been submitted for admin review.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useUpdateBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusinessCreateInput> }) =>
      businessService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.mine() });
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.detail(id) });
      Alert.alert('Updated!', 'Business updated and sent for re-review.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useDeleteBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => businessService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.mine() });
      Alert.alert('Deleted', 'Business deleted successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useAddRating = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating, review }: { id: string; rating: number; review?: string }) =>
      businessService.addRating(id, rating, review),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.detail(id) });
      Alert.alert('Thank you!', 'Your rating has been submitted.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useTrackBusinessClick = () =>
  useMutation({
    mutationFn: (id: string) => businessService.trackClick(id),
    // silent — no alert needed for analytics
  });

// ── Admin mutations ────────────────────────────────────────────────────────────

export const useAdminUpdateBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id:   string;
      data: Parameters<typeof businessService.adminUpdateStatus>[1];
    }) => businessService.adminUpdateStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['businesses', 'admin'] });
      qc.invalidateQueries({ queryKey: BUSINESS_KEYS.detail(id) });
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};