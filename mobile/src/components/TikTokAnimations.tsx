import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const FadeInView: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 500,
  style 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export const ScaleInView: React.FC<ScaleInProps> = ({ 
  children, 
  delay = 0, 
  duration = 400,
  style 
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        style, 
        { 
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim 
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface SlideInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: 'left' | 'right' | 'top' | 'bottom';
  style?: ViewStyle;
}

export const SlideInView: React.FC<SlideInProps> = ({ 
  children, 
  delay = 0, 
  duration = 500,
  from = 'bottom',
  style 
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTransform = () => {
    switch (from) {
      case 'left':
        return [{ translateX: Animated.multiply(slideAnim, -1) }];
      case 'right':
        return [{ translateX: slideAnim }];
      case 'top':
        return [{ translateY: Animated.multiply(slideAnim, -1) }];
      case 'bottom':
      default:
        return [{ translateY: slideAnim }];
    }
  };

  return (
    <Animated.View 
      style={[
        style, 
        { 
          transform: getTransform(),
          opacity: opacityAnim 
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface PulseProps {
  children: React.ReactNode;
  duration?: number;
  minScale?: number;
  maxScale?: number;
  style?: ViewStyle;
}

export const PulseView: React.FC<PulseProps> = ({ 
  children, 
  duration = 1000,
  minScale = 1,
  maxScale = 1.05,
  style 
}) => {
  const pulseAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: maxScale,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: minScale,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, []);

  return (
    <Animated.View 
      style={[
        style, 
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface BounceProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export const BounceView: React.FC<BounceProps> = ({ 
  children, 
  delay = 0,
  style 
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        style, 
        { 
          transform: [{ scale: bounceAnim }],
          opacity: bounceAnim 
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Hook for creating animated value
export const useAnimatedValue = (initialValue: number = 0) => {
  return useRef(new Animated.Value(initialValue)).current;
};

// TikTok-style shimmer effect for loading states
interface ShimmerProps {
  width: number;
  height: number;
  borderRadius?: number;
}

export const ShimmerView: React.FC<ShimmerProps> = ({ 
  width, 
  height, 
  borderRadius = 0 
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e0e0e0',
        opacity,
      }}
    />
  );
};

