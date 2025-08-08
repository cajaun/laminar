import React from 'react';
import { View, Text } from 'react-native';

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ padding: 16, backgroundColor: '#2A292F', flexDirection: 'row' }}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Something went wrong while displaying a toast.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
