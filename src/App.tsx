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

  const audioEngineRef = useRef<AudioEngine | null>(null);

  useEffect(() => {
    // Load data
    const loadedGroups = loadPatterns();
    setGroups(loadedGroups);
    if (loadedGroups.length > 0 && loadedGroups[0].subgroups.length > 0) {
      setSelectedSubgroup(loadedGroups[0].subgroups[0]);
    }

    // Init Audio Engine
    audioEngineRef.current = new AudioEngine();
  }, []);

  const handleSelectSubgroup = (subgroup: Subgroup) => {
    setSelectedSubgroup(subgroup);
    setSelectedPattern(null);
    handleStop();
  };

  const handleSelectPattern = (pattern: Pattern) => {
    setSelectedPattern(pattern);
    setBpm(pattern.bpm);
    // Auto play? Maybe not.
  };

  const handlePlayPause = async () => {
    if (!selectedPattern || !audioEngineRef.current) return;

    if (isPlaying) {
      audioEngineRef.current.stop();
      setIsPlaying(false);
    } else {
      await audioEngineRef.current.init();
      audioEngineRef.current.setBpm(bpm);
      // audioEngineRef.current.setLoop(loop); // Need to implement setLoop in AudioEngine if not public
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
    // Update engine loop state
    // I need to expose setLoop in AudioEngine or make loop public
  };

  return (
    <Layout
      sidebar={
        <Sidebar
          groups={groups}
          selectedSubgroup={selectedSubgroup}
          onSelectSubgroup={handleSelectSubgroup}
        />
      }
      main={
        selectedSubgroup ? (
          <PatternGrid
            patterns={selectedSubgroup.patterns}
            selectedPattern={selectedPattern}
            onSelectPattern={handleSelectPattern}
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
