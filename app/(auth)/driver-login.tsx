import { driverService } from '@/src/services/driverService';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Lock, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');




export default function DriverLoginScreen() {
    const router = useRouter();
    const [loginName, setLoginName] = useState('');
    const [password, setPassword] = useState('');
    const [secureText, setSecureText] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleDriverLogin = async () => {
        if (!loginName || !password) {
            Alert.alert(
                "Required",
                "Please enter driver ID and password"
            );
            return;
        }

        try {
            setLoading(true);

            const result = await driverService.login(
                loginName.trim(),
                password
            );
            console.log("driver res", result);


            if (!result.success) {
                Alert.alert(
                    "Login Failed",
                    result.message
                );
                return;
            }

            Alert.alert(
                "Success!",
                `Welcome back, ${result.data.name}`,
                [
                    {
                        text: "OK",
                        onPress: () =>
                            router.replace("/(tabs)/home"),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                "Network Error",
                error.response?.data?.message ??
                "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Deep University Blue Header Section */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Driver Portal</Text>
                <Text style={styles.headerSubtitle}>Enter your credentials to start your trip</Text>
            </View>

            {/* Floating Card UI Element */}
            <View style={styles.formCardContainer}>
                <View style={styles.formCard}>

                    {/* Driver ID Input */}
                    <Text style={styles.inputLabel}>Driver ID / Login Name</Text>
                    <View style={styles.inputWrapper}>
                        <User size={20} color="#9ca3af" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Enter login name"
                            placeholderTextColor="#9ca3af"
                            style={styles.inputField}
                            value={loginName}
                            onChangeText={setLoginName}
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Security Password Input */}
                    <Text style={styles.inputLabel}>Security Password</Text>
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
                        />
                        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                            {secureText ? <Eye size={20} color="#6b7280" /> : <EyeOff size={20} color="#6b7280" />}
                        </TouchableOpacity>
                    </View>

                    {/* Start Session Action Button */}
                    <TouchableOpacity
                        style={[styles.primaryButton, loading && styles.buttonDisabled]}
                        onPress={handleDriverLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Start Session</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(auth)')} style={styles.footerLinkRow}>
                        <Text style={styles.footerText}>Regular user login? </Text>
                        <Text style={styles.linkText}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#004b8d'
    },
    headerContainer: {
        height: height * 0.32,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 30
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 16
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 8
    },
    formCardContainer: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 20
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 10,
        marginTop: 14
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 56
    },
    inputIcon: {
        marginRight: 12
    },
    inputField: {
        flex: 1,
        color: '#1f2937',
        fontSize: 15
    },
    primaryButton: {
        backgroundColor: '#004b8d',
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    footerLinkRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: Platform.OS === 'ios' ? 10 : 0
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14
    },
    linkText: {
        color: '#004b8d',
        fontWeight: 'bold',
        fontSize: 14
    }
});