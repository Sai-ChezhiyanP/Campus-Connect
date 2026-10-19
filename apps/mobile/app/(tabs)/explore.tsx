import React, { useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Check,
  Compass,
  Mail,
  Plus,
  Search,
  Sparkles,
  Users2,
} from 'lucide-react-native';
import { mobileStore } from '../../services/store';
import { GlassBackground } from '../../components/GlassBackground';

export default function ExploreScreen() {
  const [clubs, setClubs] = useState(mobileStore.clubs);
  const [followedIds, setFollowedIds] = useState(mobileStore.followedClubIds);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = mobileStore.subscribe(() => {
      setClubs(mobileStore.clubs);
      setFollowedIds(new Set(mobileStore.followedClubIds));
    });
    return () => {
      unsub();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setClubs(mobileStore.clubs);
    setFollowedIds(new Set(mobileStore.followedClubIds));
    setTimeout(() => setRefreshing(false), 300);
  };

  const handleToggleFollow = (clubId: string) => {
    mobileStore.toggleFollowClub(clubId);
  };

  const filtered = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <GlassBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clubs & Societies</Text>
          <Text style={styles.headerSubtitle}>
            Follow official SRM communities to boost relevant hackathons and tech talks in your feed
          </Text>
        </View>

        {/* Glass Search Bar */}
        <View style={styles.glassSearchBar}>
          <Search color="#38BDF8" size={18} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search clubs, technical domains, cultural..."
            placeholderTextColor="#64748B"
            style={styles.searchInput}
          />
        </View>

        {/* Clubs List */}
        <View style={styles.clubsList}>
          {filtered.map((club) => {
            const isFollowed = followedIds.has(club.id);
            return (
              <View key={club.id} style={styles.glassClubCard}>
                <Image
                  source={{ uri: club.logo_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300' }}
                  style={styles.clubLogo}
                />

                <View style={styles.clubContent}>
                  <View style={styles.clubTopRow}>
                    <View style={styles.catPill}>
                      <Text style={styles.clubCategory}>{club.category}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.followButton, isFollowed && styles.followButtonActive]}
                      onPress={() => handleToggleFollow(club.id)}
                      activeOpacity={0.8}
                    >
                      {isFollowed ? (
                        <>
                          <Check color="#070B14" size={12} style={{ marginRight: 3 }} />
                          <Text style={styles.followButtonTextActive}>Following</Text>
                        </>
                      ) : (
                        <>
                          <Plus color="#38BDF8" size={12} style={{ marginRight: 3 }} />
                          <Text style={styles.followButtonText}>Follow</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubDesc} numberOfLines={2}>
                    {club.description}
                  </Text>

                  <View style={styles.clubFooter}>
                    <Mail color="#64748B" size={12} />
                    <Text style={styles.clubEmail}>{club.contact_email}</Text>
                  </View>
                </View>
              </View>
            );
          })}
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
    marginBottom: 18,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  glassSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderTopWidth: 1.5,
  },
  searchInput: {
    color: '#F8FAFC',
    fontSize: 13,
    flex: 1,
    padding: 0,
  },
  clubsList: {
    gap: 14,
  },
  glassClubCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderTopColor: 'rgba(255, 255, 255, 0.35)',
    borderTopWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  clubLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clubContent: {
    flex: 1,
  },
  clubTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clubCategory: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  followButtonActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  followButtonText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  followButtonTextActive: {
    color: '#070B14',
    fontSize: 11,
    fontWeight: '800',
  },
  clubName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  clubDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  clubFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubEmail: {
    color: '#64748B',
    fontSize: 11,
  },
});
