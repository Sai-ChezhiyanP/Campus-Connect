import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Hash,
  Lock,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react-native';
import {
  ALLOWED_EMAIL_DOMAIN,
  normalizeIndianPhoneNumber,
  normalizeRegistrationNumber,
  SRM_REG_NO_REGEX,
} from '@campus-connect/validation';
import { mobileStore } from '../services/store';
import { GlassBackground } from '../components/GlassBackground';

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Sign In States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sign Up States
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState(1);
  const [section, setSection] = useState('A');
  const [signupPassword, setSignupPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLogin = async () => {
    const emailTrim = loginEmail.trim().toLowerCase();
    if (!emailTrim) {
      Alert.alert('Required', 'Please enter your official SRM email address.');
      return;
    }

    if (!emailTrim.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      Alert.alert(
        'Access Denied',
        `Must use your official institutional email ending with @${ALLOWED_EMAIL_DOMAIN}`
      );
      return;
    }

    setIsLoggingIn(true);

    // Look up in dynamic mobileStore users (includes seeded test users & newly registered users)
    const matched = mobileStore.users.find(
      (u) => u.college_email.toLowerCase() === emailTrim || u.registration_number.toLowerCase() === emailTrim
    );

    if (matched) {
      await mobileStore.setCurrentUser(matched);
      setIsLoggingIn(false);
      router.replace('/(tabs)');
    } else {
      setIsLoggingIn(false);
      Alert.alert(
        'Account Not Found',
        `No account found for "${emailTrim}". Please select the "Sign Up" tab above to create your student account.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Sign Up', onPress: () => setActiveTab('signup') },
        ]
      );
    }
  };

  const handleSignUp = async () => {
    const nameTrim = fullName.trim();
    const cleanReg = normalizeRegistrationNumber(regNo);
    const emailTrim = signupEmail.trim().toLowerCase();
    const cleanPhone = normalizeIndianPhoneNumber(mobileNumber);

    if (!nameTrim || nameTrim.length < 3) {
      Alert.alert('Validation Error', 'Please enter your full name as per university records.');
      return;
    }

    if (!SRM_REG_NO_REGEX.test(cleanReg)) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid SRM registration number (e.g., RA2411003010001).'
      );
      return;
    }

    if (!emailTrim.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
      Alert.alert(
        'Validation Error',
        `Must be an official institutional email ending with @${ALLOWED_EMAIL_DOMAIN}`
      );
      return;
    }

    if (!/^\+91[6-9]\d{9}$/.test(cleanPhone)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSigningUp(true);

    const result = await mobileStore.registerStudent({
      full_name: nameTrim,
      registration_number: cleanReg,
      college_email: emailTrim,
      mobile_number: cleanPhone,
      current_year_of_study: yearOfStudy,
      section: (section || 'A').toUpperCase().trim(),
    });

    setIsSigningUp(false);

    if (result.success) {
      Alert.alert(
        'Account Created',
        `Welcome to Campus Connect, ${nameTrim}! Your session is verified and saved.`,
        [{ text: 'Enter Campus', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      Alert.alert('Registration Failed', result.error || 'Could not register user.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlassBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand */}
          <View style={styles.header}>
            <View style={styles.glassLogoContainer}>
              <View style={styles.logoInnerGlow}>
                <GraduationCap color="#38BDF8" size={38} />
              </View>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.appTitle}>Campus Connect</Text>
              <View style={styles.livePill}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>RAMAPURAM</Text>
              </View>
            </View>
            <Text style={styles.appSubtitle}>SRM Institute of Science and Technology</Text>
            <Text style={styles.tagline}>Unified Digital Student & Faculty Ecosystem</Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'login' && styles.tabButtonActive]}
              onPress={() => setActiveTab('login')}
              activeOpacity={0.8}
            >
              <Shield
                color={activeTab === 'login' ? '#070B14' : '#94A3B8'}
                size={16}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'login' && styles.tabButtonTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'signup' && styles.tabButtonActive]}
              onPress={() => setActiveTab('signup')}
              activeOpacity={0.8}
            >
              <UserPlus
                color={activeTab === 'signup' ? '#070B14' : '#94A3B8'}
                size={16}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === 'signup' && styles.tabButtonTextActive,
                ]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* LOGIN TAB */}
          {activeTab === 'login' ? (
            <View style={styles.glassCard}>
              <View style={styles.glassSheen} />
              <View style={styles.cardHeader}>
                <Shield color="#38BDF8" size={18} />
                <Text style={styles.formTitle}>Student & Faculty Sign-In</Text>
              </View>
              <Text style={styles.formSub}>
                Enter your official @srmist.edu.in credentials to access your personalized campus dashboard
              </Text>

              {/* Input Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Official College Email</Text>
                <View style={styles.glassInputBox}>
                  <Mail color="#38BDF8" size={18} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="student.test@srmist.edu.in"
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                  />
                </View>
              </View>

              {/* Input Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.glassInputBox}>
                  <Lock color="#38BDF8" size={18} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••••••"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                  />
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={isLoggingIn}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoggingIn ? 'Verifying Account...' : 'Sign In to Campus Connect'}
                </Text>
                <ArrowRight color="#070B14" size={18} />
              </TouchableOpacity>

              {/* Switch to Signup */}
              <TouchableOpacity
                style={styles.switchLink}
                onPress={() => setActiveTab('signup')}
                activeOpacity={0.7}
              >
                <Text style={styles.switchLinkText}>
                  Don't have an account yet?{' '}
                  <Text style={styles.switchHighlight}>Create Student Profile</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* SIGN UP TAB */
            <View style={styles.glassCard}>
              <View style={styles.glassSheen} />
              <View style={styles.cardHeader}>
                <UserPlus color="#38BDF8" size={18} />
                <Text style={styles.formTitle}>New Student Registration</Text>
              </View>
              <Text style={styles.formSub}>
                Create your verified profile to discover events, register for symposiums, and track campus notices
              </Text>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name (as per University ID) *</Text>
                <View style={styles.glassInputBox}>
                  <User color="#38BDF8" size={18} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor="#64748B"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              {/* Registration Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SRM Registration Number *</Text>
                <View style={styles.glassInputBox}>
                  <Hash color="#38BDF8" size={18} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. RA2411003010045"
                    placeholderTextColor="#64748B"
                    autoCapitalize="characters"
                    value={regNo}
                    onChangeText={setRegNo}
                  />
                </View>
              </View>

              {/* College Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>College Email (@srmist.edu.in) *</Text>
                <View style={styles.glassInputBox}>
                  <Mail color="#38BDF8" size={18} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="rs1234@srmist.edu.in"
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={signupEmail}
                    onChangeText={setSignupEmail}
                  />
                </View>
              </View>

              {/* Mobile Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number *</Text>
                <View style={styles.glassInputBox}>
                  <Phone color="#38BDF8" size={18} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 9876543210"
                    placeholderTextColor="#64748B"
                    keyboardType="phone-pad"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                  />
                </View>
              </View>

              {/* Year of Study */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Year of Study</Text>
                <View style={styles.yearRow}>
                  {[1, 2, 3, 4].map((yr) => (
                    <TouchableOpacity
                      key={yr}
                      style={[styles.yearPill, yearOfStudy === yr && styles.yearPillActive]}
                      onPress={() => setYearOfStudy(yr)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.yearPillText,
                          yearOfStudy === yr && styles.yearPillTextActive,
                        ]}
                      >
                        Year {yr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Section */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Section (e.g. A, B, C)</Text>
                <View style={styles.glassInputBox}>
                  <BookOpen color="#38BDF8" size={18} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Section A"
                    placeholderTextColor="#64748B"
                    autoCapitalize="characters"
                    maxLength={3}
                    value={section}
                    onChangeText={setSection}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Create Password</Text>
                <View style={styles.glassInputBox}>
                  <Lock color="#38BDF8" size={18} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="••••••••••••"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    value={signupPassword}
                    onChangeText={setSignupPassword}
                  />
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSignUp}
                activeOpacity={0.85}
                disabled={isSigningUp}
              >
                <Text style={styles.primaryButtonText}>
                  {isSigningUp ? 'Registering Account...' : 'Complete Sign Up & Sign In'}
                </Text>
                <ArrowRight color="#070B14" size={18} />
              </TouchableOpacity>

              {/* Switch to Login */}
              <TouchableOpacity
                style={styles.switchLink}
                onPress={() => setActiveTab('login')}
                activeOpacity={0.7}
              >
                <Text style={styles.switchLinkText}>
                  Already have an account?{' '}
                  <Text style={styles.switchHighlight}>Sign In Here</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Institutional Compliance Footer */}
          <View style={styles.securityBadge}>
            <CheckCircle2 color="#10B981" size={14} />
            <Text style={styles.securityText}>
              Official SRMIST Single Sign-On Architecture • 256-Bit SSL Enforced
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginVertical: 18,
  },
  glassLogoContainer: {
    padding: 3,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    marginBottom: 14,
  },
  logoInnerGlow: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  liveText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  tagline: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#070B14',
    fontWeight: '800',
  },
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderTopWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  glassSheen: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  formTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  formSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 18,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  glassInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    padding: 0,
  },
  yearRow: {
    flexDirection: 'row',
    gap: 8,
  },
  yearPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  yearPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderColor: '#38BDF8',
  },
  yearPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  yearPillTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    gap: 8,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '700',
  },
  switchLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchLinkText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  switchHighlight: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  securityText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
});
