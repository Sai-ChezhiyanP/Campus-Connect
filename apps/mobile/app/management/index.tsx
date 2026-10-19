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
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Megaphone,
  Plus,
  Shield,
  Users2,
  XCircle,
} from 'lucide-react-native';
import { EVENT_CATEGORIES } from '@campus-connect/shared';
import { mobileStore } from '../../services/store';

export default function MobileManagementHub() {
  const [currentUser] = useState(mobileStore.currentUser);
  const [events, setEvents] = useState(mobileStore.events);
  const [createEventModal, setCreateEventModal] = useState(false);
  const [createBulletinModal, setCreateBulletinModal] = useState(false);

  // Quick Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState<string>(EVENT_CATEGORIES[0]);
  const [eventVenue, setEventVenue] = useState('');
  const [eventCapacity, setEventCapacity] = useState('100');

  // Quick Bulletin form state
  const [bulletinTitle, setBulletinTitle] = useState('');
  const [bulletinContent, setBulletinContent] = useState('');
  const [bulletinPriority, setBulletinPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const pendingEvents = events.filter((e) => e.status === 'pending_approval');
  const isAdmin = currentUser.roles?.includes('admin');
  const isFaculty = currentUser.roles?.includes('faculty');
  const isCoordinator = currentUser.roles?.includes('coordinator');

  const handleApproveEvent = (id: string) => {
    mobileStore.updateEventStatus(id, 'published');
    setEvents([...mobileStore.events]);
    Alert.alert('Approved', 'Event is now published across Campus Connect.');
  };

  const handleRejectEvent = (id: string) => {
    mobileStore.updateEventStatus(id, 'rejected');
    setEvents([...mobileStore.events]);
    Alert.alert('Rejected', 'Event has been marked as rejected.');
  };

  const handleCreateEvent = () => {
    if (!eventTitle.trim() || !eventVenue.trim()) {
      Alert.alert('Validation Error', 'Title and Venue are required.');
      return;
    }

    mobileStore.createEvent({
      title: eventTitle,
      description: 'Submitted via Mobile Campus Management Portal.',
      category: eventCategory,
      organizing_type: 'club',
      club_id: mobileStore.clubs[0]?.id || null,
      department_id: null,
      venue: eventVenue,
      start_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      end_date: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
      registration_deadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      max_participants: parseInt(eventCapacity, 10) || 100,
      contact_info: {
        name: currentUser.full_name,
        phone: currentUser.mobile_number,
        email: currentUser.college_email,
      },
      status: isAdmin ? 'published' : 'pending_approval',
      created_by: currentUser.id,
    });

    setEvents([...mobileStore.events]);
    setCreateEventModal(false);
    setEventTitle('');
    setEventVenue('');
    Alert.alert('Success', isAdmin ? 'Event published!' : 'Event submitted for Admin Approval.');
  };

  const handleBroadcastBulletin = () => {
    if (!bulletinTitle.trim() || !bulletinContent.trim()) {
      Alert.alert('Validation Error', 'Title and content are required.');
      return;
    }

    mobileStore.announcements.unshift({
      id: 'a-' + Math.random().toString(36).substring(2, 9),
      title: bulletinTitle,
      content: bulletinContent,
      category: 'Academic',
      priority: bulletinPriority,
      is_mandatory: bulletinPriority === 'urgent',
      target_scope: 'campus',
      author_id: currentUser.id,
      created_at: new Date().toISOString(),
      author_profile: currentUser,
    });

    mobileStore.notify();
    setCreateBulletinModal(false);
    setBulletinTitle('');
    setBulletinContent('');
    Alert.alert('Broadcast Complete', 'Faculty Bulletin published to campus students.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <Shield color="#F59E0B" size={24} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Authorized Management Hub</Text>
            <Text style={styles.bannerSubtitle}>
              Logged in as {currentUser.full_name} ({currentUser.roles?.join(', ')})
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          {(isCoordinator || isAdmin) && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setCreateEventModal(true)}
              activeOpacity={0.8}
            >
              <Calendar color="#38BDF8" size={22} />
              <Text style={styles.actionCardTitle}>Submit Club Event</Text>
              <Text style={styles.actionCardSub}>Create new campus event</Text>
            </TouchableOpacity>
          )}

          {(isFaculty || isAdmin) && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => setCreateBulletinModal(true)}
              activeOpacity={0.8}
            >
              <Megaphone color="#F43F5E" size={22} />
              <Text style={styles.actionCardTitle}>Faculty Bulletin</Text>
              <Text style={styles.actionCardSub}>Broadcast academic notice</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Admin Event Approval Queue */}
        {isAdmin && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock color="#F59E0B" size={18} />
              <Text style={styles.sectionTitle}>
                Admin Approval Queue ({pendingEvents.length})
              </Text>
            </View>

            {pendingEvents.length === 0 ? (
              <View style={styles.emptyBox}>
                <CheckCircle2 color="#10B981" size={28} />
                <Text style={styles.emptyText}>No pending event approvals.</Text>
              </View>
            ) : (
              pendingEvents.map((event) => (
                <View key={event.id} style={styles.approvalCard}>
                  <Text style={styles.approvalCategory}>{event.category}</Text>
                  <Text style={styles.approvalTitle}>{event.title}</Text>
                  <Text style={styles.approvalVenue}>Venue: {event.venue}</Text>
                  <Text style={styles.approvalCapacity}>Capacity: {event.max_participants} seats</Text>

                  <View style={styles.approvalActionRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleRejectEvent(event.id)}
                    >
                      <XCircle color="#F43F5E" size={14} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApproveEvent(event.id)}
                    >
                      <CheckCircle2 color="#FFFFFF" size={14} />
                      <Text style={styles.approveBtnText}>Approve & Publish</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Create Event Modal */}
      <Modal visible={createEventModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quick Event Creation</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Event Title *"
              placeholderTextColor="#64748B"
              value={eventTitle}
              onChangeText={setEventTitle}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Venue (e.g. Auditorium Block 3) *"
              placeholderTextColor="#64748B"
              value={eventVenue}
              onChangeText={setEventVenue}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Max Capacity (e.g. 120)"
              placeholderTextColor="#64748B"
              keyboardType="number-pad"
              value={eventCapacity}
              onChangeText={setEventCapacity}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setCreateEventModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleCreateEvent}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Bulletin Modal */}
      <Modal visible={createBulletinModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Broadcast Faculty Bulletin</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Headline / Subject *"
              placeholderTextColor="#64748B"
              value={bulletinTitle}
              onChangeText={setBulletinTitle}
            />

            <TextInput
              style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Notice directive and instructions *"
              placeholderTextColor="#64748B"
              multiline
              value={bulletinContent}
              onChangeText={setBulletinContent}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setCreateBulletinModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmit}
                onPress={handleBroadcastBulletin}
              >
                <Text style={styles.modalSubmitText}>Broadcast</Text>
              </TouchableOpacity>
            </View>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  bannerTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  actionCardTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
  },
  actionCardSub: {
    color: '#64748B',
    fontSize: 10,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyBox: {
    padding: 24,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  approvalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  approvalCategory: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  approvalTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  approvalVenue: {
    color: '#94A3B8',
    fontSize: 11,
  },
  approvalCapacity: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  approvalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F43F5E15',
  },
  rejectBtnText: {
    color: '#F43F5E',
    fontSize: 11,
    fontWeight: 'bold',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalCancelText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmit: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalSubmitText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
