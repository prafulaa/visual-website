import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import styles from '../styles/StarViz.module.css';

interface StarVizProps {
  starMapSvg?: string;
  moonPhase?: {
    name: string;
    illumination: number;
    emoji: string;
    svgPath?: string;
  };
  date?: string;
  constellations?: string[];
  location?: string;
  moonLightColor?: string;
  onMoonColorChange?: (color: string) => void;
}

const StarViz: React.FC<StarVizProps> = ({ 
  starMapSvg, 
  moonPhase, 
  date, 
  constellations = [],
  location,
  moonLightColor = "#FFFDE7",
  onMoonColorChange
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Render SVG content safely - memoized to prevent unnecessary re-renders
  const renderSvg = useCallback((svgString: string) => {
    // If we have a moonLightColor, replace the white fill with our custom color
    if (moonLightColor && moonLightColor !== "#FFFFFF") {
      svgString = svgString.replace(/fill="white"/g, `fill="${moonLightColor}"`);
    }
    return <div dangerouslySetInnerHTML={{ __html: svgString }} />;
  }, [moonLightColor]);

  // Handle color change
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onMoonColorChange) {
      onMoonColorChange(e.target.value);
    }
  }, [onMoonColorChange]);

  // Toggle color picker
  const toggleColorPicker = useCallback(() => {
    setShowColorPicker(prev => !prev);
  }, []);

  // Memoize constellation list to prevent re-renders
  const constellationsList = useMemo(() => {
    return constellations.map((constellation, index) => (
      <motion.div 
        key={index} 
        className={styles.constellation}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(100, 149, 237, 0.3)' }}
      >
        <span className={styles.constellationName}>{constellation}</span>
        <span className={styles.star}>✦</span>
      </motion.div>
    ));
  }, [constellations]);

  // Memoize moon phase visualization
  const moonPhaseVisualization = useMemo(() => {
    if (!moonPhase) return null;
    
    return (
      <div className={styles.moonPhaseContent}>
        <motion.div 
          className={styles.moonPhaseViz}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {moonPhase.svgPath ? (
            renderSvg(moonPhase.svgPath)
          ) : (
            <div className={styles.moonEmoji}>{moonPhase.emoji}</div>
          )}
        </motion.div>
        <motion.div 
          className={styles.moonDetails}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={styles.phaseName}>{moonPhase.name}</div>
          <div className={styles.illumination}>
            {Math.round(moonPhase.illumination * 100)}% illuminated
          </div>
        </motion.div>
      </div>
    );
  }, [moonPhase, moonLightColor, renderSvg]);

  return (
    <motion.div 
      className={styles.starVizContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className={styles.vizTitle}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        Your Night Sky Visualization
      </motion.h2>
      
      {date && (
        <motion.div 
          className={styles.infoRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className={styles.label}>Date:</span>
          <span className={styles.value}>{date}</span>
        </motion.div>
      )}
      
      {location && (
        <motion.div 
          className={styles.infoRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className={styles.label}>Location:</span>
          <span className={styles.value}>{location}</span>
        </motion.div>
      )}
      
      <div className={styles.visualizationsRow}>
        <motion.div 
          className={styles.moonPhaseCard}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className={styles.moonPhaseHeader}>
            <h3>Moon Phase</h3>
            {onMoonColorChange && (
              <motion.button 
                className={styles.colorButton}
                onClick={toggleColorPicker}
                title="Customize moon color"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span 
                  className={styles.colorSwatch} 
                  style={{ backgroundColor: moonLightColor }}
                />
                <span>Color</span>
              </motion.button>
            )}
          </div>
          
          <AnimatePresence>
            {showColorPicker && onMoonColorChange && (
              <motion.div 
                className={styles.colorPicker}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label>
                  <span>Moon Light Color:</span>
                  <input 
                    type="color" 
                    value={moonLightColor} 
                    onChange={handleColorChange} 
                  />
                </label>
              </motion.div>
            )}
          </AnimatePresence>
          
          {moonPhaseVisualization}
        </motion.div>
        
        <motion.div 
          className={styles.starMapCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3>Star Map</h3>
          {starMapSvg ? (
            <motion.div 
              className={styles.starMapContainer}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {renderSvg(starMapSvg)}
            </motion.div>
          ) : (
            <div className={styles.placeholderMap}>
              <p>Star map visualization not available</p>
            </div>
          )}
        </motion.div>
      </div>
      
      {constellations.length > 0 && (
        <motion.div 
          className={styles.constellationsCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <h3>Visible Constellations</h3>
          <div className={styles.constellationsList}>
            {constellationsList}
          </div>
        </motion.div>
      )}
      
      <motion.div 
        className={styles.disclaimer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p>
          This visualization represents an approximation of the night sky for the given date and location.
          For more precise astronomical data, consider using specialized astronomy software or apps.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(StarViz); 