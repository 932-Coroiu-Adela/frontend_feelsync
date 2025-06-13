import NavigationBar from '@/components/NavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, Modal, TextInput, TouchableOpacity, Button, Image, FlatList, SafeAreaView } from 'react-native';
import { StyleSheet } from 'react-native';
import api from "@/scripts/api";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';


export default function FriendsScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'add' | 'pending'>('add');
    const [user_code, setUserCode] = useState('');
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const NAV_BAR_HEIGHT = 75;

    const currentUserId = AsyncStorage.getItem('userId').then((value) => {
        if (value) {
            return parseInt(value, 10);
        }
        return null;
    });

    const isTodayBirthday = (dateString: string) => {
        if (!dateString) return false;

        const [day, month] = dateString.split('/');
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth() + 1; 

        return parseInt(day, 10) === currentDay && parseInt(month, 10) === currentMonth;
    }


    const fetchFriends = async () => {
        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                console.error('No session token found');
                return;
            }

            const response = await api.get('/friendships', {
                headers: {
                    Authorization: token,
                },
            });

            if (response.data.success) {
                console.log('Friends fetched successfully:', response.data.data);
                return response.data.data;
            } else {
                console.error('Error fetching friends:', response.data.message);
                return;
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
            return;
        }
    }

    const fetchPendingRequests = async () => {
        const token = await AsyncStorage.getItem('sessionToken');
        if (!token) {
            console.error('No session token found');
            return;
        }
        try {
            const response = await api.get('/friendships/requests', {
                headers: {
                    Authorization: token,
                },
            });

            if (response.data.success) {
                setPendingRequests(response.data.data);
            } else {
                console.error('Error fetching pending requests:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        }
    }

    const acceptFriendRequest = async (user_code: string) => {
        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                console.error('No session token found');
                return;
            }

            const response = await api.post('/friendships/accept', { user_code }, {
                headers: {
                    Authorization: token,
                },
            });

            if (response.data.success) {
                alert('Friend request accepted!');
                console.log('Friend request accepted:', response.data.message);
                fetchPendingRequests();
                fetchFriends(); 
            } else {
                console.error('Failed to accept request:', response.data.message);
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };


    const rejectFriendRequest = async (userCode: string) => {
        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                console.error('No session token found');
                return;
            }
      
            const response = await api.post('/friendships/reject', { user_code: userCode }, {
                headers: {
                    Authorization: token,
                },
            });
      
            if (response.data.success) {
                console.log('Friend request rejected:', response.data.message);
                alert('Friend request rejected!');
                await fetchPendingRequests(); 
            } else {
                console.error('Failed to reject friend request:', response.data.message);
            }
        } catch (error) {
          console.error('Error rejecting friend request:', error);
        }
    };

    const sendFriendRequest = async (userCode: string) => {
        try {
          const token = await AsyncStorage.getItem('sessionToken');
          if (!token) {
            console.error('No session token found');
            return;
          }
      
          const response = await api.post('/friendships/send', 
            { user_code: userCode },
            {
              headers: {
                Authorization: token,
              },
            }
          );
      
          const data = response.data;
      
          if (data.success) {
            console.log('Friend request sent successfully:', data.message);
            alert('Friend request sent!');
            setUserCode('');
          } 
    
        else{
            console.error('Error sending friend request:', data.message);
            alert(data.message || 'Failed to send friend request');
          }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.log('Friendship already exists:', error.response.data.message);
                alert(error.response.data.message || 'Friendship already exists.');
            } else {
                console.error('Error sending friend request:', error);
                alert('Network error while sending friend request');
            }
        }
    };

    useEffect(() => {
        const loadFriends = async () => {
            const friendsData = await fetchFriends();
            if (friendsData) {
                setFriends(friendsData);
            }

            if (modalVisible && activeTab === 'pending') {
                await fetchPendingRequests();
            }
        };
        loadFriends();
    }, [modalVisible, activeTab]);

    return (
        <ImageBackground source={require('@/assets/images/background6.jpg')} style={styles.background}>
            <BlurView intensity={150} style={styles.blur_overlay}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.titleContainer}>
                        <View style={styles.circleBackground} />
                        <Text style={styles.title}>Friends</Text>
                    </View>
                    <TouchableOpacity style={styles.notificationsButton} onPress={() => setModalVisible(true)}>
                        <Image style={styles.image} source={require('@/assets/images/notifications.png')}/>
                    </TouchableOpacity>
                    
                    <FlatList style={styles.friendList}
                        contentContainerStyle = {{ paddingBottom: insets.bottom + NAV_BAR_HEIGHT }}
                        data={friends}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <Link href={{pathname: '/chat', params: { friendId: item.id, friendName: item.name }}} asChild>
                                <TouchableOpacity
                                    style={styles.friendItem}
                                    onPress={() => router.replace('/chat')}>
                                    <Image style={styles.image} source={require('@/assets/images/friend.png')} />
                                    <Text style={styles.friendName}>{item.name}</Text>
                                    {isTodayBirthday(item.birthdate) && (
                                        <Image source={require('@/assets/images/birthday-cake.png')} style={{ width: 20, height: 20 }} />
                                    )}
                                    <Text style={styles.friendEmail}>{item.email}</Text>
                                </TouchableOpacity>
                            </Link>
                        )}
                        ListEmptyComponent={
                            <Text style={{ fontFamily: 'Poppins', textAlign: 'center', marginTop: 20 }}>
                            You have no friends yet 😢
                            </Text>
                        }
                    />

                    <Modal transparent animationType="fade" visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                    <Image source={require('@/assets/images/cancel_button.png')} style={{ width: 38, height: 38 }} />
                                </TouchableOpacity>

                                <View style={styles.tabButtons}>
                                    <TouchableOpacity style={[styles.tabButton, activeTab === 'add' && styles.activeTab]}
                                        onPress={() => setActiveTab('add')}>
                                        <Text style={styles.tabText}> ➕ Add friend</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.tabButton, activeTab === 'pending' && styles.activeTab]}
                                        onPress={() => setActiveTab('pending')}>
                                        <Text style={styles.tabText}>⏳ Pending...</Text>
                                    </TouchableOpacity>
                                </View>

                                {activeTab === 'add' ? (
                                    <>
                                        <Text style={styles.modalTitle}>Enter the user code 🙋🏻‍♀️</Text>
                                        <TextInput
                                            placeholder="e.g. ABC123"
                                            value={user_code}
                                            onChangeText={setUserCode}
                                            style={styles.input}
                                            autoCapitalize="none"
                                        />
                                        
                                        <TouchableOpacity style={styles.modalActionButton} onPress={() => {}}>
                                            <Text style={styles.modalActionText} onPress={() => sendFriendRequest(user_code)}>Send</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        {pendingRequests.length === 0 ? (
                                            <Text style={{ marginTop: 10, fontFamily: 'SergioTrendy' }}>No pending requests</Text>
                                        ) : (
                                            <FlatList
                                                data={pendingRequests}
                                                keyExtractor={(item) => item.id.toString()}
                                                renderItem={({ item }) => (
                                                    <View style={styles.requestItem}>
                                                        <Image style={styles.image} source={require('@/assets/images/anonym.png')}/>
                                                        <Text style={styles.requestText}>{item.name}</Text>
                                                        <View style={styles.requestButtons}>
                                                            <Button title="✅" onPress={() => {acceptFriendRequest(item.user_code)}} />
                                                            <Button title="❌" onPress={() => {rejectFriendRequest(item.user_code)}} />
                                                        </View>
                                                    </View>
                                                )}

                                                
                                            />
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                    </Modal>
                    <NavigationBar/>    
                </SafeAreaView>
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

    notificationsButton: {
        position: 'absolute',
        top: 55,
        right: 15,
        width: 65,
        height: 65,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 32.5,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 10,
    },

    title: {
        fontSize: 40,
        fontFamily: 'SergioTrendy',
        alignSelf: 'center',
        color: '#ffffff',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    image: {
        width: 35,
        height: 35,
        resizeMode: 'contain',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        
    },

    modalContent: {
        backgroundColor: '#f7edf9ff',
        padding: 20,
        borderRadius: 10,
        width: '85%',
        alignItems: 'center',
        height: '55%',
        
    },

    modalTitle: {
        fontSize: 23,
        marginBottom: 10,
        fontFamily: 'SergioTrendy',
        color: '#2b0e42',
        textAlign: 'center',
        paddingBottom: 20,
        paddingTop: 20,
    },

    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins',
    },

    modalButtons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
        marginTop: 20,
    },

    tabButtons: {
        flexDirection: 'row',
        marginBottom: 10,
        width: '100%',
        justifyContent: 'space-around',
        marginTop: 40,
    },

    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#a2a0a0',
        borderRadius: 20,
        
    },

    activeTab: {
        backgroundColor: '#9975c9',
    },

    tabText: {
        fontFamily: 'PoppinsMedium',
        color: '#fff',
        textAlign: 'center',
        fontSize: 14,
    },

    requestItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 6,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        width: '100%',
    },

    requestText: {
        fontSize: 14,
        fontFamily: 'Poppins',
    },

    requestButtons: {
        flexDirection: 'row',
        gap: 10,
    },

    modalActionButton: {
        width: '60%',
        alignItems: 'center',
        backgroundColor: '#4d973aff',
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 30,
        marginTop: 50,
        borderWidth: 1,
        borderColor: '#366b29',
    },
    
    modalActionText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'SergioTrendy',
    },

    friendItem: {
        backgroundColor: '#fff',
        padding: 12,
        marginVertical: 6,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
      
    friendName: {
        fontSize: 16,
        fontFamily: 'PoppinsMedium',
        color: '#2b0e42',
    },
      
    friendEmail: {
        fontSize: 13,
        fontFamily: 'Poppins',
        color: '#666',
    },

    friendList: {
        width: '100%',
        paddingHorizontal: 20,
        marginTop: 180,
        marginBottom: 20,
        flexGrow: 1,

    },

    titleContainer: {
        paddingTop: 50,
        alignItems: 'center',
        justifyContent: 'center',
        
    },
      
    circleBackground: {
        position: 'absolute',
        width: '100%',
        height: 350,
        backgroundColor: '#9975c9', 
        borderBottomLeftRadius: 185,
        borderBottomRightRadius: 185,
        zIndex: 0,
    },

    cancelButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    }
});