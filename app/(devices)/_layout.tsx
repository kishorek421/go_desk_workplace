import { Stack } from 'expo-router'
import React from 'react'

const Layout = () => {
  return (
    <Stack>
    <Stack.Screen name="create_devices" options={{ headerShown: false }} />
    </Stack>
  )
}

export default Layout

