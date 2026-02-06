import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useVoting } from '../context';
import { Position, Candidate } from '../types';

export const CandidatesScreen: React.FC = () => {
  const { candidates, positions } = useVoting();
  const [selectedPosition, setSelectedPosition] = useState<Position | 'all'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = selectedPosition === 'all'
    ? candidates
    : candidates.filter(c => c.position === selectedPosition);

  return (
    <View style={styles.container}>
      {/* Position Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedPosition === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedPosition('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedPosition === 'all' && styles.filterTextActive,
              ]}
            >
              সকল
            </Text>
          </TouchableOpacity>
          
          {positions.map((position) => (
            <TouchableOpacity
              key={position.id}
              style={[
                styles.filterButton,
                selectedPosition === position.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedPosition(position.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedPosition === position.id && styles.filterTextActive,
                ]}
              >
                {position.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Candidates List */}
      <ScrollView style={styles.candidatesList}>
        {filteredCandidates.map((candidate) => (
          <TouchableOpacity
            key={candidate.id}
            style={styles.candidateCard}
            onPress={() => setSelectedCandidate(candidate)}
          >
            <View style={styles.candidateHeader}>
              <View style={styles.symbolContainer}>
                <Text style={styles.symbol}>{candidate.symbol}</Text>
              </View>
              <View style={styles.candidateInfo}>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <Text style={styles.candidatePosition}>
                  {positions.find(p => p.id === candidate.position)?.titleBn}
                </Text>
                <Text style={styles.candidateDept}>{candidate.department}</Text>
                <Text style={styles.candidateSession}>{candidate.session}</Text>
              </View>
              <View style={styles.voteCount}>
                <Text style={styles.voteNumber}>{candidate.votes}</Text>
                <Text style={styles.voteLabel}>ভোট</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Candidate Details Modal */}
      <Modal
        visible={selectedCandidate !== null}
        animationType="slide"
        onRequestClose={() => setSelectedCandidate(null)}
      >
        {selectedCandidate && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>প্রার্থীর বিস্তারিত</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedCandidate(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.candidateProfile}>
                <View style={styles.profileSymbol}>
                  <Text style={styles.profileSymbolText}>{selectedCandidate.symbol}</Text>
                </View>
                <Text style={styles.profileName}>{selectedCandidate.name}</Text>
                <Text style={styles.profilePosition}>
                  {positions.find(p => p.id === selectedCandidate.position)?.titleBn}
                </Text>
                <Text style={styles.profileDept}>{selectedCandidate.department}</Text>
                <Text style={styles.profileSession}>{selectedCandidate.session}</Text>
                <Text style={styles.profileId}>ID: {selectedCandidate.studentId}</Text>
              </View>
              
              <View style={styles.manifestoContainer}>
                <Text style={styles.manifestoTitle}>ইশতেহার</Text>
                <Text style={styles.manifestoText}>{selectedCandidate.manifesto}</Text>
              </View>
              
              <View style={styles.votesContainer}>
                <Text style={styles.votesTitle}>বর্তমান ভোট</Text>
                <Text style={styles.votesCount}>{selectedCandidate.votes}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#1a472a',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: 'white',
  },
  candidatesList: {
    flex: 1,
    padding: 15,
  },
  candidateCard: {
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
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  symbol: {
    fontSize: 24,
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
    fontSize: 14,
    color: '#1a472a',
    fontWeight: 'bold',
    marginTop: 2,
  },
  candidateDept: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  candidateSession: {
    fontSize: 12,
    color: '#999',
    marginTop: 1,
  },
  voteCount: {
    alignItems: 'center',
  },
  voteNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  voteLabel: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a472a',
    padding: 20,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  candidateProfile: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSymbol: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a472a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileSymbolText: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profilePosition: {
    fontSize: 18,
    color: '#1a472a',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileDept: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  profileSession: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  profileId: {
    fontSize: 12,
    color: '#999',
  },
  manifestoContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manifestoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a472a',
    marginBottom: 10,
  },
  manifestoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  votesContainer: {
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
  votesTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  votesCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a472a',
  },
});