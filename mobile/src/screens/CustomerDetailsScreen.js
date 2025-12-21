import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import { customerAPI, transactionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FlashMessage from '../components/FlashMessage';

const CustomerDetailsScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { customerId, customerName: initialName } = route.params || {};

    const [customer, setCustomer] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const flatListRef = useRef(null);

    // Initial data from params to show something immediately
    const displayName = customer?.name || initialName || 'Customer';

    useEffect(() => {
        loadData();
    }, [customerId]);

    const loadData = async () => {
        if (!customerId) return;
        setIsLoading(true);
        try {
            // Fetch customer details and transactions in parallel
            const [customerRes, transactionsRes] = await Promise.all([
                customerAPI.getCustomer(customerId),
                transactionAPI.getCustomerTransactions(customerId)
            ]);

            setCustomer(customerRes.data.customer);
            setTransactions(transactionsRes.data.transactions || []);

        } catch (err) {
            console.error('Error loading customer details:', err);
            setError('Failed to load details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCall = () => {
        if (customer?.phone_number) {
            Linking.openURL(`tel:${customer.phone_number}`);
        }
    };

    const handleWhatsApp = () => {
        if (customer?.phone_number) {
            const message = `Hello ${customer.name}, your current balance is ₹${customer.balance}. Please pay at your earliest convenience.`;
            Linking.openURL(`https://wa.me/${customer.phone_number}?text=${encodeURIComponent(message)}`);
        }
    };

    const renderTransactionItem = ({ item }) => {
        const isPayment = item.transaction_type === 'PAYMENT' || item.transaction_type === 'payment'; // Check for lowercase too
        // Money received (You Got)

        return (
            <View style={[
                styles.messageContainer,
                isPayment ? styles.paymentMessage : styles.creditMessage
            ]}>
                <View style={[
                    styles.bubble,
                    isPayment ? styles.paymentBubble : styles.creditBubble
                ]}>
                    <View style={styles.bubbleHeader}>
                        <Text style={[
                            styles.amountText,
                            isPayment ? styles.paymentText : styles.creditText
                        ]}>
                            ₹{parseFloat(item.amount).toFixed(2)}
                        </Text>
                        {item.receipt_image_url ? (
                            <MaterialIcons name="attachment" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 5 }} />
                        ) : null}
                    </View>

                    <Text style={styles.transactionType}>
                        {isPayment ? 'You got' : 'You gave'}
                    </Text>

                    {item.notes ? (
                        <Text style={styles.notesText}>{item.notes}</Text>
                    ) : null}

                    {item.receipt_image_url ? (
                        <View style={styles.receiptPreview}>
                            <TouchableOpacity onPress={() => Linking.openURL(item.receipt_image_url)}>
                                <Text style={styles.receiptText}>View Receipt</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}

                    <Text style={styles.dateText}>
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.profileInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.avatarColors ? theme.colors.avatarColors[displayName.length % 10] : theme.colors.primary }]}>
                    <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.headerTitle}>{displayName}</Text>
                    <Text style={styles.headerSubtitle}>{customer?.phone_number || ''}</Text>
                </View>
            </View>

            <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleCall} style={styles.iconButton}>
                    <Ionicons name="call" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleWhatsApp} style={styles.iconButton}>
                    <FontAwesome name="whatsapp" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footerContainer}>
            <TouchableOpacity
                style={[styles.actionButton, styles.giveButton]}
                onPress={() => navigation.navigate('AddTransaction', {
                    customerId,
                    type: 'CREDIT',
                    customerName: displayName
                })}
            >
                <IconCircle name="arrow-down" color={theme.colors.error} />
                <Text style={styles.actionButtonText}>You Gave</Text>
                <Text style={styles.actionSubText}>(Credit)</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionButton, styles.gotButton]}
                onPress={() => navigation.navigate('AddTransaction', {
                    customerId,
                    type: 'PAYMENT',
                    customerName: displayName
                })}
            >
                <IconCircle name="arrow-up" color={theme.colors.success} />
                <Text style={styles.actionButtonText}>You Got</Text>
                <Text style={styles.actionSubText}>(Payment)</Text>
            </TouchableOpacity>
        </View>
    );

    const IconCircle = ({ name, color }) => (
        <View style={[styles.iconCircle, { borderColor: color }]}>
            <FontAwesome name={name} size={16} color={color} />
        </View>
    );

    if (isLoading && !customer) {
        return <LoadingSpinner />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            {renderHeader()}

            {/* Balance Summary Bar */}
            <View style={styles.balanceBar}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={[
                    styles.balanceValue,
                    { color: (customer?.balance || 0) > 0 ? theme.colors.error : theme.colors.success }
                ]}>
                    ₹{parseFloat(customer?.balance || 0).toFixed(2)}
                </Text>
                <Text style={styles.balanceStatus}>
                    {(customer?.balance || 0) > 0 ? 'To Receive' : 'Advance'}
                </Text>
            </View>

            {/* Transactions List */}
            <FlatList
                ref={flatListRef}
                data={transactions}
                renderItem={renderTransactionItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                inverted={false} // Normal order, simplified for now
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No transactions yet</Text>
                        <Text style={styles.emptySubText}>Start by adding a credit or payment</Text>
                    </View>
                }
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Bottom Actions */}
            {renderFooter()}

            {error && <FlashMessage message={error} type="error" />}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5', // WhatsApp-like background
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        paddingBottom: 15,
        paddingHorizontal: 10,
        elevation: 4,
    },
    backButton: {
        padding: 8,
    },
    profileInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    nameContainer: {
        justifyContent: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    headerActions: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 10,
        marginLeft: 5,
    },
    balanceBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 1,
    },
    balanceLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    balanceValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    balanceStatus: {
        fontSize: 12,
        color: theme.colors.textTertiary,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    listContent: {
        paddingVertical: 20,
        paddingHorizontal: 12,
        paddingBottom: 100, // Space for footer
    },
    messageContainer: {
        marginBottom: 15,
        width: '100%',
    },
    paymentMessage: {
        alignItems: 'flex-start', // Left side
    },
    creditMessage: {
        alignItems: 'flex-end', // Right side
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    paymentBubble: {
        backgroundColor: 'white',
        borderTopLeftRadius: 0,
        backgroundColor: '#D1FAE5', // Softer green
        borderTopLeftRadius: 4,
    },
    creditBubble: {
        backgroundColor: '#FEE2E2', // Softer red
        borderTopRightRadius: 4,
    },
    bubbleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    amountText: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    creditText: {
        color: '#991B1B', // Darker red text
    },
    paymentText: {
        color: '#065F46', // Darker green text
    },
    transactionType: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    notesText: {
        fontSize: 15,
        color: '#1F2937',
        marginBottom: 8,
        lineHeight: 20,
    },
    receiptPreview: {
        marginTop: 8,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.6)',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
    },
    receiptText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    dateText: {
        fontSize: 11,
        color: '#6B7280',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    footerContainer: {
        paddingHorizontal: 16, // More side padding
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 0 : 12, // Handle safe area manually if needed
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        // Stronger shadow for sticky footer
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 }, // Shadow upwards
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 8,
        elevation: 2,
    },
    giveButton: {
        backgroundColor: '#fff5f5',
        borderWidth: 1,
        borderColor: '#fed7d7',
    },
    gotButton: {
        backgroundColor: '#f0fff4',
        borderWidth: 1,
        borderColor: '#c6f6d5',
    },
    actionButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: theme.colors.textPrimary,
        marginLeft: 8,
    },
    actionSubText: {
        fontSize: 12,
        marginLeft: 4,
        color: theme.colors.textTertiary,
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
    emptySubText: {
        fontSize: 14,
        color: theme.colors.textTertiary,
        marginTop: 8,
    }
});

export default CustomerDetailsScreen;
