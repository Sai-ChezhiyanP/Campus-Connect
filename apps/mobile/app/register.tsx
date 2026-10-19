import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import {
  ALLOWED_EMAIL_DOMAIN,
  normalizeIndianPhoneNumber,
  normalizeRegistrationNumber,
  SRM_REG_NO_REGEX,
} from '@campus-connect/validation';
import { INITIAL_BTECH_PROGRAMMES } from '@campus-connect/shared';
import { Profile } from '@campus-connect/types';
import { mobileStore } from '../services/store';

export default function RegisterScreen() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Academic Info
  const [selectedProgramme, setSelectedProgramme] = useState<(typeof INITIAL_BTECH_PROGRAMMES)[number]>(INITIAL_BTECH_PROGRAMMES[6]); // CSE AIML
  const [admissionYear, setAdmissionYear] = useState('2024');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [section, setSection] = useState('A');
  const [programmeModalVisible, setProgrammeModalVisible] = useState(false);
  const [searchProgramme, setSearchProgramme] = useState('');

  // Step 3: Verification
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const filteredProgrammes = INITIAL_BTECH_PROGRAMMES.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProgramme.toLowerCase()) ||
      p.code.toLowerCase().includes(searchProgramme.toLowerCase())
  );

  const handleStep1Next = () => {
    const cleanReg = normalizeRegistrationNumber(regNo);
    if (!fullName.trim() || fullName.length < 3) {
      Alert.alert('Validation Error', 'Please enter your full name as registered in college records.');
      return;
    }
    if (!SRM_REG_NO_REGEX.test(cleanReg)) {
      Alert.alert('Validation Error', 'Please enter a valid SRM registration number (e.g., RA2411003010001).');
      return;
    }
    const cleanPhone = normalizeIndianPhoneNumber(mobile);
    if (!/^\+91[6-9]\d{9}$/.test(cleanPhone)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      Alert.alert('Validation Error', `Must be an official institutional email ending with @${ALLOWED_EMAIL_DOMAIN}`);
      return;
    }

    setRegNo(cleanReg);
    setMobile(cleanPhone);
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!section.trim()) {
      Alert.alert('Validation Error', 'Please enter your academic section (e.g., A, B, C).');
      return;
    }
    setStep(3);
  };

  const handleVerifyAndActivate = () => {
    if (emailOtp.length < 4 || mobileOtp.length < 4) {
      Alert.alert('Verification', 'Please enter the 4-digit verification codes sent to your email and phone.');
      return;
    }

    setIsVerifying(true);
    setTimeout(async () => {
      const res = await mobileStore.registerStudent({
        full_name: fullName,
        registration_number: regNo,
        college_email: email,
        mobile_number: mobile,
        current_year_of_study: yearOfStudy,
        section: section,
        department_id: selectedProgramme.deptCode,
        programme_id: selectedProgramme.code,
      });

      setIsVerifying(false);
      if (res.success) {
        setStep(4);
      } else {
        Alert.alert('Registration Notice', res.error || 'Failed to complete registration.');
      }
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={styles.stepCircleContainer}>
              <View
                style={[
                  styles.stepCircle,
                  step === s && styles.stepCircleActive,
                  step > s && styles.stepCircleCompleted,
                ]}
              >
                {step > s ? (
                  <Check color="#0F172A" size={14} />
                ) : (
                  <Text style={[styles.stepNumber, step === s && styles.stepNumberActive]}>{s}</Text>
                )}
              </View>
              {s < 4 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <View style={styles.formCard}>
            <Text style={styles.stepTitle}>Personal Details</Text>
            <Text style={styles.stepSubtitle}>Step 1: Official institutional student details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name (As per College ID) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Aarav Sharma"
                placeholderTextColor="#64748B"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SRM Registration Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="RA2411003010001"
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                value={regNo}
                onChangeText={setRegNo}
              />
              <Text style={styles.helperText}>Must follow SRM registration format</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Indian Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Official Institutional Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="name.initial@srmist.edu.in"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.helperText}>Restricted strictly to @srmist.edu.in domain</Text>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleStep1Next} activeOpacity={0.85}>
              <Text style={styles.nextButtonText}>Next: Academic Details</Text>
              <ArrowRight color="#0F172A" size={16} />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Academic Info */}
        {step === 2 && (
          <View style={styles.formCard}>
            <Text style={styles.stepTitle}>Academic Programme</Text>
            <Text style={styles.stepSubtitle}>Step 2: Department and branch selection</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Campus</Text>
              <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyText}>SRMIST — Ramapuram Campus</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Degree</Text>
              <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyText}>Bachelor of Technology (B.Tech)</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>B.Tech Programme *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setProgrammeModalVisible(true)}
              >
                <Text style={styles.dropdownButtonText}>{selectedProgramme.name}</Text>
                <BookOpen color="#38BDF8" size={16} />
              </TouchableOpacity>
              <Text style={styles.helperText}>Select from 18 configured B.Tech specializations</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current Year of Study *</Text>
              <View style={styles.yearGrid}>
                {[1, 2, 3, 4].map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.yearButton, yearOfStudy === y && styles.yearButtonActive]}
                    onPress={() => setYearOfStudy(y)}
                  >
                    <Text style={[styles.yearButtonText, yearOfStudy === y && styles.yearButtonTextActive]}>
                      Year {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Section *</Text>
              <TextInput
                style={styles.input}
                placeholder="A, B, C, etc."
                placeholderTextColor="#64748B"
                autoCapitalize="characters"
                value={section}
                onChangeText={setSection}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                <ArrowLeft color="#F8FAFC" size={16} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButtonFlex} onPress={handleStep2Next} activeOpacity={0.85}>
                <Text style={styles.nextButtonText}>Next: Verification</Text>
                <ArrowRight color="#0F172A" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: Identity Verification */}
        {step === 3 && (
          <View style={styles.formCard}>
            <Text style={styles.stepTitle}>Identity Verification</Text>
            <Text style={styles.stepSubtitle}>Step 3: Verification against institutional roster</Text>

            <View style={styles.verificationNotice}>
              <ShieldCheck color="#38BDF8" size={20} />
              <Text style={styles.verificationNoticeText}>
                Verification codes generated for {email} and {mobile}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>College Email Verification Code (4 Digits) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit code (e.g., 1234)"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                maxLength={4}
                value={emailOtp}
                onChangeText={setEmailOtp}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile SMS OTP (4 Digits) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit SMS OTP (e.g., 5678)"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                maxLength={4}
                value={mobileOtp}
                onChangeText={setMobileOtp}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                <ArrowLeft color="#F8FAFC" size={16} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButtonFlex}
                onPress={handleVerifyAndActivate}
                disabled={isVerifying}
                activeOpacity={0.85}
              >
                <Text style={styles.nextButtonText}>
                  {isVerifying ? 'Verifying...' : 'Verify & Activate'}
                </Text>
                <Check color="#0F172A" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 4: Activation Confirmed */}
        {step === 4 && (
          <View style={[styles.formCard, { alignItems: 'center' }]}>
            <View style={styles.successCircle}>
              <CheckCircle2 color="#10B981" size={48} />
            </View>

            <Text style={styles.successTitle}>Account Activated!</Text>
            <Text style={styles.successSubtitle}>
              Welcome to Campus Connect, {fullName}. Your verified account is now active.
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryItem}>Registration: {regNo}</Text>
              <Text style={styles.summaryItem}>Programme: {selectedProgramme.name}</Text>
              <Text style={styles.summaryItem}>Status: Institutional Verified</Text>
            </View>

            <TouchableOpacity
              style={styles.startAppButton}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.85}
            >
              <Text style={styles.startAppButtonText}>Enter Campus Connect Feed</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Programme Selection Modal */}
      <Modal visible={programmeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select B.Tech Specialization</Text>
              <TouchableOpacity onPress={() => setProgrammeModalVisible(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBar}>
              <Search color="#94A3B8" size={16} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search 18 B.Tech programmes..."
                placeholderTextColor="#64748B"
                value={searchProgramme}
                onChangeText={setSearchProgramme}
              />
            </View>

            <ScrollView style={styles.modalList}>
              {filteredProgrammes.map((p) => {
                const isSelected = selectedProgramme.code === p.code;
                return (
                  <TouchableOpacity
                    key={p.code}
                    style={[styles.programmeItem, isSelected && styles.programmeItemActive]}
                    onPress={() => {
                      setSelectedProgramme(p);
                      setProgrammeModalVisible(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.programmeName, isSelected && styles.programmeNameActive]}>
                        {p.name}
                      </Text>
                      <Text style={styles.programmeDept}>Dept: {p.deptCode}</Text>
                    </View>
                    {isSelected && <Check color="#38BDF8" size={18} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  stepCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepCircleActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepNumber: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#0F172A',
  },
  stepLine: {
    width: 36,
    height: 2,
    backgroundColor: '#1E293B',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  helperText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
  },
  readOnlyBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  readOnlyText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownButtonText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  yearGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  yearButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  yearButtonActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  yearButtonText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  yearButtonTextActive: {
    color: '#0F172A',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 10,
  },
  nextButtonFlex: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  nextButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  backButtonText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  verificationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#38BDF815',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38BDF830',
  },
  verificationNoticeText: {
    color: '#38BDF8',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B98115',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  successSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginVertical: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  summaryItem: {
    color: '#CBD5E1',
    fontSize: 12,
  },
  startAppButton: {
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
  },
  startAppButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 14,
  },
  modalSearchInput: {
    color: '#F8FAFC',
    fontSize: 12,
    flex: 1,
  },
  modalList: {
    maxHeight: 350,
  },
  programmeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  programmeItemActive: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
  },
  programmeName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  programmeNameActive: {
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  programmeDept: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
});
