import { Gyroscope } from "expo-sensors";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

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

export default function App() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [playerPosition, setPlayerPosition] = useState({
    x: width / 2 - PLAYER_SIZE / 2,
    y: height / 2 - PLAYER_SIZE / 2,
  });
  const [orbPosition, setOrbPosition] = useState(generateRandomPosition());

  useEffect(() => {
    Gyroscope.setUpdateInterval(4);

    const subscription = Gyroscope.addListener((gyroscopeData) => {
      setData(gyroscopeData);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
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
  }, [data]);

  useEffect(() => {
    const playerCenterX = playerPosition.x + PLAYER_SIZE / 2;
    const playerCenterY = playerPosition.y + PLAYER_SIZE / 2;
    const orbCenterX = orbPosition.x + ORB_SIZE / 2;
    const orbCenterY = orbPosition.y + ORB_SIZE / 2;

    const dx = playerCenterX - orbCenterX;
    const dy = playerCenterY - orbCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= (PLAYER_SIZE + ORB_SIZE) / 2) {
      setOrbPosition(generateRandomPosition());
    }
  }, [playerPosition, orbPosition]);

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Colete o orbe azul!</Text>

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
