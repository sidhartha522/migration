import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { productsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FlashMessage from '../components/FlashMessage';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';

const ProductsScreen = () => {
    const navigation = useNavigation();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Load products whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    const loadProducts = async () => {
        try {
            // First load only if we don't have data, otherwise just silent refresh
            if (products.length === 0) setIsLoading(true);
            setError(null);

            const response = await productsAPI.getProducts();
            const data = response.data.products || [];

            setProducts(data);
            setFilteredProducts(data);
        } catch (err) {
            console.error('Error loading products:', err);
            setError('Failed to load products');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadProducts();
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setFilteredProducts(products);
            return;
        }

        const query = text.toLowerCase();
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
        setFilteredProducts(filtered);
    };

    const calculateTotalStockValue = () => {
        return products.reduce((total, p) => total + (p.price * p.stock_quantity), 0);
    };

    const getLowStockCount = () => {
        return products.filter(p => p.is_low_stock).length;
    };

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.productCard, item.is_low_stock && styles.lowStockCard]}
            onPress={() => navigation.navigate('AddEditProduct', { productId: item.id })}
        >
            <View style={styles.productImageContainer}>
                {item.product_image_url ? (
                    <Image source={{ uri: item.product_image_url }} style={styles.productImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <FontAwesome name="cube" size={24} color={theme.colors.textTertiary} />
                    </View>
                )}
            </View>

            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.price}/{item.unit}</Text>

                <View style={styles.stockContainer}>
                    <Text style={[
                        styles.stockText,
                        item.is_low_stock ? styles.lowStockText : styles.normalStockText
                    ]}>
                        Stock: {item.stock_quantity} {item.unit}
                    </Text>
                    {item.is_low_stock && (
                        <View style={styles.lowStockBadge}>
                            <Text style={styles.lowStockBadgeText}>Low</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.actionIcon}>
                <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Products Directory</Text>
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
                <View style={[styles.summaryCard, styles.valueCard]}>
                    <Text style={styles.summaryLabel}>TOTAL VALUE</Text>
                    <Text style={styles.summaryValue}>₹{calculateTotalStockValue().toLocaleString('en-IN')}</Text>
                </View>
                <View style={[styles.summaryCard, styles.alertCard]}>
                    <Text style={styles.summaryLabel}>LOW STOCK</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.error }]}>{getLowStockCount()} Items</Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <SearchBar
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    onClear={() => handleSearch('')}
                />
            </View>

            {/* Product List */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    !isLoading && (
                        <EmptyState
                            icon="cube"
                            title={searchQuery ? "No products found" : "No Products Yet"}
                            message={searchQuery ? "Try a different search term" : "Add your first product to get started"}
                        />
                    )
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddEditProduct')} // No ID means Add mode
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

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
    summaryContainer: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.textTertiary,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    searchContainer: {
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100, // FAB space
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        // Softer shadow
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    lowStockCard: {
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.error,
    },
    productImageContainer: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // Changed to contain to avoid cropping
    },
    placeholderImage: {
        opacity: 0.5,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 4,
    },
    stockContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockText: {
        fontSize: 12,
    },
    normalStockText: {
        color: theme.colors.textSecondary,
    },
    lowStockText: {
        color: theme.colors.error,
        fontWeight: '500',
    },
    lowStockBadge: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    lowStockBadgeText: {
        fontSize: 10,
        color: theme.colors.error,
        fontWeight: 'bold',
    },
    actionIcon: {
        padding: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: theme.colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
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

export default ProductsScreen;
