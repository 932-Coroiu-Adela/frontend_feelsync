import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useUserData } from "@/hooks/useUserData";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View, ImageBackground, TextInput, ScrollView, TouchableOpacity, Image, Platform, Modal, FlatList, Dimensions, Alert } from "react-native";
import api from "@/scripts/api";
import NavigationBar from "@/components/NavigationBar";
import { StyleSheet } from "react-native";
import React from "react";
import { BlurView } from "expo-blur";    
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from "react-native-chart-kit";
import { WaterIntakeCalendar } from "@/components/WaterIntakeCalendar";
import { MoodsCalendar } from "@/components/MoodsCalendar";
import { useNavigation } from "expo-router";

type LogType = {
    id: number;
    log_date: string;
    mood: string;
    positive_note: string;
    sleep_time: string;
    todo_list: string;
    user_id: number;
    wakeup_time: string;
    water_intake: number;
};

const initialLogState = {
    log_date: new Date().toLocaleDateString('en-CA'),
    mood: '',
    todo_list: '[]',
    water_intake: 0,
    wakeup_time: '',
    sleep_time: '',
    positive_note: ''
}

export default function HomeScreen() {

    const { userData, loading, error } = useUserData(); 
    console.log(AsyncStorage.getItem("userData"));
    const [log, setLog] = useState(initialLogState);
    const [originalLog, setOriginalLog] = useState(initialLogState);

    const [showWakePicker, setShowWakePicker] = useState(false);
    const [showSleepPicker, setShowSleepPicker] = useState(false);

    const [moodModalVisible, setMoodModalVisible] = useState(false);

    const [newTodo, setNewTodo] = useState('');
    const [todoItems, setTodoItems] = useState<string[]>([]);

    const [statsModalVisible, setStatsModalVisible] = useState(false);
    const [allLogsData, setAllLogsData] = useState<LogType[] | null>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    const navigation = useNavigation();
      
    const isLogComplete = useMemo(() => {
        return !!log.mood && log.water_intake > 0 && !!log.wakeup_time && !!log.sleep_time;
    }, [log]);

    useEffect(() => {
        logAllStorage();
        fetchTodaysLog();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (isLogComplete) {
                return;
            }

            let alertTitle = 'Almost there';
            let alertMessage = 'You have unsaved changes. Are you sure you want to leave?😥';

            if(!log.mood) {
                alertTitle = 'Hold on!';
                alertMessage = 'You haven\'t selected your mood yet.😊 Are you sure you want to leave?';
            }
            else if(log.water_intake === 0) {
                alertTitle = 'Just a moment!';
                alertMessage = 'How about drinking some water before you go?🥤';
            } else if (!log.wakeup_time || !log.sleep_time) {
                alertTitle = 'Almost there!';
                alertMessage = 'How about logging when you woke up and went to sleep?💤';
            }

            e.preventDefault();

            Alert.alert(alertTitle,
                alertMessage,
                [
                    { text: "Stay", style: 'cancel', onPress: () => {} },
                    {
                        text: 'Leave anyway',
                        style: 'destructive',
                        onPress: () => navigation.dispatch(e.data.action),
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, isLogComplete, log]);

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
                console.log('Fetch todays log - No session token found');
                return;
            }

            const response = await api.get('/logs/today', {
                headers: {
                    Authorization: token,
                },
            });

            if (response.data && response.data.data && response.data.data.length > 0) {
                const fetchedLog = response.data.data?.[0];
                let dateToSet = fetchedLog.log_date;
                if (dateToSet && typeof dateToSet === 'string' && dateToSet.includes('T')) {
                    const dateObj = new Date(dateToSet);
                    dateToSet = dateObj.toLocaleDateString('en-CA');
                }
                const newLogState = {
                    log_date: new Date(fetchedLog.log_date).toLocaleDateString('en-CA'),
                    mood: fetchedLog.mood || '',
                    todo_list: fetchedLog.todo_list || '[]',
                    water_intake: fetchedLog.water_intake || 0,
                    wakeup_time: fetchedLog.wakeup_time || '',
                    sleep_time: fetchedLog.sleep_time || '',
                    positive_note: fetchedLog.positive_note || ''
                };
                setLog(newLogState);
                setOriginalLog(newLogState);
                const parsed = JSON.parse(fetchedLog.todo_list || '[]');
                setTodoItems(parsed);
                
            } else {
                console.log('No log found for today.');
                //setLog(prevLog => ({ ...prevLog, log_date: new Date().toLocaleDateString('en-CA') }));
                setLog(initialLogState);
                setOriginalLog(initialLogState);
            }
        }
        catch (error) {
            console.log('Error fetching log:', error);
        }
    };

    const handleUpdateField = async (field: string, value: string | number) => {
        const updatedLog = {...log, [field]: value};
        setLog(updatedLog);
        console.log("Sending updated log to server:", updatedLog);
        await sendLogToServer(updatedLog);
    }

    const sendLogToServer = async (logData: typeof log) => {
        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                console.log('Send log to server - No session token found');
                return;
            }

            console.log('Preparing to send log to server:', logData);

            const validatedLogData = {
                log_date: logData.log_date,
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
        }
    }

    const fetchAllLogs = async () => {
        try {
            const token = await AsyncStorage.getItem('sessionToken');
            if (!token) {
                console.log('Fetch all logs - No session token found');
                return;
            }

            const response = await api.get('/logs/all', {
                headers: {
                    Authorization: token,
                },
            });

            if (response.data && response.data.data) {
                setAllLogsData(response.data.data);
                console.log('All logs:', response.data.data);
            } else {
                console.log('No logs found.');
            }
        } catch (error) {
            console.log('Error fetching all logs:', error);
        }
    }

    const openStatsModal = () => {
        setStatsModalVisible(true);
        fetchAllLogs();
    };

    const addTodoItem = () => {
        if (!newTodo.trim()) return;
        const updatedTodos = [...todoItems, newTodo.trim()];
        setTodoItems(updatedTodos);
        setNewTodo('');
        handleUpdateField('todo_list', JSON.stringify(updatedTodos));
    };

    const monthlyMoodsChartData = useMemo(() => {
        console.log("Calculating monthly moods data...");
        
        if (!allLogsData || allLogsData.length === 0) {
            return null;
        }
        
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        
        const monthlyLogs = allLogsData.filter(log => {
            const logDate = new Date(log.log_date);
            return logDate.getMonth() === month && logDate.getFullYear() === year;
        });
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const moods = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateForComparison = new Date(year, month, day).toLocaleDateString('en-CA');
            const logForDay = monthlyLogs.find(log => {
                const logDateOnly = new Date(log.log_date).toLocaleDateString('en-CA');
                return logDateOnly === dateForComparison;
            });

            return logForDay ? logForDay.mood : '';
        });

        console.log("Mood values for the month:", moods);
        return moods;
    }, [allLogsData]);

    const monthlyWaterIntakeChartData = useMemo(() => {
        console.log("Calculating monthly water intake data...");
        
        if (!allLogsData || allLogsData.length === 0) {
            return null;
        }
        
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        
        const monthlyLogs = allLogsData.filter(log => {
            const logDate = new Date(log.log_date);
            return logDate.getMonth() === month && logDate.getFullYear() === year;
        });
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const waterIntakeValues = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateForComparison = new Date(year, month, day).toLocaleDateString('en-CA');
            const logForDay = monthlyLogs.find(log => {
                const logDateOnly = new Date(log.log_date).toLocaleDateString('en-CA');
                return logDateOnly === dateForComparison;
            });

            return logForDay ? logForDay.water_intake || 0 : 0;
        });

        console.log("Water intake values for the month:", waterIntakeValues);
        return waterIntakeValues;
    }, [allLogsData]);

    const monthlySleepChartData = useMemo(() => {
        console.log("Calculating monthly sleep chart data...");
        console.log(allLogsData);
        if (!allLogsData || allLogsData.length === 0) {
            return null; 
        }

        const month = (new Date()).getMonth();
        const year = (new Date).getFullYear();

        const monthlyLogs = allLogsData.filter(log => {
            const logDate = new Date(log.log_date);
            console.log("Month: ", logDate.getMonth(), "Year: ", logDate.getFullYear());
            return logDate.getMonth() === month && logDate.getFullYear() === year;
        });
        
        const sleepCounts = monthlyLogs.reduce((acc, log) => {
            if (log.sleep_time && log.wakeup_time) {
                console.log("Processing log:", log);
                const sleep = new Date(`1970-01-01T${log.sleep_time}`);
                const wake = new Date(`1970-01-01T${log.wakeup_time}`);
                let hours = (wake.getTime() - sleep.getTime()) / 3600000;
                console.log("Sleep time:", log.sleep_time, "Wakeup time:", log.wakeup_time, "Hours:", hours);
                if (hours < 0) hours += 24;
                const rounded = Math.round(hours);
                acc[rounded] = (acc[rounded] || 0) + 1;
            }
            return acc;
        }, {} as Record<number, number>);
        
        const sortedSleepHours = Object.keys(sleepCounts).map(Number).sort((a, b) => a - b);
        if (sortedSleepHours.length === 0) {
            return null;
        }

        const sleepValues = sortedSleepHours.map(hour => sleepCounts[hour]);
        
        return {
            labels: sortedSleepHours.map(String),
            datasets: [{ data: sleepValues }],
            segments: Math.max(1, ...sleepValues) 
        };
    }, [allLogsData]);

    const chartConfig = {
        backgroundGradientFrom: "#a9d7ff",
        backgroundGradientTo: "#ffc57e",
        
        decimalPlaces: 0,
        color: () => "#00000021",
        labelColor: () => "#000000",
        style: {
            borderRadius: 16,
        },
        fillShadowGradient: "#4b4134",
        fillShadowGradientOpacity: 1,
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
                                <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={() => setMoodModalVisible(false)}>
                                    <Ionicons name="close-circle" size={32} color="black" />
                                </TouchableOpacity>
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
                            onSubmitEditing={addTodoItem}
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
                            onBlur={() => sendLogToServer(log)}
                            multiline
                        />
                    </View>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={statsModalVisible}
                        onRequestClose={() => setStatsModalVisible(false)}
                        >
                        <View style={styles.modalOverlayStats}>
                            <View style={styles.statsModalContent}>
                                <Text style={styles.modalTitle}>Monthly stats 📊</Text>
                                <ScrollView contentContainerStyle={styles.chartScrollView}>
                                    {statsLoading ? (
                                        <ActivityIndicator size="large" color="#2b0e42" />
                                    ) : (
                                        <>
                                            <Text style={styles.chartTitle}>Sleep duration trends 💤</Text>
                                            {monthlySleepChartData ? (
                                                <BarChart 
                                                data={monthlySleepChartData} 
                                                width={Dimensions.get('window').width * 0.8} 
                                                height={220} yAxisLabel="" 
                                                yAxisSuffix=" days" 
                                                chartConfig={chartConfig} 
                                                style={styles.chartStyle} 
                                                segments={monthlySleepChartData.segments} 
                                                fromZero={true} 
                                                xAxisLabel="h"/>
                                            ) : <Text style={styles.noDataText}>No sleep data for this month.</Text>}

                                            <Text style={styles.chartTitle}>Daily water intake 💧</Text>
                                                {monthlyWaterIntakeChartData ? (
                                                    <WaterIntakeCalendar waterIntakeArray={monthlyWaterIntakeChartData} />
                                                ) : <Text style={styles.noDataText}>No water intake data for this month.</Text>}
                                            
                                            <View style={{ height: 20 }} />

                                            <Text style={styles.chartTitle}>Monthly mood overview 😊</Text>
                                                {monthlyMoodsChartData ? (
                                                    <MoodsCalendar moodsArray={monthlyMoodsChartData} />
                                                ) : <Text style={styles.noDataText}>No mood data for this month.</Text>}
                                            
                                            <View style={{ height: 20 }} />

                                        </>

                                    )}
                                </ScrollView>

                                <TouchableOpacity style={styles.closeButton} onPress={() => setStatsModalVisible(false)}>
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                </ScrollView>
                <TouchableOpacity style={styles.statsButton} onPress={openStatsModal}>
                    <Image source={require('@/assets/images/statistics.png')} style={{ width: 38, height: 38}} />
                </TouchableOpacity> 
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
        maxHeight: '80%',
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

    statsButton: {
        position: 'absolute',
        bottom: 70,
        right: 10,
        width: 60,
        height: 60,
        borderRadius: 30, 
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#898989',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.55,
        shadowRadius: 3.84,
        elevation: 5,
    },

    modalOverlayStats: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    statsModalContent: {
        backgroundColor: '#fffbfbf4',
        padding: 20,
        borderRadius: 20,
        width: '95%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '95%',
    },

    modalTitle: {
        fontSize: 22,
        fontFamily: 'SergioTrendy', 
        marginBottom: 15,
        flexShrink: 0,
    },

    closeButton: {
        backgroundColor: '#9249cd',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        flexShrink: 0,
    },

    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'SergioTrendy', 
    },
        
    noDataText: { 
        textAlign: 'center', 
        paddingVertical: 50, 
        fontFamily: 'Poppins', 
        color: '#666' 
    },

    chartScrollView: { 
        width: '100%' 
    },

    chartTitle: { 
        fontFamily: 'SergioTrendy', 
        fontSize: 16, 
        marginTop: 15, 
        marginBottom: 5, 
        textAlign: 'center' 
    },

    chartStyle: { 
        marginVertical: 8, 
        borderRadius: 16 
    },
});