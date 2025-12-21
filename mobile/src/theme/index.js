/**
 * Ekthaa Business - Design System
 * Central theme export
 */

import colors from './colors';
import spacing from './spacing';
import typography from './typography';

export const theme = {
    colors,
    spacing,
    typography,

    // Border Radius
    borderRadius: {
        sm: 6,
        md: 10,
        lg: 16,
        xl: 20,
        full: 9999,
    },

    // Shadows (iOS style)
    shadow: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2, // Android
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};

export { colors, spacing, typography };
export default theme;
