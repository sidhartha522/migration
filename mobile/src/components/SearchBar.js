/**
 * SearchBar Component
 * Search input with clear button
 */

import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';

const SearchBar = ({ value, onChangeText, placeholder = 'Search...', onClear }) => {
    return (
        <View style={styles.container}>
            {/* Search Icon */}
            <FontAwesome
                name="search"
                size={16}
                color={theme.colors.textTertiary}
                style={styles.searchIcon}
            />

            {/* Input */}
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textTertiary}
                returnKeyType="search"
            />

            {/* Clear Button */}
            {value.length > 0 && (
                <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                    <FontAwesome name="times-circle" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.bgSecondary,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    searchIcon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: theme.typography.fontSize.base,
        color: theme.colors.textPrimary,
        fontWeight: theme.typography.fontWeight.medium,
    },
    clearBtn: {
        padding: theme.spacing.xs,
        marginLeft: theme.spacing.sm,
    },
});

export default SearchBar;
