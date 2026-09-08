import { Audio } from "expo-av";
import { Gyroscope } from "expo-sensors";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const { width, height } = Dimensions.get("window");
const PLAYER_SIZE = 50;
const ORB_SIZE = 30;
const MARGIN_X = 20;
const MARGIN_Y = 80;

const generateRandomPosition = () => {
  const usableWidth = Math.max(width - ORB_SIZE - MARGIN_X * 2, 0);
  const usableHeight = Math.max(height - ORB_SIZE - MARGIN_Y * 2, 0);

  return {
    x: MARGIN_X + Math.random() * usableWidth,
    y: MARGIN_Y + Math.random() * usableHeight,
  };
};

export default function Jogo2() {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [playerPosition, setPlayerPosition] = useState({
    x: width / 2 - PLAYER_SIZE / 2,
    y: height / 2 - PLAYER_SIZE / 2,
  });
  const [orbPosition, setOrbPosition] = useState(generateRandomPosition());
  const soundRef = useRef<Audio.Sound | null>(null);

  const playCollectSound = async () => {
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/sounds/collect.wav"),
          { shouldPlay: true, volume: 0.7 },
        );
        soundRef.current = sound;
      } else {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.log("Erro ao tocar som:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (!started) return;

    Gyroscope.setUpdateInterval(4);

    const subscription = Gyroscope.addListener((gyroscopeData) => {
      setData(gyroscopeData);
    });

    return () => subscription.remove();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const minX = MARGIN_X;
    const maxX = Math.max(width - PLAYER_SIZE - MARGIN_X, MARGIN_X);
    const minY = MARGIN_Y;
    const maxY = Math.max(height - PLAYER_SIZE - MARGIN_Y, MARGIN_Y);

    let newX = playerPosition.x + data.y * 3;
    let newY = playerPosition.y - data.x * 3;

    if (newX < minX) newX = minX;
    if (newX > maxX) newX = maxX;
    if (newY < minY) newY = minY;
    if (newY > maxY) newY = maxY;

    setPlayerPosition({ x: newX, y: newY });
  }, [data, started]);

  useEffect(() => {
    if (!started) return;

    const playerCenterX = playerPosition.x + PLAYER_SIZE / 2;
    const playerCenterY = playerPosition.y + PLAYER_SIZE / 2;
    const orbCenterX = orbPosition.x + ORB_SIZE / 2;
    const orbCenterY = orbPosition.y + ORB_SIZE / 2;

    const dx = playerCenterX - orbCenterX;
    const dy = playerCenterY - orbCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= (PLAYER_SIZE + ORB_SIZE) / 2) {
      setScore((prev) => prev + 1);
      playCollectSound();
      setOrbPosition(generateRandomPosition());
    }
  }, [playerPosition, orbPosition, started]);

  const handleStart = () => {
    setScore(0);
    setPlayerPosition({
      x: width / 2 - PLAYER_SIZE / 2,
      y: height / 2 - PLAYER_SIZE / 2,
    });
    setOrbPosition(generateRandomPosition());
    setStarted(true);
  };

  if (!started) {
    return (
      <View style={styles.initialContainer}>
        <Text style={styles.title}>GirosCapture</Text>
        <Text style={styles.subtitle}>
          Mova o celular para capturar os orbes.
        </Text>
        <Pressable style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Iniciar jogo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Colete o orbe azul!</Text>
      <Text style={styles.score}>Pontuação: {score}</Text>

      <View
        style={[
          styles.orb,
          {
            left: orbPosition.x,
            top: orbPosition.y,
          },
        ]}
      />

      <View
        style={[
          styles.player,
          {
            left: playerPosition.x,
            top: playerPosition.y,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  initialContainer: {
    flex: 1,
    backgroundColor: "#1e2a38",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#dfe6ee",
    textAlign: "center",
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
  },
  instructions: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
  },
  score: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  player: {
    position: "absolute",
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    borderRadius: PLAYER_SIZE / 2,
    backgroundColor: "coral",
    borderWidth: 2,
    borderColor: "#fff",
  },
  orb: {
    position: "absolute",
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    backgroundColor: "#3498db",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
