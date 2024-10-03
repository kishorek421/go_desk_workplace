import { RouteProp } from '@react-navigation/native';

export interface EmployeeDetailsRouteProps {
  route: RouteProp<{ params: { employeeId: string } }, 'params'>;
}
export interface EmployeeDetailsModel {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface Employee {
  id: string;
  name: string;
  empId: string;
  dob: string;
  designation: string;
  status: string;  
}
