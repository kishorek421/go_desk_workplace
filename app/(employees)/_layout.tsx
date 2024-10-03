import { Stack } from 'expo-router'
import React from 'react'

const Layout = () => {
  return (
    <Stack>
    <Stack.Screen name="employee_details/[employeeid]" options={{ headerShown: false }} />
    <Stack.Screen name="employee_list" options={{ headerShown: false }} />
    </Stack>
  )
}

export default Layout
