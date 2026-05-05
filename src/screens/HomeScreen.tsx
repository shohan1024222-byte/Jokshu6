import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth, useVoting } from '../context';
import { RootStackParamList } from '../navigation/types';
import { IDCardScanner, FaceScanner } from '../components';
import { Colors, BorderRadius } from '../theme';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user, logout, isAdmin } = useAuth();
  const {
    electionState,
    positions,
    verifyStudentId,
    verifyStudentFace,
    isFaceVerified,
    faceRequired,
    candidates,
  } = useVoting();
  const [showScanner, setShowScanner] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    cardAnims.forEach((anim, i) => {
      Animated.timing(anim, { toValue: 1, duration: 500, delay: 200 + i * 100, useNativeDriver: true }).start();
    });
  }, []);

  const handleVoteClick = () => {
    if (!electionState.isActive) { showAlert('নির্বাচন বন্ধ', 'বর্তমানে ভোট গ্রহণ করা হচ্ছে না।'); return; }
    setShowScanner(true);
  };

  const handleScanSuccess = async (scannedData: string) => {
    setShowScanner(false);
    try {
      const verified = await verifyStudentId(scannedData, user?.studentId || '');
      if (verified) {
        if (faceRequired && !isFaceVerified(user?.studentId || '')) {
          setShowFaceScanner(true);
          return;
        }
        navigation.navigate('Voting');
      }
      else showAlert('যাচাইকরণ ব্যর্থ', 'আইডি কার্ড যাচাই করা যায়নি।');
    } catch { showAlert('ত্রুটি', 'আইডি যাচাইয়ে সমস্যা হয়েছে'); }
  };

  const handleFaceVerification = async (faceCode: string): Promise<boolean> => {
    const ok = await verifyStudentFace(user?.studentId || '', faceCode);
    if (ok) {
      setShowFaceScanner(false);
      navigation.navigate('Voting');
    }
    return ok;
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'আপনি কি সত্যিই লগআউট করতে চান?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const votingProgress = Math.round((electionState.votedCount / electionState.totalVoters) * 100);
  const totalVotes = candidates.reduce((s, c) => s + c.votes, 0);

  const actionCards = [
    ...(!isAdmin ? [{ icon: '🗳️', title: 'ভোট দিন', sub: 'Vote Now', grad: Colors.gradients.success, onPress: handleVoteClick }] : []),
    { icon: '👥', title: 'প্রার্থী', sub: 'Candidates', grad: Colors.gradients.ocean, onPress: () => navigation.navigate('Candidates') },
    { icon: '📋', title: 'পদসমূহ', sub: 'Positions', grad: Colors.gradients.sunset, onPress: () => navigation.navigate('Positions') },
    { icon: '📊', title: 'ফলাফল', sub: 'Results', grad: Colors.gradients.info, onPress: () => navigation.navigate('Results') },
    { icon: '👤', title: 'প্রোফাইল', sub: 'Profile', grad: Colors.gradients.warning, onPress: () => navigation.navigate('Profile') },
    ...(isAdmin ? [{ icon: '⚙️', title: 'অ্যাডমিন', sub: 'Admin', grad: Colors.gradients.purple, onPress: () => navigation.navigate('Admin') }] : []),
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View style={{ opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }}>
        <LinearGradient colors={Colors.gradients.dark} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          <View style={styles.headerTop}>
            <View style={styles.userSection}>
              <LinearGradient colors={Colors.gradients.aurora} style={styles.avatarGrad}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.welcomeText}>স্বাগতম 👋</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userDept}>{user?.department}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Election Status */}
          <View style={styles.electionBox}>
            <View style={styles.electionRow}>
              <Text style={styles.electionTitle}>🗳️ নির্বাচন ২০২৬</Text>
              <LinearGradient colors={electionState.isActive ? Colors.gradients.success : Colors.gradients.danger} style={styles.statusPill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{electionState.isActive ? 'LIVE' : 'ENDED'}</Text>
              </LinearGradient>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>ভোট অগ্রগতি</Text>
              <Text style={styles.progressPct}>{votingProgress}%</Text>
            </View>
            <View style={styles.progressBg}>
              <LinearGradient colors={Colors.gradients.aurora} style={[styles.progressFill, { width: `${Math.max(votingProgress, 2)}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            </View>
            <Text style={styles.progressCount}>{electionState.votedCount} / {electionState.totalVoters} জন ভোট দিয়েছেন</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'প্রার্থী', value: candidates.length, icon: '👥', color: Colors.gradients.ocean },
          { label: 'পদ', value: positions.length, icon: '📋', color: Colors.gradients.sunset },
          { label: 'মোট ভোট', value: totalVotes, icon: '🗳️', color: Colors.gradients.success },
          { label: 'ভোটার', value: electionState.totalVoters, icon: '🎓', color: Colors.gradients.purple },
        ].map((s, i) => (
          <Animated.View key={i} style={[styles.statCard, { opacity: cardAnims[Math.min(i, 4)], transform: [{ translateY: cardAnims[Math.min(i, 4)].interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }]}>
            <LinearGradient colors={s.color} style={styles.statGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={{ fontSize: 22 }}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </LinearGradient>
          </Animated.View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>⚡ দ্রুত অ্যাক্সেস</Text>
        <View style={styles.actionGrid}>
          {actionCards.map((card, i) => (
            <Animated.View key={i} style={[styles.actionWrap, { opacity: cardAnims[Math.min(i, 4)], transform: [{ scale: cardAnims[Math.min(i, 4)].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
              <TouchableOpacity onPress={card.onPress} activeOpacity={0.85}>
                <LinearGradient colors={card.grad} style={styles.actionCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={{ fontSize: 34, marginBottom: 10 }}>{card.icon}</Text>
                  <Text style={styles.actionTitle}>{card.title}</Text>
                  <Text style={styles.actionSub}>{card.sub}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Positions */}
      <View style={styles.positionsSection}>
        <Text style={styles.sectionTitle}>📋 নির্বাচনের পদসমূহ</Text>
        {positions.map((pos, i) => {
          const grads = [Colors.gradients.primary, Colors.gradients.ocean, Colors.gradients.sunset, Colors.gradients.success, Colors.gradients.purple, Colors.gradients.candy, Colors.gradients.info];
          return (
            <View key={pos.id} style={styles.posItem}>
              <LinearGradient colors={grads[i % grads.length]} style={styles.posBadge}>
                <Text style={styles.posBadgeText}>{i + 1}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.posTitle}>{pos.titleBn}</Text>
                <Text style={styles.posSub}>{pos.title}</Text>
              </View>
              <View style={styles.posCandCount}>
                <Text style={styles.posCandNum}>{candidates.filter(c => c.position === pos.id).length}</Text>
                <Text style={styles.posCandLabel}>প্রার্থী</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Footer */}
      <LinearGradient colors={Colors.gradients.dark} style={styles.footer}>
        <Text style={styles.footerTitle}>জগন্নাথ বিশ্ববিদ্যালয়</Text>
        <Text style={styles.footerSub}>Jagannath University, Dhaka</Text>
        <Text style={styles.footerVer}>JOKSHU v1.0 • Made with ❤️</Text>
      </LinearGradient>

      <IDCardScanner visible={showScanner} onClose={() => setShowScanner(false)} onScanSuccess={handleScanSuccess} expectedId={user?.studentId || ''} />
      <FaceScanner
        visible={showFaceScanner}
        onClose={() => setShowFaceScanner(false)}
        onVerify={handleFaceVerification}
        studentId={user?.studentId || ''}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingTop: 55, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: 'hidden' },
  headerDecor1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(108,99,255,0.1)', top: -60, right: -40 },
  headerDecor2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(0,210,255,0.08)', bottom: -30, left: -30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  userSection: { flexDirection: 'row', alignItems: 'center' },
  avatarGrad: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  welcomeText: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 2 },
  userDept: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  logoutBtn: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  logoutBtnText: { fontSize: 13, color: '#fff', fontWeight: '800', letterSpacing: 0.3 },
  electionBox: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  electionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  electionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff', marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  progressPct: { fontSize: 14, fontWeight: 'bold', color: Colors.tertiary },
  progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressCount: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6, textAlign: 'center' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: -15, gap: 10 },
  statCard: { flex: 1, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  statGrad: { padding: 14, alignItems: 'center', borderRadius: 12 },
  statValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 2 },
  actionsSection: { padding: 20, paddingTop: 28 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  actionWrap: { width: (width - 54) / 2 },
  actionCard: { padding: 22, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  actionSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  positionsSection: { paddingHorizontal: 20, paddingBottom: 10 },
  posItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  posBadge: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  posBadgeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  posTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.textPrimary },
  posSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  posCandCount: { alignItems: 'center', backgroundColor: Colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  posCandNum: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  posCandLabel: { fontSize: 10, color: Colors.textMuted },
  footer: { alignItems: 'center', padding: 30, marginTop: 10, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  footerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  footerSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  footerVer: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 10 },
});
