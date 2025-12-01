import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { PatternGrid } from './components/PatternGrid';
import { PlayerControls } from './components/PlayerControls';
import { loadPatterns } from './lib/data/PatternLoader';
import { AudioEngine } from './lib/audio/AudioEngine';
import type { Group, Subgroup, Pattern } from './lib/types';

function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState<Subgroup | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [loop, setLoop] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'groups' | 'favorites'>('groups');

  const audioEngineRef = useRef<AudioEngine | null>(null);

  // Helper to generate unique ID for a pattern
  const getPatternId = (pattern: Pattern) => `${pattern.group}|${pattern.subgroup}|${pattern.title}`;

  useEffect(() => {
    // Load data
    const loadedGroups = loadPatterns();
    setGroups(loadedGroups);
    if (loadedGroups.length > 0 && loadedGroups[0].subgroups.length > 0) {
      setSelectedSubgroup(loadedGroups[0].subgroups[0]);
    }

    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    // Init Audio Engine
    audioEngineRef.current = new AudioEngine();
  }, []);

  const handleSelectSubgroup = (subgroup: Subgroup) => {
    setSelectedSubgroup(subgroup);
    setViewMode('groups');
    setSelectedPattern(null);
    handleStop();
  };

  const handleSelectFavorites = () => {
    setViewMode('favorites');
    setSelectedSubgroup(null);
    setSelectedPattern(null);
    handleStop();
  };

  const handleSelectPattern = (pattern: Pattern) => {
    setSelectedPattern(pattern);
    setBpm(pattern.bpm);
  };

  const handleToggleFavorite = (pattern: Pattern) => {
    const id = getPatternId(pattern);
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const handlePlayPause = async () => {
    if (!selectedPattern || !audioEngineRef.current) return;

    if (isPlaying) {
      audioEngineRef.current.stop();
      setIsPlaying(false);
    } else {
      await audioEngineRef.current.init();
      audioEngineRef.current.setBpm(bpm);
      audioEngineRef.current.play(selectedPattern, bpm);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }
    setIsPlaying(false);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    if (audioEngineRef.current) {
      audioEngineRef.current.setBpm(newBpm);
    }
  };

  const handleLoopToggle = () => {
    setLoop(!loop);
  };

  // Prepare patterns to display
  let patternsToDisplay: Pattern[] = [];
  if (viewMode === 'groups' && selectedSubgroup) {
    patternsToDisplay = selectedSubgroup.patterns;
  } else if (viewMode === 'favorites') {
    // Flatten all patterns and filter
    const allPatterns = groups.flatMap(g => g.subgroups.flatMap(sg => sg.patterns));
    patternsToDisplay = allPatterns.filter(p => favorites.has(getPatternId(p)));
  }

  return (
    <Layout
      sidebar={
        <Sidebar
          groups={groups}
          selectedSubgroup={selectedSubgroup}
          onSelectSubgroup={handleSelectSubgroup}
          onSelectFavorites={handleSelectFavorites}
          isFavoritesSelected={viewMode === 'favorites'}
        />
      }
      main={
        (viewMode === 'groups' && selectedSubgroup) || (viewMode === 'favorites') ? (
          <PatternGrid
            patterns={patternsToDisplay}
            selectedPattern={selectedPattern}
            onSelectPattern={handleSelectPattern}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            getPatternId={getPatternId}
          />
        ) : (
          <div style={{ padding: 20 }}>Select a group to start</div>
        )
      }
      player={
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          bpm={bpm}
          onBpmChange={handleBpmChange}
          loop={loop}
          onLoopToggle={handleLoopToggle}
        />
      }
    />
  );
}

export default App;
