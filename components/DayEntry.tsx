import { View, Text } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";

type DayEntryProps = {
    color: string;
    day: number;
}

export function DayEntry({color, day}: DayEntryProps): React.ReactElement {
    
    return (
        <View style={[styles.dayEntry, {backgroundColor: color}]}>
            <Text style={styles.dayText}>{day}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    
    dayEntry: {
        width: 32,
        height: 32,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        
    },

    dayText: {
        color: "black",
        fontSize: 10,
        fontFamily: "PoppinsMedium",
    },
});