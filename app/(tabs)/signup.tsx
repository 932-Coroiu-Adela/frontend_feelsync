import { BlurView } from "expo-blur";
import { Image,  ImageBackground, StyleSheet, Text, Alert, View, TextInput, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useState } from "react";
import axios, {AxiosError} from "axios";
import api from "@/scripts/api";

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [birthdate, setBirthdate] = useState('');

    const handleSignup = async () => {
        if (!name || !email || !password || !birthdate) {
            Alert.alert('Please fill in all fields');
            return;
        } 
        else 
        {
            // checking the email format
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            if (!emailRegex.test(email)) {
                Alert.alert('Invalid email format');
                return;
            }

            // checking the birthdate format
            const birtdateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!birtdateRegex.test(birthdate)) {
                Alert.alert('Invalid birthdate format');
                return;
            }

            try 
            {
                const response = await api.post('/signup',
                    {
                        name,
                        email,
                        password,
                        birthdate,
                    }
                );

                console.log("User created successfully: ", response.data);

                Alert.alert("Success!", "Account created successfully!",
                    [{text: 'OK', onPress: () => router.replace('/login')}]
                );
            } 
            catch (error) 
            {
                console.log("Error creating the user: ", error);

                if (axios.isAxiosError(error) && error.status === 500) 
                {
                    Alert.alert("Error!", error.response?.data.message || "An error occurred. Please try again.");
                }
                else 
                {
                    Alert.alert("Error!", "An unexpected error occurred. Please try again.");
                }
            }
        }
    }


    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ImageBackground source={require('@/assets/images/background2.jpg')} style={styles.background}>
                <BlurView intensity={170} style={styles.blur_overlay}/>
                
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Register</Text>
                    <Text style={styles.introduction}>Create your account</Text>
                    
                    {/* name input */}
                    <View style={styles.input_container}>
                        <Image source={require('@/assets/images/user.png')} style={styles.image} />
                        <TextInput
                            style={styles.input}
                            placeholder='Name'
                            placeholderTextColor='black'
                            value={name}
                            onChangeText={setName}
                            />
                    </View>

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

                    {/* birth date */}
                    <View style={styles.input_container}>
                        <Image source={require('@/assets/images/calendar.png')} style={styles.image} />
                        <TextInput
                            style={styles.input}
                            placeholder='Birth date: DD/MM/YYYY'
                            placeholderTextColor='black'
                            value={birthdate}
                            onChangeText={setBirthdate}
                            />
                    </View>
                    
                    {/* sign up button */}
                    <LinearGradient
                        colors={['#bfb9e0', '#1a266b']}
                        style={styles.signup_button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}>
                        <TouchableOpacity style={styles.button_wrapper} onPress={handleSignup}>
                            <Text style={styles.button_text_signup}>SIGN UP</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* go back button */}
                    <TouchableOpacity style={styles.go_back_button} onPress={() => {router.replace('/')}}>
                        <Text style={styles.button_text_goback}>GO BACK</Text>
                    </TouchableOpacity>
                    
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
        marginTop: 55,
        fontSize: 45,
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
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
        fontFamily: 'PoppinsMedium',
        marginBottom: 65,
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
        marginBottom: 40,
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

    signup_button: {
        borderRadius: 20,
        width: 260,
        padding: 10,
        marginTop: 80,
        borderWidth: 1,
        borderColor: '#06093c',
    },

    go_back_button: {
        borderRadius: 20,
        width: 260,
        padding: 10,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#06093c',
        backgroundColor: '#b7e2fa92',
    },

    button_text_signup: {
        color: 'white',
        textAlign: 'center',
        fontFamily: 'SergioTrendy',
    },

    button_text_goback: {
        color: '#0c105d',
        textAlign: 'center',
        fontFamily: 'SergioTrendy',
    },
});