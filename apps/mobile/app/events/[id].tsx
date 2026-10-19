import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = Math.min(SCREEN_WIDTH - 24, 480);
const POSTER_HEIGHT = Math.round(POSTER_WIDTH * (297 / 210)); // Exact A4 Portrait ratio (1:1.414)
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Maximize2,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  XCircle,
} from 'lucide-react-native';
import { buildGoogleCalendarUrl } from '@campus-connect/shared';
import { mobileStore } from '../../services/store';
import { GlassBackground } from '../../components/GlassBackground';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState(mobileStore.events.find((e) => e.id === id));
  const isThisUserReg = (r: any) =>
    r.event_id === id &&
    r.status === 'confirmed' &&
    (r.user_id === mobileStore.currentUser.id ||
      r.user_id === mobileStore.currentUser.registration_number ||
      r.user?.id === mobileStore.currentUser.id ||
      r.user?.registration_number === mobileStore.currentUser.registration_number);

  const [registration, setRegistration] = useState(
    mobileStore.registrations.find(isThisUserReg)
  );
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const syncState = () => {
      setEvent(mobileStore.events.find((e) => e.id === id));
      setRegistration(mobileStore.registrations.find(isThisUserReg));
    };

    syncState();
    const unsub = mobileStore.subscribe(syncState);
    return () => {
      unsub();
    };
  }, [id]);

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isRegistered = !!registration;
  const isFull = event.current_registrations >= event.max_participants;
  const deadlinePassed = new Date() > new Date(event.registration_deadline);

  const handleRegister = () => {
    setIsSubmitting(true);
    const result = mobileStore.registerForEvent(event.id);
    setIsSubmitting(false);

    if (result.success && result.registration) {
      setRegistration(result.registration);
      Alert.alert(
        'Registration Confirmed! 🎉',
        `Your seat has been reserved at ${event.venue}.\n\nPass Code: ${result.registration.qr_pass_code}\n\nYour official entry QR pass is now active and saved permanently to your Calendar schedule.`,
        [
          {
            text: 'View Pass Now',
            onPress: () => setShowQrModal(true),
          },
          {
            text: 'Go to Schedule',
            onPress: () => router.push('/calendar'),
          },
          { text: 'Great!', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.error || 'Unable to register at this time.');
    }
  };

  const handleCancelRegistration = () => {
    Alert.alert(
      'Cancel Registration',
      'Are you sure you want to cancel your confirmed seat? This ticket will be released immediately to other students.',
      [
        { text: 'Keep Reservation', style: 'cancel' },
        {
          text: 'Release My Seat',
          style: 'destructive',
          onPress: () => {
            const res = mobileStore.cancelRegistration(event.id);
            if (res.success) {
              setRegistration(undefined);
              Alert.alert('Registration Cancelled', 'Your seat has been successfully released.');
            }
          },
        },
      ]
    );
  };

  const capacityPct = Math.min(100, Math.round((event.current_registrations / event.max_participants) * 100));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <GlassBackground />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Poster with Frosted Overlay (Partially Visible, Tap to View Full Poster) */}
        <View style={styles.posterContainer}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={0.9}
            onPress={() => setShowPosterModal(true)}
          >
            <Image
              source={{ uri: event.poster_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800' }}
              style={styles.poster}
            />
            <View style={styles.posterGradient} />

            {/* Tap for Full Poster Hint */}
            <View style={styles.tapToViewPill}>
              <Maximize2 color="#F8FAFC" size={12} />
              <Text style={styles.tapToViewText}>Tap for full poster</Text>
            </View>
          </TouchableOpacity>

          {/* Navigation Pill */}
          <TouchableOpacity style={styles.floatingBack} onPress={() => router.back()} activeOpacity={0.8}>
            <ArrowLeft color="#F8FAFC" size={20} />
          </TouchableOpacity>

          {/* Category Pill */}
          <View style={styles.categoryBadge}>
            <Sparkles color="#38BDF8" size={12} />
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Status Badge */}
          {isRegistered && (
            <View style={styles.confirmedBanner}>
              <View style={styles.confirmedLeft}>
                <CheckCircle2 color="#10B981" size={18} />
                <View>
                  <Text style={styles.confirmedTitle}>You Are Registered!</Text>
                  <Text style={styles.confirmedSub}>Seat guaranteed • Pass {registration?.qr_pass_code}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.viewPassPill}
                onPress={() => setShowQrModal(true)}
                activeOpacity={0.8}
              >
                <QrCode color="#10B981" size={14} />
                <Text style={styles.viewPassText}>QR Pass</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Title & Organizer */}
          <Text style={styles.title}>{event.title}</Text>

          {event.club && (
            <View style={styles.organizerRow}>
              <View style={styles.clubDot} />
              <Text style={styles.organizerText}>Organized by {event.club.name}</Text>
            </View>
          )}

          {/* Glass Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.glassInfoCard}>
              <Calendar color="#38BDF8" size={20} />
              <View>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(event.start_date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.glassInfoCard}>
              <Clock color="#38BDF8" size={20} />
              <View>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </View>

          {/* Venue Card */}
          <View style={styles.glassVenueCard}>
            <MapPin color="#F59E0B" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.venueValue}>{event.venue}</Text>
            </View>
          </View>

          {/* Capacity Meter Glass Card */}
          <View style={styles.glassMeterCard}>
            <View style={styles.meterHeader}>
              <View style={styles.meterTitleRow}>
                <Users color="#38BDF8" size={16} />
                <Text style={styles.meterTitle}>Registration Capacity</Text>
              </View>
              <Text style={styles.meterNumbers}>
                <Text style={{ color: '#38BDF8', fontWeight: '800' }}>{event.current_registrations}</Text> / {event.max_participants} seats
              </Text>
            </View>

            <View style={styles.meterTrack}>
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${capacityPct}%`,
                    backgroundColor: capacityPct > 85 ? '#F59E0B' : '#38BDF8',
                  },
                ]}
              />
            </View>

            <View style={styles.meterFooter}>
              <Text style={styles.meterSub}>
                {isFull ? '🔴 Capacity Full' : `🟢 ${event.max_participants - event.current_registrations} seats remaining`}
              </Text>
              <Text style={styles.meterSub}>
                Closes {new Date(event.registration_deadline).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* About This Event Glass Card (Inside box matching Registration Capacity) */}
          <View style={styles.glassAboutCard}>
            <View style={styles.aboutHeader}>
              <View style={styles.aboutTitleRow}>
                <Info color="#38BDF8" size={16} />
                <Text style={styles.aboutTitle}>About This Event</Text>
              </View>
            </View>
            <Text style={styles.aboutDescription}>{event.description}</Text>
          </View>

          {/* Contact Information */}
          {event.contact_info && (
            <View style={styles.contactGlass}>
              <Text style={styles.contactTitle}>Official Coordinator Contact</Text>
              <Text style={styles.contactName}>{event.contact_info.name}</Text>
              <Text style={styles.contactSub}>
                {event.contact_info.email} • {event.contact_info.phone}
              </Text>
            </View>
          )}

          {/* Bottom spacer for action bar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Glass Bottom Action Bar */}
      <View style={styles.glassActionBar}>
        {isRegistered ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.openPassBtn}
              onPress={() => setShowQrModal(true)}
              activeOpacity={0.85}
            >
              <QrCode color="#070B14" size={18} />
              <Text style={styles.openPassText}>View My Entry Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancelRegistration}
              activeOpacity={0.7}
            >
              <XCircle color="#EF4444" size={18} />
            </TouchableOpacity>
          </View>
        ) : isFull ? (
          <View style={styles.disabledBtn}>
            <Text style={styles.disabledText}>Capacity Reached • Event Full</Text>
          </View>
        ) : deadlinePassed ? (
          <View style={styles.disabledBtn}>
            <Text style={styles.disabledText}>Registration Deadline Passed</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Sparkles color="#070B14" size={18} />
            <Text style={styles.registerBtnText}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Entry Pass Modal */}
      <Modal visible={showQrModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Official Entry Pass</Text>
                <Text style={styles.modalSub}>SRMIST Ramapuram Campus Events</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowQrModal(false)}
              >
                <X color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.qrVisualContainer}>
              <View style={styles.qrInner}>
                <QrCode color="#0F172A" size={180} />
              </View>
              <View style={styles.codePill}>
                <Text style={styles.codeText}>{registration?.qr_pass_code}</Text>
              </View>
            </View>

            <View style={styles.passDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Attendee</Text>
                <Text style={styles.detailValue}>{mobileStore.currentUser.full_name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Register No</Text>
                <Text style={styles.detailValue}>{mobileStore.currentUser.registration_number}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Event</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{event.title}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck color="#10B981" size={12} />
                  <Text style={styles.verifiedText}>Active Ticket</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full-screen A4 Poster Modal (100% visible on tap) */}
      <Modal
        visible={showPosterModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPosterModal(false)}
      >
        <SafeAreaView style={styles.fullPosterSafeArea} edges={['top', 'bottom']}>
          <View style={styles.fullPosterModalBackdrop}>
            {/* Header with Title and Close Button */}
            <View style={styles.fullPosterHeader}>
              <View style={styles.fullPosterTitleContainer}>
                <Text style={styles.fullPosterTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={styles.fullPosterSubtitle}>Official A4 Event Poster (210 × 297 mm)</Text>
              </View>
              <TouchableOpacity
                style={styles.fullPosterCloseBtn}
                onPress={() => setShowPosterModal(false)}
                activeOpacity={0.8}
              >
                <X color="#F8FAFC" size={20} />
              </TouchableOpacity>
            </View>

            {/* Fully visible A4 portrait poster in Fit Mode (Not contain, not fill) */}
            <ScrollView
              style={styles.fullPosterScrollView}
              contentContainerStyle={styles.fullPosterScrollContent}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              <View style={styles.fullPosterFrame}>
                <Image
                  source={{
                    uri: event.poster_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
                  }}
                  style={styles.fullPosterFitImage}
                />
              </View>
            </ScrollView>

            {/* Bottom Dismiss Button */}
            <TouchableOpacity
              style={styles.fullPosterDismissBtn}
              onPress={() => setShowPosterModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.fullPosterDismissText}>Close Poster</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  posterContainer: {
    position: 'relative',
    height: 260,
    width: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(7, 11, 20, 0.95)',
  },
  floatingBack: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  confirmedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  confirmedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  confirmedTitle: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  confirmedSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  viewPassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewPassText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 18,
  },
  clubDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  organizerText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  glassInfoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderTopWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  glassVenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderTopWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  venueValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  glassMeterCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderTopColor: 'rgba(56, 189, 248, 0.5)',
    borderTopWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  meterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meterTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  meterNumbers: {
    color: '#94A3B8',
    fontSize: 12,
  },
  meterTrack: {
    height: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 4,
  },
  meterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meterSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  glassAboutCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderTopColor: 'rgba(56, 189, 248, 0.5)',
    borderTopWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  aboutHeader: {
    marginBottom: 10,
  },
  aboutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aboutTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  aboutDescription: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 22,
  },
  contactGlass: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1.5,
    borderRadius: 16,
    padding: 14,
  },
  contactTitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  contactSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  glassActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  openPassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  openPassText: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  registerBtnText: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 14,
    paddingVertical: 14,
  },
  disabledText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#38BDF8',
  },
  backBtnText: {
    color: '#070B14',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalGlassCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  modalSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  qrVisualContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  qrInner: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  codePill: {
    marginTop: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  codeText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    fontWeight: '800',
  },
  passDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  detailValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: '65%',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  modalDoneBtn: {
    marginTop: 18,
    backgroundColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '700',
  },
  tapToViewPill: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  tapToViewText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  fullPosterSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.96)',
  },
  fullPosterModalBackdrop: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fullPosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  fullPosterTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  fullPosterTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  fullPosterSubtitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fullPosterCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  fullPosterScrollView: {
    flex: 1,
    width: '100%',
  },
  fullPosterScrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    minHeight: '100%',
  },
  fullPosterFrame: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  fullPosterFitImage: {
    width: '100%',
    height: '100%',
  },
  fullPosterDismissBtn: {
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  fullPosterDismissText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
});
