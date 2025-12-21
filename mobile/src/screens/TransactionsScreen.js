import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { transactionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FlashMessage from '../components/FlashMessage';
import EmptyState from '../components/EmptyState';

const TransactionsScreen = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [filter, setFilter] = useState('ALL'); // ALL, CREDIT, PAYMENT
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [])
    );

    const loadTransactions = async () => {
        if (transactions.length === 0) setIsLoading(true);
        setError(null);
        try {
            const response = await transactionAPI.getTransactions();
            const data = response.data.transactions || [];

            // Sort by date descending
            const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setTransactions(sorted);
            applyFilter(sorted, filter);
        } catch (err) {
            console.error('Error loading transactions:', err);
            setError('Failed to load transactions');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadTransactions();
    };

    const applyFilter = (data, filterType) => {
        if (filterType === 'ALL') {
            setFilteredTransactions(data);
        } else {
            const type = filterType === 'CREDIT' ? 'credit' : 'payment'; // Matches API lowercase
            setFilteredTransactions(data.filter(t => t.transaction_type && t.transaction_type.toLowerCase() === type));
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        applyFilter(transactions, newFilter);
    };

    const renderTransactionItem = ({ item, index }) => {
        const isPayment = item.transaction_type && item.transaction_type.toLowerCase() === 'payment';

        // Date Header logic
        const currentDate = new Date(item.created_at).toDateString();
        const prevDate = index > 0 ? new Date(filteredTransactions[index - 1].created_at).toDateString() : null;
        const showDateHeader = currentDate !== prevDate;

        return (
            <View>
                {showDateHeader && (
                    <View style={styles.dateHeader}>
                        <Text style={styles.dateHeaderText}>
                            {new Date(item.created_at).toLocaleDateString('en-IN', {
                                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                            })}
                        </Text>
                    </View>
                )}

                <View style={styles.transactionCard}>
                    <View style={styles.transactionRow}>
                        {/* Avatar */}
                        <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.customer_name || '?') }]}>
                            <Text style={styles.avatarText}>{(item.customer_name || '?').charAt(0).toUpperCase()}</Text>
                        </View>

                        {/* Details */}
                        <View style={styles.detailsContainer}>
                            <Text style={styles.customerName}>{isPayment ? 'Payment from' : 'Given to'} {item.customer_name || 'Unknown'}</Text>
                            <Text style={styles.notesText}>{item.notes || (isPayment ? 'Payment received' : 'Credit given')}</Text>
                            <Text style={styles.timestampText}>
                                {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>

                        {/* Amount */}
                        <View style={styles.amountContainer}>
                            <Text style={[styles.amountText, isPayment ? styles.paymentText : styles.creditText]}>
                                ₹{parseFloat(item.amount).toFixed(2)}
                            </Text>
                            <View style={[styles.badge, isPayment ? styles.paymentBadge : styles.creditBadge]}>
                                <Text style={[styles.badgeText, isPayment ? styles.paymentText : styles.creditText]}>
                                    {isPayment ? 'Received' : 'Given'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    // Helper for avatar colors
    const getAvatarColor = (name) => {
        const colors = [
            '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const FilterTab = ({ title, type }) => (
        <TouchableOpacity
            style={[styles.filterTab, filter === type && styles.activeFilterTab]}
            onPress={() => handleFilterChange(type)}
        >
            <Text style={[styles.filterText, filter === type && styles.activeFilterText]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Transactions</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <FilterTab title="All" type="ALL" />
                <FilterTab title="You Gave (Credit)" type="CREDIT" />
                <FilterTab title="You Got (Payment)" type="PAYMENT" />
            </View>

            {/* List */}
            <FlatList
                data={filteredTransactions}
                renderItem={renderTransactionItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    !isLoading && (
                        <EmptyState
                            icon="receipt"
                            title={filter === 'ALL' ? "No Transactions" : `No ${filter.toLowerCase()} transactions`}
                            message="Transactions will appear here when you add them."
                        />
                    )
                }
            />

            {error && <FlashMessage message={error} type="error" />}
            {isLoading && !refreshing && <View style={styles.centerLoading}><LoadingSpinner /></View>}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgPrimary,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
    },
    filterTab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
    },
    activeFilterTab: {
        backgroundColor: theme.colors.primary,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    activeFilterText: {
        color: 'white',
    },
    listContent: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    dateHeader: {
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 8,
    },
    dateHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
    },
    transactionCard: {
        backgroundColor: 'white',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        // Premium shadow
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center', // Center align for cleaner look
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailsContainer: {
        flex: 1,
        paddingRight: 8,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    notesText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    timestampText: {
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    amountContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    amountText: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    creditText: {
        color: '#DC2626', // Stronger red
    },
    paymentText: {
        color: '#059669', // Stronger green
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    paymentBadge: {
        backgroundColor: '#d1fae5',
    },
    creditBadge: {
        backgroundColor: '#fee2e2',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    centerLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
    }
});

export default TransactionsScreen;
