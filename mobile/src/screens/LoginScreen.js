/**
 * LoginScreen
 * Business owner login with phone and password
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import FlashMessage from '../components/FlashMessage';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        // Validation
        if (!phone.trim() || !password.trim()) {
            setError('Please enter phone number and password');
            return;
        }

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await login(phone, password);

        setLoading(false);

        if (!result.success) {
            setError(result.error);
        }
        // If successful, navigation happens automatically via AuthContext
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Title */}
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue to Ekthaa Business</Text>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                    <FontAwesome name="phone" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number (10 digits)"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={phone}
                        onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                        keyboardType="phone-pad"
                        maxLength={10}
                        autoCapitalize="none"
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <FontAwesome name="lock" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <FontAwesome
                            name={showPassword ? 'eye' : 'eye-slash'}
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.loginButtonText}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerLink}>Register</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Error Message */}
            {error && (
                <FlashMessage
                    type="error"
                    message={error}
                    onHide={() => setError(null)}
                />
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgPrimary,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: theme.spacing['2xl'],
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing['3xl'],
    },
    logo: {
        width: 120,
        height: 120,
    },
    title: {
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing['3xl'],
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
        height: 56,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    inputIcon: {
        marginRight: theme.spacing.md,
    },
    input: {
        flex: 1,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
        fontWeight: theme.typography.fontWeight.medium,
    },
    eyeIcon: {
        padding: theme.spacing.sm,
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        ...theme.shadow.sm,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        color: 'white',
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.xl,
    },
    registerText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    registerLink: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.bold,
    },
});

export default LoginScreen;
