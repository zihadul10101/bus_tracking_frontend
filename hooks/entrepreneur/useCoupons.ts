
import { couponService } from '@/src/services/entrepreneur';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

// ── Keys ─────────────────────────────────────────────────────────────────────
export const COUPON_KEYS = {
  adminAll: (params?: any) => ['coupons', 'admin', params] as const,
  detail:   (id: string)   => ['coupons', 'detail', id]   as const,
  byCode:   (code: string) => ['coupons', 'code', code]   as const,
};

// ── Admin queries ─────────────────────────────────────────────────────────────

export const useAdminCoupons = (params?: { isActive?: boolean }) =>
  useQuery({
    queryKey: COUPON_KEYS.adminAll(params),
    queryFn:  () => couponService.adminGetAll(params),
    select:   (res) => res?.data ?? [],
  });

export const useAdminCoupon = (id: string) =>
  useQuery({
    queryKey: COUPON_KEYS.detail(id),
    queryFn:  () => couponService.adminGetById(id),
    enabled:  !!id,
    select:   (res) => res?.data ?? null,
  });

// ── Student queries ────────────────────────────────────────────────────────────

export const useCouponByCode = (code: string) =>
  useQuery({
    queryKey: COUPON_KEYS.byCode(code),
    queryFn:  () => couponService.getByCode(code),
    enabled:  code.length >= 3,
    select:   (res) => res?.data ?? null,
  });

// ── Validate (mutation because it depends on amount) ──────────────────────────

export const useValidateCoupon = () =>
  useMutation({
    mutationFn: ({ code, amount }: { code: string; amount: number }) =>
      couponService.validate(code, amount),
    // caller handles success/error
  });

// ── Admin mutations ────────────────────────────────────────────────────────────

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponService.create,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['coupons', 'admin'] });
      Alert.alert('Created!', `Coupon "${res?.data?.code}" created.`);
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      couponService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['coupons', 'admin'] });
      qc.invalidateQueries({ queryKey: COUPON_KEYS.detail(id) });
      Alert.alert('Updated!', 'Coupon updated successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coupons', 'admin'] });
      Alert.alert('Deleted', 'Coupon deleted.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err?.response?.data?.message ?? err.message);
    },
  });
};