/**
 * Typography System - Inter Font Family
 */

export const typography = {
    // Font Family (System fonts as fallback since custom fonts need setup)
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },

    // Font Sizes
    fontSize: {
        xs: 11,
        sm: 12,
        base: 14,
        lg: 15,
        xl: 16,
        '2xl': 19,
        '3xl': 24,
        '4xl': 29,
        '5xl': 38,
    },

    // Font Weights
    fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '800',
    },

    // Line Heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export default typography;
