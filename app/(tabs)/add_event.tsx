import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Alert } from "react-native";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import moment from "moment";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import api from "@/scripts/api";


export default function AddEventScreen() {
    const router = useRouter();

    const [eventDate, setEventDate] = useState(new Date());
    const [eventTime, setEventTime] = useState(new Date());
    const [description, setDescription] = useState("");
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setEventDate(selectedDate);
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) setEventTime(selectedTime);
    };

    const handleSubmit = async () => {
        if (!description) {
            alert("Please enter a description for the event.");
            return;
        }

        if (!eventDate || !eventTime) {
            alert("Please select a date and time for the event.");
            return;
        }

        const token = await AsyncStorage.getItem("sessionToken");

        const formattedDate = moment(eventDate).format("DD/MM/YYYY");
        const formattedTime = moment(eventTime).format("HH:mm");

        const eventData = {
            event_date: formattedDate,
            event_time: formattedTime,
            description: description,
        };

        if (!token) {
            alert("No token found. Please log in again.");
            return;
        }

        try 
        {
            const response = await api.post("/events/add", eventData, {
                headers: {
                    Authorization: token,
                },
            });
            console.log("Event created successfully:", response.data);

            Alert.alert(
                "Event created! ",
                "Your event has been created successfully. 🎉")
            
        } 
        catch (error) 
        {
            console.error("Error creating event:", error);
            alert("Failed to create event. Please try again.");
        }
        
        

        router.push("/events");
    };

    const handleCancel = () => {
        router.replace("/events");
    };

    return (
        <ImageBackground source={require('@/assets/images/background1.jpg')} style={styles.background}>
            <BlurView intensity={20} style={styles.blur_overlay}/>
            <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
                <Text style={styles.title}>Creating a new event</Text>

                {/* date picker */}
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.inputText}>{moment(eventDate).format("DD/MM/YYYY")}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={eventDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}

                {/* time picker */}
                <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.inputText}>{moment(eventTime).format("HH:mm")}</Text>
                </TouchableOpacity>
                {showTimePicker && (
                    <DateTimePicker
                        value={eventTime}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                    />
                )}

                {/* description input */}
                <TextInput
                    style={styles.textArea}
                    placeholder="Event Description"
                    placeholderTextColor="#999"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                <LinearGradient
                          colors={['#ba94ac', '#361451']}
                          style={styles.add_button}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}>
                    <TouchableOpacity style={styles.button_wrapper} onPress={() => {handleSubmit()}}>
                        <Text style={styles.buttonText1}>ADD THE EVENT</Text>
                    </TouchableOpacity>
                </LinearGradient>
                        
                <TouchableOpacity style={styles.cancel_button} onPress={() => {handleCancel()}}>
                    <Text style={styles.buttonText2}>CANCEL</Text>
                </TouchableOpacity>
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
        justifyContent: "center",
    },

    blur_overlay: {
        ...StyleSheet.absoluteFillObject,
    },

    container: {
        flex: 1,
        padding: 20,
    },

    containerContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 50, 
    },

    title: {
        fontSize: 30,
        marginTop: 15,
        fontFamily: "SergioTrendy",
        color: "#2b0e42",
        marginBottom: 50,
    },

    input: {
        width: "100%",
        padding: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 15,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
    },

    inputText: {
        fontSize: 16,
        fontFamily: 'Poppins',
        color: "#333",
    },

    textArea: {
        width: "100%",
        height: 100,
        padding: 15,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 15,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        textAlignVertical: "top",
        marginVertical: 10,
        fontFamily: 'PoppinsMedium',
    },

    buttonText1: {
        fontSize: 18,
        color: "white",
        fontFamily: "SergioTrendy",
        textAlign: "center",
    },

    buttonText2: {
        fontSize: 18,
        color: "#380760",
        fontFamily: "SergioTrendy",
        textAlign: "center",
    },

    add_button: {
        borderRadius: 20,
        width: 250,
        padding: 10,
        marginTop: 100,
        borderWidth: 1,
        borderColor: '#1b032f',
    },

    cancel_button: {
        backgroundColor: "#f5f5f5c0",
        padding: 10,
        borderWidth: 1,
        borderColor: '#3d190f',
        borderRadius: 20,
        width: 250,
        marginTop: 20,
    },  

    button_wrapper: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 0,
    },
});
