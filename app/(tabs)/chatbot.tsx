import NavigationBar from '@/components/NavigationBar';
import { BlurView } from 'expo-blur';
import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { StyleSheet } from 'react-native';

export default function ChatbotScreen() {
    
    return (
        <ImageBackground source={require('@/assets/images/background5.jpg')} style={styles.background}>
            <BlurView intensity={130} style={styles.blur_overlay}>
                <View style={styles.container}>
                    
                    <NavigationBar/>
                </View>
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
        marginTop: 55,
        fontSize: 40,
        fontFamily: 'SergioTrendy',
        alignSelf: 'center',
        color: '#2b0e42',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});