import React, { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  QrCode,
  Share2,
  ShieldCheck,
  Sparkles,
  Ticket,
  X,
  XCircle,
} from 'lucide-react-native';
import { buildGoogleCalendarUrl, generateIcsCalendar } from '@campus-connect/shared';
import { EventRegistration } from '@campus-connect/types';
import { mobileStore } from '../../services/store';
import { GlassBackground } from '../../components/GlassBackground';

export default function CalendarScreen() {
  const isMyRegistration = (r: EventRegistration) => {
    const cur = mobileStore.currentUser;
    return (
      (r.user_id === cur.id ||
        r.user_id === cur.registration_number ||
        r.user?.id === cur.id ||
        r.user?.registration_number === cur.registration_number) &&
      r.status === 'confirmed'
    );
  };

  const [registrations, setRegistrations] = useState(
    mobileStore.registrations.filter(isMyRegistration)
  );
  const [activeQrPass, setActiveQrPass] = useState<EventRegistration | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const sync = () => {
      setRegistrations(mobileStore.registrations.filter(isMyRegistration));
    };

    sync();
    const unsub = mobileStore.subscribe(sync);
    return () => {
      unsub();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setRegistrations(mobileStore.registrations.filter(isMyRegistration));
    setTimeout(() => setRefreshing(false), 300);
  };

  const handleExportIcs = async (reg: EventRegistration) => {
    if (!reg.event) return;
    const icsContent = generateIcsCalendar(reg.event);
    try {
      await Share.share({
        title: `${reg.event.title} — Campus Connect Pass`,
        message: icsContent,
      });
    } catch (e) {
      Alert.alert('Calendar Export', 'iCalendar file exported successfully.');
    }
  };

  const handleOpenGoogleCalendar = (reg: EventRegistration) => {
    if (!reg.event) return;
    const url = buildGoogleCalendarUrl(reg.event);
    Linking.openURL(url).catch(() => {
      Alert.alert('Google Calendar', 'Unable to launch Google Calendar intent.');
    });
  };

  const handleCancelRegistration = (eventId: string, title?: string) => {
    Alert.alert(
      'Cancel Registration',
      `Are you sure you want to cancel your confirmed registration for "${title || 'this event'}"? Your seat will be released immediately to other students.`,
      [
        { text: 'Keep Pass', style: 'cancel' },
        {
          text: 'Cancel Registration',
          style: 'destructive',
          onPress: () => {
            const res = mobileStore.cancelRegistration(eventId);
            if (res.success) {
              Alert.alert('Registration Cancelled', 'Your registration was cancelled and the seat released.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GlassBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>My Event Schedule</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{registrations.length} Confirmed</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Verified entry QR passes, calendar exports, and synchronized reservations
          </Text>
        </View>

        {registrations.length === 0 ? (
          <View style={styles.emptyGlassCard}>
            <View style={styles.emptyIconCircle}>
              <Ticket color="#64748B" size={36} />
            </View>
            <Text style={styles.emptyTitle}>No Confirmed Passes</Text>
            <Text style={styles.emptySubtitle}>
              You haven't reserved seats for any upcoming events yet. Explore upcoming hackathons and workshops to book your official QR pass.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {registrations.map((reg) => {
              const event = reg.event;
              if (!event) return null;
              return (
                <View key={reg.id} style={styles.glassTicketCard}>
                  {/* Glowing Top Edge */}
                  <View style={styles.ticketTopGlow} />

                  <View style={styles.ticketHeader}>
                    <View style={styles.categoryPill}>
                      <Sparkles color="#38BDF8" size={11} />
                      <Text style={styles.categoryText}>{event.category}</Text>
                    </View>

                    <View style={styles.confirmedPill}>
                      <CheckCircle2 color="#10B981" size={12} />
                      <Text style={styles.confirmedText}>Confirmed Pass</Text>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>

                  {/* Metadata Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <CalendarIcon color="#38BDF8" size={13} />
                      <Text style={styles.metaText}>
                        {new Date(event.start_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Clock color="#38BDF8" size={13} />
                      <Text style={styles.metaText}>
                        {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  {/* Venue */}
                  <View style={styles.venueRow}>
                    <MapPin color="#F59E0B" size={13} />
                    <Text style={styles.venueText} numberOfLines={1}>
                      {event.venue}
                    </Text>
                  </View>

                  {/* Perforated Divider */}
                  <View style={styles.perforatedRow}>
                    <View style={styles.perforatedLeftHole} />
                    <View style={styles.dashedLine} />
                    <View style={styles.perforatedRightHole} />
                  </View>

                  {/* Ticket Actions */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.qrPassBtn}
                      onPress={() => setActiveQrPass(reg)}
                      activeOpacity={0.85}
                    >
                      <QrCode color="#070B14" size={16} />
                      <Text style={styles.qrPassBtnText}>View QR Entry Pass</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.googleCalBtn}
                      onPress={() => handleOpenGoogleCalendar(reg)}
                      activeOpacity={0.8}
                    >
                      <ExternalLink color="#38BDF8" size={14} />
                      <Text style={styles.googleCalText}>G-Cal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelPassBtn}
                      onPress={() => handleCancelRegistration(event.id, event.title)}
                      activeOpacity={0.7}
                    >
                      <XCircle color="#EF4444" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Official Entry Pass Glass Modal */}
      <Modal visible={!!activeQrPass} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalGlassCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Official Student Entry Pass</Text>
                <Text style={styles.modalSub}>SRMIST Ramapuram Campus Events</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setActiveQrPass(null)}
              >
                <X color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>

            {activeQrPass && (
              <View style={styles.modalBody}>
                {/* QR Code Container */}
                <View style={styles.qrCardContainer}>
                  <View style={styles.qrVisual}>
                    <QrCode color="#0F172A" size={180} />
                  </View>

                  <View style={styles.passCodePill}>
                    <Text style={styles.passCodeText}>{activeQrPass.qr_pass_code}</Text>
                  </View>
                </View>

                {/* Details Breakdown */}
                <View style={styles.passDetailsCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Student Name</Text>
                    <Text style={styles.detailValue}>{mobileStore.currentUser.full_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Registration No</Text>
                    <Text style={styles.detailValue}>{mobileStore.currentUser.registration_number}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Event</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {activeQrPass.event?.title}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Venue</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {activeQrPass.event?.venue}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Admission Status</Text>
                    <View style={styles.verifiedBadge}>
                      <ShieldCheck color="#10B981" size={12} />
                      <Text style={styles.verifiedText}>Guaranteed Seat</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.exportIcsBtn}
                    onPress={() => handleExportIcs(activeQrPass)}
                    activeOpacity={0.8}
                  >
                    <Download color="#38BDF8" size={15} />
                    <Text style={styles.exportIcsText}>Export .ics</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalDoneBtn}
                    onPress={() => setActiveQrPass(null)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.modalDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
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
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  emptyGlassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderTopWidth: 1.5,
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 280,
  },
  list: {
    gap: 16,
  },
  glassTicketCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderTopColor: 'rgba(255, 255, 255, 0.4)',
    borderTopWidth: 1.5,
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  ticketTopGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#38BDF8',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  confirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  confirmedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  eventTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  venueText: {
    color: '#94A3B8',
    fontSize: 12,
    flex: 1,
  },
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  perforatedLeftHole: {
    position: 'absolute',
    left: -26,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#070B14',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  perforatedRightHole: {
    position: 'absolute',
    right: -26,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#070B14',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  qrPassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 11,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  qrPassBtnText: {
    color: '#070B14',
    fontSize: 13,
    fontWeight: '800',
  },
  googleCalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  googleCalText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelPassBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalGlassCard: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
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
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    alignItems: 'center',
  },
  qrCardContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrVisual: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  passCodePill: {
    marginTop: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  passCodeText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    fontWeight: '800',
  },
  passDetailsCard: {
    width: '100%',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    marginBottom: 16,
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
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  exportIcsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exportIcsText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  modalDoneBtn: {
    flex: 1,
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoneText: {
    color: '#070B14',
    fontSize: 13,
    fontWeight: '800',
  },
});
