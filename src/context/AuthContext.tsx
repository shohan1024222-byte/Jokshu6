import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Student, AuthContextType } from '../types';
import { STUDENTS, PASSWORDS } from '../data/mockData';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Student | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  };

  const login = async (studentId: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt:', studentId, password);
      console.log('Available passwords:', PASSWORDS);
      console.log('Available students:', STUDENTS.map(s => s.studentId));
      
      // First check if there's a custom password for this user
      let storedPassword;
      try {
        const customPasswordsData = await AsyncStorage.getItem('customPasswords');
        const customPasswords = customPasswordsData ? JSON.parse(customPasswordsData) : {};
        storedPassword = customPasswords[studentId] || PASSWORDS[studentId];
      } catch (e) {
        storedPassword = PASSWORDS[studentId];
      }
      
      console.log('Found password for ID:', storedPassword);
      
      if (storedPassword && storedPassword === password) {
        // Check if there's a custom user data
        let foundStudent;
        try {
          const customUsersData = await AsyncStorage.getItem('customUsers');
          const customUsers = customUsersData ? JSON.parse(customUsersData) : {};
          foundStudent = customUsers[studentId] || STUDENTS.find(s => s.studentId === studentId);
        } catch (e) {
          foundStudent = STUDENTS.find(s => s.studentId === studentId);
        }
        
        console.log('Found student:', foundStudent);
        
        if (foundStudent) {
          // Load any stored voting data
          let userWithVotingData = { ...foundStudent };
          try {
            const storedVotingData = await AsyncStorage.getItem(`voter_${studentId}`);
            if (storedVotingData) {
              userWithVotingData = { ...foundStudent, ...JSON.parse(storedVotingData) };
            }
          } catch (e) {
            console.log('No voting data found');
          }

          console.log('Setting user:', userWithVotingData);
          setUser(userWithVotingData);
          setIsAuthenticated(true);
          
          try {
            await AsyncStorage.setItem('currentUser', JSON.stringify(userWithVotingData));
          } catch (e) {
            console.log('Could not save to storage');
          }
          
          console.log('Login successful!');
          return true;
        }
      }
      console.log('Login failed - invalid credentials');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserName = async (newName: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Save custom user data
      const customUsersData = await AsyncStorage.getItem('customUsers');
      const customUsers = customUsersData ? JSON.parse(customUsersData) : {};
      customUsers[user.studentId] = updatedUser;
      await AsyncStorage.setItem('customUsers', JSON.stringify(customUsers));

      return true;
    } catch (error) {
      console.error('Error updating name:', error);
      return false;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    try {
      // Verify current password
      let storedPassword;
      const customPasswordsData = await AsyncStorage.getItem('customPasswords');
      const customPasswords = customPasswordsData ? JSON.parse(customPasswordsData) : {};
      storedPassword = customPasswords[user.studentId] || PASSWORDS[user.studentId];

      if (storedPassword !== currentPassword) {
        return false;
      }

      // Save new password
      customPasswords[user.studentId] = newPassword;
      await AsyncStorage.setItem('customPasswords', JSON.stringify(customPasswords));

      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      return false;
    }
  };

  const addStudent = async (studentId: string, name: string, password: string, department: string, session: string): Promise<boolean> => {
    try {
      // Check if student already exists
      const existingStudent = STUDENTS.find(s => s.studentId === studentId);
      const customUsersData = await AsyncStorage.getItem('customUsers');
      const customUsers = customUsersData ? JSON.parse(customUsersData) : {};
      
      if (existingStudent || customUsers[studentId]) {
        // Already exists, but we allow re-adding (update)
      }

      // Create student object
      const newStudent: Student = {
        id: `std_${Date.now()}`,
        studentId,
        name,
        department,
        session,
        hasVoted: false,
        votedPositions: [],
      };

      // Save to customUsers
      customUsers[studentId] = newStudent;
      await AsyncStorage.setItem('customUsers', JSON.stringify(customUsers));

      // Save password
      const customPasswordsData = await AsyncStorage.getItem('customPasswords');
      const customPasswords = customPasswordsData ? JSON.parse(customPasswordsData) : {};
      customPasswords[studentId] = password;
      await AsyncStorage.setItem('customPasswords', JSON.stringify(customPasswords));

      return true;
    } catch (error) {
      console.error('Error adding student:', error);
      return false;
    }
  };

  const getRegisteredStudents = async (): Promise<Array<{ studentId: string; name: string; department: string; session: string }>> => {
    try {
      const customUsersData = await AsyncStorage.getItem('customUsers');
      const customUsers = customUsersData ? JSON.parse(customUsersData) : {};
      
      // Combine mock students + custom students
      const allStudents: Array<{ studentId: string; name: string; department: string; session: string }> = [];
      
      // Get removed students list
      const removedData = await AsyncStorage.getItem('removedStudents');
      const removedStudents: string[] = removedData ? JSON.parse(removedData) : [];

      // Add mock students (excluding admin and removed ones)
      STUDENTS.forEach(s => {
        if (s.studentId !== 'admin' && !removedStudents.includes(s.studentId)) {
          allStudents.push({ studentId: s.studentId, name: s.name, department: s.department, session: s.session });
        }
      });

      // Add custom students (may override mock ones)
      Object.values(customUsers).forEach((s: any) => {
        if (s.studentId !== 'admin') {
          const existingIdx = allStudents.findIndex(x => x.studentId === s.studentId);
          if (existingIdx >= 0) {
            allStudents[existingIdx] = { studentId: s.studentId, name: s.name, department: s.department, session: s.session };
          } else {
            allStudents.push({ studentId: s.studentId, name: s.name, department: s.department, session: s.session });
          }
        }
      });

      return allStudents;
    } catch (error) {
      console.error('Error getting students:', error);
      return [];
    }
  };

  const removeStudent = async (studentId: string): Promise<boolean> => {
    try {
      // Remove from customUsers
      const customUsersData = await AsyncStorage.getItem('customUsers');
      const customUsers = customUsersData ? JSON.parse(customUsersData) : {};
      delete customUsers[studentId];
      await AsyncStorage.setItem('customUsers', JSON.stringify(customUsers));

      // Remove password
      const customPasswordsData = await AsyncStorage.getItem('customPasswords');
      const customPasswords = customPasswordsData ? JSON.parse(customPasswordsData) : {};
      delete customPasswords[studentId];
      await AsyncStorage.setItem('customPasswords', JSON.stringify(customPasswords));

      // Track removed mock students so they don't reappear
      const removedData = await AsyncStorage.getItem('removedStudents');
      const removedStudents: string[] = removedData ? JSON.parse(removedData) : [];
      if (!removedStudents.includes(studentId)) {
        removedStudents.push(studentId);
        await AsyncStorage.setItem('removedStudents', JSON.stringify(removedStudents));
      }

      return true;
    } catch (error) {
      console.error('Error removing student:', error);
      return false;
    }
  };

  const updateStudent = async (studentId: string, name: string, department: string, session: string): Promise<boolean> => {
    try {
      const customUsersData = await AsyncStorage.getItem('customUsers');
      const customUsers = customUsersData ? JSON.parse(customUsersData) : {};

      // Find existing student data (could be mock or custom)
      const existingMock = STUDENTS.find(s => s.studentId === studentId);
      const existingCustom = customUsers[studentId];
      const base = existingCustom || existingMock;

      if (base) {
        customUsers[studentId] = { ...base, name, department, session };
      } else {
        customUsers[studentId] = {
          id: `std_${Date.now()}`,
          studentId,
          name,
          department,
          session,
          hasVoted: false,
          votedPositions: [],
        };
      }

      await AsyncStorage.setItem('customUsers', JSON.stringify(customUsers));
      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      return false;
    }
  };

  const isAdmin = user?.studentId === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, updateUserName, updatePassword, addStudent, getRegisteredStudents, removeStudent, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};