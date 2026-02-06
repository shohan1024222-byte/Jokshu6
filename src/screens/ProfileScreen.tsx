import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useAuth, useVoting } from '../context';
import { IDCardScanner } from '../components/IDCardScanner';

// Cross-platform alert
const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && buttons[1]?.onPress) buttons[1].onPress();
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

type SettingsAction = 'changeName' | 'changePassword' | null;

export const ProfileScreen: React.FC = () => {
  const { user, logout, isAdmin, updateUserName, updatePassword } = useAuth();
  const { positions, verifyStudentId } = useVoting();

  // ID scan verification
  const [showScanner, setShowScanner] = useState(false);
  const [pendingAction, setPendingAction] = useState<SettingsAction>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Change name
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState('');

  // Change password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    showAlert(
      'লগআউট',
      'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?',
      [
        { text: 'না', style: 'cancel' },
        { text: 'হ্যাঁ', onPress: logout, style: 'destructive' },
      ]
    );
  };

  // Start action — requires ID scan first
  const startAction = (action: SettingsAction) => {
    setPendingAction(action);
    setIsVerified(false);
    setShowScanner(true);
  };

  const handleScanSuccess = async (scannedData: string) => {
    setShowScanner(false);
    try {
      const verified = await verifyStudentId(scannedData, user?.studentId || '');
      if (verified) {
        setIsVerified(true);
        if (pendingAction === 'changeName') {
          setNewName(user?.name || '');
          setShowNameModal(true);
        } else if (pendingAction === 'changePassword') {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setShowPasswordModal(true);
        }
      } else {
        showAlert('যাচাইকরণ ব্যর্থ', 'আইডি কার্ড যাচাই করা যায়নি। আপনার নিজের আইডি কার্ড স্ক্যান করুন।');
      }
    } catch (error) {
      showAlert('ত্রুটি', 'আইডি যাচাইকরণে সমস্যা হয়েছে।');
    }
    setPendingAction(null);
  };

  const handleNameChange = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      showAlert('ত্রুটি', 'নাম খালি রাখা যাবে না');
      return;
    }
    if (trimmed.length < 2) {
      showAlert('ত্রুটি', 'নাম কমপক্ষে ২ অক্ষরের হতে হবে');
      return;
    }
    const success = await updateUserName(trimmed);
    if (success) {
      setShowNameModal(false);
      setIsVerified(false);
      showAlert('সফল! ✅', 'আপনার নাম সফলভাবে পরিবর্তন করা হয়েছে।');
    } else {
      showAlert('ব্যর্থ', 'নাম পরিবর্তন করতে সমস্যা হয়েছে।');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword.trim()) {
      showAlert('ত্রুটি', 'বর্তমান পাসওয়ার্ড দিন');
      return;
    }
    if (!newPassword.trim()) {
      showAlert('ত্রুটি', 'নতুন পাসওয়ার্ড দিন');
      return;
    }
    if (newPassword.length < 4) {
      showAlert('ত্রুটি', 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('ত্রুটি', 'নতুন পাসওয়ার্ড মিলছে না। আবার চেষ্টা করুন।');
      return;
    }
    const success = await updatePassword(currentPassword, newPassword);
    if (success) {
      setShowPasswordModal(false);
      setIsVerified(false);
      showAlert('সফল! ✅', 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।');
    } else {
      showAlert('ব্যর্থ', 'বর্তমান পাসওয়ার্ড ভুল দিয়েছেন।');
    }
  };

  const handleViewVotingHistory = () => {
    showAlert('Info', 'ভোটিং হিস্টরির ফিচার শীঘ্রই আসছে');
  };

  if (!user) {
    return (
      <View style={styles.noUserContainer}>
        <Text style={styles.noUserText}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userRole}>
          {isAdmin ? 'অ্যাডমিনিস্ট্রেটর' : 'ছাত্র/ছাত্রী'}
        </Text>
        {isAdmin && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        )}
      </View>

      {/* User Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ব্যক্তিগত তথ্য</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>নাম:</Text>
            <Text style={styles.infoValue}>{user.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student ID:</Text>
            <Text style={styles.infoValue}>{user.studentId}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>বিভাগ:</Text>
            <Text style={styles.infoValue}>{user.department}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>সেশন:</Text>
            <Text style={styles.infoValue}>{user.session}</Text>
          </View>
        </View>
      </View>

      {/* Voting Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ভোটিং স্ট্যাটাস</Text>
        
        <View style={styles.votingCard}>
          <View style={styles.votingHeader}>
            <Text style={styles.votingTitle}>
              {user.hasVoted ? 'ভোট সম্পন্ন হয়েছে' : 'ভোট বাকি আছে'}
            </Text>
            <View style={[
              styles.votingStatus,
              user.hasVoted ? styles.votedStatus : styles.pendingStatus
            ]}>
              <Text style={styles.votingStatusText}>
                {user.hasVoted ? '✓ সম্পন্ন' : '⏳ বাকি'}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              ভোট প্রদান: {user.votedPositions?.length || 0} / {positions.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${((user.votedPositions?.length || 0) / positions.length) * 100}%`
                  }
                ]} 
              />
            </View>
          </View>
          
          {user.votedPositions && user.votedPositions.length > 0 && (
            <View style={styles.votedPositions}>
              <Text style={styles.votedPositionsTitle}>ভোট দেওয়া পদসমূহ:</Text>
              {user.votedPositions.map((positionId) => {
                const position = positions.find(p => p.id === positionId);
                return (
                  <Text key={positionId} style={styles.votedPosition}>
                    • {position?.titleBn}
                  </Text>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>সেটিংস</Text>

        <TouchableOpacity style={styles.settingItem} onPress={() => startAction('changeName')}>
          <Text style={styles.settingIcon}>✏️</Text>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>নাম পরিবর্তন</Text>
            <Text style={styles.settingSubtitle}>আইডি কার্ড স্ক্যান করে নাম পরিবর্তন করুন</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => startAction('changePassword')}>
          <Text style={styles.settingIcon}>🔒</Text>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>পাসওয়ার্ড পরিবর্তন</Text>
            <Text style={styles.settingSubtitle}>আইডি কার্ড স্ক্যান করে পাসওয়ার্ড পরিবর্তন করুন</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleViewVotingHistory}>
          <Text style={styles.settingIcon}>📊</Text>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>ভোটিং হিস্টরি</Text>
            <Text style={styles.settingSubtitle}>আপনার ভোটদানের ইতিহাস দেখুন</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>অ্যাপ তথ্য</Text>
        
        <View style={styles.appInfoCard}>
          <Text style={styles.appName}>JOKSHU Voting App</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            জগন্নাথ বিশ্ববিদ্যালয় কেন্দ্রীয় ছাত্র সংসদ নির্বাচন ২০২৬
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 লগআউট</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Jagannath University</Text>
        <Text style={styles.footerSubtext}>Dhaka, Bangladesh</Text>
      </View>

      {/* ID Card Scanner */}
      <IDCardScanner
        visible={showScanner}
        onClose={() => {
          setShowScanner(false);
          setPendingAction(null);
        }}
        onScanSuccess={handleScanSuccess}
        expectedId={user.studentId}
      />

      {/* Change Name Modal */}
      <Modal visible={showNameModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>নাম পরিবর্তন</Text>
            <Text style={styles.modalVerified}>✅ আইডি যাচাই সম্পন্ন</Text>

            <Text style={styles.modalLabel}>নতুন নাম:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="আপনার নতুন নাম লিখুন"
              placeholderTextColor="#999"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowNameModal(false);
                  setIsVerified(false);
                }}
              >
                <Text style={styles.modalCancelText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleNameChange}>
                <Text style={styles.modalSaveText}>সংরক্ষণ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>পাসওয়ার্ড পরিবর্তন</Text>
            <Text style={styles.modalVerified}>✅ আইডি যাচাই সম্পন্ন</Text>

            <Text style={styles.modalLabel}>বর্তমান পাসওয়ার্ড:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="বর্তমান পাসওয়ার্ড লিখুন"
              placeholderTextColor="#999"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoFocus
            />

            <Text style={styles.modalLabel}>নতুন পাসওয়ার্ড:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="নতুন পাসওয়ার্ড লিখুন"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={styles.modalLabel}>নতুন পাসওয়ার্ড নিশ্চিত করুন:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="নতুন পাসওয়ার্ড আবার লিখুন"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowPasswordModal(false);
                  setIsVerified(false);
                }}
              >
                <Text style={styles.modalCancelText}>বাতিল</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handlePasswordChange}>
                <Text style={styles.modalSaveText}>পরিবর্তন করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noUserText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: '#1a472a',
    padding: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  adminBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  adminBadgeText: {
    color: '#1a472a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  votingCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  votingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  votingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  votingStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  votedStatus: {
    backgroundColor: '#4CAF50',
  },
  pendingStatus: {
    backgroundColor: '#FF9800',
  },
  votingStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  votedPositions: {
    marginTop: 10,
  },
  votedPositionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  votedPosition: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  settingArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  logoutContainer: {
    margin: 20,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a472a',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalVerified: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1a472a',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});