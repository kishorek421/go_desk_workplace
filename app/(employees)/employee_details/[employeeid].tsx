import { Text, Image, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/ui/card';
import { Button, ButtonText } from '@/components/ui/button';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import LoadingBar from '@/components/LoadingBar';
import api from '@/services/api';
import { GET_EMPLOYEE_DETAILS } from '@/constants/api_endpoints';
import { Employee } from '@/models/employees';

const EmployeeDetails: React.FC = () => {
  const { employeeid } = useLocalSearchParams();
  const { customerId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await api.get(`${GET_EMPLOYEE_DETAILS}?employeeId=${employeeid}`);
        setEmployee(response.data.data); 
      } catch (error) {
        console.error(error);
        setError("Failed to fetch employee details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [employeeid]);

  if (isLoading) {
    return <LoadingBar />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-red-100 p-4">
        <Text className="text-lg text-red-500">{error}</Text>
      </View>
    );
  }

  if (!employee) {
    return (
      <View className="flex-1 justify-center items-center bg-red-100 p-4">
        <Text className="text-lg text-red-500">Employee not found!</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-2 mt-10">
      <Card size="md" variant="elevated" className="mt-8 pb-0 p-0 mx-2 rounded-2xl my-4">
        <View className="justify-start items-start space-x-4">
          <Image
            source={require('../../../assets/images/employee.jpg')}
            className="w-[385px] h-[200px]"
          />
          <View className="justify-evenly ml-4 mr-4">
            <Button className="my-4 mx-0 bg-green-50">
              <ButtonText className="text-green-600">{employee.status}</ButtonText>
            </Button>

            {/* Name row */}
            <View className="flex-row justify-between w-full mt-2">
              <Text className="text-lg mt-2">Name</Text>
              <Text className="underline mt-2 mr-4">{employee.name}</Text>
            </View>

            {/* Employee ID row */}
            <View className="flex-row justify-between w-full">
              <Text className="text-lg mt-2">Employee ID</Text>
              <Text className="mt-2 mr-4">{employee.empId}</Text>
            </View>

            {/* DOB row */}
            <View className="flex-row justify-between w-full">
              <Text className="text-lg mt-2">DOB</Text>
              <Text className="mt-2">{employee.dob}</Text>
            </View>

            {/* Designation row */}
            <View className="flex-row justify-between w-full">
              <Text className="text-lg mt-2">Designation</Text>
              <Text className="mt-2 my-6 mr-3">{employee.designation}</Text>
            </View>
          </View>
        </View>
      </Card>

      <Text className="mt-10 text-xl mx-2 font-bold">Assigned Assets</Text>

      <Card size="md" variant="elevated" className="mt-8 pb-0 ps-4 mx-2 p-0 rounded-2xl ">
        <View className="flex-row justify-evenly w-full">
          <Image
            source={require("../../../assets/images/laptop.jpg")}
            className="w-[130px] h-[220px] "
          />

          <View className="mt-2 flex-1">
            {/* Model and Serial No */}
            <View className="flex-row justify-between mt-2">
              <View>
                <Text className="text-gray-400 mx-3 mt ml-4">Model</Text>
                <Text className="text-green-700 underline mx-3 mt-1 ml-4">Dell Inspiron 16</Text>
              </View>

              <View>
                <Text className="text-gray-400 mx-20">Serial No</Text>
                <Text className="mx-9 mt-1">8999898878LG</Text>
              </View>
            </View>

            {/* Warranty and Status */}
            <View className="flex-row justify-start my-4">
              <View>
                <Text className="text-gray-400 mt-2 mx-2 ml-4">Status</Text>
                <Button className="bg-blue-50 mx-2 ml-4 mt-1 rounded-md">
                  <ButtonText className="text-blue-300 mx-2">Assigned</ButtonText>
                </Button>
              </View>

              <View>
                <Text className="text-gray-400 mt-2 mx-12">As Warranty</Text>
                <Text className="mx-24 mt-2">Yes</Text>
              </View>
            </View>

      
            <View className="my-4">
              <Button
                className="bg-primary-950 mx-3 mt-2 rounded-lg w-100"
                onPress={() =>
                  router.push({
                    pathname: "/raise_ticket/[customerId]",
                    params: { customerId: customerId as string },
                  })
                }>
                <ButtonText className="w-full text-center">Raise Ticket</ButtonText>
                <Feather name="external-link" className="ms-2" size={20} color="white" />
              </Button>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
};

export default EmployeeDetails;
