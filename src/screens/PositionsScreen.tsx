import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVoting } from '../context';
import { Candidate } from '../types';
import { Colors, BorderRadius } from '../theme';

const { width } = Dimensions.get('window');

const CARD_GRADIENTS = [
  Colors.gradients.primary,
  Colors.gradients.ocean,
  Colors.gradients.sunset,
  Colors.gradients.success,
  Colors.gradients.purple,
  Colors.gradients.candy,
  Colors.gradients.info,
  Colors.gradients.warning,
];

export const PositionsScreen: React.FC = () => {
  const { positions, candidates } = useVoting();
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={Colors.gradients.dark}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerEmoji}>📋</Text>
          <Text style={styles.headerTitle}>পদসমূহের তালিকা</Text>
          <Text style={styles.headerSubtitle}>List of All Positions</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>মোট {positions.length} টি পদ</Text>
          </View>
        </LinearGradient>

        {/* Positions */}
        <View style={styles.listContainer}>
          {positions.map((position, index) => {
            const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
            const positionCandidates = candidates.filter(c => c.position === position.id);
            const totalVotes = positionCandidates.reduce((sum, c) => sum + c.votes, 0);
            const isExpanded = expandedPosition === position.id;

            return (
              <View key={position.id}>
                {/* Position Card */}
                <TouchableOpacity 
                  onPress={() => setExpandedPosition(isExpanded ? null : position.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.card}>
                    {/* Card top gradient strip */}
                    <LinearGradient
                      colors={gradient}
                      style={styles.cardStrip}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />

                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <LinearGradient
                          colors={gradient}
                          style={styles.numberBadge}
                        >
                          <Text style={styles.numberText}>{index + 1}</Text>
                        </LinearGradient>

                        <View style={styles.codeBadge}>
                          <Text style={styles.codeText}>{position.id}</Text>
                        </View>
                        
                        <Text style={styles.expandIcon}>{isExpanded ? '⬆️' : '⬇️'}</Text>
                      </View>

                      <View style={styles.cardBody}>
                        <Text style={styles.bnTitle}>{position.titleBn}</Text>
                        <Text style={styles.enTitle}>{position.title}</Text>
                        <Text style={styles.description}>{position.description}</Text>
                      </View>

                      {/* Stats row */}
                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <Text style={styles.statIcon}>👥</Text>
                          <Text style={styles.statValue}>{positionCandidates.length}</Text>
                          <Text style={styles.statLabel}>প্রার্থী</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text style={styles.statIcon}>🗳️</Text>
                          <Text style={styles.statValue}>{totalVotes}</Text>
                          <Text style={styles.statLabel}>ভোট</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text style={styles.statIcon}>🏆</Text>
                          <Text style={styles.statValue}>
                            {positionCandidates.length > 0
                              ? [...positionCandidates].sort((a, b) => b.votes - a.votes)[0]?.symbol || '-'
                              : '-'}
                          </Text>
                          <Text style={styles.statLabel}>অগ্রণী</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Candidates List - Expanded */}
                {isExpanded && (
                  <View style={styles.candidatesContainer}>
                    {positionCandidates.length === 0 ? (
                      <View style={styles.noCandidates}>
                        <Text style={styles.noCandidatesText}>এই পদের জন্য কোনো প্রার্থী নেই</Text>
                      </View>
                    ) : (
                      positionCandidates
                        .sort((a, b) => b.votes - a.votes)
                        .map((candidate, candIdx) => (
                          <TouchableOpacity
                            key={candidate.id}
                            onPress={() => setSelectedCandidate(candidate)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.candidateCard}>
                              <LinearGradient
                                colors={gradient}
                                style={styles.candidateSymbol}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <Text style={styles.symbolText}>{candidate.symbol}</Text>
                              </LinearGradient>

                              <View style={styles.candidateInfo}>
                                <Text style={styles.candidateName}>{candidate.name}</Text>
                                <Text style={styles.candidateDept}>{candidate.department}</Text>
                                <Text style={styles.candidateId}>{candidate.studentId}</Text>
                              </View>

                              <View style={styles.candidateVotes}>
                                <Text style={styles.voteCount}>{candidate.votes}</Text>
                                <Text style={styles.voteLabel}>ভোট</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <LinearGradient
          colors={Colors.gradients.dark}
          style={styles.footer}
        >
          <Text style={styles.footerText}>JOKSHU Election 2026</Text>
          <Text style={styles.footerSubtext}>Jagannath University</Text>
        </LinearGradient>
      </ScrollView>

      {/* Candidate Modal */}
      <Modal visible={!!selectedCandidate} animationType="slide" onRequestClose={() => setSelectedCandidate(null)}>
        {selectedCandidate && (
          <View style={{ flex: 1, backgroundColor: Colors.background }}>
            {/* Modal Header */}
            <LinearGradient 
              colors={CARD_GRADIENTS[positions.findIndex(p => p.id === selectedCandidate.position) % CARD_GRADIENTS.length]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.modalTopRow}>
                <Text style={styles.modalTitle}>প্রার্থীর বিস্তারিত</Text>
                <TouchableOpacity 
                  style={styles.closeBtn}
                  onPress={() => setSelectedCandidate(null)}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalSymbol}>
                <Text style={styles.modalSymbolText}>{selectedCandidate.symbol}</Text>
              </View>

              <Text style={styles.modalName}>{selectedCandidate.name}</Text>
              <Text style={styles.modalPosition}>
                {positions.find(p => p.id === selectedCandidate.position)?.titleBn}
              </Text>
            </LinearGradient>

            {/* Modal Content */}
            <ScrollView style={styles.modalContent}>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🏛️</Text>
                  <Text style={styles.infoLabel}>বিভাগ</Text>
                  <Text style={styles.infoValue}>{selectedCandidate.department}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <Text style={styles.infoLabel}>সেশন</Text>
                  <Text style={styles.infoValue}>{selectedCandidate.session || 'N/A'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🎓</Text>
                  <Text style={styles.infoLabel}>Student ID</Text>
                  <Text style={styles.infoValue}>{selectedCandidate.studentId}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🗳️</Text>
                  <Text style={styles.infoLabel}>মোট ভোট</Text>
                  <Text style={styles.infoValue}>{selectedCandidate.votes}</Text>
                </View>
              </View>

              {selectedCandidate.manifesto && (
                <View style={styles.manifestoSection}>
                  <Text style={styles.manifestoTitle}>📜 ইশতেহার (Manifesto)</Text>
                  <Text style={styles.manifestoText}>{selectedCandidate.manifesto}</Text>
                </View>
              )}

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerEmoji: { fontSize: 40, marginBottom: 8 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 14,
  },
  totalBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  totalBadgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardStrip: { height: 5 },
  cardContent: { padding: 18 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  codeBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  codeText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  expandIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: { marginBottom: 14 },
  bnTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  enTitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },

  // Candidates Container
  candidatesContainer: {
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  
  noCandidates: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noCandidatesText: {
    color: Colors.textMuted,
    fontSize: 14,
  },

  // Candidate Card
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  candidateSymbol: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  symbolText: {
    fontSize: 24,
  },

  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  candidateDept: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  candidateId: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  candidateVotes: {
    alignItems: 'center',
    paddingLeft: 12,
  },
  voteCount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  voteLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Modal Styles
  modalHeader: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: 'bold',
  },

  modalSymbol: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSymbolText: {
    fontSize: 40,
  },

  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 6,
    textAlign: 'center',
  },
  modalPosition: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    textAlign: 'center',
  },

  modalContent: {
    flex: 1,
    padding: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoItem: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  manifestoSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  manifestoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  manifestoText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
  },

  footer: {
    alignItems: 'center',
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  footerSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
});
