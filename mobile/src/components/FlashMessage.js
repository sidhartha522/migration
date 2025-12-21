/**
 * FlashMessage Component
 * Toast-style notifications
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';

const FlashMessage = ({ type = 'success', message, onHide, duration = 3000 }) => {
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Auto hide after duration
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                if (onHide) onHide();
            });
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const getIconName = () => {
        switch (type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'times-circle';
            case 'warning':
                return 'exclamation-circle';
            default:
                return 'info-circle';
        }
    };

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: '#d1fae5',
                    borderColor: theme.colors.success,
                    textColor: '#065f46',
                    iconColor: theme.colors.success,
                };
            case 'error':
                return {
                    backgroundColor: '#fee2e2',
                    borderColor: theme.colors.error,
                    textColor: '#7f1d1d',
                    iconColor: theme.colors.error,
                };
            case 'warning':
                return {
                    backgroundColor: '#fef3c7',
                    borderColor: theme.colors.warning,
                    textColor: '#78350f',
                    iconColor: theme.colors.warning,
                };
            default:
                return {
                    backgroundColor: '#dbeafe',
                    borderColor: theme.colors.info,
                    textColor: '#1e3a8a',
                    iconColor: theme.colors.info,
                };
        }
    };

    const messageStyles = getStyles();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: messageStyles.backgroundColor,
                    borderColor: messageStyles.borderColor,
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-20, 0],
                        }),
                    }],
                },
            ]}
        >
            <FontAwesome
                name={getIconName()}
                size={20}
                color={messageStyles.iconColor}
                style={styles.icon}
            />
            <Text style={[styles.message, { color: messageStyles.textColor }]}>
                {message}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 2,
        ...theme.shadow.lg,
        zIndex: 9999,
    },
    icon: {
        marginRight: theme.spacing.md,
    },
    message: {
        flex: 1,
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
    },
});

export default FlashMessage;
