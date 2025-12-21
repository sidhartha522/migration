/**
 * PlaceholderScreen
 * Temporary screen for routes not yet implemented
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';

const PlaceholderScreen = ({ navigation, route }) => {
    const screenName = route?.name || 'Screen';

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <FontAwesome name="wrench" size={64} color={theme.colors.primary} />
            </View>

            <Text style={styles.title}>{screenName}</Text>
            <Text style={styles.message}>This screen is under construction</Text>
            <Text style={styles.subtitle}>Coming soon!</Text>

            {navigation?.canGoBack() && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.bgSecondary,
        padding: theme.spacing['3xl'],
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.bgLightPurple,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.semibold,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadow.sm,
    },
    buttonText: {
        color: 'white',
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
    },
});

export default PlaceholderScreen;
