import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';

import {
  Animated, Dimensions, Easing, Image,
  Platform, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle, Defs, Ellipse,
  Stop,
  RadialGradient as SvgRadialGradient,
} from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ⏱️ এই স্ক্রিন কতক্ষণ দেখানো হবে, তারপর সরাসরি login screen-এ যাবে
const DISPLAY_DURATION = 1000;

// 🖼️ Southern University লোগো
const LOGO_SOURCE = require('../assets/images/university-logo.png');

// ✅ ছোট স্ক্রিনে বড় radius overflow না হওয়ার জন্য একটা max cap
const MAX_ORBIT_RADIUS = Math.min(SCREEN_W, SCREEN_H) / 2 - 20;

// ✅ প্রতিটা ডিপার্টমেন্ট একটা "গ্রহ"-এর মতো, কেন্দ্রের লোগো ঘিরে সম্পূর্ণ বৃত্তাকারে ঘুরবে
const DEPARTMENTS = [
  { key: 'cse',   label: 'CSE',   colorLight: '#8FD8FF', colorDark: '#1E6FA8', radius: 90,  size: 46, duration: 12000, hasRing: false },
  { key: 'eee',   label: 'EEE',   colorLight: '#FFD9A0', colorDark: '#B36A2E', radius: 118, size: 34, duration: 15000, hasRing: false },
  { key: 'bba',   label: 'BBA',   colorLight: '#FFF0B0', colorDark: '#C79A2E', radius: 146, size: 42, duration: 18000, hasRing: false },
  { key: 'law',   label: 'LLB',   colorLight: '#F0A882', colorDark: '#9C3D1E', radius: 174, size: 38, duration: 21000, hasRing: false },
  { key: 'eng',   label: 'ENG',   colorLight: '#E4D2C0', colorDark: '#8A6E52', radius: 200, size: 62, duration: 24000, hasRing: false },
  { key: 'arch',  label: 'ARCH',  colorLight: '#F0DCA8', colorDark: '#A87F3C', radius: 228, size: 54, duration: 27000, hasRing: true, ringColor: '#D8C08A' },
  { key: 'civil', label: 'CE',    colorLight: '#A8E8F0', colorDark: '#3E9AA8', radius: 254, size: 44, duration: 30000, hasRing: true, ringColor: '#BFEFF5' },
  { key: 'eco',   label: 'ECO',   colorLight: '#7C9CE8', colorDark: '#2E3E9C', radius: 278, size: 40, duration: 33000, hasRing: false },
  { key: 'pharm', label: 'PHARM', colorLight: '#C8C8C8', colorDark: '#6A6A6A', radius: 300, size: 26, duration: 36000, hasRing: false },
].map((d) => ({ ...d, radius: Math.min(d.radius, MAX_ORBIT_RADIUS) }));

export default function WelcomeAnimationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const sunPulse  = useRef(new Animated.Value(0)).current;
  const orbitAnims = useRef(DEPARTMENTS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(sunPulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    orbitAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.timing(anim, {
          toValue: 1,
          duration: DEPARTMENTS[i].duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      ).start();
    });


    const timer = setTimeout(() => {
      router.replace('/(auth)');
    }, DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const sunScale = sunPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const sunGlowOpacity = sunPulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.85] });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#05061A', '#0A0E2E', '#05061A']}
        style={StyleSheet.absoluteFillObject}
      />

      <StarField />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.orbitStage}>
          {DEPARTMENTS.map((dept, i) => {
            const rotate = orbitAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
            const counterRotate = orbitAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });
            const diameter = dept.radius * 2;

            return (
              <React.Fragment key={dept.key}>
                {/* ✅ orbit path — flexbox centering-এর বদলে left:50%+marginLeft ব্যবহার করে
                    সরাসরি stage-এর কেন্দ্রে বসানো হচ্ছে, তাই বৃত্তটা সবসময় নিখুঁত center-এ থাকে */}
                <View
                  pointerEvents="none"
                  style={[
                    styles.orbitPath,
                    {
                      width: diameter,
                      height: diameter,
                      borderRadius: dept.radius,
                      left: '50%',
                      top: '50%',
                      marginLeft: -dept.radius,
                      marginTop: -dept.radius,
                    },
                  ]}
                />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.orbitRotator,
                    {
                      width: diameter,
                      height: diameter,
                      borderRadius: dept.radius,
                      left: '50%',
                      top: '50%',
                      marginLeft: -dept.radius,
                      marginTop: -dept.radius,
                      transform: [{ rotate }],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.planetSlot,
                      { top: -dept.size / 2, left: dept.radius - dept.size / 2 },
                    ]}
                  >
                    <Animated.View style={{ transform: [{ rotate: counterRotate }], alignItems: 'center' }}>
                      <Planet3D
                        size={dept.size}
                        colorLight={dept.colorLight}
                        colorDark={dept.colorDark}
                        hasRing={dept.hasRing}
                        ringColor={dept.ringColor}
                      />
                      <Text style={styles.planetLabel}>{dept.label}</Text>
                    </Animated.View>
                  </View>
                </Animated.View>
              </React.Fragment>
            );
          })}

          {/* ✅ কেন্দ্রে Southern University-এর আসল লোগো */}
          <Animated.View style={[styles.sunGlow, { opacity: sunGlowOpacity, transform: [{ scale: sunScale }] }]} />
          <Animated.View style={[styles.sun, { transform: [{ scale: sunScale }] }]}>
            <Image source={LOGO_SOURCE} style={styles.logoImage} resizeMode="cover" />
          </Animated.View>
        </View>

        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.title}>Southern University Bangladesh</Text>
          <Text style={styles.subtitle}>
            Discover courses, connect with peers, and orbit through everything your campus offers.
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

function Planet3D({
  size, colorLight, colorDark, hasRing, ringColor,
}: {
  size: number; colorLight: string; colorDark: string; hasRing?: boolean; ringColor?: string;
}) {
  const gradId = `grad-${colorLight.replace('#', '')}`;
  const stageSize = hasRing ? size * 2 : size;

  return (
    <View style={{ width: stageSize, height: stageSize, alignItems: 'center', justifyContent: 'center' }}>
      {hasRing && (
        <Svg width={stageSize} height={stageSize} style={StyleSheet.absoluteFillObject}>
          <Ellipse
            cx={stageSize / 2}
            cy={stageSize / 2}
            rx={stageSize / 2 - 2}
            ry={stageSize * 0.26}
            stroke={ringColor}
            strokeWidth={Math.max(2, size * 0.09)}
            fill="none"
            opacity={0.85}
            rotation={-18}
            origin={`${stageSize / 2}, ${stageSize / 2}`}
          />
        </Svg>
      )}
      <Svg width={size} height={size}>
        <Defs>
          <SvgRadialGradient id={gradId} cx="35%" cy="32%" r="70%">
            <Stop offset="0%" stopColor={colorLight} stopOpacity={1} />
            <Stop offset="55%" stopColor={colorDark} stopOpacity={1} />
            <Stop offset="100%" stopColor="#000000" stopOpacity={0.55} />
          </SvgRadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={`url(#${gradId})`} />
      </Svg>
    </View>
  );
}

function StarField() {
  const stars = useRef(
    Array.from({ length: 60 }).map(() => ({
      x: Math.random() * SCREEN_W,
      y: Math.random() * SCREEN_H,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.2,
    }))
  ).current;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {stars.map((star, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#fff',
            opacity: star.opacity,
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05061A' },
  content:   { flex: 1, alignItems: 'center', justifyContent: 'space-between' },

  orbitStage: {
    flex: 1,
    width: SCREEN_W,
    position: 'relative',
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },

  orbitPath: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  orbitRotator: {
    position: 'absolute',
  },
  planetSlot: {
    position: 'absolute',
  },
  planetLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  sunGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    left: '50%',
    top: '50%',
    marginLeft: -75,
    marginTop: -75,
    backgroundColor: '#3E7BFF',
  },
  sun: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    left: '50%',
    top: '50%',
    marginLeft: -50,
    marginTop: -50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      ios:     { shadowColor: '#3E7BFF', shadowOpacity: 0.9, shadowOffset: { width: 0, height: 0 }, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },

  bottomSection: {
    width: '100%',
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
});