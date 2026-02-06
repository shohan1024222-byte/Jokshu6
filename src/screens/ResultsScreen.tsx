import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useVoting } from '../context';

export const ResultsScreen: React.FC = () => {
  const { candidates, positions, getResults } = useVoting();

  const results = getResults();
  const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>নির্বাচনী ফলাফল</Text>
        <Text style={styles.subtitle}>Election Results</Text>
        <View style={styles.totalVotesContainer}>
          <Text style={styles.totalVotesLabel}>মোট ভোট</Text>
          <Text style={styles.totalVotesCount}>{totalVotes}</Text>
        </View>
      </View>

      {/* Results by Position */}
      {positions.map((position) => {
        const positionCandidates = results.get(position.id) || [];
        const positionTotalVotes = positionCandidates.reduce((sum, c) => sum + c.votes, 0);

        return (
          <View key={position.id} style={styles.positionContainer}>
            <View style={styles.positionHeader}>
              <Text style={styles.positionTitle}>{position.titleBn}</Text>
              <Text style={styles.positionSubtitle}>{position.title}</Text>
              <Text style={styles.positionVotes}>
                {positionTotalVotes} টি ভোট পড়েছে
              </Text>
            </View>

            {positionCandidates.length === 0 ? (
              <View style={styles.noCandidatesContainer}>
                <Text style={styles.noCandidatesText}>
                  এই পদের জন্য কোন প্রার্থী নেই
                </Text>
              </View>
            ) : (
              <View style={styles.candidatesContainer}>
                {positionCandidates.map((candidate, index) => {
                  const percentage = positionTotalVotes > 0 
                    ? Math.round((candidate.votes / positionTotalVotes) * 100) 
                    : 0;

                  return (
                    <View
                      key={candidate.id}
                      style={[
                        styles.candidateResult,
                        index === 0 && styles.winnerResult,
                      ]}
                    >
                      <View style={styles.candidateInfo}>
                        <View style={styles.rankContainer}>
                          <Text style={styles.rankNumber}>{index + 1}</Text>
                          {index === 0 && <Text style={styles.winnerIcon}>👑</Text>}
                        </View>
                        
                        <View style={styles.symbolContainer}>
                          <Text style={styles.symbol}>{candidate.symbol}</Text>
                        </View>
                        
                        <View style={styles.nameContainer}>
                          <Text style={styles.candidateName}>{candidate.name}</Text>
                          <Text style={styles.candidateDept}>{candidate.department}</Text>
                        </View>
                        
                        <View style={styles.votesContainer}>
                          <Text style={styles.votesCount}>{candidate.votes}</Text>
                          <Text style={styles.votesLabel}>ভোট</Text>
                          <Text style={styles.votesPercentage}>{percentage}%</Text>
                        </View>
                      </View>
                      
                      {/* Vote Progress Bar */}
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { 
                              width: `${percentage}%`,
                              backgroundColor: index === 0 ? '#4CAF50' : '#1a472a',
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>JOKSHU Election 2026</Text>
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
  header: {
    backgroundColor: '#1a472a',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  totalVotesContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  totalVotesLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  totalVotesCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  positionContainer: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  positionHeader: {
    backgroundColor: '#1a472a',
    padding: 15,
    alignItems: 'center',
  },
  positionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  positionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  positionVotes: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  noCandidatesContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noCandidatesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  candidatesContainer: {
    padding: 15,
  },
  candidateResult: {
    marginBottom: 15,
  },
  winnerResult: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 10,
    padding: 10,
    margin: -5,
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    minWidth: 40,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  winnerIcon: {
    fontSize: 16,
    marginLeft: 5,
  },
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  symbol: {
    fontSize: 20,
  },
  nameContainer: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  candidateDept: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  votesContainer: {
    alignItems: 'center',
    minWidth: 60,
  },
  votesCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  votesLabel: {
    fontSize: 12,
    color: '#666',
  },
  votesPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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