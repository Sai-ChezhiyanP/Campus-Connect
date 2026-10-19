import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  GraduationCap,
  LogOut,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react-native';
import { AppRole, Profile } from '@campus-connect/types';
import { MOBILE_TEST_USERS, mobileStore } from '../../services/store';
import { GlassBackground } from '../../components/GlassBackground';

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState(mobileStore.currentUser);

  useEffect(() => {
    const unsub = mobileStore.subscribe(() => {
      setCurrentUser(mobileStore.currentUser);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Campus Connect?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await mobileStore.logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GlassBackground />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Holographic Glass Student ID Card */}
        <View style={styles.holoIdCard}>
          <View style={styles.holoTopGlow} />

          <View style={styles.cardHeader}>
            <View style={styles.idBrandRow}>
              <View style={styles.brandIconBox}>
                <GraduationCap color="#38BDF8" size={20} />
              </View>
              <View>
                <Text style={styles.idInstitution}>SRM INSTITUTE OF SCIENCE & TECH</Text>
                <Text style={styles.idCampus}>Ramapuram Campus • Chennai</Text>
              </View>
            </View>

            <View style={styles.verifiedHoloPill}>
              <ShieldCheck color="#10B981" size={12} />
              <Text style={styles.verifiedHoloText}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.idProfileRow}>
            <View style={styles.avatarBorder}>
              <Image
                source={{
                  uri:
                    currentUser.avatar_url ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
                }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.idInfo}>
              <Text style={styles.fullName}>{currentUser.full_name}</Text>
              <Text style={styles.regNo}>{currentUser.registration_number}</Text>
              <View style={styles.rolesRow}>
                {currentUser.roles?.map((r) => (
                  <View key={r} style={styles.roleTag}>
                    <Text style={styles.roleTagText}>{r.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Academic Details Glass Section */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionHeaderTitle}>Academic Enrollment</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Degree & Programme</Text>
            <Text style={styles.infoValue}>B.Tech (Computer Science & Engg)</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year & Section</Text>
            <Text style={styles.infoValue}>
              Year {currentUser.current_year_of_study} • Section {currentUser.section || 'A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Official College Email</Text>
            <Text style={styles.infoValue}>{currentUser.college_email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile Number</Text>
            <Text style={styles.infoValue}>{currentUser.mobile_number}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push('/register')}
          activeOpacity={0.8}
        >
          <UserPlus color="#38BDF8" size={16} />
          <Text style={styles.registerButtonText}>Register Another Student</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut color="#EF4444" size={16} />
          <Text style={styles.signOutText}>Sign Out of Campus Connect</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  holoIdCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
    borderTopWidth: 1.5,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  holoTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#38BDF8',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  idBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idInstitution: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  idCampus: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 1,
  },
  verifiedHoloPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedHoloText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  idProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarBorder: {
    padding: 3,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  idInfo: {
    flex: 1,
  },
  fullName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  regNo: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  roleTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleTagText: {
    color: '#CBD5E1',
    fontSize: 9,
    fontWeight: '800',
  },
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderTopWidth: 1.5,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeaderTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 12,
    lineHeight: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  roleGrid: {
    gap: 8,
  },
  roleCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  roleCardActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  roleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleCardName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  roleCardNameActive: {
    color: '#070B14',
    fontWeight: '800',
  },
  activeCheck: {
    padding: 2,
  },
  roleCardType: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  roleCardEmail: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  roleCardEmailActive: {
    color: '#070B14',
    opacity: 0.85,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
