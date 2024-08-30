import React, { useState } from 'react';
import AppList from './components/AppList';
import AppDetail from './components/AppDetail';

const App = () => {
    const [selectedApp, setSelectedApp] = useState(null);

    // Funktion zum Zurücksetzen der ausgewählten App
    const resetSelection = () => setSelectedApp(null);

    return (
        <div className="container">
            <h1>Laconic App Store</h1>
            {!selectedApp ? (
                <AppList onSelectApp={setSelectedApp} />
            ) : (
                <AppDetail app={selectedApp} onBack={resetSelection} />
            )}
        </div>
    );
}; 

export default App;
