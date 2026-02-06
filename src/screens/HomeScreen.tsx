import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, useVoting } from '../context';
import { RootStackParamList } from '../navigation/types';
import { IDCardScanner } from '../components/IDCardScanner';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout, isAdmin } = useAuth();
  const { electionState, positions, verifyStudentId } = useVoting();
  const [showScanner, setShowScanner] = useState(false);

  const handleVoteClick = () => {
    if (!electionState.isActive) {
      Alert.alert('নির্বাচন বন্ধ', 'বর্তমানে ভোট গ্রহণ করা হচ্ছে না।');
      return;
    }
    setShowScanner(true);
  };

  const handleScanSuccess = async (scannedData: string) => {
    setShowScanner(false);
    try {
      const verified = await verifyStudentId(scannedData, user?.studentId || '');
      if (verified) {
        navigation.navigate('Voting');
      } else {
        Alert.alert('যাচাইকরণ ব্যর্থ', 'আইডি কার্ড যাচাই করা যায়নি। আবার চেষ্টা করুন।');
      }
    } catch (error) {
      Alert.alert('ত্রুটি', 'আইডি যাচাইয়ে সমস্যা হয়েছে');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'আপনি কি সত্যিই লগআউট করতে চান?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const votingProgress = Math.round(
    (electionState.votedCount / electionState.totalVoters) * 100
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>স্বাগতম</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userInfo}>{user?.department}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Election Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>🗳️ নির্বাচন ২০২৬</Text>
          <View style={[styles.statusBadge, electionState.isActive ? styles.activeBadge : styles.inactiveBadge]}>
            <Text style={styles.statusBadgeText}>
              {electionState.isActive ? 'চলমান' : 'সমাপ্ত'}
            </Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>ভোট প্রদান অগ্রগতি</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${votingProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {electionState.votedCount} / {electionState.totalVoters} ({votingProgress}%)
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>দ্রুত অ্যাক্সেস</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.voteCard]}
            onPress={handleVoteClick}
          >
            <Text style={styles.actionIcon}>🗳️</Text>
            <Text style={styles.actionText}>ভোট দিন</Text>
            <Text style={styles.actionSubtext}>Vote Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.candidatesCard]}
            onPress={() => navigation.navigate('Candidates')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>প্রার্থী</Text>
            <Text style={styles.actionSubtext}>Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.profileCard]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionText}>প্রোফাইল</Text>
            <Text style={styles.actionSubtext}>Settings</Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              style={[styles.actionCard, styles.adminCard]}
              onPress={() => navigation.navigate('Admin')}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>অ্যাডমিন</Text>
              <Text style={styles.actionSubtext}>Admin Panel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Positions List */}
      <View style={styles.positionsContainer}>
        <Text style={styles.sectionTitle}>নির্বাচনের পদসমূহ</Text>
        {positions.map((position, index) => (
          <View key={position.id} style={styles.positionItem}>
            <View style={styles.positionNumber}>
              <Text style={styles.positionNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.positionInfo}>
              <Text style={styles.positionTitle}>{position.titleBn}</Text>
              <Text style={styles.positionSubtitle}>{position.title}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>জগন্নাথ বিশ্ববিদ্যালয়</Text>
        <Text style={styles.footerSubtext}>Jagannath University, Dhaka</Text>
      </View>

      {/* ID Card Scanner Modal */}
      <IDCardScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
        expectedId={user?.studentId || ''}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a472a',
    padding: 20,
    paddingTop: 50,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 5,
  },
  userInfo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
  },
  logoutText: {
    fontSize: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  inactiveBadge: {
    backgroundColor: '#f44336',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
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
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  actionsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voteCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  candidatesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  profileCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  adminCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  positionsContainer: {
    margin: 20,
  },
  positionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  positionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  positionNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  positionInfo: {
    flex: 1,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  positionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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