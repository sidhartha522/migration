/**
 * Navigation Setup
 * Bottom Tab Navigation + Stack Navigation + Auth Flow
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Main Screens
import DashboardScreen from '../screens/DashboardScreen';
import CustomersScreen from '../screens/CustomersScreen';
import CustomerDetailsScreen from '../screens/CustomerDetailsScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import ProductsScreen from '../screens/ProductsScreen';
import AddEditProductScreen from '../screens/AddEditProductScreen';
import TransactionsScreen from '../screens/TransactionsScreen';

// Placeholder screens (to be implemented)
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

// Bottom Tab Navigator
function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textTertiary,
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 8,
                    backgroundColor: theme.colors.bgPrimary,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.borderLight,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: theme.colors.primary,
                },
                headerTintColor: 'white',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Tab.Screen
                name="CustomersTab"
                component={CustomersScreen}
                options={{
                    tabBarLabel: 'Customers',
                    title: 'Customers',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="users" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="ProductsTab"
                component={ProductsScreen}
                options={{
                    tabBarLabel: 'Products',
                    title: 'Products',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="box" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="DashboardTab"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="home" size={size + 4} color={color} />
                    ),
                    tabBarIconStyle: {
                        marginTop: -4,
                    },
                }}
            />
            <Tab.Screen
                name="InvoiceTab"
                component={PlaceholderScreen}
                options={{
                    tabBarLabel: 'Invoice',
                    title: 'Generate Invoice',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="file-invoice" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="TransactionsTab"
                component={TransactionsScreen}
                options={{
                    tabBarLabel: 'Transactions',
                    title: 'Transactions',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="receipt" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

// Main Stack (with Tabs nested inside)
function MainStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Tabs" component={TabNavigator} />
            {/* Add more screens here as they're created */}
            <Stack.Screen
                name="AddEditProduct"
                component={AddEditProductScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddCustomer"
                component={PlaceholderScreen}
                options={{
                    headerShown: true,
                    title: 'Add Customer',
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTintColor: 'white',
                }}
            />
            <Stack.Screen
                name="CustomerDetails"
                component={CustomerDetailsScreen}
                options={{
                    headerShown: false, // Using custom header in the screen
                }}
            />
            <Stack.Screen
                name="AddTransaction"
                component={AddTransactionScreen}
                options={{ headerShown: false }} // Custom header in screen
            />
            <Stack.Screen
                name="BulkReminders"
                component={PlaceholderScreen}
                options={{
                    headerShown: true,
                    title: 'Bulk Reminders',
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTintColor: 'white',
                }}
            />
        </Stack.Navigator>
    );
}

// Root Navigator
function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner text="Loading..." />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

export default RootNavigator;
