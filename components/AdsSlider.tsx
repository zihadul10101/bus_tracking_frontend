import { adService } from '@/src/services/entrepreneur';
import { Ad } from '@/src/services/entrepreneur/ad.service';
import { LinearGradient } from 'expo-linear-gradient'; // already common in Expo apps — install via `npx expo install expo-linear-gradient` if missing
import { useRouter } from 'expo-router';
import { Megaphone, MessageCircle, Phone, Sparkles } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth - 64; // leaves a peek of the next card on both sides
const CARD_SPACING = 14;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
const AUTO_SCROLL_MS = 4500;

const FALLBACK_GRADIENT = ['#60a5fa', '#3b82f6', '#1e3a8a'] as const;


function getImageUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Record<string, any>;
    return obj.url || obj.secure_url || obj.uri || undefined;
  }
  return undefined;
}

export default function AdsSlider() {
  const router = useRouter();
  const listRef = useRef<FlatList<Ad>>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // ── Fetch ads ──────────────────────────────────────────────────────────
  const loadAds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adService.getApproved({ limit: 10 });
      const list: Ad[] = response?.ads || response?.data || response || [];
      setAds(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error loading ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAds();
  }, [loadAds]);

  // ── Auto-scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (ads.length <= 1) return;

    autoScrollTimer.current = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % ads.length;
      listRef.current?.scrollToOffset({
        offset: nextIndex * SNAP_INTERVAL,
        animated: true,
      });
      currentIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }, AUTO_SCROLL_MS);

    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [ads.length]);

  const pauseAutoScroll = () => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    currentIndexRef.current = index;
    setActiveIndex(index);
  };

  // ── Actions ────────────────────────────────────────────────────────────
  const handleCall = async (ad: Ad) => {
    if (!ad.contactPhone) return;
    adService.trackClick(ad._id, 'call').catch(() => {});
    Linking.openURL(`tel:${ad.contactPhone}`);
  };

  const handleWhatsapp = async (ad: Ad) => {
    if (!ad.whatsappNumber) return;
    adService.trackClick(ad._id, 'whatsapp').catch(() => {});
    Linking.openURL(`https://wa.me/${ad.whatsappNumber.replace(/[^0-9]/g, '')}`);
  };

  const openAdDetails = (ad: Ad) => {
    router.push(`/(tabs)/entrepreneur/student/ads/${ad._id}` as any);
  };

  // ── States ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (ads.length === 0) {
    return null; // nothing to show — keep the home screen clean
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Student Entrepreneur</Text>
      </View>

      <FlatList
        ref={listRef}
        data={ads}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onTouchStart={pauseAutoScroll}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => openAdDetails(item)}
          >
            {getImageUrl(item.image) ? (
              <Image
                source={{ uri: getImageUrl(item.image) }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={FALLBACK_GRADIENT}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardImage}
              >
                {/* decorative translucent circles for depth, not literal content */}
                <View style={styles.decorCircleLarge} />
                <View style={styles.decorCircleSmall} />
                <View style={styles.fallbackIconWrap}>
                  <Megaphone size={46} color="rgba(255,255,255,0.28)" strokeWidth={1.5} />
                </View>
              </LinearGradient>
            )}

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.78)']}
              style={styles.gradientOverlay}
            />

            {item.isFeatured && (
              <View style={styles.featuredBadge}>
                <Sparkles size={11} color="#78350f" />
                <Text style={styles.featuredBadgeText}>ফিচার্ড</Text>
              </View>
            )}

            <View style={styles.cardContent}>
              {item.business?.name && (
                <View style={styles.businessRow}>
                  {getImageUrl(item.business.logo) ? (
                    <Image source={{ uri: getImageUrl(item.business.logo) }} style={styles.businessLogo} />
                  ) : (
                    <View style={styles.businessLogoFallback}>
                      <Text style={styles.businessLogoFallbackText}>
                        {item.business.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.businessName} numberOfLines={1}>
                    {item.business.name}
                  </Text>
                </View>
              )}

              <Text style={styles.adTitle} numberOfLines={1}>
                {item.title}
              </Text>

              {!!item.shortDescription && (
                <Text style={styles.adDescription} numberOfLines={2}>
                  {item.shortDescription}
                </Text>
              )}

              <View style={styles.actionRow}>
                {!!item.contactPhone && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.callBtn]}
                    onPress={() => handleCall(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Phone size={14} color="#ffffff" />
                    <Text style={styles.actionBtnText}>কল</Text>
                  </TouchableOpacity>
                )}
                {!!item.whatsappNumber && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.whatsappBtn]}
                    onPress={() => handleWhatsapp(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MessageCircle size={14} color="#ffffff" />
                    <Text style={styles.actionBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ── Pagination dots ── */}
      {ads.length > 1 && (
        <View style={styles.dotsRow}>
          {ads.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  loadingBox: { height: 220, justifyContent: 'center', alignItems: 'center' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.2,
  },

  card: {
    width: CARD_WIDTH,
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackIconWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorCircleLarge: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -50,
    right: -40,
  },
  decorCircleSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -20,
    left: -20,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fde68a',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#78350f',
  },

  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  businessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  businessLogo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  businessLogoFallback: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessLogoFallbackText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
  },
  businessName: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    flexShrink: 1,
  },

  adTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 3,
  },
  adDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
    marginBottom: 10,
  },

  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  callBtn: { backgroundColor: '#2563eb' },
  whatsappBtn: { backgroundColor: '#16a34a' },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#2563eb',
  },
});