import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Filter,
  GraduationCap,
  MapPin,
  Megaphone,
  Shield,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { EVENT_CATEGORIES } from '@campus-connect/shared';
import { mobileStore } from '../../services/store';
import { GlassBackground } from '../../components/GlassBackground';

export default function HomeScreen() {
  const [currentUser, setCurrentUser] = useState(mobileStore.currentUser);
  const [events, setEvents] = useState(mobileStore.getRankedEvents());
  const [refreshing, setRefreshing] = useState(false);
  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);

  // Quick category filter (null means show all according to custom preferences)
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Preference modal draft state
  const [selectedCats, setSelectedCats] = useState<string[]>(mobileStore.feedPreference.selected_categories || []);
  const [mutedCats, setMutedCats] = useState<string[]>(mobileStore.feedPreference.muted_categories || []);

  useEffect(() => {
    const sync = () => {
      setCurrentUser(mobileStore.currentUser);
      setEvents(mobileStore.getRankedEvents());
      setSelectedCats(mobileStore.feedPreference.selected_categories || []);
      setMutedCats(mobileStore.feedPreference.muted_categories || []);
    };

    sync();
    const unsubscribe = mobileStore.subscribe(sync);
    return () => {
      unsubscribe();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await mobileStore.syncFromServer();
    } catch (e) {}
    setEvents(mobileStore.getRankedEvents());
    setRefreshing(false);
  };

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter((c) => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
      // If it was muted, unmute it
      setMutedCats(mutedCats.filter((c) => c !== cat));
    }
  };

  const toggleMuteCategory = (cat: string) => {
    if (mutedCats.includes(cat)) {
      setMutedCats(mutedCats.filter((c) => c !== cat));
    } else {
      setMutedCats([...mutedCats, cat]);
      // If it was selected, unselect it
      setSelectedCats(selectedCats.filter((c) => c !== cat));
    }
  };

  const savePreferences = () => {
    mobileStore.updateFeedPreferences(selectedCats, mutedCats);
    setCustomizeModalVisible(false);
  };

  const hasManagementRole = currentUser.roles?.some((r) => r === 'admin' || r === 'faculty' || r === 'coordinator');
  const displayedEvents = activeCategory ? events.filter((e) => e.category === activeCategory) : events;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Dynamic Multi-Cluster Glass Glow Background */}
      <GlassBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        {/* Glass Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.glassAvatarContainer}>
              <GraduationCap color="#38BDF8" size={22} />
            </View>
            <View>
              <View style={styles.campusBadgeRow}>
                <Text style={styles.greetingText}>SRMIST Ramapuram</Text>
                <View style={styles.pulseDot} />
              </View>
              <Text style={styles.userNameText}>{currentUser.full_name}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.glassFilterBtn}
            onPress={() => setCustomizeModalVisible(true)}
            activeOpacity={0.8}
          >
            <Sliders color="#38BDF8" size={18} />
          </TouchableOpacity>
        </View>

        {/* Management Access Card for privileged roles */}
        {hasManagementRole && (
          <TouchableOpacity
            style={styles.managementGlassCard}
            onPress={() => router.push('/management')}
            activeOpacity={0.85}
          >
            <View style={styles.managementLeft}>
              <View style={styles.mgmtIconCircle}>
                <Shield color="#F59E0B" size={18} />
              </View>
              <View>
                <Text style={styles.managementTitle}>Campus Management Portal</Text>
                <Text style={styles.managementSub}>
                  Role: {currentUser.roles?.join(', ').toUpperCase()} • Create events & bulletins
                </Text>
              </View>
            </View>
            <ChevronRight color="#F59E0B" size={18} />
          </TouchableOpacity>
        )}

        {/* Custom Feed Filter Bar */}
        <View style={styles.customFilterContainer}>
          <View style={styles.customFilterHeader}>
            <View style={styles.filterTitleRow}>
              <Filter color="#38BDF8" size={14} />
              <Text style={styles.filterTitleText}>Custom Feed</Text>
              {(selectedCats.length > 0 || mutedCats.length > 0) && (
                <View style={styles.filterActiveBadge}>
                  <Text style={styles.filterActiveBadgeText}>
                    {selectedCats.length > 0 ? `${selectedCats.length} active` : 'All'}
                    {mutedCats.length > 0 ? ` • ${mutedCats.length} muted` : ''}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.tuneFiltersBtn}
              onPress={() => setCustomizeModalVisible(true)}
              activeOpacity={0.8}
            >
              <Sliders color="#38BDF8" size={12} />
              <Text style={styles.tuneFiltersText}>Tune Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Category Pill Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                activeCategory === null && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(null)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === null && styles.categoryChipTextActive,
                ]}
              >
                All Events
              </Text>
            </TouchableOpacity>

            {EVENT_CATEGORIES.map((cat) => {
              const isMuted = mutedCats.includes(cat);
              if (isMuted) return null;
              const isSelected = activeCategory === cat;

              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                  onPress={() => {
                    setActiveCategory(isSelected ? null : cat);
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Events Feed Section */}
        <View style={styles.eventsSection}>
          <View style={styles.sectionHeader}>
            <Calendar color="#38BDF8" size={16} />
            <Text style={styles.sectionTitle}>Upcoming Opportunities</Text>
          </View>

          {displayedEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Sparkles color="#38BDF8" size={32} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeCategory ? `No ${activeCategory} Events` : 'No Events Scheduled'}
              </Text>
              <Text style={styles.emptySub}>
                {activeCategory
                  ? `There are currently no events under "${activeCategory}". Select "All Events" or check back later.`
                  : 'There are currently no active campus events. When new hackathons, workshops, and symposiums are published, they will appear here.'}
              </Text>
            </View>
          ) : (
            displayedEvents.map((event) => {
              const isRegistered = mobileStore.registrations.some(
                (r) =>
                  r.event_id === event.id &&
                  (r.user_id === currentUser.id ||
                    r.user_id === currentUser.registration_number ||
                    r.user?.id === currentUser.id) &&
                  r.status === 'confirmed'
              );
              const capacityPct = Math.min(
                100,
                Math.round((event.current_registrations / event.max_participants) * 100)
              );

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.glassEventCard}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/events/${event.id}`)}
                >
                  <View style={styles.glassSheen} />
                  <View style={styles.cardImageContainer}>
                    <Image
                      source={{
                        uri: event.poster_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
                      }}
                      style={styles.cardImage}
                    />
                    <View style={styles.imageOverlay} />

                    {/* Category Floating Tag */}
                    <View style={styles.floatingCategoryTag}>
                      <Text style={styles.floatingCategoryText}>{event.category}</Text>
                    </View>

                    {/* Registration Status Tag */}
                    {isRegistered && (
                      <View style={styles.registeredFloatPill}>
                        <Check color="#10B981" size={12} />
                        <Text style={styles.registeredFloatText}>Registered</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.eventBody}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>

                    {/* Capacity Progress Bar */}
                    <View style={styles.capacityBarContainer}>
                      <View style={styles.capacityHeader}>
                        <View style={styles.capacityLeft}>
                          <Users color="#64748B" size={12} />
                          <Text style={styles.capacityLabel}>
                            {event.current_registrations} / {event.max_participants} Seats Taken
                          </Text>
                        </View>
                        <Text style={styles.capacityPctText}>{capacityPct}%</Text>
                      </View>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.fill,
                            {
                              width: `${capacityPct}%`,
                              backgroundColor: capacityPct > 85 ? '#F59E0B' : '#38BDF8',
                            },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Bottom Metadata */}
                    <View style={styles.cardFooter}>
                      <View style={styles.footerItem}>
                        <MapPin color="#F59E0B" size={12} />
                        <Text style={styles.footerText} numberOfLines={1}>
                          {event.venue}
                        </Text>
                      </View>

                      <View style={styles.viewDetailsPill}>
                        <Text style={styles.viewDetailsText}>View Pass</Text>
                        <ArrowRight color="#38BDF8" size={12} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Feed Customization Modal */}
      <Modal visible={customizeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Custom Feed Filters</Text>
                <Text style={styles.modalSubtitle}>Select event categories you want to see and mute ones you don't</Text>
              </View>
              <TouchableOpacity onPress={() => setCustomizeModalVisible(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionLabel}>Preferred Event Types</Text>
              <View style={styles.chipGrid}>
                {EVENT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCats.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => toggleCategory(cat)}
                      activeOpacity={0.8}
                    >
                      {isSelected && <Check color="#070B14" size={13} style={{ marginRight: 4 }} />}
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.modalSectionLabel, { marginTop: 22 }]}>Muted Categories</Text>
              <View style={styles.chipGrid}>
                {EVENT_CATEGORIES.map((cat) => {
                  const isMuted = mutedCats.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isMuted && styles.chipMuted]}
                      onPress={() => toggleMuteCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isMuted && styles.chipTextMuted]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.modalNoticeBox}>
                <AlertTriangle color="#F59E0B" size={16} />
                <Text style={styles.modalNoticeText}>
                  Academic notices, semester examinations, and verified university broadcasts are never suppressed.
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.savePrefsButton} onPress={savePreferences} activeOpacity={0.85}>
              <Text style={styles.savePrefsButtonText}>Save & Apply Filters</Text>
            </TouchableOpacity>
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
  glowTop: {
    position: 'absolute',
    top: -50,
    left: '15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    filter: 'blur(70px)',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glassAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  campusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  userNameText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  glassFilterBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  managementGlassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  managementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  mgmtIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  managementTitle: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '800',
  },
  managementSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 1,
  },
  customFilterContainer: {
    marginBottom: 20,
  },
  customFilterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  filterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  filterTitleText: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '800',
  },
  filterActiveBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  filterActiveBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  tuneFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  tuneFiltersText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  categoryChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#070B14',
    fontWeight: '800',
  },
  bulletinSection: {
    marginBottom: 22,
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
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  glassBulletinCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  glassBulletinUrgent: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.35)',
    borderTopColor: 'rgba(255, 255, 255, 0.45)',
  },
  bulletinTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletinCatPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bulletinCatText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  mandatoryPill: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F43F5E',
  },
  mandatoryText: {
    color: '#F43F5E',
    fontSize: 9,
    fontWeight: '800',
  },
  bulletinTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  bulletinContent: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  bulletinDate: {
    color: '#64748B',
    fontSize: 10,
  },
  eventsSection: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 36,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  glassEventCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  glassSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    zIndex: 10,
  },
  cardImageContainer: {
    position: 'relative',
    height: 150,
    width: '100%',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(7, 11, 20, 0.85)',
  },
  floatingCategoryTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(7, 11, 20, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  floatingCategoryText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  registeredFloatPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  registeredFloatText: {
    color: '#070B14',
    fontSize: 11,
    fontWeight: '800',
  },
  eventBody: {
    padding: 16,
  },
  eventTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 6,
  },
  eventDescription: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  capacityBarContainer: {
    marginBottom: 12,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  capacityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  capacityLabel: {
    color: '#94A3B8',
    fontSize: 11,
  },
  capacityPctText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 11,
    flex: 1,
  },
  viewDetailsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.3)',
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalSectionLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  chipMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#070B14',
    fontWeight: '800',
  },
  chipTextMuted: {
    color: '#F87171',
    textDecorationLine: 'line-through',
  },
  modalNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 14,
    padding: 12,
    marginTop: 20,
  },
  modalNoticeText: {
    color: '#FBBF24',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  savePrefsButton: {
    backgroundColor: '#38BDF8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  savePrefsButtonText: {
    color: '#070B14',
    fontSize: 14,
    fontWeight: '800',
  },
});
