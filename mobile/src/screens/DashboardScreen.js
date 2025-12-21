/**
 * DashboardScreen
 * Main home screen with overview, actions, and recent customers
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../theme';
import { dashboardAPI, qrAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FlashMessage from '../components/FlashMessage';

const DashboardScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState(null);
    const [business, setBusiness] = useState(null);
    const [accessPin, setAccessPin] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
        loadAccessPin();
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await dashboardAPI.getDashboard();
            setSummary(response.data.summary);
            setBusiness(response.data.business);
            setError(null);
        } catch (err) {
            console.error('Dashboard error:', err);
            setError('Failed to load dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadAccessPin = async () => {
        try {
            const response = await qrAPI.getAccessPin();
            setAccessPin(response.data.access_pin);
        } catch (err) {
            console.error('Access pin error:', err);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadDashboard();
        loadAccessPin();
    }, []);

    if (loading) {
        return <LoadingSpinner text="Loading dashboard..." />;
    }

    const actionButtons = [
        { icon: 'users', label: 'Customers', screen: 'Customers', color: theme.colors.accentOrange },
        { icon: 'box', label: 'Products', screen: 'Products', color: theme.colors.accentGreen },
        { icon: 'receipt', label: 'Transactions', screen: 'Transactions', color: theme.colors.accentBlue },
        { icon: 'user-plus', label: 'Add Customer', screen: 'AddCustomer', color: theme.colors.primary },
        { icon: 'plus-circle', label: 'Add Product', screen: 'AddProduct', color: theme.colors.accentGreen },
        { icon: 'file-invoice', label: 'Invoice', screen: 'Invoice', color: theme.colors.primaryLight },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Card - Total to Receive */}
                <View style={styles.heroCard}>
                    <Text style={styles.heroLabel}>TOTAL TO RECEIVE</Text>
                    <Text style={styles.heroAmount}>
                        ₹{(summary?.outstanding_balance || 0).toFixed(2)}
                    </Text>
                </View>

                {/* Action Grid */}
                <View style={styles.actionGrid}>
                    {actionButtons.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.actionCard}
                            onPress={() => navigation.navigate(action.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                                <FontAwesome name={action.icon} size={24} color={action.color} />
                            </View>
                            <Text style={styles.actionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* QR Code Button */}
                <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => setShowQR(true)}
                    activeOpacity={0.8}
                >
                    <FontAwesome name="qrcode" size={24} color={theme.colors.primary} style={{ marginRight: theme.spacing.md }} />
                    <Text style={styles.qrButtonText}>Show QR Code</Text>
                </TouchableOpacity>

                {/* WhatsApp Button */}
                <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={() => navigation.navigate('BulkReminders')}
                    activeOpacity={0.8}
                >
                    <FontAwesome name="whatsapp" size={24} color="white" style={{ marginRight: theme.spacing.md }} />
                    <Text style={styles.whatsappButtonText}>Send All Reminders</Text>
                </TouchableOpacity>

                {/* Recent Customers */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Customers</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Customers')}>
                            <Text style={styles.viewAllLink}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {summary?.recent_customers && summary.recent_customers.length > 0 ? (
                        summary.recent_customers.slice(0, 3).map((customer, index) => {
                            const balance = parseFloat(customer.balance) || 0;
                            const avatarColor = theme.colors.avatarColors[index % theme.colors.avatarColors.length];

                            return (
                                <TouchableOpacity
                                    key={customer.id}
                                    style={styles.customerItem}
                                    onPress={() => navigation.navigate('CustomerDetails', { customerId: customer.id })}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.customerAvatar, { backgroundColor: avatarColor }]}>
                                        <Text style={styles.customerAvatarText}>
                                            {customer.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.customerInfo}>
                                        <Text style={styles.customerName}>{customer.name}</Text>
                                        <Text style={styles.customerPhone}>{customer.phone_number}</Text>
                                    </View>
                                    <Text style={[
                                        styles.customerBalance,
                                        { color: balance >= 0 ? theme.colors.creditRed : theme.colors.paymentGreen }
                                    ]}>
                                        ₹{Math.abs(balance).toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptyCustomers}>
                            <FontAwesome name="users" size={40} color={theme.colors.textTertiary} style={{ opacity: 0.5 }} />
                            <Text style={styles.emptyText}>No customers yet</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AddCustomer')}>
                                <Text style={styles.addCustomerLink}>Add your first customer</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* QR Code Modal */}
            <Modal
                visible={showQR}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQR(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowQR(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Customer Connection</Text>
                        <Text style={styles.modalSubtitle}>Share this PIN or QR code with your customers</Text>

                        <View style={styles.pinContainer}>
                            <Text style={styles.pinLabel}>Your Business PIN</Text>
                            <Text style={styles.pinValue}>{accessPin}</Text>
                        </View>

                        {accessPin && (
                            <View style={styles.qrContainer}>
                                <QRCode value={accessPin} size={200} />
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowQR(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Error Message */}
            {error && (
                <FlashMessage type="error" message={error} onHide={() => setError(null)} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgSecondary,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing['5xl'],
    },
    // Hero Card
    heroCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
        ...theme.shadow.md,
    },
    heroLabel: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: theme.spacing.sm,
        letterSpacing: 1,
    },
    heroAmount: {
        fontSize: theme.typography.fontSize['4xl'],
        fontWeight: theme.typography.fontWeight.black,
        color: 'white',
    },
    // Action Grid
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -theme.spacing.sm,
        marginBottom: theme.spacing.lg,
    },
    actionCard: {
        width: '33.333%',
        padding: theme.spacing.sm,
    },
    actionIcon: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    actionLabel: {
        fontSize: theme.typography.fontSize.xs,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    // QR Button
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    qrButtonText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.primary,
    },
    // WhatsApp Button
    whatsappButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.whatsapp,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        ...theme.shadow.sm,
    },
    whatsappButtonText: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
    },
    // Section
    section: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...theme.shadow.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.textPrimary,
    },
    viewAllLink: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.primary,
    },
    // Customer Item
    customerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    customerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    customerAvatarText: {
        color: 'white',
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    customerPhone: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    customerBalance: {
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.bold,
    },
    // Empty State
    emptyCustomers: {
        alignItems: 'center',
        paddingVertical: theme.spacing['3xl'],
    },
    emptyText: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    addCustomerLink: {
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.primary,
        fontWeight: theme.typography.fontWeight.bold,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
    },
    modalContent: {
        backgroundColor: theme.colors.bgPrimary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        width: '100%',
        maxWidth: 400,
        ...theme.shadow.lg,
    },
    modalTitle: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    pinContainer: {
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    pinLabel: {
        fontSize: theme.typography.fontSize.xs,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    pinValue: {
        fontSize: theme.typography.fontSize['3xl'],
        fontWeight: theme.typography.fontWeight.black,
        color: theme.colors.primary,
        letterSpacing: 4,
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.lg,
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.md,
    },
    closeButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
    },
    closeButtonText: {
        color: 'white',
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.bold,
        textAlign: 'center',
    },
});

export default DashboardScreen;
