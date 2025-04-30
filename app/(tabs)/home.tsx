import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useUserData } from "@/hooks/useUserData";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View, ImageBackground, TextInput, ScrollView, TouchableOpacity, Image, Platform, Modal, FlatList } from "react-native";
import api from "@/scripts/api";
import NavigationBar from "@/components/NavigationBar";
import { StyleSheet } from "react-native";
import React from "react";
import { BlurView } from "expo-blur";    
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {

    const { userData, loading, error } = useUserData(); 
    console.log(AsyncStorage.getItem("userData"));
    const [log, setLog] = useState({
        log_date: new Date().toLocaleDateString('en-CA'),
        mood: '',
        todo_list: '[]',
        water_intake: 0,
        wakeup_time: '',
        sleep_time: '',
        positive_note: ''
    });

    const [showWakePicker, setShowWakePicker] = useState(false);
    const [showSleepPicker, setShowSleepPicker] = useState(false);

    const [moodModalVisible, setMoodModalVisible] = useState(false);

    const [newTodo, setNewTodo] = useState('');
    const [todoItems, setTodoItems] = useState<string[]>([]);

    useEffect(() => {
        logAllStorage();
        fetchTodaysLog();

    }, []);
      

    const logAllStorage = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const result = await AsyncStorage.multiGet(keys);
        
            console.log('📦 AsyncStorage contents:');
            result.forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
            });
        } catch (e) {
            console.error('Error reading AsyncStorage:', e);
        }
    };

    const fetchTodaysLog = async () => {
        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                console.error('No session token found');
                return;
            }

            const response = await api.get('/logs/today', {
                headers: {
                    Authorization: token,
                },
            });

            if (response.data && response.data.data && response.data.data.length > 0) {
                const fetchedLog = response.data.data?.[0];
                setLog({
                    log_date: fetchedLog.log_date || new Date().toLocaleDateString('en-CA'),
                    mood: fetchedLog.mood || '',
                    todo_list: fetchedLog.todo_list || '[]',
                    water_intake: fetchedLog.water_intake || 0,
                    wakeup_time: fetchedLog.wakeup_time || 'Not specified',
                    sleep_time: fetchedLog.sleep_time || 'Not specified',
                    positive_note: fetchedLog.positive_note || 'No positive note for today'
                });
                const parsed = JSON.parse(fetchedLog.todo_list || '[]');
                setTodoItems(parsed);
                
            } else {
                console.log('No log found for today.');
            }
        }
        catch (error) {
            console.log('Error fetching log:', error);
        }
    };

    const handleUpdateField = async (field: string, value: string | number) => {
        const updatedLog = {...log, [field]: value};
        setLog(updatedLog);
        sendLogToServer(updatedLog);
    }

    const sendLogToServer = async (logData: typeof log) => {
        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                console.error('No session token found');
                return;
            }

            console.log('Sending log to server:', logData);

            const validatedLogData = {
                log_date: logData.log_date || new Date().toLocaleDateString('en-CA'),
                mood: logData.mood || 'Not specified',
                todo_list: logData.todo_list || '[]',  
                water_intake: logData.water_intake || 0,
                wakeup_time: logData.wakeup_time || 'Not specified',
                sleep_time: logData.sleep_time || 'Not specified',
                positive_note: logData.positive_note || 'No positive note for today'
            };

            const response = await api.post('/logs', validatedLogData, {
                headers: {
                    Authorization: token,
                },
            });

            console.log('Log sent to server:', response.data);
            
        } catch (error) {
            console.log('Error sending log to server:', error);

            if (axios.isAxiosError(error) && error.response?.status === 400) {
                //
                // alert("Please fill all the fields before saving the log.");
                // Redirect to login screen or show a message
            }
        }
    }

   

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return (
            <View>
                <Text>Error: {error}</Text>
            </View>
        );
    }

    const addTodoItem = () => {
        if (!newTodo.trim()) return;
        const updatedTodos = [...todoItems, newTodo.trim()];
        setTodoItems(updatedTodos);
        setNewTodo('');
        handleUpdateField('todo_list', JSON.stringify(updatedTodos));
    };

    const getMoodIcon = (mood: string) => {
        const iconMap: { [key: string]: any } = {
          disgusted: require('@/assets/images/disgust.png'),
          cheerful: require('@/assets/images/cheerful.png'),
          angry: require('@/assets/images/anger.png'),
          ashamed: require('@/assets/images/shame.png'),
          scared: require('@/assets/images/fear.png'),
          anxious: require('@/assets/images/anxiety.png'),
          happy: require('@/assets/images/happiness.png'),
          sad: require('@/assets/images/sadness.png'),
          confused: require('@/assets/images/confusion.png'),
          tired: require('@/assets/images/tired.png'),
          calm: require('@/assets/images/calm.png'),
          grateful: require('@/assets/images/grateful.png'),
        };
        return iconMap[mood] || null;
    };
      


    return (
        <ImageBackground source={require('@/assets/images/background2.jpg')} style={styles.background}>
            <BlurView intensity={130} style={styles.blur_overlay}>
                <ScrollView style={styles.container}>
                    <View>
                        <Text style={styles.title}>Welcome, {userData?.name}</Text>
                    </View>
                    {/* mood card */}
                    <View style={styles.moodCard}>
                        <Text style={styles.label}>Current mood</Text>
                        <View style={styles.waterContainer}>
                            <TouchableOpacity style={styles.moodButton} onPress={() => setMoodModalVisible(true)}>
                                {log.mood ? (
                                    <>
                                        <Image source={getMoodIcon(log.mood)} style={styles.moodIcon} />
                                        <Text style={styles.selectMoodText}>{log.mood.charAt(0).toUpperCase() + log.mood.slice(1)}</Text>
                                    </>
                                    
                                        ) : (
                                            <>
                                                <Image source={require('@/assets/images/moods.png')} style={{ width: 45, height: 45 }} />
                                                <Text style={styles.selectMoodText}>Select mood</Text>
                                            </>
                                    
                                )}
                            </TouchableOpacity>
                            
                        </View>
                    </View>                

                    <Modal visible={moodModalVisible} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.selectMoodText}>Choose your mood</Text>
                                <View style={styles.iconGrid}>
                                    {[
                                        'disgusted', 'cheerful', 'angry', 'ashamed', 
                                        'scared', 'anxious', 'happy', 'sad', 'confused', 'tired', 'calm', 'grateful'
                                    ].map((moodType) => (
                                    <TouchableOpacity
                                        key={moodType}
                                        onPress={() => {
                                        handleUpdateField('mood', moodType);
                                        setMoodModalVisible(false);
                                        }}
                                    >
                                        <Image source={getMoodIcon(moodType)} style={styles.modalIcon} />
                                        <Text style={styles.selectMoodText}>{moodType.charAt(0).toUpperCase() + moodType.slice(1)}</Text> 
                                    </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* water intake card */}
                    <View style={styles.waterIntakeCard}>
                        <Text style={styles.label}>Water intake</Text>
                        <View style={styles.waterContainer}>
                            <Image source={require('@/assets/images/water.png')} style={{ width: 45, height: 45 }} />
                            <TouchableOpacity
                                style={styles.waterButton}
                                onPress={() => handleUpdateField('water_intake', Math.max(0, log.water_intake - 1))}
                            >
                                <Text style={styles.waterButtonText}>−</Text>
                            </TouchableOpacity>

                            <Text style={styles.waterValue}>{log.water_intake} glasses</Text>

                            <TouchableOpacity
                                style={styles.waterButton}
                                onPress={() => handleUpdateField('water_intake', log.water_intake + 1)}
                            >
                                <Text style={styles.waterButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* time picker */}
                    <View style={styles.timeContainer}>
                        <TouchableOpacity style={styles.timeSquareWakeup} onPress={() => setShowWakePicker(true)}>
                            <Text style={styles.timeLabelWakeup}>Wakeup time</Text>
                            <Image source={require('@/assets/images/sun.png')} style={{ width: 45, height: 45 }} />
                            <Text style={styles.timeTextWakeup}>{log.wakeup_time || "Select time"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.timeSquareSleep} onPress={() => setShowSleepPicker(true)}>
                            <Text style={styles.timeLabelSleep}>Sleep time</Text>
                            <Image source={require('@/assets/images/moon.png')} style={{ width: 45, height: 45 }} />
                            <Text style={styles.timeTextSleep}>{log.sleep_time || "Select time"}</Text>
                        </TouchableOpacity>
                    </View>

                        {showWakePicker && (
                            <DateTimePicker
                                value={log.wakeup_time ? new Date(`1970-01-01T${log.wakeup_time}`) : new Date()}
                                mode="time"
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => {
                                setShowWakePicker(false);
                                if (date) {
                                    const formatted = date.toTimeString().slice(0, 5);
                                    handleUpdateField('wakeup_time', formatted);
                                }
                                }}
                            />
                        )}

                        {showSleepPicker && (
                            <DateTimePicker
                                value={log.sleep_time ? new Date(`1970-01-01T${log.sleep_time}`) : new Date()}
                                mode="time"
                                is24Hour={true}
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => {
                                setShowSleepPicker(false);
                                if (date) {
                                    const formatted = date.toTimeString().slice(0, 5);
                                    handleUpdateField('sleep_time', formatted);
                                }
                                }}
                            />
                        )}

                    {/* to do list card */}
                    <View style={styles.cardContainer}>
                        <Text style={styles.label}>To Do List</Text>
                        <Image source={require('@/assets/images/list.png')} style={{ width: 45, height: 45 }} />

                        {todoItems.length === 0 ? (
                            <Text style={styles.emptyText}>No tasks added yet.</Text>
                        ) : (
                            todoItems.map((item, index) => (
                            <View key={index} style={styles.todoRow}>
                                <Text style={styles.todoBullet}>•</Text>
                                <Text style={styles.todoText}>{item}</Text>
                            </View>
                            ))
                        )}

                        <View style={styles.todoInputRow}>
                            <TextInput
                            style={styles.todoInput}
                            placeholder="Add a task..."
                            value={newTodo}
                            onChangeText={setNewTodo}
                            />
                            <TouchableOpacity onPress={addTodoItem}>
                            <Ionicons name="add-circle" size={32} color="#2b0e42" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* positive note card */}
                    <View style={styles.positiveNoteCard}>
                        <Text style={styles.label}>Positive Note</Text>
                        <Image source={require('@/assets/images/positive.png')} style={{ width: 45, height: 45 }} />
                        <TextInput
                            style={styles.inputCardNote}
                            value={log.positive_note}
                            onChangeText={(text) => handleUpdateField('positive_note', text)}
                            multiline
                        />
                    </View>

                </ScrollView>
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
            padding: 20,
            marginBottom: 55,
        },

        title: {
            marginTop: 35,
            fontSize: 40,
            fontFamily: 'SergioTrendy',
            alignSelf: 'center',
            color: '#2b0e42',
        },

        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        input: {
            borderWidth: 1,
            borderColor: '#aaa',
            padding: 8,
            marginBottom: 12,
            borderRadius: 6
        },

        label: {
            fontFamily: 'SergioTrendy',
            fontSize: 20,
            marginBottom: 4
        },

        waterIntakeCard: {
            marginVertical: 12,
            padding: 16,
            borderWidth: 2,
            borderColor: '#7caac8',
            borderRadius: 50,
            backgroundColor: 'rgb(214, 238, 251)', 
            alignItems: 'center',
        },

        waterContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 10,
        },
        
        waterButton: {
            backgroundColor: '#6793c5',
            borderRadius: 30,
            padding: 12,
            width: 60,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            marginHorizontal: 15,
        },
        
        waterButtonText: {
            color: 'white',
            fontSize: 25,
            alignContent: 'center',
            fontFamily: 'Poppins',
        },
        
        waterValue: {
            fontSize: 18,
            fontFamily: 'Poppins',
            color: 'black',
        },

        timeContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
          
        timeSquareWakeup: {
            flex: 1,
            aspectRatio: 1, 
            marginHorizontal: 4,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fade70',
            borderRadius: 35,
            borderWidth: 2,
            borderColor: '#f1b32d',
            
        },

        timeSquareSleep: {
            flex: 1,
            aspectRatio: 1, 
            marginHorizontal: 4,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#89a0ec',
            borderRadius: 35,
            borderWidth: 2,
            borderColor: '#4462c6',
        },
          
        timeTextWakeup: {
            paddingTop: 10,
            fontSize: 18,
            color: 'black',
            fontFamily: 'PoppinsMedium',
        },

        timeTextSleep: {
            paddingTop: 10,
            fontSize: 18,
            color: '#fff',
            fontFamily: 'PoppinsMedium',
        },
          
        timeLabelWakeup: {
            fontSize: 18,
            color: 'black',
            fontFamily: 'SergioTrendy',
            marginBottom: 4,
            textAlign: 'center',
            paddingBottom: 10,
        },

        timeLabelSleep: {
            fontSize: 18,
            color: '#fff',
            fontFamily: 'SergioTrendy',
            marginBottom: 4,
            textAlign: 'center',
            paddingBottom: 10,
        },
          
        moodIcon: {
            width: 40,
            height: 40,
            resizeMode: 'contain',
            
        },
          
        selectMoodText: {
            fontFamily: 'SergioTrendy',
            color: 'black',
            fontSize: 16,
            textAlign: 'center',
        },
          
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
        },
          
        modalContent: {
            backgroundColor: '#ffffff',
            padding: 20,
            borderRadius: 20,
            width: '85%',
        },
          
        modalTitle: {
            fontSize: 18,
            fontFamily: 'PoppinsBold',
            textAlign: 'center',
            marginBottom: 15,
        },
          
        iconGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
          
        modalIcon: {
            width: 60,
            height: 60,
            margin: 10,
            resizeMode: 'contain',
        },

        moodCard: {
            marginTop: 20,
            padding: 16,
            borderWidth: 2,
            borderColor: '#7ec867',
            borderRadius: 50,
            backgroundColor: '#bfe9b2', 
            alignItems: 'center',
        },
          
        moodButton: {
            alignItems: 'center',
        },

        cardContainer: {
            backgroundColor: '#ffd1ff',
            padding: 16,
            marginVertical: 12,
            width: '100%',
            alignSelf: 'stretch',
            borderColor: '#9b56a5',
            borderWidth: 2,
            borderRadius: 50,
            alignItems: 'center',
        },
          
        inputCard: {
            backgroundColor: '#f3f3f3',
            width: '100%',
            borderRadius: 10,
            padding: 10,
            fontSize: 16,
            marginTop: 8,
            height: 80, 
        },

        todoItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
        },

        todoRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginVertical: 4,
        },
          
        todoBullet: {
        marginRight: 8,
        fontSize: 18,
        color: '#2b0e42',
        },
          
        todoText: {
            flex: 1,
            fontSize: 16,
            color: '#2b0e42',
        },
          
        todoInputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
        },
          
        todoInput: {
        flex: 1,
        backgroundColor: '#fce3ff',
        padding: 10,
        borderRadius: 10,
        fontSize: 16,
        marginRight: 8,
        },
          
        emptyText: {
            fontStyle: 'italic',
            color: '#888',
            marginTop: 8,
        },

        positiveNoteCard: {
            backgroundColor: '#ffd2dd',
            padding: 16,
            width: '100%',
            alignSelf: 'stretch',
            borderColor: '#cd657f',
            borderWidth: 2,
            borderRadius: 50,
            alignItems: 'center',
            marginBottom: 50,
        },

        inputCardNote: {
            backgroundColor: '#ffd2dd',
            width: '100%',
            borderRadius: 10,
            padding: 10,
            fontSize: 16,
            marginTop: 8,
            height: 80, 
        },
          
});