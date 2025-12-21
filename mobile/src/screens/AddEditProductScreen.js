import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';
import { productsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FlashMessage from '../components/FlashMessage';

const AddEditProductScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params || {};
    const isEditMode = !!productId;

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        unit: 'pcs',
        stock_quantity: '0',
        category: 'General',
        low_stock_threshold: '5'
    });
    const [image, setImage] = useState(null); // { uri: ... }
    const [existingImageUrl, setExistingImageUrl] = useState(null); // For display in edit mode if no new image picked

    const [categories, setCategories] = useState(['General', 'Groceries', 'Electronics', 'Clothing', 'Medicine', 'Other']);
    const [units, setUnits] = useState(['pcs', 'kg', 'g', 'l', 'ml', 'box', 'dozen', 'm', 'cm']);

    // Dropdown visibility
    const [showUnitPicker, setShowUnitPicker] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load dropdown options (if API available, otherwise use defaults)
            try {
                const [catsRes, unitsRes] = await Promise.all([
                    productsAPI.getCategories().catch(() => ({ data: { categories: categories } })),
                    productsAPI.getUnits().catch(() => ({ data: { units: units } }))
                ]);
                if (catsRes.data?.categories) setCategories(catsRes.data.categories);
                if (unitsRes.data?.units) setUnits(unitsRes.data.units);
            } catch (e) {
                // Ignore dropdown fetch errors, stick to defaults
            }

            // Load product if editing
            if (isEditMode) {
                const res = await productsAPI.getProduct(productId);
                const p = res.data.product; // Adjust based on API structure
                setForm({
                    name: p.name,
                    description: p.description || '',
                    price: p.price.toString(),
                    unit: p.unit,
                    stock_quantity: p.stock_quantity.toString(),
                    category: p.category || 'General',
                    low_stock_threshold: (p.low_stock_threshold || 5).toString()
                });
                setExistingImageUrl(p.product_image_url);
            }
        } catch (err) {
            console.error('Error loading product data:', err);
            setError('Failed to load product details');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setError('Permission needed to access photo library');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.price) {
            setError('Name and Price are required');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const productData = {
                ...form,
                price: parseFloat(form.price),
                stock_quantity: parseInt(form.stock_quantity) || 0,
                low_stock_threshold: parseInt(form.low_stock_threshold) || 0,
                product_image: image // Will be handled by api helper
            };

            if (isEditMode) {
                await productsAPI.updateProduct(productId, productData);
            } else {
                await productsAPI.addProduct(productData);
            }

            navigation.goBack();
        } catch (err) {
            console.error('Error saving product:', err);
            setError(err.response?.data?.error || 'Failed to save product');
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Product",
            "Are you sure you want to delete this product? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsSaving(true);
                        try {
                            await productsAPI.deleteProduct(productId);
                            navigation.goBack();
                        } catch (err) {
                            setError('Failed to delete product');
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    // Helper Modal for Pickers (Unit/Category)
    const SelectionModal = ({ visible, onClose, data, onSelect, title }) => (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={data}
                        keyExtractor={item => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => { onSelect(item); onClose(); }}
                            >
                                <Text style={styles.modalItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    if (isLoading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Product' : 'Add Product'}</Text>
                {isEditMode && (
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={24} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Image Picker */}
                    <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                        {image ? (
                            <Image source={{ uri: image.uri }} style={styles.productImage} />
                        ) : existingImageUrl ? (
                            <Image source={{ uri: existingImageUrl }} style={styles.productImage} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <MaterialIcons name="add-a-photo" size={32} color={theme.colors.textTertiary} />
                                <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                            </View>
                        )}
                        {/* Overlay text if image exists to show it's editable */}
                        {(image || existingImageUrl) && (
                            <View style={styles.editImageOverlay}>
                                <Text style={styles.editImageText}>Change</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Product Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                            placeholder="e.g. Basmati Rice"
                        />
                    </View>

                    {/* Price & Unit Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2, marginRight: 12 }]}>
                            <Text style={styles.label}>Price (₹) *</Text>
                            <TextInput
                                style={styles.input}
                                value={form.price}
                                onChangeText={t => setForm({ ...form, price: t })}
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Unit</Text>
                            <TouchableOpacity
                                style={styles.dropdownButton}
                                onPress={() => setShowUnitPicker(true)}
                            >
                                <Text style={styles.dropdownText}>{form.unit}</Text>
                                <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Stock & Low Stock Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                            <Text style={styles.label}>Stock Quantity</Text>
                            <TextInput
                                style={styles.input}
                                value={form.stock_quantity}
                                onChangeText={t => setForm({ ...form, stock_quantity: t })}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Low Stock Alert</Text>
                            <TextInput
                                style={styles.input}
                                value={form.low_stock_threshold}
                                onChangeText={t => setForm({ ...form, low_stock_threshold: t })}
                                placeholder="5"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Category */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setShowCategoryPicker(true)}
                        >
                            <Text style={styles.dropdownText}>{form.category}</Text>
                            <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={form.description}
                            onChangeText={t => setForm({ ...form, description: t })}
                            placeholder="Product details (optional)"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                </ScrollView>

                {/* Footer Save Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <LoadingSpinner color="white" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Product</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {error && <FlashMessage message={error} type="error" />}

            {/* Modals */}
            <SelectionModal
                visible={showUnitPicker}
                onClose={() => setShowUnitPicker(false)}
                data={units}
                onSelect={val => setForm({ ...form, unit: val })}
                title="Select Unit"
            />
            <SelectionModal
                visible={showCategoryPicker}
                onClose={() => setShowCategoryPicker(false)}
                data={categories}
                onSelect={val => setForm({ ...form, category: val })}
                title="Select Category"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgPrimary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    backButton: {
        paddingRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
    },
    deleteButton: {
        padding: 4,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    imagePicker: {
        alignSelf: 'center',
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        elevation: 1,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 4,
        fontSize: 12,
        color: theme.colors.textTertiary,
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 4,
        alignItems: 'center',
    },
    editImageText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    dropdownButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingBottom: Platform.OS === 'ios' ? 0 : 16,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    modalItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    modalItemText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
    },
});

export default AddEditProductScreen;
