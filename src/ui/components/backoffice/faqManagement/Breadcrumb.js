import React from 'react';
import { ArrowBack, Home, ChevronRight } from '@material-ui/icons';
import { styles } from './styles';

export const Breadcrumb = ({ currentPath, navigation }) => {
  const { handleBack, handleRootNavigation, handlePathNavigation } = navigation;

  return (
    <div className={styles.breadcrumb}>
      {currentPath.length > 0 && (
        <button className={`${styles.btn.light} me-3`} onClick={handleBack}>
          <ArrowBack />
        </button>
      )}
      <div className="d-flex align-items-center">
        <button
          className={`${styles.btn.icon} text-primary p-0`}
          onClick={handleRootNavigation}
        >
          <Home className="me-1" />
          Racine
        </button>
        {currentPath.map((item, index) => (
          <React.Fragment key={item.id}>
            <ChevronRight className="mx-2 text-muted" />
            <button
              className={`${styles.btn.icon} ${
                index === currentPath.length - 1 ? "text-body" : "text-primary"
              } p-0`}
              onClick={() => handlePathNavigation(index)}
              disabled={index === currentPath.length - 1}
            >
              {item.text}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};