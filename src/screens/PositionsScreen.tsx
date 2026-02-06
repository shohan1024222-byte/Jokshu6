import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useVoting } from '../context';

export const PositionsScreen: React.FC = () => {
  const { positions } = useVoting();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 পদসমূহের তালিকা</Text>
        <Text style={styles.headerSubtitle}>List of All Positions</Text>
      </View>

      {/* Positions List */}
      <View style={styles.listContainer}>
        {positions.map((position, index) => (
          <View key={position.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{position.id}</Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.bnTitle}>{position.titleBn}</Text>
              <Text style={styles.enTitle}>{position.title}</Text>
              <Text style={styles.description}>{position.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>মোট পদ সংখ্যা: {positions.length}</Text>
        <Text style={styles.footerSubtext}>Total Positions: {positions.length}</Text>
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
    paddingTop: 15,
    paddingBottom: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a472a',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  codeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  codeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardBody: {
    padding: 15,
  },
  bnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a472a',
    marginBottom: 4,
  },
  enTitle: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    padding: 25,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a472a',
  },
  footerSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});
