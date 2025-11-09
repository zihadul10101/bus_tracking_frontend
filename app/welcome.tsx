import { useRouter } from "expo-router";
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// NOTE: This code assumes you have 'react-native-vector-icons' installed 
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');
const ICON_SIZE = 40;
const RADIUS = 70; // Defines the distance of the icons from the center

export default function WelcomeAnimationScreen() {
  const router = useRouter();
  
  // Animated value for the fly-in translation (0 to 1)
  const flyInAnim = useRef(new Animated.Value(0)).current;

  // Animated value for the continuous rotation (0 to 1)
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // New: Animated value for the button opacity (0 to 1)
  const buttonOpacityAnim = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    // Navigate to the Login screen
    router.push('/auth/login'); 
  }

  useEffect(() => {
    // --- Phase 1: Fly-In Animation (Runs Once) ---
    const flyIn = Animated.timing(flyInAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.back(1.7)), // Bounce effect for impact
      useNativeDriver: true,
    });

    // --- Phase 2: Continuous Rotation Loop (Runs Indefinitely) ---
    const rotationLoop = Animated.loop(
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 8000, // Speed of rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    // --- Phase 3: Button Fade-In (Runs Once after fly-in) ---
    const buttonFadeIn = Animated.timing(buttonOpacityAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.ease,
        useNativeDriver: true,
    });

    // 1. Start fly-in. On completion, start the rotation loop AND fade in the button.
    flyIn.start(() => {
      rotationLoop.start();
      buttonFadeIn.start();
    });

    // Cleanup function to stop animations when the component unmounts
    return () => {
      flyIn.stop();
      rotationLoop.stop();
      buttonFadeIn.stop();
    };
  }, [flyInAnim, rotationAnim, buttonOpacityAnim]);

  // Interpolate the rotation value (0 to 1) into a degree string (0deg to 360deg)
  const rotateStyle = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  // --- Animation Calculations for Fly-In ---
  
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Icon 1 (Top edge to Top-Center position)
  const icon1TranslateY = flyInAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-ICON_SIZE - centerY, -RADIUS], 
  });

  // Icon 2 (Bottom edge to Bottom-Center position)
  const icon2TranslateY = flyInAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height - centerY, RADIUS], 
  });

  // Icon 3 (Left edge to Left-Center position)
  const icon3TranslateX = flyInAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-ICON_SIZE - centerX, -RADIUS], 
  });

  // Icon 4 (Right edge to Right-Center position)
  const icon4TranslateX = flyInAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [width - centerX, RADIUS], 
  });
  
  // Helper Component for a single animated icon
interface AnimatedIconProps {
  name: string;
  iconStyle?: any; // You can replace with Animated.AnimatedProps<StyleProp<ViewStyle>> for stricter typing
  color?: string;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ name, iconStyle, color }) => (
  <Animated.View style={[{ transform: iconStyle }]}>
    <Icon name={name} size={24} color={color || "#000"} />
  </Animated.View>
);

  return (
    <View style={styles.screen}>
      <Text style={styles.welcomeText}>Our Blue Bus</Text>

      {/* This View applies the continuous rotation to the entire group */}
      <Animated.View style={[styles.circleContainer, { transform: [{ rotate: rotateStyle }] }]}>
        
        {/* Icon 1: Top (FIXED: Separate X and Y translations) */}
        <AnimatedIcon
          name="user"
          color="#FF6347"
          iconStyle={[
            { translateX: 0 }, 
            { translateY: icon1TranslateY } 
          ]}
        />
        
        {/* Icon 2: Bottom (FIXED: Separate X and Y translations) */}
        <AnimatedIcon
          name="book-open"
          color="#4682B4"
          iconStyle={[
            { translateX: 0 }, 
            { translateY: icon2TranslateY } 
          ]}
        />
        
        {/* Icon 3: Left (FIXED: Separate X and Y translations) */}
        <AnimatedIcon
          name="calendar"
          color="#3CB371"
          iconStyle={[
            { translateX: icon3TranslateX }, 
            { translateY: 0 } 
          ]}
        />
        
        {/* Icon 4: Right (FIXED: Separate X and Y translations) */}
        <AnimatedIcon
          name="bell"
          color="#FFA500"
          iconStyle={[
            { translateX: icon4TranslateX }, 
            { translateY: 0 } 
          ]}
        />
      </Animated.View>
      
      {/* New: Get Started Button */}
      <Animated.View style={[styles.buttonWrapper, { opacity: buttonOpacityAnim }]}>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={handleNext}
          >
              <Text style={styles.buttonText}>Get Started</Text>
              <Icon name="arrow-right" size={20} color="#fff" style={styles.buttonIcon} />
          </TouchableOpacity>
      </Animated.View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 50, // Add padding to make space for the button
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 400, 
    color: '#333',
  },
  // Container centered on the screen. All icon positions are calculated relative to this point.
  circleContainer: {
    position: 'absolute',
    top: height / 2, 
    left: width / 2,
  },
  // Individual icon wrapper
  iconContainer: {
    position: 'absolute',
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -ICON_SIZE / 2,
    marginTop: -ICON_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  // --- New Button Styles ---
  buttonWrapper: {
    position: 'absolute',
    bottom: 50,
    width: width * 0.8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF', // Primary Blue
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  }
});