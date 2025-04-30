import { BlurView } from "expo-blur";
import { Image, Alert, ImageBackground, StyleSheet, Text, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {AxiosError} from "axios";
import api from "@/scripts/api";

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const checkExistingSession = async () => {
            const token = await AsyncStorage.getItem('sessionToken');
            const expiresAt = await AsyncStorage.getItem('expiresAt');

            if (token && expiresAt) {
                const isExpired = new Date(expiresAt) < new Date();

                // redirect to home if the session is still valid
                if (!isExpired) {
                    router.replace('/home');
                }
            }
            else {
                await AsyncStorage.removeItem('sessionToken');
                await AsyncStorage.removeItem('expiresAt');
                Alert.alert("Session expired", "Please log in again.");
            }
        };
        checkExistingSession();
    }, []);

    const handleLogin = async () => {
        if(!email || !password) {
            Alert.alert('Please fill in all fields');
            return;
        }

        try 
        {
            const response = await api.post('/login', {
                email,
                password,
            });              

            console.log("User logged in successfully: ", response.data);
            
            await AsyncStorage.setItem('sessionToken', response.data.token);
            await AsyncStorage.setItem('expiresAt', response.data.expiresAt);

            Alert.alert("Success!", "Logged in successfully!",
                [{text: 'OK', onPress: () => router.replace('/home')}]
            );

        }
        catch (error)
        {
            console.error("Error logging in the user: ", error);

            if (axios.isAxiosError(error))
            {
                Alert.alert("Error!", error.response?.data.message || "An error occurred. Please try again.");
            }
            else
            {
                Alert.alert("Error!", "An error occurred. Please try again.");
            }
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ImageBackground source={require('@/assets/images/background1.jpg')} style={styles.background}>
                <BlurView intensity={160} style={styles.blur_overlay}/>
                
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Image source={require('@/assets/images/starting_page_icon3.jpg')} style={styles.icon_container} />
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.introduction}>Log in to your account</Text>
                    
                    {/* email input */}
                    <View style={styles.input_container}>
                        <Image source={require('@/assets/images/email.png')} style={styles.image} />
                        <TextInput
                            style={styles.input}
                            keyboardType='email-address'
                            autoCapitalize="none"
                            placeholder='Email'
                            placeholderTextColor='black'
                            value={email}
                            onChangeText={setEmail}
                            />
                    </View>

                    {/* password input */}
                    <View style={styles.input_container}>
                        <Image source={require('@/assets/images/lock.png')} style={styles.image} />
                        <TextInput
                            secureTextEntry={true}
                            style={styles.input}
                            placeholder='Password'
                            autoCapitalize="none"
                            placeholderTextColor='black'
                            value={password}
                            onChangeText={setPassword}
                            />
                    </View>
                    
                    {/* login buttons */}
                    <LinearGradient
                        colors={['#e0b9c4', '#df556c']}
                        style={styles.login_button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}>
                        {/* <Link href='/' asChild> */}
                            <TouchableOpacity style={styles.button_wrapper} onPress={handleLogin}>
                                <Text style={styles.button_text_login}>LOGIN</Text>
                            </TouchableOpacity>
                        {/* </Link> */}
                    </LinearGradient>    
                </ScrollView>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',  
        justifyContent: 'center',
    },

    blur_overlay: {
        ...StyleSheet.absoluteFillObject,
    },

    container: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    title: {
        fontSize: 40,
        color: '#47186d',
        fontFamily: 'SergioTrendy',
    },

    icon_container: {
        width: '100%',
        height: 230,
        overflow: 'hidden',
        borderBottomLeftRadius: 190,
        borderBottomRightRadius: 190,
        marginBottom: 30,
        borderWidth: 1,
        marginTop: 0,
        borderColor: '#bfbbb9',
    },

    introduction: {
        fontSize: 15,
        color: 'black',
        textAlign: 'center',
        fontFamily: 'Poppins',
        marginBottom: 50,
        marginTop: 25,
    },

    input_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2b64a0',
        borderRadius: 20,
        backgroundColor: '#bbd9e95b',
        marginBottom: 20,
    },

    input: {
        width: 300,
        color: 'black',
        borderColor: '#2b64a0',
        fontSize: 16,
        fontFamily: 'Poppins',
        textAlign: 'center',
    },

    image: {
        width: 25,
        height: 25,
        marginRight: 10,
        marginLeft: 10,
    },

    button_wrapper: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 0,
    },

    login_button: {
        borderRadius: 20,
        width: 250,
        padding: 10,
        marginTop: 100,
        borderWidth: 1,
        borderColor: '#5b0e1b',
    },

    button_text_login: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'SergioTrendy',
    },
});