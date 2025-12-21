/**
 * RegisterScreen
 * New business registration
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

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [businessName, setBusinessName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRegister = async () => {
        // Validation
        if (!businessName.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Please fill in all fields');
            return;
        }

        if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            setError('Phone number must be exactly 10 digits');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await register(businessName, phone, password);

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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start managing your business credits</Text>

                {/* Business Name Input */}
                <View style={styles.inputContainer}>
                    <FontAwesome name="briefcase" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Business Name"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={businessName}
                        onChangeText={setBusinessName}
                        autoCapitalize="words"
                    />
                </View>

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
                        placeholder="Password (min 6 characters)"
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

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                    <FontAwesome name="lock" size={20} color={theme.colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor={theme.colors.textTertiary}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                    />
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.registerButtonText}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>Sign In</Text>
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
        marginBottom: theme.spacing.xl,
    },
    logo: {
        width: 100,
        height: 100,
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
        marginBottom: theme.spacing['2xl'],
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
    registerButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        ...theme.shadow.sm,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        color: 'white',
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.xl,
    },
    loginText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
    },
    loginLink: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.bold,
    },
});

export default RegisterScreen;
