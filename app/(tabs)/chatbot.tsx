import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import NavigationBar from '@/components/NavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/scripts/api';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: number;
}

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef<FlatList<ChatMessage>>(null);

    useEffect(() => {
        setMessages([
            {
                id: `bot-${Date.now()}`,
                text: "Hi there! I’m your empathetic virtual assistant, here to offer thoughtful advice based on what you share. While I can’t hold a full conversation or remember past messages, I’ll do my best to help with whatever’s on your mind right now. How are you feeling today?",
                sender: 'bot',
                timestamp: Date.now(),
            },
        ]);
    }, []);
    
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (userInput.trim() === '') {
            return;
        }

        const userMessageText = userInput.trim();

        const newUserMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            text: userMessageText,
            sender: 'user',
            timestamp: Date.now(),
        };
        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        
        setUserInput('');
        setIsLoading(true);

        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                const errorBotMessage: ChatMessage = {
                    id: `bot-error-${Date.now()}`,
                    text: "Sorry, it seems you're not logged in. Please log in to use the chatbot.",
                    sender: 'bot',
                    timestamp: Date.now(),
                };
                setMessages(prevMessages => [...prevMessages, errorBotMessage]);
                setIsLoading(false);
                return;
            }

            const response = await api.post('/api/chatbot/advice', 
                { userInput: userMessageText },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            if (response.data && response.data.success && response.data.advice) {
                const botResponse: ChatMessage = {
                    id: `bot-response-${Date.now()}`,
                    text: response.data.advice,
                    sender: 'bot',
                    timestamp: Date.now(),
                };
                setMessages(prevMessages => [...prevMessages, botResponse]);
            
            } 
            else {
                const errorText = response.data.message || "Sorry, I couldn't get a helpful response right now. Please try again.";
                const errorBotMessage: ChatMessage = {
                    id: `bot-apierror-${Date.now()}`,
                    text: errorText,
                    sender: 'bot',
                    timestamp: Date.now(),
                };
                setMessages(prevMessages => [...prevMessages, errorBotMessage]);
            }

        } catch (err: any) {
            console.error("Error sending message to chatbot API:", err);
            let errorMessage = "I ran into a problem trying to connect. Please check your connection or try again later.";
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            const errorBotMessage: ChatMessage = {
                id: `bot-networkerror-${Date.now()}`,
                text: `Oops! ${errorMessage.substring(0,150)}`,
                sender: 'bot',
                timestamp: Date.now(),
            };
            setMessages(prevMessages => [...prevMessages, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessageItem = ({ item }: { item: ChatMessage }) => (
        <View style={[
            styles.messageBubbleContainer,
            item.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer
        ]}>
            <View style={[
                styles.messageBubble,
                item.sender === 'user' ? styles.userMessageBubble : styles.botMessageBubble
            ]}>
                <Text style={item.sender === 'user' ? styles.userMessageText : styles.botMessageText}>
                    {item.text}
                </Text>
            </View>
        </View>
    );

    return (
        <ImageBackground source={require('@/assets/images/robot_background.jpg')} style={styles.background}>
            <BlurView intensity={100} style={styles.blur_overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.keyboardAvoidingContainer}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} 
                >
                    <View style={styles.outerContainer}>
                        <View style={styles.header}>
                            <Image 
                                source={require('@/assets/images/robot_icon.png')}
                                style={{ width: 40, height: 40, marginBottom: 5, marginTop: 10 }}
                            />
                             <Text style={styles.headerTitle}>Echo</Text>
                        </View>
                        
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessageItem}
                            keyExtractor={(item) => item.id}
                            style={styles.chatArea}
                            contentContainerStyle={styles.chatContentContainer}
                            onContentSizeChange={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)}
                            onLayout={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)}
                        />
                        
                        <View style={styles.inputSection}>
                            {isLoading && <ActivityIndicator style={styles.loadingIndicator} size="small" color="#FFFFFF" />}
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.textInput}
                                    value={userInput}
                                    onChangeText={setUserInput}
                                    placeholder="How are you feeling?"
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    multiline
                                    onSubmitEditing={handleSendMessage}
                                    blurOnSubmit={false} 
                                />
                                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage} disabled={isLoading}>
                                    <Image 
                                        source={require('@/assets/images/send_message.png')}
                                        style={styles.sendIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <NavigationBar/>
                    </View>
                </KeyboardAvoidingView>
            </BlurView>
        </ImageBackground>
    );
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

    keyboardAvoidingContainer: {
        flex: 1,
    },
    outerContainer: { 
        flex: 1,
        justifyContent: 'space-between', 
    },
    header: {
        paddingTop: Platform.OS === 'android' ? 25 : 50, 
        paddingBottom: 10,
        alignItems: 'center', 
    },

    headerTitle: {
        fontSize: 15,
        fontFamily: 'SergioTrendy', 
        color: 'black',
    },

    chatArea: {
        flex: 1, 
    },

    chatContentContainer: {
        paddingHorizontal: 10,
        paddingBottom: 10,
    },

    messageBubbleContainer: { 
        flexDirection: 'row', 
        marginVertical: 4,
    },

    userMessageContainer: {
        justifyContent: 'flex-end', 
    },

    botMessageContainer: {
        justifyContent: 'flex-start', 
    },

    messageBubble: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 18,
        maxWidth: '80%', 
    },

    userMessageBubble: {
        backgroundColor: '#007bff91', 
    },

    botMessageBubble: {
        backgroundColor: '#e5e5ea6d', 
    },

    userMessageText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'PoppinsMedium', 
    },

    botMessageText: {
        color: 'black',
        fontSize: 16,
        fontFamily: 'PoppinsMedium', 
    },
    
    timestampText: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.4)', 
        alignSelf: 'flex-end',
        marginTop: 3,
    },

    inputSection: { 
        marginBottom: 55, 
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1, 
        borderRadius: 25, 
        borderColor: 'rgba(255, 255, 255, 0)',
        backgroundColor: 'rgba(161, 206, 255, 0.9)', 
        position: 'absolute', 
        bottom: 20, 
        left: 10, 
        right: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5, 
        },
        shadowOpacity: 0.30, 
        shadowRadius: 6.27, 
        elevation: 10, 
    },

    textInput: {
        flex: 1,
        minHeight: 42,
        maxHeight: 100, 
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 21,
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginRight: 10,
        color: 'white',
        fontSize: 16,
        fontFamily: 'PoppinsMedium',
    },

    sendButton: {
        padding: 8, 
    },

    sendIcon: {
        width: 35,
        height: 35,
        alignSelf: 'center'
    },

    loadingIndicator: {
        paddingVertical: 5, 
    },
});
