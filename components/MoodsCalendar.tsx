import React from "react";
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { DayEntry } from './DayEntry';
import { LinearGradient } from 'expo-linear-gradient';


type MoodsCalendarProps = {
    moodsArray: string[];
}

type MoodColorMap = {
    [key: string]: string;
}

const moodToColor: MoodColorMap = {
    happy: '#4CAF50', 
    sad: '#2196F3', 
    angry: '#ff695e',
    cheerful: '#FFEB3B',
    anxious: '#FF9800',
    grateful: '#E91E63',
    calm: '#00BCD4', 
    scared: '#673AB7',
    tired: '#607D8B', 
    disgusted:'#827717',
    ashamed: '#A1887F',
    confused: '#9C27B0',
    default: '#E0E0E0',        
};

const getColorForMood = (mood: string): string => {
    return moodToColor[mood] || moodToColor.default;
}

export function MoodsCalendar({ moodsArray }: MoodsCalendarProps): React.ReactElement {

    return (
        <View style={styles.container}>
            <View style={styles.daysContainer}>
                {moodsArray.map((mood, day) => (
                    <DayEntry
                        key={day + 1}
                        day={day + 1}
                        color={
                            getColorForMood(mood)
                        }
                    />
                ))}
            </View>

            <View style={styles.legend}>
                <Text style={styles.legendTitle}>Mood legend</Text>
                <View style={styles.legendItemsContainer}>
                    {Object.keys(moodToColor).map((mood) => {
                            if (mood === 'default') return null; 
                            return (
                                <View key={mood} style={styles.legendItem}>
                                    <View style={[styles.legendColorBox, { backgroundColor: moodToColor[mood] }]} />
                                    <Text style={styles.legendText}>
                                        {mood.charAt(0).toUpperCase() + mood.slice(1)}
                                    </Text>
                                </View>
                            );
                        })}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f6fa',
        borderRadius: 15,
        padding: 10,
        paddingTop: 20,
        borderWidth: 1,
        borderColor: '#dfe6e9',
    },

    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        padding: 10,
        gap: 2,
        width: 256,
        height: 200,
        backgroundColor: 'white',
    },

    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        gap: 9,
    },

    legend: {
        width: '90%',
        padding: 10,
        backgroundColor: '#f5f6fa',
        borderRadius: 8,
    },

    legendTitle: {
        fontFamily: 'PoppinsMedium',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 5,
        color: '#2d3436',
    },
    
    legendItemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '30%',
        marginBottom: 5,
        gap: 5,
    },

    legendColorBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
    },

    legendText: {
        fontSize: 9,
        color: '#2d3436',
        fontFamily: 'Poppins',
    },
});