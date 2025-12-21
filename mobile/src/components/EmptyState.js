/**
 * EmptyState Component
 * Display when lists are empty
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';

const EmptyState = ({
    icon = 'inbox',
    title = 'Nothing here yet',
    message = '',
    actionText = '',
    onAction
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <FontAwesome name={icon} size={64} color={theme.colors.textTertiary} style={styles.icon} />
            </View>

            <Text style={styles.title}>{title}</Text>

            {message && <Text style={styles.message}>{message}</Text>}

            {actionText && onAction && (
                <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>{actionText}</Text>
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
        padding: theme.spacing['3xl'],
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.bgLightPurple,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    icon: {
        opacity: 0.5,
    },
    title: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
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

export default EmptyState;
