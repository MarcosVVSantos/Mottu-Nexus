# MVP Nexus - Copilot Instructions

## Project Overview
MVP Nexus is a modern web application for managing urban occurrences (traffic, public safety, infrastructure) with real-time mapping powered by Leaflet.js. The project uses vanilla JavaScript with the official Mottu brand identity.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Mapping**: Leaflet.js
- **Icons**: Lucide Icons
- **Design System**: Mottu Official Palette (#00D95F)

## Brand Guidelines
- **Primary Color**: #00D95F (Mottu Green)
- **Hover State**: #00FF6E (Light Green)
- **Pressed State**: #00B84F (Dark Green)
- **Glow Effect**: rgba(0, 217, 95, 0.3)

## Key Features
- Interactive occurrence management with priority system
- Real-time map visualization with custom markers
- Centralized chat modal with avatars and timestamps
- Responsive design (breakpoints: 900px, 560px, 480px)
- Microinteractions and smooth animations

## Code Style
- Use semantic HTML5 elements
- CSS custom properties for theming
- Event-driven JavaScript architecture
- Mobile-first responsive approach
- Accessibility-first design

## Development Guidelines
- All components must use Mottu green palette
- Maintain 8px spacing system
- Use box-shadow for depth and glow effects
- Implement smooth transitions (200-300ms)
- Test at all responsive breakpoints

## File Structure
- `index.html`: Main application structure
- `style.css`: Complete styling system (~2700 lines)
- `script.js`: Application logic and interactions
- `README.md`: User-facing documentation
- `REBRANDING-MOTTU.md`: Technical specification
- `REBRANDING-SUMMARY.md`: Implementation checklist

## Testing Checklist
- Verify Mottu green colors applied correctly
- Test chat modal functionality (avatars, timestamps, Enter-to-send)
- Check responsive layouts at all breakpoints
- Validate hover/focus states on interactive elements
- Test map marker interactions and priority colors
