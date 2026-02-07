import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useVoting, useAuth } from '../context';
import { Position, Candidate } from '../types';
import { FirebaseStorage } from '../firebase';
import { IDCardScanner } from '../components/IDCardScanner';

const Storage = FirebaseStorage;

// Custom alert function for web compatibility
const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 1) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && buttons[1]?.onPress) {
        buttons[1].onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};

export const VotingScreen: React.FC = () => {
  const { candidates, positions, castVote, electionState, verifyStudentId, isIdVerified } = useVoting();
  const { user } = useAuth();
  const [selectedCandidates, setSelectedCandidates] = useState<Map<Position, string>>(new Map());
  const [votedPositions, setVotedPositions] = useState<Position[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [pendingVote, setPendingVote] = useState<{ candidateId: string; position: Position } | null>(null);

  React.useEffect(() => {
    loadVotedPositions();
  }, []);

  const loadVotedPositions = async () => {
    if (user) {
      try {
        const storedData = await Storage.getItem(`voter_${user.studentId}`);
        if (storedData) {
          const data = JSON.parse(storedData);
          setVotedPositions(data.votedPositions || []);
        }
      } catch (error) {
        console.error('Error loading voted positions:', error);
      }
    }
  };

  const handleCandidateSelect = (candidateId: string, position: Position) => {
    if (votedPositions.includes(position)) {
      showAlert('\u09ad\u09cb\u099f \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7', '\u0986\u09aa\u09a8\u09bf \u098f\u0987 \u09aa\u09a6\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u0987\u09a4\u09bf\u09ae\u09a7\u09cd\u09af\u09c7 \u09ad\u09cb\u099f \u09a6\u09bf\u09af\u09bc\u09c7\u099b\u09c7\u09a8\u0964');
      return;
    }

    if (!isIdVerified(user?.studentId || '')) {
      // Need ID verification
      setPendingVote({ candidateId, position });
      setShowScanner(true);
      return;
    }

    // Verify vote
    showAlert(
      '\u09ad\u09cb\u099f \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09c1\u09a8',
      `\u0986\u09aa\u09a8\u09bf \u0995\u09bf ${positions.find(p => p.id === position)?.titleBn} \u09aa\u09a6\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u098f\u0987 \u09aa\u09cd\u09b0\u09be\u09b0\u09cd\u09a5\u09c0\u0995\u09c7 \u09ad\u09cb\u099f \u09a6\u09bf\u09a4\u09c7 \u099a\u09be\u09a8?`,
      [
        { text: '\u09a8\u09be', style: 'cancel' },
        { text: '\u09b9\u09cd\u09af\u09be\u0981', onPress: () => submitVote(candidateId, position) },
      ]
    );
  };

  const handleScanSuccess = async (scannedData: string) => {
    setShowScanner(false);
    try {
      const verified = await verifyStudentId(scannedData, user?.studentId || '');
      if (verified && pendingVote) {
        showAlert(
          '\u09ad\u09cb\u099f \u09a8\u09bf\u09b6\u09cd\u099a\u09bf\u09a4 \u0995\u09b0\u09c1\u09a8',
          `\u0986\u09aa\u09a8\u09bf \u0995\u09bf ${positions.find(p => p.id === pendingVote.position)?.titleBn} \u09aa\u09a6\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u098f\u0987 \u09aa\u09cd\u09b0\u09be\u09b0\u09cd\u09a5\u09c0\u0995\u09c7 \u09ad\u09cb\u099f \u09a6\u09bf\u09a4\u09c7 \u099a\u09be\u09a8?`,
          [
            { text: '\u09a8\u09be', style: 'cancel' },
            { text: '\u09b9\u09cd\u09af\u09be\u0981', onPress: () => submitVote(pendingVote.candidateId, pendingVote.position) },
          ]
        );
        setPendingVote(null);
      } else {
        showAlert('\u09af\u09be\u099a\u09be\u0987\u0995\u09b0\u09a3 \u09ac\u09cd\u09af\u09b0\u09cd\u09a5', '\u0986\u0987\u09a1\u09bf \u0995\u09be\u09b0\u09cd\u09a1 \u09af\u09be\u099a\u09be\u0987 \u0995\u09b0\u09be \u09af\u09be\u09af\u09bc\u09a8\u09bf\u0964 \u0986\u09ac\u09be\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09c1\u09a8\u0964');
        setPendingVote(null);
      }
    } catch (error) {
      showAlert('\u09a4\u09cd\u09b0\u09c1\u099f\u09bf', '\u0986\u0987\u09a1\u09bf \u09af\u09be\u099a\u09be\u0987\u09af\u09bc\u09c7 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7');
      setPendingVote(null);
    }
  };

  const submitVote = async (candidateId: string, position: Position) => {
    setIsVoting(true);
    try {
      const success = await castVote(candidateId, position);
      if (success) {
        const updatedVotedPositions = [...votedPositions, position];
        setVotedPositions(updatedVotedPositions);
        showAlert('\u09b8\u09ab\u09b2!', '\u0986\u09aa\u09a8\u09be\u09b0 \u09ad\u09cb\u099f \u09b8\u09ab\u09b2\u09ad\u09be\u09ac\u09c7 \u099c\u09ae\u09be \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964');
        
        // Move to next position if available
        if (currentPositionIndex < positions.length - 1) {
          setCurrentPositionIndex(currentPositionIndex + 1);
        }
      } else {
        showAlert('\u09ac\u09cd\u09af\u09b0\u09cd\u09a5', '\u09ad\u09cb\u099f \u09a6\u09bf\u09a4\u09c7 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964 \u0986\u09ac\u09be\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09c1\u09a8\u0964');
      }
    } catch (error) {
      showAlert('\u09a4\u09cd\u09b0\u09c1\u099f\u09bf', '\u09ad\u09cb\u099f \u09a6\u09bf\u09a4\u09c7 \u09b8\u09ae\u09b8\u09cd\u09af\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964');
    } finally {
      setIsVoting(false);
    }
  };

  if (!electionState.isActive) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.inactiveIcon}>{'\ud83d\uddf3\ufe0f'}</Text>
        <Text style={styles.inactiveText}>{'\u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u09ac\u09b0\u09cd\u09a4\u09ae\u09be\u09a8\u09c7 \u09ac\u09a8\u09cd\u09a7'}</Text>
        <Text style={styles.inactiveSubtext}>Election is currently closed</Text>
      </View>
    );
  }

  const currentPosition = positions[currentPositionIndex];
  const currentCandidates = candidates.filter(c => c.position === currentPosition.id);

  return (
    <View style={styles.container}>
      {/* Position Navigation */}
      <View style={styles.positionNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {positions.map((pos, index) => (
            <TouchableOpacity
              key={pos.id}
              style={[
                styles.positionTab,
                index === currentPositionIndex && styles.positionTabActive,
                votedPositions.includes(pos.id) && styles.positionTabVoted,
              ]}
              onPress={() => setCurrentPositionIndex(index)}
            >
              <Text
                style={[
                  styles.positionTabText,
                  index === currentPositionIndex && styles.positionTabTextActive,
                ]}
              >
                {pos.id}
              </Text>
              {votedPositions.includes(pos.id) && <Text style={styles.checkMark}>{'\u2713'}</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Current Position Header */}
      <View style={styles.positionHeader}>
        <Text style={styles.positionTitle}>{currentPosition.titleBn}</Text>
        <Text style={styles.positionSubtitle}>{currentPosition.title}</Text>
        <Text style={styles.positionDescription}>{currentPosition.description}</Text>
      </View>

      {/* Candidates List */}
      <ScrollView style={styles.candidatesContainer}>
        {currentCandidates.map((candidate) => (
          <TouchableOpacity
            key={candidate.id}
            style={[
              styles.candidateCard,
              votedPositions.includes(candidate.position) && styles.candidateCardDisabled,
            ]}
            onPress={() => handleCandidateSelect(candidate.id, candidate.position)}
            disabled={votedPositions.includes(candidate.position) || isVoting}
          >
            <View style={styles.candidateInfo}>
              <View style={styles.candidateSymbol}>
                <Text style={styles.symbolText}>{candidate.symbol}</Text>
              </View>
              <View style={styles.candidateDetails}>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <Text style={styles.candidateDept}>{candidate.department}</Text>
                <Text style={styles.candidateSession}>{candidate.session}</Text>
              </View>
              {votedPositions.includes(candidate.position) && (
                <View style={styles.votedBadge}>
                  <Text style={styles.votedText}>{'\u09ad\u09cb\u099f \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7'}</Text>
                </View>
              )}
            </View>
            <Text style={styles.manifesto}>{candidate.manifesto}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ID Card Scanner Modal */}
      <IDCardScanner
        visible={showScanner}
        onClose={() => {
          setShowScanner(false);
          setPendingVote(null);
        }}
        onScanSuccess={handleScanSuccess}
        expectedId={user?.studentId || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  inactiveIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  inactiveText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inactiveSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  positionNav: {
    backgroundColor: '#1a472a',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  positionTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionTabActive: {
    backgroundColor: 'white',
  },
  positionTabVoted: {
    backgroundColor: '#4CAF50',
  },
  positionTabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  positionTabTextActive: {
    color: '#1a472a',
  },
  checkMark: {
    color: 'white',
    fontSize: 12,
    marginLeft: 5,
  },
  positionHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  positionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  positionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  positionDescription: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  candidatesContainer: {
    flex: 1,
    padding: 20,
  },
  candidateCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  candidateCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  candidateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  candidateSymbol: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  symbolText: {
    fontSize: 30,
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  candidateDept: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  candidateSession: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  votedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  votedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  manifesto: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
