import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/scripts/api';
import { FlatList, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import EventSource from 'react-native-sse';
import { router, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at: string;
};

export default function ChatScreen() {

  const { friendId, friendName } = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = async (friendId: any, messageContent: any) => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      if (!token) {
        console.error('No session token found');
        return;
      }

      const response = await api.post('/messages/send', {receiver_id: friendId, message: messageContent}, 
        {
          headers: {Authorization: token}
        });

      if (response.status === 200) {
        console.log('Message sent successfully:', response.data);
        console.log({
          id: response.data.data.id,
          sender_id: response.data.data.sender_id,
          receiver_id: response.data.data.receiver_id,
          content: response.data.data.content,
          sent_at: response.data.data.sent_at,
        });
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: response.data.data.id,
            sender_id: response.data.data.sender_id,
            receiver_id: response.data.data.receiver_id,
            content: response.data.data.content,
            sent_at: response.data.data.sent_at,
          }
        ])
      } else {
        console.error('Error sending message:', response.status, response.data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  const fetchMessagesHistory = async (friendId: any) => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      
      if (!token) {
        console.error('No session token found');
        return;
      }

      const response = await api.post('/messages/history', { friendId: friendId },
        {
          headers: { Authorization: token }
        });

      if (response.status === 200) {
        return response.data.data;
      } else {
        console.error('Error fetching messages history:', response.status, response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching messages history:', error);
      return [];
    }
  }

  const startMessageStream = async (friendId: any) => {
    try {
      const token = await AsyncStorage.getItem('sessionToken');
      
      if (!token) {
        console.error('No session token found');
        return;
      }
      
      const url = new URL(`${api.defaults.baseURL}/sse/messages`);
      url.searchParams.append("token", token);
      url.searchParams.append("friendId", friendId);
      const es = new EventSource(url.toString());
      es.addEventListener('open', () => {
        console.log('SSE connection opened.');
      });
      es.addEventListener('message', (event) => {
        const newMessage = JSON.parse(event.data || '');
        console.log('New message received:', newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
      es.addEventListener('error', (event) => {
        console.error('SSE connection error:', event.type, event);
        es.close();
      });
  
      return es;
  
    } catch (error) {
      console.error('Error starting message stream:', error);
      return null;
    }
  };
  
  useEffect(() => {
    const fetchMessages = async () => {
      const history = await fetchMessagesHistory(friendId);
      if (history) {
        setMessages(history);
      }
    };

    fetchMessages();

    const eventSourcePromise = startMessageStream(friendId);

    return () => {
      eventSourcePromise.then((eventSource) => {
        if (eventSource) {
          eventSource.close();
        }
      });
    };
  }, [friendId]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage(friendId, newMessage);
      setNewMessage('');
    }
  }

  const renderItem = ({ item }: { item: Message }) => {
    const isSender = item.sender_id !== Number(friendId);

    const formattedTime = new Intl.DateTimeFormat('default', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(item.sent_at));

    return (
      <View style={[styles.messageContainer, isSender ? styles.senderMessage : styles.friendMessage]}>
        <Text style={isSender ? styles.senderMessageText : styles.friendMessageText}>
          {item.content}
        </Text>
        <Text style={isSender ? styles.senderTimeText : styles.friendTimeText}>
          {formattedTime}
        </Text>
      </View>
    );
  };

  return (
    
    <ImageBackground source={require('@/assets/images/background7.jpg')} style={styles.background}>
      <BlurView intensity={130} style={styles.blur_overlay}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/friends')} style={styles.backButton}>
          <Image source={require('@/assets/images/back_button.png')} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
        <Text style={styles.friendName}>{friendName}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Image source={require('@/assets/images/send_message.png')} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
      </View>
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

  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'white',
    width: '100%',
  },

  friendName: {
    fontSize: 20,
    paddingTop: 40,
    paddingBottom: 10,
    textAlign: 'center',
    width: '100%',
    fontFamily: 'SergioTrendy',
    backgroundColor: 'white',
    color: '#2348a0',
  },

  messagesContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },

  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 10,
    borderRadius: 25,
  },
  
  senderMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1859ff',
    borderWidth: 1,
    borderColor: '#a8bada',

  },
  
  friendMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#eaf8ff',
    borderWidth: 1,
    borderColor: '#b0cddb',
  },
  
  friendMessageText: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: 'black',
  },

  senderMessageText: {
    fontSize: 14,
    fontFamily: 'PoppinsMedium',
    color: 'white',
    padding: 1,
  },
  
  friendTimeText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    textAlign: 'right',
    color: '#888',
  },

  senderTimeText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    textAlign: 'right',
    color: '#d2d1d1',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#cccccc',
    paddingTop: 10,
  },
  
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 10,
    margin: 10,
    fontFamily: 'Poppins',
  },
  
  sendButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    padding: 15,
    margin: 10,
    
  },
  
  sendButtonText: {
    color: '#fff',
    fontFamily: 'SergioTrendy',
    fontSize: 16,
  },

  backButton: {
    position: 'absolute',
    zIndex: 1,
    top: 30,
    left: 10,
  },

});
