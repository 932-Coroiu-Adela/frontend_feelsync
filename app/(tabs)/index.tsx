import { Image, StyleSheet, View, Text, ImageBackground, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { BlurView } from 'expo-blur';
import { Link, useNavigation } from 'expo-router';

export default function IndexScreen() {
  
  return (
    <ImageBackground source={require('@/assets/images/background3.jpg')} style={styles.background}>
      <BlurView intensity={160} style={styles.blur_overlay}/>
      
      <View style={styles.container}>
        {/* this is the top rounded part */}
        <Image source={require('@/assets/images/starting_page_icon2.jpg')} style={styles.icon_container} />

        {/* title, introduction to app */}
        <Text style={styles.title}>FeelSync</Text>
        <Text style={styles.introduction}>Can't seem to keep track of your emotions?</Text>
        <Text style={styles.introduction}>FeelSync is here to help you!</Text>

        {/* login and signup buttons */}
        <LinearGradient
          colors={['#98837e', '#3d190f']}
          style={styles.login_button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Link href='/login' asChild>
            <TouchableOpacity style={styles.button_wrapper} onPress={() => {}}>
              <Text style={styles.button_text_login}>LOGIN</Text>
            </TouchableOpacity>
          </Link>
        </LinearGradient>
        
        <Link href='/signup' asChild>
          <TouchableOpacity style={styles.signup_button} onPress={() => {}}>
            <Text style={styles.button_text_signup}>SIGN UP</Text>
          </TouchableOpacity>
        </Link>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',  
    justifyContent: 'center',
  },

  blur_overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  icon_container: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    borderBottomLeftRadius: 190,
    borderBottomRightRadius: 190,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#a78a82',
  },

  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  title: {
    fontSize: 40,
    color: '#3d190f',
    textAlign: 'center',
    fontFamily: 'SergioTrendy',
    marginBottom: 80,
  },

  introduction: {
    fontSize: 15,
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Poppins',
    marginBottom: 5,
  },

  login_button: {
    borderRadius: 20,
    width: 250,
    padding: 10,
    marginTop: 100,
    borderWidth: 1,
    borderColor: '#3d190f',
  },

  button_wrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 0,
  },

  signup_button: {
    backgroundColor: '#f5f5f593',
    padding: 10,
    borderWidth: 1,
    borderColor: '#3d190f',
    borderRadius: 20,
    width: 250,
    marginTop: 20,
  },

  button_text_login: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'SergioTrendy',
  },

  button_text_signup: {
    color: '#3d190f',
    textAlign: 'center',
    fontFamily: 'SergioTrendy',
  },
});
