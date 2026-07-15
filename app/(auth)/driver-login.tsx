import { useApp } from '@/src/context/AppContext';
import { driverService } from '@/src/services/driverService';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, IdCard, Lock } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function DriverLoginScreen() {
    const router = useRouter();
    const { login } = useApp();

    const [driverId, setDriverId] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const scrollRef = useRef<ScrollView>(null);

    // Animation refs
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const inputsTranslateY = useRef(new Animated.Value(24)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(inputsTranslateY, {
                toValue: 0,
                friction: 8,
                tension: 60,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();
    };

    const handleDriverLogin = async () => {
        if (!driverId || !password) {
            Alert.alert('Required', 'Please enter Driver ID and password');
            return;
        }

        try {
            setLoading(true);

            const result = await driverService.login(driverId.trim(), password);

            if (!result.success) {
                Alert.alert('Login Failed', result.message);
                return;
            }

            await login(result.data, result.token, 'driver');

            Alert.alert('Success!', `Welcome back, ${result.data.name}`, [
                { text: 'OK', onPress: () => router.replace('/(tabs)/home') },
            ]);
        } catch (error: any) {
            Alert.alert(
                'Network Error',
                error.response?.data?.message ?? 'Unable to connect to server.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <LinearGradient
                        colors={['#2563EB', '#1D4ED8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    >
                        <SafeAreaView edges={['top']}>
                            <View style={styles.headerContainer}>
                                <Pressable
                                    style={styles.backButton}
                                    onPress={() => router.back()}
                                    hitSlop={12}
                                >
                                    <ArrowLeft size={24} color="#fff" />
                                </Pressable>

                                <Text style={styles.headerTitle}>Driver Login</Text>
                                <Text style={styles.headerSubtitle}>
                                    Login to start your route and share live location.
                                </Text>
                            </View>
                        </SafeAreaView>
                    </LinearGradient>

                    {/* White Card */}
                    <View style={styles.formCardContainer}>
                        <Animated.View
                            style={[
                                styles.formCard,
                                { opacity: cardOpacity },
                            ]}
                        >
                            <Animated.View style={{ transform: [{ translateY: inputsTranslateY }] }}>
                                {/* Driver ID */}
                                <Text style={styles.inputLabel}>Driver ID</Text>
                                <View style={styles.inputWrapper}>
                                    <IdCard size={20} color="#9ca3af" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter Driver ID"
                                        placeholderTextColor="#9ca3af"
                                        style={styles.inputField}
                                        value={driverId}
                                        onChangeText={setDriverId}
                                        autoCapitalize="none"
                                        editable={!loading}
                                        returnKeyType="next"
                                    />
                                </View>

                                {/* Password */}
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={styles.inputWrapper}>
                                    <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="••••••••"
                                        placeholderTextColor="#9ca3af"
                                        secureTextEntry={secureText}
                                        style={styles.inputField}
                                        value={password}
                                        onChangeText={setPassword}
                                        autoCapitalize="none"
                                        editable={!loading}
                                        returnKeyType="done"
                                        onSubmitEditing={handleDriverLogin}
                                        onFocus={() => {
                                            setTimeout(() => {
                                                scrollRef.current?.scrollToEnd({ animated: true });
                                            }, 100);
                                        }}
                                    />
                                    <Pressable onPress={() => setSecureText(!secureText)} hitSlop={10}>
                                        {secureText ? (
                                            <EyeOff size={20} color="#9ca3af" />
                                        ) : (
                                            <Eye size={20} color="#9ca3af" />
                                        )}
                                    </Pressable>
                                </View>

                                {/* Remember Me / Forgot Password */}
                          

                                {/* Login Button */}
                                <Animated.View
                                    style={[
                                        styles.buttonWrapper,
                                        { transform: [{ scale: buttonScale }] },
                                    ]}
                                >
                                    <Pressable
                                        style={[
                                            styles.primaryButton,
                                            loading && styles.buttonDisabled,
                                        ]}
                                        onPress={handleDriverLogin}
                                        onPressIn={handlePressIn}
                                        onPressOut={handlePressOut}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.buttonText}>Login as Driver</Text>
                                        )}
                                    </Pressable>
                                </Animated.View>

                                {/* Back to Student Login */}
                                <Pressable
                                    style={styles.backToStudentRow}
                                    onPress={() => router.push('/(auth)')}
                                    hitSlop={8}
                                >
                                    <Text style={styles.linkText}>Back to Student Login</Text>
                                </Pressable>
                            </Animated.View>
                        </Animated.View>

                        {/* Extra Bottom Section */}
                        <View style={styles.tripSection}>
                            <View style={styles.divider} />
                            <View style={styles.tripRow}>
                                <Text style={styles.tripEmoji}>🚍</Text>
                                <Text style={styles.tripTitle}>Ready for today&apos;s trip?</Text>
                            </View>
                            <Text style={styles.tripSubtitle}>
                                Please login before starting live location sharing.
                            </Text>
                        </View>

                        {/* Footer */}
                        <View style={styles.versionFooter}>
                            <Text style={styles.versionText}>Version 1.0</Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1D4ED8' },
    scrollContent: { flexGrow: 1 },

    headerGradient: { paddingBottom: 48 },
    headerContainer: {
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 24,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: {
        fontSize: 15,
        color: '#e5e7eb',
        marginTop: 8,
        lineHeight: 20,
    },

    formCardContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 16,
        paddingTop: 20,
        marginTop: -30,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 24,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
    },

    inputLabel: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 56,
        marginBottom: 16,
    },
    inputIcon: { marginRight: 12 },
    inputField: { flex: 1, color: '#1f2937', fontSize: 15 },

    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    rememberRow: { flexDirection: 'row', alignItems: 'center' },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    checkboxChecked: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    checkboxDot: { width: 8, height: 8, borderRadius: 2, backgroundColor: '#fff' },
    rememberText: { color: '#6b7280', fontSize: 14 },
    forgotPasswordText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },

    buttonWrapper: { marginTop: 24 },
    primaryButton: {
        backgroundColor: '#2563EB',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: { backgroundColor: '#9ca3af' },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },

    backToStudentRow: { alignItems: 'center', marginTop: 20 },
    linkText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },

    tripSection: { alignItems: 'center', marginTop: 32, paddingHorizontal: 24 },
    divider: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#d1d5db',
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    tripRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    tripEmoji: { fontSize: 18, marginRight: 8 },
    tripTitle: { color: '#1f2937', fontWeight: '600', fontSize: 15 },
    tripSubtitle: { color: '#6b7280', fontSize: 13, textAlign: 'center' },

    versionFooter: { alignItems: 'center', marginTop: 32, marginBottom: 24 },
    versionText: { color: '#9ca3af', fontSize: 12 },
});