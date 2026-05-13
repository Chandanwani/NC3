import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { Heart, MessageCircle, Plus, ChevronLeft, Send, Wifi, WifiOff } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import { subscribeCommunityPosts, addCommunityPost, likeCommunityPost } from '../services/dbService';
import { getCurrentUser } from '../services/auth';
import { isConfigured } from '../services/firebase';

const INITIAL_POSTS = [
    { id: '1', author: 'Rajesh Kumar', region: 'Punjab', text: 'Used AI disease scan — caught early blight on wheat before it spread. Scan weekly during monsoon!', likes: 24 },
    { id: '2', author: 'Priya Devi', region: 'Maharashtra', text: 'Soil module showed low nitrogen. Adding compost this week. Thanks My_Agri AI!', likes: 18 },
    { id: '3', author: "Niraja's Team", region: 'Pune, MH', text: 'Market prices for tomato are up 4.5%! Delaying harvest by 3 days based on AI forecast 🤞', likes: 31 },
    { id: '4', author: 'Vikram Singh', region: 'Haryana', text: 'Supply chain alert saved us from a 3-hour delay. Rerouted via expressway and delivered on time.', likes: 15 },
];

const CommunityScreen = ({ navigation }) => {
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [newPost, setNewPost] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [posting, setPosting] = useState(false);
    const [isLive, setIsLive] = useState(false);

    const user = getCurrentUser();
    const authorName = user?.displayName || "Niraja's Team";

    useEffect(() => {
        // Subscribe to Firebase posts in real-time
        const unsubscribe = subscribeCommunityPosts((livePosts) => {
            if (livePosts && livePosts.length > 0) {
                setPosts(livePosts);
                setIsLive(true);
            } else {
                setPosts(INITIAL_POSTS);
                setIsLive(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const submitPost = async () => {
        if (!newPost.trim()) return;
        setPosting(true);

        const region = user ? 'Pune, MH' : 'Pune, MH';
        const postText = newPost.trim();

        if (isConfigured) {
            // Post to Firebase
            await addCommunityPost(authorName, region, postText);
            // Real-time listener will update the list automatically
        } else {
            // Local-only post in demo mode
            setPosts(prev => [{
                id: Date.now().toString(),
                author: authorName,
                region,
                text: postText,
                likes: 0,
                timestamp: Date.now(),
            }, ...prev]);
        }

        setNewPost('');
        setShowInput(false);
        setPosting(false);
    };

    const handleLike = async (post) => {
        if (isConfigured) {
            await likeCommunityPost(post.id, post.likes);
            // Listener updates the state automatically
        } else {
            // Local optimistic update
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: p.likes + 1 } : p));
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={28} />
                </Pressable>
                <Text style={styles.headerTitle}>Community Lab</Text>
                {isLive
                    ? <Wifi color={theme.colors.primary} size={18} />
                    : <WifiOff color={theme.colors.textMuted} size={18} />
                }
            </View>

            {/* Live badge */}
            <View style={[styles.liveBadge, { backgroundColor: isLive ? `${theme.colors.primary}12` : 'rgba(255,255,255,0.04)' }]}>
                <View style={[styles.liveDot, { backgroundColor: isLive ? theme.colors.primary : theme.colors.textMuted }]} />
                <Text style={[styles.liveText, { color: isLive ? theme.colors.primary : theme.colors.textMuted }]}>
                    {isLive ? '● Live Firebase Posts' : '● Demo Posts (configure Firebase to go live)'}
                </Text>
            </View>

            {showInput && (
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Share an insight with farmers…"
                        placeholderTextColor={theme.colors.textMuted}
                        value={newPost}
                        onChangeText={setNewPost}
                        multiline
                        autoFocus
                    />
                    <Pressable style={[styles.sendBtn, posting && { opacity: 0.6 }]} onPress={submitPost} disabled={posting}>
                        {posting
                            ? <ActivityIndicator color={theme.colors.background} size="small" />
                            : <Send color={theme.colors.background} size={18} />
                        }
                    </Pressable>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.content}>
                {posts.map(post => (
                    <GlassCard key={post.id} style={styles.postCard}>
                        <View style={styles.authorRow}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{post.author ? post.author[0].toUpperCase() : 'F'}</Text>
                            </View>
                            <View>
                                <Text style={styles.authorName}>{post.author}</Text>
                                <Text style={styles.authorRegion}>{post.region}</Text>
                            </View>
                        </View>
                        <Text style={styles.postText}>{post.text}</Text>
                        <View style={styles.actions}>
                            <Pressable style={styles.action} onPress={() => handleLike(post)}>
                                <Heart color={theme.colors.error} size={16} />
                                <Text style={styles.actionText}>{post.likes}</Text>
                            </Pressable>
                            <Pressable style={styles.action}>
                                <MessageCircle color={theme.colors.textMuted} size={16} />
                                <Text style={styles.actionText}>Reply</Text>
                            </Pressable>
                        </View>
                    </GlassCard>
                ))}
            </ScrollView>

            <Pressable style={styles.fab} onPress={() => setShowInput(!showInput)}>
                <Plus color={theme.colors.background} size={24} />
            </Pressable>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 16 },
    backBtn: { padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginLeft: 16, flex: 1 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 4 },
    liveDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
    liveText: { fontSize: 11, fontWeight: '700' },
    inputRow: { margin: 16, marginTop: 0 },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, color: theme.colors.text, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },
    sendBtn: { backgroundColor: theme.colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
    content: { padding: 16, paddingTop: 8, paddingBottom: 80 },
    postCard: { marginBottom: 14, padding: 18 },
    authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${theme.colors.primary}30`, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    avatarText: { color: theme.colors.primary, fontWeight: '900', fontSize: 16 },
    authorName: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
    authorRegion: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
    postText: { color: theme.colors.text, fontSize: 15, lineHeight: 22, marginBottom: 16 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    action: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    actionText: { color: theme.colors.textMuted, fontSize: 13, marginLeft: 6, fontWeight: '600' },
    fab: { position: 'absolute', bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
});

export default CommunityScreen;
