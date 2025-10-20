import React from 'react';
import { TextInput as PaperTextInput, TextInputProps as PaperTextInputProps } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

interface InputProps extends Omit<PaperTextInputProps, 'mode'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  ...props
}) => {
  return (
    <View style={[fullWidth && styles.fullWidth]}>
      <PaperTextInput
        mode="outlined"
        label={label}
        error={!!error}
        left={leftIcon ? <PaperTextInput.Icon icon={() => leftIcon} /> : undefined}
        right={rightIcon ? <PaperTextInput.Icon icon={() => rightIcon} /> : undefined}
        style={[styles.input, style]}
        outlineColor="#e5e7eb"
        activeOutlineColor="#f97316"
        {...props}
      />
      {error && (
        <PaperTextInput
          mode="flat"
          value={error}
          editable={false}
          style={[styles.errorInput, { color: '#d32f2f' }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
  },
  errorInput: {
    backgroundColor: 'transparent',
    fontSize: 12,
    marginTop: -8,
    marginLeft: 12,
  },
  fullWidth: {
    width: '100%',
  },
});

export default Input;
