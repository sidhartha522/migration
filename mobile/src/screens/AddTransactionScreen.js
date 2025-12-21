import React, { useState } from 'react';
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
    Switch
} from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';
import { transactionAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import FlashMessage from '../components/FlashMessage';

const AddTransactionScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { customerId, type: initialType, customerName } = route.params || {};

    const [type, setType] = useState(initialType || 'CREDIT');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setError('Permission needed to access photo library');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            setError('Permission needed to access camera');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const transactionData = {
                customer_id: customerId,
                transaction_type: type,
                amount: parseFloat(amount),
                notes: notes,
                bill_photo: image
            };

            await transactionAPI.createTransaction(transactionData);

            // Show success logic handled by previous screen refresh or general global message?
            // Since we're navigating back, pass param or use FlashMessage here before pop
            // Ideally we show success and go back
            navigation.goBack();

        } catch (err) {
            console.error('Transaction error:', err);
            setError(err.response?.data?.error || 'Failed to add transaction');
            setIsLoading(false);
        }
    };

    const isCredit = type === 'CREDIT';

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: isCredit ? theme.colors.error : theme.colors.success }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {isCredit ? 'You Gave (Credit)' : 'You Got (Payment)'}
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Customer Info */}
                <View style={styles.customerInfo}>
                    <Text style={styles.label}>Transaction with</Text>
                    <Text style={styles.customerName}>{customerName || 'Customer'}</Text>
                </View>

                {/* Amount Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Amount (₹)</Text>
                    <View style={[styles.amountInputContainer, { borderColor: isCredit ? theme.colors.error : theme.colors.success }]}>
                        <Text style={[styles.currencySymbol, { color: isCredit ? theme.colors.error : theme.colors.success }]}>₹</Text>
                        <TextInput
                            style={[styles.amountInput, { color: isCredit ? theme.colors.error : theme.colors.success }]}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            keyboardType="numeric"
                            autoFocus
                        />
                    </View>
                </View>

                {/* Toggle Type (Optional if user wants to switch) */}
                <View style={styles.toggleContainer}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            style={[styles.toggleButton, type === 'CREDIT' && styles.creditActive]}
                            onPress={() => setType('CREDIT')}
                        >
                            <Text style={[styles.toggleText, type === 'CREDIT' && styles.activeText]}>Gave (Credit)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, type === 'PAYMENT' && styles.paymentActive]}
                            onPress={() => setType('PAYMENT')}
                        >
                            <Text style={[styles.toggleText, type === 'PAYMENT' && styles.activeText]}>Got (Payment)</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Notes Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Notes / Description</Text>
                    <TextInput
                        style={styles.notesInput}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add details (optional)"
                        multiline
                    />
                </View>

                {/* Image Picker */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Attach Bill / Receipt</Text>

                    {image ? (
                        <View style={styles.imagePreviewContainer}>
                            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                            <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
                                <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.photoButtons}>
                            <TouchableOpacity style={styles.photoButton} onPress={handleCamera}>
                                <Ionicons name="camera" size={24} color={theme.colors.primary} />
                                <Text style={styles.photoButtonText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                                <MaterialIcons name="photo-library" size={24} color={theme.colors.primary} />
                                <Text style={styles.photoButtonText}>Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: isCredit ? theme.colors.error : theme.colors.success },
                        isLoading && styles.disabledButton
                    ]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <LoadingSpinner color="white" /> // Need tiny spinner or text
                    ) : (
                        <Text style={styles.submitButtonText}>
                            Save Transaction
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {error && <FlashMessage message={error} type="error" />}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <LoadingSpinner text="Saving..." />
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    customerInfo: {
        marginBottom: 24,
        alignItems: 'center',
    },
    customerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        paddingVertical: 5,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: 'bold',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 40,
        fontWeight: 'bold',
    },
    notesInput: {
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: 8,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    toggleContainer: {
        marginBottom: 24,
    },
    toggleRow: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    creditActive: {
        backgroundColor: '#fff5f5',
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    paymentActive: {
        backgroundColor: '#f0fff4',
        borderWidth: 1,
        borderColor: theme.colors.success,
    },
    toggleText: {
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    activeText: {
        color: theme.colors.textPrimary,
        fontWeight: 'bold',
    },
    photoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    photoButton: {
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: 8,
        width: '45%',
    },
    photoButtonText: {
        marginTop: 8,
        color: theme.colors.textPrimary,
    },
    imagePreviewContainer: {
        alignItems: 'center',
        position: 'relative',
    },
    imagePreview: {
        width: 150,
        height: 150,
        borderRadius: 8,
    },
    removeImage: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: 'white',
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    }
});

export default AddTransactionScreen;
