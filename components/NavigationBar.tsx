import { TouchableOpacity, View, Image } from 'react-native';
import { StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

const NavigationBar = () => {
    const router = useRouter();

    return (
        <View style={styles.navBar}>
            <TouchableOpacity onPress={() => router.replace('/home')}>
                {/*home icon*/}
                <Image
                    style={styles.navBarImage}
                    source={require('@/assets/images/home.png')}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/events')}>
                {/*events icon*/}
                <Image
                    style={styles.navBarImage}
                    source={require('@/assets/images/calendar.png')}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/friends')}>
                {/*friends icon*/}
                <Image
                    style={styles.navBarImage}
                    source={require('@/assets/images/friends.png')}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/chatbot')}>
                {/*chatbot icon*/}
                <Image
                    style={styles.navBarImage}
                    source={require('@/assets/images/robot.png')}
                />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace('/profile')}>
                {/*profile icon*/}
                <Image
                    style={styles.navBarImage}
                    source={require('@/assets/images/question.png')}
                />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    navBarImage: {
        width: 35,
        height: 35,
    },

    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#faf6f6',
        paddingVertical: 10,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#7b3f72',
        borderRadius: 40,
    }
});

export default NavigationBar;
