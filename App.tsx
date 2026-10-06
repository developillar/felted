import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, BackHandler, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import { fontAssets } from './src/assets';
import { Avatar, Button, Collectible, Mono, Sheet, Surface, Tabs } from './src/components';
import { Action, actionOptions, compactMoney, createDemo, DEMO_TURN_SECONDS, DemoState, money, previewSeats, scriptedReply, Seat, submitAction, visualFixture } from './src/game';
import { defaults, loadPreferences, Preferences, savePreferences } from './src/preferences';
import { ClubScreen, ReaderScreen, TableScreen } from './src/screens';
import { ChatSheet, CollectionSheet, Copy, HostSheet, PlayerSheet, RaiseSheet, Settings, Toggle } from './src/sheets';
import { C } from './src/theme';

type Screen = 'table' | 'club' | 'reader';
type Modal = null | 'menu' | 'preview' | 'raise' | 'host' | 'hosted' | 'collection' | 'object' | 'player' | 'chat' | 'info' | 'achievement';
const query = __DEV__ && Platform.OS === 'web' ? new URLSearchParams(globalThis.location?.search) : new URLSearchParams();
const initialScreen: Screen = ['table', 'reader'].includes(query.get('screen') ?? '') ? query.get('screen') as Screen : 'club';
const initialCount = Math.min(9, Math.max(2, Number(query.get('count')) || 8));

function Felted() {
  const [fonts, fontError] = useFonts(fontAssets);
  const [preferences, setPreferences] = useState<Preferences>(defaults), [stored, setStored] = useState(false), [storageError, setStorageError] = useState(false);
  const [screen, setScreen] = useState<Screen>(initialScreen), [modal, setModal] = useState<Modal>(null);
  const [mode, setMode] = useState<'visual' | 'demo' | 'host'>(query.get('mode') === 'demo' ? 'demo' : 'visual');
  const [count, setCount] = useState(initialCount), [river, setRiver] = useState(query.get('river') === '1'), [longNames, setLongNames] = useState(query.get('long') === '1');
  const [largeText, setLargeText] = useState(query.get('large') === '1'), [systemReduced, setSystemReduced] = useState(false);
  const [demo, setDemo] = useState<DemoState>(() => createDemo(query.get('unopened') === '1'));
  const [pending, setPending] = useState(false), [feedback, setFeedback] = useState(''), [reaction, setReaction] = useState<string | null>('Nice hand');
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null), [objectIndex, setObjectIndex] = useState(1);
  const [hosted, setHosted] = useState({ name: 'The Night Shift', capacity: 6 });
  const [deadline, setDeadline] = useState(Date.now() + DEMO_TURN_SECONDS * 1000), [now, setNow] = useState(Date.now());
  const { fontScale } = useWindowDimensions();
  const lock = useRef(false), timeout = useRef<ReturnType<typeof setTimeout> | null>(null), currentDemo = useRef(demo);
  const cardSound = useAudioPlayer(require('./assets/audio/card.wav'));
  const chipSound = useAudioPlayer(require('./assets/audio/chip.wav'));
  const successSound = useAudioPlayer(require('./assets/audio/success.wav'));
  currentDemo.current = demo;
  const remaining = Math.max(0, Math.ceil((deadline - now) / 1000));
  const reducedMotion = systemReduced || preferences.reducedMotion;

  useEffect(() => { let mounted = true; loadPreferences().then(p => { if (mounted) setPreferences(p); }).catch(() => { if (mounted) setStorageError(true); }).finally(() => { if (mounted) setStored(true); }); return () => { mounted = false; }; }, []);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduced);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduced);
    return () => listener.remove();
  }, []);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => { clearInterval(timer); if (timeout.current) clearTimeout(timeout.current); }; }, []);
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => { if (modal) setModal(null); else if (screen !== 'club') setScreen('club'); else return false; return true; });
    return () => handler.remove();
  }, [modal, screen]);
  useEffect(() => {
    if (mode !== 'demo' || pending || !['jules', 'rune'].includes(demo.actor ?? '')) return;
    const timer = setTimeout(() => setDemo(s => scriptedReply(s)), 1500);
    return () => clearTimeout(timer);
  }, [demo.actor, mode, pending]);
  useEffect(() => { if (!reaction) return; const timer = setTimeout(() => setReaction(null), 5000); return () => clearTimeout(timer); }, [reaction]);

  function persist(patch: Partial<Preferences>) {
    const next = { ...preferences, ...patch }; setPreferences(next);
    savePreferences(next).then(() => setStorageError(false)).catch(() => setStorageError(true));
  }
  function tactile(kind: 'card' | 'chip' | 'success') {
    if (preferences.haptics && Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (preferences.sound) {
      const player = kind === 'card' ? cardSound : kind === 'chip' ? chipSound : successSound;
      player.seekTo(0).then(() => player.play()).catch(() => {});
    }
  }
  function reset(unopened = false) {
    if (timeout.current) clearTimeout(timeout.current);
    lock.current = false; setPending(false); setDemo(createDemo(unopened)); setMode('demo'); setScreen('table'); setFeedback('');
    setDeadline(Date.now() + DEMO_TURN_SECONDS * 1000); setNow(Date.now()); setModal(null); tactile('card');
  }
  function action(action: Action, amount?: number) {
    if (lock.current || mode !== 'demo' || remaining === 0) return;
    let next: DemoState;
    try { next = submitAction(currentDemo.current, action, amount); }
    catch (error) { setFeedback(error instanceof Error ? error.message : 'Action rejected'); return; }
    lock.current = true; setPending(true); setModal(null); setFeedback('');
    timeout.current = setTimeout(() => { setDemo(next); setPending(false); tactile('chip'); }, 450);
  }
  const options = actionOptions(demo);
  const visualHero: Seat = { ...visualFixture.seats.find(s => s.id === 'hero')!, stackCents: 9860 };
  const hero: Seat = mode === 'demo' ? demo.seats.find(s => s.id === 'hero')! : mode === 'host' ? { ...visualHero, stackCents: 10000 } : { ...visualHero, positionLabel: count === 2 ? 'D / SB' : undefined, stackCents: longNames ? 123456789 : visualHero.stackCents };
  const seats: Seat[] = mode === 'demo' ? demo.seats.filter(s => s.id !== 'hero') : mode === 'host' ? [{ id: 'empty', name: 'Invite', status: 'empty', stackCents: 0 }] : previewSeats(count, longNames);
  const potCents = mode === 'demo' ? demo.potCents : mode === 'host' ? 0 : longNames ? 123456789 : visualFixture.potCents;
  const board = mode === 'demo' ? demo.board : mode === 'host' ? [] : river ? ['Qh', '8s', '5d', '2c', 'As'] : visualFixture.board;
  const canAct = mode === 'demo' && options.active && !pending && remaining > 0;
  const callLabel = mode === 'demo' ? options.owed ? `Call ${options.allInCall ? 'all-in ' : ''}${money(options.callCents)}` : 'Check' : 'Call $4.60';
  const message = feedback || (mode === 'demo' ? remaining === 0 && options.active ? 'Time elapsed · reset in table menu' : demo.actor === 'hero' ? `Your turn · ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}` : demo.message : mode === 'host' ? `${hosted.name} · ${hosted.capacity} seats` : 'Hand preview');

  if (fontError) return <View style={s.loading}><Text style={{ color: C.textPrimary }}>Felted couldn’t load its fonts.</Text><Text style={{ color: C.textSecondary }}>Restart the app to try again.</Text></View>;
  if (!fonts || !stored) return <View style={s.loading}><ActivityIndicator color={C.accent} /><Text style={{ color: C.textSecondary }}>Opening Felted…</Text></View>;

  return <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
    <StatusBar style="light" />
    <View style={[s.app, Platform.OS === 'web' && { paddingTop: 12, paddingBottom: 8 }]}>
      {screen === 'club' && <ClubScreen full={query.get('full') === '1'} onJoin={() => reset()} onHost={() => setModal('host')} onCollection={() => setModal('collection')} onProfile={() => { setSelectedSeat(hero); setModal('player'); }} />}
      {screen === 'reader' && <ReaderScreen equipped={preferences.equipped} onEquip={() => { persist({ equipped: true }); tactile('success'); }} onCollection={() => setModal('collection')} onClose={() => setScreen('club')} onInfo={() => setModal('achievement')} />}
      {screen === 'table' && <TableScreen seats={seats} hero={hero} potCents={potCents} board={board} equipped={preferences.equipped || mode === 'visual'} remaining={remaining} active={mode === 'demo' && options.active && remaining > 0} pending={pending} message={message} callLabel={callLabel} canRaise={options.raise} canAct={canAct} muted={preferences.muted} reaction={reaction} simple={largeText || fontScale > 1.25} host={mode === 'host'} onMenu={() => setModal('menu')} onChat={() => setModal('chat')} onSeat={seat => { if (seat.status === 'empty') { setModal('hosted'); return; } setSelectedSeat(seat); setModal('player'); }} onInfo={() => setModal('info')} onFold={() => action('fold')} onCall={() => action(options.check ? 'check' : 'call')} onRaise={() => setModal('raise')} />}
      {screen !== 'table' && <Tabs selected={screen} onSelect={setScreen} />}
      {storageError && <Text accessibilityLiveRegion="polite" style={{ color: C.warning, fontSize: 11, padding: 8 }}>Preferences work for this session; device storage is unavailable.</Text>}
    </View>
    <Sheet title={({ menu: 'Your table', preview: 'Developer preview', raise: demo.currentBetCents ? 'Raise to' : 'Bet amount', host: 'Host a game', hosted: 'Demo invitation', collection: 'Your collection', object: objectIndex === 1 ? 'The Host' : 'Good Company', player: 'Player', chat: 'At the table', info: 'Hand details', achievement: 'The Reader' } as Record<string, string>)[modal ?? ''] ?? ''} visible={modal !== null} onClose={() => setModal(null)} reducedMotion={reducedMotion}>
      {modal === 'menu' && <><Mono>{mode === 'host' ? hosted.name : 'The Night Shift'}</Mono><Copy>NLH · $0.10 / $0.20 · No rake</Copy><Settings preferences={preferences} onChange={persist} /><Button label="Players and stacks" onPress={() => setModal('info')} />{mode === 'demo' && <Button label="Reset hand demo" onPress={() => reset()} />}{__DEV__ && <Button label="Developer preview" onPress={() => setModal('preview')} />}<Button label="Leave table" onPress={() => { setScreen('club'); setModal(null); }} /></>}
      {modal === 'preview' && <><Copy>Static scene is visual-only: pot $14.90. Playable seed is a separate three-player action demonstration. No complete rules engine.</Copy><Button label="Static reference" onPress={() => { setMode('visual'); setCount(8); setRiver(false); setLongNames(false); setModal(null); }} /><Mono>Occupied players</Mono><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Array.from({ length: 8 }, (_, i) => i + 2).map(n => <Button key={n} small label={`${n} players`} primary={count === n && mode === 'visual'} onPress={() => { setCount(n); setMode('visual'); setModal(null); }} />)}</View><Toggle label="Five community cards" value={river} onChange={setRiver} /><Toggle label="Long names and large amounts" value={longNames} onChange={setLongNames} /><Toggle label="Accessible player list" value={largeText} onChange={setLargeText} /><Copy>Demo deadline: {DEMO_TURN_SECONDS} seconds. Product turn duration is undecided.</Copy><Button label="Playable call / raise seed" primary onPress={() => reset()} /><Button label="Playable check / bet seed" onPress={() => reset(true)} /></>}
      {modal === 'raise' && <RaiseSheet state={demo} onSubmit={amount => action(demo.currentBetCents ? 'raise' : 'bet', amount)} />}
      {modal === 'host' && <HostSheet onCreate={(name, capacity) => { setHosted({ name, capacity }); setModal('hosted'); }} />}
      {modal === 'hosted' && <><Copy>{hosted.name} · {hosted.capacity} seats · $0.10 / $0.20</Copy><Surface><Mono>Local demo invitation</Mono><Copy>No shareable link or live room exists yet. This preview stays on your device.</Copy></Surface><Button label="Open demo table" primary onPress={() => { setMode('host'); setScreen('table'); setModal(null); }} /></>}
      {modal === 'collection' && <CollectionSheet equipped={preferences.equipped} onReader={() => { setScreen('reader'); setModal(null); }} onObject={index => { setObjectIndex(index); setModal('object'); }} />}
      {modal === 'object' && <><View style={{ alignItems: 'center' }}><Collectible index={objectIndex} size={190} /></View><Mono>Locked · 0 completed sessions</Mono><Copy>{objectIndex === 1 ? 'Complete your first hosted social session to earn The Host.' : 'Receive optional appreciation after a completed session to earn Good Company.'}</Copy><Copy>Local preview tables do not complete these milestones.</Copy><Button label="Not yet earned" disabled onPress={() => {}} /><Button label="Back to collection" onPress={() => setModal('collection')} /></>}
      {modal === 'player' && selectedSeat && <PlayerSheet seat={selectedSeat} equipped={preferences.equipped} />}
      {modal === 'chat' && <ChatSheet muted={preferences.muted} onMute={muted => persist({ muted })} onReaction={name => { if (!preferences.muted) setReaction(name); setModal(null); tactile('card'); }} />}
      {modal === 'info' && <><Mono>Total pot {money(potCents)}</Mono><Copy>{mode === 'visual' ? 'Static visual comparison. Action order and pot construction are not a legal hand history.' : 'Pot includes all commitments. This local demonstration does not deal, resolve side pots or choose a winner.'}</Copy>{[hero, ...seats].filter(seat => seat.status !== 'empty').map(seat => <Button key={seat.id} label={`${seat.name} · ${money(seat.stackCents)}`} onPress={() => { setSelectedSeat(seat); setModal('player'); }} />)}</>}
      {modal === 'achievement' && <><View style={{ alignItems: 'center' }}><Collectible size={170} /></View><Mono>Knowledge · {preferences.equipped ? 'Equipped' : 'Earned'}</Mono><Copy>The Reader is earned in this local collection fixture. It recognizes completion of the rules and side-pot practice.</Copy><Copy>Unlocks the Quiet Nod reaction. Sharing is available when live profiles arrive.</Copy></>}
    </Sheet>
  </SafeAreaView>;
}
export default function App() { return <SafeAreaProvider><Felted /></SafeAreaProvider>; }
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.canvas },
  app: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: C.canvas },
  loading: { flex: 1, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center', gap: 16 },
});
