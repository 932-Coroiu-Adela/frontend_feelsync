import NavigationBar from '@/components/NavigationBar';
import { BlurView } from 'expo-blur';
import React from 'react';
import { View, Text, ImageBackground, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { StyleSheet } from 'react-native';
import { useUserData } from '@/hooks/useUserData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '@/scripts/api';
import axios from 'axios';

export default function ProfileScreen() {
    const {userData, loading} = useUserData();

    
    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                console.log('No session token found');
                return;
            }
    
            console.log('Logging out with token:', token);
    
           
            const response = await api.post('/logout', {}, {
                headers: {
                    Authorization: token,
                },
            });
    
            if (response.status === 200) 
            { 
                await AsyncStorage.removeItem('sessionToken');
                await AsyncStorage.removeItem('expiresAt');
                
                Alert.alert("Logged out", "You have been logged out successfully.");

                router.replace('/login');
            } 
            else 
            {
                console.log('Logout failed: ', response.statusText);
            }
        } 
        catch (error) 
        {
            console.error('Error logging out', error);
        }
    };



    return (
        <ImageBackground source={require('@/assets/images/background3.jpg')} style={styles.background}>
            <BlurView intensity={140} style={styles.blur_overlay}>
                <View style={styles.top_container}>
                    <Text style={styles.title}>Account settings</Text>
                    <Image source={require('@/assets/images/user_photo.jpg')} style={styles.image}/>
                    
                    {loading ? (
                        <ActivityIndicator size="small" color="#622b0f" style={{ marginTop: 16 }} />
                    ) : (
                        <Text style={styles.username}>
                            {`Hello, ${userData?.name ?? "Guest"}`}
                        </Text>
                    )}
                </View>
                
                <View style={styles.content}>
                    <View style={styles.info_row}>
                        <Text style={styles.username}>Email</Text>
                        <Image source={require('@/assets/images/email.png')} style={styles.icon_image} />
                        <Text style={styles.text_field}>
                            {userData?.email ?? "Guest"}
                        </Text>
                    </View>

                    <View style={styles.info_row}>
                        <Text style={styles.username}>Birthday</Text>
                        <Image source={require('@/assets/images/birthday-cake.png')} style={styles.icon_image} />
                        <Text style={styles.text_field}>
                            {userData?.birthdate ?? "Guest"}
                        </Text>
                    </View>

                    <View style={styles.info_row}>
                        <Text style={styles.username}>User code</Text>
                        <Image source={require('@/assets/images/token.png')} style={styles.icon_image} />
                        <Text style={styles.text_field}>
                            {userData?.user_code ?? "Guest"}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.logout_button} onPress={handleLogout}>
                        <Text style={styles.logout_text}>LOG OUT</Text>
                    </TouchableOpacity>
                </View>


                <NavigationBar/>
            </BlurView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1, 
        resizeMode: 'cover',  
        justifyContent: 'center'
    },

    blur_overlay: {
        ...StyleSheet.absoluteFillObject,
    },

    container: {
        flex: 1,
        justifyContent: 'space-between',
    },

    title: {
        marginTop: 10,
        fontSize: 30,
        fontFamily: 'SergioTrendy',
        alignSelf: 'center',
        color: '#622b0f',
    },

    username: {
        fontSize: 17,
        fontFamily: 'SergioTrendy',
        alignSelf: 'center',
        color: 'black',
        marginRight: 20,
    },

    text_field: {
        fontSize: 17,
        fontFamily: 'Poppins',
        alignSelf: 'center',
        color: '#black',
    },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },

    image: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 4,
        borderColor: '#622b0f',
        marginTop: 20,
        marginBottom: 30,
    },

    top_container: {
        backgroundColor: 'rgba(253, 210, 217, 0.89)', 
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 175,
        borderBottomRightRadius: 175,
        
    },

    info_row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: 'rgba(251, 226, 230, 0.669)',
        padding: 10,
        borderRadius: 10,
        width: '90%',
    },

    icon_image: {
        width: 30,
        height: 30,
        marginRight: 10,
        resizeMode: 'contain',
    },

    logout_button: {
        backgroundColor: '#d44444',
        paddingVertical: 12,
        paddingHorizontal: 30,
        width: '50%',
        borderRadius: 30,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#8f2e2e',
    },

    logout_text: {
        color: '#fff',
        fontSize: 18,
        fontFamily: 'SergioTrendy',
        textAlign: 'center',
    },
});