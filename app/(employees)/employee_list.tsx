import { Text, Image, View, FlatList } from 'react-native';
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button, ButtonText } from '@/components/ui/button';
import { router } from 'expo-router';
import { Employee } from '@/models/employees';

const employees: Employee[] = [
  {
    id: '1',
    name: 'Raju Chai',
    empId: 'EMP1108',
    dob: '27/12/1997',
    designation: 'Developer',
    status: 'Active',
  },
  {
    id: '2',
    name: 'John Doe',
    empId: 'EMP1203',
    dob: '10/06/1993',
    designation: 'Developer',
    status: 'Active',
  },
];

const EmployeeList = () => {
  const renderItem = ({ item }: { item: Employee }) => (
    <Card size="md" variant="elevated" className="mt-8 p-0 rounded-2xl">
      <View className="flex-row justify-start w-full">
        <Image
          source={require('../../assets/images/employee.jpg')}
          className="w-[150px] h-[200px]"
        />
        <View className="ml-4 mr-4 justify-evenly flex-1">
          <View className="flex-row justify-between">
            <Text>Name</Text>
            <Text className="mr-4 underline">{item.name}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text>Emp Id</Text>
            <Text className="mr-4">{item.empId}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text>DOB</Text>
            <Text>{item.dob}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text>Designation</Text>
            <Text className="mr-3">{item.designation}</Text>
          </View>
          <Button
            className="mt-4 bg-blue-50 rounded-lg my-4"
            onPress={() =>
              router.push({
                pathname: '/(employees)/employee_details/[employeeid]',
                params: { employeeid: item.id },
              })
            }
          >
            <ButtonText className="text-blue-300">{item.status}</ButtonText>
          </Button>
        </View>
      </View>
    </Card>
  );

  return (
    <View className="p-4">
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default EmployeeList;
