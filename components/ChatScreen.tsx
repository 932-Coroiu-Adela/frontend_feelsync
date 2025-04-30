import { useUserData } from "@/hooks/useUserData";
import socket from "@/scripts/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

interface Message {
    senderId: string;
    content: string;
    sentAt: string;
}

export const ChatScreen = ({route}: any) => {
    const { receiverId } = route.params;
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [currentUserId, setCurrentUserId] = useState<number | null>(null); 

    useEffect(() => {
        const initializeChat = async () => {
            const userId = useUserData().userData?.id;
            setCurrentUserId(userId??null);
            socket.connect();
            socket.emit('register', userId);
            socket.emit('get_last_messages', {userId1: userId, userId2: receiverId});
        }

        initializeChat();

        socket.on('last_messages', (messages: Message[]) => {
            setMessages(messages);
        });

        socket.on('receive_message', (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off('last_messages');
            socket.off('receive_message');
            socket.disconnect();
        }
    });

    const sendMessage = async () => {
        if (currentUserId && messageText.trim()) {
            const message = {
                senderId: currentUserId.toString(),
                receiverId: receiverId,
                content: messageText,
            };

            socket.emit('send_message', message);
            setMessages((prevMessages) => [...prevMessages, { ...message, sentAt: new Date().toISOString() }]);
            setMessageText('');
        }
    }

    const renderItem = ({ item }: { item: Message }) => (
        <View style={styles.messageContainer}>
          <Text style={styles.messageSender}>{item.senderId === currentUserId?.toString() ? 'You' : 'Friend'}:</Text>
          <Text style={styles.messageContent}>{item.content}</Text>
          <Text style={styles.messageTime}>{new Date(item.sentAt).toLocaleTimeString()}</Text>
        </View>
      );
    
      return (
        <View style={styles.container}>
          <FlatList
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Type your message..."
              style={styles.input}
            />
            <Button title="Send" onPress={sendMessage} />
          </View>
        </View>
    );
};

    
const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    messagesList: { paddingBottom: 10 },
    messageContainer: { marginBottom: 10 },
    messageSender: { fontWeight: 'bold' },
    messageContent: { fontSize: 16 },
    messageTime: { fontSize: 12, color: 'gray' },
    inputContainer: { flexDirection: 'row', alignItems: 'center' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginRight: 10 },
  });
