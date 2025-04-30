import NavigationBar from '@/components/NavigationBar';
import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { View, Text, ImageBackground, ActivityIndicator, FlatList, ScrollView, TouchableOpacity, Image } from 'react-native';
import { StyleSheet } from 'react-native';
import { useEvents } from '@/hooks/useUserEvents';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { useRouter } from 'expo-router';

const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = moment(date).format('DD/MM/YYYY');
    

    return formattedDate;
};

export default function EventsScreen() {
    const router = useRouter();
    const [eventDate, setEventDate] = React.useState(getCurrentDate());
    const { events, loading, error } = useEvents(eventDate);

    useEffect(() => {
        if (error) {
            router.replace('/login');
        }
    }, [error, router]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }
    
    const onDateChange = (newDate: string) => {
        setEventDate(newDate);
    };
    
    return (
        <ImageBackground source={require('@/assets/images/background1.jpg')} style={styles.background}>
          <BlurView intensity={130} style={styles.blur_overlay}>
          <View style={styles.container}>
            <NavigationBar />

            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add_event')}>
              <Image style={styles.image} source={require('@/assets/images/add_button.png')}/>
            </TouchableOpacity>
            <Text style={styles.title}>Select Event Date</Text>
            <Calendar style={styles.calendar}
                theme={{
                    arrowColor: 'orange',
                    monthTextColor: 'black',
                    todayTextColor: 'green',
                    textDayFontFamily: 'Poppins',
                    textMonthFontFamily: 'PoppinsMedium',
                    textDayHeaderFontFamily: 'Poppins',
                    textDayFontSize: 12,
                    textMonthFontSize: 15,
                    textDayHeaderFontSize: 12,
                    textDayColor: 'black',
              }}
            />

            <View style={styles.eventsContainer}>
                <Text style={styles.title}>Events for</Text>
                <Text style={{fontFamily: 'PoppinsMedium', fontSize: 20, alignSelf: 'center', paddingBottom: 10}}>{eventDate}</Text>
                  {events.length === 0 ? (
                      <Text style={{fontFamily: 'Poppins', alignSelf: 'center'}}>No events for this date.</Text>
                  ) : (
                  <FlatList
                      data={events}
                      renderItem={({ item }) => (
                      <View style={styles.eventItem}>
                          <Text style={styles.itemFont}>{item.event_time} - {item.description}</Text>
                      </View>
                      )}
                      keyExtractor={(item) => item.id.toString()}
                  />
                  )}
          </View>
        </View>
      </BlurView>
    </ImageBackground>
    )
}
const styles = StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center',
    },

    calendar: {
        marginBottom: 40,
        height: 350, 
        width: '100%', 
        borderRadius: 15, 
        borderWidth: 1, 
        borderColor: '#ddd', 
        alignSelf: 'center', 
    },

    blur_overlay: {
      ...StyleSheet.absoluteFillObject,
    },

    container: {
      flex: 1,
      justifyContent: 'space-between',
      padding: 20,
    },

    title: {
      marginTop: 15,
      fontSize: 20,
      fontFamily: 'SergioTrendy',
      alignSelf: 'center',
      color: '#2b0e42',
      paddingBottom: 5,
    },

    eventsContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      marginTop: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 50,
      borderRadius: 15,
    },

    eventItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      
    },

    itemFont: {
        fontFamily: 'Poppins',
        fontSize: 16,
    },

    scrollView: {
      flex: 1,
      marginTop: 20,
    },

  addButton: {
    position: 'absolute',
    bottom: 65,
    right: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 10,
  },

  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  });