
import { adService, AdSubmitInput } from '@/src/services/entrepreneur';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// ── Keys ─────────────────────────────────────────────────────────────────────
export const AD_KEYS = {
  approved:  (params?: any) => ['ads', 'approved', params]  as const,
  detail:    (id: string)   => ['ads', 'detail', id]        as const,
  mine:      ()             => ['ads', 'mine']              as const,
  adminAll:  (params?: any) => ['ads', 'admin', params]     as const,
  dashboard: ()             => ['ads', 'dashboard']         as const,
};

// ── Public queries ────────────────────────────────────────────────────────────

export const useApprovedAds = (params?: {
  category?: string;
  featured?: boolean;
  page?:     number;
  limit?:    number;
}) =>
  useQuery({
    queryKey: AD_KEYS.approved(params),
    queryFn:  () => adService.getApproved(params),
    select:   (res) => ({
      data:  res?.data  ?? [],
      total: res?.total ?? 0,
      page:  res?.page  ?? 1,
    }),
  });

export const useAdDetail = (id: string) =>
  useQuery({
    queryKey: AD_KEYS.detail(id),
    queryFn:  () => adService.getById(id),
    enabled:  !!id,
    select:   (res) => res?.data ?? null,
  });

// ── Student queries ────────────────────────────────────────────────────────────

export const useMyAds = () =>
  useQuery({
    queryKey: AD_KEYS.mine(),
    queryFn:  adService.getMyAds,
    select:   (res) => res?.data ?? [],
  });

// ── Admin queries ─────────────────────────────────────────────────────────────

export const useAdminAds = (params?: {
  status?: string;
  page?:   number;
  limit?:  number;
}) =>
  useQuery({
    queryKey: AD_KEYS.adminAll(params),
    queryFn:  () => adService.adminGetAll(params),
    select:   (res) => ({
      data:  res?.data  ?? [],
      total: res?.total ?? 0,
    }),
  });

export const useAdminDashboard = () =>
  useQuery({
    queryKey: AD_KEYS.dashboard(),
    queryFn:  adService.adminDashboard,
    select:   (res) => res?.data ?? null,
  });

// ── Student mutations ─────────────────────────────────────────────────────────

export const useSubmitAd = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdSubmitInput) => adService.submit(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: AD_KEYS.mine() });
      qc.invalidateQueries({ queryKey: ['payments', 'mine'] });
      const isFree = res?.data?.payment?.isFree;
      Alert.alert(
        'Submitted!',
        isFree
          ? 'Your ad has been submitted. Awaiting admin approval.'
          : 'Your ad has been submitted. Payment is pending verification.',
      );
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useRenewAd = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id:   string;
      data: Parameters<typeof adService.renew>[1];
    }) => adService.renew(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: AD_KEYS.mine() });
      qc.invalidateQueries({ queryKey: ['payments', 'mine'] });
      Alert.alert('Renewed!', 'Your ad renewal has been submitted.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useTrackAdClick = () =>
  useMutation({
    mutationFn: ({ id, type }: {
      id:   string;
      type: 'call' | 'whatsapp' | 'social' | 'share';
    }) => adService.trackClick(id, type),
    // silent — analytics only
  });

// ── Admin mutations ────────────────────────────────────────────────────────────

export const useAdminUpdateAd = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id:   string;
      data: Parameters<typeof adService.adminUpdateStatus>[1];
    }) => adService.adminUpdateStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['ads', 'admin'] });
      qc.invalidateQueries({ queryKey: AD_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: AD_KEYS.dashboard() });
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};