import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useVoting, useAuth } from '../context';

export const AdminScreen: React.FC = () => {
  const { electionState, candidates, positions } = useVoting();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <View style={styles.accessDenied}>
        <Text style={styles.accessDeniedIcon}>🚫</Text>
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedText}>
          আপনার এই পেইজে প্রবেশ করার অনুমতি নেই।
        </Text>
      </View>
    );
  }

  const getTotalVotes = (): number => {
    return candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
  };

  const getTopCandidates = () => {
    return candidates
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);
  };

  const handleResetVotes = () => {
    Alert.alert(
      'Reset Votes',
      'আপনি কি সত্যিই সব ভোট রিসেট করতে চান?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => {
          // In a real app, this would reset all votes
          Alert.alert('Success', 'ভোট রিসেট করা হয়েছে');
        }},
      ]
    );
  };

  const topCandidates = getTopCandidates();

  return (
    <ScrollView style={styles.container}>
      {/* Admin Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ অ্যাডমিন প্যানেল</Text>
        <Text style={styles.headerSubtitle}>নির্বাচন ব্যবস্থাপনা</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{getTotalVotes()}</Text>
          <Text style={styles.statLabel}>মোট ভোট</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{candidates.length}</Text>
          <Text style={styles.statLabel}>প্রার্থী</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{positions.length}</Text>
          <Text style={styles.statLabel}>পদ</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{electionState.votedCount}</Text>
          <Text style={styles.statLabel}>ভোটার</Text>
        </View>
      </View>

      {/* Election Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>নির্বাচনের অবস্থা</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>নির্বাচন:</Text>
            <View style={[
              styles.statusBadge,
              electionState.isActive ? styles.activeBadge : styles.inactiveBadge
            ]}>
              <Text style={styles.statusBadgeText}>
                {electionState.isActive ? 'চলমান' : 'বন্ধ'}
              </Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>শুরুর সময়:</Text>
            <Text style={styles.statusValue}>
              {electionState.startTime.toLocaleDateString('bn-BD')}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>শেষের সময়:</Text>
            <Text style={styles.statusValue}>
              {electionState.endTime.toLocaleDateString('bn-BD')}
            </Text>
          </View>
        </View>
      </View>

      {/* Top Performing Candidates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>শীর্ষ প্রার্থীগণ</Text>
        {topCandidates.map((candidate, index) => (
          <View key={candidate.id} style={styles.candidateItem}>
            <View style={styles.rankContainer}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.candidateSymbol}>
              <Text style={styles.symbolText}>{candidate.symbol}</Text>
            </View>
            <View style={styles.candidateInfo}>
              <Text style={styles.candidateName}>{candidate.name}</Text>
              <Text style={styles.candidatePosition}>
                {positions.find(p => p.id === candidate.position)?.titleBn}
              </Text>
            </View>
            <View style={styles.voteCount}>
              <Text style={styles.voteNumber}>{candidate.votes}</Text>
              <Text style={styles.voteLabel}>ভোট</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Position-wise Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>পদভিত্তিক ফলাফল</Text>
        {positions.map((position) => {
          const positionCandidates = candidates.filter(c => c.position === position.id);
          const totalVotes = positionCandidates.reduce((sum, c) => sum + c.votes, 0);
          
          return (
            <View key={position.id} style={styles.positionSummary}>
              <Text style={styles.positionTitle}>{position.titleBn}</Text>
              <Text style={styles.positionStats}>
                {positionCandidates.length} জন প্রার্থী • {totalVotes} টি ভোট
              </Text>
            </View>
          );
        })}
      </View>

      {/* Admin Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>অ্যাডমিন অ্যাকশন</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          Alert.alert('Info', 'এই ফিচার শীঘ্রই আসছে');
        }}>
          <Text style={styles.actionButtonText}>📊 বিস্তারিত রিপোর্ট</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => {
          Alert.alert('Info', 'এই ফিচার শীঘ্রই আসছে');
        }}>
          <Text style={styles.actionButtonText}>📈 ভোট এনালাইটিক্স</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => {
          Alert.alert('Info', 'এই ফিচার শীঘ্রই আসছে');
        }}>
          <Text style={styles.actionButtonText}>👥 ভোটার তালিকা</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleResetVotes}
        >
          <Text style={styles.dangerButtonText}>🔄 ভোট রিসেট করুন</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>JOKSU Admin Panel v1.0</Text>
        <Text style={styles.footerSubtext}>Jagannath University</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#9C27B0',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
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
  candidateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rankContainer: {
    marginRight: 15,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  candidateSymbol: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  symbolText: {
    fontSize: 20,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  candidatePosition: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  voteCount: {
    alignItems: 'center',
  },
  voteNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  voteLabel: {
    fontSize: 12,
    color: '#666',
  },
  positionSummary: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  positionStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});