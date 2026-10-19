import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Megaphone,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { Announcement } from '@campus-connect/types';
import { mobileStore } from '../../services/store';
import { GlassBackground } from '../../components/GlassBackground';

export default function NotificationsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mobileStore.announcements);
  const [filter, setFilter] = useState<'all' | 'bulletins' | 'coordinator' | 'academic' | 'registration'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => {
      setAnnouncements([...mobileStore.announcements]);
    };
    sync();
    const unsub = mobileStore.subscribe(sync);
    return () => unsub();
  }, []);

  const markAllAsRead = () => {
    const allIds = announcements.map((a) => a.id);
    setReadIds(new Set([...readIds, ...allIds]));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setReadIds(new Set([...readIds, id]));
  };

  const onRefresh = () => {
    setRefreshing(true);
    setAnnouncements([...mobileStore.announcements]);
    setTimeout(() => setRefreshing(false), 300);
  };

  const filteredBulletins = announcements.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'coordinator') {
      return (
        a.category.toLowerCase().includes('club') ||
        a.category.toLowerCase().includes('coordinator') ||
        a.author_profile?.roles?.includes('coordinator')
      );
    }
    if (filter === 'bulletins') {
      return (
        !a.category.toLowerCase().includes('club') &&
        !a.category.toLowerCase().includes('coordinator') &&
        !a.author_profile?.roles?.includes('coordinator')
      );
    }
    if (filter === 'academic') return a.category.toLowerCase().includes('academic') || a.category.toLowerCase().includes('exam');
    if (filter === 'registration') return a.category.toLowerCase().includes('registration') || a.category.toLowerCase().includes('opportunit');
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GlassBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.headerTagRow}>
              <Text style={styles.headerTitle}>Alerts & Bulletins</Text>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>OFFICIAL SRM</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              Institutional bulletins, urgent academic notices, and verified broadcasts
            </Text>
          </View>

          <TouchableOpacity style={styles.markReadBtn} onPress={markAllAsRead} activeOpacity={0.8}>
            <CheckCheck color="#38BDF8" size={14} />
            <Text style={styles.markReadText}>Mark all</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'coordinator', label: 'Club Notices' },
            { id: 'bulletins', label: 'Faculty' },
            { id: 'academic', label: 'Academic' },
            { id: 'registration', label: 'Opportunities' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterPill, filter === item.id && styles.filterPillActive]}
              onPress={() => setFilter(item.id as any)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterPillText, filter === item.id && styles.filterPillTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bulletins List */}
        <View style={styles.list}>
          {filteredBulletins.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Megaphone color="#64748B" size={32} />
              <Text style={styles.emptyTitle}>No bulletins in this view</Text>
              <Text style={styles.emptySub}>Official notices from department heads and administration will appear here.</Text>
            </View>
          ) : (
            filteredBulletins.map((item) => {
              const isExpanded = expandedId === item.id;
              const isRead = readIds.has(item.id);
              const isUrgent = item.priority === 'urgent' || item.is_mandatory;
              const isCoordinatorBulletin =
                item.category.toLowerCase().includes('club') ||
                item.category.toLowerCase().includes('coordinator') ||
                item.author_profile?.roles?.includes('coordinator');

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.glassCard,
                    isCoordinatorBulletin && styles.glassCardCoordinator,
                    isUrgent && styles.glassCardUrgent,
                    !isRead && styles.glassCardUnread,
                  ]}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.glassSheen} />
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.iconCircle,
                        isCoordinatorBulletin && styles.iconCircleCoordinator,
                        isUrgent && styles.iconCircleUrgent,
                      ]}
                    >
                      {isCoordinatorBulletin ? (
                        <Users color="#C084FC" size={16} />
                      ) : isUrgent ? (
                        <AlertTriangle color="#F43F5E" size={16} />
                      ) : (
                        <Megaphone color="#38BDF8" size={16} />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.badgeRow}>
                        {isCoordinatorBulletin ? (
                          <View style={styles.catBadgeCoordinator}>
                            <Text style={styles.catBadgeTextCoordinator}>CLUB COORDINATOR</Text>
                          </View>
                        ) : (
                          <View style={styles.catBadge}>
                            <Text style={styles.catBadgeText}>{item.category.toUpperCase()}</Text>
                          </View>
                        )}
                        {item.is_mandatory && (
                          <View style={styles.mandatoryBadge}>
                            <Text style={styles.mandatoryBadgeText}>MANDATORY</Text>
                          </View>
                        )}
                        {item.priority === 'urgent' && (
                          <View style={styles.urgentBadge}>
                            <Text style={styles.urgentBadgeText}>URGENT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.timestamp}>
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })} • {item.author_profile?.full_name || (isCoordinatorBulletin ? 'Club Coordinator' : 'Campus Administrator')}
                      </Text>
                    </View>

                    {isExpanded ? (
                      <ChevronUp color="#94A3B8" size={18} />
                    ) : (
                      <ChevronDown color="#94A3B8" size={18} />
                    )}
                  </View>

                  <Text
                    style={styles.cardBody}
                    numberOfLines={isExpanded ? undefined : 2}
                  >
                    {item.content}
                  </Text>

                  {isExpanded && (
                    <View style={styles.expandedFooter}>
                      <View style={styles.verifiedIssuer}>
                        <CheckCircle2 color={isCoordinatorBulletin ? '#C084FC' : '#10B981'} size={12} />
                        <Text style={isCoordinatorBulletin ? styles.verifiedIssuerTextCoordinator : styles.verifiedIssuerText}>
                          {isCoordinatorBulletin
                            ? 'Club Coordinator Dispatch • Recognized Student Society'
                            : 'Official Dispatch • Authorized by SRM Administration'}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#38BDF8',
  },
  liveText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
    maxWidth: 260,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  markReadText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    borderTopWidth: 1.5,
  },
  filterPillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  filterPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#070B14',
    fontWeight: '800',
  },
  list: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
  glassCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderTopWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  glassCardUrgent: {
    borderLeftWidth: 3,
    borderLeftColor: '#F43F5E',
  },
  glassCardUnread: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderTopColor: 'rgba(56, 189, 248, 0.5)',
  },
  glassSheen: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleUrgent: {
    borderColor: 'rgba(244, 63, 94, 0.35)',
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  catBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mandatoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  mandatoryBadgeText: {
    color: '#F43F5E',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  urgentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  urgentBadgeText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  timestamp: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
  },
  cardBody: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  expandedFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  verifiedIssuer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedIssuerText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  glassCardCoordinator: {
    borderColor: 'rgba(168, 85, 247, 0.25)',
    borderTopColor: 'rgba(192, 132, 252, 0.5)',
  },
  iconCircleCoordinator: {
    borderColor: 'rgba(168, 85, 247, 0.4)',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  catBadgeCoordinator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  catBadgeTextCoordinator: {
    color: '#C084FC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  verifiedIssuerTextCoordinator: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '700',
  },
});
