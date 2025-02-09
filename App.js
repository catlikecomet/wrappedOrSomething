import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, Animated } from 'react-native';
import LottieView from 'lottie-react-native'; // Import Lottie

const { width, height } = Dimensions.get('window'); // Get screen dimensions for full screen slides
const slideDuration = 5000; // Duration for each slide (5 seconds)

export default function App() {
  const slides = [
    { text: "You ate at x amount of restaurants!", color: '#FF6347', animation: { uri: 'https://lottie.host/8e4504fa-b459-40dc-a0de-8a127fda95a8/2RW52Nxk5n.lottie' } },
    { text: "Look how far you've travelled", color: '#3CB371', animation: { uri: 'https://lottie.host/12d49eaf-002f-409b-86a0-51245b846749/mrlJcb8hbF.lottie' } },
    { text: "Top purchase", color: '#FFD700', animation: { uri: 'https://lottie.host/6e83cb37-ad52-4197-b89a-f78be3802e1d/JEj0ztKIS3.lottie' } },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const progress = useRef(slides.map(() => new Animated.Value(0))).current; // Create an animated value for each progress bar
  const slideAnim = useRef(new Animated.Value(0)).current; // For slide transition animation

  // Function to move to the next slide
  const goToNextSlide = () => {
    const nextSlide = (currentSlide + 1) % slides.length;
    setCurrentSlide(nextSlide);
    resetProgress(); // Reset progress for each slide
    triggerSlideAnimation(); // Trigger the bounce animation
  };

  // Function to start the progress animation for the active slide
  const startProgressAnimation = () => {
    Animated.timing(progress[currentSlide], {
      toValue: 1,
      duration: slideDuration,
      useNativeDriver: false, // We need to animate the width, so native driver is not supported
    }).start();
  };

  // Function to reset progress for all slides
  const resetProgress = () => {
    progress.forEach((p) => p.setValue(0));
  };

  // Trigger the spring bounce animation
  const triggerSlideAnimation = () => {
    slideAnim.setValue(0); // Reset animation for smooth transition
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 10, // Lower friction = more bounce
      tension: 100, // Higher tension = more forceful bounce
      useNativeDriver: true,
    }).start();
  };

  // Automatically move to the next slide every 5 seconds
  useEffect(() => {
    startProgressAnimation(); // Start progress bar animation
    const slideInterval = setInterval(() => {
      goToNextSlide(); // Move to the next slide every 5 seconds
    }, slideDuration);
  
    return () => clearInterval(slideInterval);
  }, [currentSlide]); // Run this effect when `currentSlide` changes
  
  useEffect(() => {
    // Trigger slide animation only on `currentSlide` change
    triggerSlideAnimation(); 
  }, [currentSlide]);

  // Handle tap to move to the next slide
  const handleTap = () => {
    goToNextSlide();
    resetProgress(); // Reset progress when manually advancing
  };

  // Render each slide with its full width
  const renderItem = () => (
    <View style={[styles.slide, { backgroundColor: slides[currentSlide].color }]}>
      {currentSlide === 2 && slides[currentSlide].animation && ( // Apply background animation only on the third slide
        <LottieView
          source={slides[currentSlide].animation}
          autoPlay
          loop
          style={styles.backgroundAnimation} // Style it as a background
        />
      )}
      <Text style={styles.text}>{slides[currentSlide].text}</Text>
      {/* Render Lottie animation for other slides normally */}
      {currentSlide !== 2 && slides[currentSlide].animation && (
        <LottieView
          source={slides[currentSlide].animation}
          autoPlay
          loop
          style={[styles.animation, currentSlide === 1 ? styles.largeAnimation : null]} // Apply custom styles to the second slide
        />
      )}
    </View>
  );

  // Render the progress bars at the top
  const renderProgressBars = () => (
    <View style={styles.progressContainer}>
      {slides.map((_, index) => (
        <View key={index} style={styles.progressWrapper}>
          <Animated.View
            style={[styles.progressBar, {
              width: progress[index].interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'], // Progress from 0% to 100% width
              }),
              backgroundColor: currentSlide === index ? '#FFF' : '#ddd',
            }]}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress bars */}
      {renderProgressBars()}

      {/* Slide Content */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.fullScreen}>
          {/* Animated Bounce Transition */}
          <Animated.View
            style={[
              styles.stackWrapper,
              {
                transform: [
                  { translateX: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [width, 0] }) }, // Move slide in from the right
                  { scale: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1] }) }, // Slight scale for bounciness
                ],
              },
            ]}
          >
            {renderItem()}
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fullScreen: {
    width: width, // Full screen width
    height: '100%', // Full screen height
    justifyContent: 'center',
    alignItems: 'center',
  },
  stackWrapper: {
    position: 'absolute',
    width: width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: width, // Full screen slide width
    borderRadius: 10, // Optional: for rounded corners to make it look like a card
    shadowColor: 'rgba(0, 0, 0, 0.3)', // Optional: for a shadow to enhance the card effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10, // Android shadow effect
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    zIndex: 1, // Make sure text is on top of background animation
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    flexDirection: 'row',
    backgroundColor: '#ddd',
    zIndex: 100,
  },
  progressWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
  animation: {
    width: 150, // Default width for animation
    height: 150, // Default height for animation
    marginTop: 20,
    zIndex: 1, // Ensure it stays above the background
  },
  largeAnimation: {
    width: 300, // Enlarged width for second slide
    height: 300, // Enlarged height for second slide
    marginTop: 40, // Adjust top margin for positioning
  },
  backgroundAnimation: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0, // Make sure it's in the background
  },
});
