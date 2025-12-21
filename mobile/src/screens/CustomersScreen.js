/**
 * CustomersScreen
 * List of all customers with search functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';
import { customerAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomerCard from '../components/CustomerCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import FlashMessage from '../components/FlashMessage';

const CustomersScreen = ({ navigation }) => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        // Filter customers based on search query
        if (searchQuery.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = customers.filter(customer =>
                customer.name.toLowerCase().includes(query) ||
                customer.phone_number.includes(query)
            );
            setFilteredCustomers(filtered);
        }
    }, [searchQuery, customers]);

    const loadCustomers = async () => {
        try {
            const response = await customerAPI.getCustomers();
            setCustomers(response.data.customers || []);
            setError(null);
        } catch (err) {
            console.error('Load customers error:', err);
            setError('Failed to load customers');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadCustomers();
    }, []);

    const handleCustomerPress = (customer) => {
        navigation.navigate('CustomerDetails', { customerId: customer.id, customerName: customer.name });
    };

    if (loading) {
        return <LoadingSpinner text="Loading customers..." />;
    }

    const renderCustomer = ({ item }) => (
        <CustomerCard
            customer={item}
            onPress={() => handleCustomerPress(item)}
        />
    );

    return (
        <View style={styles.container}>
            {/* Search Section */}
            <View style={styles.searchSection}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search customers..."
                    onClear={() => setSearchQuery('')}
                />
            </View>

            {/* Customer List */}
            <FlatList
                data={filteredCustomers}
                renderItem={renderCustomer}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="users"
                        title="No Customers"
                        message={searchQuery ? 'No customers match your search' : 'Start adding customers to track their transactions'}
                        actionText={!searchQuery ? 'Add First Customer' : ''}
                        onAction={!searchQuery ? () => navigation.navigate('AddCustomer') : undefined}
                    />
                }
                showsVerticalScrollIndicator={false}
            />

            {/* FAB - Add Customer */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddCustomer')}
                activeOpacity={0.8}
            >
                <FontAwesome name="user-plus" size={24} color="white" />
            </TouchableOpacity>

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
    searchSection: {
        backgroundColor: theme.colors.bgPrimary,
        padding: theme.spacing.lg,
        ...theme.shadow.sm,
    },
    listContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing['5xl'],
    },
    // FAB - Floating Action Button
    fab: {
        position: 'absolute',
        bottom: 90, // Above bottom tab bar
        right: theme.spacing.xl,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadow.lg,
    },
});

export default CustomersScreen;
