import React from 'react';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps extends Omit<PaperButtonProps, 'mode' | 'buttonColor'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  children,
  ...props
}) => {
  const getMode = () => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'contained';
      case 'outline':
        return 'outlined';
      case 'ghost':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return '#f97316';
      case 'secondary':
        return '#6b7280';
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      default:
        return '#f97316';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return 'white';
      case 'outline':
        return '#f97316';
      case 'ghost':
        return '#f97316';
      default:
        return 'white';
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md':
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      buttonColor={getButtonColor()}
      textColor={getTextColor()}
      disabled={disabled || loading}
      loading={loading}
      style={[
        styles.button,
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {children}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Button;
