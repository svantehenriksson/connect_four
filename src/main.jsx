import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'


createRoot(document.getElementById('root')).render(
<React.StrictMode>
              {/* Title */}
              <h1 style={{
            position: 'absolute',
            top: 12,
            left: 0,
            right: 0,
            margin: 0,
            textAlign: 'center',
            fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
            fontWeight: 900,
            letterSpacing: 2,
            fontSize: 36,
            color: '#fff',
            textShadow: '0 4px 12px rgba(0,0,0,0.7)'
          }}>Connect Four 3D</h1>
<App />
</React.StrictMode>
)