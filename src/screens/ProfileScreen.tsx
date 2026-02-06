import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth, useVoting } from '../context';

export const ProfileScreen: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { positions } = useVoting();

  const handleLogout = () => {
    Alert.alert(
      'লগআউট',
      'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?',
      [
        { text: 'না', style: 'cancel' },
        { text: 'হ্যাঁ', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('Info', 'পাসওয়ার্ড পরিবর্তনের ফিচার শীঘ্রই আসছে');
  };

  const handleViewVotingHistory = () => {
    Alert.alert('Info', 'ভোটিং হিস্টরির ফিচার শীঘ্রই আসছে');
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
        
        <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
          <Text style={styles.settingIcon}>🔒</Text>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>পাসওয়ার্ড পরিবর্তন</Text>
            <Text style={styles.settingSubtitle}>আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন</Text>
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
});