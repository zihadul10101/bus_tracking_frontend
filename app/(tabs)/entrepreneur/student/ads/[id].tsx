import { adService } from '@/src/services/entrepreneur';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Linking, Platform,
  RefreshControl, ScrollView, Share,
  StyleSheet, Text, TouchableOpacity,
  useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE = 375;
const API_BASE_URL = 'http://192.168.0.195:5000';

export default function AdDetailScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = (n: number) => Math.min((width / BASE) * n, n * 1.4);
  const { id }    = useLocalSearchParams<{ id: string }>();

  const [ad, setAd]             = useState<any>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);

  // ✅ Ad ডিটেইল fetch করা
  // const fetchAdDetail = async (isRefresh = false) => {
  //   if (!id) return;
  //   try {
  //     isRefresh ? setIsRefetching(true) : setIsLoading(true);
  //     const res = await fetch(`${API_BASE_URL}/api/v1/entrepreneur/ads/${id}`);
  //     const data = await res.json();
  //     if (data.success) setAd(data.data);
  //   } catch (err) {
  //     console.error('fetchAdDetail error:', err);
  //   } finally {
  //     isRefresh ? setIsRefetching(false) : setIsLoading(false);
  //   }
  // };


const fetchAdDetail = async (isRefresh = false) => {
  if (!id) return;

  try {
    isRefresh ? setIsRefetching(true) : setIsLoading(true);

    const data = await adService.getById(id);

    if (data.success) {
      setAd(data.data);
    }
  } catch (err) {
    console.error('fetchAdDetail:', err);
  } finally {
    isRefresh
      ? setIsRefetching(false)
      : setIsLoading(false);
  }
};

  useEffect(() => {
    fetchAdDetail();
  }, [id]);

  // ✅ ক্লিক ট্র্যাক করা
  // const trackClick = async (type: string) => {
  //   try {
  //     const token = await AsyncStorage.getItem('userToken');
  //     await fetch(`${API_BASE_URL}/api/v1/entrepreneur/ads/${id}/click`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ type }),
  //     });
  //   } catch (err) {
  //     console.error('trackClick error:', err);
  //   }
  // };


  const trackClick = async (
  type: 'call' | 'whatsapp' | 'social' | 'share'
) => {
  if (!id) return;

  try {
    await adService.trackClick(id, type);
  } catch (err) {
    console.error('trackClick:', err);
  }
};
  const handleCall = () => {
    const phone = ad?.business?.contact?.phone;
    if (!phone) return;
    trackClick('call');
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    const wa = ad?.business?.contact?.whatsapp;
    if (!wa) return;
    trackClick('whatsapp');
    Linking.openURL(`https://wa.me/${wa}`);
  };

  const handleShare = async () => {
    trackClick('share');
    await Share.share({ message: `Check out ${ad?.business?.name} — ${ad?.title}` });
  };

  const handleSocial = (url: string) => {
    trackClick('social');
    Linking.openURL(url);
  };

  if (isLoading) return (
    <View style={styles.container}>
      <View style={styles.centered}><ActivityIndicator size="large" color="#2D60FF" /></View>
    </View>
  );

  if (!ad) return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color="#E53935" />
        <Text style={styles.emptyText}>Ad not found</Text>
      </View>
    </View>
  );

  const biz = ad.business;
  console.log("biz ",biz);
  

  const SocialBtn = ({ url, icon, color, label }: any) =>
    url ? (
      <TouchableOpacity
        style={[styles.socialBtn, { backgroundColor: color + '15', borderRadius: s(10) }]}
        onPress={() => handleSocial(url)}
      >
        <Ionicons name={icon} size={s(20)} color={color} />
        <Text style={[styles.socialLabel, { color, fontSize: s(11) }]}>{label}</Text>
      </TouchableOpacity>
    ) : null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => fetchAdDetail(true)} colors={['#2D60FF']} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { borderRadius: s(16) }]}>
          {ad.isFeatured && (
            <View style={styles.featBadge}>
              <Ionicons name="star" size={s(12)} color="#fff" />
              <Text style={[styles.featBadgeText, { fontSize: s(11) }]}>Featured</Text>
            </View>
          )}
          <View style={[styles.heroIcon, { width: s(64), height: s(64), borderRadius: s(16) }]}>
            <Ionicons name="megaphone" size={s(30)} color="#2D60FF" />
          </View>
          <Text style={[styles.adTitle, { fontSize: s(18) }]}>{ad.title}</Text>
          {ad.shortDescription && (
            <Text style={[styles.adDesc, { fontSize: s(13) }]}>{ad.shortDescription}</Text>
          )}
          <View style={styles.statsRow}>
            {[
              { icon: 'eye-outline',         val: ad.views,          label: 'Views'    },
              { icon: 'call-outline',         val: ad.callClicks,     label: 'Calls'    },
              { icon: 'logo-whatsapp',        val: ad.whatsappClicks, label: 'WhatsApp' },
              { icon: 'share-social-outline', val: ad.shareCount,     label: 'Shares'   },
            ].map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Ionicons name={stat.icon as any} size={s(13)} color="#2D60FF" />
                <Text style={[styles.statVal,   { fontSize: s(12) }]}>{stat.val}</Text>
                <Text style={[styles.statLabel, { fontSize: s(10) }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { borderRadius: s(14) }]}>
          <View style={styles.bizTop}>
            <View style={[styles.bizIcon, { width: s(48), height: s(48), borderRadius: s(12) }]}>
              <Ionicons name="storefront" size={s(22)} color="#2D60FF" />
            </View>
            <View style={{ flex: 1, marginLeft: s(12) }}>
              <View style={styles.bizNameRow}>
                <Text style={[styles.bizName, { fontSize: s(15) }]}>{biz?.name}</Text>
                {biz?.isVerified && <Ionicons name="checkmark-circle" size={s(16)} color="#2D60FF" />}
              </View>
              <Text style={[styles.bizCategory, { fontSize: s(12) }]}>{biz?.category}</Text>
            </View>
            <TouchableOpacity style={[styles.viewBizBtn, { borderRadius: s(10) }]}
              onPress={() => router.push(`/(tabs)/entrepreneur/student/businesses/${biz?._id}` as any)}>
              <Text style={[styles.viewBizText, { fontSize: s(11) }]}>View →</Text>
            </TouchableOpacity>
          </View>
          {biz?.description && (
            <Text style={[styles.bizDesc, { fontSize: s(12) }]} numberOfLines={3}>{biz.description}</Text>
          )}
          {biz?.averageRating > 0 && (
            <View style={styles.ratingRow}>
              {[1,2,3,4,5].map((i) => (
                <Ionicons key={i}
                  name={i <= Math.round(biz.averageRating) ? 'star' : 'star-outline'}
                  size={s(13)} color="#FFB800" />
              ))}
              <Text style={[styles.ratingText, { fontSize: s(12) }]}>{biz.averageRating}</Text>
            </View>
          )}
        </View>

        <View style={[styles.section, { borderRadius: s(14) }]}>
          <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Contact</Text>
          <View style={styles.contactRow}>
            {biz?.contact?.phone && (
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#E8F5E9', borderRadius: s(12), flex: 1 }]} onPress={handleCall}>
                <Ionicons name="call" size={s(18)} color="#4CAF50" />
                <Text style={[styles.contactBtnText, { color: '#4CAF50', fontSize: s(13) }]}>Call</Text>
              </TouchableOpacity>
            )}
            {biz?.contact?.whatsapp && (
              <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#E8F5E9', borderRadius: s(12), flex: 1 }]} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={s(18)} color="#25D366" />
                <Text style={[styles.contactBtnText, { color: '#25D366', fontSize: s(13) }]}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#EEF2FF', borderRadius: s(12), flex: 1 }]} onPress={handleShare}>
              <Ionicons name="share-social" size={s(18)} color="#2D60FF" />
              <Text style={[styles.contactBtnText, { color: '#2D60FF', fontSize: s(13) }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {biz?.socialLinks && Object.values(biz.socialLinks).some(Boolean) && (
          <View style={[styles.section, { borderRadius: s(14) }]}>
            <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Follow</Text>
            <View style={styles.socialRow}>
              <SocialBtn url={biz.socialLinks?.facebook}  icon="logo-facebook"  color="#1877F2" label="Facebook" />
              <SocialBtn url={biz.socialLinks?.instagram} icon="logo-instagram" color="#E1306C" label="Instagram" />
              <SocialBtn url={biz.socialLinks?.twitter}   icon="logo-twitter"   color="#1DA1F2" label="Twitter" />
              <SocialBtn url={biz.socialLinks?.youtube}   icon="logo-youtube"   color="#FF0000" label="YouTube" />
              <SocialBtn url={biz.socialLinks?.website}   icon="globe-outline"  color="#2D60FF" label="Website" />
            </View>
          </View>
        )}

        {(biz?.location?.city || biz?.location?.area) && (
          <View style={[styles.section, { borderRadius: s(14) }]}>
            <Text style={[styles.sectionTitle, { fontSize: s(14) }]}>Location</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={s(16)} color="#E53935" />
              <Text style={[styles.locationText, { fontSize: s(13) }]}>
                {[biz.location.area, biz.location.city].filter(Boolean).join(', ')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F3F5F7' },
  scroll:         { padding: 16 },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  emptyText:      { color: '#aaa', fontSize: 14 },
  heroCard:       { backgroundColor: '#fff', padding: 20, marginBottom: 14, alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.07, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8 }, android: { elevation: 3 } }) },
  featBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFB800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  featBadgeText:  { color: '#fff', fontWeight: '700' },
  heroIcon:       { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  adTitle:        { fontWeight: '800', color: '#1A1A2E', textAlign: 'center', lineHeight: 26, marginBottom: 8 },
  adDesc:         { color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  statsRow:       { flexDirection: 'row', gap: 16 },
  stat:           { alignItems: 'center', gap: 2 },
  statVal:        { fontWeight: '700', color: '#1A1A2E' },
  statLabel:      { color: '#aaa' },
  section:        { backgroundColor: '#fff', padding: 16, marginBottom: 14, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5 }, android: { elevation: 1 } }) },
  sectionTitle:   { fontWeight: '700', color: '#1A1A2E', marginBottom: 12 },
  bizTop:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bizIcon:        { backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  bizNameRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  bizName:        { fontWeight: '700', color: '#1A1A2E' },
  bizCategory:    { color: '#888', marginTop: 3, textTransform: 'capitalize' },
  viewBizBtn:     { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 7 },
  viewBizText:    { color: '#2D60FF', fontWeight: '600' },
  bizDesc:        { color: '#666', lineHeight: 18 },
  ratingRow:      { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 8 },
  ratingText:     { color: '#888', marginLeft: 4 },
  contactRow:     { flexDirection: 'row', gap: 10 },
  contactBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  contactBtnText: { fontWeight: '700' },
  socialRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  socialBtn:      { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  socialLabel:    { fontWeight: '600' },
  locationRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  locationText:   { color: '#444', fontWeight: '500' },
});