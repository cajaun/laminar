import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const ListsLayout = () => {
  return (
    <Stack>

 
    <Stack.Screen
    name="index"
    options={{
      presentation: "modal",
      title: "Edit Profile",
      headerShown: true,
      
    }}
  />

</Stack>
  )
}

export default ListsLayout