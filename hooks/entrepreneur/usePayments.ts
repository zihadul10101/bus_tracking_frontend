
import { paymentService } from '@/src/services/entrepreneur';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// ── Keys ─────────────────────────────────────────────────────────────────────
export const PAYMENT_KEYS = {
  mine:     ()             => ['payments', 'mine']          as const,
  adminAll: (params?: any) => ['payments', 'admin', params] as const,
  revenue:  (year?: number)=> ['payments', 'revenue', year] as const,
};

// ── Student queries ────────────────────────────────────────────────────────────

export const useMyPayments = () =>
  useQuery({
    queryKey: PAYMENT_KEYS.mine(),
    queryFn:  paymentService.getMyPayments,
    select:   (res) => res?.data ?? [],
  });

// ── Admin queries ─────────────────────────────────────────────────────────────

export const useAdminPayments = (params?: {
  status?: 'pending' | 'verified' | 'rejected' | 'refunded';
  page?:   number;
  limit?:  number;
}) =>
  useQuery({
    queryKey: PAYMENT_KEYS.adminAll(params),
    queryFn:  () => paymentService.adminGetAll(params),
    select:   (res) => ({
      data:  res?.data  ?? [],
      total: res?.total ?? 0,
    }),
  });

export const useAdminRevenue = (year?: number) =>
  useQuery({
    queryKey: PAYMENT_KEYS.revenue(year),
    queryFn:  () => paymentService.adminRevenue({ year }),
    select:   (res) => ({
      totalRevenue: res?.totalRevenue ?? 0,
      totalOrders:  res?.totalOrders  ?? 0,
      monthly:      res?.monthly      ?? [],
      year:         res?.year,
    }),
  });

// ── Admin mutations ────────────────────────────────────────────────────────────

export const useAdminVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id:   string;
      data: Parameters<typeof paymentService.adminVerify>[1];
    }) => paymentService.adminVerify(id, data),
    onSuccess: (res, { data }) => {
      qc.invalidateQueries({ queryKey: ['payments', 'admin'] });
      qc.invalidateQueries({ queryKey: ['ads', 'admin'] });
      qc.invalidateQueries({ queryKey: ['ads', 'dashboard'] });
      Alert.alert(
        data.status === 'verified' ? '✅ Verified' : '❌ Rejected',
        data.status === 'verified'
          ? 'Payment verified. Ad is now pending admin ad-review.'
          : 'Payment has been rejected.',
      );
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};