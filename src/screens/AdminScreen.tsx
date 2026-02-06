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
import { useVoting, useAuth } from '../context';
import { Candidate, Position } from '../types';

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

type AdminTab = 'dashboard' | 'candidates' | 'add' | 'voters';

const SYMBOLS = ['🌟', '🔥', '⚡', '🌙', '💫', '🎯', '🤝', '📢', '📣', '❤️', '🤲', '🎭', '🎨', '⚽', '🏅', '🌍', '📚', '📖', '🏆', '🌺', '🦁', '🐅', '🦅', '⭐'];

export const AdminScreen: React.FC = () => {
  const { electionState, candidates, positions, addCandidate, updateCandidate, deleteCandidate } = useVoting();
  const { isAdmin, addStudent, getRegisteredStudents, removeStudent, updateStudent } = useAuth();

  // Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Add student (voter) form
  const [voterStudentId, setVoterStudentId] = useState('');
  const [voterName, setVoterName] = useState('');
  const [voterPassword, setVoterPassword] = useState('');
  const [voterDepartment, setVoterDepartment] = useState('');
  const [voterSession, setVoterSession] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState<Array<{ studentId: string; name: string; department: string; session: string }>>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  // Edit voter
  const [editingVoter, setEditingVoter] = useState<{ studentId: string; name: string; department: string; session: string } | null>(null);
  const [showEditVoterModal, setShowEditVoterModal] = useState(false);
  const [editVoterName, setEditVoterName] = useState('');
  const [editVoterDepartment, setEditVoterDepartment] = useState('');
  const [editVoterSession, setEditVoterSession] = useState('');

  // Add candidate form
  const [addName, setAddName] = useState('');
  const [addStudentId, setAddStudentId] = useState('');
  const [addPosition, setAddPosition] = useState<Position>('VP');
  const [addDepartment, setAddDepartment] = useState('');
  const [addSession, setAddSession] = useState('');
  const [addManifesto, setAddManifesto] = useState('');
  const [addSymbol, setAddSymbol] = useState('🌟');
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [showSymbolPicker, setShowSymbolPicker] = useState(false);

  // Edit candidate
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editSession, setEditSession] = useState('');
  const [editManifesto, setEditManifesto] = useState('');
  const [editSymbol, setEditSymbol] = useState('');
  const [editPosition, setEditPosition] = useState<Position>('VP');
  const [showEditPositionPicker, setShowEditPositionPicker] = useState(false);
  const [showEditSymbolPicker, setShowEditSymbolPicker] = useState(false);

  // Filter
  const [filterPosition, setFilterPosition] = useState<Position | 'ALL'>('ALL');

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

  // ---------- ADD CANDIDATE ----------
  const resetAddForm = () => {
    setAddName('');
    setAddStudentId('');
    setAddPosition('VP');
    setAddDepartment('');
    setAddSession('');
    setAddManifesto('');
    setAddSymbol('🌟');
  };

  const handleAddCandidate = async () => {
    if (!addName.trim()) return showAlert('ত্রুটি', 'প্রার্থীর নাম দিন');
    if (!addStudentId.trim()) return showAlert('ত্রুটি', 'Student ID দিন');
    if (!addDepartment.trim()) return showAlert('ত্রুটি', 'বিভাগের নাম দিন');
    if (!addSession.trim()) return showAlert('ত্রুটি', 'সেশন দিন');
    if (!addManifesto.trim()) return showAlert('ত্রুটি', 'ইশতেহার দিন');

    const success = await addCandidate({
      name: addName.trim(),
      studentId: addStudentId.trim(),
      position: addPosition,
      department: addDepartment.trim(),
      session: addSession.trim(),
      manifesto: addManifesto.trim(),
      symbol: addSymbol,
    });

    if (success) {
      showAlert('সফল! ✅', 'প্রার্থী সফলভাবে যোগ করা হয়েছে।');
      resetAddForm();
      setActiveTab('candidates');
    } else {
      showAlert('ব্যর্থ', 'প্রার্থী যোগ করতে সমস্যা হয়েছে।');
    }
  };

  // ---------- EDIT CANDIDATE ----------
  const openEditModal = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setEditName(candidate.name);
    setEditDepartment(candidate.department);
    setEditSession(candidate.session);
    setEditManifesto(candidate.manifesto);
    setEditSymbol(candidate.symbol);
    setEditPosition(candidate.position);
    setShowEditModal(true);
  };

  const handleUpdateCandidate = async () => {
    if (!editingCandidate) return;
    if (!editName.trim()) return showAlert('ত্রুটি', 'প্রার্থীর নাম দিন');

    const success = await updateCandidate(editingCandidate.id, {
      name: editName.trim(),
      department: editDepartment.trim(),
      session: editSession.trim(),
      manifesto: editManifesto.trim(),
      symbol: editSymbol,
      position: editPosition,
    });

    if (success) {
      showAlert('সফল! ✅', 'প্রার্থীর তথ্য আপডেট করা হয়েছে।');
      setShowEditModal(false);
      setEditingCandidate(null);
    } else {
      showAlert('ব্যর্থ', 'আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  // ---------- DELETE CANDIDATE ----------
  const handleDeleteCandidate = (candidate: Candidate) => {
    showAlert(
      'প্রার্থী মুছুন',
      `আপনি কি "${candidate.name}" কে মুছে ফেলতে চান?\n\nপদ: ${positions.find(p => p.id === candidate.position)?.titleBn}`,
      [
        { text: 'না', style: 'cancel' },
        {
          text: 'হ্যাঁ, মুছুন',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCandidate(candidate.id);
            if (success) {
              showAlert('সফল!', 'প্রার্থী মুছে ফেলা হয়েছে।');
            } else {
              showAlert('ব্যর্থ', 'মুছতে সমস্যা হয়েছে।');
            }
          },
        },
      ]
    );
  };

  // ---------- RESET VOTES ----------
  const handleResetVotes = () => {
    showAlert(
      'ভোট রিসেট',
      'আপনি কি সত্যিই সব ভোট রিসেট করতে চান? এটি ফেরানো যাবে না।',
      [
        { text: 'না', style: 'cancel' },
        {
          text: 'হ্যাঁ, রিসেট',
          style: 'destructive',
          onPress: async () => {
            for (const c of candidates) {
              await updateCandidate(c.id, { votes: 0 });
            }
            showAlert('সফল!', 'সব ভোট রিসেট করা হয়েছে।');
          },
        },
      ]
    );
  };

  const filteredCandidates = filterPosition === 'ALL'
    ? candidates
    : candidates.filter(c => c.position === filterPosition);

  // ---------- ADD STUDENT (VOTER) ----------
  const loadStudents = async () => {
    const students = await getRegisteredStudents();
    setRegisteredStudents(students);
    setStudentsLoaded(true);
  };

  React.useEffect(() => {
    if (activeTab === 'voters' && !studentsLoaded) {
      loadStudents();
    }
  }, [activeTab]);

  const resetVoterForm = () => {
    setVoterStudentId('');
    setVoterName('');
    setVoterPassword('');
    setVoterDepartment('');
    setVoterSession('');
  };

  const handleAddStudent = async () => {
    if (!voterStudentId.trim()) return showAlert('ত্রুটি', 'Student ID দিন');
    if (!voterName.trim()) return showAlert('ত্রুটি', 'ছাত্র/ছাত্রীর নাম দিন');
    if (!voterPassword.trim()) return showAlert('ত্রুটি', 'পাসওয়ার্ড দিন');
    if (voterPassword.trim().length < 4) return showAlert('ত্রুটি', 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে');

    const success = await addStudent(
      voterStudentId.trim(),
      voterName.trim(),
      voterPassword.trim(),
      voterDepartment.trim() || 'N/A',
      voterSession.trim() || 'N/A',
    );

    if (success) {
      showAlert('সফল! ✅', `ভোটার "${voterName.trim()}" সফলভাবে যোগ করা হয়েছে।\n\nStudent ID: ${voterStudentId.trim()}\nPassword: ${voterPassword.trim()}`);
      resetVoterForm();
      await loadStudents();
    } else {
      showAlert('ব্যর্থ', 'ভোটার যোগ করতে সমস্যা হয়েছে।');
    }
  };

  const handleRemoveStudent = (student: { studentId: string; name: string }) => {
    showAlert(
      'ভোটার মুছুন',
      `আপনি কি "${student.name}" (${student.studentId}) কে মুছে ফেলতে চান?`,
      [
        { text: 'না', style: 'cancel' },
        {
          text: 'হ্যাঁ, মুছুন',
          style: 'destructive',
          onPress: async () => {
            const success = await removeStudent(student.studentId);
            if (success) {
              showAlert('সফল!', 'ভোটার মুছে ফেলা হয়েছে।');
              await loadStudents();
            } else {
              showAlert('ব্যর্থ', 'মুছতে সমস্যা হয়েছে।');
            }
          },
        },
      ]
    );
  };

  const openEditVoterModal = (student: { studentId: string; name: string; department: string; session: string }) => {
    setEditingVoter(student);
    setEditVoterName(student.name);
    setEditVoterDepartment(student.department);
    setEditVoterSession(student.session);
    setShowEditVoterModal(true);
  };

  const handleUpdateVoter = async () => {
    if (!editingVoter) return;
    if (!editVoterName.trim()) return showAlert('ত্রুটি', 'নাম দিন');

    const success = await updateStudent(
      editingVoter.studentId,
      editVoterName.trim(),
      editVoterDepartment.trim() || 'N/A',
      editVoterSession.trim() || 'N/A',
    );

    if (success) {
      showAlert('সফল! ✅', 'ভোটারের তথ্য আপডেট হয়েছে।');
      setShowEditVoterModal(false);
      setEditingVoter(null);
      await loadStudents();
    } else {
      showAlert('ব্যর্থ', 'আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  // ---------- RENDER ----------
  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dashboard' && styles.tabActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>📊 ড্যাশবোর্ড</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'candidates' && styles.tabActive]}
          onPress={() => setActiveTab('candidates')}
        >
          <Text style={[styles.tabText, activeTab === 'candidates' && styles.tabTextActive]}>👥 প্রার্থী</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.tabActive]}
          onPress={() => setActiveTab('add')}
        >
          <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>➕ নতুন</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'voters' && styles.tabActive]}
          onPress={() => setActiveTab('voters')}
        >
          <Text style={[styles.tabText, activeTab === 'voters' && styles.tabTextActive]}>🎓 ভোটার</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ====================== DASHBOARD TAB ====================== */}
      {activeTab === 'dashboard' && (
        <ScrollView style={styles.scrollContent}>
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
                <View style={[styles.statusBadge, electionState.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                  <Text style={styles.statusBadgeText}>
                    {electionState.isActive ? 'চলমান' : 'বন্ধ'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Position-wise Results */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>পদভিত্তিক ফলাফল</Text>
            {positions.map((position) => {
              const positionCandidates = candidates.filter(c => c.position === position.id);
              const totalVotes = positionCandidates.reduce((sum, c) => sum + c.votes, 0);
              const leader = positionCandidates.sort((a, b) => b.votes - a.votes)[0];

              return (
                <View key={position.id} style={styles.positionSummary}>
                  <View style={styles.positionSummaryHeader}>
                    <Text style={styles.positionTitle}>{position.titleBn}</Text>
                    <Text style={styles.positionStats}>
                      {positionCandidates.length} জন • {totalVotes} ভোট
                    </Text>
                  </View>
                  {leader && leader.votes > 0 && (
                    <Text style={styles.leaderText}>
                      🏆 {leader.name} ({leader.votes} ভোট)
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          {/* Admin Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>দ্রুত অ্যাকশন</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('add')}>
              <Text style={styles.actionButtonText}>➕ নতুন প্রার্থী যোগ করুন</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('candidates')}>
              <Text style={styles.actionButtonText}>👥 প্রার্থী ব্যবস্থাপনা</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setActiveTab('voters')}>
              <Text style={styles.actionButtonText}>🎓 ভোটার যোগ/ব্যবস্থাপনা</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleResetVotes}>
              <Text style={styles.dangerButtonText}>🔄 সব ভোট রিসেট করুন</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>JOKSU Admin Panel v1.0</Text>
          </View>
        </ScrollView>
      )}

      {/* ====================== CANDIDATES TAB ====================== */}
      {activeTab === 'candidates' && (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>প্রার্থী তালিকা ({filteredCandidates.length})</Text>

            {/* Position Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterChip, filterPosition === 'ALL' && styles.filterChipActive]}
                onPress={() => setFilterPosition('ALL')}
              >
                <Text style={[styles.filterChipText, filterPosition === 'ALL' && styles.filterChipTextActive]}>সব</Text>
              </TouchableOpacity>
              {positions.map(pos => (
                <TouchableOpacity
                  key={pos.id}
                  style={[styles.filterChip, filterPosition === pos.id && styles.filterChipActive]}
                  onPress={() => setFilterPosition(pos.id)}
                >
                  <Text style={[styles.filterChipText, filterPosition === pos.id && styles.filterChipTextActive]}>
                    {pos.id}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Candidate Cards */}
          {filteredCandidates.map(candidate => (
            <View key={candidate.id} style={styles.candidateCard}>
              <View style={styles.candidateCardHeader}>
                <View style={styles.candidateSymbolBox}>
                  <Text style={styles.symbolText}>{candidate.symbol}</Text>
                </View>
                <View style={styles.candidateCardInfo}>
                  <Text style={styles.candidateCardName}>{candidate.name}</Text>
                  <Text style={styles.candidateCardMeta}>
                    {positions.find(p => p.id === candidate.position)?.titleBn} • {candidate.department}
                  </Text>
                  <Text style={styles.candidateCardMeta}>
                    ID: {candidate.studentId} • সেশন: {candidate.session}
                  </Text>
                  <Text style={styles.candidateCardVotes}>🗳️ {candidate.votes} ভোট</Text>
                </View>
              </View>
              {candidate.manifesto ? (
                <Text style={styles.candidateManifesto} numberOfLines={2}>
                  📜 {candidate.manifesto}
                </Text>
              ) : null}
              <View style={styles.candidateActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(candidate)}>
                  <Text style={styles.editButtonText}>✏️ এডিট</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteCandidate(candidate)}>
                  <Text style={styles.deleteButtonText}>🗑️ মুছুন</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {filteredCandidates.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📭</Text>
              <Text style={styles.emptyStateText}>কোনো প্রার্থী নেই</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ====================== ADD CANDIDATE TAB ====================== */}
      {activeTab === 'add' && (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>➕ নতুন প্রার্থী যোগ করুন</Text>

            <View style={styles.formCard}>
              <Text style={styles.formLabel}>নাম *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="প্রার্থীর পুরো নাম"
                placeholderTextColor="#999"
                value={addName}
                onChangeText={setAddName}
              />

              <Text style={styles.formLabel}>Student ID *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Student ID"
                placeholderTextColor="#999"
                value={addStudentId}
                onChangeText={setAddStudentId}
                autoCapitalize="none"
              />

              <Text style={styles.formLabel}>পদ *</Text>
              <TouchableOpacity style={styles.formPicker} onPress={() => setShowPositionPicker(true)}>
                <Text style={styles.formPickerText}>
                  {positions.find(p => p.id === addPosition)?.titleBn} ({addPosition})
                </Text>
                <Text style={styles.formPickerArrow}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.formLabel}>বিভাগ *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="যেমন: Computer Science"
                placeholderTextColor="#999"
                value={addDepartment}
                onChangeText={setAddDepartment}
              />

              <Text style={styles.formLabel}>সেশন *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="যেমন: 2021-22"
                placeholderTextColor="#999"
                value={addSession}
                onChangeText={setAddSession}
              />

              <Text style={styles.formLabel}>প্রতীক</Text>
              <TouchableOpacity style={styles.formPicker} onPress={() => setShowSymbolPicker(true)}>
                <Text style={styles.symbolPickerText}>{addSymbol}</Text>
                <Text style={styles.formPickerArrow}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.formLabel}>ইশতেহার *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                placeholder="প্রার্থীর ইশতেহার লিখুন..."
                placeholderTextColor="#999"
                value={addManifesto}
                onChangeText={setAddManifesto}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddCandidate}>
                <Text style={styles.submitButtonText}>✅ প্রার্থী যোগ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ====================== VOTERS TAB ====================== */}
      {activeTab === 'voters' && (
        <ScrollView style={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎓 নতুন ভোটার যোগ করুন</Text>

            <View style={styles.formCard}>
              <Text style={styles.formLabel}>Student ID *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="যেমন: B210305030"
                placeholderTextColor="#999"
                value={voterStudentId}
                onChangeText={setVoterStudentId}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.formHint}>
                💡 স্ক্যানে last ৯ digit মিললেই ম্যাচ হবে (B210305030 = 210305030)
              </Text>

              <Text style={styles.formLabel}>নাম *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="ছাত্র/ছাত্রীর পুরো নাম"
                placeholderTextColor="#999"
                value={voterName}
                onChangeText={setVoterName}
              />

              <Text style={styles.formLabel}>পাসওয়ার্ড *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="লগইন পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)"
                placeholderTextColor="#999"
                value={voterPassword}
                onChangeText={setVoterPassword}
                autoCapitalize="none"
              />

              <Text style={styles.formLabel}>বিভাগ</Text>
              <TextInput
                style={styles.formInput}
                placeholder="যেমন: Computer Science"
                placeholderTextColor="#999"
                value={voterDepartment}
                onChangeText={setVoterDepartment}
              />

              <Text style={styles.formLabel}>সেশন</Text>
              <TextInput
                style={styles.formInput}
                placeholder="যেমন: 2021-22"
                placeholderTextColor="#999"
                value={voterSession}
                onChangeText={setVoterSession}
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddStudent}>
                <Text style={styles.submitButtonText}>✅ ভোটার যোগ করুন</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Registered Students List */}
          <View style={styles.section}>
            <View style={styles.voterListHeader}>
              <Text style={styles.sectionTitle}>📋 নিবন্ধিত ভোটার ({registeredStudents.length})</Text>
              <TouchableOpacity onPress={loadStudents} style={styles.refreshBtn}>
                <Text style={styles.refreshBtnText}>🔄</Text>
              </TouchableOpacity>
            </View>

            {registeredStudents.map((student, idx) => (
              <View key={`${student.studentId}-${idx}`} style={styles.voterCard}>
                <View style={styles.voterAvatar}>
                  <Text style={styles.voterAvatarText}>{student.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.voterInfo}>
                  <Text style={styles.voterName}>{student.name}</Text>
                  <Text style={styles.voterMeta}>ID: {student.studentId}</Text>
                  <Text style={styles.voterMeta}>{student.department} • {student.session}</Text>
                </View>
                <View style={styles.voterActions}>
                  <TouchableOpacity
                    style={styles.voterEditBtn}
                    onPress={() => openEditVoterModal(student)}
                  >
                    <Text style={styles.voterEditText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.voterDeleteBtn}
                    onPress={() => handleRemoveStudent(student)}
                  >
                    <Text style={styles.voterDeleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {registeredStudents.length === 0 && studentsLoaded && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📭</Text>
                <Text style={styles.emptyStateText}>কোনো ভোটার নিবন্ধিত নেই</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ====================== POSITION PICKER MODAL ====================== */}
      <Modal visible={showPositionPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPositionPicker(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>পদ নির্বাচন করুন</Text>
            <ScrollView style={styles.pickerScroll}>
              {positions.map(pos => (
                <TouchableOpacity
                  key={pos.id}
                  style={[styles.pickerItem, addPosition === pos.id && styles.pickerItemActive]}
                  onPress={() => {
                    setAddPosition(pos.id);
                    setShowPositionPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, addPosition === pos.id && styles.pickerItemTextActive]}>
                    {pos.titleBn} ({pos.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ====================== SYMBOL PICKER MODAL ====================== */}
      <Modal visible={showSymbolPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowSymbolPicker(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>প্রতীক নির্বাচন করুন</Text>
            <View style={styles.symbolGrid}>
              {SYMBOLS.map((sym, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.symbolOption, addSymbol === sym && styles.symbolOptionActive]}
                  onPress={() => {
                    setAddSymbol(sym);
                    setShowSymbolPicker(false);
                  }}
                >
                  <Text style={styles.symbolOptionText}>{sym}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ====================== EDIT MODAL ====================== */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.editOverlay}>
          <View style={styles.editContainer}>
            <ScrollView>
              <Text style={styles.editTitle}>✏️ প্রার্থী এডিট করুন</Text>

              <Text style={styles.formLabel}>নাম</Text>
              <TextInput style={styles.formInput} value={editName} onChangeText={setEditName} />

              <Text style={styles.formLabel}>পদ</Text>
              <TouchableOpacity style={styles.formPicker} onPress={() => setShowEditPositionPicker(true)}>
                <Text style={styles.formPickerText}>
                  {positions.find(p => p.id === editPosition)?.titleBn} ({editPosition})
                </Text>
                <Text style={styles.formPickerArrow}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.formLabel}>বিভাগ</Text>
              <TextInput style={styles.formInput} value={editDepartment} onChangeText={setEditDepartment} />

              <Text style={styles.formLabel}>সেশন</Text>
              <TextInput style={styles.formInput} value={editSession} onChangeText={setEditSession} />

              <Text style={styles.formLabel}>প্রতীক</Text>
              <TouchableOpacity style={styles.formPicker} onPress={() => setShowEditSymbolPicker(true)}>
                <Text style={styles.symbolPickerText}>{editSymbol}</Text>
                <Text style={styles.formPickerArrow}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.formLabel}>ইশতেহার</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={editManifesto}
                onChangeText={setEditManifesto}
                multiline
                numberOfLines={3}
              />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editCancelBtn}
                  onPress={() => {
                    setShowEditModal(false);
                    setEditingCandidate(null);
                  }}
                >
                  <Text style={styles.editCancelText}>বাতিল</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editSaveBtn} onPress={handleUpdateCandidate}>
                  <Text style={styles.editSaveText}>আপডেট করুন</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* EDIT POSITION PICKER */}
      <Modal visible={showEditPositionPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowEditPositionPicker(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>পদ নির্বাচন করুন</Text>
            <ScrollView style={styles.pickerScroll}>
              {positions.map(pos => (
                <TouchableOpacity
                  key={pos.id}
                  style={[styles.pickerItem, editPosition === pos.id && styles.pickerItemActive]}
                  onPress={() => {
                    setEditPosition(pos.id);
                    setShowEditPositionPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, editPosition === pos.id && styles.pickerItemTextActive]}>
                    {pos.titleBn} ({pos.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* EDIT SYMBOL PICKER */}
      <Modal visible={showEditSymbolPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowEditSymbolPicker(false)}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>প্রতীক নির্বাচন করুন</Text>
            <View style={styles.symbolGrid}>
              {SYMBOLS.map((sym, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.symbolOption, editSymbol === sym && styles.symbolOptionActive]}
                  onPress={() => {
                    setEditSymbol(sym);
                    setShowEditSymbolPicker(false);
                  }}
                >
                  <Text style={styles.symbolOptionText}>{sym}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ====================== EDIT VOTER MODAL ====================== */}
      <Modal visible={showEditVoterModal} animationType="slide" transparent>
        <View style={styles.editOverlay}>
          <View style={styles.editContainer}>
            <ScrollView>
              <Text style={styles.editTitle}>✏️ ভোটার এডিট করুন</Text>
              {editingVoter && (
                <Text style={{ textAlign: 'center', color: '#777', marginBottom: 10, fontSize: 13 }}>
                  ID: {editingVoter.studentId}
                </Text>
              )}

              <Text style={styles.formLabel}>নাম</Text>
              <TextInput style={styles.formInput} value={editVoterName} onChangeText={setEditVoterName} />

              <Text style={styles.formLabel}>বিভাগ</Text>
              <TextInput style={styles.formInput} value={editVoterDepartment} onChangeText={setEditVoterDepartment} />

              <Text style={styles.formLabel}>সেশন</Text>
              <TextInput style={styles.formInput} value={editVoterSession} onChangeText={setEditVoterSession} />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editCancelBtn}
                  onPress={() => {
                    setShowEditVoterModal(false);
                    setEditingVoter(null);
                  }}
                >
                  <Text style={styles.editCancelText}>বাতিল</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editSaveBtn} onPress={handleUpdateVoter}>
                  <Text style={styles.editSaveText}>আপডেট করুন</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flex: 1,
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

  // Tab Bar
  tabBar: {
    backgroundColor: '#9C27B0',
    paddingTop: 4,
    maxHeight: 56,
  },
  tabBarContent: {
    flexDirection: 'row',
    flexGrow: 1,
  },
  tab: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Header
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },

  // Section
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  // Status
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 15,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 14,
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
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Positions
  positionSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 2,
  },
  positionSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  positionStats: {
    fontSize: 12,
    color: '#888',
  },
  leaderText: {
    fontSize: 13,
    color: '#9C27B0',
    marginTop: 6,
    fontWeight: '600',
  },

  // Action Buttons
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
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

  // Filter
  filterRow: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  filterChipActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: 'white',
  },

  // Candidate Card
  candidateCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  candidateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  candidateSymbolBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  symbolText: {
    fontSize: 24,
  },
  candidateCardInfo: {
    flex: 1,
  },
  candidateCardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  candidateCardMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  candidateCardVotes: {
    fontSize: 13,
    color: '#9C27B0',
    fontWeight: 'bold',
    marginTop: 4,
  },
  candidateManifesto: {
    fontSize: 13,
    color: '#555',
    marginTop: 10,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  candidateActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#1565C0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },

  // Form
  formCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    elevation: 3,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 14,
  },
  formInput: {
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  formTextarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 13,
    backgroundColor: '#fafafa',
  },
  formPickerText: {
    fontSize: 15,
    color: '#333',
  },
  formPickerArrow: {
    fontSize: 12,
    color: '#999',
  },
  symbolPickerText: {
    fontSize: 28,
  },
  submitButton: {
    backgroundColor: '#9C27B0',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },

  // Picker Modal
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerScroll: {
    maxHeight: 350,
  },
  pickerItem: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#f5f5f5',
  },
  pickerItemActive: {
    backgroundColor: '#9C27B0',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  pickerItemTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  symbolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  symbolOption: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  symbolOptionActive: {
    borderColor: '#9C27B0',
    backgroundColor: '#F3E5F5',
  },
  symbolOptionText: {
    fontSize: 26,
  },

  // Edit Modal
  editOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  editContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9C27B0',
    textAlign: 'center',
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  editCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  editCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  editSaveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#9C27B0',
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },

  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: 'bold',
  },

  // Voter styles
  formHint: {
    fontSize: 12,
    color: '#9C27B0',
    marginTop: 4,
    fontStyle: 'italic',
  },
  voterListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshBtn: {
    padding: 8,
  },
  refreshBtnText: {
    fontSize: 22,
  },
  voterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  voterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  voterAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  voterInfo: {
    flex: 1,
  },
  voterName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
  voterMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 1,
  },
  voterDeleteBtn: {
    padding: 10,
  },
  voterDeleteText: {
    fontSize: 20,
  },
  voterEditBtn: {
    padding: 10,
  },
  voterEditText: {
    fontSize: 20,
  },
  voterActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});