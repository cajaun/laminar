import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { useToast } from '../hooks/use-toast'; // Make sure this path is correct
import { Octicons } from '@expo/vector-icons';

const App = () => {
  const { showToast } = useToast();

  const handlePress = () => {
    showToast({
      title: 'Hello from Toast!',
      iconName: 'rocket', 
      trailing: (
        <Octicons name="x" size={16} color="#fff" style={{ marginLeft: 10 }} />
      ),
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable onPress={handlePress} style={{ padding: 10, backgroundColor: '#333' }}>
        <Text style={{ color: 'white' }}>Show Custom Toast</Text>
      </Pressable>
    </View>
  );
};

export default App;
