/**
 * CustomerCard Component
 * Displays customer info with avatar, name, phone, balance, and WhatsApp button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';

const CustomerCard = ({ customer, onPress }) => {
    const balance = parseFloat(customer.balance) || 0;

    // Get avatar color based on name
    const getAvatarColor = (name) => {
        const charCode = name.charCodeAt(0);
        const colorIndex = charCode % theme.colors.avatarColors.length;
        return theme.colors.avatarColors[colorIndex];
    };

    const avatarColor = getAvatarColor(customer.name);

    const handleWhatsApp = () => {
        const message = `Hi ${customer.name}, your balance is ₹${Math.abs(balance).toFixed(2)}`;
        const url = `whatsapp://send?phone=91${customer.phone_number}&text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => {
            // Fallback to web WhatsApp
            Linking.openURL(`https://wa.me/91${customer.phone_number}?text=${encodeURIComponent(message)}`);
        });
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.mainContent}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarText}>
                        {customer.name.charAt(0).toUpperCase()}
                    </Text>
                </View>

                {/* Customer Info */}
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {customer.name}
                    </Text>
                    <Text style={styles.phone}>{customer.phone_number}</Text>
                </View>

                {/* Balance */}
                <View style={styles.balanceContainer}>
                    <Text style={[
                        styles.balance,
                        { color: balance > 0 ? theme.colors.creditRed : theme.colors.paymentGreen }
                    ]}>
                        ₹{Math.abs(balance).toFixed(2)}
                    </Text>
                    <Text style={styles.balanceLabel}>
                        {balance > 0 ? 'TO RECEIVE' : 'RECEIVED'}
                    </Text>
                </View>

                {/* Chevron */}
                <FontAwesome
                    name="chevron-right"
                    size={14}
                    color={theme.colors.textTertiary}
                    style={{ marginLeft: theme.spacing.sm }}
                />
            </TouchableOpacity>

            {/* WhatsApp Button */}
            <TouchableOpacity
                style={styles.whatsappBtn}
                onPress={handleWhatsApp}
                activeOpacity={0.8}
            >
                <FontAwesome name="whatsapp" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        ...theme.shadow.sm,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    avatarText: {
        color: 'white',
        fontSize: 22,
        fontWeight: theme.typography.fontWeight.bold,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    phone: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    balanceContainer: {
        alignItems: 'flex-end',
        marginRight: theme.spacing.md,
    },
    balance: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: 2,
    },
    balanceLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        fontWeight: theme.typography.fontWeight.semibold,
    },
    whatsappBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.whatsapp,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing.sm,
    },
});

export default CustomerCard;
