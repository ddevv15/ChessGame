// AIThinkingIndicator component - Shows AI thinking state
import React, { useState, useEffect } from "react";
import styles from "./AIThinkingIndicator.module.css";

/**
 * AIThinkingIndicator component displays AI thinking state and timing
 * @param {Object} props - Component props
 * @param {boolean} props.isThinking - Whether AI is currently thinking
 * @param {string} props.difficulty - AI difficulty level
 * @param {number} props.startTime - Timestamp when AI started thinking
 * @returns {JSX.Element} AIThinkingIndicator component
 */
const AIThinkingIndicator = ({ isThinking, difficulty, startTime }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every 100ms when AI is thinking
  useEffect(() => {
    let interval;

    if (isThinking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isThinking, startTime]);

  if (!isThinking) {
    return null;
  }

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const tenths = Math.floor((milliseconds % 1000) / 100);
    return `${seconds}.${tenths}s`;
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy":
        return styles.easy;
      case "medium":
        return styles.medium;
      case "hard":
        return styles.hard;
      default:
        return styles.medium;
    }
  };

  const getDifficultyText = () => {
    switch (difficulty) {
      case "easy":
        return "Easy";
      case "medium":
        return "Medium";
      case "hard":
        return "Hard";
      default:
        return "AI";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={`${styles.thinkingIcon} ${getDifficultyColor()}`}>
            🤖
          </div>
          <div className={styles.thinkingDots}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>

        <div className={styles.textContainer}>
          <h3 className={styles.title}>
            {getDifficultyText()} AI is thinking...
          </h3>
          <p className={styles.subtitle}>
            Analyzing the position and calculating the best move
          </p>
        </div>

        <div className={styles.timerContainer}>
          <div className={styles.timer}>
            <span className={styles.timerLabel}>Time:</span>
            <span className={styles.timerValue}>{formatTime(elapsedTime)}</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${getDifficultyColor()}`}
              style={{
                width: `${Math.min((elapsedTime / 10000) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIThinkingIndicator;
