import styles from './ConcentrationSelector.module.css';

export default function ConcentrationSelector({ concentrations, selectedConcentration, onConcentrationChange }) {
  
  return (
    <div className={styles.buttonsContainer}>
      {concentrations.map((concentration) => (
        <button
          key={concentration}
          onClick={() => onConcentrationChange(concentration)}
          className={`${styles.concentrationButton} ${selectedConcentration === concentration ? styles.activeButton : ''}`}
        >
          {concentration}
        </button>
      ))}
    </div>
  );
}