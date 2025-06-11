import React from 'react';
import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native';
import { DayEntry } from './DayEntry';
import { red } from 'react-native-reanimated/lib/typescript/Colors';
import { LinearGradient } from 'expo-linear-gradient';

type WaterIntakeCalendarProps = {
    waterIntakeArray: number[];
}

const getColorForCups = (cups: number) => {
    if (cups === 0) return '#dfe6e9'; 
    if (cups <= 2) return '#ff7675'; 
    if (cups <= 4) return '#fdcb6e'; 
    if (cups < 6) return '#55ef9a';  
    return '#00b86b';              
};

export function WaterIntakeCalendar({ waterIntakeArray }: WaterIntakeCalendarProps): React.ReactElement {

    return (
        <View style={styles.container}>
            <View style={styles.daysContainer}>
                {waterIntakeArray.map((cups, day) => (
                    <DayEntry
                        key={day + 1}
                        day={day + 1}
                        color={
                            getColorForCups(cups)
                        }
                    />
                ))}
            </View>

            <View style={styles.legendContainer}>
                <Text style={styles.legendText}>Less</Text>
                <LinearGradient
                    colors={['#ff7675', '#fdcb6e', '#55ef9a', '#00b86b']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <Text style={styles.legendText}>Goal (6+)</Text>
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
        paddingHorizontal: 10,
        gap: 8,
    },

    gradient: {
        width: 120, 
        height: 15,
        borderRadius: 7,
    },

    legendText: {
        padding: 5,
        fontFamily: 'PoppinsMedium',
        fontSize: 12,
        color: '#2d3436',
    },
});